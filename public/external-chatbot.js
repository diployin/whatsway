// ============================================
// CHATBOT EMBED WIDGET (public/vendor/chatbot/js/external-chatbot.js)
// ============================================

(function () {
  "use strict";

  // Get script attributes
  const currentScript = document.currentScript;
  const chatbotUuid = currentScript.getAttribute("data-chatbot-uuid");
  const iframeWidth = currentScript.getAttribute("data-iframe-width") || "420";
  const iframeHeight =
    currentScript.getAttribute("data-iframe-height") || "745";
  const language = currentScript.getAttribute("data-language") || "en";
  const apiUrl =
    currentScript.getAttribute("data-api-url") || "http://localhost:5000/api";

  if (!chatbotUuid) {
    console.error("Chatbot UUID is required");
    return;
  }

  // Generate unique session ID
  const sessionId = generateSessionId();

  // Fetch chatbot configuration
  let chatbotConfig = null;

  async function fetchChatbotConfig() {
    try {
      const response = await fetch(`${apiUrl}/chatbots/uuid/${chatbotUuid}`);
      const data = await response.json();
      if (data.success) {
        chatbotConfig = data.data;
        initializeChatbot();
      }
    } catch (error) {
      console.error("Failed to fetch chatbot config:", error);
    }
  }

  function generateSessionId() {
    return (
      "session_" + Math.random().toString(36).substr(2, 9) + "_" + Date.now()
    );
  }

  function initializeChatbot() {
    if (!chatbotConfig) return;

    // Create chatbot container
    const container = document.createElement("div");
    container.id = "chatbot-widget-container";
    container.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 999999;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      `;

    // Create chatbot bubble button
    const bubble = document.createElement("button");
    bubble.id = "chatbot-bubble";
    bubble.style.cssText = `
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background: ${chatbotConfig.primaryColor || "#3B82F6"};
        border: none;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.2s, box-shadow 0.2s;
      `;

    bubble.innerHTML = `
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
      `;

    bubble.addEventListener("mouseover", () => {
      bubble.style.transform = "scale(1.1)";
      bubble.style.boxShadow = "0 6px 20px rgba(0, 0, 0, 0.2)";
    });

    bubble.addEventListener("mouseout", () => {
      bubble.style.transform = "scale(1)";
      bubble.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.15)";
    });

    // Create chatbot window
    const chatWindow = document.createElement("div");
    chatWindow.id = "chatbot-window";
    chatWindow.style.cssText = `
        position: absolute;
        bottom: 80px;
        right: 0;
        width: ${iframeWidth}px;
        height: ${iframeHeight}px;
        background: white;
        border-radius: 16px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
        display: none;
        flex-direction: column;
        overflow: hidden;
        animation: slideUp 0.3s ease-out;
      `;

    // Create chat header
    const chatHeader = document.createElement("div");
    chatHeader.style.cssText = `
        background: ${chatbotConfig.primaryColor || "#3B82F6"};
        color: white;
        padding: 16px;
        display: flex;
        align-items: center;
        justify-content: space-between;
      `;

    const headerContent = document.createElement("div");
    headerContent.style.cssText =
      "display: flex; align-items: center; gap: 12px;";

    const avatar = document.createElement("div");
    avatar.style.cssText = `
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: ${chatbotConfig.avatarColor || "#3B82F6"};
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
      `;

    if (chatbotConfig.logoUrl) {
      avatar.innerHTML = `<img src="${chatbotConfig.logoUrl}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;" />`;
    } else {
      avatar.textContent = chatbotConfig.avatarEmoji || "🤖";
    }

    const title = document.createElement("span");
    title.style.cssText = "font-weight: 600; font-size: 16px;";
    title.textContent = chatbotConfig.title || "Chatbot";

    headerContent.appendChild(avatar);
    headerContent.appendChild(title);

    const closeBtn = document.createElement("button");
    closeBtn.style.cssText = `
        background: transparent;
        border: none;
        color: white;
        cursor: pointer;
        padding: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
      `;
    closeBtn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      `;
    closeBtn.addEventListener("click", () => {
      chatWindow.style.display = "none";
      bubble.style.display = "flex";
    });

    chatHeader.appendChild(headerContent);
    chatHeader.appendChild(closeBtn);

    // Create messages container
    const messagesContainer = document.createElement("div");
    messagesContainer.id = "chatbot-messages";
    messagesContainer.style.cssText = `
        flex: 1;
        overflow-y: auto;
        padding: 16px;
        background: #f9fafb;
      `;

    // Add welcome message
    const welcomeMsg = createMessage(
      "bot",
      chatbotConfig.welcomeMessage || "Hi, how can I help you?"
    );
    messagesContainer.appendChild(welcomeMsg);

    // Create input container
    const inputContainer = document.createElement("div");
    inputContainer.style.cssText = `
        padding: 16px;
        background: white;
        border-top: 1px solid #e5e7eb;
      `;

    const inputWrapper = document.createElement("div");
    inputWrapper.style.cssText = `
        display: flex;
        align-items: center;
        gap: 8px;
        background: #f3f4f6;
        border-radius: 24px;
        padding: 8px 16px;
      `;

    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = "Type a message...";
    input.style.cssText = `
        flex: 1;
        border: none;
        background: transparent;
        outline: none;
        font-size: 14px;
      `;

    const sendBtn = document.createElement("button");
    sendBtn.style.cssText = `
        background: ${chatbotConfig.primaryColor || "#3B82F6"};
        border: none;
        border-radius: 50%;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: opacity 0.2s;
      `;
    sendBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
          <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
        </svg>
      `;

    sendBtn.addEventListener("click", () => sendMessage(input.value));
    input.addEventListener("keypress", (e) => {
      if (e.key === "Enter") sendMessage(input.value);
    });

    inputWrapper.appendChild(input);
    inputWrapper.appendChild(sendBtn);
    inputContainer.appendChild(inputWrapper);

    // Assemble chat window
    chatWindow.appendChild(chatHeader);
    chatWindow.appendChild(messagesContainer);
    chatWindow.appendChild(inputContainer);

    // Toggle chat
    bubble.addEventListener("click", () => {
      chatWindow.style.display = "flex";
      bubble.style.display = "none";
      input.focus();
    });

    // Append to container
    container.appendChild(bubble);
    container.appendChild(chatWindow);
    document.body.appendChild(container);

    // Add animations
    const style = document.createElement("style");
    style.textContent = `
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        #chatbot-messages::-webkit-scrollbar {
          width: 6px;
        }
        #chatbot-messages::-webkit-scrollbar-track {
          background: #f1f1f1;
        }
        #chatbot-messages::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 3px;
        }
        #chatbot-messages::-webkit-scrollbar-thumb:hover {
          background: #555;
        }
      `;
    document.head.appendChild(style);
  }

  function createMessage(type, text) {
    const msgDiv = document.createElement("div");
    msgDiv.style.cssText = `
        display: flex;
        margin-bottom: 16px;
        ${
          type === "user"
            ? "justify-content: flex-end;"
            : "justify-content: flex-start;"
        }
      `;

    const bubble = document.createElement("div");
    bubble.style.cssText = `
        max-width: 70%;
        padding: 12px 16px;
        border-radius: 16px;
        font-size: 14px;
        line-height: 1.4;
        ${
          type === "user"
            ? `background: ${
                chatbotConfig.primaryColor || "#3B82F6"
              }; color: white; border-bottom-right-radius: 4px;`
            : "background: white; color: #1f2937; border-bottom-left-radius: 4px; box-shadow: 0 1px 2px rgba(0,0,0,0.05);"
        }
      `;
    bubble.textContent = text;

    msgDiv.appendChild(bubble);
    return msgDiv;
  }

  async function sendMessage(text) {
    if (!text.trim()) return;

    const messagesContainer = document.getElementById("chatbot-messages");
    const input = document.querySelector("#chatbot-window input");

    // Add user message
    const userMsg = createMessage("user", text);
    messagesContainer.appendChild(userMsg);
    input.value = "";
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    // Show typing indicator
    const typingDiv = document.createElement("div");
    typingDiv.id = "typing-indicator";
    typingDiv.style.cssText =
      "display: flex; align-items: center; gap: 8px; margin-bottom: 16px;";
    typingDiv.innerHTML = `
        <div style="width: 32px; height: 32px; border-radius: 50%; background: ${
          chatbotConfig.avatarColor || "#3B82F6"
        }; display: flex; align-items: center; justify-content: center; font-size: 16px;">
          ${chatbotConfig.avatarEmoji || "🤖"}
        </div>
        <div style="display: flex; gap: 4px;">
          <div style="width: 8px; height: 8px; border-radius: 50%; background: #9ca3af; animation: bounce 1.4s infinite;"></div>
          <div style="width: 8px; height: 8px; border-radius: 50%; background: #9ca3af; animation: bounce 1.4s infinite 0.2s;"></div>
          <div style="width: 8px; height: 8px; border-radius: 50%; background: #9ca3af; animation: bounce 1.4s infinite 0.4s;"></div>
        </div>
      `;

    const bounceStyle = document.createElement("style");
    bounceStyle.textContent = `
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-10px); }
        }
      `;
    document.head.appendChild(bounceStyle);

    messagesContainer.appendChild(typingDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    try {
      // Call API to send message
      const response = await fetch(`${apiUrl}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: sessionId,
          type: "user",
          content: text,
        }),
      });

      const data = await response.json();

      // Remove typing indicator
      typingDiv.remove();

      // Add bot response
      if (data.success && data.data.botMessage) {
        const botMsg = createMessage("bot", data.data.botMessage.content);
        messagesContainer.appendChild(botMsg);
      } else {
        const botMsg = createMessage(
          "bot",
          "Thank you for your message. How can I assist you further?"
        );
        messagesContainer.appendChild(botMsg);
      }

      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    } catch (error) {
      console.error("Failed to send message:", error);
      typingDiv.remove();
      const errorMsg = createMessage(
        "bot",
        "Sorry, something went wrong. Please try again."
      );
      messagesContainer.appendChild(errorMsg);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  }

  // Initialize on load
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", fetchChatbotConfig);
  } else {
    fetchChatbotConfig();
  }
})();
