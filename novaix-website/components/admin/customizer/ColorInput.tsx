"use client";

import React, { useRef } from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

export default function ColorInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <Box sx={{ mb: 2 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.75 }}>
        <Typography variant="body2" sx={{ fontWeight: 600, fontSize: "13px", color: "text.primary" }}>
          {label}
        </Typography>
        <Typography variant="caption" sx={{ fontWeight: 700, fontSize: "10.5px", color: "text.secondary", letterSpacing: "0.05em" }}>
          ĐƠN SẮC
        </Typography>
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <TextField
          size="small"
          fullWidth
          value={value || "#000000"}
          onChange={(e) => onChange(e.target.value)}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: "8px",
              bgcolor: "background.paper",
              fontSize: "13px",
              fontFamily: "monospace",
            },
          }}
        />

        {/* Color Swatch Box */}
        <Box
          onClick={() => inputRef.current?.click()}
          sx={{
            width: 40,
            height: 38,
            flexShrink: 0,
            borderRadius: "8px",
            bgcolor: value || "#000000",
            border: "1px solid",
            borderColor: "divider",
            cursor: "pointer",
            boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.1)",
            position: "relative",
            "&:hover": {
              borderColor: "primary.main",
            },
          }}
        >
          <input
            ref={inputRef}
            type="color"
            value={value && value.startsWith("#") && value.length === 7 ? value : "#000000"}
            onChange={(e) => onChange(e.target.value)}
            style={{
              position: "absolute",
              opacity: 0,
              width: 0,
              height: 0,
              pointerEvents: "none",
            }}
          />
        </Box>
      </Box>
    </Box>
  );
}
