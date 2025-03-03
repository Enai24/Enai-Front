import React, { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import debounce from 'lodash/debounce';
import {
  fetchLeadById,
  enrichLead,
  generateAIDraft,
  logCall,
  addTagToLead,
  removeTagFromLead,
  abTestEmail,
  uploadLeadDoc,
  setFollowUpReminder,
  assignLead,
  sendEmail,
  refreshAIScore,
  initiateAICall,
  scheduleMeeting,
  listLinks,
  addNote,
  editNote,
  deleteNote,
  addTask,
  optimizeEmailTime,
  predictNextAction,
  predictDemoProbability,
  getDeliverability,
  getCalendlyLink,
  connectCalendly,
} from '../services/api';
import useWebSocket from '../utils/useWebSocket';
import ActivityTimeline from '../components/ActivityTimeline';
import AIDraftModal from '../components/AIDraftModal';
import RealtimeEmailDraft from './RealtimeEmailDraft';
import CoachingInsightsDisplay from '../components/CoachingInsightsDisplay';
import AssignLeadDropdown from '../components/AssignLeadDropdown';
import DocumentUpload from '../components/DocumentUpload';
import LeadInfoDisplay from '../components/Leads/LeadInfoDisplay';
import EngagementSection from '../components/Leads/EngagementSection';
import LeadTabs from '../components/Leads/LeadTabs';
import LeadTasks from '../components/Leads/LeadTasks';
import NoteSection from '../components/Leads/NoteSection';
import { X, Send, PhoneCall, Calendar, RefreshCw, Mail } from 'lucide-react';
import sanitizeHtml from 'sanitize-html';
import { ErrorBoundary } from 'react-error-boundary';
import { WindowVirtualizer } from 'virtua';
import * as Sentry from '@sentry/react';
import { LineChart, Line, XAxis, YAxis, Tooltip as RechartsTooltip } from 'recharts';
import 'react-quill/dist/quill.snow.css';

const ReactQuill = lazy(() => import('react-quill'));

const ErrorFallback = ({ error, resetErrorBoundary }) => (
  <div className="p-4 bg-red-900 text-white rounded-lg shadow">
    <h2 className="text-lg font-semibold">Something went wrong!</h2>
    <p>{error.message}</p>
    <button onClick={resetErrorBoundary} className="mt-2 px-4 py-2 bg-red-600 rounded hover:bg-red-700">Retry</button>
  </div>
);

const LeadDetails = () => {
  const { leadId } = useParams();
  const navigate = useNavigate();

  const [lead, setLead] = useState(null);
  const [activities, setActivities] = useState([]);
  const [activityTimeline, setActivityTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aiDraft, setAIDraft] = useState('');
  const [isAIDraftModalOpen, setIsAIDraftModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [activeOutreachTab, setActiveOutreachTab] = useState('email');
  const [emailDraft, setEmailDraft] = useState('');
  const [emailSubject, setEmailSubject] = useState('Follow-up');
  const [scheduleTime, setScheduleTime] = useState(null);
  const [emailStatus, setEmailStatus] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [linkedinDraft, setLinkedinDraft] = useState('');
  const [smsDraft, setSmsDraft] = useState('');
  const [clickData, setClickData] = useState([]);
  const [abTestResults, setAbTestResults] = useState(null);
  const [optimalEmailTime, setOptimalEmailTime] = useState(null);
  const [nextAction, setNextAction] = useState(null);
  const [demoProbability, setDemoProbability] = useState(null);
  const [analyticsData, setAnalyticsData] = useState([]);
  const [calendlyLink, setCalendlyLink] = useState(localStorage.getItem(`calendlyLink_${leadId}`) || null);
  const [calendlyScriptLoaded, setCalendlyScriptLoaded] = useState(false);

  const fetchWithRetry = useCallback(async (apiFunc, params = {}, retries = 3) => {
    for (let i = 0; i < retries; i++) {
      try {
        const response = await apiFunc(params);
        return response;
      } catch (error) {
        Sentry.captureException(error);
        if (i === retries - 1) throw error;
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
  }, []);

  const loadLead = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchWithRetry(() => fetchLeadById(leadId));
      setLead(data.lead || data);
      setActivities(data.activity_timeline || []);
      setActivityTimeline(data.activity_timeline || []);

      const clickResponse = await fetchWithRetry(listLinks);
      const filteredClicks = clickResponse.filter(link => link.email__lead_id === parseInt(leadId));
      setClickData(filteredClicks);
      setAnalyticsData(filteredClicks.map((c, i) => ({ name: `Day ${i + 1}`, clicks: c.click_count })));

      try {
        const calendlyData = await fetchWithRetry(() => getCalendlyLink(leadId));
        setCalendlyLink(calendlyData.link || localStorage.getItem(`calendlyLink_${leadId}`) || null);
      } catch (err) {
        console.error('Failed to fetch Calendly link from backend:', err);
        toast.warn('Using local Calendly link due to backend unavailability.');
        setCalendlyLink(localStorage.getItem(`calendlyLink_${leadId}`) || null);
      }
    } catch (err) {
      console.error('Failed to load lead data:', err);
      toast.error('Failed to load lead data.');
    } finally {
      setLoading(false);
    }
  }, [leadId]);

  const debouncedLoadLead = useCallback(debounce(loadLead, 500), [loadLead]);

  const socketStatus = useWebSocket(`/ws/leads/${leadId}/`, debouncedLoadLead);
  console.log("WebSocket status:", socketStatus);

  useEffect(() => {
    loadLead();
  }, [loadLead, socketStatus]);

  // Load Calendly CSS and JS, and manage badge widget lifecycle
  useEffect(() => {
    // Load Calendly CSS only once
    if (!document.getElementById('calendly-widget-css')) {
      const link = document.createElement('link');
      link.id = 'calendly-widget-css';
      link.href = 'https://assets.calendly.com/assets/external/widget.css';
      link.rel = 'stylesheet';
      link.onload = () => console.log('Calendly CSS loaded successfully.');
      link.onerror = (e) => {
        console.error('Failed to load Calendly CSS:', e);
        Sentry.captureException(e);
      };
      document.head.appendChild(link);
    }

    // Load Calendly JS and initialize badge widget
    let script;
    if (!document.getElementById('calendly-widget-script') && !calendlyScriptLoaded) {
      script = document.createElement('script');
      script.id = 'calendly-widget-script';
      script.src = 'https://assets.calendly.com/assets/external/widget.js';
      script.async = true;
      script.onload = () => {
        console.log('Calendly script loaded successfully.');
        setCalendlyScriptLoaded(true);
        if (calendlyLink && window.Calendly) {
          window.Calendly.initBadgeWidget({
            url: calendlyLink,
            text: 'Schedule Time',
            color: '#006bff',
            textColor: '#ffffff',
            branding: false,
          });
        }
      };
      script.onerror = (e) => {
        console.error('Calendly script failed to load:', e);
        toast.error('Failed to load Calendly widget. Please check your network.');
        Sentry.captureException(e);
        setCalendlyScriptLoaded(false);
      };
      document.body.appendChild(script);
    } else if (document.getElementById('calendly-widget-script') && !calendlyScriptLoaded) {
      setCalendlyScriptLoaded(true);
      if (calendlyLink && window.Calendly) {
        window.Calendly.initBadgeWidget({
          url: calendlyLink,
          text: 'Schedule Time',
          color: '#006bff',
          textColor: '#ffffff',
          branding: false,
        });
      }
    }

    // Cleanup: Destroy badge widget and remove script only when component unmounts
    return () => {
      if (window.Calendly && window.Calendly.destroyBadgeWidget) {
        window.Calendly.destroyBadgeWidget();
        console.log('Calendly badge widget destroyed.');
      }
      if (script && document.body.contains(script)) {
        document.body.removeChild(script);
        setCalendlyScriptLoaded(false);
      }
    };
  }, [calendlyLink, calendlyScriptLoaded]); // Re-run if calendlyLink changes

  const handleEnrichLead = async () => {
    try {
      const updated = await enrichLead(leadId);
      setLead(updated);
      toast.success('Lead data enriched successfully!');
    } catch (err) {
      toast.error('Failed to enrich lead data.');
    }
  };

  const handleGenerateDraft = async () => {
    try {
      const { email_text } = await generateAIDraft(leadId, emailSubject, lead.website || '');
      setAIDraft(email_text);
      setIsAIDraftModalOpen(true);
    } catch (err) {
      toast.error('Failed to generate email draft.');
    }
  };

  const checkDeliverability = async () => {
    try {
      const { spamScore, domainStatus } = await fetchWithRetry(() => getDeliverability(leadId));
      if (spamScore > 5) toast.warn('High spam score detected. Revise content.');
      if (!domainStatus.authenticated) toast.error('Domain not authenticated. Check SPF/DKIM.');
      return spamScore <= 5 && domainStatus.authenticated;
    } catch (err) {
      toast.error('Deliverability check failed.');
      return false;
    }
  };

  const handleSendEmail = async () => {
    try {
      const isDeliverable = await checkDeliverability();
      if (!isDeliverable) return;

      const attachments = lead.documents?.map(doc => doc.file_url) || [];
      const response = await sendEmail(leadId, {
        subject: sanitizeHtml(emailSubject),
        body: sanitizeHtml(emailDraft),
        attachments,
        schedule: scheduleTime || optimalEmailTime,
      });
      setEmailStatus(response.status || 'Sent');
      toast.success(scheduleTime ? 'Email scheduled successfully!' : 'Email sent successfully!');
      debouncedLoadLead();

      setTimeout(() => sendEmail(leadId, { subject: 'Follow-Up', body: 'Just checking in...' }), 48 * 60 * 60 * 1000);
    } catch (err) {
      toast.error('Failed to send email.');
    }
  };

  const handleLogCall = async (callData) => {
    try {
      await logCall(leadId, callData);
      toast.success('Call logged successfully!');
      debouncedLoadLead();
    } catch (err) {
      toast.error('Failed to log call.');
    }
  };

  const handleAddTag = async (tag) => {
    try {
      const updated = await addTagToLead(leadId, sanitizeHtml(tag));
      setLead(updated);
      toast.success('Tag added successfully!');
    } catch (err) {
      toast.error('Failed to add tag.');
    }
  };

  const handleRemoveTag = async (tag) => {
    try {
      const updated = await removeTagFromLead(leadId, tag);
      setLead(updated);
      toast.success('Tag removed successfully!');
    } catch (err) {
      toast.error('Failed to remove tag.');
    }
  };

  const handleABTest = async () => {
    try {
      const variantData = {
        subjectA: sanitizeHtml(`Hey ${lead.first_name}, quick question about ${lead.company}`),
        subjectB: sanitizeHtml(`Hello ${lead.first_name} from OurTeam, let’s discuss ${lead.company}`),
        bodyA: sanitizeHtml(`Hi ${lead.first_name},\n\nI noticed ${lead.company} is expanding in ${lead.industry || 'your sector'}...`),
        bodyB: sanitizeHtml(`Hello ${lead.first_name},\n\nWe’ve been following ${lead.company}’s growth in ${lead.industry || 'your industry'}...`),
      };
      const res = await abTestEmail(leadId, variantData);
      setAbTestResults(res);
      toast.success(`A/B Test triggered. Chosen variant: ${res.chosenVariant}`);
      debouncedLoadLead();
    } catch (err) {
      toast.error('Failed to run A/B test.');
    }
  };

  const handleUploadDoc = async (formData) => {
    try {
      if (formData.get('file').size > 5 * 1024 * 1024) throw new Error('File size exceeds 5MB.');
      await uploadLeadDoc(leadId, formData);
      toast.success('Document uploaded successfully!');
      debouncedLoadLead();
    } catch (err) {
      toast.error(err.message || 'Failed to upload document.');
    }
  };

  const handleSetReminder = async (datetime) => {
    try {
      await setFollowUpReminder(leadId, datetime);
      toast.success('Follow-up reminder set successfully!');
      debouncedLoadLead();
    } catch (err) {
      toast.error('Failed to set reminder.');
    }
  };

  const handleAssignLead = async (userId) => {
    try {
      const updated = await assignLead(leadId, userId);
      setLead(updated);
      toast.success('Lead assigned successfully!');
    } catch (err) {
      toast.error('Failed to assign lead.');
    }
  };

  const handleGenerateOutreachDraft = async (type) => {
    try {
      const draftData = await generateAIDraft(leadId, sanitizeHtml(emailSubject), lead.website || '');
      const draft = draftData.email_text.replace('[Name]', lead.first_name).replace('[Company]', lead.company);
      if (type === 'email') setEmailDraft(draft);
      else if (type === 'linkedin') setLinkedinDraft(draft);
      else if (type === 'sms') setSmsDraft(draft);
      toast.success(`Draft generated successfully for ${type}.`);
    } catch (err) {
      toast.error(`Failed to generate ${type} draft.`);
    }
  };

  const handleInitiateAICall = async () => {
    try {
      const result = await initiateAICall(leadId);
      toast.success(`AI call initiated: ${result.call_id}`);
      debouncedLoadLead();
    } catch (err) {
      toast.error('Failed to initiate AI call.');
    }
  };

  const handleSmartSchedule = async () => {
    try {
      const probability = await predictDemoProbability(leadId);
      if (probability.probability > 70) {
        const time = optimalEmailTime || new Date().toISOString().slice(0, 16);
        const result = await scheduleMeeting(leadId, { time });
        await sendEmail(leadId, {
          subject: `Demo Reminder for ${lead.first_name}`,
          body: `Hi ${lead.first_name}, your demo is scheduled for ${time}. Looking forward to it!`,
        });
        toast.success(`Demo scheduled: ${result.meeting_id} with reminder!`);
        debouncedLoadLead();
      } else {
        toast.info('Demo probability too low (<70%). Improve lead engagement first.');
      }
    } catch (err) {
      toast.error('Failed to schedule meeting.');
    }
  };

  const handleRefreshAIScore = async () => {
    try {
      const { score, justification } = await refreshAIScore(leadId);
      setLead(prev => ({ ...prev, ai_lead_score: score, ai_lead_score_justification: justification }));
      toast.success('AI score refreshed successfully!');
    } catch (err) {
      toast.error('Failed to refresh AI score.');
    }
  };

  const handleOptimizeEmailTime = async () => {
    try {
      const result = await optimizeEmailTime(leadId);
      setOptimalEmailTime(result.optimal_time);
      setScheduleTime(result.optimal_time);
      toast.success(`Optimal email time set: ${result.optimal_time}`);
    } catch (err) {
      toast.error('Failed to optimize email time.');
    }
  };

  const handlePredictNextAction = async () => {
    try {
      const result = await predictNextAction(leadId);
      setNextAction(result.next_action);
      toast.success(`Next action predicted: ${result.next_action}`);
    } catch (err) {
      toast.error('Failed to predict next action.');
    }
  };

  const handlePredictDemoProbability = async () => {
    try {
      const result = await predictDemoProbability(leadId);
      setDemoProbability(result.probability);
      toast.success(`Demo probability: ${result.probability}%`);
    } catch (err) {
      toast.error('Failed to predict demo probability.');
    }
  };

  const handleConnectCalendly = async (calendlyUrl) => {
    try {
      if (!calendlyUrl || !calendlyUrl.startsWith('https://calendly.com/')) {
        throw new Error('Invalid Calendly URL. Please enter a valid link (e.g., https://calendly.com/your-name).');
      }

      try {
        const response = await fetchWithRetry(() => connectCalendly(leadId, calendlyUrl));
        setCalendlyLink(response.link);
      } catch (backendErr) {
        console.warn('Backend unavailable for Calendly save. Using local storage:', backendErr);
        localStorage.setItem(`calendlyLink_${leadId}`, calendlyUrl);
        setCalendlyLink(calendlyUrl);
        toast.warn('Calendly link saved locally due to backend unavailability.');
      }

      if (window.Calendly && calendlyScriptLoaded) {
        window.Calendly.initBadgeWidget({
          url: calendlyUrl,
          text: 'Schedule Time',
          color: '#006bff',
          textColor: '#ffffff',
          branding: false,
        });
      }
      toast.success('Calendly connected successfully!');
    } catch (err) {
      console.error('Failed to connect Calendly:', err);
      toast.error(err.message || 'Failed to connect Calendly.');
      Sentry.captureException(err);
    }
  };

  const handleDisconnectCalendly = () => {
    localStorage.removeItem(`calendlyLink_${leadId}`);
    setCalendlyLink(null);
    if (window.Calendly && window.Calendly.destroyBadgeWidget) {
      window.Calendly.destroyBadgeWidget();
    }
    toast.success('Calendly disconnected successfully!');
  };

  const handleAddToCampaign = () => navigate('/campaigns/new', { state: { leadId } });

  const handleAddNote = async (noteText) => {
    try {
      const result = await addNote(leadId, { content: sanitizeHtml(noteText) });
      setLead(prev => ({ ...prev, notes: [...(prev.notes || []), result] }));
      toast.success('Note added successfully!');
    } catch (err) {
      toast.error('Failed to add note.');
    }
  };

  const handleEditNote = async (note) => {
    try {
      const newContent = prompt('Edit note:', note.content);
      if (newContent) {
        const result = await editNote(leadId, note.id, { content: sanitizeHtml(newContent) });
        setLead(prev => ({
          ...prev,
          notes: prev.notes.map(n => n.id === note.id ? { ...n, content: result.content } : n),
        }));
        toast.success('Note updated successfully!');
      }
    } catch (err) {
      toast.error('Failed to edit note.');
    }
  };

  const handleDeleteNote = async (noteId) => {
    try {
      await deleteNote(leadId, noteId);
      setLead(prev => ({ ...prev, notes: prev.notes.filter(n => n.id !== noteId) }));
      toast.success('Note deleted successfully!');
    } catch (err) {
      toast.error('Failed to delete note.');
    }
  };

  const handleAddTask = async (taskTitle) => {
    try {
      const result = await addTask(leadId, { content: sanitizeHtml(taskTitle) });
      setLead(prev => ({ ...prev, tasks: [...(prev.tasks || []), result] }));
      toast.success('Task added successfully!');
    } catch (err) {
      toast.error('Failed to add task.');
    }
  };

  const previewEmail = () => {
    return emailDraft
      .replace('[Name]', `${lead.first_name} ${lead.last_name}`)
      .replace('[Company]', lead.company || 'your company')
      .replace('[Job]', lead.job_title || 'your role');
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-900 text-gray-200 animate-pulse">Loading lead details...</div>;
  if (!lead) return <div className="min-h-screen flex items-center justify-center bg-gray-900 text-red-500">Lead not found.</div>;

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <div className="min-h-screen bg-gray-900 text-gray-200 md:container md:mx-auto px-4 py-6">
        <header className="sticky top-0 z-20 bg-[#1F2937] p-4 flex flex-col md:flex-row justify-between items-center shadow-lg rounded-lg">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full overflow-hidden border-2 border-gray-700">
              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${lead.first_name}`} alt={lead.first_name} className="h-full w-full object-cover" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">{lead.first_name} {lead.last_name}</h1>
              <p className="text-sm text-gray-300">{lead.job_title} at {lead.company}</p>
              <div className="flex gap-2 mt-1">
                {lead.ai_lead_score >= 80 && <span className="px-2 py-0.5 rounded-full bg-red-600 text-white text-xs font-medium">Hot ({lead.ai_lead_score})</span>}
                {lead.ai_lead_score >= 50 && lead.ai_lead_score < 80 && <span className="px-2 py-0.5 rounded-full bg-yellow-600 text-white text-xs font-medium">Warm ({lead.ai_lead_score})</span>}
                {lead.ai_lead_score < 50 && <span className="px-2 py-0.5 rounded-full bg-green-600 text-white text-xs font-medium">Cold ({lead.ai_lead_score})</span>}
              </div>
            </div>
          </div>
          <div className="flex gap-3 mt-4 md:mt-0">
            <button onClick={handleAddToCampaign} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors" aria-label="Add to campaign">Add to Campaign</button>
            <button onClick={handleRefreshAIScore} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors" aria-label="Refresh AI score"><RefreshCw className="h-5 w-5" /></button>
            <button onClick={() => navigate(-1)} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors" aria-label="Close lead details"><X className="h-5 w-5" /></button>
          </div>
        </header>

        <section className="mt-6 p-4 border-b border-gray-700 flex flex-wrap gap-4 bg-gray-800 rounded-lg">
          <button onClick={handleEnrichLead} className="flex items-center gap-2 px-4 py-2 bg-green-600 rounded-lg hover:bg-green-700 transition-colors" aria-label="Enrich lead data">✅ Enrich Lead</button>
          <button onClick={handleGenerateDraft} className="flex items-center gap-2 px-4 py-2 bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors" aria-label="Generate AI email draft">✨ AI Email Draft</button>
          <button onClick={handleABTest} className="flex items-center gap-2 px-4 py-2 bg-pink-600 rounded-lg hover:bg-pink-700 transition-colors" aria-label="Run A/B test">🔴 A/B Test</button>
          <button onClick={handleInitiateAICall} className="flex items-center gap-2 px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors" aria-label="Initiate AI call"><PhoneCall className="h-4 w-4" /> AI Call</button>
          <button onClick={handleSmartSchedule} className="flex items-center gap-2 px-4 py-2 bg-teal-600 rounded-lg hover:bg-teal-700 transition-colors" aria-label="Smart schedule meeting"><Calendar className="h-4 w-4" /> Smart Schedule</button>
          <button onClick={handleOptimizeEmailTime} className="flex items-center gap-2 px-4 py-2 bg-orange-600 rounded-lg hover:bg-orange-700 transition-colors" aria-label="Optimize email time">⏰ Optimize Email Time</button>
          <button onClick={handlePredictNextAction} className="flex items-center gap-2 px-4 py-2 bg-cyan-600 rounded-lg hover:bg-cyan-700 transition-colors" aria-label="Predict next action">🔮 Predict Next Action</button>
          <button onClick={handlePredictDemoProbability} className="flex items-center gap-2 px-4 py-2 bg-lime-600 rounded-lg hover:bg-lime-700 transition-colors" aria-label="Predict demo probability">📊 Demo Probability</button>
          <button onClick={checkDeliverability} className="flex items-center gap-2 px-4 py-2 bg-yellow-600 rounded-lg hover:bg-yellow-700 transition-colors" aria-label="Check deliverability"><Mail className="h-4 w-4" /> Check Deliverability</button>
          <button onClick={() => setActiveTab('calendly')} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors" aria-label="Open Calendly tab"><Calendar className="h-4 w-4" /> Calendly</button>
          <AssignLeadDropdown onAssign={handleAssignLead} />
          {socketStatus !== 'connected' && <span className="text-red-500 font-medium">Reconnecting... ({socketStatus})</span>}
        </section>

        <LeadTabs activeTab={activeTab} setActiveTab={setActiveTab} additionalTabs={[{ id: 'analytics', label: 'Analytics' }, { id: 'calendly', label: 'Calendly' }]} />

        <main className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <LeadInfoDisplay lead={{
              ...lead,
              click_count: clickData.reduce((sum, link) => sum + link.click_count, 0),
              spam_score: lead.emails?.[0]?.spam_score || 0,
              deal_priority: lead.deals?.[0]?.priority_score || 'N/A',
            }} />
            <div className="mt-6 bg-gray-800 p-4 rounded-lg shadow">
              <h2 className="text-lg font-semibold text-white mb-4">AI Insights</h2>
              <p><strong>AI Score Justification:</strong> {lead.ai_lead_score_justification || 'N/A'}</p>
              <p><strong>Deal Priority Score:</strong> {lead.deals?.[0]?.priority_score || 'N/A'}</p>
              {optimalEmailTime && <p><strong>Optimal Email Time:</strong> {optimalEmailTime}</p>}
              {nextAction && <p><strong>Predicted Next Action:</strong> {nextAction}</p>}
              {demoProbability && <p><strong>Demo Probability:</strong> {demoProbability}%</p>}
              {lead.calls?.length > 0 && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-blue-400 hover:underline">Call Analysis</summary>
                  <CoachingInsightsDisplay insights={lead.calls[0].sales_coaching_insights_json || {}} />
                </details>
              )}
            </div>
          </div>
          <EngagementSection lead={lead} handleAddTag={handleAddTag} handleRemoveTag={handleRemoveTag} />
        </main>

        <section className="mt-6">
          {activeTab === 'overview' && (
            <>
              <div className="mb-6 bg-gray-800 p-4 rounded-lg shadow">
                <h2 className="text-lg font-semibold text-white mb-4">Real-Time Email Draft</h2>
                <RealtimeEmailDraft lead={lead} setEmailDraft={setEmailDraft} />
              </div>
              <div className="mb-6 bg-gray-800 p-4 rounded-lg shadow">
                <h2 className="text-lg font-semibold text-white mb-4">Recent Activity</h2>
                <WindowVirtualizer data={activityTimeline} itemHeight={60}>
                  {({ index }) => <ActivityTimeline key={index} activities={[activityTimeline[index]]} />}
                </WindowVirtualizer>
              </div>
              <NoteSection notes={lead.notes || []} onAddNote={handleAddNote} onEditNote={handleEditNote} onDeleteNote={handleDeleteNote} />
            </>
          )}

          {activeTab === 'activity' && (
            <div className="bg-gray-800 p-4 rounded-lg shadow mb-6">
              <h2 className="text-lg font-semibold text-white mb-4">Activity Timeline</h2>
              <WindowVirtualizer data={activityTimeline} itemHeight={60}>
                {({ index }) => <ActivityTimeline key={index} activities={[activityTimeline[index]]} />}
              </WindowVirtualizer>
            </div>
          )}

          {activeTab === 'tasks' && (
            <LeadTasks tasks={lead.tasks || []} onAddTask={handleAddTask} />
          )}

          {activeTab === 'notes' && (
            <NoteSection notes={lead.notes || []} onAddNote={handleAddNote} onEditNote={handleEditNote} onDeleteNote={handleDeleteNote} />
          )}

          {activeTab === 'emails' && (
            <div className="bg-gray-800 p-4 rounded-lg shadow mb-6">
              <h2 className="text-lg font-semibold text-white mb-4">Outreach</h2>
              <ul className="flex space-x-4 border-b border-gray-700 mb-4">
                {['email', 'linkedin', 'sms'].map(type => (
                  <li key={type}>
                    <button
                      onClick={() => setActiveOutreachTab(type)}
                      className={`py-2 px-4 text-sm ${activeOutreachTab === type ? 'border-b-2 border-blue-500 text-blue-400' : 'text-gray-400 hover:text-gray-300'}`}
                      aria-label={`Switch to ${type} draft`}
                    >
                      {type === 'email' ? 'Email' : type === 'linkedin' ? 'LinkedIn' : 'SMS'}
                    </button>
                  </li>
                ))}
              </ul>
              {activeOutreachTab === 'email' && (
                <div>
                  <button onClick={() => handleGenerateOutreachDraft('email')} className="px-4 py-2 bg-blue-600 rounded-lg text-white hover:bg-blue-700 transition-colors" aria-label="Generate email draft">Generate Email Draft</button>
                  {emailDraft && (
                    <div className="mt-3 border p-3 rounded-lg bg-gray-700">
                      <input
                        type="text"
                        value={emailSubject}
                        onChange={(e) => setEmailSubject(e.target.value)}
                        className="mb-2 px-3 py-2 bg-gray-600 text-white rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Email Subject"
                      />
                      <Suspense fallback={<div className="text-gray-400">Loading editor...</div>}>
                        <ReactQuill
                          value={emailDraft}
                          onChange={setEmailDraft}
                          className="bg-gray-600 text-white border border-gray-700 rounded-lg"
                          modules={{ toolbar: [['bold', 'italic', 'underline'], ['link'], [{ list: 'ordered' }, { list: 'bullet' }]] }}
                        />
                      </Suspense>
                      <p className="text-sm text-gray-400 mt-2">Spam Score: {lead.emails?.[0]?.spam_score || 0}</p>
                      <p className="text-sm text-gray-400">Click Count: {clickData.reduce((sum, link) => sum + link.click_count, 0)}</p>
                      <input
                        type="datetime-local"
                        value={scheduleTime || optimalEmailTime || ''}
                        onChange={(e) => setScheduleTime(e.target.value)}
                        className="mt-2 px-3 py-2 bg-gray-600 text-white rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {emailStatus && <p className="text-gray-300 mt-2">Status: {emailStatus}</p>}
                      {abTestResults && <p className="text-gray-300 mt-2">A/B Test Result: {abTestResults.chosenVariant}</p>}
                      <div className="mt-2 flex gap-2">
                        <button onClick={() => setShowPreview(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors" aria-label="Preview email">Preview</button>
                        <button onClick={handleSendEmail} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors" aria-label={scheduleTime ? 'Schedule email' : 'Send email'}>
                          <Send className="h-4 w-4" /> {scheduleTime || optimalEmailTime ? 'Schedule' : 'Send'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
              {activeOutreachTab === 'linkedin' && (
                <div>
                  <button onClick={() => handleGenerateOutreachDraft('linkedin')} className="px-4 py-2 bg-blue-600 rounded-lg text-white hover:bg-blue-700 transition-colors" aria-label="Generate LinkedIn draft">Generate LinkedIn Draft</button>
                  {linkedinDraft && <div className="mt-3 border p-3 rounded-lg bg-gray-700" style={{ whiteSpace: 'pre-wrap' }}><strong>LinkedIn:</strong> {linkedinDraft}</div>}
                </div>
              )}
              {activeOutreachTab === 'sms' && (
                <div>
                  <button onClick={() => handleGenerateOutreachDraft('sms')} className="px-4 py-2 bg-blue-600 rounded-lg text-white hover:bg-blue-700 transition-colors" aria-label="Generate SMS draft">Generate SMS Draft</button>
                  {smsDraft && <div className="mt-3 border p-3 rounded-lg bg-gray-700" style={{ whiteSpace: 'pre-wrap' }}><strong>SMS:</strong> {smsDraft}</div>}
                </div>
              )}
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="bg-gray-800 p-4 rounded-lg shadow mb-6">
              <h2 className="text-lg font-semibold text-white mb-4">Sales Analytics</h2>
              <p className="text-gray-300">Click Count: {clickData.reduce((sum, link) => sum + link.click_count, 0)}</p>
              <p className="text-gray-300">Demo Probability: {demoProbability || 'N/A'}%</p>
              <LineChart width={500} height={300} data={analyticsData} className="mt-4">
                <XAxis dataKey="name" stroke="#fff" />
                <YAxis stroke="#fff" />
                <RechartsTooltip />
                <Line type="monotone" dataKey="clicks" stroke="#8884d8" />
              </LineChart>
            </div>
          )}

          {activeTab === 'calendly' && (
            <div className="bg-gray-800 p-4 rounded-lg shadow mb-6">
              <h2 className="text-lg font-semibold text-white mb-4">Calendly Scheduling</h2>
              {!calendlyLink ? (
                <div className="flex flex-col gap-4">
                  <p className="text-gray-300">Connect your Calendly account to enable a floating badge for scheduling meetings.</p>
                  <input
                    type="text"
                    placeholder="Enter your Calendly link (e.g., https://calendly.com/your-name)"
                    className="px-3 py-2 bg-gray-600 text-white rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleConnectCalendly(e.target.value);
                    }}
                  />
                  <button
                    onClick={() => handleConnectCalendly(document.querySelector('input[placeholder*="Calendly link"]').value)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Connect Calendly
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <p className="text-gray-300 mb-2">
                    Your Calendly is connected: <a href={calendlyLink} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">{calendlyLink}</a>
                  </p>
                  <p className="text-gray-400">The scheduling badge is now floating at the bottom-right of this page.</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        const newUrl = prompt('Enter new Calendly link:', calendlyLink);
                        if (newUrl) handleConnectCalendly(newUrl);
                      }}
                      className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                    >
                      Change Link
                    </button>
                    <button
                      onClick={handleDisconnectCalendly}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Disconnect
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </section>

        <section className="mt-6">
          <div className="bg-gray-800 p-4 rounded-lg shadow mb-6">
            <h2 className="text-xl font-semibold text-white mb-4">Documents</h2>
            <DocumentUpload onUpload={handleUploadDoc} />
            {lead.documents?.length > 0 && (
              <WindowVirtualizer data={lead.documents} itemHeight={40}>
                {({ index }) => (
                  <li key={lead.documents[index].id} className="text-gray-300">
                    <a href={lead.documents[index].file_url} target="_blank" rel="noopener noreferrer" className="underline text-blue-400 hover:text-blue-300">{lead.documents[index].filename}</a>
                  </li>
                )}
              </WindowVirtualizer>
            )}
          </div>
        </section>

        <AIDraftModal isOpen={isAIDraftModalOpen} onClose={() => setIsAIDraftModalOpen(false)} draft={aiDraft} />

        {showPreview && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-gray-800 p-6 rounded-xl shadow-xl w-full max-w-2xl">
              <h3 className="text-lg font-semibold text-white mb-4">Email Preview</h3>
              <p className="text-gray-300" style={{ whiteSpace: 'pre-wrap' }}>
                <strong>Subject:</strong> {emailSubject}<br />
                <strong>Body:</strong><br />{previewEmail()}
              </p>
              <button onClick={() => setShowPreview(false)} className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors" aria-label="Close preview">Close</button>
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default React.memo(LeadDetails);