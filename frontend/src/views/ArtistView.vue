<template>
<div
  class="min-h-screen"
  :style="{
    background: 'linear-gradient(to bottom, rgba(0,0,0,1) 35%, rgba(0,0,0,0) 100%)',
  }"
>
    <!-- Back Button -->
    <div class="absolute top-4 left-4 z-20">
      <button
        @click="goBack"
        class="flex items-center gap-2 text-gray-300 hover:text-white transition-colors duration-200 bg-black/50 backdrop-blur-sm rounded-full px-3 py-2 group"
      >
        <svg
          class="w-5 h-5 group-hover:transform group-hover:-translate-x-1 transition-transform duration-200"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15 19l-7-7 7-7"
          ></path>
        </svg>
        <span class="text-sm font-medium">Back</span>
      </button>
    </div>

    <!-- Artist Header -->
    <div
      v-if="artist"
      class="relative flex flex-col md:flex-row items-end h-[350px] md:h-[400px] text-white p-6"
      :style="{
        backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,1)), url(${fileServerBaseUrl}/public/images/${artist.image})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }"
    >
      <div class="relative z-10 flex flex-col justify-end w-full h-full">
        <p v-if="!isExpanded" class="text-xs font-bold mb-1">Artist</p>
        <h1 v-if="!isExpanded" class="text-3xl md:text-6xl font-bold font-sans">{{ artist.name }}</h1>
        <div v-if="!isExpanded" class="flex items-center text-sm font-light mt-2">
          <p>{{ formatNumber(artist.audience) }} listeners</p>
        </div>
        
        <!-- Expandable Description -->
        <div class="text-sm font-light text-gray-300 mt-2 max-w-2xl">
          <p :class="{ 'line-clamp-2': !isExpanded && shouldTruncate }">
            {{ artist.description }}
          </p>
          <button 
            v-if="shouldTruncate"
            @click="isExpanded = !isExpanded"
            class="text-white font-semibold hover:underline mt-1 focus:outline-none"
          >
            {{ isExpanded ? 'Show less' : 'See more' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div v-if="artist" class="p-6">
      <!-- Action Buttons -->
      <div class="flex items-center mb-6">
        <button
          class="bg-[#1ED760] text-black font-bold py-3 px-6 rounded-full hover:scale-105 transition-transform duration-200 flex items-center whitespace-nowrap"
          @click="handleShuffle"
        >
          <Play fillColor="#000000" :size="20" />
          <span class="ml-2">Shuffle</span>
        </button>

        <!-- Follow/Unfollow Button -->
        <button 
          v-if="userId && user && user.userid && userId !== user.userid"
          class="ml-4 px-6 py-3 rounded-full font-bold transition-colors duration-200"
          :class="following
            ? 'bg-gray-700 text-white hover:bg-gray-600'
            : 'bg-green-600 text-white hover:bg-green-700'"
          :disabled="isProcessing"
          @click="toggleFollow"
        >
          <span v-if="!following">Follow</span>
          <span v-else>Unfollow</span>
        </button>

      </div>

      <!-- Top Tracks -->
      <div v-if="topTracks.length" class="p-8">
        <h1 class="text-white text-2xl font-semibold">Top songs</h1>
        <div class="py-1.5"></div>

        <div class="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
          <div class="grid grid-rows-2 grid-flow-col auto-cols-max gap-4">
            <transition-group
              name="fade-slide"
              tag="div"
              class="contents"
              appear
            >
              <QuickPickCard
                v-for="song in topTracks"
                :key="song.id"
                :image="`${fileServerBaseUrl}/public/images/${song.albumcover}`"
                :title="song.name"
                :subTitle="song.artist"
                :track="song"
                class="transition-transform duration-300"
              />
            </transition-group>
          </div>
        </div>
      </div>


      <!-- Releases -->
      <div v-if="albums.length" class="p-8">
        <h1 class="text-white text-2xl font-semibold">Releases</h1>
        <div class="py-1.5"></div>

        <!-- Albums list -->
        <transition-group
          name="fade-slide"
          tag="div"
          class="flex items-center space-x-4 overflow-x-auto"
          appear
        >
          <AlbumItem
            v-for="album in albums"
            :key="album.id"
            :title="album.title"
            :subTitle="album.artist"
            :album="album"
          />
        </transition-group>
      </div>

    </div>

    <!-- Loading State -->
    <div v-else class="text-white p-6">Loading artist data...</div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Play from 'vue-material-design-icons/Play.vue';
import apiClient from '../utils/axios';
import QuickPickCard from '../components/SongCardRow.vue'

import AlbumItem from '../components/AlbumCard.vue'

import { useSongStore } from '../stores/song';
import { storeToRefs } from 'pinia';

const userId = ref(null);
const useSong = useSongStore();
const { isPlaying, currentTrack, currentArtist } = storeToRefs(useSong);

const artist = ref(null);
const user = ref({});
const following = ref(false);
const isProcessing = ref(false);
const topTracks = ref([]);
const albums = ref([]);
const isExpanded = ref(false);

const player = ref({
  tracks:[]
});

const route = useRoute();
const router = useRouter();
const fileServerBaseUrl = import.meta.env.VITE_FILE_SERVER || 'http://localhost:3000';

// Check if description should be truncated (more than ~150 characters)
const shouldTruncate = computed(() => {
  return artist.value?.description && artist.value.description.length > 150;
});

const fetchArtistData = async () => {
  const artistId = route.params.id;
  if (!artistId) {
    return
  }
  try {
    const response = await apiClient.get(`/api/artist/get/${artistId}`);
    artist.value = response.data;
    following.value = response.data.isFollowing;
    topTracks.value = response.data.topTracks;
    albums.value = response.data.albums;
    user.value = response.data.user;
    isExpanded.value = false;

    const userDataString = localStorage.getItem('user_data');
    if (userDataString) {
      try {
        const userData = JSON.parse(userDataString);
        userId.value = userData.id;
        console.log("Artist user ID:", user.value.userid);
        console.log("Current user ID:", userId.value);
      } catch (e) {
        console.error("Error parsing user data from localStorage:", e);
      }
    }

  } catch (error) {
    console.error('Failed to fetch artist data:', error);
    artist.value = null;
  }
};

const formatNumber = (num) => {
  if (!num) return 0;
  return num.toLocaleString();
};

const toggleFollow = async () => {
  if (isProcessing.value) return;

  isProcessing.value = true;
  try {
    if (!following.value) {
      await apiClient.post('/api/artist/follow', { artistId: artist.value.id });
      following.value = true;
    } else {
      await apiClient.post('/api/artist/unfollow', { artistId: artist.value.id });
      following.value = false;
    }
  } catch (error) {
    console.error('Failed to update follow state', error);
  } finally {
    isProcessing.value = false;
  }
};

// Shuffle utility
const shuffleArray = (arr) => {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

// Handle shuffle play
const handleShuffle = () => {
  if (!topTracks.value || topTracks.value.length === 0) return;

  const shuffled = shuffleArray(topTracks.value);

  player.value.tracks = shuffled;

  // Play the first track from shuffled list
  const firstTrack = shuffled[0];
  useSong.loadSong(player.value, firstTrack);
};

// Function to go back to previous page
const goBack = () => {
  // Check if there's history to go back to
  if (window.history.length > 1) {
    router.back();
  } else {
    // If no history, go to a default page (like dashboard or home)
    router.push('/dashboard');
  }
};

onMounted(() => {
  fetchArtistData();
});

watch(
  () => route.fullPath,
  () => {
    fetchArtistData();
  }
);

</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.my-upload-view {
}
/* Works in Chrome, Edge, and Safari */
::-webkit-scrollbar {
  width: 10px;
}

::-webkit-scrollbar-track {
  background: #000; /* scrollbar track */
}

::-webkit-scrollbar-thumb {
  background: #333; /* scrollbar thumb */
  border-radius: 8px;
}

::-webkit-scrollbar-thumb:hover {
  background: #555;
}

/* Optional: Firefox scrollbar */
* {
  scrollbar-width: thin;
  scrollbar-color: #333 #000; /* thumb color, track color */
}
</style>