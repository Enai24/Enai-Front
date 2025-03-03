import React from 'react';
import { Tooltip } from 'react-tooltip';
import {
  CurrencyDollarIcon,
  ChartBarIcon,
  UserGroupIcon,
  ClipboardDocumentListIcon,
} from '@heroicons/react/24/outline';

const MetricsCards = ({ metrics }) => {
  const {
    totalClosedBusinessValue,
    totalPipelineDeals,
    totalCallsCompleted,
    averageLeadScore,
    highPriorityLeads,
    potentialRevenuePipeline,
    predictedRevenue,
    revenueForecastCI,
  } = metrics;

  const cards = [
    {
      name: 'Total Closed Business',
      value: `$${totalClosedBusinessValue}`,
      icon: CurrencyDollarIcon,
      color: 'bg-indigo-600',
      tooltip: 'Total value of closed business deals',
    },
    {
      name: 'Average Lead Score',
      value: averageLeadScore ? averageLeadScore.toFixed(2) : 'N/A',
      icon: ChartBarIcon,
      color: 'bg-green-600',
      tooltip: 'Average quality score of leads',
    },
    {
      name: 'Qualified Leads',
      value: highPriorityLeads,
      icon: UserGroupIcon,
      color: 'bg-yellow-600',
      tooltip: 'Number of high priority leads',
    },
    {
      name: 'Predicted Revenue',
      value: `$${predictedRevenue}`,
      icon: ClipboardDocumentListIcon,
      color: 'bg-blue-600',
      tooltip: 'Predicted revenue based on current pipeline',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card) => (
        <div
          key={card.name}
          data-tip={card.tooltip}
          className={`flex items-center p-6 rounded-lg shadow-lg ${card.color} text-white hover:shadow-2xl transition-shadow duration-300`}
        >
          <card.icon className="h-12 w-12 mr-4" aria-hidden="true" />
          <div>
            <p className="text-sm font-medium">{card.name}</p>
            <p className="text-2xl font-semibold">{card.value}</p>
          </div>
        </div>
      ))}
      <Tooltip place="top" type="dark" effect="solid" />
    </div>
  );
};

export default MetricsCards;