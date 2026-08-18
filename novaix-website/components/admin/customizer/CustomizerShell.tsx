"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Snackbar from "@mui/material/Snackbar";
import Typography from "@mui/material/Typography";
import CustomizerToolbar from "./CustomizerToolbar";
import SectionPanel from "./SectionPanel";
import { useDraft } from "./useDraft";
import { useUndo } from "./useUndo";
import { saveHomeContent } from "@/lib/site-content/actions";
import { DEFAULT_HOME_CONTENT } from "@/lib/site-content/defaults";
import { setAt } from "@/lib/site-content/fields";
import type {
  PreviewMessage,
  SectionKey,
} from "@/lib/site-content/preview-bridge";
import type { HomeContent } from "@/lib/site-content/schema";

export default function CustomizerShell({
  initialContent,
  initialUpdatedAt,
  initialUpdatedByName,
}: {
  initialContent: HomeContent;
  initialUpdatedAt: string | null;
  initialUpdatedByName: string | null;
}) {
  const router = useRouter();
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [expandedSections, setExpandedSections] = useState<
    Record<SectionKey, boolean>
  >({
    theme: false,
    nav: false,
    marquee: false,
    hero: false,
    about: false,
    modules: false,
    features: false,
    process: false,
    segments: false,
    pricing: false,
    testimonials: false,
    faq: false,
    articles: false,
    cta: false,
    footer: false,
  });




  const [baseUpdatedAt, setBaseUpdatedAt] = useState<string | null>(
    initialUpdatedAt,
  );
  const [lastSavedContent, setLastSavedContent] =
    useState<HomeContent>(initialContent);

  const [isPending, startTransition] = useTransition();
  const [toast, setToast] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  const [resetAllDialog, setResetAllDialog] = useState(false);
  const [exitConfirmDialog, setExitConfirmDialog] = useState(false);
  const [conflictDialog, setConflictDialog] = useState<string | null>(null);

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const iframeReadyRef = useRef(false);
  const debouncePostTimer = useRef<NodeJS.Timeout | null>(null);

  // Hook quản lý Hoàn tác / Làm lại
  const { current, canUndo, canRedo, undo, redo, pushState, resetHistory } =
    useUndo(initialContent);

  const isDirty = JSON.stringify(current) !== JSON.stringify(lastSavedContent);

  // Hook quản lý bản nháp localStorage
  const { draftDetected, clearDraft } = useDraft(
    lastSavedContent,
    baseUpdatedAt,
    isDirty,
    current,
  );
  const [draftBannerDismissed, setDraftBannerDismissed] = useState(false);

  // Gửi postMessage an toàn sang iframe
  const sendToIframe = useCallback((msg: PreviewMessage) => {
    if (!iframeRef.current?.contentWindow) return;
    try {
      iframeRef.current.contentWindow.postMessage(msg, window.location.origin);
    } catch {}
  }, []);

  // Lắng nghe sự kiện từ iframe
  useEffect(() => {
    function handleMessage(e: MessageEvent) {
      if (e.origin !== window.location.origin) return;
      const msg = e.data as PreviewMessage;
      if (!msg || typeof msg !== "object") return;

      if (msg.type === "preview:ready") {
        iframeReadyRef.current = true;
        sendToIframe({ type: "preview:content", content: current });
      }

      if (msg.type === "preview:section-click") {
        setExpandedSections((prev) => ({
          ...prev,
          [msg.section]: true,
        }));
      }
    }

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [current, sendToIframe]);

  // Đẩy content mới sang iframe (debounce ~80ms khi đang gõ)
  useEffect(() => {
    if (!iframeReadyRef.current) return;

    if (debouncePostTimer.current) {
      clearTimeout(debouncePostTimer.current);
    }

    debouncePostTimer.current = setTimeout(() => {
      sendToIframe({ type: "preview:content", content: current });
    }, 80);

    return () => {
      if (debouncePostTimer.current) clearTimeout(debouncePostTimer.current);
    };
  }, [current, sendToIframe]);

  // Cảnh báo rời trang nếu chưa lưu
  useEffect(() => {
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    }
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  // Cập nhật giá trị trường
  const handleFieldChange = (path: string, val: any) => {
    const updated = setAt(current, path, val);
    pushState(updated, path);
  };

  // Đóng / mở độc lập từng khối accordion
  const handleToggleSection = (section: SectionKey) => {
    const willOpen = !expandedSections[section];
    setExpandedSections((prev) => ({
      ...prev,
      [section]: willOpen,
    }));
    if (willOpen) {
      sendToIframe({ type: "preview:scroll-to", section });
    }
  };

  // Đặt lại 1 khối về mặc định
  const handleResetSection = (sectionKey: SectionKey) => {
    if (sectionKey in DEFAULT_HOME_CONTENT) {
      const defaultSec = (DEFAULT_HOME_CONTENT as any)[sectionKey];
      const updated = {
        ...current,
        [sectionKey]: defaultSec,
      };
      pushState(updated, sectionKey);
    }
    setToast({
      open: true,
      message: `Đã đặt lại khối "${sectionKey}" về mặc định.`,
      severity: "info",
    });
  };


  // Đặt lại toàn bộ về mặc định
  const handleConfirmResetAll = () => {
    pushState(DEFAULT_HOME_CONTENT, "all");
    setResetAllDialog(false);
    setToast({
      open: true,
      message: "Đã đặt lại toàn bộ trang chủ về mặc định.",
      severity: "info",
    });
  };

  // Khôi phục bản nháp
  const handleRestoreDraft = () => {
    if (draftDetected) {
      pushState(draftDetected.content, "draft_restore");
      setDraftBannerDismissed(true);
      setToast({
        open: true,
        message: "Đã khôi phục bản nháp chưa lưu.",
        severity: "info",
      });
    }
  };

  // Bỏ bản nháp
  const handleDiscardDraft = () => {
    clearDraft();
    setDraftBannerDismissed(true);
  };

  // Lưu & Áp dụng
  const handleSave = () => {
    startTransition(async () => {
      const res = await saveHomeContent({
        content: current,
        baseUpdatedAt,
      });

      if (res.ok) {
        setBaseUpdatedAt(res.data.updatedAt);
        setLastSavedContent(current);
        clearDraft();
        resetHistory(current);
        setToast({
          open: true,
          message: "Đã lưu và áp dụng thành công lên website!",
          severity: "success",
        });
      } else {
        if (res.error.includes("Người khác vừa cập nhật")) {
          setConflictDialog(res.error);
        } else {
          setToast({
            open: true,
            message: res.error,
            severity: "error",
          });
        }
      }
    });
  };

  const handleClose = () => {
    if (isDirty) {
      setExitConfirmDialog(true);
    } else {
      router.push("/admin");
    }
  };

  // Hoàn tác tất cả thao tác về trạng thái ban đầu
  const handleRevertAll = () => {
    resetHistory(lastSavedContent);
    setToast({
      open: true,
      message: "Đã hoàn tác toàn bộ thay đổi về trạng thái ban đầu.",
      severity: "info",
    });
  };

  return (
    <Box
      sx={{
        position: "fixed",
        inset: 0,
        zIndex: 1200,
        bgcolor: "background.default",
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        width: "100vw",
      }}
    >
      {/* Top Header / Toolbar */}
      <CustomizerToolbar
        device={device}
        onDeviceChange={setDevice}
        isDirty={isDirty}
        isDraftRestored={!draftBannerDismissed && Boolean(draftDetected)}
        onRevertAll={handleRevertAll}
        onSave={handleSave}
        isSaving={isPending}
        onClose={handleClose}
      />

      {/* Thông báo nếu phát hiện bản nháp cũ */}
      {draftDetected && !draftBannerDismissed && (
        <Alert
          severity="info"
          action={
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button
                color="inherit"
                size="small"
                onClick={handleRestoreDraft}
                sx={{ fontWeight: 700 }}
              >
                Dùng tiếp bản nháp
              </Button>
              <Button color="inherit" size="small" onClick={handleDiscardDraft}>
                Bỏ qua
              </Button>
            </Box>
          }
          sx={{ borderRadius: 0, py: 0.5 }}
        >
          Phát hiện bản nháp chưa lưu trên trình duyệt này (
          {new Date(draftDetected.savedAt).toLocaleTimeString("vi-VN")}).
        </Alert>
      )}

      {/* Main Studio Area */}
      <Box
        sx={{ flex: 1, display: "flex", minHeight: 0, position: "relative" }}
      >
        {/* Left: Canvas / Live Preview */}
        <Box
          sx={{
            flex: 1,
            bgcolor: "#F0F4F8",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            p: device === "mobile" ? 3 : 0,
            overflow: "hidden",
            position: "relative",
          }}
        >
          <Box
            sx={{
              width: device === "mobile" ? "390px" : "100%",
              height: "100%",
              bgcolor: "#070b16",
              borderRadius: device === "mobile" ? "16px" : 0,
              overflow: "hidden",
              boxShadow:
                device === "mobile" ? "0 20px 50px rgba(0,0,0,0.25)" : "none",
              border:
                device === "mobile" ? "1px solid rgba(0,0,0,0.15)" : "none",
              transition:
                "width 0.3s cubic-bezier(0.4, 0, 0.2, 1), border-radius 0.3s ease",
            }}
          >
            <iframe
              ref={iframeRef}
              src="/xem-truoc"
              title="Khung xem trước trang chủ"
              style={{
                width: "100%",
                height: "100%",
                border: 0,
                display: "block",
              }}
            />
          </Box>
        </Box>

        {/* Right: Customizer Sidebar Form Panel */}
        <Box
          sx={{
            width: { xs: "100%", md: "380px", lg: "410px" },
            bgcolor: "background.paper",
            borderLeft: "1px solid",
            borderColor: "divider",
            display: "flex",
            flexDirection: "column",
            overflowY: "auto",
          }}
        >
          <SectionPanel
            content={current}
            onChange={handleFieldChange}
            onResetSection={handleResetSection}
            expandedSections={expandedSections}
            onToggleSection={handleToggleSection}
          />
        </Box>
      </Box>

      {/* Dialog xác nhận đặt lại toàn bộ */}
      <Dialog open={resetAllDialog} onClose={() => setResetAllDialog(false)}>
        <DialogTitle sx={{ fontWeight: 600, fontSize: "16px" }}>
          Đặt lại toàn bộ về mặc định?
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ fontSize: "14px" }}>
            Tất cả nội dung sẽ được đưa về bản mặc định ban đầu. Bạn vẫn có thể
            nhấn <b>Hoàn tác</b> hoặc thoát nếu không muốn lưu.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setResetAllDialog(false)}
            sx={{ textTransform: "none" }}
          >
            Hủy
          </Button>
          <Button
            onClick={handleConfirmResetAll}
            variant="contained"
            color="warning"
            sx={{ textTransform: "none" }}
          >
            Đặt lại tất cả
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog xác nhận thoát khi có thay đổi */}
      <Dialog
        open={exitConfirmDialog}
        onClose={() => setExitConfirmDialog(false)}
      >
        <DialogTitle sx={{ fontWeight: 600, fontSize: "16px" }}>
          Thoát mà không lưu?
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ fontSize: "14px" }}>
            Bạn đang có những thay đổi chưa lưu. Bản nháp sẽ được giữ lại trên
            trình duyệt này để bạn tiếp tục sau.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setExitConfirmDialog(false)}
            sx={{ textTransform: "none" }}
          >
            Ở lại chỉnh sửa
          </Button>
          <Button
            onClick={() => router.push("/admin")}
            color="error"
            sx={{ textTransform: "none" }}
          >
            Rời khỏi
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog xung đột cập nhật */}
      <Dialog
        open={Boolean(conflictDialog)}
        onClose={() => setConflictDialog(null)}
      >
        <DialogTitle
          sx={{ fontWeight: 600, fontSize: "16px", color: "error.main" }}
        >
          Xung đột cập nhật
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ fontSize: "14px" }}>
            {conflictDialog}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => window.location.reload()}
            variant="contained"
            sx={{ textTransform: "none" }}
          >
            Tải lại trang
          </Button>
        </DialogActions>
      </Dialog>

      {/* Toast thông báo */}
      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          severity={toast.severity}
          onClose={() => setToast((prev) => ({ ...prev, open: false }))}
          sx={{ width: "100%", boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
