import {
  createReport,
  getAllReports,
  updateReportStatus,
  deleteReportById
} from "../models/Report.js";
import { getReportById as getReportByIdModel } from '../models/Report.js'
const ALLOWED_STATUSES = ["pending", "completed", "rejected"];
const CATEGORIES = ['Content Issues', 'User & Safety', 'Technical Issues']
const ISSUE_TYPES = {
  'Content Issues': ['mislabel', 'copyright', 'quality', 'offensive', 'unavailable'],
  'User & Safety':  ['impersonation', 'harassment', 'spam'],
  'Technical Issues': ['app_crash', 'playback', 'auth', 'sync'],
}
export const postReport = async (req, res) => {
  try {
    const { description, category, issueType } = req.body || {}

    // Basic validation
    if (!description || !description.trim()) {
      return res.status(400).json({ message: 'Description is required' })
    }
    if (!category || !CATEGORIES.includes(category)) {
      return res.status(400).json({ message: 'Invalid or missing category' })
    }
    if (!issueType || !ISSUE_TYPES[category]?.includes(issueType)) {
      return res.status(400).json({ message: 'Invalid or missing issueType for category' })
    }

    const report = await createReport(
      req.user.id,                 // assumes auth middleware sets req.user
      description.trim(),
      category,
      issueType
    )

    return res.status(201).json(report)
  } catch (e) {
    console.error('Error creating report:', e)
    return res.status(500).json({ message: 'Failed to create report' })
  }
}
// export const postReport = async (req, res) => {
//   const { description } = req.body;

//   if (!req.user?.id) {
//     return res.status(401).json({ message: "Unauthorized" });
//   }
//   if (!description || !description.trim()) {
//     return res.status(400).json({ message: "Description is required" });
//   }

//   try {
//     const report = await createReport(req.user.id, description.trim());
//     // return created row as-is; UI maps fields in ReportView.vue
//     return res.status(201).json(report);
//   } catch (e) {
//     console.error("Error creating report:", e);
//     return res.status(500).json({ message: "Failed to create report" });
//   }
// };

export const listReports = async (req, res) => {
  try {
    // optional: ensure newest first in your SQL/model
    const rows = await getAllReports();
    return res.status(200).json(rows);
  } catch (e) {
    console.error("Error fetching reports:", e);
    return res.status(500).json({ message: "Failed to fetch reports" });
  }
};

export const setReportStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  // only allow these
  
const allowed = ['pending', 'in_progress', 'rejected', 'completed'];

  if (!allowed.includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  try {
    const row = await updateReportStatus(id, status); // ✅ call model
    if (!row) return res.status(404).json({ message: 'Report not found' });
    return res.json(row);
  } catch (e) {
    console.error('Error updating status:', e);
    return res.status(500).json({ message: 'Failed to update status' });
  }
};


export const removeReport = async (req, res) => {
  try {
    const ok = await deleteReportById(req.params.id);
    if (!ok) return res.status(404).json({ message: "Report not found" });
    return res.status(204).send(); // UI just removes it client-side
  } catch (e) {
    console.error("removeReport error:", e);
    return res.status(500).json({ message: "Failed to delete report" });
  }
};


export async function getReportById(req, res) {
  try {
    const report = await getReportByIdModel(req.params.id)
    if (!report) return res.status(404).json({ message: 'Report not found' })
    res.json(report)
  } catch (err) {
    console.error('Error fetching report:', err)
    res.status(500).json({ message: 'Failed to fetch report' })
  }
}
