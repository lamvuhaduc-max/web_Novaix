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
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import {
  IconArrowDown,
  IconArrowUp,
  IconChevronDown,
  IconChevronUp,
  IconPlus,
  IconTrash,
} from "@tabler/icons-react";
import FieldInput from "./FieldInput";
import type { ListFieldDef, SimpleFieldDef } from "@/lib/site-content/fields";

export default function ListField({
  field,
  items = [],
  onChange,
}: {
  field: ListFieldDef;
  items: any[];
  onChange: (newItems: any[]) => void;
}) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);
  const [deleteTarget, setDeleteTarget] = useState<{
    index: number;
    title: string;
  } | null>(null);

  const canAdd = items.length < field.max;
  const canDelete = items.length > field.min;

  const handleAdd = () => {
    if (!canAdd) return;
    const newItem = field.createEmpty();
    const next = [...items, newItem];
    onChange(next);
    setExpandedIndex(next.length - 1);
  };

  const handleConfirmDelete = () => {
    if (deleteTarget === null) return;
    const next = items.filter((_, idx) => idx !== deleteTarget.index);
    onChange(next);
    setDeleteTarget(null);
    if (expandedIndex === deleteTarget.index) {
      setExpandedIndex(null);
    } else if (expandedIndex !== null && expandedIndex > deleteTarget.index) {
      setExpandedIndex(expandedIndex - 1);
    }
  };

  const handleMove = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;

    const next = [...items];
    const [moved] = next.splice(index, 1);
    next.splice(targetIndex, 0, moved);
    onChange(next);
    setExpandedIndex(targetIndex);
  };

  const handleItemFieldChange = (
    itemIdx: number,
    subfieldKey: string,
    val: any,
  ) => {
    const next = [...items];
    next[itemIdx] = {
      ...next[itemIdx],
      [subfieldKey]: val,
    };
    onChange(next);
  };

  return (
    <Box sx={{ mb: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 1.5,
        }}
      >
        <Typography variant="body2" sx={{ fontWeight: 600, fontSize: "13px" }}>
          {field.label} ({items.length}/{field.max})
        </Typography>
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
        {items.map((item, idx) => {
          const isExpanded = expandedIndex === idx;
          const itemTitle = field.itemTitle(item, idx);

          return (
            <Paper
              key={idx}
              variant="outlined"
              sx={{
                borderRadius: "10px",
                borderColor: isExpanded ? "primary.main" : "divider",
                overflow: "hidden",
                transition: "border-color 0.2s ease",
              }}
            >
              {/* Header của item */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  p: 1.25,
                  px: 1.5,
                  bgcolor: isExpanded ? "action.hover" : "background.paper",
                  cursor: "pointer",
                  userSelect: "none",
                }}
                onClick={() => setExpandedIndex(isExpanded ? null : idx)}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    minWidth: 0,
                    flex: 1,
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 600,
                      fontSize: "13px",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {itemTitle}
                  </Typography>
                </Box>

                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Tooltip title="Di chuyển lên">
                    <span>
                      <IconButton
                        size="small"
                        disabled={idx === 0}
                        onClick={() => handleMove(idx, "up")}
                        sx={{ p: 0.5 }}
                      >
                        <IconArrowUp size={16} />
                      </IconButton>
                    </span>
                  </Tooltip>

                  <Tooltip title="Di chuyển xuống">
                    <span>
                      <IconButton
                        size="small"
                        disabled={idx === items.length - 1}
                        onClick={() => handleMove(idx, "down")}
                        sx={{ p: 0.5 }}
                      >
                        <IconArrowDown size={16} />
                      </IconButton>
                    </span>
                  </Tooltip>

                  <Tooltip
                    title={
                      canDelete ? "Xóa mục này" : `Cần ít nhất ${field.min} mục`
                    }
                  >
                    <span>
                      <IconButton
                        size="small"
                        disabled={!canDelete}
                        color="error"
                        onClick={() =>
                          setDeleteTarget({ index: idx, title: itemTitle })
                        }
                        sx={{ p: 0.5 }}
                      >
                        <IconTrash size={16} />
                      </IconButton>
                    </span>
                  </Tooltip>

                  <IconButton
                    size="small"
                    onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                    sx={{ p: 0.5, ml: 0.5 }}
                  >
                    {isExpanded ? (
                      <IconChevronUp size={16} />
                    ) : (
                      <IconChevronDown size={16} />
                    )}
                  </IconButton>
                </Box>
              </Box>

              {/* Form sửa các trường của item */}
              {isExpanded && (
                <Box
                  sx={{
                    p: 2,
                    pt: 1.5,
                    bgcolor: "background.paper",
                    borderTop: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  {field.itemFields.map((subfield) => (
                    <FieldInput
                      key={subfield.key}
                      field={subfield}
                      value={item[subfield.key]}
                      onChange={(val) =>
                        handleItemFieldChange(idx, subfield.key, val)
                      }
                    />
                  ))}
                </Box>
              )}
            </Paper>
          );
        })}
      </Box>

      {/* Nút thêm mục mới */}
      <Button
        variant="outlined"
        fullWidth
        size="small"
        startIcon={<IconPlus size={16} />}
        disabled={!canAdd}
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
        {canAdd
          ? `Thêm mục (${items.length}/${field.max})`
          : `Đã đạt tối đa (${field.max} mục)`}
      </Button>

      {/* Dialog xác nhận xóa */}
      <Dialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
      >
        <DialogTitle sx={{ fontWeight: 600, fontSize: "16px" }}>
          Xác nhận xóa
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ fontSize: "14px" }}>
            Bạn có chắc chắn muốn xóa mục{" "}
            <b>&ldquo;{deleteTarget?.title}&rdquo;</b> không?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setDeleteTarget(null)}
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
            Xóa mục
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
