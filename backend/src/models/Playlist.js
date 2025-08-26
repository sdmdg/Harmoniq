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