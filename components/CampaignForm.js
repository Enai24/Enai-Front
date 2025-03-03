// src/components/CampaignForm.js

import React, { useEffect, useState } from 'react';
import { fetchLeads, fetchICPs, createCampaign } from '../services/api';
import Button from './Button';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types'; // Import PropTypes for type checking

const CampaignForm = ({ initialData = {}, onSubmit }) => {
  const [name, setName] = useState(initialData.name || '');
  const [status, setStatus] = useState(initialData.status || 'active');
  const [campaignType, setCampaignType] = useState(initialData.campaign_type || 'email');
  const [startDate, setStartDate] = useState(initialData.start_date || '');
  const [endDate, setEndDate] = useState(initialData.end_date || '');
  const [description, setDescription] = useState(initialData.description || '');
  const [dailyLimit, setDailyLimit] = useState(initialData.daily_limit || 100);
  const [template, setTemplate] = useState(initialData.template || '');
  const [emailsSent, setEmailsSent] = useState(initialData.emails_sent || 0);
  const [openRate, setOpenRate] = useState(initialData.open_rate || 0.0);
  const [responseRate, setResponseRate] = useState(initialData.response_rate || 0.0);
  const [meetings, setMeetings] = useState(initialData.meetings || 0);
  const [leads, setLeads] = useState(initialData.leads || []);
  const [icpId, setIcpId] = useState(initialData.icp ? initialData.icp.id : '');
  const [allLeads, setAllLeads] = useState([]);
  const [allICPs, setAllICPs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const leadsData = await fetchLeads({ page: 1, page_size: 1000 });
        setAllLeads(leadsData.results);
        const icpsData = await fetchICPs({ page: 1, page_size: 1000 });
        setAllICPs(icpsData.results);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching dropdown data:', error);
        toast.error('Failed to load leads or ICPs.');
        setLoading(false);
      }
    };

    fetchDropdownData();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !campaignType || !startDate || !endDate || !icpId) {
      toast.error('Please fill in all required fields.');
      return;
    }
    const data = {
      name,
      status,
      campaign_type: campaignType,
      start_date: startDate,
      end_date: endDate,
      description,
      daily_limit: dailyLimit,
      template,
      emails_sent: emailsSent,
      open_rate: openRate,
      response_rate: responseRate,
      meetings,
      leads, // Array of lead IDs
      icp_id: icpId,
    };
    onSubmit(data);
  };

  if (loading) {
    return <p className="text-gray-400">Loading form...</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-gray-800 p-6 rounded-lg shadow-md">
      {/* Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-300">
          Campaign Name<span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="mt-1 block w-full border border-gray-600 rounded-md shadow-sm p-2 bg-gray-700 text-gray-100 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      {/* Status */}
      <div>
        <label htmlFor="status" className="block text-sm font-medium text-gray-300">
          Status<span className="text-red-500">*</span>
        </label>
        <select
          id="status"
          name="status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          required
          className="mt-1 block w-full border border-gray-600 rounded-md shadow-sm p-2 bg-gray-700 text-gray-100 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="active">Active</option>
          <option value="paused">Paused</option>
          <option value="draft">Draft</option>
        </select>
      </div>

      {/* Campaign Type */}
      <div>
        <label htmlFor="campaignType" className="block text-sm font-medium text-gray-300">
          Campaign Type<span className="text-red-500">*</span>
        </label>
        <select
          id="campaignType"
          name="campaignType"
          value={campaignType}
          onChange={(e) => setCampaignType(e.target.value)}
          required
          className="mt-1 block w-full border border-gray-600 rounded-md shadow-sm p-2 bg-gray-700 text-gray-100 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="email">Email Campaign</option>
          <option value="call">Call Campaign</option>
          <option value="social">Social Media Campaign</option>
          {/* Add other types as needed */}
        </select>
      </div>

      {/* Start Date */}
      <div>
        <label htmlFor="startDate" className="block text-sm font-medium text-gray-300">
          Start Date<span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          id="startDate"
          name="startDate"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          required
          className="mt-1 block w-full border border-gray-600 rounded-md shadow-sm p-2 bg-gray-700 text-gray-100 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      {/* End Date */}
      <div>
        <label htmlFor="endDate" className="block text-sm font-medium text-gray-300">
          End Date<span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          id="endDate"
          name="endDate"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          required
          className="mt-1 block w-full border border-gray-600 rounded-md shadow-sm p-2 bg-gray-700 text-gray-100 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-300">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="mt-1 block w-full border border-gray-600 rounded-md shadow-sm p-2 bg-gray-700 text-gray-100 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="Enter campaign description..."
        ></textarea>
      </div>

      {/* Daily Limit */}
      <div>
        <label htmlFor="dailyLimit" className="block text-sm font-medium text-gray-300">
          Daily Email Limit<span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          id="dailyLimit"
          name="dailyLimit"
          value={dailyLimit}
          onChange={(e) => setDailyLimit(parseInt(e.target.value, 10))}
          required
          className="mt-1 block w-full border border-gray-600 rounded-md shadow-sm p-2 bg-gray-700 text-gray-100 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      {/* Template */}
      <div>
        <label htmlFor="template" className="block text-sm font-medium text-gray-300">
          Template
        </label>
        <textarea
          id="template"
          name="template"
          value={template}
          onChange={(e) => setTemplate(e.target.value)}
          rows="5"
          placeholder="Enter your campaign template here..."
          className="mt-1 block w-full border border-gray-600 rounded-md shadow-sm p-2 bg-gray-700 text-gray-100 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        ></textarea>
      </div>

      {/* Emails Sent */}
      <div>
        <label htmlFor="emailsSent" className="block text-sm font-medium text-gray-300">
          Emails Sent
        </label>
        <input
          type="number"
          id="emailsSent"
          name="emailsSent"
          value={emailsSent}
          onChange={(e) => setEmailsSent(parseInt(e.target.value, 10))}
          className="mt-1 block w-full border border-gray-600 rounded-md shadow-sm p-2 bg-gray-700 text-gray-100 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      {/* Open Rate */}
      <div>
        <label htmlFor="openRate" className="block text-sm font-medium text-gray-300">
          Open Rate (%)
        </label>
        <input
          type="number"
          id="openRate"
          name="openRate"
          value={openRate}
          onChange={(e) => setOpenRate(parseFloat(e.target.value))}
          className="mt-1 block w-full border border-gray-600 rounded-md shadow-sm p-2 bg-gray-700 text-gray-100 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          step="0.1"
        />
      </div>

      {/* Response Rate */}
      <div>
        <label htmlFor="responseRate" className="block text-sm font-medium text-gray-300">
          Response Rate (%)
        </label>
        <input
          type="number"
          id="responseRate"
          name="responseRate"
          value={responseRate}
          onChange={(e) => setResponseRate(parseFloat(e.target.value))}
          className="mt-1 block w-full border border-gray-600 rounded-md shadow-sm p-2 bg-gray-700 text-gray-100 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          step="0.1"
        />
      </div>

      {/* Meetings */}
      <div>
        <label htmlFor="meetings" className="block text-sm font-medium text-gray-300">
          Meetings
        </label>
        <input
          type="number"
          id="meetings"
          name="meetings"
          value={meetings}
          onChange={(e) => setMeetings(parseInt(e.target.value, 10))}
          className="mt-1 block w-full border border-gray-600 rounded-md shadow-sm p-2 bg-gray-700 text-gray-100 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      {/* Leads Selection */}
      <div>
        <label htmlFor="leads" className="block text-sm font-medium text-gray-300">
          Select Recipients
        </label>
        <select
          id="leads"
          name="leads"
          multiple
          value={leads}
          onChange={(e) => {
            const options = e.target.options;
            const selected = [];
            for (let i = 0; i < options.length; i++) {
              if (options[i].selected) {
                selected.push(parseInt(options[i].value, 10));
              }
            }
            setLeads(selected);
          }}
          className="mt-1 block w-full border border-gray-600 rounded-md shadow-sm p-2 bg-gray-700 text-gray-100 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        >
          {allLeads.map((lead) => (
            <option key={lead.id} value={lead.id}>
              {lead.name} - {lead.email}
            </option>
          ))}
        </select>
        <small className="text-gray-400">Hold down the Ctrl (windows) or Command (Mac) button to select multiple options.</small>
      </div>

      {/* ICP Selection */}
      <div>
        <label htmlFor="icpId" className="block text-sm font-medium text-gray-300">
          ICP<span className="text-red-500">*</span>
        </label>
        <select
          id="icpId"
          name="icpId"
          value={icpId}
          onChange={(e) => setIcpId(e.target.value)}
          required
          className="mt-1 block w-full border border-gray-600 rounded-md shadow-sm p-2 bg-gray-700 text-gray-100 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="">Select ICP</option>
          {allICPs.map((icp) => (
            <option key={icp.id} value={icp.id}>
              {icp.name}
            </option>
          ))}
        </select>
      </div>

      {/* Submit and Cancel Buttons */}
      <div className="flex justify-end space-x-2">
        <Button type="submit" variant="primary" disabled={false}>
          Save
        </Button>
        <Button type="button" variant="secondary" onClick={() => window.history.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
};

// Define PropTypes for type checking
CampaignForm.propTypes = {
  initialData: PropTypes.object,
  onSubmit: PropTypes.func.isRequired,
};

export default CampaignForm;