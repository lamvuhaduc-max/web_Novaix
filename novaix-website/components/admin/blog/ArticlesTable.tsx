"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Alert from "@mui/material/Alert";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Pagination from "@mui/material/Pagination";
import Select from "@mui/material/Select";
import Snackbar from "@mui/material/Snackbar";
import Stack from "@mui/material/Stack";
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
  IconExternalLink,
  IconRotateClockwise,
  IconEye,
  IconEyeOff,
  IconSearch,
  IconArrowsSort,
  IconArrowUp,
  IconArrowDown,
  IconCalendar,
} from "@tabler/icons-react";
import {
  setArticleStatus,
  softDeleteArticle,
  restoreArticle,
  hardDeleteArticle,
  type ArticleItemRow,
  type ArticleListPage,
} from "@/lib/blog/article-actions";
import type { CategoryRow } from "@/lib/blog/category-actions";
import type { ArticleStatus } from "@/lib/db/schema";

const statusConfig: Record<
  ArticleStatus,
  { label: string; color: "default" | "success" | "warning" | "error" }
> = {
  draft: { label: "Nháp", color: "default" },
  published: { label: "Đã đăng", color: "success" },
  hidden: { label: "Ẩn", color: "warning" },
};

const dateFormatter = new Intl.DateTimeFormat("vi-VN", {
  dateStyle: "short",
  timeStyle: "short",
});

type ActionDialogState =
  | { kind: "closed" }
  | { kind: "delete"; article: ArticleItemRow }
  | { kind: "restore"; article: ArticleItemRow }
  | { kind: "hard_delete"; article: ArticleItemRow };

