import {
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
  FormHelperText,
  Typography,
} from "@mui/material";
import {
  FaPlus,
  FaMinus,
  FaHashtag,
  FaListAlt,
  FaUser,
  FaBirthdayCake,
  FaMobileAlt,
  FaEnvelope,
  FaGraduationCap,
  FaVenusMars,
  FaBriefcase,
  FaTools,
} from "react-icons/fa";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { encryptPayload } from "../../crypto/encryption";
import {
  memberListAll,
  staffDetailsAdd,
  userGenderListAll,
  userRegi,
  memberNameSend,  // Add this import
  adharNumberDuplichk,
  emailDuplichk
} from "../../services/RegisterService";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { toast } from "react-toastify";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Loader from "../../components/common/Loader";
import ReusableDataTable from "../../components/common/ReusableDataTable";
import CardHeading from "../../components/common/CardHeading";

const selectTypeOptions = ["SHAKTISHREE-SATHI", "SHAKTISHREE-SANJOJIKA"];


const calculateAge = (date) => {
  if (!date) return 0;
  const today = dayjs();
  const birthDate = dayjs(date);
  const age = today.diff(birthDate, 'year');
  return age;
};

const schema = yup.object({
  rows: yup.array().of(
    yup.object().shape({
      memberType: yup.string().required("Select Type is required"),
      staffId: yup.string().when("memberType", {
        is: "SHAKTISHREE-SANJOJIKA",
        then: (s) => s.required("Staff selection is required"),
        otherwise: (s) => s.notRequired(),
      }),
      name: yup.string().when("memberType", {
        is: "SHAKTISHREE-SATHI",
        then: (s) =>
          s
            .matches(/^[A-Za-z0-9 ]+$/, "Special characters not allowed")
            .required("Member Name is required"),
        otherwise: (s) => s.notRequired(),
      }),
      dateOfBirth: yup
        .mixed()
        .test('valid-date', 'Invalid date format', function(value) {
          if (!value) return false;
          
          const date = typeof value === 'number' ? dayjs(value) : dayjs(value);
          return date.isValid();
        })
        .test('age-limit', 'Must be 16 years or above', function(value) {
          if (!value) return false;
        
          const date = typeof value === 'number' ? dayjs(value) : dayjs(value);
          return calculateAge(date) >= 16;
        })
        .required("DOB is required"),
      mobile: yup
        .string()
        .matches(/^[0-9]+$/, "Only numbers allowed")
        .matches(/^[6-9]/, "Mobile number must start with 6, 7, 8, or 9")
        .length(10, "Mobile number must be exactly 10 digits")
        .required("Mobile number is required"),
      email: yup.string().email("Invalid email").required("Email is required"),
      aadharNumber: yup
        .string()
        .matches(/^[0-9]+$/, "Only numbers allowed")
        .matches(/^[1-9]/, "Aadhaar number cannot start with 0")
        .length(12, "Aadhaar number must be exactly 12 digits")
        .required("Aadhaar number is required"),
      highestQualification: yup
        .string()
        // .matches(/^[A-Za-z0-9 ]+$/, "Special characters not allowed")
        .required("Qualification is required"),
      genderId: yup.string().required("Gender is required"),
      designation: yup
        .string()
        // .matches(/^[A-Za-z0-9 ]+$/, "Special characters not allowed")
        .required("Designation is required"),
    })
  ),
});

const initialRow = {
  shaktishreeRegistrationFormId: "",
  memberType: "",
  staffId: "",
  name: "",
  mobile: "",
  dateOfBirth: null,
  email: "",
  aadharNumber: "",
  highestQualification: "",
  genderId: "",
  designation: "",
};

