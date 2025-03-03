// src/components/NewCampaignModal.jsx
import React, { useState, useCallback, useMemo, lazy, Suspense } from 'react';
import PropTypes from 'prop-types';
import { X, AlertCircle, Settings, Mail } from 'lucide-react';
import { createCampaign, fetchLeads, startCampaign } from '../services/api';
import Select from 'react-select';
import { toast } from 'react-toastify';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import debounce from 'lodash/debounce';
import 'react-toastify/dist/ReactToastify.css';
import 'react-quill/dist/quill.snow.css';
import { targetIndustriesOptions, companySizeOptions, jobTitlesOptions, personalizationVariablesOptions, emailTemplates, followUpTemplates } from '../config/campaignOptions';

// Lazy load ReactQuill
const ReactQuill = lazy(() => import('react-quill'));

// Custom styles for react-select
const customSelectStyles = {
  control: (provided) => ({
    ...provided,
    backgroundColor: '#2D3748',
    borderColor: '#4A5568',
    color: '#E2E8F0',
  }),
  menu: (provided) => ({
    ...provided,
    backgroundColor: '#2D3748',
    color: '#E2E8F0',
  }),
  multiValue: (provided) => ({
    ...provided,
    backgroundColor: '#4A5568',
    color: '#E2E8F0',
  }),
  multiValueLabel: (provided) => ({
    ...provided,
    color: '#E2E8F0',
  }),
  multiValueRemove: (provided) => ({
    ...provided,
    color: '#CBD5E0',
    ':hover': { backgroundColor: '#A0AEC0', color: '#EDF2F7' },
  }),
  input: (provided) => ({
    ...provided,
    color: '#E2E8F0',
  }),
  singleValue: (provided) => ({
    ...provided,
    color: '#E2E8F0',
  }),
};

// Yup validation schema
const validationSchema = Yup.object().shape({
  name: Yup.string().required('Campaign Name is required'),
  startDate: Yup.date().required('Start Date is required'),
  endDate: Yup.date()
    .required('End Date is required')
    .min(Yup.ref('startDate'), 'End Date cannot be before Start Date'),
  dailyLimit: Yup.number().min(1, 'Must be at least 1').required('Daily Email Limit is required'),
  warmupPeriod: Yup.number().min(0, 'Cannot be negative').required('Warmup Period is required'),
  minimumDelay: Yup.number().min(0, 'Cannot be negative').required('Minimum Delay is required'),
  maximumDelay: Yup.number()
    .min(Yup.ref('minimumDelay'), 'Maximum Delay must be greater than Minimum Delay')
    .required('Maximum Delay is required'),
});

// Initial form data
const initialFormData = {
  name: '',
  description: '',
  targetIndustries: [],
  companySize: [],
  jobTitles: [],
  targetAccounts: '',
  excludedDomains: '',
  initialTemplate: '',
  initialTemplateContent: '',
  followUpTemplates: [],
  selectedLeads: [],
  dailyLimit: 100,
  warmupPeriod: 7,
  sendingWindow: { start: '09:00', end: '17:00' },
  startDate: '',
  endDate: '',
  timezone: 'UTC',
  tags: '',
  minimumDelay: 24,
  maximumDelay: 72,
  attachments: [],
};

// Custom hook to fetch leads with retry logic
const useFetchLeads = (isOpen) => {
  const [leadsOptions, setLeadsOptions] = useState([]);
  const [loadingLeads, setLoadingLeads] = useState(false);

  const fetchLeadsWithRetry = useCallback(async (retries = 3) => {
    for (let i = 0; i < retries; i++) {
      try {
        const data = await fetchLeads();
        return data.results.map(lead => ({ value: lead.id, label: lead.name || lead.email }));
      } catch (error) {
        if (i === retries - 1) throw error;
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1))); // Exponential backoff
      }
    }
  }, []);

  React.useEffect(() => {
    if (isOpen) {
      setLoadingLeads(true);
      fetchLeadsWithRetry()
        .then(options => setLeadsOptions(options))
        .catch(() => toast.error('Failed to fetch leads after retries.'))
        .finally(() => setLoadingLeads(false));
    }
  }, [isOpen, fetchLeadsWithRetry]);

  return { leadsOptions, loadingLeads };
};

