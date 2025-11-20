import  { useState, useEffect } from 'react';

const ScrollLoader = ({ loading = true }) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  if (!loading) return null;

  if (isMobile) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-blue-200 rounded-full animate-spin"></div>
          <div className="absolute top-0 left-0 w-12 h-12 border-4 border-transparent border-t-blue-600 border-r-blue-600 rounded-full animate-spin"></div>
        </div>
        <div className="mt-4 flex space-x-1">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-8">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-blue-200 rounded-full animate-spin"></div>
        <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-blue-600 border-r-blue-600 rounded-full animate-spin"></div>
        <div className="absolute top-2 left-2 w-12 h-12 border-4 border-transparent border-b-blue-400 border-l-blue-400 rounded-full animate-spin animation-delay-150"></div>
      </div>
    </div>
  );
};

export default ScrollLoader;