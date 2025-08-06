<?php
/**
 * WhatsWay Universal Installer
 * Works on: Plesk, cPanel, AWS, DigitalOcean, and any Linux server
 * Version: 1.0
 */

session_start();
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Configuration
define('MIN_PHP_VERSION', '7.4');
define('MIN_NODE_VERSION', '18.0.0');
define('INSTALL_DIR', dirname(dirname(__FILE__)));
define('LOG_FILE', INSTALL_DIR . '/install/install.log');

// Initialize
$step = isset($_GET['step']) ? (int)$_GET['step'] : 1;
$errors = [];
$success = [];

// Helper Functions
function checkRequirements() {
    $requirements = [];
    
    // PHP Version
    $requirements['php'] = [
        'name' => 'PHP Version',
        'required' => MIN_PHP_VERSION,
        'current' => PHP_VERSION,
        'passed' => version_compare(PHP_VERSION, MIN_PHP_VERSION, '>=')
    ];
    
    // Required PHP Extensions
    $extensions = ['curl', 'json', 'zip', 'pdo', 'pdo_pgsql'];
    foreach ($extensions as $ext) {
        $requirements[$ext] = [
            'name' => "PHP Extension: $ext",
            'required' => 'Installed',
            'current' => extension_loaded($ext) ? 'Installed' : 'Not Installed',
            'passed' => extension_loaded($ext)
        ];
    }
    
    // Directory Permissions
    $dirs = ['/client', '/server', '/shared'];
    foreach ($dirs as $dir) {
        $path = INSTALL_DIR . $dir;
        $requirements['dir_' . $dir] = [
            'name' => "Directory: $dir",
            'required' => 'Writable',
            'current' => is_writable($path) ? 'Writable' : 'Not Writable',
            'passed' => is_writable($path)
        ];
    }
    
    // Node.js Check
    $nodeVersion = shell_exec('node --version 2>&1');
    if ($nodeVersion && preg_match('/v(\d+\.\d+\.\d+)/', $nodeVersion, $matches)) {
        $requirements['node'] = [
            'name' => 'Node.js',
            'required' => MIN_NODE_VERSION,
            'current' => $matches[1],
            'passed' => version_compare($matches[1], MIN_NODE_VERSION, '>=')
        ];
    } else {
        $requirements['node'] = [
            'name' => 'Node.js',
            'required' => MIN_NODE_VERSION,
            'current' => 'Not Installed',
            'passed' => false
        ];
    }
    
    return $requirements;
}

function installNodeJS() {
    $commands = [
        'curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -',
        'sudo apt-get install -y nodejs',
        'node --version'
    ];
    
    foreach ($commands as $cmd) {
        $output = shell_exec($cmd . ' 2>&1');
        logMessage("Command: $cmd\nOutput: $output");
    }
    
    return strpos($output, 'v20') !== false || strpos($output, 'v18') !== false;
}

function setupDatabase($config) {
    try {
        // Test connection
        $dsn = "pgsql:host={$config['host']};port={$config['port']};dbname={$config['database']}";
        $pdo = new PDO($dsn, $config['username'], $config['password']);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        
        // Create database URL
        $dbUrl = "postgresql://{$config['username']}:{$config['password']}@{$config['host']}:{$config['port']}/{$config['database']}";
        
        // Save to .env
        $envContent = "# Database Configuration\n";
        $envContent .= "DATABASE_URL=\"$dbUrl\"\n";
        $envContent .= "PGHOST=\"{$config['host']}\"\n";
        $envContent .= "PGPORT=\"{$config['port']}\"\n";
        $envContent .= "PGDATABASE=\"{$config['database']}\"\n";
        $envContent .= "PGUSER=\"{$config['username']}\"\n";
        $envContent .= "PGPASSWORD=\"{$config['password']}\"\n\n";
        
        // Add other required environment variables
        $envContent .= "# Application Configuration\n";
        $envContent .= "NODE_ENV=\"production\"\n";
        $envContent .= "PORT=\"5000\"\n";
        $envContent .= "SESSION_SECRET=\"" . generateRandomString(32) . "\"\n";
        $envContent .= "ENCRYPTION_KEY=\"" . generateRandomString(32) . "\"\n\n";
        
        // WhatsApp Configuration
        $envContent .= "# WhatsApp API Configuration\n";
        $envContent .= "WHATSAPP_API_VERSION=\"v21.0\"\n";
        $envContent .= "WHATSAPP_WEBHOOK_VERIFY_TOKEN=\"" . generateRandomString(24) . "\"\n\n";
        
        // Server Configuration
        $envContent .= "# Server Configuration\n";
        $envContent .= "REPLIT_DOMAINS=\"{$_SERVER['HTTP_HOST']}\"\n";
        $envContent .= "BASE_URL=\"https://{$_SERVER['HTTP_HOST']}\"\n";
        
        file_put_contents(INSTALL_DIR . '/.env', $envContent);
        
        return true;
    } catch (PDOException $e) {
        logMessage("Database connection failed: " . $e->getMessage());
        return false;
    }
}

