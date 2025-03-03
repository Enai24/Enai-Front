// src/components/SendEmailForm.js

import React, { useState } from 'react';
import { toast } from 'react-toastify';
import api from '../services/api'; // Your Axios instance
import Button from './Button';

const SendEmailForm = ({ initialData = {}, onSubmit, leadId }) => {
  const [formData, setFormData] = useState({
    to: initialData.to || '',
    subject: initialData.subject || '',
    message: initialData.message || '',
  });
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAILoading] = useState(false);

  // Handle input changes
  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Submits the email form (sends email to /api/send-email/)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.to || !formData.subject || !formData.message) {
      toast.error('Please fill in all required fields.');
      return;
    }
    setLoading(true);
    try {
      const response = await api.post('send-email/', formData);
      toast.success(response.data.message || 'Email sent successfully!');
      setFormData({ to: '', subject: '', message: '' });
      onSubmit && onSubmit(); // Call a parent callback if provided
    } catch (error) {
      console.error('Error sending email:', error);
      toast.error(error.response?.data.error || 'Failed to send email.');
    } finally {
      setLoading(false);
    }
  };

  // Generate an AI draft using OpenAI or your LLM
  const handleGenerateAIDraft = async () => {
    if (!leadId) {
      toast.error('No lead selected to personalize. Please provide a lead ID.');
      return;
    }
    setAILoading(true);
    try {
      // Example: POST /api/generate-email-draft/
      const res = await api.post('generate-email-draft/', {
        lead_id: leadId,
        subject: formData.subject,
      });
      if (res.data && res.data.email_text) {
        setFormData((prev) => ({ ...prev, message: res.data.email_text }));
        toast.success('AI-generated email draft inserted.');
      } else {
        toast.warning('No draft text returned from AI.');
      }
    } catch (err) {
      console.error('Error generating AI draft:', err);
      toast.error(err.response?.data.error || 'Failed to generate AI draft.');
    } finally {
      setAILoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white dark:bg-gray-800 shadow rounded">
      <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
        Compose Email
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Recipient */}
        <div>
          <label htmlFor="to" className="block text-gray-700 dark:text-gray-300 font-medium">
            Recipient Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            name="to"
            id="to"
            value={formData.to}
            onChange={handleChange}
            required
            className="mt-1 w-full p-2 border border-gray-300 rounded 
                       dark:bg-gray-700 dark:text-gray-100
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Subject */}
        <div>
          <label htmlFor="subject" className="block text-gray-700 dark:text-gray-300 font-medium">
            Subject <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="subject"
            id="subject"
            value={formData.subject}
            onChange={handleChange}
            required
            className="mt-1 w-full p-2 border border-gray-300 rounded 
                       dark:bg-gray-700 dark:text-gray-100
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* AI Draft Generation Button */}
        <div className="flex items-center justify-between mt-2">
          <label htmlFor="message" className="block text-gray-700 dark:text-gray-300 font-medium">
            Message <span className="text-red-500">*</span>
          </label>
          <Button
            type="button"
            variant="primary"
            onClick={handleGenerateAIDraft}
            disabled={aiLoading}
            className="ml-3"
          >
            {aiLoading ? 'Generating...' : 'Generate AI Draft'}
          </Button>
        </div>

        {/* Message Body */}
        <textarea
          name="message"
          id="message"
          rows="6"
          value={formData.message}
          onChange={handleChange}
          required
          className="mt-1 w-full p-2 border border-gray-300 rounded 
                     dark:bg-gray-700 dark:text-gray-100
                     focus:outline-none focus:ring-2 focus:ring-blue-500"
        ></textarea>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded 
                     transition duration-150 font-medium"
        >
          {loading ? 'Sending...' : 'Send Email'}
        </button>
      </form>
    </div>
  );
};

export default SendEmailForm;