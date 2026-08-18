"use client";

import { useState } from "react";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Divider from "@mui/material/Divider";
import FormControlLabel from "@mui/material/FormControlLabel";
import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";
import Slider from "@mui/material/Slider";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import {
  IconArrowDown,
  IconArrowUp,
  IconChevronDown,
  IconPlus,
  IconRotate,
  IconTrash,
} from "@tabler/icons-react";
import ColorInput from "./ColorInput";
import ImageInput from "./ImageInput";
import { DEFAULT_PARTNERS, type PartnersContent } from "@/lib/site-content/schema";

const MAX_ITEMS = 24;

export default function PartnersSection({
  partners,
  onChange,
}: {
  partners: PartnersContent;
  onChange: (next: PartnersContent) => void;
}) {
  const [deleteIdx, setDeleteIdx] = useState<number | null>(null);

  const items = partners.items || [];

  const updateField = <K extends keyof PartnersContent>(key: K, val: PartnersContent[K]) => {
    onChange({ ...partners, [key]: val });
  };

  const updateItem = (idx: number, patch: Partial<PartnersContent["items"][number]>) => {
    const next = [...items];
    next[idx] = { ...next[idx], ...patch };
    updateField("items", next);
  };

  const moveItem = (idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[idx], next[target]] = [next[target], next[idx]];
    updateField("items", next);
  };

  const addItem = () => {
    if (items.length >= MAX_ITEMS) return;
    updateField("items", [...items, { name: "", logo: "", link: "", visible: true }]);
  };

  const removeItem = (idx: number) => {
    updateField(
      "items",
      items.filter((_, i) => i !== idx)
    );
    setDeleteIdx(null);
  };

  const resetColorsToTheme = () => {
    onChange({
      ...partners,
      customColors: false,
      bgColor: DEFAULT_PARTNERS.bgColor,
      labelColor: DEFAULT_PARTNERS.labelColor,
    });
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <FormControlLabel
        control={
          <Switch
            checked={partners.enabled}
            onChange={(e) => updateField("enabled", e.target.checked)}
          />
        }
        label={partners.enabled ? "Đang hiển thị trên trang chủ" : "Đang ẩn khỏi trang chủ"}
      />

      {partners.enabled && items.length === 0 && (
        <Alert severity="info" sx={{ fontSize: "12.5px" }}>
          Chưa có đối tác nào nên dải vẫn chưa hiện ra ngoài. Thêm ít nhất một logo.
        </Alert>
      )}

      <Box>
        <Typography variant="body2" sx={{ fontWeight: 600, fontSize: "13px", mb: 0.75 }}>
          Dòng nhãn phía trên dải
        </Typography>
        <TextField
          fullWidth
          size="small"
          value={partners.label}
          onChange={(e) => updateField("label", e.target.value)}
          placeholder="Được tin dùng bởi"
          inputProps={{ maxLength: 60 }}
        />
      </Box>

      <Divider />

      {/* ── Danh sách đối tác ─────────────────────────────────────────── */}
      <Box>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, fontSize: "13px" }}>
            Danh sách đối tác ({items.length}/{MAX_ITEMS})
          </Typography>
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {items.map((item, idx) => (
            <Accordion
              key={idx}
              disableGutters
              elevation={0}
              sx={{
                border: "1px solid",
                borderColor: "divider",
                borderRadius: "10px !important",
                "&::before": { display: "none" },
                opacity: item.visible === false ? 0.6 : 1,
              }}
            >
              <AccordionSummary expandIcon={<IconChevronDown size={18} />}>
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 1, width: "100%", pr: 1 }}
                >
                  <Typography variant="body2" sx={{ flex: 1, fontSize: "13px", fontWeight: 500 }}>
                    {item.name || `Đối tác ${idx + 1}`}
                    {item.visible === false && (
                      <Typography component="span" variant="caption" sx={{ ml: 1, color: "text.secondary" }}>
                        (đang ẩn)
                      </Typography>
                    )}
                  </Typography>

                  <IconButton
                    component="span"
                    size="small"
                    disabled={idx === 0}
                    onClick={(e) => {
                      e.stopPropagation();
                      moveItem(idx, -1);
                    }}
                  >
                    <IconArrowUp size={15} />
                  </IconButton>
                  <IconButton
                    component="span"
                    size="small"
                    disabled={idx === items.length - 1}
                    onClick={(e) => {
                      e.stopPropagation();
                      moveItem(idx, 1);
                    }}
                  >
                    <IconArrowDown size={15} />
                  </IconButton>
                  <IconButton
                    component="span"
                    size="small"
                    color="error"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteIdx(idx);
                    }}
                  >
                    <IconTrash size={15} />
                  </IconButton>
                </Box>
              </AccordionSummary>

              <AccordionDetails>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Tên đối tác"
                    value={item.name}
                    onChange={(e) => updateItem(idx, { name: e.target.value })}
                    inputProps={{ maxLength: 60 }}
                    helperText="Dùng làm mô tả ảnh cho trình đọc màn hình"
                  />

                  <ImageInput
                    label="Logo"
                    value={item.logo}
                    onChange={(url) => updateItem(idx, { logo: url })}
                    folder="partners"
                    maxSizeMB={2}
                    hint="PNG nền trong suốt, cao 80–200px. Không nhận SVG."
                  />

                  <TextField
                    fullWidth
                    size="small"
                    label="Liên kết"
                    value={item.link}
                    onChange={(e) => updateItem(idx, { link: e.target.value })}
                    inputProps={{ maxLength: 300 }}
                    placeholder="https://doi-tac.vn"
                    helperText="Để trống thì logo không bấm được"
                  />

                  <FormControlLabel
                    control={
                      <Switch
                        checked={item.visible !== false}
                        onChange={(e) => updateItem(idx, { visible: e.target.checked })}
                      />
                    }
                    label="Hiển thị đối tác này"
                  />
                </Box>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>

        <Button
          size="small"
          startIcon={<IconPlus size={16} />}
          onClick={addItem}
          disabled={items.length >= MAX_ITEMS}
          sx={{ mt: 1 }}
        >
          Thêm đối tác
        </Button>
      </Box>

      <Divider />

      {/* ── Chuyển động ───────────────────────────────────────────────── */}
      <Box>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, fontSize: "13px" }}>
            Tốc độ chạy
          </Typography>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            {partners.speed}s / vòng
          </Typography>
        </Box>
        <Slider
          value={partners.speed}
          min={5}
          max={120}
          step={1}
          onChange={(_, val) => updateField("speed", val as number)}
        />
        <Typography variant="caption" sx={{ color: "text.secondary" }}>
          Số càng nhỏ chạy càng nhanh. Thêm logo mà giữ nguyên số này thì dải chạy nhanh hơn.
        </Typography>
      </Box>

      <Box>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, fontSize: "13px" }}>
            Khoảng cách giữa các logo
          </Typography>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            {partners.gap}px
          </Typography>
        </Box>
        <Slider
          value={partners.gap}
          min={20}
          max={400}
          step={4}
          onChange={(_, val) => updateField("gap", val as number)}
        />
      </Box>

      <TextField
        select
        fullWidth
        size="small"
        label="Hướng chạy"
        value={partners.direction}
        onChange={(e) => updateField("direction", e.target.value as "trai" | "phai")}
      >
        <MenuItem value="trai">Sang trái</MenuItem>
        <MenuItem value="phai">Sang phải</MenuItem>
      </TextField>

      <FormControlLabel
        control={
          <Switch
            checked={partners.pauseOnHover}
            onChange={(e) => updateField("pauseOnHover", e.target.checked)}
          />
        }
        label="Dừng khi rê chuột vào"
      />

      <Divider />

      {/* ── Hiển thị logo ─────────────────────────────────────────────── */}
      <Box>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, fontSize: "13px" }}>
            Chiều cao logo
          </Typography>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            {partners.logoHeight}px
          </Typography>
        </Box>
        <Slider
          value={partners.logoHeight}
          min={20}
          max={96}
          step={2}
          onChange={(_, val) => updateField("logoHeight", val as number)}
        />
      </Box>

      <FormControlLabel
        control={
          <Switch
            checked={partners.grayscale}
            onChange={(e) => updateField("grayscale", e.target.checked)}
          />
        }
        label="Lọc xám, hiện màu khi rê chuột"
      />

      <Divider />

      {/* ── Màu ───────────────────────────────────────────────────────── */}
      <Box>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <FormControlLabel
            control={
              <Switch
                checked={partners.customColors}
                onChange={(e) => updateField("customColors", e.target.checked)}
              />
            }
            label="Dùng màu riêng cho dải này"
          />
          {partners.customColors && (
            <Button size="small" startIcon={<IconRotate size={15} />} onClick={resetColorsToTheme}>
              Dùng lại màu theme
            </Button>
          )}
        </Box>

        {partners.customColors && (
          <Box sx={{ mt: 1 }}>
            <ColorInput
              label="Màu nền dải"
              value={partners.bgColor}
              onChange={(val) => updateField("bgColor", val)}
            />
            <ColorInput
              label="Màu dòng nhãn"
              value={partners.labelColor}
              onChange={(val) => updateField("labelColor", val)}
            />
          </Box>
        )}
      </Box>

      {/* Xác nhận xóa */}
      <Dialog open={deleteIdx !== null} onClose={() => setDeleteIdx(null)}>
        <DialogTitle>Xóa đối tác</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Xóa <strong>{deleteIdx !== null ? items[deleteIdx]?.name || `Đối tác ${deleteIdx + 1}` : ""}</strong> khỏi
            danh sách? Thay đổi chỉ có hiệu lực sau khi bấm Lưu &amp; áp dụng.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button color="inherit" onClick={() => setDeleteIdx(null)}>
            Hủy
          </Button>
          <Button color="error" variant="contained" onClick={() => deleteIdx !== null && removeItem(deleteIdx)}>
            Xóa
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
