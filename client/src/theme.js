import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    background: { default: "#f5f7fb", paper: "#ffffff" },
    primary: { main: "#2f6feb" }, // azul suave
    success: { main: "#22c55e" },
    error: { main: "#ef4444" },
    warning: { main: "#f59e0b" },
    info: { main: "#06b6d4" },
    text: { primary: "#0f172a", secondary: "#475569" },
  },
  shape: { borderRadius: 14 },
  components: {
    MuiPaper: { styleOverrides: { root: { borderRadius: 16 } } },
    MuiCard:  { styleOverrides: { root: { borderRadius: 16 } } },
    MuiButton:{ styleOverrides: { root: { textTransform: "none", borderRadius: 12 } } },
  },
});

export default theme;
