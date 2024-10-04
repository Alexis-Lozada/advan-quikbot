class ChatbotComponent extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.isOpen = false;
    this.isTyping = false;
  }

  connectedCallback() {
    this.render();
    this.setupEventListeners();
  }

  parseMarkdown(text) {
    // Convertir saltos de línea en <br>
    text = text.replace(/\n/g, '<br>');
    
    // Convertir listas numeradas
    text = text.replace(/^\d+\.\s(.+)$/gm, '<li>$1</li>');
    text = text.replace(/<li>(.+)<\/li>/g, '<ol><li>$1</li></ol>');
    text = text.replace(/<\/ol><ol>/g, '');
    
    // Convertir listas con viñetas
    text = text.replace(/^-\s(.+)$/gm, '<li>$1</li>');
    text = text.replace(/^•\s(.+)$/gm, '<li>$1</li>');
    text = text.replace(/<li>(.+)<\/li>/g, '<ul><li>$1</li></ul>');
    text = text.replace(/<\/ul><ul>/g, '');
    
    return text;
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          --primary-color: #1a73e8;
          --background-color: #ffffff;
          --text-color: #202124;
          --message-bg-user: #e8f0fe;
          --message-bg-bot: #f1f3f4;
          position: fixed;
          bottom: 20px;
          right: 20px;
          font-family: 'Roboto', sans-serif;
          z-index: 1000;
          font-size: 14px;
        }
        #chat-container {
          background: var(--background-color);
          border-radius: 8px;
          overflow: hidden;
          width: 320px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        }
        #chat-header {
          background: var(--primary-color);
          color: var(--background-color);
          padding: 16px;
          font-weight: 500;
          cursor: pointer;
        }
        #chat-messages {
          height: 320px;
          overflow-y: auto;
          padding: 16px;
          display: flex;
          flex-direction: column;
        }
        .message {
          max-width: 80%;
          margin-bottom: 12px;
          padding: 10px 14px;
          border-radius: 18px;
          line-height: 1.4;
          box-shadow: 0 1px 2px rgba(0,0,0,0.1);
        }
        .user-message {
          background-color: var(--message-bg-user);
          color: var(--primary-color);
          align-self: flex-end;
        }
        .bot-message {
          background-color: var(--message-bg-bot);
          color: var(--text-color);
          align-self: flex-start;
        }
        #input-container {
          display: flex;
          padding: 16px;
          border-top: 1px solid #e0e0e0;
        }
        #user-input {
          flex-grow: 1;
          border: 1px solid #dadce0;
          border-radius: 24px;
          padding: 8px 16px;
          margin-right: 8px;
          outline: none;
        }
        #send-button {
          background: var(--primary-color);
          color: var(--background-color);
          border: none;
          border-radius: 24px;
          padding: 8px 16px;
          cursor: pointer;
          font-weight: 500;
        }
        #chat-icon {
          width: 56px;
          height: 56px;
          background: var(--primary-color);
          border-radius: 50%;
          display: flex;
          justify-content: center;
          align-items: center;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        #chat-icon svg {
          width: 28px;
          height: 28px;
          fill: var(--background-color);
        }
        .hidden {
          display: none !important;
        }
        .typing-indicator {
          background-color: var(--message-bg-bot);
          border-radius: 18px;
          padding: 10px 14px;
          display: inline-block;
          align-self: flex-start;
          margin-bottom: 12px;
        }
        .typing-indicator span {
          height: 8px;
          width: 8px;
          background-color: #606060;
          display: inline-block;
          border-radius: 50%;
          margin-right: 5px;
          animation: typing 1s infinite;
        }
        .typing-indicator span:nth-child(2) {
          animation-delay: 0.2s;
        }
        .typing-indicator span:nth-child(3) {
          animation-delay: 0.4s;
        }
        @keyframes typing {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
          100% { transform: translateY(0px); }
        }
      </style>
      <div id="chat-icon">
        <svg viewBox="0 0 24 24">
          <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
        </svg>
      </div>
      <div id="chat-container" class="hidden">
        <div id="chat-header">Asistente Virtual</div>
        <div id="chat-messages"></div>
        <div id="input-container">
          <input type="text" id="user-input" placeholder="Escribe tu mensaje...">
          <button id="send-button">Enviar</button>
        </div>
      </div>
    `;
  }

  setupEventListeners() {
    const sendButton = this.shadowRoot.getElementById('send-button');
    const userInput = this.shadowRoot.getElementById('user-input');
    const chatIcon = this.shadowRoot.getElementById('chat-icon');
    const chatHeader = this.shadowRoot.getElementById('chat-header');
    
    sendButton.addEventListener('click', () => this.sendMessage());
    userInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.sendMessage();
      }
    });

    chatIcon.addEventListener('click', () => this.toggleChat());
    chatHeader.addEventListener('click', () => this.toggleChat());
  }

  toggleChat() {
    const chatIcon = this.shadowRoot.getElementById('chat-icon');
    const chatContainer = this.shadowRoot.getElementById('chat-container');
    this.isOpen = !this.isOpen;
    
    if (this.isOpen) {
      chatIcon.classList.add('hidden');
      chatContainer.classList.remove('hidden');
    } else {
      chatIcon.classList.remove('hidden');
      chatContainer.classList.add('hidden');
    }
  }

  sendMessage() {
    const userInput = this.shadowRoot.getElementById('user-input');
    const message = userInput.value.trim();
    if (message) {
      this.addMessage('Usuario', message);
      userInput.value = '';
      
      // Mostrar indicador de escritura
      this.showTypingIndicator();

      // Emitir un evento con el mensaje
      this.dispatchEvent(new CustomEvent('message-sent', { detail: message }));
    }
  }

  addMessage(sender, text) {
    const messages = this.shadowRoot.getElementById('chat-messages');
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    messageElement.classList.add(sender === 'Usuario' ? 'user-message' : 'bot-message');
    messageElement.textContent = text;
    messages.appendChild(messageElement);
    messages.scrollTop = messages.scrollHeight;
  }

  showTypingIndicator() {
    if (!this.isTyping) {
      const messages = this.shadowRoot.getElementById('chat-messages');
      const typingIndicator = document.createElement('div');
      typingIndicator.classList.add('typing-indicator');
      typingIndicator.innerHTML = '<span></span><span></span><span></span>';
      messages.appendChild(typingIndicator);
      messages.scrollTop = messages.scrollHeight;
      this.isTyping = true;
    }
  }

  hideTypingIndicator() {
    if (this.isTyping) {
      const messages = this.shadowRoot.getElementById('chat-messages');
      const typingIndicator = messages.querySelector('.typing-indicator');
      if (typingIndicator) {
        messages.removeChild(typingIndicator);
      }
      this.isTyping = false;
    }
  }

  // Método para añadir la respuesta del bot y ocultar el indicador de escritura
  addBotResponse(text) {
    this.hideTypingIndicator();
    const messages = this.shadowRoot.getElementById('chat-messages');
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', 'bot-message');
    messageElement.innerHTML = this.parseMarkdown(text);
    messages.appendChild(messageElement);
    messages.scrollTop = messages.scrollHeight;
  }
}

customElements.define('chatbot-component', ChatbotComponent);