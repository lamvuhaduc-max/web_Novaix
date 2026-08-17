"use client";

import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import type { SimpleFieldDef } from "@/lib/site-content/fields";

export default function FieldInput({
  field,
  value,
  onChange,
}: {
  field: SimpleFieldDef;
  value: any;
  onChange: (val: any) => void;
}) {
  const strVal = value !== null && value !== undefined ? String(value) : "";
  const numVal = typeof value === "number" ? value : 0;
  const length = strVal.length;
  const max = field.type !== "number" ? field.max : undefined;

  const isOverMax = max !== undefined && length > max;
  const isNearMax = max !== undefined && length >= max * 0.9 && !isOverMax;
  const isRequiredEmpty = field.required && strVal.trim() === "";

  const hasError = isOverMax || (field.required && length === 0);

  const getCounterColor = () => {
    if (isOverMax) return "error.main";
    if (isNearMax) return "warning.main";
    return "text.secondary";
  };

  return (
    <Box sx={{ mb: 2 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", mb: 0.75 }}>
        <Typography
          variant="body2"
          sx={{
            fontWeight: 600,
            fontSize: "13px",
            color: "text.primary",
          }}
        >
          {field.label}
          {field.required && (
            <Box component="span" sx={{ color: "error.main", ml: 0.5 }}>
              *
            </Box>
          )}
        </Typography>

        {max !== undefined && (
          <Typography
            variant="caption"
            sx={{
              fontWeight: 600,
              fontSize: "11.5px",
              color: getCounterColor(),
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {length}/{max}
          </Typography>
        )}
      </Box>

      {field.type === "number" ? (
        <TextField
          type="number"
          size="small"
          fullWidth
          value={numVal}
          onChange={(e) => onChange(Number(e.target.value))}
          inputProps={{
            min: field.min ?? 0,
            max: field.max ?? 1000000,
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: "8px",
              bgcolor: "background.paper",
              fontSize: "13.5px",
            },
          }}
        />
      ) : (
        <TextField
          size="small"
          fullWidth
          multiline={field.type === "textarea"}
          minRows={field.type === "textarea" ? 2 : undefined}
          maxRows={field.type === "textarea" ? 6 : undefined}
          value={strVal}
          error={hasError}
          helperText={isOverMax ? `Vượt quá giới hạn ${max} ký tự` : undefined}
          onChange={(e) => onChange(e.target.value)}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: "8px",
              bgcolor: "background.paper",
              fontSize: "13.5px",
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: "primary.main",
              },
            },
          }}
        />
      )}

      {field.helperText && (
        <Typography variant="caption" sx={{ color: "text.secondary", mt: 0.5, display: "block", fontSize: "11.5px" }}>
          {field.helperText}
        </Typography>
      )}
    </Box>
  );
}
