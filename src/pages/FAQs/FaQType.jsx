import { useEffect, useState, } from 'react';
import { TextField, Button, Pagination, MenuItem, Typography, Select, InputAdornment } from '@mui/material';
import { encryptPayload } from '../../crypto/encryption';
import { faqEdit, faqSave, getAllFaqTypes, toggleFAQTypeStatus } from '../../services/faqService';
import ReusableDataTable from '../../components/common/ReusableDataTable';
import CardHeading from '../../components/common/CardHeading';
import SearchIcon from "@mui/icons-material/Search";
import { toast } from 'react-toastify';
import Loader from '../../components/common/Loader';
import ActionButtons from '../../components/common/ActionButtons';
import ReusableDialog from '../../components/common/ReusableDialog'; 

const FaQType = () => {
    const [loading, setLoading] = useState(false)
    const [submitLoading, setSubmitLoading] = useState(false)
    const [editLoading, setEditLoading] = useState(false)
    const [toggleLoading, setToggleLoading] = useState(false)
    const [dialogOpen, setDialogOpen] = useState(false); 
    const [selectedRow, setSelectedRow] = useState(null); 
    const [info, setInfo] = useState({
        faqTypeName: '',
        faqTypeDescription: '',
        faqTypeCode: null
    });
    const [errors, setErrors] = useState({
        faqTypeName: '',
        faqTypeDescription: ''
    });

    const [tableData, setTableData] = useState([]);
    const [searchText, setSearchText] = useState("");
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const validateForm = () => {
        let isValid = true;
        let newErrors = { faqTypeName: '', faqTypeDescription: '' };

        if (info.faqTypeName.trim() === '') {
            newErrors.faqTypeName = 'FAQ Type Name is required';
            isValid = false;
        } else {
            const nameRegex = /^[A-Za-z\s]+$/;
            if (!nameRegex.test(info.faqTypeName)) {
                newErrors.faqTypeName = 'FAQ Type Name should only contain letters and spaces';
                isValid = false;
            } else if (info.faqTypeName.length < 2) {
                newErrors.faqTypeName = 'FAQ Type Name should be at least 2 characters';
                isValid = false;
            }
        }

        
        if (info.faqTypeDescription.trim() === '') {
            newErrors.faqTypeDescription = 'Description is required';
            isValid = false;
        } else if (info.faqTypeDescription.length > 250) {
            newErrors.faqTypeDescription = 'Description should not exceed 250 characters';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleInp = (e) => {
        const { name, value } = e.target;
        
        if (name === "faqTypeName") {
           
            if (value === '' || /^[A-Za-z\s]*$/.test(value)) {
                setInfo({ ...info, [name]: value });
               
                if (errors.faqTypeName) {
                    setErrors({ ...errors, faqTypeName: '' });
                }
            }
            return;
        }
        
        if (name === "faqTypeDescription") {
            if (value.length <= 250) {
                setInfo({ ...info, [name]: value });
                
                if (errors.faqTypeDescription) {
                    setErrors({ ...errors, faqTypeDescription: '' });
                }
            }
            return;
        }
        
        setInfo({ ...info, [name]: value });
    };

    const getTableData = async () => {
        try {
            setLoading(true)
            const res = await getAllFaqTypes();
            setTableData(res.data.data || []);
        } catch (err) {
            console.error('Error fetching FAQ types:', err);
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
            const res = await faqSave(payload);
            res.outcome === true ? toast.success(res?.data.message) : toast.success(res?.data.message)
            setInfo({ faqTypeName: '', faqTypeDescription: '', faqTypeCode: null });
            setErrors({ faqTypeName: '', faqTypeDescription: '' });
            getTableData();
        } catch (err) {
            console.error('Error saving FAQ type:', err);
        } finally {
            setSubmitLoading(false)
        }
    };

    const toggleStatus = async (row) => {
        try {
            setToggleLoading(true)
            const payload = encryptPayload(row.faqTypeCode);
            const res = await toggleFAQTypeStatus(payload);
            res.status === 200 ? toast.success(res?.data.message) : toast.error(res?.data.message)
            getTableData();
        } catch (error) {
            console.error(error);
        } finally {
            setToggleLoading(false)
        }
    };

    const handleCancel = () => {
        setInfo({ faqTypeName: '', faqTypeDescription: '', faqTypeCode: null });
        setErrors({ faqTypeName: '', faqTypeDescription: '' });
    };

    
    const handleEditClick = (row) => {
        setSelectedRow(row);
        setDialogOpen(true);
    };

  
    const handleDialogConfirm = async () => {
        setDialogOpen(false);
        if (selectedRow) {
            await editFAQ(selectedRow);
        }
    };

   
    const handleDialogClose = () => {
        setDialogOpen(false);
        setSelectedRow(null);
    };

    const editFAQ = async (row) => {
        try {
            setEditLoading(true)
            const payload = encryptPayload(row.faqTypeCode);
            const res = await faqEdit(payload);
            setInfo(res?.data.data);
            setErrors({ faqTypeName: '', faqTypeDescription: '' });
            
            setTimeout(() => {
            const faqTypeNameField = document.querySelector('input[name="faqTypeName"]');
            if (faqTypeNameField) {
             
                faqTypeNameField.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'center',
                    inline: 'nearest'
                });
                
                faqTypeNameField.focus();
            }
        }, 200);
           
            
        } catch (error) {
            console.log(error);
        } finally {
            setEditLoading(false)
        }
    };

    const filteredData = (tableData || []).filter(
        row =>
            (row?.faqTypeName || "").toLowerCase().includes(searchText.toLowerCase()) ||
            (row?.faqTypeDescription || "").toLowerCase().includes(searchText.toLowerCase())
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
            name: "FAQ Type Name",
            selector: (row) => row.faqTypeName,
            sortable: true,
        },
        {
            name: "Description",
            selector: (row) => row.faqTypeDescription,
            sortable: true,
        },
        {
            name: "FAQ Type Code",
            selector: (row) => row.faqTypeCode,
            sortable: true,
        },
        {
            name: "Action",
            cell: (row) => (
                <ActionButtons 
                    row={row}
                    onEdit={handleEditClick} 
                    onToggleStatus={toggleStatus}
                    editDisabled={!row.isActive} 
                    scrollToForm={true}
                />
            ),
            ignoreRowClick: true,
            allowOverflow: true,
            button: true,
        },
    ];
    
    if (loading && tableData.length === 0) {
        return <Loader loading={true} />
    }
    
    return (
        <>
           
            <ReusableDialog
                open={dialogOpen}
                title="Confirm Edit"
                description="Are you sure you want to edit this FAQ type?"
                onClose={handleDialogClose}
                onConfirm={handleDialogConfirm}
            />
            
           
            <Loader loading={submitLoading || editLoading || toggleLoading} />
            
           
            <div 
                className="p-3 bg-white shadow-md rounded-lg border border-gray-200 mb-4"
            >
                <CardHeading props={'FAQ Type'} />

                <form
                    className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center"
                    onSubmit={handleSubmit}
                >
                    <div className="grid grid-cols-12 gap-4 items-end">
                        <div className="col-span-12 md:col-span-4">
                            <TextField
                                label="FAQ Type Name"
                                name="faqTypeName"
                                value={info.faqTypeName}
                                onChange={handleInp}
                                size="small"
                                fullWidth
                                variant="outlined"
                                disabled={submitLoading || editLoading || toggleLoading}
                                error={!!errors.faqTypeName}
                                helperText={errors.faqTypeName}
                                required 
                            />
                        </div>
                        <div className="col-span-12 md:col-span-4">
                            <TextField
                                label="Description"
                                name="faqTypeDescription"
                                value={info.faqTypeDescription}
                                onChange={handleInp}
                                size="small"
                                fullWidth
                                multiline
                                rows={1} 
                                variant="outlined"
                                disabled={submitLoading || editLoading || toggleLoading}
                                error={!!errors.faqTypeDescription}
                                helperText={errors.faqTypeDescription}
                                inputProps={{ 
                                    style: { resize: 'vertical' },
                                    maxLength: 250 
                                }}
                                required // Add required attribute for better UX
                            />
                            
                        </div>
                        <div className="col-span-12 md:col-span-4 flex gap-2 justify-start md:justify-start">
                            <Button 
                                type="submit" 
                                variant="contained" 
                                color="success"
                                disabled={submitLoading || editLoading || toggleLoading}
                            >
                                {info.faqTypeCode ? 'Update' : 'Submit'}
                            </Button>
                            <Button
                                type="button"
                                variant="contained"
                                color="error"
                                onClick={handleCancel}
                                disabled={submitLoading || editLoading || toggleLoading}
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                </form>
            </div>

            {/* Table Section */}
            <div className="p-3 bg-white shadow-md rounded-lg border border-gray-200 overflow-x-auto">
                <CardHeading props={'FAQ List'} />

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
                        disabled={submitLoading || editLoading || toggleLoading}
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
                            disabled={submitLoading || editLoading || toggleLoading}
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
                        disabled={submitLoading || editLoading || toggleLoading}
                    />
                </div>
            </div>
        </>
    );
};

export default FaQType;