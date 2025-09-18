import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/useToast';
import Button from '../components/common/Button';
import { Plus, Users, FileText, Bot } from 'lucide-react';

/**
 * Home page component - main dashboard
 */
const Home = () => {
  const { user } = useAuth();
  const { success } = useToast();

  const handleCreateGroup = () => {
    success('Create group feature coming soon!');
  };

  const handleCreateNote = () => {
    success('Create note feature coming soon!');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">
              Welcome to NoteZ, {user?.username || 'User'}!
            </h1>
            <p className="text-xl mb-8 text-blue-100">
              Your collaborative note-taking platform with AI assistance
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                variant="outline"
                size="lg"
                icon={<Plus />}
                onClick={handleCreateGroup}
                className="bg-white text-blue-600 hover:bg-blue-50"
              >
                Create Group
              </Button>
              <Button
                variant="outline"
                size="lg"
                icon={<FileText />}
                onClick={handleCreateNote}
                className="bg-white text-blue-600 hover:bg-blue-50"
              >
                Create Note
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Everything you need for collaborative learning
          </h2>
          <p className="text-lg text-gray-600">
            NoteZ combines powerful note-taking with AI assistance and real-time collaboration
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Feature 1 */}
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Group Collaboration</h3>
            <p className="text-gray-600">
              Create study groups and collaborate with classmates in real-time
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <FileText className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Smart Notes</h3>
            <p className="text-gray-600">
              Organize your notes with categories, tags, and powerful search
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Bot className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Assistant</h3>
            <p className="text-gray-600">
              Get AI-powered summaries, quizzes, and study suggestions
            </p>
          </div>

          {/* Feature 4 */}
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Users className="w-6 h-6 text-yellow-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Real-time Chat</h3>
            <p className="text-gray-600">
              Communicate with your group members instantly
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <Button
              variant="outline"
              size="lg"
              icon={<Plus />}
              onClick={handleCreateGroup}
              className="h-20 flex-col space-y-2"
            >
              <span className="text-lg font-semibold">Create New Group</span>
              <span className="text-sm text-gray-500">Start a new study group</span>
            </Button>
            
            <Button
              variant="outline"
              size="lg"
              icon={<FileText />}
              onClick={handleCreateNote}
              className="h-20 flex-col space-y-2"
            >
              <span className="text-lg font-semibold">Create New Note</span>
              <span className="text-sm text-gray-500">Start taking notes</span>
            </Button>
            
            <Button
              variant="outline"
              size="lg"
              icon={<Users />}
              onClick={() => success('Join group feature coming soon!')}
              className="h-20 flex-col space-y-2"
            >
              <span className="text-lg font-semibold">Join Group</span>
              <span className="text-sm text-gray-500">Join existing groups</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;