import { useEffect, useState } from 'react'
import { safetyCheckins } from '../../services/administrationServices'
import CardHeading from '../../components/common/CardHeading'
import ReusableDataTable from '../../components/common/ReusableDataTable'
import { InputAdornment, MenuItem, Pagination, Select, TextField, Typography } from '@mui/material'
import SearchIcon from "@mui/icons-material/Search";
import Loader from '../../components/common/Loader'

const SafetyCheckInList = () => {
    const [loading, setLoading] = useState(false)
    const [list, setList] = useState([])
    console.log("hgdhsg",list);

    const getData = async () => {
        try {
            setLoading(true)
            const res = await safetyCheckins()
            setList(res?.data?.data || []);
            // console.log(list);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false)
        }
    }
    useEffect(() => {
        getData()
    }, [])
  useEffect(() => {
    console.log("List state changed:", list);
  }, [list]);
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
        //     name: "Immediate Contact",
        //     selector: (row) => row.immediateContact1,
        //     sortable: true,
        // },
        {
            name: "	Safety Check-In List",
            selector: (row) => row.safetyCheckInName,
            sortable: true,
        },
        {
            name: "Last Check-In Time",
            selector: (row) => row.lastCheckInTime,
            sortable: true,
            
        },
        {
            name: "	Optional Message",
            selector: (row) => row.optionalMessage,
            sortable: true,
        }

    ]
    const [searchText, setSearchText] = useState("");
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const filteredData = (list || []).filter(
        row =>
            (row?.registrationUserName || "").toLowerCase().includes(searchText.toLowerCase()) ||
            (row?.userTypeName || "").toLowerCase().includes(searchText.toLowerCase()) ||
            (row?.collegeName || "").toLowerCase().includes(searchText.toLowerCase()) ||
            (row?.mobileNumber || "").toLowerCase().includes(searchText.toLowerCase()) ||
            (row?.immediateContact1 || "").toLowerCase().includes(searchText.toLowerCase())
    );
    const paginatedData = filteredData.slice((page - 1) * rowsPerPage, page * rowsPerPage);
    if (loading && list.length === 0) {
        return <Loader loading={true} />
    }
    return (
        <div className='p-4 border border-solid border-slate-300 rounded-md bg-white'>
            {/* <h6 className="text-blue-800 font-semibold text-lg mb-8 p-2 bg-blue-100 rounded-md">Safety Check In List</h6> */}
            <CardHeading props={'Safety Check In List'} />
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
                        <th className="px-3 py-3 text-md border border-slate-300">Safety Check-In List</th>
                        <th className="px-3 py-3 text-md border border-slate-300">Last Check-In Time</th>
                        <th className="px-3 py-3 text-md border border-slate-300">Optional Message</th>
                    </tr>
                </thead>
                <tbody>
                    {list.length == 0 ? <tr><td className="px-3 py-2 border border-slate-300 text-center" colSpan={10}>No Data Available</td></tr>
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
                                    <td className="px-3 py-2 border border-slate-300 text-center">{user.safetyCheckInName}</td>
                                    <td className="px-3 py-2 border border-slate-300 text-center">{user.lastCheckInTime}-{user.lastCheckInTimeInTimeStamp}</td>
                                    <td className="px-3 py-2 border border-slate-300 text-center">{user.optionalMessage}</td>
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
                    onChange={e => { setSearchText(e.target.value); setPage(1); }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon color="action" />
                            </InputAdornment>
                        )
                    }}
                />
            </div>
            <ReusableDataTable data={paginatedData} columns={columns} />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Typography sx={{ fontWeight: 600, fontSize: "14px", color: "#333" }}>Rows per page:</Typography>
                    <Select
                        size="small"
                        value={rowsPerPage}
                        onChange={e => { setRowsPerPage(Number(e.target.value)); setPage(1); }}
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
    )
}

export default SafetyCheckInList