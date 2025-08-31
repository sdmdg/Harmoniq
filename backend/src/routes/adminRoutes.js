import {Router}from 'express';
import {getDashboardStats}from '../controllers/adminController.js';
import{protect} from '../middleware/authMiddleware.js';

const router=Router();

router.get('/dashboard',protect(['admin']),getDashboardStats);
export default router;