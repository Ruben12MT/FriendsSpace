import React from "react";
import { Navigate } from "react-router-dom";
import { CircularProgress, Box } from "@mui/material";
import useAuthStore from "../store/useAuthStore";

const ProtectedRoute = ({ children }) => {
  const { loggedUser, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <CircularProgress sx={{ color: "#C9A227" }} />
      </Box>
    );
  }

  if (!loggedUser) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;