"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Alert from "@mui/material/Alert";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Select from "@mui/material/Select";
import Snackbar from "@mui/material/Snackbar";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import {
  IconArrowLeft,
  IconBold,
  IconItalic,
  IconUnderline,
  IconList,
  IconListNumbers,
  IconLink,
  IconPhoto,
  IconTable,
  IconQuote,
  IconClearFormatting,
  IconCode,
  IconArrowBackUp,
  IconArrowForwardUp,
  IconCheck,
  IconX,
  IconUpload,
  IconPencil,
} from "@tabler/icons-react";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TiptapLink from "@tiptap/extension-link";
import TiptapImage from "@tiptap/extension-image";
import { Table as TableExtension } from "@tiptap/extension-table";
import { TableRow as TableRowExtension } from "@tiptap/extension-table-row";
import { TableHeader as TableHeaderExtension } from "@tiptap/extension-table-header";
import { TableCell as TableCellExtension } from "@tiptap/extension-table-cell";

import { saveArticle, type ArticleEditModel } from "@/lib/blog/article-actions";
import { uploadArticleImage } from "@/lib/blog/image-actions";
import { slugify, extractToc } from "@/lib/blog/toc";
import type { CategoryRow } from "@/lib/blog/category-queries";
import type { ArticleStatus } from "@/lib/db/schema";

type EditorProps = {
  article?: ArticleEditModel | null;
  categories: CategoryRow[];
};

