import React from "react";
import { Box, TextField, MenuItem, IconButton } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
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
  selectedInterests,
  onInterestChange,
}) {
  const theme = useAppTheme();
  const accent = theme.accent || theme.primaryBack;
  const isDark = theme.name === "dark";

  const inputStyles = {
    background: theme.tertiaryBack,
    borderRadius: 2,
    "& .MuiOutlinedInput-notchedOutline": { border: "none" },
    "& .MuiInputBase-input": { color: theme.fieldsText, px: 2 },
    "& .MuiSelect-icon": { color: theme.fieldsText },
  };

  const buttonBaseStyles = {
    width: 42,
    height: 42,
    flexShrink: 0,
    borderRadius: "10px",
    transition: "all 0.2s",
  };

  return (
    <Box
      sx={{
        display: "flex",
        width: "100%",
        px: 2,
        py: 1.25,
        alignItems: "center",
        gap: 1.5,
        background: theme.secondaryBack,
        border: `1px solid ${accent}25`,
        borderRadius: "14px",
      }}
    >
      <TextField
        fullWidth
        placeholder={placeholder}
        autoComplete="off"
        value={searchValue}
        onChange={(e) => onSearchChange(e.target.value)}
        sx={{ ...inputStyles, flex: 7 }}
      />

      <TextField
        select
        fullWidth
        value={selectedInterests}
        onChange={onInterestChange}
        slotProps={{
          select: {
            displayEmpty: true,
            sx: { color: theme.fieldsText },
            multiple: true,
          },
        }}
        sx={{ ...inputStyles, flex: 3 }}
      >
        <MenuItem value={0} sx={{ color: theme.secondaryText }}>
          Mis intereses
        </MenuItem>
        <MenuItem value={-1} sx={{ color: theme.secondaryText }}>
          Todos
        </MenuItem>
        {interests.map((int) => (
          <MenuItem
            key={int.id}
            value={int.id}
            sx={{ color: isDark ? theme.primaryText : "#1a1200" }}
          >
            {int.name}
          </MenuItem>
        ))}
      </TextField>

      <IconButton
        onClick={onReset}
        sx={{
          ...buttonBaseStyles,
          background: accent,
          color: isDark ? "#1a1200" : "#ffffff",
          "&:hover": { background: theme.accentHover || accent, opacity: 0.9 },
        }}
      >
        <RotateCcw size={18} />
      </IconButton>

      {showAdd && (
        <IconButton
          onClick={onAdd}
          sx={{
            ...buttonBaseStyles,
            background: theme.primaryText,
            color: theme.secondaryBack,
            "&:hover": { opacity: 0.85 },
          }}
        >
          <AddIcon fontSize="small" />
        </IconButton>
      )}
    </Box>
  );
}