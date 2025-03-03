import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Outlet } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import Leads from './pages/Leads';
import AddLead from './pages/AddLead';
import EditLead from './pages/EditLead';
import LeadDetails from './pages/LeadDetails';
import UploadLeads from './pages/UploadLeads';
import Deals from './pages/Deals';
import AddDeal from './pages/AddDeal';
import EditDeal from './pages/EditDeal';
import ViewDeal from './pages/ViewDeal';
import ImportDeals from './pages/ImportDeals';
import Emails from './pages/Emails';
import AddEmail from './pages/AddEmail';
import EditEmail from './pages/EditEmail';
import ViewEmail from './pages/ViewEmail';
import Calls from './pages/Calls';
import AddCall from './pages/AddCall';
import ViewCall from './pages/ViewCall';
import Campaigns from './pages/Campaigns';
import AddCampaign from './pages/AddCampaign';
import EditCampaign from './pages/EditCampaign';
import ViewCampaign from './pages/ViewCampaign';
import ICPs from './pages/ICPs';
import AddICP from './pages/AddICP';
import EditICP from './pages/EditICP';
import ViewICP from './pages/ViewICP';
import Reports from './pages/Reports';
import AddReport from './pages/AddReport';
import EditReport from './pages/EditReport';
import ViewReport from './pages/ViewReport';
import DiscoverDomain from './pages/DiscoverDomain';
import SearchResults from './pages/SearchResults';
import Settings from './pages/Settings';
import Automation from './pages/Automation';
import WorkflowBuilder from './components/WorkflowBuilder';
import Login from './pages/Login';
import Register from './pages/Register';
import GmailCallback from './pages/GmailCallback';
import PrivateRoute from './components/PrivateRoute';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Inbox from './pages/Inbox';
import WorkflowPage from './pages/WorkflowPage';
import ChatPage from './pages/ChatPage';
import KnowledgeBase from './pages/KnowledgeBase';

const Layout = ({ isSidebarExpanded, toggleSidebar }) => (
  <div className="flex bg-gray-100 min-h-screen">
    <Sidebar isExpanded={isSidebarExpanded} toggleSidebar={toggleSidebar} />
    <div
      className={`flex-1 transition-all duration-300 ${
        isSidebarExpanded ? 'ml-60' : 'ml-20'
      }`}
    >
      <Navbar />
      <main className="p-4 bg-gray-50 dark:bg-gray-900 min-h-screen">
        <Outlet />
      </main>
    </div>
  </div>
);

const App = () => {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarExpanded((prev) => !prev);
  };

  return (
    <Router>
      <ToastContainer position="top-right" autoClose={3000} />
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/oauth/callback" element={<GmailCallback />} />

        {/* Protected Routes */}
        <Route element={<PrivateRoute />}>
          <Route
            element={<Layout isSidebarExpanded={isSidebarExpanded} toggleSidebar={toggleSidebar} />}
          >
            <Route path="/" element={<Home />} />
            <Route path="/leads" element={<Leads />} />
            <Route path="/leads/add" element={<AddLead />} />
            <Route path="/leads/:leadId/edit" element={<EditLead />} />
            <Route path="/leads/:leadId" element={<LeadDetails />} />
            <Route path="/leads/upload" element={<UploadLeads />} />
            <Route path="/dashboard/deals" element={<Deals />} />
            <Route path="/dashboard/deals/add" element={<AddDeal />} />
            <Route path="/dashboard/deals/edit/:dealId" element={<EditDeal />} />
            <Route path="/dashboard/deals/view/:dealId" element={<ViewDeal />} />
            <Route path="/dashboard/deals/import" element={<ImportDeals />} />
            <Route path="/dashboard/emails" element={<Emails />} />
            <Route path="/dashboard/emails/add" element={<AddEmail />} />
            <Route path="/dashboard/emails/:emailId/edit" element={<EditEmail />} />
            <Route path="/dashboard/emails/:emailId" element={<ViewEmail />} />
            <Route path="/dashboard/calls" element={<Calls />} />
            <Route path="/dashboard/calls/add" element={<AddCall />} />
            <Route path="/dashboard/calls/:callId" element={<ViewCall />} />
            <Route path="/dashboard/campaigns" element={<Campaigns />} />
            <Route path="/dashboard/campaigns/add" element={<AddCampaign />} />
            <Route path="/dashboard/campaigns/:campaignId/edit" element={<EditCampaign />} />
            <Route path="/dashboard/campaigns/:campaignId" element={<ViewCampaign />} />
            <Route path="/dashboard/icps" element={<ICPs />} />
            <Route path="/dashboard/icps/add" element={<AddICP />} />
            <Route path="/dashboard/icps/:icpId/edit" element={<EditICP />} />
            <Route path="/dashboard/icps/:icpId" element={<ViewICP />} />
            <Route path="/dashboard/reports" element={<Reports />} />
            <Route path="/dashboard/reports/add" element={<AddReport />} />
            <Route path="/dashboard/reports/:reportId/edit" element={<EditReport />} />
            <Route path="/dashboard/reports/:reportId" element={<ViewReport />} />
            <Route path="/dashboard/discover-domain" element={<DiscoverDomain />} />
            <Route path="/dashboard/search-results/:id/:unique_token?" element={<SearchResults />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/automation" element={<Automation />} />
            <Route path="/workflow-builder" element={<WorkflowBuilder />} />
            <Route path="/inbox" element={<Inbox />} />
            <Route path="/workflowpage" element={<WorkflowPage />} />
            <Route path="/chatpage" element={<ChatPage />} />
            <Route path="/dashboard/knowledge" element={<KnowledgeBase />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
};

export default App;