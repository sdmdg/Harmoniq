import { ModelSetSong } from "../models/User.js";
import { uploadFileToServer } from "../services/fileService.js";
import axios from "axios";
import { parseFile } from "music-metadata"; // To read audio duration

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
      };
      console.log("Extracted features:", features);
    } catch (aiError) {
      console.error("AI feature extraction failed:", aiError.message);
      return res.status(500).json({ message: "AI feature extraction failed." });
    }

    // 5. Extract duration in seconds
    let durationSeconds = null;
    try {
      const metadata = await parseFile(req.file.path);
      durationSeconds = metadata.format.duration
        ? Math.floor(metadata.format.duration)
        : null;
      console.log("Duration (seconds):", durationSeconds);
    } catch (err) {
      console.log("Could not read duration:", err);
    }

    // 6. Save song metadata + features into DB
    console.log("Saving song to DB...");
    const result = await ModelSetSong(
      file_id,
      albumId,
      title,
      durationSeconds,
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
