<script setup>
import { ref, onMounted } from "vue";
import apiClient from "../utils/axios";

// State management
const moodFile = ref(null);
const genreFile = ref(null);
const moodFileName = ref("");
const genreFileName = ref("");
const uploading = ref({
  mood: false,
  genre: false,
});
const uploadStatus = ref({
  mood: null,
  genre: null,
});
const modelStatus = ref({
  mood_models: [],
  genre_models: [],
  total_mood_models: 0,
  total_genre_models: 0,
});
const errors = ref({
  mood: "",
  genre: "",
});

// File input refs
const moodFileInput = ref(null);
const genreFileInput = ref(null);

// File selection handlers
const onMoodFileSelect = (event) => {
  const file = event.target.files[0];
  if (file) {
    if (validateModelFile(file)) {
      moodFile.value = file;
      // Auto-fill filename but allow user to edit
      moodFileName.value = file.name;
      errors.value.mood = "";
    } else {
      errors.value.mood =
        "Please select a valid model file (.pkl, .h5, .pt, .pth, .onnx, .tflite)";
      event.target.value = "";
    }
  }
};

const onGenreFileSelect = (event) => {
  const file = event.target.files[0];
  if (file) {
    if (validateModelFile(file)) {
      genreFile.value = file;
      // Auto-fill filename but allow user to edit
      genreFileName.value = file.name;
      errors.value.genre = "";
    } else {
      errors.value.genre =
        "Please select a valid model file (.pkl, .h5, .pt, .pth, .onnx, .tflite)";
      event.target.value = "";
    }
  }
};

// File validation
const validateModelFile = (file) => {
  const validExtensions = [".pkl", ".h5", ".pt", ".pth", ".onnx", ".tflite"];
  const fileName = file.name.toLowerCase();
  return validExtensions.some((ext) => fileName.endsWith(ext));
};

