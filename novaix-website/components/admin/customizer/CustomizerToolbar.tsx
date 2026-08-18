"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import {
  IconArrowBackUp,
  IconDeviceDesktop,
  IconDeviceFloppy,
  IconDeviceMobile,
  IconX,
} from "@tabler/icons-react";
import { useRouter } from "next/navigation";

export default function CustomizerToolbar({
  device,
  onDeviceChange,
  isDirty,
  isDraftRestored,
  onRevertAll,
  onSave,
  isSaving,
  onClose,
}: {
  device: "desktop" | "mobile";
  onDeviceChange: (device: "desktop" | "mobile") => void;
  isDirty: boolean;
  isDraftRestored: boolean;
  onRevertAll: () => void;
  onSave: () => void;
  isSaving: boolean;
  onClose: () => void;
}) {
  const router = useRouter();

  return (
    <Box
      sx={{
        height: 60,
        px: 2,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        bgcolor: "background.paper",
        borderBottom: "1px solid",
        borderColor: "divider",
        zIndex: 10,
      }}
    >
      {/* Left side */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <Tooltip title="Đóng trình chỉnh sửa">
          <IconButton
            onClick={() => router.push("/admin")}
            size="small"
            sx={{ color: "text.secondary" }}
          >
            <IconX size={20} />
          </IconButton>
        </Tooltip>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography sx={{ fontSize: "18px" }}>🎨</Typography>
          <Typography
            variant="subtitle1"
            sx={{ fontWeight: 700, fontSize: "15px", color: "text.primary" }}
          >
            Giao diện trang chủ
          </Typography>
        </Box>

        {/* Device Switcher */}
        <ToggleButtonGroup
          value={device}
          exclusive
          onChange={(_, val) => {
            if (val) onDeviceChange(val);
          }}
          size="small"
          sx={{
            ml: 1,
            height: 32,
            bgcolor: "background.default",
            "& .MuiToggleButton-root": {
              px: 1.5,
              py: 0.5,
              border: "1px solid",
              borderColor: "divider",
              textTransform: "none",
              fontSize: "12.5px",
              fontWeight: 600,
              gap: 0.5,
              "&.Mui-selected": {
                bgcolor: "background.paper",
                color: "primary.main",
                boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
              },
            },
          }}
        >
          <ToggleButton value="desktop">
            <IconDeviceDesktop size={16} />
            <Box
              component="span"
              sx={{ display: { xs: "none", sm: "inline" } }}
            >
              Desktop
            </Box>
          </ToggleButton>
          <ToggleButton value="mobile">
            <IconDeviceMobile size={16} />
            <Box
              component="span"
              sx={{ display: { xs: "none", sm: "inline" } }}
            >
              Mobile
            </Box>
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Middle status */}
      <Box sx={{ display: { xs: "none", md: "flex" }, alignItems: "center" }}>
        {isDirty ? (
          <Chip
            label="● Chưa lưu"
            size="small"
            sx={{
              bgcolor: "warning.light",
              color: "warning.dark",
              fontWeight: 600,
              fontSize: "12px",
            }}
          />
        ) : isDraftRestored ? (
          <Chip
            label="⚡ Đã khôi phục bản nháp"
            size="small"
            sx={{
              bgcolor: "info.light",
              color: "info.dark",
              fontWeight: 600,
              fontSize: "12px",
            }}
          />
        ) : (
          <Chip
            label="✓ Đã lưu"
            size="small"
            sx={{
              bgcolor: "action.hover",
              color: "text.secondary",
              fontWeight: 600,
              fontSize: "12px",
            }}
          />
        )}
      </Box>

      {/* Right side actions */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        {/* Nút Hoàn tác duy nhất: Khôi phục tất cả thao tác về ban đầu */}
        <Tooltip title="Hoàn tác toàn bộ thay đổi về trạng thái ban đầu">
          <span>
            <Button
              variant="outlined"
              size="small"
              disabled={!isDirty}
              startIcon={<IconArrowBackUp size={16} />}
              onClick={onRevertAll}
              sx={{
                textTransform: "none",
                fontSize: "13px",
                fontWeight: 600,
                borderRadius: "8px",
                borderColor: "divider",
                color: "text.primary",
                px: 1.5,
              }}
            >
              Hoàn tác
            </Button>
          </span>
        </Tooltip>

        {/* Nút Lưu & áp dụng */}
        <Button
          variant="contained"
          size="small"
          disabled={isSaving || !isDirty}
          startIcon={
            isSaving ? (
              <CircularProgress size={16} color="inherit" />
            ) : (
              <IconDeviceFloppy size={18} />
            )
          }
          onClick={onSave}
          sx={{
            bgcolor: "#0d9488",
            "&:hover": { bgcolor: "#0f766e" },
            color: "#ffffff",
            textTransform: "none",
            fontSize: "13.5px",
            fontWeight: 700,
            borderRadius: "8px",
            px: 2,
            py: 0.75,
            boxShadow: "0 2px 8px rgba(13,148,136,0.3)",
          }}
        >
          {isSaving ? "Đang lưu..." : "Lưu & áp dụng"}
        </Button>
      </Box>
    </Box>
  );
}
