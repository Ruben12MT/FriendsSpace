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
import { alpha, Grid } from "@mui/material";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import { useUser } from "../hooks/useUser";
import { useAppTheme } from "../hooks/useAppTheme";
import ThemeToggler from "../components/ThemeToggler.jsx";

const pages = [
  { "/app/searchnewfriends": "Buscar friends" },
  { "/app/ads": "Anuncios" },
  { "/app/chats": "Chats" },
];

export default function UserBar() {
  const navigate = useNavigate();
  const { loggedUser } = useUser();
  const [anchorElNav, setAnchorElNav] = React.useState(null);
  const [anchorElUser, setAnchorElUser] = React.useState(null);

  const handleOpenNavMenu = (event) => setAnchorElNav(event.currentTarget);
  const handleOpenUserMenu = (event) => setAnchorElUser(event.currentTarget);
  const handleCloseNavMenu = () => setAnchorElNav(null);
  const handleCloseUserMenu = () => setAnchorElUser(null);
  const theme = useAppTheme();

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

  if (!loggedUser) return null;

  //--BORRAR--
  console.log("URL IMAGEN ACTUAL USUARIO: " + loggedUser.url_image);
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        width: "100%",
      }}
    >
      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1100,
          backgroundColor: theme.primaryBack,
          pb: 2,

          "&::after": {
            content: '""',
            position: "absolute",
            left: 0,
            right: 0,
            bottom: -35,
            height: 40,
            background: `linear-gradient(to bottom, ${theme.primaryBack}, transparent)`,
            pointerEvents: "none",
          },
        }}
      >
        <AppBar
          position="relative"
          elevation={4}
          sx={{
            mt: 2,
            mx: 2,
            width: "auto",
            borderRadius: 4,
            backgroundColor: theme.navBar.backColor,
            color: theme.navBar.textColor,
          }}
        >
          <Container maxWidth="xxl">
            <Toolbar disableGutters>
              <Avatar
                src="/logo.png"
                onClick={() => navigate("/")}
                sx={{ display: { xs: "none", md: "flex" } }}
                style={{
                  marginTop: "20px",
                  marginBottom: "20px",
                  width: "70px",
                  height: "70px",
                  marginRight: "15px",
                  cursor: "pointer",
                }}
              />

              <Typography
                variant="h5"
                noWrap
                component="a"
                href="/"
                sx={{
                  mr: 2,
                  display: { xs: "none", md: "flex" },
                  fontFamily: "monospace",
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
                  {pages.map((page) => {
                    const [key, label] = Object.entries(page)[0];
                    return (
                      <MenuItem key={key} onClick={handleCloseNavMenu}>
                        <Typography
                          component="a"
                          href={`/${key}`}
                          sx={{
                            textAlign: "center",
                            textDecoration: "none",
                            color: "inherit",
                          }}
                        >
                          {label}
                        </Typography>
                      </MenuItem>
                    );
                  })}
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
                href="/"
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
                {pages.map((page) => {
                  const [key, label] = Object.entries(page)[0];
                  return (
                    <Button
                      key={key}
                      onClick={() => {
                        navigate(key);
                      }}
                      sx={{
                        my: 0,
                        color: theme.navBar.textColor,
                        display: "block",
                      }}
                    >
                      {label}
                    </Button>
                  );
                })}
              </Box>

              <Box display={"flex"} alignItems={"center"} sx={{ flexGrow: 0 }}>
                <Tooltip title="Ajustes del Usuario">
                  <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                    <Avatar
                      alt="Foto del usuario"
                      sx={{ border: theme.navBar.textColor + " solid 1px" }}
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
                    sx={{ color: theme.navBar.textColor }}
                  />
                </IconButton>

                <ThemeToggler block={true} />
              </Box>
            </Toolbar>
          </Container>
        </AppBar>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          pt: "160px", // Ajusta este valor al alto real de tu navbar (aprox 160px-180px)
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          boxSizing: "border-box",
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}
