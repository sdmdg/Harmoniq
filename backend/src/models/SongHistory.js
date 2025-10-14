import db from '../config/db.js'

// Convert INTERVAL to seconds
const intervalToSeconds = (interval) => {
  if (!interval) return 0
  if (typeof interval === 'string') {
    return interval.split(':').reduce((acc, t) => 60 * acc + +t, 0)
  }
  if (typeof interval === 'object') {
    const { hours = 0, minutes = 0, seconds = 0 } = interval
    return hours * 3600 + minutes * 60 + seconds
  }
  return 0
}

// Get the most recent history entry
export const getLatestSongHistory = async (userId, songId) => {
  const result = await db.query(`
    SELECT *
    FROM song_history
    WHERE user_id = $1 AND song_id = $2
    ORDER BY last_played DESC
    LIMIT 1
  `, [userId, songId])
  return result.rows[0] || null
}

// Insert a new listening record
export const insertSongHistory = async (userId, songId, listenedSeconds) => {
  const query = `
    INSERT INTO song_history (id, user_id, song_id, listen_time, last_played)
    VALUES (uuid_generate_v4(), $1, $2, make_interval(secs => $3), NOW())
  `
  await db.query(query, [userId, songId, listenedSeconds])
}

export const updateSongHistory = async (userId, songId, listenedSeconds, songDuration) => {
  const history = await getLatestSongHistory(userId, songId)
  const now = new Date()

  if (history) {
    const lastPlayed = new Date(history.last_played)
    const elapsed = (now - lastPlayed) / 1000 // seconds since last update

    // Define "same session" window:
    // whichever is larger: song duration OR 3 minutes
    const sessionWindow = Math.max(songDuration, 180)

    if (elapsed <= sessionWindow) {
      // Same session → update this record
      let newSeconds = 0
      const prevSeconds = intervalToSeconds(history.listen_time)
      if (listenedSeconds < prevSeconds) {
        newSeconds = prevSeconds + listenedSeconds
      } else {
        newSeconds = Math.max(prevSeconds, listenedSeconds)
      }
    
      const query = `
        UPDATE song_history
        SET
          listen_time = make_interval(secs => $1),
          last_played = NOW()
        WHERE id = $2
      `
      await db.query(query, [newSeconds, history.id])
      return
    }
  }

  // Otherwise → new session
  await insertSongHistory(userId, songId, listenedSeconds)
}

export const getDuration = async (trackId) => {
  const result = await db.query(`
    SELECT duration FROM songs WHERE id = $1
  `, [trackId])
  return result.rows[0] || null
}

// Get recently played songs for current user
export const getRecentSongsByUser = async (userId, limit = 10) => {
  const query = `
    SELECT 
      s.id as id,
      s.id as path,
      s.title as name,
      a.title AS album,
      s.encryption_key AS key,
      a.album_art_id AS albumCover,
      ar.artist_name AS artist,
      EXTRACT(MINUTE FROM s.duration)::int || ';' || EXTRACT(SECOND FROM s.duration)::int AS duration,
      COUNT(h.song_id) AS play_count,
      MAX(h.last_played) AS last_played
    FROM song_history h
    LEFT JOIN songs s ON h.song_id = s.id
    LEFT JOIN albums a ON s.album_id = a.id
    LEFT JOIN artists ar ON a.artist = ar.user_id
    WHERE h.user_id = $1 AND a.published = true AND a.is_blocked = false AND s.encryption_key is not NULL
    GROUP BY s.id, s.title, a.title, a.album_art_id, ar.artist_name
    ORDER BY play_count DESC, last_played DESC
    LIMIT $2;
  `;

  const { rows } = await db.query(query, [userId, limit]);
  return rows;
};

