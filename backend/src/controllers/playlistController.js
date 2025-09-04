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


const sampleAlbum = {
    "name": "Workout",
    "artist": "User",
    "tracks": [
        {
            "id": 'cc99f3c4-eeca-4db4-85eb-0db94a99ba3a',
            "name": "Faded",
            "path": "Alan Walker - Faded.mp3",
            "duration": "1;30",
            "artist": "Alan Walker",
            "albumCover": "DifferentWorld.png",
            "key": "e2797ff1c1bca2b5056d20aba421f69a31b115b8f68537ffc46783404a23cfc2",
        },
        {
            "id": 'cc99f3c4-eeca-4db4-85eb-0db94a99ba22',
            "name": "Back To December",
            "path": "Taylor Swift - Back To December.mp3",
            "duration": "1;30",
            "artist": "Taylor Swift",
            "albumCover": "SpeakNow.png",
            "key": "e2797ff1c1bca2b5056d20aba421f69a31b115b8f68537ffc46783404a23cfc2",
        },
        {
            "id": 'a8ea5548-156b-4500-a819-33bcda6e6710',
            "name": "Let Me Down Slowly",
            "path": "a8ea5548-156b-4500-a819-33bcda6e6710.mp3",
            "duration": "1;30",
            "artist": "Alec Benjamin",
            
            "key": "43c7f154e5646c1d40edcb25d86777c2b190bb1c4d90c15d9f9c33c3cbc72f46",
        }
    ]
};

export const getPlaylist = async (req, res) => {
    const { album_id } = req.params;
    try {
        res.status(200).json(sampleAlbum);
    } catch (error) {
        console.error("Get Album Error:", error);
        res.status(500).json({ message: `Internal server error: ${error.message}` });
    }
};
