import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { RxCross2 } from "react-icons/rx";
import {
  Button,
  InputAdornment,
  MenuItem,
  Pagination,
  Select,
  TextField,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  FormControl,
  InputLabel,
  Box,
  IconButton,
} from "@mui/material";
import {
  addKnowledgeOptions,
  changeDocStatus,
  editDoc,
  saveKnowledgeDoc,
} from "../../services/knowledgeService";
import { encryptPayload } from "../../crypto/encryption";
import { ImCross } from "react-icons/im";
import { TiTick } from "react-icons/ti";
import CardHeading from "../../components/common/CardHeading";
import ReusableDataTable from "../../components/common/ReusableDataTable";
import SearchIcon from "@mui/icons-material/Search";
import Loader from "../../components/common/Loader";
import { FaEdit, FaEye, FaMinus, FaPlus } from "react-icons/fa";
import ActionButtons from "../../components/common/ActionButtons";
import ReusableDialog from "../../components/common/ReusableDialog";
import { viewDocumentAdd } from "../../services/LearningTypeService";

const KnowledgeAdd = () => {
  const [loading, setLoading] = useState(false);
  const [knowledgeRows, setKnowledgeRows] = useState([
    {
      documentType: "",
      documentName: "",
      documentPath: null,
      description: "",
    },
  ]);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [selectedDocumentId, setSelectedDocumentId] = useState(null);

  const handleInp = (e, index) => {
    const { name, value, files } = e.target;
    const updatedRows = [...knowledgeRows];

    if (name === "documentPath" && files && files[0]) {
      const file = files[0];

      // Validate file type
      if (file.type !== "application/pdf") {
        toast.error("Please upload only PDF files");
        return;
      }

      // Validate file size (500KB = 500 * 1024 bytes)
      if (file.size > 500 * 1024) {
        toast.error("File size should be less than 500KB");
        return;
      }

      updatedRows[index][name] = file;

      // Reset the file input to allow selecting the same file again in the future
      // This is needed because browsers don't trigger onChange for the same file
      setTimeout(() => {
        e.target.value = "";
      }, 0);
    } else {
      updatedRows[index][name] = value;
    }

    setKnowledgeRows(updatedRows);
  };

  const handleAddRow = () => {
    const lastRow = knowledgeRows[knowledgeRows.length - 1];

    // Check if all required fields are filled
    // For documentType, check if it's not empty (could be string or object)
    const isDocumentTypeFilled =
      lastRow.documentType &&
      (typeof lastRow.documentType === "string"
        ? lastRow.documentType.trim()
        : true);

    // For edit mode, we should have either a new documentPath or an existingDocumentPath
    const hasValidDocument =
      lastRow.documentPath || lastRow.existingDocumentPath;

    if (
      !isDocumentTypeFilled ||
      !lastRow.documentName.trim() ||
      !lastRow.description.trim() ||
      !hasValidDocument
    ) {
      toast.error("Please fill all fields before adding a new row!");
      return;
    }

    setKnowledgeRows([
      ...knowledgeRows,
      {
        documentType: "",
        documentName: "",
        documentPath: null,
        description: "",
      },
    ]);
  };

  const handleRemoveRow = (index) => {
    if (knowledgeRows.length > 1) {
      const updated = [...knowledgeRows];
      updated.splice(index, 1);
      setKnowledgeRows(updated);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      for (let i = 0; i < knowledgeRows.length; i++) {
        const row = knowledgeRows[i];

        const isDocumentTypeValid =
          row.documentType &&
          (typeof row.documentType === "string"
            ? row.documentType.trim()
            : true);

        const hasValidDocument = row.documentPath || row.existingDocumentPath;

        if (
          !isDocumentTypeValid ||
          !row.documentName.trim() ||
          !row.description.trim() ||
          !hasValidDocument
        ) {
          toast.error(
            `Please fill all fields in row ${i + 1} before submitting!`
          );
          return;
        }
      }

      const formData = new FormData();

      const dataToEncrypt = knowledgeRows.map((row) => ({
        documentType: row.documentType,
        documentName: row.documentName,
        description: row.description,
        documentCode: row.documentCode,
        existingDocumentPath: row.existingDocumentPath || null,
      }));

      const encryptedPayload = encryptPayload(JSON.stringify(dataToEncrypt));
      formData.append("cipherText", encryptedPayload);
      knowledgeRows.forEach((row) => {
        if (row.documentPath instanceof File) {
          formData.append("docFile", row.documentPath);
        }
      });

      const res = await saveKnowledgeDoc(formData);

      if (res?.data?.outcome) {
        toast.success("Knowledge document saved successfully!");
        await getOptions();
        setKnowledgeRows([
          {
            documentType: "",
            documentName: "",
            documentPath: null,
            description: "",
          },
        ]);
      } else {
        toast.error(res?.data?.message || "Failed to save document.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error saving knowledge document");
    } finally {
      setLoading(false);
    }
  };

  const [options, setOptions] = useState([]);
  const [tableData, setTableData] = useState([]);

  const getOptions = async () => {
    try {
      setLoading(true);
      const res = await addKnowledgeOptions();
      setOptions(res?.data.data[0]);
      setTableData(res?.data.data[1]);
    } catch (error) {
      console.log(error);
      toast.error("Error fetching knowledge data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getOptions();
  }, []);

  const changeStatus = async (id) => {
    try {
      setLoading(true);
      const payload = encryptPayload(id);
      await changeDocStatus(payload);
      getOptions();
    } catch (error) {
      toast.error(error.message || "Error changing document status");
    } finally {
      setLoading(false);
    }
  };

  
  const editDocument = async (id) => {
    setSelectedDocumentId(id);
    setOpenConfirm(true);
  };

  const handleEditConfirm = async () => {
    if (!selectedDocumentId) return;
    setOpenConfirm(false);
    
    try {
      setLoading(true);
      const payload = encryptPayload(selectedDocumentId);
      const res = await editDoc(payload);
      const editedRow = {
        ...res?.data.data,
        documentType: res?.data.data.documentType.documentTypeId,
        existingDocumentPath: res?.data.data.documentPath,
        documentPath: null,
      };
      
      setSelectedDocumentId(null);
      setKnowledgeRows([editedRow]);
      setTimeout(() => {
        const faqTypeNameField = document.querySelector('input[name="documentName"]');
        if (faqTypeNameField) {

          faqTypeNameField.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'nearest'
          });

          faqTypeNameField.focus();
        }
      }, 200);
    } catch (error){
      toast.error(error.message || "Error fetching document details");
      setOpenConfirm(false);
      setSelectedDocumentId(null);
    } finally {
      setLoading(false);
    }
  };

  const handleViewPdf = async (pdfPath) => {
    try {
      if (!pdfPath) {
        toast.error("No PDF available to view.");
        return;
      }

      const res = await viewDocumentAdd(null, {
        params: {
          moduleName: "SKS_DOC",
          filePath: pdfPath,
        },
        responseType: "blob",
      });

      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");

      setTimeout(() => URL.revokeObjectURL(url), 5000);
    } catch (error) {
      console.error("Error viewing PDF:", error);
      toast.error("Failed to open PDF.");
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
      name: "Knowledge Type Name",
      selector: (row) => row.documentType?.documentTypeName,
      sortable: true,
    },
    {
      name: "Knowledge Name",
      selector: (row) => row.documentName,
      sortable: true,
    },
    {
      name: "View",
      cell: (row) =>
        row.documentPath ? (
          <Button
            variant="contained"
            color="warning"
            sx={{ minWidth: 36, padding: "6px" }}
            size="small"
            title="View Document"
            onClick={() => handleViewPdf(row.documentPath)}
          >
            <FaEye size={12} />
          </Button>
        ) : (
          <Typography
            variant="body2"
            color="textSecondary"
            textAlign={"center"}
          >
            No document
          </Typography>
        ),
      sortable: true,
      width: "100px",
      center: true,
    },
    {
      name: "Action",
      cell: (row) => (
        <ActionButtons
          row={row}
          onEdit={(row) => editDocument(row.documentCode)}
          onToggleStatus={(row) => changeStatus(row.documentCode)}
          editDisabled={!row.isActive}
          scrollToForm={true}
        />
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
    },
  ];

  const [searchText, setSearchText] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const filteredData = (tableData || []).filter(
    (row) =>
      (row?.documentType?.documentTypeName || "")
        .toLowerCase()
        .includes(searchText.toLowerCase()) ||
      (row?.documentName || "").toLowerCase().includes(searchText.toLowerCase())
  );

  const paginatedData = filteredData.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  return (
    <>
      <Loader loading={loading} />
      <ReusableDialog
        open={openConfirm}
        title="Confirm Edit"
        description="Are you sure you want to edit this knowledge document?"
        onClose={() => {
          setOpenConfirm(false);
          setSelectedDocumentId(null);
        }}
        onConfirm={handleEditConfirm}
        disableBackdropClick={true}
      />

      <div className="p-4 border border-solid border-slate-300 rounded-md bg-white">
        <CardHeading props={"Knowledge Section"} />

        <form onSubmit={handleSubmit}>
          <TableContainer component={Paper} sx={{ marginBottom: 3 }}>
            <Table sx={{ minWidth: 650 }} size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: "#e3f2fd" }}>
                  <TableCell
                    sx={{ fontWeight: "bold", border: "1px solid #e0e0e0" }}
                  >
                    Sl. No.
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: "bold", border: "1px solid #e0e0e0" }}
                  >
                    Knowledge Type
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: "bold", border: "1px solid #e0e0e0" }}
                  >
                    Knowledge Name
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: "bold", border: "1px solid #e0e0e0" }}
                  >
                    Knowledge Path <br></br>
                    <span style={{ fontSize: "11px", color: "red" }}>
                      (Upload only in PDF and Max Size-500KB)
                    </span>
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: "bold", border: "1px solid #e0e0e0" }}
                  >
                    Description
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: "bold",
                      border: "1px solid #e0e0e0",
                      textAlign: "center",
                    }}
                  >
                    Action
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {knowledgeRows.map((row, index) => (
                  <TableRow key={index} hover>
                    <TableCell
                      sx={{ border: "1px solid #e0e0e0", textAlign: "center" }}
                    >
                      {index + 1}
                    </TableCell>
                    <TableCell
                      sx={{ border: "1px solid #e0e0e0", width: "200px" }}
                    >
                      <FormControl fullWidth size="small">
                        <InputLabel>Select Type</InputLabel>
                        <Select
                          name="documentType"
                          value={row.documentType}
                          onChange={(e) => handleInp(e, index)}
                          label="Select Type"
                          disabled={loading}
                        >
                          <MenuItem value="">
                            <em>--Select--</em>
                          </MenuItem>
                          {options?.map((i, idx) => (
                            <MenuItem key={idx} value={i.documentTypeId}>
                              {i.documentTypeName}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </TableCell>
                    <TableCell sx={{ border: "1px solid #e0e0e0" }}>
                      <TextField
                        name="documentName"
                        value={row.documentName}
                        onChange={(e) => handleInp(e, index)}
                        size="small"
                        fullWidth
                        disabled={loading}
                        placeholder="Enter knowledge name"
                      />
                    </TableCell>
                    <TableCell sx={{ border: "1px solid #e0e0e0" }}>
                      <div className="flex gap-2 items-center">
                        <Button
                          variant="contained"
                          component="label"
                          size="small"
                          fullWidth
                          disabled={loading}
                          style={{
                            fontSize: "11px",
                            height: "40px",
                            position: "relative",
                            overflow: "hidden",
                          }}
                        >
                          {row.documentPath
                            ? row.documentPath.name ||
                            row.documentPath.split("/").pop() ||
                            "document.pdf"
                            : row.existingDocumentPath
                              ? row.existingDocumentPath.split("/").pop() ||
                              "document.pdf"
                              : "Upload PDF *"}
                          <input
                            type="file"
                            name="documentPath"
                            hidden
                            accept=".pdf"
                            onChange={(e) => handleInp(e, index)}
                          />
                        </Button>

                        {/* Show remove button when a file is selected */}
                        {(row.documentPath || row.existingDocumentPath) && (
                          <IconButton
                            color="error"
                            size="small"
                            onClick={() => {
                              const updatedRows = [...knowledgeRows];
                              updatedRows[index].documentPath = null;
                              updatedRows[index].existingDocumentPath = null;
                              setKnowledgeRows(updatedRows);

                              // Also reset the file input to allow selecting the same file again
                              const fileInputs = document.querySelectorAll(
                                'input[name="documentPath"]'
                              );
                              if (fileInputs[index]) {
                                fileInputs[index].value = "";
                              }
                            }}
                            style={{ height: "fit-content" }}
                          >
                            <RxCross2 />
                          </IconButton>
                        )}
                      </div>
                    </TableCell>
                    <TableCell sx={{ border: "1px solid #e0e0e0" }}>
                      <TextField
                        name="description"
                        value={row.description}
                        onChange={(e) => handleInp(e, index)}
                        size="small"
                        fullWidth
                        disabled={loading}
                        placeholder="Enter description"
                      />
                    </TableCell>
                    <TableCell
                      sx={{ border: "1px solid #e0e0e0", textAlign: "center" }}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          type="button"
                          variant="contained"
                          color="primary"
                          size="small"
                          onClick={handleAddRow}
                          disabled={loading}
                          sx={{ minWidth: 36, padding: "6px" }}
                          aria-label="Add Row"
                        >
                          <FaPlus />
                        </Button>
                        {knowledgeRows.length > 1 && (
                          <Button
                            type="button"
                            variant="contained"
                            color="error"
                            size="small"
                            onClick={() => handleRemoveRow(index)}
                            disabled={loading}
                            sx={{ minWidth: 36, padding: "6px" }}
                            aria-label="Remove Row"
                          >
                            <FaMinus />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Box
            sx={{
              padding: 3,
              backgroundColor: "#f3f6ff",
              marginTop: 2,
              display: "flex",
              justifyContent: "center",
              gap: 2,
            }}
          >
            <Button
              variant="contained"
              color="success"
              type="submit"
              disabled={loading}
            >
              {/* Show "Update" if we're editing (existingDocumentPath exists) otherwise "Save" */}
              {knowledgeRows.some((row) => row.existingDocumentPath)
                ? "Update"
                : "Save"}
            </Button>
            <Button
              variant="contained"
              color="error"
              disabled={loading}
              onClick={() => {
                // Clear all fields by resetting to initial state
                setKnowledgeRows([
                  {
                    documentType: "",
                    documentName: "",
                    documentPath: null,
                    description: "",
                  },
                ]);
              }}
            >
              Cancel
            </Button>
          </Box>
        </form>
      </div>

      <div className="p-4 border border-solid border-slate-300 rounded-md bg-white mt-3">
        <CardHeading props={"Knowledge List"} />
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
            disabled={loading}
          />
        </div>
        <ReusableDataTable data={paginatedData} columns={columns} />
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
              disabled={loading}
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
            disabled={loading}
          />
        </div>
      </div>
    </>
  );
};

export default KnowledgeAdd;
