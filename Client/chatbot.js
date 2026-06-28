// ==================== CHATBOT SYSTEM - AI INTEGRATION ====================
// Tương tự hoạt động của folder AI/public/app.js nhưng với UI widget

class ChatBot {
    constructor() {
        this.isOpen = false;
        this.messages = [];
        this.isWaitingForResponse = false;
        this.apiBaseUrl = 'http://localhost:3001';
        this.init();
    }

    init() {
        this.createChatbotUI();
        this.setupEventListeners();
        this.loadMessages();
    }

    createChatbotUI() {
        if (document.getElementById('chatbot-widget')) return;

        const chatbotHTML = `
            <div id="chatbot-widget" class="chatbot-widget">
                <button id="chatbot-btn" class="chatbot-btn" title="Mở trò chuyện">💬</button>

                <div id="chatbot-window" class="chatbot-window hidden">
                    <div class="chatbot-header">
                        <div class="chatbot-title">
                            <h3>💬 Hỗ trợ khách hàng Giga</h3>
                            <p>Trợ lý AI Gemini</p>
                        </div>
                        <div class="chatbot-header-actions">
                            <button id="chatbot-clear-btn" class="chatbot-header-btn" title="Xóa lịch sử">🗑️</button>
                            <button id="chatbot-close" class="chatbot-close">✕</button>
                        </div>
                    </div>

                    <div id="chatbot-messages" class="chatbot-messages">
                        <div class="chat-message bot-message">
                            <div class="message-content">
                                <p>👋 Xin chào! Tôi là trợ lý AI của Giga, được hỗ trợ bởi Google Gemini. Hỏi tôi bất cứ điều gì!</p>
                            </div>
                        </div>
                    </div>

                    <div class="chatbot-input-area">
                        <div class="input-group">
                            <input 
                                type="text" 
                                id="chatbot-input" 
                                class="chatbot-input" 
                                placeholder="Nhập câu hỏi..."
                                autocomplete="off"
                            >
                            <button id="chatbot-send-btn" class="send-btn">📤</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', chatbotHTML);
    }

    setupEventListeners() {
        const chatbotBtn = document.getElementById('chatbot-btn');
        const chatbotClose = document.getElementById('chatbot-close');
        const chatbotClearBtn = document.getElementById('chatbot-clear-btn');
        const sendBtn = document.getElementById('chatbot-send-btn');
        const input = document.getElementById('chatbot-input');

        chatbotBtn.addEventListener('click', () => this.toggleChat());
        chatbotClose.addEventListener('click', () => this.closeChat());
        chatbotClearBtn.addEventListener('click', () => this.clearHistory());
        sendBtn.addEventListener('click', () => this.sendMessage());
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !this.isWaitingForResponse) {
                this.sendMessage();
            }
        });
    }

    toggleChat() {
        this.isOpen ? this.closeChat() : this.openChat();
    }

    openChat() {
        const chatbotWindow = document.getElementById('chatbot-window');
        const chatbotBtn = document.getElementById('chatbot-btn');
        chatbotWindow.classList.remove('hidden');
        chatbotBtn.classList.add('active');
        this.isOpen = true;
        this.scrollToBottom();
        document.getElementById('chatbot-input').focus();
    }

    closeChat() {
        const chatbotWindow = document.getElementById('chatbot-window');
        const chatbotBtn = document.getElementById('chatbot-btn');
        chatbotWindow.classList.add('hidden');
        chatbotBtn.classList.remove('active');
        this.isOpen = false;
    }

    sendMessage() {
        const input = document.getElementById('chatbot-input');
        const question = input.value.trim();

        if (!question || this.isWaitingForResponse) return;

        this.addMessage(question, 'user');
        input.value = '';
        this.isWaitingForResponse = true;

        this.showTypingIndicator();
        this.askQuestion(question);
    }

    async askQuestion(question) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/api/ask`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ question }),
            });

            let data = {};
            try {
                data = await response.json();
            } catch (e) {
                console.warn("Response is not JSON");
            }

            this.removeTypingIndicator();

            if (!response.ok) {
                this.addMessage(`❌ Lỗi hệ thống (${response.status}): ${data.error || 'Vui lòng thử lại sau.'}`, 'bot');
                this.isWaitingForResponse = false;
                return;
            }

            if (data.error) {
                this.addMessage(`❌ Lỗi: ${data.error}`, 'bot');
            } else {
                this.addMessage(data.answer || 'Xin lỗi, tôi không thể xử lý câu hỏi này.', 'bot');
            }
        } catch (error) {
            console.error('API Error:', error);
            this.removeTypingIndicator();
            this.addMessage(
                '⚠️ Không thể kết nối với server AI. Vui lòng kiểm tra:\n1. Server AI đang chạy? (npm start trong folder AI)\n2. Cổng 3001 có mở không?',
                'bot'
            );
        } finally {
            this.isWaitingForResponse = false;
        }
    }

    showTypingIndicator() {
        const messagesContainer = document.getElementById('chatbot-messages');
        const typingDiv = document.createElement('div');
        typingDiv.className = 'chat-message bot-message';
        typingDiv.id = 'typing-indicator';
        typingDiv.innerHTML = `
            <div class="message-content">
                <div class="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `;
        messagesContainer.appendChild(typingDiv);
        this.scrollToBottom();
    }

    removeTypingIndicator() {
        const typingDiv = document.getElementById('typing-indicator');
        if (typingDiv) typingDiv.remove();
    }

    // ĐÃ TỐI ƯU: Thêm cờ shouldSave và timestamp để không bị ghi đè dữ liệu cũ
    addMessage(text, sender, shouldSave = true, timestamp = null) {
        const messagesContainer = document.getElementById('chatbot-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${sender}-message`;

        const contentHTML = `
            <div class="message-content">
                <p>${this.escapeHtml(text)}</p>
            </div>
        `;

        messageDiv.innerHTML = contentHTML;
        messagesContainer.appendChild(messageDiv);

        // Lưu vào mảng bộ nhớ với mốc thời gian chính xác
        this.messages.push({
            text,
            sender,
            timestamp: timestamp || new Date().toISOString()
        });

        // Chỉ lưu vào LocalStorage và cuộn màn hình khi có tin nhắn MỚI
        if (shouldSave) {
            this.saveMessages();
            this.scrollToBottom(); 
        }
    }

    scrollToBottom() {
        const messagesContainer = document.getElementById('chatbot-messages');
        setTimeout(() => {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }, 0);
    }

    clearHistory() {
        if (confirm('❓ Xóa tất cả lịch sử trò chuyện?')) {
            const messagesContainer = document.getElementById('chatbot-messages');
            messagesContainer.innerHTML = `
                <div class="chat-message bot-message">
                    <div class="message-content">
                        <p>👋 Đã xóa lịch sử. Hỏi tôi điều gì đi!</p>
                    </div>
                </div>
            `;
            this.messages = [];
            localStorage.removeItem('chatbot-messages');
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    saveMessages() {
        const messagesToSave = this.messages.map(msg => ({
            text: msg.text,
            sender: msg.sender,
            timestamp: msg.timestamp
        }));
        localStorage.setItem('chatbot-messages', JSON.stringify(messagesToSave));
    }

    // ĐÃ TỐI ƯU: Chỉ hiển thị dữ liệu ra màn hình, không kích hoạt ghi file liên tục
    loadMessages() {
        const saved = localStorage.getItem('chatbot-messages');
        if (saved) {
            try {
                const loadedMessages = JSON.parse(saved);
                loadedMessages.forEach(msg => {
                    if (msg.text) {
                        // Truyền false để không save ngược lại, truyền msg.timestamp để giữ thời gian gốc
                        this.addMessage(msg.text, msg.sender, false, msg.timestamp);
                    }
                });
                
                // Cuộn trang 1 lần duy nhất sau khi đã nạp xong toàn bộ lịch sử
                this.scrollToBottom();
            } catch (e) {
                console.error('Lỗi tải tin nhắn:', e);
            }
        }
    }
}

// Initialize chatbot when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new ChatBot();
});