// controllers/authController.js
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { findUserByEmail, createUser, findUserById, updatePasswordInDb} from '../models/User.js';

import { sendEmail } from "../services/emailService.js";


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

    const token = jwt.sign({ id: newUser.id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    // --- Email ---
    sendEmail("welcome", {
      name: username,
      sender: "Harmoniq Team"
    }, email, "Welcome to Harmoniq 🎶");


    res.status(200).json({
      token,
      user: {
        id: newUser.id,
        username: newUser.user_name,
        role: newUser.role,
        email: email
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

export const pwdChangeWithToken = async (req, res) => {
  const { new_password, token } = req.body;

  try {
    if (!new_password || !token) {
      return res.status(400).json({ message: 'Token and new password are required.' });
    }

    // Verify the token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(400).json({ message: 'Invalid or expired token.' });
    }


    // Find user request
    const request = decoded.request;
    if (request !== "PASSWORD-RESET-BY-MAIL" && request !== "PASSWORD-RESET-BY-FORGOTPWD") {
      return res.status(400).json({ message: 'request not found.' });
    }

    // Find user by decoded token id
    const user = await findUserById(decoded.id);
    if (!user) {
      return res.status(400).json({ message: 'User not found.' });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(new_password, 10);

    // Update the user's password in the database
    await updatePasswordInDb(user.id, hashedPassword);

    return res.status(200).json({ message: 'Password updated successfully!' });

  } catch (error) {
    console.error('Password Reset Error:', error);
    return res.status(500).json({ message: 'Internal server error during password reset.' });
  }
};
