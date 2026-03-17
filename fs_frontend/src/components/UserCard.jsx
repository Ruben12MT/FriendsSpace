import React, { useRef } from "react";
import {
  Box,
  Typography,
  Avatar,
  Paper,
  Button,
  Divider,
  IconButton,
} from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { useAppTheme } from "../hooks/useAppTheme";
import { useNavigate } from "react-router-dom";
import InterestItem from "./InterestItem";

export default function UserCard({ user, variant = "card" }) {
  const theme = useAppTheme();
  const navigate = useNavigate();
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { scrollLeft } = scrollRef.current;
      const scrollTo =
        direction === "left" ? scrollLeft - 120 : scrollLeft + 120;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
    }
  };

  if (variant === "card") {
    return (
      <Paper
        elevation={2}
        sx={{
          width: "100%",
          maxWidth: 340,
          margin: "0 auto",
          borderRadius: 4,
          overflow: "hidden",
          background: theme.tertiaryBack,
          transition: "transform 0.2s",
          border: `${theme.primaryText} solid 2.5px`,
          "&:hover": {
            transform: "translateY(-4px)",
            border: `${theme.primaryText} solid 3px`,
          },
        }}
      >
        <Box
          sx={{
            height: 100,
            background: theme.primaryBack,
            display: "flex",
            justifyContent: "center",
            position: "relative",
          }}
        >
          <Avatar
            src={user.url_image ?? "/no_user_avatar_image.png"}
            sx={{
              width: 90,
              height: 90,
              border: "4px solid " + theme.tertiaryBack,
              mb: -12,
              zIndex: 1,
              mt: 5,
            }}
          />
        </Box>

        <Box sx={{ height: 50 }} />

        <Box sx={{ p: 2 }}>
          <Typography
            variant="h6"
            align="center"
            sx={{ fontWeight: "bold", color: theme.primaryText }}
          >
            {user.username || user.name}
          </Typography>
          <Typography
            variant="body2"
            align="center"
            sx={{
              color: theme.secondaryText,
              mb: 2,
              height: 40,
              overflow: "hidden",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
            }}
          >
            {user.short_sentece || "¡Hola! Estoy usando FriendApp."}
          </Typography>

          <Divider sx={{ mb: 2, background: theme.primaryText }} />

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              mb: 2,
              position: "relative",
              minHeight: 40,
            }}
          >
            {user.interests?.length > 2 && (
              <IconButton
                size="small"
                onClick={() => scroll("left")}
                sx={{ p: 0, color: theme.primaryText, zIndex: 2 }}
              >
                <ChevronLeftIcon />
              </IconButton>
            )}

            <Box
              sx={{
                position: "relative",
                flexGrow: 1,
                overflow: "hidden",
                display: "flex",
                justifyContent: "center",
              }}
            >
              <Box
                ref={scrollRef}
                sx={{
                  display: "flex",
                  justifyContent:
                    user.interests?.length > 2 ? "flex-start" : "center",
                  overflowX: "hidden",
                  scrollBehavior: "smooth",
                  gap: 1,
                  py: 0.5,
                  "&::-webkit-scrollbar": { display: "none" },
                  msOverflowStyle: "none",
                  scrollbarWidth: "none",
                }}
              >
                {user.interests && user.interests.length > 0 ? (
                  user.interests.map((int) => (
                    <Box key={int.id} sx={{ flexShrink: 0 }}>
                      <InterestItem title={int.name} variant="deselect" />
                    </Box>
                  ))
                ) : (
                  <Typography
                    variant="caption"
                    sx={{
                      color: theme.secondaryText,
                      width: "100%",
                      textAlign: "center",
                      opacity: 0.6,
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
                onClick={() => scroll("right")}
                sx={{ p: 0, color: theme.primaryText, zIndex: 2 }}
              >
                <ChevronRightIcon />
              </IconButton>
            )}
          </Box>

          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="caption" sx={{ color: theme.primaryText }}>
              <PeopleIcon
                fontSize="inherit"
                sx={{ verticalAlign: "middle", mr: 0.5 }}
              />
              {user.connections_count || 0} conex.
            </Typography>
            <Button
              size="small"
              variant="contained"
              sx={{
                backgroundColor: theme.secondaryBack,
                color: theme.primaryText,
                textTransform: "none",
                borderRadius: 2,
                fontWeight: "bold",
              }}
              onClick={() => navigate("/app/" + user.id)}
            >
              Ver más
            </Button>
          </Box>
        </Box>
      </Paper>
    );
  }

  if (variant === "row") {
    return (
      <Paper
        elevation={0}
        sx={{
          display: "flex",
          alignItems: "center",
          p: 1.5,
          borderRadius: 3,
          background: theme.tertiaryBack,
          width: "100%",
          maxWidth: "none",
          margin: 0,
          mb: 1,
          transition: "0.2s",
        }}
      >
        <Avatar
          src={user.url_image ?? "/no_user_avatar_image.png"}
          sx={{
            width: 55,
            height: 55,
            mr: 2,
            border: `2px solid ${theme.secondaryBack}`,
          }}
        />

        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: "bold", color: theme.primaryText }}
              noWrap
            >
              {user.username || user.name}
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: theme.primaryText, ml: 1, flexShrink: 0 }}
            >
              {user.connections_count || 0} conex.
            </Typography>
          </Box>
          <Typography
            variant="body2"
            noWrap
            sx={{ color: theme.secondaryText, fontSize: "0.85rem" }}
          >
            {user.short_sentece || "¡Hola! Estoy usando FriendApp."}
          </Typography>
        </Box>

        <Box sx={{ ml: 2, display: "flex", alignItems: "center" }}>
          <Button
            size="small"
            sx={{
              color: theme.primaryText,
              textTransform: "none",
              fontWeight: "bold",
            }}
            onClick={() => navigate("/app/" + user.id)}
          >
            Ver
          </Button>
          <ChevronRightIcon sx={{ fontSize: 18, color: theme.primaryText }} />
        </Box>
      </Paper>
    );
  }
}
