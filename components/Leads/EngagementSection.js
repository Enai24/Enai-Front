import React, { useState } from 'react';
import { toast } from 'react-toastify';

const EngagementSection = ({ lead, handleAddTag, handleRemoveTag }) => {
  const [tagInput, setTagInput] = useState('');

  const onTagSubmit = (e) => {
    e.preventDefault();
    const tag = tagInput.trim();
    if (!tag) {
      toast.error("Tag cannot be empty.");
      return;
    }
    handleAddTag(tag);
    setTagInput('');
  };

  return (
    <aside className="space-y-4 p-4 bg-gray-800 rounded shadow">
      <h2 className="text-lg font-semibold text-white">Engagement & Tags</h2>
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 rounded-full border-4 border-blue-500 flex items-center justify-center">
          <span className="text-xl font-bold text-blue-400">{lead.interaction_count || 0}</span>
        </div>
        <div className="w-full">
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full"
              style={{ width: `${Math.min(lead.interaction_count * 10, 100)}%` }}
            />
          </div>
          <p className="text-xs text-gray-400 mt-1">Interaction Count</p>
        </div>
      </div>
      <p><strong className="text-white">Open Rate:</strong> {lead.email_open_rate || 0}%</p>
      <p><strong className="text-white">Click Count:</strong> {lead.click_count || 0}</p>
      {lead.tags && lead.tags.length > 0 && (
        <div>
          <strong className="text-white">Tags:</strong>
          <div className="flex flex-wrap gap-2 mt-1">
            {lead.tags.map((tag, idx) => (
              <span key={idx} className="px-3 py-1 bg-gray-700 rounded-full text-sm text-white flex items-center">
                {tag}
                <button
                  onClick={() => handleRemoveTag(tag)}
                  className="ml-1 text-red-500 hover:text-red-700"
                  aria-label={`Remove tag ${tag}`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
      <form onSubmit={onTagSubmit} className="flex gap-2 mt-2">
        <input
          type="text"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          placeholder="Add new tag"
          className="px-2 py-1 rounded border border-gray-600 bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
          aria-label="New tag input"
        />
        <button type="submit" className="px-3 py-1 bg-gray-600 text-sm rounded hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400">
          Add Tag
        </button>
      </form>
    </aside>
  );
};

export default React.memo(EngagementSection);