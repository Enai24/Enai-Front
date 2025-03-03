// src/components/CampaignList.jsx
import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { Pause, Play, Settings, MoreHorizontal, BarChart3, ChevronDown, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-toastify';

const CampaignList = React.memo(({
  campaigns,
  toggleAnalytics,
  showAnalytics,
  analyticsData,
  aiRecommendations,
  templatePerformanceData,
  onDelete,
}) => {
  // Mock pause/resume (assuming PATCH endpoint exists)
  const handleToggleStatus = useCallback(async (campaignId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'paused' : 'active';
    try {
      await api.patch(`/campaigns/${campaignId}/`, { status: newStatus });
      toast.success(`Campaign ${newStatus === 'active' ? 'resumed' : 'paused'} successfully!`);
      window.location.reload(); // Refresh to reflect status change
    } catch (err) {
      toast.error('Failed to update campaign status.');
    }
  }, []);

  return (
    <div className="space-y-6">
      {campaigns.map((campaign) => (
        <div key={campaign.id} className="border rounded-lg p-6 hover:border-indigo-500 transition-colors">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-100">{campaign.name}</h3>
              <p className="text-sm text-gray-400 mt-1">{campaign.description}</p>
              <div className="flex items-center gap-4 mt-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  campaign.status === 'active' ? 'bg-green-700 text-green-100' :
                  campaign.status === 'paused' ? 'bg-yellow-600 text-yellow-100' :
                  'bg-gray-600 text-gray-100'
                }`}>
                  {campaign.status}
                </span>
                <span className="text-xs text-gray-400">
                  {new Date(campaign.startDate).toLocaleDateString()} - {new Date(campaign.endDate).toLocaleDateString()}
                </span>
                <span className="text-xs text-gray-400">{campaign.dailyLimit} emails/day</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {campaign.status === 'active' ? (
                <button onClick={() => handleToggleStatus(campaign.id, 'active')} className="p-2 text-gray-400 hover:text-gray-500" title="Pause Campaign" aria-label="Pause Campaign">
                  <Pause className="h-5 w-5" />
                </button>
              ) : campaign.status === 'paused' ? (
                <button onClick={() => handleToggleStatus(campaign.id, 'paused')} className="p-2 text-gray-400 hover:text-gray-500" title="Resume Campaign" aria-label="Resume Campaign">
                  <Play className="h-5 w-5" />
                </button>
              ) : null}
              <button className="p-2 text-gray-400 hover:text-gray-500" title="Settings (Not Implemented)" aria-label="Campaign Settings">
                <Settings className="h-5 w-5" />
              </button>
              <button onClick={() => onDelete(campaign.id)} className="p-2 text-red-400 hover:text-red-500" title="Delete Campaign" aria-label="Delete Campaign">
                <Trash2 className="h-5 w-5" />
              </button>
              <Link to={`/dashboard/campaigns/${campaign.id}`}>
                <button className="p-2 text-gray-400 hover:text-gray-500" title="More Details" aria-label="View Campaign Details">
                  <MoreHorizontal className="h-5 w-5" />
                </button>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div>
              <p className="text-sm text-gray-400">Emails Sent</p>
              <p className="text-lg font-semibold text-gray-100">{campaign.emailsSent}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Open Rate</p>
              <p className="text-lg font-semibold text-gray-100">{campaign.openRate}%</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Response Rate</p>
              <p className="text-lg font-semibold text-gray-100">{campaign.responseRate}%</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Meetings</p>
              <p className="text-lg font-semibold text-gray-100">{campaign.meetings}</p>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-700">
            <button
              onClick={() => toggleAnalytics(campaign.id)}
              className="text-sm text-indigo-400 hover:text-indigo-500 flex items-center gap-1"
              aria-label={`Toggle analytics for ${campaign.name}`}
            >
              <BarChart3 className="h-4 w-4" />
              View detailed analytics
              <ChevronDown className="h-4 w-4" />
            </button>
          </div>

          {showAnalytics[campaign.id] && (
            <div className="mt-4 p-4 bg-gray-700 rounded">
              <h4 className="text-lg font-semibold text-gray-100 mb-4">Analytics for {campaign.name}</h4>
              {analyticsData[campaign.id] ? (
                <>
                  <p className="text-gray-300">Total Emails Sent: {analyticsData[campaign.id].total_emails_sent}</p>
                  <p className="text-gray-300">Open Rate: {analyticsData[campaign.id].open_rate}%</p>
                  <p className="text-gray-300">Response Rate: {analyticsData[campaign.id].response_rate}%</p>
                  <p className="text-gray-300">Meetings Booked: {analyticsData[campaign.id].meetings_booked}</p>
                  {aiRecommendations[campaign.id]?.recommendations?.length > 0 && (
                    <div>
                      <h5 className="text-md font-semibold text-gray-100 mt-4">AI Recommendations:</h5>
                      <ul className="list-disc list-inside text-gray-300">
                        {aiRecommendations[campaign.id].recommendations.map((reco, index) => (
                          <li key={index}>{reco}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {templatePerformanceData[campaign.id]?.length > 0 && (
                    <div>
                      <h5 className="text-md font-semibold text-gray-100 mt-4">Template Performance:</h5>
                      <ul className="list-disc list-inside text-gray-300">
                        {templatePerformanceData[campaign.id].map((templateData, index) => (
                          <li key={index}>
                            Template: {templateData.template_name}, Emails Sent: {templateData.emails_sent_est.toFixed(0)}, Open Rate: {templateData.open_rate.toFixed(1)}%, Response Rate: {templateData.response_rate.toFixed(1)}%
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center text-gray-400">Loading analytics...</div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
});

CampaignList.propTypes = {
  campaigns: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      description: PropTypes.string,
      targetIndustries: PropTypes.arrayOf(PropTypes.string),
      companySize: PropTypes.arrayOf(PropTypes.string),
      jobTitles: PropTypes.arrayOf(PropTypes.string),
      targetAccounts: PropTypes.arrayOf(PropTypes.string),
      excludedDomains: PropTypes.arrayOf(PropTypes.string),
      initialTemplate: PropTypes.string,
      followUpTemplates: PropTypes.arrayOf(PropTypes.string),
      dailyLimit: PropTypes.number,
      totalProspects: PropTypes.number,
      startDate: PropTypes.string,
      endDate: PropTypes.string,
      sendingWindow: PropTypes.shape({ start: PropTypes.string, end: PropTypes.string }),
      timezone: PropTypes.string,
      tags: PropTypes.arrayOf(PropTypes.string),
      warmupPeriod: PropTypes.number,
      minimumDelay: PropTypes.number,
      maximumDelay: PropTypes.number,
      status: PropTypes.oneOf(['draft', 'active', 'paused', 'completed']),
      created_at: PropTypes.string,
      emailsSent: PropTypes.number,
      openRate: PropTypes.number,
      responseRate: PropTypes.number,
      meetings: PropTypes.number,
    })
  ).isRequired,
  toggleAnalytics: PropTypes.func.isRequired,
  showAnalytics: PropTypes.object.isRequired,
  analyticsData: PropTypes.object,
  aiRecommendations: PropTypes.object,
  templatePerformanceData: PropTypes.object,
  onDelete: PropTypes.func.isRequired,
};

export default CampaignList;