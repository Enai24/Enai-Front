// src/components/SendAnalysisModal.js
import React from 'react';
import { X } from 'lucide-react';

const SendAnalysisModal = ({ isOpen, closeModal, onConfirm, call }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-xl p-6 w-[500px]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">Start Analysis</h2>
          <button onClick={closeModal} className="text-gray-400 hover:text-white cursor-pointer">
            <X size={20} />
          </button>
        </div>
        <p className="text-gray-300 mb-6">Do you want to start analysis for this call?</p>
        <div className="flex justify-end space-x-4">
          <button onClick={closeModal} className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg">
            Cancel
          </button>
          <button onClick={onConfirm} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default SendAnalysisModal;