// userModel.js
import pool from '../config/db.js';

export async function findUserByEmail(email) {
  const result = await pool.query('SELECT * FROM Users WHERE email = $1', [email]);
  return result.rows[0];
}

export async function createUser({ username, email, role, password }) {
  console.info(username);
  const result = await pool.query(
    `INSERT INTO Users (username, email, password_hash, user_type)
     VALUES ($1, $2, $3, $4)
     RETURNING username, email, user_type`,
    [username, email, password, role]
  );
  return result.rows[0];
}
