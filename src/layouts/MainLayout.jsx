import {  useState } from "react";
import { Outlet } from "react-router-dom";
// import { useSelector } from "react-redux";
import Header from "../components/common/Header";
import Sidebar from "../components/common/Sidebar";
import Breadcrumbs from "../pages/dashboard/BreadCrumbs";

const MainLayout = () => {
  // const { user } = useSelector((state) => state.auth);
  const [collapse, setCollapse] = useState(false);

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar */}
      <aside className="flex h-screen"
      >
        {/* <h3>Hello, {user?.username || "User"}</h3> */}
        <Sidebar props={{collapse,setCollapse}} />
      </aside>

      {/* Main Content */}
      <div className={`flex flex-col transition-all duration-300 absolute top-0 ${
          collapse
            ? "w-[calc(100%-80px)] left-[80px]"
            : "w-[calc(100%-250px)] left-[250px]"
        }`}>
        {/* Navbar */}
        <Header collapse={collapse} setCollapse={setCollapse}/>

        {/* Page Content */}
        <main className="flex-1 p-4 overflow-y-auto ">
          <Breadcrumbs />
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;