// Sub-components
const Step1 = React.memo(({ values, setFieldValue }) => (
  <div className="space-y-6">
    <div>
      <label htmlFor="name" className="block text-sm font-medium text-gray-300">
        Campaign Name <span className="text-red-500">*</span>
      </label>
      <Field
        id="name"
        name="name"
        type="text"
        placeholder="e.g., Q2 Enterprise Outreach"
        className="mt-1 block w-full rounded-md border border-gray-600 px-3 py-2 bg-gray-700 text-gray-100 focus:border-indigo-500 focus:ring-indigo-500"
      />
      <ErrorMessage name="name" component="div" className="text-xs text-red-400 mt-1" />
    </div>
    <div>
      <label htmlFor="description" className="block text-sm font-medium text-gray-300">Description</label>
      <Field
        id="description"
        as="textarea"
        name="description"
        rows={3}
        placeholder="Campaign objectives and notes..."
        className="mt-1 block w-full rounded-md border border-gray-600 px-3 py-2 bg-gray-700 text-gray-100 focus:border-indigo-500 focus:ring-indigo-500"
      />
    </div>
    <div>
      <label htmlFor="tags" className="block text-sm font-medium text-gray-300">Tags</label>
      <Field
        id="tags"
        name="tags"
        type="text"
        placeholder="enterprise, q2-2024, outbound"
        className="mt-1 block w-full rounded-md border border-gray-600 px-3 py-2 bg-gray-700 text-gray-100 focus:border-indigo-500 focus:ring-indigo-500"
      />
    </div>
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label htmlFor="startDate" className="block text-sm font-medium text-gray-300">
          Start Date <span className="text-red-500">*</span>
        </label>
        <Field
          id="startDate"
          name="startDate"
          type="date"
          className="mt-1 block w-full rounded-md border border-gray-600 px-3 py-2 bg-gray-700 text-gray-100 focus:border-indigo-500 focus:ring-indigo-500"
        />
        <ErrorMessage name="startDate" component="div" className="text-xs text-red-400 mt-1" />
      </div>
      <div>
        <label htmlFor="endDate" className="block text-sm font-medium text-gray-300">
          End Date <span className="text-red-500">*</span>
        </label>
        <Field
          id="endDate"
          name="endDate"
          type="date"
          className="mt-1 block w-full rounded-md border border-gray-600 px-3 py-2 bg-gray-700 text-gray-100 focus:border-indigo-500 focus:ring-indigo-500"
        />
        <ErrorMessage name="endDate" component="div" className="text-xs text-red-400 mt-1" />
      </div>
    </div>
  </div>
));

