// ============================================
// REAL-TIME WIDGET.JS - With Socket.io Support
// ============================================

(function() {
  'use strict';

  const config = window.aiChatConfig || {};
  const API_BASE = config.url || 'http://localhost:5001';
  const siteId = config.siteId;
  const channelId = config.channelId || null;

  if (!siteId) {
    console.error('AI Chat Widget: siteId is required');
    return;
  }

  let isOpen = false;
  let currentScreen = 'home';
  let widgetConfig = {};
  let widgetContainer = null;
  let widgetButton = null;
  let kbData = null;
  let currentArticle = null;
  let leadInfo = null;
  let conversationId = null;
  let sessionId = generateSessionId();
  let socket = null;
  let isConnected = false;
  let currentMode = 'ai'; // 'ai' or 'human'
  let typingTimeout = null;

  const defaultConfig = {
    primaryColor: '#3b82f6',
    accentColor: '#8b5cf6',
    backgroundColor: '#ffffff',
    textColor: '#1f2937',
    position: 'bottom-right',
    title: 'Welcome!',
    subtitle: 'How can we help?',
    greeting: 'Hi! How can I help you today?',
    appName: 'AI Chat Widget',
    brandName: '',
    homeScreen: 'messenger',
    widgetStyle: 'modern',
    showPoweredBy: true,
    enableChat: true,
    enableKnowledgeBase: true,
    teamMembers: [],
    responseTime: 'A few minutes',
    messengerButtonText: 'Send us a message',
    messengerSearchPlaceholder: 'Search our Help Center',
    articlesCount: 3,
    showTeamAvatars: true,
    showRecentArticles: true,
    fontFamily: 'system',
    buttonStyle: 'solid',
    shadowIntensity: 'medium',
    animationSpeed: 'normal',
  };

  function generateSessionId() {
    return 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // Initialize Socket.io connection
  function initializeSocket() {
    if (socket && isConnected) return;

    // Load Socket.io client
    if (!window.io) {
      const script = document.createElement('script');
      script.src = `${API_BASE}/socket.io/socket.io.js`;
      script.onload = () => connectSocket();
      document.head.appendChild(script);
    } else {
      connectSocket();
    }
  }

  function connectSocket() {
    socket = io(API_BASE, {
      query: {
        sessionId: sessionId,
        siteId: siteId,
        conversationId: conversationId
      },
      transports: ['websocket', 'polling']
    });

    socket.on('connect', () => {
      console.log('Socket connected');
      isConnected = true;
      
      if (conversationId) {
        socket.emit('join_conversation', { conversationId });
      }
      
      updateConnectionStatus(true);
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
      isConnected = false;
      updateConnectionStatus(false);
    });

    // Receive new message from admin/agent
    socket.on('new_message', (data) => {
      if (currentScreen === 'chat') {
        addMessageToChat(data.message, false);
        
        // Mark as read
        if (isOpen) {
          socket.emit('message_read', { 
            conversationId: conversationId,
            messageId: data.message.id 
          });
        }
      } else {
        // Show notification badge
        updateUnreadCount();
      }
    });

    // Conversation assigned to agent
    socket.on('conversation_assigned', (data) => {
      currentMode = 'human';
      showAgentAssignedNotification(data.agent);
    });

    // Agent typing indicator
    socket.on('agent_typing', (data) => {
      if (currentScreen === 'chat') {
        showTypingIndicator(data.agentName || 'Agent');
      }
    });

    // Agent stopped typing
    socket.on('agent_stopped_typing', () => {
      hideTypingIndicator();
    });

    // Conversation status changed
    socket.on('conversation_status_changed', (data) => {
      if (data.status === 'closed') {
        showConversationClosedMessage();
      }
    });

    // Message status update (delivered/read)
    socket.on('message_status_update', (data) => {
      updateMessageStatus(data.messageId, data.status);
    });
  }

  function updateConnectionStatus(connected) {
    const statusEl = widgetContainer?.querySelector('.ai-chat-connection-status');
    if (statusEl) {
      statusEl.textContent = connected ? 'Connected' : 'Connecting...';
      statusEl.style.color = connected ? '#10b981' : '#f59e0b';
    }
  }

  function showAgentAssignedNotification(agent) {
    if (currentScreen !== 'chat') return;
    
    const messagesContainer = widgetContainer.querySelector('.ai-chat-widget-messages');
    const agentName = agent?.name || 'Support Agent';
    
    messagesContainer.innerHTML += `
      <div class="ai-chat-system-message">
        <div class="ai-chat-system-message-content">
          🎯 ${agentName} has joined the conversation
        </div>
      </div>
    `;
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  function showTypingIndicator(agentName) {
    const messagesContainer = widgetContainer.querySelector('.ai-chat-widget-messages');
    
    // Remove existing typing indicator
    const existing = messagesContainer.querySelector('.ai-typing-indicator');
    if (existing) existing.remove();
    
    messagesContainer.innerHTML += `
      <div class="ai-chat-widget-message bot ai-typing-indicator">
        <div class="ai-chat-widget-message-avatar">${agentName[0]}</div>
        <div class="ai-chat-widget-message-content">
          <div class="ai-typing-dots">
            <span></span><span></span><span></span>
          </div>
        </div>
      </div>
    `;
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  function hideTypingIndicator() {
    const messagesContainer = widgetContainer?.querySelector('.ai-chat-widget-messages');
    if (!messagesContainer) return;
    
    const typingIndicator = messagesContainer.querySelector('.ai-typing-indicator');
    if (typingIndicator) {
      typingIndicator.remove();
    }
  }

  function showConversationClosedMessage() {
    if (currentScreen !== 'chat') return;
    
    const messagesContainer = widgetContainer.querySelector('.ai-chat-widget-messages');
    messagesContainer.innerHTML += `
      <div class="ai-chat-system-message">
        <div class="ai-chat-system-message-content">
          ✅ This conversation has been closed. Start a new conversation if you need more help.
        </div>
      </div>
    `;
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  function addMessageToChat(message, isUser) {
    const messagesContainer = widgetContainer.querySelector('.ai-chat-widget-messages');
    if (!messagesContainer) return;
    
    const messageClass = isUser ? 'user' : 'bot';
    const avatarText = isUser ? (leadInfo?.name?.[0] || 'U') : (message.fromName?.[0] || 'A');
    
    messagesContainer.innerHTML += `
      <div class="ai-chat-widget-message ${messageClass}" data-message-id="${message.id || ''}">
        ${!isUser ? `<div class="ai-chat-widget-message-avatar">${avatarText}</div>` : ''}
        <div class="ai-chat-widget-message-content">
          ${escapeHtml(message.content)}
          ${isUser ? `<div class="ai-message-status" data-status="${message.status || 'sent'}">${getStatusIcon(message.status || 'sent')}</div>` : ''}
        </div>
        ${isUser ? `<div class="ai-chat-widget-message-avatar">${avatarText}</div>` : ''}
      </div>
    `;
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  function getStatusIcon(status) {
    switch(status) {
      case 'sent': return '✓';
      case 'delivered': return '✓✓';
      case 'read': return '✓✓';
      default: return '';
    }
  }

  function updateMessageStatus(messageId, status) {
    const messageEl = widgetContainer?.querySelector(`[data-message-id="${messageId}"]`);
    if (!messageEl) return;
    
    const statusEl = messageEl.querySelector('.ai-message-status');
    if (statusEl) {
      statusEl.setAttribute('data-status', status);
      statusEl.textContent = getStatusIcon(status);
    }
  }

  function updateUnreadCount() {
    // Add badge to widget button
    let badge = widgetButton.querySelector('.ai-chat-badge');
    if (!badge) {
      badge = document.createElement('div');
      badge.className = 'ai-chat-badge';
      widgetButton.appendChild(badge);
    }
    
    const currentCount = parseInt(badge.textContent || '0');
    badge.textContent = currentCount + 1;
    badge.style.display = 'flex';
  }

  // Send typing indicator
  function sendTypingIndicator() {
    if (socket && isConnected && conversationId) {
      socket.emit('user_typing', { conversationId });
      
      // Clear previous timeout
      if (typingTimeout) clearTimeout(typingTimeout);
      
      // Send stopped typing after 2 seconds of inactivity
      typingTimeout = setTimeout(() => {
        socket.emit('user_stopped_typing', { conversationId });
      }, 2000);
    }
  }

  async function fetchWidgetConfig() {
    try {
      const response = await fetch(`${API_BASE}/api/widget/config/${siteId}`);

      // console.log('Widget config response:', response);
      if (response.ok) { 
        const data = await response.json();
        const serverConfig = data.config || {};
        if (serverConfig.featureToggles) {
          serverConfig.enableKnowledgeBase = serverConfig.featureToggles.knowledgeBase;
          serverConfig.enableChat = serverConfig.featureToggles.chat;
        }
        if (serverConfig.homeScreenLayout) {
          serverConfig.homeScreen = serverConfig.homeScreenLayout;
        }
        widgetConfig = { ...defaultConfig, ...serverConfig, ...config, siteId };
      } else {
        widgetConfig = { ...defaultConfig, ...config, siteId };
      }
    } catch (error) {
      // console.error('Failed to fetch widget config:', error);
      widgetConfig = { ...defaultConfig, ...config, siteId };
    }
  }

  // async function fetchKBArticles() {
  //   try {
  //     const response = await fetch(`${API_BASE}/api/widget/kb/${siteId}`);
  //     if (response.ok) {
  //       kbData = await response.json();
  //     }
  //   } catch (error) {
  //     console.error('Failed to fetch KB articles:', error);
  //   }
  // }

  async function fetchArticle(articleId) {
    try {
      const response = await fetch(`${API_BASE}/api/widget/article/${articleId}`);
      if (response.ok) {
        const article = await response.json();
        showArticle(article);
      }
    } catch (error) {
      console.error('Failed to fetch article:', error);
    }
  }

  function createStyles() {
    const fontImport = widgetConfig.fontFamily === 'inter' ? `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');` :
                      widgetConfig.fontFamily === 'roboto' ? `@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap');` :
                      widgetConfig.fontFamily === 'open-sans' ? `@import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700&display=swap');` : '';
    
    const fontFamily = widgetConfig.fontFamily === 'inter' ? "'Inter', sans-serif" :
                      widgetConfig.fontFamily === 'roboto' ? "'Roboto', sans-serif" :
                      widgetConfig.fontFamily === 'open-sans' ? "'Open Sans', sans-serif" :
                      "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
    
    const shadowButton = widgetConfig.shadowIntensity === 'none' ? 'none' :
                        widgetConfig.shadowIntensity === 'light' ? '0 2px 8px rgba(0, 0, 0, 0.1)' :
                        widgetConfig.shadowIntensity === 'strong' ? '0 8px 24px rgba(0, 0, 0, 0.25)' :
                        '0 4px 12px rgba(0, 0, 0, 0.15)';
    
    const shadowButtonHover = widgetConfig.shadowIntensity === 'none' ? 'none' :
                             widgetConfig.shadowIntensity === 'light' ? '0 4px 12px rgba(0, 0, 0, 0.15)' :
                             widgetConfig.shadowIntensity === 'strong' ? '0 12px 32px rgba(0, 0, 0, 0.3)' :
                             '0 6px 16px rgba(0, 0, 0, 0.2)';
    
    const shadowContainer = widgetConfig.shadowIntensity === 'none' ? 'none' :
                           widgetConfig.shadowIntensity === 'light' ? '0 4px 16px rgba(0, 0, 0, 0.1)' :
                           widgetConfig.shadowIntensity === 'strong' ? '0 16px 64px rgba(0, 0, 0, 0.3)' :
                           '0 10px 40px rgba(0, 0, 0, 0.2)';
    
    const transitionSpeed = widgetConfig.animationSpeed === 'none' ? '0s' :
                          widgetConfig.animationSpeed === 'slow' ? '0.5s' :
                          widgetConfig.animationSpeed === 'fast' ? '0.15s' : '0.3s';
    
    const transitionSpeedFast = widgetConfig.animationSpeed === 'none' ? '0s' :
                               widgetConfig.animationSpeed === 'slow' ? '0.3s' :
                               widgetConfig.animationSpeed === 'fast' ? '0.1s' : '0.2s';
    
    const style = document.createElement('style');
    style.textContent = `
      ${fontImport}
      
      .ai-chat-widget * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
        font-family: ${fontFamily};
      }

      .ai-chat-widget-button {
        position: fixed;
        width: 60px;
        height: 60px;
        border-radius: 50%;
        ${widgetConfig.buttonStyle === 'outline' 
          ? `background: white; border: 3px solid ${widgetConfig.primaryColor};`
          : widgetConfig.buttonStyle === 'gradient'
          ? `background: linear-gradient(135deg, ${widgetConfig.primaryColor}, ${widgetConfig.accentColor}); border: none;`
          : `background: ${widgetConfig.primaryColor}; border: none;`}
        cursor: pointer;
        box-shadow: ${shadowButton};
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform ${transitionSpeedFast}, box-shadow ${transitionSpeedFast};
        z-index: 999998;
      }

      .ai-chat-widget-button:hover {
        transform: scale(1.05);
        box-shadow: ${shadowButtonHover};
      }

      .ai-chat-widget-button.${widgetConfig.position} {
        ${widgetConfig.position.includes('bottom') ? 'bottom: 24px;' : 'top: 24px;'}
        ${widgetConfig.position.includes('right') ? 'right: 24px;' : 'left: 24px;'}
      }

      .ai-chat-badge {
        position: absolute;
        top: -4px;
        right: -4px;
        background: #ef4444;
        color: white;
        border-radius: 50%;
        width: 20px;
        height: 20px;
        display: none;
        align-items: center;
        justify-content: center;
        font-size: 11px;
        font-weight: 600;
        border: 2px solid white;
      }

      .ai-chat-widget-container {
        position: fixed;
        width: 380px;
        height: 600px;
        background: white;
        border-radius: 16px;
        box-shadow: ${shadowContainer};
        display: flex;
        flex-direction: column;
        overflow: hidden;
        z-index: 999999;
        transition: opacity ${transitionSpeed}, transform ${transitionSpeed};
      }

      .ai-chat-widget-container.hidden {
        opacity: 0;
        transform: scale(0.95);
        pointer-events: none;
      }

      .ai-chat-widget-container.${widgetConfig.position} {
        ${widgetConfig.position.includes('bottom') ? 'bottom: 100px;' : 'top: 100px;'}
        ${widgetConfig.position.includes('right') ? 'right: 24px;' : 'left: 24px;'}
      }

      .ai-chat-widget-header {
        padding: 20px;
        color: white;
        background: ${widgetConfig.widgetStyle === 'modern' 
          ? `linear-gradient(135deg, ${widgetConfig.primaryColor}, ${widgetConfig.accentColor})`
          : widgetConfig.primaryColor};
      }

      .ai-chat-widget-header-top {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 4px;
      }

      .ai-chat-connection-status {
        font-size: 11px;
        opacity: 0.9;
        margin-top: 4px;
      }

      .ai-chat-widget-app-name {
        font-size: 15px;
        font-weight: 600;
        margin-bottom: 4px;
        opacity: 0.9;
      }

      .ai-chat-widget-title {
        font-size: 17px;
        font-weight: 600;
      }

      .ai-chat-widget-subtitle {
        font-size: 13px;
        opacity: 0.8;
      }

      .ai-chat-widget-close, .ai-chat-widget-back {
        background: none;
        border: none;
        color: white;
        cursor: pointer;
        padding: 4px;
        opacity: 0.8;
        transition: opacity 0.2s;
      }

      .ai-chat-widget-close:hover, .ai-chat-widget-back:hover {
        opacity: 1;
      }

      .ai-chat-widget-content {
        flex: 1;
        overflow-y: auto;
        padding: 20px;
      }

      .ai-chat-system-message {
        display: flex;
        justify-content: center;
        margin: 16px 0;
      }

      .ai-chat-system-message-content {
        background: #f1f5f9;
        color: #64748b;
        padding: 8px 16px;
        border-radius: 16px;
        font-size: 13px;
        text-align: center;
        max-width: 80%;
      }

      .ai-chat-widget-team {
        background: #f8fafc;
        border-radius: 12px;
        padding: 16px;
        margin-bottom: 16px;
      }

      .ai-chat-widget-avatars {
        display: flex;
        margin-bottom: 12px;
      }

      .ai-chat-widget-avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: ${widgetConfig.primaryColor};
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 600;
        font-size: 14px;
        margin-right: -8px;
        border: 2px solid white;
      }

      .ai-chat-widget-response-time {
        font-size: 12px;
        color: #64748b;
        margin-bottom: 8px;
      }

      .ai-chat-widget-start-chat {
        width: 100%;
        padding: 12px;
        ${widgetConfig.buttonStyle === 'outline' 
          ? `background: transparent; color: ${widgetConfig.primaryColor}; border: 2px solid ${widgetConfig.primaryColor};`
          : widgetConfig.buttonStyle === 'gradient'
          ? `background: linear-gradient(135deg, ${widgetConfig.primaryColor}, ${widgetConfig.accentColor}); color: white; border: none;`
          : `background: ${widgetConfig.primaryColor}; color: white; border: none;`}
        border-radius: 8px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        transition: opacity ${transitionSpeedFast};
      }

      .ai-chat-widget-start-chat:hover {
        opacity: 0.9;
      }

      .ai-chat-widget-search {
        margin-bottom: 16px;
      }

      .ai-chat-widget-search-input {
        width: 100%;
        padding: 10px 12px;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        font-size: 14px;
        transition: border-color 0.2s;
      }

      .ai-chat-widget-search-input:focus {
        outline: none;
        border-color: ${widgetConfig.primaryColor};
      }

      .ai-chat-widget-articles {
        margin-top: 16px;
      }

      .ai-chat-widget-articles-title {
        font-size: 12px;
        font-weight: 500;
        color: #64748b;
        margin-bottom: 8px;
      }

      .ai-chat-widget-article {
        padding: 12px;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        margin-bottom: 8px;
        cursor: pointer;
        transition: background 0.2s;
      }

      .ai-chat-widget-article:hover {
        background: #f8fafc;
      }

      .ai-chat-widget-article-title {
        font-size: 14px;
        font-weight: 500;
        margin-bottom: 4px;
      }

      .ai-chat-widget-article-category {
        font-size: 12px;
        color: #64748b;
      }

      .ai-chat-widget-chat {
        display: flex;
        flex-direction: column;
        height: 100%;
      }

      .ai-chat-widget-messages {
        flex: 1;
        overflow-y: auto;
        padding: 20px;
      }

      .ai-chat-widget-message {
        margin-bottom: 16px;
        display: flex;
        gap: 8px;
        align-items: flex-end;
      }

      .ai-chat-widget-message.user {
        justify-content: flex-end;
      }

      .ai-chat-widget-message-avatar {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: ${widgetConfig.primaryColor};
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        font-weight: 600;
        flex-shrink: 0;
      }

      .ai-chat-widget-message-content {
        max-width: 70%;
        padding: 10px 14px;
        border-radius: 12px;
        font-size: 14px;
        line-height: 1.4;
        position: relative;
      }

      .ai-chat-widget-message.bot .ai-chat-widget-message-content {
        background: #f1f5f9;
        color: #334155;
      }

      .ai-chat-widget-message.user .ai-chat-widget-message-content {
        background: ${widgetConfig.primaryColor};
        color: white;
      }

      .ai-message-status {
        font-size: 10px;
        opacity: 0.7;
        margin-top: 4px;
        text-align: right;
      }

      .ai-message-status[data-status="read"] {
        color: #10b981;
      }

      .ai-typing-dots {
        display: flex;
        gap: 4px;
        padding: 4px 0;
      }

      .ai-typing-dots span {
        width: 6px;
        height: 6px;
        background-color: currentColor;
        border-radius: 50%;
        opacity: 0.6;
        animation: typing 1.4s infinite;
      }

      .ai-typing-dots span:nth-child(2) {
        animation-delay: 0.2s;
      }

      .ai-typing-dots span:nth-child(3) {
        animation-delay: 0.4s;
      }

      @keyframes typing {
        0%, 60%, 100% { transform: translateY(0); opacity: 0.6; }
        30% { transform: translateY(-8px); opacity: 1; }
      }

      .ai-chat-widget-chat-input {
        padding: 16px;
        border-top: 1px solid #e2e8f0;
        display: flex;
        gap: 8px;
      }

      .ai-chat-widget-chat-input input {
        flex: 1;
        padding: 10px 12px;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        font-size: 14px;
      }

      .ai-chat-widget-chat-input input:focus {
        outline: none;
        border-color: ${widgetConfig.primaryColor};
      }

      .ai-chat-widget-chat-send {
        padding: 10px 16px;
        background: ${widgetConfig.primaryColor};
        color: white;
        border: none;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: opacity 0.2s;
      }

      .ai-chat-widget-chat-send:hover {
        opacity: 0.9;
      }

      .ai-chat-widget-chat-send:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .ai-chat-widget-powered {
        padding: 12px;
        text-align: center;
        border-top: 1px solid #e2e8f0;
        font-size: 11px;
        color: #94a3b8;
      }

      @media (max-width: 480px) {
        .ai-chat-widget-container {
          width: calc(100vw - 32px);
          height: calc(100vh - 120px);
          max-height: 600px;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function createMessageIcon(color = 'white') {
    return `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
    </svg>`;
  }

  function createCloseIcon() {
    return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>`;
  }

  function createBackIcon() {
    return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <line x1="19" y1="12" x2="5" y2="12"></line>
      <polyline points="12 19 5 12 12 5"></polyline>
    </svg>`;
  }

  function createWidgetButton() {
    const button = document.createElement('button');
    button.className = `ai-chat-widget-button ${widgetConfig.position}`;
    const iconColor = widgetConfig.buttonStyle === 'outline' ? widgetConfig.primaryColor : 'white';
    button.innerHTML = createMessageIcon(iconColor);
    button.addEventListener('click', toggleWidget);
    document.body.appendChild(button);
    return button;
  }

  function createWidgetContainer() {
    const container = document.createElement('div');
    container.className = `ai-chat-widget-container ${widgetConfig.position} hidden`;
    container.innerHTML = `
      <div class="ai-chat-widget-header">
        <div class="ai-chat-widget-header-top">
          <button class="ai-chat-widget-back" style="display: none;">${createBackIcon()}</button>
          <div class="ai-chat-widget-header-content">
            ${widgetConfig.appName ? `<div class="ai-chat-widget-app-name">${widgetConfig.appName}</div>` : ''}
            <div class="ai-chat-widget-title">${widgetConfig.title}</div>
            <div class="ai-chat-widget-subtitle">${widgetConfig.subtitle}</div>
            <div class="ai-chat-connection-status">Connecting...</div>
          </div>
          <button class="ai-chat-widget-close">${createCloseIcon()}</button>
        </div>
      </div>
      <div class="ai-chat-widget-content">
        ${renderHomeScreen()}
      </div>
      <div class="ai-chat-widget-powered">Powered by ${widgetConfig.brandName || widgetConfig.appName}</div>
    `;

    container.querySelector('.ai-chat-widget-close').addEventListener('click', closeWidget);
    container.querySelector('.ai-chat-widget-back').addEventListener('click', goBack);

    document.body.appendChild(container);
    return container;
  }

  function renderHomeScreen() {
    const avatars = widgetConfig.teamMembers.slice(0, 3).map(member => {
      if (member.avatar) {
        return `<div class="ai-chat-widget-avatar">
          <img src="${member.avatar}" alt="${member.name}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">
        </div>`;
      } else {
        return `<div class="ai-chat-widget-avatar">${member.name ? member.name[0] : '?'}</div>`;
      }
    }).join('');

    let articlesHtml = '';
    if (widgetConfig.enableKnowledgeBase && kbData && kbData.categories.length > 0) {
      const articlesCount = widgetConfig.articlesCount || 3;
      const allArticles = kbData.categories.flatMap(cat => 
        cat.articles.map(article => ({ ...article, category: cat.name }))
      ).slice(0, articlesCount);
      
      articlesHtml = allArticles.map(article => `
        <div class="ai-chat-widget-article" data-article-id="${article.id}">
          <div class="ai-chat-widget-article-title">${article.title}</div>
          <div class="ai-chat-widget-article-category">${article.category}</div>
        </div>
      `).join('');
    }

    return `
      <div class="ai-chat-widget-team">
        ${widgetConfig.showTeamAvatars !== false ? `<div class="ai-chat-widget-avatars">${avatars}</div>` : ''}
        <div class="ai-chat-widget-response-time">Our usual reply time: <strong>${widgetConfig.responseTime}</strong></div>
        <button class="ai-chat-widget-start-chat">
          ${createMessageIcon()}
          ${widgetConfig.messengerButtonText || 'Send us a message'}
        </button>
      </div>
      ${widgetConfig.enableKnowledgeBase && kbData ? `
        <div class="ai-chat-widget-search">
          <input type="text" class="ai-chat-widget-search-input" placeholder="${widgetConfig.messengerSearchPlaceholder || 'Search our Help Center'}">
        </div>
        ${widgetConfig.showRecentArticles !== false ? `
          <div class="ai-chat-widget-articles">
            <div class="ai-chat-widget-articles-title">Popular articles</div>
            ${articlesHtml || '<p style="font-size: 14px; color: #64748b;">No articles available</p>'}
          </div>
        ` : ''}
      ` : ''}
    `;
  }

  function renderLeadForm() {
    return `
      <div class="ai-chat-widget-lead-form">
        <h3 style="font-size: 18px; font-weight: 600; margin-bottom: 8px;">Welcome!</h3>
        <p style="font-size: 14px; margin-bottom: 20px; color: #64748b;">Please share your details so we can assist you better.</p>
        <form id="ai-chat-lead-form">
          <div style="margin-bottom: 16px;">
            <label style="display: block; font-size: 13px; font-weight: 500; margin-bottom: 6px;">Name *</label>
            <input type="text" id="lead-name" required style="width: 100%; padding: 10px 12px; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 14px;" placeholder="John Doe">
          </div>
          <div style="margin-bottom: 16px;">
            <label style="display: block; font-size: 13px; font-weight: 500; margin-bottom: 6px;">Email *</label>
            <input type="email" id="lead-email" required style="width: 100%; padding: 10px 12px; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 14px;" placeholder="john@example.com">
          </div>
          <div style="margin-bottom: 20px;">
            <label style="display: block; font-size: 13px; font-weight: 500; margin-bottom: 6px;">Mobile Number *</label>
            <input type="tel" id="lead-mobile" required style="width: 100%; padding: 10px 12px; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 14px;" placeholder="+1 234 567 8900">
          </div>
          <button type="submit" style="width: 100%; padding: 12px; background: ${widgetConfig.primaryColor}; color: white; border: none; border-radius: 6px; font-size: 14px; font-weight: 600; cursor: pointer;">
            Start Chat
          </button>
        </form>
        <div id="lead-error" 
          style="display:none; color:red; font-size:14px; margin-top:8px;">
      </div>
      </div>
    `;
  }

  async function submitLeadForm(event) {
    event.preventDefault();
  
    const name = document.getElementById('lead-name').value.trim();
    const email = document.getElementById('lead-email').value.trim();
    const mobile = document.getElementById('lead-mobile').value.trim();
  
    const errorBox = document.getElementById('lead-error'); // Add error element in form
  
    if (!name || !email || !mobile) {
      errorBox.textContent = "All fields are required.";
      errorBox.style.display = "block";
      return;
    }
  
    leadInfo = { name, email, mobile };
  
    try {
      const res = await fetch(`${API_BASE}/api/widget/contacts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siteId: siteId,
          name,
          email,
          phone: mobile,
          source: 'chat_widget'
        })
      });
  
      // ❌ If API failed → show message & STOP
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        errorBox.textContent = data.error || "Failed to save your details. Try again.";
        errorBox.style.display = "block";
        return; // ❗ STOP HERE
      }
  
    } catch (error) {
      console.error('Failed to save lead:', error);
      errorBox.textContent = "Network error. Please try again.";
      errorBox.style.display = "block";
      return; // ❗ STOP HERE
    }
  
    // ✔️ Only open chat when lead successfully saved
    proceedToChat();
  }
  

  function proceedToChat() {
    currentScreen = 'chat';
    const content = widgetContainer.querySelector('.ai-chat-widget-content');
    content.innerHTML = renderChatScreen();
    
    widgetContainer.querySelector('.ai-chat-widget-back').style.display = 'block';
    
    // Initialize socket connection
    initializeSocket();
    
    const sendButton = content.querySelector('.ai-chat-widget-chat-send');
    const input = content.querySelector('#ai-chat-input');
    
    sendButton.addEventListener('click', sendMessage);
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !sendButton.disabled) sendMessage();
    });
    
    // Add typing indicator on input
    input.addEventListener('input', sendTypingIndicator);
  }

  function renderChatScreen() {
    const greeting = leadInfo 
      ? `Hi ${leadInfo.name}! ${widgetConfig.greeting}`
      : widgetConfig.greeting;
    
    return `
      <div class="ai-chat-widget-chat">
        <div class="ai-chat-widget-messages">
          <div class="ai-chat-widget-message bot">
            <div class="ai-chat-widget-message-avatar">AI</div>
            <div class="ai-chat-widget-message-content">${greeting}</div>
          </div>
        </div>
        <div class="ai-chat-widget-chat-input">
          <input type="text" placeholder="Type your message..." id="ai-chat-input">
          <button class="ai-chat-widget-chat-send">Send</button>
        </div>
      </div>
    `;
  }

  async function sendMessage() {
    const input = document.querySelector('#ai-chat-input');
    const sendButton = document.querySelector('.ai-chat-widget-chat-send');
    const message = input.value.trim();
    
    if (!message || sendButton.disabled) return;
    
    const messagesContainer = widgetContainer.querySelector('.ai-chat-widget-messages');
    
    sendButton.disabled = true;
    input.disabled = true;
    
    // Create temporary message ID
    const tempMessageId = 'temp_' + Date.now();
    
    // Add user message
    const userMessage = {
      id: tempMessageId,
      content: message,
      status: 'sending'
    };
    
    addMessageToChat(userMessage, true);
    
    input.value = '';
    
    try {
      const response = await fetch(`${API_BASE}/api/widget/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siteId: siteId,
          channelId: channelId,
          sessionId: sessionId,
          conversationId: conversationId,
          message: message,
          visitorInfo: leadInfo || {}
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to get response');
      }
      
      const data = await response.json();
      
      // Store conversation ID
      if (data.conversationId) {
        conversationId = data.conversationId;
        
        // Join socket room
        if (socket && isConnected) {
          socket.emit('join_conversation', { conversationId });
        }
      }
      
      // Update message status
      updateMessageStatus(tempMessageId, 'sent');
      
      // If response from API (AI mode), add it
      if (data.response && currentMode === 'ai') {
        hideTypingIndicator();
        addMessageToChat({
          id: data.messageId,
          content: data.response,
          fromName: 'AI Assistant'
        }, false);
      } else if (currentMode === 'human') {
        // Show waiting for agent message
        if (!messagesContainer.querySelector('.ai-typing-indicator')) {
          messagesContainer.innerHTML += `
            <div class="ai-chat-system-message">
              <div class="ai-chat-system-message-content">
                Agent is typing...
              </div>
            </div>
          `;
        }
      }
      
    } catch (error) {
      console.error('Chat error:', error);
      
      updateMessageStatus(tempMessageId, 'failed');
      
      messagesContainer.innerHTML += `
        <div class="ai-chat-system-message">
          <div class="ai-chat-system-message-content" style="background: #fee2e2; color: #991b1b;">
            ❌ Failed to send message. Please try again.
          </div>
        </div>
      `;
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    } finally {
      sendButton.disabled = false;
      input.disabled = false;
      input.focus();
    }
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function showArticle(article) {
    currentScreen = 'article';
    currentArticle = article;
    const content = widgetContainer.querySelector('.ai-chat-widget-content');
    content.innerHTML = `
      <div style="padding: 20px; flex: 1; overflow-y: auto;">
        <h2 style="font-size: 20px; font-weight: 600; margin-bottom: 16px;">${article.title}</h2>
        <div style="font-size: 14px; line-height: 1.6; color: #4b5563;">${article.content}</div>
      </div>
    `;
    
    widgetContainer.querySelector('.ai-chat-widget-back').style.display = 'block';
  }

  function toggleWidget() {
    if (isOpen) {
      closeWidget();
    } else {
      openWidget();
    }
  }

  function openWidget() {
    isOpen = true;
    widgetContainer.classList.remove('hidden');
    widgetButton.style.display = 'none';
    
    // Clear badge
    const badge = widgetButton.querySelector('.ai-chat-badge');
    if (badge) {
      badge.style.display = 'none';
      badge.textContent = '0';
    }
    
    // Mark messages as read
    if (socket && isConnected && conversationId) {
      socket.emit('conversation_opened', { conversationId });
    }
  }

  function closeWidget() {
    isOpen = false;
    widgetContainer.classList.add('hidden');
    widgetButton.style.display = 'flex';
  }

  function navigateToChat() {
    widgetContainer.querySelector('.ai-chat-widget-back').style.display = 'block';
    
    if (!leadInfo) {
      currentScreen = 'lead-form';
      const content = widgetContainer.querySelector('.ai-chat-widget-content');
      content.innerHTML = renderLeadForm();
      
      const form = content.querySelector('#ai-chat-lead-form');
      form.addEventListener('submit', submitLeadForm);
    } else {
      proceedToChat();
    }
  }

  function goBack() {
    currentScreen = 'home';
    const content = widgetContainer.querySelector('.ai-chat-widget-content');
    content.innerHTML = renderHomeScreen();
    
    widgetContainer.querySelector('.ai-chat-widget-back').style.display = 'none';
    attachHomeEventListeners();
  }

  function attachHomeEventListeners() {
    const startChatButtons = widgetContainer.querySelectorAll('.ai-chat-widget-start-chat');
    startChatButtons.forEach(button => {
      button.addEventListener('click', navigateToChat);
    });
    
    const articles = widgetContainer.querySelectorAll('.ai-chat-widget-article');
    articles.forEach(article => {
      article.addEventListener('click', () => {
        const articleId = article.dataset.articleId;
        if (articleId) {
          fetchArticle(articleId);
        }
      });
    });
  }

  async function init() {
    const wrapper = document.createElement('div');
    wrapper.className = 'ai-chat-widget';
    document.body.appendChild(wrapper);

    await fetchWidgetConfig();
    // await fetchKBArticles();
    
    createStyles();
    widgetButton = createWidgetButton();
    widgetContainer = createWidgetContainer();
    attachHomeEventListeners();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();