"use client";

import { useRef, useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import LinearProgress from "@mui/material/LinearProgress";
import Typography from "@mui/material/Typography";
import { IconPhotoUp, IconTrash } from "@tabler/icons-react";
import { uploadImage } from "@/lib/media/image-actions";

/** Nền ca-rô để nhìn ra vùng trong suốt của logo PNG. */
const CHECKERBOARD =
  "linear-gradient(45deg, #e8ecf2 25%, transparent 25%), " +
  "linear-gradient(-45deg, #e8ecf2 25%, transparent 25%), " +
  "linear-gradient(45deg, transparent 75%, #e8ecf2 75%), " +
  "linear-gradient(-45deg, transparent 75%, #e8ecf2 75%)";

export default function ImageInput({
  label,
  value,
  onChange,
  folder,
  maxSizeMB = 2,
  hint,
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
  folder: "blog" | "partners";
  maxSizeMB?: number;
  hint?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setError(null);

    // Kiểm ở client trước: không để người dùng chờ tải xong 10 MB rồi mới bị từ chối.
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`Dung lượng ảnh vượt quá giới hạn ${maxSizeMB} MB.`);
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.set("file", file);
      formData.set("folder", folder);

      const res = await uploadImage(formData);
      if (res.ok) {
        onChange(res.data.url);
      } else {
        setError(res.error);
      }
    } catch {
      setError("Không kết nối được máy chủ. Vui lòng thử lại.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="body2" sx={{ fontWeight: 600, fontSize: "13px", mb: 0.75 }}>
        {label}
      </Typography>

      {value ? (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            p: 1.25,
            border: "1px solid",
            borderColor: "divider",
            borderRadius: "10px",
            bgcolor: "background.paper",
          }}
        >
          <Box
            sx={{
              width: 84,
              height: 52,
              flexShrink: 0,
              borderRadius: "8px",
              border: "1px solid",
              borderColor: "divider",
              backgroundImage: CHECKERBOARD,
              backgroundSize: "12px 12px",
              backgroundPosition: "0 0, 0 6px, 6px -6px, -6px 0px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value}
              alt="Xem trước"
              style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
            />
          </Box>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
            <Button size="small" onClick={() => inputRef.current?.click()} disabled={uploading}>
              Đổi ảnh
            </Button>
            <Button
              size="small"
              color="error"
              startIcon={<IconTrash size={15} />}
              onClick={() => onChange("")}
              disabled={uploading}
            >
              Gỡ ảnh
            </Button>
          </Box>
        </Box>
      ) : (
        <Box
          onClick={() => !uploading && inputRef.current?.click()}
          sx={{
            border: "1.5px dashed",
            borderColor: "divider",
            borderRadius: "10px",
            p: 2,
            textAlign: "center",
            cursor: uploading ? "default" : "pointer",
            bgcolor: "background.paper",
            "&:hover": { borderColor: "primary.main" },
          }}
        >
          <IconPhotoUp size={22} style={{ opacity: 0.5 }} />
          <Typography variant="body2" sx={{ fontSize: "13px", mt: 0.5 }}>
            {uploading ? "Đang tải lên…" : "Chọn tệp ảnh"}
          </Typography>
          {hint && (
            <Typography variant="caption" sx={{ display: "block", color: "text.secondary", mt: 0.25 }}>
              {hint}
            </Typography>
          )}
        </Box>
      )}

      {uploading && <LinearProgress sx={{ mt: 1, borderRadius: 1 }} />}

      {error && (
        <Alert severity="error" sx={{ mt: 1, fontSize: "12.5px" }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        style={{ display: "none" }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
    </Box>
  );
}
