// Chat application JavaScript
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
    }

    getUserData() {
        const userData = document.getElementById('userData');
        this.username = userData.dataset.username;
        this.room = userData.dataset.room;
    }

    initializeSocket() {
        this.socket = io();
        
        // Socket event listeners
        this.socket.on('connect', () => this.onConnect());
        this.socket.on('disconnect', () => this.onDisconnect());
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

    onDisconnect() {
        console.log('Disconnected from server');
        this.updateConnectionStatus('Disconnected', 'status-disconnected');
        this.disableInput();
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
        messageContent += `<div class="message-text">${this.escapeHtml(data.message)}</div>`;
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
        
        this.messagesContainer.appendChild(messageDiv);
        this.scrollToBottom();
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
        this.connectionStatus.textContent = text;
        this.connectionStatus.className = `badge bg-light text-primary ms-2 ${className}`;
    }

    enableInput() {
        this.messageInput.disabled = false;
        this.sendButton.disabled = false;
        this.messageInput.placeholder = 'Type your message...';
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
        if (confirm('Are you sure you want to leave this room?')) {
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