import { ModelSetSong } from '../models/User.js';
import { uploadFileToServer } from '../services/fileService.js';
// controller.js
import { v4 as uuidv4 } from "uuid";

export const setSong = async (req, res) => {
    const userId = req.user.id;

    try {
        if (!req.file) {
            return res.status(400).json({ message: "No audio file uploaded" });
        }

        // Generate one UUID for both DB and file
        const songId = uuidv4();

        // Upload file to file server using this songId as filename
        const fileUrl = await uploadFileToServer(req.file, songId);
        if (!fileUrl) {
            return res.status(500).json({ message: "Failed to upload the audio file to file server." });
        }

        const {
            albumId,
            title,
            duration,
            trackNumber,
            bpm,
            valence,
            arousal,
            genre,
            mood
        } = req.body;

        const result = await ModelSetSong(
            songId,     // ✅ now aligned
            albumId,
            title,
            duration,
            trackNumber,
            bpm,
            valence,
            arousal,
            genre,
            mood    
        );

        res.status(201).json({
            message: "Song uploaded successfully",
            song: result,
            fileUrl
        });
    } catch (err) {
        console.error("Error in setSong:", err);
        res.status(500).json({ message: "Failed to upload the audio file." });
    }
};
