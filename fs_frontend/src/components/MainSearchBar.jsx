import React, { useRef } from "react";
import { Box, TextField, IconButton } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { RotateCcw } from "lucide-react";
import { useAppTheme } from "../hooks/useAppTheme";

export default function MainSearchBar({
  placeholder,
  searchValue,
  onSearchChange,
  onReset,
  onAdd,
  showAdd = true,
  interests = [],
  selectedInterests = [],
  onInterestChange,
  variant = "default",
}) {
  const theme = useAppTheme();
  const scrollRef = useRef(null);
  const accent = theme.accent || theme.primaryBack;
  const isDark = theme.name === "dark";
  const showInterests = variant !== "searchAdmins";

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 250;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const handleChipClick = (id) => {
    let nuevos;
    if (id === -1) {
      nuevos = [-1];
    } else if (id === 0) {
      nuevos = [0];
    } else {
      const filtrados = selectedInterests.filter(val => val !== -1 && val !== 0);
      const isSelected = filtrados.includes(id);
      if (isSelected) {
        nuevos = filtrados.filter(val => val !== id);
        if (nuevos.length === 0) nuevos = [-1];
      } else {
        nuevos = [...filtrados, id];
      }
    }
    onInterestChange({ target: { value: nuevos } });
  };

  const getChipStyles = (active) => ({
    flexShrink: 0,
    px: 2.5,
    py: 0.8,
    borderRadius: "20px",
    fontSize: "0.85rem",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s ease-in-out",
    border: `2px solid ${active ? accent : accent + "40"}`,
    background: active ? accent : theme.secondaryBack,
    color: active ? "#fff" : theme.primaryText,
    "&:hover": {
      borderColor: accent,
      background: active ? accent : `${accent}15`,
    },
  });

  return (
    <Box sx={{ width: "100%", display: "flex", flexDirection: "column", gap: 2 }}>
      <Box sx={{
        display: "flex", width: "100%",
        px: 2, py: 1.25, alignItems: "center", gap: 1.5,
        background: theme.secondaryBack,
        border: `1px solid ${accent}25`,
        borderRadius: "14px",
      }}>
        <TextField
          fullWidth
          placeholder={placeholder}
          autoComplete="off"
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          sx={{
            background: theme.tertiaryBack,
            borderRadius: 2,
            "& .MuiOutlinedInput-notchedOutline": { border: "none" },
            "& .MuiInputBase-input": { color: theme.fieldsText, px: 2 },
          }}
        />

        <IconButton onClick={onReset} sx={{ width: 42, height: 42, flexShrink: 0, borderRadius: "10px", background: accent, color: isDark ? "#1a1200" : "#ffffff", "&:hover": { background: accent + "80" } }}>
          <RotateCcw size={18} />
        </IconButton>

        {showAdd && (
          <IconButton onClick={onAdd} sx={{ width: 42, height: 42, flexShrink: 0, borderRadius: "10px", background: theme.primaryText, color: theme.secondaryBack, "&:hover": { background: theme.primaryText + "80" } }}>
            <AddIcon fontSize="small" />
          </IconButton>
        )}
      </Box>

      {showInterests && (
        <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
          <IconButton onClick={() => scroll("left")} sx={{ color: accent, "&:hover": { background: "transparent", opacity: 0.7 } }}>
            <ChevronLeftIcon />
          </IconButton>

          <Box
            ref={scrollRef}
            sx={{
              display: "flex",
              overflowX: "auto",
              whiteSpace: "nowrap",
              gap: 1.2,
              flex: 1,
              py: 0.5,
              "&::-webkit-scrollbar": { display: "none" },
              msOverflowStyle: "none",
              scrollbarWidth: "none",
              WebkitOverflowScrolling: "touch",
            }}
          >
            <Box
              onClick={() => handleChipClick(0)}
              sx={getChipStyles(selectedInterests.includes(0))}
            >
              Mis intereses
            </Box>

            <Box
              onClick={() => handleChipClick(-1)}
              sx={getChipStyles(selectedInterests.includes(-1))}
            >
              Todos
            </Box>

            {interests.map((int) => (
              <Box
                key={int.id}
                onClick={() => handleChipClick(int.id)}
                sx={getChipStyles(selectedInterests.includes(int.id))}
              >
                {int.name}
              </Box>
            ))}
          </Box>

          <IconButton onClick={() => scroll("right")} sx={{ color: accent, "&:hover": { background: "transparent", opacity: 0.7 } }}>
            <ChevronRightIcon />
          </IconButton>
        </Box>
      )}
    </Box>
  );
}