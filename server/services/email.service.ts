import nodemailer from 'nodemailer';
// import { getPanelConfigs } from './panel.config';
import { getSMTPConfig } from 'server/controllers/smtp.controller';
import { getFirstPanelConfig, getPanelConfigs } from './panel.config';

const config = await getSMTPConfig();

let transporter:any;


const getData =  await getFirstPanelConfig()

if (config) {
  transporter = nodemailer.createTransport({
    host: config.host,
    port: parseInt(config.port, 10),
    secure: config.secure === 'true',
    auth: {
      user: config.user,
      pass: config.password,
    },
  });
} else {
  console.warn('Using fallback SMTP settings (emails will not be sent)');
  transporter = nodemailer.createTransport({
    jsonTransport: true, // just for development, logs emails instead of sending
  });
}

const [configs] = await getPanelConfigs();

function generateOTPEmailHTML(
  companyName?: string,
  logo?: string,
  otpCode: string,
  name?: string
): string {
  const displayName = configs?.name || "Your Company";
  const headerContent = logo
    ? `<img src="${logo}" alt="${displayName} Logo" style="max-height: 60px; margin-bottom: 10px;">`
    : `<div class="logo">${displayName}</div>`;

  const messageText = `Please use the verification code below to verify your identity.`;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .container {
          background: #ffffff;
          border-radius: 8px;
          padding: 40px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .logo {
          font-size: 28px;
          font-weight: bold;
          color: #1f2937;
          margin-bottom: 10px;
        }
        .otp-box {
          background: #f3f4f6;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          padding: 20px;
          text-align: center;
          margin: 30px 0;
        }
        .otp-code {
          font-size: 36px;
          font-weight: bold;
          letter-spacing: 8px;
          color: #1f2937;
          font-family: 'Courier New', monospace;
        }
        .message {
          font-size: 16px;
          color: #4b5563;
          margin: 20px 0;
        }
        .warning {
          background: #fef3c7;
          border-left: 4px solid #f59e0b;
          padding: 12px;
          margin: 20px 0;
          font-size: 14px;
          color: #92400e;
        }
        .footer {
          text-align: center;
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          font-size: 12px;
          color: #9ca3af;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          ${headerContent}
          <p style="color: #6b7280; margin: 0;">Our Platform</p>
        </div>
        
        <div class="message">
          ${name ? `<p>Hello <strong>${name}</strong>,</p>` : '<p>Hello,</p>'}
          <p>${messageText}</p>
        </div>
        
        <div class="otp-box">
          <div style="font-size: 14px; color: #6b7280; margin-bottom: 10px;">Your Verification Code</div>
          <div class="otp-code">${otpCode}</div>
          <div style="font-size: 12px; color: #9ca3af; margin-top: 10px;">Valid for 5 minutes</div>
        </div>
        
        <div class="warning">
          <strong>⚠️ Security Notice:</strong> Never share this code with anyone. ${displayName} will never ask for your verification code.
        </div>
        
        <div class="message">
          <p>If you didn't request this code, please ignore this email or contact our support team.</p>
        </div>
        
        <div class="footer">
          <p>This is an automated message from ${displayName}.</p>
          <p>&copy; ${new Date().getFullYear()} ${displayName}. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}


function generateOTPEmailText(companyName: string, otpCode: string, name?: string): string {
  return `
Hello${name ? ' ' + name : ''},

Thank you for signing up for ${companyName}!

Your verification code is: ${otpCode}

This code will expire in 5 minutes.

If you didn't request this code, please ignore this email.

---
${companyName}
Our Platform
  `.trim();
}


function generateForgotPasswordEmailHTML(
  companyName?: string,
  logo?: string,
  otpCode: string,
  name?: string
): string {
  const displayName = configs?.name || "Your Company";
  const headerContent = logo
    ? `<img src="${logo}" alt="${displayName} Logo" style="max-height: 60px; margin-bottom: 10px;">`
    : `<div class="logo">${displayName}</div>`;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .container { background: #ffffff; border-radius: 8px; padding: 40px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .logo { font-size: 28px; font-weight: bold; color: #1f2937; margin-bottom: 10px; }
        .otp-box { background: #f3f4f6; border: 2px solid #e5e7eb; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0; }
        .otp-code { font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #1f2937; font-family: 'Courier New', monospace; }
        .message { font-size: 16px; color: #4b5563; margin: 20px 0; }
        .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px; margin: 20px 0; font-size: 14px; color: #92400e; }
        .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #9ca3af; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          ${headerContent}
          <p style="color: #6b7280; margin: 0;">Our Platform</p>
        </div>

        <div class="message">
          ${name ? `<p>Hello <strong>${name}</strong>,</p>` : '<p>Hello,</p>'}
          <p>You requested to reset your password. Use the verification code below to reset your password.</p>
        </div>

        <div class="otp-box">
          <div style="font-size: 14px; color: #6b7280; margin-bottom: 10px;">Your Verification Code</div>
          <div class="otp-code">${otpCode}</div>
          <div style="font-size: 12px; color: #9ca3af; margin-top: 10px;">Valid for 5 minutes</div>
        </div>

        <div class="warning">
          <strong>⚠️ Security Notice:</strong> Never share this code with anyone. ${displayName} will never ask for your verification code.
        </div>

        <div class="message">
          <p>If you didn't request this password reset, please ignore this email or contact our support team.</p>
        </div>

        <div class="footer">
          <p>This is an automated message from ${displayName}.</p>
          <p>&copy; ${new Date().getFullYear()} ${displayName}. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function generateForgotPasswordEmailText(companyName: string, otpCode: string, name?: string): string {
  return `
Hello${name ? ' ' + name : ''},

You requested to reset your password for ${companyName}.

Your verification code is: ${otpCode}

This code will expire in 5 minutes.

If you didn't request a password reset, please ignore this email.

---
${companyName}
Our Platform
  `.trim();
}


function extractCompanyName(url: string) {
  let domain = url.replace(/^https?:\/\//, '');
  domain = domain.replace(/^www\./, '');
  const companyName = domain.split('.')[0];
  return companyName;
}

export async function sendOTPEmail(email: string, otpCode: string, name?: string) {
//   const [configs] = await getPanelConfigs();
  const companyName =  configs?.name || "Your Company";
  const fromName = config?.fromName || companyName;  
  const fromEmail = config?.fromEmail;

  // console.log(
  //   process.env.SMTP_FROM_NAME , process.env.SMTP_EMAIL_FROM,
  //   {
  //     host: process.env.SMTP_HOST || 'smtp.gmail.com',
  //     port: parseInt(process.env.SMTP_PORT || '587', 10),
  //     secure: false,
  //     auth: {
  //       user: process.env.SMTP_USER,
  //       pass: process.env.SMTP_PASSWORD,
  //     },
  //   }
  // )

  const mailOptions = {
    from: `"${fromName}" <${fromEmail}>`,
    to: email,
    subject: `Your ${companyName} Verification Code`,
    html: generateForgotPasswordEmailHTML(companyName, "whatsway", otpCode, name),
    text: generateForgotPasswordEmailText(companyName, otpCode, name),
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    // console.log(info)
    console.log('✉️ [Email] OTP sent to:', email);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ [Email] Failed to send OTP:', error);
    throw new Error('Failed to send verification email');
  }
}


export async function sendContactEmail(data: {
  name: string;
  email: string;
  company?: string;
  subject: string;
  message: string;
}) {
  
  const { name, email, company, subject, message } = data;

  const companyName = configs?.name || "Your Company";
  const fromName = config?.fromName || companyName;
  const fromEmail = config?.fromEmail;

  const html = `
  <div style="background:#f4f5f7; padding:40px; font-family:Arial, sans-serif;">
    <div style="max-width:600px; margin:auto; background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,0.08);">
      
      <!-- Header -->
      <div style="background:#4f46e5; padding:24px; color:#ffffff; text-align:center;">
        <h2 style="margin:0; font-size:24px; font-weight:600;">New Contact Form Message</h2>
        <p style="margin:6px 0 0; opacity:0.85;">${companyName}</p>
      </div>

      <!-- Body -->
      <div style="padding:30px;">
        
        <p style="font-size:16px; color:#111827;">You have received a new message from your website contact form.</p>

        <table style="width:100%; margin-top:20px;">
          <tr>
            <td style="padding:10px 0; font-size:16px; font-weight:600; width:150px; color:#374151;">Name:</td>
            <td style="padding:10px 0; font-size:16px; color:#111827;">${name}</td>
          </tr>

          <tr>
            <td style="padding:10px 0; font-size:16px; font-weight:600; color:#374151;">Email:</td>
            <td style="padding:10px 0; font-size:16px; color:#111827;">${email}</td>
          </tr>

          <tr>
            <td style="padding:10px 0; font-size:16px; font-weight:600; color:#374151;">Company:</td>
            <td style="padding:10px 0; font-size:16px; color:#111827;">${company || "-"}</td>
          </tr>

          <tr>
            <td style="padding:10px 0; font-size:16px; font-weight:600; color:#374151;">Subject:</td>
            <td style="padding:10px 0; font-size:16px; color:#111827;">${subject}</td>
          </tr>
        </table>

        <div style="margin-top:30px;">
          <p style="font-size:16px; font-weight:600; color:#374151; margin-bottom:8px;">Message:</p>
          <div style="background:#f9fafb; padding:20px; border-radius:10px; font-size:15px; line-height:1.6; color:#111827;">
            ${message.replace(/\n/g, "<br>")}
          </div>
        </div>

      </div>

      <!-- Footer -->
      <div style="background:#f3f4f6; padding:18px; text-align:center; font-size:13px; color:#6b7280;">
        This email was sent from the contact form on <strong>${companyName}</strong>.
      </div>

    </div>
  </div>
`;


  const mailOptions = {
    from: `"${fromName}" <${fromEmail}>`,
    to: fromEmail, // send to admin email
    subject: `Contact Form: ${subject}`,
    html,
    text: `${name} (${email}) says: ${message}`,
  };

  try {
   
    const info = await transporter.sendMail(mailOptions);
    console.log("✉️ [Contact] Message sent:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ [Contact] Failed:", error);
    throw new Error("Failed to send contact message");
  }
}

export async function sendOTPEmailVerify(email: string, otpCode: string, name?: string) {
//   const [configs] = await getPanelConfigs();
  const companyName = configs?.name || "Your Company";
  const fromName = config?.fromName || companyName;  
  const fromEmail = config?.fromEmail;

  // console.log(
  //   process.env.SMTP_FROM_NAME , process.env.SMTP_EMAIL_FROM,
  //   {
  //     host: process.env.SMTP_HOST || 'smtp.gmail.com',
  //     port: parseInt(process.env.SMTP_PORT || '587', 10),
  //     secure: false,
  //     auth: {
  //       user: process.env.SMTP_USER,
  //       pass: process.env.SMTP_PASSWORD,
  //     },
  //   }
  // )

  const mailOptions = {
    from: `"${fromName}" <${fromEmail}>`,
    to: email,
    subject: `Your ${companyName} Verification Code`,
    html: generateOTPEmailHTML(companyName, "whatsway", otpCode, name),
    text: generateOTPEmailText(companyName, otpCode, name),
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    // console.log(info)
    console.log('✉️ [Email] OTP sent to:', email);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ [Email] Failed to send OTP:', error);
    throw new Error('Failed to send verification email');
  }
}




export async function verifyEmailConfiguration(): Promise<boolean> {
  try {
    await transporter.verify();
    console.log('✅ [Email] SMTP configuration is valid');
    return true;
  } catch (error) {
    console.error('❌ [Email] SMTP configuration error:', error);
    return false;
  }
}




 // route.ts  file
 
 
 // OTP endpoints for email verification
// app.post("/api/auth/send-otp", async (req: Request, res: Response) => {
//   try {
//     const { email, name } = req.body;

//     if (!email) {
//       return res.status(400).json({ error: "Email is required" });
//     }

//     // Check if user already exists
//     const existingUser = await storage.getUserByEmail(email);
//     if (existingUser) {
//       return res.status(400).json({ error: "Email already registered" });
//     }

//     // Check rate limiting: max 3 OTP requests per 5 minutes
//     const { otpVerifications } = await import("@shared/schema");
//     const recentOTPs = await db
//       .select()
//       .from(otpVerifications)
//       .where(
//         and(
//           eq(otpVerifications.email, email),
//           sql`${otpVerifications.createdAt} > NOW() - INTERVAL '5 minutes'`
//         )
//       );

//     if (recentOTPs.length >= 3) {
//       return res
//         .status(429)
//         .json({ error: "Too many OTP requests. Please try again in 5 minutes." });
//     }

//     // Generate 6-digit OTP
//     const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
//     const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

//     // Store OTP in database
//     await db.insert(otpVerifications).values({
//       email,
//       otpCode,
//       expiresAt,
//     });

//     console.log(`🔐 [OTP] Generated OTP for ${email}: ${otpCode} (expires at ${expiresAt.toISOString()})`);

//     // Try sending OTP email, but don't fail if email sending throws
//     try {
//       const { sendOTPEmail } = await import("./services/email");
//       await sendOTPEmail(email, otpCode, name);
//       console.log(`✉️ [OTP] Sent verification code to ${email} OTP: ${otpCode}`);
//     } catch (emailError) {
//       console.error("⚠️ Failed to send OTP email:", emailError);
//     }

//     // Always respond success, even if email failed
//     res.json({
//       success: true,
//       message: "Verification code generated successfully",
//     });
//   } catch (error: any) {
//     console.error("Send OTP error:", error);
//     res
//       .status(500)
//       .json({ error: error.message || "Failed to send verification code" });
//   }
// });
