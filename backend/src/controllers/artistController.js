// controllers/artistController.js
import {
  findArtistById,
  isUserFollowingArtist,
  addFollower,
  removeFollower,
  getMostPlayedSongsByArtist,
  searchArtistsByAlbumId,
} from "../models/Artist.js";

import { getRecentSongsByUser, getTrendingAlbums, getRecentReleases, getMostPlayedSongs, getTrendingArtists} from '../models/SongHistory.js';


const hardcodedData = {
  monthlyAudience: "238M",
  topSongs: [
    {
      title: "Faded",
      artist: "Alan Walker",
      plays: "5.3B",
      cover:
        "https://lh3.googleusercontent.com/WbQvmYqxKwEbLPj5zSlYe5vrxipjJAaCxqB1cJxyzljnvIr9i4Ix9fyxK9h9BXq5a3jyvPdvGKI_2vWXnA=w544-h544-l90-rj",
    },
    {
      title: "On My Way",
      artist: "Alan Walker",
      plays: "1.5B",
      cover:
        "https://lh3.googleusercontent.com/WbQvmYqxKwEbLPj5zSlYe5vrxipjJAaCxqB1cJxyzljnvIr9i4Ix9fyxK9h9BXq5a3jyvPdvGKI_2vWXnA=w544-h544-l90-rj",
    },
    {
      title: "All Falls Down",
      artist: "Alan Walker",
      plays: "900M",
      cover:
        "https://lh3.googleusercontent.com/mOxS-HGSPLkUsQIlZZP7drX1x-ewJT5YW8O8FKt5HWR5lZ2b8NAQldscy6n8TV34dQKkND2489goh3zH=w544-h544-l90-rj",
    },
    {
      title: "Alone",
      artist: "Alan Walker",
      plays: "1.2B",
      cover:
        "https://lh3.googleusercontent.com/Y19VtLffjcBZ2gMjaD_aMf2w_G4GX49EnycaJDA0tVzIn4GMKn0-sY6njoodgOquCfvUpyKyOp1jYZch9A=w544-h544-l90-rj",
    },
  ],
};

export const getArtist = async (req, res) => {
  try {
    const { id } = req.params; // artist id
    const artistFromDB = await findArtistById(id);

    if (!artistFromDB) {
      return res.status(404).json({ message: "Artist not found." });
    }

    // Get current logged in user (from auth middleware)
    const userId = req.user?.id;  

    // Check if current user follows this artist
    let isFollowing = false;
    if (userId) {
      isFollowing = await isUserFollowingArtist(userId, artistFromDB.id);
    }

    const mostPlayedSongs = await getMostPlayedSongsByArtist(artistFromDB.id, 12);

    const artist = {
      id: artistFromDB.id,
      name: artistFromDB.artist_name,
      description: artistFromDB.description,
      createdAt: artistFromDB.created_at,
      image: artistFromDB.pic_path,
      user: {
        name: artistFromDB.user_name,
        email: artistFromDB.email,
        role: artistFromDB.role,
        image: artistFromDB.pic_path,
      },
      monthlyAudience: hardcodedData.monthlyAudience,
      topTracks: mostPlayedSongs,
      isFollowing,
    };

    res.status(200).json(artist);
  } catch (error) {
    console.error("Error fetching artist:", error);
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};

export const followArtist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { artistId } = req.body;

    if (!artistId) return res.status(400).json({ message: 'Artist ID is required' });

    const follower = await addFollower(userId, artistId);
    if (!follower) return res.status(200).json({ success: true, message: 'Already following' });

    res.json({ success: true, message: 'Artist followed' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const unfollowArtist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { artistId } = req.body;

    if (!artistId) return res.status(400).json({ message: 'Artist ID is required' });

    const removed = await removeFollower(userId, artistId);
    if (!removed) return res.status(200).json({ success: true, message: 'Not following' });

    res.json({ success: true, message: 'Artist unfollowed' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const checkFollowing = async (req, res) => {
  try {
    const userId = req.user.id;
    const { artistId } = req.query;

    if (!artistId) return res.status(400).json({ message: 'Artist ID is required' });

    const following = await isUserFollowingArtist(userId, artistId);
    res.json({ following });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const searchArtists = async (req, res) => {
  try {
    const { albumId } = req.params;
    if (!albumId) return res.status(400).json({ message: 'Album ID is required' });

    const artists = await searchArtistsByAlbumId(albumId);
    res.json(artists);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};