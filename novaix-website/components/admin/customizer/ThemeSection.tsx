"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Slider from "@mui/material/Slider";
import Typography from "@mui/material/Typography";
import ColorInput from "./ColorInput";
import { DEFAULT_HOME_CONTENT } from "@/lib/site-content/defaults";
import type { ThemeContent } from "@/lib/site-content/schema";

const PRESETS: Array<{
  name: string;
  dotColor: string;
  theme: ThemeContent;
}> = [
  {
    name: "Mặc định (OAlpha)",
    dotColor: "#2DD4BF",
    theme: DEFAULT_HOME_CONTENT.theme,
  },
  {
    name: "Xanh dương",
    dotColor: "#2563EB",
    theme: {
      primary: "#2563EB",
      primaryDark: "#1D4ED8",
      accent: "#38BDF8",
      textColor: "#EEF2FB",
      textMuted: "#9AA6C4",
      bgColor: "#070B16",
      borderRadius: 12,
    },
  },
  {
    name: "Xanh lá",
    dotColor: "#059669",
    theme: {
      primary: "#059669",
      primaryDark: "#047857",
      accent: "#2DD4BF",
      textColor: "#EEF2FB",
      textMuted: "#9AA6C4",
      bgColor: "#070B16",
      borderRadius: 12,
    },
  },
  {
    name: "Đỏ đô",
    dotColor: "#DC2626",
    theme: {
      primary: "#DC2626",
      primaryDark: "#B91C1C",
      accent: "#F87171",
      textColor: "#EEF2FB",
      textMuted: "#9AA6C4",
      bgColor: "#070B16",
      borderRadius: 12,
    },
  },
  {
    name: "Tím",
    dotColor: "#7C3AED",
    theme: {
      primary: "#7C3AED",
      primaryDark: "#6D28D9",
      accent: "#A78BFA",
      textColor: "#EEF2FB",
      textMuted: "#9AA6C4",
      bgColor: "#070B16",
      borderRadius: 12,
    },
  },
];

export default function ThemeSection({
  theme = DEFAULT_HOME_CONTENT.theme,
  onChange,
}: {
  theme: ThemeContent;
  onChange: (newTheme: ThemeContent) => void;
}) {
  const updateField = <K extends keyof ThemeContent>(
    key: K,
    val: ThemeContent[K],
  ) => {
    onChange({
      ...theme,
      [key]: val,
    });
  };

  return (
    <Box>
      {/* Bảng màu mẫu */}
      <Typography
        variant="body2"
        sx={{ fontWeight: 600, fontSize: "13px", mb: 1.25 }}
      >
        Bảng màu mẫu
      </Typography>

      {/* Preset Buttons Grid */}
      <Box
        sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, mb: 3 }}
      >
        {PRESETS.map((preset) => {
          const isSelected =
            preset.theme.primary.toLowerCase() ===
              (theme.primary || "").toLowerCase() &&
            preset.theme.bgColor.toLowerCase() ===
              (theme.bgColor || "").toLowerCase();

          return (
            <Button
              key={preset.name}
              variant="outlined"
              size="small"
              onClick={() => onChange(preset.theme)}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-start",
                gap: 1.25,
                py: 1,
                px: 1.5,
                borderRadius: "10px",
                borderColor: isSelected ? "primary.main" : "divider",
                color: isSelected ? "primary.main" : "text.primary",
                bgcolor: isSelected ? "action.hover" : "background.paper",
                textTransform: "none",
                fontSize: "12.5px",
                fontWeight: isSelected ? 700 : 600,
                boxShadow: isSelected ? "0 0 0 1px inset currentColor" : "none",
                "&:hover": {
                  borderColor: "primary.main",
                  bgcolor: "action.hover",
                },
              }}
            >
              <Box
                sx={{
                  width: 14,
                  height: 14,
                  borderRadius: "50%",
                  bgcolor: preset.dotColor,
                  flexShrink: 0,
                  boxShadow: `0 0 4px ${preset.dotColor}`,
                }}
              />
              {preset.name}
            </Button>
          );
        })}
      </Box>

      {/* Danh sách các màu */}
      <ColorInput
        label="Màu chính"
        value={theme.primary}
        onChange={(val) => updateField("primary", val)}
      />

      <ColorInput
        label="Chính (đậm)"
        value={theme.primaryDark}
        onChange={(val) => updateField("primaryDark", val)}
      />

      <ColorInput
        label="Màu nhấn"
        value={theme.accent}
        onChange={(val) => updateField("accent", val)}
      />

      <ColorInput
        label="Màu chữ"
        value={theme.textColor}
        onChange={(val) => updateField("textColor", val)}
      />

      <ColorInput
        label="Chữ phụ"
        value={theme.textMuted}
        onChange={(val) => updateField("textMuted", val)}
      />

      <ColorInput
        label="Màu nền"
        value={theme.bgColor}
        onChange={(val) => updateField("bgColor", val)}
      />

      {/* Bo góc */}
      <Box sx={{ mt: 2 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 0.5,
          }}
        >
          <Typography
            variant="body2"
            sx={{ fontWeight: 600, fontSize: "13px" }}
          >
            Bo góc
          </Typography>
          <Typography
            variant="caption"
            sx={{ fontWeight: 700, fontSize: "12px", color: "text.secondary" }}
          >
            {theme.borderRadius}px
          </Typography>
        </Box>
        <Slider
          value={theme.borderRadius ?? 12}
          min={0}
          max={32}
          step={2}
          onChange={(_, val) => updateField("borderRadius", val as number)}
          sx={{ color: "primary.main" }}
        />
      </Box>
    </Box>
  );
}
