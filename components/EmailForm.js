// src/components/EmailForm.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Send, Wand2, Copy, RotateCcw, X } from 'lucide-react';
import { fetchLeads, fetchCampaigns, generateAIDraft } from '../services/api';
import { toast } from 'react-toastify';
import Button from './Button';
import api from '../services/api';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import debounce from 'lodash/debounce';
import sanitizeHtml from 'sanitize-html';

const sampleTemplates = [
  {
    id: '1',
    name: 'Initial Outreach',
    subject: 'Streamline your sales process with AI',
    content: `Hi {{firstName}},\n\nI noticed that {{company}} has been expanding its sales operations, and I wanted to reach out about how AI automation could help scale your outbound efforts while maintaining personalization.\n\nWould you be open to a quick chat about how other {{industry}} companies are using our platform to increase their response rates by 40%?\n\nBest regards,\n{{sender}}`,
  },
  {
    id: '2',
    name: 'Follow-up',
    subject: 'Quick follow up - {{company}}',
    content: `Hi {{firstName}},\n\nI wanted to follow up on my previous email about helping {{company}} scale its sales operations with AI automation.\n\nI recently helped a similar {{industry}} company increase their meeting bookings by 3x while reducing their SDR workload. I'd love to share how we could achieve similar results for your team.\n\nDo you have 15 minutes this week for a quick chat?\n\nBest,\n{{sender}}`,
  },
];

const sampleLead = {
  firstName: 'John',
  lastName: 'Smith',
  company: 'TechCorp',
  industry: 'Software',
  role: 'Head of Sales',
  painPoints: ['Long sales cycles', 'Low response rates', 'Manual follow-ups'],
  recentNews: 'Recently expanded to European market',
};