const Step2 = React.memo(({ values, setFieldValue, leadsOptions, loadingLeads }) => (
  <div className="space-y-6">
    <div>
      <label className="block text-sm font-medium text-gray-300">Target Industries</label>
      <Select
        isMulti
        options={targetIndustriesOptions}
        value={values.targetIndustries.map(industry => ({ value: industry, label: industry }))}
        onChange={(selected) => setFieldValue('targetIndustries', selected ? selected.map(s => s.value) : [])}
        className="mt-1"
        classNamePrefix="select"
        placeholder="Select target industries..."
        styles={customSelectStyles}
        aria-label="Select target industries"
      />
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-300">Company Size</label>
      <Select
        isMulti
        options={companySizeOptions}
        value={values.companySize.map(size => ({ value: size, label: size }))}
        onChange={(selected) => setFieldValue('companySize', selected ? selected.map(s => s.value) : [])}
        className="mt-1"
        classNamePrefix="select"
        placeholder="Select company sizes..."
        styles={customSelectStyles}
        aria-label="Select company sizes"
      />
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-300">Job Titles</label>
      <Select
        isMulti
        options={jobTitlesOptions}
        value={values.jobTitles.map(title => ({ value: title, label: title }))}
        onChange={(selected) => setFieldValue('jobTitles', selected ? selected.map(s => s.value) : [])}
        className="mt-1"
        classNamePrefix="select"
        placeholder="Select job titles..."
        styles={customSelectStyles}
        aria-label="Select job titles"
      />
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-300">Leads</label>
      <Select
        isMulti
        isLoading={loadingLeads}
        options={leadsOptions}
        value={values.selectedLeads}
        onChange={(selected) => setFieldValue('selectedLeads', selected || [])}
        className="mt-1"
        classNamePrefix="select"
        placeholder="Select leads to target..."
        noOptionsMessage={() => loadingLeads ? 'Loading...' : 'No leads found'}
        styles={customSelectStyles}
        aria-label="Select leads"
      />
    </div>
    <div>
      <label htmlFor="targetAccounts" className="block text-sm font-medium text-gray-300">Target Accounts (Optional)</label>
      <Field
        id="targetAccounts"
        as="textarea"
        name="targetAccounts"
        rows={3}
        placeholder="Enter company names (one per line)"
        className="mt-1 block w-full rounded-md border border-gray-600 px-3 py-2 bg-gray-700 text-gray-100 focus:border-indigo-500 focus:ring-indigo-500"
      />
    </div>
    <div>
      <label htmlFor="excludedDomains" className="block text-sm font-medium text-gray-300">Excluded Domains</label>
      <Field
        id="excludedDomains"
        as="textarea"
        name="excludedDomains"
        rows={3}
        placeholder="Enter domains to exclude (one per line)"
        className="mt-1 block w-full rounded-md border border-gray-600 px-3 py-2 bg-gray-700 text-gray-100 focus:border-indigo-500 focus:ring-indigo-500"
      />
    </div>
  </div>
));

const EmailPreview = ({ template, variables }) => {
  const previewContent = useMemo(() => {
    let content = template || '';
    variables.forEach(v => {
      content = content.replace(new RegExp(`{${v.value}}`, 'g'), `<strong>${v.label.split(' - ')[1]}</strong>`);
    });
    return content;
  }, [template, variables]);

  return (
    <div className="mt-4 p-4 bg-gray-700 rounded-lg">
      <h4 className="text-gray-100">Email Preview</h4>
      <div className="text-gray-300" dangerouslySetInnerHTML={{ __html: previewContent }} />
    </div>
  );
};