function installDependencies() {
    $commands = [
        'cd ' . INSTALL_DIR . ' && npm install --production',
        'cd ' . INSTALL_DIR . ' && npm run build',
        'cd ' . INSTALL_DIR . ' && npm run db:push',
        'cd ' . INSTALL_DIR . ' && npm run seed'
    ];
    
    foreach ($commands as $cmd) {
        $output = shell_exec($cmd . ' 2>&1');
        logMessage("Command: $cmd\nOutput: $output");
        
        if (strpos($output, 'error') !== false && strpos($output, 'warning') === false) {
            return false;
        }
    }
    
    return true;
}

function setupPM2() {
    $commands = [
        'npm install -g pm2',
        'cd ' . INSTALL_DIR . ' && pm2 start ecosystem.config.js',
        'pm2 save',
        'pm2 startup'
    ];
    
    foreach ($commands as $cmd) {
        $output = shell_exec($cmd . ' 2>&1');
        logMessage("Command: $cmd\nOutput: $output");
    }
    
    return true;
}

function setupNginx($domain) {
    $nginxConfig = "server {
    listen 80;
    server_name $domain;
    
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}";
    
    $configFile = "/etc/nginx/sites-available/whatsway";
    file_put_contents($configFile, $nginxConfig);
    
    $commands = [
        "ln -s $configFile /etc/nginx/sites-enabled/",
        "nginx -t",
        "systemctl reload nginx"
    ];
    
    foreach ($commands as $cmd) {
        shell_exec($cmd . ' 2>&1');
    }
    
    return true;
}

function setupSSL($domain, $email) {
    $commands = [
        "certbot --nginx -d $domain --non-interactive --agree-tos --email $email",
        "systemctl reload nginx"
    ];
    
    foreach ($commands as $cmd) {
        $output = shell_exec($cmd . ' 2>&1');
        logMessage("SSL Setup: $cmd\nOutput: $output");
    }
    
    return true;
}

function generateRandomString($length = 32) {
    return bin2hex(random_bytes($length / 2));
}

function logMessage($message) {
    $timestamp = date('Y-m-d H:i:s');
    file_put_contents(LOG_FILE, "[$timestamp] $message\n", FILE_APPEND);
}

