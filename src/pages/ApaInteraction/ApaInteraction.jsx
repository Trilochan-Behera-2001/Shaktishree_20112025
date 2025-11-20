import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
  Paper,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import CardHeading from "../../components/common/CardHeading";
import ReusableDataTable from "../../components/common/ReusableDataTable";
import {
  getapaInteraction,
  addapaInteraction,
  getTableapaInteraction,
} from "../../services/ApaInteractionApi";
import Loader from "../../components/common/Loader";
import { useQuery } from "@tanstack/react-query";
import { encryptPayload } from "../../crypto/encryption";
import { toast } from "react-toastify";
import dayjs from "dayjs";

const ApaInteraction = () => {
  const [formData, setFormData] = useState({
    district: "",
    college: "",
    remarks: "",
    document: null,
    interactionDate: null,
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 🔹 Fetch colleges data
  const {
    data: collegesData,
    isLoading: isCollegesLoading,
    isFetching: isCollegesFetching,
  } = useQuery({
    queryKey: ["colleges"],
    queryFn: getapaInteraction,
    select: (res) => res.data.data || [],
    staleTime: 5 * 60 * 1000,
  });

  // 🔹 Fetch submitted interactions data
  const {
    data: tableList,
    isLoading: isTableLoading,
    isFetching: isTableFetching,
    refetch: refetchTable,
  } = useQuery({
    queryKey: ["submitList"],
    queryFn: getTableapaInteraction,
    select: (res) => res.data.data || [],
    staleTime: 5 * 60 * 1000,
  });

  const showLoader =
    isCollegesLoading ||
    isCollegesFetching ||
    isTableLoading ||
    isTableFetching ||
    isSubmitting;

  // 🔹 Extract unique districts
  const districts = collegesData
    ? [...new Set(collegesData.map((c) => c.districtName))].filter(Boolean)
    : [];

  // 🔹 Colleges for selected district
  const colleges = collegesData
    ? collegesData
        .filter((c) => c.districtName === formData.district)
        .map((c) => ({ id: c.collegeId, name: c.collegeName }))
    : [];

  // 🔹 Selected college
  const selectedCollege = collegesData
    ? collegesData.find((c) => c.collegeId === parseInt(formData.college))
    : null;

  // 🔹 Input handler
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));

    if (name === "district") {
      setFormData((prev) => ({ ...prev, college: "" }));
    }
  };

  // 🔹 Date handler
  const handleDateChange = (value) => {
    setFormData((prev) => ({ ...prev, interactionDate: value }));
    if (errors.interactionDate)
      setErrors((prev) => ({ ...prev, interactionDate: "" }));
  };

  // 🔹 File handler
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      setErrors((prev) => ({
        ...prev,
        document: "Only PDF files are allowed",
      }));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({
        ...prev,
        document: "File size must be less than 5MB",
      }));
      return;
    }

    setFormData((prev) => ({ ...prev, document: file }));
    setErrors((prev) => ({ ...prev, document: "" }));
  };

  // 🔹 Validation
  const validateForm = () => {
    const newErrors = {};

    if (!formData.district) newErrors.district = "District is required";
    if (!formData.college) newErrors.college = "College is required";

    if (!formData.interactionDate)
      newErrors.interactionDate = "Interaction date is required";

    if (!formData.remarks.trim()) newErrors.remarks = "Remarks are required";
    else if (formData.remarks.length < 10)
      newErrors.remarks = "Remarks must be at least 10 characters";

    if (!formData.document) newErrors.document = "Document is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 🔹 Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const formDataObj = new FormData();

      const payload = {
        objectId: parseInt(formData.college),
        intractionRemark: formData.remarks,
        intraction_code: selectedCollege?.collegeCode || "",
        interactionDate: formData.interactionDate
          ? dayjs(formData.interactionDate).toDate()
          : null,
      };

      const encryptedPayload = encryptPayload(payload);
      formDataObj.append("cipherText", encryptedPayload);
      formDataObj.append("attachmentDoc", formData.document);

      const response = await addapaInteraction(formDataObj);
      if (response.data.outcome === true) {
        toast.success("APA Interaction submitted successfully!");
        setFormData({
          district: "",
          college: "",
          remarks: "",
          document: null,
          interactionDate: null,
        });
        refetchTable();
      } else {
        toast.error(
          response.data.message || "Failed to submit APA Interaction"
        );
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Failed to submit APA Interaction");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 🔹 Cancel handler
  const handleCancel = () => {
    setFormData({
      district: "",
      college: "",
      remarks: "",
      document: null,
      interactionDate: null,
    });
    setErrors({});
  };

  // 🔹 Table columns
  const columns = [
    { name: "Sl. No.", selector: (r, index) => index + 1, width: '80px', },
    {
      name: "District",
      selector: (r) => r.districtName || "-",
      sortable: true,
    },
    {
      name: "College Name",
      selector: (r) => r.collegeName || "-",
      sortable: true,
    },
    {
      name: "Interaction Date",
      selector: (r) => r.interactionDateStr || "-",
      sortable: true,
    },
    {
      name: "Office Phone",
      selector: (r) => r.officePhoneNo || "-",
      sortable: true,
    },
    {
      name: "Office Email",
      selector: (r) => r.officeEmailId || "-",
      sortable: true,
    },
    {
      name: "Interaction Date",
      selector: (r) => r.interactionDate || "-",
      sortable: true,
    },
  ];

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Loader loading={showLoader} />

      <Box>
        <Paper elevation={3} sx={{ p: 2, mb: 3 }}>
          <CardHeading props="APA Interaction" />

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            {/* Grid layout (4 per row) */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              {/* District */}
              <FormControl fullWidth size="small">
                <InputLabel>District Name *</InputLabel>
                <Select
                  name="district"
                  value={formData.district}
                  onChange={handleInputChange}
                  label="District Name *"
                  error={!!errors.district}
                >
                  <MenuItem value="">Select District</MenuItem>
                  {districts.map((d, i) => (
                    <MenuItem key={i} value={d}>
                      {d}
                    </MenuItem>
                  ))}
                </Select>
                {errors.district && (
                  <Typography color="error" variant="caption">
                    {errors.district}
                  </Typography>
                )}
              </FormControl>

              {/* College */}
              <FormControl fullWidth size="small" disabled={!formData.district}>
                <InputLabel>College Name *</InputLabel>
                <Select
                  name="college"
                  value={formData.college}
                  onChange={handleInputChange}
                  label="College Name *"
                  error={!!errors.college}
                >
                  <MenuItem value="">Select College</MenuItem>
                  {colleges.map((c) => (
                    <MenuItem key={c.id} value={c.id}>
                      {c.name}
                    </MenuItem>
                  ))}
                </Select>
                {errors.college && (
                  <Typography color="error" variant="caption">
                    {errors.college}
                  </Typography>
                )}
              </FormControl>

              {/* Interaction Date */}
              <DatePicker
                label="Interaction Date *"
                value={formData.interactionDate}
                onChange={handleDateChange}
                format="DD/MM/YYYY"
                slotProps={{
                  textField: {
                    fullWidth: true,
                    size: "small",
                    error: !!errors.interactionDate,
                    helperText: errors.interactionDate,
                  },
                }}
              />

              {/* Office Phone */}
              <TextField
                label="Office Phone"
                value={selectedCollege?.officePhoneNo || ""}
                variant="outlined"
                size="small"
                disabled
                fullWidth
              />

              {/* Office Email */}
              <TextField
                label="Office Email"
                value={selectedCollege?.officeEmailId || ""}
                variant="outlined"
                size="small"
                disabled
                fullWidth
              />

              {/* Remarks */}
              <TextField
                label="Remarks *"
                name="remarks"
                value={formData.remarks}
                onChange={handleInputChange}
                variant="outlined"
                size="small"
                multiline
                error={!!errors.remarks}
                helperText={errors.remarks}
                fullWidth
                rows={1}
                inputProps={{ style: { resize: 'vertical' } }}
              />

              {/* Document Upload */}
              <Button
                variant="contained"
                color="primary"
                component="label"
                fullWidth
                sx={{ height: 40 }}
                disabled={isSubmitting}
              >
                {formData.document
                  ? formData.document.name
                  : "Upload Document *"}
                <input
                  type="file"
                  hidden
                  onChange={handleFileChange}
                  accept=".pdf,application/pdf"
                />
              </Button>
              {errors.document && (
                <Typography color="error" variant="caption">
                  {errors.document}
                </Typography>
              )}
            {/* Buttons */}
            <Box sx={{ display: "flex", justifyContent: "start", gap: 1 }}>
              <Button
                variant="contained"
                color="success"
                type="submit"
                size="small"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit"}
              </Button>
              <Button
                variant="contained"
                color="error"
                onClick={handleCancel}
                size="small"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            </Box>
            </div>
          </Box>
        </Paper>

        {/* Table */}
        <Paper elevation={3} sx={{ p: 2 }}>
          <CardHeading props="Submitted Interactions" />
          <ReusableDataTable
            data={tableList || []}
            columns={columns}
            loading={isTableLoading || isTableFetching}
          />
        </Paper>
      </Box>
    </LocalizationProvider>
  );
};

export default ApaInteraction;
