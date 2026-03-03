import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { checkSession } from "../utils/checkSession";
import { CircularProgress, Box } from "@mui/material";
import userAuthStore from "../store/useAuthStore";

 const ProtectedRoute = ({ children }) => {
  const [auth, setAuth] = useState({ loading: true, isAuth: false, user: null });
  const setUserId = userAuthStore
  ((state) => state.setUserId);
  const location = useLocation();

  useEffect(() => {
    checkSession().then((res) => {
      setAuth({ loading: false, isAuth: res.isAuth, user: res.user });
      if (res.user) setUserId(res.user.id);
    });
  }, [setUserId]);

  if (auth.loading) {
    return (
      <Box sx={{ minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", backgroundColor: "#f5f5f5" }}>
        <CircularProgress sx={{ color: "#50C2AF" }} />
      </Box>
    );
  }

  if (!auth.isAuth) return <Navigate to="/login" replace />;

  // Si first_login es 1 y no estamos ya en /edit, redirigimos
  if (auth.user?.first_login == 1 && !location.pathname.endsWith("/edit")) {
    return <Navigate to={"/app/" + auth.user.id + "/edit"} replace />;
  }

  return children;
};

export default ProtectedRoute;