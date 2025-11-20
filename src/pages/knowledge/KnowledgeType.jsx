import { Button, InputAdornment, MenuItem, Pagination, Select, TextField, Typography } from '@mui/material'
import  { useEffect, useState } from 'react'
import { getDocType, knowledgeTypeSave, toggleDocTypeStatus, updateDocType } from '../../services/knowledgeService'
import { encryptPayload } from '../../crypto/encryption'
import CardHeading from '../../components/common/CardHeading';
import ReusableDataTable from '../../components/common/ReusableDataTable';
import SearchIcon from "@mui/icons-material/Search";
import { toast } from 'react-toastify';
import ReusableDialog from '../../components/common/ReusableDialog';
import ActionButtons from '../../components/common/ActionButtons';
import Loader from '../../components/common/Loader';
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

const schema = yup.object({
  documentTypeName: yup
    .string()
    .required("Knowledge Repository Type Name is required")
    .matches(/^[A-Za-z\s]*$/, "Only alphabets and spaces are allowed"),
  description: yup
    .string()
    .required("Knowledge Repository Type Description is required"),
  documentTypeCode: yup.string().nullable(), // Add ID field for updates
});

const KnowledgeType = () => {
    const [openEditConfirm, setOpenEditConfirm] = useState(false);
    // const [openToggleConfirm, setOpenToggleConfirm] = useState(false);
    const [selectedItemId, setSelectedItemId] = useState(null);
    // const [toggleAction, setToggleAction] = useState({ id: null, isActive: false });
    const [loading, setLoading] = useState(false);
    const [list, setList] = useState([])
    const [searchText, setSearchText] = useState("");
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    
    const { 
        control, 
        handleSubmit: rhfHandleSubmit, 
        formState: { errors },
        reset,
        setValue,
        watch
    } = useForm({
        resolver: yupResolver(schema),
        mode: "onChange",
        defaultValues: {
            documentTypeName: '',
            description: '',
            documentTypeCode: null
        }
    });
    
    const documentTypeCode = watch('documentTypeCode'); // Watch for ID changes

    const filteredData = (list || []).filter(
        row =>
            (row?.documentTypeName || "").toLowerCase().includes(searchText.toLowerCase()) ||
            (row?.description || "").toLowerCase().includes(searchText.toLowerCase())
    );
    const paginatedData = filteredData.slice((page - 1) * rowsPerPage, page * rowsPerPage);

    const onSubmit = async (data) => {
        try {
            setLoading(true);
            
            // Use knowledgeTypeSave for both create and update operations
            const res = await knowledgeTypeSave(encryptPayload(data));
            
            if (res?.data?.outcome === true) {
                toast.success(res?.data?.message || (data.documentTypeCode 
                    ? "Knowledge type updated successfully!" 
                    : "Knowledge type created successfully!"));
            } else {
                toast.error(res?.data?.message || (data.documentTypeCode 
                    ? "Error updating knowledge type" 
                    : "Error creating knowledge type"));
            }
            
            // Reset form
            reset({
                documentTypeName: '',
                description: '',
                documentTypeCode: null
            });
            
            getData(); // Refresh the table
        } catch (error) {
            console.log(error);
            toast.error("Error saving knowledge type: " + error.message);
        } finally {
            setLoading(false);
        }
    }

    const getData = async () => {
        try {
            setLoading(true);
            const res = await getDocType()
            setList(res?.data.data)
        } catch (error) {
            console.log(error);
            toast.error("Error fetching knowledge data");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        getData()
    }, [])


    const handleToggle = async (id) => {
        
        try {
            setLoading(true);
            const payload = encryptPayload(id);
            const res = await toggleDocTypeStatus(payload);
            res.status === 200 ? toast.success(res?.data.message) : toast.error(res?.data.message);
            getData();
        } catch (error) {
            console.log(error);
            toast.error("Error toggling document status");
        } finally {
            setLoading(false);
        }
    };

    const editList = async (id) => {
        setSelectedItemId(id);
        setOpenEditConfirm(true);
    };

    const handleEditConfirm = async () => {
        if (!selectedItemId) return;
        setOpenEditConfirm(false);
        try {
            setLoading(true);
            const payload = encryptPayload(selectedItemId);
            const res = await updateDocType(payload);
            // Populate form with fetched data including the ID
            setValue('documentTypeName', res?.data.data.documentTypeName || '');
            setValue('description', res?.data.data.description || '');
            setValue('documentTypeCode', res?.data.data.documentTypeCode || null); // Store the ID
            
            setSelectedItemId(null);
            setTimeout(() => {
            const faqTypeNameField = document.querySelector('input[name="documentTypeName"]');
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
            toast.error("Error fetching document details");
            setOpenEditConfirm(false);
            setSelectedItemId(null);
        } finally {
            setLoading(false);
        }
    };
    const columns = [
        {
            name: "Sl. No.",
            selector: (row, index) => index + 1,
            width: "80px",
            center: true,
        },
        {
            name: "	Knowledge Repository Type Name",
            selector: (row) => row.documentTypeName,
            sortable: true,
        },
        {
            name: "	Knowledge Repository Type Description",
            selector: (row) => row.description,
            sortable: true,
        },
        {
            name: "Action",
            cell: (row) => (
                <ActionButtons 
                    row={row}
                    onEdit={(row) => editList(row.documentTypeCode)}
                    onToggleStatus={(row) => handleToggle(row.documentTypeCode, row.isActive)}
                    editDisabled={!row.isActive} 
                    
                />
            ),
            ignoreRowClick: true,
            allowOverflow: true,
            button: true,
        },
    ]

    return (
        <div>
            <Loader loading={loading} />
            <ReusableDialog
                open={openEditConfirm}
                title="Confirm Edit"
                description="Are you sure you want to edit this knowledge type?"
                onClose={() => {
                    setOpenEditConfirm(false);
                    setSelectedItemId(null);
                }}
                onConfirm={handleEditConfirm}
                disableBackdropClick={true}
            />
            
            {/* <ReusableDialog
                open={openToggleConfirm}
                title="Confirm Status Change"
                description={`Are you sure you want to ${toggleAction.isActive ? 'deactivate' : 'activate'} this knowledge type?`}
                onClose={() => {
                    setOpenToggleConfirm(false);
                    setToggleAction({ id: null, isActive: false });
                }}
                onConfirm={handleToggleConfirm}
                disableBackdropClick={true}
            /> */}
            
            <div className="p-4 border border-solid border-slate-300 rounded-md bg-white">
                <CardHeading props={'Knowledge Type'} />
                <form onSubmit={rhfHandleSubmit(onSubmit)} className="w-full" encType="multipart/form-data">
                    <div className="grid grid-cols-12 gap-4 items-center">
                        <div className="col-span-12 md:col-span-3">
                            <Controller
                                name="documentTypeName"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label="Knowledge Repository Type Name"
                                        size="small"
                                        fullWidth
                                        error={!!errors.documentTypeName}
                                        helperText={errors.documentTypeName?.message}
                                    />
                                )}
                            />
                        </div>
                        <div className="col-span-12 md:col-span-3">
                            <Controller
                                name="description"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label="Knowledge Repository Type Description"
                                        size="small"
                                        fullWidth
                                        error={!!errors.description}
                                        helperText={errors.description?.message}
                                    />
                                )}
                            />
                        </div>
                        <div className="col-span-12 md:col-span-3 flex gap-3">
                            
                            <Button 
                                variant='contained' 
                                color='success'
                                type='submit'
                                disabled={loading}
                            >
                                {documentTypeCode ? 'Update' : 'Submit'}
                            </Button>
                            <Button 
                                variant='contained' 
                                color='error'
                                onClick={() => {
                                    reset({
                                        documentTypeName: '',
                                        description: '',
                                        documentTypeCode: null
                                    });
                                }}
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                </form>
            </div>



            <div className="p-4 border border-solid border-slate-300 rounded-md bg-white mt-3">
                <CardHeading props={'Knowledge Repository Type List'} />

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
        </div>

    )
}

export default KnowledgeType