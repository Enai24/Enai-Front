// Filepath: src/pages/KnowledgeBase.js
/**
 * @description
 *   This is the main Knowledge Base page for the Enai B2B outbound sales platform.
 *   It displays a list of knowledge base documents, provides filtering and sorting
 *   capabilities, and includes functionality for uploading files and creating a new
 *   knowledge base entry via a modal.
 *
 * @notes
 *   - Uses sub-components: KnowledgeBaseFilters, KnowledgeBaseTable, and CreateKnowledgeBaseModal.
 *   - Handles API calls for listing documents with search parameters.
 *   - Refreshes data on successful create or delete.
 */

import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { listVectorStores, deleteVectorStore } from '../services/api';
import KnowledgeBaseFilters from '../components/KnowledgeBaseFilters';
import KnowledgeBaseTable from '../components/KnowledgeBaseTable';
import CreateKnowledgeBaseModal from '../components/CreateKnowledgeBaseModal';

const KnowledgeBase = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const navigate = useNavigate();

  const fetchDocuments = async () => {
    setLoading(true);
    setError(false);
    try {
      // Pass search query as a parameter to the API call
      const params = { search: searchQuery, include_text: false, _timestamp: Date.now() };
      const response = await listVectorStores(params);
      // Assuming the response has an array of documents under "vectors"
      setDocuments(response.vectors || []);
    } catch (err) {
      console.error("Error fetching knowledge documents:", err);
      toast.error("Failed to load knowledge base");
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
    // Re-fetch when search query changes
  }, [searchQuery]);

  const handleDeleteDocument = async (vectorId) => {
    if (!window.confirm("Are you sure you want to delete this knowledge base entry?")) return;
    try {
      await deleteVectorStore(vectorId);
      toast.success("Knowledge base entry deleted successfully.");
      fetchDocuments();
    } catch (error) {
      console.error("Error deleting knowledge base entry:", error);
      toast.error("Failed to delete knowledge base entry.");
    }
  };

  return (
    <div className="container mx-auto p-6 bg-gray-900 text-gray-200 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Knowledge Base</h1>
          <p className="text-gray-400 mt-2">
            A centralized repository to enhance your outbound sales strategy.
          </p>
        </div>
        <div className="flex space-x-4">
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors flex items-center space-x-2 cursor-pointer"
          >
            <span>Create Knowledge Base</span>
          </button>
        </div>
      </div>

      <KnowledgeBaseFilters searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      {loading ? (
        <div className="text-center mt-10">Loading knowledge base...</div>
      ) : error ? (
        <div className="text-center mt-10 text-red-500">Error fetching knowledge base.</div>
      ) : (
        <KnowledgeBaseTable documents={documents} onDelete={handleDeleteDocument} />
      )}

      {showCreateModal && (
        <CreateKnowledgeBaseModal
          isOpen={showCreateModal} // Pass the isOpen prop to the modal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            toast.success("Knowledge base entry created successfully.");
            setShowCreateModal(false);
            fetchDocuments();
          }}
        />
      )}
    </div>
  );
};

export default KnowledgeBase;