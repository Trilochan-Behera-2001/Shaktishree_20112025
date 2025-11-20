import { useEffect, useState } from "react";
import {
  TextField,
  Button,
  MenuItem,
  InputAdornment,
  Select,
  Typography,
  Pagination,
} from "@mui/material";
import {  FaEye } from "react-icons/fa";
import { encryptPayload } from "../../crypto/encryption";
import {
  editFaqQuestion,
  getAllFaq,
  saveOrUpdateFaq,
  toggleFAQStatus,
} from "../../services/faqService";
import { RxCross2 } from "react-icons/rx";
import ReusableDataTable from "../../components/common/ReusableDataTable";
import CardHeading from "../../components/common/CardHeading";
import SearchIcon from "@mui/icons-material/Search";
import { toast } from "react-toastify";
import Loader from "../../components/common/Loader";
import ActionButtons from "../../components/common/ActionButtons";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import ReusableDialog from "../../components/common/ReusableDialog";
import { viewDocumentAdd } from "../../services/LearningTypeService";

const FaqQuestionAnswer = () => {
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [toggleLoading, setToggleLoading] = useState(false);
  const [faq, setFaqs] = useState([]);
  const [opt, setOtp] = useState([]);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedRowForEdit, setSelectedRowForEdit] = useState(null);
  
  let fileInputRef = null;

  
  const resetFileInput = () => {
    if (fileInputRef) {
      fileInputRef.value = "";
    }
  };

  const validationSchema = yup.object().shape({
    faqTypeId: yup.string().required("FAQ Type is required"),
    questionName: yup.string().required("Question is required"),
    answerName: yup.string().required("Answer is required"),
    questionAnswerDescription: yup.string().required("Description is required"),

    attachmentDoc: yup
      .mixed()
      .nullable()
      .test("file-validation", function (value) {
        const { existingDocumentPath, questionAnswerId, questionAnswerCode } =
          this.parent;

        console.log("Attachment validation triggered:", {
          value,
          existingDocumentPath,
          questionAnswerId,
          questionAnswerCode,
        });

        const isEditMode = !!(questionAnswerId || questionAnswerCode);

        if (isEditMode) {
          if (existingDocumentPath === null && !(value instanceof File)) {
            return this.createError({
              message: "Please upload a document or keep the existing one",
            });
          }

          if (value instanceof File) {
            if (value.size === 0) {
              return this.createError({
                message:
                  "Empty files are not allowed. Please upload a valid file.",
              });
            }

            if (
              value.type !== "application/pdf" &&
              !value.name.toLowerCase().endsWith(".pdf")
            ) {
              return this.createError({
                message: "Only PDF files are allowed",
              });
            }

            if (value.size > 5 * 1024 * 1024) {
              return this.createError({
                message: "File size should not exceed 5MB",
              });
            }
          }

          return true;
        } else {
          if (!(value instanceof File)) {
            return this.createError({ message: "" });
          }

          if (value.size === 0) {
            return this.createError({
              message:
                "Empty files are not allowed. Please upload a valid file.",
            });
          }

          if (
            value.type !== "application/pdf" &&
            !value.name.toLowerCase().endsWith(".pdf")
          ) {
            return this.createError({ message: "Only PDF files are allowed" });
          }

          if (value.size > 5 * 1024 * 1024) {
            return this.createError({
              message: "File size should not exceed 5MB",
            });
          }

          return true;
        }
      }),
  });

  const {
    control,
    handleSubmit: handleFormSubmit,
    reset,
    setValue,
    watch,
    trigger,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      faqTypeId: "",
      questionName: "",
      answerName: "",
      questionAnswerDescription: "",
      attachmentDoc: null,
      existingDocumentPath: null,
    },
    mode: "onChange",
    reValidateMode: "onChange",
  });

  const formData = watch();



  const getData = async () => {
    try {
      setLoading(true);
      const res = await getAllFaq();
      setOtp(res?.data.data[0]);
      setFaqs(res?.data.data[1]);
    } catch (error) {
      console.error("Error fetching FAQ data:", error);
      toast.error("Error fetching FAQ data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setValue("attachmentDoc", file, { shouldValidate: true });
    } else {
      setValue("attachmentDoc", null, { shouldValidate: true });
    }

    setTimeout(() => {
      if (e.target && file) {
        e.target.value = "";
      }
    }, 0);
  };

  const onSubmit = async (data) => {
    if (Object.keys(errors).length > 0) {
      toast.error("Please fix validation errors before submitting");
      return;
    }

    const isEditMode = !!(
      formData.questionAnswerId || formData.questionAnswerCode
    );
    const hasExistingDocument = !!formData.existingDocumentPath;
    const hasNewDocument = data.attachmentDoc instanceof File;

    if (hasNewDocument && data.attachmentDoc.size === 0) {
      toast.error("Empty files are not allowed. Please upload a valid file.");
      return;
    }

    if (isEditMode) {
      if (!hasExistingDocument && !hasNewDocument) {
        setTimeout(() => {
          trigger("attachmentDoc");
        }, 0);
        toast.error("Please upload a document or keep the existing one");
        return;
      }
    } else {
      if (!hasNewDocument) {
        toast.error("Please upload a document for this FAQ entry");
        return;
      }

      if (hasNewDocument && data.attachmentDoc.size === 0) {
        toast.error("Empty files are not allowed. Please upload a valid file.");
        return;
      }
    }

    try {
      setSubmitLoading(true);

      const payloadData = {
        faqTypeId: data.faqTypeId,
        questionName: data.questionName,
        answerName: data.answerName,
        questionAnswerDescription: data.questionAnswerDescription,
        ...(formData.questionAnswerCode && {
          questionAnswerCode: formData.questionAnswerCode,
        }),
        ...(formData.questionAnswerId && {
          questionAnswerId: formData.questionAnswerId,
        }),
        attachmentPath: hasNewDocument
          ? null
          : formData.existingDocumentPath || null,
      };

      const encryptedPayload = encryptPayload(payloadData);
      const formDataToSend = new FormData();
      formDataToSend.append("cipherText", encryptedPayload);

      if (hasNewDocument) {
        formDataToSend.append("attachmentDoc", data.attachmentDoc);
      }

      const response = await saveOrUpdateFaq(formDataToSend);

      if (response.status === 200) {
        toast.success(response.data.message);
        await getData();
        handleCancel();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Error saving FAQ:", error);
      toast.error("Error saving FAQ");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleEditClick = (row) => {
    setSelectedRowForEdit(row);
    setEditModalOpen(true);
  };

  const handleEditConfirm = async () => {
    if (!selectedRowForEdit) return;

    try {
      setEditLoading(true);
      setEditModalOpen(false);
      const payload = encryptPayload(selectedRowForEdit.questionAnswerCode);
      const res = await editFaqQuestion(payload);
      const data = res?.data?.data;

      if (data) {
        const resetData = {
          faqTypeId: data.faqType?.faqTypeId
            ? data.faqType.faqTypeId.toString()
            : "",
          questionName: data.questionName || "",
          answerName: data.answerName || "",
          questionAnswerDescription: data.questionAnswerDescription || "",
          attachmentDoc: null,
          existingDocumentPath: data.attachmentPath || null,
        };

        console.log("Reset data:", resetData);
        reset(resetData, { keepErrors: false });

        setValue("questionAnswerCode", data.questionAnswerCode || "");
        setValue("questionAnswerId", data.questionAnswerId || "");
        setTimeout(() => {
            const faqTypeNameField = document.querySelector('input[name="questionName"]');
            if (faqTypeNameField) {
                faqTypeNameField.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'center',
                    inline: 'nearest'
                });
                
                faqTypeNameField.focus();
            }
        }, 200);
      }
    } catch (error) {
      console.error("Error fetching FAQ details:", error);
      toast.error("Error fetching FAQ details");
    } finally {
      setEditLoading(false);
      setSelectedRowForEdit(null);
    }
  };

  const handleEditCancel = () => {
    setEditModalOpen(false);
    setSelectedRowForEdit(null);
  };

  const changeStatus = async (row) => {
    try {
      setToggleLoading(true);
      const payload = encryptPayload(row.questionAnswerCode);
      const res = await toggleFAQStatus(payload);

      if (res?.data?.outcome === true) {
        toast.success(res?.data?.message || "Status updated successfully");
        getData();
      } else {
        toast.error(res?.data?.message || "Failed to update status");
      }
    } catch (error) {
      console.error("Error toggling FAQ status:", error);
      toast.error("Error toggling FAQ status");
    } finally {
      setToggleLoading(false);
    }
  };

  const handleCancel = () => {
    reset({
      faqTypeId: "",
      questionName: "",
      answerName: "",
      questionAnswerDescription: "",
      attachmentDoc: null,
      existingDocumentPath: null,
    });
    setValue("questionAnswerCode", "");
    setValue("questionAnswerId", "");
  };

  // Handle document viewing
  const handleViewPdf = async (pdfPath) => {
    try {
      if (!pdfPath) {
        toast.error("No PDF available to view.");
        return;
      }

      const res = await viewDocumentAdd(null, {
        params: {
          moduleName: "FAQ-DOC",
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
      name: "FAQ Type Name",
      selector: (row) => row.faqTypeName,
      sortable: true,
    },
    {
      name: "Question Name",
      selector: (row) => row.questionName,
      sortable: true,
    },
    {
      name: "Answer Name",
      selector: (row) => row.answerName,
      sortable: true,
    },
    {
      name: "Question Answer Description",
      selector: (row) => row.questionAnswerDescription,
      sortable: true,
    },
    {
      name: "Question Answer Code",
      selector: (row) => row.questionAnswerCode,
      sortable: true,
    },
    {
      name: "Action",
      cell: (row) => (
        <ActionButtons
          row={row}
          onEdit={handleEditClick}
          onToggleStatus={changeStatus}
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
  const filteredData = (faq || []).filter(
    (row) =>
      (row?.faqTypeName || "")
        .toLowerCase()
        .includes(searchText.toLowerCase()) ||
      (row?.faqTypeDescription || "")
        .toLowerCase()
        .includes(searchText.toLowerCase()) ||
      (row?.questionName || "").toLowerCase().includes(searchText.toLowerCase())
  );
  const paginatedData = filteredData.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  if (loading && faq.length === 0) {
    return <Loader loading={true} />;
  }

  return (
    <div className="space-y-6 py-3">
      {/* Add the edit confirmation dialog */}
      <ReusableDialog
        open={editModalOpen}
        title="Confirm Edit"
        description="Are you sure you want to edit this FAQ entry?"
        onClose={handleEditCancel}
        onConfirm={handleEditConfirm}
      />

      {/* Loader for all operations */}
      <Loader loading={submitLoading || editLoading || toggleLoading} />

      {/* Form Section */}
      <div className="p-4 border border-solid border-slate-300 rounded-md bg-white">
        <CardHeading props={"Add Question Answer FAQ"} />
        <form
          onSubmit={(e) => {
            console.log("Form submit event triggered");
            console.log("Current form data:", formData);
            console.log("Current errors:", errors);
            e.preventDefault();
            handleFormSubmit(onSubmit)(e);
          }}
          className="w-full"
          encType="multipart/form-data"
        >
          <div className="grid grid-cols-12 gap-4 items-center">
            {/* FAQ Type */}
            <div className="col-span-12 md:col-span-2">
              <Controller
                name="faqTypeId"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    label={
                      <span>
                        FAQ Type <span style={{ color: "red" }}>*</span>
                      </span>
                    }
                    size="small"
                    fullWidth
                    disabled={submitLoading || editLoading || toggleLoading}
                    error={!!errors.faqTypeId}
                    helperText={errors.faqTypeId?.message}
                    variant="outlined"
                  >
                    {opt?.map((i, index) => (
                      <MenuItem value={i.faqTypeId} key={index}>
                        {i.faqTypeName}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </div>

            {/* Question */}
            <div className="col-span-12 md:col-span-2">
              <Controller
                name="questionName"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label={
                      <span>
                        Question <span style={{ color: "red" }}>*</span>
                      </span>
                    }
                    size="small"
                    fullWidth
                    disabled={submitLoading || editLoading || toggleLoading}
                    error={!!errors.questionName}
                    helperText={errors.questionName?.message}
                    variant="outlined"
                  />
                )}
              />
            </div>

            {/* Answer */}
            <div className="col-span-12 md:col-span-2">
              <Controller
                name="answerName"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label={
                      <span>
                        Answer <span style={{ color: "red" }}>*</span>
                      </span>
                    }
                    size="small"
                    fullWidth
                    disabled={submitLoading || editLoading || toggleLoading}
                    error={!!errors.answerName}
                    helperText={errors.answerName?.message}
                    variant="outlined"
                  />
                )}
              />
            </div>

            {/* Supporting Document - Increased width */}
            <div className="col-span-12 md:col-span-3">
              <Controller
                name="attachmentDoc"
                control={control}
                render={({ field: { ref, name, onBlur, onChange } }) => (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="contained"
                      component="label"
                      size="small"
                      fullWidth
                      style={{ height: "40px" }}
                    >
                      {formData.attachmentDoc?.name ? (
                        formData.attachmentDoc.name
                      ) : formData.existingDocumentPath ? (
                        `Document: ${formData.existingDocumentPath
                          .split("/")
                          .pop()}`
                      ) : (
                        <span>
                          Upload Document{" "}
                          <span style={{ color: "red" }}>*</span>
                        </span>
                      )}
                      <input
                        type="file"
                        hidden
                        name={name}
                        ref={(e) => {
                          ref(e);
                          fileInputRef = e;
                        }}
                        onBlur={onBlur}
                        onChange={(e) => {
                          const file = e.target.files[0];
                          onChange(file);
                          handleFileChange(e);

                          setTimeout(() => {
                            if (e.target && file) {
                              e.target.value = "";
                            }
                          }, 0);
                        }}
                        accept=".pdf,application/pdf"
                      />
                    </Button>
                    {formData.existingDocumentPath &&
                      !formData.attachmentDoc && (
                        <Button
                          variant="contained"
                          color="warning"
                          size="small"
                          onClick={() =>
                            handleViewPdf(formData.existingDocumentPath)
                          }
                          sx={{ minWidth: 40 }}
                        >
                          <FaEye style={{ fontSize: 16 }} />
                        </Button>
                      )}
                    {(formData.attachmentDoc ||
                      formData.existingDocumentPath) && (
                      <div
                        style={{
                          cursor: "pointer",
                          background: "#f8d7da",
                          color: "#e84118",
                          fontSize: "12px",
                          width: "30px",
                          height: "20px",
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <RxCross2
                          style={{
                            cursor: "pointer",
                          }}
                          onClick={() => {
                            onChange(null);
                            resetFileInput();

                            const isEditMode = !!(
                              formData.questionAnswerId ||
                              formData.questionAnswerCode
                            );

                            if (isEditMode) {
                              setValue("existingDocumentPath", null);

                              // setTimeout(() => {
                              //   trigger("attachmentDoc").then(() => {
                              //     console.log("Validation triggered after removal, current errors:", errors);
                              //   });
                              // }, 0);
                            } else {
                              setValue("existingDocumentPath", null);

                              setTimeout(() => {
                                trigger("attachmentDoc").then(() => {});
                              }, 0);
                            }
                          }}
                        />
                      </div>
                    )}
                  </div>
                )}
              />
              {/* Display validation error for attachmentDoc */}
              {errors.attachmentDoc && (
                <div
                  style={{
                    color: "#d32f2f",
                    fontSize: "0.75rem",
                    marginTop: "3px",
                    marginLeft: "14px",
                    fontWeight: "400",
                    minHeight: "16px",
                  }}
                >
                  {errors.attachmentDoc.message}
                </div>
              )}
            </div>

            {/* Description - Increased width */}
            <div className="col-span-12 md:col-span-3">
              <Controller
                name="questionAnswerDescription"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label={
                      <span>
                        Description <span style={{ color: "red" }}>*</span>
                      </span>
                    }
                    size="small"
                    multiline
                    rows={1}
                    fullWidth
                    disabled={submitLoading || editLoading || toggleLoading}
                    error={!!errors.questionAnswerDescription}
                    helperText={errors.questionAnswerDescription?.message}
                    variant="outlined"
                  />
                )}
              />
            </div>

            {/* Buttons */}
            <div className="col-span-12 flex gap-3 justify-center">
              <Button
                type="submit"
                variant="contained"
                color="success"
                disabled={submitLoading || editLoading || toggleLoading}
              >
                {formData.questionAnswerId ? "Update" : "Submit"}
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
      <div className="p-4 border border-solid border-slate-300 rounded-md bg-white mt-3">
        <CardHeading props={"List of Question Answer FAQ"} />
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
            disabled={submitLoading || editLoading || toggleLoading}
          />
        </div>

        <div className="overflow-x-auto">
          <ReusableDataTable data={paginatedData} columns={columns} />
        </div>
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
    </div>
  );
};

export default FaqQuestionAnswer;
