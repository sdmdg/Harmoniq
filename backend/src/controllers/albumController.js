// controller.js
import { findAlbumsByUserId, createAlbum } from '../models/Artist.js';
const sampleAlbum = {
    "name": "Different World",
    "albumCover": "DifferentWorld.png",
    "artist": "Alan Walker",
    "type": "Album",
    "releaseYear": "2018",
    "tracks": [
        {
            "id": 1,
            "name": "Alone",
            "path": "Alan Walker - Alone.mp3",
            "duration": "1;30"
        },
        {
            "id": 2,
            "name": "Faded",
            "path": "Alan Walker - Faded.mp3",
            "duration": "1;30"
        },
        {
            "id": 3,
            "name": "Intro",
            "path": "Alan Walker - Intro.mp3",
            "duration": "1;30"
        }
    ]
};

export const getAlbum = async (req, res) => {
    const { album_id } = req.params;
    try {
        res.status(200).json(sampleAlbum);
    } catch (error) {
        console.error("Get Album Error:", error);
        res.status(500).json({ message: `Internal server error: ${error.message}` });
    }
};


// GET albums by user ID
export const getAlbumsByUserId = async (req, res) => {
    const { userId } = req.params;

    try {
        const albums = await findAlbumsByUserId(userId);

        if (!albums || albums.length === 0) {
            return res.status(404).json({ message: 'No albums found for this user' });
        }

        res.status(200).json(albums);
    } catch (error) {
        console.error('Controller error (getAlbumsByUserId):', error);
        res.status(500).json({ message: 'Server error while fetching albums' });
    }
};

// POST create new album
export const addAlbum = async (req, res) => {
    const { title, artist, releaseDate, albumArtId } = req.body;

    if (!title || !artist) {
        return res.status(400).json({ message: 'Title and artist are required' });
    }

    try {
        const newAlbum = await createAlbum({ title, artist, releaseDate, albumArtId });
        res.status(201).json(newAlbum);
    } catch (error) {
        console.error('Controller error (addAlbum):', error);
        res.status(500).json({ message: 'Server error while creating album' });
    }
};
