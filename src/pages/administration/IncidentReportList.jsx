import { useEffect, useState, useCallback } from "react";
import { incidentReports } from "../../services/administrationServices";
import { Button, Chip } from "@mui/material";
import CardHeading from "../../components/common/CardHeading";
import {
  InputAdornment,
  MenuItem,
  Pagination,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { FaCheck, FaEye, FaTimes } from "react-icons/fa";
import ReusableDataTable from "../../components/common/ReusableDataTable";
import Loader from "../../components/common/Loader";

const IncidentReportList = () => {
  const [loading, setLoading] = useState(false);

  const [list, setList] = useState([]);

  const getData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await incidentReports();
      setList(res?.data?.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    getData();
  }, [getData]);

  const columns = [
    {
      name: "Sl. No.",
      selector: (row, index) => index + 1,
      width: "80px",
      center: true,
    },
    {
      name: "Username",
      selector: (row) => row.registrationUserName,
      sortable: true,
    },
    {
      name: "User Type Name",
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
    {
      name: "Date of Birth",
      selector: (row) => row.dob,
      sortable: true,
    },
    // {
    //   name: "Immediate Contact",
    //   selector: (row) => row.immediateContact1,
    //   sortable: true,
    // },
    {
      name: "Immediate Type",
      selector: (row) => row.incidentType,
      sortable: true,
    },
    {
      name: "Immediate Time",
      selector: (row) => row.incidentTime,
      sortable: true,
    },
    {
      name: "Anonymous",
      selector: (row) =>
        row.submitAnonymously ? (
          <FaCheck color="green" size={16} />
        ) : (
          <FaTimes color="red" size={16} />
        ),
      sortable: true,
      center: true,
    },
    {
      name: "Immediate Attention",
      selector: (row) =>
        row.immediateAttention ? (
          <FaCheck color="green" size={16} />
        ) : (
          <FaTimes color="red" size={16} />
        ),
      sortable: true,
      center: true,
    },
    {
      name: "Location",
      selector: (row) => row.location,
      sortable: true,
    },
    {
      name: "Status",
      cell: (row) => {
        const status = row.status?.toUpperCase();

        let color = "default";
        if (status === "PENDING") color = "warning";
        else if (status === "APPROVE") color = "success";
        else if (status === "REVERT") color = "error";

        return (
          <Chip
            label={status}
            color={color}
            size="small"
            variant="filled"
            sx={{ fontWeight: "bold", minWidth: 90, textAlign: "center" }}
          />
        );
      },
      sortable: true,
      center: true,
    },
    {
      name: "	Action",
      selector: () => (
        <Button variant="contained" size="small" style={{padding:"5px"}}>
          <FaEye />
        </Button>
      ),
      sortable: true,
    },
  ];
  const [searchText, setSearchText] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const filteredData = (list || []).filter(
    (row) =>
      (row?.registrationUserName || "")
        .toLowerCase()
        .includes(searchText.toLowerCase()) ||
      (row?.userTypeName || "")
        .toLowerCase()
        .includes(searchText.toLowerCase()) ||
      (row?.collegeName || "")
        .toLowerCase()
        .includes(searchText.toLowerCase()) ||
      (row?.mobileNumber || "")
        .toLowerCase()
        .includes(searchText.toLowerCase()) ||
      (row?.immediateContact1 || "")
        .toLowerCase()
        .includes(searchText.toLowerCase())
  );
  const paginatedData = filteredData.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );
  if (loading && list.length === 0) {
    return <Loader loading={true} />;
  }
  return (
    <div className="p-4 border border-solid border-slate-300 rounded-md bg-white">
      {/* <h6 className="text-blue-800 font-semibold text-lg mb-8 p-2 bg-blue-100 rounded-md">Incident Report List</h6> */}
      <CardHeading props={"Incident Report List"} />
      {/* <table className="min-w-full border border-slate-800 text-sm">
                <thead>
                    <tr className="bg-blue-100 text-left">
                        <th className="px-3 py-3 text-md border border-slate-300">Sl. No.</th>
                        <th className="px-3 py-3 text-md border border-slate-300">Username</th>
                        <th className="px-3 py-3 text-md border border-slate-300">User Type</th>
                        <th className="px-3 py-3 text-md border border-slate-300">College Name</th>
                        <th className="px-3 py-3 text-md border border-slate-300">Mobile Number</th>
                        <th className="px-3 py-3 text-md border border-slate-300">Date of Birth</th>
                        <th className="px-3 py-3 text-md border border-slate-300">Immediate Contact</th>
                        <th className="px-3 py-3 text-md border border-slate-300">Immediate Type</th>
                        <th className="px-3 py-3 text-md border border-slate-300">Immediate Time</th>
                        <th className="px-3 py-3 text-md border border-slate-300">Annonymous</th>
                        <th className="px-3 py-3 text-md border border-slate-300">Immediate Attention</th>
                        <th className="px-3 py-3 text-md border border-slate-300">Location</th>
                        <th className="px-3 py-3 text-md border border-slate-300">Action</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        list.length == 0 ? <tr><td className="px-3 py-2 border border-slate-300 text-center" colSpan={13}>No Data Available</td></tr>
                            : (list.map((user, idx) => {
                                return (
                                    <tr key={idx} className="hover:bg-gray-50">
                                        <td className="px-3 py-2 border border-slate-300 text-center">{idx + 1}</td>
                                        <td className="px-3 py-2 border border-slate-300 text-center">{user.registrationUserName}</td>
                                        <td className="px-3 py-2 border border-slate-300 text-center">{user.userTypeName}</td>
                                        <td className="px-3 py-2 border border-slate-300 text-center">{user.collegeName}</td>
                                        <td className="px-3 py-2 border border-slate-300 text-center">{user.mobileNumber}</td>
                                        <td className="px-3 py-2 border border-slate-300 text-center">{user.dob}</td>
                                        <td className="px-3 py-2 border border-slate-300 text-center">{user.immediateContact1}</td>
                                        <td className="px-3 py-2 border border-slate-300 text-center">{user.incidentType}</td>
                                        <td className="px-3 py-2 border border-slate-300 text-center">{user.incidentTime}</td>
                                        <td className="px-3 py-2 border border-slate-300 text-center">{user.submitAnonymously}</td>
                                        <td className="px-3 py-2 border border-slate-300 text-center">{user.immediateAttention}</td>
                                        <td className="px-3 py-2 border border-slate-300 text-center">{user.dob}</td>
                                        <td className="px-3 py-2 border border-slate-300 text-center">{user.location}</td>
                                        <td className="px-3 py-2 border border-slate-300 text-center"><Button variant='outlined'>View</Button></td>
                                    </tr>
                                )
                            }))
                    }
                </tbody>
            </table> */}
      <div style={{ display: "flex", justifyContent: "end", marginBottom: 16 }}>
        <TextField
          size="small"
          placeholder="Search..."
          value={searchText}
          autoComplete="off"
          onChange={(e) => {
            setSearchText(e.target.value);
            setPage(1);
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
        />
      </div>
      <ReusableDataTable data={paginatedData} columns={columns} />
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: 16,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Typography sx={{ fontWeight: 600, fontSize: "14px", color: "#333" }}>
            Rows per page:
          </Typography>
          <Select
            size="small"
            value={rowsPerPage}
            onChange={(e) => {
              setRowsPerPage(Number(e.target.value));
              setPage(1);
            }}
            sx={{
              Width: 35,
              height: 35,
              borderRadius: "8px",
              backgroundColor: "#f9f9f9",
              "& .MuiSelect-select": {
                padding: "6px 12px",
              },
              "& fieldset": {
                borderColor: "#1976d2",
              },
              "&:hover fieldset": {
                borderColor: "#115293",
              },
            }}
          >
            <MenuItem value={10}>10</MenuItem>
            <MenuItem value={20}>20</MenuItem>
            <MenuItem value={30}>30</MenuItem>
            <MenuItem value={50}>50</MenuItem>
          </Select>
        </div>

        <Pagination
          count={Math.ceil(filteredData.length / rowsPerPage)}
          page={page}
          onChange={(e, value) => setPage(value)}
          variant="outlined"
          color="primary"
          size="medium"
        />
      </div>
    </div>
  );
};

export default IncidentReportList;
