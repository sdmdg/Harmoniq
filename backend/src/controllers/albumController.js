// controller.js
import { findAlbumsByUserId, createAlbum , findSongsByAlbumId} from '../models/Artist.js';
import { uploadFileToServer } from '../services/fileService.js';
const sampleAlbum = {
    "name": "Different World",
    "albumCover": "DifferentWorld.png",
    "artist": "Alan Walker",
    "releaseYear": "2018",
    "tracks": [
        {
            "id": 'cc99f3c4-eeca-4db4-85eb-0db94a99ba31',
            "name": "Alone",
            "path": "Alan Walker - Alone.mp3",
            "duration": "1;30",
            "key": "e2797ff1c1bca2b5056d20aba421f69a31b115b8f68537ffc46783404a23cfc2",
        },
        {
            "id": 'cc99f3c4-eeca-4db4-85eb-0db94a99ba3a',
            "name": "Faded",
            "path": "Alan Walker - Faded.mp3",
            "duration": "1;30",
            "key": "e2797ff1c1bca2b5056d20aba421f69a31b115b8f68537ffc46783404a23cfc2",
        },
        {
            "id": 'cc99f3c4-eeca-4db4-85eb-0db94a99ba33',
            "name": "Intro",
            "path": "Alan Walker - Intro.mp3",
            "duration": "1;30",
            "key": "e2797ff1c1bca2b5056d20aba421f69a31b115b8f68537ffc46783404a23cfc2",
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

export const getSongsByAlbumId = async (req, res) => {
    const { albumId } = req.params;

    try {
        const songs = await findSongsByAlbumId(albumId);

        if (!songs || songs.length === 0) {
            return res.status(404).json({ message: 'No songs found for this album' });
        }

        res.status(200).json(songs);
    } catch (error) {
        console.error('Controller error (getSongsByAlbumId):', error);
        res.status(500).json({ message: 'Server error while fetching songs' });
    }
};

// POST create new album
export const addAlbum = async (req, res) => {
  const { title, artist, releaseDate, albumArtId } = req.body;

  if (!title || !artist) {
    return res.status(400).json({ message: "Title and artist are required" });
  }

  try {
    // Strip the extension from the uploaded file name
    const albumArtUuid = albumArtId.split('.')[0];

    const newAlbum = await createAlbum({
      title,
      artist,
      releaseDate,
      albumArtId: albumArtUuid, // store UUID only
    });

    res.status(201).json(newAlbum);
  } catch (error) {
    console.error("Controller error (addAlbum):", error);
    res.status(500).json({ message: "Server error while creating album" });
  }
};


// POST upload album art


export const uploadAlbumArt = async (req, res) => {
  try {
    // req.file.buffer contains the file data in memory
    const albumArtId = await uploadFileToServer(req.file); // This sends to file server
    if (!albumArtId) throw new Error('Upload failed');
    res.status(201).json({ albumArtId });
  } catch (err) {
    console.error('Album art upload error:', err);
    res.status(500).json({ message: 'Album art upload failed' });
  }
};