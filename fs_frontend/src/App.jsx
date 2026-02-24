import React from "react";
import { createBrowserRouter } from "react-router";
import Home from "./pages/Home";
import ErrorPage from "./pages/ErrorPage";
import { RouterProvider } from "react-router-dom";
import UserPage from "./pages/UserPage";
import { CssBaseline } from "@mui/material";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import UserBar from "./components/UserBar";
import ProtectedRoute from "./components/ProtectedRoute";
const router = createBrowserRouter([
  {
    path: "/",
    Component: Home,
    errorElement: <ErrorPage />,
    children: [{ index: true, element: <h3>HOME</h3> }],
  },

  {
    path: "/login",
    element: (
        <LoginPage />
    ),
  },

  {
    path: "/register",
    Component: RegisterPage,
  },

  {
    path: "/me",
    element: (
      <ProtectedRoute>
        <UserBar />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <UserPage /> },
      { path: "searchnewfriends", element: <h3>Buscar nuevos amigos</h3> },
    ],
  },
]);

function App() {
  return (
    <>
      <CssBaseline />
      <RouterProvider router={router} />
    </>
  );
}
export default App;
