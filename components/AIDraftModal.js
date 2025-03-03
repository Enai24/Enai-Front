import React from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { toast } from 'react-toastify';

const AIDraftModal = ({ isOpen, onClose, draft }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 text-gray-100 p-6 rounded-lg w-11/12 md:w-2/3 lg:w-1/2">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">AI-Generated Email Draft</h2>
          <button onClick={onClose} className="text-red-500 hover:text-red-700">×</button>
        </div>
        <ReactQuill value={draft} readOnly className="bg-gray-700 text-white rounded" modules={{ toolbar: false }} />
        <div className="flex justify-end mt-4 gap-2">
          <button onClick={() => navigator.clipboard.writeText(draft).then(() => toast.success('Copied!'))} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded">Copy</button>
          <button onClick={onClose} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">Close</button>
        </div>
      </div>
    </div>
  );
};

export default AIDraftModal;