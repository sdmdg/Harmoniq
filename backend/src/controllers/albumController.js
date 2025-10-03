// controller.js
import { findAlbumsByUserId, createAlbum , findSongsByAlbumId} from '../models/Artist.js';
import { uploadFileToServer } from '../services/fileService.js';
import { fetchAlbumData, ModelDeleteAlbum } from '../models/Album.js';

export const getAlbum = async (req, res) => {
    const { album_id } = req.params;

    try {
        const fullAlbum = await fetchAlbumData(album_id);

        if (!fullAlbum) {
            // The model returns null if the album is not found
            return res.status(404).json({ message: "Album not found." });
        }

        res.status(200).json(fullAlbum);
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
export const deleteAlbum = async (req, res) => {
    const { albumId } = req.params;     
    try {
        const deletedAlbum = await ModelDeleteAlbum(albumId);
        if (!deletedAlbum) {
            return res.status(404).json({ message: 'Album not found' });
        }
        res.status(200).json({ message: 'Album deleted successfully', album: deletedAlbum });
    } catch (error) {
        console.error('Controller error (deleteAlbum):', error);
        res.status(500).json({ message: 'Server error while deleting album' });
    }   
};