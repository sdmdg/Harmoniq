<template>
  <div class="relative w-full h-full bg-[#000000] overflow-auto">
    <!-- Artist Header -->
    <div
      v-if="artist"
      class="relative flex flex-col md:flex-row items-end h-[350px] md:h-[400px] text-white p-6"
      :style="{
        backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,1)), url(http://localhost:3000/public/images/${artist.image})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }"
    >
      <div class="relative z-10 flex flex-col justify-end w-full h-full">
        <p class="text-xs font-bold mb-1">Artist</p>
        <h1 class="text-3xl md:text-6xl font-bold font-sans">{{ artist.name }}</h1>
        <div class="flex items-center text-sm font-light mt-2">
          <p>{{ formatNumber(artist.monthlyAudience) }} monthly listeners</p>
        </div>
        <p class="text-sm font-light text-gray-300 mt-2 max-w-2xl">{{ artist.description }}</p>
      </div>
    </div>

    <!-- Main Content -->
    <div v-if="artist" class="p-6">
      <!-- Action Buttons -->
      <div class="flex items-center mb-6">
        <button
          class="bg-[#1ED760] text-black font-bold py-3 px-6 rounded-full hover:scale-105 transition-transform duration-200 flex items-center whitespace-nowrap"
        >
          <Play fillColor="#000000" :size="20" />
          <span class="ml-2">Shuffle</span>
        </button>
        <button
          class="ml-4 bg-transparent border border-gray-500 text-white font-bold py-3 px-6 rounded-full hover:bg-gray-800 transition-colors duration-200"
        >
          <span class="ml-2">Follow</span>
        </button>
      </div>

      <!-- Top Songs -->
      <div>
        <h2 class="text-2xl font-bold mb-4 text-white">Top songs</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-4">
          <div
            v-for="(song, index) in artist.topSongs"
            :key="index"
            class="flex items-center space-x-4 p-2 rounded-lg hover:bg-gray-800 transition-colors duration-200 cursor-pointer"
          >
            <img :src="song.cover" alt="Song Cover" class="w-12 h-12 rounded-lg object-cover">
            <div>
              <p class="text-white font-semibold truncate">{{ song.title }}</p>
              <p class="text-gray-400 text-sm">{{ song.artist }}</p>
            </div>
            <div class="ml-auto text-gray-400 text-sm">
              {{ formatNumber(song.plays) }} plays
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-else class="text-white p-6">Loading artist data...</div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import Play from 'vue-material-design-icons/Play.vue';
import apiClient from '../utils/axios';

const artist = ref(null);
const route = useRoute();

const fetchArtistData = async () => {
  const artistId = route.params.id;
  try {
    const response = await apiClient.get(`/api/artist/get/${artistId}`);
    artist.value = response.data;
  } catch (error) {
    console.error('Failed to fetch artist data:', error);
    artist.value = null;
  }
};

const formatNumber = (num) => {
  if (!num) return 0;
  return num.toLocaleString();
};

onMounted(() => {
  fetchArtistData();
});

// Watch for route changes and refetch
watch(
  () => route.fullPath,  // or route.params.id if only ID matters
  () => {
    fetchArtistData();
  }
);
</script>
