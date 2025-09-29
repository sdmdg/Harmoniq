// src/routes/recommendationRoutes.js
import express from "express";
import { recommendSongs,getSongBasedRecommendations,recommendByGenre,recommendByMood } from "../controllers/recommendationController.js";

const router = express.Router();

router.get("/getSongs/:userId", recommendSongs);
router.get("/getSongBasedRecommendations/:songId", getSongBasedRecommendations);
router.get("/recommendByMood/:userId/:mood", recommendByMood);
router.get("/recommendByGenre/:userId/:genre", recommendByGenre);

export default router;

