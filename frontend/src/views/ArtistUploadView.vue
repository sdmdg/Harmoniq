<template>
  <div class="artist-upload-view min-h-screen bg-[#121212] text-white">
    <header class="mx-auto max-w-6xl px-6 pt-10">
      <nav class="text-sm text-neutral-400 mb-3" aria-label="Breadcrumb">
        <ol class="flex items-center gap-2">
          <li class="hover:text-white cursor-default">Artist</li>
          <li class="opacity-60">/</li>
          <li class="text-white font-medium">Upload a Song</li>
        </ol>
      </nav>

      <div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 class="text-3xl font-bold text-white">Upload a Song</h1>
          <p class="text-neutral-400 mt-1">
            Get your music on the platform. Upload a song and fill in the details.
          </p>
        </div>
      </div>

      <div class="border-t border-neutral-800 my-6"></div>
    </header>

    <main class="mx-auto max-w-6xl px-6 pb-16">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section class="lg:col-span-2">
          <div class="mx-auto max-w-3xl">
            <div class="rounded-2xl bg-neutral-900 border border-neutral-800 p-6 shadow-lg">
              <h2 class="text-lg font-semibold text-white mb-4 text-center">
                {{ songFeatures ? 'Review & Edit Features' : 'New Song Details' }}
              </h2>
              <form
                v-if="!songFeatures"
                @submit.prevent="handleUpload"
                class="space-y-5"
              >
                <div class="flex flex-col">
                  <label class="font-semibold mb-2 text-gray-400">Song Title:</label>
                  <input
                    type="text"
                    v-model="songTitle"
                    placeholder="Enter song title"
                    class="form-input"
                    required
                  />
                </div>

                <div class="flex flex-col">
                  <label class="font-semibold mb-2 text-gray-400">Select Album:</label>
                  <select
                    v-model="selectedAlbumId"
                    class="form-select"
                  >
                    <option v-for="album in albums" :key="album.id" :value="album.id">
                      {{ album.title }}
                    </option>
                    <option value="new">+ Create New Album</option>
                  </select>
                </div>

                <div v-if="selectedAlbumId === 'new'" class="space-y-3 mt-3">
                  <div class="flex flex-col">
                    <label class="font-semibold mb-1 text-gray-400">New Album Title:</label>
                    <input
                      type="text"
                      v-model="newAlbum.title"
                      placeholder="Enter album title"
                      class="form-input"
                      :required="selectedAlbumId === 'new'"
                    />
                  </div>

                  <div class="flex flex-col">
                    <label class="font-semibold mb-1 text-gray-400">Release Date:</label>
                    <input
                      type="date"
                      v-model="newAlbum.releaseDate"
                      class="form-input"
                      :required="selectedAlbumId === 'new'"
                    />
                  </div>
                  <div class="flex flex-col">
                    <label class="font-semibold mb-1 text-gray-400">Upload Album Image:</label>
                    <input
                      type="file"
                      @change="handleAlbumImageChange"
                      accept="image/*"
                      class="file-input"
                      :required="selectedAlbumId === 'new'"
                    />
                </div>
                </div>
                
                <div class="flex flex-col">
                  <label class="font-semibold mb-2 text-gray-400">Select Song:</label>
                  <input
                    type="file"
                    ref="fileInput"
                    @change="handleFileChange"
                    accept="audio/*"
                    required
                    class="file-input"
                  />
                </div>

                <button
                  type="submit"
                  :disabled="isUploading"
                  class="w-full btn-primary"
                >
                  <span v-if="isUploading" class="flex items-center justify-center">
                    <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                  <span v-else>Upload Song</span>
                </button>
              </form>

              <div v-if="songFeatures" class="space-y-5">
                <div class="grid grid-cols-2 gap-4">
                  <div v-for="(value, key) in songFeatures" :key="key" class="feature-card">
                    <label class="font-semibold mb-1 text-gray-400">{{ formatFeatureName(key) }}:</label>

                    <select
                      v-if="key === 'genre'"
                      v-model="songFeatures[key]"
                      class="form-select"
                    >
                      <option v-for="genre in genres" :key="genre" :value="genre">{{ genre }}</option>
                    </select>

                    <select
                      v-else-if="key === 'mood'"
                      v-model="songFeatures[key]"
                      class="form-select"
                    >
                      <option v-for="mood in moods" :key="mood" :value="mood">{{ mood }}</option>
                    </select>

                    <input
                      v-else-if="editableFields.includes(key)"
                      type="text"
                      v-model="songFeatures[key]"
                      class="form-input"
                      :placeholder="`Enter new ${formatFeatureName(key)}`"
                    />

                    <p v-else class="feature-value">{{ value }}</p>
                  </div>
                </div>

                <div class="flex flex-col sm:flex-row gap-4 mt-4">
                  <button
                    type="button"
                    @click="publishSong"
                    :disabled="isUploading"
                    class="flex-1 btn-primary"
                  >
                    Publish Song
                  </button>
                  <button
                    type="button"
                    @click="resetUpload"
                    :disabled="isUploading"
                    class="flex-1 btn-secondary"
                  >
                    Cancel & Upload New
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <aside class="lg:col-span-1">
          <div class="rounded-2xl bg-neutral-900 border border-neutral-800 p-5">
            <h3 class="text-white font-semibold">Tips for a fast upload</h3>
            <ul class="mt-3 list-disc pl-5 text-sm text-neutral-300 space-y-2">
              <li>Use high-quality audio for best results.</li>
              <li>Ensure your song title is accurate and free of typos.</li>
              <li>Provide accurate album details for better organization.</li>
              <li>Review the extracted features and make any necessary corrections before publishing.</li>
            </ul>
          </div>
        </aside>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import apiClient from "../utils/axios.js";

