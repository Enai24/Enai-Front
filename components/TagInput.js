// src/components/TagsInput.jsx
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Plus, X } from 'lucide-react';

const TagsInput = ({ tags, onAddTag, onRemoveTag }) => {
  const [input, setInput] = useState('');

  const handleAddTag = () => {
    const trimmed = input.trim();
    if (trimmed && !tags.includes(trimmed)) {
      onAddTag(trimmed);
      setInput('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow flex items-center gap-2">
      <h2 className="text-lg font-medium text-gray-200">Tags</h2>
      <div className="flex-1 relative">
        <input
          type="text"
          placeholder="Add a tag..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
        <button
          onClick={handleAddTag}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-indigo-400 hover:text-indigo-500"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag, index) => (
          <span key={index} className="flex items-center px-3 py-1 bg-indigo-600 text-white rounded-full text-sm">
            {tag}
            <X
              className="ml-1 h-3 w-3 cursor-pointer hover:text-red-500"
              onClick={() => onRemoveTag(tag)}
            />
          </span>
        ))}
      </div>
    </div>
  );
};

TagsInput.propTypes = {
  tags: PropTypes.arrayOf(PropTypes.string).isRequired,
  onAddTag: PropTypes.func.isRequired,
  onRemoveTag: PropTypes.func.isRequired,
};

export default TagsInput;