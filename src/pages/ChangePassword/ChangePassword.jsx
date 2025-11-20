import { useEffect, useState, memo } from "react";
import {
  Box,
  Grid,
  TextField,
  Typography,
  IconButton,
  Button,
  InputAdornment,
} from "@mui/material";
import { IoMdRefresh, IoMdEye, IoMdEyeOff } from "react-icons/io";
import { toast } from "react-toastify";
import { useUserProfile } from "../../hooks/useUserProfile";
import { ChangePasswords, ChangeCaptcha } from "../../services/ChangePassword";
import Loader from "../../components/common/Loader";
import { useQuery } from "@tanstack/react-query";
import { encryptPayload } from "../../crypto/encryption";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import { useDispatch } from "react-redux";
import { logoutUser } from "../../redux/slices/authSlice";

const passwordSchema = yup.object().shape({
  currentPassword: yup.string().required("Current password is required"),
  newPassword: yup
    .string()
    .required("New password is required")
    .min(6, "Password must be at least 6 characters")
    .max(15, "Password must be at most 15 characters")
    .matches(/[a-z]/, "Password must contain at least one lowercase letter")
    .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
    .matches(/\d/, "Password must contain at least one number")
    .matches(
      /[@#*]/,
      "Password must contain at least one special character (@/#/*)"
    )
    .test(
      "not-same-as-current",
      "New password must be different from current password",
      function (value) {
        const { currentPassword } = this.parent;
        if (value && currentPassword) {
          return value !== currentPassword;
        }
        return true;
      }
    ),
  confirmPassword: yup
    .string()
    .required("Confirm password is required")
    .test("passwords-match", "Passwords must match", function (value) {
      const { newPassword } = this.parent;
      if (value && newPassword) {
        return value === newPassword;
      }
      return true;
    }),
  captchaInput: yup.string().required("CAPTCHA is required"),
  // .test(
  //   "captcha-match",
  //   "CAPTCHA does not match",
  //   function(value) {
  //     const { captchaCode } = this.parent;
  //     if (value && captchaCode) {
  //       return value === captchaCode;
  //     }
  //     return true;
  //   }
  // )
});

export default memo(ChangePassword);

function ChangePassword() {
  const { data: user } = useUserProfile();
  const [loading, setLoading] = useState(false);
  const [captchaRefreshLoading, setCaptchaRefreshLoading] = useState(false);
  
  // Password visibility states
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const dispatch = useDispatch();

  const {
    data: captchaData,
    isLoading: isCaptchaLoading,
    refetch: refreshCaptcha,
  } = useQuery({
    queryKey: ["captcha"],
    queryFn: ChangeCaptcha,
    refetchOnWindowFocus: false,
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm({
    resolver: yupResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
      captchaInput: "",
    },
    mode: "onChange", 
    reValidateMode: "onChange",
  });

  const formValues = watch();

  useEffect(() => {
    refreshCaptcha();
  }, [refreshCaptcha]);

  const handleRefreshCaptcha = async () => {
    try {
      setCaptchaRefreshLoading(true);
      await refreshCaptcha();
    } catch (error) {
      toast.error(error.message || "Error refreshing CAPTCHA");
    } finally {
      setCaptchaRefreshLoading(false);
    }
  };

  const captchaImage = captchaData?.captchaImage || "";
  // const captchaCode = captchaData?.captchaCode || "";
  const captchaTokenCode = captchaData?.captchaToken || "";

  const onSubmit = async (data) => {
    if (
      !data.currentPassword ||
      !data.newPassword ||
      !data.confirmPassword ||
      !data.captchaInput
    ) {
      toast.error("All fields are required!");
      return;
    }

    // if (data.captchaInput !== captchaCode) {
    //   toast.error("CAPTCHA does not match!");
    //   return;
    // }

    if (data.newPassword !== data.confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        userName: user?.data?.userName || "", 
        oldPassword: data.currentPassword, 
        newPassword: data.newPassword, 
        confirmPassword: data.confirmPassword, 
        captcha: data.captchaInput,
        captchaToken: captchaTokenCode,
      };

      const finalPay = encryptPayload(payload);
      const res = await ChangePasswords(finalPay);
      

      if (res?.outcome === true) {
        const successMessage = res?.message || "Password changed successfully!";
        toast.success(successMessage);
        
        // Reset all form fields
        reset();
        
        // Dispatch logout action to clear auth state and expire token
        dispatch(logoutUser());
        
        // Redirect to login page
        window.location.href = "/login";
       
      } else {
        const errorMessage = res?.message || "Failed to change password";
        toast.error(errorMessage);
        refreshCaptcha();
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message || error.message || "Error occurred"
      );
      refreshCaptcha();
    } finally {
      setLoading(false);
    }
  };

  // Only show loader for form submission, not for CAPTCHA refresh
  if (loading) return <Loader />;

  return (
    <div className="bg-white px-5 py-5 rounded-lg shadow-md">
      {" "}
      <h2
        style={{
          fontWeight: "bold",
          textAlign: "center",
          color: "rgb(155 0 80)",
          fontSize: "1.5rem",
          borderBottom: "2px solid rgb(155 0 80)",
          paddingBottom: "5px",
          width: "fit-content",
          margin: "0 auto 0px",
        }}
      >
        {" "}
        Change Password{" "}
      </h2>{" "}
      <form onSubmit={handleSubmit(onSubmit)} key="change-password-form">
        {" "}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          {" "}
          <TextField
            label="User Id"
            value={user?.data?.userName || "User"}
            fullWidth
            disabled
            size="small"
          />{" "}
          <Controller
            name="currentPassword"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Current Password"
                type={showCurrentPassword ? "text" : "password"}
                fullWidth
                size="small"
                error={!!errors.currentPassword}
                helperText={errors.currentPassword?.message}
                autoComplete="new-password"
                inputProps={{
                  autoComplete: "new-password",
                  onPaste: (e) => e.preventDefault(),
                  onCopy: (e) => e.preventDefault(), 
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        edge="end"
                      >
                        {showCurrentPassword ? <IoMdEyeOff /> : <IoMdEye />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            )}
          />{" "}
          <Controller
            name="newPassword"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="New Password"
                type={showNewPassword ? "text" : "password"}
                fullWidth
                size="small"
                error={!!errors.newPassword}
                helperText={errors.newPassword?.message}
                autoComplete="new-password"
                inputProps={{
                  autoComplete: "new-password",
                  onPaste: (e) => e.preventDefault(),
                  onCopy: (e) => e.preventDefault(), 
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        edge="end"
                      >
                        {showNewPassword ? <IoMdEyeOff /> : <IoMdEye />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            )}
          />{" "}
          <Controller
            name="confirmPassword"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Confirm Password"
                type={showConfirmPassword ? "text" : "password"}
                fullWidth
                size="small"
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword?.message}
                autoComplete="new-password"
                inputProps={{
                  autoComplete: "new-password",
                  onPaste: (e) => e.preventDefault(),
                  onCopy: (e) => e.preventDefault(), 
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        edge="end"
                      >
                        {showConfirmPassword ? <IoMdEyeOff /> : <IoMdEye />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            )}
          />{" "}
          <Controller
            name="captchaInput"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Enter CAPTCHA"
                fullWidth
                size="small"
                error={!!errors.captchaInput}
                helperText={errors.captchaInput?.message}
              />
            )}
          />{" "}
          <div
            className="captcha-wrapper"
            style={{ display: "flex", alignItems: "center", gap: "8px" }}
          >
            <Box
              sx={{
                px: 2,
                py: 0.6,
                border: "1px solid #ccc",
                borderRadius: 1,
                fontFamily: "monospace",
                fontSize: "18px",
                fontWeight: "bold",
                letterSpacing: 2,
                background: "#f5f5f5",
              }}
            >
              {captchaImage ? (
                <img
                  src={captchaImage}
                  alt="captcha"
                  style={{ height: "30px" }}
                />
              ) : (
                "Loading..."
              )}
            </Box>
            <button 
              type="button" 
              onClick={handleRefreshCaptcha}
              disabled={captchaRefreshLoading || isCaptchaLoading}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: (captchaRefreshLoading || isCaptchaLoading) ? 'not-allowed' : 'pointer',
                padding: '8px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: (captchaRefreshLoading || isCaptchaLoading) ? 0.5 : 1
              }}
              onMouseEnter={(e) => {
                if (!(captchaRefreshLoading || isCaptchaLoading)) {
                  e.target.style.backgroundColor = '#f0f0f0';
                }
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
              }}
            >
              {captchaRefreshLoading || isCaptchaLoading ? (
                <div style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid #f3f3f3',
                  borderTop: '2px solid #3498db',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></div>
              ) : (
                <IoMdRefresh />
              )}
            </button>
          </div>
        </div>{" "}
        <Box sx={{ mt: 3, p: 2, bgcolor: "#e3f2fd", borderRadius: 1 }}>
          {" "}
          <Typography variant="subtitle2" sx={{ fontWeight: "bold", mb: 1 }}>
            {" "}
            Password must meet the following rules:{" "}
          </Typography>{" "}
          {[
            { 
              text: "Must be between 6 - 15 characters", 
              test: (pwd) => pwd.length >= 6 && pwd.length <= 15 
            },
            { 
              text: "Must have one lower case alphabet", 
              test: (pwd) => /[a-z]/.test(pwd) 
            },
            { 
              text: "Must have one upper case alphabet", 
              test: (pwd) => /[A-Z]/.test(pwd) 
            },
            { 
              text: "Must have one number", 
              test: (pwd) => /\d/.test(pwd) 
            },
            { 
              text: "Must have one special sign (@/#/*)", 
              test: (pwd) => /[@#*]/.test(pwd) 
            },
          ].map((rule, idx) => {
            const isNewPasswordValid = formValues.newPassword && !errors.newPassword;
            const isRuleSatisfied = formValues.newPassword && rule.test(formValues.newPassword);
            
            return (
              <Typography
                key={idx}
                sx={{
                  color: isRuleSatisfied ? "green" : isNewPasswordValid ? "red" : "red",
                  fontSize: "14px",
                }}
              >
                {" "}
                - {rule.text}{" "}
              </Typography>
            );
          })}
        </Box>{" "}
        <Box sx={{ mt: 3, display: "flex", gap: 2 }}>
          {" "}
          <Button type="submit" variant="contained" color="success">
            {" "}
            Change Password{" "}
          </Button>{" "}
          <Button 
            variant="contained" 
            color="warning"
            onClick={(e) => {
              e.preventDefault();
              window.history.back();
            }}
          >
            {" "}
            Back{" "}
          </Button>{" "}
        </Box>{" "}
      </form>{" "}
    </div>
  );
}