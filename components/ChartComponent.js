import React from 'react';
import { Chart, registerables } from 'chart.js';
import zoomPlugin from 'chartjs-plugin-zoom';
import { Pie, Bar, Line } from 'react-chartjs-2';

Chart.register(...registerables, zoomPlugin);

const ChartComponent = ({ id, type, data, options }) => {
  const chartData = {
    labels: data?.labels || [],
    datasets: data?.datasets || [],
  };

  const renderChart = () => {
    switch (type) {
      case 'pie':
        return <Pie data={chartData} options={options} />;
      case 'bar':
        return <Bar data={chartData} options={options} />;
      case 'line':
        return <Line data={chartData} options={options} />;
      default:
        return null;
    }
  };

  return <div id={id} className="h-full">{renderChart()}</div>;
};

export default ChartComponent;