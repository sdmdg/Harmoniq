import express from "express";
import { getArtist, followArtist, unfollowArtist,searchArtists } from "../controllers/artistController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/get/:id", protect(["admin", "listener", "artist"]), getArtist);
router.get("/search/:albumId", protect(["admin", "listener", "artist"]), searchArtists);

// Follow/Unfollow an artist
router.post('/follow', protect(["admin", "listener", "artist"]), followArtist);
router.post('/unfollow', protect(["admin", "listener", "artist"]), unfollowArtist);

export default router;
