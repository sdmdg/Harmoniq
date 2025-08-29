import pool from '../config/db.js';
export async function createReport(userId, description, category, issueType) {
  const { rows } = await pool.query(
    `INSERT INTO reports (user_id, description, category, issue_type, status)
     VALUES ($1, $2, $3, $4, 'pending')
     RETURNING id, user_id, description, category, issue_type, status, created_at`,
    [userId, description, category, issueType]
  )
  return rows[0]
}
// export async function createReport(userId, description) {
//   const { rows } = await pool.query(
//     `INSERT INTO Reports (user_id, description)
//      VALUES ($1, $2)
//      RETURNING id, user_id, description, status, created_at`,
//     [userId, description]
//   );
//   return rows[0];
// }

export async function getAllReports() {
  const { rows } = await pool.query(
    `SELECT
       r.id,
       r.user_id,
       u.user_name AS reporter_name,
       u.email     AS reporter_email,
       r.description,
       r.category,
       r.issue_type,
       r.status,
       r.created_at
     FROM reports r
     LEFT JOIN users u ON u.id = r.user_id
     ORDER BY r.created_at DESC`
  )
  return rows
}

export async function updateReportStatus(id, status) {
  const { rows } = await pool.query(
    `UPDATE Reports SET status = $1 WHERE id = $2
     RETURNING id, user_id, description, status, created_at`,
    [status, id]
  );
  return rows[0];
}

export async function deleteReportById(id) {
  const result = await pool.query(`DELETE FROM Reports WHERE id = $1`, [id]);
  return result.rowCount > 0;
}