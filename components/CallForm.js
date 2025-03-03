// src/components/CallForm.js
import React, { useState, useEffect } from 'react';
import Button from '../components/Button';
import { toast } from 'react-toastify';
import { generateCallScript, searchLeads } from '../services/api';

const CallForm = ({ initialData = {}, onSubmit }) => {
  // Form fields
  const [leadDetails, setLeadDetails] = useState(initialData.leadDetails || null);
  const [phoneNumber, setPhoneNumber] = useState(initialData.phone_number || '');
  const [task, setTask] = useState(initialData.task || '');
  const [startTime, setStartTime] = useState(initialData.start_time || '');
  const [voice, setVoice] = useState(initialData.voice || '');
  const [language, setLanguage] = useState(initialData.language || '');
  const [timezone, setTimezone] = useState(initialData.timezone || '');
  const [productInfo, setProductInfo] = useState(initialData.productInfo || '');

  // Tags management as array of strings
  const [tags, setTags] = useState(initialData.tags || []);
  const [tagInput, setTagInput] = useState('');

  // AI Script generation state
  const [generatedScript, setGeneratedScript] = useState(null);
  const [loadingScript, setLoadingScript] = useState(false);
  const [scriptError, setScriptError] = useState('');

  // Lead search states
  const [leadSearch, setLeadSearch] = useState('');
  const [leadResults, setLeadResults] = useState([]);

  // --- Helper: Build the AI prompt ---
  const getAIPrompt = (callTask, tagsArray, lead, product) => {
    let prompt = `You are a sales assistant helping to craft an outbound sales call script.

**Call Objective:** ${callTask}
${tagsArray && tagsArray.length > 0 ? `**Key Topics/Tags:** ${tagsArray.join(', ')}` : ''}
${lead ? `
**Lead Details:**
Name: ${lead.firstName} ${lead.lastName}
Company: ${lead.company}
Job Title: ${lead.jobTitle}
Email: ${lead.email}
Phone: ${lead.phone}
${lead.painPoints ? `Pain Points: ${lead.painPoints}` : ''}` : ''}
${product ? `
**Product Information:**
${product}` : ''}

Please generate a concise, persuasive sales call script that includes:
- A brief opening.
- Statement of the call reason.
- Engaging, open-ended questions to uncover needs.
- A clear call to action.

Format your response in the following structure (approximately 100 words):
Opening, Call Reason, Conversation (with questions), and Call to Action.
`;
    return prompt;
  };

  // --- Handle Tag Input ---
  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const trimmedTag = tagInput.trim();
      if (trimmedTag && !tags.includes(trimmedTag)) {
        setTags([...tags, trimmedTag]);
      } else if (!trimmedTag) {
        toast.error('Tag cannot be empty.');
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  // --- Handle Lead Search ---
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (leadSearch.trim()) {
        // Call the real API endpoint to search for leads.
        searchLeads({ query: leadSearch })
          .then(results => setLeadResults(results))
          .catch(err => {
            console.error(err);
            toast.error('Error searching for leads.');
          });
      } else {
        setLeadResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [leadSearch]);

  const handleSelectLead = (lead) => {
    setLeadDetails(lead);
    // When a lead is selected, disable phone number input.
    setPhoneNumber(lead.phone || '');
    setLeadResults([]);
    setLeadSearch('');
  };

  // --- Handle AI Script Generation ---
  const handleGenerateScript = async () => {
    if (!task) {
      toast.error('Please enter a call task description before generating a script.');
      return;
    }
    setScriptError('');
    setLoadingScript(true);
    try {
      const dataToSend = {
        // Optional fields: if not available, they will default in the backend
        leadDetails: leadDetails,       
        productDetails: productInfo,    
        callObjective: task,            // Required field
        options: { tags }               
      };
  
      const response = await generateCallScript(dataToSend);
      if (response?.script) {
        setGeneratedScript(response.script);
      } else {
        setScriptError('Failed to generate script. Please try again.');
        toast.error('Failed to generate script. Please try again.');
      }
    } catch (error) {
      console.error('Error generating script:', error);
      setScriptError(error.message);
      toast.error(error.message);
    } finally {
      setLoadingScript(false);
    }
  };

  // --- Use Generated Script ---
  const handleUseScript = () => {
    if (generatedScript) {
      setTask(generatedScript);
      toast.success('Script applied to call task.');
    }
  };

  // --- Form Submission ---
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!phoneNumber || !task) {
      toast.error('Please fill in all required fields.');
      return;
    }
    const data = {
      leadDetails,
      phone_number: phoneNumber,
      task,
      start_time: startTime || null,
      voice: voice.trim() !== '' ? voice : 'nat',
      language: language.trim() !== '' ? language : 'en',
      timezone: timezone.trim() !== '' ? timezone : 'UTC',
      tags,
      productInfo,
    };
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-gray-900 text-white p-4" aria-label="Call Form">
      {/* Lead Selection Section */}
      <fieldset className="border border-gray-700 p-4 rounded" aria-label="Lead Selection">
        <legend className="px-2">Select Lead</legend>
        <div className="mb-2">
          <label htmlFor="leadSearch" className="block text-sm font-medium">
            Search Lead
          </label>
          <input
            type="text"
            id="leadSearch"
            name="leadSearch"
            value={leadSearch}
            onChange={(e) => setLeadSearch(e.target.value)}
            placeholder="Enter lead name or company"
            className="mt-1 block w-full border border-gray-700 rounded-md p-2 bg-gray-800 text-white"
            aria-label="Lead search input"
          />
        </div>
        {leadResults.length > 0 && (
          <ul className="border border-gray-700 rounded p-2 max-h-40 overflow-y-auto bg-gray-800">
            {leadResults.map((lead) => (
              <li
                key={lead.id}
                onClick={() => handleSelectLead(lead)}
                className="cursor-pointer hover:bg-gray-700 p-1"
                aria-label={`Select lead ${lead.firstName} ${lead.lastName}`}
              >
                {lead.firstName} {lead.lastName} - {lead.company}
              </li>
            ))}
          </ul>
        )}
        {leadDetails && (
          <div className="mt-2 p-2 bg-gray-800 rounded">
            <p><strong>Selected Lead:</strong> {leadDetails.firstName} {leadDetails.lastName}</p>
            <p>{leadDetails.company} - {leadDetails.jobTitle}</p>
          </div>
        )}
      </fieldset>

      {/* Product Information */}
      <div>
        <label htmlFor="productInfo" className="block text-sm font-medium">
          Product/Service Information (Optional)
        </label>
        <textarea
          id="productInfo"
          name="productInfo"
          value={productInfo}
          onChange={(e) => setProductInfo(e.target.value)}
          placeholder="Describe the product or service being offered..."
          rows="3"
          className="mt-1 block w-full border border-gray-700 rounded-md p-2 bg-gray-800 text-white"
          aria-label="Product information"
        ></textarea>
      </div>

      {/* Phone Number */}
      <div>
        <label htmlFor="phoneNumber" className="block text-sm font-medium">
          Phone Number<span className="text-red-500">*</span>
        </label>
        <input
          type="tel"
          id="phoneNumber"
          name="phoneNumber"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          required
          disabled={leadDetails ? true : false}
          placeholder="+1234567890"
          className="mt-1 block w-full border border-gray-700 rounded-md p-2 bg-gray-800 text-white"
          aria-label="Phone number"
        />
      </div>

      {/* Call Task and AI Script Generation */}
      <div>
        <label htmlFor="task" className="block text-sm font-medium">
          Call Task / Script Description<span className="text-red-500">*</span>
        </label>
        <textarea
          id="task"
          name="task"
          value={task}
          onChange={(e) => setTask(e.target.value)}
          required
          rows="4"
          placeholder="Describe the purpose of the call..."
          className="mt-1 block w-full border border-gray-700 rounded-md p-2 bg-gray-800 text-white"
          aria-label="Call task description"
        ></textarea>
      </div>

      {/* Tags Input */}
      <div>
        <label htmlFor="tags" className="block text-sm font-medium">
          Tags (Optional)
        </label>
        <input
          type="text"
          id="tags"
          name="tags"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={handleTagKeyDown}
          placeholder="Type a tag and press Enter"
          className="mt-1 block w-full border border-gray-700 rounded-md p-2 bg-gray-800 text-white"
          aria-label="Tags input"
        />
        {tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {tags.map((tag, index) => (
              <span
                key={index}
                className="bg-blue-900 text-blue-300 rounded-full px-2 py-1 text-sm flex items-center"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="ml-1 text-red-500"
                  aria-label={`Remove tag ${tag}`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Generate Script Section */}
      <div className="space-y-2">
        <Button
          type="button"
          variant="secondary"
          onClick={handleGenerateScript}
          disabled={loadingScript}
          aria-label="Generate call script"
        >
          {loadingScript ? 'Generating Script...' : 'Generate Script'}
        </Button>
        {scriptError && (
          <p className="text-red-500 text-sm">{scriptError}</p>
        )}
        {generatedScript && (
          <div className="border border-gray-700 rounded p-2 bg-gray-800">
            <p className="mb-2 text-sm text-gray-300">
              AI Generated Script (click "Use Script" to replace current content):
            </p>
            <textarea
              readOnly
              value={generatedScript}
              rows="4"
              className="w-full border border-gray-700 rounded-md p-2 bg-gray-900 text-white"
              aria-label="Generated script preview"
            ></textarea>
            <Button
              type="button"
              variant="primary"
              onClick={handleUseScript}
              aria-label="Use generated script"
              className="mt-2"
            >
              Use Script
            </Button>
          </div>
        )}
      </div>

      {/* Other Fields */}
      <div>
        <label htmlFor="startTime" className="block text-sm font-medium">
          Start Time (Optional)
        </label>
        <input
          type="datetime-local"
          id="startTime"
          name="start_time"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          className="mt-1 block w-full border border-gray-700 rounded-md p-2 bg-gray-800 text-white"
          aria-label="Call start time"
        />
      </div>
      <div>
        <label htmlFor="voice" className="block text-sm font-medium">
          Voice (Optional)
        </label>
        <input
          type="text"
          id="voice"
          name="voice"
          value={voice}
          onChange={(e) => setVoice(e.target.value)}
          placeholder="nat"
          className="mt-1 block w-full border border-gray-700 rounded-md p-2 bg-gray-800 text-white"
          aria-label="Voice option"
        />
      </div>
      <div>
        <label htmlFor="language" className="block text-sm font-medium">
          Language (Optional)
        </label>
        <input
          type="text"
          id="language"
          name="language"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          placeholder="en"
          className="mt-1 block w-full border border-gray-700 rounded-md p-2 bg-gray-800 text-white"
          aria-label="Language option"
        />
      </div>
      <div>
        <label htmlFor="timezone" className="block text-sm font-medium">
          Timezone (Optional)
        </label>
        <input
          type="text"
          id="timezone"
          name="timezone"
          value={timezone}
          onChange={(e) => setTimezone(e.target.value)}
          placeholder="UTC"
          className="mt-1 block w-full border border-gray-700 rounded-md p-2 bg-gray-800 text-white"
          aria-label="Timezone option"
        />
      </div>

      {/* Submit Buttons */}
      <div className="flex justify-end space-x-2">
        <Button type="submit" variant="primary" aria-label="Submit call form">
          Send
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => window.history.back()}
          aria-label="Cancel call form"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default CallForm;