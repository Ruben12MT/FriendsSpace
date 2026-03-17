import React from "react";
import { createBrowserRouter } from "react-router";
import Home from "./pages/Home";
import ErrorPage from "./pages/ErrorPage";
import { RouterProvider } from "react-router-dom";
import UserPage from "./pages/UserPage";
import { Box, CssBaseline } from "@mui/material";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import UserBar from "./components/UserBar";
import ProtectedRoute from "./components/ProtectedRoute";
import EditUserPage from "./pages/EditUserPage";
import { useAppTheme } from "./hooks/useAppTheme";
import AdsPage from "./pages/AdsPage";
import SearchNewFriendsPage from "./pages/SearchNewFriendsPage";

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
    path: "/app",
    element: (
      <ProtectedRoute>
        <UserBar />
      </ProtectedRoute>
    ),
    children: [
      { path: "searchnewfriends", element: <SearchNewFriendsPage/> },
      { path: "ads", element: <AdsPage/>},
      { path: "chats", element: <h3>Chats</h3> },

      { path: ":id", element: <UserPage /> },
      { path: "user/edit", element: <EditUserPage /> },
    ],
  },
]);

function App() {
  const theme = useAppTheme();
  return (
    <Box
      sx={{
        px: 2,
        minHeight: "100vh",
        width: "100%",
        overflowX: "hidden",
        display: "flex",
        flexDirection: "column",
        position: "relative", // Importante
      }}
    >
    <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: -2, 
          backgroundImage: `url(${theme.backgroundImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          pointerEvents: "none", // Para que no interfiera con clicks
        }}
      />
      <CssBaseline />
      <RouterProvider router={router} />
    </Box>
  );
}
export default App;
