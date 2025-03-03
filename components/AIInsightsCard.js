import React from 'react';
import { Sparkles } from 'lucide-react';

export function AIInsightsCard({ metrics }) {
  // For now, we use static insights. In a production version, you would fetch these from an AI service API.
  const insights = [
    {
      title: 'Response Quality',
      score: 98,
      description: 'Based on user feedback and accuracy metrics',
      recommendation: 'Consider adding more domain-specific training data',
    },
    {
      title: 'User Satisfaction',
      score: 94,
      description: 'Derived from user ratings and interaction patterns',
      recommendation: 'Focus on reducing response time for complex queries',
    },
  ];

  const handleAction = (title) => {
    // Placeholder for actionable insight – e.g., schedule a call, send an email, etc.
    console.log(`Action taken for insight: ${title}`);
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-md">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="h-5 w-5 text-yellow-500" />
        <h3 className="font-semibold text-xl">AI Insights</h3>
      </div>
      <div className="space-y-6">
        {insights.map((insight, index) => (
          <div key={index} className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-medium text-white">{insight.title}</span>
              <span className="text-sm font-bold text-white">{insight.score}%</span>
            </div>
            <div className="h-2 bg-gray-700 rounded-md overflow-hidden">
              <div
                className="bg-yellow-500 h-full"
                style={{ width: `${insight.score}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-400">{insight.description}</p>
            <div className="text-sm bg-gray-700 p-2 rounded-md">
              <span className="font-medium">💡 Recommendation:</span> {insight.recommendation}
            </div>
            <button
              onClick={() => handleAction(insight.title)}
              className="mt-2 px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 text-sm"
            >
              Act on Insight
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AIInsightsCard;