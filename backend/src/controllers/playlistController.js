// controllers/playlistController.js
import {createPlaylist as createPlaylistModel,
        getUserPlaylists as getUserPlaylistsModel } from '../models/Playlist.js';

export const createPlaylist = async (req, res) => {
    try {
        const userId = req.user.id; // User ID from the authenticated token
        const { name, type, mood, genre } = req.body;

        if (!name) {
            return res.status(400).json({ message: 'Playlist name is required.' });
        }

        // Call the model function to create the playlist in the database
        const newPlaylist = await createPlaylistModel({
            userId,
            name,
        });

        // Respond with the newly created playlist data
        res.status(201).json(newPlaylist);
    } catch (error) {
        console.error('Failed to create playlist:', error);
        res.status(500).json({ message: 'Server error while creating playlist.' });
    }
};

export const getUserPlaylists = async (req, res) => {
    try {
        const userId = req.user.id; // User ID from the authenticated token
        
        // Call the model function to get playlists for this user
        const playlists = await getUserPlaylistsModel(userId);
        
        // Respond with the list of playlists
        res.status(200).json(playlists);
    } catch (error) {
        console.error('Failed to get user playlists:', error);
        res.status(500).json({ message: 'Server error while fetching playlists.' });
    }
};