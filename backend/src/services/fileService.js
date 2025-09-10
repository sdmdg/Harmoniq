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

export const deleteFileOnServer = async (type, filename) => {
  try {
    const url = `${VITE_FILE_SERVER}/delete/${type}/${encodeURIComponent(filename)}`;
    const { data } = await axios.delete(url, { timeout: 10_000 });
    return { ok: true, data };
  } catch (err) {
    return { ok: false, error: err?.response?.data || err.message };
  }
};


export const getFileById = async (id) => {
  const exts = ['.jpeg', '.png', '.mp3', '.mp3.encrypted','.jpg'];
  for (const ext of exts) {
    try {
      const url = `${VITE_FILE_SERVER}/files/${id}${ext}`;
      const response = await axios.get(url, { responseType: 'arraybuffer' });
      return { ok: true, data: response.data, ext };
    } catch (err) {
      continue; // try next extension
    }
  }
  return { ok: false, error: 'File not found with known extensions' };
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