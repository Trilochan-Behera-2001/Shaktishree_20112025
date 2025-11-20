import React, { memo } from "react";
import { FaHome, FaChevronRight } from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";

export default memo(function BreadCrumbs({ title }) {
  const location = useLocation();

  // ✅ Check if we're on the home page
  const isHomePage = location.pathname === "/home" || location.pathname === "/";

  // ✅ Get only the last part of the URL path
  const pathnames = location.pathname.split("/").filter((x) => x);
  const lastSegment = pathnames[pathnames.length - 1] || "";

  // ✅ Format the last segment (remove dashes/underscores, capitalize)
  const formattedLabel = decodeURIComponent(lastSegment)
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <div className="w-full rounded-lg shadow-sm mb-3 px-4 py-2 flex items-center justify-between bg-gradient-to-r from-[#0a3c74] to-[#9B0050]">
      {/* Left: Show "Dashboard" only on home page */}
      {isHomePage ? (
        <div className="flex items-start gap-4">
          <div>
            <h5 className="text-lg font-medium text-white tracking-wide">
              Dashboard
            </h5>
            <div className="mt-1 h-0.5 w-20 bg-gradient-to-r from-sky-400 to-sky-200 rounded" />
          </div>
        </div>
      ) : (
        <div></div>
      )}

      {/* Right: Breadcrumb */}
      <div className="flex items-center gap-2">
        <nav
          className="flex items-center text-sm text-gray-200"
          aria-label="Breadcrumb"
        >
          {/* Home Link */}
          <Link
            to="/home"
            title="Home"
            className="inline-flex items-center gap-1 text-white transition"
          >
            <FaHome size={14} />
            <span className="hidden sm:inline"></span>
          </Link>

          {/* Show the last part of the URL on non-home pages */}
          {lastSegment && !isHomePage && (
            <>
              <FaChevronRight size={12} className="mx-2 text-white" />
              <span className="text-white font-medium capitalize">
                {title || formattedLabel}
              </span>
            </>
          )}
        </nav>
      </div>
    </div>
  );
});