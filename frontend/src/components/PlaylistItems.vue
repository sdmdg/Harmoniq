<template>
  <RouterLink
    :to="`/playlist/${playlist.id}`"
    class="block p-4 rounded-lg shadow-md transition-transform transform hover:scale-105 cursor-pointer"
    :style="{ backgroundColor: bgColor }"
  >
    <!-- Album Covers Grid -->
    <div class="relative rounded-lg overflow-hidden mb-3" style="aspect-ratio: 1 / 1;">
      <template v-if="albumCovers.length > 0">
        <div class="grid grid-cols-2 grid-rows-2 h-full">
          <img
            v-for="(cover, idx) in albumCovers.slice(0, 4)"
            :key="idx"
            :src="`${fileServerBaseUrl}/public/images/${cover.albumCover}`"
            class="w-full h-full object-cover"
            crossorigin="anonymous"
            @load="extractColor(idx, $event)"
          />
        </div>
      </template>
      <div v-else class="w-full h-full flex items-center justify-center bg-gray-600 text-gray-300">
        No Albums
      </div>
    </div>

    <h3 class="text-black font-semibold truncate">{{ playlist.title }}</h3>
  </RouterLink>
</template>

<script setup>
import { ref, onMounted } from "vue";
import apiClient from "../utils/axios";
import { RouterLink } from "vue-router";
import ColorThief from "colorthief";

const props = defineProps({
  playlist: { type: Object, required: true },
  index: { type: Number, required: true }, // receive playlist index from parent
});

const albumCovers = ref([]);
const bgColor = ref("#1e1e1e");
const fileServerBaseUrl =
  import.meta.env.VITE_FILE_SERVER || "http://localhost:3000";

const fetchPlaylistAlbums = async () => {
  try {
    const response = await apiClient.get(
      `/api/playlist/playlist_albums/${props.playlist.id}`
    );
    albumCovers.value = response.data;
  } catch (error) {
    console.error("Failed to fetch playlist albums:", error);
  }
};

// Extract color based on playlist index
const extractColor = (idx, event) => {
  if (idx !== 0) return; // Only take the first album of this playlist
  try {
    const colorThief = new ColorThief();
    const img = event.target;
    if (img.complete) {
      const color = colorThief.getColor(img);
      bgColor.value = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
    }
  } catch (err) {
    console.warn("Color extraction failed:", err);
  }
};

onMounted(() => {
  fetchPlaylistAlbums();
});
</script>
