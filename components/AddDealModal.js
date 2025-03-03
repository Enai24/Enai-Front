import React, { useState } from 'react';
import { X } from 'lucide-react';

// Sample data for dropdowns
const industries = [
  'Technology',
  'Financial Services',
  'Healthcare',
  'Manufacturing',
  'Retail',
  'Professional Services',
  'Telecommunications',
  'Energy',
];

const dealSources = [
  'Outbound Campaign',
  'LinkedIn',
  'Website',
  'Referral',
  'Partner',
  'Conference',
  'Direct',
];

const dealStages = [
  'Qualification',
  'Discovery',
  'Solution Presentation',
  'Proposal',
  'Negotiation',
];

const productLines = [
  'Enterprise Suite',
  'Professional Package',
  'Team Solution',
  'Basic Plan',
  'Custom Solution',
];

export default function AddDealModal({ isOpen, onClose, onAdd }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // Company Information
    company: '',
    industry: '',
    website: '',
    employeeCount: '',
    annualRevenue: '',
    source: '',
    // Contact Information
    primaryContact: {
      name: '',
      title: '',
      email: '',
      phone: '',
      linkedin: '',
    },
    decisionMakers: [],
    // Deal Information
    name: '',
    stage: 'Qualification',
    value: '',
    probability: 20,
    expectedCloseDate: '',
    productLine: '',
    // Additional Details
    painPoints: [],
    businessDrivers: [],
    competitiveSituation: '',
    decisionCriteria: [],
    nextSteps: '',
    notes: '',
    // Technical Requirements
    technicalRequirements: [],
    integrationNeeds: [],
    securityRequirements: [],
    // Budget & Timeline
    budgetConfirmed: false,
    budgetTimeframe: '',
    implementationTimeline: '',
    // Risk Assessment
    competitors: [],
    potentialRisks: [],
    lossReason: '',
    // Internal Details
    assignedTo: '',
    team: [],
    priority: 'medium',
    tags: [],
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd({
      ...formData,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 text-gray-100 rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold">Add New Deal</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-200">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {['Deal Details', 'Contacts', 'Requirements', 'Terms'].map((stepName, index) => (
                <div key={index} className="flex items-center">
                  <div
                    className={`flex items-center justify-center h-8 w-8 rounded-full border-2 
                      ${step > index + 1 ? 'bg-indigo-600 border-indigo-600' : step === index + 1 ? 'border-indigo-600' : 'border-gray-600'}`}
                  >
                    <span
                      className={`text-sm font-medium 
                        ${step > index + 1 ? 'text-white' : step === index + 1 ? 'text-indigo-600' : 'text-gray-400'}`}
                    >
                      {index + 1}
                    </span>
                  </div>
                  <span className="ml-2 text-sm font-medium">{stepName}</span>
                  {index < 3 && <div className="mx-4 h-0.5 w-10 bg-gray-600" />}
                </div>
              ))}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-8">
            {step === 1 && (
              <div className="space-y-6">
                {/* Deal Information */}
                <div>
                  <h3 className="text-lg font-medium mb-4">Deal Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium">Deal Name</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="mt-1 block w-full rounded-md border border-gray-600 px-3 py-2 bg-gray-800 focus:border-indigo-500 focus:ring-indigo-500"
                        placeholder="e.g., TechCorp Enterprise Deal"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium">Deal Value</label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-400">$</span>
                        </div>
                        <input
                          type="number"
                          value={formData.value}
                          onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                          className="block w-full pl-7 pr-12 rounded-md border border-gray-600 bg-gray-800 focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium">Stage</label>
                      <select
                        value={formData.stage}
                        onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
                        className="mt-1 block w-full rounded-md border border-gray-600 px-3 py-2 bg-gray-800 focus:border-indigo-500 focus:ring-indigo-500"
                      >
                        {dealStages.map((stage) => (
                          <option key={stage} value={stage}>
                            {stage}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium">Probability (%)</label>
                      <input
                        type="number"
                        value={formData.probability}
                        onChange={(e) =>
                          setFormData({ ...formData, probability: parseInt(e.target.value) || 0 })
                        }
                        className="mt-1 block w-full rounded-md border border-gray-600 px-3 py-2 bg-gray-800 focus:border-indigo-500 focus:ring-indigo-500"
                        min="0"
                        max="100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium">Expected Close Date</label>
                      <input
                        type="date"
                        value={formData.expectedCloseDate}
                        onChange={(e) =>
                          setFormData({ ...formData, expectedCloseDate: e.target.value })
                        }
                        className="mt-1 block w-full rounded-md border border-gray-600 px-3 py-2 bg-gray-800 focus:border-indigo-500 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium">Source</label>
                      <select
                        value={formData.source}
                        onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                        className="mt-1 block w-full rounded-md border border-gray-600 px-3 py-2 bg-gray-800 focus:border-indigo-500 focus:ring-indigo-500"
                      >
                        <option value="">Select Source</option>
                        {dealSources.map((source) => (
                          <option key={source} value={source}>
                            {source}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Company Information */}
                <div>
                  <h3 className="text-lg font-medium mb-4">Company Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium">Company Name</label>
                      <input
                        type="text"
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        className="mt-1 block w-full rounded-md border border-gray-600 px-3 py-2 bg-gray-800 focus:border-indigo-500 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium">Industry</label>
                      <select
                        value={formData.industry}
                        onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                        className="mt-1 block w-full rounded-md border border-gray-600 px-3 py-2 bg-gray-800 focus:border-indigo-500 focus:ring-indigo-500"
                      >
                        <option value="">Select Industry</option>
                        {industries.map((industry) => (
                          <option key={industry} value={industry}>
                            {industry}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium">Employee Count</label>
                      <input
                        type="text"
                        value={formData.employeeCount}
                        onChange={(e) => setFormData({ ...formData, employeeCount: e.target.value })}
                        className="mt-1 block w-full rounded-md border border-gray-600 px-3 py-2 bg-gray-800 focus:border-indigo-500 focus:ring-indigo-500"
                        placeholder="e.g., 1000-5000"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium">Annual Revenue</label>
                      <input
                        type="text"
                        value={formData.annualRevenue}
                        onChange={(e) => setFormData({ ...formData, annualRevenue: e.target.value })}
                        className="mt-1 block w-full rounded-md border border-gray-600 px-3 py-2 bg-gray-800 focus:border-indigo-500 focus:ring-indigo-500"
                        placeholder="e.g., $10M-50M"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium">Website</label>
                      <input
                        type="url"
                        value={formData.website}
                        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                        className="mt-1 block w-full rounded-md border border-gray-600 px-3 py-2 bg-gray-800 focus:border-indigo-500 focus:ring-indigo-500"
                        placeholder="https://example.com"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                {/* Primary Contact */}
                <div>
                  <h3 className="text-lg font-medium mb-4">Primary Contact</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium">Name</label>
                      <input
                        type="text"
                        value={formData.primaryContact.name}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            primaryContact: { ...formData.primaryContact, name: e.target.value },
                          })
                        }
                        className="mt-1 block w-full rounded-md border border-gray-600 px-3 py-2 bg-gray-800 focus:border-indigo-500 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium">Title</label>
                      <input
                        type="text"
                        value={formData.primaryContact.title}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            primaryContact: { ...formData.primaryContact, title: e.target.value },
                          })
                        }
                        className="mt-1 block w-full rounded-md border border-gray-600 px-3 py-2 bg-gray-800 focus:border-indigo-500 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium">Email</label>
                      <input
                        type="email"
                        value={formData.primaryContact.email}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            primaryContact: { ...formData.primaryContact, email: e.target.value },
                          })
                        }
                        className="mt-1 block w-full rounded-md border border-gray-600 px-3 py-2 bg-gray-800 focus:border-indigo-500 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium">Phone</label>
                      <input
                        type="tel"
                        value={formData.primaryContact.phone}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            primaryContact: { ...formData.primaryContact, phone: e.target.value },
                          })
                        }
                        className="mt-1 block w-full rounded-md border border-gray-600 px-3 py-2 bg-gray-800 focus:border-indigo-500 focus:ring-indigo-500"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium">LinkedIn Profile</label>
                      <input
                        type="url"
                        value={formData.primaryContact.linkedin}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            primaryContact: { ...formData.primaryContact, linkedin: e.target.value },
                          })
                        }
                        className="mt-1 block w-full rounded-md border border-gray-600 px-3 py-2 bg-gray-800 focus:border-indigo-500 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Decision Makers */}
                <div>
                  <h3 className="text-lg font-medium mb-4">Decision Makers</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium">Additional Stakeholders</label>
                      <textarea
                        value={formData.decisionMakers.join('\n')}
                        onChange={(e) =>
                          setFormData({ ...formData, decisionMakers: e.target.value.split('\n') })
                        }
                        rows={3}
                        className="mt-1 block w-full rounded-md border border-gray-600 px-3 py-2 bg-gray-800 focus:border-indigo-500 focus:ring-indigo-500"
                        placeholder="Enter stakeholders (one per line)"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                {/* Business Requirements */}
                <div>
                  <h3 className="text-lg font-medium mb-4">Business Requirements</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium">Pain Points</label>
                      <textarea
                        value={formData.painPoints.join('\n')}
                        onChange={(e) =>
                          setFormData({ ...formData, painPoints: e.target.value.split('\n') })
                        }
                        rows={3}
                        className="mt-1 block w-full rounded-md border border-gray-600 px-3 py-2 bg-gray-800 focus:border-indigo-500 focus:ring-indigo-500"
                        placeholder="Enter pain points (one per line)"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium">Business Drivers</label>
                      <textarea
                        value={formData.businessDrivers.join('\n')}
                        onChange={(e) =>
                          setFormData({ ...formData, businessDrivers: e.target.value.split('\n') })
                        }
                        rows={3}
                        className="mt-1 block w-full rounded-md border border-gray-600 px-3 py-2 bg-gray-800 focus:border-indigo-500 focus:ring-indigo-500"
                        placeholder="Enter business drivers (one per line)"
                      />
                    </div>
                  </div>
                </div>

                {/* Technical Requirements */}
                <div>
                  <h3 className="text-lg font-medium mb-4">Technical Requirements</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium">Technical Requirements</label>
                      <textarea
                        value={formData.technicalRequirements.join('\n')}
                        onChange={(e) =>
                          setFormData({ ...formData, technicalRequirements: e.target.value.split('\n') })
                        }
                        rows={3}
                        className="mt-1 block w-full rounded-md border border-gray-600 px-3 py-2 bg-gray-800 focus:border-indigo-500 focus:ring-indigo-500"
                        placeholder="Enter technical requirements (one per line)"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium">Integration Needs</label>
                      <textarea
                        value={formData.integrationNeeds.join('\n')}
                        onChange={(e) =>
                          setFormData({ ...formData, integrationNeeds: e.target.value.split('\n') })
                        }
                        rows={3}
                        className="mt-1 block w-full rounded-md border border-gray-600 px-3 py-2 bg-gray-800 focus:border-indigo-500 focus:ring-indigo-500"
                        placeholder="Enter integration needs (one per line)"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6">
                {/* Deal Terms */}
                <div>
                  <h3 className="text-lg font-medium mb-4">Deal Terms</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium">Product Line</label>
                      <select
                        value={formData.productLine}
                        onChange={(e) => setFormData({ ...formData, productLine: e.target.value })}
                        className="mt-1 block w-full rounded-md border border-gray-600 px-3 py-2 bg-gray-800 focus:border-indigo-500 focus:ring-indigo-500"
                      >
                        <option value="">Select Product Line</option>
                        {productLines.map((product) => (
                          <option key={product} value={product}>
                            {product}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium">Implementation Timeline</label>
                      <input
                        type="text"
                        value={formData.implementationTimeline}
                        onChange={(e) => setFormData({ ...formData, implementationTimeline: e.target.value })}
                        className="mt-1 block w-full rounded-md border border-gray-600 px-3 py-2 bg-gray-800 focus:border-indigo-500 focus:ring-indigo-500"
                        placeholder="e.g., 3 months"
                      />
                    </div>
                  </div>
                </div>

                {/* Competitive Situation */}
                <div>
                  <h3 className="text-lg font-medium mb-4">Competitive Situation</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium">Competitors</label>
                      <textarea
                        value={formData.competitors.join('\n')}
                        onChange={(e) => setFormData({ ...formData, competitors: e.target.value.split('\n') })}
                        rows={3}
                        className="mt-1 block w-full rounded-md border border-gray-600 px-3 py-2 bg-gray-800 focus:border-indigo-500 focus:ring-indigo-500"
                        placeholder="Enter competitors (one per line)"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium">Decision Criteria</label>
                      <textarea
                        value={formData.decisionCriteria.join('\n')}
                        onChange={(e) => setFormData({ ...formData, decisionCriteria: e.target.value.split('\n') })}
                        rows={3}
                        className="mt-1 block w-full rounded-md border border-gray-600 px-3 py-2 bg-gray-800 focus:border-indigo-500 focus:ring-indigo-500"
                        placeholder="Enter decision criteria (one per line)"
                      />
                    </div>
                  </div>
                </div>

                {/* Next Steps */}
                <div>
                  <h3 className="text-lg font-medium mb-4">Next Steps</h3>
                  <div>
                    <textarea
                      value={formData.nextSteps}
                      onChange={(e) => setFormData({ ...formData, nextSteps: e.target.value })}
                      rows={3}
                      className="mt-1 block w-full rounded-md border border-gray-600 px-3 py-2 bg-gray-800 focus:border-indigo-500 focus:ring-indigo-500"
                      placeholder="Enter next steps and action items..."
                    />
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="flex justify-end items-center gap-3 p-4 border-t border-gray-700 bg-gray-800">
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-100 hover:bg-gray-700"
            >
              Previous
            </button>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-100 hover:bg-gray-700"
          >
            Cancel
          </button>
          {step < 4 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Create Deal
            </button>
          )}
        </div>
      </div>
    </div>
  );
}