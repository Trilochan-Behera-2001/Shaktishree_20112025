import  { useEffect, useState } from "react";
import { TextField, Button, Paper, Typography, Grid, InputAdornment, Select, MenuItem, Pagination } from "@mui/material";
import {
  addlearningType,
  getAlllearningTypes,
  editlearningType,
  statusLearningType 
 
} from "../../services/LearningTypeService";
import { encryptPayload } from "../../crypto/encryption";
import { toast } from "react-toastify";
import SearchIcon from "@mui/icons-material/Search";
import ReusableDialog from "../../components/common/ReusableDialog";
import ReusableDataTable from "../../components/common/ReusableDataTable";
import ActionButtons from "../../components/common/ActionButtons";
import "../../components/common/styles.css";
import Loader from "../../components/common/Loader";
import CardHeading from "../../components/common/CardHeading";

const AddLearningType = () => {
  const [learnTypeName, setLearnTypeName] = useState("");
  const [description, setDescription] = useState(""); 
  const [tableData, setTableData] = useState([]);
  const [isloading, setIsloading] = useState(false);
  const [learnTypeCode, setLearningCode] = useState(null);
  const [isEdit, setIsEdit] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [errors, setErrors] = useState({ learnTypeName: false, description: false });
  const [openConfirm, setOpenConfirm] = useState(false);
  const [rowToEdit, setRowToEdit] = useState(null);

  const getTableData = async () => {
    setIsloading(true)
    try {
      const res = await getAlllearningTypes();
      setTableData(res?.data?.data?.trainingTypes || []);
    } catch  {
      toast.error("Error fetching learning types");
      setTableData([]);
    }finally{
     setIsloading(false)
    }
  };

  useEffect(() => {
    getTableData();
  }, []);

  const resetForm = () => {
    setLearnTypeName("");
    setDescription("");
    setLearningCode(null);
    setIsEdit(false);
    setErrors({ learnTypeName: false, description: false });
  };

const handleEdit = async () => {
  if (!rowToEdit) return;
  setIsloading(true);
  setOpenConfirm(false);
  try {
    
    const payload = encryptPayload(rowToEdit.learnTypeCode);
    const res = await editlearningType(payload);
    const learnData = res.data?.data?.traingTypeList?.find(
        (item) => item.learnTypeCode === rowToEdit.learnTypeCode
      );

    if (learnData) {
      setLearnTypeName(learnData.learnTypeName);
      setDescription(learnData.description);
      setLearningCode(learnData.learnTypeCode);
      setIsEdit(true);
    } else {
      toast.error("No training type data found");
    }
  } catch  {
    toast.error("Failed to fetch training type details");
  } finally {
    setOpenConfirm(false);
    setRowToEdit(null);
    setIsloading(false);
  }
};



  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmedName = learnTypeName.trim();
    const trimmedDesc = description.trim();


if (!trimmedName) {
    setErrors({ learnTypeName: true, description: false });
    toast.error("Please enter Training Type Name");
    return;
  }
  if (!trimmedDesc) {
    setErrors({ learnTypeName: false, description: true });
    toast.error("Please enter Description");
    return;
  }
 setErrors({ learnTypeName: false, description: false });
    setIsloading(true);
    try {
      const payload = encryptPayload({ ...(isEdit && { learnTypeCode }), learnTypeName: trimmedName, description: trimmedDesc });
      const res = await addlearningType(payload);
      
    if (res.data?.outcome) {
  toast.success(isEdit ? "Training Type updated successfully" : "Training Type added successfully");


  if (res.data?.data?.traingTypeList) {
    setTableData(res.data.data.traingTypeList);
  } else {
    await getTableData();
  }

  resetForm();
}
    } catch {
      toast.error(isEdit ? "Failed to update Training Type" : "Failed to add Training Type");
    } finally {
      setIsloading(false);
    }
  };

