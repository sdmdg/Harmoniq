import {Router}from 'express';
import {getSearchResults} from '../controllers/searchController.js';
import{protect} from '../middleware/authMiddleware.js';

const router=Router();

router.get('/all', protect(['listener','admin','artist']), getSearchResults);

export default router;