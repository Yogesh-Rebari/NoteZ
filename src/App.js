
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import { ToastContainer } from './components/common/Toast';
import { useToast } from './hooks/useToast';
import MainLayout from './components/Layout/MainLayout';
import Home from './pages/Home';
import Group from './pages/Group';
import Notes from './pages/Notes';
import Login from './pages/Login';
import Register from './pages/Register';
import './App.css';

/**
 * Main App component that sets up routing and authentication context
 * Provides protected routes for authenticated users
 */

function App() {
  const { toasts, removeToast } = useToast();
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
          <div className="App">
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              {/* Protected routes */}
              <Route path="/" element={
                <ProtectedRoute>
                  <MainLayout>
                    <Home />
                  </MainLayout>
                </ProtectedRoute>
              } />
              <Route path="/group/:groupId" element={
                <ProtectedRoute>
                  <MainLayout>
                    <Group />
                  </MainLayout>
                </ProtectedRoute>
              } />
              <Route path="/notes" element={
                <ProtectedRoute>
                  <MainLayout>
                    <Notes />
                  </MainLayout>
                </ProtectedRoute>
              } />
              {/* Redirect to home for unknown routes */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
          </div>
        </Router>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;


