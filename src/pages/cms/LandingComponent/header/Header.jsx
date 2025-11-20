import shaktiLogo from "../../../../assets/images/shaktiLogo.png";
import odishaLogo from "../../../../assets/images/odishaLogo.png";
import mohan from "../../../../assets/images/mohan.png";
import suraj from "../../../../assets/images/suraj.png";
import { AiOutlineQuestionCircle } from "react-icons/ai";
import { RiLoginCircleLine } from "react-icons/ri";
import { FaHome } from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isLoginPage = location.pathname === "/login";

  return (
    <header className="w-full bg-gradient-to-b from-[#0D5A97] to-[#1A99AF] text-white sticky top-0 z-50">
      <div className="flex items-center justify-between pt-3 px-12">
        {/* Left Section */}
        <div className="flex items-center space-x-3" style={{ marginBottom: "5px" }}>
          <img src={shaktiLogo} alt="Shakti Logo" className="h-14" />
          <div className="flex items-center space-x-2 border-l border-blue-300 pl-3">
            <img src={odishaLogo} alt="Odisha Logo" className="h-14" />
            <div>
              <h2 className="text-[17px] font-semibold leading-tight font-lato border-b border-[#DE7E51] pb-[5px]">
                Higher Education Department
              </h2>
              <p className="text-[14px]">Government of Odisha</p>
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex space-x-6 items-center" style={{ marginBottom: "-5px" }}>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-4">
              <img src={mohan} alt="Chief Minister" className="h-14 mx-auto rounded-md" />
              <div>
                <p className="text-[14px] font-semibold font-lato">Sri Mohan Charan Majhi</p>
                <p className="text-[12px]">Hon’ble Chief Minister</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <img src={suraj} alt="Minister of Higher Education" className="h-14 mx-auto rounded-md" />
              <div>
                <p className="text-[14px] font-semibold font-lato">Sri Suryabanshi Suraj</p>
                <p className="text-[12px]">Hon’ble Minister of Higher Education</p>
              </div>
            </div>
          </div>

          {/* Buttons Section */}
          <div className="flex space-x-2">
            {isLoginPage ? (
              // Show Home button on login page
              <div className="relative">
                <button
                  onClick={() => navigate("/")}
                  className="bg-white text-blue-700 font-semibold text-[14px] pl-4 pr-12 py-2 rounded-full shadow-sm hover:bg-gray-100"
                >
                  HOME
                </button>
                <div className="absolute top-0 right-0">
                  <FaHome size={35} className="bg-blue-100 text-blue-700 rounded-full p-1" />
                </div>
              </div>
            ) : (
              // Show FAQ and Login buttons on all other pages
              <>
                <div className="relative">
                  <button className="bg-white text-blue-700 font-semibold text-[14px] pl-4 pr-12 py-2 rounded-full shadow-sm hover:bg-gray-100">
                    FAQ
                  </button>
                  <div className="absolute top-0 right-0">
                    <AiOutlineQuestionCircle
                      size={35}
                      className="bg-blue-100 text-blue-700 rounded-full p-1"
                    />
                  </div>
                </div>
                <div className="relative">
                  <button
                    onClick={() => navigate("/login")}
                    className="bg-[#31326F] text-white font-semibold text-[14px] pl-4 pr-12 py-2 rounded-full shadow-sm hover:bg-[#1d4ed8]"
                  >
                    LOGIN
                  </button>
                  <div className="absolute top-0 right-0">
                    <RiLoginCircleLine
                      size={35}
                      className="bg-white text-blue-700 rounded-full p-1"
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
