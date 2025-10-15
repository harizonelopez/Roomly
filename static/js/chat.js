// Chat application Js
class ChatApp {
    constructor() {
        this.socket = null;
        this.username = '';
        this.room = '';
        this.typingUsers = new Set();
        this.typingTimeout = null;
        this.isTyping = false;
        
        this.initializeElements();
        this.getUserData();
        this.initializeSocket();
        this.bindEvents();
    }

    initializeElements() {
        this.messagesContainer = document.getElementById('messages');
        this.messageInput = document.getElementById('messageInput');
        this.sendButton = document.getElementById('sendButton');
        this.usersList = document.getElementById('usersList');
        this.userCount = document.getElementById('userCount');
        this.connectionStatus = document.getElementById('connectionStatus');
        this.typingIndicator = document.getElementById('typingIndicator');
        this.typingText = document.getElementById('typingText');
        this.leaveButton = document.getElementById('leaveButton');
        this.emojiButton = document.getElementById('emojiButton');
        this.emojiPicker = document.getElementById('emojiPicker');
        this.emojiGrid = document.getElementById('emojiGrid');
        this.closeEmojiPicker = document.getElementById('closeEmojiPicker');
        
        this.initializeEmojiPicker();
    }

    getUserData() {
        const userData = document.getElementById('userData');
        this.username = userData.dataset.username;
        this.room = userData.dataset.room;
    }

    initializeSocket() {
        console.log('Initializing Socket.IO connection...');
        
        // Initialize socket with debugging
        this.socket = io({
            transports: ['websocket', 'polling'],
            timeout: 10000,
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000
        });
        
        // Socket event listeners
        this.socket.on('connect', () => this.onConnect());
        this.socket.on('disconnect', (reason) => this.onDisconnect(reason));
        this.socket.on('connect_error', (error) => this.onConnectError(error));
        this.socket.on('reconnect', (attemptNumber) => this.onReconnect(attemptNumber));
        this.socket.on('reconnect_failed', () => this.onReconnectFailed());
        this.socket.on('message', (data) => this.onMessage(data));
        this.socket.on('user_joined', (data) => this.onUserJoined(data));
        this.socket.on('user_left', (data) => this.onUserLeft(data));
        this.socket.on('update_users', (data) => this.onUpdateUsers(data));
        this.socket.on('user_typing', (data) => this.onUserTyping(data));
    }

