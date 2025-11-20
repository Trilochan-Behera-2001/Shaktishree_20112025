import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { getMonthWiseIncidentList } from "../../../services/DashboardCard";
import ScrollLoader from '../../../components/common/ScrollLoader';
import { throttle } from "../../../utils/throttle";
import '../../../components/common/ScrollEffects.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function IncidentReportChart() {

  const optionsList = ["2025", "2026"];

  const [selectedYear, setSelectedYear] = useState("2025");
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const lastFetchTime = useRef(0);
  const throttleDelay = 30000; 
  const chartRef = useRef(null);
  const previousYear = useRef(selectedYear);

  const months = useMemo(() => [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ], []);

  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: "top",
      },
      tooltip: {
        enabled: true,
        intersect: false,
        mode: "index",
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleFont: {
          size: 14,
          weight: "bold"
        },
        bodyFont: {
          size: 14
        },
        padding: 10,
        cornerRadius: 6,
        displayColors: false,
        callbacks: {
          label: function (context) {
            return `Incident: ${context.parsed.y}`;
          },
          title: function(tooltipItems) {
            return tooltipItems[0].label;
          }
        },
      },
    },
    scales: {
      x: {
        ticks: {
          autoSkip: false,
          maxRotation: 90,
          minRotation: 45,
        },
        title: {
          display: true,
          text: "Months",
        },
      },
      y: {
        beginAtZero: true,
        grace: "10%",
        title: {
          display: true,
          text: "Incident Count",
        },
      },
    },
    interaction: {
      mode: 'index',
      intersect: false,
    },
    hover: {
      mode: 'index',
      intersect: false,
    },
    elements: {
      point: {
        radius: 4,
        hoverRadius: 6,
        backgroundColor: "#007bff",
        borderColor: "#fff",
        borderWidth: 1,
        hoverBackgroundColor: "#F58FB8",
        hoverBorderColor: "#fff",
        hoverBorderWidth: 2,
      },
      line: {
        borderWidth: 3,
        borderColor: "#007bff",
        backgroundColor: "rgba(0, 123, 255, 0.3)",
        fill: true,
        tension: 0.4,
      }
    }
  }), []);

  const mapApiDataToChartFormat = useCallback((apiData) => {
    const monthlyData = apiData.monthlyIncidentCount || [];
    
    const dataValues = months.map(month => {
      const monthData = monthlyData.find(item => item.month === month);
      return monthData ? monthData.count : 0;
    });

    return {
      labels: months,
      datasets: [
        {
          label: "Incident",
          data: dataValues,
          borderColor: "#007bff",
          backgroundColor: "rgba(0, 123, 255, 0.62)",
          fill: true,
          tension: 0.4,
        },
      ],
    };
  }, [months]);

  const fetchData = useCallback(async () => {
    const now = Date.now();
    if (now - lastFetchTime.current < throttleDelay) {
      if (chartData && selectedYear === previousYear.current) return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await getMonthWiseIncidentList(selectedYear);
      const formattedData = mapApiDataToChartFormat(response.data);
      setChartData(formattedData);
      previousYear.current = selectedYear;
      lastFetchTime.current = now;
    } catch (err) {
      setError(err.message || "Failed to fetch incident report data");
      console.error("Error fetching incident report data:", err);
    } finally {
      setLoading(false);
    }
  }, [chartData, selectedYear, mapApiDataToChartFormat]);

  const handleScroll = useCallback(() => {
    if (!chartRef.current) return;
    
    const rect = chartRef.current.getBoundingClientRect();
    const windowHeight = window.innerHeight || document.documentElement.clientHeight;
    
    const isVisible = rect.top < windowHeight * 1.2 && rect.bottom >= -100;
    
    if (isVisible && !chartData && !loading) {
      fetchData();
    }
  }, [chartData, loading, fetchData]); 

  useEffect(() => {
    const throttledHandleScroll = throttle(handleScroll, 100);
    
    const scrollOptions = { passive: true };
    window.addEventListener('scroll', throttledHandleScroll, scrollOptions);
    window.addEventListener('resize', throttledHandleScroll, scrollOptions);
    window.addEventListener('touchmove', throttledHandleScroll, scrollOptions); 
    
    throttledHandleScroll();
    
    return () => {
      window.removeEventListener('scroll', throttledHandleScroll);
      window.removeEventListener('resize', throttledHandleScroll);
      window.removeEventListener('touchmove', throttledHandleScroll);
    };
  }, [handleScroll]);

  useEffect(() => {
    if (previousYear.current !== selectedYear) {
      fetchData();
    }
  }, [selectedYear, fetchData]);

  useEffect(() => {
    if (chartData && chartRef.current) {
      chartRef.current.classList.add('loaded');
    }
  }, [chartData]);

  const handleYearChange = (e) => {
    setSelectedYear(e.target.value);
  };

  return (
    <div className="p-4 scroll-effect-container chart-container-mobile" ref={chartRef}>
      <h2 className="text-blue-600 text-lg font-bold mb-2">
        Total Incident Report Month Wise
      </h2>

      <select
        className="border p-2 rounded mb-4"
        value={selectedYear}
        onChange={handleYearChange}
      >
        <option value="">--Select--</option>
        {optionsList.map((year) => (
          <option key={year} value={year}>
            {year}
          </option>
        ))}
      </select>

      {loading && <ScrollLoader loading={true} />}

      {error && (
        <div className="text-red-500 text-center py-4">
          Error: {error}
        </div>
      )}

      {chartData && !loading && !error && (
        <Line data={chartData} options={options} />
      )}

      {!chartData && !loading && !error && (
        <div className="text-center py-4 text-gray-500">
          <div className="mb-3 flex justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
          <p>Scroll down to load data or select a year</p>
        </div>
      )}
    </div>
  );
}