// src/pages/DealsList.js
import React, { useEffect, useState } from 'react';
import api from '../services/api'; // or { fetchDeals }
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const DealsList = () => {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDeals();
  }, []);

  const fetchDeals = async () => {
    try {
      // if using direct axios instance
      const response = await api.get('/deals/');
      setDeals(response.data);
    } catch (error) {
      console.error('Error fetching deals:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="container mt-4 text-white">
          <h2 className="text-xl font-bold">Deals Overview</h2>
          <p>Loading deals...</p>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container mt-4 text-white">
        <h2 className="text-2xl font-semibold mb-4">Deals Overview</h2>
        <Link to="/dashboard/deals/add" className="bg-blue-600 px-4 py-2 rounded text-white mr-2">
          Add New Deal
        </Link>
        <Link to="/dashboard/deals/import" className="bg-gray-600 px-4 py-2 rounded text-white">
          Import Deals
        </Link>

        <div className="overflow-x-auto mt-4">
          <table className="min-w-full table-auto bg-gray-800 text-gray-300">
            <thead className="bg-gray-700 text-gray-200">
              <tr>
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Pipeline</th>
                <th className="px-4 py-2 text-left">Stage</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Owner</th>
                <th className="px-4 py-2 text-left">Amount</th>
                <th className="px-4 py-2 text-left">Created At</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {deals.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-4">No deals found.</td>
                </tr>
              ) : (
                deals.map((deal) => (
                  <tr
                    key={deal.id}
                    className="border-b border-gray-700 hover:bg-gray-700 transition"
                  >
                    <td className="px-4 py-2">{deal.name}</td>
                    <td className="px-4 py-2">{deal.pipeline || 'N/A'}</td>
                    <td className="px-4 py-2">{deal.stage || 'N/A'}</td>
                    <td className="px-4 py-2">{deal.status}</td>
                    <td className="px-4 py-2">{deal.owner_email || 'N/A'}</td>
                    <td className="px-4 py-2">
                      {deal.amount ? `$${parseFloat(deal.amount).toFixed(2)}` : 'N/A'}
                    </td>
                    <td className="px-4 py-2">
                      {deal.created_at ? new Date(deal.created_at).toLocaleString() : 'N/A'}
                    </td>
                    <td className="px-4 py-2">
                      <Link
                        to={`/dashboard/deals/${deal.id}`}
                        className="bg-blue-500 px-3 py-1 text-white rounded text-sm mr-2"
                      >
                        View
                      </Link>
                      <Link
                        to={`/dashboard/deals/${deal.id}/edit`}
                        className="bg-yellow-500 px-3 py-1 text-white rounded text-sm mr-2"
                      >
                        Edit
                      </Link>
                      <Link
                        to={`/dashboard/deals/${deal.id}/delete`}
                        className="bg-red-600 px-3 py-1 text-white rounded text-sm"
                      >
                        Delete
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default DealsList;