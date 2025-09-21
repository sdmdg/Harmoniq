<template>
  <div class="w-[200px] p-4 cursor-pointer group">
    <RouterLink :to="`/album/${album.id}`">
      <!-- Fixed square image -->
      <div class="w-[170px] h-[170px] relative overflow-hidden rounded-lg shadow-lg group-hover:scale-105 transition-transform duration-300">
        <img
          class="w-full h-full object-cover"
          :src="`${fileServerBaseUrl}/public/images/${album.cover}`"
          alt="Album Cover"
        />
      </div>
    </RouterLink>

    <!-- Fixed-height text -->
    <div class="mt-2 text-center h-[60px] flex flex-col justify-center">
      <p class="text-white font-semibold truncate">{{ album.title }}</p>
      <p class="text-gray-400 text-sm truncate">{{ album.artist }}</p>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue'

const fileServerBaseUrl = import.meta.env.VITE_FILE_SERVER || 'http://localhost:3000'

const props = defineProps({
  album: Object,
})
</script>
