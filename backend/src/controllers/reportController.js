import {
  createReport,
  getAllReports,
  updateReportStatus,
  deleteReportById
} from "../models/Report.js";

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

// controllers/reportController.js
export const setReportStatus = async (req, res) => {
  const { id } = req.params
  const { status } = req.body
  const allowed = ['in_progress', 'rejected', 'completed']
  if (!allowed.includes(status)) {
    return res.status(400).json({ message: 'Invalid status' })
  }
  try {
    const { rows } = await pool.query(
      `UPDATE reports SET status = $1 WHERE id = $2 RETURNING id, status`,
      [status, id]
    )
    if (!rows.length) return res.status(404).json({ message: 'Report not found' })
    res.json(rows[0])
  } catch (e) {
    console.error('Error updating status:', e)
    res.status(500).json({ message: 'Failed to update status' })
  }
}


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
