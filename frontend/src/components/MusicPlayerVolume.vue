<script setup>
import { ref, onMounted } from 'vue'

import VolumeMute from 'vue-material-design-icons/VolumeMute.vue';
import VolumeHigh from 'vue-material-design-icons/VolumeHigh.vue';

import { useSongStore } from '../stores/song'
import { storeToRefs } from 'pinia';
const useSong = useSongStore()
const { audio } = storeToRefs(useSong)

let isHover = ref(false)

// PLAYER REFS
let vol = ref(80)
let volume = ref(null)

onMounted(() => {
    if (!volume.value) return
    volume.value.addEventListener("input", (e) => {
        audio.value.volume = e.currentTarget.value / 100;
    });
})
</script>

<template>
  <div class="flex items-center">
    <VolumeMute v-if="vol == 0" fillColor="#FFFFFF" :size="20" />
    <VolumeHigh v-else fillColor="#FFFFFF" :size="20" />

    <div
      class="flex items-center ml-2 w-[100px] relative mt-2 mb-[23px]"
      @mouseenter="isHover = true"
      @mouseleave="isHover = false"
    >
      <!-- Range input -->
      <input
        v-model="vol"
        ref="volume"
        type="range"
        min="0"
        max="100"
        class="
          mt-[24px]
          absolute
          rounded-full
          my-2
          w-full
          h-0
          z-40
          appearance-none
          bg-opacity-100
          focus:outline-none
          accent-white
        "
        :class="{ 'rangeDotHidden': !isHover }"
      />

      <!-- Animated fill -->
      <div
        class="pointer-events-none mt-[6px] absolute h-[4px] z-10 inset-y-0 left-0 rounded-full"
        :style="`width: ${vol}%; transition: width 0.2s ease;`"
        :class="isHover ? 'bg-green-500' : 'bg-white'"
      />

      <!-- Background track -->
      <div
        class="absolute h-[4px] z-[-0] mt-[6px] inset-y-0 left-0 w-full bg-gray-500 rounded-full"
      />
    </div>
  </div>
</template>

<style>
/* Hide thumb smoothly */
.rangeDotHidden[type="range"]::-webkit-slider-thumb {
  opacity: 0;
  transition: opacity 0.2s ease;
}

/* Thumb style */
[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 12px;
  height: 12px;
  background: white;
  border-radius: 50%;
  cursor: pointer;
  transition: transform 0.2s ease, background 0.2s ease, opacity 0.2s ease;
}

/* Hover grow effect */
[type="range"]::-webkit-slider-thumb:hover {
  transform: scale(1.2);
  background: #1BD760;
}
</style>
