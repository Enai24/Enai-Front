// src/components/CoachingInsightsDisplay.js
import React from 'react';

const CoachingInsightsDisplay = ({ insights }) => {
  if (!insights || insights.error) {
    return <p className="text-danger">{insights ? insights.error : 'No coaching insights available.'}</p>;
  }

  return (
    <div>
      <h3>Sales Coaching Insights</h3>
      {insights.coaching_points && insights.coaching_points.length > 0 ? (
        <ul>
          {insights.coaching_points.map((point, index) => (
            <li key={index}>{point}</li>
          ))}
        </ul>
      ) : (
        <p>No specific coaching points identified by AI for this call.</p>
      )}
      {insights.sentiment && (
        <div>
          <h4>Sentiment Summary</h4>
          <p>
            Overall Sentiment: <strong>{insights.sentiment.overall}</strong> (Score: {insights.sentiment.score})
          </p>
        </div>
      )}
      {insights.objections && insights.objections.length > 0 && (
        <div>
          <h4>Objection Summary</h4>
          <ul>
            {insights.objections.map((objection, index) => (
              <li key={index}>
                <strong>Type:</strong> {objection.type}, <strong>Objection:</strong> {objection.objection}
              </li>
            ))}
          </ul>
        </div>
      )}
      {insights.summary_points && insights.summary_points.length > 0 && (
        <div>
          <h4>Key Discussion Points</h4>
          <ul>
            {insights.summary_points.map((point, index) => (
              <li key={index}>{point}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default CoachingInsightsDisplay;