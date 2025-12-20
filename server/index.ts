import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";

import authRoutes from "./routes/auth";
import addressRoutes from "./routes/addresses";
import mapboxRoutes from "./routes/mapbox";

const app = express();
const port = process.env.PORT || 8080;
const isProduction = process.env.NODE_ENV === "production";

// Middleware
app.use(
  cors({
    origin: isProduction
      ? true
      : process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/addresses", addressRoutes);
app.use("/api", mapboxRoutes);

// Serve frontend in production
if (isProduction) {
  const frontendPath = path.join(__dirname, "../frontend/dist");
  app.use(express.static(frontendPath));

  // SPA fallback - serve index.html for all non-API routes
  app.get("/{*splat}", (req, res) => {
    res.sendFile(path.join(frontendPath, "index.html"));
  });
} else {
  app.get("/", (req, res) => {
    res.json({ status: "ok", message: "Navigation API" });
  });
}

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
