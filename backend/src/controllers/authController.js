// controllers/authController.js
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { findUserByEmail, createUser } from '../models/User.js';

export const registerUser = async (req, res) => {
  const { username, email, password } = req.body;

  try {

    // Basic validation for required fields from client
    if (!username || !email || !password) {
      return res.status(400).json({ message: "Username, email, and password are required." });
    }

    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    // Ensure createUser receives the hashed password
    const newUser = await createUser({ username, email, role:"listener", password: hashedPassword });

    // IMPORTANT: Your createUser function's RETURNING clause only returns username, email, user_type.
    // If you need newUser.id for JWT, ensure createUser returns it.
    // Modify createUser to: `RETURNING id, username, email, user_type`
    // For now, assuming newUser.id is available or handled by your createUser.
    const token = jwt.sign({ id: newUser.id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.status(200).json({
      token,
      user: {
        id: newUser.id,
        username: newUser.user_name,
        role: newUser.role,
        // If you want to return the user's ID, ensure createUser returns it
        // id: newUser.id
      }
    });

  } catch (error) {
    console.error('Register Error:', error);
    // Provide a more generic error message to the client for security
    res.status(500).json({ message: `Internal server error during registration.` });
  }
};

export const loginUser = async (req, res) => {
  const { email, password, rememberMe } = req.body;

  try {
    const user = await findUserByEmail(email);
    if (!user) return res.status(400).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const expiresIn = rememberMe ? '7d' : '1d'
    const token = jwt.sign({ id: user.id, username: user.user_name, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn });

    res.status(200).json({
      token,
      user: {
        id: user.id,
        username: user.user_name,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: `Internal server error: ${error.message}` });
  }
};
