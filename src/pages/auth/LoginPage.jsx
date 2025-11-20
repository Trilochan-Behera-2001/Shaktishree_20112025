import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { FaArrowRight } from "react-icons/fa";
import shape1 from "../../assets/shape2.jpeg";
import eventShape from "../../assets/eventShape.png";
import loghandShape from "../../assets/loghandShape.png";
import { FaQuestionCircle } from "react-icons/fa";
import { TextField, Button, InputAdornment, IconButton, CircularProgress } from "@mui/material";
import { FaUser,  } from "react-icons/fa";
import "./Login.css";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchCaptcha, loginUser } from "../../redux/slices/authSlice";
import { encryptPayload } from "../../crypto/encryption";
import {
  MdVisibility,
  MdVisibilityOff,
  MdLock,
  MdOutlineRefresh,
} from "react-icons/md";
import OtpModal from "./OtpModal";
import { toast } from "react-toastify";
import Header from "../cms/LandingComponent/header/Header";

const events = [
  "A curated list of upcoming art exhibits, and student activities.",
  "Discover this month's events, from academic workshops.",
  "Your weekly guide to student, guest lectures.",
  "Don't miss a thing: here's the full lineup of events.",
  "The official schedule for food vendors, and family activities.",
  "Your complete guide to all the performances, activities.",
  "Our full schedule of keynote speakers, breakout sessions.",
];

const scrollingEvents = [...events, ...events];