const Step3 = React.memo(({ values, setFieldValue }) => {
  const sendTestEmail = async () => {
    try {
      const response = await fetch('/api/send-test-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: values.initialTemplateContent, to: 'test@example.com' }),
      });
      if (!response.ok) throw new Error('Test email failed');
      toast.success('Test email sent!');
    } catch (error) {
      toast.error(`Failed to send test email: ${error.message}`);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-100 mb-4">Initial Email Template</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {emailTemplates.map((template) => (
            <button
              key={template.id}
              type="button"
              onClick={() => setFieldValue('initialTemplate', template.id)}
              className={`p-4 border rounded-lg text-left transition-colors 
                ${values.initialTemplate === template.id ? 'border-indigo-500 bg-indigo-600' : 'border-gray-600 hover:border-indigo-500 bg-gray-700'}`}
              aria-label={`Select ${template.name} template`}
            >
              <h4 className="font-medium text-gray-100">{template.name}</h4>
              <p className="text-sm text-gray-300 mt-1">{template.subject}</p>
            </button>
          ))}
        </div>
      </div>
      <div>
        <label htmlFor="initialTemplateContent" className="block text-sm font-medium text-gray-300">Email Template Content</label>
        <Suspense fallback={<div className="text-gray-400">Loading editor...</div>}>
          <ReactQuill
            id="initialTemplateContent"
            value={values.initialTemplateContent}
            onChange={(content) => setFieldValue('initialTemplateContent', content)}
            placeholder="Compose your email template..."
            className="bg-gray-700 text-gray-100"
          />
        </Suspense>
        <EmailPreview template={values.initialTemplateContent} variables={personalizationVariablesOptions} />
        <button
          type="button"
          onClick={sendTestEmail}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 mt-2"
          aria-label="Send test email"
        >
          <Mail className="h-5 w-5" /> Send Test Email
        </button>
      </div>
      <div>
        <h3 className="text-lg font-medium text-gray-100 mb-4">Follow-up Templates</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {followUpTemplates.map((template) => (
            <button
              key={template.id}
              type="button"
              onClick={() => {
                const current = values.followUpTemplates;
                setFieldValue('followUpTemplates', current.includes(template.id) ? current.filter(id => id !== template.id) : [...current, template.id]);
              }}
              className={`p-4 border rounded-lg text-left transition-colors 
                ${values.followUpTemplates.includes(template.id) ? 'border-indigo-500 bg-indigo-600' : 'border-gray-600 hover:border-indigo-500 bg-gray-700'}`}
              aria-label={`Toggle ${template.name} follow-up`}
            >
              <h4 className="font-medium text-gray-100">{template.name}</h4>
              <p className="text-sm text-gray-300 mt-1">{template.subject}</p>
            </button>
          ))}
        </div>
      </div>
      <div>
        <label htmlFor="attachments" className="block text-sm font-medium text-gray-300">Attachments (Optional)</label>
        <input
          id="attachments"
          type="file"
          multiple
          onChange={(e) => {
            const files = Array.from(e.target.files);
            const maxSize = 5 * 1024 * 1024; // 5MB
            const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
            if (files.every(file => file.size <= maxSize && allowedTypes.includes(file.type))) {
              setFieldValue('attachments', files);
            } else {
              toast.error('Invalid files: Max 5MB, PDF/JPEG/PNG only.');
            }
          }}
          className="mt-1 block w-full text-gray-100"
        />
        <p className="text-xs text-gray-400 mt-1">Max 5MB, PDF/JPEG/PNG only.</p>
      </div>
    </div>
  );
});