const RegisterUser = () => {
  const [loading, setLoading] = useState(false);
  const [emailValidationTimers, setEmailValidationTimers] = useState({}); // For email validation
  const [aadhaarValidationTimers, setAadhaarValidationTimers] = useState({}); // For Aadhaar validation

  const {
    control,
    handleSubmit,
    trigger,
    formState: { errors },
    watch,
    reset,
    setValue,
  } = useForm({
    resolver: yupResolver(schema),
    mode: "onChange",
    defaultValues: {
      rows: [{ ...initialRow }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "rows",
  });

  const watchedRows = watch("rows");


  const selectedStaffIds = watchedRows
    .filter(row => row.memberType === "SHAKTISHREE-SANJOJIKA")
    .map(row => row.staffId)
    .filter(id => id);

  const hasDuplicateStaffSelection = selectedStaffIds.length !== new Set(selectedStaffIds).size;

  const handleNumericInput = (e, maxLength) => {
    let value = e.target.value.replace(/[^0-9]/g, "");
    if (value.length > maxLength) {
      value = value.slice(0, maxLength);
    }
    return value;
  };

  const handleMobileInput = (e) => {
    return handleNumericInput(e, 10);
  };

  const handleAadhaarInput = (e) => {
    return handleNumericInput(e, 12);
  };

  const handleNumericKeyPress = (e) => {
    if (
      [8, 9, 27, 13, 46, 110, 190].indexOf(e.keyCode) !== -1 ||
      (e.keyCode === 65 && e.ctrlKey === true) ||
      (e.keyCode === 67 && e.ctrlKey === true) ||
      (e.keyCode === 86 && e.ctrlKey === true) ||
      (e.keyCode === 88 && e.ctrlKey === true)
    ) {
      return;
    }
    if (
      (e.shiftKey || e.keyCode < 48 || e.keyCode > 57) &&
      (e.keyCode < 96 || e.keyCode > 105)
    ) {
      e.preventDefault();
    }
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const rows = data.rows;

      for (let i = 0; i < rows.length; i++) {
        const currentRow = rows[i];
        
        for (let j = i + 1; j < rows.length; j++) {
          const compareRow = rows[j];
          
          const isNameMatch = currentRow.name && compareRow.name && currentRow.name === compareRow.name;
          const isAadhaarMatch = currentRow.aadharNumber && compareRow.aadharNumber && currentRow.aadharNumber === compareRow.aadharNumber;
          const isMobileMatch = currentRow.mobile && compareRow.mobile && currentRow.mobile === compareRow.mobile;
          const isEmailMatch = currentRow.email && compareRow.email && currentRow.email === compareRow.email;
          
          if (isNameMatch || isAadhaarMatch || isMobileMatch || isEmailMatch) {
            const matchingFields = [];
            if (isNameMatch) matchingFields.push('Name');
            if (isAadhaarMatch) matchingFields.push('Aadhaar Number');
            if (isMobileMatch) matchingFields.push('Mobile Number');
            if (isEmailMatch) matchingFields.push('Email ID');
            
            const fieldText = matchingFields.join(', ');
            toast.error(`Duplicate entry found: ${fieldText} already exists in another row. Please check rows ${i + 1} and ${j + 1}.`);
            setLoading(false);
            return;
          }
        }
      }

      const existingMembers = regMemberList?.sksMemberList || [];
      
      for (const row of rows) {
        for (const member of existingMembers) {
          const isNameMatch = row.name && member.memberName && row.name === member.memberName;
          const isAadhaarMatch = row.aadharNumber && member.aadharNumber && row.aadharNumber === member.aadharNumber;
          const isMobileMatch = row.mobile && member.mobile && row.mobile === member.mobile;
          const isEmailMatch = row.email && member.email && row.email === member.email;
          
          if (isNameMatch || isAadhaarMatch || isMobileMatch || isEmailMatch) {
            const matchingFields = [];
            if (isNameMatch) matchingFields.push('Name');
            if (isAadhaarMatch) matchingFields.push('Aadhaar Number');
            if (isMobileMatch) matchingFields.push('Mobile Number');
            if (isEmailMatch) matchingFields.push('Email ID');
            
            const fieldText = matchingFields.join(', ');
            toast.error(`Duplicate entry found: ${fieldText} already exists for registered member ${member.memberName || member.staffName}.`);
            setLoading(false);
            return;
          }
        }
      }

      const mobiles = rows.map((r) => r.mobile);
      const emails = rows.map((r) => r.email);
      const aadhaars = rows.map((r) => r.aadharNumber);
      const names = rows
        .filter(r => r.memberType === "SHAKTISHREE-SATHI")
        .map(r => r.name);

      if (new Set(mobiles).size !== mobiles.length) {
        toast.error("Duplicate mobile numbers found in form data", {
          position: "top-right",
          autoClose: 4000,
        });
        setLoading(false);
        return;
      }
      
      if (new Set(emails).size !== emails.length) {
        toast.error("Duplicate email addresses found in form data");
        setLoading(false);
        return;
      }
      
      if (new Set(aadhaars).size !== aadhaars.length) {
        toast.error("Duplicate Aadhaar numbers found in form data");
        setLoading(false);
        return;
      }
      
      if (new Set(names).size !== names.length) {
        toast.error("Duplicate member names found in form data");
        setLoading(false);
        return;
      }

      if (hasDuplicateStaffSelection) {
        toast.error("Duplicate staff selection is not allowed");
        setLoading(false);
        return;
      }

      const formattedRows = rows.map((row) => ({
        memberType: row.memberType || "",
        memberTypeId:
          row.memberType === "SHAKTISHREE-SANJOJIKA" ? row.staffId : null,
        name: row.name || "", 
        mobile: row.mobile || "",
        dateOfBirth: row.dateOfBirth ? dayjs(row.dateOfBirth).valueOf() : null,
        email: row.email || "",
        aadharNumber: row.aadharNumber || "",
        highestQualification: row.highestQualification || "",
        genderId: row.genderId ? Number(row.genderId) : null,
        designation: row.designation || "",
      }));
      console.log("formdata submit", formattedRows);

      const payload = encryptPayload(formattedRows);
      const result = await userRegi(payload);

      if (result.data.outcome === true) {
        toast.success(result.message || "Registration successful!");
        setLoading(false);
        
        reset({
          rows: [{ ...initialRow }],
        });
        
        try {
          await fetchMemberList();
        } catch (error) {
          console.error("Error refreshing member list:", error);
          toast.error("Failed to refresh member list");
        }
      } else {
        toast.error(result.message || "Registration failed");
        setLoading(false);
      }
    } catch (error) {
      toast.error(error.message || "Registration failed. Please try again.");
      setLoading(false);
    }
  };

  const handleAddRow = async () => {
    const valid = await trigger();
    if (!valid) {
      toast.error("Please fill all required fields before adding a new row", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }
    append({ ...initialRow });
  };

  const handleRemoveRow = (index) => {
    if (fields.length > 1) {
      remove(index);
    } else {
      toast.error("At least one row is required", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  const handleCancel = () => {
    reset({
      rows: [{ ...initialRow }],
    });
  };

  const formControlStyle = {
    minWidth: 130,
    maxWidth: "100%",
    width: "100%",
  };

  const headerIcons = {
    "Sl. No.":"",
    "Select Type": <FaListAlt size={16} />,
    "Member Name": <FaUser size={16} />,
    "Date of Birth": <FaBirthdayCake size={16} />,
    "Mobile": <FaMobileAlt size={16} />,
    "Email": <FaEnvelope size={16} />,
    "Qualification": <FaGraduationCap size={16} />,
    "Gender": <FaVenusMars size={16} />,
    "Designation": <FaBriefcase size={16} />,
    "Action": <FaTools size={16} />,
  };

  const {
    data: memberListData = {},
    isLoading: memberListLoading,
    refetch: fetchMemberList,
    error: memberListError,
  } = useQuery({
    queryKey: ["memberList"],
    queryFn: memberListAll,
    enabled: true,
    staleTime: 0, 
    cacheTime: 0, 
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchOnReconnect: true,
    onError: (error) => {
 
      if (error.response && error.response.status === 403) {
        toast.error("You don't have permission to access the member list");
      } else {
        toast.error("Failed to load member data");
      }
    },
  });

  
  const staffListData = memberListData?.staffList || memberListData?.data?.staffList || [];
  const regMemberList = memberListData?.regMemberList || memberListData?.data?.regMemberList || { sksMemberList: [] };
  

  
  const validStaffList = Array.isArray(staffListData) ? staffListData : [];
  
  useEffect(() => {
    if (!memberListLoading && validStaffList.length === 0) {
      console.warn("Staff list is empty. Check API response structure.");
    }
  }, [memberListLoading, validStaffList.length]);
  
  const { data: genderList = [], genderListLoading } = useQuery({
    queryKey: ["genderList"],
    queryFn: userGenderListAll,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    onError: (error) => {
   
      if (error.response && error.response.status === 403) {
        toast.error("You don't have permission to access the gender list");
      } else {
        toast.error("Failed to load gender data");
      }
    },
  });
  
  const isGlobalLoading = memberListLoading || genderListLoading || loading;

  const registeredMembersData = regMemberList?.sksMemberList?.map((member, index) => ({
    slNo: index + 1,
    memberType: member.memberType,
    name: member.memberName || member.name || '',
    mobile: member.mobile,
    email: member.email,
    highestQualification: member.highestQualification,
    gender: member.gender,
    designation: member.designation,
  })) || [];

  const registeredMembersColumns = [
    { 
      name: "Sl. No.", 
      selector: row => row.slNo,
      sortable: true,
      width: "80px"
    },
    { 
      name: "Member Type", 
      selector: row => row.memberType,
      sortable: true,
      wrap: true
    },
    { 
      name: "Member Name", 
      selector: row => row.name,
      sortable: true,
      wrap: true
    },
    { 
      name: "Mobile", 
      selector: row => row.mobile,
      sortable: true,
      wrap: true
    },
    { 
      name: "Email", 
      selector: row => row.email,
      sortable: true,
      wrap: true
    },
    { 
      name: "Qualification", 
      selector: row => row.highestQualification,
      sortable: true,
      wrap: true
    },
    { 
      name: "Gender", 
      selector: row => row.gender,
      sortable: true,
      wrap: true
    },
    { 
      name: "Designation", 
      selector: row => row.designation,
      sortable: true,
      wrap: true
    }
  ];

  useEffect(() => {
    fetchMemberList();
  }, [fetchMemberList]);

  // Function to validate member by staff ID for SANJOJIKA members
  const validateMemberByStaffId = async (staffId, ) => {
    if (!staffId) {
      return;
    }

    try {
      const response = await memberNameSend(staffId);
      return response;
      // if (response.data && response.data.isDuplicate === true) {
      //   // toast.success(response.data.message || "Staff member is already registered");
      //   console.log(response.data.message || "Staff member is already registered");
      // } 
    } catch (error) {
      console.error("Error validating staff member:", error);
      toast.error("Failed to validate staff member");
    }
  };

   const handleBlur = async (value, index) => {
    if (value && value.length === 12) {
      setLoading(true);
      try {
        const result = await adharNumberDuplichk(value);
        
        if (result.data && result.data.isDuplicate === true) {
          toast.success("Aadhaar number is already registered");
          // Reset the Aadhaar field when duplicate is found
          setValue(`rows.${index}.aadharNumber`, "");
        }
       
      } catch (err) {
        console.error("Error validating Aadhaar number:", err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleBlurEmail = async (value, index) => {
    if (value) {
      setLoading(true);
      try {
        const result = await emailDuplichk(value);
        
        if (result.data && result.data.isDuplicate === true) {
          toast.success("Email is already registered");
          // Reset the email field when duplicate is found
          setValue(`rows.${index}.email`, "");
        }
       
      } catch (err) {
        console.error("Error validating email:", err);
      } finally {
        setLoading(false);
      }
    }
  };




  const debouncedValidateEmail = (email, index) => {
    // Clear existing timer for this field
    if (emailValidationTimers[index]) {
      clearTimeout(emailValidationTimers[index]);
    }

    // Only set timer if email has a value
    if (email) {
      // Set new timer
      const timer = setTimeout(() => {
        handleBlurEmail(email, index);
        // Clean up timer reference
        setEmailValidationTimers(prev => {
          const newTimers = { ...prev };
          delete newTimers[index];
          return newTimers;
        });
      }, 500); // 500ms delay

      // Store timer reference
      setEmailValidationTimers(prev => ({
        ...prev,
        [index]: timer
      }));
    }
  };

  const debouncedValidateAadhaar = (aadhaar, index) => {
    // Clear existing timer for this field
    if (aadhaarValidationTimers[index]) {
      clearTimeout(aadhaarValidationTimers[index]);
    }

    // Only set timer if aadhaar has a value and is 12 digits
    if (aadhaar && aadhaar.length === 12) {
      // Set new timer
      const timer = setTimeout(() => {
        handleBlur(aadhaar, index);
        // Clean up timer reference
        setAadhaarValidationTimers(prev => {
          const newTimers = { ...prev };
          delete newTimers[index];
          return newTimers;
        });
      }, 500); // 500ms delay

      // Store timer reference
      setAadhaarValidationTimers(prev => ({
        ...prev,
        [index]: timer
      }));
    }
  };

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      Object.values(emailValidationTimers).forEach(timer => {
        if (timer) clearTimeout(timer);
      });
      Object.values(aadhaarValidationTimers).forEach(timer => {
        if (timer) clearTimeout(timer);
      });
    };
  }, [emailValidationTimers, aadhaarValidationTimers]);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Loader loading={isGlobalLoading} />
      <div
        style={{
          borderRadius: "12px",
          padding: "20px",
          border: "1px solid #ccc",
          boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
          background: "#fff",
        }}
      >
        <CardHeading props={'Registration of Shaktishree'} />

        <form onSubmit={handleSubmit(onSubmit)}>
          <TableContainer
            sx={{
              overflowX: "auto",
              maxWidth: "100%",
              borderRadius: "12px",
              paddingBottom: "10px",
              userSelect: "none",
            }}
          >
            <Table
              size="small"
              sx={{
                borderCollapse: "separate",
                borderSpacing: 0,
                minWidth: 800,
                borderRadius: "12px",
                overflow: "hidden",
                border: "1px solid #ccc",
                width: "100%",
              }}
            >
              <TableHead>
                <TableRow
                  sx={{
                    backgroundColor: "#f5f5f5",
                    borderBottom: "2px solid #b7e7faff",
                  }}
                >
                  {[
                    "Sl. No.",
                    "Select Type",
                    "Member Name",
                    "Date of Birth",
                    "Mobile",
                    "Email",
                    "Aadhaar",
                    "Qualification",
                    "Gender",
                    "Designation",
                    "Action",
                  ].map((header) => (
                    <TableCell
                      key={header}
                      sx={{
                        color: "#333",
                        fontWeight: "600",
                        borderRight: "1px solid #b7e7faff",
                        whiteSpace: "nowrap",
                        paddingY: 1,
                        fontSize: "0.9rem",
                        textAlign: header === "Action" ? "center" : "left",
                      }}
                    >
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        {headerIcons[header]}
                        {header}
                      </Box>
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {fields.map((field, index) => (
                  <TableRow
                    key={field.id}
                    hover
                    sx={{
                      borderBottom:
                        index !== fields.length - 1 ? "1px solid #ddd" : "none",
                    }}
                  >
                    {/* Sl no */}
                    <TableCell
                      sx={{
                        borderRight: "1px solid #ddd",
                        whiteSpace: "nowrap",
                        paddingY: 1,
                      }}
                    >
                      {index + 1}
                    </TableCell>

                    {/* Select Type */}
                    <TableCell
                      sx={{ borderRight: "1px solid #ddd", paddingY: 1 }}
                    >
                      <Controller
                        name={`rows.${index}.memberType`}
                        control={control}
                        render={({ field: { onChange, value } }) => (
                          <FormControl
                            size="small"
                            sx={formControlStyle}
                            fullWidth
                            error={!!errors.rows?.[index]?.memberType}
                          >
                            <InputLabel>Select Type</InputLabel>
                            <Select
                              value={value}
                              label="Select Type"
                              onChange={(e) => {
                                const selectedType = e.target.value;
                                onChange(selectedType);

                                reset({
                                  rows: watchedRows.map((r, i) =>
                                    i === index
                                      ? {
                                          ...initialRow,
                                          memberType: selectedType,
                                        }
                                      : r
                                  ),
                                });
                              }}
                            >
                              {selectTypeOptions.map((opt) => (
                                <MenuItem key={opt} value={opt}>
                                  {opt}
                                </MenuItem>
                              ))}
                            </Select>

                            {errors.rows?.[index]?.memberType && (
                              <FormHelperText>
                                {errors.rows[index].memberType.message}
                              </FormHelperText>
                            )}
                          </FormControl>
                        )}
                      />
                    </TableCell>

                    {/* Member Name */}
                    <TableCell
                      sx={{ borderRight: "1px solid #ddd", paddingY: 1 }}
                    >
                      <Controller
                        name={`rows.${index}.staffId`}
                        control={control}
                        render={({ field: { onChange, value } }) => {
                          const currentRow = watchedRows?.[index];
                          const memberType = currentRow?.memberType;

                          if (memberType === "SHAKTISHREE-SANJOJIKA") {
                            return (
                              <FormControl 
                                size="small" 
                                fullWidth 
                                error={!!errors.rows?.[index]?.staffId}
                              >
                                <Select
                                  value={value || ""}
                                  onChange={async (e) => {
                                    const staffId = e.target.value;
                                    onChange(staffId);

                                    // Check if this staff member is already selected in another row
                                    const isAlreadySelected = watchedRows
                                      .filter((_, idx) => idx !== index)
                                      .some(row => 
                                        row.memberType === "SHAKTISHREE-SANJOJIKA" && 
                                        row.staffId === staffId
                                      );

                                    if (isAlreadySelected) {
                                      toast.error("This staff member is already selected in another row");
                                      // Reset the selection
                                      onChange("");
                                      return;
                                    }

                                    if (!staffId) return;

                                    try {
                                      // Validate the staff ID
                                      await validateMemberByStaffId(staffId, index);
                                      
                                      const payloadId = encryptPayload(staffId);
                                      const details = await staffDetailsAdd(payloadId);
                                      
                                      const res = details.data?.data;
                                      if (!res) {
                                        toast.error("Failed to fetch staff details");
                                        return;
                                      }
                                      
                                      const sathiRows = watchedRows.filter(r => r.memberType === "SHAKTISHREE-SATHI");
                                      const isDuplicateWithSathi = sathiRows.some(r => 
                                        r.name === (res.staffName || "") &&
                                        r.aadharNumber === (res.aadhar || "") &&
                                        r.mobile === (res.mobile || "") &&
                                        r.email === (res.email || "")
                                      );
                                      
                                      if (isDuplicateWithSathi) {
                                        toast.error(`Staff member details match an existing SATHI member in the form.`);
                                        onChange("");
                                        return;
                                      }
                                      
                                      
                                      const existingMembers = regMemberList?.sksMemberList || [];
                                      const isDuplicateWithExisting = existingMembers.some(member => 
                                        member.memberName === (res.staffName || "") &&
                                        member.aadharNumber === (res.aadhar || "") &&
                                        member.mobile === (res.mobile || "") &&
                                        member.email === (res.email || "")
                                      );
                                      
                                      if (isDuplicateWithExisting) {
                                        toast.error(`Staff member details match an already registered member.`);
                                        onChange("");
                                        return;
                                      }
                                      
                                      const updatedRows = watchedRows.map(
                                        (r, i) =>
                                          i === index
                                            ? {
                                                ...r,
                                                staffId,
                                                name: res.staffName || "",
                                                email: res.email || "",
                                                mobile: res.mobile || "",
                                                dateOfBirth: res.dob
                                                  ? dayjs(Number(res.dob))
                                                  : res.dobString
                                                  ? dayjs(res.dobString, "DD/MM/YYYY")
                                                  : null,
                                                aadharNumber: res.aadhar || "",
                                                highestQualification: res.highestQuaification || "",
                                                genderId: res.gender === "Male"
                                                  ? "1"
                                                  : res.gender === "Female"
                                                  ? "2"
                                                  : "3",
                                                designation: res.designation || "",
                                              }
                                            : r
                                      );

                                      reset({ rows: updatedRows });
                                    } catch (error) {
                                      console.error("Error fetching staff details:", error);
                                      toast.error("Failed to fetch staff details");
                                    }
                                  }}
                                  displayEmpty
                                  style={{ width: "100%" }}
                                >
                                  <MenuItem value="">
                                    <em>Select Staff Member</em>
                                  </MenuItem>
                                  {memberListLoading ? (
                                    <MenuItem disabled>Loading staff members...</MenuItem>
                                  ) : validStaffList && validStaffList.length > 0 ? (
                                    validStaffList.map((staff) => (
                                      <MenuItem
                                        key={staff.staffId}
                                        value={staff.staffId}
                                      >
                                        {staff.staffName}
                                      </MenuItem>
                                    ))
                                  ) : (
                                    <MenuItem disabled>
                                      No staff members available. 
                                      {memberListError ? " Error loading data." : " Please contact administrator."}
                                    </MenuItem>
                                  )}
                                </Select>
                                {errors.rows?.[index]?.staffId && (
                                  <FormHelperText error>
                                    {errors.rows[index].staffId.message}
                                  </FormHelperText>
                                )}
                              </FormControl>
                            );
                          } else if (memberType === "SHAKTISHREE-SATHI") {
                            return (
                              <Controller
                                name={`rows.${index}.name`}
                                control={control}
                                render={({ field, fieldState: { error } }) => (
                                  <TextField
                                    {...field}
                                    size="small"
                                    fullWidth
                                    error={!!error}
                                    helperText={error?.message}
                                    placeholder="Enter Member Name"
                                    // Removed the name validation for SATHI members
                                  />
                                )}
                              />
                            );
                          } else {
                            return (
                              <TextField
                                size="small"
                                fullWidth
                                disabled
                                placeholder="Select Member Type First"
                              />
                            );
                          }
                        }}
                      />
                    </TableCell>

                    {/* Date of Birth */}
                    <TableCell
                      sx={{ borderRight: "1px solid #ddd", paddingY: 1 }}
                    >
                      <Controller
                        name={`rows.${index}.dateOfBirth`}
                        control={control}
                        render={({ field: { onChange, value } }) => (
                          <DatePicker
                            value={value ? (typeof value === 'number' ? dayjs(value) : dayjs(value)) : null} 
                            format="DD/MM/YYYY"
                            onChange={(newValue) => {
                              onChange(newValue ? newValue.valueOf() : null);
                            }}
                            maxDate={dayjs()}
                            slotProps={{
                              textField: {
                                size: "small",
                                fullWidth: false,
                                error: !!errors.rows?.[index]?.dateOfBirth,
                                helperText:
                                  errors.rows?.[index]?.dateOfBirth?.message,
                                sx: {
                                  minWidth: 100,
                                  maxWidth: 180,
                                  width: "100%",
                                  fontSize: "1rem",
                                },
                              },
                            }}
                          />
                        )}
                      />
                    </TableCell>

                    {/* Mobile */}
                    <TableCell
                      sx={{ borderRight: "1px solid #ddd", paddingY: 1 }}
                    >
                      <Controller
                        name={`rows.${index}.mobile`}
                        control={control}
                        render={({ field: { onChange, value } }) => (
                          <TextField
                            value={value}
                            onChange={(e) => {
                              const numericValue = handleMobileInput(e);
                              onChange(numericValue);
                            }}
                            onKeyDown={handleNumericKeyPress}
                            size="small"
                            fullWidth
                            placeholder="Enter 10-digit mobile"
                            inputProps={{
                              maxLength: 10,
                              inputMode: "numeric",
                              pattern: "[0-9]*",
                            }}
                            error={!!errors.rows?.[index]?.mobile}
                            helperText={errors.rows?.[index]?.mobile?.message}
                            sx={{ fontSize: "1rem", minWidth: 200 }}
                          />
                        )}
                      />
                    </TableCell>

                    {/* Email */}
                    <TableCell
                      sx={{ borderRight: "1px solid #ddd", paddingY: 1 }}
                    >
                      <Controller
                        name={`rows.${index}.email`}
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            size="small"
                            onBlur={(e) => {
                              field.onBlur(e);
                              debouncedValidateEmail(e.target.value, index);
                            }}
                            fullWidth
                            type="email"
                            error={!!errors.rows?.[index]?.email}
                            helperText={errors.rows?.[index]?.email?.message}
                            sx={{ fontSize: "1rem", minWidth: 200 }}
                          />
                        )}
                      />
                    </TableCell>

                    {/* Aadhaar */}
                    <TableCell
                      sx={{ borderRight: "1px solid #ddd", paddingY: 1 }}
                    >
                      <Controller
                        name={`rows.${index}.aadharNumber`}
                        control={control}
                        render={({ field: { onChange, value } }) => (
                          <TextField
                            value={value}
                            onChange={(e) => {
                              const numericValue = handleAadhaarInput(e);
                              onChange(numericValue);
                            }}
                            onBlur={() => debouncedValidateAadhaar(value, index)}
                            onKeyDown={handleNumericKeyPress}
                            size="small"
                            fullWidth
                            placeholder="Enter 12-digit Aadhaar"
                            inputProps={{
                              maxLength: 12,
                              inputMode: "numeric",
                              pattern: "[0-9]*",
                            }}
                            error={!!errors.rows?.[index]?.aadharNumber}
                            helperText={
                              errors.rows?.[index]?.aadharNumber?.message
                            }
                            sx={{ fontSize: "1rem", minWidth: 200 }}
                          />
                        )}
                      />
                    </TableCell>

                    {/* Qualification */}
                    <TableCell
                      sx={{ borderRight: "1px solid #ddd", paddingY: 1 }}
                    >
                      <Controller
                        name={`rows.${index}.highestQualification`}
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            size="small"
                            fullWidth
                            error={!!errors.rows?.[index]?.highestQualification}
                            helperText={
                              errors.rows?.[index]?.highestQualification
                                ?.message
                            }
                            sx={{ fontSize: "1rem", minWidth: 200 }}
                          />
                        )}
                      />
                    </TableCell>

                    {/* Gender */}
                    <TableCell
                      sx={{ borderRight: "1px solid #ddd", paddingY: 1 }}
                    >
                      <Controller
                        name={`rows.${index}.genderId`}
                        control={control}
                        render={({ field: { onChange, value } }) => (
                          <FormControl
                            size="small"
                            sx={formControlStyle}
                            fullWidth
                            error={!!errors.rows?.[index]?.genderId}
                          >
                            <InputLabel>Gender</InputLabel>
                            <Select
                              value={value || ""} // ✅ prevent empty uncontrolled state
                              label="Gender"
                              onChange={onChange}
                              sx={{ fontSize: "1rem" }}
                            >
                              {genderListLoading ? (
                                <MenuItem disabled>Loading...</MenuItem>
                              ) : (
                                genderList?.map((opt) => (
                                  <MenuItem
                                    key={opt.genderId}
                                    value={opt.genderId}
                                  >
                                    {opt.gendereName}
                                  </MenuItem>
                                ))
                              )}
                            </Select>
                            {errors.rows?.[index]?.genderId && (
                              <FormHelperText>
                                {errors.rows[index].genderId.message}
                              </FormHelperText>
                            )}
                          </FormControl>
                        )}
                      />
                    </TableCell>

                    {/* Designation */}
                    <TableCell
                      sx={{ borderRight: "1px solid #ddd", paddingY: 1 }}
                    >
                      <Controller
                        name={`rows.${index}.designation`}
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            size="small"
                            fullWidth
                            error={!!errors.rows?.[index]?.designation}
                            helperText={
                              errors.rows?.[index]?.designation?.message
                            }
                            sx={{ fontSize: "1rem", minWidth: 200 }}
                          />
                        )}
                      />
                    </TableCell>

                    {/* Action */}
                    <TableCell
                      align="center"
                      sx={{
                        whiteSpace: "nowrap",
                        paddingY: 1,
                      }}
                    >
                      {index === 0 ? (
                        <Button
                          type="button"
                          variant="contained"
                          color="primary"
                          size="small"
                          onClick={handleAddRow}
                          sx={{ minWidth: 36, padding: "6px" }}
                          aria-label="Add Row"
                        >
                          <FaPlus />
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          variant="contained"
                          color="error"
                          size="small"
                          onClick={() => handleRemoveRow(index)}
                          sx={{ minWidth: 36, padding: "6px" }}
                          aria-label="Remove Row"
                        >
                          <FaMinus />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              gap: 2,
              marginTop: 3,
            }}
          >
            <Button type="submit" variant="contained" color="primary">
              Submit
            </Button>
            <Button
              type="button"
              variant="contained"
              color="error"
              onClick={handleCancel}
            >
              Cancel
            </Button>
          </Box>
        </form>

        {/* Show registered members table directly */}
        <Box sx={{ mt: 4 }}>
          <CardHeading props="Registered Shaktishree Members" />
          
          {memberListLoading ? (
            <Typography>Loading registered members...</Typography>
          ) : registeredMembersData.length === 0 ? (
            <Typography>No registered members found.</Typography>
          ) : (
            <ReusableDataTable 
              data={registeredMembersData} 
              columns={registeredMembersColumns} 
            />
          )}
        </Box>
      </div>
    </LocalizationProvider>
  );
};

export default RegisterUser;