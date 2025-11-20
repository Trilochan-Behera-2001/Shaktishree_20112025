import { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import ReusableDataTable from "../../../components/common/ReusableDataTable";
import Loader from "../../../components/common/Loader";
import CardHeading from "../../../components/common/CardHeading";
import {
  getregisteredUser,
  getsafetyCheckin,
  getspeakOutCirclePage,
  getreportIncident,
} from "../../../services/DashboardCard";

const DashboardCardDetails = () => {
  const { cardType } = useParams();
  const [tableData, setTableData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [pageTitle, setPageTitle] = useState("");

  const cardConfig = useMemo(() => ({
    "registered-users": {
      title: "Registered Users Details",
      apiFunction: getregisteredUser,
      columns: [
        {
          name: "Sl. No",
          selector: (row, index) => index + 1,
          sortable: false,
          width: "80px",
        },
        {
          name: "User Name",
          selector: (row) => row.registrationUserName || "-",
          sortable: true,
        },
        {
          name: "User Type",
          selector: (row) => row.userTypeName || "-",
          sortable: true,
        },
        {
          name: "College Name",
          selector: (row) => row.collegeName || "-",
          sortable: true,
        },
        {
          name: "Mobile Number",
          selector: (row) => row.mobileNumber || "-",
          sortable: true,
        },
        {
          name: "Date of Birth",
          selector: (row) => row.dob || "-",
          sortable: true,
        },
        {
          name: "Immediate Contact",
          selector: (row) => row.immediateContact1 || "-",
          sortable: true,
        },
      ],
    },
    "incident-reports": {
      title: "Incident Reports Details",
      apiFunction: getreportIncident,
      columns: [
        {
          name: "Sl. No",
          selector: (row, index) => index + 1,
          sortable: false,
          width: "80px",
        },
        {
          name: "User Name",
          selector: (row) => row.registrationUserName,
          sortable: true,
        },
        {
          name: "User Type",
          selector: (row) => row.userTypeName,
          sortable: true,
        },
        {
          name: "College Name",
          selector: (row) => row.collegeName,
          sortable: true,
        },
        { name: "Date of Birth", selector: (row) => row.dob, sortable: true },
        {
          name: "Immediate Contact",
          selector: (row) => row.immediateContact1,
          sortable: true,
        },
        {
          name: "Incident Type",
          selector: (row) => row.incidentType,
          sortable: true,
        },
        {
          name: "Incident Time",
          selector: (row) => row.incidentTime,
          sortable: true,
        },
        {
          name: "Anonymous",
          selector: (row) => (row.submitAnonymously ? "Yes" : "No"),
          sortable: true,
        },
        {
          name: "Immediate Attention",
          selector: (row) => (row.immediateAttention ? "Yes" : "No"),
          sortable: true,
        },
      ],
    },
    "safety-checkins": {
      title: "Safety Check-ins Details",
      apiFunction: getsafetyCheckin,
      columns: [
        {
          name: "Sl. No",
          selector: (row, index) => index + 1,
          sortable: false,
          width: "80px",
        },
        {
          name: "User Name",
          selector: (row) => row.registrationUserName || "-",
          sortable: true,
        },
        {
          name: "User Type",
          selector: (row) => row.userTypeName,
          sortable: true,
        },
        {
          name: "College Name",
          selector: (row) => row.collegeName,
          sortable: true,
        },
        {
          name: "Mobile Number",
          selector: (row) => row.mobileNumber,
          sortable: true,
        },
        { name: "Date Of Birth", selector: (row) => row.dob, sortable: true },
        {
          name: "Immediate Contact",
          selector: (row) => row.immediateContact1,
          sortable: true,
        },
        {
          name: "Safety Check-In Name",
          selector: (row) => row.safetyCheckInName,
          sortable: true,
        },
        {
          name: "Last Check-In Time",
          selector: (row) => row.lastCheckInTime,
          sortable: true,
        },
        {
          name: "Optional Message",
          selector: (row) => row.optionalMessage,
          sortable: true,
        },
      ],
    },
    "speak-out-circle": {
      title: "Speak Out Circle Details",
      apiFunction: getspeakOutCirclePage,
      columns: [
        {
          name: "Sl. No",
          selector: (row, index) => index + 1,
          sortable: false,
          width: "80px",
        },
        {
          name: "User Name",
          selector: (row) => row.registrationUserName,
          sortable: true,
          width: "250px",
        },
        {
          name: "User Type",
          selector: (row) => row.userTypeName,
          sortable: true,
          width: "120px",
        },
        {
          name: "College Name",
          selector: (row) => row.collegeName,
          sortable: true,
          width: "250px",
        },
        {
          name: "Mobile Number",
          selector: (row) => row.mobileNumber,
          sortable: true,
          width: "180px",
        },
        {
          name: "Total Post Like",
          selector: (row) => row.totalPostLike,
          sortable: true,
          width: "180px",
        },
        {
          name: "Total Post Comment",
          selector: (row) => row.totalPostComment,
          sortable: true,
          width: "180px",
        },
        {
          name: "SpeakOut Message",
          selector: (row) => (
            <div
              style={{
                whiteSpace: "normal",
                wordWrap: "break-word",
                maxWidth: "300px",
              }}
            >
              {row.speakOutMessage || "-"}
            </div>
          ),
          grow: 2,
          sortable: true,
        },
        {
          name: "Message Time",
          selector: (row) => {
            if (!row.messageTime) return "-";
            const date = new Date(row.messageTime);
            const formattedDate = date
              .toISOString()
              .slice(0, 19)
              .replace("T", " ");
            return formattedDate;
          },
          sortable: true,
          width: "200px",
        },
        // {
        //   name: "SpeakOut Circle Comment",
        //   selector: (row) => (
        //     <div
        //       style={{
        //         whiteSpace: "normal",
        //         wordWrap: "break-word",
        //         maxWidth: "300px",
        //       }}
        //     >
        //       {row.speakOutCircleComment || "-"}
        //     </div>
        //   ),
        //   grow: 2,
        //   sortable: true,
        // },
      ],
    },
  }), []);

  // Fetch data using TanStack Query
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["dashboardCardDetails", cardType],
    queryFn:
      cardConfig[cardType]?.apiFunction ||
      (() => Promise.resolve({ data: [] })),
    enabled: !!cardConfig[cardType],
    select: (response) => response.data,
  });

  useEffect(() => {
    if (data && cardConfig[cardType]) {
      const result = Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
        ? data.data
        : [];

      setTableData(result);
      setColumns(cardConfig[cardType].columns);
      setPageTitle(cardConfig[cardType].title);
    }
  }, [data, cardType, cardConfig]);

  if (isLoading) return <Loader loading={true} />;

  if (isError)
    return (
      <div className="mt-5 text-center text-red-500 font-bold">
        Error loading data: {error?.message || "Unknown error"}
      </div>
    );

  if (!cardConfig[cardType])
    return (
      <div className="mt-5 text-center text-red-500 font-bold">
        Invalid card type selected
      </div>
    );

  return (
    <div className="container mx-auto ">
      <div className="bg-white rounded-xl shadow-lg p-6 mt-4">
        <CardHeading props={pageTitle} />
        <div className=" overflow-hidden">
          <ReusableDataTable data={tableData} columns={columns} />
        </div>
      </div>
    </div>
  );
};

export default DashboardCardDetails;
