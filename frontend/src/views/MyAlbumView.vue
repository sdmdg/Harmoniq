<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import apiClient from '../utils/axios';
import SongRow from '../components/SongRow.vue'; // ✅ use SongRow instead

const albums = ref([]);
const loading = ref(true);
const errorMessage = ref('');
const user = ref(null);
const router = useRouter();

const VITE_FILE_SERVER = import.meta.env.VITE_FILE_SERVER; // e.g., http://localhost:3000

// Track which album is expanded
const expandedAlbumId = ref(null);
const albumSongs = ref({}); // { albumId: [songs] }

// Get user from localStorage
const fetchUser = () => {
  const userData = localStorage.getItem('user_data');
  if (userData) {
    user.value = JSON.parse(userData);
  } else {
    router.push('/login');
  }
};

// Check if an image exists by trying to load it
function imageExists(url) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
}

// Fetch albums using apiClient
const fetchAlbums = async () => {
  if (!user.value) return;
  loading.value = true;
  errorMessage.value = '';
  try {
    const response = await apiClient.get(`api/album/user/${user.value.id}`);
    console.log('Albums API response:', response.data);

    const base = `${VITE_FILE_SERVER}/public/images`;
    const exts = ['.png', '.jpg', '.jpeg'];

    albums.value = await Promise.all(
      response.data.map(async (album) => {
        let coverUrl = null;

        for (const ext of exts) {
          const url = `${base}/${album.album_art_id}${ext}`;
          console.log(`Trying URL: ${url}`);
          // eslint-disable-next-line no-await-in-loop
          if (await imageExists(url)) {
            coverUrl = url;
            console.log(`✅ Found cover for "${album.title}": ${url}`);
            break;
          }
        }

        if (!coverUrl) {
          console.warn(`⚠️ No cover found for "${album.title}", using placeholder`);
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

// Toggle album expansion + fetch songs if not loaded
const toggleAlbum = async (albumId) => {
  if (expandedAlbumId.value === albumId) {
    expandedAlbumId.value = null; // collapse
    return;
  }
  expandedAlbumId.value = albumId;

  if (!albumSongs.value[albumId]) {
    console.log('Fetching songs for album:', albumId);
    try {
      const response = await apiClient.get(`/api/album/album_songs/${albumId}`);
      console.log(`Songs fetched for album ${albumId}:`, response.data);

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
  } else {
    console.log('Songs already loaded for album:', albumId);
  }
};

onMounted(() => {
  fetchUser();
  fetchAlbums();
});
</script>

<template>
  <div class="min-h-screen bg-black p-6">
    <h2 class="text-3xl font-bold text-white mb-6 text-center">My Albums</h2>

    <div v-if="loading" class="text-gray-400 text-center">Loading albums...</div>
    <div v-else-if="errorMessage" class="text-red-500 text-center">{{ errorMessage }}</div>
    <div v-else-if="albums.length === 0" class="text-gray-400 text-center">No albums found.</div>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      <div
        v-for="album in albums"
        :key="album.id"
        class="bg-[#181818] rounded-lg overflow-hidden shadow-lg hover:scale-105 transition-transform duration-300 cursor-pointer"
        @click="toggleAlbum(album.id)"
      >
        <img
          :src="album.coverUrl || 'https://via.placeholder.com/300x300?text=No+Cover'"
          alt="Album Cover"
          class="w-50 h-50 object-cover"
        />
        <div class="p-4">
          <h3 class="text-white font-semibold text-lg truncate">{{ album.title }}</h3>
          <p class="text-gray-400 text-sm mt-1">Artist: {{ album.artistName || 'You' }}</p>

          <!-- Songs Section -->
          <ul v-if="expandedAlbumId === album.id" class="mt-3 space-y-2">
            <SongRow
              v-for="(song, index) in albumSongs[album.id] || []"
              :key="song.id"
              :track="song"
              :artist="album"
              :index="index + 1"
              duration="3:45"
            />
            <li
              v-if="(albumSongs[album.id] || []).length === 0"
              class="text-gray-500 text-sm"
            >
              No songs found.
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
div:hover {
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.5);
}
</style>
