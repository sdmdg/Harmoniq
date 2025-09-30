// src/routes/recommendationRoutes.js
import express from "express";
import { recommendSongs,getSongBasedRecommendations,recommendByGenre,recommendByMood,createPlaylistWithRecommendations } from "../controllers/recommendationController.js";
import { protect } from "../middleware/authMiddleware.js";
const router = express.Router();

router.get("/getSongs/:userId", recommendSongs);
router.get("/getSongBasedRecommendations/:songId", getSongBasedRecommendations);
router.get("/recommendByMood/:userId/:mood", recommendByMood);
router.get("/recommendByGenre/:userId/:genre", recommendByGenre);
router.post("/createWithRecommendations", protect(["listener", "artist"]), createPlaylistWithRecommendations);
export default router;

