"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
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
import { IconKey, IconPencil, IconTrash, IconUserPlus } from "@tabler/icons-react";
import PageHeader from "./PageHeader";
import {
  createMember,
  deleteMember,
  resetMemberPassword,
  updateMember,
  type ActionResult,
  type MemberRow,
} from "@/lib/admin/users-actions";
import { roleLabel } from "@/lib/admin/menu";
import type { UserRole, UserStatus } from "@/lib/db/schema";

type DialogState =
  | { kind: "closed" }
  | { kind: "create" }
  | { kind: "edit"; member: MemberRow }
  | { kind: "password"; member: MemberRow }
  | { kind: "delete"; member: MemberRow };

const dateFormatter = new Intl.DateTimeFormat("vi-VN", { dateStyle: "short", timeStyle: "short" });

export default function MembersTable({
  members,
  currentUserId,
}: {
  members: MemberRow[];
  currentUserId: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [dialog, setDialog] = useState<DialogState>({ kind: "closed" });
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // Trường nhập dùng chung cho các dialog.
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("admin");
  const [status, setStatus] = useState<UserStatus>("active");

  function openCreate() {
    setName(""); setEmail(""); setPassword(""); setRole("admin"); setStatus("active");
    setError(null);
    setDialog({ kind: "create" });
  }

  function openEdit(member: MemberRow) {
    setName(member.name); setEmail(member.email); setRole(member.role); setStatus(member.status);
    setError(null);
    setDialog({ kind: "edit", member });
  }

  function openPassword(member: MemberRow) {
    setPassword("");
    setError(null);
    setDialog({ kind: "password", member });
  }

  function run(fn: () => Promise<ActionResult>, successMessage: string) {
    setError(null);
    startTransition(async () => {
      const res = await fn();
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setDialog({ kind: "closed" });
      setToast(successMessage);
      router.refresh();
    });
  }

  return (
    <>
      <PageHeader
        title="Quản lý thành viên"
        description="Tạo tài khoản, phân vai trò và khóa quyền truy cập vào khu quản trị."
        action={
          <Button variant="contained" startIcon={<IconUserPlus size={18} />} onClick={openCreate}>
            Thêm thành viên
          </Button>
        }
      />

      <Card>
        <TableContainer>
          <Table sx={{ minWidth: 720 }}>
            <TableHead>
              <TableRow>
                <TableCell>Thành viên</TableCell>
                <TableCell>Vai trò</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell>Ngày tạo</TableCell>
                <TableCell align="right">Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {members.map((m) => (
                <TableRow key={m.id} hover>
                  <TableCell>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Avatar sx={{ width: 38, height: 38, bgcolor: "primary.light", color: "primary.main", fontSize: 14, fontWeight: 600 }}>
                        {m.name.trim().charAt(0).toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1">
                          {m.name}
                          {m.id === currentUserId && (
                            <Box component="span" sx={{ color: "text.secondary", fontWeight: 400 }}> (bạn)</Box>
                          )}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">{m.email}</Typography>
                      </Box>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={roleLabel[m.role]}
                      color={m.role === "super_admin" ? "primary" : "secondary"}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={m.status === "active" ? "Đang hoạt động" : "Đã khóa"}
                      sx={{
                        bgcolor: m.status === "active" ? "success.light" : "error.light",
                        color: m.status === "active" ? "success.dark" : "error.dark",
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body1" color="text.secondary">
                      {dateFormatter.format(new Date(m.createdAt))}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Sửa thông tin">
                      <IconButton size="small" onClick={() => openEdit(m)}>
                        <IconPencil size={18} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Đặt lại mật khẩu">
                      <IconButton size="small" onClick={() => openPassword(m)}>
                        <IconKey size={18} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={m.id === currentUserId ? "Không thể xóa chính mình" : "Xóa thành viên"}>
                      <span>
                        <IconButton
                          size="small"
                          color="error"
                          disabled={m.id === currentUserId}
                          onClick={() => { setError(null); setDialog({ kind: "delete", member: m }); }}
                        >
                          <IconTrash size={18} />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}

              {members.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 6, color: "text.secondary" }}>
                    Chưa có thành viên nào.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Thêm / Sửa */}
      <Dialog
        open={dialog.kind === "create" || dialog.kind === "edit"}
        onClose={() => setDialog({ kind: "closed" })}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>{dialog.kind === "edit" ? "Sửa thành viên" : "Thêm thành viên"}</DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ pt: 1 }}>
            {error && <Alert severity="error">{error}</Alert>}
            <TextField label="Họ và tên" value={name} onChange={(e) => setName(e.target.value)} fullWidth />
            <TextField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} fullWidth />
            {dialog.kind === "create" && (
              <TextField
                label="Mật khẩu"
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                helperText="Tối thiểu 8 ký tự. Gửi cho thành viên và yêu cầu đổi sau lần đăng nhập đầu."
                fullWidth
              />
            )}
            <TextField select label="Vai trò" value={role} onChange={(e) => setRole(e.target.value as UserRole)} fullWidth>
              <MenuItem value="admin">Admin — đăng bài & sửa nội dung giao diện</MenuItem>
              <MenuItem value="super_admin">Super Admin — toàn quyền, quản lý thành viên</MenuItem>
            </TextField>
            {dialog.kind === "edit" && (
              <TextField select label="Trạng thái" value={status} onChange={(e) => setStatus(e.target.value as UserStatus)} fullWidth>
                <MenuItem value="active">Đang hoạt động</MenuItem>
                <MenuItem value="disabled">Khóa truy cập</MenuItem>
              </TextField>
            )}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button color="inherit" onClick={() => setDialog({ kind: "closed" })}>Hủy</Button>
          <Button
            variant="contained"
            disabled={pending}
            onClick={() =>
              dialog.kind === "edit"
                ? run(() => updateMember({ id: dialog.member.id, name, email, role, status }), "Đã cập nhật thành viên.")
                : run(() => createMember({ name, email, password, role }), "Đã tạo thành viên mới.")
            }
          >
            {pending ? "Đang lưu…" : "Lưu"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Đặt lại mật khẩu */}
      <Dialog open={dialog.kind === "password"} onClose={() => setDialog({ kind: "closed" })} fullWidth maxWidth="xs">
        <DialogTitle>Đặt lại mật khẩu</DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ pt: 1 }}>
            {error && <Alert severity="error">{error}</Alert>}
            {dialog.kind === "password" && (
              <Typography variant="body1" color="text.secondary">
                Cho tài khoản <strong>{dialog.member.email}</strong>.
              </Typography>
            )}
            <TextField
              label="Mật khẩu mới"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              helperText="Tối thiểu 8 ký tự."
              fullWidth
              autoFocus
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button color="inherit" onClick={() => setDialog({ kind: "closed" })}>Hủy</Button>
          <Button
            variant="contained"
            disabled={pending}
            onClick={() =>
              dialog.kind === "password" &&
              run(() => resetMemberPassword({ id: dialog.member.id, password }), "Đã đổi mật khẩu.")
            }
          >
            {pending ? "Đang lưu…" : "Đổi mật khẩu"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Xóa */}
      <Dialog open={dialog.kind === "delete"} onClose={() => setDialog({ kind: "closed" })} fullWidth maxWidth="xs">
        <DialogTitle>Xóa thành viên</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 0.5 }}>
            {error && <Alert severity="error">{error}</Alert>}
            {dialog.kind === "delete" && (
              <Typography variant="body1">
                Xóa vĩnh viễn <strong>{dialog.member.name}</strong> ({dialog.member.email})? Thao tác này không thể hoàn tác.
              </Typography>
            )}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button color="inherit" onClick={() => setDialog({ kind: "closed" })}>Hủy</Button>
          <Button
            variant="contained"
            color="error"
            disabled={pending}
            onClick={() => dialog.kind === "delete" && run(() => deleteMember(dialog.member.id), "Đã xóa thành viên.")}
          >
            {pending ? "Đang xóa…" : "Xóa"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={Boolean(toast)}
        autoHideDuration={3500}
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert severity="success" onClose={() => setToast(null)} variant="filled">
          {toast}
        </Alert>
      </Snackbar>
    </>
  );
}
