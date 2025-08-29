<template>
  <div class="artist-upload-view min-h-screen bg-gray-900 text-white p-6 flex flex-col items-center">
    <h1 class="text-3xl font-bold mb-6 text-[#1ED760] drop-shadow-lg">Upload a Song</h1>

    <!-- Upload Form -->
    <form
      @submit.prevent="handleUpload"
      class="bg-gray-800 p-6 rounded-xl shadow-xl w-full max-w-lg space-y-5"
    >
      <!-- Song File -->
      <div class="flex flex-col">
        <label class="font-semibold mb-2 text-[#1ED760]">Select Song:</label>
        <input
          type="file"
          @change="handleFileChange"
          accept="audio/*"
          class="file:py-2 file:px-4 file:border-0 file:rounded file:text-white file:bg-[#1ED760] file:cursor-pointer hover:file:bg-green-400"
          required
        />
      </div>

      <!-- Song Title -->
      <div class="flex flex-col">
        <label class="font-semibold mb-2 text-[#1ED760]">Song Title:</label>
        <input
          type="text"
          v-model="songTitle"
          placeholder="Enter song title"
          class="border border-gray-600 rounded-lg px-3 py-2 bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-[#1ED760]"
          required
        />
      </div>

      <!-- Album Selection -->
      <div class="flex flex-col">
        <label class="font-semibold mb-2 text-[#1ED760]">Select Album:</label>
        <select
          v-model="selectedAlbumId"
          class="border border-gray-600 rounded-lg px-3 py-2 bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-[#1ED760]"
        >
          <option v-for="album in albums" :key="album.id" :value="album.id">
            {{ album.title }}
          </option>
          <option value="new">+ Create New Album</option>
        </select>
      </div>

      <!-- New Album Fields -->
      <div v-if="selectedAlbumId === 'new'" class="space-y-3 mt-3">
        <div class="flex flex-col">
          <label class="font-semibold mb-1 text-[#1ED760]">New Album Title:</label>
          <input
            type="text"
            v-model="newAlbum.title"
            placeholder="Enter album title"
            class="border border-gray-600 rounded-lg px-3 py-2 bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-[#1ED760]"
          />
        </div>

        <div class="flex flex-col">
          <label class="font-semibold mb-1 text-[#1ED760]">Release Date:</label>
          <input
            type="date"
            v-model="newAlbum.releaseDate"
            class="border border-gray-600 rounded-lg px-3 py-2 bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-[#1ED760]"
          />
        </div>
      </div>

      <!-- Submit Button -->
      <button
        type="submit"
        :disabled="isUploading"
        class="w-full bg-[#1ED760] text-gray-900 font-bold py-2 px-4 rounded-lg hover:bg-green-400 transition duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {{ isUploading ? "Uploading..." : "Upload Song" }}
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import apiClient from '../utils/axios.js';

const router = useRouter();

const albums = ref([]);
const selectedAlbumId = ref(null);
const songFile = ref(null);
const songTitle = ref('');
const isUploading = ref(false);

const newAlbum = ref({
  title: '',
  releaseDate: '',
});

// Fetch user albums, redirect if not logged in
const fetchAlbums = async () => {
  const userData = localStorage.getItem('user_data');
  if (!userData) {
    console.error('No user ID found. Redirecting to login...');
    router.push('/login');
    return;
  }

  const user = JSON.parse(userData);

  try {
    const response = await apiClient.get(`/api/album/user/${user.id}`);
    albums.value = response.data || [];
  } catch (error) {
    console.error('Error fetching albums:', error);
  }
};

const handleFileChange = (e) => {
  songFile.value = e.target.files[0];
};

const handleUpload = async () => {
  if (!songFile.value || !songTitle.value) return;

  isUploading.value = true;

  const userData = localStorage.getItem('user_data');
  if (!userData) {
    alert('You must be logged in to upload songs.');
    router.push('/login');
    return;
  }
  const user = JSON.parse(userData);

  try {
    let albumId = selectedAlbumId.value;

    if (albumId === 'new') {
      const albumResponse = await apiClient.post('api/album/add', {
        title: newAlbum.value.title,
        artist: user.id,
        releaseDate: newAlbum.value.releaseDate,
      });
      albumId = albumResponse.data.id;
      albums.value.push(albumResponse.data);
    }

    const formData = new FormData();
    formData.append('title', songTitle.value);
    formData.append('file', songFile.value);
    formData.append('albumId', albumId);

    await apiClient.post('/songs/add', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    alert('Song uploaded successfully!');
    songFile.value = null;
    songTitle.value = '';
    selectedAlbumId.value = null;
    newAlbum.value = { title: '', releaseDate: '' };
  } catch (error) {
    console.error('Error uploading song:', error);
    alert('Failed to upload song.');
  } finally {
    isUploading.value = false;
  }
};

onMounted(fetchAlbums);
</script>

<style scoped>
.artist-upload-view::-webkit-scrollbar {
  width: 6px;
}
.artist-upload-view::-webkit-scrollbar-thumb {
  background-color: #1ED760;
  border-radius: 10px;
}
.artist-upload-view::-webkit-scrollbar-track {
  background: #2d2d2d;
}
</style>
