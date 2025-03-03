// src/components/TagsInput.js
import React, { useState } from 'react';

const TagsInput = ({ tags = [], onAddTag, onRemoveTag }) => {
  const [tagInput, setTagInput] = useState('');

  const handleAddTag = () => {
    if (!tagInput.trim()) return;
    onAddTag(tagInput.trim());
    setTagInput('');
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <input
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={(e) => (e.key === 'Enter' ? handleAddTag() : null)}
          placeholder="Add tag"
          className="bg-gray-700 text-gray-200 px-3 py-1 border border-gray-600 rounded"
        />
        <button
          onClick={handleAddTag}
          className="bg-blue-600 text-white px-3 py-1 rounded"
        >
          Add
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span
            key={tag}
            className="px-2 py-1 bg-green-700 text-white rounded text-xs flex items-center gap-1"
          >
            {tag}
            <button
              onClick={() => onRemoveTag(tag)}
              className="text-red-200 hover:text-red-400"
            >
              ×
            </button>
          </span>
        ))}
      </div>
    </div>
  );
};

export default TagsInput;