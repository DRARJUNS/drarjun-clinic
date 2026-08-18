/**
 * Dr Arjun's Homoeo Care - Arjun AI Assistant Client Script
 */

(function () {
    const API_BASE = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.protocol === 'file:')
        ? 'http://localhost:5000/api/v1'
        : '/api/v1';

    let chatHistory = [];
    let isWaitingForBot = false;

    // 1. Inject Chatbot HTML Widget
    function injectChatbotHTML() {
        const widgetContainer = document.createElement('div');
        widgetContainer.id = 'arjun-ai-widget';
        widgetContainer.innerHTML = `
            <!-- Floating Bot Launcher -->
            <div class="ai-bot-launcher" id="ai-launcher">
                <div class="ai-bot-btn" title="Chat with Arjun AI">
                    <i class="fas fa-robot"></i>
                    <span class="ai-bot-badge"></span>
                </div>
                <div class="ai-bot-tooltip">
                    <span>🌿 Ask Arjun AI</span> (Online)
                </div>
            </div>

            <!-- Chat Window -->
            <div class="ai-chat-window" id="ai-chat-window">
                <!-- Header -->
                <div class="ai-chat-header">
                    <div class="ai-chat-header-info">
                        <div class="ai-chat-avatar">
                            <i class="fas fa-leaf"></i>
                        </div>
                        <div class="ai-chat-title">
                            <h4>Arjun AI</h4>
                            <span class="ai-chat-status">Homeopathic Health Assistant</span>
                        </div>
                    </div>
                    <div class="ai-chat-actions">
                        <button class="ai-header-btn" id="ai-reset-btn" title="Clear Chat"><i class="fas fa-redo-alt"></i></button>
                        <button class="ai-header-btn" id="ai-close-btn" title="Close"><i class="fas fa-times"></i></button>
                    </div>
                </div>

                <!-- Messages Body -->
                <div class="ai-chat-messages" id="ai-messages-container">
                    <!-- Default Bot Greeting -->
                    <div class="chat-message bot">
                        <div class="message-bubble">
                            <p>Hello! 🌿 Welcome to <strong>Dr Arjun's Homoeo Care</strong>.</p>
                            <p>I am <strong>Arjun AI</strong>, your online homeopathic health assistant. Ask me anything about our natural treatments, 100% online video consultations, or doorstep medicine delivery!</p>
                            <div class="quick-prompt-chips">
                                <button class="prompt-chip" onclick="window.sendQuickPrompt('How does online consultation and medicine delivery work?')">
                                    <span>📦 How does online consultation work?</span>
                                    <i class="fas fa-chevron-right"></i>
                                </button>
                                <button class="prompt-chip" onclick="window.sendQuickPrompt('What is the homeopathic treatment for Skin Diseases and Psoriasis?')">
                                    <span>✨ Skin Diseases & Psoriasis relief</span>
                                    <i class="fas fa-chevron-right"></i>
                                </button>
                                <button class="prompt-chip" onclick="window.sendQuickPrompt('What is the treatment for Hair Fall and Dandruff?')">
                                    <span>💇‍♀️ Hair Fall & Scalp Health</span>
                                    <i class="fas fa-chevron-right"></i>
                                </button>
                                <button class="prompt-chip" onclick="window.sendQuickPrompt('How can I book an appointment with the doctor?')">
                                    <span>📅 Book an Online Consultation</span>
                                    <i class="fas fa-chevron-right"></i>
                                </button>
                            </div>
                        </div>
                        <span class="message-time">${getCurrentTime()}</span>
                    </div>
                </div>

                <!-- Input Footer -->
                <div class="ai-chat-footer">
                    <form class="ai-input-form" id="ai-input-form">
                        <input type="text" id="ai-user-input" class="ai-input-box" placeholder="Ask about symptoms, treatments, booking..." autocomplete="off" required>
                        <button type="submit" class="ai-send-btn" id="ai-send-btn" title="Send Message">
                            <i class="fas fa-paper-plane"></i>
                        </button>
                    </form>
                </div>
            </div>
        `;
        document.body.appendChild(widgetContainer);
    }

    function getCurrentTime() {
        return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    // 2. Format Markdown Text into clean HTML
    function formatMessageText(text) {
        if (!text) return "";
        let formatted = text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" style="color: #0b6b3a; text-decoration: underline;">$1</a>');

        // Handle lines
        const lines = formatted.split('\n');
        let html = '';
        let inList = false;

        lines.forEach(line => {
            const trimmed = line.trim();
            if (trimmed.startsWith('• ') || trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
                if (!inList) {
                    html += '<ul>';
                    inList = true;
                }
                html += `<li>${trimmed.substring(2)}</li>`;
            } else if (/^\d+\.\s/.test(trimmed)) {
                if (inList) {
                    html += '</ul>';
                    inList = false;
                }
                html += `<p style="margin: 4px 0;"><strong>${trimmed}</strong></p>`;
            } else {
                if (inList) {
                    html += '</ul>';
                    inList = false;
                }
                if (trimmed) {
                    html += `<p>${trimmed}</p>`;
                }
            }
        });

        if (inList) html += '</ul>';
        return html;
    }

    // 3. Append Message to Chat Window
    function appendMessage(sender, text, quickActions = []) {
        const container = document.getElementById('ai-messages-container');
        if (!container) return;

        const messageEl = document.createElement('div');
        messageEl.className = `chat-message ${sender}`;

        let actionsHTML = '';
        if (quickActions && quickActions.length > 0) {
            actionsHTML = `
                <div class="bot-action-buttons">
                    ${quickActions.map(action => `
                        <button class="bot-action-btn" onclick="window.handleBotAction('${action.action}')">
                            ${action.label}
                        </button>
                    `).join('')}
                </div>
            `;
        }

        messageEl.innerHTML = `
            <div class="message-bubble">
                ${sender === 'bot' ? formatMessageText(text) : `<p>${escapeHTML(text)}</p>`}
                ${actionsHTML}
            </div>
            <span class="message-time">${getCurrentTime()}</span>
        `;

        container.appendChild(messageEl);
        container.scrollTop = container.scrollHeight;
    }

    function escapeHTML(str) {
        return str.replace(/[&<>'"]/g, 
            tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
        );
    }

    // 4. Show/Hide Typing Indicator
    function showTypingIndicator() {
        const container = document.getElementById('ai-messages-container');
        if (!container) return;

        const indicator = document.createElement('div');
        indicator.className = 'chat-message bot';
        indicator.id = 'ai-typing-indicator';
        indicator.innerHTML = `
            <div class="typing-indicator">
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
            </div>
        `;
        container.appendChild(indicator);
        container.scrollTop = container.scrollHeight;
    }

    function removeTypingIndicator() {
        const indicator = document.getElementById('ai-typing-indicator');
        if (indicator) indicator.remove();
    }

    // 5. Send Message to Backend AI API
    async function sendMessage(userText) {
        if (!userText || isWaitingForBot) return;

        appendMessage('user', userText);
        chatHistory.push({ role: 'user', content: userText });

        isWaitingForBot = true;
        showTypingIndicator();

        const inputField = document.getElementById('ai-user-input');
        const sendBtn = document.getElementById('ai-send-btn');
        if (inputField) inputField.value = '';
        if (sendBtn) sendBtn.disabled = true;

        try {
            const response = await fetch(`${API_BASE}/ai/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    message: userText,
                    history: chatHistory.slice(-6)
                })
            });

            const result = await response.json();
            removeTypingIndicator();

            if (response.ok && result.success && result.data) {
                const botReply = result.data.reply;
                const quickActions = result.data.quickActions || [];
                appendMessage('bot', botReply, quickActions);
                chatHistory.push({ role: 'assistant', content: botReply });
            } else {
                throw new Error(result.message || 'AI service is temporarily busy.');
            }

        } catch (err) {
            console.error('Arjun AI Error:', err);
            removeTypingIndicator();
            appendMessage('bot', `I apologize, I am having trouble connecting right now. 🌿\n\nYou can book an online appointment directly on our website or reach our clinic doctors on WhatsApp: **+91 78429 11774**.`, [
                { label: "📅 Book Consultation", action: "book_appointment" },
                { label: "💬 WhatsApp", action: "open_whatsapp" }
            ]);
        } finally {
            isWaitingForBot = false;
            if (sendBtn) sendBtn.disabled = false;
            if (inputField) inputField.focus();
        }
    }

    // 6. Global Helper Functions for Action Buttons
    window.sendQuickPrompt = function (promptText) {
        const chatWindow = document.getElementById('ai-chat-window');
        if (chatWindow && !chatWindow.classList.contains('active')) {
            chatWindow.classList.add('active');
        }
        sendMessage(promptText);
    };

    window.handleBotAction = function (action) {
        if (action === 'book_appointment') {
            const apptSection = document.getElementById('appointment');
            if (apptSection) {
                apptSection.scrollIntoView({ behavior: 'smooth' });
                const nameField = document.getElementById('appt-name');
                if (nameField) {
                    setTimeout(() => nameField.focus(), 600);
                }
            } else {
                window.location.href = 'index.html#appointment';
            }
        } else if (action === 'open_whatsapp') {
            window.open('https://wa.me/917842911774', '_blank');
        } else if (action === 'call_clinic') {
            window.location.href = 'tel:7842911774';
        }
    };

    // 7. Initialize Chatbot Listeners
    function initChatbot() {
        injectChatbotHTML();

        const launcher = document.getElementById('ai-launcher');
        const chatWindow = document.getElementById('ai-chat-window');
        const closeBtn = document.getElementById('ai-close-btn');
        const resetBtn = document.getElementById('ai-reset-btn');
        const inputForm = document.getElementById('ai-input-form');
        const inputField = document.getElementById('ai-user-input');

        if (launcher && chatWindow) {
            launcher.addEventListener('click', () => {
                chatWindow.classList.toggle('active');
                if (chatWindow.classList.contains('active') && inputField) {
                    inputField.focus();
                }
            });
        }

        if (closeBtn && chatWindow) {
            closeBtn.addEventListener('click', () => {
                chatWindow.classList.remove('active');
            });
        }

        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                const container = document.getElementById('ai-messages-container');
                if (container) {
                    chatHistory = [];
                    container.innerHTML = `
                        <div class="chat-message bot">
                            <div class="message-bubble">
                                <p>Chat history cleared. 🌿 How can <strong>Arjun AI</strong> help you today?</p>
                                <div class="quick-prompt-chips">
                                    <button class="prompt-chip" onclick="window.sendQuickPrompt('How does online consultation and medicine delivery work?')">
                                        <span>📦 Online consultation process</span>
                                    </button>
                                    <button class="prompt-chip" onclick="window.sendQuickPrompt('What are your clinic consultation hours?')">
                                        <span>⏰ Consultation Timings</span>
                                    </button>
                                    <button class="prompt-chip" onclick="window.sendQuickPrompt('How to book an appointment?')">
                                        <span>📅 Book Consultation</span>
                                    </button>
                                </div>
                            </div>
                            <span class="message-time">${getCurrentTime()}</span>
                        </div>
                    `;
                }
            });
        }

        if (inputForm && inputField) {
            inputForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const text = inputField.value.trim();
                if (text) {
                    sendMessage(text);
                }
            });
        }
    }

    // Auto-run when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initChatbot);
    } else {
        initChatbot();
    }
})();
