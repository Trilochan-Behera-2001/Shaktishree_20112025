import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Box,
  Typography,
  Button,
  CircularProgress,
} from "@mui/material";
import { MdClose, MdDownload } from "react-icons/md";
import { toast } from "react-toastify";

const DocumentViewer = ({
  open,
  onClose,
  documentPath,
  documentName,
  viewDocumentService,
  moduleName,
}) => {
  const [loading, setLoading] = useState(false);
  const [documentUrl, setDocumentUrl] = useState("");
  const [fileType, setFileType] = useState("");

  // useEffect(() => {
  //   if (open && documentPath) {
  //     fetchDocument();
  //   }

  //   // Cleanup URL object when component unmounts
  //   return () => {
  //     if (documentUrl) {
  //       URL.revokeObjectURL(documentUrl);
  //     }
  //   };
  // }, [open, documentPath, documentUrl, fetchDocument]);

  useEffect(() => {
    const fetchDocument = async () => {
      if (!documentPath || !viewDocumentService) return;

      setLoading(true);
      try {
        // Determine file type from extension
        const extension = documentPath.split(".").pop().toLowerCase();
        setFileType(extension);

        // For direct URLs, we can use them directly
        if (documentPath.startsWith("http")) {
          setDocumentUrl(documentPath);
          return;
        }

        // For local files, fetch through the service
        const res = await viewDocumentService(null, {
          params: {
            moduleName: moduleName || "LEARNING_MNGMNT",
            filePath: documentPath,
          },
          responseType: "blob",
        });

        const blob = new Blob([res.data]);
        const url = URL.createObjectURL(blob);
        setDocumentUrl(url);
      } catch (err) {
        console.error("Error fetching document:", err);
        toast.error("Failed to load document.");
      } finally {
        setLoading(false);
      }
    };

    if (open && documentPath) {
      fetchDocument();
    }

    // Cleanup URL object when component unmounts
    return () => {
      if (documentUrl) {
        URL.revokeObjectURL(documentUrl);
      }
    };
  }, [open, documentPath, documentUrl, viewDocumentService, moduleName]);

  const handleDownload = () => {
    if (documentUrl) {
      const link = document.createElement("a");
      link.href = documentUrl;
      link.download = documentName || "document";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const renderDocument = () => {
    if (loading) {
      return (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "400px",
          }}
        >
          <CircularProgress />
        </Box>
      );
    }

    if (!documentUrl) {
      return (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "400px",
          }}
        >
          <Typography>No document available</Typography>
        </Box>
      );
    }

    // Handle different file types
    switch (fileType) {
      case "pdf":
        return (
          <iframe
            src={documentUrl}
            style={{ width: "100%", height: "600px", border: "none" }}
            title="PDF Viewer"
          />
        );
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
        return (
          <Box sx={{ textAlign: "center", p: 2 }}>
            <img
              src={documentUrl}
              alt={documentName || "Document"}
              style={{ maxWidth: "100%", maxHeight: "600px" }}
            />
          </Box>
        );
      default:
        // For other file types, provide download option
        return (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              height: "400px",
              gap: 2,
            }}
          >
            <Typography>
              Preview not available for this file type (.${fileType})
            </Typography>
            <Button
              variant="contained"
              startIcon={<MdDownload />}
              onClick={handleDownload}
            >
              Download File
            </Button>
          </Box>
        );
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2, minHeight: "500px" },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          pb: 1,
        }}
      >
        <Typography variant="h6">
          {documentName || "Document Viewer"}
        </Typography>
        <IconButton onClick={onClose} size="small">
          <MdClose />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: 0 }}>{renderDocument()}</DialogContent>
    </Dialog>
  );
};

export default DocumentViewer;