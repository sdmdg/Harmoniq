<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import SongRow from '../components/SongRow.vue';
import ClockTimeThreeOutline from 'vue-material-design-icons/ClockTimeThreeOutline.vue';
import apiClient from '../utils/axios';

const fileServerBaseUrl = import.meta.env.VITE_FILE_SERVER || 'http://localhost:3000';

import { useSongStore } from '../stores/song';
import { storeToRefs } from 'pinia';

const useSong = useSongStore();
const { isPlaying, currentTrack, currentArtist } = storeToRefs(useSong);

const route = useRoute();
const router = useRouter();

const collection = ref(null);
const loading = ref(true);
const error = ref(null);
const user = ref(null);

const playFunc = () => {
  if (currentTrack.value) {
    useSong.playOrPauseThisSong(currentArtist.value, currentTrack.value);
  } else if (collection.value?.tracks?.length > 0) {
    const firstTrack = collection.value.tracks[0];
    useSong.playOrPauseThisSong(collection.value, firstTrack);
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
  return '/images/icons/liked-songs.png';
});

const fetchData = async () => {
  if (!user.value) return;

  try {
    loading.value = true;
    error.value = null;

    // Fetch liked songs
    const response = await apiClient.get(`/api/playlist/liked-songs/${user.value.id}`);
    const tracks = response.data.tracks || [];

    console.log('Fetched liked songs:', tracks);

    // Map tracks with proper structure
    const formattedTracks = tracks.map(track => ({
      id: track.id,
      name: track.title,
      title: track.title,
      artist: track.artist || "Unknown Artist",
      albumCover: track.albumcover || "/default.jpg",
      albumcover: track.albumcover || "/default.jpg",
      duration: track.duration,
      album_id: track.album_id,
      encryption_key: track.encryption_key || "",
      key: track.encryption_key || "",
      path: track.id ? `${track.id}.mp3` : ""
    }));

    // Build collection
    collection.value = {
      name: "Liked Songs",
      albumCover: "/images/icons/liked-songs.png",
      image: "/images/icons/liked-songs.png",
      tracks: formattedTracks
    };

  } catch (err) {
    console.error('Error fetching liked songs:', err);
    error.value = 'Failed to load liked songs.';
    collection.value = {
      name: "Liked Songs",
      albumCover: "/images/icons/liked-songs.png",
      image: "/images/icons/liked-songs.png",
      tracks: []
    };
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  fetchUser();
  if (user.value) {
    await fetchData();
  }
});

// Function to format duration from "mm;ss" to "mm:ss"
const formatDuration = (durationString) => {
  if (!durationString) return '';
  const [minutes, seconds] = durationString.split(';');
  return `${minutes}:${seconds?.padStart(2, '0') || '00'}`;
};
</script>

<template>
  <div class="p-4 md:p-8 overflow-x-hidden">
    <!-- Loading State -->
    <div v-if="loading" class="text-white text-center py-8">Loading...</div>
    
    <!-- Error State -->
    <div v-else-if="error" class="text-red-500 text-center py-8">{{ error }}</div>
    
    <!-- Content -->
    <div v-else-if="collection">
      <div class="flex flex-col md:flex-row gap-6">
        <!-- Playlist Header Section -->
        <div class="w-full md:w-1/3 flex flex-col items-center text-center md:pr-6">
          <!-- Album Cover -->
          <div class="w-48 h-48 md:w-64 md:h-64 mb-4">
            <img
              :src="albumCoverUrl"
              alt="Liked Songs"
              class="w-full h-full object-cover rounded-xl shadow-lg"
            />
          </div>

          <!-- Playlist Info -->
          <div class="space-y-2 max-w-xs">
            <h1 class="text-2xl md:text-2xl font-bold text-white line-clamp-2">
              Liked Songs
            </h1>
            
            <p class="text-sm text-gray-300 font-semibold">
              {{ user?.username || 'Your Library' }}
            </p>

            <!-- Desktop Description -->
            <p class="hidden md:block text-xs text-gray-400 mt-3">
              Your personal collection of loved tracks, curated just for you.
            </p>

            <!-- Track Count -->
            <div class="flex items-center justify-center gap-2 text-xs text-gray-400">
              <span class="capitalize">playlist</span>
              <span class="w-1 h-1 bg-gray-400 rounded-full"></span>
              <span>{{ collection.tracks.length }} {{ collection.tracks.length === 1 ? 'song' : 'songs' }}</span>
            </div>
          </div>
        </div>

        <!-- Tracklist Section -->
        <div class="w-full md:w-2/3">
          <!-- Empty State -->
          <div v-if="collection.tracks.length === 0" class="text-gray-400 text-center py-12">
            <p class="text-lg">No liked songs yet</p>
            <p class="text-sm mt-2">Start liking songs to build your collection</p>
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