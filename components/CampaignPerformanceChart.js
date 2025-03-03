// src/components/CampaignPerformanceChart.jsx
import React, { useEffect, useRef, useMemo } from 'react';
import Chart from 'chart.js/auto';

const CampaignPerformanceChart = ({ performanceData }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  const chartData = useMemo(() => ({
    labels: performanceData.map(day => day.date),
    datasets: [
      { label: 'Emails Sent', data: performanceData.map(day => day.emails), borderColor: 'rgb(75, 192, 192)', tension: 0.1 },
      { label: 'Opens', data: performanceData.map(day => day.opens), borderColor: 'rgb(54, 162, 235)', tension: 0.1 },
      { label: 'Responses', data: performanceData.map(day => day.responses), borderColor: 'rgb(255, 205, 86)', tension: 0.1 },
    ],
  }), [performanceData]);

  useEffect(() => {
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }
    const ctx = chartRef.current.getContext('2d');
    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: chartData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: { y: { beginAtZero: true, ticks: { color: '#fff' } }, x: { ticks: { color: '#fff' } } },
        plugins: { legend: { labels: { color: '#fff' } }, tooltip: { backgroundColor: '#2d3748', titleColor: '#fff', bodyColor: '#fff' } },
      },
    });
    return () => {
      if (chartInstance.current) chartInstance.current.destroy();
    };
  }, [chartData]);

  return <canvas ref={chartRef} role="img" aria-label="Campaign performance chart showing emails sent, opens, and responses over time"></canvas>;
};

export default React.memo(CampaignPerformanceChart);