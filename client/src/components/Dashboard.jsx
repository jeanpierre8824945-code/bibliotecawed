import { Grid, Paper, Typography, Box, Chip } from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
import GroupsIcon from "@mui/icons-material/Groups";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";

function StatCard({ icon, label, value, delta, color="success" }) {
  return (
    <Paper elevation={2} sx={{ p: 2.5 }}>
      <Box display="flex" alignItems="center" gap={2}>
        <Box sx={{ p: 1.2, borderRadius: 2, bgcolor: "primary.main", color: "white", display: "inline-flex" }}>
          {icon}
        </Box>
        <Box>
          <Typography variant="subtitle2" color="text.secondary">{label}</Typography>
          <Typography variant="h5" fontWeight={700}>{value}</Typography>
        </Box>
        <Chip
          sx={{ ml: "auto" }}
          size="small"
          icon={<TrendingUpIcon />}
          color={color}
          label={delta}
          variant="outlined"
        />
      </Box>
    </Paper>
  );
}

export default function Dashboard() {
  return (
    <Grid container spacing={3}>
      <Grid item xs={12}><Typography variant="h5" fontWeight={700}>Resumen General</Typography></Grid>

      <Grid item xs={12} md={6} lg={3}>
        <StatCard icon={<LibraryBooksIcon />} label="Total Libros" value="1,335" delta="+12%" />
      </Grid>
      <Grid item xs={12} md={6} lg={3}>
        <StatCard icon={<LibraryBooksIcon />} label="Libros Disponibles" value="892" delta="+5%" />
      </Grid>
      <Grid item xs={12} md={6} lg={3}>
        <StatCard icon={<AssignmentTurnedInIcon />} label="Préstamos Activos" value="178" delta="+3%" />
      </Grid>
      <Grid item xs={12} md={6} lg={3}>
        <StatCard icon={<GroupsIcon />} label="Usuarios Activos" value="324" delta="+15%" />
      </Grid>

      <Grid item xs={12}><Typography variant="h6" sx={{ mt: 2 }}>Análisis de Actividad</Typography></Grid>

      {/* Tarjetas de panel (lugares para tus gráficos) */}
      <Grid item xs={12} md={7}>
        <Paper sx={{ p: 3, height: 360 }}>
          <Typography fontWeight={600} gutterBottom>Préstamos Mensuales</Typography>
          <Box sx={{ height: 280, borderRadius: 2, bgcolor: "#eef2ff" }} />
        </Paper>
      </Grid>
      <Grid item xs={12} md={5}>
        <Paper sx={{ p: 3, height: 360 }}>
          <Typography fontWeight={600} gutterBottom>Distribución por Género</Typography>
          <Box sx={{ height: 280, borderRadius: 2, bgcolor: "#e0f7fa" }} />
        </Paper>
      </Grid>
    </Grid>
  );
}
