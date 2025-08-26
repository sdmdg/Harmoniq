import express from "express";
import { createPlaylist, getUserPlaylists } from "../controllers/playlistController.js";
import { protect } from "../middleware/authMiddleware.js";
const router = express.Router();

router.post('/add', protect(["listener","artist"]), createPlaylist);
router.get('/get', protect(["listener","artist"]), getUserPlaylists);

export default router;