export default function EmailForm({ initialData = {}, onSubmit }) {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [recipient, setRecipient] = useState(initialData.recipient || '');
  const [subject, setSubject] = useState(initialData.subject || '');
  const [body, setBody] = useState(initialData.body || '');
  const [website, setWebsite] = useState(initialData.website || '');
  const [leadId, setLeadId] = useState(initialData.lead ? initialData.lead.id : '');
  const [campaignId, setCampaignId] = useState(initialData.campaign ? initialData.campaign.id : '');
  const [leads, setLeads] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [tone, setTone] = useState('professional');
  const [approach, setApproach] = useState('value-based');
  const [length, setLength] = useState('medium');

  // Fetch dropdown data with retry logic
  const fetchWithRetry = useCallback(async (apiFunc, retries = 3) => {
    for (let i = 0; i < retries; i++) {
      try {
        return await apiFunc();
      } catch (error) {
        if (i === retries - 1) throw error;
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
  }, []);

  useEffect(() => {
    const loadDropdownData = async () => {
      setLoading(true);
      try {
        const leadsData = await fetchWithRetry(() => fetchLeads({ page: 1, page_size: 1000 }));
        setLeads(leadsData.results || []);
        const campaignsData = await fetchWithRetry(() => fetchCampaigns({ page: 1, page_size: 1000 }));
        setCampaigns(campaignsData.results || []);
      } catch (error) {
        toast.error('Failed to load leads or campaigns after retries.');
      } finally {
        setLoading(false);
      }
    };
    loadDropdownData();
  }, [fetchWithRetry]);

  const handleTemplateSelect = useCallback((template) => {
    setSelectedTemplate(template);
    setSubject(template.subject);
    setBody(template.content);
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!recipient || !subject || !body) {
      toast.error('Please fill in all required fields.');
      return;
    }
    setSaving(true);
    try {
      const sanitizedData = {
        recipient: sanitizeHtml(recipient),
        subject: sanitizeHtml(subject),
        body: sanitizeHtml(body, { allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img']) }),
        website: sanitizeHtml(website),
        lead_id: leadId || null,
        campaign_id: campaignId || null,
      };
      await onSubmit(sanitizedData);
      toast.success('Email saved successfully.');
    } catch (error) {
      toast.error(`Failed to save email: ${error.message}`);
    } finally {
      setSaving(false);
    }
  }, [recipient, subject, body, website, leadId, campaignId, onSubmit]);

  const handleGenerateDraft = useCallback(async () => {
    if (!subject) {
      toast.error('Please enter a subject before generating an AI draft.');
      return;
    }
    if (!leadId) {
      toast.error('Please select a lead to tailor the message.');
      return;
    }
    setAiLoading(true);
    try {
      const response = await fetchWithRetry(() => generateAIDraft(leadId, subject, website, {
        max_tokens: length === 'short' ? 300 : length === 'medium' ? 600 : 900,
        temperature: 0.9,
        tone,
        approach,
        length,
      }));
      if (response.draftSubject && response.draftContent) {
        setSubject(response.draftSubject); // Set AI-generated subject
        setBody(response.draftContent);    // Set AI-generated body
        toast.success('AI draft generated successfully!');
      } else {
        toast.error('Invalid response from AI.');
      }
    } catch (error) {
      toast.error(`Failed to generate AI draft: ${error.message}`);
    } finally {
      setAiLoading(false);
    }
  }, [leadId, subject, website, tone, approach, length]);

  const handleSendEmail = useCallback(async () => {
    if (!recipient || !subject || !body) {
      toast.error('Please fill in all required fields before sending.');
      return;
    }
    setSending(true);
    try {
      const response = await fetchWithRetry(() => api.post('send-email/', {
        to: recipient,
        subject,
        message: body,
      }));
      if (response.data.id) {
        toast.success('Email sent successfully via Gmail!');
      } else {
        throw new Error('No email ID returned');
      }
    } catch (error) {
      toast.error(`Failed to send email: ${error.message}`);
    } finally {
      setSending(false);
    }
  }, [recipient, subject, body]);

  if (loading) {
    return <div className="py-4 text-gray-300">Loading form options...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-sm text-gray-100">
      {/* Recipient Field */}
      <div className="bg-gray-800 p-4 rounded shadow">
        <label htmlFor="recipient" className="block font-medium mb-1">
          Recipient Email <span className="text-red-400">*</span>
        </label>
        <input
          type="email"
          id="recipient"
          name="recipient"
          placeholder="example@domain.com"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          required
          className="w-full p-2 border border-gray-700 rounded focus:ring-indigo-500 bg-gray-900"
          aria-label="Recipient email"
        />
      </div>

      {/* Subject Field */}
      <div className="bg-gray-800 p-4 rounded shadow">
        <label htmlFor="subject" className="block font-medium mb-1">
          Subject <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          id="subject"
          name="subject"
          placeholder="Enter email subject..."
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          required
          className="w-full p-2 border border-gray-700 rounded focus:ring-indigo-500 bg-gray-900"
          aria-label="Email subject"
        />
      </div>

      {/* Website URL Field */}
      <div className="bg-gray-800 p-4 rounded shadow">
        <label htmlFor="website" className="block font-medium mb-1">
          Website URL (Optional)
          <span className="text-gray-400 ml-2" title="Include for AI to personalize based on website content">(?)</span>
        </label>
        <input
          type="url"
          id="website"
          name="website"
          placeholder="https://example.com"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          className="w-full p-2 border border-gray-700 rounded focus:ring-indigo-500 bg-gray-900"
          aria-label="Website URL"
        />
      </div>

      {/* Templates */}
      <div className="bg-gray-800 p-4 rounded shadow">
        <label className="block text-sm font-medium mb-2">Templates</label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sampleTemplates.map((template) => (
            <button
              key={template.id}
              type="button"
              onClick={() => handleTemplateSelect(template)}
              className={`p-4 border rounded text-left hover:border-indigo-400 transition-colors ${
                selectedTemplate?.id === template.id ? 'border-indigo-500 ring-2 ring-indigo-200' : 'border-gray-700'
              }`}
              aria-label={`Select ${template.name} template`}
            >
              <h3 className="font-medium text-gray-100">{template.name}</h3>
              <p className="text-sm text-gray-400 mt-1 truncate">{template.subject}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Email Content & AI Assistant Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Email Content Editor */}
        <div className="lg:col-span-2">
          <div className="bg-gray-800 p-6 rounded-xl shadow-sm">
            <div className="mb-4">
              <label htmlFor="content" className="block text-sm font-medium mb-2">
                Email Content <span className="text-red-400">*</span>
              </label>
              <ReactQuill
                id="content"
                value={body}
                onChange={setBody}
                placeholder="Write your email content or generate an AI draft..."
                className="bg-gray-900 text-gray-100 border border-gray-700 rounded"
                modules={{ toolbar: [['bold', 'italic', 'underline'], ['link'], [{ list: 'ordered' }, { list: 'bullet' }]] }}
              />
              <div className="flex justify-end gap-2 mt-2">
                <Button variant="ghost" size="icon" title="Copy content" onClick={() => navigator.clipboard.writeText(body)} aria-label="Copy content">
                  <Copy className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" title="Reset content" onClick={() => setBody('')} aria-label="Reset content">
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* AI Assistant Panel */}
        <div className="lg:col-span-1">
          <div className="bg-gray-800 p-6 rounded-xl shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-100">AI Assistant</h2>
              <button
                className="text-gray-400 hover:text-gray-300 lg:hidden"
                onClick={() => setShowAIPanel(!showAIPanel)}
                aria-label={showAIPanel ? "Hide AI panel" : "Show AI panel"}
              >
                {showAIPanel ? <X className="h-5 w-5" /> : <Wand2 className="h-5 w-5" />}
              </button>
            </div>
            {(showAIPanel || window.innerWidth >= 1024) && (
              <div className="space-y-6">
                <div>
                  <label htmlFor="tone" className="block text-sm font-medium mb-2">Tone</label>
                  <select
                    id="tone"
                    value={tone}
                    onChange={(e) => setTone(e.target.value)}
                    className="w-full p-2 border border-gray-700 rounded focus:ring-indigo-500 bg-gray-900"
                    aria-label="Select tone"
                  >
                    <option value="professional">Professional</option>
                    <option value="friendly">Friendly</option>
                    <option value="direct">Direct</option>
                    <option value="consultative">Consultative</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="approach" className="block text-sm font-medium mb-2">Sales Approach</label>
                  <select
                    id="approach"
                    value={approach}
                    onChange={(e) => setApproach(e.target.value)}
                    className="w-full p-2 border border-gray-700 rounded focus:ring-indigo-500 bg-gray-900"
                    aria-label="Select sales approach"
                  >
                    <option value="value-based">Value-based</option>
                    <option value="problem-solution">Problem-Solution</option>
                    <option value="social-proof">Social Proof</option>
                    <option value="pain-point">Pain Point Focus</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="length" className="block text-sm font-medium mb-2">Email Length</label>
                  <select
                    id="length"
                    value={length}
                    onChange={(e) => setLength(e.target.value)}
                    className="w-full p-2 border border-gray-700 rounded focus:ring-indigo-500 bg-gray-900"
                    aria-label="Select email length"
                  >
                    <option value="short">Short (2-3 sentences)</option>
                    <option value="medium">Medium (4-5 sentences)</option>
                    <option value="long">Long (6+ sentences)</option>
                  </select>
                </div>
                <Button
                  type="button"
                  onClick={handleGenerateDraft}
                  disabled={aiLoading}
                  className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center justify-center gap-2 disabled:bg-gray-600"
                  aria-label="Generate AI draft"
                >
                  <Wand2 className="h-4 w-4" />
                  {aiLoading ? 'Generating...' : 'Generate AI Draft'}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lead and Campaign Dropdowns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-800 p-4 rounded shadow">
          <label htmlFor="lead" className="block text-sm font-medium mb-1">
            Lead (Optional)
            <span className="text-gray-400 ml-2" title="Select a lead for AI personalization">(?)</span>
          </label>
          <select
            id="lead"
            value={leadId}
            onChange={(e) => setLeadId(e.target.value)}
            className="w-full p-2 border border-gray-700 rounded focus:ring-indigo-500 bg-gray-900"
            aria-label="Select lead"
          >
            <option value="">Select Lead</option>
            {leads.map((lead) => (
              <option key={lead.id} value={lead.id}>
                {lead.first_name} {lead.last_name} ({lead.email})
              </option>
            ))}
          </select>
        </div>
        <div className="bg-gray-800 p-4 rounded shadow">
          <label htmlFor="campaign" className="block text-sm font-medium mb-1">Campaign (Optional)</label>
          <select
            id="campaign"
            value={campaignId}
            onChange={(e) => setCampaignId(e.target.value)}
            className="w-full p-2 border border-gray-700 rounded focus:ring-indigo-500 bg-gray-900"
            aria-label="Select campaign"
          >
            <option value="">Select Campaign</option>
            {campaigns.map((campaign) => (
              <option key={campaign.id} value={campaign.id}>{campaign.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          disabled={sending || saving}
          onClick={handleSendEmail}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded disabled:opacity-50 flex items-center gap-2"
          aria-label="Send email via Gmail"
        >
          <Send className="h-4 w-4" />
          {sending ? 'Sending...' : 'Send via Gmail'}
        </Button>
        <Button
          type="submit"
          disabled={saving || sending}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-50"
          aria-label="Save draft"
        >
          {saving ? 'Saving...' : 'Save Draft'}
        </Button>
        <Button
          type="button"
          onClick={() => window.history.back()}
          className="bg-gray-700 hover:bg-gray-600 text-gray-100 px-4 py-2 rounded"
          aria-label="Cancel"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}