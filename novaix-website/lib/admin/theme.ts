"use client";

import { createTheme } from "@mui/material/styles";

/** Bảng màu & token lấy theo template Modernize (adminmart). */
export const adminTheme = createTheme({
  direction: "ltr",
  palette: {
    primary: { main: "#5D87FF", light: "#ECF2FF", dark: "#4570EA", contrastText: "#ffffff" },
    secondary: { main: "#49BEFF", light: "#E8F7FF", dark: "#23afdb", contrastText: "#ffffff" },
    success: { main: "#13DEB9", light: "#E6FFFA", dark: "#02b3a9", contrastText: "#ffffff" },
    info: { main: "#539BFF", light: "#EBF3FE", dark: "#1682d4", contrastText: "#ffffff" },
    error: { main: "#FA896B", light: "#FDEDE8", dark: "#f3704d", contrastText: "#ffffff" },
    warning: { main: "#FFAE1F", light: "#FEF5E5", dark: "#ae8e59", contrastText: "#ffffff" },
    grey: {
      100: "#F2F6FA",
      200: "#EAEFF4",
      300: "#DFE5EF",
      400: "#7C8FAC",
      500: "#5A6A85",
      600: "#2A3547",
    },
    text: { primary: "#2A3547", secondary: "#5A6A85" },
    background: { default: "#F2F6FA", paper: "#ffffff" },
    divider: "#e5eaef",
    action: { disabledBackground: "rgba(73,82,88,0.12)", hoverOpacity: 0.02, hover: "#f6f9fc" },
  },
  shape: { borderRadius: 7 },
  typography: {
    fontFamily: "var(--font-admin), 'Plus Jakarta Sans', -apple-system, sans-serif",
    h1: { fontWeight: 600, fontSize: "2.25rem", lineHeight: 1.28 },
    h2: { fontWeight: 600, fontSize: "1.875rem", lineHeight: 1.33 },
    h3: { fontWeight: 600, fontSize: "1.5rem", lineHeight: 1.42 },
    h4: { fontWeight: 600, fontSize: "1.3125rem", lineHeight: 1.45 },
    h5: { fontWeight: 600, fontSize: "1.125rem", lineHeight: 1.5 },
    h6: { fontWeight: 600, fontSize: "1rem", lineHeight: 1.57 },
    button: { textTransform: "none", fontWeight: 500 },
    body1: { fontSize: "0.875rem", fontWeight: 400, lineHeight: 1.57 },
    body2: { fontSize: "0.75rem", letterSpacing: "0rem", fontWeight: 400, lineHeight: 1.5 },
    subtitle1: { fontSize: "0.875rem", fontWeight: 500 },
    subtitle2: { fontSize: "0.875rem", fontWeight: 400 },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        "*": { boxSizing: "border-box" },
      },
    },
    MuiCard: {
      defaultProps: { elevation: 0, variant: "outlined" },
      styleOverrides: {
        root: {
          borderRadius: 9,
          borderColor: "#e5eaef",
          boxShadow: "rgba(145, 158, 171, 0.2) 0px 0px 2px 0px, rgba(145, 158, 171, 0.12) 0px 12px 24px -4px",
        },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: { root: { borderRadius: 7, padding: "8px 20px" } },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: "#ffffff",
          "& .MuiOutlinedInput-notchedOutline": { borderColor: "#dfe5ef" },
          "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#5D87FF" },
        },
        input: { padding: "12px 14px" },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: { fontSize: "0.875rem", fontWeight: 600, color: "#2A3547" },
        root: { borderColor: "#e5eaef" },
      },
    },
    MuiChip: {
      styleOverrides: { root: { borderRadius: 6, fontWeight: 500, fontSize: "0.75rem" } },
    },
    MuiPaper: {
      styleOverrides: { root: { backgroundImage: "none" } },
    },
  },
});
