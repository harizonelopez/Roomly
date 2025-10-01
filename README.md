# Flask Chatroom

A real-time web-based chatroom application built with Flask and Socket.IO. This application allows multiple users to join different chat rooms and communicate in real-time with features like typing indicators, user lists, and message history.

## Features

- **Real-time messaging** using Socket.IO
- **Multiple chat rooms** support
- **User authentication** with username
- **Typing indicators** to show when users are typing
- **Online user list** showing active participants
- **Message history** (last 100 messages per room)
- **Responsive design** that works on desktop and mobile
- **System messages** for user join/leave notifications
- **Message timestamps** for all messages
- **XSS protection** with HTML escaping

## Technologies Used

- **Backend**: Flask, Flask-SocketIO, Python
- **Frontend**: HTML5, CSS3, JavaScript (ES6+), Bootstrap 5
- **Real-time Communication**: Socket.IO
- **Icons**: Font Awesome

## Project Structure

```
flask-chatroom/
├── app.py                 # Main Flask application
├── requirements.txt       # Python dependencies
├── README.md             # Project documentation
├── .gitignore           # Git ignore file
├── templates/           # HTML templates
│   ├── base.html        # Base template with common elements
│   ├── index.html       # Landing page for joining rooms
│   └── chat.html        # Chat room interface
└── static/              # Static files
    ├── css/
    │   └── style.css    # Custom CSS styles
    └── js/
        └── chat.js      # Chat functionality JavaScript
```

## Installation

### Prerequisites

- Python 3.7+ installed on your system
- pip (Python package manager)

### Setup Instructions

1. **Clone or download this repository**
   ```bash
   cd flask-chatroom
   ```

2. **Create a virtual environment (recommended)**
   ```bash
   python -m venv venv
   
   # On Windows
   venv\Scripts\activate
   
   # On macOS/Linux
   source venv/bin/activate
   ```

3. **Install required packages**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run the application**
   ```bash
   python app.py
   ```

5. **Access the application**
   - Open your web browser and go to `http://localhost:5000`
   - Or if running on a server: `http://your-server-ip:5000`

## Usage

### Joining a Chat Room

1. Open the application in your web browser
2. Enter a unique username (max 20 characters)
3. Enter a room name or use the default "general" room (max 30 characters)
4. Click "Join Chat" to enter the chatroom

### Using the Chat Interface

- **Send Messages**: Type your message and press Enter or click the Send button
- **View Online Users**: See who's currently in the room on the right sidebar
- **Typing Indicators**: See when other users are typing
- **Leave Room**: Click the "Leave Room" button to exit and return to the main page

### Chat Features

- **Real-time Messaging**: Messages appear instantly for all users
- **Message History**: Previous messages are loaded when you join a room
- **System Notifications**: Get notified when users join or leave
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Connection Status**: See your connection status in the chat header

## Configuration

### Environment Variables

You can customize the application by modifying these settings in `app.py`:

- **SECRET_KEY**: Change the secret key for production use
- **HOST**: Default is `0.0.0.0` (all interfaces)
- **PORT**: Default is `5000`
- **DEBUG**: Set to `False` for production

### Security Considerations

For production deployment:

1. **Change the SECRET_KEY** in `app.py` to a secure random string
2. **Set DEBUG to False** in the production environment
3. **Use HTTPS** to encrypt data transmission
4. **Configure proper CORS settings** if needed
5. **Add rate limiting** to prevent spam
6. **Implement user authentication** for additional security

## API Events

### Client to Server Events

- `join`: Join a chat room with username and room name
- `leave`: Leave the current chat room
- `message`: Send a message to the room
- `typing`: Indicate typing status (start/stop)

### Server to Client Events

- `connect`: Connection established
- `disconnect`: Connection lost
- `message`: Receive a chat message
- `user_joined`: User joined the room notification
- `user_left`: User left the room notification
- `update_users`: Updated list of online users
- `user_typing`: Another user's typing status

## Browser Compatibility

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+
- Internet Explorer: Not supported

## Development

### Running in Development Mode

The application runs in debug mode by default. This enables:
- Automatic reloading when code changes
- Detailed error messages
- Debug toolbar (if flask-debugtoolbar is installed)

### Extending the Application

You can extend this chatroom with additional features:

- **User authentication and profiles**
- **Private messaging**
- **File sharing**
- **Message persistence with database**
- **Admin controls and moderation**
- **Room passwords and privacy settings**
- **Message reactions and emoji support**
- **Voice and video calling**

## Troubleshooting

### Common Issues

1. **Port already in use**
   - Change the port in `app.py` or kill the process using port 5000

2. **Socket.IO connection issues**
   - Check firewall settings
   - Ensure the server is accessible from client machines

3. **Static files not loading**
   - Verify the static folder structure
   - Check Flask static file configuration

4. **Messages not appearing**
   - Check browser console for JavaScript errors
   - Verify Socket.IO connection status

### Debug Mode

To enable additional logging, you can modify the logging level in `app.py` or add print statements for debugging.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the MIT License.

## Support

For issues, questions, or contributions, please:
- Check the existing issues in the repository
- Create a new issue with detailed information
- Follow the contribution guidelines

---

**Note**: This is a basic chatroom implementation suitable for learning and small-scale use. For production applications with many users, consider implementing additional features like database persistence, user authentication, rate limiting, and horizontal scaling.