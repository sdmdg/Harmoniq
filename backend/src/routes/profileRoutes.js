import express from "express";
import {getProPic,
        setProPic,
        updatePassword,
        becomeArtist,
        getArtistDetails,
        updateArtistDetails} from "../controllers/profileController.js";
import { getRecentSongs } from "../controllers/profileController.js";
import { protect } from "../middleware/authMiddleware.js";
import multer from 'multer';

const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();


router.post('/upload-image', protect(["admin","listener","artist"]), upload.single('file'), setProPic);
router.get('/image/:id', protect(["admin","listener","artist"]), getProPic);
router.post('/update-password', protect(["admin", "listener", "artist"]), updatePassword);

router.post('/become-artist', protect(["listener"]), becomeArtist);
router.get('/artist-details/:id', protect(["admin", "artist"]), getArtistDetails);
router.post('/update-artist-details', protect(["admin", "artist"]), updateArtistDetails);

router.get('/recent', protect(["listener","artist"]), getRecentSongs);


export default router;
