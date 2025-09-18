
import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import albumRoutes from "./routes/albumRoutes.js";
import artistRoutes from "./routes/artistRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import playlistRoutes from "./routes/playlistRoutes.js";
import songsRoutes from "./routes/songsRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import cors from "cors";
import morgan from "morgan";
import pool from "./config/db.js";
import adminRoutes from "./routes/adminRoutes.js";
import searchRoutes from "./routes/searchRoutes.js";

dotenv.config();

const app = express();
app.use(express.json());
// Allow requests from frontend
app.use(cors({
  origin: "*",   // or "*" for all origins
  methods: ["*"],
  allowedHeaders: ["*"]
}));
app.use(morgan("dev"));

app.use("/api/auth", authRoutes);
app.use("/api/album", albumRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/artist", artistRoutes);
app.use("/api/playlist", playlistRoutes);
app.use("/api/songs", songsRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/search", searchRoutes);

const startServer = async () => {
  try {
    // Check database connection
    await pool.query("SELECT NOW()");
    console.log("Connected to PostgreSQL database");

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () =>
      console.log(`Server running at http://localhost:${PORT}`)
    );
  } catch (error) {
    console.error("Failed to connect to database or start server:", error);
    process.exit(1);
  }
};

startServer();