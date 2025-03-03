// Filepath: src/components/KnowledgeBase/KnowledgeBaseTable.jsx
/**
 * @description
 *   This component renders the table (or grid) view of knowledge base documents.
 *   It displays document details (name, description, tags, timestamps) and provides
 *   Edit and Delete actions.
 *
 * @notes
 *   - It receives the array of documents and an onDelete callback as props.
 *   - The "Edit" action navigates to the detail/edit page for the document.
 */

import React from 'react';
import { Folder, FileText, Edit, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const KnowledgeBaseTable = ({ documents, onDelete }) => {
  const navigate = useNavigate();

  return (
    <div className="overflow-hidden rounded-xl border border-gray-700 bg-gray-800">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-700">
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Name</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Description</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Tags</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Uploaded/Updated</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-700">
          {documents.length === 0 ? (
            <tr>
              <td colSpan="5" className="text-center py-4">No documents found.</td>
            </tr>
          ) : (
            documents.map((doc) => (
              <tr key={doc.vector_id} className="hover:bg-gray-750 transition-colors cursor-pointer">
                <td className="px-6 py-4 text-sm text-gray-300">{doc.name || '—'}</td>
                <td className="px-6 py-4 text-sm text-gray-300">{doc.description || '—'}</td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-2">
                    {doc.tags && doc.tags.length > 0
                      ? doc.tags.map((tag, index) => (
                          <span key={index} className="px-2 py-1 bg-gray-700 rounded-lg text-xs text-gray-300">
                            {tag}
                          </span>
                        ))
                      : '—'}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-300">
                  <div>Uploaded: {doc.uploadedAt || 'N/A'}</div>
                  <div>Updated: {doc.lastUpdated || 'N/A'}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => navigate(`/dashboard/knowledge/${doc.vector_id}`)}
                      className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                      aria-label="Edit Knowledge Base"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(doc.vector_id)}
                      className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                      aria-label="Delete Knowledge Base"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default KnowledgeBaseTable;