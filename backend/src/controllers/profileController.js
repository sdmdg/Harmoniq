import {ModelgetProPic, 
        ModelSetProPic,
        updatePasswordInDb, 
        findUserById, updateRole,
        createArtistProfile,
        findArtistByUserId,
        updateArtistProfile,
        getUserSongsModel } from '../models/User.js';
import { uploadFileToServer } from '../services/fileService.js';

import { sendEmail } from "../services/emailService.js";

import { getRecentSongsByUser, getTrendingAlbums, getRecentReleases, getMostPlayedSongs, getTrendingArtists} from '../models/SongHistory.js';

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

export const getProPic = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const user = await ModelgetProPic(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ pic_path: user.pic_path });
    } catch (error) {
        console.error('Error fetching profile picture:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const setProPic = async (req, res) => {
    const userId = req.user.id;

    try {
        const profilePic = await uploadFileToServer(req.file);
        if (!profilePic) {
            return res.status(500).json({ message: 'Failed to upload file to file server.' });
        }

        const result = await ModelSetProPic(userId, profilePic);
        if (!result) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ message: 'Profile picture updated', profilePic });
    } catch (err) {
        console.error('Error in setProPic:', err);
        res.status(500).json({ message: 'Failed to update profile.' });
    }
};

export const updatePassword = async (req, res) => {
    try {
        const userId = req.user.id;
        const username = req.user.username;
        const email = req.user.email;
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Current password and new password are required.' });
        }

        const user = await findUserById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Validate the current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Incorrect current password.' });
        }

        // Password strength validation
        if (!passwordPattern.test(newPassword)) {
        return res.status(400).json({
            message:
            "Password must contain at least one lowercase letter, one uppercase letter, one symbol, one number, and be 8 or more characters long.",
        });
        }

        // Hash the new password before saving
        const salt = await bcrypt.genSalt(10);
        const hashedNewPassword = await bcrypt.hash(newPassword, salt);

        // Update the password in the database
        await updatePasswordInDb(userId, hashedNewPassword);

        const token = jwt.sign({ id: userId, request: "PASSWORD-RESET-BY-MAIL" }, process.env.JWT_SECRET, { expiresIn: '2d' });

        // --- Email ---
        sendEmail("user_password_update", {
            name: username,
            token: token,
            sender: "Harmoniq Team"
        }, email, "Password Updated Successfully 🔒");     

        res.status(200).json({ message: 'Password updated successfully!' });
    } catch (error) {
        console.error('Password update failed:', error);
        res.status(500).json({ message: 'Failed to change password.' });
    }
};

export const becomeArtist = async (req, res) => {
    try {
        const userId = req.user.id;
        const email = req.user.email;
        const { artistName, artistDescription } = req.body;

        if (!artistName) {
            return res.status(400).json({ message: 'Artist name is required.' });
        }

        // 1. Update the user's role in the users table
        await updateRole(userId, 'artist');

        // 2. Create a new entry in the artists table
        await createArtistProfile(userId, artistName, artistDescription);

        // --- Email ---
        sendEmail("artist_upgrade", {
            name: artistName,
            sender: "Harmoniq Team"
        }, email, "Your account has been upgraded to an Artist Profile. 🚀");

        // 3. Send a success response with the updated user data
        res.status(200).json({
            id: userId,
            role: 'artist',
            artist_name: artistName,
            artist_description: artistDescription
        });
    } catch (error) {
        console.error('Error in becomeArtist:', error);
        res.status(500).json({ message: 'Failed to update to artist role.' });
    }
};

export const getArtistDetails = async (req, res) => {
    try {
        const userId = req.user.id;
        const artist = await findArtistByUserId(userId);

        if (!artist) {
            return res.status(404).json({ message: 'Artist profile not found.' });
        }

        res.status(200).json(artist);
    } catch (error) {
        console.error('Failed to fetch artist details:', error);
        res.status(500).json({ message: 'Server error while fetching artist details.' });
    }
};

export const updateArtistDetails = async (req, res) => {
    try {
        const userId = req.user.id;
        const email = req.user.email;
        const username = req.user.username;

        const { artistName, artistDescription } = req.body;

        if (!artistName) {
            return res.status(400).json({ message: 'Artist name is required.' });
        }

        // Call the model function to update the artist profile
        const updatedArtist = await updateArtistProfile(userId, artistName, artistDescription);

        if (!updatedArtist) {
            return res.status(404).json({ message: 'Artist profile not found.' });
        }

        // --- Email ---
        sendEmail("artist_update", {
            userName: username,
            artistName: artistName,
            artistDescription: artistDescription,
            sender: "Harmoniq Team"
        }, email, "Your Artist Profile Has Been Updated 🎶");

        // The model returns the updated artist data, which we send back to the client
        res.status(200).json({
            artist_name: updatedArtist.artist_name,
            artist_description: updatedArtist.description,
        });

    } catch (error) {
        console.error('Failed to update artist details:', error);
        res.status(500).json({ message: 'Failed to update artist details.' });
    }
};

export const getHomePage = async (req, res) => {
  try {
    const userId = req.user.id;

    const [recent, quickPicks, albums, newReleases, artists] = await Promise.all([
      getRecentSongsByUser(userId, 10),
      getMostPlayedSongs(24),
      getTrendingAlbums(20),
      getRecentReleases(8),
      getTrendingArtists(userId, 8),
    ]);

    return res.json({
      recent,
      quickPicks,
      albums,
      newReleases,
      artists,
    });
  } catch (err) {
    console.error('Error fetching home page:', err);
    res.status(500).json({ message: 'Failed to fetch home page' });
  }
};

export const getUserSongs = async (req, res) => {
    try {
        const userId = req.user.id; // User ID from the authenticated token                 
        const tracks = await getUserSongsModel(userId);
        // Build playlist object for frontend
        const playlist = {
        tracks
        };
        res.status(200).json(playlist);
    } catch (error) {
        console.error('Failed to get liked songs:', error);
        res.status(500).json({ message: 'Server error while fetching liked songs.' });
    }       
};