// src/pages/Home.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import ChartComponent from '../components/ChartComponent';
import MetricsCards from '../components/MetricsCards';
import { RecentActivity } from '../components/RecentActivity';
import { AIInsightsCard } from '../components/AIInsightsCard';
import { fetchDashboardMetrics } from '../services/api';

const Home = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch dashboard metrics with retry logic
  const fetchWithRetry = useCallback(async (retries = 3) => {
    for (let i = 0; i < retries; i++) {
      try {
        const data = await fetchDashboardMetrics();
        return data;
      } catch (err) {
        if (i === retries - 1) throw err;
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
  }, []);

  useEffect(() => {
    const getMetrics = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchWithRetry();
        setDashboardData(data);
      } catch (err) {
        const errMsg = err.message || 'Failed to load dashboard data.';
        setError(errMsg);
        toast.error('Couldn’t load dashboard metrics');
      } finally {
        setLoading(false);
      }
    };
    getMetrics();
  }, [fetchWithRetry]);

  if (loading) {
    return (
      <div className="text-center mt-10 text-gray-200 animate-pulse">
        Loading dashboard data...
      </div>
    );
  }
  if (error) {
    return (
      <div className="text-center mt-10 text-red-500">
        Error: {error} <button onClick={() => window.location.reload()} className="ml-2 text-blue-500 underline" aria-label="Retry loading">Retry</button>
      </div>
    );
  }
  if (!dashboardData) {
    return (
      <div className="text-center mt-10 text-gray-200">
        No dashboard data available.
      </div>
    );
  }

  // Destructure backend data
  const {
    total_closed_business_value,
    total_pipeline_deals,
    total_calls_completed,
    average_lead_score,
    high_priority_leads,
    potential_revenue_pipeline,
    predicted_revenue_monte_carlo,
    revenue_forecast_confidence_interval,
    lead_source_breakdown_json,
    lead_scoring_distribution_json,
    email_campaign_performance_json = JSON.stringify({ labels: [], datasets: [] }), // Fallback if missing
    pipeline_trend_chart_json,
    upcoming_meetings,
    recent_activities,
    deal_predictions,
  } = dashboardData;

  // Parse chart data with fallbacks
  const leadSourceData = JSON.parse(lead_source_breakdown_json || '{"labels":[],"datasets":[]}');
  const leadScoringData = JSON.parse(lead_scoring_distribution_json || '{"labels":[],"datasets":[]}');
  const emailCampaignData = JSON.parse(email_campaign_performance_json || '{"labels":[],"datasets":[]}');
  const pipelineTrendData = JSON.parse(pipeline_trend_chart_json || '{"labels":[],"datasets":[]}');

  // Chart options
  const commonOptions = {
    responsive: true,
    plugins: {
      legend: { labels: { color: '#fff' }, position: 'top' },
      tooltip: { backgroundColor: '#2d3748', titleColor: '#fff', bodyColor: '#fff' },
      zoom: { zoom: { wheel: { enabled: true }, pinch: { enabled: true }, mode: 'x' } },
    },
    scales: { x: { ticks: { color: '#fff' }, grid: { color: '#4a5568' } }, y: { ticks: { color: '#fff' }, grid: { color: '#4a5568' } } },
    animation: { duration: 1000 },
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white p-6 overflow-hidden">
      {/* Background Accent */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-purple-800 to-blue-800 opacity-20 mix-blend-overlay animate-pulse-slow" />

      <div className="relative space-y-6">
        <h2
          id="dashboard"
          className="text-3xl font-bold tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400 drop-shadow-lg"
        >
          Dashboard
        </h2>

        {/* Metrics Cards */}
        <MetricsCards
          metrics={{
            totalClosedBusinessValue: total_closed_business_value,
            totalPipelineDeals: total_pipeline_deals,
            totalCallsCompleted: total_calls_completed,
            averageLeadScore: average_lead_score,
            highPriorityLeads: high_priority_leads,
            potentialRevenuePipeline: potential_revenue_pipeline,
            predictedRevenue: predicted_revenue_monte_carlo,
            revenueForecastCI: revenue_forecast_confidence_interval,
            dealPredictions: deal_predictions, 
          }}
        />

        {/* AI Insights Card */}
        <div id="insights" aria-label="AI Insights">
          <AIInsightsCard metrics={dashboardData} />
        </div>

        {/* Upcoming Meetings & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div id="meetings" className="bg-gray-800/80 p-6 rounded-lg shadow-md border border-gray-700">
            <h5 className="font-semibold text-xl mb-4 text-gray-100">Upcoming Meetings</h5>
            <ul className="space-y-2">
              {(upcoming_meetings || []).map((meeting, index) => (
                <li
                  key={index}
                  className="flex justify-between items-center bg-gray-700/40 p-3 rounded-md transition hover:bg-gray-700/60"
                  aria-label={`Meeting: ${meeting.description} at ${meeting.time}`}
                >
                  <span className="font-semibold text-gray-200">{meeting.time}</span>
                  <span className="text-sm text-gray-400">{meeting.description}</span>
                </li>
              ))}
            </ul>
          </div>
          <div id="activity" className="bg-gray-800/80 p-6 rounded-lg shadow-md border border-gray-700">
            <h5 className="font-semibold text-xl mb-4 text-gray-100">Recent Activity</h5>
            <RecentActivity activities={recent_activities || []} />
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gray-800/80 p-6 rounded-lg shadow-md border border-gray-700">
            <h5 className="font-semibold text-xl mb-4 text-gray-100">Lead Source Breakdown</h5>
            <div className="h-72">
              <ChartComponent
                id="leadSourceChart"
                type="pie"
                data={leadSourceData}
                options={{ ...commonOptions, plugins: { ...commonOptions.plugins, title: { display: false } } }}
              />
            </div>
          </div>
          <div className="bg-gray-800/80 p-6 rounded-lg shadow-md border border-gray-700">
            <h5 className="font-semibold text-xl mb-4 text-gray-100">Lead Scoring Distribution</h5>
            <div className="h-72">
              <ChartComponent
                id="leadScorePieChart"
                type="bar"
                data={leadScoringData}
                options={{ ...commonOptions, plugins: { ...commonOptions.plugins, title: { display: false } } }}
              />
            </div>
          </div>
          <div className="bg-gray-800/80 p-6 rounded-lg shadow-md border border-gray-700">
            <h5 className="font-semibold text-xl mb-4 text-gray-100">Email Campaign Performance</h5>
            <div className="h-72">
              <ChartComponent
                id="emailCampaignChart"
                type="line"
                data={emailCampaignData}
                options={{ ...commonOptions, plugins: { ...commonOptions.plugins, title: { display: false } } }}
              />
            </div>
          </div>
          <div className="bg-gray-800/80 p-6 rounded-lg shadow-md border border-gray-700">
            <h5 className="font-semibold text-xl mb-4 text-gray-100">Deal Pipeline Trend (Last 6 Months)</h5>
            <div className="h-72">
              <ChartComponent
                id="pipelineTrendChart"
                type="line"
                data={pipelineTrendData}
                options={{ ...commonOptions, plugins: { ...commonOptions.plugins, title: { display: false } } }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;