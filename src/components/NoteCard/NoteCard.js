
import React from 'react';
import PropTypes from 'prop-types';
import './NoteCard.css';

/**
 * NoteCard component displays a single note with responsive and accessible design.
 * @param {Object} props
 * @param {Object} props.note - Note data
 * @param {Function} [props.onClick] - Click handler
 */
const NoteCard = ({ note, onClick }) => {
	return (
		<div
			className="note-card bg-white rounded-lg shadow-md p-4 mb-4 cursor-pointer hover:shadow-lg transition-all flex flex-col"
			tabIndex={0}
			role="button"
			aria-label={`Open note: ${note.title}`}
			onClick={onClick}
			onKeyPress={e => (e.key === 'Enter' || e.key === ' ') && onClick && onClick()}
		>
			<h3 className="text-lg font-semibold mb-2" aria-label="Note title">{note.title}</h3>
			<p className="text-gray-700 flex-1" aria-label="Note content">{note.content}</p>
			{note.tags && (
				<div className="mt-2 flex flex-wrap gap-1" aria-label="Note tags">
					{note.tags.map(tag => (
						<span key={tag} className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">{tag}</span>
					))}
				</div>
			)}
			<div className="mt-2 text-xs text-gray-400" aria-label="Note date">
				{new Date(note.updatedAt || note.createdAt).toLocaleString()}
			</div>
		</div>
	);
};

NoteCard.propTypes = {
	note: PropTypes.object.isRequired,
	onClick: PropTypes.func,
};

export default NoteCard;

