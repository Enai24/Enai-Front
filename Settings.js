// src/pages/Settings.js
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Switch } from '@headlessui/react';
import { LockClosedIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';
import api from '../services/api';
import { useLocation, useNavigate } from 'react-router-dom';
import { User, Mail, Shield, Zap, Crown, CheckCircle, Key, Users } from 'lucide-react';
import {
  fetchUserProfile,
  updateUserProfile,
  fetchUserSettings,
  updateUserSettings,
} from '../services/api';
import CustomDomainForm from '../components/CustomDomainForm'; // Import the form component
import DomainList from '../components/DomainList'; // Import the list component

const PRICING_TIERS = [
  { name: 'Basic', price: '$29/month', tokens: '2M', features: ['2M tokens/month', 'Basic email tracking', 'Standard support'], icon: <Shield className="w-6 h-6 text-blue-400" /> },
  { name: 'Standard', price: '$79/month', tokens: '5M', features: ['5M tokens/month', 'Advanced analytics', 'Priority support', 'Custom templates'], icon: <Zap className="w-6 h-6 text-yellow-400" /> },
  { name: 'Premium', price: '$199/month', tokens: '15M', features: ['15M tokens/month', 'Enterprise features', '24/7 support', 'API access', 'Custom integration'], icon: <Crown className="w-6 h-6 text-purple-400" /> },
];

const Settings = () => {
  const [loading, setLoading] = useState(true);
  const [userStats, setUserStats] = useState({ emailsSent: 0, emailsRemaining: 0, tokensUsed: 0, totalTokens: 0 });
  const [profileData, setProfileData] = useState({ firstName: '', lastName: '', title: '', email: '', optOutMessage: '' });
  const [settings, setSettings] = useState({
    oneClickUnsubscribe: false,
    openTracking: false,
    clickTracking: false,
    chromeEmailTracking: false,
    chromeDesktopNotifications: false,
    chromeNoReplyReminder: false,
    emailNotificationDataReq: false,
    twoFactorAuth: false,
  });
  const [activeSection, setActiveSection] = useState('profile');
  const [isGmailConnected, setIsGmailConnected] = useState(false);
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [teamMembers, setTeamMembers] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();

  const fetchUserData = useCallback(async () => {
    if (!localStorage.getItem('access_token')) {
      toast.error('Please log in to access settings.');
      navigate('/login');
      return;
    }
    setLoading(true);
    try {
      const profile = await fetchUserProfile();
      setProfileData(profile);
      const settingsData = await fetchUserSettings();
      setSettings({
        oneClickUnsubscribe: settingsData.one_click_unsubscribe || false,
        openTracking: settingsData.open_tracking_enabled || false,
        clickTracking: settingsData.click_tracking_enabled || false,
        chromeEmailTracking: settingsData.gmail_chrome_extension_enabled || false,
        chromeDesktopNotifications: settingsData.desktop_notifications_enabled || false,
        chromeNoReplyReminder: settingsData.no_reply_reminder_enabled || false,
        emailNotificationDataReq: settingsData.email_notifications_data_request || false,
        twoFactorAuth: settingsData.two_factor_auth || false,
      });
      setUserStats({
        emailsSent: profile.emails_sent || 0,
        emailsRemaining: profile.emails_remaining || 0,
        tokensUsed: profile.token_balance || 0,
        totalTokens: profile.total_tokens || 0,
      });
      setApiKey(profile.api_key || '');
      setTeamMembers(profile.team_members || []);
      toast.success('Settings loaded successfully.');
    } catch (error) {
      toast.error('Failed to load settings.');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    const backendHost = process.env.REACT_APP_BACKEND_HOST || 'localhost:8000';
    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    // Construct the WebSocket URL (ensure no duplicate slashes)
    const wsUrl = `${protocol}://${backendHost}/ws/settings/`;
    console.log("Connecting to WebSocket at:", wsUrl);
    
    const ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
      console.log("WebSocket connected to settings endpoint");
    };
  
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.message) {
          toast.info(`Settings update: ${data.message}`);
          fetchUserData();
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };
  
    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      toast.error("WebSocket connection failed.");
    };
  
    ws.onclose = (event) => {
      console.warn("WebSocket disconnected:", event.code, event.reason);
      // Optionally implement reconnection logic here.
    };
  
    return () => {
      ws.close(1000, 'Component unmounted');
      console.log("WebSocket closed on cleanup");
    };
  }, [fetchUserData]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  // Profile Handlers
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdateProfile = async () => {
    setUpdatingProfile(true);
    if (!profileData.firstName.trim() || !profileData.lastName.trim()) {
      toast.error('First and Last Name are required.');
      setUpdatingProfile(false);
      return;
    }
    if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(profileData.email)) {
      toast.error('Invalid email format.');
      setUpdatingProfile(false);
      return;
    }
    try {
      await updateUserProfile(profileData);
      toast.success('Profile updated successfully!');
      fetchUserData();
    } catch (error) {
      toast.error('Failed to update profile.');
    } finally {
      setUpdatingProfile(false);
    }
  };

  // Settings Toggle Handler
  const handleToggleSetting = async (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    try {
      await updateUserSettings({ [key]: value });
      toast.success(`${key.replace(/([A-Z])/g, ' $1').trim()} updated.`);
    } catch (error) {
      toast.error(`Failed to update ${key}.`);
      setSettings((prev) => ({ ...prev, [key]: !value }));
    }
  };

  // Gmail Integration (Unchanged)
  useEffect(() => {
    const checkGmailConnection = async () => {
      try {
        const response = await api.get('/auth/google/status/');
        setIsGmailConnected(response.data.is_connected);
      } catch (error) {
        console.error('Error checking Gmail connection:', error);
        setIsGmailConnected(false);
      }
    };
    checkGmailConnection();
  }, []);

  const handleConnectGmail = async () => {
    try {
      const response = await api.get('/auth/google/init/');
      window.location.href = response.data.authorization_url;
    } catch (error) {
      toast.error('Failed to initiate Gmail connection.');
    }
  };

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const access = query.get('access');
    const refresh = query.get('refresh');
    const success = query.get('success');
    const error = query.get('error');

    if (access && refresh && success === 'google_connected') {
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      toast.success('Gmail account connected successfully!');
      setIsGmailConnected(true);
      navigate('/settings', { replace: true });
    } else if (error === 'oauth_failed') {
      toast.error('Gmail OAuth failed. Please try again.');
      navigate('/settings', { replace: true });
    }
  }, [location.search, navigate]);

  // Additional Handlers
  const handleUpgradePlan = (tier) => {
    toast.info(`Upgrading to ${tier.name}...`);
    navigate('/settings/billing');
  };

  const handleGenerateApiKey = async () => {
    try {
      const response = await api.post('/settings/generate-api-key/');
      setApiKey(response.data.api_key);
      toast.success('API key generated successfully!');
    } catch (error) {
      toast.error('Failed to generate API key.');
    }
  };

  const handleAddTeamMember = async (email) => {
    try {
      const response = await api.post('/settings/add-team-member/', { email });
      setTeamMembers((prev) => [...prev, response.data]);
      toast.success('Team member added successfully!');
    } catch (error) {
      toast.error('Failed to add team member.');
    }
  };

  const filteredSections = useMemo(() => {
    const sections = [
      'profile', 'mailboxes', 'users', 'billing', 'systemActivity', 'security',
      'integrations', 'dataManagement', 'objects', 'aiContent', 'scoring', 'picklists', 'impactGrowth',
    ];
    return sections.filter((section) =>
      section.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  if (loading) return <div className="flex min-h-screen bg-gray-900 text-white justify-center items-center">Loading...</div>;

  return (
    <div className="flex min-h-screen bg-gray-900 text-gray-100">
      <aside className="w-72 bg-gray-800 border-r border-gray-700 p-4">
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search Settings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 rounded bg-gray-700 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Search settings"
          />
        </div>
        <nav className="space-y-2">
          {['Personal', 'Company', 'Objects', 'AI Content Center', 'Scoring & Signals', 'Global Picklists', 'Impact & Growth'].map((category, idx) => (
            <div key={idx}>
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mt-6 mb-2">{category}</h2>
              {filteredSections
                .filter((section) => {
                  if (category === 'Personal') return ['profile', 'mailboxes'].includes(section);
                  if (category === 'Company') return ['users', 'billing', 'systemActivity', 'security', 'integrations', 'dataManagement'].includes(section);
                  if (category === 'Objects') return section === 'objects';
                  if (category === 'AI Content Center') return section === 'aiContent';
                  if (category === 'Scoring & Signals') return section === 'scoring';
                  if (category === 'Global Picklists') return section === 'picklists';
                  if (category === 'Impact & Growth') return section === 'impactGrowth';
                  return false;
                })
                .map((section) => (
                  <button
                    key={section}
                    onClick={() => setActiveSection(section)}
                    className={`block w-full text-left px-3 py-2 rounded hover:bg-gray-700 ${activeSection === section ? 'bg-gray-700' : ''}`}
                    aria-label={`Go to ${section} settings`}
                  >
                    {section === 'profile' ? 'Profile' :
                     section === 'mailboxes' ? 'Mailboxes' :
                     section === 'users' ? 'Users & Teams' :
                     section === 'billing' ? 'Billing' :
                     section === 'systemActivity' ? 'System Activity' :
                     section === 'security' ? 'Security' :
                     section === 'integrations' ? 'Integrations' :
                     section === 'dataManagement' ? 'Data Management' :
                     section === 'objects' ? 'Manage CRM Objects' :
                     section === 'aiContent' ? 'AI-Generated Content' :
                     section === 'scoring' ? 'Lead Scoring' :
                     section === 'picklists' ? 'Manage Picklists' :
                     'Impact & Growth'}
                  </button>
                ))}
            </div>
          ))}
        </nav>
      </aside>

      <main className="flex-1 p-6 space-y-6">
        {activeSection === 'profile' && (
          <>
            <section className="bg-gray-700 rounded-lg p-6 space-y-6">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <h2 className="text-xl font-semibold text-white">Account Details</h2>
                  <div className="flex items-center space-x-2 text-gray-300">
                    <User className="w-5 h-5" />
                    <span>{profileData.firstName} {profileData.lastName}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-300">
                    <Mail className="w-5 h-5" />
                    <span>{profileData.email}</span>
                  </div>
                </div>
                <button
                  onClick={handleUpdateProfile}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:bg-gray-500"
                  disabled={updatingProfile}
                  aria-label="Edit profile"
                >
                  {updatingProfile ? 'Updating...' : 'Edit Profile'}
                </button>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="text-white font-medium">Token Usage</h3>
                  <span className="text-gray-300">
                    {userStats.tokensUsed.toLocaleString()} / {userStats.totalTokens.toLocaleString()}
                  </span>
                </div>
                <div className="w-full bg-gray-600 rounded-full h-2.5">
                  <div
                    className={`h-2.5 rounded-full ${userStats.tokensUsed / userStats.totalTokens >= 0.9 ? 'bg-red-500' : userStats.tokensUsed / userStats.totalTokens >= 0.8 ? 'bg-yellow-500' : 'bg-blue-500'}`}
                    style={{ width: `${Math.min((userStats.tokensUsed / userStats.totalTokens) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div className="bg-gray-600 p-4 rounded-lg">
                  <div className="text-gray-300 text-sm">Emails Sent</div>
                  <div className="text-white text-lg font-semibold">{userStats.emailsSent.toLocaleString()}</div>
                </div>
                <div className="bg-gray-600 p-4 rounded-lg">
                  <div className="text-gray-300 text-sm">Remaining</div>
                  <div className="text-white text-lg font-semibold">{userStats.emailsRemaining.toLocaleString()}</div>
                </div>
                <div className="bg-gray-600 p-4 rounded-lg">
                  <div className="text-gray-300 text-sm">Open Rate</div>
                  <div className="text-white text-lg font-semibold">68%</div>
                </div>
                <div className="bg-gray-600 p-4 rounded-lg">
                  <div className="text-gray-300 text-sm">Reply Rate</div>
                  <div className="text-white text-lg font-semibold">42%</div>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-lg font-medium text-white">Upgrade Your Plan</h2>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                {PRICING_TIERS.map((tier) => (
                  <div key={tier.name} className="bg-gray-700 rounded-lg p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium text-white">{tier.name}</h3>
                        <p className="text-2xl font-bold text-white">{tier.price}</p>
                      </div>
                      {tier.icon}
                    </div>
                    <ul className="space-y-2">
                      {tier.features.map((feature) => (
                        <li key={feature} className="flex items-center text-gray-300">
                          <CheckCircle className="w-4 h-4 mr-2 text-blue-400" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <button
                      onClick={() => handleUpgradePlan(tier)}
                      className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                      aria-label={`Upgrade to ${tier.name}`}
                    >
                      Upgrade to {tier.name}
                    </button>
                  </div>
                ))}
              </div>
            </section>

            <section className="bg-gray-800 p-6 rounded shadow space-y-6">
              <h2 className="text-xl font-bold mb-4">Profile</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="firstName" className="block text-sm text-gray-300 mb-1">First Name</label>
                  <input
                    id="firstName"
                    name="firstName"
                    value={profileData.firstName}
                    onChange={handleProfileChange}
                    className="w-full px-3 py-2 rounded bg-gray-700 text-gray-100 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm text-gray-300 mb-1">Last Name</label>
                  <input
                    id="lastName"
                    name="lastName"
                    value={profileData.lastName}
                    onChange={handleProfileChange}
                    className="w-full px-3 py-2 rounded bg-gray-700 text-gray-100 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="title" className="block text-sm text-gray-300 mb-1">Title</label>
                  <input
                    id="title"
                    name="title"
                    value={profileData.title}
                    onChange={handleProfileChange}
                    className="w-full px-3 py-2 rounded bg-gray-700 text-gray-100 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm text-gray-300 mb-1">Email</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={profileData.email}
                    onChange={handleProfileChange}
                    className="w-full px-3 py-2 rounded bg-gray-700 text-gray-100 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
              <button
                onClick={handleUpdateProfile}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 mt-4 rounded disabled:bg-gray-500"
                disabled={updatingProfile}
                aria-label="Update profile"
              >
                {updatingProfile ? 'Updating...' : 'Update Profile'}
              </button>
            </section>

            <section className="bg-gray-800 p-6 rounded shadow space-y-6">
              <h2 className="text-xl font-bold mb-4">User Fields & Email Settings</h2>
              <div className="border border-gray-700 rounded p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-200">Custom User Fields</h3>
                  <button
                    onClick={() => toast.info('Custom fields management coming soon!')}
                    className="bg-blue-6CustomDomainForm00 hover:bg-blue-700 text-white px-3 py-1 rounded"
                    aria-label="Manage custom fields"
                  >
                    Manage Fields
                  </button>
                </div>
                <p className="text-sm text-gray-400">Add or edit custom fields for user profiles.</p>
              </div>
              <div className="border border-gray-700 rounded p-4 space-y-4">
                <h3 className="font-semibold text-gray-200">Email Settings</h3>
                <div>
                  <button
                    onClick={() => setActiveSection('mailboxes')}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
                    aria-label="Manage mailboxes"
                  >
                    Manage Mailboxes
                  </button>
                  <p className="text-sm text-gray-400 mt-1">Connect or manage your mailboxes.</p>
                </div>
                <div>
                  <p className="text-sm text-gray-200">Email Sending Limit: <span className="font-bold">100/day</span></p>
                  <button
                    onClick={() => handleUpgradePlan({ name: 'Higher Limits' })}
                    className="mt-1 text-blue-400 hover:underline text-sm"
                    aria-label="Upgrade for higher email limits"
                  >
                    Upgrade for higher limits
                  </button>
                </div>
                <div>
                  <label htmlFor="optOutMessage" className="block text-sm text-gray-300 mb-1">Opt-Out Message</label>
                  <textarea
                    id="optOutMessage"
                    name="optOutMessage"
                    value={profileData.optOutMessage}
                    onChange={handleProfileChange}
                    rows="2"
                    className="w-full px-3 py-2 rounded bg-gray-700 text-gray-100 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                {Object.entries({
                  oneClickUnsubscribe: 'Enable One-Click Unsubscribe',
                  openTracking: 'Enable Open Tracking',
                  clickTracking: 'Enable Click Tracking',
                }).map(([key, label]) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-sm text-gray-200">{label}</span>
                    <Switch
                      checked={settings[key]}
                      onChange={(value) => handleToggleSetting(key, value)}
                      className={`${settings[key] ? 'bg-blue-600' : 'bg-gray-600'} relative inline-flex h-6 w-11 items-center rounded-full transition`}
                      aria-label={`Toggle ${label}`}
                    >
                      <span className={`${settings[key] ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white`} />
                    </Switch>
                  </div>
                ))}
              </div>
            </section>

            <section className="bg-gray-800 p-6 rounded shadow space-y-6">
              <h2 className="text-xl font-bold mb-4">Gmail Integration</h2>
              <div className="border border-gray-700 rounded p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-200">Connect Your Gmail Account</h3>
                  {isGmailConnected ? (
                    <span className="text-green-500 font-semibold">Connected</span>
                  ) : (
                    <button
                      onClick={handleConnectGmail}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                      aria-label="Connect Gmail"
                    >
                      Connect Gmail
                    </button>
                  )}
                </div>
                <p className="text-sm text-gray-400">Connect Gmail to send emails from Enai CRM.</p>
              </div>
            </section>

            <section className="bg-gray-800 p-6 rounded shadow space-y-4">
              <h2 className="text-xl font-bold mb-4">Gmail Chrome Extension</h2>
              {Object.entries({
                chromeEmailTracking: 'Enable Email Tracking, Templates, Send Later, & Reminders',
                chromeDesktopNotifications: 'Enable Desktop Notifications for Opens & Clicks',
                chromeNoReplyReminder: 'Send Reminder if No Reply by Default',
              }).map(([key, label]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-sm text-gray-200">{label}</span>
                  <Switch
                    checked={settings[key]}
                    onChange={(value) => handleToggleSetting(key, value)}
                    className={`${settings[key] ? 'bg-blue-600' : 'bg-gray-600'} relative inline-flex h-6 w-11 items-center rounded-full transition`}
                    aria-label={`Toggle ${label}`}
                  >
                    <span className={`${settings[key] ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white`} />
                  </Switch>
                </div>
              ))}
            </section>

            <section className="bg-gray-800 p-6 rounded shadow space-y-4">
              <h2 className="text-xl font-bold mb-4">Email Notification Settings</h2>
              <div className="border border-gray-700 rounded p-4 flex items-center justify-between">
                <span className="text-sm text-gray-200">Data Request Completion Notifications</span>
                <Switch
                  checked={settings.emailNotificationDataReq}
                  onChange={(value) => handleToggleSetting('emailNotificationDataReq', value)}
                  className={`${settings.emailNotificationDataReq ? 'bg-blue-600' : 'bg-gray-600'} relative inline-flex h-6 w-11 items-center rounded-full transition`}
                  aria-label="Toggle data request notifications"
                >
                  <span className={`${settings.emailNotificationDataReq ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white`} />
                </Switch>
              </div>
            </section>
          </>
        )}

        {activeSection === 'mailboxes' && (
          <section className="bg-gray-800 p-6 rounded shadow space-y-6">
            <h2 className="text-xl font-bold mb-4">Mailboxes</h2>
            <p className="text-gray-300">Manage connected mailboxes (e.g., Gmail, Outlook).</p>
            <button
              onClick={handleConnectGmail}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              aria-label="Add new mailbox"
            >
              Add New Mailbox
            </button>

            {/* Custom Domain Integration */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-200 mb-4">Custom Domains</h3>
              <CustomDomainForm 
                onDomainAdded={() => {
                  const listComponent = document.querySelector('#domain-list');
                  if (listComponent) listComponent.fetchDomains(); // Trigger refresh in DomainList
                }} 
              />
              <DomainList id="domain-list" /> {/* Add an ID for targeting */}
            </div>
          </section>
        )}

        {activeSection === 'users' && (
          <section className="bg-gray-800 p-6 rounded shadow space-y-4">
            <h2 className="text-xl font-bold mb-4">Users & Teams</h2>
            <div className="flex items-center justify-between">
              <h3 className="text-lg text-gray-200">Team Members</h3>
              <button
                onClick={() => {
                  const email = prompt('Enter team member email:');
                  if (email && /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)) {
                    handleAddTeamMember(email);
                  } else {
                    toast.error('Invalid email format.');
                  }
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                aria-label="Add new team member"
              >
                Add Member
              </button>
            </div>
            <ul className="space-y-2">
              {teamMembers.map((member) => (
                <li key={member.id} className="flex items-center gap-2 text-gray-300">
                  <Users className="w-4 h-4" />
                  {member.email} - {member.role}
                </li>
              ))}
            </ul>
          </section>
        )}

        {activeSection === 'billing' && (
          <section className="bg-gray-800 p-6 rounded shadow">
            <h2 className="text-xl font-bold mb-4">Billing</h2>
            <p className="text-gray-300">Current Plan: Standard</p>
            <button
              onClick={() => toast.info('Billing details coming soon!')}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              aria-label="View billing details"
            >
              View Billing Details
            </button>
          </section>
        )}

        {activeSection === 'security' && (
          <section className="bg-gray-800 p-6 rounded shadow space-y-4">
            <h2 className="text-xl font-bold mb-4">Security</h2>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-200">Enable Two-Factor Authentication</span>
              <Switch
                checked={settings.twoFactorAuth}
                onChange={(value) => handleToggleSetting('twoFactorAuth', value)}
                className={`${settings.twoFactorAuth ? 'bg-blue-600' : 'bg-gray-600'} relative inline-flex h-6 w-11 items-center rounded-full transition`}
                aria-label="Toggle two-factor authentication"
              >
                <span className={`${settings.twoFactorAuth ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white`} />
              </Switch>
            </div>
            <div>
              <h3 className="text-lg text-gray-200 mb-2">API Key</h3>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={apiKey}
                  readOnly
                  className="w-full px-3 py-2 rounded bg-gray-700 text-gray-100 border border-gray-600"
                />
                <button
                  onClick={handleGenerateApiKey}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  aria-label="Generate new API key"
                >
                  <Key className="w-4 h-4" />
                </button>
              </div>
            </div>
          </section>
        )}

        {activeSection === 'systemActivity' && (
          <section className="bg-gray-800 p-6 rounded shadow">
            <h2 className="text-xl font-bold mb-4">System Activity</h2>
            <p className="text-gray-300">View logs of user actions and system events (coming soon).</p>
          </section>
        )}

        {activeSection === 'integrations' && (
          <section className="bg-gray-800 p-6 rounded shadow">
            <h2 className="text-xl font-bold mb-4">Integrations</h2>
            <p className="text-gray-300">Connect third-party apps (coming soon).</p>
          </section>
        )}

        {activeSection === 'dataManagement' && (
          <section className="bg-gray-800 p-6 rounded shadow">
            <h2 className="text-xl font-bold mb-4">Data Management</h2>
            <p className="text-gray-300">Export/import data, manage privacy (coming soon).</p>
          </section>
        )}

        {activeSection === 'objects' && (
          <section className="bg-gray-800 p-6 rounded shadow">
            <h2 className="text-xl font-bold mb-4">Manage CRM Objects</h2>
            <p className="text-gray-300">Customize object fields (coming soon).</p>
          </section>
        )}

        {activeSection === 'aiContent' && (
          <section className="bg-gray-800 p-6 rounded shadow">
            <h2 className="text-xl font-bold mb-4">AI-Generated Content</h2>
            <p className="text-gray-300">Generate email/note content (coming soon).</p>
          </section>
        )}

        {activeSection === 'scoring' && (
          <section className="bg-gray-800 p-6 rounded shadow">
            <h2 className="text-xl font-bold mb-4">Lead Scoring</h2>
            <p className="text-gray-300">Set up lead scoring rules (coming soon).</p>
          </section>
        )}

        {activeSection === 'picklists' && (
          <section className="bg-gray-800 p-6 rounded shadow">
            <h2 className="text-xl font-bold mb-4">Manage Picklists</h2>
            <p className="text-gray-300">Manage universal picklists (coming soon).</p>
          </section>
        )}

        {activeSection === 'impactGrowth' && (
          <section className="bg-gray-800 p-6 rounded shadow">
            <h2 className="text-xl font-bold mb-4">Impact & Growth</h2>
            <p className="text-gray-300">Track growth metrics (coming soon).</p>
          </section>
        )}
      </main>
    </div>
  );
};

export default Settings;