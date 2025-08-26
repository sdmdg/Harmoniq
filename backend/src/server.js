import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import albumRoutes from "./routes/albumRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import playlistRoutes from "./routes/playlistRoutes.js";

import cors from "cors";
import morgan from "morgan";
import pool from "./config/db.js";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());
app.use(morgan("dev"));

app.use("/api/auth", authRoutes);
app.use("/api/album", albumRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/playlist", playlistRoutes);

const startServer = async () => {
  try {
    // Check database connection
    await pool.query("SELECT NOW()");
    console.log("✅ Connected to PostgreSQL database");

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () =>
      console.log(`🚀 Server running at http://localhost:${PORT}`)
    );
  } catch (error) {
    console.error("❌ Failed to connect to database or start server:", error);
    process.exit(1);
  }
};

startServer();