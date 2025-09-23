import db from '../config/db.js';

export const findAlbumsByUserId = async (userId) => {
    try {
        const query = 'SELECT id, title,album_art_id FROM albums WHERE artist = $1;';
        const result = await db.query(query, [userId]);
        return result.rows; // return all albums, not just the first
    } catch (error) {
        console.error('Error finding albums by user ID:', error);
        throw error;
    }
};
export const findSongsByAlbumId = async (albumId) => {
    try {
        const query = 'SELECT id, title, encryption_key FROM songs WHERE album_id = $1;';
        const result = await db.query(query, [albumId]);
        return result.rows; 
    } catch (error) {
        console.error('Error finding songs by album ID:', error);
        throw error;
    }
};

export const createAlbum = async ({ title, artist, releaseDate, albumArtId }) => {
    try {
        const query = `
            INSERT INTO albums (title, artist, release_date, album_art_id)
            VALUES ($1, $2, $3, $4)
            RETURNING id, title, artist, release_date, created_at, album_art_id;
        `;
        const values = [title, artist, releaseDate, albumArtId];

        const result = await db.query(query, values);
        return result.rows[0]; // returns the newly created album
    } catch (error) {
        console.error('Error creating album:', error);
        throw error;
    }
};

export const findArtistById = async (id) => {
  const result = await db.query(
    `SELECT a.id,
            a.artist_name,
            a.description,
            a.created_at,
            u.user_name,
            u.email,
            u.role,
            u.pic_path
     FROM artists a
     JOIN users u ON a.user_id = u.id
     WHERE a.id = $1`,
    [id]
  );
  return result.rows[0];
};

export const findArtistByName = async (name) => {
  const result = await db.query(
    `SELECT id, artist_name, description, created_at
     FROM artists
     WHERE id = $1`,
    [id]
  );
  return result.rows[0];
};
export const searchArtistsByAlbumId = async (albumId) => {
  const result = await db.query(
    `SELECT a.user_id, a.artist_name
     FROM artists a
     JOIN albums al ON a.user_id = al.artist
     WHERE al.id = $1`,
    [albumId]
  );
  return result.rows;
};

export const addFollower = async (followerId, followedId) => {
  const query = `
    INSERT INTO followers (follower_id, followed_id)
    VALUES ($1, $2)
    ON CONFLICT DO NOTHING
    RETURNING *;
  `;
  const { rows } = await db.query(query, [followerId, followedId]);
  return rows[0];
};

export const removeFollower = async (followerId, followedId) => {
  const query = `
    DELETE FROM followers
    WHERE follower_id = $1 AND followed_id = $2
    RETURNING *;
  `;
  const { rows } = await db.query(query, [followerId, followedId]);
  return rows[0];
};

// Check if user is following an artist
export const isUserFollowingArtist = async (userId, artistId) => {
  const query = `
    SELECT 1
    FROM followers
    WHERE follower_id = $1 AND followed_id = $2;
  `;
  const { rows } = await db.query(query, [userId, artistId]);
  return rows.length > 0;
};

// Most played songs for a specific artist
export const getMostPlayedSongsByArtist = async (artistId, limit = 24) => {
  const query = `
    SELECT 
      s.id AS id,
      s.id AS path,
      s.title AS name,
      a.title AS album,
      s.encryption_key AS key,
      a.album_art_id AS albumCover,
      ar.artist_name AS artist,
      SUM(COALESCE(EXTRACT(EPOCH FROM sh.listen_time), 0)) AS total_listen_seconds
    FROM songs s
    JOIN albums a ON s.album_id = a.id
    JOIN artists ar ON a.artist = ar.user_id
    LEFT JOIN song_history sh ON sh.song_id = s.id
    WHERE ar.id = $1
    GROUP BY s.id, a.id, ar.artist_name, a.album_art_id
    ORDER BY total_listen_seconds DESC
    LIMIT $2
  `;

  const { rows } = await db.query(query, [artistId, limit]);
  return rows;
};






// Get all followers of an artist
export const getFollowersByArtist = async (artistId) => {
  const query = `
    SELECT u.id, u.name, u.email, u.image
    FROM followers f
    JOIN users u ON f.follower_id = u.id
    WHERE f.followed_id = $1;
  `;
  const { rows } = await db.query(query, [artistId]);
  return rows;
};

// Get all artists followed by a user
export const getFollowedArtistsByUser = async (userId) => {
  const query = `
    SELECT a.id, a.artist_name, a.pic_path, a.description
    FROM followers f
    JOIN artists a ON f.followed_id = a.id
    WHERE f.follower_id = $1;
  `;
  const { rows } = await db.query(query, [userId]);
  return rows;
};