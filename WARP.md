# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Development Commands

### Setup and Installation
```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment (Windows)
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### Running the Application
```bash
# Run in development mode (default)
python app.py

# The app runs on http://localhost:5000 by default
```

### Development Workflow
```bash
# Install new dependencies and update requirements
pip install <package_name>
pip freeze > requirements.txt

# Check Python syntax
python -m py_compile app.py

# Test WebSocket connections locally
# Access http://localhost:5000 in multiple browser tabs/windows
```

## Architecture Overview

### Core Technologies
- **Backend**: Flask with Flask-SocketIO for real-time WebSocket communication
- **Frontend**: Vanilla JavaScript ES6+ with Socket.IO client
- **UI Framework**: Bootstrap 5 with Font Awesome icons
- **Real-time Engine**: Socket.IO with eventlet WSGI server

### Application Structure

**Single-File Flask App** (`app.py`):
- Main Flask application with SocketIO integration
- In-memory data storage using Python dictionaries
- Event-driven architecture with WebSocket handlers
- No database - all data is ephemeral (lost on restart)

**Real-time Communication Flow**:
1. Client connects via Socket.IO
2. User joins room through `join` event
3. Messages broadcast to room participants via `message` events  
4. Typing indicators managed through `typing` events
5. User presence tracked with `connect`/`disconnect` events

**Key Data Structures**:
- `active_users`: Maps socket IDs to user/room info
- `chat_rooms`: Nested dict storing users and message history per room
- Message history limited to last 100 messages per room

### Frontend Architecture

**Class-based JavaScript** (`static/js/chat.js`):
- `ChatApp` class manages all client-side functionality
- Event-driven UI updates responding to Socket.IO events
- XSS protection through HTML escaping
- Typing indicators with 1-second debouncing

**Template System**:
- Jinja2 templates with inheritance (`base.html` → `index.html`, `chat.html`)
- Bootstrap responsive design
- Progressive enhancement with JavaScript

## Important Patterns

### Socket.IO Event Handling
The application uses bidirectional events:
- **Client → Server**: `join`, `leave`, `message`, `typing`
- **Server → Client**: `message`, `user_joined`, `user_left`, `update_users`, `user_typing`

### Memory Management
- Message history automatically truncated to last 100 messages
- User cleanup on disconnect to prevent memory leaks
- Room cleanup happens implicitly when last user leaves

### Security Considerations
- HTML escaping implemented in JavaScript for XSS prevention
- CORS enabled for all origins (development setting)
- Secret key hardcoded (should be changed for production)

### State Management
- Client-side state managed through ChatApp class instance
- Server-side state is entirely in-memory dictionaries
- No persistence - application state resets on server restart

## Development Notes

### Testing Real-time Features
- Open multiple browser tabs to simulate multiple users
- Test in incognito mode to simulate different sessions  
- Check browser developer tools for Socket.IO connection status

### Common Extension Points
- Add database persistence by replacing in-memory dictionaries
- Implement user authentication by extending the join flow
- Add private messaging by modifying room-based event routing
- Implement file sharing by adding file upload handlers

### Performance Considerations  
- Current design suitable for small-scale use (dozens of concurrent users)
- For production scale, consider Redis for session storage
- Message history grows unbounded per room until 100-message limit

### Debugging
- Socket.IO events logged to console in development mode
- Server-side print statements show connection/disconnection events
- Browser developer tools show WebSocket traffic in Network tab