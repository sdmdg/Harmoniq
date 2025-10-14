import express from "express";
import {
  getAlbum,
  getAlbumsByUserId,
  addAlbum,
  uploadAlbumArt,
  getSongsByAlbumId,
  deleteAlbum,
  listAllAlbums,
  blockAlbum,
  unblockAlbum,
  AlbumChangeVisibility,
} from "../controllers/albumController.js";
import { protect } from "../middleware/authMiddleware.js";
import multer from "multer";
const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() }); // Use memory storage
router.get(
  "/get/:album_id",
  protect(["admin", "listener", "artist"]),
  getAlbum
);
router.get("/user/:userId", protect(["artist"]), getAlbumsByUserId);
router.post("/add", protect(["admin", "artist"]), addAlbum);
router.post(
  "/upload-art",
  protect(["admin", "artist"]),
  upload.single("file"),
  uploadAlbumArt
);
router.get(
  "/album_songs/:albumId",
  protect(["admin", "listener", "artist"]),
  getSongsByAlbumId
);
router.delete("/delete/:albumId", protect(["admin", "artist"]), deleteAlbum);
router.get("/list", protect(["admin", "listener", "artist"]), listAllAlbums);
router.patch("/:albumId/block", protect(["admin"]), blockAlbum);
router.patch("/:albumId/unblock", protect(["admin"]), unblockAlbum);
router.patch("/visibility/:albumId", protect(["admin", "artist"]), AlbumChangeVisibility);
export default router;
