import { useEffect, useRef, useState } from "react";
import {
  Box,
  TextField,
  Button,
  Avatar,
  Typography,
  Pagination,
  InputAdornment,
  Select,
  MenuItem,
  IconButton,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import CardHeading from "../../../components/common/CardHeading";
import ReusableDataTable from "../../../components/common/ReusableDataTable";
import ActionButtons from "../../../components/common/ActionButtons";
import ReusableDialog from "../../../components/common/ReusableDialog";
import SearchIcon from "@mui/icons-material/Search";
import {
  saveQuizMasterdata,
  getQuizMasterTableList,
  editQuizMasterdata,
  statusQuizMasterdata,
} from "../../../services/QuizMasterService";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import styled from "@emotion/styled";
import { encryptPayload } from "../../../crypto/encryption";
import { toast } from "react-toastify";
import Loader from "../../../components/common/Loader";
import DeleteIcon from "@mui/icons-material/Delete";
const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

const QuizMaster = () => {
  const [quizData, setQuizData] = useState({
    quizTitle: "",
    startDate: null,
    endDate: null,
    duration: "",
    noOfQuestion: "",
    noOfAttempt: "",
  });

  const [quizList, setQuizList] = useState([]);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedQuizForEdit, setSelectedQuizForEdit] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [isloading, setIsLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editQuizCode, setEditQuizCode] = useState(null);
  const [, setEditingId] = useState(null);
  const fileInputRef = useRef(null);

  // Helper function to format timestamp to DD-MM-YYYY
  const formatDate = (timestamp) => {
    if (!timestamp) return "-";
    // Create date object from timestamp (handle both string and number timestamps)
    const date = new Date(
      typeof timestamp === "string" ? parseInt(timestamp) : timestamp
    );
    if (isNaN(date.getTime())) return "-"; // Invalid date

    // Format as DD-MM-YYYY
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Month is 0-indexed
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const [errors, setErrors] = useState({
    quizTitle: "",
    startDate: "",
    endDate: "",
    duration: "",
    noOfQuestion: "",
    noOfAttempt: "",
    titleImage: "",
  });

  // Validation function
  const validateField = (name, value) => {
    switch (name) {
      case "quizTitle":
        return value.trim() ? "" : "Please enter Quiz Title";
      
      case "startDate":
        return value ? "" : "Please select Start Date";
      
      case "endDate":
        return value ? "" : "Please select End Date";
      
      case "duration":
        if (!value) return "Please enter Duration";
        if (!/^\d+$/.test(value)) return "Duration must be a positive number (no decimals or special characters)";
        if (Number(value) <= 0) return "Duration must be greater than 0";
        if (value.length > 3) return "Duration cannot exceed 3 digits (max 999)";
        return "";
      
      case "noOfQuestion":
        if (!value) return "Please enter No. of Questions";
        if (!/^\d+$/.test(value)) return "No. of Questions must be a positive number (no decimals or special characters)";
        if (Number(value) <= 0) return "No. of Questions must be greater than 0";
        if (value.length > 3) return "No. of Questions cannot exceed 3 digits (max 999)";
        return "";
      
      default:
        return "";
    }
  };

  // Validate all fields
  const validateForm = () => {
    const newErrors = {};
    
    // Validate each field
    Object.keys(quizData).forEach(key => {
      newErrors[key] = validateField(key, quizData[key]);
    });
    
    // Title Image validation
    if (!selectedFile && !isEditMode) {
      newErrors.titleImage = "Please upload a Title Image";
    } else {
      newErrors.titleImage = "";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).filter(key => newErrors[key]).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setQuizData((prev) => ({ ...prev, [name]: value }));
    
    // Validate field on change
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }
      setSelectedFile(file);
      setFileName(file.name);
      
      // Clear image error when file is selected
      setErrors(prev => ({ ...prev, titleImage: "" }));
    }
  };

  const removeImage = () => {
    setSelectedFile(null);
    setFileName("");
  };

  const getTableData = async () => {
    setIsLoading(true);
    try {
      const res = await getQuizMasterTableList();

      if (res.data && res.data.outcome === true) {
        setQuizList(res.data.data || []);
      } else if (Array.isArray(res.data)) {
        setQuizList(res.data);
      } else {
        setQuizList(res.data?.quizList || res.data?.data || []);
      }
    } catch (err) {
      console.error("Error fetching quiz list:", err);
      toast.error("Failed to fetch quiz list");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getTableData();
  }, []);

  const filteredData = (quizList || []).filter(
    (row) =>
      row?.quizTitle?.toLowerCase().includes(searchText.toLowerCase()) ||
      row?.startDate?.toLowerCase().includes(searchText.toLowerCase()) ||
      row?.endDate?.toLowerCase().includes(searchText.toLowerCase()) ||
      row?.duration?.toString().includes(searchText.toLowerCase()) ||
      row?.noOfQuestion?.toString().includes(searchText.toLowerCase()) ||
      row?.noOfAttempt?.toString().includes(searchText.toLowerCase())
  );

  const paginatedData = filteredData.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  const handleSubmit = async () => {
    console.log("handleSubmit called");

    // Run validation
    if (!validateForm()) {
      // Show first error message
      const firstError = Object.values(errors).find(error => error);
      if (firstError) {
        toast.error(firstError);
      }
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        quizTitle: quizData.quizTitle,
        startDate: quizData.startDate.format("YYYY-MM-DD"),
        endDate: quizData.endDate.format("YYYY-MM-DD"),
        duration: parseInt(quizData.duration),
        noOfAttempt: parseInt(quizData.noOfAttempt),
        noOfQuestion: parseInt(quizData.noOfQuestion),
      };

      if (isEditMode && editQuizCode) payload.quizCode = editQuizCode;

      const encryptedPayload = encryptPayload(payload);
      const formData = new FormData();
      formData.append("cipherText", encryptedPayload);

      if (selectedFile) {
        formData.append("titleImage", selectedFile);
      } else if (isEditMode) {
        formData.append("titleImage", new File([""], "empty.jpg"));
      }

      console.log("Submitting payload:", payload);

      const response = await saveQuizMasterdata(formData);
      console.log("API Response:", response);

      if (response?.data?.outcome === true) {
        toast.success(
          isEditMode ? "Quiz updated successfully!" : "Quiz saved successfully!"
        );
        resetForm();

        console.log("Fetching latest table data...");
        await getTableData();
        console.log("Table refreshed successfully");
      } else {
        console.warn("API returned failure:", response?.data);
        toast.error(response?.data?.message || "Failed to save quiz");
      }
    } catch (error) {
      console.error("CATCH BLOCK - Error saving quiz:", error);
      toast.error("Failed to save quiz");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditClick = (row) => {
    setSelectedQuizForEdit(row);
    setEditDialogOpen(true);
  };

  const handleEditConfirm = async () => {
    setEditDialogOpen(false);
    setIsLoading(true);

    try {
      const editPayload = selectedQuizForEdit.quizCode;

      const encryptedPayload = encryptPayload(editPayload);

      const response = await editQuizMasterdata(encryptedPayload);
      if (response?.data?.outcome === true) {
        const quizDataFromApi = response.data.data.quiz;
        setQuizData({
          quizTitle: quizDataFromApi.quizTitle || "",
          startDate: quizDataFromApi.startDate
            ? dayjs(quizDataFromApi.startDate)
            : null,
          endDate: quizDataFromApi.endDate
            ? dayjs(quizDataFromApi.endDate)
            : null,
          duration: quizDataFromApi.duration?.toString() || "",
          noOfQuestion: quizDataFromApi.noOfQuestion?.toString() || "",
          noOfAttempt: quizDataFromApi.noOfAttempt?.toString() || "",
        });

        setIsEditMode(true);
        setEditQuizCode(selectedQuizForEdit.quizCode);
        setEditingId(selectedQuizForEdit.quizId);

        if (quizDataFromApi.titleImage) {
          setFileName("Existing image - upload new to change");
        }

        toast.success(response?.data?.message);
      } else {
        toast.error(response?.data?.message);
      }
    } catch (error) {
      console.error("Error loading quiz data:", error);
      console.error("Error details:", error.response?.data);
      toast.error("Failed to load quiz data");
    } finally {
      setIsLoading(false);
      setSelectedQuizForEdit(null);
    }
  };

  const handleEditCancel = () => {
    setEditDialogOpen(false);
    setSelectedQuizForEdit(null);
  };

  const resetForm = () => {
    setQuizData({
      quizTitle: "",
      startDate: null,
      endDate: null,
      duration: "",
      noOfQuestion: "",
      noOfAttempt: "",
    });
    setSelectedFile(null);
    setFileName("");
    setIsEditMode(false);
    setErrors({
      quizTitle: "",
      startDate: "",
      endDate: "",
      duration: "",
      noOfQuestion: "",
      noOfAttempt: "",
      titleImage: "",
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleToggleStatus = async (row) => {
    setIsLoading(true);
    try {
      const payload = row.quizCode;
      const encryptedPayload = encryptPayload(payload);
      const response = await statusQuizMasterdata(encryptedPayload);
      if (response?.data?.outcome === true) {
        toast.success(response?.data?.message);
        await getTableData();
      } else {
        toast.error(response?.data?.message);
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    } finally {
      setIsLoading(false);
    }
  };

  const columns = [
    {
      name: "Sl. No.",
      selector: (row, index) => (page - 1) * rowsPerPage + index + 1,
      width: "80px",
      center: true,
    },
    {
      name: "Quiz Title",
      selector: (row) => row.quizTitle || "-",
      sortable: true,
      width: "150px",
    },
    {
      name: "Start Date",
      selector: (row) => formatDate(row.startDate) || "-",
      sortable: true,
      width: "150px",
    },
    {
      name: "End Date",
      selector: (row) => formatDate(row.endDate) || "-",
      sortable: true,
      width: "180px",
    },
    {
      name: "Duration (min)",
      selector: (row) => row.duration || "-",
      sortable: true,
      width: "150px",
    },
    {
      name: "No. of Questions",
      selector: (row) => row.noOfQuestion || "-",
      sortable: true,
      width: "170px",
    },
    // {
    //   name: "No. of Attempts",
    //   selector: (row) => row.noOfAttempt || "-",
    //   sortable: true,
    //   width: "160px",
    // },
    {
      name: "Status",
      sortable: true,
      width: "150px",
      center: true,
      cell: (row) => {
        let color = "";
        let text = "";

        switch (row.status?.toUpperCase()) {
          case "COMPLETED":
            color = "bg-green-800 text-white";
            text = "Completed";
            break;
          case "UPCOMING":
            color = "bg-blue-800 text-white";
            text = "Upcoming";
            break;
          case "PROGRESS":
            color = "bg-yellow-800 text-white";
            text = "In Progress";
            break;
          default:
            return null;
        }

        return (
          <span className={`px-3 py-1 rounded-full font-semibold ${color}`}>
            {text}
          </span>
        );
      },
    },
    {
      name: "Action",
      cell: (row) => {
        const isCompleted = row.status?.toUpperCase() === "COMPLETED";

        if (isCompleted) {
          return <span className="text-gray-400 italic">No actions</span>;
        }

        return (
          <ActionButtons
            row={row}
            onEdit={() => handleEditClick(row)}
            onToggleStatus={() => handleToggleStatus(row)}
            editDisabled={false}
          />
        );
      },
      ignoreRowClick: true,
      allowOverflow: true,
      // button: true,
      center: true,
    },
  ];

  return (
    <>
      {isloading && <Loader />}
      <Box
        sx={{
          p: 3,
          mb: 4,
          borderRadius: 2,
          backgroundColor: "white",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        }}
      >
        <ReusableDialog
          open={editDialogOpen}
          title="Confirm Edit"
          description={`Are you sure you want to edit the quiz "${selectedQuizForEdit?.quizTitle}"?`}
          onClose={handleEditCancel}
          onConfirm={handleEditConfirm}
        />

        <CardHeading
          props={isEditMode ? "Edit Quiz Master" : "Add Quiz Master"}
        />

        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mt-3">
            <div className="md:col-span-12 lg:col-span-2">
              <TextField
                label="Quiz Title"
                name="quizTitle"
                value={quizData.quizTitle}
                onChange={handleChange}
                variant="outlined"
                size="small"
                fullWidth
                required
                autoComplete="off"
                error={!!errors.quizTitle}
                helperText={errors.quizTitle || " "}
              />
            </div>

            <div className="md:col-span-12 lg:col-span-2">
              <DatePicker
                label="Start Date"
                value={quizData.startDate}
                onChange={(date) => {
                  setQuizData((prev) => ({ ...prev, startDate: date }));
                  // Validate field on change
                  const error = date ? "" : "Please select Start Date";
                  setErrors(prev => ({ ...prev, startDate: error }));
                }}
                slotProps={{
                  textField: {
                    size: "small",
                    fullWidth: true,
                    required: true,
                    error: !!errors.startDate,
                    helperText: errors.startDate || " ",
                  },
                }}
              />
            </div>

            <div className="md:col-span-12 lg:col-span-2">
              <DatePicker
                label="End Date"
                value={quizData.endDate}
                onChange={(date) => {
                  setQuizData((prev) => ({ ...prev, endDate: date }));
                  // Validate field on change
                  const error = date ? "" : "Please select End Date";
                  setErrors(prev => ({ ...prev, endDate: error }));
                }}
                minDate={quizData.startDate || dayjs()}
                slotProps={{
                  textField: {
                    size: "small",
                    fullWidth: true,
                    required: true,
                    error: !!errors.endDate,
                    helperText: errors.endDate || " ",
                  },
                }}
              />
            </div>

            <div className="md:col-span-12 lg:col-span-2">
              <TextField
                label="Duration (min)"
                name="duration"
                type="number"
                value={quizData.duration}
                onChange={handleChange}
                variant="outlined"
                size="small"
                fullWidth
                inputProps={{ min: 1 }}
                required
                error={!!errors.duration}
                helperText={errors.duration || " "}
              />
            </div>

            <div className="md:col-span-12 lg:col-span-2">
              <TextField
                label="No. of Questions"
                name="noOfQuestion"
                type="number"
                value={quizData.noOfQuestion}
                onChange={handleChange}
                variant="outlined"
                size="small"
                fullWidth
                inputProps={{ min: 1 }}
                required
                error={!!errors.noOfQuestion}
                helperText={errors.noOfQuestion || " "}
              />
            </div>

            {/* <div className="md:col-span-12 lg:col-span-2">
              <TextField
                label="No. of Attempts"
                name="noOfAttempt"
                type="number"
                value={quizData.noOfAttempt}
                onChange={handleChange}
                variant="outlined"
                size="small"
                fullWidth
                inputProps={{ min: 1 }}
                required
                error={!!errors.noOfAttempt}
                helperText={errors.noOfAttempt || " "}
              />
            </div> */}
            
            <div className="md:col-span-12 lg:col-span-2">
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 2,
                }}
              >
                <Button
                  component="label"
                  variant="contained"
                  startIcon={<CloudUploadIcon />}
                  fullWidth
                  sx={{
                    height: "40px",
                    borderRadius: 2,
                    textTransform: "none",
                    justifyContent: "space-between",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    borderColor: errors.titleImage ? "error.main" : "inherit",
                    borderWidth: errors.titleImage ? 2 : 1,
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-start",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <Typography
                      sx={{
                        fontWeight: 500,
                        fontSize: "14px",
                      }}
                    >
                      {isEditMode ? "Change Image" : "Upload Title Image"}
                    </Typography>

                    {/* Show filename below label */}
                    {fileName && (
                      <Typography
                        sx={{
                          fontSize: "12px",
                          color: "#fff",
                          opacity: 0.9,
                          maxWidth: "250px",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {fileName}
                      </Typography>
                    )}
                  </Box>

                  <VisuallyHiddenInput
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                  />
                </Button>

                {fileName && (
                  <IconButton
                    aria-label="delete"
                    color="error"
                    onClick={removeImage}
                  >
                    <DeleteIcon />
                  </IconButton>
                )}
              </Box>
              
              {/* Display image error message */}
              {errors.titleImage && (
                <Typography 
                  color="error" 
                  variant="caption" 
                  display="block" 
                  mt={1}
                >
                  {errors.titleImage}
                </Typography>
              )}
            </div>
          </div>
        </LocalizationProvider>

        <div className="flex justify-center gap-1.5 mt-4">
          <Button
            variant="contained"
            color="success"
            size="small"
            onClick={handleSubmit}
          >
            {isEditMode ? "Update Quiz" : "Save Quiz"}
          </Button>
          <Button
            variant="contained"
            color="error"
            size="small"
            onClick={resetForm}
          >
            Cancel
          </Button>
        </div>
      </Box>

      <div className="p-3 bg-white shadow-md rounded-lg border border-gray-200 mb-4 mt-4">
        <CardHeading props={"Quiz Master List"} />

        <div
          style={{ display: "flex", justifyContent: "end", marginBottom: 16 }}
        >
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
          pagination
          highlightOnHover
          striped
          responsive
        />

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 16,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Typography
              sx={{ fontWeight: 600, fontSize: "14px", color: "#333" }}
            >
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
                width: 80,
                height: 35,
                borderRadius: "8px",
                backgroundColor: "#f9f9f9",
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
    </>
  );
};

export default QuizMaster;
