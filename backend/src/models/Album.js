import pool from '../config/db.js';

export async function findUserByEmail(email) {
  const result = await pool.query('SELECT * FROM Users WHERE email = $1', [email]);
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

export const fetchAlbumData = async (albumId) => {
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
        WHERE a.id = $1;
    `;

    const albumResult = await pool.query(albumQuery, [albumId]);

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
    const tracks = songsResult.rows.map(song => ({
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
        tracks: tracks
    };

    return fullAlbum;
};

export const ModelDeleteAlbum = async (albumId) => {
    const deleteAlbumQuery = 'DELETE FROM albums WHERE id = $1 RETURNING *';
    const result = await pool.query(deleteAlbumQuery, [albumId]);
    return result.rows[0];
};