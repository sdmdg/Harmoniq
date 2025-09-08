import express from "express";
import { getAlbum, getAlbumsByUserId ,addAlbum ,uploadAlbumArt } from "../controllers/albumController.js";
import { protect } from "../middleware/authMiddleware.js";
import multer from "multer";
const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() }); // Use memory storage
router.get("/get/:album_id", protect(["admin", "listener", "artist"]), getAlbum);
router.get("/user/:userId", protect(["artist"]), getAlbumsByUserId);
router.post("/add", protect(["admin", "artist"]), addAlbum);
router.post("/upload-art", protect(["admin", "artist"]), upload.single("file"), uploadAlbumArt);

export default router;
