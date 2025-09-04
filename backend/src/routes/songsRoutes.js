import express from "express";
import multer from 'multer';
import { setSong, updateSong } from "../controllers/songController.js";
import { protect } from "../middleware/authMiddleware.js";


const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();

router.post('/upload-song', protect(["admin","listener","artist"]), upload.single('file'), setSong);
router.post('/publish', protect(["admin","listener","artist"]), upload.single('file'), updateSong);
//router.get('/song/:id', protect(["admin","listener","artist"]), getSong);

export default router;
