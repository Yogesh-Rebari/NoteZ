import React, { useState } from 'react';
import { Bell, MessageCircle, Bot, Menu, X, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../hooks/useToast';
import Sidebar from '../Sidebar/Sidebar';
import ChatInterface from '../Chat/ChatInterface';
import AIChatbot from '../AI/AIChatbot';
import NotificationCenter from '../Notifications/NotificationCenter';
import Button from '../common/Button';
import Badge from '../common/Badge';

/**
 * Main layout component with sidebar, chat, and AI features
 */
const MainLayout = ({ children, currentGroup, currentGroupName }) => {
  const { user, logout } = useAuth();
  const { success } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const [aiChatOpen, setAiChatOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  const handleLogout = async () => {
    try {
      await logout();
      success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleChat = () => {
    setChatOpen(!chatOpen);
    if (chatOpen) {
      setAiChatOpen(false);
    }
  };

  const toggleAIChat = () => {
    setAiChatOpen(!aiChatOpen);
    if (aiChatOpen) {
      setChatOpen(false);
    }
  };

  const toggleNotifications = () => {
    setNotificationsOpen(!notificationsOpen);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <div className="absolute inset-0 bg-gray-600 opacity-75" />
        </div>
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:inset-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <Sidebar 
          currentGroup={currentGroup}
          onGroupSelect={(group) => {
            setChatOpen(false);
            setAiChatOpen(false);
          }}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navigation */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleSidebar}
                icon={sidebarOpen ? <X /> : <Menu />}
                className="lg:hidden"
              />
              
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {currentGroupName || 'NoteZ'}
                </h1>
                {currentGroup && (
                  <p className="text-sm text-gray-500">
                    Group workspace
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {/* Chat Toggle */}
              {currentGroup && (
                <Button
                  variant={chatOpen ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={toggleChat}
                  icon={<MessageCircle />}
                  title="Group Chat"
                />
              )}

              {/* AI Chat Toggle */}
              {currentGroup && (
                <Button
                  variant={aiChatOpen ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={toggleAIChat}
                  icon={<Bot />}
                  title="AI Assistant"
                />
              )}

              {/* Notifications */}
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleNotifications}
                  icon={<Bell />}
                  title="Notifications"
                />
                {unreadNotifications > 0 && (
                  <Badge
                    variant="danger"
                    size="sm"
                    className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center text-xs"
                  >
                    {unreadNotifications > 99 ? '99+' : unreadNotifications}
                  </Badge>
                )}
              </div>

              {/* User Menu */}
              <div className="relative group">
                <button className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {user?.username?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="hidden md:block text-sm font-medium text-gray-700">
                    {user?.username}
                  </span>
                </button>

                {/* Dropdown Menu */}
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="py-1">
                    <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      <Settings className="w-4 h-4 mr-2" />
                      Settings
                    </button>
                    <button 
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 flex overflow-hidden">
          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {children}
          </div>

          {/* Chat Panel */}
          {chatOpen && currentGroup && (
            <div className="w-80 border-l border-gray-200 bg-white">
              <ChatInterface
                groupId={currentGroup}
                groupName={currentGroupName}
                isOpen={chatOpen}
                onClose={() => setChatOpen(false)}
              />
            </div>
          )}

          {/* AI Chat Panel */}
          {aiChatOpen && currentGroup && (
            <div className="w-80 border-l border-gray-200">
              <AIChatbot
                groupId={currentGroup}
                isOpen={aiChatOpen}
                onClose={() => setAiChatOpen(false)}
              />
            </div>
          )}
        </main>
      </div>

      {/* Notification Center */}
      <NotificationCenter
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
      />
    </div>
  );
};

export default MainLayout;

