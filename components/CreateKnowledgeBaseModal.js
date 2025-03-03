/**
 * @description
 *   This component provides a modal dialog for creating a new Knowledge Base entry.
 *   It allows users to input a required "Name", an optional "Description", additional
 *   input data via a text area, and optionally upload a file. The component validates inputs,
 *   handles file type/size restrictions, and submits the data using FormData to the backend.
 *
 *   On successful creation, it triggers a refresh via the onSuccess callback and closes the modal.
 *
 * @notes
 *   - Ensure that the createVectorStore function in ../../services/api supports FormData uploads.
 *   - This component uses Headless UI's Dialog for accessibility and react-toastify for notifications.
 */

import React, { useState, useEffect, useRef } from 'react';
import { Dialog } from '@headlessui/react';
import { toast } from 'react-toastify';
import { createVectorStore } from '../services/api';

function CreateKnowledgeBaseModal({ isOpen = false, onClose, onSuccess }) {
  // State variables for form fields.
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [text, setText] = useState(''); // Additional input data when no file is uploaded.
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const isMountedRef = useRef(true);

  // Clean-up effect to avoid memory leaks.
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Handles file selection and validates file type/size.
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) {
      setFile(null);
      return;
    }
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
    const acceptedFileTypes = [
      "text/plain",
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
      "application/msword", // .doc
      "text/csv",
      "text/plain",
    ];
    if (!acceptedFileTypes.includes(selectedFile.type)) {
      toast.error("Invalid file type!");
      setFile(null);
      return;
    }
    if (selectedFile.size >= MAX_FILE_SIZE) {
      toast.error("Maximum allowed file size exceeded. Please choose a smaller file.");
      setFile(null);
      return;
    }
    setFile(selectedFile);
  };

  // Handles a successful knowledge base creation.
  const handleSuccess = () => {
    if (isMountedRef.current) {
      if (onSuccess) onSuccess();
      toast.success("Knowledge Base created successfully.");
      if (onClose) onClose();
    }
  };

  // Handles form submission.
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Knowledge Base name is required.");
      return;
    }
    // Ensure at least one source of data is provided.
    if (!file && !text.trim()) {
      toast.error("Upload Data missing! Provide a file or input data.");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('description', description);
      
      // Append file if provided; otherwise, append text data.
      if (file) {
        formData.append('file', file);
      } else {
        formData.append('text', text);
      }

      const result = await createVectorStore(formData);
      handleSuccess();
    } catch (error) {
      console.error("Error creating Knowledge Base:", error);
      toast.error("Failed to create Knowledge Base.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed inset-0 z-50 overflow-y-auto">
      <div className="min-h-screen px-4 text-center">
        <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />
        <span className="inline-block h-screen align-middle" aria-hidden="true">&#8203;</span>
        <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-gray-800 shadow-xl rounded-lg">
          <Dialog.Title as="h3" className="text-lg font-bold text-white">
            Create Knowledge Base
          </Dialog.Title>
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            {/* Name Field */}
            <div>
              <label className="block text-sm font-medium text-gray-300">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full p-2 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-blue-500"
                required
              />
            </div>
            {/* Description Field */}
            <div>
              <label className="block text-sm font-medium text-gray-300">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1 block w-full p-2 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-blue-500"
                rows="3"
              />
            </div>
            {/* Input Data Field */}
            <div>
              <label className="block text-sm font-medium text-gray-300">
                Input Data
              </label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="mt-1 block w-full p-2 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-blue-500"
                rows="3"
              />
            </div>
            {/* File Upload Field */}
            <div>
              <label className="block text-sm font-medium text-gray-300">
                Upload File (Optional)
              </label>
              <input
                type="file"
                onChange={handleFileChange}
                className="mt-1 block w-full text-gray-200"
                multiple={false}
              />
            </div>
            {/* Action Buttons */}
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={uploading}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                {uploading ? "Creating..." : "Create"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Dialog>
  );
}

export default CreateKnowledgeBaseModal;