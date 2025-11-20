import { useState, useEffect, useRef } from "react";
import { Dialog } from "@headlessui/react";
import { MdClose, MdRefresh } from "react-icons/md";
import { useQuery } from "@tanstack/react-query";
import { forgotCaptcha, otpgeneratefn, updatePasswordFn } from "../../services/ForgotCaptcha";
import { encryptPayload } from "../../crypto/encryption";
import { toast } from "react-toastify";

const OtpModal = ({ show, handleClose }) => {
  const [userName, setUsername] = useState("");
  const [captcha, setCaptcha] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [timer, setTimer] = useState(0);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isRefreshingCaptcha, setIsRefreshingCaptcha] = useState(false); // New state for captcha refresh

  const inputRefs = useRef([]);

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["captcha"],
    queryFn: forgotCaptcha,
    refetchOnWindowFocus: false,
    enabled: show,
  });
  const captchaImg = data?.captchaImage;
  const captchaToken = data?.captchaToken;

  useEffect(() => {
    let interval;
    if (isSending && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            setIsSending(false);
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isSending, timer]);

  const resetModal = () => {
    setUsername("");
    setCaptcha("");
    setOtpSent(false);
    setOtp(["", "", "", "", "", ""]);
    setNewPassword("");
    setIsSending(false);
    setTimer(0);
    setIsUpdating(false);
    setIsRefreshingCaptcha(false); // Reset captcha refresh state
  };

  const handleSendOtp = async () => {
  if (!userName || !captcha) {
    toast.error("Please fill in all required fields");
    return;
  }

  setIsSending(true);
  setTimer(30);

  try {
    const formData = { userName, captcha, captchaToken };
    const generateOtp = encryptPayload(formData);
    const response = await otpgeneratefn(generateOtp);

    if (response?.data?.outcome === true) {
    
      setOtpSent(true);
      setIsSending(false); 
      setTimer(0); 
      toast.success(response?.data?.message || "OTP sent successfully!");
      setTimeout(() => inputRefs.current[0]?.focus(), 200);
    } else {
      const message = response?.data?.message || "Failed to send OTP";
      toast.error(message);
      setIsSending(false);
      setTimer(0);
      refetch();
    }
  } catch (err) {
    console.error("OTP generation failed", err);
    const errorMsg =
      err?.response?.data?.message ||
      err?.message ||
      "Failed to send OTP";
    toast.error(errorMsg);
    setIsSending(false);
    setTimer(0);
    refetch();
  }
};

  const handleResendOtp = async () => {
    if (isSending) return;
    
    if (!userName || !captcha) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    setIsSending(true);
    setTimer(30);
    
    try {
      const formData = { userName, captcha, captchaToken };
      const generateOtp = encryptPayload(formData);
      const response = await otpgeneratefn(generateOtp);
      
      if (response?.data?.outcome === true) {
        toast.success(response?.data?.message || "OTP sent successfully!");
        setTimeout(() => inputRefs.current[0]?.focus(), 200);
        setIsSending(false);
        setTimer(0);
      } else {
       
        const message = response?.data?.message || "Failed to resend OTP";
        toast.error(message);
        setIsSending(false);
        setTimer(0); 
        refetch();
      }
    } catch (err) {
      console.error("Resend OTP failed", err);
      const errorMsg = err?.response?.data?.message || err?.message || "Failed to resend OTP";
      toast.error(errorMsg);
      setIsSending(false);
      setTimer(0); 
      refetch();
    }
  };

  const handleOtpChange = (value, index) => {
    if (/^[0-9]?$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      if (value && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
      if (!value && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  const handleUpdatePassword = async () => {
    if (isUpdating) return;
    
    const otpValue = otp.join("");
    if (otpValue.length !== 6 || otp.some(digit => digit === "")) {
      toast.error("Please fill in all OTP fields");
      return;
    }
    
    if (!newPassword) {
      toast.error("Please enter a new password");
      return;
    }
    
    setIsUpdating(true);

    try {
      const payload = { userName, otpCode: otpValue, newPassword };
      const encryptedPayload = encryptPayload(payload);
      const response = await updatePasswordFn(encryptedPayload);
      
      if (response?.data?.outcome === true) {
        toast.success("Password updated successfully!");
       
        resetModal();
        handleClose();
      } else {
        const message = response?.data?.message || "Failed to update password";
        toast.error(message);
        setIsUpdating(false);
      }
    } catch (err) {
      console.error("Update failed", err);
      const errorMsg = err?.response?.data?.message || err?.message || "Failed to update password";
      toast.error(errorMsg);
      setIsUpdating(false);
    }
  };

  // Modified to exclude isFetching from the loading condition for normal captcha refresh
  const showLoading = isLoading || isSending || isUpdating;

  if (showLoading) {
    return (
      <Dialog open={show} onClose={() => {}} className="relative z-50">
        {/* Overlay */}
        <div className="fixed inset-0 bg-black/40" aria-hidden="true" />

        {/* Modal */}
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-sm rounded-xl bg-white shadow-lg overflow-hidden">
            {/* Header */}
            <div className="relative bg-blue-600 text-white px-4 py-2">
              <Dialog.Title className="text-[18px] font-semibold text-center">
                Forgot Password?
              </Dialog.Title>
              <button
                onClick={() => {
                  resetModal();
                  handleClose();
                }}
                className="absolute right-2 top-2 text-white hover:text-gray-200"
              >
                <MdClose size={22} />
              </button>
            </div>

            {/* Loader Body */}
            <div className="p-5 space-y-4 flex flex-col items-center justify-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p>{isSending ? "Sending OTP..." : isUpdating ? "Updating Password..." : "Loading..."}</p>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    );
  }

  return (
    <Dialog open={show} onClose={() => {}} className="relative z-50">
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/40" aria-hidden="true" />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-sm rounded-xl bg-white shadow-lg overflow-hidden">
          {/* Header */}
          <div className="relative bg-blue-600 text-white px-4 py-2">
            <Dialog.Title className="text-[18px] font-semibold text-center">
              Forgot Password?
            </Dialog.Title>
            <button
              onClick={() => {
                resetModal();
                handleClose();
              }}
              className="absolute right-2 top-2 text-white hover:text-gray-200"
            >
              <MdClose size={22} />
            </button>
          </div>

          {/* Body */}
          <div className="p-5 space-y-4">
            {!otpSent ? (
              <>
                {/* Username */}
                <label className="text-sm font-medium">Username <span style={{color:"red"}}>*</span></label>
                <input
                  type="text"
                  placeholder="Enter Username"
                  value={userName}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="off"
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                {/* Captcha */}
                <label className="text-sm font-medium">Captcha <span style={{color:"red"}}>*</span></label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Enter Captcha"
                    value={captcha}
                    onChange={(e) => setCaptcha(e.target.value)}
                    autoComplete="off"
                    className="flex-1 rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <img
                    src={captchaImg}
                    alt="captcha"
                    className="w-[100px] h-10 border border-gray-300 object-cover rounded"
                  />
                  <button
                    onClick={async () => {
                      setIsRefreshingCaptcha(true);
                      await refetch();
                      setIsRefreshingCaptcha(false);
                    }}
                    disabled={isFetching || isRefreshingCaptcha}
                    className="text-gray-600 hover:text-blue-600 disabled:opacity-50"
                  >
                    {isRefreshingCaptcha ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-600"></div>
                    ) : (
                      <MdRefresh size={22} />
                    )}
                  </button>
                </div>

                {/* Send OTP + Cancel */}
                <div className="flex justify-between pt-3">
                  <button
                    onClick={handleSendOtp}
                    disabled={isSending}
                    className={`px-4 py-2 rounded text-white text-sm font-semibold shadow 
                      ${
                        isSending
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-blue-600 hover:bg-blue-700"
                      }`}
                  >
                    {isSending ? `Wait ${timer}s` : "SEND OTP"}
                  </button>
                  <button
                    onClick={() => {
                      resetModal();
                      handleClose();
                    }}
                    className="px-4 py-2 rounded text-white text-sm font-semibold shadow bg-red-600 hover:bg-red-700"
                  >
                    CANCEL
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* OTP Inputs */}
                <label className="text-sm font-medium">Enter OTP</label>
                <div className="flex justify-between gap-3">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      type="text"
                      maxLength={1}
                      value={digit}
                      ref={(el) => (inputRefs.current[index] = el)}
                      onChange={(e) => handleOtpChange(e.target.value, index)}
                      autoComplete="off"
                      className="w-12 h-12 text-center text-lg font-bold border-2 border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  ))}
                </div>

                {/* New Password */}
                <label className="text-sm font-medium">New Password <span style={{color:"red"}}>*</span></label>
                <input
                  type="password"
                  placeholder="Enter New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  autoComplete="new-password"
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                {/* Update + Resend + Back */}
                <div className="flex justify-between items-center pt-2">
                  <button
                    onClick={handleUpdatePassword}
                    disabled={isUpdating}
                    className={`px-5 py-2 rounded-lg text-white text-sm font-semibold shadow 
                      ${
                        isUpdating
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-green-600 hover:bg-green-700"
                      }`}
                  >
                    {isUpdating ? "Updating..." : "UPDATE"}
                  </button>

                  <button
                    onClick={handleResendOtp}
                    disabled={isSending}
                    className={`px-4 py-2 rounded-lg text-white text-sm font-semibold shadow 
                      ${
                        isSending
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-blue-600 hover:bg-blue-700"
                      }`}
                  >
                    {isSending ? `Resend in ${timer}s` : "RESEND OTP"}
                  </button>

                  <button
                    onClick={() => {
                      setOtpSent(false);
                      setOtp(["", "", "", "", "", ""]);
                      setNewPassword(""); 
                    }}
                    className="px-5 py-2 rounded-lg text-white text-sm font-semibold shadow bg-yellow-600 hover:bg-yellow-700"
                  >
                    BACK
                  </button>
                </div>
              </>
            )}
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default OtpModal;