const router = useRouter();

const albums = ref([]);
const selectedAlbumId = ref(null);
const songFile = ref(null);
const songTitle = ref("");
const isUploading = ref(false);
const songFeatures = ref(null);
const songId = ref(null);
const fileUrl = ref(null);

const newAlbum = ref({
  title: "",
  releaseDate: "",
});

const fileInput = ref(null);

const genres = ['blues', 'classical', 'country', 'disco', 'hiphop', 'jazz', 'metal', 'pop', 'reggae', 'rock'];
const moods = ['Happy / Excited', 'Angry / Tense', 'Sad / Calm', 'Calm / Relaxed', 'Mixed / Uncertain Mood'];

const editableFields = ['bpm'];

const fetchAlbums = async () => {
  const userData = localStorage.getItem("user_data");
  if (!userData) return router.push("/login");

  const user = JSON.parse(userData);
  try {
    const response = await apiClient.get(`/api/album/user/${user.id}`);
    albums.value = response.data || [];
    if (albums.value.length > 0) {
      selectedAlbumId.value = albums.value[0].id;
    }
  } catch (error) {
    console.error("Error fetching albums:", error);
  }
};

const handleFileChange = (e) => {
  songFile.value = e.target.files[0];
};
const albumArtFile = ref(null);
const albumArtId = ref(null);

