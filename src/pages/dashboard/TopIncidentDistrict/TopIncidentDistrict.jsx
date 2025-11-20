import  { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { getTopFiveIncident } from '../../../services/DashboardCard';
import ScrollLoader from '../../../components/common/ScrollLoader';
import { throttle } from '../../../utils/throttle';
import '../../../components/common/ScrollEffects.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const TopIncidentDistrictsBarChart = () => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(false); 
  const [error, setError] = useState(null);
  const lastFetchTime = useRef(0);
  const throttleDelay = 30000;
  const chartRef = useRef(null);

  const backgroundColors = useMemo(() => [
    'rgba(37, 125, 194, 0.85)',
    'rgba(0, 227, 150, 0.85)',
    'rgba(254, 176, 25, 0.85)',
    'rgba(255, 69, 96, 0.85)',
    'rgba(119, 93, 208, 0.85)',
  ], []);

  const borderColors = useMemo(() => [
    'rgba(37, 125, 194, 1)',
    'rgba(0, 227, 150, 1)',
    'rgba(254, 176, 25, 1)',
    'rgba(255, 69, 96, 1)',
    'rgba(119, 93, 208, 1)',
  ], []);

  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Top 5 Incident Districts',
        font: {
          size: 20,
          weight: 'bold',
        },
        color: '#2c3e50',
        padding: {
          top: 10,
          bottom: 30,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(248, 249, 250, 0.98)',
        titleColor: '#495057',
        bodyColor: '#6c757d',
        borderColor: 'rgba(0, 0, 0, 0.08)',
        borderWidth: 1,
        titleFont: {
          size: 13,
          weight: 'bold',
        },
        bodyFont: {
          size: 12,
          weight: '600',
        },
        padding: 10,
        cornerRadius: 6,
        displayColors: true,
        callbacks: {
          label: function(context) {
            return `Incidents: ${context.parsed.y}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 12,
            weight: 'bold',
          },
          color: '#2c3e50',
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          font: {
            size: 11,
            weight: 'bold',
          },
          color: '#2c3e50',
          stepSize: 20,
        },
        title: {
          display: true,
          text: 'Number of Incidents',
          font: {
            size: 12,
            weight: 'bold',
          },
          color: '#2c3e50',
        },
      },
    },
    animation: {
      duration: 1000,
      easing: 'easeInOutQuart',
    },
  }), []);

  const mapApiDataToChartFormat = useCallback((apiData) => {
    const incidentData = apiData.top5IncidentDistrict || [];
    
    const labels = incidentData.map(item => item.districtName);
    const dataValues = incidentData.map(item => item.incidentCount);
    
    while (labels.length < 5) {
      labels.push('');
      dataValues.push(0);
    }
    
    const limitedLabels = labels.slice(0, 5);
    const limitedDataValues = dataValues.slice(0, 5);

    return {
      labels: limitedLabels,
      datasets: [
        {
          label: 'Incidents',
          data: limitedDataValues,
          backgroundColor: backgroundColors,
          borderColor: borderColors,
          borderWidth: 2,
          borderRadius: 5,
          borderSkipped: false,
          barPercentage: 0.58,
        },
      ],
    };
  }, [backgroundColors, borderColors]);

  const fetchData = useCallback(async () => {
    const now = Date.now();
  
    if (now - lastFetchTime.current < throttleDelay) {
     
      if (chartData) return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await getTopFiveIncident();
      const formattedData = mapApiDataToChartFormat(response.data);
      setChartData(formattedData);
      lastFetchTime.current = now;
    } catch (err) {
      setError(err.message || "Failed to fetch top incident districts data");
      console.error("Error fetching top incident districts data:", err);
    } finally {
      setLoading(false);
    }
  }, [chartData, mapApiDataToChartFormat]);

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
    if (chartData && chartRef.current) {
      chartRef.current.classList.add('loaded');
    }
  }, [chartData]);

  if (loading) {
    return (
      <div ref={chartRef} style={{ height: '380px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <ScrollLoader loading={true} />
      </div>
    );
  }

  if (error) {
    return (
      <div ref={chartRef} style={{ height: '380px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="text-red-500 text-center py-4">
          Error: {error}
        </div>
      </div>
    );
  }

  if (!chartData && !loading && !error) {
    return (
      <div ref={chartRef} style={{ height: '380px' }} className="scroll-effect-container chart-container-mobile flex flex-col items-center justify-center">
        <div className="text-center py-4 text-gray-500">
          <div className="mb-3 flex justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
          <p>Scroll down to load chart data</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={chartRef} style={{ height: '370px' }} className="scroll-effect-container chart-container-mobile">
      {chartData && <Bar data={chartData} options={options} />}
    </div>
  );
};

export default TopIncidentDistrictsBarChart;