import  { useEffect, useState } from 'react';
import { TextField, Button, Pagination, MenuItem, Typography, Select, InputAdornment } from '@mui/material';
import { encryptPayload } from '../../crypto/encryption';
import { addAnnual, getAnnualRepo } from '../../services/AnnualReportAll';
import ReusableDataTable from '../../components/common/ReusableDataTable';
import CardHeading from '../../components/common/CardHeading';
import SearchIcon from "@mui/icons-material/Search";
import { toast } from 'react-toastify';
import Loader from '../../components/common/Loader';
// import ActionButtons from '../../components/common/ActionButtons';

const AnnualReport = () => {
    const [loading, setLoading] = useState(false)
    const [submitLoading, setSubmitLoading] = useState(false)
    // const [editLoading, setEditLoading] = useState(false)
    // const [toggleLoading, setToggleLoading] = useState(false)
    const [info, setInfo] = useState({
        dynamicFields: '',
        description: '',
        dynamicFieldId: null
    });
    const [errors, setErrors] = useState({
        dynamicFields: '',
        description: ''
    });

    const [tableData, setTableData] = useState([]);
    const [searchText, setSearchText] = useState("");
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const validateForm = () => {
        let isValid = true;
        let newErrors = { dynamicFields: '', description: '' };

        if (info.dynamicFields.trim() === '') {
            newErrors.dynamicFields = 'Field Name is required';
            isValid = false;
        } else {
            const nameRegex = /^[A-Za-z\s]+$/;
            if (!nameRegex.test(info.dynamicFields)) {
                newErrors.dynamicFields = 'Field Name should only contain letters and spaces';
                isValid = false;
            } else if (info.dynamicFields.length < 2) {
                newErrors.dynamicFields = 'Field Name should be at least 2 characters';
                isValid = false;
            }
        }

        if (info.description.trim() === '') {
            newErrors.description = 'Description is required';
            isValid = false;
        } else if (info.description.length > 250) {
            newErrors.description = 'Description should not exceed 250 characters';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleInp = (e) => {
        const { name, value } = e.target;
        
        if (name === "dynamicFields") {
            if (value === '' || /^[A-Za-z\s]*$/.test(value)) {
                setInfo({ ...info, [name]: value });
                if (errors.dynamicFields) {
                    setErrors({ ...errors, dynamicFields: '' });
                }
            }
            return;
        }
        
        if (name === "description") {
            if (value.length <= 250) {
                setInfo({ ...info, [name]: value });
                if (errors.description) {
                    setErrors({ ...errors, description: '' });
                }
            }
            return;
        }
        
        setInfo({ ...info, [name]: value });
    };

    const getTableData = async () => {
        try {
            setLoading(true)
            const res = await getAnnualRepo();
            setTableData(res.data.data || []);
        } catch (err) {
            console.error('Error fetching Field Name:', err);
        } finally {
            setLoading(false)
        }
    };

    useEffect(() => {
        getTableData();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }
        
        try {
            setSubmitLoading(true)
            const payload = encryptPayload(info);
            const res = await addAnnual(payload);
            res.outcome === true ? toast.success(res?.data.message) : toast.success(res?.data.message)
            setInfo({ dynamicFields: '', description: '', dynamicFieldId: null });
            setErrors({ dynamicFields: '', description: '' });
            getTableData();
        } catch (err) {
            console.error('Error saving Field Name:', err);
        } finally {
            setSubmitLoading(false)
        }
    };

    // const toggleStatus = async (row) => {
    //     try {
    //         setToggleLoading(true)
    //         const payload = encryptPayload(row.dynamicFieldId);
    //         const res = await toggleFAQTypeStatus(payload);
    //         res.status === 200 ? toast.success(res?.data.message) : toast.error(res?.data.message)
    //         getTableData();
    //     } catch (error) {
    //         console.error(error);
    //     } finally {
    //         setToggleLoading(false)
    //     }
    // };

    const handleCancel = () => {
        setInfo({ dynamicFields: '', description: '', dynamicFieldId: null });
        setErrors({ dynamicFields: '', description: '' });
    };

    // const editFAQ = async (row) => {
    //     try {
    //         setEditLoading(true)
    //         const payload = encryptPayload(row.dynamicFieldId);
    //         const res = await faqEdit(payload);
    //         setInfo(res?.data.data);
    //         setErrors({ dynamicFields: '', description: '' });
    //     } catch (error) {
    //         console.log(error);
    //     } finally {
    //         setEditLoading(false)
    //     }
    // };

    const filteredData = (tableData || []).filter(
        row =>
            (row?.dynamicFields || "").toLowerCase().includes(searchText.toLowerCase()) ||
            (row?.description || "").toLowerCase().includes(searchText.toLowerCase())
    );

    const paginatedData = filteredData.slice((page - 1) * rowsPerPage, page * rowsPerPage);
    
    const columns = [
        {
            name: "Sl. No.",
            selector: (row, index) => (page - 1) * rowsPerPage + index + 1,
            width: "80px",
            center: true,
        },
        {
            name: "Field Name",
            selector: (row) => row.dynamicFields,
            sortable: true,
        },
        {
            name: "Description",
            selector: (row) => row.description,
            sortable: true,
        },
        // {
        //     name: "Action",
        //     cell: (row) => (
        //         <ActionButtons 
        //             row={row}
        //             onEdit={editFAQ}
        //             onToggleStatus={toggleStatus}
        //             editDisabled={!row.isActive} 
        //         />
        //     ),
        //     ignoreRowClick: true,
        //     allowOverflow: true,
        //     button: true,
        // },
    ];
    
    if (loading && tableData.length === 0) {
        return <Loader loading={true} />
    }
    
    return (
        <>
            {/* Loader for submit, edit, and toggle operations */}
            <Loader loading={submitLoading } />
            
            {/* Form Section */}
            <div className="p-3 bg-white shadow-md rounded-lg border border-gray-200 mb-4">
                <CardHeading props={'Annual Report'} />

                <form
                    className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center"
                    onSubmit={handleSubmit}
                >
                    <div className="grid grid-cols-12 gap-4 items-end">
                        <div className="col-span-12 md:col-span-4">
                            <TextField
                                label="Field Name"
                                name="dynamicFields"
                                value={info.dynamicFields}
                                onChange={handleInp}
                                size="small"
                                fullWidth
                                variant="outlined"
                                disabled={submitLoading }
                                error={!!errors.dynamicFields}
                                helperText={errors.dynamicFields}
                            />
                        </div>
                        <div className="col-span-12 md:col-span-4">
                            <TextField
                                label="Description"
                                name="description"
                                value={info.description}
                                onChange={handleInp}
                                size="small"
                                fullWidth
                                multiline
                                rows={1}
                                variant="outlined"
                                disabled={submitLoading }
                                error={!!errors.description}
                                helperText={errors.description
                                }
                                inputProps={{ style: { resize: 'vertical' } }}
                            />
                            
                        </div>
                        {/* Helper text aligned right */}
                        {/* <div className="col-span-8 md:col-span-12">
                            <span className="text-xs text-gray-500">
                                {info.description.length}/250
                            </span>
                        </div> */}
                        <div className="col-span-12 md:col-span-4 flex gap-2 justify-start md:justify-start">
                            <Button 
                                type="submit" 
                                variant="contained" 
                                color="success"
                                disabled={submitLoading }
                            >
                                {info.dynamicFieldId ? 'Update' : 'Submit'}
                            </Button>
                            <Button
                                type="button"
                                variant="contained"
                                color="error"
                                onClick={handleCancel}
                                disabled={submitLoading }
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                </form>
            </div>

            {/* Table Section */}
            <div className="p-3 bg-white shadow-md rounded-lg border border-gray-200 overflow-x-auto">
                <CardHeading props={'Annual Report List'} />

                {/* Search bar */}
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
                        disabled={submitLoading }
                    />
                </div>

                {/* Table */}
                <ReusableDataTable
                    data={paginatedData}
                    columns={columns}
                />

                {/* Pagination + Rows per page */}
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
                            disabled={submitLoading}
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
                        disabled={submitLoading}
                    />
                </div>
            </div>
        </>
    );
};

export default AnnualReport;