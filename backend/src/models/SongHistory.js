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

// Insert a brand new listening record
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
      s.id,
      s.title,
      a.title AS album,
      a.album_art_id AS cover_image,
      ar.artist_name AS artist,
      COUNT(h.song_id) AS play_count,
      MAX(h.last_played) AS last_played
    FROM song_history h
    LEFT JOIN songs s ON h.song_id = s.id
    LEFT JOIN albums a ON s.album_id = a.id
    LEFT JOIN artists ar ON a.artist = ar.user_id
    WHERE h.user_id = $1
    GROUP BY s.id, s.title, a.title, a.album_art_id, ar.artist_name
    ORDER BY play_count DESC, last_played DESC
    LIMIT $2;
  `;

  const { rows } = await db.query(query, [userId, limit]);
  return rows;
};