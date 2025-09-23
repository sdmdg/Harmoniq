<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import SongRowNew from '../components/SongRowNew.vue';
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
const album_id = ref(null);

const playFunc = () => {
  if (currentTrack.value) {
    useSong.playOrPauseThisSong(currentArtist.value, currentTrack.value);
  } else if (collection.value && collection.value.tracks.length > 0) {
    const firstTrack = collection.value.tracks[0];
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

onMounted(() => {
  fetchUser();
});

const fetchData = async () => {
  try {
    loading.value = true;
    const response = await apiClient.get(`/api/playlist/liked-songs/${user.value.id}`);
    const tracks = await Promise.all(
    (response.data || []).map(async (track) => {
      try {
        const artistRes = await apiClient.get(`/api/artist/search/${track.album_id}`);
        return {
          ...track,
          artist: artistRes.data[0]?.artist_name || "Unknown Artist",
          albumCover: artistRes.data[0]?.coverUrl || "/default.jpg",

          // 🔑 Ensure decryption works
          key: track.encryption_key,

          // 🎵 Construct a usable path (if backend doesn’t give it)
          // You can decide the convention for filenames on your server.
          path: `${track.id}.mp3`
        };
      } catch (err) {
        console.error("Error resolving artist for album:", track.album_id, err);
        return {
          ...track,
          artist: "Unknown Artist",
          albumCover: "/heart.jpeg",
          key: track.encryption_key,
          path: `${track.id}.mp3`
        };
      }
    })
  );


    collection.value = {
      name: "Liked Songs",
      image: "/heart.jpeg",
      tracks
    };
  } catch (err) {
    console.error('Error fetching liked songs:', err);
    error.value = 'Failed to load liked songs.';
  } finally {
    loading.value = false;
  }
};
onMounted(() => {
  fetchData();
});


// Format duration from { minutes, seconds } → "mm:ss"
const formatDuration = (durationObj) => {
  if (!durationObj) return '';
  const minutes = durationObj.minutes ?? 0;
  const seconds = durationObj.seconds ?? 0;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
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
          <img
            :src="collection.image"
            alt="Album Cover"
            class="w-2/3 mx-auto rounded-xl shadow-lg"
          />

          <p class="text-gray-300 text-sm mt-3 font-semibold">
            Your personal collection of loved tracks, curated just for you.
          </p>
          <p class="text-gray-300 text-sm mt-2">
            {{ collection.tracks.length }} songs
          </p>
        </div>

        <!-- Right Column: Tracklist -->
        <div class="w-2/3 ml-5">
          <div class="flex flex-col justify-end h-[140px]">
            <div class="text-gray-300 text-[13px] flex mt-1">
              <div class="capitalize">{{ route.params.type }}</div>
              <div class="ml-2">
                <span>{{ collection.tracks.length }} songs</span>
              </div>
            </div>
          </div>

          <!-- Track List Header -->
          <div class="mt-6"></div>
          <div class="flex items-center justify-between px-5 pt-2">
            <div class="flex items-center text-gray-400">
              <div class="mr-7">#</div>
              <div class="text-sm">Title</div>
            </div>
            <ClockTimeThreeOutline fillColor="#FFFFFF" :size="18" />
          </div>
          <div class="border-b border-b-[#2A2A2A] mt-2 mb-4"></div>

          <!-- Track Rows -->
          <ul class="w-full">
            <li v-for="(track, index) in collection.tracks" :key="track.id">
              <SongRowNew
                :track="track"
                :index="index + 1"
                :duration="formatDuration(track.duration)"
                albumImage="/heart.jpeg"
                @play="useSong.playOrPauseThisSong(collection, track)"
              />

            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>
