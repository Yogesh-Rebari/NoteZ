import React, { useState, useEffect, useRef } from 'react';
import { Bot, Send, Loader2, Sparkles, BookOpen, Lightbulb } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../utils/api';
import { useToast } from '../../hooks/useToast';
import Button from '../common/Button';
import Input from '../common/Input';
import Badge from '../common/Badge';

/**
 * AI Chatbot component for study assistance
 */
const AIChatbot = ({ groupId, isOpen, onClose }) => {
  const { user } = useAuth();
  const { error } = useToast();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [personality, setPersonality] = useState('helpful');
  const [studyMode, setStudyMode] = useState(false);
  const messagesEndRef = useRef(null);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize with welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        id: 'welcome',
        type: 'ai',
        content: `Hello ${user?.username}! I'm your AI study assistant. I can help you with:\n\n• Summarizing notes\n• Generating quiz questions\n• Explaining concepts\n• Study suggestions\n• Note improvements\n\nHow can I help you today?`,
        timestamp: new Date()
      }]);
    }
  }, [isOpen, user, messages.length]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const data = await api.post(`/ai/chat/${groupId}`, {
        message: userMessage.content,
        personality,
        studyMode,
      });
      
      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: data.data.response.message,
        timestamp: new Date(),
        personality: data.data.response.personality,
        studyMode: data.data.response.studyMode
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (err) {
      error(err.message || 'Failed to get AI response. Please try again.');
      console.error('AI Chat error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = async (action) => {
    const actions = {
      summarize: 'Can you summarize the recent notes in this group?',
      quiz: 'Generate some quiz questions from the group notes',
      explain: 'Explain the main concepts discussed in recent notes',
      improve: 'Suggest improvements for better note organization',
      study: 'Give me study tips for this subject'
    };

    setInputMessage(actions[action]);
  };

  const getPersonalityIcon = () => {
    switch (personality) {
      case 'casual':
        return '😊';
      case 'professional':
        return '🎓';
      case 'creative':
        return '🎨';
      default:
        return '🤖';
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (!isOpen) return null;

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-blue-50 to-indigo-100" role="dialog" aria-label="AI Study Assistant" aria-modal="true">
      {/* AI Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">AI Study Assistant</h3>
            <div className="flex items-center space-x-2">
              <Badge variant="info" size="sm">
                {getPersonalityIcon()} {personality}
              </Badge>
              {studyMode && (
                <Badge variant="warning" size="sm">
                  <BookOpen className="w-3 h-3 mr-1" />
                  Study Mode
                </Badge>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <select
            value={personality}
            onChange={(e) => setPersonality(e.target.value)}
            className="text-sm border border-gray-300 rounded px-2 py-1"
          >
            <option value="helpful">Helpful</option>
            <option value="casual">Casual</option>
            <option value="professional">Professional</option>
            <option value="creative">Creative</option>
          </select>
          
          <Button
            variant={studyMode ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setStudyMode(!studyMode)}
            icon={<BookOpen />}
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-3 bg-white border-b border-gray-200" role="region" aria-label="Quick actions">
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleQuickAction('summarize')}
            icon={<Sparkles />}
          >
            Summarize
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleQuickAction('quiz')}
            icon={<BookOpen />}
          >
            Quiz
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleQuickAction('explain')}
            icon={<Lightbulb />}
          >
            Explain
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleQuickAction('improve')}
            icon={<Sparkles />}
          >
            Improve
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4" role="log" aria-live="polite" aria-relevant="additions text">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex max-w-xs lg:max-w-md ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              {message.type === 'ai' && (
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-2">
                  <Bot className="w-4 h-4 text-white" />
                </div>
              )}
              
              <div className={`flex flex-col ${message.type === 'user' ? 'items-end' : 'items-start'}`}>
                <div
                  className={`
                    px-4 py-2 rounded-2xl
                    ${message.type === 'user' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-white text-gray-900 shadow-sm border'
                    }
                  `}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
                
                <span className="text-xs text-gray-400 mt-1">
                  {formatTime(message.timestamp)}
                </span>
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start" role="status" aria-live="polite">
            <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-2xl shadow-sm border">
              <Loader2 className="w-4 h-4 animate-spin text-blue-500" aria-hidden="true" />
              <span className="text-sm text-gray-600">AI is thinking...</span>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-2" aria-label="Send AI message">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Ask me anything about your notes..."
            className="flex-1"
            aria-label="AI message input"
            disabled={isLoading}
          />
          <Button 
            type="submit" 
            variant="primary" 
            size="sm" 
            icon={<Send />}
            disabled={!inputMessage.trim() || isLoading}
            loading={isLoading}
          />
        </form>
      </div>
    </div>
  );
};

export default AIChatbot;

