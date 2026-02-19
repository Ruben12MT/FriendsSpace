import React from "react";
import { createBrowserRouter } from "react-router";
import Home from "./pages/Home";
import ErrorPage from "./pages/ErrorPage";
import { RouterProvider } from "react-router-dom";
import UserPage from "./pages/UserPage";
import HomeBar from "./components/HomeBar";
import { CssBaseline } from "@mui/material";
import LoginForm from "./components/LoginForm";
const router = createBrowserRouter([
  {
    path: "/",
    Component: Home,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <h3>HOME</h3> },
      {
        path: "/login",
        Component: LoginForm,
      },
    ],
  },
  {
    path: "/me",
    element: <UserPage />,
  },
]);

function App() {
  
  return (
    <>
      <CssBaseline />
      <RouterProvider router={router} />
    </>
  )
  
  ;
}
export default App;