const Step4 = React.memo(({ values, setFieldValue }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label htmlFor="dailyLimit" className="block text-sm font-medium text-gray-300">
          Daily Email Limit <span className="text-red-500">*</span>
        </label>
        <Field
          id="dailyLimit"
          name="dailyLimit"
          type="number"
          min="1"
          className="mt-1 block w-full rounded-md border border-gray-600 px-3 py-2 bg-gray-700 text-gray-100 focus:border-indigo-500 focus:ring-indigo-500"
        />
        <ErrorMessage name="dailyLimit" component="div" className="text-xs text-red-400 mt-1" />
      </div>
      <div>
        <label htmlFor="warmupPeriod" className="block text-sm font-medium text-gray-300">
          Warmup Period (days) <span className="text-red-500">*</span>
        </label>
        <Field
          id="warmupPeriod"
          name="warmupPeriod"
          type="number"
          min="0"
          className="mt-1 block w-full rounded-md border border-gray-600 px-3 py-2 bg-gray-700 text-gray-100 focus:border-indigo-500 focus:ring-indigo-500"
        />
        <ErrorMessage name="warmupPeriod" component="div" className="text-xs text-red-400 mt-1" />
      </div>
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-300">Sending Window</label>
      <div className="grid grid-cols-2 gap-4 mt-1">
        <div>
          <label htmlFor="sendingWindowStart" className="block text-xs text-gray-500">Start Time</label>
          <Field
            id="sendingWindowStart"
            name="sendingWindow.start"
            type="time"
            className="block w-full rounded-md border border-gray-600 px-3 py-2 bg-gray-700 text-gray-100 focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label htmlFor="sendingWindowEnd" className="block text-xs text-gray-500">End Time</label>
          <Field
            id="sendingWindowEnd"
            name="sendingWindow.end"
            type="time"
            className="block w-full rounded-md border border-gray-600 px-3 py-2 bg-gray-700 text-gray-100 focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
      </div>
    </div>
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label htmlFor="minimumDelay" className="block text-sm font-medium text-gray-300">
          Follow-up Delay (Min hours) <span className="text-red-500">*</span>
        </label>
        <Field
          id="minimumDelay"
          name="minimumDelay"
          type="number"
          min="0"
          className="mt-1 block w-full rounded-md border border-gray-600 px-3 py-2 bg-gray-700 text-gray-100 focus:border-indigo-500 focus:ring-indigo-500"
        />
        <ErrorMessage name="minimumDelay" component="div" className="text-xs text-red-400 mt-1" />
      </div>
      <div>
        <label htmlFor="maximumDelay" className="block text-sm font-medium text-gray-300">
          Follow-up Delay (Max hours) <span className="text-red-500">*</span>
        </label>
        <Field
          id="maximumDelay"
          name="maximumDelay"
          type="number"
          min={values.minimumDelay}
          className="mt-1 block w-full rounded-md border border-gray-600 px-3 py-2 bg-gray-700 text-gray-100 focus:border-indigo-500 focus:ring-indigo-500"
        />
        <ErrorMessage name="maximumDelay" component="div" className="text-xs text-red-400 mt-1" />
      </div>
    </div>
    <div className="bg-blue-500 border border-blue-600 rounded-lg p-4">
      <div className="flex">
        <Settings className="h-5 w-5 text-blue-300" />
        <div className="ml-3">
          <h3 className="text-sm font-medium text-blue-100">Campaign Settings Summary</h3>
          <ul className="mt-2 text-sm text-blue-200 space-y-1">
            <li>Emails sent between {values.sendingWindow.start} and {values.sendingWindow.end}</li>
            <li>Maximum of {values.dailyLimit} emails per day</li>
            <li>{values.warmupPeriod} days warmup period</li>
            <li>Follow-ups between {values.minimumDelay} and {values.maximumDelay} hours</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
));

const CampaignSummary = React.memo(({ values, onLaunch }) => (
  <div className="space-y-4">
    <h3 className="text-lg font-medium text-gray-100">Campaign Summary</h3>
    <p><strong>Name:</strong> {values.name}</p>
    <p><strong>Targets:</strong> {values.targetIndustries.join(', ')} - {values.jobTitles.join(', ')}</p>
    <p><strong>Emails:</strong> {values.dailyLimit}/day, {values.warmupPeriod} days warmup</p>
    <button
      type="button"
      onClick={onLaunch}
      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
      aria-label="Launch campaign"
    >
      Launch Campaign
    </button>
  </div>
));

const Step5 = React.memo(({ values, onLaunch }) => (
  <CampaignSummary values={values} onLaunch={onLaunch} />
));

