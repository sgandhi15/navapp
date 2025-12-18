import "dotenv/config";
import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth";
import addressRoutes from "./routes/addresses";
import mapboxRoutes from "./routes/mapbox";

const app = express();
const port = process.env.PORT || 8080;

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/addresses", addressRoutes);
app.use("/api", mapboxRoutes); // /api/geocode and /api/route

// Health check
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "Navigation API" });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
