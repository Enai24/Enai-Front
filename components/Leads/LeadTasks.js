import React, { useState } from 'react';

const LeadTasks = ({ tasks, onAddTask }) => {
  const [newTask, setNewTask] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    onAddTask(newTask);
    setNewTask('');
  };

  return (
    <div className="bg-gray-800 p-4 rounded shadow mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">Tasks</h2>
        <button className="text-sm text-blue-400 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-400" disabled>Manage Tasks</button>
      </div>
      {tasks && tasks.length > 0 ? (
        tasks.map(task => (
          <div key={task.id} className="flex items-center justify-between p-4 bg-gray-700 rounded mb-3">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={task.status === 'completed'}
                className="h-4 w-4 text-blue-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                readOnly
              />
              <span className="text-sm text-white">{task.name}</span>
              <span className="px-2 py-1 text-xs rounded-full bg-green-600 text-white">{task.status}</span>
            </div>
            <span className="text-sm text-gray-400">{new Date(task.created_at).toLocaleDateString()}</span>
          </div>
        ))
      ) : (
        <p className="text-gray-400">No tasks available.</p>
      )}
      <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Add new task"
          className="px-2 py-1 rounded border border-gray-600 bg-gray-800 text-white w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
          aria-label="New task title"
        />
        <button type="submit" className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400">
          Add
        </button>
      </form>
    </div>
  );
};

export default React.memo(LeadTasks);