const handleAlbumImageChange = async (e) => {
  console.log("Album image selected:", e.target.files[0]);

  albumArtFile.value = e.target.files[0];
  if (!albumArtFile.value) {
    console.warn(" No album art file selected");
    return;
  }

  try {
    const formData = new FormData();
    formData.append("file", albumArtFile.value);

    console.log("Sending album art to backend...");

    const res = await apiClient.post("/api/album/upload-art", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    console.log("Album art upload response:", res.data);

    albumArtId.value = res.data.albumArtId;
    newAlbum.value.albumArtId = albumArtId.value;

  } catch (error) {
    console.error("Album art upload failed:", error);
  }
};


const formatFeatureName = (key) => {
  return key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
};

const handleUpload = async () => {
  if (!songFile.value || !songTitle.value || !selectedAlbumId.value) {
    alert("Please fill in all required fields.");
    return;
  }
  if (selectedAlbumId.value === 'new' && (!newAlbum.value.title || !newAlbum.value.releaseDate)) {
      alert("Please provide a title and release date for the new album.");
      return;
  }

  isUploading.value = true;
  const userData = localStorage.getItem("user_data");
  if (!userData) {
    router.push("/login");
    isUploading.value = false;
    return;
  }
  const user = JSON.parse(userData);

  try {
    let albumId = selectedAlbumId.value;
    if (albumId === "new") {
      const albumResponse = await apiClient.post("api/album/add", {
        title: newAlbum.value.title,
        artist: user.id,
        releaseDate: newAlbum.value.releaseDate,
        albumArtId: newAlbum.value.albumArtId,
      });
      albumId = albumResponse.data.id;
      albums.value.push(albumResponse.data);
    }

    const formData = new FormData();
    formData.append("file", songFile.value);
    formData.append("title", songTitle.value);
    formData.append("albumId", albumId);
    formData.append("artistId", user.id);

    const uploadResponse = await apiClient.post(
      "/api/songs/upload-song",
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );

    songFeatures.value = uploadResponse.data.features || {};
    songId.value = uploadResponse.data.song.id;
    fileUrl.value = uploadResponse.data.file_url;
    
    alert("Song uploaded and features extracted! Please review and publish.");

  } catch (error) {
    console.error("Error during song upload or feature extraction:", error);
    alert("Failed to upload song or extract features. Please try again.");
  } finally {
    isUploading.value = false;
  }
};

const publishSong = async () => {
  if (!songId.value) {
    alert("No song to publish.");
    return;
  }
  
  if (!confirm("Are you sure you want to publish this song?")) {
    return;
  }

  isUploading.value = true;
  const userData = localStorage.getItem("user_data");
  if (!userData) {
    router.push("/login");
    isUploading.value = false;
    return;
  }
  const user = JSON.parse(userData);

  try {
    await apiClient.post(`/api/songs/publish`, {
      features: songFeatures.value,
      file_url: fileUrl.value,
      artistId: user.id,
    });
    
    alert("Song published successfully!");
    resetUpload();
    router.push('/artist/upload');
  } catch (error) {
    console.error("Error publishing song:", error);
    alert("Failed to publish song. Please try again.");
  } finally {
    isUploading.value = false;
  }
};

const resetUpload = () => {
  songTitle.value = "";
  songFile.value = null;
  songFeatures.value = null;
  songId.value = null;
  fileUrl.value = null;
  selectedAlbumId.value = (albums.value.length > 0) ? albums.value[0].id : null;
  newAlbum.value = { title: "", releaseDate: "" };
  if (fileInput.value) fileInput.value.value = null;
};

onMounted(fetchAlbums);
</script>

<style scoped>
/* Main Containers & Layout */
.artist-upload-view {
  background-color: #000;
}

/* Form Elements Styling */
.form-input, .form-select {
  @apply border border-neutral-700 rounded-lg px-3 py-2 bg-neutral-800 text-white focus:outline-none focus:ring-2 focus:ring-[#1DB954] focus:ring-offset-2 focus:ring-offset-neutral-900 transition-all duration-200;
}

.file-input {
  @apply w-full file:py-2 file:px-4 file:border-0 file:rounded-full file:font-semibold file:text-white file:bg-[#1DB954] file:cursor-pointer hover:file:bg-green-500 transition-colors duration-300;
}

/* Button Styling */
.btn-primary {
  @apply w-full bg-[#1DB954] text-gray-900 font-bold py-3 px-4 rounded-full shadow-lg hover:bg-green-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105;
}

.btn-secondary {
  @apply w-full bg-neutral-700 hover:bg-neutral-600 text-white font-bold py-3 px-4 rounded-full transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed;
}

.feature-card {
  @apply flex flex-col p-3 bg-neutral-800 rounded-lg shadow-inner;
}

.feature-value {
  @apply py-2 px-3 text-white font-medium;
}

/* Custom Scrollbar */
.artist-upload-view::-webkit-scrollbar {
  width: 6px;
}
.artist-upload-view::-webkit-scrollbar-thumb {
  background-color: #1DB954;
  border-radius: 10px;
}
.artist-upload-view::-webkit-scrollbar-track {
  background: #2d2d2d;
}
</style>