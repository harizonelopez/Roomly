# Roomly 

- A real-time web-based chatroom application built with Flask and Socket.IO. 
- This application allows multiple users to join different chat rooms and communicate in real-time with features like typing indicators, user lists, and message history.

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


## Installation

### Prerequisites

- Python 3.12.3 ---> preferred version
- pip

### Setup Instructions

1. **Clone or download this repository**
   ```bash
   cd flask-chatroom
   ```

2. **Create a virtual environment (recommended)**
   ```bash
   python -m venv env
   
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

