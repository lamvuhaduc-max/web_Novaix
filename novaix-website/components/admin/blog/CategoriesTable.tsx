"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import Snackbar from "@mui/material/Snackbar";
import Stack from "@mui/material/Stack";
import Switch from "@mui/material/Switch";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import {
  IconPencil,
  IconTrash,
  IconPlus,
  IconArrowUp,
  IconArrowDown,
} from "@tabler/icons-react";
import {
  saveCategory,
  deleteCategory,
  reorderCategories,
  type CategoryRow,
} from "@/lib/blog/category-actions";
import { slugify } from "@/lib/blog/toc";

type DialogState =
  | { kind: "closed" }
  | { kind: "create" }
  | { kind: "edit"; category: CategoryRow }
  | { kind: "delete"; category: CategoryRow };

export default function CategoriesTable({
  categories,
}: {
  categories: CategoryRow[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [dialog, setDialog] = useState<DialogState>({ kind: "closed" });
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [visible, setVisible] = useState(true);
  const [manualSlug, setManualSlug] = useState(false);

  function handleNameChange(val: string) {
    setName(val);
    if (!manualSlug && dialog.kind === "create") {
      setSlug(slugify(val));
    }
  }

  function openCreate() {
    setName("");
    setSlug("");
    setDescription("");
    setVisible(true);
    setManualSlug(false);
    setError(null);
    setDialog({ kind: "create" });
  }

  function openEdit(category: CategoryRow) {
    setName(category.name);
    setSlug(category.slug);
    setDescription(category.description || "");
    setVisible(category.visible);
    setManualSlug(true);
    setError(null);
    setDialog({ kind: "edit", category });
  }

  function openDelete(category: CategoryRow) {
    setError(null);
    setDialog({ kind: "delete", category });
  }

  function handleSave() {
    setError(null);
    startTransition(async () => {
      const res = await saveCategory({
        id: dialog.kind === "edit" ? dialog.category.id : undefined,
        name,
        slug,
        description,
        visible,
      });

      if (!res.ok) {
        setError(res.error);
        return;
      }

      setDialog({ kind: "closed" });
      setToast(
        dialog.kind === "edit"
          ? "Đã cập nhật danh mục thành công!"
          : "Đã thêm danh mục mới!"
      );
      router.refresh();
    });
  }

  function handleDelete() {
    if (dialog.kind !== "delete") return;
    setError(null);
    startTransition(async () => {
      const res = await deleteCategory(dialog.category.id);
      if (!res.ok) {
        setError(res.error);
        return;
      }

      setDialog({ kind: "closed" });
      setToast("Đã xóa danh mục bài viết.");
      router.refresh();
    });
  }

  function handleToggleVisible(cat: CategoryRow) {
    startTransition(async () => {
      const res = await saveCategory({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        description: cat.description || undefined,
        sortOrder: cat.sortOrder,
        visible: !cat.visible,
      });

      if (res.ok) {
        setToast(
          !cat.visible
            ? `Đã hiện danh mục "${cat.name}"`
            : `Đã ẩn danh mục "${cat.name}"`
        );
        router.refresh();
      }
    });
  }

  function handleMove(index: number, direction: "up" | "down") {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= categories.length) return;

    const newCategories = [...categories];
    const temp = newCategories[index];
    newCategories[index] = newCategories[targetIndex];
    newCategories[targetIndex] = temp;

    const orderedIds = newCategories.map((c) => c.id);

    startTransition(async () => {
      const res = await reorderCategories(orderedIds);
      if (res.ok) {
        setToast("Đã cập nhật thứ tự danh mục.");
        router.refresh();
      }
    });
  }

  return (
    <Box>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 2 }}
      >
        <Typography variant="body2" color="text.secondary">
          Quản lý danh mục bài viết ({categories.length} danh mục)
        </Typography>
        <Button
          variant="contained"
          startIcon={<IconPlus size={18} />}
          onClick={openCreate}
        >
          Thêm danh mục
        </Button>
      </Stack>

      <Card variant="outlined">
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell width={60}>Thứ tự</TableCell>
                <TableCell>Tên danh mục</TableCell>
                <TableCell>Slug</TableCell>
                <TableCell align="center">Số bài viết</TableCell>
                <TableCell align="center">Hiển thị</TableCell>
                <TableCell align="right">Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {categories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">
                      Chưa có danh mục nào. Bấm <b>Thêm danh mục</b> để tạo mới.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                categories.map((cat, idx) => (
                  <TableRow key={cat.id} hover>
                    <TableCell>
                      <Stack direction="row" spacing={0.5}>
                        <IconButton
                          size="small"
                          disabled={idx === 0 || pending}
                          onClick={() => handleMove(idx, "up")}
                        >
                          <IconArrowUp size={16} />
                        </IconButton>
                        <IconButton
                          size="small"
                          disabled={idx === categories.length - 1 || pending}
                          onClick={() => handleMove(idx, "down")}
                        >
                          <IconArrowDown size={16} />
                        </IconButton>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2" fontWeight={600}>
                        {cat.name}
                      </Typography>
                      {cat.description && (
                        <Typography variant="body2" color="text.secondary">
                          {cat.description}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontFamily: "monospace", color: "text.secondary" }}>
                        /blog?danh_muc={cat.slug}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={`${cat.articleCount} bài`}
                        size="small"
                        color={cat.articleCount > 0 ? "primary" : "default"}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip
                        title={
                          cat.visible
                            ? "Đang hiện trên website"
                            : "Đang ẩn khỏi website (ẩn cả các bài thuộc danh mục này)"
                        }
                      >
                        <Switch
                          checked={cat.visible}
                          onChange={() => handleToggleVisible(cat)}
                          disabled={pending}
                          color="success"
                        />
                      </Tooltip>
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => openEdit(cat)}
                        >
                          <IconPencil size={18} />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => openDelete(cat)}
                        >
                          <IconTrash size={18} />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Modal Thêm / Sửa Danh mục */}
      <Dialog
        open={dialog.kind === "create" || dialog.kind === "edit"}
        onClose={() => setDialog({ kind: "closed" })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {dialog.kind === "edit" ? "Sửa danh mục bài viết" : "Thêm danh mục bài viết"}
        </DialogTitle>
        <DialogContent dividers>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Tên danh mục"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              required
              fullWidth
            />

            <TextField
              label="Slug (Đường dẫn)"
              value={slug}
              onChange={(e) => {
                setSlug(e.target.value);
                setManualSlug(true);
              }}
              helperText="Đường dẫn trên URL, ví dụ: gioi-thieu, kien-thuc"
              required
              fullWidth
            />

            <TextField
              label="Mô tả danh mục"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              multiline
              rows={2}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setDialog({ kind: "closed" })} disabled={pending}>
            Hủy
          </Button>
          <Button variant="contained" onClick={handleSave} loading={pending}>
            Lưu danh mục
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Xác nhận Xóa */}
      <Dialog open={dialog.kind === "delete"} onClose={() => setDialog({ kind: "closed" })}>
        <DialogTitle>Xác nhận xóa danh mục</DialogTitle>
        <DialogContent dividers>
          {error ? (
            <Alert severity="error">{error}</Alert>
          ) : (
            <Typography>
              Bạn có chắc chắn muốn xóa danh mục <b>{dialog.kind === "delete" ? dialog.category.name : ""}</b>?
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setDialog({ kind: "closed" })} disabled={pending}>
            Hủy
          </Button>
          {!error && (
            <Button variant="contained" color="error" onClick={handleDelete} loading={pending}>
              Xóa danh mục
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Toast thông báo */}
      <Snackbar
        open={Boolean(toast)}
        autoHideDuration={3000}
        onClose={() => setToast(null)}
        message={toast}
      />
    </Box>
  );
}
