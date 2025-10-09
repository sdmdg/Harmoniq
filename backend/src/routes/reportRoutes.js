import express from 'express';
import {protect} from '../middleware/authMiddleware.js';
import { postReport,listReports,setReportStatus,removeReport,getReportById } from '../controllers/reportController.js';

const router=express.Router();
router.post('/',protect(['listener','admin','artist']),postReport);

router.get('/',protect(['admin']),listReports);
router.put('/:id/status', protect(['admin']), setReportStatus);
router.delete('/:id',protect(['admin']),removeReport);
router.put('/:id/status', protect(['admin']), setReportStatus)
router.get('/:id', protect(['admin']), getReportById)

export default router;