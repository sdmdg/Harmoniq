<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import SongRow from '../components/SongRow.vue';
import ClockTimeThreeOutline from 'vue-material-design-icons/ClockTimeThreeOutline.vue';
import Share from 'vue-material-design-icons/Share.vue';
import apiClient from '../utils/axios';

import { useSongStore } from '../stores/song';
import { storeToRefs } from 'pinia';

const useSong = useSongStore();
const { isPlaying, currentTrack, currentArtist } = storeToRefs(useSong);

const route = useRoute();
const router = useRouter();

const collection = ref(null);
const loading = ref(true);
const error = ref(null);
const playlistData = ref(null);
const fileServerBaseUrl = import.meta.env.VITE_FILE_SERVER || 'http://localhost:3000';
const user = ref(null);

const playFunc = () => {
  if (currentTrack.value) {
    useSong.playOrPauseThisSong(currentArtist.value, currentTrack.value);
  } else if (collection.value?.tracks?.length > 0) {
    const firstTrack = collection.value.tracks[0];
    console.log('Playing first track:', firstTrack);
    useSong.playOrPauseThisSong(firstTrack.artist, firstTrack);
  }
};

const fetchUser = () => {
  const userData = localStorage.getItem('user_data');
  if (userData) {
    user.value = JSON.parse(userData);
    console.log('User data:', user.value);
  } else {
    router.push('/login');
  }
};

const albumCoverUrl = computed(() => {
  if (!collection.value?.tracks?.length) return '';
  const cover = currentTrack.value?.albumCover || collection.value.tracks[0]?.albumCover;
  return `${fileServerBaseUrl}/public/images/${cover}`;
});

const fetchData = async () => {
  fetchUser();
  loading.value = true;
  error.value = null;
  collection.value = null;
  playlistData.value = null;

  try {
    const { id } = route.params;

    // Get playlist metadata
    playlistData.value = (await apiClient.get(`/api/playlist/playlist_details/${id}`)).data;

    // Get playlist tracks
    const response = await apiClient.get(`/api/playlist/get/${id}`);
    console.log('Fetched playlist data:', playlistData.value);
    console.log('Fetched collection:', response.data);

    const tracks = (response.data.tracks || []).map((track) => ({
      ...track,
      artist: track.artist || "Unknown Artist",
      albumCover: track.albumCover || "/default.jpg",
      path: track.id ? `${track.id}.mp3` : "",
      key: track.encryption_key || "",
    }));

    collection.value = {
      name: response.data.name,
      artist: response.data.artist,
      tracks
    };
  } catch (err) {
    console.error('Error fetching playlist:', err);

    // If API returns no songs, still show empty playlist instead of error
    if (err.response?.status === 404) {
      collection.value = { name: "", artist: "", tracks: [] };
    } else {
      error.value = 'Failed to load playlist.';
    }
  } finally {
    loading.value = false;
  }
};

onMounted(fetchData);

watch(
  () => route.params.id,
  () => {
    if (route.params.id) (fetchData())
  }
);
const copyLink = () => {
  // Get the current URL from the browser
  const link = window.location.href;

  // Copy the link to the clipboard
  navigator.clipboard.writeText(link)
    .then(() => {
      alert('✅ Playlist link copied to clipboard!');
    })
    .catch((err) => {
      console.error('Failed to copy link:', err);
    });
};

// Function to format duration
const formatDuration = (durationString) => {
  if (!durationString) return '';
  const [minutes, seconds] = durationString.split(';');
  return `${minutes}:${seconds.padStart(2, '0')}`;
};
</script>

<template>
  <div class="p-4 md:p-8 overflow-x-hidden">
    <!-- Loading State -->
    <div v-if="loading" class="text-white text-center py-8">Loading...</div>

    <!-- Error State -->
    <div v-else-if="error" class="text-red-500 text-center py-8">{{ error }}</div>

    <!-- Playlist Content -->
    <div v-else-if="collection">
      <div class="flex flex-col md:flex-row gap-6">
        <!-- Playlist Header Section -->
        <div class="w-full md:w-1/3 flex flex-col items-center text-center md:pr-6">
          <!-- Album Cover -->
          <div v-if="collection.tracks.length > 0" class="w-48 h-48 md:w-64 md:h-64 mb-4">
            <img
              :src="albumCoverUrl"
              alt="Playlist Cover"
              class="w-full h-full object-cover rounded-xl shadow-lg"
            />
          </div>

          <!-- Playlist Info -->
      <div class="space-y-2 max-w-xs">
        <h1 class="text-2xl md:text-2xl font-bold text-white line-clamp-2">
          {{ playlistData?.name || 'Playlist' }}
        </h1>
        
        <p class="text-sm text-gray-300 font-semibold">
          {{ playlistData?.creator || 'Unknown Creator' }}
        </p>

        <!-- Desktop Description -->
        <p class="hidden md:block text-xs text-gray-400 mt-3">
          Your personal collection of loved tracks, curated just for you.
        </p>

        <!-- Track Count -->
        <div class="flex items-center justify-center gap-2 text-xs text-gray-400">
          <span class="capitalize">{{ route.params.type || 'playlist' }}</span>
          <span class="w-1 h-1 bg-gray-400 rounded-full"></span>
          <span>{{ collection.tracks.length }} {{ collection.tracks.length === 1 ? 'song' : 'songs' }}</span>
        </div>

        <!-- Centered Button -->
        <div class="flex justify-center mt-4">

          <button v-if="user.id == playlistData?.user_id"
            @click="copyLink"
            class="px-4 py-2 rounded-full bg-[#1DB954] text-white font-semibold 
                  flex items-center gap-2 hover:bg-[#1ed760] transition"
          >
            Share Playlist
            <Share fillColor="#FFFFFF" :size="18" />
          </button>

        </div>
      </div>

        </div>

        <!-- Tracklist Section -->
        <div class="w-full md:w-2/3">
          <!-- Empty State -->
          <div v-if="collection.tracks.length === 0" class="text-gray-400 text-center py-12">
            <p class="text-lg">No songs in this playlist yet</p>
            <p class="text-sm mt-2">Add some tracks to get started</p>
          </div>

          <!-- Song List -->
          <div v-else class="mt-6 md:mt-0">
            <!-- Track List Header -->
            <div class="flex items-center justify-between px-3 md:px-5 pt-2">
              <div class="flex items-center text-gray-400">
                <div class="mr-4 md:mr-7 text-xs md:text-sm">#</div>
                <div class="text-xs md:text-sm">Title</div>
              </div>
              <ClockTimeThreeOutline fillColor="#FFFFFF" :size="18" />
            </div>

            <div class="border-b border-b-[#2A2A2A] mt-2 mb-3 md:mb-4"></div>

            <!-- Track Rows -->
            <ul class="w-full space-y-1">
              <li v-for="(track, index) in collection.tracks" :key="track.id">
                <SongRow
                  :artist="collection"
                  :track="track"
                  :index="index + 1"
                  :duration="formatDuration(track.duration)"
                  :canDelete="true"
                  :playlistID="route.params.id"
                />
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Smooth transitions */
* {
  transition: padding 0.2s ease;
}

/* Ensure images maintain aspect ratio */
img {
  max-width: 100%;
  height: auto;
}
</style>