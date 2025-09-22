import express from "express";
import multer from 'multer';
import { setSong,setUserSong, updateSong , deleteSong,getSongById,listSongsAdmin, updateSongProgress} from "../controllers/songController.js";
import { protect } from "../middleware/authMiddleware.js";


const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();
router.get("/", protect(["admin"]), listSongsAdmin);
router.post('/upload-song', protect(["admin","listener","artist"]), upload.single('file'), setSong);
router.post('/normal-upload-song', protect(["admin","listener"]), upload.single('file'), setUserSong);
router.post('/publish', protect(["admin","listener","artist"]), upload.single('file'), updateSong);

router.post('/update', protect(["listener","artist"]), updateSongProgress);

router.get("/:id", protect(["admin", "listener", "artist"]), getSongById);
router.delete("/:id", protect(["admin"]), deleteSong);
export default router;