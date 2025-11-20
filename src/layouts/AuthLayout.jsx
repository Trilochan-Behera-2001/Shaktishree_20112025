import { Outlet } from "react-router-dom";


const AuthLayout = ({ children }) => {
  return (
    <div>
      <div>
        {children}
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;
