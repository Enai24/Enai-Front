// src/pages/AddLead.jsx
import React, { useState } from 'react';
import { createLead } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { X, Plus, Upload, Building2, Users, DollarSign, Globe, Target } from 'lucide-react';

// Sample ICP data (You can move this to a separate file if needed)
const icpProfiles = [
  {
    id: 'enterprise',
    name: 'Enterprise Tech',
    criteria: {
      industry: ['Technology', 'SaaS', 'Cloud Services'],
      companySize: '1000+ employees',
      revenue: '$100M+',
      location: ['United States', 'Europe'],
      techStack: ['Cloud Infrastructure', 'Enterprise Software'],
      painPoints: ['Digital Transformation', 'Process Automation', 'Scalability'],
      buyingCommittee: ['CTO', 'CIO', 'VP Engineering']
    }
  },
  {
    id: 'midmarket',
    name: 'Mid-Market Growth',
    criteria: {
      industry: ['E-commerce', 'FinTech', 'Healthcare Tech'],
      companySize: '100-999 employees',
      revenue: '$10M-100M',
      location: ['United States', 'Canada', 'UK'],
      techStack: ['SaaS Solutions', 'Marketing Automation'],
      painPoints: ['Growth Scaling', 'Customer Acquisition', 'Operational Efficiency'],
      buyingCommittee: ['CEO', 'Head of Growth', 'VP Sales']
    }
  },
  {
    id: 'startup',
    name: 'High-Growth Startup',
    criteria: {
      industry: ['AI/ML', 'Web3', 'Digital Health'],
      companySize: '10-99 employees',
      revenue: '$1M-10M',
      location: ['United States', 'Global Tech Hubs'],
      techStack: ['Modern Tech Stack', 'API-First'],
      painPoints: ['Fast Growth', 'Market Penetration', 'Team Scaling'],
      buyingCommittee: ['Founder', 'CTO', 'Head of Product']
    }
  }
];

const industries = [
  'Technology', 'SaaS', 'Cloud Services', 'E-commerce', 'FinTech', 
  'Healthcare Tech', 'AI/ML', 'Web3', 'Digital Health', 'Manufacturing',
  'Retail', 'Professional Services', 'Media & Entertainment'
];

const companySizes = [
  '1-10 employees',
  '11-50 employees',
  '51-200 employees',
  '201-500 employees',
  '501-1000 employees',
  '1001-5000 employees',
  '5000+ employees'
];

const revenueRanges = [
  '$0-1M',
  '$1M-10M',
  '$10M-50M',
  '$50M-100M',
  '$100M-500M',
  '$500M+'
];

const locations = [
  'United States', 'Canada', 'United Kingdom', 'Europe', 'Global Tech Hubs'
];

