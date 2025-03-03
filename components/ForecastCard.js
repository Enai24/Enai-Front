// src/components/ForecastCard.jsx
import React, { useEffect, useState } from 'react';
import { fetchForecast } from '../services/api';
import { toast } from 'react-toastify';

const ForecastCard = () => {
  const [forecast, setForecast] = useState(null);

  useEffect(() => {
    const getForecast = async () => {
      try {
        const data = await fetchForecast();
        setForecast(data);
      } catch (error) {
        toast.error("Failed to load forecast data.");
      }
    };
    getForecast();
  }, []);

  if (!forecast) return <div>Loading forecast...</div>;

  return (
    <div className="bg-gray-800 p-4 rounded shadow">
      <h3 className="text-xl font-bold">Deal Closure Forecast</h3>
      <p>Total Leads: {forecast.total_leads}</p>
      <p>Closed Leads: {forecast.closed_leads}</p>
      <p>Closure Rate: {forecast.closure_rate.toFixed(2)}%</p>
      <p>Forecast Revenue: ${forecast.forecast_revenue}</p>
    </div>
  );
};

export default ForecastCard;