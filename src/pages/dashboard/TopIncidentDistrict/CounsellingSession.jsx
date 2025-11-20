import React from "react";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function CounsellingSession() {
  const data = {
    labels: [
      "RDE Bhubaneswar",
      "RDE Sambalpur",
      "RDE Balasore",
      "RDE Berhampur",
      "RDE Jeypore",
    ],
    datasets: [
      {
        data: [24.9, 31.1, 7.3, 24.3, 12.4],
        backgroundColor: [
          "#0096FF",
          "#10E7B1",
          "#F6B100",
          "#FF5575",
          "#8C6FF9",
        ],
        borderWidth: 0,
      },
    ],
  };

  const options = {
    plugins: {
      legend: {
        position: "right",
        labels: {
          boxWidth: 15,
          padding: 15,
          usePointStyle: true,
          pointStyle: 'circle',
          font: {
            size: 12,
            family: "'Inter', sans-serif"
          }
        },
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#1f2937',
        bodyColor: '#1f2937',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        cornerRadius: 8,
        callbacks: {
          label: (context) => `${context.label}: ${context.parsed}%`,
        },
      },
    },
    maintainAspectRatio: false,
  };

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  return ( 
    <>
    
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        
              <h2 className="text-blue-600 text-lg font-bold mb-2">
               Counselling Session
               </h2>
            
        
              <select
                className="border p-2 rounded mb-4"
              >
                <option value="">Select Month</option>
                {months.map((month, index) => (
                  <option key={index} value={month}>
                    {month}
                  </option>
                ))}
              </select>
           
            </div>
            
            
      

        {/* Chart Container */}
        <div className="h-70">
          <Pie data={data} options={options} />
        </div>

    </>
  );
}