// userModel.js
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

export const ModelgetProPic = async (userId) => {
    const query = `
        SELECT pic_path
        FROM public.users
        WHERE id = $1
    `;
    const values = [userId];

    const result = await pool.query(query, values);
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

    const result = await pool.query(query, values);
    return result.rows.length > 0 ? result.rows[0] : null;
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
