<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import SongRow from '../components/SongRow.vue';
import Play from 'vue-material-design-icons/Play.vue';
import Pause from 'vue-material-design-icons/Pause.vue';
import DotsHorizontal from 'vue-material-design-icons/DotsHorizontal.vue';
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
  // If a track is already loaded, toggle play/pause for that track.
  if (currentTrack.value) {
    useSong.playOrPauseThisSong(currentArtist.value, currentTrack.value);
  } else {
    // If no track is loaded, find the first track and play it.
    if (collection.value && collection.value.tracks && collection.value.tracks.length > 0) {
      const firstTrack = collection.value.tracks[0];
      const artist = firstTrack.artist; // Get artist from the first track
      useSong.playOrPauseThisSong(artist, firstTrack); 
    }
  }
};

const fetchData = async () => {
    try {
        loading.value = true;
        const { type, id } = route.params; 
        const response = await apiClient.get(`/api/playlist/get/${id}`);
        collection.value = response.data;
    } catch (err) {
        console.error(`Error fetching album:`, err);
        error.value = `Failed to load album.`;
    } finally {
        loading.value = false;
    }
};

onMounted(fetchData);

// Function to format duration
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
      <div class="py-1.5"></div>
      <div class="flex items-center w-full relative h-full">

        <div class="w-full ml-5 flex flex-col justify-end h-[140px]">
          <div
            style="font-size: 15px;"
            class="text-white w-full cursor-pointer font-semibold"
          >
            {{ collection.artist }}
          </div>

          <div
            style="font-size: 33px;"
            class="text-white w-full cursor-pointer font-bold"
          >
            {{ collection.name }}
          </div>
          
          <div class="text-gray-300 text-[13px] flex mt-1">
              <div class="flex capitalize">{{ route.params.type }}</div>
              <div class="ml-2 flex">
                  <span class="-ml-0.5">{{ collection.tracks.length }} songs</span>
              </div>
          </div>
        </div>
      </div>

            <div class="mt-6"></div>
            <div class="flex items-center justify-between px-5 pt-2">
                <div class="flex items-center justify-between text-gray-400">
                    <div class="mr-7">#</div>
                    <div class="text-sm">Title</div>
                </div>
                <div><ClockTimeThreeOutline fillColor="#FFFFFF" :size="18"/></div>
            </div>
            <div class="border-b border-b-[#2A2A2A] mt-2"></div>
            <div class="mb-4"></div>
            <ul class="w-full" v-for="(track, index) in collection.tracks" :key="track.id">
                <SongRow 
                    :artist="collection" 
                    :track="track" 
                    :index="index + 1"
                    :duration="formatDuration(track.duration)"
                />
            </ul>
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