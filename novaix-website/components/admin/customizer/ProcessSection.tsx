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
import type { ProcessContent } from "@/lib/site-content/schema";

export default function ProcessSection({
  process,
  onChange,
}: {
  process: ProcessContent;
  onChange: (newProcess: ProcessContent) => void;
}) {
  const [deleteItemIdx, setDeleteItemIdx] = useState<number | null>(null);

  const items = process.items || [];

  const updateField = <K extends keyof ProcessContent>(key: K, val: ProcessContent[K]) => {
    onChange({
      ...process,
      [key]: val,
    });
  };

  const handleResetToTheme = () => {
    onChange({
      ...process,
      customColors: false,
      kickerColor: "#2dd4bf",
      titleColor: "#eef2fb",
      descColor: "#9aa6c4",
      bgColor: "#070b16",
      cardBgColor: "#0d1424",
      stepNumberColor: "#38bdf8",
    });
  };

  const handleAddItem = () => {
    const stepNum = items.length + 1;
    const next = [
      ...items,
      {
        n: `BƯỚC ${stepNum < 10 ? `0${stepNum}` : stepNum}`,
        title: "Bước mới",
        desc: "Mô tả công việc thực hiện trong giai đoạn này...",
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
        field={{ key: "kicker", path: "process.kicker", label: "Dòng nhãn", type: "text", max: 60, required: true }}
        value={process.kicker}
        onChange={(val) => updateField("kicker", val)}
      />

      <FieldInput
        field={{ key: "title", path: "process.title", label: "Tiêu đề", type: "text", max: 120, required: true }}
        value={process.title}
        onChange={(val) => updateField("title", val)}
      />

      <FieldInput
        field={{ key: "desc", path: "process.desc", label: "Mô tả", type: "textarea", max: 400 }}
        value={process.desc}
        onChange={(val) => updateField("desc", val)}
      />

      <Divider sx={{ my: 2.5 }} />

      {/* TÙY BIẾN MÀU SẮC RIÊNG CHO KHỐI LỘ TRÌNH */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: "13.5px" }}>
            Tùy chỉnh màu sắc riêng cho Lộ trình
          </Typography>
          <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>
            {process.customColors ? "Đang áp dụng bộ màu riêng cho Lộ trình" : "Đang kế thừa tự động theo Màu Toàn Trang"}
          </Typography>
        </Box>
        <FormControlLabel
          control={
            <Switch
              checked={Boolean(process.customColors)}
              onChange={(e) => updateField("customColors", e.target.checked)}
              color="primary"
              size="small"
            />
          }
          label=""
          sx={{ mr: -1 }}
        />
      </Box>

      {process.customColors ? (
        <Box sx={{ bgcolor: "background.default", p: 1.5, borderRadius: "10px", border: "1px solid", borderColor: "divider", mb: 2.5 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: "primary.main", letterSpacing: "0.05em" }}>
              BẢNG MÀU ĐỘC BẢN LỘ TRÌNH TRIỂN KHAI
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
            value={process.kickerColor || "#2dd4bf"}
            onChange={(val) => updateField("kickerColor", val)}
          />
          <ColorInput
            label="Màu chữ tiêu đề"
            value={process.titleColor || "#eef2fb"}
            onChange={(val) => updateField("titleColor", val)}
          />
          <ColorInput
            label="Màu chữ mô tả"
            value={process.descColor || "#9aa6c4"}
            onChange={(val) => updateField("descColor", val)}
          />
          <ColorInput
            label="Màu nền khối Lộ trình"
            value={process.bgColor || "#070b16"}
            onChange={(val) => updateField("bgColor", val)}
          />
          <ColorInput
            label="Màu nền thẻ bước triển khai"
            value={process.cardBgColor || "#0d1424"}
            onChange={(val) => updateField("cardBgColor", val)}
          />
          <ColorInput
            label="Màu chữ số bước (BƯỚC 01...)"
            value={process.stepNumberColor || "#38bdf8"}
            onChange={(val) => updateField("stepNumberColor", val)}
          />
        </Box>
      ) : (
        <Alert severity="info" sx={{ mb: 2.5, py: 0.5, fontSize: "12px", borderRadius: "8px" }}>
          Khối Lộ trình đang tự động kế thừa bảng màu chung. Khi bạn đổi Bảng màu toàn trang, khối này sẽ tự động đổi màu đồng bộ.
        </Alert>
      )}

      <Divider sx={{ my: 2.5 }} />

      {/* DANH SÁCH CÁC BƯỚC TRIỂN KHAI */}
      <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: "14px", mb: 1.5, color: "primary.main" }}>
        Các bước triển khai ({items.length}/8)
      </Typography>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25, mb: 1.5 }}>
        {items.map((s, idx) => (
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
                [{s.n || "Bước"}] {s.title || "Tên bước"}
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

                {items.length > 3 && (
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
              <Box sx={{ display: "grid", gridTemplateColumns: "110px 1fr", gap: 1, mb: 1.5 }}>
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 600, mb: 0.5, display: "block" }}>
                    Số bước *
                  </Typography>
                  <TextField
                    size="small"
                    value={s.n || ""}
                    placeholder="BƯỚC 01"
                    onChange={(e) => handleItemChange(idx, "n", e.target.value)}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: "6px", bgcolor: "background.paper", fontSize: "13px" } }}
                  />
                </Box>

                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 600, mb: 0.5, display: "block" }}>
                    Tên bước *
                  </Typography>
                  <TextField
                    size="small"
                    fullWidth
                    value={s.title || ""}
                    placeholder="Ví dụ: Khảo sát..."
                    onChange={(e) => handleItemChange(idx, "title", e.target.value)}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: "6px", bgcolor: "background.paper", fontSize: "13px" } }}
                  />
                </Box>
              </Box>

              <Box>
                <Typography variant="caption" sx={{ fontWeight: 600, mb: 0.5, display: "block" }}>
                  Mô tả bước *
                </Typography>
                <TextField
                  size="small"
                  fullWidth
                  multiline
                  rows={2}
                  value={s.desc || ""}
                  placeholder="Mô tả công việc..."
                  onChange={(e) => handleItemChange(idx, "desc", e.target.value)}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: "6px", bgcolor: "background.paper", fontSize: "12.5px" } }}
                />
              </Box>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>

      {items.length < 8 && (
        <Button
          variant="outlined"
          fullWidth
          size="small"
          startIcon={<IconPlus size={14} />}
          onClick={handleAddItem}
          sx={{ borderRadius: "8px", textTransform: "none", fontSize: "12px", borderStyle: "dashed" }}
        >
          Thêm bước triển khai
        </Button>
      )}

      {/* Dialog xác nhận xóa */}
      <Dialog open={deleteItemIdx !== null} onClose={() => setDeleteItemIdx(null)}>
        <DialogTitle sx={{ fontWeight: 600, fontSize: "16px" }}>Xác nhận xóa bước</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ fontSize: "14px" }}>
            Bạn có chắc muốn xóa bước <b>&ldquo;{deleteItemIdx !== null ? `${items[deleteItemIdx]?.n} - ${items[deleteItemIdx]?.title}` : ""}&rdquo;</b> không?
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
