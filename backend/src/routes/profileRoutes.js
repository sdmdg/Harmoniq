import express from "express";

import { getProPic,setProPic } from "../controllers/profileController.js";
import { protect } from "../middleware/authMiddleware.js";
import multer from 'multer';

const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();

router.post('/upload-image', protect(["admin","listener","artist"]), upload.single('file'), setProPic);
router.get('/image/:id', protect(["admin","listener","artist"]), getProPic);

export default router;