// Yup validation schema
const validationSchema = yup.object().shape({
  username: yup
    .string()
    .required("Username is required")
    .min(3, "Username must be at least 3 characters")
    .matches(/^\S*$/, "Username must not contain spaces")
    .max(40, "Username must not exceed 20 characters"),
  password: yup
  .string()
  .required("Password is required")
  .min(6, "Password must be at least 6 characters")
  .max(15, "Password must not exceed 15 characters")
  .matches(/^\S*$/, "Password must not contain spaces"),
  captcha: yup
    .string()
    .required("Captcha is required")
    .matches(/^\d+$/, "Captcha must contain only numbers"),
  // .length(1, "Captcha must be exactly 1 digits"),
});

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);

  const { loading, captchaImage,captchaToken, token } = useSelector(
    (state) => state.auth
  );
  const [captchaRefreshKey, setCaptchaRefreshKey] = useState(Date.now());

  // React Hook Form setup
  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    setValue,
  } = useForm({
    resolver: yupResolver(validationSchema),
    mode: "onChange",
    defaultValues: {
      username: "",
      password: "",
      captcha: "",
    },
  });

  useEffect(() => {
    dispatch(fetchCaptcha());
  }, [dispatch]);

  useEffect(() => {
    if (token) {
      navigate("/home");
    }
  }, [token, navigate]);

  const handleRefreshCaptcha = () => {
    dispatch(fetchCaptcha());
    setCaptchaRefreshKey(Date.now());
    setValue("captcha", "");
  };

  const onSubmit = async (data) => {
   
    
    const formData = {
      userName: data.username,
      password: data.password,
      isOtp: false,
      captcha: data.captcha,
      captchaToken:captchaToken,
    };
    
    const payload = encryptPayload(formData);

    try {
      const response = await dispatch(loginUser(payload)).unwrap();
      
      if (response && response.outcome === false) {
        
        const errorMsg = response.message || response.error || "Login failed";
        toast.error(errorMsg);
        
        handleRefreshCaptcha();
       
        reset({
          username: "",
          password: "",
          captcha: ""
        });
      } else if (response && response.outcome === true) {
        // toast.success(response.message || "Login successful!");
        reset({
          username: "",
          password: "",
          captcha: ""
        });
      }
    } catch (error) {
      const errorMsg =
        typeof error === "string"
          ? error
          : error?.message || error?.error || "Login failed";

      toast.error(errorMsg);
      // Refresh captcha only on failure
      handleRefreshCaptcha();
      // Clear form fields on failure
      reset({
        username: "",
        password: "",
        captcha: ""
      });
    }
  };

  const handleUsernameInput = (e, onChange) => {
    const value = e.target.value.replace(/\s/g, "");
    onChange(value);
  };

  const handlePasswordInput = (e, onChange) => {
    const value = e.target.value.replace(/\s/g, "");
    onChange(value);
  };

  const handleCaptchaInput = (e, onChange) => {
    const value = e.target.value.replace(/[^\d]/g, "");
    onChange(value);
  };

  return (
    <div className="login_page h-screen bg-white overflow-hidden ">
      <div className="hand_shape">
        <img src={loghandShape} alt="" className="img-fluid" />
      </div>
      <span
        className="fxt-shape fxt-animation-active"
        style={{
          height: "100%",
          backgroundColor: "rgb(130 150 200)",
          backgroundImage: `url(${shape1})`,
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundBlendMode: "multiply",
          backgroundPosition: "center",
          position: "absolute",
          left: 0,
          top: 0,
          width: "100%",
        }}
      ></span>
      <div className="container mx-auto ">
        <Header />
      </div>
      <div className="container mx-auto px-20">
        <div className="login_content mt-10 pt-12 container mx-auto flex flex-wrap relative">
          <div className="events-column w-full md:w-7/12">
            <div className="relative">
              <h2 className="text-center text-3xl font-bold mb-5 text-white relative event_heading">
                Events / Workshop
              </h2>
              <div className="eventShape w-[30%]">
                <img src={eventShape} alt="" className="img-fluid invert" />
              </div>
            </div>
            <div className="events-container">
              <ul className="events-list">
                {scrollingEvents.map((event, idx) => (
                  <li key={idx} className="event-item">
                    <div className="event_icon">
                      <FaArrowRight />
                    </div>
                    {event}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="form_box md:w-5/12 mx-auto text-center events_form">
            <div className="login_form">
              <h2 className="text-center text-3xl font-bold mb-12 text-blue-700">
                Login to Shaktishree
              </h2>
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="flex flex-col gap-4 items-center"
              >
                {/* Username Field */}
                <Controller
                  name="username"
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <TextField
                      label="User Name"
                      variant="outlined"
                      size="small"
                      value={value}
                      onChange={(e) => handleUsernameInput(e, onChange)}
                      error={!!errors.username}
                      helperText={errors.username?.message}
                      sx={{
                        width: 350,
                        "& .MuiOutlinedInput-root": { height: 40 },
                        "& .MuiInputLabel-root": { fontSize: "14px" },
                        "& .MuiFormHelperText-root": { fontSize: "12px" },
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <FaUser />
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                />

                {/* Password Field */}
                <Controller
                  name="password"
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <TextField
                      label="Password"
                      type={showPassword ? "text" : "password"}
                      variant="outlined"
                      size="small"
                      value={value}
                      onChange={(e) => handlePasswordInput(e, onChange)}
                      inputProps={{ maxLength: 15 }}
                      error={!!errors.password}
                      helperText={errors.password?.message}
                      sx={{
                        width: 350,
                        "& .MuiOutlinedInput-root": { height: 40 },
                        "& .MuiInputLabel-root": { fontSize: "14px" },
                        "& .MuiFormHelperText-root": { fontSize: "12px" },
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <MdLock className="text-primary" />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowPassword(!showPassword)}
                              edge="end"
                              size="small"
                            >
                              {showPassword ? (
                                <MdVisibilityOff />
                              ) : (
                                <MdVisibility />
                              )}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                />

                {/* Captcha Field */}
                <div className="flex items-start gap-2 w-[350px]">
                  <div className="flex-1">
                    <Controller
                      name="captcha"
                      control={control}
                      render={({ field: { onChange, value } }) => (
                        <TextField
                          label="Enter Captcha"
                          variant="outlined"
                          size="small"
                          value={value}
                          onChange={(e) => handleCaptchaInput(e, onChange)}
                          error={!!errors.captcha}
                          helperText={errors.captcha?.message}
                          sx={{
                            width: "100%",
                            "& .MuiOutlinedInput-root": { height: 40 },
                            "& .MuiInputLabel-root": { fontSize: "14px" },
                            "& .MuiFormHelperText-root": { fontSize: "12px" },
                          }}
                          inputProps={{
                            minLength: 1,
                            pattern: "[0-9]*",
                            inputMode: "numeric",
                          }}
                        />
                      )}
                    />
                  </div>
                  <img
                    key={captchaRefreshKey}
                    src={captchaImage?.replace(
                      /(data:image\/png;base64,)+/,
                      "data:image/png;base64,"
                    )}
                    alt="Captcha"
                    className="h-10 w-auto border rounded mt-0"
                  />
                  <button
                    onClick={handleRefreshCaptcha}
                    type="button"
                    className="text-xl p-2 hover:bg-gray-100 rounded mt-0 h-10 flex items-center justify-center"
                  >
                    <MdOutlineRefresh />
                  </button>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={loading}
                  title={!isValid ? "Please complete all fields correctly" : ""}
                  sx={{ 
                    width: 350, 
                    height: 40, 
                    mt: 2,
                    backgroundColor: loading ? 'primary.main' : 'primary.main',
                    '&.Mui-disabled': {
                      backgroundColor: 'primary.main',
                      color: 'white'
                    }
                  }}
                >
                  {loading ? (
                    <div className="login-loader">
                      <CircularProgress 
                        size={20} 
                        sx={{ 
                          color: 'white'
                        }} 
                      />
                      {/* <span className="loader-text">Logging in...</span> */}
                    </div>
                  ) : (
                    "LOGIN"
                  )}
                </Button>

                <div className="flex justify-end items-center w-[350px]">
                  <Button
                    onClick={() => setShowOtpModal(true)}
                    size="small"
                    sx={{ color: "primary.main", fontWeight: "bold" }}
                    startIcon={<FaQuestionCircle />}
                  >
                    Forgot Password?
                  </Button>
                </div>
                <OtpModal
                  show={showOtpModal}
                  handleClose={() => setShowOtpModal(false)}
                />
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}