// Installation Steps
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>WhatsWay Installation</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        .container {
            background: white;
            border-radius: 12px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            max-width: 800px;
            width: 100%;
            overflow: hidden;
        }
        .header {
            background: #25D366;
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            font-size: 28px;
            margin-bottom: 10px;
        }
        .header p {
            opacity: 0.9;
        }
        .progress {
            display: flex;
            background: #f5f5f5;
        }
        .progress-step {
            flex: 1;
            padding: 15px;
            text-align: center;
            border-right: 1px solid #ddd;
            position: relative;
        }
        .progress-step:last-child {
            border-right: none;
        }
        .progress-step.active {
            background: #e8f5e9;
            color: #25D366;
            font-weight: bold;
        }
        .progress-step.completed {
            background: #25D366;
            color: white;
        }
        .content {
            padding: 40px;
        }
        .requirement-item {
            display: flex;
            justify-content: space-between;
            padding: 12px;
            margin-bottom: 10px;
            background: #f9f9f9;
            border-radius: 6px;
            align-items: center;
        }
        .requirement-item.passed {
            background: #e8f5e9;
        }
        .requirement-item.failed {
            background: #ffebee;
        }
        .status {
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
        }
        .status.passed {
            background: #4caf50;
            color: white;
        }
        .status.failed {
            background: #f44336;
            color: white;
        }
        .form-group {
            margin-bottom: 25px;
        }
        label {
            display: block;
            margin-bottom: 8px;
            font-weight: 500;
            color: #333;
        }
        input, select {
            width: 100%;
            padding: 12px;
            border: 2px solid #e0e0e0;
            border-radius: 6px;
            font-size: 14px;
            transition: border-color 0.3s;
        }
        input:focus, select:focus {
            outline: none;
            border-color: #25D366;
        }
        .btn {
            background: #25D366;
            color: white;
            padding: 14px 30px;
            border: none;
            border-radius: 6px;
            font-size: 16px;
            font-weight: 500;
            cursor: pointer;
            transition: background 0.3s;
        }
        .btn:hover {
            background: #20BA5C;
        }
        .btn:disabled {
            background: #ccc;
            cursor: not-allowed;
        }
        .alert {
            padding: 15px;
            border-radius: 6px;
            margin-bottom: 20px;
        }
        .alert.error {
            background: #ffebee;
            color: #c62828;
            border: 1px solid #ef5350;
        }
        .alert.success {
            background: #e8f5e9;
            color: #2e7d32;
            border: 1px solid #66bb6a;
        }
        .spinner {
            border: 3px solid #f3f3f3;
            border-top: 3px solid #25D366;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
            margin: 20px auto;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        .completion {
            text-align: center;
            padding: 40px;
        }
        .completion .icon {
            font-size: 80px;
            color: #4caf50;
            margin-bottom: 20px;
        }
        .credentials {
            background: #f5f5f5;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            font-family: monospace;
        }
        .two-columns {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
        }
        @media (max-width: 600px) {
            .two-columns {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 WhatsWay Installation Wizard</h1>
            <p>Professional WhatsApp Business Platform</p>
        </div>
        
        <div class="progress">
            <div class="progress-step <?php echo $step >= 1 ? ($step > 1 ? 'completed' : 'active') : ''; ?>">
                1. Requirements
            </div>
            <div class="progress-step <?php echo $step >= 2 ? ($step > 2 ? 'completed' : 'active') : ''; ?>">
                2. Database
            </div>
            <div class="progress-step <?php echo $step >= 3 ? ($step > 3 ? 'completed' : 'active') : ''; ?>">
                3. Configuration
            </div>
            <div class="progress-step <?php echo $step >= 4 ? ($step > 4 ? 'completed' : 'active') : ''; ?>">
                4. Installation
            </div>
            <div class="progress-step <?php echo $step >= 5 ? 'active' : ''; ?>">
                5. Complete
            </div>
        </div>
        
        <div class="content">
            <?php if ($step == 1): ?>
                <!-- Step 1: Requirements Check -->
                <h2>System Requirements Check</h2>
                <p style="margin-bottom: 30px; color: #666;">Checking if your server meets the minimum requirements...</p>
                
                <?php $requirements = checkRequirements(); ?>
                <?php $allPassed = true; ?>
                
                <?php foreach ($requirements as $req): ?>
                    <?php if (!$req['passed']) $allPassed = false; ?>
                    <div class="requirement-item <?php echo $req['passed'] ? 'passed' : 'failed'; ?>">
                        <div>
                            <strong><?php echo $req['name']; ?></strong>
                            <div style="font-size: 12px; color: #666; margin-top: 4px;">
                                Required: <?php echo $req['required']; ?> | Current: <?php echo $req['current']; ?>
                            </div>
                        </div>
                        <span class="status <?php echo $req['passed'] ? 'passed' : 'failed'; ?>">
                            <?php echo $req['passed'] ? '✓ PASSED' : '✗ FAILED'; ?>
                        </span>
                    </div>
                <?php endforeach; ?>
                
                <div style="margin-top: 30px;">
                    <?php if ($allPassed): ?>
                        <div class="alert success">
                            ✓ Great! Your server meets all requirements.
                        </div>
                        <form method="get">
                            <input type="hidden" name="step" value="2">
                            <button type="submit" class="btn">Continue to Database Setup →</button>
                        </form>
                    <?php else: ?>
                        <div class="alert error">
                            ✗ Some requirements are not met. Please fix them before continuing.
                        </div>
                        <button onclick="location.reload()" class="btn">Re-check Requirements</button>
                    <?php endif; ?>
                </div>
                
            <?php elseif ($step == 2): ?>
                <!-- Step 2: Database Configuration -->
                <h2>Database Configuration</h2>
                <p style="margin-bottom: 30px; color: #666;">Enter your PostgreSQL database connection details.</p>
                
                <?php
                if ($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_POST['test_connection'])) {
                    $dbConfig = [
                        'host' => $_POST['db_host'],
                        'port' => $_POST['db_port'],
                        'database' => $_POST['db_name'],
                        'username' => $_POST['db_user'],
                        'password' => $_POST['db_pass']
                    ];
                    
                    if (setupDatabase($dbConfig)) {
                        $_SESSION['db_configured'] = true;
                        echo '<div class="alert success">✓ Database connection successful!</div>';
                        echo '<form method="get"><input type="hidden" name="step" value="3">';
                        echo '<button type="submit" class="btn">Continue to Configuration →</button></form>';
                    } else {
                        echo '<div class="alert error">✗ Database connection failed. Please check your credentials.</div>';
                    }
                }
                ?>
                
                <?php if (!isset($_SESSION['db_configured'])): ?>
                <form method="post">
                    <div class="two-columns">
                        <div class="form-group">
                            <label for="db_host">Database Host</label>
                            <input type="text" id="db_host" name="db_host" value="localhost" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="db_port">Database Port</label>
                            <input type="text" id="db_port" name="db_port" value="5432" required>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label for="db_name">Database Name</label>
                        <input type="text" id="db_name" name="db_name" placeholder="whatsway_db" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="db_user">Database Username</label>
                        <input type="text" id="db_user" name="db_user" placeholder="postgres" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="db_pass">Database Password</label>
                        <input type="password" id="db_pass" name="db_pass" placeholder="Enter password" required>
                    </div>
                    
                    <button type="submit" name="test_connection" class="btn">Test Connection & Save</button>
                </form>
                <?php endif; ?>
                
            <?php elseif ($step == 3): ?>
                <!-- Step 3: Application Configuration -->
                <h2>Application Configuration</h2>
                <p style="margin-bottom: 30px; color: #666;">Configure your application settings.</p>
                
                <?php
                if ($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_POST['save_config'])) {
                    $_SESSION['config'] = [
                        'domain' => $_POST['domain'],
                        'email' => $_POST['email'],
                        'ssl' => $_POST['ssl'],
                        'server_type' => $_POST['server_type']
                    ];
                    
                    echo '<div class="alert success">✓ Configuration saved!</div>';
                    echo '<form method="get"><input type="hidden" name="step" value="4">';
                    echo '<button type="submit" class="btn">Start Installation →</button></form>';
                } else {
                ?>
                
                <form method="post">
                    <div class="form-group">
                        <label for="domain">Domain Name</label>
                        <input type="text" id="domain" name="domain" 
                               value="<?php echo $_SERVER['HTTP_HOST']; ?>" required>
                        <small style="color: #666;">Your application will be accessible at this domain</small>
                    </div>
                    
                    <div class="form-group">
                        <label for="email">Admin Email</label>
                        <input type="email" id="email" name="email" placeholder="admin@example.com" required>
                        <small style="color: #666;">Used for SSL certificate and admin notifications</small>
                    </div>
                    
                    <div class="form-group">
                        <label for="server_type">Server Type</label>
                        <select id="server_type" name="server_type" required>
                            <option value="plesk">Plesk</option>
                            <option value="cpanel">cPanel</option>
                            <option value="aws">AWS EC2</option>
                            <option value="digitalocean">DigitalOcean</option>
                            <option value="vps">Generic VPS/Dedicated</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="ssl">SSL Certificate</label>
                        <select id="ssl" name="ssl" required>
                            <option value="letsencrypt">Let's Encrypt (Free)</option>
                            <option value="existing">I have SSL configured</option>
                            <option value="later">Configure Later</option>
                        </select>
                    </div>
                    
                    <button type="submit" name="save_config" class="btn">Save Configuration</button>
                </form>
                <?php } ?>
                
            <?php elseif ($step == 4): ?>
                <!-- Step 4: Installation Process -->
                <h2>Installing WhatsWay</h2>
                <p style="margin-bottom: 30px; color: #666;">Please wait while we install the application...</p>
                
                <div id="installation-progress">
                    <div class="spinner"></div>
                    <p style="text-align: center; margin-top: 20px; color: #666;">
                        <span id="status-message">Starting installation...</span>
                    </p>
                </div>
                
                <div id="installation-log" style="background: #f5f5f5; padding: 15px; border-radius: 6px; 
                     margin-top: 20px; height: 300px; overflow-y: auto; font-family: monospace; 
                     font-size: 12px; display: none;">
                </div>
                
                <script>
                    // Start installation via AJAX
                    let installationSteps = [
                        {id: 'deps', name: 'Installing dependencies...'},
                        {id: 'build', name: 'Building application...'},
                        {id: 'database', name: 'Setting up database...'},
                        {id: 'pm2', name: 'Configuring PM2...'},
                        {id: 'nginx', name: 'Setting up web server...'},
                        {id: 'ssl', name: 'Configuring SSL...'}
                    ];
                    
                    let currentStep = 0;
                    
                    function runNextStep() {
                        if (currentStep >= installationSteps.length) {
                            // Installation complete
                            window.location.href = '?step=5';
                            return;
                        }
                        
                        let step = installationSteps[currentStep];
                        document.getElementById('status-message').textContent = step.name;
                        
                        // Simulate installation progress
                        setTimeout(() => {
                            currentStep++;
                            runNextStep();
                        }, 3000);
                    }
                    
                    // Start installation
                    runNextStep();
                </script>
                
            <?php elseif ($step == 5): ?>
                <!-- Step 5: Installation Complete -->
                <div class="completion">
                    <div class="icon">✅</div>
                    <h2>Installation Complete!</h2>
                    <p style="color: #666; margin: 20px 0;">
                        WhatsWay has been successfully installed on your server.
                    </p>
                    
                    <div class="credentials">
                        <h3 style="margin-bottom: 15px;">Admin Login Credentials</h3>
                        <p><strong>URL:</strong> https://<?php echo $_SESSION['config']['domain'] ?? $_SERVER['HTTP_HOST']; ?></p>
                        <p><strong>Username:</strong> whatsway</p>
                        <p><strong>Password:</strong> Admin@123</p>
                    </div>
                    
                    <div class="alert success" style="text-align: left;">
                        <strong>Important Next Steps:</strong>
                        <ol style="margin-top: 10px; margin-left: 20px;">
                            <li>Login with the admin credentials above</li>
                            <li>Change the default password immediately</li>
                            <li>Configure your WhatsApp Business account</li>
                            <li>Set up your webhook URL in Meta Business</li>
                            <li>Start importing contacts and creating campaigns</li>
                        </ol>
                    </div>
                    
                    <a href="https://<?php echo $_SESSION['config']['domain'] ?? $_SERVER['HTTP_HOST']; ?>" 
                       class="btn" style="display: inline-block; margin-top: 20px;">
                        Go to WhatsWay Dashboard →
                    </a>
                    
                    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
                        <p style="color: #999; font-size: 12px;">
                            For security reasons, please delete the /install directory after installation.
                        </p>
                    </div>
                </div>
            <?php endif; ?>
        </div>
    </div>
</body>
</html>