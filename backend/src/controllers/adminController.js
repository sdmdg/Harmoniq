// controllers/adminController.js
import pool from '../config/db.js';

export const getDashboardStats = async (req, res) => {
  try {
    const [usersResult, artistsResult, songsResult, playlistsResult] =
      await Promise.all([
        pool.query('SELECT COUNT(*) FROM users'),
        // If you prefer counting artists by role in users:
        // pool.query("SELECT COUNT(*) FROM users WHERE role = 'artist'"),
        pool.query('SELECT COUNT(*) FROM artists'),
        pool.query('SELECT COUNT(*) FROM songs'),
        pool.query('SELECT COUNT(*) FROM playlist'),
      ]);

    res.json({
      totalUsers:     parseInt(usersResult.rows[0].count, 10),
      totalArtists:   parseInt(artistsResult.rows[0].count, 10),
      totalSongs:     parseInt(songsResult.rows[0].count, 10),
      totalPlaylists: parseInt(playlistsResult.rows[0].count, 10),
    });
  } catch (error) {
    console.error('Admin Dashboard Error:', error);
    res.status(500).json({ error: 'Failed to fetch admin dashboard stats' });
  }
};
