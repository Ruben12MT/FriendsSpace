import React from "react";
import { createBrowserRouter } from "react-router";
import Home from "./pages/Home";
import ErrorPage from "./pages/ErrorPage";
import { RouterProvider } from "react-router-dom";
import UserPage from "./pages/UserPage";
import { Box, createTheme, CssBaseline, ThemeProvider } from "@mui/material";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import UserBar from "./components/UserBar";
import ProtectedRoute from "./components/ProtectedRoute";
import EditUserPage from "./pages/EditUserPage";
import { useAppTheme } from "./hooks/useAppTheme";
import AdsPage from "./pages/AdsPage";
import SearchNewFriendsPage from "./pages/SearchNewFriendsPage";
import RequestsPages from "./pages/RequestsPage";
import { SocketProvider } from "./context/SocketProvider";
import { AuthProvider } from "./components/AuthProvider";
import ChatsPage from "./pages/ChatsPage";
import BannedPage from "./pages/BannedPage";
import AdminsPage from "./pages/AdminsPage";
import ChangePasswordPage from "./pages/ChangePasswordPage";
import { ErrorProvider } from "./context/ErrorContext";
import ErrorDialog from "./components/ErrorDialog";

const router = createBrowserRouter([
  {
    path: "/",
    Component: Home,
    errorElement: <ErrorPage />,
    children: [{ index: true, element: <h3>HOME</h3> }],
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    Component: RegisterPage,
  },
  {
    path: "/banned",
    element: <BannedPage />,
  },
  {
    path: "/app",
    element: (
      <ProtectedRoute>
        <UserBar />
      </ProtectedRoute>
    ),
    children: [
      { path: "searchnewfriends", element: <SearchNewFriendsPage /> },
      { path: "ads", element: <AdsPage /> },
      { path: "admins", element: <AdminsPage /> },
      { path: "chats", element: <ChatsPage /> },
      { path: "requests", element: <RequestsPages /> },
      { path: ":id", element: <UserPage /> },
      { path: "user/edit", element: <EditUserPage /> },
      { path: "user/changePassword", element: <ChangePasswordPage /> },
    ],
  },
]);

function App() {
  const theme = useAppTheme();
  const nunitoTheme = createTheme({
  typography: {
    fontFamily: "'Nunito', sans-serif",
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        "*": { fontFamily: "'Nunito', sans-serif" },
        body: { fontFamily: "'Nunito', sans-serif" },
      },
    },
  },
});
  return (
    <ThemeProvider theme={nunitoTheme}>
      <Box
        sx={{
          minHeight: "100vh",
          width: "100%",
          overflowX: "hidden",
          display: "flex",
          flexDirection: "column",
          position: "relative",
        }}
      >
        <AuthProvider>
          <SocketProvider>
            <ErrorProvider>
              <Box
                sx={{
                  position: "fixed",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  zIndex: -2,
                  background: theme.primaryBack,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  pointerEvents: "none",
                }}
              />
              <CssBaseline />
              <RouterProvider router={router} />
              <ErrorDialog />
            </ErrorProvider>
          </SocketProvider>
        </AuthProvider>
      </Box>
    </ThemeProvider>
  );
}

export default App;