// Main Component
const NewCampaignModal = ({ isOpen, onClose, onAdd }) => {
  const [step, setStep] = useState(1);
  const { leadsOptions, loadingLeads } = useFetchLeads(isOpen);

  const debouncedSave = useCallback(
    debounce((values) => {
      localStorage.setItem('newCampaignFormData', JSON.stringify(values));
    }, 500),
    []
  );

  const handleLaunch = useCallback(async (values, { setSubmitting, resetForm }) => {
    setSubmitting(true);
    try {
      const payload = {
        name: values.name,
        description: values.description,
        target_industries: values.targetIndustries,
        company_size: values.companySize,
        job_titles: values.jobTitles,
        target_accounts: values.targetAccounts ? values.targetAccounts.split('\n').map(acc => acc.trim()) : [],
        excluded_domains: values.excludedDomains ? values.excludedDomains.split('\n').map(domain => domain.trim()) : [],
        initial_template: values.initialTemplate,
        initial_template_content: values.initialTemplateContent,
        follow_up_templates: values.followUpTemplates,
        selected_leads: values.selectedLeads.map(lead => lead.value),
        daily_limit: values.dailyLimit,
        warmup_period: values.warmupPeriod,
        sending_window_start: values.sendingWindow.start,
        sending_window_end: values.sendingWindow.end,
        start_date: values.startDate,
        end_date: values.endDate,
        timezone: values.timezone,
        tags: values.tags ? values.tags.split(',').map(tag => tag.trim()) : [],
        minimum_delay: values.minimumDelay,
        maximum_delay: values.maximumDelay,
        attachments: values.attachments, // Backend should handle file uploads
      };
      const campaign = await createCampaign(payload);
      await startCampaign(campaign.id);
      onAdd(campaign);
      onClose();
      toast.success('Campaign launched successfully!');
      resetForm();
      setStep(1);
      localStorage.removeItem('newCampaignFormData');
    } catch (error) {
      toast.error(`Failed to launch campaign: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  }, [onAdd, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center overflow-auto">
      <div className="bg-gray-800 rounded-xl shadow-xl w-full max-w-4xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-100">Create New Campaign</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500" aria-label="Close campaign modal">
            <X className="h-5 w-5" />
          </button>
        </div>
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {['Campaign Details', 'Target Audience', 'Email Templates', 'Settings', 'Summary'].map((stepName, index) => (
              <div key={index} className="flex items-center">
                <div className={`flex items-center justify-center h-8 w-8 rounded-full border-2 
                  ${step > index + 1 ? 'bg-indigo-600 border-indigo-600' : step === index + 1 ? 'border-indigo-600' : 'border-gray-300'}`}>
                  <span className={`text-sm font-medium ${step > index + 1 ? 'text-white' : step === index + 1 ? 'text-indigo-600' : 'text-gray-500'}`}>
                    {index + 1}
                  </span>
                </div>
                <span className="ml-2 text-sm font-medium text-gray-100">{stepName}</span>
                {index < 4 && <div className="mx-4 h-0.5 w-10 bg-gray-600" />}
              </div>
            ))}
          </div>
        </div>
        <Formik
          initialValues={initialFormData}
          validationSchema={validationSchema}
          onSubmit={handleLaunch}
        >
          {({ values, setFieldValue, isSubmitting, setSubmitting, resetForm }) => (
            <Form className="space-y-8">
              {step === 1 && <Step1 values={values} setFieldValue={setFieldValue} />}
              {step === 2 && <Step2 values={values} setFieldValue={setFieldValue} leadsOptions={leadsOptions} loadingLeads={loadingLeads} />}
              {step === 3 && <Step3 values={values} setFieldValue={setFieldValue} />}
              {step === 4 && <Step4 values={values} setFieldValue={setFieldValue} />}
              {step === 5 && <Step5 values={values} onLaunch={() => handleLaunch(values, { setSubmitting, resetForm })} />}
              <div className="flex justify-between gap-3 mt-6">
                {step > 1 && (
                  <button
                    type="button"
                    onClick={() => setStep(step - 1)}
                    className="px-4 py-2 border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-700"
                    aria-label="Previous step"
                  >
                    Previous
                  </button>
                )}
                <div className="flex gap-3 ml-auto">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-700"
                    aria-label="Cancel campaign creation"
                  >
                    Cancel
                  </button>
                  {step < 5 ? (
                    <button
                      type="button"
                      onClick={() => setStep(step + 1)}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                      aria-label="Next step"
                    >
                      Next
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-600"
                      aria-label="Save and launch campaign"
                    >
                      {isSubmitting ? 'Launching...' : 'Save & Launch'}
                    </button>
                  )}
                </div>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

NewCampaignModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onAdd: PropTypes.func.isRequired,
};

export default NewCampaignModal;