import {Router}from 'express';
import {getDashboardStats,getRecentActivity,getUsersignupById,adminListUsers}from '../controllers/adminController.js';
import * as ctl from '../controllers/adminController.js'
import{protect} from '../middleware/authMiddleware.js';

const router=Router();

router.get('/dashboard',protect(['admin']),getDashboardStats);
router.get('/activity',protect(['admin']),getRecentActivity);
router.get('/users',protect(['admin']),adminListUsers);
router.get("/usersignup/:id", protect(["admin"]), getUsersignupById);
router.get('/users/:id/summary', ctl.getUserSummary)        // left panel header cards
router.get('/users/:id/activities', ctl.getUserActivities)  // unified activity timeline
router.get('/users/:id/liked', ctl.getUserLikedSongs)       // liked songs (paged)
router.get('/users/:id/playlists', ctl.getUserPlaylists)    // playlists grid
router.get('/users/:id/uploads', ctl.getUserUploads)        // uploaded songs (paged)
router.get('/users/:id/reports', ctl.getUserReports)
export default router;