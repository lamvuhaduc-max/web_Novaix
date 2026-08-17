"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import {
  IconArrowDown,
  IconArrowUp,
  IconPlus,
  IconTrash,
} from "@tabler/icons-react";
import ColorInput from "./ColorInput";
import type { FooterContent } from "@/lib/site-content/schema";

export default function FooterSection({
  footer,
  onChange,
}: {
  footer: FooterContent;
  onChange: (newFooter: FooterContent) => void;
}) {
  const columns = footer.columns || [];
  const bottomLinks = footer.bottomLinks || [];

  const updateField = <K extends keyof FooterContent>(
    key: K,
    val: FooterContent[K],
  ) => {
    onChange({
      ...footer,
      [key]: val,
    });
  };

  // Cột liên kết handlers
  const handleAddColumn = () => {
    const next = [
      ...columns,
      {
        title: "Cột mới",
        links: [{ label: "Liên kết 1", href: "#" }],
      },
    ];
    updateField("columns", next);
  };

  const handleDeleteColumn = (colIdx: number) => {
    const next = columns.filter((_, i) => i !== colIdx);
    updateField("columns", next);
  };

  const handleColumnTitleChange = (colIdx: number, title: string) => {
    const next = [...columns];
    next[colIdx] = { ...next[colIdx], title };
    updateField("columns", next);
  };

  const handleAddLinkToColumn = (colIdx: number) => {
    const next = [...columns];
    const col = next[colIdx];
    next[colIdx] = {
      ...col,
      links: [...col.links, { label: "Liên kết mới", href: "#" }],
    };
    updateField("columns", next);
  };

  const handleDeleteLinkFromColumn = (colIdx: number, linkIdx: number) => {
    const next = [...columns];
    const col = next[colIdx];
    next[colIdx] = {
      ...col,
      links: col.links.filter((_, i) => i !== linkIdx),
    };
    updateField("columns", next);
  };

  const handleMoveColumnLink = (
    colIdx: number,
    linkIdx: number,
    dir: "up" | "down",
  ) => {
    const next = [...columns];
    const col = next[colIdx];
    const targetIdx = dir === "up" ? linkIdx - 1 : linkIdx + 1;
    if (targetIdx < 0 || targetIdx >= col.links.length) return;

    const links = [...col.links];
    const [moved] = links.splice(linkIdx, 1);
    links.splice(targetIdx, 0, moved);

    next[colIdx] = { ...col, links };
    updateField("columns", next);
  };

  const handleColumnLinkChange = (
    colIdx: number,
    linkIdx: number,
    field: "label" | "href",
    val: string,
  ) => {
    const next = [...columns];
    const col = next[colIdx];
    const links = [...col.links];
    links[linkIdx] = { ...links[linkIdx], [field]: val };
    next[colIdx] = { ...col, links };
    updateField("columns", next);
  };

  // Thanh đáy handlers
  const handleAddBottomLink = () => {
    const next = [...bottomLinks, { label: "Liên kết mới", href: "#" }];
    updateField("bottomLinks", next);
  };

  const handleDeleteBottomLink = (linkIdx: number) => {
    const next = bottomLinks.filter((_, i) => i !== linkIdx);
    updateField("bottomLinks", next);
  };

  const handleMoveBottomLink = (linkIdx: number, dir: "up" | "down") => {
    const targetIdx = dir === "up" ? linkIdx - 1 : linkIdx + 1;
    if (targetIdx < 0 || targetIdx >= bottomLinks.length) return;

    const next = [...bottomLinks];
    const [moved] = next.splice(linkIdx, 1);
    next.splice(targetIdx, 0, moved);
    updateField("bottomLinks", next);
  };

  const handleBottomLinkChange = (
    linkIdx: number,
    field: "label" | "href",
    val: string,
  ) => {
    const next = [...bottomLinks];
    next[linkIdx] = { ...next[linkIdx], [field]: val };
    updateField("bottomLinks", next);
  };

  return (
    <Box>
      {/* Màu sắc footer */}
      <ColorInput
        label="Màu nền footer"
        value={footer.bgColor || "#0b1120"}
        onChange={(val) => updateField("bgColor", val)}
      />

      <ColorInput
        label="Màu chữ footer"
        value={footer.textColor || "#9aa6c4"}
        onChange={(val) => updateField("textColor", val)}
      />

      <Divider sx={{ my: 2.5 }} />

      {/* NỘI DUNG */}
      <Typography
        variant="caption"
        sx={{
          fontWeight: 700,
          letterSpacing: "0.08em",
          color: "text.secondary",
          mb: 1.5,
          display: "block",
        }}
      >
        NỘI DUNG
      </Typography>

      <Box sx={{ mb: 2 }}>
        <Typography
          variant="body2"
          sx={{ fontWeight: 600, fontSize: "13px", mb: 0.75 }}
        >
          Giới thiệu (dưới logo)
        </Typography>
        <TextField
          size="small"
          fullWidth
          multiline
          rows={3}
          value={footer.brandDesc || ""}
          placeholder="Nhập mô tả ngắn..."
          onChange={(e) => updateField("brandDesc", e.target.value)}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: "8px",
              bgcolor: "background.paper",
              fontSize: "13px",
            },
          }}
        />
      </Box>

      {/* Note box */}
      <Paper
        variant="outlined"
        sx={{
          p: 1.5,
          mb: 3,
          bgcolor: "action.hover",
          borderColor: "divider",
          borderRadius: "8px",
        }}
      >
        <Typography
          variant="caption"
          sx={{
            color: "text.secondary",
            fontSize: "12px",
            lineHeight: 1.5,
            display: "block",
          }}
        >
          Để trống ⇒ dùng câu mặc định theo tên thương hiệu. Cột <b>Liên hệ</b>{" "}
          lấy địa chỉ và hotline từ <b>Thương hiệu</b>, không sửa ở đây.
        </Typography>
      </Paper>

      {/* Cột liên kết */}
      <Typography
        variant="body2"
        sx={{ fontWeight: 600, fontSize: "13px", mb: 1.5 }}
      >
        Cột liên kết
      </Typography>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 2 }}>
        {columns.map((col, colIdx) => (
          <Paper
            key={colIdx}
            variant="outlined"
            sx={{
              p: 1.5,
              borderRadius: "10px",
              bgcolor: "background.paper",
              borderColor: "divider",
            }}
          >
            {/* Header Cột */}
            <Box
              sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}
            >
              <TextField
                size="small"
                fullWidth
                value={col.title}
                placeholder="Tên cột"
                onChange={(e) =>
                  handleColumnTitleChange(colIdx, e.target.value)
                }
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "6px",
                    fontWeight: 700,
                    fontSize: "13.5px",
                  },
                }}
              />
              {columns.length > 1 && (
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => handleDeleteColumn(colIdx)}
                  sx={{ p: 0.75 }}
                >
                  <IconTrash size={16} />
                </IconButton>
              )}
            </Box>

            {/* Danh sách link trong cột */}
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 1,
                mb: 1.25,
              }}
            >
              {col.links.map((link, linkIdx) => (
                <Paper
                  key={linkIdx}
                  variant="outlined"
                  sx={{
                    p: 1,
                    px: 1.25,
                    borderRadius: "8px",
                    bgcolor: "background.default",
                    borderColor: "divider",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 0.75,
                    }}
                  >
                    <TextField
                      size="small"
                      fullWidth
                      value={link.label}
                      placeholder="Tên liên kết"
                      onChange={(e) =>
                        handleColumnLinkChange(
                          colIdx,
                          linkIdx,
                          "label",
                          e.target.value,
                        )
                      }
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "6px",
                          fontSize: "13px",
                          bgcolor: "background.paper",
                        },
                      }}
                    />

                    <IconButton
                      size="small"
                      disabled={linkIdx === 0}
                      onClick={() =>
                        handleMoveColumnLink(colIdx, linkIdx, "up")
                      }
                      sx={{ p: 0.25 }}
                    >
                      <IconArrowUp size={14} />
                    </IconButton>

                    <IconButton
                      size="small"
                      disabled={linkIdx === col.links.length - 1}
                      onClick={() =>
                        handleMoveColumnLink(colIdx, linkIdx, "down")
                      }
                      sx={{ p: 0.25 }}
                    >
                      <IconArrowDown size={14} />
                    </IconButton>

                    {col.links.length > 1 && (
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() =>
                          handleDeleteLinkFromColumn(colIdx, linkIdx)
                        }
                        sx={{ p: 0.25 }}
                      >
                        <IconTrash size={15} />
                      </IconButton>
                    )}
                  </Box>

                  <TextField
                    size="small"
                    fullWidth
                    value={link.href || ""}
                    placeholder="/shop hoặc #modules"
                    onChange={(e) =>
                      handleColumnLinkChange(
                        colIdx,
                        linkIdx,
                        "href",
                        e.target.value,
                      )
                    }
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "6px",
                        fontSize: "12px",
                        bgcolor: "background.paper",
                      },
                    }}
                  />
                </Paper>
              ))}
            </Box>

            <Button
              variant="outlined"
              size="small"
              startIcon={<IconPlus size={14} />}
              onClick={() => handleAddLinkToColumn(colIdx)}
              sx={{
                borderRadius: "6px",
                textTransform: "none",
                fontSize: "12px",
                fontWeight: 600,
                borderStyle: "dashed",
              }}
            >
              Thêm liên kết
            </Button>
          </Paper>
        ))}
      </Box>

      {columns.length < 5 && (
        <Button
          variant="outlined"
          size="small"
          startIcon={<IconPlus size={15} />}
          onClick={handleAddColumn}
          sx={{
            mb: 3,
            borderRadius: "8px",
            textTransform: "none",
            fontSize: "12.5px",
            fontWeight: 600,
            borderStyle: "dashed",
          }}
        >
          Thêm cột
        </Button>
      )}

      <Divider sx={{ my: 2.5 }} />

      {/* THANH ĐÁY */}
      <Typography
        variant="caption"
        sx={{
          fontWeight: 700,
          letterSpacing: "0.08em",
          color: "text.secondary",
          mb: 1.5,
          display: "block",
        }}
      >
        THANH ĐÁY
      </Typography>

      <Box sx={{ mb: 2 }}>
        <Typography
          variant="body2"
          sx={{ fontWeight: 600, fontSize: "13px", mb: 0.75 }}
        >
          Dòng bản quyền
        </Typography>
        <TextField
          size="small"
          fullWidth
          value={footer.copyright || ""}
          placeholder="© 2026..."
          onChange={(e) => updateField("copyright", e.target.value)}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: "8px",
              bgcolor: "background.paper",
              fontSize: "13px",
            },
          }}
        />
      </Box>

      {/* Liên kết ở thanh đáy */}
      <Typography
        variant="body2"
        sx={{ fontWeight: 600, fontSize: "13px", mb: 1.25 }}
      >
        Liên kết ở thanh đáy
      </Typography>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mb: 1.5 }}>
        {bottomLinks.map((bLink, bIdx) => (
          <Paper
            key={bIdx}
            variant="outlined"
            sx={{
              p: 1,
              px: 1.25,
              borderRadius: "8px",
              bgcolor: "background.paper",
              borderColor: "divider",
            }}
          >
            <Box
              sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.75 }}
            >
              <TextField
                size="small"
                fullWidth
                value={bLink.label}
                placeholder="Tên liên kết"
                onChange={(e) =>
                  handleBottomLinkChange(bIdx, "label", e.target.value)
                }
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "6px",
                    fontSize: "13px",
                  },
                }}
              />

              <IconButton
                size="small"
                disabled={bIdx === 0}
                onClick={() => handleMoveBottomLink(bIdx, "up")}
                sx={{ p: 0.25 }}
              >
                <IconArrowUp size={14} />
              </IconButton>

              <IconButton
                size="small"
                disabled={bIdx === bottomLinks.length - 1}
                onClick={() => handleMoveBottomLink(bIdx, "down")}
                sx={{ p: 0.25 }}
              >
                <IconArrowDown size={14} />
              </IconButton>

              {bottomLinks.length > 1 && (
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => handleDeleteBottomLink(bIdx)}
                  sx={{ p: 0.25 }}
                >
                  <IconTrash size={15} />
                </IconButton>
              )}
            </Box>

            <TextField
              size="small"
              fullWidth
              value={bLink.href || ""}
              placeholder="/about hoặc #"
              onChange={(e) =>
                handleBottomLinkChange(bIdx, "href", e.target.value)
              }
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "6px",
                  fontSize: "12px",
                  bgcolor: "background.default",
                },
              }}
            />
          </Paper>
        ))}
      </Box>

      {bottomLinks.length < 8 && (
        <Button
          variant="outlined"
          size="small"
          startIcon={<IconPlus size={14} />}
          onClick={handleAddBottomLink}
          sx={{
            borderRadius: "6px",
            textTransform: "none",
            fontSize: "12px",
            fontWeight: 600,
            borderStyle: "dashed",
          }}
        >
          + Thêm liên kết
        </Button>
      )}
    </Box>
  );
}
