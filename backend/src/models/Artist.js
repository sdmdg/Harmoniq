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
        const query = 'SELECT id, title FROM songs WHERE album_id = $1;';
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