const toggleStatus = async (learnTypeCode) => {
  setIsloading(true);
  try {
   
    const payload = encryptPayload(learnTypeCode);

    const res = await statusLearningType(payload);

    if (res.data?.outcome) {
      toast.success(res.data?.message || "Status updated");

  
      if (res.data?.data?.traingTypeList) {
        setTableData(res.data.data.traingTypeList);
      } else {
        await getTableData();
      }
    } else {
      toast.error(res.data?.message || "Failed to update status");
    }
  } catch  {
    toast.error("Failed to update status");
  } finally {
    setIsloading(false);
  }
};



  const filteredData = (tableData || []).filter(
    row =>
      (row?.learnTypeName || "").toLowerCase().includes(searchText.toLowerCase()) ||
      (row?.description || "").toLowerCase().includes(searchText.toLowerCase())
  );

  const paginatedData = filteredData.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  const columns = [
    { name: "Sl.No.", selector: (row, index) => (page - 1) * rowsPerPage + index + 1, width: "100px", sortable: true, center: true },
    { name: "Name", selector: row => row.learnTypeName, sortable: true },
    { name: "Training  Description", selector: row => row.description, grow: 2 },
   {
  name: "Action",
  cell: (row) => (
    <ActionButtons
      row={row}
      onEdit={() => { setRowToEdit(row); setOpenConfirm(true); }}
      onToggleStatus={() => toggleStatus(row.learnTypeCode)} 
       editDisabled={!row.isActive} 
    />
  ),
  ignoreRowClick: true,
  allowOverflow: true,
  button: true,
  width: "150px",
  center: true,
}

  ];

  return (
    <>
     {isloading &&  <Loader/>}
       <div className="p-3 bg-white shadow-md rounded-lg border border-gray-200 mb-4">
      
        <CardHeading props={isEdit ? "Update Training Type" : " Training Type"}/>
       
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3} alignItems="center" mt={3}mb={3}>
            <Grid xs={12} md={4}>
              <TextField
                 label={
                  <>
                    Training Type Name <span style={{ color: "red" }}>*</span>
                  </>
                }
                value={learnTypeName}
                onChange={(e) => {
                  setLearnTypeName(e.target.value);
                  setErrors(prev => ({ ...prev, learnTypeName: e.target.value.trim() === "" }));
                }}
                size="small"
                inputProps={{ maxLength: 50 }}
                error={errors.learnTypeName}
                  sx={{ width: "250px" }}
                autoComplete="off"
              />
            </Grid>
            <Grid xs={12} md={4}>
              <TextField
                  label={
                  <>
                    Description <span style={{ color: "red" }}>*</span>
                  </>
                }
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  setErrors(prev => ({ ...prev, description: e.target.value.trim() === "" }));
                }}
                size="small"
                inputProps={{ maxLength: 250 }}
                 sx={{ width: "400px" }}
                error={errors.description}
                autoComplete="off"
              />
            </Grid>
            <Grid xs={12} md={4} style={{ display: "flex", gap: 8 }}>
              <Button type="submit" variant="contained" color="success">{isEdit ? "Update" : "Submit"}</Button>
              <Button type="button" variant="contained" color="error"  onClick={resetForm}>Cancel</Button>
            </Grid>
          </Grid>
        </form>
      </div>

      <div className="p-3 bg-white shadow-md rounded-lg border border-gray-200 mb-4">
      
        <CardHeading props={"Training  List"}/>
        <div style={{ display: "flex", justifyContent: "end", marginBottom: 16 }}>
         
          <TextField
            size="small"
            placeholder="Search..."
            value={searchText}
            autoComplete="off"
            onChange={e => { setSearchText(e.target.value); setPage(1); }}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon color="action" /></InputAdornment> }}
          />
        </div>
        <ReusableDataTable data={paginatedData} columns={columns} page={page} rowsPerPage={rowsPerPage} />

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Typography sx={{ fontWeight: 600, fontSize: "14px", color: "#333" }}>Rows per page:</Typography>
            <Select size="small" value={rowsPerPage} onChange={e => { setRowsPerPage(Number(e.target.value)); setPage(1); }}
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
              }}>
              <MenuItem value={10}>10</MenuItem>
              <MenuItem value={20}>20</MenuItem>
              <MenuItem value={30}>30</MenuItem>
              <MenuItem value={50}>50</MenuItem>
            </Select>
          </div>

          <Pagination count={Math.ceil(filteredData.length / rowsPerPage)} page={page} onChange={(e, value) => setPage(value)} variant="outlined" color="primary" size="medium" />
        </div>
      </div>

      <ReusableDialog
        open={openConfirm}
        title="Confirm Edit"
        description="Are you sure you want to update this training type?"
        onClose={() => setOpenConfirm(false)}
        onConfirm={handleEdit}
        disableBackdropClick={true}
      />
    </>
  );
};

export default AddLearningType;