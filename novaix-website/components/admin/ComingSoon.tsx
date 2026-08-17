import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";

export default function ComingSoon({
  icon,
  title,
  points,
}: {
  icon: string;
  title: string;
  points: string[];
}) {
  return (
    <Card>
      <CardContent sx={{ py: 6, textAlign: "center" }}>
        <Box sx={{ fontSize: 46, mb: 1.5 }}>{icon}</Box>
        <Typography variant="h4" sx={{ mb: 1 }}>
          {title}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Chức năng đang được phát triển. Dự kiến sẽ gồm:
        </Typography>

        <Box
          component="ul"
          sx={{
            m: "0 auto",
            p: 0,
            maxWidth: 460,
            listStyle: "none",
            textAlign: "left",
            display: "grid",
            gap: 1,
          }}
        >
          {points.map((p) => (
            <Box
              component="li"
              key={p}
              sx={{
                display: "flex",
                gap: 1.5,
                alignItems: "flex-start",
                bgcolor: "grey.100",
                borderRadius: 2,
                px: 2,
                py: 1.25,
              }}
            >
              <Box sx={{ color: "primary.main", fontWeight: 700, lineHeight: 1.6 }}>·</Box>
              <Typography variant="body1">{p}</Typography>
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
}
