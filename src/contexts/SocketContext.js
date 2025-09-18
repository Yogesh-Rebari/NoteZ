import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { useToast } from '../hooks/useToast';

const SocketContext = createContext(null);

export const useSocket = () => {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error('useSocket must be used within SocketProvider');
  return ctx;
};

export const SocketProvider = ({ children }) => {
  const { token, isAuthenticated, loading: authLoading } = useAuth();
  const { info } = useToast();
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated || !token) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setConnected(false);
      return;
    }

    const socket = io(process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:3001', {
      auth: { token },
      autoConnect: true,
      transports: ['websocket'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
      console.log('Socket.io connected:', socket.id);
    });

    socket.on('disconnect', () => {
      setConnected(false);
      console.log('Socket.io disconnected');
    });

    socket.on('connect_error', (err) => {
      console.error('Socket.io connection error:', err.message);
    });

    // Global notification events
    socket.on('notification', (notification) => {
      if (notification?.title) {
        info(`${notification.title}: ${notification.message || ''}`);
      }
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [isAuthenticated, token, authLoading, info]);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, connected }}>
      {children}
    </SocketContext.Provider>
  );
};

SocketProvider.propTypes = {
  children: PropTypes.node.isRequired,
};



