
import pool from '../config/db.js';
import { findUserById } from '../models/User.js';
import { getAllUsers } from '../models/User.js';



function timeClause(range, tz) {
  // If you want strict local-day boundaries, use date_trunc around a chosen timezone.
  // Works even if your columns are TIMESTAMP WITHOUT TIME ZONE.
  const beginDay = tz
    ? `date_trunc('day', now() AT TIME ZONE '${tz}')`
    : `date_trunc('day', now())`;

  switch (range) {
    case 'today':
      // [today 00:00, tomorrow 00:00)
      return {
        sql: `created_at >= ${beginDay} AND created_at < ${beginDay} + interval '1 day'`
      };
    case '7d':
      // last 7 *calendar* days including today
      return { sql: `created_at >= (${beginDay} - interval '7 day')` };
    case '30d':
      return { sql: `created_at >= (${beginDay} - interval '30 day')` };
    case '':
    case undefined:
    case null:
      return { sql: '' }; // no filter
    default:
      return { sql: '' }; // unknown => no filter
  }
}


export const getRecentActivity = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN READ ONLY');

    const limit  = Math.min(Math.max(parseInt(req.query.limit || '20', 10), 1), 100);
    const offset = Math.max(parseInt(req.query.offset || '0', 10), 0);
    const types  = req.query.types ? req.query.types.split(',').map(s => s.trim()).filter(Boolean) : null;
    const q      = (req.query.q || '').trim();
    const range  = req.query.range || '';
    const tz     = req.query.tz || null; // e.g., 'Asia/Colombo'

    const baseCte = `
      WITH events AS (
        SELECT 'user_signup'::text AS type, u.id::text AS entity_id, ('User #' || u.id::text) AS title,
               NULL::text AS status, u.created_at AS created_at, NULL::text AS actor_id, 'user'::text AS target_type
        FROM users u
        UNION ALL
        SELECT 'artist_added', a.id::text, ('Artist #' || a.id::text), NULL::text, a.created_at, NULL::text, 'artist'
        FROM artists a
        UNION ALL
        SELECT 'song_upload', s.id::text, ('Song #' || s.id::text), NULL::text, s.created_at, NULL::text, 'song'
        FROM songs s
        UNION ALL
        SELECT 'playlist_created', p.id::text, ('Playlist #' || p.id::text), NULL::text, p.created_at, NULL::text, 'playlist'
        FROM playlist p
        UNION ALL
        SELECT 'report_submitted', r.id::text, ('Report #' || r.id::text), NULL::text, r.created_at, NULL::text, 'report'
        FROM reports r
      )
    `;

    const where = [];
    const params = [];
    let i = 1;

    // Time window
    const tc = timeClause(range, tz);
    if (tc.sql) where.push(tc.sql);

    // Type filter
    if (types && types.length) {
      where.push(`type = ANY($${i++}::text[])`);
      params.push(types);
    }

    // Search
    if (q) {
      where.push(`title ILIKE $${i++}`);
      params.push(`%${q}%`);
    }

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
export const adminListUsers = async (req, res) => {
  try {
    const q     = (req.query.q || '').trim();
    const role  = (req.query.role || '').trim(); // '', 'listener', 'artist'
    const page  = Math.max(parseInt(req.query.page || '1', 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || '10', 10), 1), 100);
    const offset = (page - 1) * limit;

    const { rows, total } = await getAllUsers({ q, role, limit, offset });

    res.json({ page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)), users: rows });
  } catch (e) {
    console.error('adminListUsers error:', e);
    res.status(500).json({ message: 'Failed to list users' });
  }
};
