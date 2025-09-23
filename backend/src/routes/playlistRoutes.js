import express from "express";
import { createPlaylist, getUserPlaylists, getPlaylist,getLikedSongs } from "../controllers/playlistController.js";
import { protect } from "../middleware/authMiddleware.js";
const router = express.Router();

router.post('/add', protect(["listener","artist"]), createPlaylist);
router.get('/get/all', protect(["listener","artist"]), getUserPlaylists);
router.get("/get/:playlist_id", protect(["admin", "listener", "artist"]), getPlaylist);
router.get("/liked-songs/:user_id", protect(["listener", "artist"]), getLikedSongs);


export default router;
