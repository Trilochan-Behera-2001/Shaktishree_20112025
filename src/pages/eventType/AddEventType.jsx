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
  addEventType,
  // addEventType,
  editEventType,
  getAllEventTypes,
  statusEventType,
} from "../../services/EventTypeService";
import ReusableDialog from "../../components/common/ReusableDialog";
import ReusableDataTable from "../../components/common/ReusableDataTable";
import ActionButtons from "../../components/common/ActionButtons";
import "../../components/common/styles.css";
import CardHeading from "../../components/common/CardHeading";
import Loader from "../../components/common/Loader";

const AddEventType = () => {
  const [eventTypeName, setEventTypeName] = useState("");
  const [description, setDescription] = useState("");
  const [tableData, setTableData] = useState([]);
  const [isloading, setIsLoading] = useState(false);
  const [eventCode, setEventCode] = useState(null);
  const [isEdit, setIsEdit] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [errors, setErrors] = useState({
    eventTypeName: false,
    description: false,
  });
  const [openConfirm, setOpenConfirm] = useState(false);
  const [rowToEdit, setRowToEdit] = useState(null);

  const getTableData = async () => {
    setIsLoading(true)
    try {
      const res = await getAllEventTypes();
      setTableData(res?.data?.data || []);
    } catch (err) {
      console.error(err);
      setTableData([]);
    }
    finally{
      setIsLoading(false)
    }
  };
  useEffect(() => {
    getTableData();
  }, []);

  const resetForm = () => {
    setEventTypeName("");
    setDescription("");
    setEventCode(null);
    setIsEdit(false);
    setErrors({ eventTypeName: false, description: false });
  };

  const handleEdit = async () => {
    if (!rowToEdit) return;
    setIsLoading(true);
    setOpenConfirm(false);
    try {
      const payload = encryptPayload(rowToEdit.eventCode);
      const res = await editEventType(payload);
      const eventData = res.data.data?.eventTypeList?.find(
        (item) => item.eventCode === rowToEdit.eventCode
      );
      if (eventData) {
        setEventTypeName(eventData.eventTypeName);
        setDescription(eventData.description);
        setEventCode(eventData.eventCode);
        setIsEdit(true);
      } else {
        toast.error("No event data found");
      }
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
    } catch {
      toast.error("Failed to fetch event type details");
    } finally {
      setOpenConfirm(false);
      setRowToEdit(null);
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmedName = eventTypeName.trim();
    const trimmedDesc = description.trim();

    if (!eventTypeName.trim()) {
      setErrors({ eventTypeName: true, description: false });
      toast.error("Please Enter Event  Name");
      return;
    }
    if (!description.trim()) {
      setErrors({ eventTypeName: false, description: true });
      toast.error("Please Enter Event Description");
      return;
    }
    if (trimmedName.length > 50) {
      setErrors({ eventTypeName: true, description: false });
      return toast.error("Event  Name cannot exceed 50 characters");
    }

    if (trimmedDesc.length > 250) {
      setErrors({ eventTypeName: false, description: true });
      return toast.error("Event Description cannot exceed 250 characters");
    }
    setErrors({ eventTypeName: false, description: false });
    setIsLoading(true);
    try {
      const payload = encryptPayload({
        ...(isEdit && { eventCode }),
        eventTypeName: trimmedName,
        description: trimmedDesc,
      });
      const res = await addEventType(payload);
      if (res.data?.outcome) {
        toast.success(
          isEdit
            ? "Event Type updated successfully"
            : "Event Type added successfully"
        );

        if (res.data?.data?.eventTypeList) {
          setTableData(res.data.data.eventTypeList);
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

  const toggleStatus = async (eventCode) => {
  setIsLoading(true);
  try {
  
    const payload = encryptPayload(eventCode);

    const res = await statusEventType(payload);

    if (res.data?.outcome) {
      toast.success(res.data?.message || "Status updated");
      if (res.data?.data?.eventTypeList.eventCode) {
        setTableData(res.data.data.eventTypeList.eventCode);
      } else {
        await getTableData();
      }
    }
  } catch  {
    toast.error("Failed to update status");
  } finally {
    setIsLoading(false);
  }
};




  const filteredData = (tableData || []).filter(
    (row) =>
      row?.eventTypeName?.toLowerCase().includes(searchText.toLowerCase()) ||
      row?.description?.toLowerCase().includes(searchText.toLowerCase())
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
      name: "Event  Name",
      selector: (row) => row.eventTypeName,
      sortable: true,
    },
    { name: "Event Description", selector: (row) => row.description, grow: 2,cell: row => (
      <div style={{ whiteSpace: "normal", wordBreak: "break-word" }}>
        {row.description}
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
         onToggleStatus={() => toggleStatus(row.eventCode)}
          editDisabled={!row.isActive} 
          scrollToForm={true}
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
      
        <CardHeading props={isEdit ? "Update Event Type" : " Event Type"}/>

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3} alignItems="center" mb={3} mt={3}>
            <Grid xs={12} md={4}>
              <TextField
                label={
                  <>
                    Event Name <span style={{ color: "red" }}>*</span>
                  </>
                }
                value={eventTypeName}
                name="eventTypeName"
                onChange={(e) => {
                  setEventTypeName(e.target.value);
                  setErrors((prev) => ({
                    ...prev,
                    eventTypeName: e.target.value.trim() === "",
                  }));
                }}
                 sx={{ width: "250px" }}
               
                size="small"
                inputProps={{ maxLength: 50 }}
                error={errors.eventTypeName}
                autoComplete="off"
              />
            </Grid>
            <Grid xs={12} md={4}>
              <TextField
                label={
                  <>
                   Event Description <span style={{ color: "red" }}>*</span>
                  </>
                }
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  setErrors((prev) => ({
                    ...prev,
                    description: e.target.value.trim() === "",
                  }));
                }}
              sx={{ width: "400px" }}
                size="small"
                inputProps={{ maxLength: 250 }}
                error={errors.description}
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
                <CardHeading props={'Event List'} />

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
        description="Are you sure you want to update this event type?"
        onClose={() => setOpenConfirm(false)}
        onConfirm={handleEdit}
        disableBackdropClick={true}
      />
    </>
  );
};

export default AddEventType;
