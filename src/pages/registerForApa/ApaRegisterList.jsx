import { useEffect, useState } from "react";
import {
  TextField,
  Typography,
  InputAdornment,
  Select,
  MenuItem,
  Pagination,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import {
getaparegisterlisttable,
} from "../../services/registerApaServices";
import ReusableDataTable from "../../components/common/ReusableDataTable";
import "../../components/common/styles.css";
import CardHeading from "../../components/common/CardHeading";
import Loader from "../../components/common/Loader";
import { useLocation, useNavigate } from "react-router-dom";
const ApaRegistergerList = () => {
  const [apaRegisterlist, setApaRegisterlist] = useState([]);
 const [searchText, setSearchText] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isloading , setIsloading]=useState(false)
  const location = useLocation();
const navigate = useNavigate();
  useEffect(() => {
    apaRegisterGetListView();
  }, []);

useEffect(() => {
  if (location.state?.newRecord) {
    const newRecord = location.state.newRecord;
console.log("list api data:",newRecord)
   
    setApaRegisterlist((prev) => [newRecord, ...prev]);
  }
}, [location.state]);
  const apaRegisterGetListView = async () => {
    setIsloading(true);
    try {
      const res = await getaparegisterlisttable();
     
      setApaRegisterlist(res?.data?.data || []);
    } catch (err) {
      console.error(err);
      setApaRegisterlist([]);
    } finally {
      setIsloading(false);
    }
  };



  const filteredData = (apaRegisterlist || []).filter(
    (row) =>
      row?.districtName?.toLowerCase().includes(searchText.toLowerCase()) ||
      row?.registerName?.toLowerCase().includes(searchText.toLowerCase()) ||
      row?.registerEmail?.toLowerCase().includes(searchText.toLowerCase()) ||
      row?.mobile?.toLowerCase().includes(searchText.toLowerCase())  ||
      row?.designation?.toLowerCase().includes(searchText.toLowerCase())  ||
      row?.qualification?.toLowerCase().includes(searchText.toLowerCase())  

      
  );

  const paginatedData = filteredData.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

 const columns = [
    {
      name: "Sl. No.",
      selector: (row, index) => (page - 1) * rowsPerPage + index + 1,
      width: "90px",
      center: true,
    },
    {
      name: "District Name",
      selector: (row) => row.districtName || "N/A",
      sortable: true,
       width: "150px",
    },
    {
      name: "Register Name",
      selector: (row) => row.registerName || "N/A",
      sortable: true,
      width: "150px",
    },
    {
      name: "Register Email",
      selector: (row) => row.registerEmail || "N/A",
      sortable: true,
      width: "150px",
    },
    {
      name: "Mobile No.",
      selector: (row) => row.mobile || "N/A",
      sortable: true,
    },
     {
      name: "Date of Birth",
      selector: (row) => row.dobString || "N/A",
      sortable: true,
      center: true,
    },
    {
      name: "Designation",
      selector: (row) => row.designation || "N/A",
      sortable: true,
    },
    {
      name: "Qualification",
      selector: (row) => row.qualification || "N/A",
      sortable: true,
    },
   
   
  ];

  return (
    <>
    {isloading &&  <Loader/>}
 
    <div className="p-3 bg-white shadow-md rounded-lg border border-gray-200 mb-4">
    <CardHeading props={'Registration List'} />

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

        <ReusableDataTable
          data={paginatedData}
          columns={columns}
          page={page}
          rowsPerPage={rowsPerPage}
        />

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 16,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Typography sx={{ fontWeight: 600, fontSize: "14px", color: "#333" }}>Rows per page:</Typography>
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
            size="normal"
          />
        </div>
      </div>

   <div style={{ display: "flex", justifyContent: "center", marginTop: 20 }}>
  <button
    onClick={() => navigate("/register-for-apa")}
    style={{
      backgroundColor: "#1976d2",
      color: "white",
      border: "none",
      padding: "10px 20px",
      borderRadius: "8px",
      cursor: "pointer",
      fontWeight: "600"
    }}
  >
    Register Again
  </button>
</div>

    </>
  );
};

export default ApaRegistergerList;
