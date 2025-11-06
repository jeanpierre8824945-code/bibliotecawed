import { BrowserRouter, Link, Route, Routes, useParams } from "react-router-dom";
import {
  AppBar, Toolbar, Typography, Box, Drawer, List, ListItem, ListItemButton,
  ListItemText, CssBaseline, Container, Paper, IconButton, Avatar, Divider,
  Button
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
import BookIcon from "@mui/icons-material/Book";
import PeopleIcon from "@mui/icons-material/People";
import ApartmentIcon from "@mui/icons-material/Apartment";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import Dashboard from "./components/Dashboard";
import CrudTable from "./components/CrudTable";
import { useState } from "react";

const tablas = [
  "autores", "libros", "usuarios", "editorial", "prestamo",
  "correo_usuario", "direccion_usuario", "documento_usuario", "telefono_usuario",
  "bibliotecario", "correo_bibliotecario", "telefono_bibliotecario", "horario_bibliotecario",
];

// === Íconos para cada tabla (ajusta si quieres otros)
const iconMap = {
  autores: <PeopleIcon />,
  libros: <BookIcon />,
  usuarios: <PeopleIcon />,
  editorial: <ApartmentIcon />,
  prestamo: <ManageAccountsIcon />,
  correo_usuario: <EmailIcon />,
  telefono_usuario: <PhoneIcon />,
  bibliotecario: <PeopleIcon />,
  correo_bibliotecario: <EmailIcon />,
  telefono_bibliotecario: <PhoneIcon />,
  horario_bibliotecario: <ManageAccountsIcon />,
};

function TablaPage() {
  const { name } = useParams();
  return (
    <Paper elevation={3} sx={{ p: 3, background: "white" }}>
      <CrudTable key={name} table={name} />
    </Paper>
  );
}

export default function App() {
  const drawerWidth = 260;
  const [mobileOpen, setMobileOpen] = useState(false);

  const drawer = (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column", bgcolor: "#f9fafc" }}>
      {/* Encabezado del panel */}
      <Box sx={{ p: 2, display: "flex", alignItems: "center", gap: 1.5 }}>
        <Avatar sx={{ bgcolor: "primary.main" }}>
          <LibraryBooksIcon />
        </Avatar>
        <Box>
          <Typography fontWeight={700}>Sistema de Biblioteca</Typography>
          <Typography variant="caption" color="text.secondary">
            Panel de Administración
          </Typography>
        </Box>
      </Box>
      <Divider />

      {/* Botón volver al inicio */}
      <Box sx={{ px: 2, pt: 2 }}>
        <Button
          fullWidth
          variant="contained"
          color="primary"
          component={Link}
          to="/"
          sx={{
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 600,
            mb: 2,
            boxShadow: "0px 3px 6px rgba(0,0,0,0.1)",
          }}
          onClick={() => setMobileOpen(false)}
        >
          ⬅ Volver al Inicio
        </Button>
      </Box>

      {/* Listado de tablas */}
      <Typography
        variant="subtitle2"
        sx={{ px: 2, pt: 1, pb: 1, color: "text.secondary", fontWeight: 600 }}
      >
        Tablas disponibles
      </Typography>

      <List sx={{ px: 1, overflowY: "auto", flexGrow: 1 }}>
        {tablas.map((t) => (
          <ListItem key={t} disablePadding>
            <ListItemButton
              component={Link}
              to={`/tabla/${t}`}
              onClick={() => setMobileOpen(false)}
              sx={{
                borderRadius: 2,
                mx: 1,
                mb: 0.5,
                color: "#1e293b",
                "&:hover": { backgroundColor: "primary.light", color: "white" },
              }}
            >
              {/* Ícono + texto */}
              {iconMap[t] && (
                <Box sx={{ mr: 1, display: "flex", alignItems: "center" }}>
                  {iconMap[t]}
                </Box>
              )}
              <ListItemText
                primaryTypographyProps={{
                  fontWeight: 500,
                  fontSize: "0.95rem",
                  textTransform: "capitalize",
                }}
                primary={t.replaceAll("_", " ")}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Divider />
      <Box sx={{ p: 2, color: "text.secondary", textAlign: "center" }}>
        <Typography variant="caption">
          © {new Date().getFullYear()} — Biblioteca Web
        </Typography>
      </Box>
    </Box>
  );

  return (
    <BrowserRouter>
      <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
        <CssBaseline />

        {/* Topbar */}
        <AppBar
          position="fixed"
          elevation={1}
          color="inherit"
          sx={{
            borderBottom: "1px solid #e5e7eb",
            backdropFilter: "blur(8px)",
          }}
        >
          <Toolbar>
            <IconButton
              onClick={() => setMobileOpen(!mobileOpen)}
              sx={{ mr: 2, display: { md: "none" } }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" sx={{ fontWeight: 700, color: "primary.main" }}>
              Gestión de Tablas
            </Typography>
          </Toolbar>
        </AppBar>

        {/* Drawer */}
        <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
          {/* Mobile */}
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={() => setMobileOpen(false)}
            ModalProps={{ keepMounted: true }}
            sx={{
              display: { xs: "block", md: "none" },
              "& .MuiDrawer-paper": { width: drawerWidth },
            }}
          >
            {drawer}
          </Drawer>
          {/* Desktop */}
          <Drawer
            variant="permanent"
            open
            sx={{
              display: { xs: "none", md: "block" },
              "& .MuiDrawer-paper": { width: drawerWidth },
            }}
          >
            {drawer}
          </Drawer>
        </Box>

        {/* Contenido principal */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: { xs: 2, md: 4 },
            mt: 8,
            width: { md: `calc(100% - ${drawerWidth}px)` },
          }}
        >
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route
              path="/tabla/:name"
              element={
                <Container maxWidth="lg">
                  <TablaPage />
                </Container>
              }
            />
            <Route
              path="*"
              element={
                <Container>
                  <Paper sx={{ p: 4 }}>Página no encontrada</Paper>
                </Container>
              }
            />
          </Routes>
        </Box>
      </Box>
    </BrowserRouter>
  );
}
