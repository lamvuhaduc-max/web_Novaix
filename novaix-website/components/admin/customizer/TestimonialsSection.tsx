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
import FieldInput from "./FieldInput";
import type { TestimonialsContent } from "@/lib/site-content/schema";

export default function TestimonialsSection({
  testimonials,
  onChange,
}: {
  testimonials: TestimonialsContent;
  onChange: (newTestimonials: TestimonialsContent) => void;
}) {
  const [deleteItemIdx, setDeleteItemIdx] = useState<number | null>(null);

  const items = testimonials.items || [];

  const updateField = <K extends keyof TestimonialsContent>(key: K, val: TestimonialsContent[K]) => {
    onChange({
      ...testimonials,
      [key]: val,
    });
  };

  const handleResetToTheme = () => {
    onChange({
      ...testimonials,
      customColors: false,
      kickerColor: "#2dd4bf",
      titleColor: "#eef2fb",
      descColor: "#9aa6c4",
      bgColor: "#070b16",
      cardBgColor: "#0d1424",
      quoteColor: "#eef2fb",
    });
  };

  const handleAddItem = () => {
    const next = [
      ...items,
      {
        initials: "KH",
        name: "Khách hàng mới",
        role: "Chức vụ · Công ty",
        quote: "Chia sẻ cảm nhận về trải nghiệm và hiệu quả sau khi sử dụng hệ thống...",
      },
    ];
    updateField("items", next);
  };

  const handleConfirmDeleteItem = () => {
    if (deleteItemIdx === null) return;
    const next = items.filter((_, i) => i !== deleteItemIdx);
    updateField("items", next);
    setDeleteItemIdx(null);
  };

  const handleMoveItem = (idx: number, dir: "up" | "down") => {
    const targetIdx = dir === "up" ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= items.length) return;
    const next = [...items];
    const [moved] = next.splice(idx, 1);
    next.splice(targetIdx, 0, moved);
    updateField("items", next);
  };

  const handleItemChange = (idx: number, field: string, val: any) => {
    const next = [...items];
    next[idx] = { ...next[idx], [field]: val };
    updateField("items", next);
  };

  return (
    <Box>
      <FieldInput
        field={{ key: "kicker", path: "testimonials.kicker", label: "Dòng nhãn", type: "text", max: 60, required: true }}
        value={testimonials.kicker}
        onChange={(val) => updateField("kicker", val)}
      />

      <FieldInput
        field={{ key: "title", path: "testimonials.title", label: "Tiêu đề", type: "text", max: 120, required: true }}
        value={testimonials.title}
        onChange={(val) => updateField("title", val)}
      />

      <FieldInput
        field={{ key: "desc", path: "testimonials.desc", label: "Mô tả", type: "textarea", max: 400 }}
        value={testimonials.desc}
        onChange={(val) => updateField("desc", val)}
      />

      <Divider sx={{ my: 2.5 }} />

      {/* TÙY BIẾN MÀU SẮC RIÊNG CHO KHỐI ĐÁNH GIÁ */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: "13.5px" }}>
            Tùy chỉnh màu sắc riêng cho Khách hàng nói gì
          </Typography>
          <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>
            {testimonials.customColors ? "Đang áp dụng bộ màu riêng cho khối này" : "Đang kế thừa tự động theo Màu Toàn Trang"}
          </Typography>
        </Box>
        <FormControlLabel
          control={
            <Switch
              checked={Boolean(testimonials.customColors)}
              onChange={(e) => updateField("customColors", e.target.checked)}
              color="primary"
              size="small"
            />
          }
          label=""
          sx={{ mr: -1 }}
        />
      </Box>

      {testimonials.customColors ? (
        <Box sx={{ bgcolor: "background.default", p: 1.5, borderRadius: "10px", border: "1px solid", borderColor: "divider", mb: 2.5 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: "primary.main", letterSpacing: "0.05em" }}>
              BẢNG MÀU ĐỘC BẢN KHÁCH HÀNG NÓI GÌ
            </Typography>
            <Button
              size="small"
              startIcon={<IconRotate size={13} />}
              onClick={handleResetToTheme}
              sx={{ textTransform: "none", fontSize: "11px", py: 0.25 }}
            >
              Đồng bộ lại theo Toàn trang
            </Button>
          </Box>

          <ColorInput
            label="Màu nhãn trên (Kicker)"
            value={testimonials.kickerColor || "#2dd4bf"}
            onChange={(val) => updateField("kickerColor", val)}
          />
          <ColorInput
            label="Màu chữ tiêu đề & Tên khách hàng"
            value={testimonials.titleColor || "#eef2fb"}
            onChange={(val) => updateField("titleColor", val)}
          />
          <ColorInput
            label="Màu chữ mô tả & Chức danh"
            value={testimonials.descColor || "#9aa6c4"}
            onChange={(val) => updateField("descColor", val)}
          />
          <ColorInput
            label="Màu chữ lời chứng (Quote)"
            value={testimonials.quoteColor || "#eef2fb"}
            onChange={(val) => updateField("quoteColor", val)}
          />
          <ColorInput
            label="Màu nền khối Đánh giá"
            value={testimonials.bgColor || "#070b16"}
            onChange={(val) => updateField("bgColor", val)}
          />
          <ColorInput
            label="Màu nền thẻ cảm nhận"
            value={testimonials.cardBgColor || "#0d1424"}
            onChange={(val) => updateField("cardBgColor", val)}
          />
        </Box>
      ) : (
        <Alert severity="info" sx={{ mb: 2.5, py: 0.5, fontSize: "12px", borderRadius: "8px" }}>
          Khối này đang tự động kế thừa bảng màu chung. Khi bạn đổi Bảng màu toàn trang, khối này sẽ tự động đổi màu đồng bộ.
        </Alert>
      )}

      <Divider sx={{ my: 2.5 }} />

      {/* DANH SÁCH CẢM NHẬN */}
      <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: "14px", mb: 1.5, color: "primary.main" }}>
        Danh sách cảm nhận ({items.length}/9)
      </Typography>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25, mb: 1.5 }}>
        {items.map((t, idx) => (
          <Accordion
            key={idx}
            disableGutters
            elevation={0}
            sx={{
              border: "1px solid",
              borderColor: "divider",
              borderRadius: "8px !important",
              overflow: "hidden",
              bgcolor: "background.paper",
              "&:before": { display: "none" },
            }}
          >
            <AccordionSummary
              component="div"
              expandIcon={<IconChevronDown size={16} />}
              sx={{
                px: 1.5,
                minHeight: 42,
                cursor: "pointer",
                "& .MuiAccordionSummary-content": {
                  my: 0.5,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  mr: 1,
                },
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: "13px" }}>
                [{t.initials || "Avatar"}] {t.name || "Khách hàng"}
              </Typography>

              <Box sx={{ display: "flex", alignItems: "center", gap: 0.25 }}>
                <IconButton
                  size="small"
                  disabled={idx === 0}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMoveItem(idx, "up");
                  }}
                  sx={{ p: 0.25 }}
                >
                  <IconArrowUp size={14} />
                </IconButton>

                <IconButton
                  size="small"
                  disabled={idx === items.length - 1}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMoveItem(idx, "down");
                  }}
                  sx={{ p: 0.25 }}
                >
                  <IconArrowDown size={14} />
                </IconButton>

                {items.length > 1 && (
                  <IconButton
                    size="small"
                    color="error"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteItemIdx(idx);
                    }}
                    sx={{ p: 0.5 }}
                  >
                    <IconTrash size={15} />
                  </IconButton>
                )}
              </Box>
            </AccordionSummary>

            <AccordionDetails sx={{ p: 2, pt: 1.5, borderTop: "1px solid", borderColor: "divider", bgcolor: "background.default" }}>
              <Box sx={{ display: "grid", gridTemplateColumns: "70px 1fr", gap: 1, mb: 1.5 }}>
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 600, mb: 0.5, display: "block" }}>
                    Ký tự đầu *
                  </Typography>
                  <TextField
                    size="small"
                    value={t.initials || ""}
                    placeholder="TM"
                    onChange={(e) => handleItemChange(idx, "initials", e.target.value)}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: "6px", bgcolor: "background.paper", fontSize: "13px" } }}
                  />
                </Box>

                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 600, mb: 0.5, display: "block" }}>
                    Tên khách hàng *
                  </Typography>
                  <TextField
                    size="small"
                    fullWidth
                    value={t.name || ""}
                    placeholder="Chị Thu Minh..."
                    onChange={(e) => handleItemChange(idx, "name", e.target.value)}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: "6px", bgcolor: "background.paper", fontSize: "13px" } }}
                  />
                </Box>
              </Box>

              <Box sx={{ mb: 1.5 }}>
                <Typography variant="caption" sx={{ fontWeight: 600, mb: 0.5, display: "block" }}>
                  Chức danh & Công ty *
                </Typography>
                <TextField
                  size="small"
                  fullWidth
                  value={t.role || ""}
                  placeholder="Giám đốc vận hành · Chuỗi bán lẻ..."
                  onChange={(e) => handleItemChange(idx, "role", e.target.value)}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: "6px", bgcolor: "background.paper", fontSize: "13px" } }}
                />
              </Box>

              <Box>
                <Typography variant="caption" sx={{ fontWeight: 600, mb: 0.5, display: "block" }}>
                  Lời chứng (Quote) *
                </Typography>
                <TextField
                  size="small"
                  fullWidth
                  multiline
                  rows={3}
                  value={t.quote || ""}
                  placeholder="Chia sẻ trải nghiệm..."
                  onChange={(e) => handleItemChange(idx, "quote", e.target.value)}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: "6px", bgcolor: "background.paper", fontSize: "12.5px" } }}
                />
              </Box>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>

      {items.length < 9 && (
        <Button
          variant="outlined"
          fullWidth
          size="small"
          startIcon={<IconPlus size={14} />}
          onClick={handleAddItem}
          sx={{ borderRadius: "8px", textTransform: "none", fontSize: "12px", borderStyle: "dashed" }}
        >
          Thêm cảm nhận
        </Button>
      )}

      {/* Dialog xác nhận xóa */}
      <Dialog open={deleteItemIdx !== null} onClose={() => setDeleteItemIdx(null)}>
        <DialogTitle sx={{ fontWeight: 600, fontSize: "16px" }}>Xác nhận xóa cảm nhận</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ fontSize: "14px" }}>
            Bạn có chắc muốn xóa cảm nhận của <b>&ldquo;{deleteItemIdx !== null ? items[deleteItemIdx]?.name : ""}&rdquo;</b> không?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteItemIdx(null)} sx={{ textTransform: "none" }}>
            Hủy
          </Button>
          <Button onClick={handleConfirmDeleteItem} color="error" variant="contained" sx={{ textTransform: "none" }}>
            Xóa
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
