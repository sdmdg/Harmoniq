<script setup>
const emit = defineEmits(["play"])

defineProps({
  track: { type: Object, required: true },
  index: { type: Number, required: true },
  duration: { type: String, default: '' },
  albumImage: { type: String, default: '/heart.jpeg' }
});
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
        :src="albumImage"
        alt="cover"
        class="w-10 h-10 rounded object-cover"
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
