import {Router}from 'express';
import {getDashboardStats,getRecentActivity,getUsersignupById,adminListUsers}from '../controllers/adminController.js';

import{protect} from '../middleware/authMiddleware.js';

const router=Router();

router.get('/dashboard',protect(['admin']),getDashboardStats);
router.get('/activity',protect(['admin']),getRecentActivity);
router.get('/users',protect(['admin']),adminListUsers);
router.get("/usersignup/:id", protect(["admin"]), getUsersignupById);
export default router;