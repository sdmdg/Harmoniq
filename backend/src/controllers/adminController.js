// controllers/adminController.js
import pool from '../config/db.js';
import { findUserById } from '../models/User.js';




function timeClause(range) {
  // Since we don't rely on per-table created_at, we map ranges to a no-op filter.
  // (All rows get 'created_at = now()' so filters still "work" but aren't meaningful yet.)
  switch ((range || '').toLowerCase()) {
    case 'today':
    case '7d':
    case '30d':
    default:
      return { sql: 'TRUE', params: [] };
  }
}

export const getRecentActivity = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN READ ONLY'); // safety: prevent writes

    const limit  = Math.min(Math.max(parseInt(req.query.limit || '20', 10), 1), 100);
    const offset = Math.max(parseInt(req.query.offset || '0', 10), 0);
    const types  = req.query.types ? req.query.types.split(',').map(s => s.trim()).filter(Boolean) : null;
    const q      = (req.query.q || '').trim();
    const range  = req.query.range || '';

    // 👇 Ultra-safe UNION: only uses `id` from each table. No optional columns.
    // `created_at` is synthesized with `now()` so the query is stable and sortable.
    const baseCte = `
      WITH events AS (
        SELECT 'user_signup'::text AS type,
               u.id::text         AS entity_id,
               ('User #' || u.id::text) AS title,
               NULL::text         AS status,
               now()               AS created_at,
               NULL::text          AS actor_id,
               'user'::text       AS target_type
        FROM users u

        UNION ALL
        SELECT 'artist_added',
               a.id::text,
               ('Artist #' || a.id::text),
               NULL::text,
               now(),
               NULL::text,
               'artist'
        FROM artists a

        UNION ALL
        SELECT 'song_upload',
               s.id::text,
               ('Song #' || s.id::text),
               NULL::text,
               now(),
               NULL::text,
               'song'
        FROM songs s

        UNION ALL
        SELECT 'playlist_created',
               p.id::text,
               ('Playlist #' || p.id::text),
               NULL::text,
               now(),
               NULL::text,
               'playlist'
        FROM playlist p

        UNION ALL
        SELECT 'report_submitted',
               r.id::text,
               ('Report #' || r.id::text),
               NULL::text,
               now(),
               NULL::text,
               'report'
        FROM reports r
      )
    `;

    const where = [];
    const params = [];
    let i = 1;

    const tc = timeClause(range);
    where.push(tc.sql);

    if (types && types.length) { where.push(`type = ANY($${i++}::text[])`); params.push(types); }
    if (q) { where.push(`title ILIKE $${i++}`); params.push(`%${q}%`); }

    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

    params.push(limit, offset);

    const sql = `
      ${baseCte}
      SELECT type, entity_id, title, status, created_at, actor_id, target_type
      FROM events
      ${whereSql}
      ORDER BY created_at DESC
      LIMIT $${i++}
      OFFSET $${i++}
    `;

    const { rows } = await client.query(sql, params);
    await client.query('COMMIT');
    res.json(rows);
  } catch (e) {
    try { await client.query('ROLLBACK'); } catch {}
    console.error('Recent activity error:', e);
    res.status(500).json({ message: 'Failed to fetch recent activity' });
  } finally {
    client.release();
  }
};


export const getDashboardStats = async (req, res) => {
  try {
    const [usersResult, artistsResult, songsResult, playlistsResult] =
      await Promise.all([
        pool.query('SELECT COUNT(*) FROM users'),
        // If you prefer counting artists by role in users:
        // pool.query("SELECT COUNT(*) FROM users WHERE role = 'artist'"),
        pool.query('SELECT COUNT(*) FROM artists'),
        pool.query('SELECT COUNT(*) FROM songs'),
        pool.query('SELECT COUNT(*) FROM playlist'),
      ]);

    res.json({
      totalUsers:     parseInt(usersResult.rows[0].count, 10),
      totalArtists:   parseInt(artistsResult.rows[0].count, 10),
      totalSongs:     parseInt(songsResult.rows[0].count, 10),
      totalPlaylists: parseInt(playlistsResult.rows[0].count, 10),
    });
  } catch (error) {
    console.error('Admin Dashboard Error:', error);
    res.status(500).json({ error: 'Failed to fetch admin dashboard stats' });
  }
};
// controllers/userController.js

export const getUsersignupById = async (req, res) => {
  try {
    const { id } = req.params;
    const u = await findUserById(id);

    if (!u) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      id: u.id,
      user_name: u.user_name,
      role: u.role,
      created_at: u.created_at,
      profile_pic: u.pic_path,
      email: u.email
    });
  } catch (error) {
    console.error("Get User Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
