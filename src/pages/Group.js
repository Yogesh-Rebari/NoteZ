import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../utils/api';
import { useToast } from '../hooks/useToast';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ChatInterface from '../components/Chat/ChatInterface';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';

function Group() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { error, success } = useToast();
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(false);
  const [chatOpen, setChatOpen] = useState(true);

  const fetchGroup = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/groups/${groupId}`);
      setGroup(res.data.group);
    } catch (e) {
      error(e.message || 'Failed to load group');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (groupId) fetchGroup();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupId]);

  if (loading) return <div className="flex-1 flex items-center justify-center"><LoadingSpinner /></div>;
  if (!group) return null;

  return (
    <div className="h-full grid grid-cols-1 lg:grid-cols-3">
      <div className="lg:col-span-2 flex flex-col">
        <div className="p-4 border-b bg-white flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{group.name}</h2>
            <p className="text-sm text-gray-600">{group.description}</p>
            <div className="mt-2 flex items-center gap-2">
              <Badge variant="secondary" size="sm">Members: {group.stats?.memberCount || 0}</Badge>
              <Badge variant="secondary" size="sm">Notes: {group.stats?.noteCount || 0}</Badge>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link to={`/notes?group=${groupId}`}><Button variant="outline" size="sm">View Notes</Button></Link>
            <Button variant="primary" size="sm" onClick={() => setChatOpen(true)}>Open Chat</Button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {/* Placeholder: group dashboard/widgets */}
          <div className="text-gray-500">Select "View Notes" to browse notes or open chat to start messaging.</div>
        </div>
      </div>
      <div className="lg:col-span-1 border-l">
        <ChatInterface groupId={groupId} groupName={group.name} isOpen={chatOpen} onClose={() => setChatOpen(false)} />
      </div>
    </div>
  );
}

export default Group;


