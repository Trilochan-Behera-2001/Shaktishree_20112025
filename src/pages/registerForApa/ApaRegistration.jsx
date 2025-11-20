import * as React from "react";
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Paper,
  Grid,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { useState, useEffect } from "react";
import CardHeading from "../../components/common/CardHeading";
import {
  emailDuplichkApa,
  generateOTP,
  getOptions,
  saveApaDetails,
  verifyOtp,
} from "../../services/registerApaServices";
import { encryptPayload } from "../../crypto/encryption";
import { toast } from "react-toastify";
import Loader from "../../components/common/Loader";
import { useNavigate } from "react-router-dom";

const steps = [
  "Select District",
  "Enter Contact Info",
  "Verify OTP",
  "Complete Registration",
];

export default function ApaRegistration() {
  const [activeStep, setActiveStep] = useState(0);
  const [skipped, setSkipped] = useState(new Set());
  const [otp, setOtp] = useState(Array(6).fill(""));
  const inputsRef = React.useRef([]);
  const [isloader, setIsloader] = useState(false);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    districtId: "",
    mobile: "",
    aadhar: "",
    registerName: "",
    registerEmail: "",
    dob: null,
    designation: "",
    qualification: "",
  });

  const [districts, setDistricts] = useState([]);

  const getOptionsDistricts = async () => {
    setIsloader(true);
    try {
      const res = await getOptions();

      setDistricts(res?.data || []);
    } catch (error) {
      console.log(error);
    } finally {
      setIsloader(false);
    }
  };

  useEffect(() => {
    getOptionsDistricts();
  }, []);

  const getOTP = async (num) => {
    setIsloader(true);
    try {
      const payload = encryptPayload(num);
      const res = await generateOTP(payload);
      console.log(res);
      if (res.status == 200) {
        toast.success(res?.data.message);
        handleNext();
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsloader(false);
    }
  };
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleOtpChange = (e, index) => {
    const value = e.target.value.replace(/[^0-9]/g, "");
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < inputsRef.current.length - 1) {
      inputsRef.current[index + 1].focus();
    }
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1].focus();
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setIsloader(true);
    try {
      const otpString = otp.join("");
      const payload = encryptPayload(otpString);
      const res = await verifyOtp(payload);

      if (res?.data?.outcome) {
        toast.success(res?.data?.message);
        setActiveStep((prev) => prev + 1);
      } else {
        toast.error(res?.data?.message);
      }
    } catch (error) {
      console.error("OTP verification failed:", error);
    } finally {
      setIsloader(false);
    }
  };

  const isStepSkipped = (step) => skipped.has(step);

  const handleNext = () => {
    let newSkipped = skipped;
    if (isStepSkipped(activeStep)) {
      newSkipped = new Set(newSkipped.values());
      newSkipped.delete(activeStep);
    }
    setActiveStep((prev) => prev + 1);
    setSkipped(newSkipped);
  };

  const handleBack = () => setActiveStep((prev) => prev - 1);

  const handleReset = () => {
    setActiveStep(0);
    setFormData({
      districtId: "",
      mobile: "",
      aadhar: "",
      registerName: "",
      registerEmail: "",
      dob: null,
      designation: "",
      qualification: "",
    });
    setOtp(Array(6).fill(""));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep()) return;
    setIsloader(true);
    try {
      const payload = encryptPayload(formData);
      const res = await saveApaDetails(payload);
      if (res?.status === 200) {
        toast.success(res?.data.message);
        navigate("/apa-list", { state: { newRecord: formData } });
      } else {
        toast.error(res?.data.message);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsloader(false);
    }
    // setActiveStep(prev => prev + 1);
  };

  const handleBlurEmail = async (value) => {
 
    if (!value) return; 

    setIsloader(true);
    try {
      const result = await emailDuplichkApa(value);

      if (result?.data?.isDuplicate) {
        toast.error("Email is already registered");
        handleInputChange("registerEmail", ""); 
      }
    } catch (err) {
      console.error("Error validating email:", err);
      toast.error("Something went wrong while checking email");
    } finally {
      setIsloader(false);
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Paper
            elevation={0}
            sx={{ border: "1px solid #ccc", p: 4, borderRadius: 3 }}
          >
            <Typography
              variant="h6"
              gutterBottom
              fontWeight={600}
              sx={{ mb: 3 }}
            >
              Step 1: Select Your District
            </Typography>
            <div className="grid grid-cols-12">
              <div className="col-span-2">
                <FormControl fullWidth size="small">
                  <InputLabel>District</InputLabel>
                  <Select
                    label="District"
                    value={formData.districtId}
                    onChange={(e) =>
                      handleInputChange("districtId", e.target.value)
                    }
                    required
                  >
                    {districts.map((district, idx) => (
                      <MenuItem key={idx} value={district.districtId}>
                        {district.districtName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </div>
            </div>
          </Paper>
        );
      case 1:
        return (
          <Paper
            elevation={0}
            sx={{ border: "1px solid #ccc", p: 4, borderRadius: 3 }}
          >
            <Typography
              variant="h6"
              gutterBottom
              fontWeight={600}
              sx={{ mb: 3 }}
            >
              Step 2: Enter Contact Info
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Mobile Number"
                  size="small"
                  fullWidth
                  autoComplete="off"
                  value={formData.mobile}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, "");
                    if (value.length === 1 && !/[6-9]/.test(value)) {
                      toast.error(
                        "Mobile number must start with 6, 7, 8, or 9"
                      );
                      return;
                    }
                    if (value.length <= 10) handleInputChange("mobile", value);
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Aadhar Number"
                  size="small"
                  fullWidth
                  autoComplete="off"
                  value={formData.aadhar}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, "");
                    if (value.length <= 12) handleInputChange("aadhar", value);
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Button
                  variant="contained"
                  onClick={() => {
                    if (validateStep()) {
                      getOTP(formData.mobile);
                    } else {
                      // Validation failed, error message already shown in validateStep
                      return;
                    }
                  }}
                >
                  GET OTP
                </Button>
              </Grid>
            </Grid>
          </Paper>
        );
      case 2:
        return (
          <Paper
            elevation={0}
            sx={{
              border: "1px solid #ccc",
              p: 4,
              borderRadius: 3,
              textAlign: "center",
            }}
          >
            <Typography
              variant="h6"
              gutterBottom
              fontWeight={600}
              sx={{ mb: 3 }}
            >
              Step 3: Verify OTP
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>
              Enter the 6-digit OTP sent to your mobile
            </Typography>
            <div className="flex gap-3 justify-center items-center">
              {otp.map((digit, i) => (
                <input
                  key={i}
                  type="text"
                  maxLength="1"
                  value={digit}
                  ref={(el) => (inputsRef.current[i] = el)}
                  onChange={(e) => handleOtpChange(e, i)}
                  onKeyDown={(e) => handleOtpKeyDown(e, i)}
                  className="w-14 h-14 text-2xl text-center rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none transition"
                />
              ))}
            </div>
            <Button
              variant="contained"
              color="primary"
              onClick={handleVerifyOtp}
              sx={{ mt: 3, px: 4, borderRadius: 2 }}
              disabled={otp.join("").length !== 6}
            >
              Verify OTP
            </Button>
          </Paper>
        );
      case 3:
        return (
          <Paper
            elevation={0}
            sx={{ border: "1px solid #ccc", p: 4, borderRadius: 3 }}
          >
            <Typography
              variant="h6"
              gutterBottom
              fontWeight={600}
              sx={{ mb: 3 }}
            >
              Step 4: Complete Registration
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Full Name"
                  size="small"
                  fullWidth
                  autoComplete="off"
                  value={formData.registerName}
                  onChange={(e) => {
                    const value = e.target.value;
                    const formattedValue = value.replace(/[^a-zA-Z\s]/g, "");
                    if (formattedValue.length <= 30) {
                      handleInputChange("registerName", formattedValue);
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Email"
                  size="small"
                  fullWidth
                  autoComplete="off"
                  value={formData.registerEmail}
                  onChange={(e) => {
                    const value = e.target.value.replace(
                      /[^a-zA-Z0-9._@]/g,
                      ""
                    );
                    if (value.length <= 25) {
                      handleInputChange("registerEmail", value);
                    }
                  }}
                  onBlur={(e) => handleBlurEmail(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="Date of Birth"
                  value={formData.dob}
                  onChange={(newValue) => handleInputChange("dob", newValue)}
                  slotProps={{
                    textField: { size: "small", fullWidth: true },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Designation"
                  size="small"
                  fullWidth
                  autoComplete="off"
                  value={formData.designation}
                  onChange={(e) =>
                    handleInputChange("designation", e.target.value)
                  }
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Highest Qualification"
                  size="small"
                  fullWidth
                  autoComplete="off"
                  value={formData.qualification}
                  onChange={(e) =>
                    handleInputChange("qualification", e.target.value)
                  }
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Button variant="contained" fullWidth type="submit">
                  Submit
                </Button>
              </Grid>
            </Grid>
          </Paper>
        );
      default:
        return null;
    }
  };
  const validateStep = () => {
    switch (activeStep) {
      case 0:
        if (!formData.districtId) {
          toast.error("Please select a District");
          return false;
        }
        return true;

      case 1:
        if (!formData.mobile.trim()) {
          toast.error("Mobile number is required");
          return false;
        }
        if (!/^[0-9]{10}$/.test(formData.mobile)) {
          toast.error("Mobile number must be exactly 10 digits");
          return false;
        }

        if (!formData.aadhar.trim()) {
          toast.error("Aadhar number is required");
          return false;
        }
        if (!/^[0-9]{12}$/.test(formData.aadhar)) {
          toast.error("Aadhar number must be exactly 12 digits");
          return false;
        }
        return true;

      case 2:
        if (otp.join("").length !== 6) {
          toast.error("Please enter 6-digit OTP");
          return false;
        }
        return true;

      case 3: {
        // Declare variables in a block scope to avoid no-case-declarations error
        if (!formData.registerName.trim()) {
          toast.error("Full Name is required");
          return false;
        }
        if (!formData.registerEmail.trim()) {
          toast.error("Email is required");
          return false;
        }

        if (!formData.registerEmail.includes("@")) {
          toast.error("Please enter a valid email address (must contain '@')");
          return false;
        }

        if (!/^[a-zA-Z0-9._@]+$/.test(formData.registerEmail)) {
          toast.error("Email can only contain letters, numbers, ., _ and @");
          return false;
        }
        if (!formData.dob) {
          toast.error("Date of Birth is required");
          return false;
        }
        const today = new Date();
        const dob = new Date(formData.dob);
        const age = today.getFullYear() - dob.getFullYear();
        if (age < 16) {
          toast.error("Age must be at least 16 years");
          return false;
        }
        if (!formData.designation.trim()) {
          toast.error("Designation is required");
          return false;
        }
        if (!formData.qualification.trim()) {
          toast.error("Qualification is required");
          return false;
        }
        return true;
      }

      default:
        return true;
    }
  };

  return (
    <>
      {isloader && <Loader />}
      <Box sx={{ width: "100%", background: "#fff", p: 3, borderRadius: 2 }}>
        <CardHeading props={"Register APA"} />

        <Stepper
          activeStep={activeStep}
          alternativeLabel
          sx={{
            mb: 4,
            width: "100%",
            "& .MuiStepLabel-root .Mui-completed": {
              color: "green",
            },
          }}
        >
          {steps.map((label, index) => {
            const stepProps = {};
            const labelProps = {};
            if (isStepSkipped(index)) stepProps.completed = false;
            return (
              <Step key={label} {...stepProps}>
                <StepLabel {...labelProps}>
                  <Typography fontWeight={600}>{label}</Typography>
                </StepLabel>
              </Step>
            );
          })}
        </Stepper>

        {activeStep === steps.length ? (
          <Box textAlign="center">
            <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
              Profile Registered Successfully!
            </Typography>
            <Button onClick={handleReset} variant="contained" sx={{ mt: 2 }}>
              Register Another APA
            </Button>
          </Box>
        ) : (
          <Box>
            <form action="" onSubmit={handleSubmit}>
              {renderStepContent(activeStep)}
            </form>

            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                pt: 3,
                justifyContent: "space-between",
              }}
            >
              {activeStep === 1 && (
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={handleBack}
                >
                  Back
                </Button>
              )}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-end",
                  width: "100%",
                }}
              >
                {activeStep == 0 && (
                  <Button
                    variant="contained"
                    onClick={() => {
                      if (validateStep()) {
                        handleNext();
                      } else {
                        // Validation failed, error message already shown in validateStep
                        return;
                      }
                    }}
                    sx={{ borderRadius: 2 }}
                  >
                    Next
                  </Button>
                )}
              </Box>
            </Box>
          </Box>
        )}
      </Box>
    </>
  );
}
