import { Router } from "express";
import {
  getDashboardStats,
  getRecentActivity,
  getUsersignupById,
  adminListUsers,
} from "../controllers/adminController.js";
import * as ctl from "../controllers/adminController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/dashboard", protect(["admin"]), getDashboardStats);
router.get("/activity", protect(["admin"]), getRecentActivity);
router.get("/users", protect(["admin"]), adminListUsers);
router.get("/usersignup/:id", protect(["admin"]), getUsersignupById);
router.get("/users/:id/summary", protect(["admin"]), ctl.getUserSummary); // left panel header cards
router.get("/users/:id/activities", protect(["admin"]), ctl.getUserActivities); // unified activity timeline
router.get("/users/:id/liked", protect(["admin"]), ctl.getUserLikedSongs); // liked songs (paged)
router.get("/users/:id/playlists", protect(["admin"]), ctl.getUserPlaylists); // playlists grid
router.get("/users/:id/uploads", protect(["admin"]), ctl.getUserUploads); // uploaded songs (paged)
router.get("/users/:id/reports", protect(["admin"]), ctl.getUserReports);
export default router;
