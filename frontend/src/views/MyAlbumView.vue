<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import apiClient from '../utils/axios';
import SongRow from '../components/SongRow.vue'; 
import Globe from "vue-material-design-icons/Publish.vue";
import Lock from "vue-material-design-icons/Lock.vue";

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

// Public/Private album function
const toggleAlbumVisibility = async (albumId, isPublic) => {
  let is_send_noti = false;
  const message = isPublic
    ? "Are you sure you want to make this album private?"
    : "Are you sure you want to publish this album?";

  if (!confirm(message)) return;
  if (!isPublic) {
    is_send_noti = confirm("Do you want to send notifications to your followers?");
  }
  
  
  try {
    // Call API to update album visibility
    await apiClient.patch(`/api/album/visibility/${albumId}`, {
      isPublic: !isPublic,
      is_send_noti: is_send_noti
    });

    // Optionally, update local state if needed
    const album = albums.value.find(a => a.id === albumId);
    if (album) album.isPublic = !isPublic;

    alert("Album visibility updated successfully!");
    fetchAlbums();
  } catch (err) {
    console.error("Error updating album visibility:", err);
    alert(err.response?.data?.message || "Failed to update album visibility.");
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
      console.log("songs:", response.data);
      albumSongs.value[albumId] = response.data.map((song) => {
        return {
          id: song.id,
          name: song.title,
          key: song.encryption_key,     
          path: song.id,     
          albumCover: song.albumcover || '/default.jpg',
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
  <div class="my-upload-view min-h-screen bg-[#121212] text-white">
    <header class="mx-auto max-w-6xl px-6 pt-10">
      <nav class="text-sm text-neutral-400 mb-3" aria-label="Breadcrumb">
        <ol class="flex items-center gap-2">
          <li class="hover:text-white cursor-default">Artist</li>
          <li class="opacity-60">/</li>
          <li class="text-white font-medium">My Albums</li>
        </ol>
      </nav>

      <div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 class="text-3xl font-bold text-white">My Albums</h1>
          <p class="text-neutral-400 mt-1">
            Your music on the platform.
          </p>
        </div>
      </div>

      <div class="border-t border-neutral-800 my-6"></div>
    </header>

    <main class="mx-auto max-w-6xl px-6 pb-16">
      <div v-if="loading" class="text-gray-400 text-center">Loading albums...</div>
      <div v-else-if="errorMessage" class="text-red-500 text-center">{{ errorMessage }}</div>
      <div v-else-if="albums.length === 0" class="text-gray-400 text-center">No albums found.</div>

      <div v-else class="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 gap-4 sm:gap-4">
        <div
          v-for="album in albums"
          :key="album.id"
          class="relative bg-[#181818] rounded-lg overflow-hidden shadow-lg hover:scale-105 transition-transform duration-300 cursor-pointer flex flex-col items-center"
        >
          <!-- Delete Button -->
          <button
            @click.stop="deleteAlbum(album.id)"
            class="absolute top-2 right-2 flex items-center justify-center bg-red-600 hover:bg-red-700 text-white text-sm w-7 h-7 rounded-full shadow-md transition-all duration-300 z-10"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>

          <!-- Public/Private Button -->
          <button
            @click.stop="toggleAlbumVisibility(album.id, album.published)"
            :aria-label="album.published ? 'Make Private' : 'Make Public'"
            :class="[
              'absolute top-2 left-2 flex items-center justify-center text-white w-8 h-8 rounded-full shadow-md transition-colors duration-300 z-10',
              !album.published ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-600 hover:bg-gray-700'
            ]"
          >
            <Globe v-if="!album.published" class="h-6 w-6"/>
            <Lock v-else class="h-6 w-6" />
          </button>


          <!-- Album cover -->
          <img
            :src="album.coverUrl || 'https://via.placeholder.com/300x300?text=No+Cover'"
            alt="Album Cover"
            class="w-44 h-44 md:w-40 md:h-40 lg:w-48 lg:h-48 object-cover rounded-lg mt-4 cursor-pointer"
            @click="toggleAlbum(album.id)"
          />


          <!-- Album info -->
          <div class="p-2 text-center w-full">
            <h3 class="text-white font-semibold text-sm sm:text-base truncate">{{ album.title }}</h3>
          </div>

          <!-- Songs Section -->
          <ul
            v-if="expandedAlbumId === album.id"
            class="w-full mt-3 px-3 space-y-2 max-h-64 overflow-y-auto bg-[#121212] rounded-lg shadow-inner"
          >
            <SongRow
              v-for="(song, index) in albumSongs[album.id] || []"
              :key="song.id"
              :track="song"
              :artist="album"
              :index="index + 1"
              class="border-b border-gray-700 last:border-none"
            />
            <li
              v-if="(albumSongs[album.id] || []).length === 0"
              class="text-gray-500 text-sm text-center py-2"
            >
              No songs found.
            </li>
          </ul>
        </div>
      </div>

    </main>
  </div>
</template>

<style scoped>
/* Make the song list scroll nicely */
ul::-webkit-scrollbar {
  width: 6px;
}
ul::-webkit-scrollbar-thumb {
  background: #333;
  border-radius: 3px;
}
ul::-webkit-scrollbar-thumb:hover {
  background: #555;
}

/* Add breathing space between rows */
ul li {
  padding: 0.5rem;
  border-radius: 6px;
}

/* Highlight rows slightly on hover */
ul li:hover {
  background-color: #1e1e1e;
  transition: background 0.2s ease-in-out;
}
</style>




<style scoped>
/* Main Containers & Layout */
.my-upload-view {
  background-color: #000;
}

/* Custom Scrollbar */
.my-upload-view::-webkit-scrollbar {
  width: 6px;
}
.my-upload-view::-webkit-scrollbar-thumb {
  background-color: #1DB954;
  border-radius: 10px;
}
.my-upload-view::-webkit-scrollbar-track {
  background: #2d2d2d;
}
</style>