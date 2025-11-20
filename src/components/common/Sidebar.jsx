import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getAllMenuList } from "../../services/MenuListAll";
import { ImMenu } from "react-icons/im";
import { FaWindowClose, FaAngleRight } from "react-icons/fa";
import shaktiLogo from "../../assets/images/shaktiLogo.png";
import pattern from "../../assets/pattern.png";
import Loader from "./Loader"; // Import the Loader component

const Sidebar = ({ props }) => {
  const [openMenu, setOpenMenu] = useState(null);
  const [openSubMenu, setOpenSubMenu] = useState(null);
  const { collapse, setCollapse } = props;

  // Destructure isLoading from useQuery
  const { data, isLoading } = useQuery({
    queryKey: ["menuListAll"],
    queryFn: getAllMenuList,
  });

  const [menuData, setMenuData] = useState([]);

  useEffect(() => {
    if (data?.data) {
      setMenuData(data.data);
    }
  }, [data]);

  const toggleMenu = (title) => {
    setOpenMenu(openMenu === title ? null : title);
    setOpenSubMenu(null);
  };

  const toggleSubMenu = (title) => {
    setOpenSubMenu(openSubMenu === title ? null : title);
  };

  function toggleSidebar() {
    setCollapse(!collapse);
  }

  const renderIcon = (iconClass) => {
    return <i className={`${iconClass} text-[14px]`}></i>;
  };

  const renderMenu = (items, level = 0) => {
    return items.map((item, index) => {
      const hasSubMenu = item.subMenu && item.subMenu.length > 0;

      if (hasSubMenu) {
        return (
          <li key={`${item.title}-${index}`} className="mb-2">
            <div
              className={`flex justify-between items-center py-2 ${
                collapse
                  ? "px-0 mx-2 rounded-lg"
                  : level === 0
                  ? "px-4 mx-2 rounded-lg bg-blue-700/30"  
                  : `pl-${(level + 2) * 2} px-3 rounded`
              } cursor-pointer text-white hover:bg-blue-700/70 transition-all duration-200 border-l-2 border-transparent hover:border-blue-400`}
              onClick={() =>
                level === 0 ? toggleMenu(item.title) : toggleSubMenu(item.title)
              }
            >
              <div
                className={`flex items-center gap-3 ${
                  collapse ? "justify-center w-full" : ""
                }`}
              >
                <span className="flex-shrink-0">{renderIcon(item.icon)}</span>
                {!collapse && (
                  <span className="text-sm font-medium">{item.title}</span>
                )}
              </div>
              {!collapse && (
                <span
                  className={`transition-transform duration-300 ${
                    (
                      level === 0
                        ? openMenu === item.title
                        : openSubMenu === item.title
                    )
                      ? "rotate-90"
                      : ""
                  }`}
                >
                  <FaAngleRight className="text-xs" />
                </span>
              )}
            </div>

            {(level === 0
              ? openMenu === item.title
              : openSubMenu === item.title) &&
              !collapse && (
                <ul className="bg-blue-900/20 list-none ml-2 border-l border-blue-500/40 pl-2 py-1 rounded-r-lg">
                  {renderMenu(item.subMenu, level + 1)}
                </ul>
              )}
          </li>
        );
      }

      return (
        <li key={`${item.title}-${index}`} className="mb-2">
          <NavLink
            to={item.link}
            className={({ isActive }) =>
              `flex items-center gap-3 py-2 ${
                collapse
                  ? "justify-center px-0 mx-2 rounded-lg"
                  : level === 0
                  ? "px-4 mx-2 rounded-lg bg-blue-700/30"  
                  : `pl-${(level + 2) * 2} px-3 rounded`
              } text-white hover:bg-blue-700/70 border-l-2 border-transparent hover:border-blue-400 transition-all duration-200 ${
                isActive
                  ? "bg-blue-700/60 text-white border-blue-300 font-medium"
                  : ""
              }`
            }
          >
            <span className="flex-shrink-0">{renderIcon(item.icon)}</span>
            {!collapse && <span className="text-sm">{item.title}</span>}
          </NavLink>
        </li>
      );
    });
  };

  return (
    <div
      className={`h-screen bg-gradient-to-b from-[#0a3c74] to-[#05254a] text-white fixed top-0 left-0 transition-all duration-300 font-nunito z-50 overflow-y-auto overflow-x-hidden ${
        collapse ? "w-[80px]" : "w-[250px]"
      }`}
    >
      {/* Show loader when menu data is loading */}
      <Loader loading={isLoading} />
      
      {/* background pattern */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `url(${pattern})`,
          backgroundSize: "cover",
          backgroundRepeat: "repeat",
          backgroundPosition: "center",
        }}
        aria-hidden="true"
      />

      {/* Header */}
      <div
        className={`relative flex items-center border-b border-white/10 bg-white/5 px-4 py-4 transition-all duration-300 z-10 ${
          collapse ? "justify-center" : ""
        }`}
        style={{ height: "80px", overflow: "hidden" }}
      >
        {!collapse && (
          <img
            src={shaktiLogo}
            alt="logo"
            className="w-30  object-cover"
          />
        )}
        <button
          className={`ml-auto text-blue-200 hover:text-white transition-colors`}
          onClick={toggleSidebar}
          style={{
            fontSize: "1.5rem",
            width: "40px",
            height: "40px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {collapse ? <ImMenu /> : <FaWindowClose />}
        </button>
      </div>

      {/* Menu Items */}
      <div className="relative z-10 py-4">
        <ul className="list-none m-0 p-0">{renderMenu(menuData)}</ul>
      </div>
    </div>
  );
};

export default Sidebar;