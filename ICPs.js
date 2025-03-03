// src/pages/ICPs.js
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchICPs, deleteICP } from '../services/api';
import ICPTable from '../components/ICPTable';
import Pagination from '../components/Pagination';
import { toast } from 'react-toastify';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';

const ICPs = () => {
  const [icps, setICPs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filtering and Sorting state
  const [filters, setFilters] = useState({
    name: '',
    job_title: '',
    industry: '',
    company_hq_location: '',
    contact_location: '',
    company_size: '',
    q: '',
  });
  const [ordering, setOrdering] = useState('name');

  // Modal state for delete confirmation
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedICP, setSelectedICP] = useState(null);

  const navigate = useNavigate();

  const fetchICPsData = async (page = 1) => {
    setLoading(true);
    setError(false);
    try {
      const params = {
        page,
        ...filters,
        search: filters.q,
        ordering,
      };
      const response = await fetchICPs(params);
      setICPs(response.results);
      setCurrentPage(page);
      setTotalPages(Math.ceil(response.count / 25));
    } catch (err) {
      console.error('Error fetching ICPs:', err);
      setError(true);
      toast.error('Failed to fetch ICPs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchICPsData(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, filters, ordering]);

  const handleDelete = (icp) => {
    setSelectedICP(icp);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteICP(selectedICP.id);
      setICPs(icps.filter(icp => icp.id !== selectedICP.id));
      toast.success('ICP deleted successfully.');
      setIsDeleteModalOpen(false);
    } catch (err) {
      console.error('Error deleting ICP:', err);
      toast.error('Failed to delete ICP.');
      setIsDeleteModalOpen(false);
    }
  };

  // Handle filter change
  const handleFilterChange = (e) => {
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setCurrentPage(1);
  };

  // Handle search change
  const handleSearchChange = (e) => {
    setFilters(prev => ({ ...prev, q: e.target.value }));
    setCurrentPage(1);
  };

  // Handle sorting change
  const handleSortChange = (field) => {
    setOrdering((prev) => (prev === field ? `-${field}` : field));
  };

  if (loading)
    return <div className="text-center mt-10 text-gray-800 dark:text-gray-200">Loading...</div>;
  if (error)
    return <div className="text-center mt-10 text-red-500 dark:text-red-400">Error fetching ICPs.</div>;

  return (
    <div className="container mx-auto p-6 bg-gray-50 dark:bg-gray-800 rounded shadow">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-semibold text-gray-800 dark:text-white">ICPs</h1>
        <Link to="/dashboard/icps/add/" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition">
          Add ICP
        </Link>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-wrap items-center mb-6 space-x-4">
        <input
          type="text"
          placeholder="Search ICPs..."
          value={filters.q}
          onChange={handleSearchChange}
          className="border border-gray-300 dark:border-gray-700 px-4 py-2 rounded w-64 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
        />
        <input
          type="text"
          name="name"
          placeholder="Filter by Name"
          value={filters.name}
          onChange={handleFilterChange}
          className="border border-gray-300 dark:border-gray-700 px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
        />
        <input
          type="text"
          name="job_title"
          placeholder="Filter by Job Title"
          value={filters.job_title}
          onChange={handleFilterChange}
          className="border border-gray-300 dark:border-gray-700 px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
        />
        {/* Add additional filter inputs as needed */}
      </div>

      {/* ICPs Table */}
      <ICPTable icps={icps} onView={(id) => navigate(`/dashboard/icps/${id}/`)} onEdit={(id) => navigate(`/dashboard/icps/${id}/edit/`)} onDelete={handleDelete} />

      {/* Pagination Controls */}
      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />

      {/* Confirm Delete Modal */}
      {isDeleteModalOpen && selectedICP && (
        <ConfirmDeleteModal
          isOpen={isDeleteModalOpen}
          closeModal={() => setIsDeleteModalOpen(false)}
          onConfirm={confirmDelete}
          itemName={selectedICP.name}
        />
      )}
    </div>
  );
};

export default ICPs;