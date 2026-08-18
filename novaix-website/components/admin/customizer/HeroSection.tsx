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
import FieldInput from "./FieldInput";
import type { HeroContent } from "@/lib/site-content/schema";

export default function HeroSection({
  hero,
  onChange,
}: {
  hero: HeroContent;
  onChange: (newHero: HeroContent) => void;
}) {
  const [deleteStatIdx, setDeleteStatIdx] = useState<number | null>(null);

  const stats = hero.stats || [];

  const updateField = <K extends keyof HeroContent>(key: K, val: HeroContent[K]) => {
    onChange({
      ...hero,
      [key]: val,
    });
  };

  const handleResetToTheme = () => {
    onChange({
      ...hero,
      customColors: false,
      kickerColor: "#2dd4bf",
      titleColor: "#eef2fb",
      highlightColor: "#2dd4bf",
      highlightAccentColor: "#38bdf8",
      descColor: "#9aa6c4",
      btnPrimaryBg: "#2dd4bf",
      btnPrimaryText: "#04121a",
      btnGhostBg: "#131c31",
      btnGhostText: "#eef2fb",
      btnGhostBorder: "#2dd4bf",
    });
  };

  const handleAddStat = () => {
    const next = [
      ...stats,
      { target: 100, suffix: "+", label: "Chỉ số mới" },
    ];
    updateField("stats", next);
  };

  const handleConfirmDeleteStat = () => {
    if (deleteStatIdx === null) return;
    const next = stats.filter((_, i) => i !== deleteStatIdx);
    updateField("stats", next);
    setDeleteStatIdx(null);
  };

  const handleMoveStat = (idx: number, dir: "up" | "down") => {
    const targetIdx = dir === "up" ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= stats.length) return;
    const next = [...stats];
    const [moved] = next.splice(idx, 1);
    next.splice(targetIdx, 0, moved);
    updateField("stats", next);
  };

  const handleStatChange = (idx: number, field: string, val: any) => {
    const next = [...stats];
    next[idx] = {
      ...next[idx],
      [field]: val,
    };
    updateField("stats", next);
  };

  return (
    <Box>
      {/* Các trường Hero chính */}
      <FieldInput
        field={{ key: "kicker", path: "hero.kicker", label: "Dòng nhãn trên", type: "text", max: 60, required: true }}
        value={hero.kicker}
        onChange={(val) => updateField("kicker", val)}
      />

      <FieldInput
        field={{ key: "titleLead", path: "hero.titleLead", label: "Tiêu đề (phần đầu)", type: "text", max: 60, required: true }}
        value={hero.titleLead}
        onChange={(val) => updateField("titleLead", val)}
      />

      <FieldInput
        field={{ key: "titleHighlight", path: "hero.titleHighlight", label: "Tiêu đề (phần nhấn gradient)", type: "text", max: 40, required: true }}
        value={hero.titleHighlight}
        onChange={(val) => updateField("titleHighlight", val)}
      />

      <FieldInput
        field={{ key: "titleTail", path: "hero.titleTail", label: "Tiêu đề (phần đuôi)", type: "text", max: 60 }}
        value={hero.titleTail}
        onChange={(val) => updateField("titleTail", val)}
      />

      <FieldInput
        field={{ key: "desc", path: "hero.desc", label: "Mô tả", type: "textarea", max: 400, required: true }}
        value={hero.desc}
        onChange={(val) => updateField("desc", val)}
      />

      <FieldInput
        field={{ key: "ctaPrimary", path: "hero.ctaPrimary", label: "Nút chính", type: "text", max: 30, required: true }}
        value={hero.ctaPrimary}
        onChange={(val) => updateField("ctaPrimary", val)}
      />

      <FieldInput
        field={{ key: "ctaSecondary", path: "hero.ctaSecondary", label: "Nút phụ", type: "text", max: 30 }}
        value={hero.ctaSecondary}
        onChange={(val) => updateField("ctaSecondary", val)}
      />

      <Divider sx={{ my: 2.5 }} />

      {/* TÙY BIẾN MÀU SẮC RIÊNG CHO KHỐI HERO */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: "13.5px" }}>
            Tùy chỉnh màu sắc riêng cho Hero
          </Typography>
          <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>
            {hero.customColors ? "Đang áp dụng bộ màu riêng cho Hero" : "Đang kế thừa tự động theo Màu Toàn Trang"}
          </Typography>
        </Box>
        <FormControlLabel
          control={
            <Switch
              checked={Boolean(hero.customColors)}
              onChange={(e) => updateField("customColors", e.target.checked)}
              color="primary"
              size="small"
            />
          }
          label=""
          sx={{ mr: -1 }}
        />
      </Box>

      {hero.customColors ? (
        <Box sx={{ bgcolor: "background.default", p: 1.5, borderRadius: "10px", border: "1px solid", borderColor: "divider", mb: 2.5 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: "primary.main", letterSpacing: "0.05em" }}>
              BẢNG MÀU ĐỘC BẢN CỦA HERO
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

          {/* Nhóm màu chữ & nhãn */}
          <Typography variant="caption" sx={{ fontWeight: 600, color: "text.secondary", mb: 1, display: "block" }}>
            Chữ & Nhãn Hero
          </Typography>
          <ColorInput
            label="Màu nhãn trên (Kicker)"
            value={hero.kickerColor || "#2dd4bf"}
            onChange={(val) => updateField("kickerColor", val)}
          />
          <ColorInput
            label="Màu chữ tiêu đề thường"
            value={hero.titleColor || "#eef2fb"}
            onChange={(val) => updateField("titleColor", val)}
          />
          <ColorInput
            label="Màu chữ nhấn (Đầu gradient)"
            value={hero.highlightColor || "#2dd4bf"}
            onChange={(val) => updateField("highlightColor", val)}
          />
          <ColorInput
            label="Màu chữ nhấn (Cuối gradient)"
            value={hero.highlightAccentColor || "#38bdf8"}
            onChange={(val) => updateField("highlightAccentColor", val)}
          />
          <ColorInput
            label="Màu chữ mô tả"
            value={hero.descColor || "#9aa6c4"}
            onChange={(val) => updateField("descColor", val)}
          />

          <Divider sx={{ my: 1.5 }} />

          {/* Nhóm Nút chính */}
          <Typography variant="caption" sx={{ fontWeight: 600, color: "text.secondary", mb: 1, display: "block" }}>
            Nút chính Hero (Primary)
          </Typography>
          <ColorInput
            label="Màu nền nút chính"
            value={hero.btnPrimaryBg || "#2dd4bf"}
            onChange={(val) => updateField("btnPrimaryBg", val)}
          />
          <ColorInput
            label="Màu chữ nút chính"
            value={hero.btnPrimaryText || "#04121a"}
            onChange={(val) => updateField("btnPrimaryText", val)}
          />

          <Divider sx={{ my: 1.5 }} />

          {/* Nhóm Nút phụ */}
          <Typography variant="caption" sx={{ fontWeight: 600, color: "text.secondary", mb: 1, display: "block" }}>
            Nút phụ Hero (Ghost)
          </Typography>
          <ColorInput
            label="Màu nền nút phụ"
            value={hero.btnGhostBg || "#131c31"}
            onChange={(val) => updateField("btnGhostBg", val)}
          />
          <ColorInput
            label="Màu chữ nút phụ"
            value={hero.btnGhostText || "#eef2fb"}
            onChange={(val) => updateField("btnGhostText", val)}
          />
          <ColorInput
            label="Màu viền nút phụ"
            value={hero.btnGhostBorder || "#2dd4bf"}
            onChange={(val) => updateField("btnGhostBorder", val)}
          />
        </Box>
      ) : (
        <Alert severity="info" sx={{ mb: 2.5, py: 0.5, fontSize: "12px", borderRadius: "8px" }}>
          Khối Hero đang tự động kế thừa bảng màu chung. Khi bạn đổi Bảng màu toàn trang, Hero sẽ tự động đổi màu đồng bộ.
        </Alert>
      )}

      <Divider sx={{ my: 2.5 }} />

      {/* TÙY CHỈNH KHỐI SỐ LIỆU THỐNG KÊ */}
      <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: "14px", mb: 1.5, color: "primary.main" }}>
        Khối số liệu thống kê (Stats Panel)
      </Typography>

      {/* Màu nền khối stats */}
      <ColorInput
        label="Màu nền khối số liệu"
        value={hero.statsBgColor || "#0b1120"}
        onChange={(val) => updateField("statsBgColor", val)}
      />

      {/* Độ trong suốt nền */}
      <Box sx={{ mb: 2, mt: 1 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.5 }}>
          <Typography variant="caption" sx={{ fontWeight: 600 }}>
            Độ trong suốt của nền khối số liệu
          </Typography>
          <Typography variant="caption" sx={{ fontWeight: 700, fontSize: "12px", color: "text.secondary" }}>
            {hero.statsBgOpacity ?? 60}%
          </Typography>
        </Box>
        <Slider
          value={hero.statsBgOpacity ?? 60}
          min={0}
          max={100}
          step={5}
          onChange={(_, val) => updateField("statsBgOpacity", val as number)}
          sx={{ color: "primary.main" }}
        />
      </Box>

      {/* Màu viền khối stats */}
      <ColorInput
        label="Màu viền khối số liệu"
        value={hero.statsBorderColor || "#1e293b"}
        onChange={(val) => updateField("statsBorderColor", val)}
      />

      {/* Danh sách các số liệu */}
      <Typography variant="body2" sx={{ fontWeight: 600, fontSize: "13px", mt: 2, mb: 1.5 }}>
        Danh sách số liệu ({stats.length}/6)
      </Typography>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25, mb: 1.5 }}>
        {stats.map((stat, idx) => (
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
                {stat.target}{stat.suffix} - {stat.label || "Số liệu"}
              </Typography>

              <Box sx={{ display: "flex", alignItems: "center", gap: 0.25 }}>
                <IconButton
                  size="small"
                  disabled={idx === 0}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMoveStat(idx, "up");
                  }}
                  sx={{ p: 0.25 }}
                >
                  <IconArrowUp size={14} />
                </IconButton>

                <IconButton
                  size="small"
                  disabled={idx === stats.length - 1}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMoveStat(idx, "down");
                  }}
                  sx={{ p: 0.25 }}
                >
                  <IconArrowDown size={14} />
                </IconButton>

                {stats.length > 2 && (
                  <IconButton
                    size="small"
                    color="error"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteStatIdx(idx);
                    }}
                    sx={{ p: 0.5 }}
                  >
                    <IconTrash size={15} />
                  </IconButton>
                )}
              </Box>
            </AccordionSummary>

            <AccordionDetails sx={{ p: 2, pt: 1.5, borderTop: "1px solid", borderColor: "divider", bgcolor: "background.default" }}>
              <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5, mb: 1.5 }}>
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 600, mb: 0.5, display: "block" }}>
                    Chỉ số số nguyên *
                  </Typography>
                  <TextField
                    size="small"
                    type="number"
                    fullWidth
                    value={stat.target}
                    onChange={(e) => handleStatChange(idx, "target", Number(e.target.value))}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: "6px", bgcolor: "background.paper", fontSize: "13px" } }}
                  />
                </Box>

                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 600, mb: 0.5, display: "block" }}>
                    Hậu tố (%, +, /7)
                  </Typography>
                  <TextField
                    size="small"
                    fullWidth
                    value={stat.suffix || ""}
                    placeholder="%, +, /7..."
                    onChange={(e) => handleStatChange(idx, "suffix", e.target.value)}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: "6px", bgcolor: "background.paper", fontSize: "13px" } }}
                  />
                </Box>
              </Box>

              <Box>
                <Typography variant="caption" sx={{ fontWeight: 600, mb: 0.5, display: "block" }}>
                  Nhãn giải thích *
                </Typography>
                <TextField
                  size="small"
                  fullWidth
                  value={stat.label || ""}
                  placeholder="Ví dụ: Module nghiệp vụ, Uptime cam kết..."
                  onChange={(e) => handleStatChange(idx, "label", e.target.value)}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: "6px", bgcolor: "background.paper", fontSize: "13px" } }}
                />
              </Box>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>

      {stats.length < 6 && (
        <Button
          variant="outlined"
          fullWidth
          size="small"
          startIcon={<IconPlus size={15} />}
          onClick={handleAddStat}
          sx={{
            borderRadius: "8px",
            textTransform: "none",
            fontSize: "13px",
            fontWeight: 600,
            borderStyle: "dashed",
          }}
        >
          Thêm số liệu thống kê
        </Button>
      )}

      {/* Dialog xác nhận xóa stat */}
      <Dialog open={deleteStatIdx !== null} onClose={() => setDeleteStatIdx(null)}>
        <DialogTitle sx={{ fontWeight: 600, fontSize: "16px" }}>Xác nhận xóa số liệu</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ fontSize: "14px" }}>
            Bạn có chắc muốn xóa chỉ số <b>&ldquo;{deleteStatIdx !== null ? `${stats[deleteStatIdx]?.target}${stats[deleteStatIdx]?.suffix} - ${stats[deleteStatIdx]?.label}` : ""}&rdquo;</b> không?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteStatIdx(null)} sx={{ textTransform: "none" }}>
            Hủy
          </Button>
          <Button onClick={handleConfirmDeleteStat} color="error" variant="contained" sx={{ textTransform: "none" }}>
            Xóa
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
