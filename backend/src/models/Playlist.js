// models/Playlist.js
import db from '../config/db.js';

export const createPlaylist = async ({ userId, name }) => {
    const query = `
        INSERT INTO playlist (user_id, title)
        VALUES ($1, $2)
        RETURNING user_id, title;
    `;
    const values = [userId, name];

    try {
        const result = await db.query(query, values);
        return result.rows[0];
    } catch (error) {
        console.error('Error creating playlist in database:', error);
        throw error;
    }
};

export const getUserPlaylists = async (userId) => {
    const query = `
        SELECT id, title
        FROM playlist
        WHERE user_id = $1
        ORDER BY created_at DESC;
    `;
    const values = [userId];

    try {
        const result = await db.query(query, values);
        return result.rows;
    } catch (error) {
        console.error('Error fetching playlists from database:', error);
        throw error;
    }
};

export const getLikedSongs = async(userId)=>{
    const query = `
        SELECT s.id,
        s.title,
        LPAD(EXTRACT(MINUTE FROM s.duration)::text, 2, '0') || ';' ||
        LPAD(EXTRACT(SECOND FROM s.duration)::text, 2, '0') AS duration,
        s.album_id,
        s.encryption_key,
        ar.artist_name as artist,
        a.album_art_id  as albumCover
        FROM songs s
        join liked_songs ls on s.id = ls.song_id
        join albums a on s.album_id = a.id
        JOIN artists ar ON a.artist = ar.user_id
        WHERE ls.user_id = $1;
    `;
    const values = [userId];

    try {
        const result = await db.query(query, values);
        return result.rows;
    } catch (error) {
        console.error('Error fetching liked songs from database:', error);
        throw error;
    }
};

export const getPlaylistById = async (playlistId) => {
  const result = await db.query(
    `SELECT 
       s.id,
       s.title as name,
       ar.artist_name as artist,
       LPAD(EXTRACT(MINUTE FROM s.duration)::text, 2, '0') || ';' ||
       LPAD(EXTRACT(SECOND FROM s.duration)::text, 2, '0') AS duration,
       s.album_id,
       s.encryption_key,
       a.album_art_id AS "albumCover"
     FROM songs s
     JOIN playlist_songs ps ON s.id = ps.song_id
     JOIN albums a ON s.album_id = a.id
     JOIN artists ar ON a.artist = ar.user_id
     WHERE ps.playlist_id = $1 AND a.is_blocked = false`,
    [playlistId]
  );

  return result.rows;
};
export const getPlaylistDetailsById = async (playlistId) => {
  const result = await db.query(
    `SELECT 
        p.id,  
            p.title,
            p.created_at,
            u.user_name as created_by
        FROM playlist p    
        JOIN users u ON p.user_id = u.id    
        WHERE p.id = $1
        GROUP BY p.id, u.user_name`,
    [playlistId]
  );
  return result.rows[0];
};
export const getPlaylistAlbumsModel = async (playlistId) => {
    const result = await db.query(
        `SELECT distinct  a.album_art_id as "albumCover"
        FROM albums a
        JOIN songs s ON a.id = s.album_id
        JOIN playlist_songs ps ON s.id = ps.song_id
        WHERE ps.playlist_id = $1`,
        [playlistId]
    );
    return result.rows;
};