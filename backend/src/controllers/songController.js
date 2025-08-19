import { ModelSetSong } from '../models/User.js';
import { uploadFileToServer } from '../services/fileService.js';

export const setSong = async (req, res) => {
    const userId = req.user.id;

    try {
        // 1. Check file
        if (!req.file) {
            return res.status(400).json({ message: 'No audio file uploaded' });
        }

        // 2. Upload file to file server
        const fileUrl = await uploadFileToServer(req.file);
        if (!fileUrl) {
            return res.status(500).json({ message: 'Failed to upload the audio file to file server.' });
        }

        // 3. Extract metadata from body
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

        // 4. Save song metadata + fileUrl in DB
        const result = await ModelSetSong(
            albumId,
            title,
            duration,
            trackNumber,
            bpm,
            valence,
            arousal,
            genre,
            mood,
            fileUrl // pass file path/URL if your table has a column for it
        );

        res.status(201).json({
            message: 'Song uploaded successfully',
            song: result,
            fileUrl
        });
    } catch (err) {
        console.error('Error in setSong:', err);
        res.status(500).json({ message: 'Failed to upload the audio file.' });
    }
};
