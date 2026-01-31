import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../utils/api';
import { useToast } from '../hooks/useToast';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Input from '../components/common/Input';
import Badge from '../components/common/Badge';

function Notes() {
  const { error } = useToast();
  const [searchParams] = useSearchParams();
  const groupId = searchParams.get('group');

  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState({ category: '', author: '', tags: '' });

  const debouncedQuery = useMemo(() => query, [query]);


  useEffect(() => {
    const fetchNotes = async () => {
      if (!groupId) return;
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (debouncedQuery) params.set('q', debouncedQuery);
        if (filters.category) params.set('category', filters.category);
        if (filters.author) params.set('author', filters.author);
        if (filters.tags) params.set('tags', filters.tags);

        const url = debouncedQuery
          ? `/notes/groups/${groupId}/search?${params.toString()}`
          : `/notes/groups/${groupId}?${params.toString()}`;

        const res = await api.get(url);
        setNotes(res.data.notes || []);
      } catch (e) {
        error(e.message || 'Failed to load notes');
      } finally {
        setLoading(false);
      }
    };
    fetchNotes();
  }, [groupId, debouncedQuery, filters.category, filters.author, filters.tags, error]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  if (!groupId) {
    return (
      <div className="p-4">
        <Badge variant="warning">Select a group to view notes</Badge>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b bg-white">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <Input
            placeholder="Search notes..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search notes"
          />
          <Input name="category" placeholder="Category" value={filters.category} onChange={handleFilterChange} />
          <Input name="tags" placeholder="Tags (comma-separated)" value={filters.tags} onChange={handleFilterChange} />
          <Input name="author" placeholder="Author ID" value={filters.author} onChange={handleFilterChange} />
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center"><LoadingSpinner /></div>
      ) : (
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {notes.length === 0 ? (
            <div className="text-center text-gray-500">No notes found</div>
          ) : (
            notes.map((note) => (
              <div key={note._id} className="bg-white border rounded-lg p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">{note.title}</h3>
                  {note.isPinned && <Badge variant="info">Pinned</Badge>}
                </div>
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">{note.preview || note.content?.slice(0, 180)}</p>
                <div className="flex flex-wrap gap-2 mt-3">
                  {note.tags?.map((t) => (
                    <Badge key={t} variant="secondary" size="sm">#{t}</Badge>
                  ))}
                </div>
                <div className="text-xs text-gray-400 mt-2">Views: {note.stats?.viewCount || 0} • Likes: {note.stats?.likeCount || 0}</div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default Notes;


