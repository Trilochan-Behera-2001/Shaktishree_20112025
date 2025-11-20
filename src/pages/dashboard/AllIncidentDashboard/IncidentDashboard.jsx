import {
  FaUsers,
  FaExclamationTriangle,
  FaClock,
  FaChartLine,
} from "react-icons/fa";
import { useQuery } from "@tanstack/react-query";
// import { useNavigate } from "react-router-dom";
// Remove Loader import since we're not using it in the dashboard
import { getDashboardCard } from "../../../services/DashboardCard";

const CompactCard = ({
  title,
  value,
  icon: IconComponent,
  variant = "blue",
  // cardType,
  // customRoute,
}) => {
  const variants = {
    blue: { gradient: "from-blue-500 to-blue-600", light: "bg-blue-50" },
    green: { gradient: "from-green-500 to-green-600", light: "bg-green-50" },
    orange: {
      gradient: "from-orange-500 to-orange-600",
      light: "bg-orange-50",
    },
    red: { gradient: "from-red-500 to-red-600", light: "bg-red-50" },
  };

  const colors = variants[variant];
  // const navigate = useNavigate();

  // const handleClick = () => {
  //   if (customRoute) {
  //     // Use custom route if provided
  //     navigate(customRoute);
  //   } else if (cardType) {
  //     // Default behavior for other cards
  //     navigate(`/dashboard/card/${cardType}`);
  //   }
  // };

  return (
    <div className="group" >
      <div
        className={`bg-gradient-to-br ${colors.gradient} rounded-xl px-3 py-7 text-white relative overflow-hidden transition-transform duration-200 group-hover:scale-105`}
      >
        <div
          style={{ backgroundColor: "rgba(255,255,255,0.5)" }}
          className="absolute top-0 right-0 w-20 h-20 bg_txt bg-opacity-10 rounded-full -translate-y-10 translate-x-10"
        ></div>

        <div className="relative z-10">
          <p className="text-sm opacity-90">{title}</p>
          <div className="flex items-center justify-between mt-3">
            <p className="text-2xl font-bold mb-1">{value}</p>
            {IconComponent && <IconComponent size={25} className="text-white opacity-90" />}
          </div>
        </div>
      </div>
    </div>
  );
};

// Dashboard Container
const IncidentDashboard = () => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["dashboardCard"],
    queryFn: getDashboardCard,
    select: (response) => response.data.dashboardData,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  });

  // Remove the loader from the dashboard - just show the cards even when loading
  if (isError) {
    return (
      <div className="mt-5">
        <div className="text-center text-red-500 font-bold">
          Error loading dashboard data: {error?.message || "Unknown error"}
        </div>
      </div>
    );
  }

  const cardConfig = [
    {
      key: "registerCount",
      title: "Registered Users",
      icon: FaUsers,
      variant: "blue",
      // cardType: "registered-users",
    },
    {
      key: "reportIncidentCount",
      title: "Incident Reports",
      icon: FaExclamationTriangle,
      variant: "red",
      // customRoute: "/reportincedentlist",
    },

    {
      key: "speakOutCirclePostCount",
      title: "Average Report incident ( Per Month )",
      icon: FaChartLine,
      variant: "green",
      // cardType: "speak-out-circle",
    },
    {
      key: "safetyCheckInCount",
      title: `Average Incident Resolution (In Day's)`,
      icon: FaClock,
      variant: "orange",
      // cardType: "safety-checkins",
    },
  ];

  // Use empty data when still loading
  const cardData = cardConfig.map((config) => ({
    ...config,
    value: isLoading ? 0 : data?.[config.key] || 0,
  }));

  return (
    <div className="mt-5">
      <div className=" mx-auto">
        {/* Compact Cards Grid */}
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {cardData.map((card, index) => {
              const { key, ...restProps } = card;
              return <CompactCard key={key || index} {...restProps} />;
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default IncidentDashboard;