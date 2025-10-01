<template>
  <div class="p-8">
    <!-- User Playlists -->
    <div class="mb-8">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-white text-2xl font-semibold">Your Playlists</h2>
        <RouterLink
          to="/playlists"
          class="text-gray-400 hover:text-white text-sm font-semibold transition-colors"
        >
          See All
        </RouterLink>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
        <div v-for="playlist in userPlaylists" :key="playlist.id">
          <PlaylistItem :playlist="playlist" />
        </div>
      </div>
    </div>

    <!-- Liked Songs -->
    <div class="mb-8">
      <h2 class="text-white text-2xl font-semibold mb-4">Liked Songs</h2>
      <div
        class="p-6 bg-gradient-to-br from-blue-700 to-indigo-900 rounded-lg shadow-xl relative overflow-hidden"
      >
        <div
          class="absolute inset-0 opacity-20"
          style="background-image: url('https://picsum.photos/id/1040/1000/1000'); background-size: cover; background-position: center;"
        ></div>
        <div class="relative z-10">
          <h3 class="text-white text-2xl font-bold mb-2">Liked Songs</h3>
          <p class="text-white text-sm">
            {{ likedSongsCount }} liked songs
          </p>
          <div class="mt-4">
            <RouterLink
              to="/liked-songs"
              class="inline-block bg-white text-black font-bold py-2 px-6 rounded-full hover:scale-105 transition-transform duration-200"
            >
              Play
            </RouterLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { RouterLink } from "vue-router";
import PlaylistItem from "../components/PlaylistItems.vue";
import apiClient from "../utils/axios";

const userPlaylists = ref([]);
const likedSongsCount = ref(0);

const fetchUserPlaylists = async () => {
  try {
    const response = await apiClient.get("api/playlist/get/all");
    userPlaylists.value = response.data;
    console.log("Fetched user playlists:", userPlaylists.value);
  } catch (error) {
    console.error("Failed to fetch user playlists:", error);
  }
};

onMounted(() => {
  fetchUserPlaylists();
  likedSongsCount.value = 54; // Example static value
});
</script>
