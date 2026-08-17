"use client";

import { useState } from "react";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import IconButton from "@mui/material/IconButton";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Select from "@mui/material/Select";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import {
  IconArrowDown,
  IconArrowUp,
  IconChevronDown,
  IconPlus,
  IconTrash,
} from "@tabler/icons-react";
import FieldInput from "./FieldInput";
import type { CTAContent } from "@/lib/site-content/schema";

export default function CTASection({
  cta,
  onChange,
}: {
  cta: CTAContent;
  onChange: (newCTA: CTAContent) => void;
}) {
  const contacts = cta.contacts || [];
  const commitments = cta.commitments || [];
  const formFields = cta.formFields || [];

  const updateField = <K extends keyof CTAContent>(key: K, val: CTAContent[K]) => {
    onChange({
      ...cta,
      [key]: val,
    });
  };

  // Contacts handlers
  const handleAddContact = () => {
    const next = [
      ...contacts,
      { icon: "📍", label: "Liên hệ mới", value: "Địa chỉ hoặc Hotline" },
    ];
    updateField("contacts", next);
  };

  const handleDeleteContact = (idx: number) => {
    const next = contacts.filter((_, i) => i !== idx);
    updateField("contacts", next);
  };

  const handleContactChange = (idx: number, field: "icon" | "label" | "value", val: string) => {
    const next = [...contacts];
    next[idx] = { ...next[idx], [field]: val };
    updateField("contacts", next);
  };

  // Commitments handlers
  const handleAddCommitment = () => {
    const next = [...commitments, "Cam kết mới..."];
    updateField("commitments", next);
  };

  const handleDeleteCommitment = (idx: number) => {
    const next = commitments.filter((_, i) => i !== idx);
    updateField("commitments", next);
  };

  const handleMoveCommitment = (idx: number, dir: "up" | "down") => {
    const targetIdx = dir === "up" ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= commitments.length) return;
    const next = [...commitments];
    const [moved] = next.splice(idx, 1);
    next.splice(targetIdx, 0, moved);
    updateField("commitments", next);
  };

  const handleCommitmentChange = (idx: number, val: string) => {
    const next = [...commitments];
    next[idx] = val;
    updateField("commitments", next);
  };

  // Form Fields handlers
  const handleAddFormField = () => {
    const next = [
      ...formFields,
      {
        id: Math.random().toString(36).substring(2, 9),
        label: "Ô nhập mới",
        type: "text" as const,
        placeholder: "Nhập thông tin...",
        required: false,
        width: "full" as const,
        options: [],
      },
    ];
    updateField("formFields", next);
  };

  const handleDeleteFormField = (idx: number) => {
    const next = formFields.filter((_, i) => i !== idx);
    updateField("formFields", next);
  };

  const handleMoveFormField = (idx: number, dir: "up" | "down") => {
    const targetIdx = dir === "up" ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= formFields.length) return;
    const next = [...formFields];
    const [moved] = next.splice(idx, 1);
    next.splice(targetIdx, 0, moved);
    updateField("formFields", next);
  };

  const handleFormFieldChange = (idx: number, field: string, val: any) => {
    const next = [...formFields];
    next[idx] = { ...next[idx], [field]: val };
    updateField("formFields", next);
  };

  return (
    <Box>
      {/* Thông tin phần Liên hệ */}
      <FieldInput
        field={{ key: "kicker", path: "cta.kicker", label: "Dòng nhãn", type: "text", max: 60, required: true }}
        value={cta.kicker}
        onChange={(val) => updateField("kicker", val)}
      />

      <FieldInput
        field={{ key: "title", path: "cta.title", label: "Tiêu đề", type: "text", max: 120, required: true }}
        value={cta.title}
        onChange={(val) => updateField("title", val)}
      />

      <FieldInput
        field={{ key: "desc", path: "cta.desc", label: "Mô tả", type: "textarea", max: 350, required: true }}
        value={cta.desc}
        onChange={(val) => updateField("desc", val)}
      />

      {/* DANH SÁCH LIÊN HỆ */}
      <Typography variant="body2" sx={{ fontWeight: 600, fontSize: "13px", mt: 2.5, mb: 1.5 }}>
        Thông tin liên hệ ({contacts.length}/8)
      </Typography>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, mb: 1.5 }}>
        {contacts.map((c, idx) => (
          <Paper
            key={idx}
            variant="outlined"
            sx={{
              p: 1.5,
              borderRadius: "8px",
              display: "flex",
              flexDirection: "column",
              gap: 1,
              bgcolor: "background.paper",
            }}
          >
            <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
              <TextField
                size="small"
                value={c.icon}
                placeholder="Icon"
                onChange={(e) => handleContactChange(idx, "icon", e.target.value)}
                sx={{ width: 60, "& .MuiOutlinedInput-root": { borderRadius: "6px" } }}
              />
              <TextField
                size="small"
                fullWidth
                value={c.label}
                placeholder="Nhãn (Địa chỉ, Email...)"
                onChange={(e) => handleContactChange(idx, "label", e.target.value)}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: "6px" } }}
              />
              {contacts.length > 1 && (
                <IconButton size="small" color="error" onClick={() => handleDeleteContact(idx)}>
                  <IconTrash size={16} />
                </IconButton>
              )}
            </Box>
            <TextField
              size="small"
              fullWidth
              value={c.value}
              placeholder="Giá trị hiển thị..."
              onChange={(e) => handleContactChange(idx, "value", e.target.value)}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: "6px" } }}
            />
          </Paper>
        ))}
      </Box>

      {contacts.length < 8 && (
        <Button
          variant="outlined"
          size="small"
          startIcon={<IconPlus size={14} />}
          onClick={handleAddContact}
          sx={{ mb: 3, borderRadius: "6px", textTransform: "none", fontSize: "12px", borderStyle: "dashed" }}
        >
          Thêm thông tin liên hệ
        </Button>
      )}

      <Divider sx={{ my: 2.5 }} />

      {/* KHỐI CAM KẾT */}
      <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: "14px", mb: 1.5, color: "primary.main" }}>
        Khối Cam kết với chúng tôi
      </Typography>

      <FieldInput
        field={{
          key: "commitmentsTitle",
          path: "cta.commitmentsTitle",
          label: "Tiêu đề khối cam kết",
          type: "text",
          max: 60,
          required: true,
        }}
        value={cta.commitmentsTitle}
        onChange={(val) => updateField("commitmentsTitle", val)}
      />

      <Typography variant="body2" sx={{ fontWeight: 600, fontSize: "13px", mt: 2, mb: 1 }}>
        Danh sách các cam kết ({commitments.length})
      </Typography>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mb: 1.5 }}>
        {commitments.map((cmt, idx) => (
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
              value={cmt}
              placeholder="Nhập nội dung cam kết..."
              onChange={(e) => handleCommitmentChange(idx, e.target.value)}
              InputProps={{ disableUnderline: true, sx: { fontSize: "13px" } }}
            />

            <IconButton
              size="small"
              disabled={idx === 0}
              onClick={() => handleMoveCommitment(idx, "up")}
              sx={{ p: 0.25 }}
            >
              <IconArrowUp size={14} />
            </IconButton>

            <IconButton
              size="small"
              disabled={idx === commitments.length - 1}
              onClick={() => handleMoveCommitment(idx, "down")}
              sx={{ p: 0.25 }}
            >
              <IconArrowDown size={14} />
            </IconButton>

            {commitments.length > 1 && (
              <IconButton size="small" color="error" onClick={() => handleDeleteCommitment(idx)}>
                <IconTrash size={15} />
              </IconButton>
            )}
          </Paper>
        ))}
      </Box>

      {commitments.length < 10 && (
        <Button
          variant="outlined"
          size="small"
          startIcon={<IconPlus size={14} />}
          onClick={handleAddCommitment}
          sx={{ mb: 3, borderRadius: "6px", textTransform: "none", fontSize: "12px", borderStyle: "dashed" }}
        >
          Thêm cam kết
        </Button>
      )}

      <Divider sx={{ my: 2.5 }} />

      {/* FORM ĐĂNG KÝ & CÁC Ô INPUT */}
      <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: "14px", mb: 1.5, color: "primary.main" }}>
        Cấu hình Form đăng ký & Các ô Input
      </Typography>

      <FieldInput
        field={{ key: "formTitle", path: "cta.formTitle", label: "Tiêu đề form", type: "text", max: 60, required: true }}
        value={cta.formTitle}
        onChange={(val) => updateField("formTitle", val)}
      />

      <FieldInput
        field={{ key: "buttonText", path: "cta.buttonText", label: "Nhãn nút gửi form", type: "text", max: 40, required: true }}
        value={cta.buttonText}
        onChange={(val) => updateField("buttonText", val)}
      />

      <FieldInput
        field={{ key: "formSuccessTitle", path: "cta.formSuccessTitle", label: "Tiêu đề gửi thành công", type: "text", max: 60, required: true }}
        value={cta.formSuccessTitle}
        onChange={(val) => updateField("formSuccessTitle", val)}
      />

      <FieldInput
        field={{ key: "formSuccessDesc", path: "cta.formSuccessDesc", label: "Mô tả gửi thành công", type: "textarea", max: 200, required: true }}
        value={cta.formSuccessDesc}
        onChange={(val) => updateField("formSuccessDesc", val)}
      />

      {/* DANH SÁCH CÁC Ô INPUT TRONG FORM */}
      <Typography variant="body2" sx={{ fontWeight: 600, fontSize: "13px", mt: 2.5, mb: 1.5 }}>
        Danh sách các ô input trong form ({formFields.length})
      </Typography>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, mb: 2 }}>
        {formFields.map((fld, idx) => (
          <Accordion
            key={fld.id || idx}
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
                {fld.label || "Ô input"} {fld.required && <span style={{ color: "#ef4444" }}>*</span>} ({fld.type})
              </Typography>

              <Box sx={{ display: "flex", alignItems: "center", gap: 0.25 }}>
                <IconButton
                  size="small"
                  disabled={idx === 0}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMoveFormField(idx, "up");
                  }}
                  sx={{ p: 0.25 }}
                >
                  <IconArrowUp size={14} />
                </IconButton>

                <IconButton
                  size="small"
                  disabled={idx === formFields.length - 1}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMoveFormField(idx, "down");
                  }}
                  sx={{ p: 0.25 }}
                >
                  <IconArrowDown size={14} />
                </IconButton>

                {formFields.length > 1 && (
                  <IconButton
                    size="small"
                    color="error"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteFormField(idx);
                    }}
                    sx={{ p: 0.5 }}
                  >
                    <IconTrash size={15} />
                  </IconButton>
                )}
              </Box>
            </AccordionSummary>

            <AccordionDetails sx={{ p: 2, pt: 1.5, borderTop: "1px solid", borderColor: "divider", bgcolor: "background.default" }}>
              <Box sx={{ mb: 1.5 }}>
                <Typography variant="caption" sx={{ fontWeight: 600, mb: 0.5, display: "block" }}>
                  Tên nhãn hiển thị *
                </Typography>
                <TextField
                  size="small"
                  fullWidth
                  value={fld.label}
                  onChange={(e) => handleFormFieldChange(idx, "label", e.target.value)}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: "6px", bgcolor: "background.paper", fontSize: "13px" } }}
                />
              </Box>

              <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5, mb: 1.5 }}>
                <FormControl size="small" fullWidth>
                  <InputLabel sx={{ fontSize: "13px" }}>Kiểu ô nhập</InputLabel>
                  <Select
                    value={fld.type || "text"}
                    label="Kiểu ô nhập"
                    onChange={(e) => handleFormFieldChange(idx, "type", e.target.value)}
                    sx={{ borderRadius: "6px", bgcolor: "background.paper", fontSize: "13px" }}
                  >
                    <MenuItem value="text">Văn bản ngắn (text)</MenuItem>
                    <MenuItem value="tel">Số điện thoại (tel)</MenuItem>
                    <MenuItem value="email">Email</MenuItem>
                    <MenuItem value="select">Hộp chọn (select)</MenuItem>
                    <MenuItem value="textarea">Đoạn văn (textarea)</MenuItem>
                  </Select>
                </FormControl>

                <FormControl size="small" fullWidth>
                  <InputLabel sx={{ fontSize: "13px" }}>Chiều rộng</InputLabel>
                  <Select
                    value={fld.width || "full"}
                    label="Chiều rộng"
                    onChange={(e) => handleFormFieldChange(idx, "width", e.target.value)}
                    sx={{ borderRadius: "6px", bgcolor: "background.paper", fontSize: "13px" }}
                  >
                    <MenuItem value="half">Nửa dòng (50%)</MenuItem>
                    <MenuItem value="full">Cả dòng (100%)</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              <Box sx={{ mb: 1.5 }}>
                <Typography variant="caption" sx={{ fontWeight: 600, mb: 0.5, display: "block" }}>
                  Gợi ý placeholder
                </Typography>
                <TextField
                  size="small"
                  fullWidth
                  value={fld.placeholder || ""}
                  onChange={(e) => handleFormFieldChange(idx, "placeholder", e.target.value)}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: "6px", bgcolor: "background.paper", fontSize: "13px" } }}
                />
              </Box>

              {/* Nếu là kiểu select -> cho phép nhập các option cách nhau bằng dấu phẩy */}
              {fld.type === "select" && (
                <Box sx={{ mb: 1.5 }}>
                  <Typography variant="caption" sx={{ fontWeight: 600, mb: 0.5, display: "block" }}>
                    Các tùy chọn (cách nhau bởi dấu phẩy ,)
                  </Typography>
                  <TextField
                    size="small"
                    fullWidth
                    multiline
                    rows={2}
                    value={(fld.options || []).join(", ")}
                    placeholder="Tùy chọn 1, Tùy chọn 2, Tùy chọn 3..."
                    onChange={(e) => {
                      const opts = e.target.value.split(",").map((s) => s.trim()).filter(Boolean);
                      handleFormFieldChange(idx, "options", opts);
                    }}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: "6px", bgcolor: "background.paper", fontSize: "12.5px" } }}
                  />
                </Box>
              )}

              <FormControlLabel
                control={
                  <Switch
                    size="small"
                    checked={Boolean(fld.required)}
                    onChange={(e) => handleFormFieldChange(idx, "required", e.target.checked)}
                    color="primary"
                  />
                }
                label={<Typography variant="caption" sx={{ fontWeight: 600 }}>Bắt buộc nhập (*)</Typography>}
              />
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>

      {formFields.length < 20 && (
        <Button
          variant="outlined"
          fullWidth
          size="small"
          startIcon={<IconPlus size={15} />}
          onClick={handleAddFormField}
          sx={{
            borderRadius: "8px",
            textTransform: "none",
            fontSize: "13px",
            fontWeight: 600,
            borderStyle: "dashed",
          }}
        >
          Thêm ô nhập liệu vào form
        </Button>
      )}
    </Box>
  );
}
