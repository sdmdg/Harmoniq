import db from '../config/db.js'


export const getUserSongs = async (userId) => {
  const queries = {
    liked: `SELECT * FROM get_user_liked_songs_features('${userId}');`,
    history: `SELECT * FROM get_user_recent_history_features('${userId}', 30);`,
    album: `SELECT * FROM get_user_album_songs_features('${userId}');`,
  };

  let allSongs = [];
  for (const [source, query] of Object.entries(queries)) {
    const res = await db.query(query);
    const songs = res.rows.map((row) => ({ ...row, source }));
    allSongs.push(...songs);
  }
  return allSongs;
};
// models/recommendationModel.js
export const getRecommendationsFiltered = async (userVector, filter, value, limit = 20) => {
  console.log('getRecommendationsFiltered:', filter, value);
  const query = `
    WITH user_vec AS (
      SELECT $1::REAL[] AS vector
    )
    SELECT s.id, s.title, s.genre, s.mood,
           cosine_similarity(uv.vector, sf.vector) AS similarity
    FROM songs s
    JOIN song_features sf ON s.id = sf.song_id, user_vec uv
    WHERE s.${filter} = $2
    ORDER BY similarity DESC
    LIMIT $3;
  `;
  const res = await db.query(query, [userVector, value, limit]);
  return res.rows;
};


export const getTopRecommendations = async (userVector, limit = 10) => {
  const query = `
    WITH user_vec AS (
      SELECT $1::REAL[] AS vector
    )
    SELECT sf.song_id, cosine_similarity(uv.vector, sf.vector) AS similarity
    FROM song_features sf, user_vec uv
    ORDER BY similarity DESC
    LIMIT $2;
  `;
  const res = await db.query(query, [userVector, limit]);
  return res.rows;
};
export const generateSongBasedPlaylist = async (songId, limit = 20, pool = 100) => {
  const query = `
    WITH target AS (
      SELECT vector
      FROM song_features
      WHERE song_id = $1
    ),
    ranked AS (
      SELECT s.id, s.title as name, ar.artist_name as artist, s.duration, s.album_id, s.encryption_key,
             a.album_art_id AS albumCover,
             cosine_similarity(sf.vector, t.vector) AS similarity
      FROM song_features sf
      JOIN songs s ON sf.song_id = s.id
      JOIN albums a ON s.album_id = a.id
      JOIN users u ON u.id = a.artist
      JOIN artists ar ON u.id = ar.user_id
      CROSS JOIN target t
      WHERE sf.song_id != $1
      ORDER BY similarity DESC
      LIMIT $2
    )
    SELECT * FROM ranked
    ORDER BY RANDOM()
    LIMIT $3;
  `;

  const res = await db.query(query, [songId, pool, limit]);
  return res.rows;
};
