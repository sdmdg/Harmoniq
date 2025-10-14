// controllers/playlistController.js
import {createPlaylist as createPlaylistModel,
        getUserPlaylists as getUserPlaylistsModel, getLikedSongs as getLikedSongsModel,getPlaylistById, getPlaylistDetailsById, getPlaylistAlbumsModel,addSongToPlaylistModel } from '../models/Playlist.js';

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

export const getLikedSongs = async (req, res) => {
    try {
        const userId = req.user.id; // User ID from the authenticated token                 
        const tracks = await getLikedSongsModel(userId);
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

export const getPlaylist = async (req, res) => {
    const { album_id } = req.params;
    try {
        res.status(200).json(sampleAlbum);
    } catch (error) {
        console.error("Get Album Error:", error);
        res.status(500).json({ message: `Internal server error: ${error.message}` });
    }
};

export const getPlaylists = async (req, res) => {
  const { playlist_id } = req.params;
  try { 
    const tracks = await getPlaylistById(playlist_id);
    if (!tracks || tracks.length === 0) {
      return res.status(404).json({ message: "Playlist not found" });
    }
    // Build playlist object for frontend
    const playlist = {
      name: "Playlist", // You can fetch playlist name if needed
      artist: "User",   // Or fetch actual artist/owner
      tracks
    };
    res.status(200).json(playlist);
  } catch (error) {
    console.error("Get Playlist Error:", error);
    res.status(500).json({ message: `Internal server error: ${error.message}` });
  }
};
export const getPlaylistDetails = async (req, res) => {
  const { playlist_id } = req.params;       
    try {
        const tracks = await getPlaylistDetailsById(playlist_id);
        if (!tracks || tracks.length === 0) {
            return res.status(404).json({ message: "Playlist not found" });
        }                   
        // Build playlist object for frontend
        const playlist = {
            name: tracks.title, // You can fetch playlist name if needed
            creator: tracks.created_by, // Or fetch actual artist/owner
            tracks        };
        res.status(200).json(playlist);
    } catch (error) {
        console.error("Get Playlist Details Error:", error);
        res.status(500).json({ message: `Internal server error: ${error.message}` });
    }
};
export const getPlaylistAlbums = async (req, res) => {
    const { playlist_id } = req.params;
    try {
        const albums = await getPlaylistAlbumsModel(playlist_id);
        res.status(200).json(albums);
    } catch (error) {
        console.error("Get Playlist Albums Error:", error);
        res.status(500).json({ message: `Internal server error: ${error.message}` });
    }
};
export const addSongToPlaylist = async (req, res) => {
    try {
        const { playlistId, songId } = req.body;
        console.log(playlistId, songId);
        if (!playlistId || !songId) {
            return res.status(400).json({ message: 'Playlist ID and Song ID are required.' });
        }    // Call the model function to add the song to the playlist
        await addSongToPlaylistModel(playlistId, songId);
        res.status(200).json({ message: 'Song added to playlist successfully.' });
    } catch (error) {
        console.error('Failed to add song to playlist:', error);
        res.status(500).json({ message: 'Server error while adding song to playlist.' });
    }
};  