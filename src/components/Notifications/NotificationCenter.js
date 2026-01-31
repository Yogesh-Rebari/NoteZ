import React, { useState, useEffect } from 'react';
import { Bell, Check, Trash2, X, Archive, MoreVertical } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../utils/api';
import { useToast } from '../../hooks/useToast';
import Button from '../common/Button';
import Badge from '../common/Badge';
import Modal from '../common/Modal';

/**
 * Notification Center component
 */
const NotificationCenter = ({ isOpen, onClose }) => {
  const { success, error } = useToast();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all'); // all, unread, read

  const fetchNotifications = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get('/notifications');
      setNotifications(data.data.notifications);
      setUnreadCount(data.data.notifications.filter(n => !n.isRead).length);
    } catch (err) {
      error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, [error]);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen, fetchNotifications]);

  const markAsRead = async (notificationId) => {
    try {
      await api.put(`/notifications/${notificationId}/read`);
      setNotifications(prev => 
        prev.map(n => 
          n._id === notificationId ? { ...n, isRead: true } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      error('Failed to mark notification as read');
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/mark-all-read');
      setNotifications(prev => 
        prev.map(n => ({ ...n, isRead: true }))
      );
      setUnreadCount(0);
      success('All notifications marked as read');
    } catch (err) {
      error('Failed to mark all notifications as read');
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await api.delete(`/notifications/${notificationId}`);
      setNotifications(prev => prev.filter(n => n._id !== notificationId));
      setUnreadCount(prev => {
        const notification = notifications.find(n => n._id === notificationId);
        return notification && !notification.isRead ? prev - 1 : prev;
      });
    } catch (err) {
      error('Failed to delete notification');
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'note_created':
        return '📝';
      case 'note_updated':
        return '✏️';
      case 'group_invite':
        return '👥';
      case 'chat_message':
        return '💬';
      case 'chat_mention':
        return '🔔';
      case 'ai_response':
        return '🤖';
      default:
        return '📢';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'note_created':
      case 'note_updated':
        return 'text-blue-600';
      case 'group_invite':
        return 'text-green-600';
      case 'chat_message':
      case 'chat_mention':
        return 'text-purple-600';
      case 'ai_response':
        return 'text-indigo-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatTime = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now - time) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return time.toLocaleDateString();
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.isRead;
    if (filter === 'read') return notification.isRead;
    return true;
  });

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bell className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold">Notifications</h2>
            {unreadCount > 0 && (
              <Badge variant="danger" size="sm">
                {unreadCount}
              </Badge>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                icon={<Check />}
              >
                Mark all read
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              icon={<X />}
            />
          </div>
        </div>

        {/* Filters */}
        <div className="flex space-x-2">
          <Button
            variant={filter === 'all' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            All
          </Button>
          <Button
            variant={filter === 'unread' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setFilter('unread')}
          >
            Unread
          </Button>
          <Button
            variant={filter === 'read' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setFilter('read')}
          >
            Read
          </Button>
        </div>

        {/* Notifications List */}
        <div className="max-h-96 overflow-y-auto space-y-2">
          {loading ? (
            <div className="text-center py-8 text-gray-500">
              Loading notifications...
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No notifications found
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <div
                key={notification._id}
                className={`
                  p-3 rounded-lg border transition-colors
                  ${notification.isRead 
                    ? 'bg-gray-50 border-gray-200' 
                    : 'bg-blue-50 border-blue-200'
                  }
                `}
              >
                <div className="flex items-start space-x-3">
                  <span className="text-lg">
                    {getNotificationIcon(notification.type)}
                  </span>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className={`text-sm font-medium ${getNotificationColor(notification.type)}`}>
                        {notification.title}
                      </h4>
                      <span className="text-xs text-gray-400">
                        {formatTime(notification.createdAt)}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 mt-1">
                      {notification.message}
                    </p>
                    
                    {notification.actions && notification.actions.length > 0 && (
                      <div className="flex space-x-2 mt-2">
                        {notification.actions.map((action, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              // Handle action
                              console.log('Action:', action);
                            }}
                          >
                            {action.label}
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    {!notification.isRead && (
                      <button
                        onClick={() => markAsRead(notification._id)}
                        className="text-gray-400 hover:text-gray-600"
                        title="Mark as read"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => deleteNotification(notification._id)}
                      className="text-gray-400 hover:text-red-600"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Modal>
  );
};

export default NotificationCenter;

