// controllers/artistController.js
import {
  findArtistById,
  isUserFollowingArtist,
  addFollower,
  removeFollower,
  getMostPlayedSongsByArtist,
  findAlbumsByArtistId
} from "../models/Artist.js";

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

    const albums = await findAlbumsByArtistId(id);

    const artist = {
      id: artistFromDB.id,
      name: artistFromDB.artist_name,
      description: artistFromDB.description,
      createdAt: artistFromDB.created_at,
      image: artistFromDB.pic_path,
      user: {
        userid: artistFromDB.artist_user_id,
        name: artistFromDB.user_name,
        email: artistFromDB.email,
        role: artistFromDB.role,
        image: artistFromDB.pic_path,
      },
      audience: artistFromDB.listenerCount,
      topTracks: mostPlayedSongs,
      isFollowing,
      albums,
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