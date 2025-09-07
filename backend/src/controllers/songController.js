import { ModelSetSong, ModelUpdateSong,ModelDeleteSong } from "../models/Song.js";
import { uploadFileToServer,deleteFileOnServer, encryptFile } from "../services/fileService.js";
import axios from "axios";

import { ModelListSongs, ModelCountSongs,ModelGetSongById } from "../models/Song.js";


export const listSongsAdmin = async (req, res) => {
  try {
    const { query, page = 1, limit = 10 } = req.query;

    const [items, total] = await Promise.all([
      ModelListSongs({ query, page, limit }),
      ModelCountSongs({ query })
    ]);

    res.status(200).json({
      items,
      total,
      page: Number(page),
      limit: Number(limit)
    });
  } catch (err) {
    console.error("listSongsAdmin error:", err);
    res.status(500).json({ message: "Failed to load songs." });
  }
};
export const getSongById = async (req, res) => {
  const { id } = req.params;

  try {
    const song = await ModelGetSongById(id);
    if (!song) {
      return res.status(404).json({ message: "Song not found" });
    }

    res.status(200).json(song);
  } catch (err) {
    console.error("Error in getSongById:", err);
    res.status(500).json({ message: "Failed to fetch song." });
  }
};

export const setSong = async (req, res) => {
  const userId = req.user.id;
  console.log("User ID:", userId);

  try {
    // 1. Check file
    if (!req.file) {
      console.log("No file uploaded");
      return res.status(400).json({ message: "No audio file uploaded" });
    }
    console.log("File received:", req.file.originalname);

    // 2. Upload file to file server
    const file_name = await uploadFileToServer(req.file);
    console.log("Uploaded file name:", file_name);

    if (!file_name) {
      console.log("File upload failed");
      return res
        .status(500)
        .json({ message: "Failed to upload the audio file to file server." });
    }

    const file_id = file_name.split(".")[0];
    const file_url = `http://localhost:3000/public/songs/${file_name}`;
    console.log("File URL:", file_url);

    // 3. Extract metadata from body
    const { albumId, title, trackNumber } = req.body;
    console.log("Metadata:", { albumId, title, trackNumber });

    // 4. Call AI model for features
    let features;
    try {
      console.log("Calling AI model...");
      console.log("Sending to AI service:", file_url);

      const aiResponse = await axios.get("http://localhost:8000/predict", {
        params: { file_url },
        paramsSerializer: (params) =>
          Object.keys(params)
            .map(
              (key) => `${key}=${encodeURIComponent(params[key])}`
            )
            .join("&"),
      });

      const data = aiResponse.data;
      console.log("AI response:", data);

      features = {
        bpm: data.bpm,
        valence: data.valence,
        arousal: data.arousal,
        genre: data.genre?.prediction,
        mood: data.mood?.prediction,
        duration: data.duration,
      };
      console.log("Extracted features:", features);
    } catch (aiError) {
      console.error("AI feature extraction failed:", aiError.message);
      return res.status(500).json({ message: "AI feature extraction failed." });
    }

    // 6. Save song metadata + features into DB
    console.log("Saving song to DB...");
    const result = await ModelSetSong(
      file_id,
      albumId,
      title,
      features.duration,
      trackNumber,
      features.bpm,
      features.valence,
      features.arousal,
      features.genre,
      features.mood
    );
    console.log("Saved song:", result);

    // 7. Respond to frontend
    res.status(201).json({
      message: "Song uploaded successfully",
      song: result,
      features,
      file_url,
    });
  } catch (err) {
    console.error("Error in setSong:", err);
    res.status(500).json({ message: "Failed to upload the audio file." });
  }
};


export const updateSong = async (req, res) => {
  try {
    // 1. Extract data from the new, pre-processed payload
    const { features, file_url, artistId } = req.body;
    console.log("Received payload for update:", req.body);

    if (!features && !file_url && !artistId) {
      return res.status(400).json({ message: "No data provided to update." });
    }

    // 2. Regular expression to match UUID
    const uuidRegex = /([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/i;

    const match = file_url.match(uuidRegex);
    let file_id;

    if (match) {
      file_id = match[1];
    } else {
      console.log('No UUID found in the URL.');
    }

    const filename = file_url.split("/").pop();
    const encryptRes = await encryptFile(filename);
    if (!encryptRes) return res.status(500).json({ message: "Encryption failed." });

    let encryptionKey = encryptRes.key_hex;
    let ivHex = encryptRes.iv_hex;

    // 3. Save changes to the database
    console.log("Updating song in DB with data:", features);
    const updatedSong = await ModelUpdateSong(file_id, features, encryptionKey);
    console.log("Updated song:", updatedSong);

    if (!updatedSong) {
      return res.status(404).json({ message: "Song not found or failed to update." });
    }

    // 5. Respond to frontend
    res.status(200).json({
      message: "Song updated successfully",
      song: updatedSong,
    });
  } catch (err) {
    console.error("Error in updateSong:", err);
    res.status(500).json({ message: "Failed to update the song." });
  }
};
export const deleteSong = async (req, res) => {
  const { id } = req.params;  // UUID

  try {
    // 1) Fetch the song (so we know stored filenames if available)
    const song = await ModelGetSongById(id);
    if (!song) return res.status(404).json({ message: "Song not found" });

    // 2) Decide which filenames to delete on the file server
    // If your DB has these columns, prefer them:
    const candidates = [];
    if (song.stored_filename) candidates.push(song.stored_filename);
    if (song.encrypted_filename) candidates.push(song.encrypted_filename);

    // Fallback if filenames aren’t stored: try common patterns
    if (candidates.length === 0) {
      candidates.push(`${id}.mp3.encrypted`, `${id}.mp3`);
    }

    // 3) Ask file server to delete (best-effort on each candidate)
    const fileResults = {};
    for (const name of candidates) {
      const resDel = await deleteFileOnServer("song", name);
      fileResults[name] = resDel.ok ? "deleted" : `not deleted: ${resDel.error}`;
    }

    // 4) Delete from DB
    await ModelDeleteSong(id);

    return res.status(200).json({
      message: "Song deleted",
      file_server: fileResults,
      db_deleted: true,
    });
  } catch (err) {
    console.error("deleteSong error:", err);
    return res.status(500).json({ message: "Failed to delete song." });
  }
};