    bindEvents() {
        // Send button click
        this.sendButton.addEventListener('click', () => this.sendMessage());
        
        // Enter key to send message
        this.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });
        
        // Typing indicator
        this.messageInput.addEventListener('input', () => this.handleTyping());
        
        // Leave room button
        this.leaveButton.addEventListener('click', () => this.leaveRoom());
        
        // Prevent form submission on Enter
        this.messageInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
            }
        });
        
        // Focus on message input when page loads
        this.messageInput.focus();
        
        // Emoji picker events
        this.emojiButton.addEventListener('click', () => this.toggleEmojiPicker());
        this.closeEmojiPicker.addEventListener('click', () => this.hideEmojiPicker());
        
        // Click outside to close emoji picker
        document.addEventListener('click', (e) => {
            if (!this.emojiPicker.contains(e.target) && !this.emojiButton.contains(e.target)) {
                this.hideEmojiPicker();
            }
        });
    }

    onConnect() {
        console.log('Connected to server');
        this.updateConnectionStatus('Connected', 'status-connected');
        this.enableInput();
        
        // Join the room
        this.socket.emit('join', {
            username: this.username,
            room: this.room
        });
    }

    onDisconnect(reason) {
        console.log('Disconnected from server:', reason);
        this.updateConnectionStatus('Disconnected', 'status-disconnected');
        this.disableInput();
    }

    onConnectError(error) {
        console.error('Connection error:', error);
        this.updateConnectionStatus('Connection Error', 'status-disconnected');
        this.disableInput();
    }

    onReconnect(attemptNumber) {
        console.log('Reconnected after', attemptNumber, 'attempts');
        this.updateConnectionStatus('Reconnected', 'status-connected');
    }

    onReconnectFailed() {
        console.error('Failed to reconnect to server');
        this.updateConnectionStatus('Connection Failed', 'status-disconnected');
    }

    onMessage(data) {
        this.displayMessage(data);
    }

    onUserJoined(data) {
        this.displaySystemMessage(data.message, data.timestamp);
    }

    onUserLeft(data) {
        this.displaySystemMessage(data.message, data.timestamp);
    }

    onUpdateUsers(data) {
        this.updateUsersList(data.users);
    }

    onUserTyping(data) {
        if (data.is_typing) {
            this.typingUsers.add(data.username);
        } else {
            this.typingUsers.delete(data.username);
        }
        this.updateTypingIndicator();
    }

    sendMessage() {
        const message = this.messageInput.value.trim();
        
        if (message && this.socket.connected) {
            this.socket.emit('message', {
                username: this.username,
                message: message,
                room: this.room
            });
            
            this.messageInput.value = '';
            this.stopTyping();
        }
    }

    displayMessage(data) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${data.username === this.username ? 'message-own' : 'message-other'}`;
        
        let messageContent = '';
        if (data.username !== this.username) {
            messageContent += `<span class="message-username">${this.escapeHtml(data.username)}</span>`;
        }
        
        // Parse and display message with emoji support
        const parsedMessage = this.parseTextEmojis(this.escapeHtml(data.message));
        messageContent += `<div class="message-text">${parsedMessage}</div>`;
        messageContent += `<span class="message-timestamp">${data.timestamp}</span>`;
        
        messageDiv.innerHTML = messageContent;
        
        this.messagesContainer.appendChild(messageDiv);
        this.scrollToBottom();
    }

    displaySystemMessage(message, timestamp) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message message-system';
        messageDiv.innerHTML = `
            <div class="message-text">${this.escapeHtml(message)}</div>
            <span class="message-timestamp">${timestamp}</span>
        `;
        
        // Add initial animation class
        messageDiv.style.opacity = '0';
        messageDiv.style.transform = 'translateY(10px)';
        messageDiv.style.cursor = 'pointer';
        messageDiv.title = 'Click to dismiss';
        
        // Add click to dismiss functionality
        messageDiv.addEventListener('click', () => {
            this.removeSystemMessage(messageDiv);
        });
        
        this.messagesContainer.appendChild(messageDiv);
        this.scrollToBottom();
        
        // Animate in
        setTimeout(() => {
            messageDiv.style.transition = 'all 0.3s ease';
            messageDiv.style.opacity = '1';
            messageDiv.style.transform = 'translateY(0)';
        }, 50);
        
        // Auto-disappear after 12 seconds
        const autoRemoveTimeout = setTimeout(() => {
            this.removeSystemMessage(messageDiv);
        }, 12000);
        
        // Store timeout reference so we can clear it if manually dismissed
        messageDiv.autoRemoveTimeout = autoRemoveTimeout;
    }

    removeSystemMessage(messageElement) {
        if (messageElement && messageElement.parentNode) {
            // Clear auto-remove timeout if it exists
            if (messageElement.autoRemoveTimeout) {
                clearTimeout(messageElement.autoRemoveTimeout);
            }
            
            // Add fade-out animation
            messageElement.style.transition = 'all 0.4s ease';
            messageElement.style.opacity = '0';
            messageElement.style.transform = 'translateY(-10px) scale(0.95)';
            messageElement.style.maxHeight = messageElement.offsetHeight + 'px';
            
            // After fade animation, collapse height
            setTimeout(() => {
                messageElement.style.maxHeight = '0';
                messageElement.style.marginBottom = '0';
                messageElement.style.paddingTop = '0';
                messageElement.style.paddingBottom = '0';
                
                // Remove element completely
                setTimeout(() => {
                    if (messageElement.parentNode) {
                        messageElement.parentNode.removeChild(messageElement);
                    }
                }, 300);
            }, 400);
        }
    }

    updateUsersList(users) {
        this.usersList.innerHTML = '';
        this.userCount.textContent = users.length;
        
        users.forEach(user => {
            const userDiv = document.createElement('div');
            userDiv.className = `user-item ${user === this.username ? 'user-self' : ''}`;
            userDiv.innerHTML = `
                <span class="user-online-indicator"></span>
                <span>${this.escapeHtml(user)}</span>
                ${user === this.username ? '<small class="ms-auto">(You)</small>' : ''}
            `;
            this.usersList.appendChild(userDiv);
        });
    }

    handleTyping() {
        if (!this.isTyping) {
            this.isTyping = true;
            this.socket.emit('typing', {
                username: this.username,
                room: this.room,
                is_typing: true
            });
        }
        
        // Clear existing timeout
        clearTimeout(this.typingTimeout);
        
        // Set new timeout to stop typing
        this.typingTimeout = setTimeout(() => {
            this.stopTyping();
        }, 1000);
    }

    stopTyping() {
        if (this.isTyping) {
            this.isTyping = false;
            this.socket.emit('typing', {
                username: this.username,
                room: this.room,
                is_typing: false
            });
        }
        clearTimeout(this.typingTimeout);
    }

    updateTypingIndicator() {
        if (this.typingUsers.size > 0) {
            const typingArray = Array.from(this.typingUsers);
            let typingText = '';
            
            if (typingArray.length === 1) {
                typingText = `${typingArray[0]} is typing`;
            } else if (typingArray.length === 2) {
                typingText = `${typingArray[0]} and ${typingArray[1]} are typing`;
            } else {
                typingText = `${typingArray.length} people are typing`;
            }
            
            this.typingText.textContent = typingText;
            this.typingIndicator.style.display = 'block';
        } else {
            this.typingIndicator.style.display = 'none';
        }
    }

    updateConnectionStatus(text, className) {
        this.connectionStatus.innerHTML = `<i class="fas fa-circle"></i> ${text}`;
        // Remove all status classes
        this.connectionStatus.classList.remove('status-connected', 'status-connecting', 'status-disconnected');
        // Add the new status class
        this.connectionStatus.classList.add(className);
    }

    enableInput() {
        this.messageInput.disabled = false;
        this.sendButton.disabled = false;
        this.messageInput.placeholder = 'Type a message';
    }

    disableInput() {
        this.messageInput.disabled = true;
        this.sendButton.disabled = true;
        this.messageInput.placeholder = 'Disconnected...';
    }

    scrollToBottom() {
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }

    escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    leaveRoom() {
        if (confirm('Are you sure you want to leave the room?')) {
            this.socket.emit('leave', {
                username: this.username,
                room: this.room
            });
            
            // Redirect to home page after a short delay
            setTimeout(() => {
                window.location.href = '/';
            }, 1000);
        }
    }
    
    initializeEmojiPicker() {
        // Common emojis to populate the picker
        const emojis = [
            '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣',
            '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰',
            '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜',
            '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏',
            '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣',
            '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠',
            '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨',
            '😰', '😥', '😓', '🤗', '🤔', '🤭', '🤫', '🤥',
            '😶', '😐', '😑', '😬', '🙄', '😯', '😦', '😧',
            '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐',
            '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕', '🤑',
            '🤠', '😈', '👿', '👹', '👺', '🤡', '💩', '👻',
            '💀', '☠️', '👽', '👾', '🤖', '🎃', '😺', '😸',
            '😹', '😻', '😼', '😽', '🙀', '😿', '😾', '❤️',
            '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎',
            '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘',
            '💝', '💟', '👍', '👎', '👌', '🤌', '🤏', '✌️',
            '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕',
            '👇', '☝️', '👋', '🤚', '🖐️', '✋', '🖖', '👏',
            '🙌', '👐', '🤲', '🤝', '🙏', '✍️', '💪', '🦾',
            '🎉', '🎊', '🎈', '🎁', '🎀', '🎂', '🍰', '🎵',
            '🎶', '🎤', '🎧', '🎮', '🎯', '🎲', '🎭', '🎨'
        ];
        
        // Populate emoji grid
        emojis.forEach(emoji => {
            const emojiButton = document.createElement('button');
            emojiButton.className = 'emoji-item';
            emojiButton.textContent = emoji;
            emojiButton.title = emoji;
            emojiButton.addEventListener('click', () => this.insertEmoji(emoji));
            this.emojiGrid.appendChild(emojiButton);
        });
    }
    
    toggleEmojiPicker() {
        const isVisible = this.emojiPicker.style.display === 'block';
        if (isVisible) {
            this.hideEmojiPicker();
        } else {
            this.showEmojiPicker();
        }
    }
    
    showEmojiPicker() {
        this.emojiPicker.style.display = 'block';
        this.emojiButton.classList.add('active');
    }
    
    hideEmojiPicker() {
        this.emojiPicker.style.display = 'none';
        this.emojiButton.classList.remove('active');
    }
    
    insertEmoji(emoji) {
        const cursorPos = this.messageInput.selectionStart;
        const textBefore = this.messageInput.value.substring(0, cursorPos);
        const textAfter = this.messageInput.value.substring(cursorPos);
        
        this.messageInput.value = textBefore + emoji + textAfter;
        this.messageInput.focus();
        
        // Set cursor position after the emoji
        const newCursorPos = cursorPos + emoji.length;
        this.messageInput.setSelectionRange(newCursorPos, newCursorPos);
        
        // Hide the emoji picker
        this.hideEmojiPicker();
    }
    
    parseTextEmojis(text) {
        // Common text-to-emoji mapping
        const emojiMap = {
            ':smile:': '😄',
            ':grin:': '😁',
            ':joy:': '😂',
            ':laughing:': '😆',
            ':wink:': '😉',
            ':heart:': '❤️',
            ':hearts:': '💕',
            ':love:': '😍',
            ':kiss:': '😘',
            ':thumbsup:': '👍',
            ':thumbsdown:': '👎',
            ':ok:': '👌',
            ':peace:': '✌️',
            ':wave:': '👋',
            ':clap:': '👏',
            ':pray:': '🙏',
            ':muscle:': '💪',
            ':fire:': '🔥',
            ':star:': '⭐',
            ':sun:': '☀️',
            ':moon:': '🌙',
            ':rainbow:': '🌈',
            ':party:': '🎉',
            ':cake:': '🎂',
            ':coffee:': '☕',
            ':pizza:': '🍕',
            ':burger:': '🍔',
            ':beer:': '🍺',
            ':wine:': '🍷',
            ':music:': '🎵',
            ':headphones:': '🎧',
            ':camera:': '📷',
            ':phone:': '📱',
            ':computer:': '💻',
            ':game:': '🎮',
            ':car:': '🚗',
            ':plane:': '✈️',
            ':rocket:': '🚀',
            ':house:': '🏠',
            ':tree:': '🌳',
            ':flower:': '🌸',
            ':dog:': '🐶',
            ':cat:': '🐱',
            ':fish:': '🐟',
            ':bird:': '🐦',
            ':money:': '💰',
            ':gem:': '💎',
            ':crown:': '👑',
            ':gift:': '🎁',
            ':balloon:': '🎈',
            ':cool:': '😎',
            ':thinking:': '🤔',
            ':shocked:': '😱',
            ':confused:': '😕',
            ':sleepy:': '😴',
            ':angry:': '😡',
            ':cry:': '😢',
            ':sad:': '🙁',
            ':happy:': '😊',
            ':excited:': '🤩',
            ':surprised:': '😲'
        };
        
        // Replace text-based emojis with actual emojis
        let parsedText = text;
        for (const [textEmoji, emoji] of Object.entries(emojiMap)) {
            const regex = new RegExp(textEmoji.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
            parsedText = parsedText.replace(regex, emoji);
        }
        
        return parsedText;
    }
}

// Initialize chat application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.chatApp = new ChatApp();
});

// Handle page unload
window.addEventListener('beforeunload', () => {
    if (window.chatApp && window.chatApp.socket) {
        window.chatApp.socket.emit('leave', {
            username: window.chatApp.username,
            room: window.chatApp.room
        });
    }
});