// src/components/WorkflowNodeEditor.jsx

import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import PropTypes from 'prop-types';
import { X } from 'lucide-react';

Modal.setAppElement('#root'); // Important for accessibility

const WorkflowNodeEditor = ({ isOpen, onClose, nodeData, onSave }) => {
  const [formValues, setFormValues] = useState({ ...nodeData });

  useEffect(() => {
    setFormValues({ ...nodeData });
  }, [nodeData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues({ ...formValues, [name]: value });
  };

  const handleParameterChange = (e) => {
    const { name, value } = e.target;
    setFormValues({ 
      ...formValues, 
      parameters: { 
        ...formValues.parameters, 
        [name]: value 
      } 
    });
  };

  const nodeTypeConfigs = {
    input: { label: 'Input Node' },
    action: { label: 'Action Node' },
    condition: { label: 'Condition Node' },
    delay: { label: 'Delay Node' },
    dataEnrichment: { label: 'Data Enrichment Node' },
  };  

  const handleSave = () => {
    onSave(formValues);
    onClose();
  };

  // Dynamic form based on nodeType
  const renderFormFields = () => {
    switch (formValues.nodeType) {
      case 'input':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-300">Industry</label>
              <select
                name="industry"
                value={formValues.parameters.industry || ''}
                onChange={handleParameterChange}
                className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-gray-100"
              >
                <option value="">Select Industry</option>
                <option value="fintech">FinTech</option>
                <option value="healthcare">Healthcare</option>
                <option value="technology">Technology</option>
                {/* Add more industries as needed */}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300">Location</label>
              <select
                name="location"
                value={formValues.parameters.location || ''}
                onChange={handleParameterChange}
                className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-gray-100"
              >
                <option value="">Select Location</option>
                <option value="san_francisco">San Francisco</option>
                <option value="new_york">New York</option>
                <option value="los_angeles">Los Angeles</option>
                {/* Add more locations as needed */}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300">Company Size</label>
              <select
                name="companySize"
                value={formValues.parameters.companySize || ''}
                onChange={handleParameterChange}
                className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-gray-100"
              >
                <option value="">Select Company Size</option>
                <option value="1-10">1-10 Employees</option>
                <option value="11-50">11-50 Employees</option>
                <option value="51-200">51-200 Employees</option>
                <option value="201-500">201-500 Employees</option>
                <option value="501-1000">501-1000 Employees</option>
                <option value="1001+">1001+ Employees</option>
              </select>
            </div>
          </>
        );
      case 'action':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-300">Action Type</label>
              <select
                name="actionType"
                value={formValues.parameters.actionType || ''}
                onChange={handleParameterChange}
                className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-gray-100"
              >
                <option value="">Select Action</option>
                <option value="send_email">Send Email</option>
                <option value="export_leads">Export Leads</option>
                <option value="run_campaign">Run Outreach Campaign</option>
                {/* Add more action types as needed */}
              </select>
            </div>
            {formValues.parameters.actionType === 'send_email' && (
              <div>
                <label className="block text-sm font-medium text-gray-300">Email Template ID</label>
                <input
                  type="text"
                  name="emailTemplateId"
                  value={formValues.parameters.emailTemplateId || ''}
                  onChange={handleParameterChange}
                  className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-gray-100"
                  placeholder="Enter Email Template ID"
                />
              </div>
            )}
            {/* Add more action-specific fields */}
          </>
        );
      case 'condition':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-300">Condition Type</label>
              <select
                name="conditionType"
                value={formValues.parameters.conditionType || ''}
                onChange={handleParameterChange}
                className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-gray-100"
              >
                <option value="">Select Condition</option>
                <option value="if_opened">If Email Opened</option>
                <option value="if_clicked">If Link Clicked</option>
                {/* Add more conditions as needed */}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300">Outcome</label>
              <select
                name="outcome"
                value={formValues.parameters.outcome || ''}
                onChange={handleParameterChange}
                className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-gray-100"
              >
                <option value="">Select Outcome</option>
                <option value="send_followup">Send Follow-Up Email</option>
                <option value="create_task">Create Follow-Up Task</option>
                {/* Add more outcomes as needed */}
              </select>
            </div>
          </>
        );
      case 'delay':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-300">Delay Duration (Hours)</label>
              <input
                type="number"
                name="delayDuration"
                value={formValues.parameters.delayDuration || ''}
                onChange={handleParameterChange}
                className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-gray-100"
                placeholder="Enter Delay Duration"
                min="1"
              />
            </div>
          </>
        );
      case 'dataEnrichment':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-300">Enrichment Source</label>
              <select
                name="enrichmentSource"
                value={formValues.parameters.enrichmentSource || ''}
                onChange={handleParameterChange}
                className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-gray-100"
              >
                <option value="">Select Source</option>
                <option value="clearbit">Clearbit</option>
                <option value="hunter">Hunter.io</option>
                {/* Add more enrichment sources as needed */}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300">Fields to Enrich</label>
              <select
                name="fieldsToEnrich"
                multiple
                value={formValues.parameters.fieldsToEnrich || []}
                onChange={(e) => {
                  const options = e.target.options;
                  const selected = [];
                  for (let i = 0; i < options.length; i++) {
                    if (options[i].selected) {
                      selected.push(options[i].value);
                    }
                  }
                  setFormValues({
                    ...formValues,
                    parameters: {
                      ...formValues.parameters,
                      fieldsToEnrich: selected,
                    },
                  });
                }}
                className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-gray-100"
              >
                <option value="phone_number">Phone Number</option>
                <option value="linkedin_profile">LinkedIn Profile</option>
                <option value="email">Email</option>
                {/* Add more fields as needed */}
              </select>
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Edit Node"
      className="bg-gray-800 p-6 rounded-lg shadow-lg max-w-md mx-auto mt-20 outline-none"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start z-50"
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-100">Edit {nodeTypeConfigs[formValues.nodeType].label}</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-300">
          <X className="h-5 w-5" />
        </button>
      </div>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300">Label</label>
          <input
            type="text"
            name="label"
            value={formValues.label}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-gray-100"
          />
        </div>
        {renderFormFields()}
      </div>
      <div className="mt-6 flex justify-end space-x-4">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-600 text-gray-100 rounded hover:bg-gray-500"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          Save
        </button>
      </div>
    </Modal>
  );
};

WorkflowNodeEditor.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  nodeData: PropTypes.object.isRequired,
  onSave: PropTypes.func.isRequired,
};

export default WorkflowNodeEditor;