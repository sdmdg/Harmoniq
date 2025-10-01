import axios from "axios";
import FormData from "form-data";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";

dotenv.config();

const AI_MODULE_URL = process.env.AI_MODULE_URL || "http://localhost:8000";

/**
 * Upload mood model to AI module
 */
export const uploadMoodModel = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No mood model file uploaded" });
    }

    console.log("Uploading mood model:", req.file.originalname);

    // Create form data for AI module
    const formData = new FormData();
    formData.append("model_file", req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    });

    // Send to AI module
    const response = await axios.post(
      `${AI_MODULE_URL}/upload-mood-model`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          "Content-Type": "multipart/form-data",
        },
        timeout: 60000, // 60 seconds timeout for model upload
      }
    );

    console.log("Mood model upload response:", response.data);

    res.status(200).json({
      message: "Mood model uploaded successfully",
      data: response.data,
    });
  } catch (error) {
    console.error("Error uploading mood model:", error);

    if (error.code === "ECONNREFUSED") {
      return res.status(503).json({
        message: "AI module is not reachable. Please ensure it's running.",
      });
    }

    const status = error.response?.status || 500;
    const message =
      error.response?.data?.message || "Failed to upload mood model";

    res.status(status).json({ message });
  }
};

/**
 * Upload genre model to AI module
 */
export const uploadGenreModel = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No genre model file uploaded" });
    }

    console.log("Uploading genre model:", req.file.originalname);

    // Create form data for AI module
    const formData = new FormData();
    formData.append("model_file", req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    });

    // Send to AI module
    const response = await axios.post(
      `${AI_MODULE_URL}/upload-genre-model`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          "Content-Type": "multipart/form-data",
        },
        timeout: 60000, // 60 seconds timeout for model upload
      }
    );

    console.log("Genre model upload response:", response.data);

    res.status(200).json({
      message: "Genre model uploaded successfully",
      data: response.data,
    });
  } catch (error) {
    console.error("Error uploading genre model:", error);

    if (error.code === "ECONNREFUSED") {
      return res.status(503).json({
        message: "AI module is not reachable. Please ensure it's running.",
      });
    }

    const status = error.response?.status || 500;
    const message =
      error.response?.data?.message || "Failed to upload genre model";

    res.status(status).json({ message });
  }
};

/**
 * Get current model status from AI module
 */
export const getModelStatus = async (req, res) => {
  try {
    const response = await axios.get(`${AI_MODULE_URL}/model-status`, {
      timeout: 10000,
    });

    res.status(200).json(response.data);
  } catch (error) {
    console.error("Error getting model status:", error);

    if (error.code === "ECONNREFUSED") {
      return res.status(503).json({
        message: "AI module is not reachable",
        status: {
          mood_model: "unknown",
          genre_model: "unknown",
        },
      });
    }

    res.status(500).json({
      message: "Failed to get model status",
      status: {
        mood_model: "error",
        genre_model: "error",
      },
    });
  }
};
