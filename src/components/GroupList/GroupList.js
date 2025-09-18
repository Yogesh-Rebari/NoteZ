
import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import './GroupList.css';

/**
 * GroupList component with search and filter, responsive and accessible.
 * @param {Object} props
 * @param {Array} props.groups - List of group objects
 * @param {Function} [props.onSelect] - Handler for selecting a group
 */
const GroupList = ({ groups, onSelect }) => {
	const [search, setSearch] = useState('');
	const [filter, setFilter] = useState('all');

	const filteredGroups = useMemo(() => {
		let result = groups;
		if (search) {
			result = result.filter(g => g.name.toLowerCase().includes(search.toLowerCase()));
		}
		if (filter !== 'all') {
			result = result.filter(g => g.type === filter);
		}
		return result;
	}, [groups, search, filter]);

	return (
		<div className="group-list-container w-full max-w-xs p-2" aria-label="Group list">
			<div className="flex gap-2 mb-2">
				<input
					type="text"
					className="input input-bordered flex-1"
					placeholder="Search groups..."
					aria-label="Search groups"
					value={search}
					onChange={e => setSearch(e.target.value)}
				/>
				<select
					className="input input-bordered"
					aria-label="Filter groups"
					value={filter}
					onChange={e => setFilter(e.target.value)}
				>
					<option value="all">All</option>
					<option value="public">Public</option>
					<option value="private">Private</option>
				</select>
			</div>
			<ul className="group-list divide-y divide-gray-200" role="listbox">
				{filteredGroups.map(group => (
					<li
						key={group._id}
						className="group-item py-2 px-3 hover:bg-gray-100 rounded cursor-pointer"
						tabIndex={0}
						role="option"
						aria-label={`Select group: ${group.name}`}
						onClick={() => onSelect && onSelect(group)}
						onKeyPress={e => (e.key === 'Enter' || e.key === ' ') && onSelect && onSelect(group)}
					>
						<span className="font-medium">{group.name}</span>
						{group.unreadCount > 0 && (
							<span className="ml-2 bg-blue-500 text-white rounded-full px-2 py-0.5 text-xs" aria-label="Unread messages">
								{group.unreadCount}
							</span>
						)}
					</li>
				))}
				{filteredGroups.length === 0 && (
					<li className="text-gray-400 py-2 px-3">No groups found</li>
				)}
			</ul>
		</div>
	);
};

GroupList.propTypes = {
	groups: PropTypes.array.isRequired,
	onSelect: PropTypes.func,
};

export default GroupList;

