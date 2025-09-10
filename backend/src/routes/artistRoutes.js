import express from "express";
import { getArtist  } from "../controllers/artistController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/get/:id", protect(["admin", "listener", "artist"]), getArtist);

export default router;
