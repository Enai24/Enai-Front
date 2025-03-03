// src/pages/AutomationPage.js
import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Dialog } from '@headlessui/react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import {
  BarChart3, Users, Mail, Activity as ActivityIcon, FileText, Settings2, Clock, CheckCircle2, Send, Inbox, FilePlus2, Sliders, X, Phone
} from 'lucide-react';
import { Card, Badge } from '../components/BadgeCardProgress';
import { cn } from '../lib/utils';
import CampaignPerformanceChart from '../components/CampaignPerformanceChart';
import SequenceEditor from '../components/SequenceEditor';
import ContactDisplay from '../components/ContactDisplay'; // Assumed component
import {
  fetchCampaigns, fetchCampaignSummary, fetchCampaignAnalytics, fetchCampaignContacts, fetchCampaignEmails,
  fetchRecentActivity, fetchCampaignReport, fetchCampaignRecommendations, fetchSequences, createSequence, approveEmail
} from '../services/api';
import { format } from 'date-fns';

// StatsCard Component
function StatsCard({ icon: Icon, label, value, trend, trendUp }) {
  return (
    <Card className="p-6">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Icon className="w-5 h-5 text-gray-400" />
            <span className="text-sm text-gray-200">{label}</span>
          </div>
          <div className="text-2xl font-bold text-gray-100">{value}</div>
          <div className={cn('text-sm', trendUp === true && 'text-green-500', trendUp === false && 'text-red-500', trendUp === null && 'text-gray-400')}>
            {trend}
          </div>
        </div>
      </div>
    </Card>
  );
}

