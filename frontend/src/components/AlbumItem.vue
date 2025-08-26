<template>
  <div class="cursor-pointer group">
    <RouterLink :to="`/album/${album.id}`">
      <div class="relative w-full aspect-square rounded-lg overflow-hidden shadow-lg transition-transform duration-300 group-hover:scale-105">
        <img class="w-full h-full object-cover" :src="album.cover" alt="Album Cover" />
        <div class="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
          <Play fillColor="#FFFFFF" :size="40" />
        </div>
      </div>
    </RouterLink>
    <div class="mt-2 text-center">
      <p class="font-semibold text-white truncate">{{ album.title }}</p>
      <p class="text-sm text-gray-400 truncate">{{ album.artist }}</p>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue';
import Play from 'vue-material-design-icons/Play.vue';

const props = defineProps({
  album: Object,
});
</script>