// Upload handlers
const uploadMoodModel = async () => {
  if (!moodFile.value) {
    errors.value.mood = "Please select a mood model file";
    return;
  }

  if (!moodFileName.value.trim()) {
    errors.value.mood = "Please enter a filename";
    return;
  }

  uploading.value.mood = true;
  errors.value.mood = "";
  uploadStatus.value.mood = null;

  try {
    const formData = new FormData();

    // Create a new file with the custom name
    const fileExtension = "." + moodFile.value.name.split(".").pop();
    const customFileName = moodFileName.value.endsWith(fileExtension)
      ? moodFileName.value
      : moodFileName.value + fileExtension;

    const customFile = new File([moodFile.value], customFileName, {
      type: moodFile.value.type,
    });

    formData.append("model_file", customFile);

    const response = await apiClient.post("/api/models/upload-mood", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    uploadStatus.value.mood = "success";
    moodFile.value = null;
    moodFileName.value = "";
    moodFileInput.value.value = "";

    // Refresh model status
    await fetchModelStatus();
  } catch (error) {
    console.error("Mood model upload failed:", error);
    uploadStatus.value.mood = "error";
    errors.value.mood = error.response?.data?.message || "Upload failed";
  } finally {
    uploading.value.mood = false;
  }
};

const uploadGenreModel = async () => {
  if (!genreFile.value) {
    errors.value.genre = "Please select a genre model file";
    return;
  }

  if (!genreFileName.value.trim()) {
    errors.value.genre = "Please enter a filename";
    return;
  }

  uploading.value.genre = true;
  errors.value.genre = "";
  uploadStatus.value.genre = null;

  try {
    const formData = new FormData();

    // Create a new file with the custom name
    const fileExtension = "." + genreFile.value.name.split(".").pop();
    const customFileName = genreFileName.value.endsWith(fileExtension)
      ? genreFileName.value
      : genreFileName.value + fileExtension;

    const customFile = new File([genreFile.value], customFileName, {
      type: genreFile.value.type,
    });

    formData.append("model_file", customFile);

    const response = await apiClient.post(
      "/api/models/upload-genre",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    uploadStatus.value.genre = "success";
    genreFile.value = null;
    genreFileName.value = "";
    genreFileInput.value.value = "";

    // Refresh model status
    await fetchModelStatus();
  } catch (error) {
    console.error("Genre model upload failed:", error);
    uploadStatus.value.genre = "error";
    errors.value.genre = error.response?.data?.message || "Upload failed";
  } finally {
    uploading.value.genre = false;
  }
};

// Fetch current model status
const fetchModelStatus = async () => {
  try {
    const response = await apiClient.get("/api/models/status");
    modelStatus.value = response.data.status || response.data;
  } catch (error) {
    console.error("Failed to fetch model status:", error);
    modelStatus.value = {
      mood_models: [],
      genre_models: [],
      total_mood_models: 0,
      total_genre_models: 0,
    };
  }
};

// Format file size
const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

// Initialize
onMounted(() => {
  fetchModelStatus();
});
</script>

<template>
  <div class="p-8">
    <div class="max-w-4xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-green-500 mb-2">
          AI Model Management
        </h1>
        <p class="text-gray-400">
          Upload and manage AI models for mood and genre classification
        </p>
      </div>

      <!-- Current Model Status -->
      <div class="bg-gray-800/50 rounded-lg p-6 mb-8">
        <h2 class="text-xl font-semibold text-white mb-4">Uploaded Models</h2>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Mood Models -->
          <div class="bg-gray-700/50 rounded-lg p-4">
            <h3 class="text-lg font-semibold text-green-400 mb-3">
              Mood Models ({{ modelStatus.total_mood_models || 0 }})
            </h3>
            <div
              v-if="
                modelStatus.mood_models && modelStatus.mood_models.length > 0
              "
              class="space-y-2"
            >
              <div
                v-for="model in modelStatus.mood_models"
                :key="model.name"
                class="flex items-center justify-between p-2 bg-gray-600/50 rounded"
              >
                <span class="text-white text-sm font-medium">{{
                  model.name
                }}</span>
                <span class="text-gray-400 text-xs">{{
                  formatFileSize(model.size)
                }}</span>
              </div>
            </div>
            <div v-else class="text-gray-400 text-sm italic">
              No mood models uploaded
            </div>
          </div>

          <!-- Genre Models -->
          <div class="bg-gray-700/50 rounded-lg p-4">
            <h3 class="text-lg font-semibold text-blue-400 mb-3">
              Genre Models ({{ modelStatus.total_genre_models || 0 }})
            </h3>
            <div
              v-if="
                modelStatus.genre_models && modelStatus.genre_models.length > 0
              "
              class="space-y-2"
            >
              <div
                v-for="model in modelStatus.genre_models"
                :key="model.name"
                class="flex items-center justify-between p-2 bg-gray-600/50 rounded"
              >
                <span class="text-white text-sm font-medium">{{
                  model.name
                }}</span>
                <span class="text-gray-400 text-xs">{{
                  formatFileSize(model.size)
                }}</span>
              </div>
            </div>
            <div v-else class="text-gray-400 text-sm italic">
              No genre models uploaded
            </div>
          </div>
        </div>
      </div>

      <!-- Upload Sections -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Mood Model Upload -->
        <div class="bg-gray-800/50 rounded-lg p-6">
          <h2 class="text-xl font-semibold text-white mb-4">
            Upload Mood Model
          </h2>

          <!-- File Input -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-300 mb-2">
              Select Mood Model File
            </label>
            <input
              ref="moodFileInput"
              type="file"
              @change="onMoodFileSelect"
              accept=".pkl,.h5,.pt,.pth,.onnx,.tflite"
              class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-green-600 file:text-white hover:file:bg-green-700"
            />
            <p class="text-xs text-gray-400 mt-1">
              Supported formats: .pkl, .h5, .pt, .pth, .onnx, .tflite (Max:
              100MB)
            </p>
          </div>

          <!-- Custom Filename Input -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-300 mb-2">
              Model Filename
            </label>
            <input
              v-model="moodFileName"
              type="text"
              placeholder="Enter model filename (e.g., my_mood_model_v1.pkl)"
              class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <p class="text-xs text-gray-400 mt-1">
              This will be the filename saved in the AI module
            </p>
          </div>

          <!-- Selected File Info -->
          <div v-if="moodFile" class="mb-4 p-3 bg-gray-700/50 rounded-lg">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-white">
                  Original: {{ moodFile.name }}
                </p>
                <p class="text-sm text-green-400">
                  Will save as: {{ moodFileName }}
                </p>
                <p class="text-xs text-gray-400">
                  {{ formatFileSize(moodFile.size) }}
                </p>
              </div>
              <button
                @click="
                  moodFile = null;
                  moodFileName = '';
                  moodFileInput.value = '';
                "
                class="text-red-400 hover:text-red-300"
              >
                ✕
              </button>
            </div>
          </div>

          <!-- Error Message -->
          <div
            v-if="errors.mood"
            class="mb-4 p-3 bg-red-900/50 border border-red-500 rounded-lg"
          >
            <p class="text-red-300 text-sm">{{ errors.mood }}</p>
          </div>

          <!-- Success Message -->
          <div
            v-if="uploadStatus.mood === 'success'"
            class="mb-4 p-3 bg-green-900/50 border border-green-500 rounded-lg"
          >
            <p class="text-green-300 text-sm">
              Mood model uploaded successfully!
            </p>
          </div>

          <!-- Upload Button -->
          <button
            @click="uploadMoodModel"
            :disabled="!moodFile || !moodFileName.trim() || uploading.mood"
            class="w-full px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
          >
            <span
              v-if="uploading.mood"
              class="flex items-center justify-center"
            >
              <svg
                class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                ></circle>
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Uploading...
            </span>
            <span v-else>Upload Mood Model</span>
          </button>
        </div>

        <!-- Genre Model Upload -->
        <div class="bg-gray-800/50 rounded-lg p-6">
          <h2 class="text-xl font-semibold text-white mb-4">
            Upload Genre Model
          </h2>

          <!-- File Input -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-300 mb-2">
              Select Genre Model File
            </label>
            <input
              ref="genreFileInput"
              type="file"
              @change="onGenreFileSelect"
              accept=".pkl,.h5,.pt,.pth,.onnx,.tflite"
              class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-green-600 file:text-white hover:file:bg-green-700"
            />
            <p class="text-xs text-gray-400 mt-1">
              Supported formats: .pkl, .h5, .pt, .pth, .onnx, .tflite (Max:
              100MB)
            </p>
          </div>

          <!-- Custom Filename Input -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-300 mb-2">
              Model Filename
            </label>
            <input
              v-model="genreFileName"
              type="text"
              placeholder="Enter model filename (e.g., my_genre_model_v1.pkl)"
              class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <p class="text-xs text-gray-400 mt-1">
              This will be the filename saved in the AI module
            </p>
          </div>

          <!-- Selected File Info -->
          <div v-if="genreFile" class="mb-4 p-3 bg-gray-700/50 rounded-lg">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-white">
                  Original: {{ genreFile.name }}
                </p>
                <p class="text-sm text-blue-400">
                  Will save as: {{ genreFileName }}
                </p>
                <p class="text-xs text-gray-400">
                  {{ formatFileSize(genreFile.size) }}
                </p>
              </div>
              <button
                @click="
                  genreFile = null;
                  genreFileName = '';
                  genreFileInput.value = '';
                "
                class="text-red-400 hover:text-red-300"
              >
                ✕
              </button>
            </div>
          </div>

          <!-- Error Message -->
          <div
            v-if="errors.genre"
            class="mb-4 p-3 bg-red-900/50 border border-red-500 rounded-lg"
          >
            <p class="text-red-300 text-sm">{{ errors.genre }}</p>
          </div>

          <!-- Success Message -->
          <div
            v-if="uploadStatus.genre === 'success'"
            class="mb-4 p-3 bg-green-900/50 border border-green-500 rounded-lg"
          >
            <p class="text-green-300 text-sm">
              Genre model uploaded successfully!
            </p>
          </div>

          <!-- Upload Button -->
          <button
            @click="uploadGenreModel"
            :disabled="!genreFile || !genreFileName.trim() || uploading.genre"
            class="w-full px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
          >
            <span
              v-if="uploading.genre"
              class="flex items-center justify-center"
            >
              <svg
                class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                ></circle>
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Uploading...
            </span>
            <span v-else>Upload Genre Model</span>
          </button>
        </div>
      </div>

      <!-- Instructions -->
      <div class="mt-8 bg-blue-900/20 border border-blue-500/50 rounded-lg p-6">
        <h3 class="text-lg font-semibold text-blue-300 mb-3">Instructions</h3>
        <ul class="text-blue-200 space-y-2 text-sm">
          <li>
            • Make sure the AI module is running on the configured port before
            uploading models
          </li>
          <li>
            • Supported model formats: .pkl (Pickle), .h5 (Keras), .pt/.pth
            (PyTorch), .onnx (ONNX), .tflite (TensorFlow Lite)
          </li>
          <li>• Maximum file size is 100MB per model</li>
          <li>
            • The models will be automatically deployed to the AI module after
            successful upload
          </li>
          <li>• You can upload multiple models.</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Add any custom styles if needed */
</style>
