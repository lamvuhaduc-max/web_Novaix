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
import type { AboutContent } from "@/lib/site-content/schema";

export default function AboutSection({
  about,
  onChange,
}: {
  about: AboutContent;
  onChange: (newAbout: AboutContent) => void;
}) {
  const [deleteValueIdx, setDeleteValueIdx] = useState<number | null>(null);
  const [deleteTimelineIdx, setDeleteTimelineIdx] = useState<number | null>(null);

  const values = about.values || [];
  const timeline = about.timeline || [];

  const updateField = <K extends keyof AboutContent>(key: K, val: AboutContent[K]) => {
    onChange({
      ...about,
      [key]: val,
    });
  };

  const handleResetToTheme = () => {
    onChange({
      ...about,
      customColors: false,
      kickerColor: "#2dd4bf",
      titleColor: "#eef2fb",
      descColor: "#9aa6c4",
      bgColor: "#0b1120",
      cardBgColor: "#131c31",
      accentColor: "#2dd4bf",
    });
  };

  // Values handlers
  const handleAddValue = () => {
    const next = [
      ...values,
      { icon: "💡", title: "Giá trị mới", desc: "Mô tả ngắn gọn về giá trị cốt lõi..." },
    ];
    updateField("values", next);
  };

  const handleConfirmDeleteValue = () => {
    if (deleteValueIdx === null) return;
    const next = values.filter((_, i) => i !== deleteValueIdx);
    updateField("values", next);
    setDeleteValueIdx(null);
  };

  const handleMoveValue = (idx: number, dir: "up" | "down") => {
    const targetIdx = dir === "up" ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= values.length) return;
    const next = [...values];
    const [moved] = next.splice(idx, 1);
    next.splice(targetIdx, 0, moved);
    updateField("values", next);
  };

  const handleValueChange = (idx: number, field: string, val: any) => {
    const next = [...values];
    next[idx] = { ...next[idx], [field]: val };
    updateField("values", next);
  };

  // Timeline handlers
  const handleAddTimeline = () => {
    const next = [
      ...timeline,
      { year: "2026 · Mốc mới", title: "Cột mốc mới", desc: "Mô tả thành tựu đạt được...", label: "26" },
    ];
    updateField("timeline", next);
  };

  const handleConfirmDeleteTimeline = () => {
    if (deleteTimelineIdx === null) return;
    const next = timeline.filter((_, i) => i !== deleteTimelineIdx);
    updateField("timeline", next);
    setDeleteTimelineIdx(null);
  };

  const handleMoveTimeline = (idx: number, dir: "up" | "down") => {
    const targetIdx = dir === "up" ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= timeline.length) return;
    const next = [...timeline];
    const [moved] = next.splice(idx, 1);
    next.splice(targetIdx, 0, moved);
    updateField("timeline", next);
  };

  const handleTimelineChange = (idx: number, field: string, val: any) => {
    const next = [...timeline];
    next[idx] = { ...next[idx], [field]: val };
    updateField("timeline", next);
  };

  return (
    <Box>
      {/* Thông tin cơ bản khối About */}
      <FieldInput
        field={{ key: "kicker", path: "about.kicker", label: "Dòng nhãn", type: "text", max: 60, required: true }}
        value={about.kicker}
        onChange={(val) => updateField("kicker", val)}
      />

      <FieldInput
        field={{ key: "title", path: "about.title", label: "Tiêu đề", type: "text", max: 120, required: true }}
        value={about.title}
        onChange={(val) => updateField("title", val)}
      />

      <FieldInput
        field={{ key: "desc", path: "about.desc", label: "Mô tả", type: "textarea", max: 500, required: true }}
        value={about.desc}
        onChange={(val) => updateField("desc", val)}
      />

      <Divider sx={{ my: 2.5 }} />

      {/* TÙY BIẾN MÀU SẮC RIÊNG CHO KHỐI ABOUT */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: "13.5px" }}>
            Tùy chỉnh màu sắc riêng cho Giới thiệu
          </Typography>
          <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>
            {about.customColors ? "Đang áp dụng bộ màu riêng cho Giới thiệu" : "Đang kế thừa tự động theo Màu Toàn Trang"}
          </Typography>
        </Box>
        <FormControlLabel
          control={
            <Switch
              checked={Boolean(about.customColors)}
              onChange={(e) => updateField("customColors", e.target.checked)}
              color="primary"
              size="small"
            />
          }
          label=""
          sx={{ mr: -1 }}
        />
      </Box>

      {about.customColors ? (
        <Box sx={{ bgcolor: "background.default", p: 1.5, borderRadius: "10px", border: "1px solid", borderColor: "divider", mb: 2.5 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: "primary.main", letterSpacing: "0.05em" }}>
              BẢNG MÀU ĐỘC BẢN GIỚI THIỆU
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
            value={about.kickerColor || "#2dd4bf"}
            onChange={(val) => updateField("kickerColor", val)}
          />
          <ColorInput
            label="Màu chữ tiêu đề"
            value={about.titleColor || "#eef2fb"}
            onChange={(val) => updateField("titleColor", val)}
          />
          <ColorInput
            label="Màu chữ mô tả"
            value={about.descColor || "#9aa6c4"}
            onChange={(val) => updateField("descColor", val)}
          />
          <ColorInput
            label="Màu nền khối Giới thiệu"
            value={about.bgColor || "#0b1120"}
            onChange={(val) => updateField("bgColor", val)}
          />
          <ColorInput
            label="Màu nền thẻ & Timeline"
            value={about.cardBgColor || "#131c31"}
            onChange={(val) => updateField("cardBgColor", val)}
          />
          <ColorInput
            label="Màu điểm nhấn (Năm & mốc)"
            value={about.accentColor || "#2dd4bf"}
            onChange={(val) => updateField("accentColor", val)}
          />
        </Box>
      ) : (
        <Alert severity="info" sx={{ mb: 2.5, py: 0.5, fontSize: "12px", borderRadius: "8px" }}>
          Khối Giới thiệu đang tự động kế thừa bảng màu chung. Khi bạn đổi Bảng màu toàn trang, khối này sẽ tự động đổi màu đồng bộ.
        </Alert>
      )}

      <Divider sx={{ my: 2.5 }} />

      {/* DANH SÁCH GIÁ TRỊ CỐT LÕI */}
      <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: "14px", mb: 1.5, color: "primary.main" }}>
        Giá trị cốt lõi ({values.length}/6)
      </Typography>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25, mb: 1.5 }}>
        {values.map((v, idx) => (
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
                {v.icon || "🎯"} {v.title || "Giá trị"}
              </Typography>

              <Box sx={{ display: "flex", alignItems: "center", gap: 0.25 }}>
                <IconButton
                  size="small"
                  disabled={idx === 0}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMoveValue(idx, "up");
                  }}
                  sx={{ p: 0.25 }}
                >
                  <IconArrowUp size={14} />
                </IconButton>

                <IconButton
                  size="small"
                  disabled={idx === values.length - 1}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMoveValue(idx, "down");
                  }}
                  sx={{ p: 0.25 }}
                >
                  <IconArrowDown size={14} />
                </IconButton>

                {values.length > 1 && (
                  <IconButton
                    size="small"
                    color="error"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteValueIdx(idx);
                    }}
                    sx={{ p: 0.5 }}
                  >
                    <IconTrash size={15} />
                  </IconButton>
                )}
              </Box>
            </AccordionSummary>

            <AccordionDetails sx={{ p: 2, pt: 1.5, borderTop: "1px solid", borderColor: "divider", bgcolor: "background.default" }}>
              <Box sx={{ display: "flex", gap: 1, mb: 1.5 }}>
                <TextField
                  size="small"
                  value={v.icon || ""}
                  placeholder="Icon"
                  onChange={(e) => handleValueChange(idx, "icon", e.target.value)}
                  sx={{ width: 65, "& .MuiOutlinedInput-root": { borderRadius: "6px", bgcolor: "background.paper" } }}
                />
                <TextField
                  size="small"
                  fullWidth
                  value={v.title || ""}
                  placeholder="Tên giá trị..."
                  onChange={(e) => handleValueChange(idx, "title", e.target.value)}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: "6px", bgcolor: "background.paper", fontSize: "13px" } }}
                />
              </Box>

              <TextField
                size="small"
                fullWidth
                multiline
                rows={2}
                value={v.desc || ""}
                placeholder="Mô tả giá trị..."
                onChange={(e) => handleValueChange(idx, "desc", e.target.value)}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: "6px", bgcolor: "background.paper", fontSize: "12.5px" } }}
              />
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>

      {values.length < 6 && (
        <Button
          variant="outlined"
          fullWidth
          size="small"
          startIcon={<IconPlus size={14} />}
          onClick={handleAddValue}
          sx={{ mb: 3, borderRadius: "8px", textTransform: "none", fontSize: "12px", borderStyle: "dashed" }}
        >
          Thêm giá trị cốt lõi
        </Button>
      )}

      <Divider sx={{ my: 2.5 }} />

      {/* DANH SÁCH MỐC HÀNH TRÌNH (TIMELINE) */}
      <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: "14px", mb: 1.5, color: "primary.main" }}>
        Mốc hành trình (Timeline) ({timeline.length}/8)
      </Typography>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25, mb: 1.5 }}>
        {timeline.map((t, idx) => (
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
                [{t.label || "Mốc"}] {t.year || "Năm"} — {t.title || "Tiêu đề"}
              </Typography>

              <Box sx={{ display: "flex", alignItems: "center", gap: 0.25 }}>
                <IconButton
                  size="small"
                  disabled={idx === 0}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMoveTimeline(idx, "up");
                  }}
                  sx={{ p: 0.25 }}
                >
                  <IconArrowUp size={14} />
                </IconButton>

                <IconButton
                  size="small"
                  disabled={idx === timeline.length - 1}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMoveTimeline(idx, "down");
                  }}
                  sx={{ p: 0.25 }}
                >
                  <IconArrowDown size={14} />
                </IconButton>

                {timeline.length > 1 && (
                  <IconButton
                    size="small"
                    color="error"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteTimelineIdx(idx);
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
                    Nhãn mốc *
                  </Typography>
                  <TextField
                    size="small"
                    value={t.label || ""}
                    placeholder="21, 22..."
                    onChange={(e) => handleTimelineChange(idx, "label", e.target.value)}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: "6px", bgcolor: "background.paper", fontSize: "13px" } }}
                  />
                </Box>

                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 600, mb: 0.5, display: "block" }}>
                    Thời gian *
                  </Typography>
                  <TextField
                    size="small"
                    fullWidth
                    value={t.year || ""}
                    placeholder="2021 · Thành lập..."
                    onChange={(e) => handleTimelineChange(idx, "year", e.target.value)}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: "6px", bgcolor: "background.paper", fontSize: "13px" } }}
                  />
                </Box>
              </Box>

              <Box sx={{ mb: 1.5 }}>
                <Typography variant="caption" sx={{ fontWeight: 600, mb: 0.5, display: "block" }}>
                  Tiêu đề mốc *
                </Typography>
                <TextField
                  size="small"
                  fullWidth
                  value={t.title || ""}
                  placeholder="Ra mắt OAlpha..."
                  onChange={(e) => handleTimelineChange(idx, "title", e.target.value)}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: "6px", bgcolor: "background.paper", fontSize: "13px" } }}
                />
              </Box>

              <Box>
                <Typography variant="caption" sx={{ fontWeight: 600, mb: 0.5, display: "block" }}>
                  Mô tả mốc *
                </Typography>
                <TextField
                  size="small"
                  fullWidth
                  multiline
                  rows={2}
                  value={t.desc || ""}
                  placeholder="Mô tả sự kiện cột mốc..."
                  onChange={(e) => handleTimelineChange(idx, "desc", e.target.value)}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: "6px", bgcolor: "background.paper", fontSize: "12.5px" } }}
                />
              </Box>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>

      {timeline.length < 8 && (
        <Button
          variant="outlined"
          fullWidth
          size="small"
          startIcon={<IconPlus size={14} />}
          onClick={handleAddTimeline}
          sx={{ borderRadius: "8px", textTransform: "none", fontSize: "12px", borderStyle: "dashed" }}
        >
          Thêm mốc hành trình
        </Button>
      )}

      {/* Dialog xác nhận xóa value */}
      <Dialog open={deleteValueIdx !== null} onClose={() => setDeleteValueIdx(null)}>
        <DialogTitle sx={{ fontWeight: 600, fontSize: "16px" }}>Xác nhận xóa giá trị</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ fontSize: "14px" }}>
            Bạn có chắc muốn xóa giá trị <b>&ldquo;{deleteValueIdx !== null ? values[deleteValueIdx]?.title : ""}&rdquo;</b> không?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteValueIdx(null)} sx={{ textTransform: "none" }}>
            Hủy
          </Button>
          <Button onClick={handleConfirmDeleteValue} color="error" variant="contained" sx={{ textTransform: "none" }}>
            Xóa
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog xác nhận xóa timeline */}
      <Dialog open={deleteTimelineIdx !== null} onClose={() => setDeleteTimelineIdx(null)}>
        <DialogTitle sx={{ fontWeight: 600, fontSize: "16px" }}>Xác nhận xóa mốc hành trình</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ fontSize: "14px" }}>
            Bạn có chắc muốn xóa mốc <b>&ldquo;{deleteTimelineIdx !== null ? `${timeline[deleteTimelineIdx]?.year} - ${timeline[deleteTimelineIdx]?.title}` : ""}&rdquo;</b> không?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteTimelineIdx(null)} sx={{ textTransform: "none" }}>
            Hủy
          </Button>
          <Button onClick={handleConfirmDeleteTimeline} color="error" variant="contained" sx={{ textTransform: "none" }}>
            Xóa
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
