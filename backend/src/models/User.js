// userModel.js
import db from '../config/db.js';

export async function findUserByEmail(email) {
  const result = await db.query('SELECT * FROM Users WHERE email = $1', [email]);
  return result.rows[0];
}

export const findUserById = async (id) => {
    try {
        const query = 'SELECT * FROM users WHERE id = $1;';
        const result = await db.query(query, [id]);
        return result.rows[0];
    } catch (error) {
        console.error('Error finding user by ID:', error);
        throw error;
    }
};

export async function createUser({ username, email, role, password }) {
  console.info(username);
  const result = await db.query(
    `INSERT INTO Users (user_name, email, password, role)
     VALUES ($1, $2, $3, $4)
     RETURNING user_name, email, role`,
    [username, email, password, role]
  );
  return result.rows[0];
}

export const ModelgetProPic = async (userId) => {
    const query = `
        SELECT pic_path
        FROM public.users
        WHERE id = $1
    `;
    const values = [userId];

    const result = await db.query(query, values);
    return result.rows.length > 0 ? result.rows[0] : null;
};

export const ModelSetProPic = async (userId, picPath) => {
    const query = `
        UPDATE public.users
        SET pic_path = $1
        WHERE id = $2
        RETURNING pic_path;
    `;
    const values = [picPath, userId];

    const result = await db.query(query, values);
    return result.rows.length > 0 ? result.rows[0] : null;
};

export const updatePasswordInDb = async (id, hashedPassword) => {
    try {
        const query = 'UPDATE users SET password = $1, created_at = NOW() WHERE id = $2 RETURNING *;';
        const result = await db.query(query, [hashedPassword, id]);
        return result.rows[0];
    } catch (error) {
        console.error('Error updating password:', error);
        throw error;
    }
};

export const updateRole = async (userId, newRole) => {
    try {
        const query = 'UPDATE users SET role = $1 WHERE id = $2 RETURNING *;';
        const result = await db.query(query, [newRole, userId]);
        return result.rows[0];
    } catch (error) {
        console.error('Error updating user role:', error);
        throw error;
    }
};

export const createArtistProfile = async (userId, artistName, description) => {
    try {
        const query = 'INSERT INTO artists (user_id, artist_name, description) VALUES ($1, $2, $3) RETURNING *;';
        const result = await db.query(query, [userId, artistName, description]);
        return result.rows[0];
    } catch (error) {
        console.error('Error creating artist profile:', error);
        throw error;
    }
};

export const findArtistByUserId = async (userId) => {
    try {
        const query = 'SELECT artist_name, description FROM artists WHERE user_id = $1;';
        const result = await db.query(query, [userId]);
        return result.rows[0];
    } catch (error) {
        console.error('Error finding artist by user ID:', error);
        throw error;
    }
};

export const updateArtistProfile = async (userId, artistName, description) => {
    try {
        const query = 'UPDATE artists SET artist_name = $1, description = $2 WHERE user_id = $3 RETURNING artist_name, description;';
        const result = await db.query(query, [artistName, description, userId]);
        return result.rows[0];
    } catch (error) {
        console.error('Error updating artist profile:', error);
        throw error;
    }
};

export const ModelSetSong = async (
  albumId,
  title,
  durationSeconds,
  trackNumber,
  bpm,
  valence,
  arousal,
  genre,
  mood
) => {
  const query = `
    INSERT INTO public.songs (
      album_id,
      title,
      duration,
      track_number,
      bpm,
      valence,
      arousal,
      genre,
      mood
    )
    VALUES ($1, $2, $3::interval, $4, $5, $6, $7, $8, $9)
    RETURNING *;
  `;

  // Convert duration from seconds → interval string
  const durationInterval = `${durationSeconds} seconds`;

  const values = [
    albumId,
    title,
    durationInterval,
    trackNumber,
    bpm,
    valence,
    arousal,
    genre,
    mood
  ];

  const result = await pool.query(query, values);
  return result.rows.length > 0 ? result.rows[0] : null;
};

