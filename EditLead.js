// src/pages/EditLead.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';
import { X, Save, ArrowLeft } from 'lucide-react';

const EditLead = () => {
  const { leadId } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    job_title: '',
    company: '',
    source: 'manual_entry',
    status: 'new',
    industry: '',
    company_size: '',
    country: '',
    phone: '',
    pain_points: [],
    website: '',
    ai_lead_score: null,
    email_open_rate: null,
    interaction_count: 0,
    enriched_data: null, // Represents hunter_data and website_data combined
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [painPointInput, setPainPointInput] = useState('');

  // Fetch lead data with retry logic
  const fetchWithRetry = useCallback(async (retries = 3) => {
    for (let i = 0; i < retries; i++) {
      try {
        const response = await api.get(`/leads/${leadId}/`);
        return response.data;
      } catch (err) {
        if (i === retries - 1) throw err;
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
  }, [leadId]);

  const loadLead = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchWithRetry();
      setFormData({
        first_name: data.first_name || '',
        last_name: data.last_name || '',
        email: data.email || '',
        job_title: data.job_title || '',
        company: data.company || '',
        source: data.source || 'manual_entry',
        status: data.status || 'new',
        industry: data.industry || '',
        company_size: data.company_size || '',
        country: data.country?.name || '',
        phone: data.phone || '',
        pain_points: data.pain_points || [],
        website: data.website || '',
        ai_lead_score: data.ai_lead_score || null,
        email_open_rate: data.email_open_rate || null,
        interaction_count: data.interaction_count || 0,
        enriched_data: { ...data.hunter_data, ...data.website_data } || null,
      });
    } catch (err) {
      console.error('Error fetching lead:', err);
      toast.error('Failed to fetch lead data.');
    } finally {
      setLoading(false);
    }
  }, [fetchWithRetry]);

  useEffect(() => {
    loadLead();
  }, [loadLead]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePainPointKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const trimmed = painPointInput.trim();
      if (trimmed && !formData.pain_points.includes(trimmed)) {
        setFormData(prev => ({
          ...prev,
          pain_points: [...prev.pain_points, trimmed],
        }));
        setPainPointInput('');
      }
    }
  };

  const removePainPoint = (point) => {
    setFormData(prev => ({
      ...prev,
      pain_points: prev.pain_points.filter(p => p !== point),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...formData,
        enriched_data: undefined, // Exclude enriched_data from payload as it’s read-only
        ai_lead_score: undefined, // Read-only from backend
        email_open_rate: undefined, // Read-only
        interaction_count: undefined, // Read-only
      };
      await api.put(`/leads/${leadId}/`, payload);
      toast.success('Lead updated successfully!');
      navigate('/leads');
    } catch (err) {
      console.error('Error updating lead:', err);
      toast.error('Failed to update lead.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center mt-10 text-gray-400 animate-pulse">Loading lead data...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-gray-100 p-6">
      <div className="max-w-4xl mx-auto bg-gray-800 rounded-xl shadow-2xl overflow-hidden border border-gray-700">
        {/* Header */}
        <header className="flex items-center justify-between p-6 bg-gray-700/50 border-b border-gray-600">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/leads')}
              className="text-gray-400 hover:text-gray-200 transition"
              aria-label="Back to Leads"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">
              Edit Lead
            </h1>
          </div>
          <button
            onClick={() => navigate('/leads')}
            className="text-gray-400 hover:text-gray-200 transition"
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>
        </header>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* First Name */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">First Name</label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                required
                className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
              />
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Last Name</label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                required
                className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
              />
            </div>

            {/* Email (Disabled) */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                disabled
                className="w-full bg-gray-600 border border-gray-500 rounded-md px-4 py-2 text-gray-400 cursor-not-allowed"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
              />
            </div>

            {/* Job Title */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Job Title</label>
              <input
                type="text"
                name="job_title"
                value={formData.job_title}
                onChange={handleChange}
                className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
              />
            </div>

            {/* Company */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Company</label>
              <input
                type="text"
                name="company"
                value={formData.company}
                onChange={handleChange}
                className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
              />
            </div>

            {/* Website */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Website</label>
              <input
                type="url"
                name="website"
                value={formData.website}
                onChange={handleChange}
                className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
              />
            </div>

            {/* Source */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Source</label>
              <select
                name="source"
                value={formData.source}
                onChange={handleChange}
                className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
              >
                <option value="website_form">Website Form</option>
                <option value="manual_entry">Manual Entry</option>
                <option value="external_search">External Search</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
              >
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="qualified">Qualified</option>
                <option value="converted">Converted</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            {/* Industry */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Industry</label>
              <select
                name="industry"
                value={formData.industry}
                onChange={handleChange}
                className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
              >
                <option value="">Select Industry</option>
                <option value="Technology">Technology</option>
                <option value="Finance">Finance</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Education">Education</option>
                <option value="Retail">Retail</option>
                <option value="Manufacturing">Manufacturing</option>
                <option value="Real Estate">Real Estate</option>
                <option value="Hospitality">Hospitality</option>
                <option value="Telecommunications">Telecommunications</option>
                <option value="Energy">Energy</option>
                <option value="Automotive">Automotive</option>
                <option value="Agriculture">Agriculture</option>
                <option value="Construction">Construction</option>
                <option value="Entertainment">Entertainment</option>
                <option value="Transportation">Transportation</option>
                <option value="Legal">Legal</option>
                <option value="Nonprofit">Nonprofit</option>
                <option value="Government">Government</option>
                <option value="Consulting">Consulting</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Company Size */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Company Size</label>
              <select
                name="company_size"
                value={formData.company_size}
                onChange={handleChange}
                className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
              >
                <option value="">Select Company Size</option>
                <option value="1-10">1-10 employees</option>
                <option value="11-50">11-50 employees</option>
                <option value="51-200">51-200 employees</option>
                <option value="201-500">201-500 employees</option>
                <option value="501-1000">501-1000 employees</option>
                <option value="1001+">1001+ employees</option>
              </select>
            </div>

            {/* Country */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Country</label>
              <select
                name="country"
                value={formData.country}
                onChange={handleChange}
                className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
              >
                <option value="">Select Country</option>
                <option value="United States">United States</option>
                <option value="Canada">Canada</option>
                <option value="United Kingdom">United Kingdom</option>
                {/* Add more as needed */}
              </select>
            </div>
          </div>

          {/* Pain Points */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Pain Points</label>
            <input
              type="text"
              value={painPointInput}
              onChange={(e) => setPainPointInput(e.target.value)}
              onKeyDown={handlePainPointKeyDown}
              placeholder="Add pain point (press Enter or comma)"
              className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
            />
            <div className="mt-2 flex flex-wrap gap-2">
              {formData.pain_points.map((point, index) => (
                <span
                  key={index}
                  className="inline-flex items-center bg-gray-600 text-gray-200 px-3 py-1 rounded-full text-sm"
                >
                  {point}
                  <button
                    type="button"
                    onClick={() => removePainPoint(point)}
                    className="ml-2 text-gray-400 hover:text-red-400 transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Read-Only Insights */}
          <div className="bg-gray-700/50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-200 mb-4">Lead Insights</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400">AI Lead Score</label>
                <p className="mt-1 text-gray-300">
                  {formData.ai_lead_score !== null ? `${formData.ai_lead_score.toFixed(1)}` : 'N/A'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400">Email Open Rate</label>
                <p className="mt-1 text-gray-300">
                  {formData.email_open_rate !== null ? `${(formData.email_open_rate * 100).toFixed(1)}%` : 'N/A'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400">Interaction Count</label>
                <p className="mt-1 text-gray-300">{formData.interaction_count}</p>
              </div>
            </div>
            {formData.enriched_data && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-400">Enriched Data</label>
                <pre className="mt-1 bg-gray-800 p-2 rounded text-gray-300 text-sm overflow-auto max-h-40">
                  {JSON.stringify(formData.enriched_data, null, 2)}
                </pre>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate('/leads')}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className={`px-4 py-2 flex items-center gap-2 rounded-md text-white transition ${
                saving ? 'bg-gray-600 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              <Save className="w-5 h-5" />
              {saving ? 'Saving...' : 'Update Lead'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default React.memo(EditLead);