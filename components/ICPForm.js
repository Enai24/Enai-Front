// src/components/ICPForm.js

import React, { useEffect, useState } from 'react';
import { fetchICPs } from '../services/api';
import Button from '../components/Button';
import { toast } from 'react-toastify';

const ICPForm = ({ initialData = {}, onSubmit }) => {
  const [name, setName] = useState(initialData.name || '');
  const [jobTitle, setJobTitle] = useState(initialData.job_title || '');
  const [industry, setIndustry] = useState(initialData.industry || '');
  const [companyHqLocation, setCompanyHqLocation] = useState(initialData.company_hq_location || '');
  const [contactLocation, setContactLocation] = useState(initialData.contact_location || '');
  const [companySize, setCompanySize] = useState(initialData.company_size || '');
  const [keywords, setKeywords] = useState(initialData.keywords || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name) {
      toast.error('Please fill in the ICP name.');
      return;
    }
    const data = {
      name,
      job_title: jobTitle || null,
      industry: industry || null,
      company_hq_location: companyHqLocation || null,
      contact_location: contactLocation || null,
      company_size: companySize || null,
      keywords: keywords || null,
    };
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          ICP Name<span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="Enter ICP name"
          className="mt-1 block w-full border border-gray-300 dark:border-gray-700 rounded-md shadow-sm p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Job Title */}
      <div>
        <label htmlFor="jobTitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Job Title
        </label>
        <input
          type="text"
          id="jobTitle"
          name="jobTitle"
          value={jobTitle}
          onChange={(e) => setJobTitle(e.target.value)}
          placeholder="e.g., Marketing Manager"
          className="mt-1 block w-full border border-gray-300 dark:border-gray-700 rounded-md shadow-sm p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Industry */}
      <div>
        <label htmlFor="industry" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Industry
        </label>
        <input
          type="text"
          id="industry"
          name="industry"
          value={industry}
          onChange={(e) => setIndustry(e.target.value)}
          placeholder="e.g., Technology"
          className="mt-1 block w-full border border-gray-300 dark:border-gray-700 rounded-md shadow-sm p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Company HQ Location */}
      <div>
        <label htmlFor="companyHqLocation" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Company HQ Location
        </label>
        <input
          type="text"
          id="companyHqLocation"
          name="companyHqLocation"
          value={companyHqLocation}
          onChange={(e) => setCompanyHqLocation(e.target.value)}
          placeholder="e.g., New York, USA"
          className="mt-1 block w-full border border-gray-300 dark:border-gray-700 rounded-md shadow-sm p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Contact Location */}
      <div>
        <label htmlFor="contactLocation" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Contact Location
        </label>
        <input
          type="text"
          id="contactLocation"
          name="contactLocation"
          value={contactLocation}
          onChange={(e) => setContactLocation(e.target.value)}
          placeholder="e.g., Los Angeles, USA"
          className="mt-1 block w-full border border-gray-300 dark:border-gray-700 rounded-md shadow-sm p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Company Size */}
      <div>
        <label htmlFor="companySize" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Company Size
        </label>
        <input
          type="text"
          id="companySize"
          name="companySize"
          value={companySize}
          onChange={(e) => setCompanySize(e.target.value)}
          placeholder="e.g., 50-100 employees"
          className="mt-1 block w-full border border-gray-300 dark:border-gray-700 rounded-md shadow-sm p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Keywords */}
      <div>
        <label htmlFor="keywords" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Keywords
        </label>
        <textarea
          id="keywords"
          name="keywords"
          value={keywords}
          onChange={(e) => setKeywords(e.target.value)}
          rows="3"
          placeholder="Enter comma-separated keywords..."
          className="mt-1 block w-full border border-gray-300 dark:border-gray-700 rounded-md shadow-sm p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        ></textarea>
      </div>

      {/* Submit and Cancel Buttons */}
      <div className="flex justify-end space-x-2">
        <Button type="submit" variant="primary">
          Save
        </Button>
        <Button type="button" variant="secondary" onClick={() => window.history.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default ICPForm;