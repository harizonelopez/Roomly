from flask import Flask, render_template, request
from flask_socketio import SocketIO, emit, join_room, leave_room
import uuid
from datetime import datetime

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key-here'
socketio = SocketIO(app, cors_allowed_origins="*")

# Store active users and rooms
active_users = {}
chat_rooms = {'general': {'users': [], 'messages': []}}

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/chat')
def chat():
    username = request.args.get('username', 'Anonymous')
    room = request.args.get('room', 'general')
    return render_template('chat.html', username=username, room=room)

@socketio.on('connect')
def on_connect():
    print(f'Client {request.sid} connected')

@socketio.on('disconnect')
def on_disconnect():
    print(f'Client {request.sid} disconnected')
    # Remove user from active users and rooms
    if request.sid in active_users:
        user_info = active_users[request.sid]
        room = user_info.get('room', 'general')
        username = user_info.get('username', 'Anonymous')
        
        # Remove from room users list
        if room in chat_rooms and username in chat_rooms[room]['users']:
            chat_rooms[room]['users'].remove(username)
        
        # Remove from active users
        del active_users[request.sid]
        
        # Notify others in the room
        emit('user_left', {
            'username': username,
            'message': f'{username} left the room',
            'timestamp': datetime.now().strftime('%H:%M:%S')
        }, room=room)
        
        # Update user list
        emit('update_users', {'users': chat_rooms[room]['users']}, room=room)

@socketio.on('join')
def on_join(data):
    username = data['username']
    room = data['room']
    
    # Create room if it doesn't exist
    if room not in chat_rooms:
        chat_rooms[room] = {'users': [], 'messages': []}
    
    # Join the room
    join_room(room)
    
    # Store user info
    active_users[request.sid] = {'username': username, 'room': room}
    
    # Add user to room if not already there
    if username not in chat_rooms[room]['users']:
        chat_rooms[room]['users'].append(username)
    
    # Send join message
    emit('user_joined', {
        'username': username,
        'message': f'{username} joined the room',
        'timestamp': datetime.now().strftime('%H:%M:%S')
    }, room=room)
    
    # Send recent messages to the new user
    for message in chat_rooms[room]['messages'][-50:]:  # Last 50 messages
        emit('message', message)
    
    # Update user list for everyone in the room
    emit('update_users', {'users': chat_rooms[room]['users']}, room=room)

@socketio.on('leave')
def on_leave(data):
    username = data['username']
    room = data['room']
    
    leave_room(room)
    
    # Remove from room users list
    if room in chat_rooms and username in chat_rooms[room]['users']:
        chat_rooms[room]['users'].remove(username)
    
    # Remove from active users
    if request.sid in active_users:
        del active_users[request.sid]
    
    # Send leave message
    emit('user_left', {
        'username': username,
        'message': f'{username} left the room',
        'timestamp': datetime.now().strftime('%H:%M:%S')
    }, room=room)
    
    # Update user list
    emit('update_users', {'users': chat_rooms[room]['users']}, room=room)

@socketio.on('message')
def handle_message(data):
    username = data['username']
    message = data['message']
    room = data['room']
    timestamp = datetime.now().strftime('%H:%M:%S')
    
    # Create message object
    message_data = {
        'username': username,
        'message': message,
        'timestamp': timestamp,
        'id': str(uuid.uuid4())
    }
    
    # Store message in room history
    if room in chat_rooms:
        chat_rooms[room]['messages'].append(message_data)
        # Keep only last 100 messages
        if len(chat_rooms[room]['messages']) > 100:
            chat_rooms[room]['messages'] = chat_rooms[room]['messages'][-100:]
    
    # Broadcast message to all users in the room
    emit('message', message_data, room=room)

@socketio.on('typing')
def handle_typing(data):
    username = data['username']
    room = data['room']
    is_typing = data['is_typing']
    
    # Broadcast typing status to others in the room (exclude sender)
    emit('user_typing', {
        'username': username,
        'is_typing': is_typing
    }, room=room, include_self=False)

if __name__ == '__main__':
    socketio.run(app, debug=True, host='0.0.0.0', port=5000)