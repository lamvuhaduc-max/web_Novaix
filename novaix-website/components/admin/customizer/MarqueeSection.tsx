"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import FormControlLabel from "@mui/material/FormControlLabel";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Slider from "@mui/material/Slider";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { IconPlus, IconTrash } from "@tabler/icons-react";
import ColorInput from "./ColorInput";
import type { MarqueeContent } from "@/lib/site-content/schema";

export default function MarqueeSection({
  marquee,
  onChange,
}: {
  marquee: MarqueeContent;
  onChange: (newMarquee: MarqueeContent) => void;
}) {
  const items = marquee.items || [];

  const updateField = <K extends keyof MarqueeContent>(
    key: K,
    val: MarqueeContent[K],
  ) => {
    onChange({
      ...marquee,
      [key]: val,
    });
  };

  const handleItemChange = (index: number, val: string) => {
    const next = [...items];
    next[index] = val;
    updateField("items", next);
  };

  const handleAddItem = () => {
    const next = [...items, "Mẫu tin mới"];
    updateField("items", next);
  };

  const handleDeleteItem = (index: number) => {
    const next = items.filter((_, i) => i !== index);
    updateField("items", next);
  };

  return (
    <Box>
      {/* Switch bật/tắt */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography
          variant="body2"
          sx={{ fontWeight: 600, fontSize: "13.5px" }}
        >
          Hiện thanh chạy
        </Typography>
        <FormControlLabel
          control={
            <Switch
              checked={marquee.enabled !== false}
              onChange={(e) => updateField("enabled", e.target.checked)}
              color="primary"
            />
          }
          label=""
          sx={{ mr: -1 }}
        />
      </Box>

      {/* Nhãn bên trái */}
      <Box sx={{ mb: 2.5 }}>
        <Typography
          variant="body2"
          sx={{ fontWeight: 600, fontSize: "13px", mb: 0.75 }}
        >
          Nhãn bên trái (để trống là ẩn)
        </Typography>
        <TextField
          size="small"
          fullWidth
          value={marquee.label || ""}
          placeholder="Ví dụ: Vua Hàng hoặc OAlpha"
          onChange={(e) => updateField("label", e.target.value)}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: "8px",
              bgcolor: "background.paper",
              fontSize: "13.5px",
            },
          }}
        />
      </Box>

      {/* Nội dung chạy (List) */}
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="body2"
          sx={{ fontWeight: 600, fontSize: "13px", mb: 1 }}
        >
          Nội dung chạy
        </Typography>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {items.map((it, idx) => (
            <Paper
              key={idx}
              variant="outlined"
              sx={{
                p: 0.75,
                px: 1.25,
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                gap: 1,
                bgcolor: "background.paper",
              }}
            >
              <TextField
                size="small"
                fullWidth
                variant="standard"
                value={it}
                placeholder="Nhập nội dung chạy..."
                onChange={(e) => handleItemChange(idx, e.target.value)}
                InputProps={{
                  disableUnderline: true,
                  sx: { fontSize: "13.5px" },
                }}
              />
              {items.length > 1 && (
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => handleDeleteItem(idx)}
                >
                  <IconTrash size={16} />
                </IconButton>
              )}
            </Paper>
          ))}
        </Box>

        <Button
          variant="outlined"
          size="small"
          startIcon={<IconPlus size={15} />}
          onClick={handleAddItem}
          sx={{
            mt: 1,
            borderRadius: "8px",
            textTransform: "none",
            fontSize: "12.5px",
            fontWeight: 600,
            borderStyle: "dashed",
          }}
        >
          Thêm mẫu tin
        </Button>
      </Box>

      {/* Màu sắc thanh marquee */}
      <ColorInput
        label="Màu nền thanh"
        value={marquee.bgColor || "#0b1120"}
        onChange={(val) => updateField("bgColor", val)}
      />

      <ColorInput
        label="Màu chữ chạy"
        value={marquee.textColor || "#5f6c8a"}
        onChange={(val) => updateField("textColor", val)}
      />

      <ColorInput
        label="Màu nền nhãn"
        value={marquee.labelBgColor || "#2dd4bf"}
        onChange={(val) => updateField("labelBgColor", val)}
      />

      <ColorInput
        label="Màu chữ nhãn"
        value={marquee.labelTextColor || "#04121a"}
        onChange={(val) => updateField("labelTextColor", val)}
      />

      {/* Tốc độ chạy */}
      <Box sx={{ mt: 2.5, mb: 2 }}>
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
            Tốc độ (số lớn = chậm)
          </Typography>
          <Typography
            variant="caption"
            sx={{ fontWeight: 700, fontSize: "12px", color: "text.secondary" }}
          >
            {marquee.speed || 30}s / màn hình
          </Typography>
        </Box>
        <Slider
          value={marquee.speed || 30}
          min={5}
          max={90}
          step={5}
          onChange={(_, val) => updateField("speed", val as number)}
          sx={{ color: "primary.main" }}
        />
      </Box>

      {/* Khoảng cách */}
      <Box sx={{ mb: 2.5 }}>
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
            Khoảng cách giữa các mẩu
          </Typography>
          <Typography
            variant="caption"
            sx={{ fontWeight: 700, fontSize: "12px", color: "text.secondary" }}
          >
            {marquee.gap !== undefined ? marquee.gap : 160}px
          </Typography>
        </Box>
        <Slider
          value={marquee.gap !== undefined ? marquee.gap : 160}
          min={40}
          max={300}
          step={10}
          onChange={(_, val) => updateField("gap", val as number)}
          sx={{ color: "primary.main" }}
        />
      </Box>

      {/* Link khi bấm */}
      <Box sx={{ mb: 1 }}>
        <Typography
          variant="body2"
          sx={{ fontWeight: 600, fontSize: "13px", mb: 0.75 }}
        >
          Link khi bấm (để trống là không bấm được)
        </Typography>
        <TextField
          size="small"
          fullWidth
          value={marquee.link || ""}
          placeholder="Ví dụ: #modules hoặc https://..."
          onChange={(e) => updateField("link", e.target.value)}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: "8px",
              bgcolor: "background.paper",
              fontSize: "13px",
            },
          }}
        />
      </Box>
    </Box>
  );
}
