// ============================================
// ENHANCED WIDGET.JS - With Support User Chat
// ============================================

(function() {
  'use strict';

  const config = window.aiChatConfig || {};
  const API_BASE = config.url || 'http://localhost:5000';
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
  let pollInterval = null;
  let lastMessageId = null;
  let assignedAgent = null;
  let chatMode = 'bot'; // 'bot' or 'human'

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

  // Generate unique session ID
  function generateSessionId() {
    return 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // Fetch widget configuration
  async function fetchWidgetConfig() {
    try {
      const response = await fetch(`${API_BASE}/api/widget/config/${siteId}`);
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
      console.error('Failed to fetch widget config:', error);
      widgetConfig = { ...defaultConfig, ...config, siteId };
    }
  }

  // Fetch knowledge base articles
  async function fetchKBArticles() {
    try {
      const response = await fetch(`${API_BASE}/api/widget/kb/${siteId}`);
      if (response.ok) {
        kbData = await response.json();
      }
    } catch (error) {
      console.error('Failed to fetch KB articles:', error);
    }
  }

  // Fetch full article
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

  // Poll for new messages from support agents
  async function pollMessages() {
    if (!conversationId) return;
    
    try {
      const response = await fetch(
        `${API_BASE}/api/widget/messages/${conversationId}?lastMessageId=${lastMessageId || ''}`
      );
      
      if (response.ok) {
        const data = await response.json();
        
        // Update assigned agent info
        if (data.assignedAgent) {
          assignedAgent = data.assignedAgent;
          chatMode = 'human';
          updateChatHeader();
        }
        
        // Add new messages
        if (data.messages && data.messages.length > 0) {
          const messagesContainer = widgetContainer.querySelector('.ai-chat-widget-messages');
          if (messagesContainer) {
            data.messages.forEach(msg => {
              if (msg.id !== lastMessageId) {
                addMessageToUI(msg);
                lastMessageId = msg.id;
              }
            });
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
          }
        }
      }
    } catch (error) {
      console.error('Failed to poll messages:', error);
    }
  }

  // Add message to UI
  function addMessageToUI(message) {
    const messagesContainer = widgetContainer.querySelector('.ai-chat-widget-messages');
    if (!messagesContainer) return;
    
    const isUser = message.fromUser || message.direction === 'inbound';
    const messageClass = isUser ? 'user' : 'bot';
    
    // Determine avatar and name
    let avatarContent = 'AI';
    let senderName = '';
    
    if (!isUser) {
      if (message.fromType === 'agent' && assignedAgent) {
        avatarContent = assignedAgent.name.substring(0, 2).toUpperCase();
        senderName = assignedAgent.name;
      } else {
        avatarContent = 'AI';
        senderName = 'AI Assistant';
      }
    }
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `ai-chat-widget-message ${messageClass}`;
    messageDiv.setAttribute('data-message-id', message.id);
    
    if (isUser) {
      messageDiv.innerHTML = `
        <div class="ai-chat-widget-message-content">${escapeHtml(message.content)}</div>
      `;
    } else {
      messageDiv.innerHTML = `
        <div class="ai-chat-widget-message-avatar">${avatarContent}</div>
        <div class="ai-chat-widget-message-wrapper">
          ${senderName ? `<div class="ai-chat-widget-message-sender">${senderName}</div>` : ''}
          <div class="ai-chat-widget-message-content">${escapeHtml(message.content)}</div>
        </div>
      `;
    }
    
    messagesContainer.appendChild(messageDiv);
  }

  // Update chat header when agent joins
  function updateChatHeader() {
    const headerContent = widgetContainer.querySelector('.ai-chat-widget-header-content');
    if (!headerContent) return;
    
    if (chatMode === 'human' && assignedAgent) {
      headerContent.innerHTML = `
        ${widgetConfig.appName ? `<div class="ai-chat-widget-app-name">${widgetConfig.appName}</div>` : ''}
        <div class="ai-chat-widget-title">Chat with ${assignedAgent.name}</div>
        <div class="ai-chat-widget-subtitle">
          <span class="ai-chat-widget-online-indicator"></span>
          Online
        </div>
      `;
    } else {
      headerContent.innerHTML = `
        ${widgetConfig.appName ? `<div class="ai-chat-widget-app-name">${widgetConfig.appName}</div>` : ''}
        <div class="ai-chat-widget-title">${widgetConfig.title}</div>
        <div class="ai-chat-widget-subtitle">${widgetConfig.subtitle}</div>
      `;
    }
  }

  // Create styles
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
        display: flex;
        align-items: center;
        gap: 6px;
      }

      .ai-chat-widget-online-indicator {
        width: 8px;
        height: 8px;
        background: #10b981;
        border-radius: 50%;
        display: inline-block;
        animation: pulse 2s infinite;
      }

      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
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

      .ai-chat-widget-message-wrapper {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .ai-chat-widget-message-sender {
        font-size: 11px;
        font-weight: 500;
        color: #64748b;
        padding-left: 4px;
      }

      .ai-chat-widget-message-content {
        max-width: 70%;
        padding: 10px 14px;
        border-radius: 12px;
        font-size: 14px;
        line-height: 1.4;
      }

      .ai-chat-widget-message.bot .ai-chat-widget-message-content {
        background: #f1f5f9;
        color: #334155;
      }

      .ai-chat-widget-message.user .ai-chat-widget-message-content {
        background: ${widgetConfig.primaryColor};
        color: white;
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

  // SVG Icons
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

  // Create widget button
  function createWidgetButton() {
    const button = document.createElement('button');
    button.className = `ai-chat-widget-button ${widgetConfig.position}`;
    const iconColor = widgetConfig.buttonStyle === 'outline' ? widgetConfig.primaryColor : 'white';
    button.innerHTML = createMessageIcon(iconColor);
    button.addEventListener('click', toggleWidget);
    document.body.appendChild(button);
    return button;
  }

  // Create widget container
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
          </div>
          <button class="ai-chat-widget-close">${createCloseIcon()}</button>
        </div>
      </div>
      <div class="ai-chat-widget-content">
        ${renderHomeScreen()}
      </div>
      ${widgetConfig.showPoweredBy ? `<div class="ai-chat-widget-powered">Powered by ${widgetConfig.brandName || widgetConfig.appName || 'AI Chat'}</div>` : ''}
    `;

    container.querySelector('.ai-chat-widget-close').addEventListener('click', closeWidget);
    container.querySelector('.ai-chat-widget-back').addEventListener('click', goBack);

    document.body.appendChild(container);
    return container;
  }

  // Render home screen
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

  // Render lead form
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
      </div>
    `;
  }

  // Submit lead form
  async function submitLeadForm(event) {
    event.preventDefault();
    
    const name = document.getElementById('lead-name').value.trim();
    const email = document.getElementById('lead-email').value.trim();
    const mobile = document.getElementById('lead-mobile').value.trim();
    
    if (!name || !email || !mobile) return;
    
    leadInfo = { name, email, mobile };
    
    try {
      await fetch(`${API_BASE}/api/widget/contacts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siteId: siteId,
          name: name,
          email: email,
          phone: mobile,
          source: 'chat_widget'
        })
      });
    } catch (error) {
      console.error('Failed to save lead:', error);
    }
    
    proceedToChat();
  }

  // Proceed to chat
  function proceedToChat() {
    currentScreen = 'chat';
    const content = widgetContainer.querySelector('.ai-chat-widget-content');
    content.innerHTML = renderChatScreen();
    
    widgetContainer.querySelector('.ai-chat-widget-back').style.display = 'block';
    
    const sendButton = content.querySelector('.ai-chat-widget-chat-send');
    const input = content.querySelector('#ai-chat-input');
    
    sendButton.addEventListener('click', sendMessage);
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !sendButton.disabled) sendMessage();
    });
    
    // Start polling for messages from support agents
    startPolling();
  }

  // Render chat screen
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

  // Start polling for new messages
  function startPolling() {
    if (pollInterval) {
      clearInterval(pollInterval);
    }
    // Poll every 2 seconds
    pollInterval = setInterval(pollMessages, 2000);
  }

  // Stop polling
  function stopPolling() {
    if (pollInterval) {
      clearInterval(pollInterval);
      pollInterval = null;
    }
  }

  // Send message
  async function sendMessage() {
    const input = document.querySelector('#ai-chat-input');
    const sendButton = document.querySelector('.ai-chat-widget-chat-send');
    const message = input.value.trim();
    
    if (!message || sendButton.disabled) return;
    
    const messagesContainer = widgetContainer.querySelector('.ai-chat-widget-messages');
    
    // Disable input during processing
    sendButton.disabled = true;
    input.disabled = true;
    
    // Add user message
    const userMessageDiv = document.createElement('div');
    userMessageDiv.className = 'ai-chat-widget-message user';
    userMessageDiv.innerHTML = `
      <div class="ai-chat-widget-message-content">${escapeHtml(message)}</div>
    `;
    messagesContainer.appendChild(userMessageDiv);
    
    input.value = '';
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    // Add typing indicator
    const typingDiv = document.createElement('div');
    typingDiv.className = 'ai-chat-widget-message bot ai-typing-indicator';
    typingDiv.innerHTML = `
      <div class="ai-chat-widget-message-avatar">${chatMode === 'human' && assignedAgent ? assignedAgent.name.substring(0, 2).toUpperCase() : 'AI'}</div>
      <div class="ai-chat-widget-message-content">
        <div class="ai-typing-dots">
          <span></span><span></span><span></span>
        </div>
      </div>
    `;
    messagesContainer.appendChild(typingDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
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
      
      // Store conversation ID for subsequent messages
      if (data.conversationId) {
        conversationId = data.conversationId;
      }
      
      // Update assigned agent if changed
      if (data.assignedAgent) {
        assignedAgent = data.assignedAgent;
        chatMode = 'human';
        updateChatHeader();
      }
      
      // Remove typing indicator
      typingDiv.remove();
      
      // Add AI/Agent response
      const responseMessage = {
        id: data.messageId || Date.now().toString(),
        content: data.response,
        fromUser: false,
        fromType: data.fromType || 'bot'
      };
      addMessageToUI(responseMessage);
      lastMessageId = responseMessage.id;
      
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    } catch (error) {
      console.error('Chat error:', error);
      
      typingDiv.remove();
      
      const errorDiv = document.createElement('div');
      errorDiv.className = 'ai-chat-widget-message bot';
      errorDiv.innerHTML = `
        <div class="ai-chat-widget-message-avatar">AI</div>
        <div class="ai-chat-widget-message-content">Sorry, I'm having trouble responding right now. Please try again.</div>
      `;
      messagesContainer.appendChild(errorDiv);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    } finally {
      // Re-enable input
      sendButton.disabled = false;
      input.disabled = false;
      input.focus();
    }
  }

  // Show article
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

  // Toggle widget
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
  }

  function closeWidget() {
    isOpen = false;
    widgetContainer.classList.add('hidden');
    widgetButton.style.display = 'flex';
    
    // Stop polling when widget is closed
    stopPolling();
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
    
    // Stop polling when leaving chat
    stopPolling();
  }

  // Attach event listeners for home screen buttons and articles
  function attachHomeEventListeners() {
    // Start chat button(s)
    const startChatButtons = widgetContainer.querySelectorAll('.ai-chat-widget-start-chat');
    startChatButtons.forEach(button => {
      button.addEventListener('click', navigateToChat);
    });

    // Knowledge base search
    const searchInput = widgetContainer.querySelector('.ai-chat-widget-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        const articles = widgetContainer.querySelectorAll('.ai-chat-widget-article');
        articles.forEach(article => {
          const title = article.querySelector('.ai-chat-widget-article-title').textContent.toLowerCase();
          article.style.display = title.includes(term) ? 'block' : 'none';
        });
      });
    }

    // Article click navigation
    const articleElements = widgetContainer.querySelectorAll('.ai-chat-widget-article');
    articleElements.forEach(articleEl => {
      articleEl.addEventListener('click', () => {
        const articleId = articleEl.getAttribute('data-article-id');
        if (articleId) {
          fetchArticle(articleId);
        }
      });
    });
  }

  // Escape HTML to prevent XSS
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Initialize widget
  async function initWidget() {
    await fetchWidgetConfig();
    await fetchKBArticles();
    createStyles();

    widgetButton = createWidgetButton();
    widgetContainer = createWidgetContainer();

    attachHomeEventListeners();
  }

  // Run initialization when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWidget);
  } else {
    initWidget();
  }
})();