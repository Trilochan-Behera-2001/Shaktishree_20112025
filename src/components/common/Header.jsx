import { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { logoutUser } from "../../redux/slices/authSlice";
import imgObj from "../../assets/imageobject";
import { useQueryClient } from '@tanstack/react-query';
import { useUserProfile } from "../../hooks/useUserProfile";
import { removeJwtToken } from "../../utils/cookieUtils";
import { 
  HiLogout, 
  HiKey, 
  HiChevronDown,
} from 'react-icons/hi';

const Header = () => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const {loading } = useSelector((state) => state.auth);
  const { data: user } = useUserProfile();

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      removeJwtToken();
      queryClient.removeQueries(['userProfile']);
      navigate("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  // Close dropdown if clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="bg-gradient-to-r from-[#0a3c74] to-[#1976d2] flex justify-between items-center px-5 h-20 sticky top-0 z-40 text-white font-nunito">
      {/* Left side - Logo & Text */}
      <div className="flex items-center gap-3">
        <img
          src={imgObj.odishaWhiteLogo}
          alt="logo"
          className="w-12 h-auto"
        />
        <div className="flex flex-col">
          <span className="text-lg font-semibold border-b border-pink-400 mb-1 pb-1">
            Higher Education Department
          </span>
          <p className="text-xs text-blue-100">Government of Odisha</p>
        </div>
      </div>

      {/* Right side - Modern Profile Dropdown */}
      <div className="flex items-center">
        <div className="relative" ref={dropdownRef}>
          {/* Profile Trigger Button */}
          <button
            onClick={() => setOpen(!open)}
            className="flex items-center space-x-2 p-2 rounded-lg bg-white/10 transition-all duration-200 outline-none ring-2 ring-white/30"
          >
            <div className="relative">
              <img
                src={imgObj.userimageLogo}
                alt="profile"
                className="w-10 h-10 rounded-full border-2 border-white/80 object-cover shadow-lg  transition-colors"
              />
              {/* Online status indicator */}
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium text-white/90">
                {user?.data?.firstName || 'User'}
              </p>
              <p className="text-xs text-white/70">Online</p>
            </div>
            <HiChevronDown 
              className={`w-4 h-4 text-white/80 transition-transform duration-200 ${
                open ? 'rotate-180' : ''
              }`} 
            />
          </button>

          {/* Modern Dropdown Menu */}
          {open && (
            <div className="absolute top-full right-0 mt-3 w-72 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50 transform transition-all duration-200 origin-top-right animate-in slide-in-from-top-2">
              {/* User Info Header */}
              <div className="px-5 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
                <div className="flex items-center space-x-3">
                  <img
                    src={imgObj.userimageLogo}
                    alt="profile"
                    className="w-12 h-12 rounded-full border-2 border-white object-cover shadow-sm"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {user?.data?.primaryRole?.displayName || 'User'}
                    </h3>
                    <p className="text-sm text-gray-600 truncate">
                      {user?.data?.email || 'user@example.com'}
                    </p>
                    <div className="flex items-center mt-1">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1"></div>
                        Active
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div className="py-2">

                {/* Change Password */}
                <div className="px-2 mt-1">
                  <Link
                    to="/changepassword"
                    className="flex items-center px-3 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors duration-150 group"
                    onClick={() => setOpen(false)}
                  >
                    <div className="flex items-center justify-center w-10 h-10 bg-amber-100 rounded-lg mr-3 group-hover:bg-amber-200 transition-colors">
                      <HiKey className="w-5 h-5 text-amber-600" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">Change Password</div>
                      <div className="text-xs text-gray-500">Update security</div>
                    </div>
                  </Link>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-100 my-2 mx-2"></div>

                {/* Logout */}
                <div className="px-2">
                  <button
                    onClick={handleLogout}
                    disabled={loading}
                    className="w-full flex items-center px-3 py-3 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-150 group disabled:opacity-50 cursor-pointer"
                  >
                    <div className="flex items-center justify-center w-10 h-10 bg-red-100 rounded-lg mr-3 group-hover:bg-red-200 transition-colors">
                      <HiLogout className="w-5 h-5 text-red-600" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-medium text-red-600">
                        {loading ? "Signing out..." : "Sign Out"}
                      </div>
                      <div className="text-xs text-red-500">End your session</div>
                    </div>
                    {loading && (
                      <div className="w-4 h-4 border-2 border-red-300 border-t-red-600 rounded-full animate-spin"></div>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Header;