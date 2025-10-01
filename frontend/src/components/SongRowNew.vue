<script setup>
const emit = defineEmits(["play"]);

// Props
defineProps({
  track: { type: Object, required: true },
  index: { type: Number, required: true },
  duration: { type: String, default: '' },
  albumImage: { type: String, default: '/heart.jpeg' } // Use the passed album image
});

// Define file server base URL inside this component
const fileServerBaseUrl = import.meta.env.VITE_FILE_SERVER || 'http://localhost:3000';
</script>

<template>
  <div
    class="flex items-center justify-between px-5 py-2 hover:bg-[#2a2a2a] rounded-md cursor-pointer"
    @click="emit('play', track)"
  >
    <!-- Left side: index + cover + title -->
    <div class="flex items-center space-x-3">
      <span class="text-gray-400 w-6">{{ index }}</span>

      <img 
        class="w-[30px] h-[30px] rounded-sm brightness-[0.5]" 
        :src="`${fileServerBaseUrl}/public/images/${albumImage || track.albumcover || 'default_album.png'}`"
        alt="Album Cover"
      />

      <span class="text-white font-medium truncate">{{ track.title }}</span>
    </div>

    <!-- Right side: duration -->
    <div class="text-gray-400 text-sm">
      {{ duration }}
    </div>
  </div>
</template>

<style scoped>
div:hover {
  transition: background-color 0.2s ease-in-out;
}
</style>
