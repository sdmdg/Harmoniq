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


export async function getAllUsers({ q = '', role = '', limit = 10, offset = 0 }) {
  const where = [];
  const params = [];
  let i = 1;

  if (q) { where.push(`(u.user_name ILIKE $${i} OR u.email ILIKE $${i})`); params.push(`%${q}%`); i++; }
  if (role) { where.push(`u.role = $${i}`); params.push(role); i++; }

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

  const sql = `
    SELECT
      u.id, u.user_name, u.email, u.role, u.created_at,
      u.pic_path,
       a.id AS artist_id,  
      a.artist_name, a.description
    FROM users u
    LEFT JOIN artists a ON a.user_id = u.id
    ${whereSql}
    ORDER BY u.created_at DESC
    LIMIT $${i++} OFFSET $${i++}
  `;
  params.push(limit, offset);

  const { rows } = await db.query(sql, params);

  const countSql = `SELECT COUNT(*) FROM users u ${whereSql}`;
  const { rows: crows } = await db.query(countSql, params.slice(0, i - 3));
  const total = parseInt(crows[0].count, 10);

  return { rows, total };
}

export const getUserSongsModel = async(userId)=>{
    const query = `
        SELECT s.id,
        s.title,
        LPAD(EXTRACT(MINUTE FROM s.duration)::text, 2, '0') || ';' ||
        LPAD(EXTRACT(SECOND FROM s.duration)::text, 2, '0') AS duration,
        s.album_id,
        s.encryption_key
        FROM songs s
        join users_songs us on s.id = us.song_id
        WHERE us.user_id = $1;
    `;
    const values = [userId];

    try {
        const result = await db.query(query, values);
        return result.rows;
    } catch (error) {
        console.error('Error fetching user songs from database:', error);
        throw error;
    }
};