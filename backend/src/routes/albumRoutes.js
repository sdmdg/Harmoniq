import express from "express";
import { getAlbum } from "../controllers/albumController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/get/:album_id", protect(["admin", "listener", "artist"]), getAlbum);


export default router;