// Most played songs globally
export const getMostPlayedSongs = async (limit = 24) => {
  const query = `
    SELECT 
        s.id AS id,
        s.id AS path,
        s.title AS name,
        a.title AS album,
        s.encryption_key AS key,
        a.album_art_id AS albumCover,
        ar.artist_name AS artist,
        EXTRACT(MINUTE FROM s.duration)::int || ';' || EXTRACT(SECOND FROM s.duration)::int AS duration,
        SUM(COALESCE(EXTRACT(EPOCH FROM sh.listen_time), 0)) AS total_listen_seconds,
        ROUND(
          SUM(COALESCE(EXTRACT(EPOCH FROM sh.listen_time), 0)) 
          / NULLIF(EXTRACT(EPOCH FROM s.duration), 0)
        ) AS play_count
    FROM song_history sh
    JOIN songs s ON sh.song_id = s.id
    JOIN albums a ON s.album_id = a.id
    LEFT JOIN artists ar ON a.artist = ar.user_id
    WHERE a.published = true AND a.is_blocked = false AND s.encryption_key is not NULL
    GROUP BY s.id, a.id, ar.artist_name, a.album_art_id, s.duration
    ORDER BY total_listen_seconds DESC
    LIMIT $1;
  `;
  const { rows } = await db.query(query, [limit]);
  return rows;
};

export const getTrendingAlbums = async (limit = 20) => {
  const query = `
    SELECT 
      a.id, 
      a.title, 
      ar.artist_name AS artist, 
      a.album_art_id AS cover,
      SUM(COALESCE(EXTRACT(EPOCH FROM sh.listen_time), 0)) AS total_listen_seconds
    FROM song_history sh
    JOIN songs s ON sh.song_id = s.id
    JOIN albums a ON s.album_id = a.id
    LEFT JOIN artists ar ON a.artist = ar.user_id
    WHERE a.id != '4cec3d10-17b2-42ec-9dbf-440630bfaaea' AND a.published = true AND a.is_blocked = false AND s.encryption_key is not NULL
    GROUP BY a.id, a.title, ar.artist_name, a.album_art_id
    ORDER BY total_listen_seconds DESC
    LIMIT $1
  `;

  const { rows } = await db.query(query, [limit]);
  return rows;
};

// Recently released songs globally
export const getRecentReleases = async (limit = 12) => {
  const query = `
    SELECT 
      a.id,
      a.title,
      ar.artist_name AS artist,
      a.album_art_id AS cover,
      a.release_date
    FROM albums a
    LEFT JOIN artists ar ON a.artist = ar.user_id
    WHERE a.id != '4cec3d10-17b2-42ec-9dbf-440630bfaaea' AND a.published = true AND a.is_blocked = false
    ORDER BY a.release_date DESC
    LIMIT $1
  `;

  const { rows } = await db.query(query, [limit]);
  return rows;
};

export const getTrendingArtists = async (userId, limit = 12) => {
  const query = `
    WITH album_listens AS (
      SELECT 
        a.id AS album_id,
        a.artist AS artist_id,
        SUM(EXTRACT(EPOCH FROM sh.listen_time)) AS total_listens
      FROM albums a
      LEFT JOIN songs s ON s.album_id = a.id
      LEFT JOIN song_history sh ON sh.song_id = s.id
      GROUP BY a.id
    ),
    artist_top_album AS (
      SELECT DISTINCT ON (al.artist_id)
        al.artist_id
      FROM album_listens al
      ORDER BY al.artist_id, al.total_listens DESC
    )
    SELECT
      ar.id,
      ar.artist_name AS name,
      COUNT(DISTINCT sh.user_id) AS listenerCount,
      (MAX(CASE WHEN f.follower_id IS NOT NULL THEN 1 ELSE 0 END) = 1) AS "isFollowing",
      u.pic_path AS cover
    FROM artists ar
    LEFT JOIN followers f 
      ON f.follower_id = $1 AND f.followed_id = ar.id
    LEFT JOIN songs s ON s.album_id IN (
      SELECT id FROM albums WHERE artist = ar.user_id
    )
    LEFT JOIN song_history sh ON sh.song_id = s.id
    LEFT JOIN users u ON u.id = ar.user_id
    WHERE ar.user_id != $1 AND s.encryption_key is not NULL
    GROUP BY ar.id, ar.artist_name, u.pic_path
    HAVING MAX(CASE WHEN f.follower_id IS NOT NULL THEN 1 ELSE 0 END) = 0
    ORDER BY listenerCount DESC
    LIMIT $2
  `;

  const { rows } = await db.query(query, [userId, limit]);

  return rows.map(row => ({
    ...row,
    listenerCount: row.listenercount >= 1_000_000
      ? Math.floor(row.listenercount / 1_000_000) + "M"
      : row.listenercount >= 1_000
      ? Math.floor(row.listenercount / 1_000) + "K"
      : String(row.listenercount),
  }));
};


