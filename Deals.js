import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  Users,
  TrendingUp,
  Calendar,
  BarChart3,
  Download,
  Search,
  Plus,
  MoreHorizontal,
  Clock,
  Eye,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AddDealModal from '../components/AddDealModal';
import { fetchDashboard } from '../services/api';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

// Helper function to format currency
function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

// Helper function to reorder a list within the same droppable.
const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
};

export default function DealsPage() {
  const [dashboardData, setDashboardData] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState('all');
  const [sortBy, setSortBy] = useState('value');
  const [showAddModal, setShowAddModal] = useState(false);
  const navigate = useNavigate();

  // Load real dashboard data from the backend on mount
  useEffect(() => {
    async function loadDashboard() {
      try {
        const data = await fetchDashboard();
        setDashboardData(data);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    }
    loadDashboard();
  }, []);

  // Handler for adding a new deal via the modal
  const handleAddDeal = (newDeal) => {
    const updatedStages = (dashboardData?.pipeline?.stages || []).map((stage) => {
      if (stage.name === newDeal.stage) {
        return {
          ...stage,
          deals: [...(stage.deals || []), newDeal],
          totalValue: (stage.totalValue || 0) + parseInt(newDeal.value, 10),
        };
      }
      return stage;
    });
    setDashboardData({
      ...dashboardData,
      pipeline: { stages: updatedStages },
    });
    setShowAddModal(false);
  };

  // Filter pipeline stages by search term (filtering by company name)
  const filteredStages = (dashboardData?.pipeline?.stages || []).map((stage) => ({
    ...stage,
    deals: (stage.deals || []).filter((deal) =>
      deal.company.toLowerCase().includes(searchTerm.toLowerCase())
    ),
  }));

  // Handler for drag and drop events
  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const sourceId = result.source.droppableId;
    const destId = result.destination.droppableId;
    const sourceIndex = result.source.index;
    const destIndex = result.destination.index;

    // Clone stages array from dashboardData
    const newStages = Array.from(dashboardData.pipeline.stages);
    const sourceStageIndex = newStages.findIndex(stage => stage.name === sourceId);
    const destStageIndex = newStages.findIndex(stage => stage.name === destId);
    if (sourceStageIndex === -1 || destStageIndex === -1) return;

    const sourceStage = newStages[sourceStageIndex];
    const destStage = newStages[destStageIndex];

    const sourceDeals = Array.from(sourceStage.deals || []);
    const [movedDeal] = sourceDeals.splice(sourceIndex, 1);
    // Update the deal's stage property to the destination stage name
    movedDeal.stage = destId;

    if (sourceId === destId) {
      // Reorder within the same stage
      const reordered = reorder(sourceDeals, sourceIndex, destIndex);
      newStages[sourceStageIndex].deals = reordered;
    } else {
      // Remove from source stage and add to destination stage
      const destDeals = Array.from(destStage.deals || []);
      destDeals.splice(destIndex, 0, movedDeal);
      newStages[sourceStageIndex].deals = sourceDeals;
      newStages[destStageIndex].deals = destDeals;
    }

    // Recalculate totalValue for each stage based on the deals within
    newStages.forEach(stage => {
      stage.totalValue = (stage.deals || []).reduce((sum, deal) => sum + parseInt(deal.value, 10), 0);
    });

    setDashboardData({
      ...dashboardData,
      pipeline: { stages: newStages },
    });
  };

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-100 flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <main className="pt-16 px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold">Deals</h1>
            <p className="text-gray-400 mt-1">Track and manage your sales pipeline</p>
          </div>
          <div className="flex gap-3 mt-4 sm:mt-0">
            <button className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-300 hover:bg-gray-700 flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-indigo-600 rounded-lg text-white hover:bg-indigo-700 flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Deal
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Pipeline Value */}
          <div className="bg-gray-800 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Pipeline Value</p>
                <p className="text-2xl font-semibold mt-1">
                  {formatCurrency(dashboardData.stats?.totalValue || 0)}
                </p>
              </div>
              <div className="h-12 w-12 bg-indigo-900 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-indigo-400" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-sm text-green-400">
                {dashboardData.stats?.valueChange >= 0 ? '+' : ''}
                {dashboardData.stats?.valueChange || 0}%
              </span>
              <span className="text-sm text-gray-400 ml-1">vs last month</span>
            </div>
          </div>

          {/* Average Deal Size */}
          <div className="bg-gray-800 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Avg Deal Size</p>
                <p className="text-2xl font-semibold mt-1">
                  {formatCurrency(dashboardData.stats?.avgDealSize || 0)}
                </p>
              </div>
              <div className="h-12 w-12 bg-green-900 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-400" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-sm text-green-400">
                {dashboardData.stats?.dealSizeChange >= 0 ? '+' : ''}
                {dashboardData.stats?.dealSizeChange || 0}%
              </span>
              <span className="text-sm text-gray-400 ml-1">vs last month</span>
            </div>
          </div>

          {/* Win Rate */}
          <div className="bg-gray-800 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Win Rate</p>
                <p className="text-2xl font-semibold mt-1">
                  {dashboardData.stats?.winRate || 0}%
                </p>
              </div>
              <div className="h-12 w-12 bg-blue-900 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-blue-400" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-sm text-green-400">
                {dashboardData.stats?.winRateChange >= 0 ? '+' : ''}
                {dashboardData.stats?.winRateChange || 0}%
              </span>
              <span className="text-sm text-gray-400 ml-1">vs last month</span>
            </div>
          </div>

          {/* Sales Cycle */}
          <div className="bg-gray-800 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Sales Cycle</p>
                <p className="text-2xl font-semibold mt-1">
                  {dashboardData.stats?.salesCycle || 0} days
                </p>
              </div>
              <div className="h-12 w-12 bg-purple-900 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-purple-400" />
              </div>
            </div>
            <div className="mt-4">
              <span
                className={`text-sm ${
                  dashboardData.stats?.salesCycleChange <= 0 ? 'text-green-400' : 'text-red-400'
                }`}
              >
                {dashboardData.stats?.salesCycleChange <= 0 ? '' : '+'}
                {dashboardData.stats?.salesCycleChange || 0}%
              </span>
              <span className="text-sm text-gray-400 ml-1">vs last month</span>
            </div>
          </div>
        </div>

        {/* Forecast Section */}
        <div className="bg-gray-800 rounded-xl shadow-sm mb-8 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-100">Forecast</h2>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Clock className="h-4 w-4" />
              {dashboardData.forecastData?.timeRemaining || ''}
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-300">
                Committed ({formatCurrency(dashboardData.forecastData?.committed || 0)})
              </span>
              <span className="text-sm text-gray-400">15% of quota</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full" style={{ width: '15%' }} />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-300">
                Best Case ({formatCurrency(dashboardData.forecastData?.bestCase || 0)})
              </span>
              <span className="text-sm text-gray-400">25% of quota</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '25%' }} />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-300">
                Pipeline ({formatCurrency(dashboardData.forecastData?.pipeline || 0)})
              </span>
              <span className="text-sm text-gray-400">75% of quota</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div className="bg-blue-500 h-2 rounded-full" style={{ width: '75%' }} />
            </div>
          </div>
        </div>

        {/* Pipeline Section with Drag & Drop */}
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="bg-gray-800 rounded-xl shadow-sm mb-8">
            <div className="p-4 border-b border-gray-700">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search deals..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-900 text-gray-100"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex gap-4">
                  <select
                    className="px-4 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-900 text-gray-100"
                    value={stageFilter}
                    onChange={(e) => setStageFilter(e.target.value)}
                  >
                    <option value="all">All Stages</option>
                    {(dashboardData?.pipeline?.stages || []).map((stage) => (
                      <option key={stage.name} value={stage.name}>
                        {stage.name}
                      </option>
                    ))}
                  </select>
                  <select
                    className="px-4 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-900 text-gray-100"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="value">Sort by Value</option>
                    <option value="probability">Sort by Probability</option>
                    <option value="dueDate">Sort by Due Date</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                {filteredStages.map((stage) => (
                  <Droppable droppableId={stage.name} key={stage.name}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className="bg-gray-700 rounded-lg p-4"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-sm font-medium text-gray-100">{stage.name}</h3>
                          <span className="text-sm text-gray-400">
                            {formatCurrency(stage.totalValue || 0)}
                          </span>
                        </div>
                        <div className="space-y-3">
                          {stage.deals.map((deal, index) => (
                            <Draggable draggableId={deal.id} index={index} key={deal.id}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className="bg-gray-800 rounded-lg p-4 border border-gray-600 hover:border-indigo-500 transition-colors cursor-pointer"
                                >
                                  <div className="flex items-center justify-between mb-2">
                                    <h4 className="font-medium text-gray-100">{deal.company}</h4>
                                    <div className="flex items-center gap-2">
                                      <button
                                        onClick={() => navigate(`/dashboard/deals/view/${deal.id}`)}
                                        className="text-blue-400 hover:text-blue-300"
                                        title="View Deal"
                                      >
                                        <Eye className="h-4 w-4" />
                                      </button>
                                      <button
                                        onClick={() => navigate(`/dashboard/deals/edit/${deal.id}`)}
                                        className="text-gray-400 hover:text-gray-200"
                                        title="Edit Deal"
                                      >
                                        <MoreHorizontal className="h-4 w-4" />
                                      </button>
                                    </div>
                                  </div>
                                  <p className="text-lg font-semibold text-gray-100 mb-2">
                                    {formatCurrency(deal.value)}
                                  </p>
                                  <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-sm text-gray-400">
                                      <Users className="h-4 w-4" />
                                      {deal.contact}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-400">
                                      <Calendar className="h-4 w-4" />
                                      Due {new Date(deal.dueDate).toLocaleDateString()}
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <div className="flex-1">
                                        <div className="w-full bg-gray-600 rounded-full h-1.5">
                                          <div
                                            className="bg-indigo-600 h-1.5 rounded-full"
                                            style={{ width: `${deal.probability}%` }}
                                          />
                                        </div>
                                      </div>
                                      <span className="text-sm text-gray-400">
                                        {deal.probability}%
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      </div>
                    )}
                  </Droppable>
                ))}
              </div>
            </div>
          </div>
        </DragDropContext>

        {/* Recent Activity */}
        <div className="bg-gray-800 rounded-xl shadow-sm">
          <div className="p-6 border-b border-gray-700">
            <h2 className="text-lg font-semibold text-gray-100">Recent Activity</h2>
          </div>
          <div className="p-6">
            <div className="space-y-6">
              {dashboardData.recentActivities?.map((activity) => (
                <div key={activity.id} className="flex items-start gap-4">
                  <div className="h-8 w-8 rounded-full bg-indigo-900 flex items-center justify-center">
                    {activity.type === 'deal_stage_change' ? (
                      <TrendingUp className="h-4 w-4 text-indigo-400" />
                    ) : activity.type === 'new_deal' ? (
                      <Plus className="h-4 w-4 text-indigo-400" />
                    ) : (
                      <DollarSign className="h-4 w-4 text-indigo-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-100">{activity.description}</p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                      <span className="font-medium">
                        {formatCurrency(activity.value)}
                      </span>
                      <span>•</span>
                      <span>{new Date(activity.timestamp).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <AddDealModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddDeal}
      />
    </div>
  );
}