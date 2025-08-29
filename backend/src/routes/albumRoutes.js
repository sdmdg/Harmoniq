import express from "express";
import { getAlbum, getAlbumsByUserId ,addAlbum  } from "../controllers/albumController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/get/:album_id", protect(["admin", "listener", "artist"]), getAlbum);
router.get("/user/:userId", protect(["artist"]), getAlbumsByUserId);
router.post("/add", protect(["admin", "artist"]), addAlbum);

export default router;
