import React, { useRef } from "react";
import { Box, Typography, Avatar, IconButton } from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import GradeIcon from "@mui/icons-material/Grade";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { useNavigate } from "react-router-dom";
import InterestItem from "./InterestItem";
import { useAppTheme } from "../hooks/useAppTheme";

export default function UserCard({ user, variant = "card" }) {
  const theme = useAppTheme();
  const navigate = useNavigate();
  const scrollRef = useRef(null);

  const accent = theme.accent || theme.primaryBack;
  const cardBg = theme.secondaryBack;
  const textMain = theme.primaryText;
  const textMuted = theme.mutedText || theme.secondaryText;
  const isDark = theme.name === "dark";

  const btnText = isDark ? "#1a1200" : "#ffffff";

  const isDeveloper = user.role === "DEVELOPER";
  const roleColor = isDeveloper ? "#00bcd4" : "#FFD700";

  const scroll = (direction) => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        left:
          scrollRef.current.scrollLeft + (direction === "left" ? -120 : 120),
        behavior: "smooth",
      });
    }
  };

  if (variant === "adminCard") {
    return (
      <Box
        onClick={() => navigate("/app/" + user.id)}
        sx={{
          borderRadius: "16px",
          overflow: "hidden",
          background: cardBg,
          border: user.banned ? `2px solid ${ "#ff0000"}45`  : `1px solid ${ roleColor}25`,
          boxShadow: isDark
            ? user.banned ? "0 4px 24px rgba(255,0,0,0.3)" : "0 4px 24px rgba(0,0,0,0.3)"
            : user.banned ? `0 4px 24px rgba(255,0,0,0.1)` : `0 4px 24px rgba(0,0,0,0.06)`,
          cursor: "pointer",
          transition: "transform 0.2s, box-shadow 0.2s",
          "&:hover": {
            transform: "translateY(-3px)",
            boxShadow: isDark
              ? user.banned ? "0 8px 32px rgba(255,0,0,0.45)" : "0 8px 32px rgba(0,0,0,0.45)"
              : user.banned ? `0 8px 28px rgba(255,0,0,0.1)` : `0 8px 28px rgba(0,0,0,0.1)`,
          },
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          p: 3,
          gap: 1,
        }}
      >
        <Box sx={{ position: "relative" }}>
          <Avatar
            src={user.url_image || "/no_user_avatar_image.png"}
            sx={{
              width: 64,
              height: 64,
              border: `3px solid ${roleColor}40`,
              boxShadow: `0 4px 12px ${roleColor}30`,
            }}
          />
          <Box
            sx={{
              position: "absolute",
              bottom: -2,
              right: -2,
              width: 20,
              height: 20,
              borderRadius: "50%",
              background: cardBg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <GradeIcon sx={{ fontSize: 15, color: roleColor }} />
          </Box>
        </Box>
        <Box sx={{ textAlign: "center" }}>
          <Typography
            sx={{ fontWeight: 700, color: textMain, fontSize: "0.95rem" }}
          >
            @{user.name}
          </Typography>
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 0.5,
              mt: 0.5,
              px: 1,
              py: 0.25,
              borderRadius: "6px",
              background: isDeveloper
                ? "rgba(0,188,212,0.1)"
                : "rgba(255,215,0,0.1)",
            }}
          >
            <GradeIcon sx={{ fontSize: 10, color: roleColor }} />
            <Typography
              sx={{ fontSize: "0.7rem", fontWeight: 700, color: roleColor }}
            >
              {user.role}
            </Typography>
          </Box>
        </Box>
        <Typography sx={{ fontSize: "0.75rem", color: textMuted }}>
          {user.connections_count || 0} conexiones
        </Typography>
      </Box>
    );
  }

  if (variant === "card") {
    return (
      <Box
        sx={{
          width: "100%",
          borderRadius: "10px",
          overflow: "hidden",
          background: cardBg,
          border: `1px solid ${accent}30`,
          boxShadow: isDark
            ? `0 4px 24px rgba(0,0,0,0.3)`
            : `0 4px 24px rgba(184,134,11,0.10)`,
          transition: "transform 0.2s, box-shadow 0.2s",
          cursor: "pointer",
          "&:hover": {
            transform: "translateY(-4px)",
            boxShadow: isDark
              ? `0 8px 32px rgba(0,0,0,0.45)`
              : `0 8px 32px rgba(184,134,11,0.18)`,
          },
        }}
        onClick={() => navigate("/app/" + user.id)}
      >
        <Box
          sx={{
            height: 72,
            background: isDark
              ? `linear-gradient(135deg, #3a2e0a, #2a2000)`
              : `linear-gradient(135deg, ${accent}, #d4a017)`,
            position: "relative",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
          }}
        >
          <Avatar
            src={user.url_image ?? "/no_user_avatar_image.png"}
            sx={{
              width: 72,
              height: 72,
              border: `3px solid ${cardBg}`,
              boxShadow: `0 4px 16px rgba(0,0,0,0.2)`,
              mb: "-36px",
              zIndex: 1,
            }}
          />
        </Box>
        <Box sx={{ pt: "44px", px: 2.5, pb: 2.5 }}>
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: "1rem",
              color: textMain,
              textAlign: "center",
              mb: 0.5,
            }}
          >
            {user.username || user.name}
          </Typography>
          <Typography
            sx={{
              fontSize: "0.8rem",
              color: textMuted,
              textAlign: "center",
              mb: 2,
              lineHeight: 1.4,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              minHeight: "2.8em",
            }}
          >
            {user.short_sentece || "¡Hola! Estoy en Friends Space."}
          </Typography>
          <Box sx={{ height: "1px", background: `${accent}25`, mb: 2 }} />
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              mb: 2.5,
              minHeight: 32,
            }}
          >
            {user.interests?.length > 2 && (
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  scroll("left");
                }}
                sx={{ p: 0.25, color: textMuted, flexShrink: 0 }}
              >
                <ChevronLeftIcon fontSize="small" />
              </IconButton>
            )}
            <Box sx={{ flex: 1, overflow: "hidden" }}>
              <Box
                ref={scrollRef}
                sx={{
                  display: "flex",
                  justifyContent:
                    user.interests?.length > 2 ? "flex-start" : "center",
                  overflowX: "hidden",
                  gap: 0.75,
                  py: 0.25,
                  "&::-webkit-scrollbar": { display: "none" },
                  scrollbarWidth: "none",
                }}
              >
                {user.interests?.length > 0 ? (
                  user.interests.map((int) => (
                    <Box key={int.id} sx={{ flexShrink: 0 }}>
                      <InterestItem title={int.name} variant="deselect" />
                    </Box>
                  ))
                ) : (
                  <Typography
                    sx={{
                      fontSize: "0.75rem",
                      color: textMuted,
                      opacity: 0.6,
                      width: "100%",
                      textAlign: "center",
                    }}
                  >
                    Sin intereses
                  </Typography>
                )}
              </Box>
            </Box>
            {user.interests?.length > 2 && (
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  scroll("right");
                }}
                sx={{ p: 0.25, color: textMuted, flexShrink: 0 }}
              >
                <ChevronRightIcon fontSize="small" />
              </IconButton>
            )}
          </Box>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <PeopleIcon sx={{ fontSize: 14, color: textMuted }} />
              <Typography sx={{ fontSize: "0.75rem", color: textMuted }}>
                {user.connections_count || 0} conexiones
              </Typography>
            </Box>
            <Box
              component="span"
              onClick={(e) => {
                e.stopPropagation();
                navigate("/app/" + user.id);
              }}
              sx={{
                fontSize: "0.78rem",
                fontWeight: 700,
                color: btnText,
                px: 1.5,
                py: "5px",
                borderRadius: "8px",
                background: accent,
                boxShadow: `0 2px 8px ${accent}40`,
                cursor: "pointer",
                transition: "opacity 0.15s, transform 0.15s",
                "&:hover": { opacity: 0.88, transform: "translateY(-1px)" },
              }}
            >
              Ver perfil
            </Box>
          </Box>
        </Box>
      </Box>
    );
  }

  if (variant === "row") {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          p: 1.5,
          mb: 1,
          borderRadius: "14px",
          background: cardBg,
          border: `1px solid ${accent}20`,
          transition: "background 0.15s, box-shadow 0.15s",
          cursor: "pointer",
          "&:hover": {
            background: isDark ? `${accent}10` : `${accent}08`,
            boxShadow: `0 2px 12px ${accent}15`,
          },
        }}
        onClick={() => navigate("/app/" + user.id)}
      >
        <Avatar
          src={user.url_image ?? "/no_user_avatar_image.png"}
          sx={{
            width: 48,
            height: 48,
            flexShrink: 0,
            border: `2px solid ${accent}40`,
          }}
        />

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 0.5,
            }}
          >
            <Typography
              sx={{ fontWeight: 700, color: textMain, fontSize: "0.9rem" }}
              noWrap
            >
              {user.username || user.name}
            </Typography>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                flexShrink: 0,
                ml: 1,
              }}
            >
              <PeopleIcon sx={{ fontSize: 12, color: textMuted }} />
              <Typography sx={{ fontSize: "0.72rem", color: textMuted }}>
                {user.connections_count || 0}
              </Typography>
            </Box>
          </Box>

          <Typography
            sx={{ fontSize: "0.78rem", color: textMuted, mb: 0.75 }}
            noWrap
          >
            {user.short_sentece || "¡Hola! Estoy en Friends Space."}
          </Typography>

          {user.interests?.length > 2 && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              {user.interests.length > 3 && (
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    scroll("left");
                  }}
                  sx={{ p: 0, color: textMuted, flexShrink: 0 }}
                >
                  <ChevronLeftIcon sx={{ fontSize: 16 }} />
                </IconButton>
              )}

              <Box sx={{ flex: 1, overflow: "hidden" }}>
                <Box
                  ref={scrollRef}
                  sx={{
                    display: "flex",
                    gap: 0.5,
                    overflowX: "hidden",
                    "&::-webkit-scrollbar": { display: "none" },
                    scrollbarWidth: "none",
                  }}
                >
                  {user.interests.map((int) => (
                    <Box key={int.id} sx={{ flexShrink: 0 }}>
                      <InterestItem title={int.name} variant="deselect" />
                    </Box>
                  ))}
                </Box>
              </Box>

              {user.interests.length > 3 && (
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    scroll("right");
                  }}
                  sx={{ p: 0, color: textMuted, flexShrink: 0 }}
                >
                  <ChevronRightIcon sx={{ fontSize: 16 }} />
                </IconButton>
              )}
            </Box>
          )}
        </Box>

        <ChevronRightIcon
          sx={{ fontSize: 18, color: `${accent}80`, flexShrink: 0 }}
        />
      </Box>
    );
  }
}