"use client";

import { useState } from "react";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Divider from "@mui/material/Divider";
import FormControlLabel from "@mui/material/FormControlLabel";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
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
import type { PricingContent } from "@/lib/site-content/schema";


export default function PricingSection({
  pricing,
  onChange,
}: {
  pricing: PricingContent;
  onChange: (newPricing: PricingContent) => void;
}) {
  const [deleteTierIdx, setDeleteTierIdx] = useState<number | null>(null);

  const tiers = pricing.tiers || [];

  const updateField = <K extends keyof PricingContent>(key: K, val: PricingContent[K]) => {
    onChange({
      ...pricing,
      [key]: val,
    });
  };

  // Tier operations
  const handleAddTier = () => {
    const next = [
      ...tiers,
      {
        label: "Gói mới",
        name: "Gói mới",
        price: "Liên hệ",
        sub: "Phù hợp nhu cầu mới",
        popular: false,
        cta: "Tư vấn ngay →",
        ctaClass: "btn btn-ghost",
        features: [
          { text: "Tính năng cơ bản 1" },
          { text: "Tính năng cơ bản 2" },
        ],
      },
    ];
    updateField("tiers", next);
  };

  const handleConfirmDeleteTier = () => {
    if (deleteTierIdx === null) return;
    const next = tiers.filter((_, i) => i !== deleteTierIdx);
    updateField("tiers", next);
    setDeleteTierIdx(null);
  };

  const handleMoveTier = (idx: number, dir: "up" | "down") => {
    const targetIdx = dir === "up" ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= tiers.length) return;
    const next = [...tiers];
    const [moved] = next.splice(idx, 1);
    next.splice(targetIdx, 0, moved);
    updateField("tiers", next);
  };

  const handleTierFieldChange = (tierIdx: number, field: string, val: any) => {
    const next = [...tiers];
    next[tierIdx] = {
      ...next[tierIdx],
      [field]: val,
    };
    updateField("tiers", next);
  };

  // Feature operations inside a tier
  const handleAddFeature = (tierIdx: number) => {
    const next = [...tiers];
    const tier = next[tierIdx];
    const features = [...(tier.features || []), { text: "Tính năng mới" }];
    next[tierIdx] = { ...tier, features };
    updateField("tiers", next);
  };

  const handleDeleteFeature = (tierIdx: number, featIdx: number) => {
    const next = [...tiers];
    const tier = next[tierIdx];
    const features = (tier.features || []).filter((_, i) => i !== featIdx);
    next[tierIdx] = { ...tier, features };
    updateField("tiers", next);
  };

  const handleMoveFeature = (tierIdx: number, featIdx: number, dir: "up" | "down") => {
    const next = [...tiers];
    const tier = next[tierIdx];
    const features = [...(tier.features || [])];
    const targetIdx = dir === "up" ? featIdx - 1 : featIdx + 1;
    if (targetIdx < 0 || targetIdx >= features.length) return;
    const [moved] = features.splice(featIdx, 1);
    features.splice(targetIdx, 0, moved);
    next[tierIdx] = { ...tier, features };
    updateField("tiers", next);
  };

  const handleFeatureChange = (
    tierIdx: number,
    featIdx: number,
    field: "text" | "na",
    val: any
  ) => {
    const next = [...tiers];
    const tier = next[tierIdx];
    const features = [...(tier.features || [])];
    features[featIdx] = {
      ...features[featIdx],
      [field]: val,
    };
    next[tierIdx] = { ...tier, features };
    updateField("tiers", next);
  };

  const handleResetToTheme = () => {
    onChange({
      ...pricing,
      customColors: false,
      kickerColor: "#2dd4bf",
      titleColor: "#eef2fb",
      descColor: "#9aa6c4",
      bgColor: "#070b16",
      cardBgColor: "#0d1424",
      popularBorderColor: "#2dd4bf",
      checkColor: "#2dd4bf",
    });
  };

  return (
    <Box>
      {/* Header Fields */}
      <FieldInput
        field={{ key: "kicker", path: "pricing.kicker", label: "Dòng nhãn", type: "text", max: 60, required: true }}
        value={pricing.kicker}
        onChange={(val) => updateField("kicker", val)}
      />

      <FieldInput
        field={{ key: "title", path: "pricing.title", label: "Tiêu đề", type: "text", max: 120, required: true }}
        value={pricing.title}
        onChange={(val) => updateField("title", val)}
      />

      <FieldInput
        field={{ key: "desc", path: "pricing.desc", label: "Mô tả", type: "textarea", max: 400 }}
        value={pricing.desc}
        onChange={(val) => updateField("desc", val)}
      />

      <Divider sx={{ my: 2.5 }} />

      {/* TÙY BIẾN MÀU SẮC RIÊNG CHO KHỐI BẢNG GIÁ */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: "13.5px" }}>
            Tùy chỉnh màu sắc riêng cho Bảng giá
          </Typography>
          <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>
            {pricing.customColors ? "Đang áp dụng bộ màu riêng cho Bảng giá" : "Đang kế thừa tự động theo Màu Toàn Trang"}
          </Typography>
        </Box>
        <FormControlLabel
          control={
            <Switch
              checked={Boolean(pricing.customColors)}
              onChange={(e) => updateField("customColors", e.target.checked)}
              color="primary"
              size="small"
            />
          }
          label=""
          sx={{ mr: -1 }}
        />
      </Box>

      {pricing.customColors ? (
        <Box sx={{ bgcolor: "background.default", p: 1.5, borderRadius: "10px", border: "1px solid", borderColor: "divider", mb: 2.5 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: "primary.main", letterSpacing: "0.05em" }}>
              BẢNG MÀU ĐỘC BẢN BẢNG GIÁ
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
            value={pricing.kickerColor || "#2dd4bf"}
            onChange={(val) => updateField("kickerColor", val)}
          />
          <ColorInput
            label="Màu chữ tiêu đề & Tên gói"
            value={pricing.titleColor || "#eef2fb"}
            onChange={(val) => updateField("titleColor", val)}
          />
          <ColorInput
            label="Màu chữ mô tả & Phụ đề gói"
            value={pricing.descColor || "#9aa6c4"}
            onChange={(val) => updateField("descColor", val)}
          />
          <ColorInput
            label="Màu nền khối Bảng giá"
            value={pricing.bgColor || "#070b16"}
            onChange={(val) => updateField("bgColor", val)}
          />
          <ColorInput
            label="Màu nền thẻ bảng giá"
            value={pricing.cardBgColor || "#0d1424"}
            onChange={(val) => updateField("cardBgColor", val)}
          />
          <ColorInput
            label="Màu viền & Huy hiệu Gói phổ biến"
            value={pricing.popularBorderColor || "#2dd4bf"}
            onChange={(val) => updateField("popularBorderColor", val)}
          />
          <ColorInput
            label="Màu dấu tích tính năng (✓)"
            value={pricing.checkColor || "#2dd4bf"}
            onChange={(val) => updateField("checkColor", val)}
          />
        </Box>
      ) : (
        <Alert severity="info" sx={{ mb: 2.5, py: 0.5, fontSize: "12px", borderRadius: "8px" }}>
          Khối Bảng giá đang tự động kế thừa bảng màu chung. Khi bạn đổi Bảng màu toàn trang, khối này sẽ tự động đổi màu đồng bộ.
        </Alert>
      )}

      <Divider sx={{ my: 2.5 }} />

      {/* Danh sách các gói */}
      <Typography variant="body2" sx={{ fontWeight: 600, fontSize: "13px", mt: 1, mb: 1.5 }}>
        Các gói bảng giá ({tiers.length}/6)
      </Typography>


      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, mb: 2 }}>
        {tiers.map((tier, tierIdx) => {
          const features = tier.features || [];

          return (
            <Accordion
              key={tierIdx}
              defaultExpanded={tierIdx === 0}
              disableGutters
              elevation={0}
              sx={{
                border: "1px solid",
                borderColor: "divider",
                borderRadius: "10px !important",
                overflow: "hidden",
                bgcolor: "background.paper",
                "&:before": { display: "none" },
              }}
            >
              <AccordionSummary
                component="div"
                expandIcon={<IconChevronDown size={18} />}
                sx={{
                  px: 1.5,
                  minHeight: 44,
                  cursor: "pointer",
                  "& .MuiAccordionSummary-content": {
                    my: 0.75,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    mr: 1,
                  },
                }}
              >

                <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: "13.5px" }}>
                  {tier.name || "Gói"} ({tier.price || "Giá"})
                </Typography>

                <Box sx={{ display: "flex", alignItems: "center", gap: 0.25 }}>
                  <IconButton
                    size="small"
                    disabled={tierIdx === 0}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMoveTier(tierIdx, "up");
                    }}
                    sx={{ p: 0.25 }}
                  >
                    <IconArrowUp size={14} />
                  </IconButton>

                  <IconButton
                    size="small"
                    disabled={tierIdx === tiers.length - 1}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMoveTier(tierIdx, "down");
                    }}
                    sx={{ p: 0.25 }}
                  >
                    <IconArrowDown size={14} />
                  </IconButton>

                  {tiers.length > 1 && (
                    <IconButton
                      size="small"
                      color="error"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteTierIdx(tierIdx);
                      }}
                      sx={{ p: 0.5, ml: 0.5 }}
                    >
                      <IconTrash size={16} />
                    </IconButton>
                  )}
                </Box>
              </AccordionSummary>

              <AccordionDetails
                sx={{
                  p: 2,
                  pt: 1.5,
                  borderTop: "1px solid",
                  borderColor: "divider",
                  bgcolor: "background.default",
                }}
              >
                {/* Nhãn phụ trên cùng */}
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                    <Typography variant="caption" sx={{ fontWeight: 600 }}>
                      Nhãn phụ trên cùng *
                    </Typography>
                    <Typography variant="caption" sx={{ color: "text.secondary" }}>
                      {(tier.label || "").length}/30
                    </Typography>
                  </Box>
                  <TextField
                    size="small"
                    fullWidth
                    value={tier.label || ""}
                    placeholder="Ví dụ: Khởi đầu, Mở rộng..."
                    onChange={(e) => handleTierFieldChange(tierIdx, "label", e.target.value)}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px", bgcolor: "background.paper", fontSize: "13px" } }}
                  />
                </Box>

                {/* Tên gói */}
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                    <Typography variant="caption" sx={{ fontWeight: 600 }}>
                      Tên gói *
                    </Typography>
                    <Typography variant="caption" sx={{ color: "text.secondary" }}>
                      {(tier.name || "").length}/40
                    </Typography>
                  </Box>
                  <TextField
                    size="small"
                    fullWidth
                    value={tier.name || ""}
                    placeholder="Ví dụ: Starter, Business..."
                    onChange={(e) => handleTierFieldChange(tierIdx, "name", e.target.value)}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px", bgcolor: "background.paper", fontSize: "13px" } }}
                  />
                </Box>

                {/* Mức giá hiển thị */}
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                    <Typography variant="caption" sx={{ fontWeight: 600 }}>
                      Mức giá hiển thị *
                    </Typography>
                    <Typography variant="caption" sx={{ color: "text.secondary" }}>
                      {(tier.price || "").length}/30
                    </Typography>
                  </Box>
                  <TextField
                    size="small"
                    fullWidth
                    value={tier.price || ""}
                    placeholder="Ví dụ: Liên hệ, 499.000đ/tháng..."
                    onChange={(e) => handleTierFieldChange(tierIdx, "price", e.target.value)}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px", bgcolor: "background.paper", fontSize: "13px" } }}
                  />
                </Box>

                {/* Mô tả ngắn đối tượng */}
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                    <Typography variant="caption" sx={{ fontWeight: 600 }}>
                      Mô tả ngắn đối tượng *
                    </Typography>
                    <Typography variant="caption" sx={{ color: "text.secondary" }}>
                      {(tier.sub || "").length}/100
                    </Typography>
                  </Box>
                  <TextField
                    size="small"
                    fullWidth
                    value={tier.sub || ""}
                    placeholder="Ví dụ: Phù hợp SME dưới 20 người dùng..."
                    onChange={(e) => handleTierFieldChange(tierIdx, "sub", e.target.value)}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px", bgcolor: "background.paper", fontSize: "13px" } }}
                  />
                </Box>

                {/* Gói nổi bật */}
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>
                    Gói nổi bật (Huy hiệu &ldquo;Phổ biến nhất&rdquo;)
                  </Typography>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={Boolean(tier.popular)}
                        onChange={(e) => handleTierFieldChange(tierIdx, "popular", e.target.checked)}
                        color="primary"
                        size="small"
                      />
                    }
                    label=""
                    sx={{ mr: -1 }}
                  />
                </Box>

                {/* Nhãn nút CTA */}
                <Box sx={{ mb: 2.5 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                    <Typography variant="caption" sx={{ fontWeight: 600 }}>
                      Nhãn nút CTA *
                    </Typography>
                    <Typography variant="caption" sx={{ color: "text.secondary" }}>
                      {(tier.cta || "").length}/30
                    </Typography>
                  </Box>
                  <TextField
                    size="small"
                    fullWidth
                    value={tier.cta || ""}
                    placeholder="Ví dụ: Đặt lịch demo →"
                    onChange={(e) => handleTierFieldChange(tierIdx, "cta", e.target.value)}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px", bgcolor: "background.paper", fontSize: "13px" } }}
                  />
                </Box>

                {/* DANH SÁCH TÍNH NĂNG (FEATURES) */}
                <Box sx={{ pt: 1, borderTop: "1px dashed", borderColor: "divider" }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: "0.05em", color: "text.secondary", mb: 1, display: "block" }}>
                    DANH SÁCH TÍNH NĂNG ({features.length})
                  </Typography>

                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mb: 1.25 }}>
                    {features.map((feat, featIdx) => (
                      <Paper
                        key={featIdx}
                        variant="outlined"
                        sx={{
                          p: 0.75,
                          px: 1,
                          borderRadius: "8px",
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          bgcolor: feat.na ? "action.disabledBackground" : "background.paper",
                          opacity: feat.na ? 0.7 : 1,
                          borderColor: "divider",
                        }}
                      >
                        <TextField
                          size="small"
                          fullWidth
                          variant="standard"
                          value={feat.text}
                          placeholder="Tên tính năng..."
                          onChange={(e) =>
                            handleFeatureChange(tierIdx, featIdx, "text", e.target.value)
                          }
                          InputProps={{
                            disableUnderline: true,
                            sx: {
                              fontSize: "13px",
                              textDecoration: feat.na ? "line-through" : "none",
                            },
                          }}
                        />

                        <Tooltip title={feat.na ? "Đang gạch ngang (Chưa có trong gói này)" : "Có trong gói (Tích để gạch ngang)"}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                size="small"
                                checked={Boolean(feat.na)}
                                onChange={(e) =>
                                  handleFeatureChange(tierIdx, featIdx, "na", e.target.checked)
                                }
                                sx={{ p: 0.25 }}
                              />
                            }
                            label={<Typography variant="caption" sx={{ fontSize: "11px", color: "text.secondary", whiteSpace: "nowrap" }}>N/A</Typography>}
                            sx={{ m: 0 }}
                          />
                        </Tooltip>

                        <IconButton
                          size="small"
                          disabled={featIdx === 0}
                          onClick={() => handleMoveFeature(tierIdx, featIdx, "up")}
                          sx={{ p: 0.25 }}
                        >
                          <IconArrowUp size={14} />
                        </IconButton>

                        <IconButton
                          size="small"
                          disabled={featIdx === features.length - 1}
                          onClick={() => handleMoveFeature(tierIdx, featIdx, "down")}
                          sx={{ p: 0.25 }}
                        >
                          <IconArrowDown size={14} />
                        </IconButton>

                        {features.length > 1 && (
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteFeature(tierIdx, featIdx)}
                            sx={{ p: 0.25 }}
                          >
                            <IconTrash size={15} />
                          </IconButton>
                        )}
                      </Paper>
                    ))}
                  </Box>

                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<IconPlus size={14} />}
                    onClick={() => handleAddFeature(tierIdx)}
                    sx={{
                      borderRadius: "6px",
                      textTransform: "none",
                      fontSize: "12px",
                      fontWeight: 600,
                      borderStyle: "dashed",
                    }}
                  >
                    Thêm tính năng
                  </Button>
                </Box>
              </AccordionDetails>
            </Accordion>
          );
        })}
      </Box>

      {tiers.length < 6 && (
        <Button
          variant="outlined"
          fullWidth
          size="small"
          startIcon={<IconPlus size={15} />}
          onClick={handleAddTier}
          sx={{
            borderRadius: "8px",
            textTransform: "none",
            fontSize: "13px",
            fontWeight: 600,
            borderStyle: "dashed",
          }}
        >
          Thêm gói bảng giá
        </Button>
      )}

      {/* Dialog xác nhận xóa gói */}
      <Dialog open={deleteTierIdx !== null} onClose={() => setDeleteTierIdx(null)}>
        <DialogTitle sx={{ fontWeight: 600, fontSize: "16px" }}>Xác nhận xóa gói bảng giá</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ fontSize: "14px" }}>
            Bạn có chắc muốn xóa gói <b>&ldquo;{deleteTierIdx !== null ? tiers[deleteTierIdx]?.name : ""}&rdquo;</b> khỏi bảng giá?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteTierIdx(null)} sx={{ textTransform: "none" }}>
            Hủy
          </Button>
          <Button onClick={handleConfirmDeleteTier} color="error" variant="contained" sx={{ textTransform: "none" }}>
            Xóa
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
