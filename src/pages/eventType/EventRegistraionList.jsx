import { useEffect, useState } from "react";
import { geteventregiDetails } from "../../services/EventTypeService";
import ReusableDataTable from "../../components/common/ReusableDataTable";
import CardHeading from "../../components/common/CardHeading";
import Loader from "../../components/common/Loader";
import { toast } from "react-toastify";

const EventRegistraionList = () => {
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const columns = [
    {
      name: "Sl. No.",
      selector: (row, index) => index + 1,
      width: "80px",
      center: true,
    },
    {
      name: "Event Name",
      selector: (row) => row.eventName,
      sortable: true,
    },
    {
      name: "No. of Student Registered",
      selector: (row) => row.noOfRegisted,
      sortable: true,
      center: true,
    },
    {
      name: "No. of Student Participated",
      selector: (row) => row.noOfParticipate,
      sortable: true,
      center: true,
    },
  ];

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await geteventregiDetails();
      
      if (response?.data?.outcome) {
        setTableData(response.data.data || []);
      } else {
        setError(response?.data?.message || "Failed to fetch event registration details");
        toast.error(response?.data?.message || "Failed to fetch event registration details");
      }
    } catch (err) {
      setError(err.message || "Failed to fetch event registration details");
      console.error("Error fetching event registration details:", err);
      toast.error("Failed to fetch event registration details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return <Loader loading={true} />;
  }

  if (error) {
    return (
      <div className="p-3 bg-white shadow-md rounded-lg border border-gray-200 mb-4">
        <CardHeading props="Event Registration Details" />
        <div className="text-red-500 text-center py-4">
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 bg-white shadow-md rounded-lg border border-gray-200 mb-4">
      <CardHeading props="Event Registration Details" />
      <ReusableDataTable data={tableData} columns={columns} />
    </div>
  );
};

export default EventRegistraionList;