// PreviewTimeline Component
function PreviewTimeline({ steps }) {
  return (
    <div className="relative p-4 border border-gray-700 rounded-md">
      <h3 className="text-lg font-semibold text-gray-100 mb-4">Sequence Preview</h3>
      {steps.length === 0 && <p className="text-gray-300">No steps added yet.</p>}
      <div className="relative flex flex-col gap-2 overflow-x-auto">
        {steps.map((step, index) => {
          let icon, detail;
          switch (step.type) {
            case "automatic_email":
            case "manual_email":
              icon = <Mail className="w-4 h-4 text-blue-500" />;
              detail = `Send email "${step.title || 'Subject'}"`;
              break;
            case "phone_call":
              icon = <Phone className="w-4 h-4 text-red-500" />;
              detail = "Make a phone call";
              break;
            case "linkedin_request":
              icon = (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="w-4 h-4 text-blue-600">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                  <rect x="2" y="9" width="4" height="12"></rect>
                  <circle cx="4" cy="4" r="2"></circle>
                </svg>
              );
              detail = "Send LinkedIn request";
              break;
            case "action_item":
              icon = <FileText className="w-4 h-4 text-green-500" />;
              detail = step.title || "Custom Action Item";
              break;
            default:
              icon = <FileText className="w-4 h-4" />;
              detail = "Empty Step";
          }
          const formattedDate = step.deliveryTime ? format(new Date(step.deliveryTime), 'PPpp') : 'Immediately';
          return (
            <div key={index} className="flex items-center p-2 border rounded-md">
              <div className="mr-2">{icon}</div>
              <div className="mr-4">
                <p className="text-sm text-gray-100">{detail}</p>
                <p className="text-gray-500 text-xs font-bold">{formattedDate}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function AutomationPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [campaignSummary, setCampaignSummary] = useState(null);
  const [campaignAnalytics, setCampaignAnalytics] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [emails, setEmails] = useState([]);
  const [activities, setActivities] = useState([]);
  const [reportData, setReportData] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [sequences, setSequences] = useState([]);
  const [loadingCampaigns, setLoadingCampaigns] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [dateRange, setDateRange] = useState('7d');
  const [showCreateSequenceModal, setShowCreateSequenceModal] = useState(false);
  const [newSequenceName, setNewSequenceName] = useState('');
  const [newSequenceDescription, setNewSequenceDescription] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  // WebSocket for real-time updates (replacing polling)
  useEffect(() => {
    // Use backend host from .env to avoid connecting to port 3000 (React dev server)
    const backendHost = process.env.REACT_APP_BACKEND_HOST || window.location.host;
    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const wsUrl = `${protocol}://${backendHost}/ws/campaigns/`;
    console.log('Connecting to WebSocket at:', wsUrl);
    const ws = new WebSocket(wsUrl);
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.campaignId === selectedCampaign?.id) {
        loadCampaignDetails(selectedCampaign, dateRange);
      }
    };
    ws.onerror = () => toast.error('WebSocket connection failed.');
    return () => ws.close();
  }, [selectedCampaign, dateRange]);

  const loadCampaigns = useCallback(async () => {
    setLoadingCampaigns(true);
    try {
      const data = await fetchCampaigns();
      setCampaigns(data);
      if (data.length > 0 && !selectedCampaign) setSelectedCampaign(data[0]);
    } catch (error) {
      toast.error(`Error loading campaigns: ${error.message}`);
    } finally {
      setLoadingCampaigns(false);
    }
  }, []);

  useEffect(() => {
    loadCampaigns();
  }, [loadCampaigns]);

  const loadCampaignDetails = useCallback(async (campaign, range) => {
    if (!campaign) return;
    setLoadingDetails(true);
    try {
      const [summary, analytics, campaignContacts, campaignEmails, recentActivity, report, recos, seqs] = await Promise.all([
        fetchCampaignSummary(campaign.id),
        fetchCampaignAnalytics(campaign.id, range),
        fetchCampaignContacts(campaign.id),
        fetchCampaignEmails(campaign.id),
        fetchRecentActivity(campaign.id, 5),
        fetchCampaignReport(campaign.id),
        fetchCampaignRecommendations(campaign.id),
        fetchSequences(campaign.id),
      ]);
      setCampaignSummary(summary);
      setCampaignAnalytics(analytics);
      setContacts(campaignContacts);
      setEmails(campaignEmails);
      setActivities(recentActivity);
      setReportData(report);
      setRecommendations(recos);
      setSequences(seqs);
    } catch (error) {
      toast.error(`Error loading campaign details: ${error.message}`);
    } finally {
      setLoadingDetails(false);
    }
  }, []);

  useEffect(() => {
    if (selectedCampaign) loadCampaignDetails(selectedCampaign, dateRange);
  }, [selectedCampaign, dateRange, loadCampaignDetails]);

  const overviewStats = campaignSummary || {
    total_emails_sent: 0,
    open_rate: 0,
    click_rate: 0,
    response_rate: 0,
    meetings_booked: 0,
    emailsChange: "N/A",
    openRateChange: "N/A",
    responseRateChange: "N/A",
    meetingsChange: "N/A",
  };

  const handleCreateSequence = async () => {
    if (!newSequenceName.trim()) {
      toast.error('Sequence name is required.');
      return;
    }
    try {
      const newSeq = await createSequence({
        campaignId: selectedCampaign.id,
        name: newSequenceName,
        description: newSequenceDescription,
      });
      toast.success("Sequence created successfully!");
      setSequences(prev => [...prev, newSeq]);
      setSelectedCampaign(prev => ({ ...prev, sequence: newSeq }));
      setShowCreateSequenceModal(false);
      setNewSequenceName('');
      setNewSequenceDescription('');
    } catch (error) {
      toast.error(`Failed to create sequence: ${error.message}`);
    }
  };

  const approveSelectedEmail = async (stepId) => {
    if (!selectedCampaign || !sequences.length) return;
    try {
      await approveEmail(selectedCampaign.id, sequences[0].id, stepId);
      setSequences(prev =>
        prev.map(seq => seq.id === sequences[0].id ? {
          ...seq,
          steps: seq.steps.map(s => s.id === stepId ? { ...s, approved: true } : s)
        } : seq)
      );
      toast.success("Email step approved successfully!");
    } catch (error) {
      toast.error(`Error approving email: ${error.message}`);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-8 bg-gray-900 text-gray-100">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Automation Sequences</h1>
          <p className="mt-1 text-gray-300">Manage your email campaigns and workflows</p>
          {campaigns.length > 0 && (
            <select
              className="mt-3 p-2 bg-gray-800 border border-gray-700 rounded text-gray-100"
              value={selectedCampaign?.id || ''}
              onChange={(e) => setSelectedCampaign(campaigns.find(c => c.id.toString() === e.target.value))}
              aria-label="Select campaign"
            >
              {campaigns.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          )}
          <div className="mt-3">
            <label htmlFor="dateRange" className="block text-sm text-gray-300 mb-1">Date Range:</label>
            <select
              id="dateRange"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="p-2 bg-gray-800 border border-gray-700 rounded text-gray-100"
              aria-label="Select date range"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition"
            aria-label={showPreview ? "Edit sequence" : "Preview sequence"}
          >
            {showPreview ? "Edit" : "Preview"}
          </button>
          <button
            onClick={() => setShowCreateSequenceModal(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
            aria-label="Create new sequence"
          >
            Create Sequence
          </button>
          <Badge variant="secondary" className="px-4 py-2">
            <Clock className="w-4 h-4 mr-2 inline" />
            Last updated: Now
          </Badge>
        </div>
      </div>

      {showPreview && sequences[0] && <PreviewTimeline steps={sequences[0].steps || []} />}

      <div className="space-y-6">
        <div className="flex border-b border-gray-700">
          {[
            { id: "overview", label: "Overview", icon: BarChart3 },
            { id: "contacts", label: "Contacts", icon: Users },
            { id: "emails", label: "Emails", icon: Inbox },
            { id: "activity", label: "Activity", icon: ActivityIcon },
            { id: "report", label: "Report", icon: FileText },
            { id: "sequence", label: "Sequence", icon: FilePlus2 },
            { id: "settings", label: "Settings", icon: Sliders },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-4 py-2 ${activeTab === id ? 'border-b-2 border-blue-500 text-blue-400' : 'text-gray-400 hover:text-gray-300'}`}
              aria-label={`Switch to ${label} tab`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          loadingCampaigns || loadingDetails ? (
            <div className="text-center py-8">Loading overview data...</div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatsCard icon={Send} label="Total Emails" value={overviewStats.total_emails_sent.toLocaleString()} trend={overviewStats.emailsChange} trendUp={null} />
                <StatsCard icon={BarChart3} label="Open Rate" value={`${overviewStats.open_rate}%`} trend={overviewStats.openRateChange} trendUp={null} />
                <StatsCard icon={Mail} label="Response Rate" value={`${overviewStats.response_rate}%`} trend={overviewStats.responseRateChange} trendUp={null} />
                <StatsCard icon={CheckCircle2} label="Meetings" value={overviewStats.meetings_booked} trend={overviewStats.meetingsChange} trendUp={null} />
              </div>
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Campaign Performance</h2>
                {campaignAnalytics?.daily ? <CampaignPerformanceChart performanceData={campaignAnalytics.daily} /> : <p className="text-center h-64 flex items-center justify-center">No performance data available.</p>}
              </Card>
            </>
          )
        )}

        {activeTab === 'contacts' && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-100">
              <Users className="w-5 h-5" /> Contacts
            </h2>
            <ContactDisplay contacts={contacts} /> {/* Assumed component */}
          </Card>
        )}

        {activeTab === 'emails' && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-100">
              <Inbox className="w-5 h-5" /> Emails
            </h2>
            {emails.length > 0 ? (
              <div className="space-y-4">
                {emails.map((email) => (
                  <div key={email.id} className="border border-gray-700 p-4 rounded-md">
                    <h3 className="font-medium text-gray-100">{email.subject}</h3>
                    <p className="text-sm text-gray-300 mt-1 mb-2">{email.preview}</p>
                    <div className="flex gap-3 items-center text-sm">
                      <Badge variant="outline">Sent: {email.sent}</Badge>
                      <Badge variant="outline">Opened: {email.opened ? 'Yes' : 'No'}</Badge>
                      <Badge variant="outline">Clicked: {email.clicked}</Badge>
                      {email.type === "manual_email" && !email.approved && (
                        <button onClick={() => approveSelectedEmail(email.id)} className="bg-green-500 hover:bg-green-600 px-1.5 py-1 text-xs rounded-md text-gray-50">
                          Approve
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p>No emails available.</p>
            )}
          </Card>
        )}

        {activeTab === 'activity' && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-100">
              <ActivityIcon className="w-5 h-5" /> Activity
            </h2>
            {activities.length > 0 ? (
              <ul className="space-y-2">
                {activities.map((activity, i) => (
                  <li key={i} className="border-b border-gray-700 pb-2">
                    <p className="text-gray-400 mb-1">Action Type: <span className="font-medium text-white">{activity.action_type}</span></p>
                    <p className="text-gray-400 mb-1">Date: <span className="font-medium text-white">{new Date(activity.timestamp).toLocaleString()}</span></p>
                    {activity.step && <p className="text-gray-400 mb-1">Step: <strong className="text-white">{activity.step}</strong></p>}
                    {activity.email && <div className="mt-2 px-2 py-1.5 text-white bg-slate-400">{activity.email}</div>}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No recent activity.</p>
            )}
          </Card>
        )}

        {activeTab === 'report' && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-100">
              <FileText className="w-5 h-5" /> Report
            </h2>
            {reportData.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {reportData.map((report, idx) => (
                  <div key={idx} className="border border-gray-700 p-4 rounded-md">
                    <h3 className="font-semibold text-sm mb-2">{report.metric}</h3>
                    <p className="text-2xl font-bold mb-1">{report.value}</p>
                    <p className={cn('text-sm', report.trendUp === true && 'text-green-500', report.trendUp === false && 'text-red-500', report.trendUp === null && 'text-gray-400')}>
                      {report.trend}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p>No report data available.</p>
            )}
            {recommendations.length > 0 && (
              <Card className="p-6 mt-4">
                <h3 className="text-xl font-semibold mb-4">Recommendations</h3>
                <ul className="list-disc list-inside">
                  {recommendations.map((rec, idx) => (
                    <li key={idx} className="text-sm text-gray-100">{rec}</li>
                  ))}
                </ul>
              </Card>
            )}
          </Card>
        )}

        {activeTab === 'sequence' && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-100">
              <FilePlus2 className="w-5 h-5" /> Sequence Editor
            </h2>
            {selectedCampaign ? (
              sequences.length === 0 ? (
                <div className="mb-4">
                  <p className="text-gray-300">No sequence exists for this campaign.</p>
                  <button
                    onClick={() => setShowCreateSequenceModal(true)}
                    className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                    aria-label="Create new sequence"
                  >
                    Create New Sequence
                  </button>
                </div>
              ) : (
                <SequenceEditor
                  campaignId={selectedCampaign.id}
                  sequences={sequences}
                  reloadSequences={async () => {
                    const seqs = await fetchSequences(selectedCampaign.id);
                    setSequences(seqs);
                  }}
                />
              )
            ) : (
              <p>Please select a campaign.</p>
            )}
          </Card>
        )}

        {activeTab === 'settings' && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-100">
              <Sliders className="w-5 h-5" /> Settings
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-gray-700 pb-3">
                <div>
                  <h4 className="font-medium text-gray-100">Schedule</h4>
                  <p className="text-sm text-gray-300">Normal Business Hours</p>
                </div>
                <button className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-500 transition" aria-label="Change schedule">
                  Change
                </button>
              </div>
              <div className="flex items-center justify-between border-b border-gray-700 pb-3">
                <div>
                  <h4 className="font-medium text-gray-100">Default Sender</h4>
                  <p className="text-sm text-gray-300">marketing@example.com</p>
                </div>
                <button className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-500 transition" aria-label="Change sender">
                  Change
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-100">Automatic Follow-up</h4>
                  <p className="text-sm text-gray-300">Enabled</p>
                </div>
                <button className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-500 transition" aria-label="Toggle follow-up">
                  Disable
                </button>
              </div>
            </div>
          </Card>
        )}
      </div>

      <Dialog open={showCreateSequenceModal} onClose={() => setShowCreateSequenceModal(false)} className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black opacity-50" onClick={() => setShowCreateSequenceModal(false)} />
        <div className="relative bg-gray-800 rounded p-6 w-full max-w-md space-y-4">
          <button
            onClick={() => setShowCreateSequenceModal(false)}
            className="absolute top-2 right-2 p-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition"
            aria-label="Close modal"
          >
            <X className="h-4 w-4" />
          </button>
          <h3 className="text-xl font-bold mb-4 text-white">Create New Sequence</h3>
          <div className="space-y-4">
            <div>
              <label htmlFor="sequenceName" className="block text-sm text-gray-300">Sequence Name</label>
              <input
                id="sequenceName"
                type="text"
                value={newSequenceName}
                onChange={(e) => setNewSequenceName(e.target.value)}
                className="w-full px-3 py-2 rounded bg-gray-700 text-gray-100 border border-gray-600"
                aria-label="Sequence name"
              />
            </div>
            <div>
              <label htmlFor="sequenceDescription" className="block text-sm text-gray-300">Description</label>
              <textarea
                id="sequenceDescription"
                value={newSequenceDescription}
                onChange={(e) => setNewSequenceDescription(e.target.value)}
                className="w-full px-3 py-2 rounded bg-gray-700 text-gray-100 border border-gray-600"
                aria-label="Sequence description"
              />
            </div>
            <button
              onClick={handleCreateSequence}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
              aria-label="Create sequence"
            >
              Create
            </button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}

export default AutomationPage;