import Dashboard from "../../components/dashboard/Dashboard";
import IncidentDashboard from "./AllIncidentDashboard/IncidentDashboard";
import IncidentReportChart from "./IncidentReportChart/IncidentReportChart";
import SOSDistrictChart from "./SOSDistrictChart/SOSDistrictChart";
import "./SOSDistrictChart/SOSDistrictChart.css"
import BottomIncidentDistrict from "./TopIncidentDistrict/BottomIncidentDistrict";
// import CounsellingSession from "./TopIncidentDistrict/CounsellingSession";
import ResolutionStatistics from "./TopIncidentDistrict/ResolutionStatistics";
import IncidentDistrictsChart from "./TopIncidentDistrict/TopIncidentDistrict";
import TrainingConducted from "./TopIncidentDistrict/TrainingConducted";

const DashboardPage = () => {
  return (
    <Dashboard>
      <IncidentDashboard />
      <div className="container mx-auto mt-5">
        <div className="grid grid-cols-2 gap-6 ">
          <div className="bg-white p-4 rounded-2xl shadow col-span-2 ">
            <SOSDistrictChart />
          </div>
          <div className="bg-white p-4 rounded-2xl shadow col-span-2  h-100">
            <ResolutionStatistics />
          </div>
          <div className="bg-white p-4 rounded-2xl shadow ">
            <IncidentReportChart />
          </div>
          {/* <div className="bg-white p-4 rounded-2xl shadow  h-100">
            <CounsellingSession />
          </div> */}
          <div className="bg-white p-4 rounded-2xl shadow  h-100">
            <TrainingConducted />
          </div>
          <div className="bg-white p-4 rounded-2xl shadow ">
            <IncidentDistrictsChart />
          </div>
          <div className="bg-white p-4 rounded-2xl shadow h-100">
            <BottomIncidentDistrict />
          </div>
        </div>
      </div>
    </Dashboard>
  );
};

export default DashboardPage;
