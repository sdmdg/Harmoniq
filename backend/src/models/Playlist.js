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
        WHERE ls.user_id = $1 AND a.is_blocked = false AND a.published = true AND s.encryption_key is not NULL;
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
     WHERE ps.playlist_id = $1 AND a.is_blocked = false AND a.published = true AND s.encryption_key is not NULL`,
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
            u.user_name as created_by,
            u.id as user_id
        FROM playlist p    
        JOIN users u ON p.user_id = u.id    
        WHERE p.id = $1
        GROUP BY p.id, u.user_name, u.id`,
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

export async function addSongToPlaylistModel(playlistId, songId) {
  const sql = `
    INSERT INTO playlist_songs (playlist_id, song_id)
    VALUES ($1, $2)
    ON CONFLICT (playlist_id, song_id) DO NOTHING
    RETURNING playlist_id, song_id;
  `;
  try {
    const result = await db.query(sql, [playlistId, songId]);
    return { inserted: result.rowCount > 0 };
  } catch (err) {
    console.error("addSongToPlaylistModel error:", err);
    throw err;
  }
}

export const getPlaylistsForSongModel = async (userId, songId) => {
    const query = `
        SELECT p.id, p.title
        FROM playlist p
        JOIN playlist_songs ps ON p.id = ps.playlist_id
        WHERE ps.song_id = $2 AND p.user_id = $1
    `;
    const values = [userId, songId];

    try {
        const result = await db.query(query, values);
        return result.rows;
    } catch (error) {
        console.error('Error fetching playlists for song from database:', error);
        throw error;
    }
};

export const deletePlaylistModel = async (playlistId) => {
    const query = `
        DELETE FROM playlist
        WHERE id = $1
    `;
    const values = [playlistId];

    try {
        const result = await db.query(query, values);
        return result.rowCount > 0;
    } catch (error) {
        console.error('Error deleting playlist from database:', error);
        throw error;
    }
};

export async function deleteSongFromPlaylistModel(playlistId, songId) {
    const sql = `
    DELETE FROM playlist_songs
    WHERE playlist_id = $1 AND song_id = $2
    RETURNING playlist_id, song_id;
    `;
  try {
    const result = await db.query(sql, [playlistId, songId]);
    return { inserted: result.rowCount > 0 };
  } catch (err) {
    console.error("deleteSongFromPlaylist error:", err);
    throw err;
  }
}

export async function copyPlaylistModel(originalPlaylistId, newOwnerUserId) {
    const client = await db.connect();
    try {
        await client.query('BEGIN');

        const originalPlaylistRes = await client.query(
            'SELECT title, release_date FROM playlist WHERE id = $1',
            [originalPlaylistId]
        );

        if (originalPlaylistRes.rows.length === 0) {
            await client.query('ROLLBACK');
            client.release();
            return { success: false, message: 'Playlist not found' };
        }

        const { title, release_date } = originalPlaylistRes.rows[0];
        const newPlaylistName = `${title}`;
        const newPlaylistDate = release_date;

        const newPlaylistRes = await client.query(
            'INSERT INTO playlist (user_id, title, release_date) VALUES ($1, $2, $3) RETURNING id',
            [newOwnerUserId, newPlaylistName, newPlaylistDate]
        );

        const newPlaylistId = newPlaylistRes.rows[0].id;

        const songsRes = await client.query(
            'SELECT song_id FROM playlist_songs WHERE playlist_id = $1',
            [originalPlaylistId]
        );

        if (songsRes.rows.length > 0) {
            const songIds = songsRes.rows.map(row => row.song_id);
            const values = songIds.map((_, index) => `($1, $${index + 2})`).join(',');
            const params = [newPlaylistId, ...songIds];
            const copySongsSql = `INSERT INTO playlist_songs (playlist_id, song_id) VALUES ${values}`;
            await client.query(copySongsSql, params);
        }

        await client.query('COMMIT');
        return { success: true, newPlaylistId };
    } catch (err) {
        await client.query('ROLLBACK');
        console.error("copyPlaylistModel error:", err);
        throw err;
    } finally {
        client.release();
    }
}
