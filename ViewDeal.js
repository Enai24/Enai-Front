import React, { useEffect, useState } from 'react';
import { fetchDealById } from '../services/api';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';

const ViewDeal = () => {
  const { dealId } = useParams();
  const [deal, setDeal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadDeal = async () => {
    try {
      const response = await fetchDealById(dealId);
      setDeal(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching deal:', err);
      setError(true);
      toast.error('Failed to fetch deal data.');
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDeal();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dealId]);

  if (loading) return <div className="text-center mt-10 font-sans">Loading...</div>;
  if (error || !deal) return <div className="text-center mt-10 text-red-500 font-sans">Error fetching deal data.</div>;

  return (
    <div className="container mx-auto p-6 bg-gray-50 rounded shadow-lg font-sans">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-semibold">Deal Details</h1>
        <Link to="/deals" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded transition-shadow duration-200">
          Back to Deals
        </Link>
      </div>

      <div className="space-y-4 text-gray-800">
        <div>
          <strong>Name:</strong> {deal.name}
        </div>
        <div>
          <strong>Pipeline:</strong> {deal.pipeline.name}
        </div>
        <div>
          <strong>Stage:</strong> {deal.stage.name}
        </div>
        <div>
          <strong>Owner Email:</strong> {deal.owner_email}
        </div>
        <div>
          <strong>Amount:</strong> ${deal.amount}
        </div>
        <div>
          <strong>Status:</strong> {deal.status}
        </div>
        <div>
          <strong>Created At:</strong> {new Date(deal.created_at).toLocaleString()}
        </div>
        <div>
          <strong>Updated At:</strong> {new Date(deal.updated_at).toLocaleString()}
        </div>
      </div>

      {/* Actions */}
      <div className="mt-6 flex space-x-4">
        <Link
          to={`/deals/edit/${deal.id}`}
          className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded transition-shadow duration-200"
        >
          Edit Deal
        </Link>
      </div>
    </div>
  );
};

export default ViewDeal;