import { useEffect, useState } from "react";
import { shaktiRaKahani } from "../../services/administrationServices";
import CardHeading from "../../components/common/CardHeading";
import ReusableDataTable from "../../components/common/ReusableDataTable";
import {
  InputAdornment,
  MenuItem,
  Pagination,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import Loader from "../../components/common/Loader";

const ShaktiRaKahani = () => {
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState([]);
  const getData = async () => {
    try {
      setLoading(true);
      const res = await shaktiRaKahani();
      setList(res?.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    getData();
  }, []);

  const columns = [
    {
      name: <div title="Sl. No.">Sl. No.</div>,
      selector: (row, index) => index + 1,
      width: "80px",
      center: true,
    },
    {
      name: <div title="Username" >Username</div>,
      selector: (row) => (
        <div title={row.registrationUserName}>{row.registrationUserName}</div>
      ),
      sortable: true,
      width: "250px",
    },
    {
      name: <div title="User Type Name">User Type Name</div>,
      selector: (row) => <div title={row.userTypeName}>{row.userTypeName}</div>,
      sortable: true,
      width: "200px",
    },
    {
      name: <div title="College Name">College Name</div>,
      selector: (row) => <div title={row.collegeName}>{row.collegeName}</div>,
      sortable: true,
      width: "500px",
    },
    {
      name: <div title="Speak Out Circle Post">Speak Out Circle Post</div>,
      selector: (row) => (
        <div title={row.speakOutMessage}>{row.speakOutMessage}</div>
      ),
      sortable: true,
        width: "500px",
    },
    {
      name: <div title="Post Time">Post Time</div>,
      selector: (row) => (
        <div title={row.messageTimeString}>{row.messageTimeString}</div>
      ),
      sortable: true,
    },
    {
      name: <div title="Total Likes Count">Total Likes Count</div>,
      selector: (row) => (
        <div title={row.totalPostLike}>{row.totalPostLike}</div>
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
      <CardHeading props={"Incident Report List"} />
      {/* <table className="min-w-full border border-slate-800 text-sm">
                <thead>
                    <tr className="bg-blue-100 text-left">
                        <th className="px-3 py-3 text-md border border-slate-300">Sl. No.</th>
                        <th className="px-3 py-3 text-md border border-slate-300">Username</th>
                        <th className="px-3 py-3 text-md border border-slate-300">User Type</th>
                        <th className="px-3 py-3 text-md border border-slate-300">College Name</th>
                        <th className="px-3 py-3 text-md border border-slate-300">Speak Out Circle Post</th>
                        <th className="px-3 py-3 text-md border border-slate-300">Post Time</th>
                        <th className="px-3 py-3 text-md border border-slate-300">Total Likes Count</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        list.length == 0 ? <tr><td className="px-3 py-2 border border-slate-300 text-center" colSpan={7}>No Data Available</td></tr>
                            : (list.map((user, idx) => {
                                return (
                                    <tr key={idx} className="hover:bg-gray-50">
                                        <td className="px-3 py-2 border border-slate-300 text-center">{idx + 1}</td>
                                        <td className="px-3 py-2 border border-slate-300 text-center">{user.registrationUserName}</td>
                                        <td className="px-3 py-2 border border-slate-300 text-center">{user.userTypeName}</td>
                                        <td className="px-3 py-2 border border-slate-300 text-center">{user.collegeName}</td>
                                        <td className="px-3 py-2 border border-slate-300 text-center">{user.speakOutMessage}</td>
                                        <td className="px-3 py-2 border border-slate-300 text-center">{user.messageTime}</td>
                                        <td className="px-3 py-2 border border-slate-300 text-center">{user.totalPostLike}</td>
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

export default ShaktiRaKahani;
