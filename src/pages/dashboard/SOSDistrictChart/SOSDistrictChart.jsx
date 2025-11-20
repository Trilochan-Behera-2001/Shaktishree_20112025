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
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { getsosReport } from "../../../services/DashboardCard";
import Loder from "../../../components/common/Loader";

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

const SOSDistrictChart = () => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const lastFetchTime = useRef(0);
  const throttleDelay = 30000; // 30 seconds throttle

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
      tooltip: {
        enabled: true,
        intersect: false,
        mode: "index",
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
          text: "Districts",
        },
      },
      y: {
        beginAtZero: true,
        grace: "10%",
        title: {
          display: true,
          text: "Call for District",
        },
      },
    },
  };

  // Normalize district names to match the API response
  const normalizeDistrictName = useCallback((name) => {
    return name.toUpperCase().replace(/\s+/g, '');
  }, []);

  const districts = useMemo(() => [
    "Angul", "Balangir", "Balasore", "Bargarh", "Bhadrak", "Boudh", "Cuttack",
    "Deogarh", "Dhenkanal", "Gajapati", "Ganjam", "Jagatsinghpur", "Jajpur",
    "Jharsuguda", "Kalahandi", "Kandhamal", "Kendrapara", "Keonjhar", "Khurda",
    "Koraput", "Malkangiri", "Mayurbhanj", "Nabarangpur", "Nayagarh", "Nuapada",
    "Puri", "Rayagada", "Sambalpur", "Subarnapur", "Sundargarh"
  ], []);

  // Map API response to chart format
  const mapApiDataToChartFormat = useCallback((apiData) => {
    // Create a map of district names from API data
    const apiDistrictMap = {};
    apiData.sosCountList.forEach(item => {
      apiDistrictMap[normalizeDistrictName(item.districtName)] = item.liveLocationCount;
    });

    // Map the values to the district order
    const dataValues = districts.map(district => {
      const normalizedDistrict = normalizeDistrictName(district);
      return apiDistrictMap[normalizedDistrict] || 0;
    });

    return {
      labels: districts,
      datasets: [
        {
          label: "District Data",
          data: dataValues,
          borderColor: "#007bff",
          fill: "start",
          tension: 0.4,
          pointRadius: 4,
          pointHoverRadius: 5,
          pointHoverBackgroundColor: "#007bff",
          pointHoverBorderColor: "#fff",
        },
      ],
    };
  }, [normalizeDistrictName, districts]);

  const fetchData = useCallback(async () => {
    const now = Date.now();
    // Throttle API calls
    if (now - lastFetchTime.current < throttleDelay) {
      // If we have data already, just return early
      if (chartData) return;
      // Otherwise, we still need to show something, so continue but be aware it's throttled
    }

    try {
      setLoading(true);
      const response = await getsosReport();
      const formattedData = mapApiDataToChartFormat(response.data);
      setChartData(formattedData);
      lastFetchTime.current = now;
    } catch (err) {
      setError(err.message || "Failed to fetch SOS report data");
      console.error("Error fetching SOS report data:", err);
    } finally {
      setLoading(false);
    }
  }, [chartData, mapApiDataToChartFormat]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <Loder />
    );
  }

  if (error) {
    return (
      <div
        style={{
          position: "relative",
          width: "100%",
          textAlign: "center",
          padding: "20px",
          color: "red",
        }}
      >
        Error: {error}
      </div>
    );
  }

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
      }}
    >
      <div style={{ width: "100%", maxWidth: "100%" }}>
        <h2 className="titel_hdng" style={{ marginBottom: "1rem", textAlign: "center", color:"#1871CB", fontWeight:"600" }}>
          SOS Call District wise
        </h2>
        {chartData && <Line data={chartData} options={options} height={100} />}
      </div>
    </div>
  );
};

export default SOSDistrictChart;