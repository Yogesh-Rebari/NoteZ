import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { api } from '../../utils/api';
import LoadingSpinner from '../common/LoadingSpinner';

const Sidebar = ({ currentGroup, onGroupSelect }) => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await api.get('/groups/my-groups');
        setGroups(res.data.groups || []);
      } catch (e) {
        // Fail silently; main content can continue
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <aside className="h-full flex flex-col" role="navigation" aria-label="Groups sidebar">
      <div className="p-4 border-b">
        <h2 className="text-sm font-semibold text-gray-700">Your Groups</h2>
      </div>
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <LoadingSpinner label="Loading groups..." />
        ) : groups.length === 0 ? (
          <div className="p-4 text-sm text-gray-500">No groups yet</div>
        ) : (
          <ul className="p-2 space-y-1">
            {groups.map((g) => (
              <li key={g._id}>
                <button
                  className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                    currentGroup === g._id ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-100'
                  }`}
                  onClick={() => onGroupSelect?.(g)}
                  aria-current={currentGroup === g._id ? 'page' : undefined}
                >
                  <div className="text-sm font-medium truncate">{g.name}</div>
                  <div className="text-xs text-gray-500 truncate">{g.description}</div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
};

Sidebar.propTypes = {
  currentGroup: PropTypes.string,
  onGroupSelect: PropTypes.func,
};

export default Sidebar;
