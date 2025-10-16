import pool from "../config/db.js";

export async function findUserByEmail(email) {
  const result = await pool.query("SELECT * FROM Users WHERE email = $1", [
    email,
  ]);
  return result.rows[0];
}

export async function createUser({ username, email, role, password }) {
  console.info(username);
  const result = await pool.query(
    `INSERT INTO Users (user_name, email, password, role)
     VALUES ($1, $2, $3, $4)
     RETURNING user_name, email, role`,
    [username, email, password, role]
  );
  return result.rows[0];
}

export const fetchAlbumData = async (albumId, isAdmin=true) => {
  // First, check if the album exists and get its details
  const albumQuery = `
        SELECT
            a.id,
            a.title AS name,
            ar.id AS artistId,
            EXTRACT(YEAR FROM a.release_date) AS "releaseYear",
            a.album_art_id AS "albumCover",
            ar.artist_name AS "artistName"
        FROM albums a
        JOIN artists ar ON a.artist = ar.user_id
        WHERE a.id = $1
          AND (
            (a.is_blocked = false AND a.published = true)
            OR ($2::boolean = true)
          );
    `;

  const albumResult = await pool.query(albumQuery, [albumId, isAdmin]);

  // If no album is found, return null
  if (albumResult.rows.length === 0) {
    return null;
  }

  const albumData = albumResult.rows[0];

  // Next, get all the songs for this album
  const songsQuery = `
        SELECT
            id,
            title AS name,
            FLOOR(EXTRACT(MINUTE FROM duration))::integer AS minutes,
            FLOOR(EXTRACT(SECOND FROM duration))::integer AS seconds,
            encryption_key AS "key",
            track_number
        FROM songs
        WHERE album_id = $1
        ORDER BY track_number ASC;
    `;
  const songsResult = await pool.query(songsQuery, [albumId]);

  // Map the database rows to the desired track format, including the new duration object and path
  const tracks = songsResult.rows.map((song) => ({
    id: song.id,
    name: song.name,
    // Construct the path using the song's ID and the ".mp3" extension
    path: `${song.id}.mp3`,
    // Create a duration string from the minutes and seconds
    duration: `${song.minutes};${song.seconds}`,
    key: song.key,
  }));

  // Combine the album details and tracks into a single object
  const fullAlbum = {
    id: albumData.id,
    name: albumData.name,
    albumCover: albumData.albumCover,
    artist: albumData.artistName,
    artistId: albumData.artistid,
    releaseYear: albumData.releaseYear,
    tracks: tracks,
  };

  return fullAlbum;
};

export const ModelDeleteAlbum = async (albumId) => {
  const deleteAlbumQuery = "DELETE FROM albums WHERE id = $1 RETURNING *";
  const result = await pool.query(deleteAlbumQuery, [albumId]);
  return result.rows[0];
};

export const listAllAlbumsmodel = async (
  search = "",
  page = 1,
  limit = 20,
  includeBlocked = "true"
) => {
  let whereClause = "";
  let queryParams = [];
  let paramIndex = 1;

  // Add search filter if provided
  if (search && search.trim()) {
    whereClause = `WHERE (LOWER(a.title) LIKE $${paramIndex} OR LOWER(ar.artist_name) LIKE $${paramIndex})`;
    queryParams.push(`%${search.toLowerCase()}%`);
    paramIndex++;
  }

  // Add blocked filter if not including blocked albums
  if (includeBlocked !== "true") {
    if (whereClause) {
      whereClause += ` AND a.is_blocked = false`;
    } else {
      whereClause = `WHERE a.is_blocked = false`;
    }
  }

  const query = `SELECT
        a.id,
        a.title AS name,
        ar.artist_name AS "artistName",
        EXTRACT(YEAR FROM a.release_date) AS "releaseYear",
        a.album_art_id AS "albumCover",
        a.is_blocked AS "isBlocked",
        COUNT(s.id)::int AS "trackCount"
      FROM albums a
      JOIN artists ar ON a.artist = ar.user_id
      LEFT JOIN songs s ON s.album_id = a.id
      ${whereClause}
      GROUP BY a.id, ar.artist_name
      ORDER BY a.created_at DESC;
    `;

  const result = await pool.query(query, queryParams);
  return result.rows;
};
export const blockAlbummodel = async (albumId) => {
  const query = `UPDATE albums
      SET is_blocked = TRUE
      WHERE id = $1
      RETURNING id, title AS name, is_blocked AS "isBlocked";`;
  const result = await pool.query(query, [albumId]);
  return result.rows[0];
};

export const unBlockAlbummodel = async (albumId) => {
  const query = `UPDATE albums
      SET is_blocked = FALSE
      WHERE id = $1
      RETURNING id, title AS name, is_blocked AS "isBlocked";`;
  const result = await pool.query(query, [albumId]);
  return result.rows[0];
};


export const AlbumChangeVisibilityModel = async (albumId, userID, bool) => {
  const query = `UPDATE albums
      SET published = $3
      WHERE id = $1 AND artist = $2
      RETURNING id, title AS name, is_blocked AS "isBlocked";`;
  const result = await pool.query(query, [albumId, userID, bool]);
  return result.rows[0];
};

export const getAlbumNotificationData = async (albumId) => {
  const sql = `
    SELECT
      a.id AS album_id,
      a.title AS album_name,
      a.album_art_id AS album_cover,
      ar.artist_name as artist_name,
      ar.id AS artist_id,
	  u.pic_path as artist_image
    FROM albums a
    JOIN users u ON a.artist = u.id
	  JOIN artists ar ON u.id = ar.user_id
    WHERE a.id = $1
  `;
  const result = await pool.query(sql, [albumId]);
  return result.rows[0];
};

export const getFollowersModel = async (artistId) => {
  const sql = `
    SELECT u.email
    FROM followers f
    JOIN users u ON f.follower_id = u.id
    WHERE f.followed_id = $1;
  `;
  const result = await pool.query(sql, [artistId]);
  return result.rows;
};