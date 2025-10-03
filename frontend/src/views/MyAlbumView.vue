<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import apiClient from '../utils/axios';
import SongRow from '../components/SongRow.vue'; 

const albums = ref([]);
const loading = ref(true);
const errorMessage = ref('');
const user = ref(null);
const router = useRouter();

const VITE_FILE_SERVER = import.meta.env.VITE_FILE_SERVER; 

const expandedAlbumId = ref(null);
const albumSongs = ref({});

// Delete album function
const deleteAlbum = async (albumId) => {
  if (!confirm("Are you sure you want to delete this album?")) return;

  try {
    await apiClient.delete(`/api/album/delete/${albumId}`);
    albums.value = albums.value.filter((album) => album.id !== albumId); 
    delete albumSongs.value[albumId]; 
  } catch (err) {
    console.error("Error deleting album:", err);
    alert(err.response?.data?.message || "Failed to delete album.");
  }
};

// Get user
const fetchUser = () => {
  const userData = localStorage.getItem('user_data');
  if (userData) {
    user.value = JSON.parse(userData);
  } else {
    router.push('/login');
  }
};

function imageExists(url) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
}

// Fetch albums
const fetchAlbums = async () => {
  if (!user.value) return;
  loading.value = true;
  errorMessage.value = '';
  try {
    const response = await apiClient.get(`api/album/user/${user.value.id}`);
    console.log(response.data);
    const base = `${VITE_FILE_SERVER}/public/images`;
    const exts = ['.png', '.jpg', '.jpeg'];

    albums.value = await Promise.all(
      response.data.map(async (album) => {
        let coverUrl = null;
        for (const ext of exts) {
          const url = `${base}/${album.album_art_id}${ext}`;
          if (await imageExists(url)) {
            coverUrl = url;
            break;
          }
        }
        if (!coverUrl) {
          coverUrl = 'https://via.placeholder.com/300x300?text=No+Cover';
        }
        return { ...album, coverUrl };
      })
    );
  } catch (error) {
    console.error('Error fetching albums:', error);
    errorMessage.value = error.response?.data?.message || 'Failed to fetch albums.';
    albums.value = [];
  } finally {
    loading.value = false;
  }
};

// Toggle expand + fetch songs
const toggleAlbum = async (albumId) => {
  if (expandedAlbumId.value === albumId) {
    expandedAlbumId.value = null; 
    return;
  }
  expandedAlbumId.value = albumId;

  if (!albumSongs.value[albumId]) {
    try {
      const response = await apiClient.get(`/api/album/album_songs/${albumId}`);
      albumSongs.value[albumId] = response.data.map((song) => {
        return {
          id: song.id,
          name: song.title,
          key: song.encryption_key,     
          path: song.id,     
        };
      });
    } catch (err) {
      console.error('Error fetching songs:', err);
      albumSongs.value[albumId] = [];
    }
  }
};

onMounted(() => {
  fetchUser();
  fetchAlbums();
});
</script>

<template>
  <div class="min-h-screen bg-black p-4 sm:p-6">
    <h2 class="text-2xl sm:text-3xl font-bold text-white mb-6 text-center">My Albums</h2>

    <div v-if="loading" class="text-gray-400 text-center">Loading albums...</div>
    <div v-else-if="errorMessage" class="text-red-500 text-center">{{ errorMessage }}</div>
    <div v-else-if="albums.length === 0" class="text-gray-400 text-center">No albums found.</div>

    <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
      <div
        v-for="album in albums"
        :key="album.id"
        class="relative bg-[#181818] rounded-lg overflow-hidden shadow-lg hover:scale-105 transition-transform duration-300 cursor-pointer flex flex-col items-center"
      >
        <!-- Delete Button always visible -->
        <button
          @click.stop="deleteAlbum(album.id)"
          class="absolute top-2 right-2 flex items-center justify-center bg-red-600 hover:bg-red-700 text-white text-sm w-7 h-7 rounded-full shadow-md transition-all duration-300 z-10"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>

        <!-- Album cover -->
        <img
          :src="album.coverUrl || 'https://via.placeholder.com/300x300?text=No+Cover'"
          alt="Album Cover"
          class="w-32 h-32 sm:w-36 sm:h-36 md:w-40 md:h-40 object-cover rounded-lg mt-4"
          @click="toggleAlbum(album.id)"
        />

        <!-- Album info -->
        <div class="p-2 text-center w-full">
          <h3 class="text-white font-semibold text-sm sm:text-base truncate">{{ album.title }}</h3>
          <p class="text-gray-400 text-xs sm:text-sm mt-1 truncate">Artist: {{ album.artistName || 'You' }}</p>
        </div>

        <!-- Songs Section -->
        <ul v-if="expandedAlbumId === album.id" class="w-full mt-2 px-2 space-y-1 max-h-48 overflow-y-auto">
          <SongRow
            v-for="(song, index) in albumSongs[album.id] || []"
            :key="song.id"
            :track="song"
            :artist="album"
            :index="index + 1"
          />
          <li v-if="(albumSongs[album.id] || []).length === 0" class="text-gray-500 text-sm text-center">
            No songs found.
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped>
div:hover {
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.5);
}
</style>
