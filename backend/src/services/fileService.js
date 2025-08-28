import axios from 'axios';
import FormData from 'form-data';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
dotenv.config();

const VITE_FILE_SERVER = process.env.VITE_FILE_SERVER;

/**
 * Upload file to file server.
 * For images: generates a new UUID (existing behavior)
 * For audio: uses provided songId to save file with same UUID
 */
export const uploadFileToServer = async (file, songId = null) => {
    try {
        const formData = new FormData();
        const originalExt = path.extname(file.originalname);

        let filename;
        if (file.mimetype.startsWith('audio/')) {
            // Use songId from controller if provided, else generate one
            const id = songId || uuidv4();
            filename = `${id}${originalExt}`;
            formData.append('fileId', id); // <-- Pass UUID to backend for audio
        } else {
            // Keep existing behavior for images
            filename = `${uuidv4()}${originalExt}`;
        }

        formData.append('file', file.buffer, filename);

        const response = await axios.post(`${VITE_FILE_SERVER}/upload`, formData, {
            headers: formData.getHeaders(),
        });

        // For DB, we store the path returned by the file server
        return response.data.path || filename;
    } catch (error) {
        console.error('Error uploading to file server:', error);
        return null;
    }
};
