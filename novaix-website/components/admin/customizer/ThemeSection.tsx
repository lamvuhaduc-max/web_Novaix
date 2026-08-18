"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
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
      btnPrimaryBg: "#2563EB",
      btnPrimaryText: "#FFFFFF",
      btnGhostBg: "#131C31",
      btnGhostText: "#EEF2FB",
      btnGhostBorder: "#2563EB",
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
      btnPrimaryBg: "#059669",
      btnPrimaryText: "#FFFFFF",
      btnGhostBg: "#131C31",
      btnGhostText: "#EEF2FB",
      btnGhostBorder: "#059669",
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
      btnPrimaryBg: "#DC2626",
      btnPrimaryText: "#FFFFFF",
      btnGhostBg: "#131C31",
      btnGhostText: "#EEF2FB",
      btnGhostBorder: "#DC2626",
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
      btnPrimaryBg: "#7C3AED",
      btnPrimaryText: "#FFFFFF",
      btnGhostBg: "#131C31",
      btnGhostText: "#EEF2FB",
      btnGhostBorder: "#7C3AED",
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
        sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, mb: 2.5 }}
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

      {/* Nhóm màu chính & thương hiệu */}
      <Typography
        variant="caption"
        sx={{ fontWeight: 700, letterSpacing: "0.05em", color: "text.secondary", mb: 1, display: "block" }}
      >
        MÀU THƯƠNG HIỆU & ĐIỂM NHẤN
      </Typography>

      <ColorInput
        label="Màu chính (Primary)"
        value={theme.primary}
        onChange={(val) => updateField("primary", val)}
      />

      <ColorInput
        label="Chính (đậm)"
        value={theme.primaryDark}
        onChange={(val) => updateField("primaryDark", val)}
      />

      <ColorInput
        label="Màu nhấn (Accent)"
        value={theme.accent}
        onChange={(val) => updateField("accent", val)}
      />

      <Divider sx={{ my: 2 }} />

      {/* Nhóm màu chữ & nền */}
      <Typography
        variant="caption"
        sx={{ fontWeight: 700, letterSpacing: "0.05em", color: "text.secondary", mb: 1, display: "block" }}
      >
        MÀU CHỮ & NỀN TOÀN TRANG
      </Typography>

      <ColorInput
        label="Màu chữ chính"
        value={theme.textColor}
        onChange={(val) => updateField("textColor", val)}
      />

      <ColorInput
        label="Màu chữ phụ (Muted)"
        value={theme.textMuted}
        onChange={(val) => updateField("textMuted", val)}
      />

      <ColorInput
        label="Màu nền toàn trang"
        value={theme.bgColor}
        onChange={(val) => updateField("bgColor", val)}
      />

      <Divider sx={{ my: 2 }} />

      {/* Nhóm nút chính (Primary Button) */}
      <Typography
        variant="caption"
        sx={{ fontWeight: 700, letterSpacing: "0.05em", color: "text.secondary", mb: 1, display: "block" }}
      >
        NÚT CHÍNH (PRIMARY CTA)
      </Typography>

      <ColorInput
        label="Màu nền nút chính"
        value={theme.btnPrimaryBg}
        onChange={(val) => updateField("btnPrimaryBg", val)}
      />

      <ColorInput
        label="Màu chữ nút chính"
        value={theme.btnPrimaryText}
        onChange={(val) => updateField("btnPrimaryText", val)}
      />

      <Divider sx={{ my: 2 }} />

      {/* Nhóm nút phụ (Ghost Button) */}
      <Typography
        variant="caption"
        sx={{ fontWeight: 700, letterSpacing: "0.05em", color: "text.secondary", mb: 1, display: "block" }}
      >
        NÚT PHỤ (GHOST CTA)
      </Typography>

      <ColorInput
        label="Màu nền nút phụ"
        value={theme.btnGhostBg}
        onChange={(val) => updateField("btnGhostBg", val)}
      />

      <ColorInput
        label="Màu chữ nút phụ"
        value={theme.btnGhostText}
        onChange={(val) => updateField("btnGhostText", val)}
      />

      <ColorInput
        label="Màu viền nút phụ"
        value={theme.btnGhostBorder}
        onChange={(val) => updateField("btnGhostBorder", val)}
      />

      <Divider sx={{ my: 2 }} />

      {/* Bo góc */}
      <Box sx={{ mt: 1 }}>
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
            Bo góc các thành phần
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
