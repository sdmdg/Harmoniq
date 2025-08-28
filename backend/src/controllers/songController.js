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
        const file_name = await uploadFileToServer(req.file);

        if (!file_name) {
            return res.status(500).json({ message: 'Failed to upload the audio file to file server.' });
        }

        const file_id = file_name.split('.')[0];

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

        // 4. Save song metadata + file_id in DB
        const result = await ModelSetSong(
            file_id,
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
            message: 'Song uploaded successfully',
            song: result,
            file_name
        });
    } catch (err) {
        console.error('Error in setSong:', err);
        res.status(500).json({ message: 'Failed to upload the audio file.' });
    }
};
