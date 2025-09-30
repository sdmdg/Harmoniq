// src/controllers/recommendationController.js
import dayjs from "dayjs";
import { getUserSongs, getTopRecommendations, generateSongBasedPlaylist, getRecommendationsFiltered } from "../models/PlaylistGeneration.js";

const featureColumns = [
  "bpm", "valence", "arousal",
  "genre_blues", "genre_classical", "genre_country",
  "genre_disco", "genre_hiphop", "genre_jazz",
  "genre_metal", "genre_pop", "genre_reggae", "genre_rock",
  "mood_happy_excited", "mood_angry_tense", "mood_sad_calm",
  "mood_calm_relaxed", "mood_mixed_uncertain"
];

const genreMap = ["blues","classical","country","disco","hiphop","jazz","metal","pop","reggae","rock"];
const moodMap = {
  "Happy / Excited": "mood_happy_excited",
  "Angry / Tense": "mood_angry_tense",
  "Sad / Calm": "mood_sad_calm",
  "Calm / Relaxed": "mood_calm_relaxed",
  "Mixed / Uncertain Mood": "mood_mixed_uncertain"
};

// Helper: build user vector from songs
const buildUserVector = (songs) => {
  const baseWeights = { liked: 1.0, history: 0.8, album: 0.5 };
  const weights = [];
  const featuresMatrix = [];

  songs.forEach((song) => {
    let w = baseWeights[song.source] || 0.5;
    if (song.source === "history" && song.last_played) {
      const daysAgo = dayjs().diff(dayjs(song.last_played), "day");
      const recencyFactor = Math.max(0.2, 1 - daysAgo / 30);
      w *= recencyFactor;
    }

    weights.push(w);
    featuresMatrix.push(featureColumns.map((col) => song[col] || 0));
  });

  const userVector = featureColumns.map((_, i) => {
    let num = 0, den = 0;
    featuresMatrix.forEach((row, idx) => {
      num += row[i] * weights[idx];
      den += weights[idx];
    });
    return den > 0 ? num / den : 0;
  });

  return userVector;
};

// ------------------- Controllers ------------------- //

export const recommendSongs = async (req, res) => {
  try {
    const { userId } = req.params;
    const allSongs = await getUserSongs(userId);

    if (!allSongs.length) return res.status(404).json({ message: "No songs found for this user" });

    // Remove duplicates
    const uniqueSongs = Object.values(
      allSongs.reduce((acc, song) => {
        if (!acc[song.song_id]) acc[song.song_id] = song;
        return acc;
      }, {})
    );

    // Encode features
    uniqueSongs.forEach((song) => {
      song.bpm = song.bpm ? song.bpm / 200.0 : 0;

      genreMap.forEach((g) => song[`genre_${g}`] = song.genre === g ? 1 : 0);
      Object.entries(moodMap).forEach(([mood, col]) => song[col] = song.mood === mood ? 1 : 0);

      featureColumns.forEach((col) => {
        if (song[col] === undefined) song[col] = 0;
      });
    });

    const userVector = buildUserVector(uniqueSongs);
    const recommendations = await getTopRecommendations(userVector, 10);
    res.json({ userVector, recommendations });
  } catch (err) {
    console.error("❌ Error in recommendSongs:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getSongBasedRecommendations = async (req, res) => {
  try {
    const { songId } = req.params;
    const recommendations = await generateSongBasedPlaylist(songId);
    res.json({ recommendations });
  } catch (err) {
    console.error("❌ Error in getSongBasedRecommendations:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const recommendByMood = async (req, res) => {
  try {
    const { userId, mood } = req.params;
    const userSongs = await getUserSongs(userId);

    if (!userSongs.length) return res.status(404).json({ message: "No songs found" });

    const userVector = buildUserVector(userSongs);
    const recommendations = await getRecommendationsFiltered(userVector, "mood", mood.toLowerCase(), 20);

    res.json({ userVector, recommendations });
  } catch (err) {
    console.error("❌ Error in recommendByMood:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const recommendByGenre = async (req, res) => {
  try {
    const { userId, genre } = req.params;
    const userSongs = await getUserSongs(userId);

    if (!userSongs.length) return res.status(404).json({ message: "No songs found" });

    const userVector = buildUserVector(userSongs);
    const recommendations = await getRecommendationsFiltered(userVector, "genre", genre.toLowerCase(), 20);

    res.json({ userVector, recommendations });
  } catch (err) {
    console.error("❌ Error in recommendByGenre:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
import db from "../config/db.js";
export const createPlaylistWithRecommendations = async (req, res) => {
  try {
    const { userId, title, type, mood, genre } = req.body;

    // 1. Insert playlist metadata
    const playlistRes = await db.query(
      `INSERT INTO public.playlist (title, release_date, created_at, user_id)
       VALUES ($1, NOW(), NOW(), $2)
       RETURNING *`,
      [title, userId]
    );
    const playlist = playlistRes.rows[0];

    // 2. Fetch user songs and build vector
    const userSongs = await getUserSongs(userId);
    if (!userSongs.length) {
      return res.status(404).json({ message: "No songs found for recommendations" });
    }

    const userVector = buildUserVector(userSongs);

    // 3. Get recommendations
    let recommendations = [];
    if (type === "mood" && mood) {
      recommendations = await getRecommendationsFiltered(userVector, "mood", mood.toLowerCase(), 20);
    } else if (type === "genre" && genre) {
      recommendations = await getRecommendationsFiltered(userVector, "genre", genre.toLowerCase(), 20);
    }

    // 4. Insert recommended songs into playlist_songs
    for (const song of recommendations) {
      await db.query(
        `INSERT INTO public.playlist_songs (playlist_id, song_id, created_at)
         VALUES ($1, $2, NOW())`,
        [playlist.id, song.id]
      );
    }

    res.json({
      playlist,
      songs: recommendations,
    });
  } catch (err) {
    console.error("❌ Error in createPlaylistWithRecommendations:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
