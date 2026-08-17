"use client";

import { useState, useTransition } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Checkbox from "@mui/material/Checkbox";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import FormControlLabel from "@mui/material/FormControlLabel";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Select from "@mui/material/Select";
import Snackbar from "@mui/material/Snackbar";
import Stack from "@mui/material/Stack";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { IconDeviceFloppy, IconLayoutList, IconSparkles } from "@tabler/icons-react";
import { saveHomeRailsConfig } from "@/lib/blog/rails-actions";
import type { RailConfig } from "@/lib/blog/rails-config";
import type { CategoryRow } from "@/lib/blog/category-queries";
import type { ArticleItemRow } from "@/lib/blog/article-actions";

export default function RailsEditor({
  initialRails,
  categories,
  articlesList,
}: {
  initialRails: RailConfig[];
  categories: CategoryRow[];
  articlesList: ArticleItemRow[];
}) {
  const [rails, setRails] = useState<RailConfig[]>(initialRails);
  const [pending, startTransition] = useTransition();
  const [toast, setToast] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleRailChange(index: number, fields: Partial<RailConfig>) {
    setRails((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], ...fields };
      return next;
    });
  }

  function handleSave() {
    setError(null);
    startTransition(async () => {
      const res = await saveHomeRailsConfig(rails);
      if (res.ok) {
        setToast("Đã lưu cấu hình dải bài viết trang chủ thành công!");
      } else {
        setError(res.error);
      }
    });
  }

  return (
    <Box sx={{ maxWidth: 900, mx: "auto" }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>
            Cấu hình Dải Bài viết Trang chủ
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Tùy chỉnh 2 dải bài viết nổi bật hiển thị trên trang chủ công khai (dành cho mục Kiến thức & Giới thiệu).
          </Typography>
        </Box>

        <Button
          variant="contained"
          size="medium"
          startIcon={<IconDeviceFloppy size={18} />}
          onClick={handleSave}
          disabled={pending}
          sx={{
            borderRadius: 2.5,
            px: 3,
            py: 1,
            bgcolor: "#2563eb",
            "&:hover": { bgcolor: "#1d4ed8" },
          }}
        >
          {pending ? "Đang lưu..." : "Lưu cấu hình"}
        </Button>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Stack spacing={3}>
        {rails.map((rail, idx) => (
          <Card key={rail.key || idx} variant="outlined" sx={{ borderRadius: 3, p: 3, bgcolor: "#ffffff" }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <IconLayoutList size={22} style={{ color: "#2563eb" }} />
                <Typography variant="h6" fontWeight={700}>
                  Dải bài viết #{idx + 1}: {rail.title || `Dải ${idx + 1}`}
                </Typography>
                <Chip
                  label={rail.visible ? "Đang hiện" : "Đã ẩn"}
                  color={rail.visible ? "success" : "default"}
                  size="small"
                  sx={{ borderRadius: 1.5 }}
                />
              </Stack>

              <FormControlLabel
                control={
                  <Switch
                    checked={rail.visible}
                    onChange={(e) => handleRailChange(idx, { visible: e.target.checked })}
                    color="primary"
                  />
                }
                label={rail.visible ? "Hiển thị" : "Ẩn dải này"}
              />
            </Stack>

            <Divider sx={{ my: 2 }} />

            <Stack spacing={2.5}>
              <Box>
                <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 0.75 }}>
                  Tiêu đề hiển thị dải bài viết
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  value={rail.title}
                  onChange={(e) => handleRailChange(idx, { title: e.target.value })}
                  placeholder="Nhập tiêu đề dải..."
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                />
              </Box>

              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 0.75 }}>
                    Nguồn bài viết
                  </Typography>
                  <Select
                    fullWidth
                    size="small"
                    value={rail.source}
                    onChange={(e) =>
                      handleRailChange(idx, { source: e.target.value as "category" | "manual" })
                    }
                    sx={{ borderRadius: 2 }}
                  >
                    <MenuItem value="category">Tự động theo Danh mục</MenuItem>
                    <MenuItem value="manual">Chọn bài viết thủ công</MenuItem>
                  </Select>
                </Box>

                <Box sx={{ width: { xs: "100%", sm: 180 } }}>
                  <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 0.75 }}>
                    Số bài tối đa
                  </Typography>
                  <Select
                    fullWidth
                    size="small"
                    value={rail.limit || 6}
                    onChange={(e) => handleRailChange(idx, { limit: Number(e.target.value) })}
                    sx={{ borderRadius: 2 }}
                  >
                    <MenuItem value={3}>3 bài</MenuItem>
                    <MenuItem value={6}>6 bài</MenuItem>
                    <MenuItem value={9}>9 bài</MenuItem>
                    <MenuItem value={12}>12 bài</MenuItem>
                  </Select>
                </Box>
              </Stack>

              {/* Lựa chọn theo Nguồn danh mục */}
              {rail.source === "category" && (
                <Box>
                  <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 0.75 }}>
                    Lọc theo danh mục (để trống = lấy tất cả danh mục mới nhất)
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2, maxHeight: 180, overflowY: "auto" }}>
                    {categories.map((cat) => {
                      const isChecked = rail.categoryIds.includes(cat.id);
                      return (
                        <FormControlLabel
                          key={cat.id}
                          control={
                            <Checkbox
                              size="small"
                              checked={isChecked}
                              onChange={(e) => {
                                const nextIds = e.target.checked
                                  ? [...rail.categoryIds, cat.id]
                                  : rail.categoryIds.filter((id) => id !== cat.id);
                                handleRailChange(idx, { categoryIds: nextIds });
                              }}
                            />
                          }
                          label={`${cat.name} (${cat.articleCount} bài)`}
                          sx={{ display: "block", my: 0.25 }}
                        />
                      );
                    })}
                  </Paper>
                </Box>
              )}

              {/* Lựa chọn bài thủ công */}
              {rail.source === "manual" && (
                <Box>
                  <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 0.75 }}>
                    Chọn các bài viết hiển thị (tối đa 12 bài)
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2, maxHeight: 220, overflowY: "auto" }}>
                    {articlesList.map((art) => {
                      const strId = String(art.id);
                      const isChecked = rail.articleIds.map(String).includes(strId);
                      return (
                        <FormControlLabel
                          key={art.id}
                          control={
                            <Checkbox
                              size="small"
                              checked={isChecked}
                              onChange={(e) => {
                                const nextIds = e.target.checked
                                  ? [...rail.articleIds, strId]
                                  : rail.articleIds.filter((id) => String(id) !== strId);
                                handleRailChange(idx, { articleIds: nextIds });
                              }}
                            />
                          }
                          label={
                            <Typography variant="body2">
                              <b>{art.title}</b> — <span style={{ opacity: 0.7 }}>[{art.categoryName}]</span>
                            </Typography>
                          }
                          sx={{ display: "block", my: 0.25 }}
                        />
                      );
                    })}
                  </Paper>
                </Box>
              )}
            </Stack>
          </Card>
        ))}
      </Stack>

      <Box sx={{ mt: 4, textAlign: "right" }}>
        <Button
          variant="contained"
          size="large"
          startIcon={<IconDeviceFloppy size={20} />}
          onClick={handleSave}
          disabled={pending}
          sx={{
            borderRadius: 2.5,
            px: 4,
            py: 1.25,
            bgcolor: "#2563eb",
            "&:hover": { bgcolor: "#1d4ed8" },
          }}
        >
          {pending ? "Đang lưu..." : "Lưu toàn bộ cấu hình dải bài viết"}
        </Button>
      </Box>

      <Snackbar
        open={Boolean(toast)}
        autoHideDuration={3000}
        onClose={() => setToast(null)}
        message={toast}
      />
    </Box>
  );
}
