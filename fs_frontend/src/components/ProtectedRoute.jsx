import React, { useEffect, useState } from "react";
import { checkSession } from "../utils/checkSession";
import { useNavigate } from "react-router-dom";
const ProtectedRoute = ({ children }) => {
  const [auth, setAuth] = useState({ loading: true, isAuth: false });
  const navigate = useNavigate();
  useEffect(() => {
    checkSession().then((res) => {
      setAuth({ loading: false, isAuth: res.isAuth });
    });
  }, []);

  if (auth.loading) return null; // Pantalla limpia mientras carga
  if (auth.isAuth) return children;
  navigate("/login");
};

export default ProtectedRoute;
