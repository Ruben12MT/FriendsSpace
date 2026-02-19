import React from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import { Avatar } from "@mui/material";
import { Link } from "react-router-dom";

export default function HomeBar() {
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

        <Link to="/login" style={{ textDecoration: "none", color: "inherit" }}>
          <Button
            sx={{ border: "1px solid black", borderRadius: "10px" }}
            color="inherit"
          >
            Iniciar sesión
          </Button>
        </Link>
      </Toolbar>
    </AppBar>
  );
}
