import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaHome, FaRocket, FaHeart, FaStar, FaGem } from "react-icons/fa";
import shakti from "../../assets/shaktishree.png";

const NotFound = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const handleGoHome = () => {
    navigate("/home");
  };

  // 🔹 Detect which page user is on based on URL
  const currentPath = location.pathname;

  let code = 404;
  let message = "Oops! Page Not Found";

  if (currentPath.includes("forbidden")) {
    code = 403;
    message = "Oops! Access Forbidden";
  } 

  const floatingElements = [
    { icon: FaStar, color: "text-yellow-400", delay: "0s", duration: "3s" },
    { icon: FaHeart, color: "text-red-400", delay: "0.5s", duration: "4s" },
    { icon: FaGem, color: "text-purple-400", delay: "1s", duration: "5s" },
    { icon: FaRocket, color: "text-blue-400", delay: "1.5s", duration: "3.5s" },
  ];

  return (
    <div className="h-[100vh] bg-gradient-to-br from-indigo-50 via-white to-cyan-50 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-20 h-20 bg-blue-200 rounded-full opacity-30 animate-float-gentle"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-purple-200 rounded-full opacity-20 animate-float-gentle-delay"></div>
        <div className="absolute bottom-32 left-1/4 w-24 h-24 bg-green-200 rounded-full opacity-25 animate-float-gentle-slow"></div>
        <div className="absolute bottom-20 right-1/3 w-12 h-12 bg-pink-200 rounded-full opacity-30 animate-float-gentle"></div>

        {floatingElements.map((element, index) => (
          <div
            key={index}
            className={`absolute ${element.color} text-2xl opacity-20 animate-float-icon`}
            style={{
              top: `${Math.random() * 80 + 10}%`,
              left: `${Math.random() * 80 + 10}%`,
              animationDelay: element.delay,
              animationDuration: element.duration,
            }}
          >
            <element.icon />
          </div>
        ))}
      </div>

      {/* Header */}
      <header
        className={`bg-white/80 backdrop-blur-sm shadow-sm transition-all duration-800 ${
          isLoaded ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl p-2 shadow-lg animate-logo-pulse">
              <img
                src={shakti}
                alt="Shaktishree"
                className="w-full h-full object-contain filter brightness-0 invert"
              />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 animate-text-slide-in">
                Shaktishree
              </h1>
              <p className="text-sm text-gray-600 animate-text-slide-in-delay">
                Higher Education Department
              </p>
            </div>
          </div>

          <button
            onClick={handleGoHome}
            className="group flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105"
          >
            <FaHome className="text-sm group-hover:rotate-12 transition-transform" />
            <span className="text-sm font-medium">Home</span>
          </button>
        </div>
      </header>

      {/* Main Section */}
      <main className="max-w-6xl mx-auto px-6 py-20 flex items-center h-[100%] justify-center">
        <div
          className={`text-center mb-16 transition-all duration-1000 delay-300 ${
            isLoaded ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
          }`}
        >
          <div className="relative mb-8">
            <h1 className="text-8xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 animate-gradient-text select-none">
              {code}
            </h1>
            <div className="absolute inset-0 text-8xl md:text-9xl font-black text-blue-100 -z-10 animate-text-shadow">
              {code}
            </div>
          </div>

          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 animate-bounce-in">
              {message}
            </h2>
          </div>
        </div>
      </main>

      {/* Your custom <style jsx> section stays unchanged */}
    </div>
  );
};

export default NotFound;
