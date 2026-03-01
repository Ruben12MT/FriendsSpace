import React, { useEffect, useState } from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import { Avatar } from "@mui/material";
import { Link } from "react-router-dom";
import { checkSession } from "../utils/checkSession";

export default function HomeBar() {
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    // Chequeo silencioso al cargar el Home
    checkSession().then((res) => {
      if (res.isAuth) {
        setIsAuth(true);
      }
    });
  }, []);
  return (
    <AppBar position="static" color="default">
      <Toolbar>
        <IconButton
          size="large"
          edge="start"
          color="inherit"
          aria-label="menu"
          sx={{ mr: 2 }}
        ></IconButton>

        <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>
          <Avatar
            alt="Logo de Friends Space"
            src="/logo.png"
            sx={{ marginRight: 1 }}
          />
        </Link>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Friends Space
        </Typography>

        {isAuth ? (
          // Si hay sesión: Botón "Acceder" a /me
          <Button
            variant="contained"
            component={Link}
            to="/app/searchnewfriends"
            sx={{ bgcolor: "#50C2AF" }}
          >
            Acceder a mi cuenta
          </Button>
        ) : (
          // Si no hay sesión: Botón "Iniciar Sesión" a /login
          <Button variant="outlined" component={Link} to="/login">
            Iniciar sesión
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
}
