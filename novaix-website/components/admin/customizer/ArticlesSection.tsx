"use client";

import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import Typography from "@mui/material/Typography";
import { IconExternalLink, IconRotate } from "@tabler/icons-react";
import ColorInput from "./ColorInput";
import type { ArticlesContent } from "@/lib/site-content/schema";

export default function ArticlesSection({
  articles,
  onChange,
}: {
  articles: ArticlesContent;
  onChange: (newArticles: ArticlesContent) => void;
}) {
  const updateField = <K extends keyof ArticlesContent>(key: K, val: ArticlesContent[K]) => {
    onChange({
      ...articles,
      [key]: val,
    });
  };

  const handleResetToTheme = () => {
    onChange({
      ...articles,
      customColors: false,
      kickerColor: "#2dd4bf",
      titleColor: "#eef2fb",
      categoryBadgeColor: "#2dd4bf",
      categoryBadgeBg: "#0b1120",
      cardTitleColor: "#eef2fb",
      cardDescColor: "#9aa6c4",
      cardBgColor: "#0d1424",
      readMoreColor: "#2dd4bf",
      bgColor: "#030712",
    });
  };

  return (
    <Box>
      <Alert severity="info" sx={{ mb: 2.5, py: 0.75, fontSize: "12px", borderRadius: "8px" }}>
        Khối <b>Tin tức & Kiến thức</b> tự động tải danh sách bài viết từ chuyên mục Blog theo cấu hình Dải bài viết.
      </Alert>

      {/* Button to navigate to Article Rail management */}
      <Box sx={{ mb: 2.5 }}>
        <Button
          variant="outlined"
          fullWidth
          component="a"
          href="/admin/giao-dien/dai-bai-viet"
          target="_blank"
          rel="noopener noreferrer"
          endIcon={<IconExternalLink size={16} />}
          sx={{
            borderRadius: "8px",
            textTransform: "none",
            fontWeight: 600,
            fontSize: "13px",
            py: 1,
          }}
        >
          Quản lý Dải bài viết (Chọn bài & Danh mục)
        </Button>
      </Box>

      {/* Tùy chỉnh màu sắc riêng */}
      <Box
        sx={{
          p: 2,
          bgcolor: "background.paper",
          borderRadius: "10px",
          border: "1px solid",
          borderColor: articles.customColors ? "primary.main" : "divider",
          transition: "all 0.2s ease",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <FormControlLabel
            control={
              <Switch
                checked={Boolean(articles.customColors)}
                onChange={(e) => updateField("customColors", e.target.checked)}
                color="primary"
                size="small"
              />
            }
            label={
              <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: "13px" }}>
                Tùy chỉnh màu sắc riêng cho Tin tức & Kiến thức
              </Typography>
            }
            sx={{ m: 0 }}
          />

          {articles.customColors && (
            <Button
              size="small"
              startIcon={<IconRotate size={13} />}
              onClick={handleResetToTheme}
              sx={{ textTransform: "none", fontSize: "11px", py: 0.25 }}
            >
              Đồng bộ lại theo Toàn trang
            </Button>
          )}
        </Box>

        {articles.customColors && (
          <Box sx={{ mt: 2, pt: 2, borderTop: "1px solid", borderColor: "divider", display: "flex", flexDirection: "column", gap: 1.5 }}>
            <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "11px", display: "block", mb: 0.5 }}>
              Tùy chỉnh màu sắc chi tiết cho tiêu đề, nhãn danh mục, thẻ card và nút đọc tiếp của khối bài viết:
            </Typography>

            <ColorInput
              label="Màu nhãn trên (Kicker)"
              value={articles.kickerColor || "#2dd4bf"}
              onChange={(c) => updateField("kickerColor", c)}
            />

            <ColorInput
              label="Màu chữ tiêu đề dải (Title)"
              value={articles.titleColor || "#eef2fb"}
              onChange={(c) => updateField("titleColor", c)}
            />

            <Divider sx={{ my: 0.5 }} />

            <ColorInput
              label="Màu chữ nhãn danh mục (Category Text)"
              value={articles.categoryBadgeColor || "#2dd4bf"}
              onChange={(c) => updateField("categoryBadgeColor", c)}
            />

            <ColorInput
              label="Màu nền nhãn danh mục (Category Badge Bg)"
              value={articles.categoryBadgeBg || "#0b1120"}
              onChange={(c) => updateField("categoryBadgeBg", c)}
            />

            <Divider sx={{ my: 0.5 }} />

            <ColorInput
              label="Màu tiêu đề bài viết (Card Title)"
              value={articles.cardTitleColor || "#eef2fb"}
              onChange={(c) => updateField("cardTitleColor", c)}
            />

            <ColorInput
              label="Màu nội dung tóm tắt (Card Excerpt)"
              value={articles.cardDescColor || "#9aa6c4"}
              onChange={(c) => updateField("cardDescColor", c)}
            />

            <ColorInput
              label="Màu nền thẻ bài viết (Card Background)"
              value={articles.cardBgColor || "#0d1424"}
              onChange={(c) => updateField("cardBgColor", c)}
            />

            <ColorInput
              label="Màu nút & liên kết 'Đọc tiếp →'"
              value={articles.readMoreColor || "#2dd4bf"}
              onChange={(c) => updateField("readMoreColor", c)}
            />

            <Divider sx={{ my: 0.5 }} />

            <ColorInput
              label="Màu nền toàn khối (Section Background)"
              value={articles.bgColor || "#030712"}
              onChange={(c) => updateField("bgColor", c)}
            />
          </Box>
        )}
      </Box>
    </Box>
  );
}
