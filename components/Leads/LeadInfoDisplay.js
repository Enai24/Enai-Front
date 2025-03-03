import React from 'react';
import { Tooltip } from 'react-tooltip';

const LeadInfoDisplay = ({ lead }) => {
  return (
    <section className="space-y-4 p-4 bg-gray-800 rounded shadow">
      <h2 className="text-lg font-semibold text-white">Lead Information</h2>
      <p><strong className="text-white">Email:</strong> <a href={`mailto:${lead.email}`} className="text-blue-400 hover:underline">{lead.email}</a></p>
      <p><strong className="text-white">Job Title:</strong> <span className="font-bold text-white">{lead.job_title}</span></p>
      <p><strong className="text-white">Company:</strong> {lead.company}</p>
      <p><strong className="text-white">Status:</strong> <span className="px-2 py-1 rounded bg-gray-700 text-xs text-white">{lead.status}</span></p>
      <p data-tooltip-id="score-tooltip" data-tooltip-content={lead.ai_lead_score_justification || 'No justification available'}>
        <strong className="text-white">AI Lead Score:</strong> {lead.ai_lead_score || 0}
        <Tooltip id="score-tooltip" place="top" />
      </p>
      <p><strong className="text-white">Industry:</strong> {lead.industry || 'N/A'}</p>
      <p><strong className="text-white">Company Size:</strong> {lead.company_size || 'N/A'}</p>
      <p><strong className="text-white">Location:</strong> {lead.country?.name || 'N/A'}</p>
      <p><strong className="text-white">Open Rate:</strong> {lead.email_open_rate || 0}%</p>
      <p><strong className="text-white">Interaction Count:</strong> {lead.interaction_count || 0}</p>
      <p data-tooltip-id="pain-tooltip" data-tooltip-content={JSON.stringify(lead.pain_points || {})}>
        <strong className="text-white">Pain Points:</strong> {lead.pain_points ? Object.keys(lead.pain_points).join(', ') : 'N/A'}
        <Tooltip id="pain-tooltip" place="top" />
      </p>
      <p data-tooltip-id="tech-tooltip" data-tooltip-content={JSON.stringify(lead.tech_stack || {})}>
        <strong className="text-white">Tech Stack:</strong> {lead.tech_stack ? Object.keys(lead.tech_stack).join(', ') : 'N/A'}
        <Tooltip id="tech-tooltip" place="top" />
      </p>
      <p data-tooltip-id="web-tooltip" data-tooltip-content={JSON.stringify(lead.website_data || {})}>
        <strong className="text-white">Website Data:</strong> {lead.website_data ? lead.website_data.about_us?.slice(0, 50) + '...' : 'N/A'}
        <Tooltip id="web-tooltip" place="top" />
      </p>
      <p data-tooltip-id="hunter-tooltip" data-tooltip-content={JSON.stringify(lead.hunter_data || {})}>
        <strong className="text-white">Hunter Data:</strong> {lead.hunter_data ? lead.hunter_data.organization || 'N/A' : 'N/A'}
        <Tooltip id="hunter-tooltip" place="top" />
      </p>
      <p data-tooltip-id="message-tooltip" data-tooltip-content={lead.personalized_message || 'N/A'}>
        <strong className="text-white">Personalized Message:</strong> {lead.personalized_message?.slice(0, 50) || 'N/A'}...
        <Tooltip id="message-tooltip" place="top" />
      </p>
      <p><strong className="text-white">Spam Score:</strong> {lead.spam_score || 0}</p>
      <p><strong className="text-white">Click Count:</strong> {lead.click_count || 0}</p>
      <p><strong className="text-white">Deal Priority:</strong> {lead.deal_priority !== 'N/A' ? `${(lead.deal_priority * 100).toFixed(1)}%` : 'N/A'}</p>
    </section>
  );
};

export default React.memo(LeadInfoDisplay);