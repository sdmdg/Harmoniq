import axios from 'axios';
import FormData from 'form-data';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
dotenv.config();

const VITE_FILE_SERVER = process.env.VITE_FILE_SERVER;

export const uploadFileToServer = async (file) => {
    try {
        const formData = new FormData();
        const originalExt = path.extname(file.originalname);
        const filepath = `${uuidv4()}${originalExt}`;
        formData.append('file', file.buffer, filepath);

        await axios.post(`${VITE_FILE_SERVER}/upload`, formData, {
            headers: formData.getHeaders(),
        });

        return filepath; // Return file path for DB storage
    } catch (error) {
        console.error('Error uploading to file server:', error);
        return null;
    }
};


export const encryptFile = async (fileName) => {
    try {
        const response = await axios.post(`${VITE_FILE_SERVER}/encrypt/${fileName}`);
        
        // Response contains encrypted filename + key/iv
        return response.data; 
    } catch (error) {
        console.error('Error encrypting file:', error);
        return null;
    }
};