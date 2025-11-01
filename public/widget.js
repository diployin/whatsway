(function() {
  'use strict';

  // Widget configuration
  const config = window.aiChatConfig || {};
  // Get API base from script source (where widget.js was loaded from)
  const scriptSrc = document.currentScript?.src || '';
  const API_BASE = 'localhost:5000';
  // const API_BASE = scriptSrc ? new URL(scriptSrc).origin : (config.apiBase || window.location.origin);
  const siteId = config.siteId;

  if (!siteId) {
    console.error('AI Chat Widget: siteId is required');
    return;
  }

  // Widget state
  let isOpen = false;
  let currentScreen = 'home';
  let widgetConfig = {};
  let widgetContainer = null;
  let widgetButton = null;
  let kbData = null;
  let currentArticle = null;
  let leadInfo = null;
  let conversationId = null;

  // Default configuration
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
    brandName: '',  // Will be populated from tenant settings
    homeScreen: 'messenger',
    widgetStyle: 'modern',
    showPoweredBy: true,
    enableChat: true,
    enableKnowledgeBase: true,
    teamMembers: [],
    responseTime: 'A few minutes',
    
    // Messenger Layout
    messengerButtonText: 'Send us a message',
    messengerSearchPlaceholder: 'Search our Help Center',
    articlesCount: 3,
    showTeamAvatars: true,
    showRecentArticles: true,
    
    // Help Center Layout
    helpSearchPlaceholder: 'Search for answers...',
    helpCategoriesTitle: 'Browse by category',
    helpCtaText: 'Chat with us',
    helpCategories: [],
    categoriesCount: 6,
    
    // Contact Layout
    contactTitle: 'How can we help?',
    contactCtaText: 'Start a conversation',
    contactStatusMessage: 'We typically reply within a few minutes',
    showContactStatus: true,
    showQuickActions: true,
    quickActions: [],
    
    // Advanced Branding
    fontFamily: 'system',
    buttonStyle: 'solid',
    shadowIntensity: 'medium',
    animationSpeed: 'normal',
    enableSoundEffects: false
  };

  // Fetch widget configuration from API
  async function fetchWidgetConfig() {
    try {
      const response = await fetch(`${API_BASE}/api/widget/config/${siteId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        // Map feature toggles from server to widget config
        const serverConfig = data.config || {};
        if (serverConfig.featureToggles) {
          serverConfig.enableKnowledgeBase = serverConfig.featureToggles.knowledgeBase;
          serverConfig.enableChat = serverConfig.featureToggles.chat;
          serverConfig.enableVoiceCall = serverConfig.featureToggles.voiceCall;
          serverConfig.enableQuickActions = serverConfig.featureToggles.quickActions;
        }
        // Map home screen layout from server
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

  // Fetch knowledge base articles from API
  async function fetchKBArticles() {
    try {
      const response = await fetch(`${API_BASE}/api/widget/kb/${siteId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        kbData = await response.json();
      }
    } catch (error) {
      console.error('Failed to fetch KB articles:', error);
    }
  }

  // Fetch full article by ID
  async function fetchArticle(articleId) {
    try {
      const response = await fetch(`${API_BASE}/api/widget/article/${articleId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const article = await response.json();
        showArticle(article);
      }
    } catch (error) {
      console.error('Failed to fetch article:', error);
    }
  }

  // Create widget styles
  function createStyles() {
    // Get font family
    const fontImport = widgetConfig.fontFamily === 'inter' ? `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');` :
                      widgetConfig.fontFamily === 'roboto' ? `@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap');` :
                      widgetConfig.fontFamily === 'open-sans' ? `@import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700&display=swap');` : '';
    
    const fontFamily = widgetConfig.fontFamily === 'inter' ? "'Inter', sans-serif" :
                      widgetConfig.fontFamily === 'roboto' ? "'Roboto', sans-serif" :
                      widgetConfig.fontFamily === 'open-sans' ? "'Open Sans', sans-serif" :
                      "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
    
    // Get shadow intensity
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
    
    // Get animation speed
    const transitionSpeed = widgetConfig.animationSpeed === 'none' ? '0s' :
                          widgetConfig.animationSpeed === 'slow' ? '0.5s' :
                          widgetConfig.animationSpeed === 'fast' ? '0.15s' :
                          '0.3s';
    
    const transitionSpeedFast = widgetConfig.animationSpeed === 'none' ? '0s' :
                               widgetConfig.animationSpeed === 'slow' ? '0.3s' :
                               widgetConfig.animationSpeed === 'fast' ? '0.1s' :
                               '0.2s';
    
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
          ? `background: white;
             border: 3px solid ${widgetConfig.primaryColor};`
          : widgetConfig.buttonStyle === 'gradient'
          ? `background: linear-gradient(135deg, ${widgetConfig.primaryColor}, ${widgetConfig.accentColor});
             border: none;`
          : `background: ${widgetConfig.primaryColor};
             border: none;`}
        cursor: pointer;
        box-shadow: ${shadowButton};
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform ${transitionSpeedFast}, box-shadow ${transitionSpeedFast}, background ${transitionSpeedFast};
        z-index: 999998;
      }

      .ai-chat-widget-button:hover {
        transform: scale(1.05);
        box-shadow: ${shadowButtonHover};
        ${widgetConfig.buttonStyle === 'outline' 
          ? `background: ${widgetConfig.primaryColor}15;`
          : ''}
      }

      .ai-chat-widget-button.bottom-right {
        bottom: 24px;
        right: 24px;
      }

      .ai-chat-widget-button.bottom-left {
        bottom: 24px;
        left: 24px;
      }

      .ai-chat-widget-button.top-right {
        top: 24px;
        right: 24px;
      }

      .ai-chat-widget-button.top-left {
        top: 24px;
        left: 24px;
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

      .ai-chat-widget-container.bottom-right {
        bottom: 100px;
        right: 24px;
      }

      .ai-chat-widget-container.bottom-left {
        bottom: 100px;
        left: 24px;
      }

      .ai-chat-widget-container.top-right {
        top: 100px;
        right: 24px;
      }

      .ai-chat-widget-container.top-left {
        top: 100px;
        left: 24px;
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

      .ai-chat-widget-header-content {
        flex: 1;
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

      .ai-chat-widget-close {
        background: none;
        border: none;
        color: white;
        cursor: pointer;
        padding: 4px;
        opacity: 0.8;
        transition: opacity 0.2s;
      }

      .ai-chat-widget-close:hover {
        opacity: 1;
      }

      .ai-chat-widget-back {
        background: none;
        border: none;
        color: white;
        cursor: pointer;
        padding: 4px;
        opacity: 0.8;
        transition: opacity 0.2s;
      }

      .ai-chat-widget-back:hover {
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

      .ai-chat-widget-response-time strong {
        color: #334155;
        font-weight: 500;
      }

      .ai-chat-widget-start-chat {
        width: 100%;
        padding: 12px;
        ${widgetConfig.buttonStyle === 'outline' 
          ? `background: transparent;
             color: ${widgetConfig.primaryColor};
             border: 2px solid ${widgetConfig.primaryColor};`
          : widgetConfig.buttonStyle === 'gradient'
          ? `background: linear-gradient(135deg, ${widgetConfig.primaryColor}, ${widgetConfig.accentColor});
             color: white;
             border: none;`
          : `background: ${widgetConfig.primaryColor};
             color: white;
             border: none;`}
        border-radius: 8px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        transition: opacity ${transitionSpeedFast}, background ${transitionSpeedFast}, transform ${transitionSpeedFast};
      }

      .ai-chat-widget-start-chat:hover {
        opacity: 0.9;
        ${widgetConfig.buttonStyle === 'outline' 
          ? `background: ${widgetConfig.primaryColor}15;`
          : ''}
      }

      .ai-chat-widget-search {
        margin-bottom: 16px;
      }

      .ai-chat-widget-search-label {
        font-size: 14px;
        font-weight: 500;
        margin-bottom: 8px;
        display: block;
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

      .ai-chat-widget-powered {
        padding: 12px;
        text-align: center;
        border-top: 1px solid #e2e8f0;
        font-size: 11px;
        color: #94a3b8;
      }

      .ai-chat-widget-feedback {
        padding: 20px;
        border-top: 1px solid #e2e8f0;
        background: #f8fafc;
      }

      .ai-chat-widget-feedback-title {
        font-size: 14px;
        font-weight: 500;
        color: #334155;
        margin-bottom: 12px;
      }

      .ai-chat-widget-feedback-buttons {
        display: flex;
        gap: 8px;
      }

      .ai-chat-widget-feedback-btn {
        flex: 1;
        padding: 10px;
        border: 1px solid #e2e8f0;
        background: white;
        border-radius: 8px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        font-size: 14px;
        color: #64748b;
        transition: all 0.2s;
      }

      .ai-chat-widget-feedback-btn:hover {
        border-color: ${widgetConfig.primaryColor};
        color: ${widgetConfig.primaryColor};
      }

      .ai-chat-widget-feedback-btn.active {
        border-color: ${widgetConfig.primaryColor};
        background: ${widgetConfig.primaryColor};
        color: white;
      }

      .ai-chat-widget-feedback-thank-you {
        font-size: 14px;
        color: #10b981;
        text-align: center;
        padding: 12px;
      }

      .ai-chat-widget-bottom-nav {
        display: flex;
        border-top: 1px solid #e2e8f0;
        background: white;
      }

      .ai-chat-widget-bottom-nav-btn {
        flex: 1;
        padding: 12px;
        border: none;
        background: transparent;
        cursor: pointer;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
        font-size: 11px;
        color: #64748b;
        transition: color 0.2s;
      }

      .ai-chat-widget-bottom-nav-btn:hover {
        color: ${widgetConfig.primaryColor};
      }

      .ai-chat-widget-bottom-nav-btn.active {
        color: ${widgetConfig.primaryColor};
      }

      .ai-chat-widget-bottom-nav-icon {
        width: 20px;
        height: 20px;
      }

      @media (max-width: 480px) {
        .ai-chat-widget-container {
          width: calc(100vw - 32px);
          height: calc(100vh - 120px);
          max-height: 600px;
        }

        .ai-chat-widget-container.bottom-right,
        .ai-chat-widget-container.bottom-left,
        .ai-chat-widget-container.top-right,
        .ai-chat-widget-container.top-left {
          left: 16px;
          right: 16px;
          width: calc(100vw - 32px);
        }
      }
    `;
    document.head.appendChild(style);
  }

  // Create message icon SVG
  function createMessageIcon(color = 'white') {
    return `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
    </svg>`;
  }

  // Create close icon SVG
  function createCloseIcon() {
    return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>`;
  }

  // Create back icon SVG
  function createBackIcon() {
    return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <line x1="19" y1="12" x2="5" y2="12"></line>
      <polyline points="12 19 5 12 12 5"></polyline>
    </svg>`;
  }

  // Create thumbs up icon SVG
  function createThumbsUpIcon() {
    return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
    </svg>`;
  }

  // Create thumbs down icon SVG
  function createThumbsDownIcon() {
    return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"></path>
    </svg>`;
  }

  // Create book icon SVG for KB
  function createBookIcon() {
    return `<svg class="ai-chat-widget-bottom-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
    </svg>`;
  }

  // Create phone icon SVG for voice
  function createPhoneIcon() {
    return `<svg class="ai-chat-widget-bottom-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
    </svg>`;
  }

  // Create history icon SVG
  function createHistoryIcon() {
    return `<svg class="ai-chat-widget-bottom-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="23 4 23 10 17 10"></polyline>
      <polyline points="1 20 1 14 7 14"></polyline>
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
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
      <div class="ai-chat-widget-content" style="flex: 1; overflow-y: auto;">
        ${renderHomeScreen()}
      </div>
      <div class="ai-chat-widget-bottom-nav">
        <button class="ai-chat-widget-bottom-nav-btn ${currentScreen === 'chat' ? 'active' : ''}" data-nav="chat">
          ${createMessageIcon().replace('width="28" height="28"', 'class="ai-chat-widget-bottom-nav-icon"')}
          <span>Chat</span>
        </button>
        <button class="ai-chat-widget-bottom-nav-btn ${currentScreen === 'kb' ? 'active' : ''}" data-nav="kb">
          ${createBookIcon()}
          <span>Help</span>
        </button>
        <button class="ai-chat-widget-bottom-nav-btn" data-nav="voice">
          ${createPhoneIcon()}
          <span>Voice</span>
        </button>
        <button class="ai-chat-widget-bottom-nav-btn" data-nav="history">
          ${createHistoryIcon()}
          <span>History</span>
        </button>
      </div>
      ${widgetConfig.showPoweredBy ? `<div class="ai-chat-widget-powered">Powered by ${widgetConfig.brandName || widgetConfig.appName || 'AI Chat'}</div>` : ''}
    `;

    // Add event listeners
    container.querySelector('.ai-chat-widget-close').addEventListener('click', closeWidget);
    container.querySelector('.ai-chat-widget-back').addEventListener('click', goBack);

    // Add bottom nav event listeners
    const navButtons = container.querySelectorAll('.ai-chat-widget-bottom-nav-btn');
    navButtons.forEach(button => {
      button.addEventListener('click', () => handleBottomNav(button.dataset.nav));
    });

    document.body.appendChild(container);
    return container;
  }

  // Render home screen based on configuration
  function renderHomeScreen() {
    if (widgetConfig.homeScreen === 'messenger') {
      return renderMessengerHome();
    } else if (widgetConfig.homeScreen === 'help') {
      return renderHelpHome();
    } else {
      return renderContactHome();
    }
  }

  // Render messenger home screen
  function renderMessengerHome() {
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

    const buttonText = widgetConfig.messengerButtonText || 'Send us a message';
    const searchPlaceholder = widgetConfig.messengerSearchPlaceholder || 'Search our Help Center';

    return `
      <div class="ai-chat-widget-team">
        ${widgetConfig.showTeamAvatars !== false ? `<div class="ai-chat-widget-avatars">${avatars}</div>` : ''}
        <div class="ai-chat-widget-response-time">Our usual reply time: <strong>${widgetConfig.responseTime}</strong></div>
        <button class="ai-chat-widget-start-chat">
          ${createMessageIcon()}
          ${buttonText}
        </button>
      </div>
      ${widgetConfig.enableKnowledgeBase && kbData ? `
        <div class="ai-chat-widget-search">
          <label class="ai-chat-widget-search-label">Find an answer quickly</label>
          <input type="text" class="ai-chat-widget-search-input" placeholder="${searchPlaceholder}">
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

  // Render help home screen
  function renderHelpHome() {
    const searchPlaceholder = widgetConfig.helpSearchPlaceholder || 'Search for answers...';
    const categoriesTitle = widgetConfig.helpCategoriesTitle || 'Browse by category';
    const ctaText = widgetConfig.helpCtaText || 'Chat with us';
    
    // Use custom help categories if configured, otherwise fallback to KB categories
    let categoriesHtml = '';
    if (widgetConfig.helpCategories && widgetConfig.helpCategories.length > 0) {
      categoriesHtml = widgetConfig.helpCategories.map(category => {
        const iconEmoji = category.icon === 'book-open' ? '📖' :
                         category.icon === 'users' ? '👥' :
                         category.icon === 'file-text' ? '📄' :
                         category.icon === 'help-circle' ? '❓' :
                         category.icon === 'settings' ? '⚙️' :
                         category.icon === 'shield' ? '🛡️' : '📄';
        return `
          <div class="ai-chat-widget-article">
            <div class="ai-chat-widget-article-title">${iconEmoji} ${category.label}</div>
            <div class="ai-chat-widget-article-category">${category.description}</div>
          </div>
        `;
      }).join('');
    } else if (kbData && kbData.categories.length > 0) {
      const categoriesCount = widgetConfig.categoriesCount || 6;
      categoriesHtml = kbData.categories.slice(0, categoriesCount).map(category => `
        <div class="ai-chat-widget-article" data-category-id="${category.id}">
          <div class="ai-chat-widget-article-title">${category.name}</div>
          <div class="ai-chat-widget-article-category">${category.articleCount} articles</div>
        </div>
      `).join('');
    }

    return `
      <div class="ai-chat-widget-search">
        <input type="text" class="ai-chat-widget-search-input" placeholder="${searchPlaceholder}" autofocus>
      </div>
      <div class="ai-chat-widget-articles">
        <div class="ai-chat-widget-articles-title">${categoriesTitle}</div>
        ${categoriesHtml || '<p style="font-size: 14px; color: #64748b;">No categories available</p>'}
      </div>
      ${widgetConfig.enableChat ? `
        <button class="ai-chat-widget-start-chat" style="margin-top: 16px;">
          ${createMessageIcon()}
          ${ctaText}
        </button>
      ` : ''}
    `;
  }

  // Render contact home screen
  function renderContactHome() {
    const contactTitle = widgetConfig.contactTitle || 'How can we help?';
    const ctaText = widgetConfig.contactCtaText || 'Start a conversation';
    const statusMessage = widgetConfig.contactStatusMessage || 'We typically reply within a few minutes';
    const showStatus = widgetConfig.showContactStatus !== false;
    
    // Generate quick actions HTML if enabled
    let quickActionsHtml = '';
    if (widgetConfig.showQuickActions && widgetConfig.quickActions && widgetConfig.quickActions.length > 0) {
      const activeQuickActions = widgetConfig.quickActions.filter(action => action.enabled);
      if (activeQuickActions.length > 0) {
        const actionsHTML = activeQuickActions.map(action => {
          const iconEmoji = action.icon === 'calendar' ? '📅' :
                           action.icon === 'play' ? '▶️' :
                           action.icon === 'book' ? '📚' :
                           action.icon === 'phone' ? '📞' :
                           action.icon === 'mail' ? '✉️' :
                           action.icon === 'users' ? '👥' : '📄';
          const description = action.description || 'Get started quickly';
          return `
            <div class="ai-chat-widget-article ai-chat-widget-quick-action" data-action-url="${action.url || '#'}">
              <div class="ai-chat-widget-article-title">${iconEmoji} ${action.label}</div>
              <div class="ai-chat-widget-article-category">${description}</div>
            </div>
          `;
        }).join('');
        
        quickActionsHtml = `
          <div class="ai-chat-widget-articles">
            ${actionsHTML}
          </div>
        `;
      }
    }
    
    return `
      <div class="ai-chat-widget-team">
        <div class="ai-chat-widget-contact-header">
          <div class="ai-chat-widget-articles-title">${contactTitle}</div>
          ${showStatus ? `<div class="ai-chat-widget-response-time">${statusMessage}</div>` : ''}
        </div>
      </div>
      ${quickActionsHtml}
      ${widgetConfig.enableChat ? `
        <button class="ai-chat-widget-start-chat" style="margin-top: 16px;">
          ${createMessageIcon()}
          ${ctaText}
        </button>
      ` : ''}
    `;
  }

  // Render lead form screen
  function renderLeadForm() {
    return `
      <div class="ai-chat-widget-lead-form">
        <h3 style="font-size: 18px; font-weight: 600; margin-bottom: 8px; color: ${widgetConfig.textColor};">Welcome!</h3>
        <p style="font-size: 14px; margin-bottom: 20px; color: #64748b;">Please share your details so we can assist you better.</p>
        <form id="ai-chat-lead-form">
          <div style="margin-bottom: 16px;">
            <label style="display: block; font-size: 13px; font-weight: 500; margin-bottom: 6px; color: ${widgetConfig.textColor};">Name *</label>
            <input type="text" id="lead-name" required style="width: 100%; padding: 10px 12px; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 14px;" placeholder="John Doe">
          </div>
          <div style="margin-bottom: 16px;">
            <label style="display: block; font-size: 13px; font-weight: 500; margin-bottom: 6px; color: ${widgetConfig.textColor};">Email *</label>
            <input type="email" id="lead-email" required style="width: 100%; padding: 10px 12px; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 14px;" placeholder="john@example.com">
          </div>
          <div style="margin-bottom: 20px;">
            <label style="display: block; font-size: 13px; font-weight: 500; margin-bottom: 6px; color: ${widgetConfig.textColor};">Mobile Number *</label>
            <input type="tel" id="lead-mobile" required style="width: 100%; padding: 10px 12px; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 14px;" placeholder="+1 234 567 8900">
          </div>
          <button type="submit" style="width: 100%; padding: 12px; background-color: ${widgetConfig.primaryColor}; color: white; border: none; border-radius: 6px; font-size: 14px; font-weight: 600; cursor: pointer;">
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
    
    if (!name || !email || !mobile) {
      return;
    }
    
    leadInfo = { name, email, mobile };
    
    try {
      // Save lead to API
      const response = await fetch(`${API_BASE}/api/widget/leads`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          siteId: siteId,
          name: name,
          email: email,
          phone: mobile,
          source: 'chat_widget'
        })
      });
      
      // Always proceed to chat, even if API fails
      proceedToChat();
    } catch (error) {
      console.error('Failed to save lead:', error);
      // Still allow chat even if lead save fails
      proceedToChat();
    }
  }

  // Render voice lead form screen
  function renderVoiceLeadForm() {
    return `
      <div class="ai-chat-widget-lead-form">
        <div style="margin-bottom: 20px; text-align: center;">
          ${createPhoneIcon()}
        </div>
        <h3 style="font-size: 18px; font-weight: 600; margin-bottom: 8px; color: ${widgetConfig.textColor};">Start Voice Call</h3>
        <p style="font-size: 14px; margin-bottom: 20px; color: #64748b;">Please share your details so we can connect you.</p>
        <form id="ai-chat-voice-lead-form">
          <div style="margin-bottom: 16px;">
            <label style="display: block; font-size: 13px; font-weight: 500; margin-bottom: 6px; color: ${widgetConfig.textColor};">Name *</label>
            <input type="text" id="voice-lead-name" required style="width: 100%; padding: 10px 12px; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 14px;" placeholder="John Doe">
          </div>
          <div style="margin-bottom: 16px;">
            <label style="display: block; font-size: 13px; font-weight: 500; margin-bottom: 6px; color: ${widgetConfig.textColor};">Email *</label>
            <input type="email" id="voice-lead-email" required style="width: 100%; padding: 10px 12px; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 14px;" placeholder="john@example.com">
          </div>
          <div style="margin-bottom: 20px;">
            <label style="display: block; font-size: 13px; font-weight: 500; margin-bottom: 6px; color: ${widgetConfig.textColor};">Mobile Number *</label>
            <input type="tel" id="voice-lead-mobile" required style="width: 100%; padding: 10px 12px; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 14px;" placeholder="+1 234 567 8900">
          </div>
          <button type="submit" style="width: 100%; padding: 12px; background-color: ${widgetConfig.primaryColor}; color: white; border: none; border-radius: 6px; font-size: 14px; font-weight: 600; cursor: pointer;">
            Start Voice Call
          </button>
        </form>
      </div>
    `;
  }

  // Submit voice lead form
  async function submitVoiceLeadForm(event) {
    event.preventDefault();
    
    const name = document.getElementById('voice-lead-name').value.trim();
    const email = document.getElementById('voice-lead-email').value.trim();
    const mobile = document.getElementById('voice-lead-mobile').value.trim();
    
    if (!name || !email || !mobile) {
      return;
    }
    
    leadInfo = { name, email, mobile };
    
    try {
      // Save lead to API
      await fetch(`${API_BASE}/api/widget/leads`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          siteId: siteId,
          name: name,
          email: email,
          phone: mobile,
          source: 'voice_widget'
        })
      });
      
      // Always start voice call, even if API fails
      startVoiceCall();
    } catch (error) {
      console.error('Failed to save lead:', error);
      // Still start voice call even if lead save fails
      startVoiceCall();
    }
  }

  // Start voice call with ElevenLabs
  async function startVoiceCall() {
    currentScreen = 'voice-call';
    const content = widgetContainer.querySelector('.ai-chat-widget-content');
    
    content.innerHTML = `
      <div class="ai-chat-widget-voice-call" style="padding: 40px; text-align: center;">
        <div style="margin-bottom: 24px;">
          <div id="voice-status-icon" style="width: 80px; height: 80px; margin: 0 auto; background: ${widgetConfig.primaryColor}; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
            ${createPhoneIcon()}
          </div>
        </div>
        <h3 style="font-size: 20px; font-weight: 600; margin-bottom: 8px; color: ${widgetConfig.textColor};">Connecting...</h3>
        <p id="voice-status-text" style="font-size: 14px; color: #64748b; margin-bottom: 32px;">Please wait while we connect you</p>
        <div id="voice-controls" style="display: none;">
          <button id="voice-mute-btn" style="padding: 12px 24px; margin: 0 8px; background: #64748b; color: white; border: none; border-radius: 6px; cursor: pointer;">
            Mute
          </button>
          <button id="voice-end-btn" style="padding: 12px 24px; margin: 0 8px; background: #dc2626; color: white; border: none; border-radius: 6px; cursor: pointer;">
            End Call
          </button>
        </div>
      </div>
    `;
    
    widgetContainer.querySelector('.ai-chat-widget-back').style.display = 'block';
    
    // Initialize voice call
    try {
      const response = await fetch(`${API_BASE}/api/widget/voice/init`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          siteId: siteId,
          visitorName: leadInfo.name
        })
      });
      
      const data = await response.json();
      
      if (data.signedUrl) {
        // Connect to ElevenLabs Conversational AI
        await initializeElevenLabsCall(data.signedUrl);
      } else {
        throw new Error('No voice call URL received');
      }
    } catch (error) {
      console.error('Voice call initialization failed:', error);
      const statusText = content.querySelector('#voice-status-text');
      statusText.textContent = 'Voice call is currently unavailable. Please try chat instead.';
      statusText.style.color = '#dc2626';
      
      setTimeout(() => {
        navigateToChat();
      }, 3000);
    }
  }

  // Initialize ElevenLabs Conversational AI call
  async function initializeElevenLabsCall(signedUrl) {
    const content = widgetContainer.querySelector('.ai-chat-widget-content');
    const statusText = content.querySelector('#voice-status-text');
    const controls = content.querySelector('#voice-controls');
    
    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Connect to ElevenLabs WebSocket
      const ws = new WebSocket(signedUrl);
      
      ws.onopen = () => {
        statusText.textContent = `Connected! Speaking with AI Assistant`;
        controls.style.display = 'block';
        
        // Set up audio streaming (simplified - real implementation needs more audio handling)
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0 && ws.readyState === WebSocket.OPEN) {
            ws.send(event.data);
          }
        };
        mediaRecorder.start(100); // Send audio chunks every 100ms
        
        // Handle incoming audio
        ws.onmessage = (event) => {
          // Play received audio (simplified)
          if (event.data instanceof Blob) {
            const audioUrl = URL.createObjectURL(event.data);
            const audio = new Audio(audioUrl);
            audio.play();
          }
        };
        
        // Mute button
        content.querySelector('#voice-mute-btn').addEventListener('click', function() {
          const audioTrack = stream.getAudioTracks()[0];
          audioTrack.enabled = !audioTrack.enabled;
          this.textContent = audioTrack.enabled ? 'Mute' : 'Unmute';
        });
        
        // End call button
        content.querySelector('#voice-end-btn').addEventListener('click', () => {
          ws.close();
          stream.getTracks().forEach(track => track.stop());
          goBack();
        });
      };
      
      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        statusText.textContent = 'Connection error. Please try again.';
        statusText.style.color = '#dc2626';
      };
      
      ws.onclose = () => {
        stream.getTracks().forEach(track => track.stop());
      };
      
    } catch (error) {
      console.error('Microphone access denied:', error);
      statusText.textContent = 'Microphone access is required for voice calls.';
      statusText.style.color = '#dc2626';
    }
  }

  // Proceed to chat after lead form
  function proceedToChat() {
    currentScreen = 'chat';
    const content = widgetContainer.querySelector('.ai-chat-widget-content');
    content.innerHTML = renderChatScreen();
    
    // Ensure back button is visible
    widgetContainer.querySelector('.ai-chat-widget-back').style.display = 'block';
    
    // Add event listener for chat
    const sendButton = content.querySelector('.ai-chat-widget-chat-send');
    const input = content.querySelector('#ai-chat-input');
    
    sendButton.addEventListener('click', sendMessage);
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') sendMessage();
    });
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

  // Toggle widget visibility
  function toggleWidget() {
    if (isOpen) {
      closeWidget();
    } else {
      openWidget();
    }
  }

  // Open widget
  function openWidget() {
    isOpen = true;
    widgetContainer.classList.remove('hidden');
    widgetButton.style.display = 'none';
  }

  // Close widget
  function closeWidget() {
    isOpen = false;
    widgetContainer.classList.add('hidden');
    widgetButton.style.display = 'flex';
  }

  // Navigate to chat screen
  function navigateToChat() {
    // Show back button
    widgetContainer.querySelector('.ai-chat-widget-back').style.display = 'block';
    
    // If lead info not collected, show lead form first
    if (!leadInfo) {
      currentScreen = 'lead-form';
      const content = widgetContainer.querySelector('.ai-chat-widget-content');
      content.innerHTML = renderLeadForm();
      
      // Add event listener for form submission
      const form = content.querySelector('#ai-chat-lead-form');
      form.addEventListener('submit', submitLeadForm);
    } else {
      // Lead info already collected, go straight to chat
      proceedToChat();
    }
  }

  // Navigate to voice call screen
  function navigateToVoice() {
    // Show back button
    widgetContainer.querySelector('.ai-chat-widget-back').style.display = 'block';
    
    // If lead info not collected, show lead form first
    if (!leadInfo) {
      currentScreen = 'voice-lead-form';
      const content = widgetContainer.querySelector('.ai-chat-widget-content');
      content.innerHTML = renderVoiceLeadForm();
      
      // Add event listener for form submission
      const form = content.querySelector('#ai-chat-voice-lead-form');
      form.addEventListener('submit', submitVoiceLeadForm);
    } else {
      // Lead info already collected, start voice call directly
      startVoiceCall();
    }
  }

  // Go back to home screen
  function goBack() {
    currentScreen = 'home';
    const content = widgetContainer.querySelector('.ai-chat-widget-content');
    content.innerHTML = renderHomeScreen();
    
    // Hide back button
    widgetContainer.querySelector('.ai-chat-widget-back').style.display = 'none';
    
    // Re-attach event listeners
    attachHomeEventListeners();
  }

  // Send chat message
  async function sendMessage() {
    const input = document.querySelector('#ai-chat-input');
    const message = input.value.trim();
    
    if (!message) return;
    
    const messagesContainer = widgetContainer.querySelector('.ai-chat-widget-messages');
    
    // Add user message
    messagesContainer.innerHTML += `
      <div class="ai-chat-widget-message user">
        <div class="ai-chat-widget-message-content">${message}</div>
      </div>
    `;
    
    // Clear input
    input.value = '';
    
    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    // Add typing indicator
    messagesContainer.innerHTML += `
      <div class="ai-chat-widget-message bot ai-typing-indicator">
        <div class="ai-chat-widget-message-avatar">AI</div>
        <div class="ai-chat-widget-message-content">
          <div class="ai-typing-dots">
            <span></span><span></span><span></span>
          </div>
        </div>
      </div>
    `;
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    try {
      // Send message to backend
      const response = await fetch(`${API_BASE}/api/widget/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siteId: widgetConfig.siteId,
          sessionId,
          content: message,
          visitorInfo: leadInfo || {}
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to get response');
      }
      
      const data = await response.json();
      
      // Remove typing indicator
      const typingIndicator = messagesContainer.querySelector('.ai-typing-indicator');
      if (typingIndicator) {
        typingIndicator.remove();
      }
      
      // Add AI response
      messagesContainer.innerHTML += `
        <div class="ai-chat-widget-message bot">
          <div class="ai-chat-widget-message-avatar">AI</div>
          <div class="ai-chat-widget-message-content">${data.content}</div>
        </div>
      `;
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    } catch (error) {
      console.error('Chat error:', error.message || error);
      
      // Remove typing indicator
      const typingIndicator = messagesContainer.querySelector('.ai-typing-indicator');
      if (typingIndicator) {
        typingIndicator.remove();
      }
      
      // Show error message
      messagesContainer.innerHTML += `
        <div class="ai-chat-widget-message bot">
          <div class="ai-chat-widget-message-avatar">AI</div>
          <div class="ai-chat-widget-message-content">Sorry, I'm having trouble responding right now. Please try again.</div>
        </div>
      `;
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  }

  // Show full article
  function showArticle(article) {
    currentScreen = 'article';
    currentArticle = article;
    const content = widgetContainer.querySelector('.ai-chat-widget-content');
    content.innerHTML = `
      <div style="padding: 20px; flex: 1; overflow-y: auto;">
        <h2 style="font-size: 20px; font-weight: 600; margin-bottom: 16px; color: #1f2937;">${article.title}</h2>
        <div style="font-size: 14px; line-height: 1.6; color: #4b5563;">${article.content}</div>
      </div>
      <div class="ai-chat-widget-feedback" id="article-feedback">
        <div class="ai-chat-widget-feedback-title">Was this article helpful?</div>
        <div class="ai-chat-widget-feedback-buttons">
          <button class="ai-chat-widget-feedback-btn" data-feedback="helpful">
            ${createThumbsUpIcon()}
            Yes, helpful
          </button>
          <button class="ai-chat-widget-feedback-btn" data-feedback="not_helpful">
            ${createThumbsDownIcon()}
            No, not helpful
          </button>
        </div>
      </div>
    `;
    
    // Show back button
    widgetContainer.querySelector('.ai-chat-widget-back').style.display = 'block';
    
    // Attach feedback button listeners
    const feedbackButtons = content.querySelectorAll('.ai-chat-widget-feedback-btn');
    feedbackButtons.forEach(button => {
      button.addEventListener('click', () => sendFeedback(button.dataset.feedback));
    });
  }

  // Send article feedback
  async function sendFeedback(feedbackType) {
    if (!currentArticle) return;
    
    const isHelpful = feedbackType === 'helpful';
    
    try {
      await fetch(`${API_BASE}/api/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          articleId: currentArticle.id,
          isHelpful,
          siteId
        })
      });
      
      // Show thank you message
      const feedbackDiv = widgetContainer.querySelector('#article-feedback');
      if (feedbackDiv) {
        feedbackDiv.innerHTML = `
          <div class="ai-chat-widget-feedback-thank-you">
            ✓ Thank you for your feedback!
          </div>
        `;
      }
    } catch (error) {
      console.error('Failed to send feedback:', error);
    }
  }

  // Handle bottom navigation
  function handleBottomNav(navType) {
    // Update active state
    const navButtons = widgetContainer.querySelectorAll('.ai-chat-widget-bottom-nav-btn');
    navButtons.forEach(btn => {
      btn.classList.remove('active');
      if (btn.dataset.nav === navType) {
        btn.classList.add('active');
      }
    });

    const content = widgetContainer.querySelector('.ai-chat-widget-content');
    
    switch (navType) {
      case 'chat':
        navigateToChat();
        break;
      case 'kb':
        currentScreen = 'kb';
        content.innerHTML = renderHelpHome();
        attachHomeEventListeners();
        widgetContainer.querySelector('.ai-chat-widget-back').style.display = 'none';
        break;
      case 'voice':
        navigateToVoice();
        break;
      case 'history':
        currentScreen = 'history';
        content.innerHTML = `
          <div style="padding: 40px; text-align: center;">
            <div style="margin-bottom: 20px;">${createHistoryIcon()}</div>
            <h3 style="font-size: 18px; font-weight: 600; margin-bottom: 12px; color: #1f2937;">Chat History</h3>
            <p style="font-size: 14px; color: #64748b;">Your previous conversations will appear here</p>
          </div>
        `;
        widgetContainer.querySelector('.ai-chat-widget-back').style.display = 'none';
        break;
    }
  }

  // Attach event listeners to home screen elements
  function attachHomeEventListeners() {
    const startChatButtons = widgetContainer.querySelectorAll('.ai-chat-widget-start-chat');
    startChatButtons.forEach(button => {
      button.addEventListener('click', navigateToChat);
    });
    
    const searchInput = widgetContainer.querySelector('.ai-chat-widget-search-input');
    if (searchInput) {
      searchInput.addEventListener('click', () => {
        // Could navigate to search screen
        console.log('Search clicked');
      });
    }
    
    const articles = widgetContainer.querySelectorAll('.ai-chat-widget-article');
    articles.forEach(article => {
      article.addEventListener('click', () => {
        const articleId = article.dataset.articleId;
        if (articleId) {
          fetchArticle(articleId);
        }
      });
    });
    
    // Add quick action click handlers
    const quickActions = widgetContainer.querySelectorAll('.ai-chat-widget-quick-action');
    quickActions.forEach(action => {
      action.addEventListener('click', () => {
        const actionUrl = action.dataset.actionUrl;
        if (actionUrl && actionUrl !== '#') {
          window.open(actionUrl, '_blank');
        }
      });
    });
  }

  // Initialize widget
  async function init() {
    // Create wrapper div
    const wrapper = document.createElement('div');
    wrapper.className = 'ai-chat-widget';
    document.body.appendChild(wrapper);

    // Fetch configuration and KB articles
    await fetchWidgetConfig();
    await fetchKBArticles();
    
    // Create styles
    createStyles();
    
    // Create widget elements
    widgetButton = createWidgetButton();
    widgetContainer = createWidgetContainer();
    
    // Attach initial event listeners
    attachHomeEventListeners();
  }

  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();