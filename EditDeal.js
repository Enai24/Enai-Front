import React, { useState, useEffect } from 'react';
import {
  fetchDealById,
  updateDeal,
  fetchPipelines,
  fetchStages,
  fetchContacts,
  fetchCompanies,
} from '../services/api';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

const EditDeal = () => {
  const { dealId } = useParams();
  // Use the same field keys as in AddDeal (plus additional sections)
  const [formData, setFormData] = useState({
    name: '',
    pipeline_id: '',
    stage_id: '',
    owner_email: '',
    amount: '',
    status: 'open',
    linked_contacts_ids: [],
    requirements: '',
    terms: '',
  });
  const [pipelines, setPipelines] = useState([]);
  const [stages, setStages] = useState([]);
  const [contacts, setContacts] = useState([]);
  // companies can be handled similarly if needed
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch deal data and options
  const loadDeal = async () => {
    try {
      const [dealRes, pipelinesRes, stagesRes, contactsRes] = await Promise.all([
        fetchDealById(dealId),
        fetchPipelines(),
        fetchStages(),
        fetchContacts(),
      ]);
      const deal = dealRes.data;
      setFormData({
        name: deal.name,
        pipeline_id: deal.pipeline.id,
        stage_id: deal.stage.id,
        owner_email: deal.owner_email,
        amount: deal.amount || '',
        status: deal.status,
        linked_contacts_ids: deal.linked_contacts_ids || [],
        requirements: deal.requirements || '',
        terms: deal.terms || '',
      });
      setPipelines(pipelinesRes.data);
      setStages(stagesRes.data);
      setContacts(contactsRes.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching deal data:', err);
      toast.error('Failed to fetch deal data.');
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDeal();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dealId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Special handler for multi-select for linked contacts
  const handleMultiSelectChange = (e) => {
    const selected = Array.from(e.target.selectedOptions, (option) => option.value);
    setFormData((prev) => ({ ...prev, linked_contacts_ids: selected }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Prepare data using the same keys as in AddDeal
      const data = {
        name: formData.name,
        pipeline: formData.pipeline_id,
        stage: formData.stage_id,
        owner_email: formData.owner_email,
        amount: parseFloat(formData.amount) || 0.0,
        status: formData.status,
        linked_contacts_ids: formData.linked_contacts_ids,
        requirements: formData.requirements,
        terms: formData.terms,
      };
      await updateDeal(dealId, data);
      setLoading(false);
      toast.success('Deal updated successfully!');
      navigate('/dashboard/deals');
    } catch (err) {
      console.error('Error updating deal:', err);
      toast.error('Failed to update deal.');
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center mt-10 text-gray-100">Loading...</div>;

  return (
    <div className="container mx-auto p-6 bg-gray-900 rounded shadow text-gray-100">
      <h1 className="text-3xl font-semibold mb-6">Edit Deal</h1>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1: Deal Details */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">Deal Details</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-gray-200">Deal Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-700 rounded bg-gray-800 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-200">Pipeline</label>
                <select
                  name="pipeline_id"
                  value={formData.pipeline_id}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-700 rounded bg-gray-800 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Pipeline</option>
                  {pipelines.map((pipeline) => (
                    <option key={pipeline.id} value={pipeline.id}>
                      {pipeline.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-gray-200">Stage</label>
                <select
                  name="stage_id"
                  value={formData.stage_id}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-700 rounded bg-gray-800 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Stage</option>
                  {stages.map((stage) => (
                    <option key={stage.id} value={stage.id}>
                      {stage.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-200">Owner Email</label>
                <input
                  type="email"
                  name="owner_email"
                  value={formData.owner_email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-700 rounded bg-gray-800 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-gray-200">Amount</label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  className="w-full px-4 py-2 border border-gray-700 rounded bg-gray-800 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-gray-200">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-700 rounded bg-gray-800 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="open">Open</option>
                <option value="won">Won</option>
                <option value="lost">Lost</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Contacts */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">Contacts</h2>
          <div>
            <label className="block text-gray-200 mb-1">Linked Contacts</label>
            <select
              name="linked_contacts_ids"
              value={formData.linked_contacts_ids}
              onChange={handleMultiSelectChange}
              multiple
              className="w-full px-4 py-2 border border-gray-700 rounded bg-gray-800 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {contacts.map((contact) => (
                <option key={contact.id} value={contact.id}>
                  {contact.first_name} {contact.last_name} ({contact.email})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Section 3: Requirements */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">Requirements</h2>
          <div>
            <label className="block text-gray-200 mb-1">Deal Requirements</label>
            <textarea
              name="requirements"
              value={formData.requirements}
              onChange={handleChange}
              rows="4"
              className="w-full px-4 py-2 border border-gray-700 rounded bg-gray-800 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter the requirements for the deal..."
            />
          </div>
        </div>

        {/* Section 4: Terms */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">Terms</h2>
          <div>
            <label className="block text-gray-200 mb-1">Deal Terms</label>
            <textarea
              name="terms"
              value={formData.terms}
              onChange={handleChange}
              rows="4"
              className="w-full px-4 py-2 border border-gray-700 rounded bg-gray-800 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter the terms for the deal..."
            />
          </div>
        </div>

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            disabled={loading}
            className={`w-full px-4 py-2 font-semibold text-white rounded-md ${
              loading ? 'bg-gray-600 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? 'Updating...' : 'Update Deal'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditDeal;