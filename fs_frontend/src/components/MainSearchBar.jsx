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
  // Para el select de intereses
  interests = [],
  selectedInterests,
  onInterestChange,
  getInterestText
}) {
  const theme = useAppTheme();

  const noBorderInput = {
    background: theme.tertiaryBack,
    borderRadius: 4,
    "& .MuiOutlinedInput-notchedOutline": { border: "none" },
    "& .MuiInputBase-input": { color: theme.fieldsText, px: 2 },
  };

  return (
    <Box
      sx={{
        display: "flex",
        width: "100%",
        px: 3,
        py: 1.5,
        alignItems: "center",
        gap: 2,
        background: theme.secondaryBack,
        border: `1px solid ${theme.primaryBack}44`,
        borderRadius: 4,
      }}
    >
      {/* Input de texto */}
      <TextField
        fullWidth
        placeholder={placeholder}
        autoComplete="off"
        value={searchValue}
        onChange={(e) => onSearchChange(e.target.value)}
        sx={{ ...noBorderInput, flex: 7 }}
      />

      {/* Select de Intereses */}
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
        sx={{ ...noBorderInput, flex: 3 }}
      >
        <MenuItem value={0} sx={{ color: theme.secondaryText }}>Mis intereses</MenuItem>
        <MenuItem value={-1} sx={{ color: theme.secondaryText }}>Todos</MenuItem>
        {interests.map((int) => (
          <MenuItem key={int.id} value={int.id} sx={{ color: "black" }}>
            {int.name}
          </MenuItem>
        ))}
      </TextField>

      {/* Botón Reset */}
      <IconButton
        onClick={onReset}
        sx={{
          backgroundColor: theme.primaryBack,
          color: "white",
          width: 45,
          height: 45,
          "&:hover": { backgroundColor: theme.secondaryText },
        }}
      >
        <RotateCcw size={20} />
      </IconButton>

      {/* Botón Añadir (Opcional) */}
      {showAdd && (
        <IconButton
          onClick={onAdd}
          sx={{
            backgroundColor: theme.primaryText,
            width: 45,
            height: 45,
            ":hover": { background: theme.secondaryText },
          }}
        >
          <AddIcon sx={{ color: theme.secondaryBack }} />
        </IconButton>
      )}
    </Box>
  );
}