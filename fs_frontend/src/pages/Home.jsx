import React from "react";
import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  Grid, 
  Card, 
  Stack,
  Avatar
} from "@mui/material";
import { Link } from "react-router-dom";
import { useAppTheme } from "../hooks/useAppTheme";
import GroupsIcon from "@mui/icons-material/Groups";
import ForumIcon from "@mui/icons-material/Forum";
import SearchIcon from "@mui/icons-material/Search";
import ThemeToggler from "../components/themeToggler"; 
import BackgroundVideo from "../components/BackgroundVideo";

export default function Home() {
  const theme = useAppTheme();  
  const accent = theme.accent;
  const isDark = theme.name === "dark";

  return (
    <Box sx={{ position: "relative", minHeight: "100vh" }}>
      <ThemeToggler />

      {theme.backgroundVideo && (
        <BackgroundVideo 
          src={theme.backgroundVideo} 
          sx={{
            filter: isDark ? "brightness(0.5) saturate(1.4)" : "brightness(0.8)",
            pointerEvents: "none", 
            zIndex: -2 
          }}
        />
      )}

      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: -1,
          pointerEvents: "none",
          background: isDark 
            ? `radial-gradient(circle at 20% 30%, ${accent}15 0%, transparent 40%), linear-gradient(180deg, transparent 0%, ${theme.primaryBack} 90%)`
            : `radial-gradient(circle at 80% 20%, ${accent}10 0%, transparent 40%), linear-gradient(180deg, transparent 0%, ${theme.primaryBack} 95%)`,
        }}
      />

      <Container maxWidth="xl" sx={{ position: "relative", zIndex: 1 }}>
        <Stack 
          direction="row" 
          justifyContent="space-between" 
          alignItems="center" 
          sx={{ py: 4 }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Avatar 
              src="/logo.png" 
              variant="rounded" 
              sx={{ width: 45, height: 45, bgcolor: "transparent" }} 
            />
            <Typography variant="h6" sx={{ color: theme.primaryText, fontWeight: 900, letterSpacing: -1 }}>
              Friends Space
            </Typography>
          </Box>

          <Stack direction="row" alignItems="center" spacing={2}>
            <Button
              component={Link}
              to="/login"
              sx={{
                color: theme.primaryText,
                fontWeight: 700,
                borderRadius: "12px",
                px: 3,
                py: 1,
                border: `1px solid ${theme.borderMedium || accent + '40'}`,
                backdropFilter: "blur(10px)",
                transition: "all 0.2s",
                "&:hover": { 
                  bgcolor: `${accent}15`, 
                  borderColor: accent,
                  transform: "translateY(-2px)"
                }
              }}
            >
              Log In
            </Button>
          </Stack>
        </Stack>

        <Grid container sx={{ minHeight: "80vh" }} alignItems="center">
          <Grid item xs={12} lg={8}>
            <Box>
              <Typography
                sx={{
                  color: accent,
                  fontWeight: 950,
                  fontSize: { xs: "3.5rem", md: "6rem", lg: "8rem" },
                  lineHeight: 0.85,
                  letterSpacing: -4,
                  mb: 2,
                  textShadow: isDark ? "0 10px 30px rgba(0,0,0,0.5)" : "none"
                }}
              >
                TUS GUSTOS. <br />
                <span style={{ color: theme.primaryText }}>TU GENTE.</span>
              </Typography>
              
              <Typography
                variant="h5"
                sx={{ 
                  color: theme.secondaryText, 
                  mb: 6, 
                  fontWeight: 400, 
                  maxWidth: "550px",
                  borderLeft: `4px solid ${accent}`,
                  pl: 3,
                  lineHeight: 1.4,
                  backdropFilter: "blur(4px)",
                  py: 1
                }}
              >
                Conecta con personas reales que comparten tu misma energía. La red social donde los intereses importan más que el scroll.
              </Typography>

              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <Button
                  component={Link}
                  to="/register"
                  variant="contained"
                  sx={{
                    bgcolor: accent,
                    color: isDark ? "#1a1200" : "#fff",
                    px: 6, py: 2.5,
                    borderRadius: "50px",
                    fontSize: "1.1rem",
                    fontWeight: 800,
                    boxShadow: `0 8px 32px ${accent}40`,
                    "&:hover": { 
                      bgcolor: theme.accentHover || accent, 
                      transform: "translateY(-4px)",
                      boxShadow: `0 12px 40px ${accent}60`,
                    },
                    transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
                  }}
                >
                  EMPEZAR AHORA
                </Button>
              </Stack>
            </Box>
          </Grid>
        </Grid>
      </Container>

      <Box sx={{ bgcolor: theme.primaryBack, pt: 10, pb: 15, position: "relative", zIndex: 2 }}>
        <Container maxWidth="lg">
          <Grid container spacing={3}>
            {[
              {
                title: "DESCUBRE",
                desc: "Filtros inteligentes basados en tus pasiones y hobbies reales.",
                icon: <SearchIcon fontSize="large" />,
              },
              {
                title: "CHATEA",
                desc: "Conecta al instante mediante mensajería en tiempo real.",
                icon: <ForumIcon fontSize="large" />,
              },
              {
                title: "CONECTA",
                desc: "Una comunidad segura para expandir tu círculo social.",
                icon: <GroupsIcon fontSize="large" />,
              },
            ].map((item, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card
                  sx={{
                    p: 4,
                    height: "100%",
                    bgcolor: theme.secondaryBack,
                    borderRadius: "40px",
                    border: `1px solid ${theme.borderLight || accent + '10'}`,
                    transition: "0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                    display: "flex",
                    flexDirection: "column",
                    "&:hover": { 
                      bgcolor: theme.tertiaryBack, 
                      borderColor: accent, 
                      transform: "translateY(-10px)",
                      boxShadow: `0 20px 40px rgba(0,0,0,0.1)`
                    }
                  }}
                >
                  <Box sx={{ 
                    width: 60, height: 60, borderRadius: "20px", 
                    bgcolor: `${accent}15`, color: accent,
                    display: "grid", placeItems: "center", mb: 3
                  }}>
                    {item.icon}
                  </Box>
                  <Typography variant="h6" sx={{ color: theme.primaryText, fontWeight: 900, mb: 1.5 }}>
                    {item.title}
                  </Typography>
                  <Typography sx={{ color: theme.secondaryText, lineHeight: 1.6 }}>
                    {item.desc}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Box sx={{ 
            mt: 15, p: { xs: 4, md: 8 }, 
            borderRadius: "60px", bgcolor: theme.tertiaryBack, 
            textAlign: "center", border: `1px solid ${theme.borderLight || accent + '20'}`,
            position: "relative", overflow: "hidden"
          }}>
             <Avatar 
              src="/logo.png" 
              sx={{ 
                width: 240, height: 240, position: "absolute", 
                bottom: -60, right: -60, opacity: 0.07,
                transform: "rotate(-15deg)", pointerEvents: "none"
              }} 
            />
            <Typography variant="h2" sx={{ color: theme.primaryText, fontWeight: 950, mb: 4, fontSize: { xs: "2.5rem", md: "4.5rem" }, letterSpacing: -2 }}>
              ENCUENTRA TU <span style={{ color: accent }}>ESPACIO</span>.
            </Typography>
            <Button
              component={Link}
              to="/register"
              sx={{
                bgcolor: theme.primaryText,
                color: theme.primaryBack,
                px: 8, py: 2.5,
                borderRadius: "50px",
                fontWeight: 900,
                fontSize: "1rem",
                "&:hover": { 
                  bgcolor: accent, 
                  color: isDark ? "#1a1200" : "#fff",
                  transform: "scale(1.05)"
                },
                transition: "all 0.3s"
              }}
            >
              REGISTRARSE GRATIS
            </Button>
          </Box>
        </Container>
      </Box>

      <Box sx={{ py: 6, textAlign: "center", borderTop: `1px solid ${theme.borderLight || accent + '10'}`, bgcolor: theme.primaryBack, position: "relative", zIndex: 2 }}>
        <Stack direction="column" alignItems="center" spacing={1}>
          <Avatar src="/logo.png" sx={{ width: 30, height: 30, mb: 1 }} />
          <Typography variant="caption" sx={{ color: theme.mutedText, textTransform: "uppercase", letterSpacing: 3, fontWeight: 700 }}>
            Friends Space — {new Date().getFullYear()} — Built for Ruben
          </Typography>
        </Stack>
      </Box>
    </Box>
  );
}