function formatDateString(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function ArticlesTable({
  initialData,
  categories,
}: {
  initialData: ArticleListPage;
  categories: CategoryRow[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  const [dialog, setDialog] = useState<ActionDialogState>({ kind: "closed" });
  const [toast, setToast] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Trạng thái từ URL (Global Params)
  const query = searchParams.get("query") || "";
  const categoryId = searchParams.get("categoryId") || "";
  const statusFilter = searchParams.get("status") || "all";
  const datePreset = searchParams.get("datePreset") || "";
  const startDate = searchParams.get("startDate") || "";
  const endDate = searchParams.get("endDate") || "";
  const page = parseInt(searchParams.get("page") || "1", 10);

  const [searchInput, setSearchInput] = useState(query);
  const [showCustomDate, setShowCustomDate] = useState(datePreset === "custom");

  type SortField = "title" | "category" | "status" | "updatedAt";
  type SortOrder = "asc" | "desc";

  const [sortField, setSortField] = useState<SortField>(
    (searchParams.get("sortField") as SortField) || "updatedAt"
  );
  const [sortOrder, setSortOrder] = useState<SortOrder>(
    (searchParams.get("sortOrder") as SortOrder) || "desc"
  );

  // Hàm đẩy bộ lọc ra URL global
  function applyFilters(newParams: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(newParams).forEach(([key, val]) => {
      if (val !== null && val !== undefined && val !== "") {
        params.set(key, val);
      } else {
        params.delete(key);
      }
    });

    if (!("page" in newParams)) {
      params.set("page", "1");
    }

    router.push(`/admin/blog?${params.toString()}`);
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    applyFilters({ query: searchInput });
  }

  function handleClearFilters() {
    setSearchInput("");
    setShowCustomDate(false);
    router.push("/admin/blog");
  }

  function handleDatePreset(preset: "today" | "this_month" | "this_year" | "custom") {
    if (preset === "custom") {
      setShowCustomDate(true);
      applyFilters({ datePreset: "custom" });
      return;
    }

    setShowCustomDate(false);
    const now = new Date();
    let start = "";
    let end = "";

    if (preset === "today") {
      const todayStr = formatDateString(now);
      start = todayStr;
      end = todayStr;
    } else if (preset === "this_month") {
      const first = new Date(now.getFullYear(), now.getMonth(), 1);
      const last = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      start = formatDateString(first);
      end = formatDateString(last);
    } else if (preset === "this_year") {
      const first = new Date(now.getFullYear(), 0, 1);
      const last = new Date(now.getFullYear(), 11, 31);
      start = formatDateString(first);
      end = formatDateString(last);
    }

    applyFilters({
      datePreset: preset,
      startDate: start,
      endDate: end,
    });
  }

  function handleSort(field: SortField) {
    let nextOrder: SortOrder = "asc";
    if (sortField === field) {
      nextOrder = sortOrder === "asc" ? "desc" : "asc";
    }
    setSortField(field);
    setSortOrder(nextOrder);
    applyFilters({ sortField: field, sortOrder: nextOrder });
  }

  const sortedItems = [...initialData.items].sort((a, b) => {
    let cmp = 0;
    if (sortField === "title") {
      cmp = a.title.localeCompare(b.title, "vi");
    } else if (sortField === "category") {
      cmp = (a.categoryName || "").localeCompare(b.categoryName || "", "vi");
    } else if (sortField === "status") {
      cmp = (a.status || "").localeCompare(b.status || "");
    } else if (sortField === "updatedAt") {
      const timeA = new Date(a.publishedAt || a.createdAt).getTime();
      const timeB = new Date(b.publishedAt || b.createdAt).getTime();
      cmp = timeA - timeB;
    }
    return sortOrder === "asc" ? cmp : -cmp;
  });

  function renderSortHeader(
    label: string,
    field: SortField,
    align: "left" | "center" | "right" = "left"
  ) {
    const isActive = sortField === field;
    return (
      <TableCell
        align={align}
        onClick={() => handleSort(field)}
        sx={{
          cursor: "pointer",
          userSelect: "none",
          py: 1.5,
          "&:hover": { bgcolor: "action.hover" },
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          spacing={0.75}
          justifyContent={
            align === "center"
              ? "center"
              : align === "right"
              ? "flex-end"
              : "flex-start"
          }
        >
          <Typography
            variant="caption"
            fontWeight={700}
            color="text.secondary"
            sx={{ textTransform: "uppercase", letterSpacing: 0.5, fontSize: "0.75rem" }}
          >
            {label}
          </Typography>
          {isActive ? (
            sortOrder === "asc" ? (
              <IconArrowUp size={15} style={{ color: "#2563eb" }} />
            ) : (
              <IconArrowDown size={15} style={{ color: "#2563eb" }} />
            )
          ) : (
            <IconArrowsSort size={15} style={{ opacity: 0.4 }} />
          )}
        </Stack>
      </TableCell>
    );
  }

  function handleStatusToggle(article: ArticleItemRow) {
    const nextStatus: ArticleStatus =
      article.status === "published" ? "hidden" : "published";

    startTransition(async () => {
      const res = await setArticleStatus(article.id, nextStatus);
      if (res.ok) {
        setToast(
          nextStatus === "published"
            ? `Đã đăng bài viết "${article.title}"`
            : `Đã ẩn bài viết "${article.title}"`
        );
        router.refresh();
      }
    });
  }

  function handleConfirmAction() {
    if (dialog.kind === "closed") return;

    setError(null);
    startTransition(async () => {
      let res;
      if (dialog.kind === "delete") {
        res = await softDeleteArticle(dialog.article.id);
      } else if (dialog.kind === "restore") {
        res = await restoreArticle(dialog.article.id);
      } else if (dialog.kind === "hard_delete") {
        res = await hardDeleteArticle(dialog.article.id);
      }

      if (res && !res.ok) {
        setError(res.error);
        return;
      }

      setToast(
        dialog.kind === "delete"
          ? "Đã chuyển bài viết vào thùng rác."
          : dialog.kind === "restore"
          ? "Đã khôi phục bài viết về trạng thái Nháp."
          : "Đã xóa vĩnh viễn bài viết."
      );
      setDialog({ kind: "closed" });
      router.refresh();
    });
  }

  const counts = initialData.statusCounts || {
    all: initialData.total,
    published: 0,
    draft: 0,
    hidden: 0,
    trash: 0,
  };

  return (
    <Box>
      {/* Toast thông báo & Thông báo lỗi */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* HÀNG BỘ LỌC 1 (Khung tìm kiếm + Chọn danh mục + Nút lọc ngày nhanh) */}
      <Paper variant="outlined" sx={{ p: 2, mb: 1.5, borderRadius: 3, bgcolor: "#ffffff" }}>
        <form onSubmit={handleSearchSubmit}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={1.5}
            alignItems={{ xs: "stretch", md: "center" }}
            flexWrap="wrap"
          >
            {/* Ô tìm kiếm tiêu đề hoặc địa chỉ */}
            <TextField
              size="small"
              placeholder="Tìm tiêu đề hoặc địa chỉ..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              InputProps={{
                startAdornment: <IconSearch size={18} style={{ marginRight: 8, opacity: 0.4 }} />,
              }}
              sx={{
                flexGrow: 1,
                minWidth: 260,
                "& .MuiOutlinedInput-root": { borderRadius: 2.5 },
              }}
            />

            {/* Dropdown Chọn danh mục */}
            <Select
              size="small"
              value={categoryId}
              onChange={(e) => applyFilters({ categoryId: e.target.value })}
              displayEmpty
              sx={{ minWidth: 160, borderRadius: 2.5 }}
            >
              <MenuItem value="">Mọi danh mục</MenuItem>
              {categories.map((cat) => (
                <MenuItem key={cat.id} value={cat.id}>
                  {cat.name}
                </MenuItem>
              ))}
            </Select>

            {/* Nút lọc ngày nhanh */}
            <Stack direction="row" spacing={1} flexWrap="wrap">
              <Button
                size="small"
                variant={datePreset === "today" ? "contained" : "outlined"}
                onClick={() => handleDatePreset("today")}
                sx={{
                  borderRadius: 2.5,
                  textTransform: "none",
                  fontWeight: 500,
                  bgcolor: datePreset === "today" ? "#2563eb" : "transparent",
                  color: datePreset === "today" ? "#ffffff" : "text.primary",
                  borderColor: datePreset === "today" ? "#2563eb" : "#e2e8f0",
                  "&:hover": {
                    bgcolor: datePreset === "today" ? "#1d4ed8" : "#f8fafc",
                    borderColor: datePreset === "today" ? "#1d4ed8" : "#cbd5e1",
                  },
                }}
              >
                Hôm nay
              </Button>

              <Button
                size="small"
                variant={datePreset === "this_month" ? "contained" : "outlined"}
                onClick={() => handleDatePreset("this_month")}
                sx={{
                  borderRadius: 2.5,
                  textTransform: "none",
                  fontWeight: 500,
                  bgcolor: datePreset === "this_month" ? "#2563eb" : "transparent",
                  color: datePreset === "this_month" ? "#ffffff" : "text.primary",
                  borderColor: datePreset === "this_month" ? "#2563eb" : "#e2e8f0",
                  "&:hover": {
                    bgcolor: datePreset === "this_month" ? "#1d4ed8" : "#f8fafc",
                    borderColor: datePreset === "this_month" ? "#1d4ed8" : "#cbd5e1",
                  },
                }}
              >
                Tháng này
              </Button>

              <Button
                size="small"
                variant={datePreset === "this_year" ? "contained" : "outlined"}
                onClick={() => handleDatePreset("this_year")}
                sx={{
                  borderRadius: 2.5,
                  textTransform: "none",
                  fontWeight: 500,
                  bgcolor: datePreset === "this_year" ? "#2563eb" : "transparent",
                  color: datePreset === "this_year" ? "#ffffff" : "text.primary",
                  borderColor: datePreset === "this_year" ? "#2563eb" : "#e2e8f0",
                  "&:hover": {
                    bgcolor: datePreset === "this_year" ? "#1d4ed8" : "#f8fafc",
                    borderColor: datePreset === "this_year" ? "#1d4ed8" : "#cbd5e1",
                  },
                }}
              >
                Năm nay
              </Button>

              <Button
                size="small"
                variant={datePreset === "custom" || showCustomDate ? "contained" : "outlined"}
                onClick={() => handleDatePreset("custom")}
                startIcon={<IconCalendar size={16} />}
                sx={{
                  borderRadius: 2.5,
                  textTransform: "none",
                  fontWeight: 500,
                  bgcolor: datePreset === "custom" || showCustomDate ? "#2563eb" : "transparent",
                  color: datePreset === "custom" || showCustomDate ? "#ffffff" : "text.primary",
                  borderColor: datePreset === "custom" || showCustomDate ? "#2563eb" : "#e2e8f0",
                  "&:hover": {
                    bgcolor: datePreset === "custom" || showCustomDate ? "#1d4ed8" : "#f8fafc",
                    borderColor: datePreset === "custom" || showCustomDate ? "#1d4ed8" : "#cbd5e1",
                  },
                }}
              >
                Khoảng ngày
              </Button>
            </Stack>
          </Stack>

          {/* Mở rộng Tùy chọn Khoảng ngày (Custom Date Range) */}
          {showCustomDate && (
            <Stack direction="row" spacing={2} sx={{ mt: 2, pt: 1.5, borderTop: "1px dashed #e2e8f0" }}>
              <TextField
                type="date"
                size="small"
                label="Từ ngày"
                InputLabelProps={{ shrink: true }}
                value={startDate}
                onChange={(e) => applyFilters({ startDate: e.target.value })}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2.5 } }}
              />
              <TextField
                type="date"
                size="small"
                label="Đến ngày"
                InputLabelProps={{ shrink: true }}
                value={endDate}
                onChange={(e) => applyFilters({ endDate: e.target.value })}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2.5 } }}
              />
            </Stack>
          )}
        </form>
      </Paper>

      {/* HÀNG BỘ LỌC 2 (Thẻ Trạng thái dạng Pill Chips theo Mockup) */}
      <Paper variant="outlined" sx={{ p: 1.5, mb: 3, borderRadius: 3, bgcolor: "#ffffff" }}>
        <Stack direction="row" spacing={1} flexWrap="wrap" alignItems="center">
          {/* Nút Tất cả */}
          <Button
            size="small"
            onClick={() => applyFilters({ status: "all" })}
            sx={{
              borderRadius: 3,
              px: 2,
              py: 0.75,
              textTransform: "none",
              fontWeight: statusFilter === "all" ? 700 : 500,
              bgcolor: statusFilter === "all" ? "#2563eb" : "#ffffff",
              color: statusFilter === "all" ? "#ffffff" : "#475569",
              border: "1px solid",
              borderColor: statusFilter === "all" ? "#2563eb" : "#cbd5e1",
              "&:hover": {
                bgcolor: statusFilter === "all" ? "#1d4ed8" : "#f1f5f9",
              },
            }}
          >
            Tất cả
            <Box
              component="span"
              sx={{
                ml: 1,
                px: 1,
                py: 0.2,
                borderRadius: "10px",
                fontSize: "0.75rem",
                bgcolor: statusFilter === "all" ? "rgba(255,255,255,0.25)" : "#f1f5f9",
                color: statusFilter === "all" ? "#ffffff" : "#64748b",
              }}
            >
              {counts.all}
            </Box>
          </Button>

          {/* Nút Đã đăng */}
          <Button
            size="small"
            onClick={() => applyFilters({ status: "published" })}
            sx={{
              borderRadius: 3,
              px: 2,
              py: 0.75,
              textTransform: "none",
              fontWeight: statusFilter === "published" ? 700 : 500,
              bgcolor: statusFilter === "published" ? "#2563eb" : "#ffffff",
              color: statusFilter === "published" ? "#ffffff" : "#475569",
              border: "1px solid",
              borderColor: statusFilter === "published" ? "#2563eb" : "#cbd5e1",
              "&:hover": {
                bgcolor: statusFilter === "published" ? "#1d4ed8" : "#f1f5f9",
              },
            }}
          >
            Đã đăng
            <Box
              component="span"
              sx={{
                ml: 1,
                px: 1,
                py: 0.2,
                borderRadius: "10px",
                fontSize: "0.75rem",
                bgcolor: statusFilter === "published" ? "rgba(255,255,255,0.25)" : "#f1f5f9",
                color: statusFilter === "published" ? "#ffffff" : "#64748b",
              }}
            >
              {counts.published}
            </Box>
          </Button>

          {/* Nút Nháp */}
          <Button
            size="small"
            onClick={() => applyFilters({ status: "draft" })}
            sx={{
              borderRadius: 3,
              px: 2,
              py: 0.75,
              textTransform: "none",
              fontWeight: statusFilter === "draft" ? 700 : 500,
              bgcolor: statusFilter === "draft" ? "#2563eb" : "#ffffff",
              color: statusFilter === "draft" ? "#ffffff" : "#475569",
              border: "1px solid",
              borderColor: statusFilter === "draft" ? "#2563eb" : "#cbd5e1",
              "&:hover": {
                bgcolor: statusFilter === "draft" ? "#1d4ed8" : "#f1f5f9",
              },
            }}
          >
            Nháp
            {counts.draft > 0 && (
              <Box
                component="span"
                sx={{
                  ml: 1,
                  px: 1,
                  py: 0.2,
                  borderRadius: "10px",
                  fontSize: "0.75rem",
                  bgcolor: statusFilter === "draft" ? "rgba(255,255,255,0.25)" : "#f1f5f9",
                  color: statusFilter === "draft" ? "#ffffff" : "#64748b",
                }}
              >
                {counts.draft}
              </Box>
            )}
          </Button>

          {/* Nút Ẩn */}
          <Button
            size="small"
            onClick={() => applyFilters({ status: "hidden" })}
            sx={{
              borderRadius: 3,
              px: 2,
              py: 0.75,
              textTransform: "none",
              fontWeight: statusFilter === "hidden" ? 700 : 500,
              bgcolor: statusFilter === "hidden" ? "#2563eb" : "#ffffff",
              color: statusFilter === "hidden" ? "#ffffff" : "#475569",
              border: "1px solid",
              borderColor: statusFilter === "hidden" ? "#2563eb" : "#cbd5e1",
              "&:hover": {
                bgcolor: statusFilter === "hidden" ? "#1d4ed8" : "#f1f5f9",
              },
            }}
          >
            Ẩn
            {counts.hidden > 0 && (
              <Box
                component="span"
                sx={{
                  ml: 1,
                  px: 1,
                  py: 0.2,
                  borderRadius: "10px",
                  fontSize: "0.75rem",
                  bgcolor: statusFilter === "hidden" ? "rgba(255,255,255,0.25)" : "#f1f5f9",
                  color: statusFilter === "hidden" ? "#ffffff" : "#64748b",
                }}
              >
                {counts.hidden}
              </Box>
            )}
          </Button>

          {/* Nút Thùng rác */}
          <Button
            size="small"
            onClick={() => applyFilters({ status: "trash" })}
            sx={{
              borderRadius: 3,
              px: 2,
              py: 0.75,
              textTransform: "none",
              fontWeight: statusFilter === "trash" ? 700 : 500,
              bgcolor: statusFilter === "trash" ? "#2563eb" : "#ffffff",
              color: statusFilter === "trash" ? "#ffffff" : "#475569",
              border: "1px solid",
              borderColor: statusFilter === "trash" ? "#2563eb" : "#cbd5e1",
              "&:hover": {
                bgcolor: statusFilter === "trash" ? "#1d4ed8" : "#f1f5f9",
              },
            }}
          >
            🗑 Thùng rác
            {counts.trash > 0 && (
              <Box
                component="span"
                sx={{
                  ml: 1,
                  px: 1,
                  py: 0.2,
                  borderRadius: "10px",
                  fontSize: "0.75rem",
                  bgcolor: statusFilter === "trash" ? "rgba(255,255,255,0.25)" : "#f1f5f9",
                  color: statusFilter === "trash" ? "#ffffff" : "#64748b",
                }}
              >
                {counts.trash}
              </Box>
            )}
          </Button>

          {(query || categoryId || statusFilter !== "all" || startDate || endDate) && (
            <Button
              size="small"
              variant="text"
              color="inherit"
              onClick={handleClearFilters}
              sx={{ ml: "auto !important", fontSize: "0.8rem", textTransform: "none" }}
            >
              Xóa bộ lọc
            </Button>
          )}
        </Stack>
      </Paper>

      {/* Bảng danh sách Bài viết */}
      <Card variant="outlined" sx={{ borderRadius: 3, overflow: "hidden" }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "grey.50" }}>
                <TableCell width={70}>
                  <Typography
                    variant="caption"
                    fontWeight={700}
                    color="text.secondary"
                    sx={{ textTransform: "uppercase", letterSpacing: 0.5, fontSize: "0.75rem" }}
                  >
                    ẢNH
                  </Typography>
                </TableCell>
                {renderSortHeader("TIÊU ĐỀ", "title")}
                {renderSortHeader("DANH MỤC", "category")}
                {renderSortHeader("TRẠNG THÁI", "status", "center")}
                {renderSortHeader("CẬP NHẬT", "updatedAt")}
                <TableCell align="right">
                  <Typography
                    variant="caption"
                    fontWeight={700}
                    color="text.secondary"
                    sx={{ textTransform: "uppercase", letterSpacing: 0.5, fontSize: "0.75rem" }}
                  >
                    THAO TÁC
                  </Typography>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                    <Typography color="text.secondary" variant="body1">
                      {statusFilter === "trash"
                        ? "Thùng rác trống."
                        : query || categoryId || statusFilter !== "all"
                        ? "Không tìm thấy bài viết khớp bộ lọc."
                        : "Chưa có bài viết nào. Bấm 'Thêm bài viết' để bắt đầu."}
                    </Typography>
                    {(query || categoryId || statusFilter !== "all") && (
                      <Button sx={{ mt: 1 }} size="small" onClick={handleClearFilters}>
                        Xóa bộ lọc
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                sortedItems.map((art) => (
                  <TableRow key={art.id} hover>
                    <TableCell>
                      <Avatar
                        variant="rounded"
                        src={art.coverImage || undefined}
                        sx={{ width: 48, height: 48, bgcolor: "grey.200", borderRadius: 2 }}
                      >
                        📝
                      </Avatar>
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="subtitle2"
                        fontWeight={600}
                        component={Link}
                        href={`/admin/blog/${art.id}`}
                        sx={{ textDecoration: "none", color: "text.primary", "&:hover": { color: "primary.main" } }}
                      >
                        {art.title}
                      </Typography>
                      <Typography variant="body2" sx={{ fontFamily: "monospace", color: "text.secondary", fontSize: "0.8rem" }}>
                        /blog/{art.slug}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={art.categoryName} size="small" variant="outlined" sx={{ borderRadius: 1.5 }} />
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={statusConfig[art.status].label}
                        color={statusConfig[art.status].color}
                        size="small"
                        sx={{ borderRadius: 1.5 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontSize: "0.85rem" }}>
                        {art.publishedAt ? dateFormatter.format(new Date(art.publishedAt)) : "—"}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        {statusFilter === "trash" ? (
                          <>
                            <Tooltip title="Khôi phục về trạng thái Nháp">
                              <IconButton
                                size="small"
                                color="success"
                                onClick={() => setDialog({ kind: "restore", article: art })}
                              >
                                <IconRotateClockwise size={18} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Xóa vĩnh viễn (Super Admin)">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => setDialog({ kind: "hard_delete", article: art })}
                              >
                                <IconTrash size={18} />
                              </IconButton>
                            </Tooltip>
                          </>
                        ) : (
                          <>
                            {art.status === "published" && (
                              <Tooltip title="Xem trên website">
                                <IconButton
                                  size="small"
                                  component="a"
                                  href={`/blog/${art.slug}`}
                                  target="_blank"
                                  color="info"
                                >
                                  <IconExternalLink size={18} />
                                </IconButton>
                              </Tooltip>
                            )}

                            <Tooltip
                              title={art.status === "published" ? "Ẩn bài viết" : "Xuất bản ngay"}
                            >
                              <IconButton
                                size="small"
                                color={art.status === "published" ? "warning" : "success"}
                                onClick={() => handleStatusToggle(art)}
                              >
                                {art.status === "published" ? (
                                  <IconEyeOff size={18} />
                                ) : (
                                  <IconEye size={18} />
                                )}
                              </IconButton>
                            </Tooltip>

                            <Tooltip title="Chỉnh sửa bài viết">
                              <IconButton
                                size="small"
                                component={Link}
                                href={`/admin/blog/${art.id}`}
                                color="primary"
                              >
                                <IconPencil size={18} />
                              </IconButton>
                            </Tooltip>

                            <Tooltip title="Chuyển vào thùng rác">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => setDialog({ kind: "delete", article: art })}
                              >
                                <IconTrash size={18} />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Global Phân Trang (Global Pagination Params) */}
        {initialData.totalPages > 1 && (
          <Box sx={{ p: 2, display: "flex", justifyContent: "center", borderTop: "1px solid #e2e8f0" }}>
            <Pagination
              count={initialData.totalPages}
              page={page}
              onChange={(_, p) => applyFilters({ page: p.toString() })}
              color="primary"
              shape="rounded"
            />
          </Box>
        )}
      </Card>

      {/* Hộp thoại xác nhận thao tác */}
      <Dialog open={dialog.kind !== "closed"} onClose={() => setDialog({ kind: "closed" })}>
        <DialogTitle fontWeight={600}>
          {dialog.kind === "delete" && "Chuyển bài viết vào thùng rác?"}
          {dialog.kind === "restore" && "Khôi phục bài viết?"}
          {dialog.kind === "hard_delete" && "Xóa vĩnh viễn bài viết?"}
        </DialogTitle>
        <DialogContent>
          {dialog.kind === "delete" && (
            <Typography variant="body2">
              Bài viết <b>"{dialog.article?.title}"</b> sẽ chuyển vào thùng rác và ẩn khỏi website. Bạn có thể khôi phục sau.
            </Typography>
          )}
          {dialog.kind === "restore" && (
            <Typography variant="body2">
              Bài viết <b>"{dialog.article?.title}"</b> sẽ được chuyển về trạng thái <b>Nháp</b>.
            </Typography>
          )}
          {dialog.kind === "hard_delete" && (
            <Typography variant="body2" color="error">
              Hành động này sẽ xóa hoàn toàn dữ liệu bài viết <b>"{dialog.article?.title}"</b> khỏi CSDL và không thể hoàn tác!
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialog({ kind: "closed" })} color="inherit">
            Hủy
          </Button>
          <Button
            onClick={handleConfirmAction}
            color={dialog.kind === "hard_delete" ? "error" : "primary"}
            variant="contained"
            disabled={pending}
          >
            Xác nhận
          </Button>
        </DialogActions>
      </Dialog>

      {/* Toast Snackbar */}
      <Snackbar
        open={Boolean(toast)}
        autoHideDuration={3000}
        onClose={() => setToast(null)}
        message={toast}
      />
    </Box>
  );
}
