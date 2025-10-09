<script setup>
import { ref, watch, nextTick } from "vue";
import { useSongStore } from "../stores/song";
import { storeToRefs } from "pinia";

const useSong = useSongStore();
const { currentTrack, currentArtist } = storeToRefs(useSong);

const fileServerBaseUrl =
  import.meta.env.VITE_FILE_SERVER || "http://localhost:3000";

const albumCoverUrl = ref(null);
const accentColor = ref("rgba(255, 255, 255, 0.2)");
const isVisible = ref(false);

/** Extract dominant color from an image */
const extractDominantColor = async (url) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = url;

    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0, img.width, img.height);

      const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      const colorCount = {};
      let r, g, b;

      for (let i = 0; i < data.length; i += 4) {
        r = Math.round(data[i] / 32) * 32;
        g = Math.round(data[i + 1] / 32) * 32;
        b = Math.round(data[i + 2] / 32) * 32;
        const key = `${r},${g},${b}`;
        colorCount[key] = (colorCount[key] || 0) + 1;
      }

      const dominant = Object.entries(colorCount).sort(
        (a, b) => b[1] - a[1]
      )[0][0];
      resolve(`rgb(${dominant})`);
    };

    img.onerror = () => resolve("rgba(255, 255, 255, 0.2)");
  });
};

watch(
  [() => currentTrack.value, () => currentArtist.value],
  async ([track, artist]) => {
    // Fade out smoothly before updating
    isVisible.value = false;
    await new Promise((r) => setTimeout(r, 300));

    // Determine which cover to use
    const coverName =
      track?.albumcover || artist?.albumCover || artist?.cover ||  track?.albumCover ||
              artist?.albumCover ||
              track?.albumcover ||
              artist?.albumcover || null;

    if (coverName) {
      const url = `${fileServerBaseUrl}/public/images/${coverName}`;
      albumCoverUrl.value = url;

      // Extract accent color
      accentColor.value = await extractDominantColor(url);

      await nextTick();
      isVisible.value = true;
    } else {
      albumCoverUrl.value = null;
    }
  },
  { immediate: true }
);
</script>

<template>
  <transition name="fade-bg" mode="out-in">
    <div
      v-if="albumCoverUrl && isVisible"
      key="accent-bg"
      class="fixed inset-0 -z-10 overflow-hidden"
    >
      <!-- Layer 1: Blurred album -->
      <div
        class="absolute inset-0"
        :style="{
          backgroundImage: `url(${albumCoverUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(90px) brightness(0.25) saturate(1.3)',
          transform: 'scale(1.15)',
        }"
      ></div>

      <!-- Layer 2: Accent glow (dominant color spotlight, left-side) -->
      <div
        class="absolute inset-0 pointer-events-none"
        :style="{
          background: `radial-gradient(circle at 80% 60%, ${accentColor} 0%, transparent 70%), linear-gradient(to right, transparent 70%, #000 100%)`,
          mixBlendMode: 'screen',
          opacity: 0.4,
          filter: 'blur(120px)',
        }"
      ></div>

      <!-- Layer 3: Dark gradient overlay -->
      <div
        class="absolute inset-0 bg-gradient-to-b from-black/50 via-black/70 to-black/90"
      ></div>
    </div>
  </transition>
</template>

<style scoped>
.fade-bg-enter-active,
.fade-bg-leave-active {
  transition: opacity 0.8s ease;
}
.fade-bg-enter-from,
.fade-bg-leave-to {
  opacity: 0;
}
.fade-bg-enter-to,
.fade-bg-leave-from {
  opacity: 1;
}
</style>
