"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import {
  IconArrowDown,
  IconArrowUp,
  IconEye,
  IconEyeOff,
  IconPlus,
  IconTrash,
} from "@tabler/icons-react";
import type { NavContent } from "@/lib/site-content/schema";

export default function NavSection({
  nav,
  onChange,
}: {
  nav: NavContent;
  onChange: (newNav: NavContent) => void;
}) {
  const [deleteIdx, setDeleteIdx] = useState<number | null>(null);

  const items = nav.items || [];

  const handleMove = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;

    const next = [...items];
    const [moved] = next.splice(index, 1);
    next.splice(targetIndex, 0, moved);

    onChange({
      ...nav,
      items: next,
    });
  };

  const handleToggleVisible = (index: number) => {
    const next = [...items];
    const currentVis = next[index].visible !== false;
    next[index] = {
      ...next[index],
      visible: !currentVis,
    };
    onChange({
      ...nav,
      items: next,
    });
  };

  const handleLabelChange = (index: number, label: string) => {
    const next = [...items];
    next[index] = {
      ...next[index],
      label,
    };
    onChange({
      ...nav,
      items: next,
    });
  };

  const handleHrefChange = (index: number, href: string) => {
    const next = [...items];
    next[index] = {
      ...next[index],
      href,
    };
    onChange({
      ...nav,
      items: next,
    });
  };

  const handleAdd = () => {
    const next = [
      ...items,
      {
        label: "Mục mới",
        href: "#",
        visible: true,
      },
    ];
    onChange({
      ...nav,
      items: next,
    });
  };

  const handleConfirmDelete = () => {
    if (deleteIdx === null) return;
    const next = items.filter((_, i) => i !== deleteIdx);
    onChange({
      ...nav,
      items: next,
    });
    setDeleteIdx(null);
  };

  return (
    <Box>
      <Box sx={{ mb: 2 }}>
        <Typography
          variant="body2"
          sx={{ fontWeight: 600, fontSize: "13px", mb: 0.5 }}
        >
          Tên thương hiệu
        </Typography>
        <TextField
          size="small"
          fullWidth
          value={nav.brandName}
          onChange={(e) => onChange({ ...nav, brandName: e.target.value })}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: "8px",
              bgcolor: "background.paper",
              fontSize: "13.5px",
            },
          }}
        />
      </Box>

      <Box sx={{ mb: 2 }}>
        <Typography
          variant="body2"
          sx={{ fontWeight: 600, fontSize: "13px", mb: 0.5 }}
        >
          Nhãn nút CTA
        </Typography>
        <TextField
          size="small"
          fullWidth
          value={nav.ctaLabel}
          onChange={(e) => onChange({ ...nav, ctaLabel: e.target.value })}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: "8px",
              bgcolor: "background.paper",
              fontSize: "13.5px",
            },
          }}
        />
      </Box>

      <Typography
        variant="body2"
        sx={{ fontWeight: 600, fontSize: "13px", mb: 1.5, mt: 3 }}
      >
        Danh sách menu ngang (Điều chỉnh vị trí & Ẩn/Hiện)
      </Typography>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        {items.map((item, idx) => {
          const isVisible = item.visible !== false;

          return (
            <Paper
              key={idx}
              variant="outlined"
              sx={{
                p: 1,
                px: 1.5,
                borderRadius: "10px",
                display: "flex",
                alignItems: "center",
                gap: 1,
                bgcolor: isVisible
                  ? "background.paper"
                  : "action.disabledBackground",
                opacity: isVisible ? 1 : 0.6,
                borderColor: "divider",
                transition: "all 0.2s ease",
              }}
            >
              {/* Nút di chuyển lên / xuống */}
              <Box sx={{ display: "flex", flexDirection: "column" }}>
                <IconButton
                  size="small"
                  disabled={idx === 0}
                  onClick={() => handleMove(idx, "up")}
                  sx={{ p: 0.25 }}
                >
                  <IconArrowUp size={14} />
                </IconButton>
                <IconButton
                  size="small"
                  disabled={idx === items.length - 1}
                  onClick={() => handleMove(idx, "down")}
                  sx={{ p: 0.25 }}
                >
                  <IconArrowDown size={14} />
                </IconButton>
              </Box>

              {/* Tên nhãn menu */}
              <Box
                sx={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  gap: 0.5,
                }}
              >
                <TextField
                  size="small"
                  variant="standard"
                  value={item.label}
                  placeholder="Tên menu"
                  onChange={(e) => handleLabelChange(idx, e.target.value)}
                  InputProps={{
                    disableUnderline: true,
                    sx: { fontSize: "13.5px", fontWeight: 600 },
                  }}
                />
                <TextField
                  size="small"
                  variant="standard"
                  value={item.href}
                  placeholder="#lien-ket"
                  onChange={(e) => handleHrefChange(idx, e.target.value)}
                  InputProps={{
                    disableUnderline: true,
                    sx: { fontSize: "11.5px", color: "text.secondary" },
                  }}
                />
              </Box>

              {/* Nút bật/tắt hiển thị */}
              <Tooltip
                title={
                  isVisible ? "Đang hiện (Bấm để ẩn)" : "Đang ẩn (Bấm để hiện)"
                }
              >
                <IconButton
                  size="small"
                  onClick={() => handleToggleVisible(idx)}
                  sx={{ color: isVisible ? "primary.main" : "text.disabled" }}
                >
                  {isVisible ? <IconEye size={18} /> : <IconEyeOff size={18} />}
                </IconButton>
              </Tooltip>

              {/* Nút xóa */}
              {items.length > 1 && (
                <Tooltip title="Xóa">
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => setDeleteIdx(idx)}
                    sx={{ p: 0.5 }}
                  >
                    <IconTrash size={16} />
                  </IconButton>
                </Tooltip>
              )}
            </Paper>
          );
        })}
      </Box>

      {items.length < 12 && (
        <Button
          variant="outlined"
          fullWidth
          size="small"
          startIcon={<IconPlus size={16} />}
          onClick={handleAdd}
          sx={{
            mt: 1.5,
            borderRadius: "8px",
            textTransform: "none",
            fontWeight: 600,
            fontSize: "13px",
            borderStyle: "dashed",
          }}
        >
          Thêm mục menu
        </Button>
      )}

      {/* Dialog xác nhận xóa */}
      <Dialog open={deleteIdx !== null} onClose={() => setDeleteIdx(null)}>
        <DialogTitle sx={{ fontWeight: 600, fontSize: "16px" }}>
          Xác nhận xóa
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ fontSize: "14px" }}>
            Bạn có chắc muốn xóa mục menu{" "}
            <b>
              &ldquo;{deleteIdx !== null ? items[deleteIdx]?.label : ""}&rdquo;
            </b>
            ?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setDeleteIdx(null)}
            sx={{ textTransform: "none" }}
          >
            Hủy
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
            sx={{ textTransform: "none" }}
          >
            Xóa
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
