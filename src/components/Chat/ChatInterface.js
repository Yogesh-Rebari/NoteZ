import React, { useState, useEffect, useRef } from 'react';
import { Send, Smile, Paperclip, MoreVertical, Users, Phone, Video } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { io } from 'socket.io-client';
import { useToast } from '../../hooks/useToast';
import Button from '../common/Button';
import Input from '../common/Input';
import Badge from '../common/Badge';

/**
 * Enhanced Chat Interface with real-time messaging
 */
const ChatInterface = ({ groupId, groupName, isOpen, onClose }) => {
  const { user, token } = useAuth();
  const { success, error } = useToast();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Socket.io connection
  useEffect(() => {
    if (!groupId || !isOpen) return;

    // Initialize socket connection
    const socket = io(process.env.REACT_APP_API_URL || 'http://localhost:3001', {
      auth: {
        token
      }
    });

    socketRef.current = socket;

    // Join group room
    socket.emit('join_group', { groupId });

    // Listen for messages
    socket.on('new_message', (data) => {
      setMessages(prev => [...prev, data.message]);
    });

    // Listen for typing indicators
    socket.on('user_typing', (data) => {
      setTypingUsers(prev => {
        const filtered = prev.filter(u => u.id !== data.user._id);
        return [...filtered, data.user];
      });
    });

    socket.on('user_stopped_typing', (data) => {
      setTypingUsers(prev => prev.filter(u => u.id !== data.user._id));
    });

    // Listen for user presence
    socket.on('user_joined', (data) => {
      setOnlineUsers(prev => [...prev, data.user]);
      success(`${data.user.username} joined the chat`);
    });

    socket.on('user_left', (data) => {
      setOnlineUsers(prev => prev.filter(u => u.id !== data.user._id));
    });

    // Load recent messages
    socket.on('recent_messages', (data) => {
      setMessages(data.messages.reverse());
    });

    return () => {
      socket.emit('leave_group', { groupId });
      socket.disconnect();
    };
  }, [groupId, isOpen, success, token]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !socketRef.current) return;

    try {
      socketRef.current.emit('send_message', {
        groupId,
        content: newMessage.trim(),
        type: 'text'
      });

      setNewMessage('');
    } catch (err) {
      error('Failed to send message');
    }
  };

  const handleTyping = (e) => {
    const value = e.target.value;
    setNewMessage(value);

    if (socketRef.current) {
      if (value && !isTyping) {
        setIsTyping(true);
        socketRef.current.emit('typing_start', { groupId });
      } else if (!value && isTyping) {
        setIsTyping(false);
        socketRef.current.emit('typing_stop', { groupId });
      }
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="flex flex-col h-full bg-white border-l border-gray-200" role="region" aria-label={`Chat panel for group ${groupName || ''}`}> 
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50" role="toolbar" aria-label="Chat toolbar">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold text-sm">
              {groupName?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900" aria-live="polite">{groupName}</h3>
            <div className="flex items-center space-x-2">
              <Badge variant="success" size="sm">
                {onlineUsers.length} online
              </Badge>
              {typingUsers.length > 0 && (
                <span className="text-sm text-gray-500" role="status" aria-live="polite">
                  {typingUsers.map(u => u.username).join(', ')} typing...
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" icon={<Users />} />
          <Button variant="ghost" size="sm" icon={<Phone />} />
          <Button variant="ghost" size="sm" icon={<Video />} />
          <Button variant="ghost" size="sm" icon={<MoreVertical />} />
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4" role="log" aria-live="polite" aria-relevant="additions text">
        {messages.map((message, index) => {
          const isOwn = message.author._id === user?.id;
          const showDate = index === 0 || 
            formatDate(message.createdAt) !== formatDate(messages[index - 1]?.createdAt);

          return (
            <div key={message._id}>
              {showDate && (
                <div className="flex justify-center my-4">
                  <Badge variant="secondary" size="sm">
                    {formatDate(message.createdAt)}
                  </Badge>
                </div>
              )}
              
              <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex max-w-xs lg:max-w-md ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
                  {!isOwn && (
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center mr-2">
                      <span className="text-gray-600 text-xs font-medium">
                        {message.author.username?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  
                  <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
                    {!isOwn && (
                      <span className="text-xs text-gray-500 mb-1">
                        {message.author.username}
                      </span>
                    )}
                    
                    <div
                      className={`
                        px-4 py-2 rounded-2xl
                        ${isOwn 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-gray-100 text-gray-900'
                        }
                      `}
                    >
                      <p className="text-sm">{message.content}</p>
                    </div>
                    
                    <span className="text-xs text-gray-400 mt-1">
                      {formatTime(message.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-2" aria-label="Send message">
          <Button variant="ghost" size="sm" icon={<Paperclip />} />
          <Input
            value={newMessage}
            onChange={handleTyping}
            placeholder="Type a message..."
            className="flex-1"
            aria-label="Message input"
          />
          <Button variant="ghost" size="sm" icon={<Smile />} />
          <Button 
            type="submit" 
            variant="primary" 
            size="sm" 
            icon={<Send />}
            disabled={!newMessage.trim()}
          />
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;

