<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import SongRow from '../components/SongRow.vue';
import ClockTimeThreeOutline from 'vue-material-design-icons/ClockTimeThreeOutline.vue';
import apiClient from '../utils/axios';
const fileServerBaseUrl = import.meta.env.VITE_FILE_SERVER || 'http://localhost:3000';

import { useSongStore } from '../stores/song';
import { storeToRefs } from 'pinia';

const useSong = useSongStore();
const { isPlaying, currentTrack, currentArtist } = storeToRefs(useSong);

const route = useRoute();
const collection = ref(null);
const loading = ref(true);
const error = ref(null);

const playFunc = () => {
  if (currentTrack.value) {
    useSong.playOrPauseThisSong(currentArtist.value, currentTrack.value);
  } else if (collection.value && collection.value.tracks.length > 0) {
    const firstTrack = collection.value.tracks[0];
    useSong.playOrPauseThisSong(firstTrack.artist, firstTrack); 
  }
};

const fetchData = async () => {
  try {
    loading.value = true;
    const { id } = route.params;
    const response = await apiClient.get(`/api/playlist/get/${id}`);
    collection.value = response.data;
  } catch (err) {
    console.error('Error fetching album:', err);
    error.value = 'Failed to load album.';
  } finally {
    loading.value = false;
  }
};

onMounted(fetchData);

// Format duration "minutes;seconds" → "mm:ss"
const formatDuration = (durationString) => {
  if (!durationString) return '';
  const [minutes, seconds] = durationString.split(';');
  return `${minutes}:${seconds.padStart(2, '0')}`;
};
</script>

<template>
  <div class="p-8 overflow-x-hidden">
    <div v-if="loading" class="text-white">Loading...</div>
    <div v-else-if="error" class="text-red-500">{{ error }}</div>
    <div v-else-if="collection">

      <!-- Centered Heading -->
      <h1 class="text-3xl font-bold text-white text-center mb-8">Liked Songs</h1>

      <!-- Two-column layout -->
      <div class="flex w-full">

        <!-- Left Column: Album Image + Description -->
        <div class="w-1/3 pr-6 text-center">
        <!-- Album Image -->
        <img
            src="/heart.jpeg"
            alt="Album Cover"
            class="w-2/3 mx-auto rounded-xl shadow-lg"
        />

        <!-- Description lines -->
        <p class="text-gray-300 text-sm mt-3 font-semibold">
            Your personal collection of loved tracks, curated just for you.
        </p>
        <p class="text-gray-300 text-sm mt-2">
            3 songs
        </p>
        <p class="text-gray-300 text-sm mt-1">
            10 min
        </p>
        </div>


        <!-- Right Column: Album Info + Tracklist -->
        <div class="w-2/3 ml-5">

          <!-- Album Info -->
          <div class="flex flex-col justify-end h-[140px]">
            
            <div class="text-gray-300 text-[13px] flex mt-1">
              <div class="flex capitalize">{{ route.params.type }}</div>
              <div class="ml-2 flex">
                <span class="-ml-0.5">{{ collection.tracks.length }} songs</span>
              </div>
            </div>
          </div>

          <!-- Track List Header -->
          <div class="mt-6"></div>
          <div class="flex items-center justify-between px-5 pt-2">
            <div class="flex items-center justify-between text-gray-400">
              <div class="mr-7">#</div>
              <div class="text-sm">Title</div>
            </div>
            <ClockTimeThreeOutline fillColor="#FFFFFF" :size="18" />
          </div>
          <div class="border-b border-b-[#2A2A2A] mt-2 mb-4"></div>

          <!-- Track Rows -->
          <ul class="w-full">
            <li v-for="(track, index) in collection.tracks" :key="track.id">
              <SongRow
                :artist="collection"
                :track="track"
                :index="index + 1"
                :duration="formatDuration(track.duration)"
                :albumImage="fileServerBaseUrl + collection.image"
              />
            </li>
          </ul>

        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.circle {
  width: 4px;
  height: 4px;
  background-color: rgb(189, 189, 189);
  border-radius: 100%;
}
</style>
