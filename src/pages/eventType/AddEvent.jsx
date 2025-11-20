import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Grid,
  TextField,
  MenuItem,
  Typography,
  IconButton,
  InputAdornment,
  Select,
  Pagination,
  Tooltip,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import VisibilityIcon from "@mui/icons-material/Visibility";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import {
  addeventsavedata,
  geteventlist,
  updateeventlist,
  viewaddeventimage,
  eventstatus,
} from "../../services/EventTypeService";
import dayjs from "dayjs";
import { encryptPayload } from "../../crypto/encryption";
import ReusableDialog from "../../components/common/ReusableDialog";
import ReusableDataTable from "../../components/common/ReusableDataTable";
import SearchIcon from "@mui/icons-material/Search";
import ActionButtons from "../../components/common/ActionButtons";
import { toast } from "react-toastify";
import Loader from "../../components/common/Loader";
import CardHeading from "../../components/common/CardHeading";

const AddEvent = () => {
  const [eventType, setEventType] = useState("");
  const [eventTypes, setEventTypes] = useState([]);
  const [title, setTitle] = useState("");
  // const [createdBy, setCreatedBy] = useState("");
  const [fromDate, setFromDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [description, setDescription] = useState("");
  const [tableData, setTableData] = useState([]);
  const [editingEventId, setEditingEventId] = useState(null);
  const [progress, setProgress] = useState("");
  // const [qrCode, setQrCode] = useState("");
  const [titleImg, setTitleImg] = useState(null);
  const [titleImgUrl, setTitleImgUrl] = useState("");
  const [images, setImages] = useState([
    { file: null, mediaPath: null, mediaId: null },
  ]);
  const [videos, setVideos] = useState([
    { file: null, mediaPath: null, mediaId: null },
  ]);

  const [searchText, setSearchText] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [rowToEdit, setRowToEdit] = useState(null);
  const [isloading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({
    eventType: false,
    title: false,
    // createdBy: false,
    fromDate: false,
    endDate: false,
    description: false,
    titleImg: false,
  });
  
  const columns = [
    {
      name: "Sl. No.",
      selector: (row, index) => (page - 1) * rowsPerPage + index + 1,
      width: "80px",
      center: true,
    },
    {
      name: "Event Type",
      selector: (row) => row.eventTypeId?.eventTypeName || "-",
      width: "200px",
      sortable: true,
    },
    {
      name: "Event Name",
      selector: (row) => row.eventName,
      sortable: true,
      width: "200px",
    },
    // {
    //   name: "Created By",
    //   selector: (row) => row.createdBy,
    //   sortable: true,
    //   width: "150px",
    // },
    {
      name: "Start Date",
      selector: (row) =>
        row.startDate ? dayjs(row.startDate).format("DD/MM/YYYY") : "",
      sortable: true,
      width: "150px",
    },
    {
      name: "End Date",
      selector: (row) =>
        row.endDate ? dayjs(row.endDate).format("DD/MM/YYYY") : "",
      sortable: true,
      width: "150px",
    },
    {
      name: "Description",
      selector: (row) => row.description,
      wrap: true,
      width: "200px",
    },
    {
      name: "Status",
      selector: (row) => row.progress || "-",
      sortable: true,
      width: "150px",
      cell: (row) => (
        <span
          style={{
            width: '100%',
            textAlign: 'center',
            padding: '4px 8px',
            borderRadius: '20px',
            fontWeight: '500',
            fontSize: '12px',
            backgroundColor: 
              row.progress?.toUpperCase() === "COMPLETED" 
                ? "#6ab04c" 
                : row.progress?.toUpperCase() === "PROGRESS" 
                ? "#f0932b" 
                : row.progress?.toUpperCase() === "PENDING" 
                ? "#f8d7da" 
                : "#e2e3e5",
            color: 
              row.progress?.toUpperCase() === "COMPLETED" 
                ? "#ffffff" 
                : row.progress?.toUpperCase() === "PROGRESS" 
                ? "#ffffff" 
                : row.progress?.toUpperCase() === "PENDING" 
                ? "#721c24" 
                : "#383d41",
          }}
        >
          {row.progress || "-"}
        </span>
      ),
    },
    {
      name: "QR Code",
      cell: (row) =>
        row.qrCode ? (
          <IconButton
            color="primary"
            onClick={() => handleViewQrCode(row.qrCode)}
            size="small"
          >
            <VisibilityIcon />
          </IconButton>
        ) : (
          "-"
        ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
    },

    {
      name: "Action",
      cell: (row) => (
        <ActionButtons
          row={row}
          onEdit={() => openEditModal(row)}
          onToggleStatus={() => toggleStatus(row.eventId)}
          editDisabled={!row.isActive}
        />
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,

      center: true,
    },
  ];

  //   const handleAddInput = (type) => {
  //   if (type === "image") {

  //     const hasEmpty = images.some((item) => !item?.file && !item?.mediaPath);
  //     if (hasEmpty) {
  //       toast.error("Please select a file before adding another image");
  //       return;
  //     }
  //     setImages([...images, { file: null, mediaPath: null }]);
  //   } else if (type === "video") {

  //     const hasEmpty = videos.some((item) => !item?.file && !item?.mediaPath);
  //     if (hasEmpty) {
  //       toast.error("Please select a file before adding another video");
  //       return;
  //     }
  //     setVideos([...videos, { file: null, mediaPath: null }]);
  //   }
  // };
  // const handleAddInput = (type) => {
  //   if (type === "image") {
  //     const lastItem = images[images.length - 1];

  //     // ✅ Only allow adding if the last input has a file or mediaPath
  //     if (!lastItem?.file && !lastItem?.mediaPath) {
  //       toast.error("Please select a file before adding another image");
  //       return;
  //     }

  //     setImages([...images, { file: null, mediaPath: null, mediaId: null }]);
  //   }

  //   else if (type === "video") {
  //     const lastItem = videos[videos.length - 1];

  //     if (!lastItem?.file && !lastItem?.mediaPath) {
  //       toast.error("Please select a file before adding another video");
  //       return;
  //     }

  //     setVideos([...videos, { file: null, mediaPath: null, mediaId: null }]);
  //   }
  // };

  const handleRemoveInput = (index, type) => {
    if (type === "image") setImages(images.filter((_, i) => i !== index));
    else setVideos(videos.filter((_, i) => i !== index));
  };

  // const handleFileChange = (e, index, type) => {
  //   const file = e.target.files[0];
  //   if (!file) return;

  //   if (type === "image") {
  //     const newImages = [...images];
  //     newImages[index] = { file, mediaPath: null, mediaId: null };
  //     setImages(newImages);
  //   } else {
  //     const newVideos = [...videos];
  //     newVideos[index] = { file, mediaPath: null, mediaId: null };
  //     setVideos(newVideos);
  //   }
  // };

  // --- Add / Replace this function ---
  const handleAddInput = (type) => {
    if (type === "image") {
      const lastImage = images[images.length - 1];
      // Allow adding new input if last item has either file or mediaPath (for existing images during edit)
      if (!lastImage?.file && !lastImage?.mediaPath) {
        toast.error("Please select an image before adding another");
        return;
      }
      setImages([...images, { file: null, mediaPath: null, mediaId: null }]);
      return;
    }

    if (type === "video") {
      const lastVideo = videos[videos.length - 1];
      // Allow adding new input if last item has either file or mediaPath (for existing videos during edit)
      if (!lastVideo?.file && !lastVideo?.mediaPath) {
        toast.error("Please select a video before adding another");
        return;
      }
      setVideos([...videos, { file: null, mediaPath: null, mediaId: null }]);
      return;
    }
  };

  // --- Add / Replace this function ---
  const handleFileChange = (e, index, type) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    if (type === "image") {
      const newImages = [...images];
      newImages[index] = { file, mediaPath: null, mediaId: null };
      setImages(newImages);
    } else if (type === "video") {
      const newVideos = [...videos];
      newVideos[index] = { file, mediaPath: null, mediaId: null };
      setVideos(newVideos);
    }
  };

  // useEffect(() => {
  //   const fetchDropdown = async () => {
  //     setIsLoading(true);
  //     try {
  //       const res = await getdropdownevent();

  //       setEventTypes(res.data.data);
  //     } catch (err) {
  //       console.error("Failed to load event types", err);
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   };
  //   fetchDropdown();
  // }, []);

 const getTableData = async () => {
  setIsLoading(true);
  try {
    const res = await geteventlist();

    const { eventTypes = [], events = [] } = res?.data?.data || {};

    setEventTypes(Array.isArray(eventTypes) ? eventTypes : []);
    setTableData(Array.isArray(events) ? events : []);

  } catch (err) {
    console.error("Error fetching event data:", err);
  } finally {
    setIsLoading(false);
  }
};


  useEffect(() => {
    getTableData();
  }, []);
  const resetForm = () => {
    setEventType("");
    setTitle("");
    // setCreatedBy("");
    setFromDate(null);
    setEndDate(null);
    setDescription("");
    setEditingEventId(null);
    setProgress("");
    setTitleImg(null);
    setTitleImgUrl("");
    setImages([{ file: null, mediaPath: null, mediaId: null }]);
    setVideos([{ file: null, mediaPath: null, mediaId: null }]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!eventType) {
      setErrors((prev) => ({ ...prev, eventType: true }));
      toast.error("Please select Event Type");
      return;
    }
    setErrors((prev) => ({ ...prev, eventType: false }));

    if (!title.trim()) {
      setErrors((prev) => ({ ...prev, title: true }));
      toast.error("Please enter Title");
      return;
    }
    setErrors((prev) => ({ ...prev, title: false }));

    // if (!createdBy.trim()) {
    //   setErrors((prev) => ({ ...prev, createdBy: true }));
    //   toast.error("Please enter Created By");
    //   return;
    // }
    // setErrors((prev) => ({ ...prev, createdBy: false }));

    if (!fromDate) {
      setErrors((prev) => ({ ...prev, fromDate: true }));
      toast.error("Please select From Date");
      return;
    }
    setErrors((prev) => ({ ...prev, fromDate: false }));

    if (!endDate) {
      setErrors((prev) => ({ ...prev, endDate: true }));
      toast.error("Please select End Date");
      return;
    }
    setErrors((prev) => ({ ...prev, endDate: false }));

    if (dayjs(endDate).isBefore(dayjs(fromDate))) {
      setErrors((prev) => ({ ...prev, endDate: true }));
      toast.error("End Date cannot be before From Date");
      return;
    }
    setErrors((prev) => ({ ...prev, endDate: false }));

    if (dayjs(endDate).isBefore(dayjs(fromDate))) {
      toast.error("End Date cannot be before From Date");
      return;
    }
    if (!description.trim()) {
      setErrors((prev) => ({ ...prev, description: true }));
      toast.error("Please enter Description");
      return;
    }
    setErrors((prev) => ({ ...prev, description: false }));

    if (!titleImg && !titleImgUrl) {
      setErrors((prev) => ({ ...prev, titleImg: true }));
      toast.error("Please upload Title Image");
      return;
    }
    if (editingEventId) {
      // Only check for empty inputs if they're not the last input (which is meant to be empty for adding new files)
      const emptyImageInput = images.some(
        (item, index) => !item?.file && !item?.mediaPath && index < images.length - 1
      );
      if (emptyImageInput) {
        toast.error(
          "Please select all image files or remove unused image inputs before submitting"
        );
        return;
      }

      const emptyVideoInput = videos.some(
        (item, index) => !item?.file && !item?.mediaPath && index < videos.length - 1
      );
      if (emptyVideoInput) {
        toast.error(
          "Please select all video files or remove unused video inputs before submitting"
        );
        return;
      }
    }
    setIsLoading(true);
    try {
      const payload = {
        eventId: editingEventId || null,
        eventName: title,
        // createdBy,
        startDate: fromDate ? dayjs(fromDate).format("DD/MM/YYYY") : null,
        endDate: endDate ? dayjs(endDate).format("DD/MM/YYYY") : null,
        description,
        eventTypeId: eventType,

        imageIds: images
          .filter((item) => item?.mediaId && !item.file)
          .map((item) => item.mediaId),
        videoIds: videos
          .filter((item) => item?.mediaId && !item.file)
          .map((item) => item.mediaId),
      };

      const cipherText = encryptPayload(JSON.stringify(payload));
      const formData = new FormData();
      formData.append("cipherText", cipherText);

      if (titleImg) {
        formData.append("imagePath", titleImg);
      } else if (titleImgUrl) {
        formData.append("existingImagePath", titleImgUrl);
      }

      images.forEach((item) => {
        if (item?.file) {
          formData.append("images", item.file);
        }
      });

      videos.forEach((item) => {
        if (item?.file) {
          formData.append("videos", item.file);
        }
      });
      
      const res = await addeventsavedata(formData);
      if (res.data?.outcome) {
        toast.success(
          res.data?.message || "Event saved successfully"
        );
        getTableData();
        resetForm();
      } else {
        toast.error(res.data?.message || "Failed to save event");
        setIsLoading(false);
      }
    } catch (err) {
      toast.error(err.message || "Something went wrong while saving event");
    } finally {
      setIsLoading(false);
    }
  };

  const openEditModal = (row) => {
    setRowToEdit(row);
    setOpenConfirm(true);
  };
  const handleEdit = async () => {
    if (!rowToEdit) return;
    setIsLoading(true);
    setOpenConfirm(false);
    try {
      setEditingEventId(rowToEdit.eventId);

      const res = await updateeventlist(rowToEdit.eventId);
      const eventData = res.data.event;

      if (eventData) {
        setTitle(eventData.eventName || "");
        // setCreatedBy(eventData.createdBy || "");
        setDescription(eventData.description || "");
        setEventType(eventData.eventTypeId?.eventTypeId || "");
        setFromDate(eventData.startDate ? dayjs(eventData.startDate) : null);
        setEndDate(eventData.endDate ? dayjs(eventData.endDate) : null);
        setProgress(eventData.progress || "");
        // setQrCode(eventData.qrCode || "");
        setTitleImg(null);
        setTitleImgUrl(eventData.titleImg || "");

        setImages(
          res.data.imageList && res.data.imageList.length > 0
            ? res.data.imageList.map((img) => ({
                file: null,
                mediaPath: img.mediaPath,
                mediaId: img.mediaId,
              }))
            : [{ file: null, mediaPath: null, mediaId: null }]
        );

        setVideos(
          res.data.videoList && res.data.videoList.length > 0
            ? res.data.videoList.map((vid) => ({
                file: null,
                mediaPath: vid.mediaPath,
                mediaId: vid.mediaId,
              }))
            : [{ file: null, mediaPath: null, mediaId: null }]
        );
      } else {
        toast.error("No event data found for editing");
      }
    } catch (err) {
      console.error("Error fetching event details:", err);
    } finally {
      setOpenConfirm(false);
      setRowToEdit(null);
      setIsLoading(false);
    }
  };

  const toggleStatus = async (eventId) => {
    setIsLoading(true);
    try {
      const cipherText = encryptPayload(eventId.toString());
      const res = await eventstatus(cipherText);

      if (res?.data?.outcome) {
        toast.success(res?.data?.message || "Status updated successfully ");
        getTableData();
      } else {
        toast.error(res?.data?.message || "Failed to update status ");
      }
    } catch (err) {
      console.error("Error updating status:", err);
      toast.error("Something went wrong while updating status ");
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewImage = async (filePath) => {
    setIsLoading(true);
    try {
      const res = await viewaddeventimage("EVENT-TRAINING", filePath);

      const blob = new Blob([res.data], { type: res.headers["content-type"] });
      const fileURL = URL.createObjectURL(blob);

      window.open(fileURL, "_blank");
    } catch (error) {
      console.error("Error viewing image:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewQrCode = async (filePath) => {
    setIsLoading(true);
    try {
      const res = await viewaddeventimage("EVENT-QR", filePath);

      const blob = new Blob([res.data], { type: res.headers["content-type"] });
      const fileURL = URL.createObjectURL(blob);

      window.open(fileURL, "_blank");
    } catch (error) {
      console.error("Error viewing QR code:", error);
    } finally {
      setIsLoading(false);
    }
  };
  const handleViewmultiImage = async (filePath) => {
    setIsLoading(true);
    try {
      const res = await viewaddeventimage("EVENT-TRAINING", filePath);
      const blob = new Blob([res.data], { type: res.headers["content-type"] });
      const fileURL = URL.createObjectURL(blob);
      window.open(fileURL, "_blank");
    } catch (error) {
      console.error("Error viewing image:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewmultiVideo = async (filePath) => {
    setIsLoading(true);
    try {
      const res = await viewaddeventimage("EVENT-TRAINING", filePath);
      const blob = new Blob([res.data], { type: res.headers["content-type"] });
      const fileURL = URL.createObjectURL(blob);
      window.open(fileURL, "_blank");
    } catch (error) {
      console.error("Error viewing video:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredData = (tableData || []).filter(
    (row) =>
      (row?.eventTypeId?.eventTypeName || "")
        .toLowerCase()
        .includes(searchText.toLowerCase()) ||
      (row?.eventName || "").toLowerCase().includes(searchText.toLowerCase()) ||
      // (row?.createdBy || "").toLowerCase().includes(searchText.toLowerCase()) ||
      (row?.description || "").toLowerCase().includes(searchText.toLowerCase())
  );
  const paginatedData = filteredData.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  return (
    <>
      {isloading && <Loader />}
      <div className="p-3 bg-white shadow-md rounded-lg border border-gray-200 mb-4">
        <CardHeading props={"   Add Event"} />

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3} alignItems="center">
            <Grid xs={12} md={4}>
              <TextField
                select
                label={
                  <>
                    Type of Event <span style={{ color: "red" }}>*</span>
                  </>
                }
                value={eventType}
                onChange={(e) => {
                  setEventType(e.target.value);
                  if (errors.eventType && e.target.value)
                    setErrors((prev) => ({ ...prev, eventType: false }));
                }}
                sx={{ width: "250px" }}
                error={errors.eventType}
                size="small"
                disabled={progress?.toUpperCase() === "COMPLETED"}
              >
                <MenuItem value="">--Select--</MenuItem>
                {eventTypes.map((et) => (
                  <MenuItem key={et.eventTypeId} value={et.eventTypeId}>
                    {et.eventTypeName}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid xs={12} md={4}>
              <TextField
                label={
                  <>
                    Title<span style={{ color: "red" }}>*</span>
                  </>
                }
                fullWidth
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (errors.title && e.target.value)
                    setErrors((prev) => ({ ...prev, title: false }));
                }}
                sx={{ width: "250px" }}
                error={errors.title}
                inputProps={{ maxLength: 50 }}
                autoComplete="off"
                size="small"
                disabled={progress?.toUpperCase() === "COMPLETED"}
              />
            </Grid>
            {/* <Grid xs={12} md={4}>
              <TextField
                label={
                  <>
                    Created By <span style={{ color: "red" }}>*</span>
                  </>
                }
                size="small"
                value={createdBy}
                onChange={(e) => {
                  setCreatedBy(e.target.value);
                  if (errors.createdBy && e.target.value)
                    setErrors((prev) => ({ ...prev, createdBy: false }));
                }}
                sx={{ width: "250px" }}
                error={errors.createdBy}
                inputProps={{ maxLength: 50 }}
                autoComplete="off"
              />
            </Grid> */}

            <Grid xs={12} md={4}>
              <DatePicker
                label={
                  <>
                    From Date <span style={{ color: "red" }}>*</span>
                  </>
                }
                value={fromDate}
                onChange={(newValue) => {
                  setFromDate(newValue);
                  if (errors.fromDate && newValue) {
                    setErrors((prev) => ({ ...prev, fromDate: false }));
                  }
                }}
                format="DD/MM/YYYY"
                slotProps={{
                  textField: {
                    fullWidth: true,
                    size: "small",
                    sx: {
                      width: "250px",
                    },
                    error: errors.fromDate,
                    disabled: progress?.toUpperCase() === "COMPLETED",
                  },
                }}
              />
            </Grid>

            <Grid xs={12} md={4}>
              <DatePicker
                label={
                  <>
                    End Date <span style={{ color: "red" }}>*</span>
                  </>
                }
                value={endDate}
                onChange={(newValue) => {
                  setEndDate(newValue);
                  if (errors.endDate && newValue) {
                    setErrors((prev) => ({ ...prev, endDate: false }));
                  }
                }}
                format="DD/MM/YYYY"
                slotProps={{
                  textField: {
                    fullWidth: true,
                    size: "small",
                    sx: {
                      width: "250px",
                    },
                    error: errors.endDate,
                    disabled: progress?.toUpperCase() === "COMPLETED",
                  },
                }}
              />
            </Grid>

            <Grid xs={12} md={4}>
              <TextField
                label={
                  <>
                    Description <span style={{ color: "red" }}>*</span>
                  </>
                }
                size="small"
                multiline
                rows={1}
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  if (errors.description && e.target.value)
                    setErrors((prev) => ({ ...prev, description: false }));
                }}
                sx={{ 
                  width: "250px",
                  '& .MuiInputBase-root': {
                    resize: 'vertical',
                    overflow: 'auto'
                  }
                }}
                error={errors.description}
                inputProps={{ maxLength: 250 }}
                disabled={progress?.toUpperCase() === "COMPLETED"}
              />
            </Grid>
            <Grid
              item
              xs={4}
              sx={{ display: "flex", alignItems: "center", gap: 1 }}
            >
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {/* <Typography
      variant="subtitle2"
      sx={{ fontWeight: 600, color: "#333" }}
    >
      Title Image <span style={{ color: "red" }}>*</span>
    </Typography> */}

                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<CloudUploadIcon />}
                  sx={{
                    border: "2px dashed",
                    borderColor: errors.titleImg ? "#d32f2f" : "grey.400",
                    color: errors.titleImg ? "#d32f2f" : "text.primary",
                    backgroundColor: "grey.50",
                    textTransform: "none",
                    fontWeight: 500,
                    "&:hover": {
                      borderColor: "primary.main",
                      backgroundColor: "primary.light",
                      color: "#fff",
                    },
                    width: "250px",
                    height: "40px",
                    px: 1,
                    display: "flex",
                    alignItems: "center",
                    textAlign: "center",
                  }}
                  size="small"
                >
                  <span style={{ 
                    overflow: "hidden", 
                    textOverflow: "ellipsis", 
                    whiteSpace: "nowrap",
                    maxWidth: "100%",
                    display: "inline-block"
                  }}>
                    {titleImg
                      ? titleImg.name
                      : titleImgUrl
                      ? "Current Image Selected"
                      : "Upload Title Image"}
                  </span>
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      setTitleImg(file);
                      if (errors.titleImg && file)
                        setErrors((prev) => ({ ...prev, titleImg: false }));
                    }}
                  />
                </Button>

                {/* {titleImg && (
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ fontStyle: "italic" }}
      >
        Selected: {titleImg.name}
      </Typography>
    )} */}
              </Box>

              {/* View existing image (if any) */}
              {titleImgUrl && (
                <Tooltip title="View Image">
                  <IconButton
                    color="primary"
                    onClick={() => handleViewImage(titleImgUrl)}
                    size="small"
                  >
                    <VisibilityIcon />
                  </IconButton>
                </Tooltip>
              )}
            </Grid>
          </Grid>

          {/* Conditionally render Image(s) section only when status is COMPLETED */}
          {progress?.toUpperCase() === "COMPLETED" && (
            <Grid item xs={12} mt={2}>
              <Typography fontWeight={500} mb={1}>
                Image(s):
              </Typography>
              <Grid container spacing={1}>
                {images.map((item, index) => {
                  const img = item || { file: null, mediaPath: null };
                  return (
                    <Grid
                      item
                      key={index}
                      xs="auto"
                      display="flex"
                      alignItems="center"
                      gap={1}
                    >
                      <Button
                        variant="outlined"
                        component="label"
                        sx={{ minWidth: 140 }}
                      >
                        {img.file
                          ? img.file.name
                          : img.mediaPath
                          ? "Existing File"
                          : "Choose File"}
                        <input
                          type="file"
                          hidden
                          onChange={(e) =>
                            handleFileChange(e, index, "image")
                          }
                          accept=".jpg,.jpeg,.png"
                        />
                      </Button>

                      {img.mediaPath && !img.file && (
                        <IconButton
                          color="primary"
                          onClick={() => handleViewmultiImage(img.mediaPath)}
                          size="small"
                        >
                          <VisibilityIcon />
                        </IconButton>
                      )}

                      {index === 0 ? (
                        <IconButton
                          color="primary"
                          onClick={() => handleAddInput("image")}
                          disabled={progress?.toUpperCase() === "COMPLETED"}
                        >
                          <AddIcon />
                        </IconButton>
                      ) : (
                        <IconButton
                          color="error"
                          onClick={() => handleRemoveInput(index, "image")}
                          disabled={progress?.toUpperCase() === "COMPLETED"}
                        >
                          <RemoveIcon />
                        </IconButton>
                      )}
                    </Grid>
                  );
                })}
              </Grid>
            </Grid>
          )}

          {/* Conditionally render Video(s) section only when status is COMPLETED */}
          {progress?.toUpperCase() === "COMPLETED" && (
            <Grid item xs={12} mt={2}>
              <Typography fontWeight={500} mb={1}>
                Video(s):
              </Typography>
              <Grid container spacing={1}>
                {videos.map((item, index) => {
                  const vid = item || { file: null, mediaPath: null };
                  return (
                    <Grid
                      item
                      key={index}
                      xs="auto"
                      display="flex"
                      alignItems="center"
                      gap={1}
                    >
                      <Button
                        variant="outlined"
                        component="label"
                        sx={{ minWidth: 140 }}
                      >
                        {vid.file
                          ? vid.file.name
                          : vid.mediaPath
                          ? "Existing File"
                          : "Choose File"}
                        <input
                          type="file"
                          hidden
                          onChange={(e) =>
                            handleFileChange(e, index, "video")
                          }
                          accept=".mp4"
                        />
                      </Button>

                      {vid.mediaPath && !vid.file && (
                        <IconButton
                          color="primary"
                          onClick={() => handleViewmultiVideo(vid.mediaPath)}
                          size="small"
                        >
                          <VisibilityIcon />
                        </IconButton>
                      )}

                      {index === 0 ? (
                        <IconButton
                          color="primary"
                          onClick={() => handleAddInput("video")}
                        >
                          <AddIcon />
                        </IconButton>
                      ) : (
                        <IconButton
                          color="error"
                          onClick={() => handleRemoveInput(index, "video")}
                        >
                          <RemoveIcon />
                        </IconButton>
                      )}
                    </Grid>
                  );
                })}
              </Grid>
            </Grid>
          )}

          <Box mt={4} display="flex" gap={2} justifyContent="center">
            <Button variant="contained" color="success" onClick={handleSubmit}>
              {editingEventId ? "Update" : "Submit"}
            </Button>

            <Button variant="contained" color="error" onClick={resetForm}>
              Cancel
            </Button>
          </Box>
        </form>
      </div>

      <div className="p-3 bg-white shadow-md rounded-lg border border-gray-200 mb-4">
        <CardHeading props={"List of Event and Training"} />
        <div
          style={{ display: "flex", justifyContent: "end", marginBottom: 16 }}
        >
          <TextField
            size="small"
            placeholder="Search..."
            value={searchText}
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

      <ReusableDialog
        open={openConfirm}
        title="Confirm Edit"
        description="Are you sure you want to edit this event?"
        onClose={() => setOpenConfirm(false)}
        onConfirm={handleEdit}
        disableBackdropClick={true}
      />
    </>
  );
};

export default AddEvent;
