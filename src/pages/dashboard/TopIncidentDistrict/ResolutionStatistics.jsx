import React from "react";
import { Chart as ChartJS, Tooltip, Legend, LinearScale, CategoryScale } from "chart.js";
import { MatrixController, MatrixElement } from "chartjs-chart-matrix";
import { Chart } from "react-chartjs-2";

ChartJS.register(MatrixController, MatrixElement, Tooltip, Legend, LinearScale, CategoryScale);

const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const rdes = ['RDE Cuttack', 'RDE Jeypore', 'RDE Berhampur', 'RDE Balasore', 'RDE Sambalpur', 'RDE Bhubaneswar'];

const generateData = () => {
  const data = [];
  rdes.forEach((rde, rowIndex) => {
    months.forEach((month, colIndex) => {
      const value = Math.floor(Math.random() * 91); 
      data.push({ x: colIndex, y: rowIndex, v: value });
    });
  });
  return data;
};

export default function ResolutionStatistics() {
  const data = {
    datasets: [{
      label: 'Incident Resolution Statistics',
      data: generateData(),
      backgroundColor: ctx => {
        const v = ctx.dataset.data[ctx.dataIndex].v;
        if (v <= 30) return 'rgba(179, 229, 252, 0.85)'; 
        if (v <= 60) return 'rgba(41, 182, 246, 0.85)'; 
        return 'rgba(1, 87, 155, 0.85)'; 
      },
      borderColor: ctx => {
        const v = ctx.dataset.data[ctx.dataIndex].v;
        if (v <= 30) return 'rgb(179, 229, 252)';
        if (v <= 60) return 'rgb(41, 182, 246)';
        return 'rgb(1, 87, 155)';
      },
      borderWidth: 1,
      width: ({ chart }) => (chart.chartArea?.width || 0) / months.length - 4,
      height: ({ chart }) => (chart.chartArea?.height || 0) / rdes.length - 4
    }]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        type: 'linear',
        min: 0,
        max: months.length - 1,
        ticks: {
          stepSize: 1,
          callback: val => months[val] || ''
        },
        grid: { display: false }
      },
      y: {
        type: 'linear',
        min: 0,
        max: rdes.length - 1,
        ticks: {
          stepSize: 1,
          callback: val => rdes[val] || ''
        },
        grid: { display: false }
      }
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: ctx => {
            const d = ctx.dataset.data[ctx.dataIndex];
            return `${rdes[d.y]} - ${months[d.x]}: ${d.v}`;
          }
        }
      },
      legend: { display: false }
    }
  };

  return (
    
      <Chart type="matrix" data={data} options={options} />
  
  );
}
