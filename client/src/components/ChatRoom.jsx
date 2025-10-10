import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import MemberList from './MemberList';
import TimezoneClock from './TimezoneClock';
import PingDisplay from './PingDisplay';
import SystemInfo from './SystemInfo';

const ChatRoom = ({ user, onLogout }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState(null);
  const [currentRoom, setCurrentRoom] = useState('general');
  const [systemLogs, setSystemLogs] = useState([]);
  const [activeMembers, setActiveMembers] = useState([]);
  const [messageCount, setMessageCount] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const rooms = [
    { id: 'general', name: '/general' },
    { id: 'dev-lounge', name: '/dev-lounge' },
    { id: 'cyber-lab', name: '/cyber-lab' }
  ];

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io('http://localhost:3001');
    setSocket(newSocket);

    // Load recent messages
    loadMessages();

    // Socket event listeners
    newSocket.on('new-message', (message) => {
      setMessages(prev => [...prev, message]);
      setMessageCount(prev => prev + 1);
      scrollToBottom();
    });

    newSocket.on('user-joined', (data) => {
      addSystemLog(`${data.username} joined channel`);
      setActiveMembers(prev => [...prev.filter(m => m.username !== data.username), { username: data.username, isOnline: true }]);
    });

    newSocket.on('user-left', (data) => {
      addSystemLog(`${data.username} left channel`);
      setActiveMembers(prev => prev.map(m => 
        m.username === data.username ? { ...m, isOnline: false } : m
      ));
    });

    newSocket.on('joined-room', (data) => {
      addSystemLog(`Connected to ${data.room}`);
    });

    newSocket.on('ping', (data) => {
      newSocket.emit('pong', data);
    });

    newSocket.on('error', (error) => {
      addSystemLog(`ERROR: ${error.message}`);
    });

    return () => {
      newSocket.close();
    };
  }, []);

  useEffect(() => {
    if (socket) {
      socket.emit('join-room', { room: currentRoom, username: user.username });
    }
  }, [socket, currentRoom]);

  const loadMessages = async () => {
    try {
      const response = await axios.get(`http://localhost:3001/api/messages/${currentRoom}`);
      setMessages(response.data);
      scrollToBottom();
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const addSystemLog = (message) => {
    const timestamp = new Date().toLocaleTimeString();
    setSystemLogs(prev => [...prev.slice(-4), `[${timestamp}] ${message}`]);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket) return;

    socket.emit('send-message', {
      content: newMessage,
      room: currentRoom,
      userId: user.id,
      username: user.username
    });

    setNewMessage('');
    setIsTyping(false);
    inputRef.current?.focus();
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    if (e.target.value.length > 0 && !isTyping) {
      setIsTyping(true);
    } else if (e.target.value.length === 0 && isTyping) {
      setIsTyping(false);
    }
  };

  const handleRoomChange = (roomId) => {
    setCurrentRoom(roomId);
    setMessages([]);
    loadMessages();
  };

  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:3001/api/auth/logout', {}, {
        withCredentials: true
      });
      onLogout();
    } catch (error) {
      console.error('Logout error:', error);
      onLogout(); // Force logout even if request fails
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <div className="terminal-container h-screen flex flex-col">
      {/* Main Terminal Window */}
      <div className="terminal-window flex-1 flex flex-col">
        {/* Terminal Title Bar */}
        <div className="terminal-titlebar">
          <span>DARKWEB CHATROOM v2.0 - {user.username}@{currentRoom}</span>
          <div className="terminal-buttons">
            <div className="terminal-button-dot close"></div>
            <div className="terminal-button-dot minimize"></div>
            <div className="terminal-button-dot maximize"></div>
          </div>
        </div>

        {/* Terminal Content */}
        <div className="terminal-content flex-1 flex overflow-hidden">
          {/* Left Sidebar - Info Panels */}
          <div className="w-80 flex flex-col space-y-4 pr-4">
            {/* Room Selector */}
            <div className="terminal-window">
              <div className="terminal-titlebar">
                <span>CHANNELS</span>
              </div>
              <div className="terminal-content">
                <div className="flex flex-col space-y-2">
                  {rooms.map(room => (
                    <button
                      key={room.id}
                      onClick={() => handleRoomChange(room.id)}
                      className={`room-selector w-full ${
                        currentRoom === room.id ? 'active' : ''
                      }`}
                    >
                      {room.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Member List */}
            <MemberList members={activeMembers} socket={socket} />

            {/* Timezone Clocks */}
            <TimezoneClock />

            {/* Ping Display */}
            <PingDisplay socket={socket} />

            {/* System Info */}
            <SystemInfo 
              user={user} 
              currentRoom={currentRoom} 
              messageCount={messageCount} 
            />
          </div>

          {/* Main Chat Area */}
          <div className="flex-1 flex flex-col">
            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {messages.map((message) => (
                <div 
                  key={message.id} 
                  className="message-container"
                  data-timestamp={formatTimestamp(message.timestamp || message.createdAt)}
                >
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="message-username">
                      {message.user?.username || message.username}
                    </span>
                  </div>
                  <div className="message-content">
                    {message.content}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="message-container">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="message-username">{user.username}</span>
                    <span className="typing-indicator">typing</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* System Log */}
            <div className="border-t border-neon-green p-2" style={{maxHeight: '8rem', overflowY: 'auto'}}>
              <div className="text-neon-cyan font-bold mb-2 text-sm">
                [ SYSTEM LOG ]
              </div>
              <div className="space-y-1">
                {systemLogs.slice(-5).map((log, index) => (
                  <div key={index} className="system-log">
                    {log}
                  </div>
                ))}
              </div>
            </div>

            {/* Message Input */}
            <div className="border-t border-neon-green p-4">
              <form onSubmit={handleSendMessage} className="flex space-x-4">
                <div className="flex-1 relative">
                  <input
                    ref={inputRef}
                    type="text"
                    value={newMessage}
                    onChange={handleTyping}
                    className="chat-input"
                    placeholder={`${user.username}@${currentRoom}:> `}
                    autoFocus
                  />
                  <div className="absolute right-2 cursor-blink text-neon-green" style={{top: '50%', transform: 'translateY(-50%)'}}>
                    _
                  </div>
                </div>
                <button
                  type="submit"
                  className="terminal-button px-6"
                  disabled={!newMessage.trim()}
                >
                  SEND
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="terminal-button px-4"
                >
                  EXIT
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Status Bar */}
        <div className="status-bar">
          <div className="flex items-center space-x-4">
            <div className="status-item">
              <div className="status-indicator"></div>
              <span>ONLINE</span>
            </div>
            <div className="status-item">
              <span>ROOM: {currentRoom}</span>
            </div>
            <div className="status-item">
              <span>USERS: {activeMembers.length}</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="status-item">
              <span>MSG: {messageCount}</span>
            </div>
            <div className="status-item">
              <span>{new Date().toLocaleTimeString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatRoom;
