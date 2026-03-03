// Este componente sera una appbar para los usuarios registrados en la app
// Incluye logo, nombre de la app y botones de navegación.

import React from "react";
import { Link, Outlet } from "react-router-dom";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Menu from "@mui/material/Menu";
import MenuIcon from "@mui/icons-material/Menu";
import Container from "@mui/material/Container";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import MenuItem from "@mui/material/MenuItem";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { Grid } from "@mui/material";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import { useUser } from "../hooks/useUser";

const pages = ["Buscar friends", "Anuncios", "Chats"];

export default function UserBar() {
  const navigate = useNavigate();
  const { loggedUser } = useUser();

  const [anchorElNav, setAnchorElNav] = React.useState(null);
  const [anchorElUser, setAnchorElUser] = React.useState(null);

  const handleOpenNavMenu = (event) => setAnchorElNav(event.currentTarget);
  const handleOpenUserMenu = (event) => setAnchorElUser(event.currentTarget);
  const handleCloseNavMenu = () => setAnchorElNav(null);
  const handleCloseUserMenu = () => setAnchorElUser(null);

  const showUserProfile = () => {
    handleCloseUserMenu();
    navigate("/app/" + loggedUser.id);
  };

  const logout = async () => {
    try {
      handleCloseUserMenu();
      await api.post("/users/logout/");
      navigate("/");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  // PROTECCIÓN CRÍTICA:
  // Mientras loggedUser es null (al refrescar la página), renderizamos una barra mínima
  if (!loggedUser) {
    return (
      <Grid
        container
        direction="column"
        sx={{
          minHeight: "100vh",
          background: "#50C2AF",
        }}
      >
        <AppBar
          position="sticky"
          elevation={0}
          sx={{ backgroundColor: "white", color: "#50C2AF" }}
        >
          <Container maxWidth="100%">
            <Toolbar disableGutters>
              <Avatar
                src="/no_user_avatar_image.png"
                sx={{ width: 45, height: 45, border: "#50C2AF solid 1px" }}
              />
            </Toolbar>
          </Container>
        </AppBar>

        <Outlet />
      </Grid>
    );
  }

  // RENDER NORMAL CUANDO loggedUser YA EXISTE
  return (
    <Grid
      container
      direction="column"
      sx={{
        minHeight: "100vh",
        background: "#50C2AF",
      }}
    >
      <AppBar
        position="sticky"
        elevation={0}
        sx={{ backgroundColor: "white", color: "#50C2AF" }}
      >
        <Container maxWidth="100%">
          <Toolbar disableGutters>
            <Button
              component={Link}
              to="/"
              style={{ textDecoration: "none", color: "inherit" }}
              sx={{ display: { xs: "none", md: "flex" } }}
            >
              <Avatar
                src="/logo.png"
                style={{
                  marginTop: "20px",
                  marginBottom: "20px",
                  width: "70px",
                  height: "70px",
                  marginRight: "15px",
                }}
              />
            </Button>

            <Typography
              variant="h6"
              noWrap
              component="a"
              href="#app-bar-with-responsive-menu"
              sx={{
                mr: 2,
                display: { xs: "none", md: "flex" },
                fontFamily: "monospace",
                fontWeight: 700,
                letterSpacing: ".3rem",
                color: "inherit",
                textDecoration: "none",
              }}
            >
              Friends Space
            </Typography>

            <Box sx={{ flexGrow: 1, display: { xs: "flex", md: "none" } }}>
              <IconButton
                size="large"
                aria-label="menu"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleOpenNavMenu}
                color="inherit"
              >
                <MenuIcon />
              </IconButton>

              <Menu
                id="menu-appbar"
                anchorEl={anchorElNav}
                anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                keepMounted
                transformOrigin={{ vertical: "top", horizontal: "left" }}
                open={Boolean(anchorElNav)}
                onClose={handleCloseNavMenu}
                sx={{ display: { xs: "block", md: "none" } }}
              >
                {pages.map((page) => (
                  <MenuItem key={page} onClick={handleCloseNavMenu}>
                    <Typography sx={{ textAlign: "center" }}>{page}</Typography>
                  </MenuItem>
                ))}
              </Menu>
            </Box>

            <Button
              component={Link}
              to="/"
              style={{ textDecoration: "none", color: "inherit" }}
              sx={{ display: { xs: "flex", md: "none" } }}
            >
              <Avatar
                src="/logo.png"
                style={{ margin: "20px", width: "70px", height: "70px" }}
              />
            </Button>

            <Typography
              variant="h5"
              noWrap
              component="a"
              href="#app-bar-with-responsive-menu"
              sx={{
                mr: 2,
                display: { xs: "flex", md: "none" },
                flexGrow: 1,
                fontFamily: "monospace",
                fontWeight: 700,
                letterSpacing: ".3rem",
                color: "inherit",
                textDecoration: "none",
              }}
            >
              Friends Space
            </Typography>

            <Box
              sx={{
                flexGrow: 1,
                display: { xs: "none", md: "flex" },
                justifyContent: "end",
                margin: 2,
              }}
            >
              {pages.map((page) => (
                <Button
                  key={page}
                  onClick={handleCloseNavMenu}
                  sx={{ my: 0, color: "#50C2AF", display: "block" }}
                >
                  {page}
                </Button>
              ))}
            </Box>

            <Box sx={{ flexGrow: 0 }}>
              <Tooltip title="Ajustes del Usuario">
                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                  <Avatar
                    alt="Foto del usuario"
                    sx={{ border: "#50C2AF solid 1px" }}
                    src={loggedUser.url_image || "/no_user_avatar_image.png"}
                  />
                </IconButton>
              </Tooltip>

              <Menu
                sx={{ mt: "45px" }}
                id="menu-appbar"
                anchorEl={anchorElUser}
                anchorOrigin={{ vertical: "top", horizontal: "right" }}
                keepMounted
                transformOrigin={{ vertical: "top", horizontal: "right" }}
                open={Boolean(anchorElUser)}
                onClose={handleCloseUserMenu}
              >
                <MenuItem key={"userProfile"} onClick={showUserProfile}>
                  <Typography sx={{ textAlign: "center" }}>
                    Ver Perfil
                  </Typography>
                </MenuItem>

                <MenuItem key={"logout"} onClick={logout}>
                  <Typography sx={{ textAlign: "center" }}>
                    Cerrar Sesión
                  </Typography>
                </MenuItem>
              </Menu>

              <IconButton aria-label="notificaciones" size="large">
                <NotificationsIcon
                  fontSize="inherit"
                  sx={{ color: "#50C2AF" }}
                />
              </IconButton>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      <Outlet />
    </Grid>
  );
}
