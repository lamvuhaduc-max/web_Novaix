import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

export default function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <Box
      sx={{
        mb: 3,
        display: "flex",
        flexWrap: "wrap",
        gap: 2,
        alignItems: "flex-start",
        justifyContent: "space-between",
      }}
    >
      <Box>
        <Typography variant="h3" sx={{ mb: description ? 0.5 : 0 }}>
          {title}
        </Typography>
        {description && (
          <Typography variant="body1" color="text.secondary">
            {description}
          </Typography>
        )}
      </Box>
      {action}
    </Box>
  );
}