export default function ArticleEditor({ article, categories }: EditorProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [title, setTitle] = useState(article?.title || "");
  const [slug, setSlug] = useState(article?.slug || "");
  const [manualSlug, setManualSlug] = useState(Boolean(article?.id));
  const [editingSlug, setEditingSlug] = useState(false);
  const [categoryId, setCategoryId] = useState(
    article?.categoryId || (categories[0]?.id || "")
  );
  const [status, setStatus] = useState<ArticleStatus>(article?.status || "draft");
  const [excerpt, setExcerpt] = useState(article?.excerpt || "");
  const [coverImage, setCoverImage] = useState(article?.coverImage || "");

  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [lastSavedText, setLastSavedText] = useState(
    article?.id ? "Đã nạp bài viết từ CSDL" : "Chưa lưu lần nào"
  );
  const [error, setError] = useState<string | null>(null);
  const [removedTags, setRemovedTags] = useState<string[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [editorHtml, setEditorHtml] = useState(article?.contentHtml || "");

  // Tiptap Editor Initialization
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
      }),
      TiptapLink.configure({
        openOnClick: false,
        HTMLAttributes: { rel: "noopener noreferrer nofollow" },
      }),
      TiptapImage.configure({
        inline: true,
        allowBase64: false,
      }),
      TableExtension.configure({ resizable: true }),
      TableRowExtension,
      TableHeaderExtension,
      TableCellExtension,
    ],
    content: article?.contentHtml || "",
    onUpdate: ({ editor }) => {
      setIsDirty(true);
      setEditorHtml(editor.getHTML());
    },
  });

  // Tự sinh slug từ tiêu đề nếu người dùng chưa sửa thủ công
  function handleTitleChange(newTitle: string) {
    setTitle(newTitle);
    setIsDirty(true);
    if (!manualSlug && !article?.id) {
      setSlug(slugify(newTitle));
    }
  }

  // Cảnh báo rời trang khi có thay đổi chưa lưu
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  // Phím tắt Ctrl/Cmd + S để lưu nháp
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        handleSave(status);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [title, slug, categoryId, status, excerpt, coverImage, isDirty, editor]);

  // Upload ảnh trong thân bài Tiptap
  async function handleInsertImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !editor) return;

    setUploadingImage(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    const res = await uploadArticleImage(formData);
    setUploadingImage(false);

    if (!res.ok) {
      setError(res.error);
      return;
    }

    editor.chain().focus().setImage({ src: res.data!.url }).run();
    setToast("Đã chèn ảnh vào bài viết.");
    setIsDirty(true);

    // Reset file input
    e.target.value = "";
  }

  // Upload ảnh bìa (Cover Image)
  async function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingCover(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    const res = await uploadArticleImage(formData);
    setUploadingCover(false);

    if (!res.ok) {
      setError(res.error);
      return;
    }

    setCoverImage(res.data!.url);
    setToast("Đã tải ảnh bìa thành công!");
    setIsDirty(true);
    e.target.value = "";
  }

  function handleSave(targetStatus: ArticleStatus) {
    if (!title.trim()) {
      setError("Vui lòng nhập tiêu đề bài viết.");
      return;
    }
    if (!slug.trim()) {
      setError("Vui lòng nhập đường dẫn (slug).");
      return;
    }
    if (!categoryId) {
      setError("Vui lòng chọn danh mục bài viết.");
      return;
    }

    const contentHtml = editor?.getHTML() || "";
    setError(null);
    setRemovedTags([]);

    startTransition(async () => {
      const res = await saveArticle({
        id: article?.id,
        title,
        slug,
        categoryId,
        excerpt,
        coverImage,
        contentHtml,
        status: targetStatus,
      });

      if (!res.ok) {
        setError(res.error);
        return;
      }

      setIsDirty(false);
      const timeStr = new Date().toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      });
      setLastSavedText(`Đã lưu lúc ${timeStr}`);
      setStatus(targetStatus);

      if (res.data?.removedTags && res.data.removedTags.length > 0) {
        setRemovedTags(res.data.removedTags);
      }

      setToast(
        targetStatus === "published"
          ? "Đã xuất bản bài viết thành công!"
          : "Đã lưu bản nháp bài viết."
      );

      // Nếu tạo bài mới thành công, chuyển hướng về trang sửa bài đó
      if (!article?.id && res.data?.id) {
        router.push(`/admin/blog/${res.data.id}`);
      } else {
        router.refresh();
      }
    });
  }

  return (
    <Box sx={{ pb: 10 }}>
      {/* Top Bar Navigation link */}
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
        <Button
          component={Link}
          href="/admin/blog"
          startIcon={<IconArrowLeft size={18} />}
          color="inherit"
          size="small"
        >
          Quản lý bài viết
        </Button>
      </Stack>

      <Typography variant="h4" fontWeight={700} sx={{ mb: 3 }}>
        📝 {article?.id ? "Sửa bài viết" : "Bài viết mới"}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {removedTags.length > 0 && (
        <Alert severity="warning" sx={{ mb: 3 }} onClose={() => setRemovedTags([])}>
          Đã tự động loại bỏ các thẻ/thuộc tính không an toàn khỏi bài viết:{" "}
          <b>{removedTags.join(", ")}</b>. (Ví dụ script, style hoặc event handlers).
        </Alert>
      )}

      <Stack direction={{ xs: "column", lg: "row" }} spacing={3} alignItems="flex-start">
        {/* CỘT CHÍNH (Bên trái): Tiêu đề, Slug, Trình soạn thảo Tiptap */}
        <Box sx={{ flexGrow: 1, width: "100%" }}>
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, mb: 3 }}>
            {/* Nhập tiêu đề bài viết */}
            <TextField
              placeholder="Tiêu đề bài viết..."
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              fullWidth
              variant="standard"
              InputProps={{
                disableUnderline: true,
                style: { fontSize: "1.75rem", fontWeight: 700 },
              }}
              sx={{ mb: 1 }}
            />

            {/* Hiển thị & Sửa Slug */}
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Địa chỉ:
              </Typography>
              <Typography
                variant="body2"
                sx={{ fontFamily: "monospace", color: "primary.main", fontWeight: 500 }}
              >
                /blog/
              </Typography>

              {editingSlug ? (
                <Stack direction="row" alignItems="center" spacing={1}>
                  <TextField
                    size="small"
                    value={slug}
                    onChange={(e) => {
                      setSlug(e.target.value);
                      setManualSlug(true);
                    }}
                    sx={{ "& input": { py: 0.5, px: 1, fontSize: "0.875rem", fontFamily: "monospace" } }}
                  />
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={() => setEditingSlug(false)}
                  >
                    <IconCheck size={16} />
                  </IconButton>
                </Stack>
              ) : (
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Typography
                    variant="body2"
                    sx={{ fontFamily: "monospace", fontWeight: 600, color: "text.primary" }}
                  >
                    {slug || "chua-co-slug"}
                  </Typography>
                  <Button
                    size="small"
                    variant="text"
                    sx={{ p: 0, minWidth: "auto", fontSize: "0.75rem", textDecoration: "underline" }}
                    onClick={() => setEditingSlug(true)}
                  >
                    Sửa
                  </Button>
                </Stack>
              )}
            </Stack>

            <Divider sx={{ mb: 2 }} />

            {/* Thanh công cụ Rich Text Editor Toolbar */}
            {editor && (
              <Box
                sx={{
                  border: "1px solid #dfe5ef",
                  borderRadius: "7px 7px 0 0",
                  bgcolor: "#f8fafc",
                  p: 1,
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 0.5,
                  alignItems: "center",
                }}
              >
                <Tooltip title="Undo (Ctrl+Z)">
                  <span>
                    <IconButton
                      size="small"
                      onClick={() => editor.chain().focus().undo().run()}
                      disabled={!editor.can().undo()}
                    >
                      <IconArrowBackUp size={18} />
                    </IconButton>
                  </span>
                </Tooltip>

                <Tooltip title="Redo (Ctrl+Y)">
                  <span>
                    <IconButton
                      size="small"
                      onClick={() => editor.chain().focus().redo().run()}
                      disabled={!editor.can().redo()}
                    >
                      <IconArrowForwardUp size={18} />
                    </IconButton>
                  </span>
                </Tooltip>

                <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

                {/* Dropdown Đề mục */}
                <Select
                  size="small"
                  value={
                    editor.isActive("heading", { level: 2 })
                      ? "h2"
                      : editor.isActive("heading", { level: 3 })
                        ? "h3"
                        : editor.isActive("heading", { level: 4 })
                          ? "h4"
                          : "p"
                  }
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "p") editor.chain().focus().setParagraph().run();
                    else if (val === "h2")
                      editor.chain().focus().toggleHeading({ level: 2 }).run();
                    else if (val === "h3")
                      editor.chain().focus().toggleHeading({ level: 3 }).run();
                    else if (val === "h4")
                      editor.chain().focus().toggleHeading({ level: 4 }).run();
                  }}
                  sx={{ height: 32, fontSize: "0.8125rem", bgcolor: "#fff" }}
                >
                  <MenuItem value="p">Đoạn văn</MenuItem>
                  <MenuItem value="h2">Thẻ H2 (Đề mục chính)</MenuItem>
                  <MenuItem value="h3">Thẻ H3 (Đề mục phụ)</MenuItem>
                  <MenuItem value="h4">Thẻ H4 (Tiêu đề nhỏ)</MenuItem>
                </Select>

                <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

                <Tooltip title="In đậm (Bold)">
                  <IconButton
                    size="small"
                    color={editor.isActive("bold") ? "primary" : "default"}
                    onClick={() => editor.chain().focus().toggleBold().run()}
                  >
                    <IconBold size={18} />
                  </IconButton>
                </Tooltip>

                <Tooltip title="In nghiêng (Italic)">
                  <IconButton
                    size="small"
                    color={editor.isActive("italic") ? "primary" : "default"}
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                  >
                    <IconItalic size={18} />
                  </IconButton>
                </Tooltip>

                <Tooltip title="Gạch chân / Gạch ngang">
                  <IconButton
                    size="small"
                    color={editor.isActive("strike") ? "primary" : "default"}
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                  >
                    <IconUnderline size={18} />
                  </IconButton>
                </Tooltip>

                <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

                <Tooltip title="Danh sách không thứ tự">
                  <IconButton
                    size="small"
                    color={editor.isActive("bulletList") ? "primary" : "default"}
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                  >
                    <IconList size={18} />
                  </IconButton>
                </Tooltip>

                <Tooltip title="Danh sách đánh số">
                  <IconButton
                    size="small"
                    color={editor.isActive("orderedList") ? "primary" : "default"}
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                  >
                    <IconListNumbers size={18} />
                  </IconButton>
                </Tooltip>

                <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

                <Tooltip title="Chèn liên kết URL">
                  <IconButton
                    size="small"
                    color={editor.isActive("link") ? "primary" : "default"}
                    onClick={() => {
                      const url = prompt("Nhập địa chỉ URL liên kết:");
                      if (url) {
                        editor.chain().focus().setLink({ href: url }).run();
                      } else if (url === "") {
                        editor.chain().focus().unsetLink().run();
                      }
                    }}
                  >
                    <IconLink size={18} />
                  </IconButton>
                </Tooltip>

                <Tooltip title="Chèn ảnh vào bài viết">
                  <IconButton
                    size="small"
                    component="label"
                    color={uploadingImage ? "primary" : "default"}
                  >
                    <IconPhoto size={18} />
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      hidden
                      onChange={handleInsertImage}
                    />
                  </IconButton>
                </Tooltip>

                <Tooltip title="Chèn bảng (Table 3x3)">
                  <IconButton
                    size="small"
                    onClick={() =>
                      editor
                        .chain()
                        .focus()
                        .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
                        .run()
                    }
                  >
                    <IconTable size={18} />
                  </IconButton>
                </Tooltip>

                <Tooltip title="Trích dẫn (Quote)">
                  <IconButton
                    size="small"
                    color={editor.isActive("blockquote") ? "primary" : "default"}
                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                  >
                    <IconQuote size={18} />
                  </IconButton>
                </Tooltip>

                <Tooltip title="Khối mã (Code block)">
                  <IconButton
                    size="small"
                    color={editor.isActive("codeBlock") ? "primary" : "default"}
                    onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                  >
                    <IconCode size={18} />
                  </IconButton>
                </Tooltip>

                <Tooltip title="Xóa định dạng">
                  <IconButton
                    size="small"
                    onClick={() =>
                      editor.chain().focus().unsetAllMarks().clearNodes().run()
                    }
                  >
                    <IconClearFormatting size={18} />
                  </IconButton>
                </Tooltip>
              </Box>
            )}

            {/* Vùng soạn nội dung Tiptap EditorContent */}
            <Box
              sx={{
                border: "1px solid #dfe5ef",
                borderTop: "none",
                borderRadius: "0 0 7px 7px",
                p: 2,
                minHeight: 420,
                bgcolor: "#ffffff",
                "& .ProseMirror": {
                  outline: "none",
                  minHeight: 380,
                  fontSize: "0.9375rem",
                  lineHeight: 1.7,
                  color: "#2A3547",
                  "& p": { my: 1 },
                  "& h2": { fontSize: "1.5rem", fontWeight: 700, mt: 2, mb: 1 },
                  "& h3": { fontSize: "1.25rem", fontWeight: 600, mt: 2, mb: 1 },
                  "& h4": { fontSize: "1.1rem", fontWeight: 600, mt: 1.5, mb: 0.5 },
                  "& ul, & ol": { pl: 3, my: 1 },
                  "& blockquote": {
                    borderLeft: "4px solid #5D87FF",
                    pl: 2,
                    ml: 0,
                    my: 2,
                    fontStyle: "italic",
                    color: "text.secondary",
                  },
                  "& img": {
                    maxWidth: "100%",
                    height: "auto",
                    borderRadius: 8,
                    my: 2,
                    display: "block",
                  },
                  "& table": {
                    width: "100%",
                    borderCollapse: "collapse",
                    my: 2,
                    "& td, & th": {
                      border: "1px solid #dfe5ef",
                      p: 1,
                    },
                    "& th": { bgcolor: "#f1f5f9", fontWeight: 600 },
                  },
                  "& pre": {
                    bgcolor: "#1e293b",
                    color: "#f8fafc",
                    p: 2,
                    borderRadius: 6,
                    overflowX: "auto",
                    fontFamily: "monospace",
                  },
                },
              }}
            >
              <EditorContent editor={editor} />
            </Box>
          </Paper>
        </Box>

        {/* CỘT BÊN PHẢI: Trạng thái, Danh mục, Ảnh bìa, Mô tả ngắn */}
        <Box sx={{ width: { xs: "100%", lg: 340 }, flexShrink: 0 }}>
          <Stack spacing={3}>
            {/* Khối Trạng thái */}
            <Card variant="outlined">
              <CardHeader title="Trạng thái" titleTypographyProps={{ variant: "subtitle1", fontWeight: 600 }} sx={{ pb: 1 }} />
              <CardContent sx={{ pt: 0 }}>
                <ToggleButtonGroup
                  value={status}
                  exclusive
                  onChange={(_, val) => val && setStatus(val)}
                  fullWidth
                  size="small"
                  color="primary"
                  sx={{ mb: 1.5 }}
                >
                  <ToggleButton value="draft">Nháp</ToggleButton>
                  <ToggleButton value="published">Đăng</ToggleButton>
                  <ToggleButton value="hidden">Ẩn</ToggleButton>
                </ToggleButtonGroup>

                <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.78125rem" }}>
                  Bài mới luôn bắt đầu ở <b>Nháp</b>. Bấm nút Lưu/Đăng ở thanh dưới sẽ cập nhật trạng thái này ra website.
                </Typography>
              </CardContent>
            </Card>

            {/* Khối Danh mục */}
            <Card variant="outlined">
              <CardHeader title="Danh mục" titleTypographyProps={{ variant: "subtitle1", fontWeight: 600 }} sx={{ pb: 1 }} />
              <CardContent sx={{ pt: 0 }}>
                <Select
                  value={categoryId}
                  onChange={(e) => {
                    setCategoryId(e.target.value);
                    setIsDirty(true);
                  }}
                  fullWidth
                  size="small"
                >
                  {categories.map((cat) => (
                    <MenuItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </MenuItem>
                  ))}
                </Select>
              </CardContent>
            </Card>

            {/* Khối Ảnh bìa (Cover Image) */}
            <Card variant="outlined">
              <CardHeader title="Ảnh bìa" titleTypographyProps={{ variant: "subtitle1", fontWeight: 600 }} sx={{ pb: 1 }} />
              <CardContent sx={{ pt: 0 }}>
                {coverImage ? (
                  <Box sx={{ position: "relative", width: "100%", borderRadius: 2, overflow: "hidden", border: "1px solid #dfe5ef" }}>
                    <Box
                      component="img"
                      src={coverImage}
                      alt="Cover Preview"
                      sx={{ width: "100%", height: 160, objectFit: "cover", display: "block" }}
                    />
                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{ position: "absolute", bottom: 8, right: 8, bgcolor: "rgba(0,0,0,0.6)", p: 0.5, borderRadius: 1 }}
                    >
                      <IconButton component="label" size="small" sx={{ color: "#fff" }}>
                        <IconPencil size={16} />
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          hidden
                          onChange={handleCoverUpload}
                        />
                      </IconButton>
                      <IconButton
                        size="small"
                        sx={{ color: "#fff" }}
                        onClick={() => {
                          setCoverImage("");
                          setIsDirty(true);
                        }}
                      >
                        <IconX size={16} />
                      </IconButton>
                    </Stack>
                  </Box>
                ) : (
                  <Box
                    component="label"
                    sx={{
                      border: "2px dashed #dfe5ef",
                      borderRadius: 2,
                      p: 3,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      bgcolor: "#f8fafc",
                      transition: "all 0.2s",
                      "&:hover": { borderColor: "primary.main", bgcolor: "#f1f5f9" },
                    }}
                  >
                    {uploadingCover ? (
                      <CircularProgress size={24} sx={{ mb: 1 }} />
                    ) : (
                      <IconUpload size={28} style={{ opacity: 0.6, marginBottom: 8 }} />
                    )}
                    <Typography variant="body2" fontWeight={500} color="text.secondary">
                      {uploadingCover ? "Đang upload..." : "Chọn ảnh bìa"}
                    </Typography>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      hidden
                      onChange={handleCoverUpload}
                    />
                  </Box>
                )}
              </CardContent>
            </Card>

            {/* Khối Mô tả ngắn (Excerpt) */}
            <Card variant="outlined">
              <CardHeader title="Mô tả ngắn" titleTypographyProps={{ variant: "subtitle1", fontWeight: 600 }} sx={{ pb: 1 }} />
              <CardContent sx={{ pt: 0 }}>
                <TextField
                  placeholder="1–2 câu tóm tắt nội dung bài viết..."
                  value={excerpt}
                  onChange={(e) => {
                    setExcerpt(e.target.value);
                    setIsDirty(true);
                  }}
                  multiline
                  rows={3}
                  fullWidth
                  size="small"
                  inputProps={{ maxLength: 500 }}
                />
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5, textAlign: "right" }}>
                  {excerpt.length}/500 ký tự
                </Typography>
              </CardContent>
            </Card>

            {/* Khối Xem trước Mục lục (Tự động rút từ các thẻ H2) */}
            <Card variant="outlined" sx={{ bgcolor: "#f8fafc" }}>
              <CardHeader
                title="📌 Mục lục bài viết"
                titleTypographyProps={{ variant: "subtitle1", fontWeight: 600 }}
                subheader="Tự động sinh từ các thẻ H2 và hiển thị ở đầu bài khi đăng"
                subheaderTypographyProps={{ variant: "caption" }}
                sx={{ pb: 1 }}
              />
              <CardContent sx={{ pt: 0 }}>
                {(() => {
                  const h2Items = extractToc(editorHtml).toc.filter((i) => i.level === 2);
                  if (h2Items.length === 0) {
                    return (
                      <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic", fontSize: "0.85rem" }}>
                        Chưa có đề mục H2 nào. Chọn <b>"Thẻ H2 (Đề mục chính)"</b> trên thanh công cụ soạn thảo để tạo mục lục.
                      </Typography>
                    );
                  }
                  return (
                    <Box component="ol" sx={{ pl: 2.5, m: 0, fontSize: "0.875rem", color: "text.primary" }}>
                      {h2Items.map((item) => (
                        <Box component="li" key={item.id} sx={{ mb: 0.75, fontWeight: 500 }}>
                          {item.text}
                        </Box>
                      ))}
                    </Box>
                  );
                })()}
              </CardContent>
            </Card>
          </Stack>
        </Box>
      </Stack>

      {/* STICKY FOOTER BAR AT BOTTOM */}
      <Paper
        elevation={3}
        sx={{
          position: "fixed",
          bottom: 0,
          left: { xs: 0, md: 260 }, // căn theo Sidebar admin
          right: 0,
          zIndex: 1100,
          p: 2,
          px: 3,
          bgcolor: "#ffffff",
          borderTop: "1px solid #e5eaef",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Typography variant="body2" color="text.secondary">
          {lastSavedText} {isDirty && "• (Có thay đổi chưa lưu)"}
        </Typography>

        <Stack direction="row" spacing={2}>
          <Button
            component={Link}
            href="/admin/blog"
            variant="outlined"
            color="inherit"
            disabled={pending}
          >
            Hủy
          </Button>

          <Button
            variant="contained"
            color={status === "published" ? "success" : "primary"}
            onClick={() => handleSave(status)}
            loading={pending}
          >
            {status === "published" ? "Xuất bản bài viết" : "Lưu bản nháp"}
          </Button>
        </Stack>
      </Paper>

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
