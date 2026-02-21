import React from "react";
import { createBrowserRouter } from "react-router";
import Home from "./pages/Home";
import ErrorPage from "./pages/ErrorPage";
import { RouterProvider } from "react-router-dom";
import UserPage from "./pages/UserPage";
import HomeBar from "./components/HomeBar";
import { CssBaseline } from "@mui/material";
import LoginForm from "./pages/LoginPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import UserBar from "./components/UserBar";
const router = createBrowserRouter([
  {
    path: "/",
    Component: Home,
    errorElement: <ErrorPage />,
    children: [{ index: true, element: <h3>HOME</h3> }],
  },

  {
    path: "/login",
    Component: LoginPage,
  },

  {
    path: "/register",
    Component: RegisterPage,
  },

  {
    path: "/me",
    element: <UserBar />,
    children: [
      { index: true, element: <UserPage/> },
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
