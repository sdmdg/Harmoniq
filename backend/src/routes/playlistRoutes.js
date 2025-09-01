import express from "express";
import { createPlaylist, getUserPlaylists, getPlaylist } from "../controllers/playlistController.js";
import { protect } from "../middleware/authMiddleware.js";
const router = express.Router();

router.post('/add', protect(["listener","artist"]), createPlaylist);
router.get('/get/all', protect(["listener","artist"]), getUserPlaylists);
router.get("/get/:playlist_id", protect(["admin", "listener", "artist"]), getPlaylist);

export default router;
