import { useEffect, useState } from "react";
import { getMeetingList } from "../../services/meetingManagementServices";

const MeetingList = () => {
  const [tableData, setTableData] = useState([]);

  const fetchMeetings = async () => {
    try {
      const res = await getMeetingList();
      setTableData(res?.data?.data || []);
    } catch (error) {
      console.error("Error fetching meeting list:", error);
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Meeting List</h2>
      <table border="1" cellPadding="10" cellSpacing="0" style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ backgroundColor: "#f2f2f2" }}>
            <th>Meeting Title</th>
            <th>Meeting Date</th>
            <th>Meeting Venue</th>
            <th>Meeting Start Time</th>
            <th>Meeting End Time</th>
            <th>Meeting Category</th>
            <th>Meeting Agenda</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {tableData.length > 0 ? (
            tableData.map((meeting, idx) => (
              <tr key={idx}>
                <td>{meeting.meetingTitle}</td>
                <td>{meeting.meetingDate}</td>
                <td>{meeting.venue}</td>
                <td>{meeting.startTime}</td>
                <td>{meeting.endTime}</td>
                <td>{meeting.meetingCategory}</td>
                <td>{meeting.agenda}</td>
                <td>Eye, UploadDocument</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" style={{ textAlign: "center" }}>
                No meetings found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default MeetingList;
