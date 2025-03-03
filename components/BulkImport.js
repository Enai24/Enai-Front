import React, { useState } from 'react';
import { uploadLeadsCSV } from '../services/api';
import { toast } from 'react-toastify';
import { Upload, File, XCircle } from 'lucide-react';

const BulkImport = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
    setUploadError(null);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Please select a file first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    setIsLoading(true);
    setUploadError(null);
    try {
      const response = await uploadLeadsCSV(formData);
      toast.success(response.message);
      setSelectedFile(null);
    } catch (error) {
      console.error("Error uploading leads:", error);
      let errorMessage = "Error uploading leads.";

      if (error.response) {
        if (error.response.data && error.response.data.error) {
          errorMessage = error.response.data.error;
        }
      }
      setUploadError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 bg-gray-800 text-white rounded-lg shadow-md w-full max-w-sm mx-auto">
      <h2 className="text-lg font-semibold mb-3 text-center">Bulk Import Leads</h2>
      
      {/* File selection and Upload Buttons */}
      <div className="flex flex-col space-y-3">
        <input
          type="file"
          id="fileInput"
          onChange={handleFileChange}
          accept=".csv,.xlsx"
          className="hidden"
        />
        <label
          htmlFor="fileInput"
          className="cursor-pointer flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 transition duration-200"
        >
          <File className="mr-2 h-4 w-4" />
          Choose File
        </label>

        <button
          onClick={handleUpload}
          disabled={isLoading}
          className="flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Uploading...' : (<><Upload className="mr-2 h-4 w-4" /> Upload</>)}
        </button>
      </div>

      {/* Display selected file */}
      {selectedFile && (
        <p className="mt-3 text-center text-gray-300 text-sm">
          <span className="font-medium">Selected File:</span> {selectedFile.name}
        </p>
      )}

      {/* Display error message */}
      {uploadError && (
        <div className="mt-3 flex items-center justify-center text-red-500 text-sm">
          <XCircle className="mr-2 h-4 w-4" />
          {uploadError}
        </div>
      )}
    </div>
  );
};

export default BulkImport;