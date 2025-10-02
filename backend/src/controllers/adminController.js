
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
// ✅ keep this one (no change except try/catch is optional)
export async function getUserSummary(req, res) {
  try {
    const { id } = req.params
    const sql = `
      SELECT
        u.id, u.user_name, u.email, u.role, u.created_at, u.pic_path,
        (SELECT COUNT(*) FROM liked_songs WHERE user_id=u.id) AS liked_count,
        (SELECT COUNT(*) FROM playlist WHERE user_id=u.id) AS playlist_count,
        (SELECT COUNT(*) FROM users_songs WHERE user_id=u.id) AS upload_count,
        (SELECT COUNT(*) FROM reports WHERE user_id=u.id) AS report_count,
        (
          SELECT MAX(ts) FROM (
            SELECT MAX(created_at) ts FROM liked_songs WHERE user_id=u.id
            UNION ALL
            SELECT MAX(created_at) ts FROM playlist WHERE user_id=u.id
            UNION ALL
            SELECT MAX(created_at) ts FROM users_songs WHERE user_id=u.id
            UNION ALL
            SELECT MAX(created_at) ts FROM reports WHERE user_id=u.id
          ) t
        ) AS last_active
      FROM users u
      WHERE u.id=$1
    `
    const r = await pool.query(sql, [id])
    if (!r.rows.length) return res.status(404).json({ message: 'User not found' })
    res.json(r.rows[0])
  } catch (e) {
    console.error('getUserSummary failed:', e)
    res.status(500).json({ message: 'Failed to load user summary' })
  }
}

// ✅ FIXED: report activity now uses r.reason (no song_id/playlist_id used)
export async function getUserActivities(req, res) {
  try {
    const { id } = req.params
    const { type = 'all', page = 1, limit = 20, range = 'all' } = req.query
    const pgLimit = Math.min(Number(limit) || 20, 100)
    const offset = (Math.max(Number(page) || 1, 1) - 1) * pgLimit

    const dateFilter =
      range === '7d' ? "AND created_at >= NOW() - INTERVAL '7 days'"
      : range === '30d' ? "AND created_at >= NOW() - INTERVAL '30 days'"
      : ''

    const pieces = []
    if (type === 'all' || type === 'liked') {
      pieces.push(`
        SELECT 'liked'::text AS activity_type, s.song_id::text AS ref_id,
               (SELECT title FROM songs WHERE id=s.song_id) AS title,
               s.created_at
        FROM liked_songs s
        WHERE s.user_id=$1 ${dateFilter}
      `)
    }
    if (type === 'all' || type === 'playlist') {
      pieces.push(`
        SELECT 'playlist'::text AS activity_type, p.id::text AS ref_id, p.title, p.created_at
        FROM playlist p
        WHERE p.user_id=$1 ${dateFilter}
      `)
    }
    if (type === 'all' || type === 'uploaded') {
      pieces.push(`
        SELECT 'uploaded'::text AS activity_type, us.song_id::text AS ref_id,
               (SELECT title FROM songs WHERE id=us.song_id) AS title, us.created_at
        FROM users_songs us
        WHERE us.user_id=$1 ${dateFilter}
      `)
    }
    if (type === 'all' || type === 'report') {
      pieces.push(`
        SELECT 'report'::text AS activity_type, r.id::text AS ref_id,
               COALESCE(r.description, 'Report submitted') AS title,
               r.created_at
        FROM reports r
        WHERE r.user_id=$1 ${dateFilter}
      `)
    }

    const union = pieces.join(' UNION ALL ')
    const sql = `SELECT * FROM (${union}) a ORDER BY a.created_at DESC OFFSET $2 LIMIT $3;`
    const totalSql = `SELECT COUNT(*)::int AS c FROM (${union}) a;`

    const data = (await pool.query(sql, [id, offset, pgLimit])).rows
    const total = (await pool.query(totalSql, [id])).rows[0].c
    res.json({ data, total, page: Number(page) || 1, limit: pgLimit })
  } catch (e) {
    console.error('getUserActivities failed:', e)
    res.status(500).json({ message: 'Failed to load activities' })
  }
}

export async function getUserLikedSongs(req, res) {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const pgLimit = Math.min(Number(limit) || 20, 100);
    const offset  = (Math.max(Number(page) || 1, 1) - 1) * pgLimit;

    const sql = `
      SELECT
        s.song_id,
        s.created_at,
        sg.title,
        sg.duration,
        NULLIF(string_agg(DISTINCT ar.artist_name, ', '), '') AS artists
      FROM liked_songs s
      JOIN songs sg            ON sg.id = s.song_id
      LEFT JOIN users_songs us ON us.song_id = sg.id
      LEFT JOIN artists ar     ON ar.user_id = us.user_id
      WHERE s.user_id = $1
      GROUP BY s.song_id, s.created_at, sg.title, sg.duration
      ORDER BY s.created_at DESC
      OFFSET $2 LIMIT $3;
    `;
    const count = `SELECT COUNT(*)::int AS c FROM liked_songs WHERE user_id = $1;`;

    const rows  = (await pool.query(sql, [id, offset, pgLimit])).rows;
    const total = (await pool.query(count, [id])).rows[0].c;
    res.json({ data: rows, total, page: Number(page) || 1, limit: pgLimit });
  } catch (e) {
    console.error('getUserLikedSongs failed:', e);
    res.status(500).json({ message: 'Failed to load liked songs' });
  }
}


export async function getUserPlaylists(req, res) {
  try {
    const { id } = req.params
    const rows = (await pool.query(
      `SELECT id, title, created_at FROM playlist WHERE user_id=$1 ORDER BY created_at DESC`,
      [id]
    )).rows
    res.json(rows)
  } catch (e) {
    console.error('getUserPlaylists failed:', e)
    res.status(500).json({ message: 'Failed to load playlists' })
  }
}
// ✅ matches users_songs(user_id, song_id, created_at)
export async function getUserUploads(req, res) {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const pgLimit = Math.min(Number(limit) || 20, 100);
    const offset  = (Math.max(Number(page) || 1, 1) - 1) * pgLimit;

    const rows = (await pool.query(
      `SELECT
         sg.id,
         sg.title,
         sg.created_at,
         ar.artist_name
       FROM users_songs us
       JOIN songs sg    ON sg.id = us.song_id
       LEFT JOIN artists ar ON ar.user_id = us.user_id
       WHERE us.user_id = $1
       ORDER BY us.created_at DESC
       OFFSET $2 LIMIT $3`,
      [id, offset, pgLimit]
    )).rows;

    const total = (await pool.query(
      `SELECT COUNT(*)::int AS c FROM users_songs WHERE user_id = $1`,
      [id]
    )).rows[0].c;

    res.json({ data: rows, total, page: Number(page) || 1, limit: pgLimit });
  } catch (e) {
    console.error('getUserUploads failed:', e);
    res.status(500).json({ message: 'Failed to load uploads' });
  }
}


// ✅ FIXED: no song_id/playlist_id here; return the columns you actually have
export async function getUserReports(req, res) {
  try {
    const { id } = req.params
    const rows = (await pool.query(
      `SELECT id, user_id, description,status,category,issue_type, created_at
       FROM reports
       WHERE user_id=$1
       ORDER BY created_at DESC`,
      [id]
    )).rows
    res.json(rows)
  } catch (e) {
    console.error('getUserReports failed:', e)
    res.status(500).json({ message: 'Failed to load reports' })
  }
}
