import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Chip,
  Typography,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
} from "@mui/material";
import ReusableDataTable from "../../components/common/ReusableDataTable";
import CardHeading from "../../components/common/CardHeading";
import Loader from "../../components/common/Loader";
import { FaCamera } from "react-icons/fa";
import {
  viewVideoAndAudio,
  modelapprovedatasaveed,
} from "../../services/reportincedentservice";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import AttachmentIcon from "@mui/icons-material/Attachment";
import CloseIcon from "@mui/icons-material/Close";
import ReplayIcon from "@mui/icons-material/Replay";
import { toast } from "react-toastify";
import { encryptPayload } from "../../crypto/encryption";

const ReportIncedentViewList = () => {
  // const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [incidentData, setIncidentData] = useState(null);
  const [stageForwardedRules, setStageForwardedRules] = useState([]);
  const [openApproveModal, setOpenApproveModal] = useState(false);
  const [selectedForwardedId, setSelectedForwardedId] = useState(null);
  const [remark, setRemark] = useState("");
  const [attachedFile, setAttachedFile] = useState(null);
  const [selectedActionType, setSelectedActionType] = useState("");

  useEffect(() => {
    if (location.state?.incidentData) {
      const data = location.state.incidentData;
      if (Array.isArray(data) && data.length >= 2) {
        setIncidentData(data[0]);
        setStageForwardedRules(data[1]);
      }
    }
  }, [location.state]);

  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    return new Date(timestamp).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusChip = (status) => {
    const statusConfig = {
      PENDING: { color: "warning", label: "Pending" },
      RESOLVE: { color: "success", label: "Resolved" },
      REJECT: { color: "error", label: "Rejected" },
    };

    const config = statusConfig[status?.toUpperCase()] || {
      color: "default",
      label: status,
    };
    return (
      <Chip
        label={config.label}
        color={config.color}
        size="small"
        variant="filled"
      />
    );
  };

  const prepareTableData = () => {
    if (
      !incidentData ||
      !Array.isArray(incidentData) ||
      incidentData.length === 0
    ) {
      return [];
    }

    return incidentData.map((incident, index) => ({
      slNo: index + 1,
      name: incident.registrationUserName,
      college: incident.collegeName,
      mobile: incident.mobileNumber,
      dob: incident.dob,
      emergencyContact: incident.immediateContact1,
      incidentType:
        incident.incidentType === "Any Other"
          ? incident.otherIncidentname
          : incident.incidentType,
      incidentDate: formatDate(incident.incidentTimeTimestamp),
      reportedOn: formatDate(incident.incidentReportedOnTimestamp),
      location: incident.location || "N/A",
      uploadType: incident.uploadType,
      status: incident.status,
    }));
  };

  const getUploadedFiles = () => {
    if (!incidentData || !Array.isArray(incidentData)) return [];

    return incidentData.map((incident, index) => ({
      id: index + 1,
      type: incident.uploadType,
      filePath: incident.uploadFilePath,
      incidentType:
        incident.incidentType === "Any Other"
          ? incident.otherIncidentname
          : incident.incidentType,
    }));
  };

  const handleViewFile = async (filePath, uploadType) => {
    try {
      if (!filePath) {
        toast.error("File path not available");
        return;
      }

      const type = uploadType?.toUpperCase();
      let moduleName;

      if (type === "VIDEO") {
        moduleName = "SHAKTISHREE_VIDEO";
      } else if (type === "AUDIO") {
        moduleName = "SHAKTISHREE_AUDIO";
      } else if (type === "PHOTO" || type === "IMAGE") {
        moduleName = "SHAKTISHREE_PHOTO";
      } else {
        moduleName = "SHAKTISHREE_DOCUMENT";
      }

      const payload = { moduleName, filePath };
      const response = await viewVideoAndAudio(payload);

      const blob = new Blob([response.data], { type: getMimeType(type) });
      const blobUrl = URL.createObjectURL(blob);

      if (type === "VIDEO" || type === "AUDIO") {
        window.open(blobUrl, "_blank");
      } else if (type === "PHOTO" || type === "IMAGE" || type === "DOCUMENT") {
        window.open(blobUrl, "_blank");
      } else {
        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = filePath.split("/").pop() || "file";
        link.click();
      }

      setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
    } catch (err) {
      console.error("Error viewing file:", err);
      toast.error("Error loading file");
    }
  };

  const getMimeType = (fileType) => {
    const mimeTypes = {
      VIDEO: "video/mp4",
      AUDIO: "audio/mpeg",
      PHOTO: "image/jpeg",
      IMAGE: "image/jpeg",
      DOCUMENT: "application/pdf",
    };
    return mimeTypes[fileType] || "application/octet-stream";
  };

  const shouldShowButton = (rule) => {
    if (
      !incidentData ||
      !Array.isArray(incidentData) ||
      incidentData.length === 0
    )
      return false;

    const mainIncident = incidentData[0];
    const currentStage = mainIncident.stageForwaredId;

    if (!currentStage) return false;

    const isFromStageMatch =
      rule.fromStage.stageId === currentStage.toStage.stageId;
    const isShowInPage = rule.showInPage === true;

    return isFromStageMatch && isShowInPage;
  };

  const handleAction = (forwardedId, actionName) => {
    setSelectedForwardedId(forwardedId);
    setSelectedActionType(actionName);
    setOpenApproveModal(true);
  };

  const handleApproveSubmit = async () => {
    try {
      if (!remark.trim()) {
        toast.error("Please enter remarks");
        return;
      }
      if (!attachedFile) {
        toast.error("Please upload a document");
        return;
      }

      const mainIncident = incidentData[0];
      const payload = {
        forwardedId: selectedForwardedId,
        remark: remark.trim(),
        incidentId: mainIncident.reportIncidentDetailsId,
      };

      const encryptedPayload = encryptPayload(payload);
      setIsLoading(true);

      const response = await modelapprovedatasaveed(
        encryptedPayload,
        attachedFile
      );

      if (response.data?.outcome) {
        const message =
          response?.data?.message ||
          response?.data?.getMessage ||
          "Action completed successfully";
        toast.success(message);
        setOpenApproveModal(false);
        setRemark("");
        setAttachedFile(null);

        navigate("/incidentReportsPage", {
          state: { activeTab: selectedActionType === "RESOLVE" ? 1 : 2 },
        });
      } else {
        toast.error("Failed to process request");
      }
    } catch (err) {
      console.error("Error processing request:", err);
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  const columns = [
    {
      name: "SI No",
      selector: (row) => row.slNo,
      width: "100px",
      center: true,
    },
    {
      name: "Name",
      selector: (row) => row.name,
      sortable: true,
      wrap: true,
    },
    {
      name: "College",
      selector: (row) => row.college,
      sortable: true,
      wrap: true,
      width: "200px",
    },
    {
      name: "Mobile Number",
      selector: (row) => row.mobile,
      sortable: true,
      width: "160px",
    },
    {
      name: "Date of Birth",
      selector: (row) => row.dob,
      width: "150px",
    },
    {
      name: "Emergency Contact",
      selector: (row) => row.emergencyContact,
      width: "180px",
    },
    {
      name: "Incident Type",
      selector: (row) => row.incidentType,
      wrap: true,
      width: "150px",
    },
    {
      name: "Incident Date",
      selector: (row) => row.incidentDate,
      width: "180px",
    },
    {
      name: "Reported On",
      selector: (row) => row.reportedOn,
      width: "150px",
    },
    {
      name: "Location",
      selector: (row) => row.location,
    },
    {
      name: "Upload Type",
      selector: (row) => row.uploadType,
      width: "150px",
    },
    {
      name: "Status",
      cell: (row) => getStatusChip(row.status),
      center: true,
    },
  ];

  const fileColumns = [
    {
      name: "SI No",
      selector: (row) => row.id,
      sortable: true,
      width: "100px",
      center: true,
    },
    {
      name: "File Type",
      selector: (row) => row.type,
      sortable: true,
      width: "120px",
    },
    {
      name: "Incident Type",
      selector: (row) => row.incidentType,
      sortable: true,
      // width: "200px",
    },
    {
      name: "View Media",
      center: true,
      width: "200px",
      selector: (row) => row.filePath,
      sortable: true,
      cell: (row) => (
        <Tooltip title={`View ${row.type}`}>
          <IconButton
            onClick={() => handleViewFile(row.filePath, row.type)}
            color="primary"
            size="small"
            sx={{
              backgroundColor: "#e3f2fd",
              borderRadius: "8px",
              "&:hover": {
                backgroundColor: "#bbdefb",
              },
            }}
          >
            <FaCamera fontSize="medium" />
          </IconButton>
        </Tooltip>
      ),
    },
  ];

  if (isLoading) {
    return <Loader />;
  }

  if (!incidentData) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>No incident data found.</Typography>
      </Box>
    );
  }

  const currentStatus = incidentData && incidentData[0]?.status?.toUpperCase();
  const showActionButtons = currentStatus === "PENDING";

  return (
    <>
      <Box
        sx={{
          p: 3,
          mb: 4,
          borderRadius: 2,
          backgroundColor: "white",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        }}
      >
        <CardHeading props={"Report Incident Details"} />

        <ReusableDataTable
          columns={columns}
          data={prepareTableData()}
          highlightOnHover
          dense
        />

        {getUploadedFiles().length > 0 && (
          <Box mt={6}>
            <CardHeading props={"Uploaded Files"} />
            <ReusableDataTable
              columns={fileColumns}
              data={getUploadedFiles()}
              pagination={false}
              highlightOnHover
              striped
            />
          </Box>
        )}

        <div className="mt-6 flex gap-4 flex-wrap">
          <Button onClick={handleBack} variant="contained" color="error">
            Back
          </Button>

          {showActionButtons && (
            <>
              {stageForwardedRules.map(
                (rule) =>
                  shouldShowButton(rule) && (
                    <button
                      key={rule.forwardedId}
                      onClick={() =>
                        handleAction(
                          rule.forwardedId,
                          rule.actionType.actionNameEn
                        )
                      }
                      className={`font-bold py-2 px-4 rounded ${
                        rule.actionType.actionNameEn === "RESOLVE"
                          ? "bg-green-500 hover:bg-green-700 text-white"
                          : rule.actionType.actionNameEn === "REJECT"
                          ? "bg-amber-500 hover:bg-amber-700 text-white"
                          : "bg-blue-500 hover:bg-blue-700 text-white"
                      }`}
                    >
                      {rule.actionType.actionNameEn}
                    </button>
                  )
              )}
            </>
          )}
        </div>
      </Box>

      <Dialog
        open={openApproveModal}
        onClose={() => setOpenApproveModal(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
          },
        }}
      >
        <DialogTitle
          sx={{
            backgroundColor:
              selectedActionType === "RESOLVE"
                ? "success.main"
                : "warning.main",
            color: "white",
            fontWeight: "bold",
            py: 2,
          }}
        >
          <Box display="flex" alignItems="center" gap={1}>
            {selectedActionType === "RESOLVE" ? (
              <CheckCircleIcon />
            ) : (
              <ReplayIcon />
            )}
            {selectedActionType === "RESOLVE"
              ? "Resolve Incident"
              : "Reject Incident"}
          </Box>
        </DialogTitle>

        <DialogContent dividers sx={{ py: 3 }}>
          <Box display="flex" flexDirection="column" gap={3}>
            <Box>
              <Typography
                variant="subtitle2"
                fontWeight="bold"
                color="text.primary"
                gutterBottom
              >
                Remarks  <span style={{color:"red"}}>*</span>
              </Typography>
              <TextField
                placeholder="Enter your remarks or comments..."
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
                fullWidth
                multiline
                rows={3}
                variant="outlined"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 1,
                    "&:hover fieldset": {
                      borderColor: "primary.main",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "primary.main",
                      borderWidth: 2,
                    },
                  },
                }}
              />
            </Box>

            <Box>
              <Typography
                variant="subtitle2"
                fontWeight="bold"
                color="text.primary"
                gutterBottom
              >
                Attach File <span style={{color:"red"}}>*</span>
              </Typography>
              <Button
                variant="outlined"
                component="label"
                startIcon={<CloudUploadIcon />}
                sx={{
                  border: "2px dashed",
                  borderColor: "grey.300",
                  py: 1.5,
                  width: "100%",
                  "&:hover": {
                    borderColor: "primary.main",
                    backgroundColor: "primary.light",
                  },
                }}
              >
                Click to Upload File
                <input
                  type="file"
                  hidden
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (!file) return;

                    if (file.type !== "application/pdf") {
                      toast.error("Only PDF files are allowed!");
                      e.target.value = null;
                      return;
                    }

                    const maxSizeInBytes = 2 * 1024 * 1024;
                    if (file.size > maxSizeInBytes) {
                      toast.error("File size cannot exceed 2MB");
                      e.target.value = null;
                      return;
                    }

                    setAttachedFile(file);
                  }}
                  accept=".pdf"
                />
              </Button>

              {attachedFile && (
                <Box
                  sx={{
                    mt: 2,
                    p: 2,
                    backgroundColor:
                      selectedActionType === "RESOLVE"
                        ? "success.light"
                        : "warning.light",
                    borderRadius: 1,
                    border: "1px solid",
                    borderColor:
                      selectedActionType === "RESOLVE"
                        ? "success.main"
                        : "warning.main",
                  }}
                >
                  <Box display="flex" alignItems="center" gap={1}>
                    <AttachmentIcon fontSize="small" />
                    <Typography variant="body2" fontWeight="medium">
                      {attachedFile.name}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={() => setAttachedFile(null)}
                      sx={{ ml: "auto" }}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    Size: {(attachedFile.size / 1024 / 1024).toFixed(2)} MB
                  </Typography>
                </Box>
              )}
            </Box>

            <Box
              sx={{
                p: 1.5,
                backgroundColor: "grey.50",
                borderRadius: 1,
                border: "1px solid",
                borderColor: "grey.200",
              }}
            >
              <Typography variant="caption" color="text.secondary">
                Supported formats: PDF
              </Typography>
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button
            onClick={() => setOpenApproveModal(false)}
            variant="contained"
            color="error"
            sx={{
              borderRadius: 1,
              px: 3,
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleApproveSubmit}
            variant="contained"
            color={selectedActionType === "RESOLVE" ? "success" : "warning"}
            disabled={!remark.trim()}
            sx={{
              borderRadius: 1,
              px: 3,
              fontWeight: "bold",
              boxShadow:
                selectedActionType === "RESOLVE"
                  ? "0 2px 8px rgba(76, 175, 80, 0.3)"
                  : "0 2px 8px rgba(244, 67, 54, 0.3)",
              "&:hover": {
                boxShadow:
                  selectedActionType === "RESOLVE"
                    ? "0 4px 12px rgba(76, 175, 80, 0.4)"
                    : "0 4px 12px rgba(244, 67, 54, 0.4)",
              },
            }}
          >
            {selectedActionType === "RESOLVE"
              ? "Resolve Incident"
              : "Reject Incident"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ReportIncedentViewList;