const AddLead = () => {
  const navigate = useNavigate();
  const [selectedIcp, setSelectedIcp] = useState('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    title: '',
    company: '',
    industry: '',
    companySize: '',
    revenue: '',
    location: '',
    phone: '',
    linkedin: '',
    website: '',
    source: 'other',
    notes: '',
    painPoints: [],
    techStack: [],
    budget: '',
    timeline: '',
    decisionMakers: []
  });
  const [loading, setLoading] = useState(false);

  // Handle ICP Selection
  const handleIcpSelect = (icpId) => {
    setSelectedIcp(icpId);
    const icp = icpProfiles.find(p => p.id === icpId);
    if (icp) {
      setFormData(prev => ({
        ...prev,
        industry: icp.criteria.industry[0],
        companySize: icp.criteria.companySize,
        revenue: icp.criteria.revenue,
        location: icp.criteria.location[0],
        painPoints: icp.criteria.painPoints,
        decisionMakers: icp.criteria.buyingCommittee
      }));
    }
  };

  // Handle Input Changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle Textarea Changes for Arrays
  const handleArrayChange = (e, field) => {
    const { value } = e.target;
    setFormData(prev => ({ ...prev, [field]: value.split('\n').filter(item => item.trim() !== '') }));
  };

  // Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Map frontend fields to backend expected fields if necessary
      const payload = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        job_title: formData.title, 
        company: formData.company,
        industry: formData.industry,
        company_size: formData.companySize,
        revenue: formData.revenue,
        country: formData.location, // Matching serializer field
        phone: formData.phone,
        linkedin: formData.linkedin,
        website: formData.website,
        source: formData.source,
        notes: formData.notes,
        pain_points: formData.painPoints, 
        tech_stack: formData.techStack,
        budget: formData.budget,
        timeline: formData.timeline,
        decision_makers: formData.decisionMakers
      };

      await createLead(payload); // Ensure api.js is using correct endpoint /api/leads/
      toast.success('Lead created successfully!');
      navigate('/leads');
    } catch (err) {
      console.error('Error creating lead:', err);
      if (err.response && err.response.data) {
        // Capture and display backend error messages from response data
        const errorMessages = Object.values(err.response.data).flat(); // Flat is for flattening potential nested arrays of errors
        errorMessages.forEach((msg) => toast.error(msg));
      } else {
        toast.error('Failed to create lead.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 bg-gray-900 text-gray-100 min-h-screen">
      {/* Modal Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40"></div>

      {/* Modal Content */}
      <div className="fixed inset-0 flex items-center justify-center z-50">
        <div className="bg-gray-800 rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b border-gray-700">
            <h2 className="text-xl font-semibold text-gray-100">Add New Lead</h2>
            <button onClick={() => navigate('/leads')} className="text-gray-300 hover:text-gray-200">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* ICP Selection */}
          <div className="p-6">
            <h3 className="text-sm font-medium text-gray-100 mb-4">Select Ideal Customer Profile</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {icpProfiles.map((icp) => (
                <button
                  key={icp.id}
                  onClick={() => handleIcpSelect(icp.id)}
                  className={`p-4 border rounded-lg text-left transition-colors ${
                    selectedIcp === icp.id 
                      ? 'border-indigo-500 bg-indigo-700' 
                      : 'border-gray-700 hover:border-indigo-500'
                  }`}
                >
                  <h4 className="font-medium text-gray-100">{icp.name}</h4>
                  <p className="text-sm text-gray-400 mt-1">
                    {icp.criteria.industry.join(', ')}
                  </p>
                  <div className="mt-2 flex items-center gap-2 text-xs text-gray-400">
                    <Users className="h-3 w-3" />
                    {icp.criteria.companySize}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6 p-6">
            {/* Contact Information */}
            <div>
              <h3 className="text-sm font-medium text-gray-100 mb-4">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-700 bg-gray-700 text-gray-100 px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-700 bg-gray-700 text-gray-100 px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-700 bg-gray-700 text-gray-100 px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300">Title</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-700 bg-gray-700 text-gray-100 px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Company Information */}
            <div>
              <h3 className="text-sm font-medium text-gray-100 mb-4">Company Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300">Company Name</label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-700 bg-gray-700 text-gray-100 px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300">Industry</label>
                  <select
                    name="industry"
                    value={formData.industry}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-700 bg-gray-700 text-gray-100 px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Select Industry</option>
                    {industries.map((industry) => (
                      <option key={industry} value={industry}>{industry}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300">Company Size</label>
                  <select
                    name="companySize"
                    value={formData.companySize}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-700 bg-gray-700 text-gray-100 px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Select Company Size</option>
                    {companySizes.map((size) => (
                      <option key={size} value={size}>{size}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300">Annual Revenue</label>
                  <select
                    name="revenue"
                    value={formData.revenue}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-700 bg-gray-700 text-gray-100 px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Select Revenue Range</option>
                    {revenueRanges.map((range) => (
                      <option key={range} value={range}>{range}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300">Location</label>
                  <select
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-700 bg-gray-700 text-gray-100 px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Select Location</option>
                    {locations.map((loc) => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300">Website</label>
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-700 bg-gray-700 text-gray-100 px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="https://example.com"
                  />
                </div>
              </div>
            </div>

            {/* Pain Points & Technology */}
            <div>
              <h3 className="text-sm font-medium text-gray-100 mb-4">Pain Points & Technology</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300">Pain Points</label>
                  <textarea
                    name="painPoints"
                    value={formData.painPoints.join('\n')}
                    onChange={(e) => handleArrayChange(e, 'painPoints')}
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-700 bg-gray-700 text-gray-100 px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter pain points (one per line)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300">Tech Stack</label>
                  <textarea
                    name="techStack"
                    value={formData.techStack.join('\n')}
                    onChange={(e) => handleArrayChange(e, 'techStack')}
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-700 bg-gray-700 text-gray-100 px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter technologies (one per line)"
                  />
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div>
              <h3 className="text-sm font-medium text-gray-100 mb-4">Additional Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300">Source</label>
                  <input
                    type="text"
                    name="source"
                    value={formData.source}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-700 bg-gray-700 text-gray-100 px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="How did you find this lead?"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300">Budget</label>
                  <input
                    type="text"
                    name="budget"
                    value={formData.budget}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-700 bg-gray-700 text-gray-100 px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Estimated budget"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300">Timeline</label>
                  <input
                    type="text"
                    name="timeline"
                    value={formData.timeline}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-700 bg-gray-700 text-gray-100 px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Project timeline"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300">Notes</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-700 bg-gray-700 text-gray-100 px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Add any additional notes..."
                  />
                </div>
              </div>
            </div>
          </form>

          {/* Footer */}
          <div className="flex justify-end gap-3 p-6 border-t border-gray-700">
            <button
              onClick={() => navigate('/leads')}
              className="px-4 py-2 border border-gray-700 rounded-lg text-gray-300 hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className={`px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 ${loading ? 'bg-gray-600 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Adding...' : 'Add Lead'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddLead;