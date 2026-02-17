import React from "react";
import { createBrowserRouter } from "react-router";
import Home from "./pages/Home";
import ErrorPage from "./pages/ErrorPage";
import { RouterProvider } from "react-router-dom";
const router = createBrowserRouter([
  {
    path: "/login",
    element: <h3>Login</h3>,
    
  },
  {
    path: "/",
    Component: Home,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <h3>HOME</h3> },

      {
        path: "/prueba",
        element: <h3>prueba</h3>,
      },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}
export default App;
