import express from 'express';
import {protect} from '../middleware/authMiddleware.js';
import { postReport,listReports,setReportStatus,removeReport } from '../controllers/reportController.js';

const router=express.Router();
router.post('/',protect(['listener','admin','artist']),postReport);

router.get('/',protect(['admin']),listReports);
router.patch('/:id',protect(['admin']),setReportStatus);
router.delete('/:id',protect(['admin']),removeReport);
router.put('/:id/status', protect(['admin']), setReportStatus)

export default router;