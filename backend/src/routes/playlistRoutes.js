import express from "express";
import {
  createPlaylist,
  getUserPlaylists,
  getPlaylists,
  getLikedSongs,
  getPlaylistDetails,
  getPlaylistAlbums,
  addSongToPlaylist,
  getPlaylistsForSong,
  deletePlaylist,
  deleteSongFromPlaylist,
  copyPlaylist
} from "../controllers/playlistController.js";
import { protect } from "../middleware/authMiddleware.js";
const router = express.Router();

router.post("/add", protect(["listener", "artist", "admin"]), createPlaylist)
router.post("/add-song", protect(["listener", "artist", "admin"]), addSongToPlaylist);
router.post("/delete-song", protect(["listener", "artist", "admin"]), deleteSongFromPlaylist);
router.post("/copy-playlist", protect(["listener", "artist", "admin"]), copyPlaylist);
router.get('/:songId/playlists', protect(["listener","artist","admin"]), getPlaylistsForSong);
router.delete('/delete/:playlistId', protect(["listener","artist","admin"]), deletePlaylist);
router.get(
  "/get/all",
  protect(["listener", "artist", "admin"]),
  getUserPlaylists
);
router.get(
  "/get/:playlist_id",
  protect(["admin", "listener", "artist"]),
  getPlaylists
);
router.get(
  "/playlist_details/:playlist_id",
  protect(["admin", "listener", "artist"]),
  getPlaylistDetails
);
router.get(
  "/playlist_albums/:playlist_id",
  protect(["admin", "listener", "artist"]),
  getPlaylistAlbums
);
router.get(
  "/liked-songs/:user_id",
  protect(["listener", "artist", "admin"]),
  getLikedSongs
);

export default router;
