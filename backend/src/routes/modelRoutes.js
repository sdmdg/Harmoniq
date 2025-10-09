import { Router } from "express";
import multer from "multer";
import { protect } from "../middleware/authMiddleware.js";
import {
  uploadMoodModel,
  uploadGenreModel,
  getModelStatus,
} from "../controllers/modelController.js";

const router = Router();

// Configure multer for model file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 300 * 1024 * 1024, // 300MB limit for model files
  },
  fileFilter: (req, file, cb) => {
    // Accept common model file formats
    const allowedTypes = [
      "application/octet-stream",
      "application/x-pickle",
      ".pkl",
      ".h5",
      ".pt",
      ".pth",
      ".onnx",
      ".tflite",
    ];

    const isValidType = allowedTypes.some(
      (type) =>
        file.mimetype.includes(type) ||
        file.originalname.toLowerCase().endsWith(type)
    );

    if (isValidType) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Invalid file type. Please upload a valid model file (.pkl, .h5, .pt, .pth, .onnx, .tflite)"
        ),
        false
      );
    }
  },
});

// Routes - only admin can upload models
router.post(
  "/upload-mood",
  protect(["admin"]),
  upload.single("model_file"),
  uploadMoodModel
);
router.post(
  "/upload-genre",
  protect(["admin"]),
  upload.single("model_file"),
  uploadGenreModel
);
router.get("/status", protect(["admin"]), getModelStatus);

export default router;
