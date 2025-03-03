import React, { useState } from 'react';
import { toast } from 'react-toastify';

const DocumentUpload = ({ onUpload }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file to upload.');
      return;
    }
    setUploading(true);
    const formData = new FormData();
    formData.append('document', file);
    try {
      await onUpload(formData);
      setFile(null);
    } catch (err) {
      toast.error('Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <input
        type="file"
        onChange={handleFileChange}
        className="text-gray-300"
        disabled={uploading}
      />
      {file && <span className="text-sm text-gray-400">{file.name}</span>}
      <button
        onClick={handleUpload}
        disabled={uploading}
        className={`ml-2 px-3 py-1 bg-blue-600 text-white rounded ${uploading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'}`}
      >
        {uploading ? 'Uploading...' : 'Upload'}
      </button>
    </div>
  );
};

export default React.memo(DocumentUpload);