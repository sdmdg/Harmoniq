import pool from "../config/db.js";  

export const searchTracks = async (query) => {
  const sql = `
    SELECT s.id as id, s.title AS name, s.duration::TEXT AS duration, 
           s.encryption_key AS key,
           a.title AS album, ar.artist_name AS artist, 
           aa.album_art_id AS album_cover
    FROM songs s
    JOIN albums a ON s.album_id = a.id
    JOIN artists ar ON a.artist = ar.user_id
    LEFT JOIN albums aa ON aa.id = a.id
    WHERE LOWER(s.title) LIKE LOWER($1) AND a.published = true AND s.encryption_key is not NULL
    LIMIT 10
  `;
  const values = [`%${query}%`];
  const { rows } = await pool.query(sql, values);
  return rows;
};

export const searchAlbums = async (query) => {
  const sql = `
    SELECT a.id, a.title AS name, ar.artist_name AS artist, a.album_art_id AS album_cover
    FROM albums a
    JOIN artists ar ON a.artist = ar.user_id
    WHERE LOWER(a.title) LIKE LOWER($1) AND a.published = true
    LIMIT 10
  `;
  const values = [`%${query}%`];
  const { rows } = await pool.query(sql, values);
  return rows;
};

export const searchArtists = async (query) => {
  const sql = `
    SELECT ar.id AS id, ar.artist_name AS name, u.id AS userId, u.pic_path as pic, u.user_name, ar.description, u.password, u.email
    FROM artists ar
    JOIN users u ON ar.user_id = u.id
    WHERE LOWER(ar.artist_name) LIKE LOWER($1)
    LIMIT 10
  `;
  const values = [`%${query}%`];
  const { rows } = await pool.query(sql, values);
  return rows.map(r => ({
    id: r.id,
    name: r.name,
    photo: r.pic,
  }));
};
