<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import SongRow from '../components/SongRow.vue';
import ClockTimeThreeOutline from 'vue-material-design-icons/ClockTimeThreeOutline.vue';
import apiClient from '../utils/axios';

import { useSongStore } from '../stores/song';
import { storeToRefs } from 'pinia';

const useSong = useSongStore();
const { isPlaying, currentTrack, currentArtist } = storeToRefs(useSong);

const route = useRoute();
const collection = ref(null);
const loading = ref(true);
const error = ref(null);
const playlistData = ref(null);
const fileServerBaseUrl = import.meta.env.VITE_FILE_SERVER || 'http://localhost:3000';

const playFunc = () => {
  if (currentTrack.value) {
    useSong.playOrPauseThisSong(currentArtist.value, currentTrack.value);
  } else if (collection.value && collection.value.tracks && collection.value.tracks.length > 0) {
    const firstTrack = collection.value.tracks[0];
    console.log('Playing first track:', firstTrack);
    useSong.playOrPauseThisSong(firstTrack.artist, firstTrack);
  }
};

const fetchData = async () => {
  loading.value = true;
  error.value = null;
  collection.value = null;
  playlistData.value = null;

  try {
    const { id } = route.params;
    const response = await apiClient.get(`/api/playlist/get/${id}`);
    playlistData.value = (await apiClient.get(`/api/playlist/playlist_details/${id}`)).data;
    console.log('Fetched playlist data:', playlistData.value.data);
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
    error.value = 'Failed to load playlist.';
  } finally {
    loading.value = false;
  }
};


// Fetch initially
onMounted(fetchData);

// Watch route param changes and fetch new playlist
watch(
  () => route.params.id,
  () => {
    fetchData();
  }
);

const formatDuration = (durationString) => {
  if (!durationString) return "00:00";
  const [minutes, seconds] = durationString.split(":");
  return `${minutes.padStart(2, "0")}:${seconds.padStart(2, "0")}`;
};
</script>

<template>
  <div class="p-8 overflow-x-hidden">
    <div v-if="loading" class="text-white">Loading...</div>
    <div v-else-if="error" class="text-red-500">{{ error }}</div>
    <div v-else-if="collection">
      <!-- Playlist Header -->
      <div class="py-1.5"></div>
      <div class="flex items-center w-full relative h-full">
        <div class="w-full ml-5 flex flex-col justify-end h-[140px]">
          <div class="text-white w-full cursor-pointer font-semibold" style="font-size: 15px;">
            {{ playlistData?.creator }}
          </div>
          <div class="text-white w-full cursor-pointer font-bold" style="font-size: 33px;">
            {{ playlistData?.name }}
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

      <!-- No songs message -->
      <div v-if="collection.tracks.length === 0" class="text-gray-400 text-center mt-6">
        No songs inside the playlist
      </div>

      <!-- Song list -->
      <div v-else>
        <div class="flex items-center justify-between px-5 pt-2">
          <div class="flex items-center justify-between text-gray-400">
            <div class="mr-7">#</div>
            <div class="text-sm">Title</div>
          </div>
          <div>
            <ClockTimeThreeOutline fillColor="#FFFFFF" :size="18"/>
          </div>
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
