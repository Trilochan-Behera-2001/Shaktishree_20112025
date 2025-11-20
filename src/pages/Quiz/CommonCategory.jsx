import { useEffect, useState } from "react";
import {
  TextField,
  Button,
  Grid,
  Typography,
  InputAdornment,
  Select,
  MenuItem,
  Pagination,
} from "@mui/material";
import { toast } from "react-toastify";
import SearchIcon from "@mui/icons-material/Search";
import { encryptPayload } from "../../crypto/encryption";
import {
saveCategorydata,
getCategoryTableList,
editCategorydata,
statusCategorydata
} from "../../services/categoryService";
import ReusableDialog from "../../components/common/ReusableDialog";
import ReusableDataTable from "../../components/common/ReusableDataTable";
import ActionButtons from "../../components/common/ActionButtons";
import "../../components/common/styles.css";
import CardHeading from "../../components/common/CardHeading";
import Loader from "../../components/common/Loader";

const CommonCategory = () => {
  const [categoryName, setCategoryName] = useState("");
  const [categoryDesc, setCategoryDesc] = useState("");
   const [categoryCode, setcategoryCode] = useState(null);
  const [categorytabledata, setCategorytabledata] = useState([]);
  const [isEdit, setIsEdit] = useState(false);
  const [isloading, setIsLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [errors, setErrors] = useState({
    categoryName: false,
    categoryDesc: false,
  });
  const [openConfirm, setOpenConfirm] = useState(false);
  const [rowToEdit, setRowToEdit] = useState(null);

const getTableData = async () => {
  setIsLoading(true);
  try {
    const res = await getCategoryTableList();
    
   
    setCategorytabledata(res?.data?.data || []);
  } catch (err) {
    console.error("Error fetching category list:", err);
    setCategorytabledata([]);
  } finally {
    setIsLoading(false);
  }
};

useEffect(() => {
  getTableData();
}, []);


  const resetForm = () => {
    setCategoryName("");
    setCategoryDesc("");
    setcategoryCode(null);
    setIsEdit(false);
    setErrors({ categoryName: false, categoryDesc: false });
  };

  const handleEdit = async () => {
    if (!rowToEdit) return;
    setOpenConfirm(false);
    setIsLoading(true);
    try {
      const payload = encryptPayload(rowToEdit.categoryCode);
      const res = await editCategorydata(payload);
      const eventData = res.data.data?.categoryList?.find(
        (item) => item.categoryCode === rowToEdit.categoryCode
      );
      if (eventData) {
        setCategoryName(eventData.categoryName);
        setCategoryDesc(eventData.categoryDesc);
        setcategoryCode(eventData.categoryCode);
        setIsEdit(true);
      } else {
        toast.error("No category data found");
      }
    } catch {
      toast.error("Failed to fetch category details");
    } finally {
      setOpenConfirm(false);
      setRowToEdit(null);
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmedName = categoryName.trim();
    const trimmedDesc = categoryDesc.trim();

    if (!categoryName.trim()) {
      setErrors({ categoryName: true, categoryDesc: false });
      toast.error("Please Enter category  Name");
      return;
    }
    if (!categoryDesc.trim()) {
      setErrors({ categoryName: false, categoryDesc: true });
      toast.error("Please Enter  category Description");
      return;
    }
    if (trimmedName.length > 50) {
      setErrors({ categoryName: true, categoryDesc: false });
      return toast.error("category  Name cannot exceed 50 characters");
    }

    if (trimmedDesc.length > 250) {
      setErrors({ categoryName: false, categoryDesc: true });
      return toast.error(" categoryDesc cannot exceed 250 characters");
    }
    setErrors({ categoryName: false, categoryDesc: false });
    setIsLoading(true);
    try {
      const payload = encryptPayload({
        ...(isEdit && { categoryCode }),
        categoryName: trimmedName,
        categoryDesc: trimmedDesc,
      });
      const res = await saveCategorydata(payload);
      if (res.data?.outcome) {
        toast.success(
          isEdit
            ? "category updated successfully"
            : "category added successfully"
        );

        if (res.data?.data?.categoryList) {
          setCategorytabledata(res.data.data.categoryList);
        } else {
          await getTableData();
        }

        resetForm();
      }
    } catch {
      toast.error(
        isEdit ? "Failed to update Event Type" : "Failed to add Event Type"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const toggleStatus = async (categoryCode) => {
  setIsLoading(true);
  try {
  
    const payload = encryptPayload(categoryCode);

    const res = await statusCategorydata(payload);

    if (res.data?.outcome) {
      toast.success(res.data?.message || "Status updated");
      if (res.data?.data?.categoryList.categoryCode) {
        setCategorytabledata(res.data.data.categoryList.categoryCode);
      } else {
        await getTableData();
      }
    }
  } catch {
    toast.error("Failed to update status");
  } finally {
    setIsLoading(false);
  }
};




  const filteredData = (categorytabledata || []).filter(
    (row) =>
      row?.categoryName?.toLowerCase().includes(searchText.toLowerCase()) ||
      row?.categoryDesc?.toLowerCase().includes(searchText.toLowerCase())
  );

  const paginatedData = filteredData.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  const columns = [
    {
      name: "Sl.No.",
      selector: (row, index) => (page - 1) * rowsPerPage + index + 1,
      width: "100px",
      sortable: true,
      center: true,
    },
    {
      name: "Category Name",
      selector: (row) => row.categoryName,
      sortable: true,
    },
    { name: "Category Description", selector: (row) => row.categoryDesc, grow: 2,cell: row => (
      <div style={{ whiteSpace: "normal", wordBreak: "break-word" }}>
        {row.categoryDesc}
      </div>
    ),},
    {
      name: "Action",
      cell: (row) => (
        <ActionButtons
          row={row}
          onEdit={(row) => {
            setRowToEdit(row);
            setOpenConfirm(true);
          }}
         onToggleStatus={() => toggleStatus(row.categoryCode)}
          editDisabled={!row.isActive} 
        />
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
      width: "150px",
      center: true,
    },
  ];

  return (
    <>
    {isloading &&  <Loader/>}
   
      <div className="p-3 bg-white shadow-md rounded-lg border border-gray-200 mb-4">
      
        <CardHeading props={isEdit ? "Update Category " : "Add Category"}/>

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3} alignItems="center" mb={3} mt={3}>
            <Grid xs={12} md={4}>
              <TextField
                label={
                  <>
                    Category <span style={{ color: "red" }}>*</span>
                  </>
                }
                value={categoryName}
                onChange={(e) => {
                  setCategoryName(e.target.value);
                  setErrors((prev) => ({
                    ...prev,
                    categoryName: e.target.value.trim() === "",
                  }));
                }}
                 sx={{ width: "250px" }}
               
                size="small"
                inputProps={{ maxLength: 50 }}
                error={errors.categoryName}
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
                value={categoryDesc}
                onChange={(e) => {
                  setCategoryDesc(e.target.value);
                  setErrors((prev) => ({
                    ...prev,
                    categoryDesc: e.target.value.trim() === "",
                  }));
                }}
              sx={{ width: "400px" }}
                size="small"
                inputProps={{ maxLength: 250 }}
                error={errors.categoryDesc}
                autoComplete="off"
               
              />
            </Grid>
            <Grid xs={12} md={4} style={{ display: "flex", gap: 8 }}>
              <Button
                type="submit"
                variant="contained"
                 color="success"
                
              >
                 {isEdit ? "Update" : "Submit"} 
              
              </Button>
              <Button
                type="button"
                variant="contained"
                 color="error"
               
                onClick={resetForm}
              >
                Cancel
              </Button>
            </Grid>
          </Grid>
        </form>
     </div>
    <div className="p-3 bg-white shadow-md rounded-lg border border-gray-200 mb-4">
                <CardHeading props={'Category List'} />

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

      <ReusableDialog
        open={openConfirm}
        title="Confirm Edit"
        description="Are you sure you want to update this category?"
        onClose={() => setOpenConfirm(false)}
        onConfirm={handleEdit}
        disableBackdropClick={true}
      />
    </>
  );
};

export default CommonCategory;
