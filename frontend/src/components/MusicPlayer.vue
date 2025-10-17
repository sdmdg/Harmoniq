<script setup>
import { ref, watch, onMounted, onUnmounted, nextTick } from "vue";
import MusicPlayerVolume from "../components/MusicPlayerVolume.vue";
import Heart from "vue-material-design-icons/Heart.vue";
import Play from "vue-material-design-icons/Play.vue";
import Pause from "vue-material-design-icons/Pause.vue";
import SkipBackward from "vue-material-design-icons/SkipBackward.vue";
import SkipForward from "vue-material-design-icons/SkipForward.vue";
import Close from "vue-material-design-icons/Close.vue";
import ChevronUp from "vue-material-design-icons/ChevronUp.vue";
import ChevronDown from "vue-material-design-icons/ChevronDown.vue";
import PlaylistItem from "../components/SongRow.vue";

import { useSongStore } from "../stores/song";
import { storeToRefs } from "pinia";

const isMobile = ref(window.innerWidth <= 768);

const updateIsMobile = () => {
  isMobile.value = window.innerWidth <= 768;
};

onMounted(() => {
  window.addEventListener("resize", updateIsMobile);
});

onUnmounted(() => {
  window.removeEventListener("resize", updateIsMobile);
});

const useSong = useSongStore();
const { isPlaying, audio, currentTrack, currentArtist, isBuffering } = storeToRefs(useSong);

const fileServerBaseUrl =
  import.meta.env.VITE_FILE_SERVER || "http://localhost:3000";

const isHover = ref(false);
const isExpanded = ref(false);
const range = ref(0);
const currentTimeText = ref("0:00");
const totalTimeText = ref("0:00");
const seeker = ref(null);
const seekerContainer = ref(null);
let timeUpdateInterval = null;

const formatTime = (sec) => {
  if (!sec) return "0:00";

  if (typeof sec === "string" && sec.includes(";")) {
    const [minutes, seconds] = sec.split(";");
    return `${minutes}:${seconds.padStart(2, "0")}`;
  }

  const s = Number(sec);
  if (isNaN(s)) return "0:00";

  const m = Math.floor(s / 60);
  const rem = Math.floor(s % 60);
  return `${m}:${rem.toString().padStart(2, "0")}`;
};

const onSeekChange = () => {
  if (!audio.value) return;
  useSong.seekToPercent(range.value);
};

const onSeekStart = () => {
  if (!audio.value) return;
  audio.value.pause();
};

const onSeekEnd = () => {
  if (!audio.value) return;
  audio.value.play().catch(() => {});
};

const startTimeUpdates = () => {
  if (timeUpdateInterval) clearInterval(timeUpdateInterval);
  timeUpdateInterval = setInterval(() => {
    if (!audio.value || isNaN(audio.value.duration)) return;
    currentTimeText.value = formatTime(audio.value.currentTime);
    totalTimeText.value = formatTime(audio.value.duration);
    range.value = (audio.value.currentTime / audio.value.duration) * 100;
  }, 250);
};

onMounted(() => {
  document.addEventListener("keydown", handleKeyPress);

  watch(
    audio,
    async () => {
      await nextTick();
      if (!audio.value) return;
      startTimeUpdates();
    },
    { immediate: true }
  );
});

onUnmounted(() => {
  document.removeEventListener("keydown", handleKeyPress);
});

watch(currentTrack, () => {
  range.value = 0;
  currentTimeText.value = "0:00";
  totalTimeText.value = "0:00";
});

const closePlayer = () => {
  useSong.resetState();
};

const handleKeyPress = (event) => {
  if (event.key === "Escape" && currentTrack.value) {
    closePlayer();
  }
};

const toggleExpanded = () => {
  isExpanded.value = !isExpanded.value;
};
</script>

<template>
  <div
    v-if="currentTrack"
    id="MusicPlayer"
    class="fixed bottom-0 left-0 w-full z-[60] bg-[#181818] border-t border-t-[#272727] transition-all duration-500 ease-in-out"
    :class="isExpanded ? 'expanded' : ''"
    :style="{
      backgroundColor: 'rgba(24, 24, 24, 0.95)',
      backdropFilter: 'blur(10px)',
      height: isExpanded ? (isMobile ? '100dvh' : '500px') : '80px'
    }"
  >



    <div
      v-if="!isExpanded"
      class="absolute top-0 left-0 w-full h-[4px]"
      @mouseenter="isHover = true"
      @mouseleave="isHover = false"
      @touchstart="isHover = true"
      @touchend="isHover = false"
    >
      <input
        type="range"
        v-model="range"
        min="0"
        max="100"
        @input="onSeekChange"
        @mousedown="onSeekStart"
        @mouseup="onSeekEnd"
        @touchstart="onSeekStart"
        @touchend="onSeekEnd"
        class="absolute top-0 z-20 w-full h-full appearance-none bg-transparent cursor-pointer"
        :class="{ rangeDotHidden: !isHover }"
      />
      <div
        class="pointer-events-none absolute top-0 left-0 h-full w-full bg-gray-500"
      />
      <div
        class="pointer-events-none absolute top-0 left-0 h-full"
        :style="`width: ${range}%; transition: width 0.25s linear;`"
        :class="isHover ? 'bg-green-500' : 'bg-white'"
      />
    </div>


    <!-- Minimized View -->
    <div
      v-if="!isExpanded"
      class="flex h-full w-full items-center justify-between px-3 md:px-4"
    >
    
      <!-- Left: Album Art + Track Info -->
      <div class="flex items-center flex-1 min-w-0" @click="toggleExpanded">
        <div class="relative flex-shrink-0">
          <img
            :src="`${fileServerBaseUrl}/public/images/${
              currentTrack.albumCover ||
              currentArtist.albumCover ||
              currentTrack.albumcover ||
              currentArtist.albumcover ||
              'default_album.png'
            }`"
            class="rounded-md shadow-2xl w-12 h-12 md:w-14 md:h-14 cursor-pointer"
            :onerror="`this.onerror=null;this.src='/heart.jpeg'`"
          />
          <div
            v-if="isBuffering"
            class="absolute top-0 left-0 w-12 h-12 md:w-14 md:h-14 flex items-center justify-center bg-black bg-opacity-50 rounded-md"
          >
            <svg
              class="animate-spin h-5 w-5 md:h-6 md:w-6 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              ></circle>
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
              ></path>
            </svg>
          </div>
        </div>
        <div class="ml-3 flex-1 min-w-0">
          <div class="text-white font-semibold text-sm truncate">
            {{ currentTrack.name }}
          </div>
          <div class="text-gray-400 font-medium text-xs truncate">
            {{ currentTrack.artist || currentArtist.artist }}
          </div>
        </div>
      </div>
      
  <!-- Right: Volume + Controls -->
  <div class="flex items-center gap-2 md:gap-8 ml-auto">
    <div class="hidden md:flex items-center justify-end">
      <MusicPlayerVolume />
    </div>

    <div class="text-white text-xs gap-2 md:gap-4">
      {{ currentTimeText }} / {{ totalTimeText }}
    </div>

    <div class="flex items-center gap-2 md:gap-4">
      <button class="hidden md:block" @click="useSong.prevSong()">
        <SkipBackward fillColor="#FFFFFF" :size="20" />
      </button>
      <button
        class="p-2 rounded-full bg-white"
        @click="useSong.playOrPauseThisSong(currentArtist, currentTrack)"
      >
        <Play v-if="!isPlaying" fillColor="#181818" :size="24" />
        <Pause v-else fillColor="#181818" :size="24" />
      </button>
      <button class="hidden md:block" @click="useSong.nextSong()">
        <SkipForward fillColor="#FFFFFF" :size="20" />
      </button>
      <button @click="toggleExpanded" class="md:hidden">
        <ChevronUp fillColor="#FFFFFF" :size="24" />
      </button>
    </div>
  </div>


    </div>

    <!-- Expanded View -->
    <div
      v-else
      class="flex flex-col h-full w-full px-4 md:px-6 py-4 md:py-6 overflow-hidden"
    >
      <!-- Close/Collapse Button -->
      <div class="flex justify-between items-center mb-4">
        <button
          @click="toggleExpanded"
          class="p-2 rounded-full hover:bg-gray-700 text-gray-400 hover:text-white transition-colors duration-200"
        >
          <ChevronDown :size="24" />
        </button>
        <button
          @click="closePlayer"
          class="p-2 rounded-full hover:bg-gray-700 text-gray-400 hover:text-white transition-colors duration-200"
          title="Close Player"
        >
          <Close :size="24" />
        </button>
      </div>

      <!-- Main Content -->
      <div class="flex flex-col md:flex-row h-full overflow-hidden">
        <!-- Left: Album Art + Info -->
        <div class="flex flex-col items-center md:w-1/3 mb-4 md:mb-0">
          <img
            :src="`${fileServerBaseUrl}/public/images/${
              currentTrack.albumCover ||
              currentArtist.albumCover ||
              currentTrack.albumcover ||
              currentArtist.albumcover ||
              'default_album.png'
            }`"
            class="rounded-md shadow-2xl w-64 h-64 md:w-56 md:h-56 mb-4 md:mb-6"
            :onerror="`this.onerror=null;this.src='/heart.jpeg'`"
          />
          <div
            v-if="isBuffering"
            class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 rounded-md"
          >
          <svg
            class="animate-spin h-5 w-5 md:h-6 md:w-6 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            ></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            ></path>
          </svg>

          </div>
          <div class="text-center mb-4">
            <div class="text-white font-semibold text-xl md:text-2xl mb-1">
              {{ currentTrack.name }}
            </div>
            <div class="text-gray-400 font-medium text-base md:text-lg">
              {{ currentTrack.artist || currentArtist.artist }}
            </div>
          </div>
          <div class="w-full md:w-auto">
            <MusicPlayerVolume />
          </div>
        </div>

        <!-- Right: Playlist + Controls -->
        <div class="flex-1 flex flex-col justify-between md:px-4 overflow-hidden">
          <!-- Up Next Playlist -->
          <div class="flex-1 overflow-y-auto mb-4">
            <div class="text-white text-base md:text-lg font-semibold mb-3">Up Next</div>
            <div class="bg-[#101010] bg-opacity-0 rounded-sm overflow-hidden">
              <div v-if="!currentArtist.tracks" class="text-white text-sm p-4">
                Nothing to show here
              </div>
              <ul v-else>
                <PlaylistItem
                  v-for="(track, idx) in currentArtist.tracks"
                  :key="track.id"
                  :track="track"
                  :artist="currentArtist"
                  :index="idx + 1"
                  :duration="formatTime(track.duration)"
                  :resetPlayerRadio="false"
                />
              </ul>
            </div>
          </div>

          <!-- Controls Section -->
          <div class="flex flex-col items-center pb-4 md:pb-6">
            <!-- Seeker -->
            <div class="flex items-center w-full mb-4">
              <div class="text-white text-xs pr-2">
                {{ currentTimeText }}
              </div>
              <div
                ref="seekerContainer"
                class="flex-1 relative"
                @mouseenter="isHover = true"
                @mouseleave="isHover = false"
                @touchstart="isHover = true"
                @touchend="isHover = false"
              >
                <input
                  ref="seeker"
                  type="range"
                  v-model="range"
                  min="0"
                  max="100"
                  @input="onSeekChange"
                  @mousedown="onSeekStart"
                  @mouseup="onSeekEnd"
                  @touchstart="onSeekStart"
                  @touchend="onSeekEnd"
                  class="absolute rounded-full w-full h-0 z-40 appearance-none bg-opacity-100 focus:outline-none accent-white"
                  :class="{ rangeDotHidden: !isHover }"
                />
                <div
                  class="pointer-events-none mt-[6px] absolute h-[4px] z-10 inset-y-0 left-0 rounded-full"
                  :style="`width: ${range}%; transition: width 0.25s linear;`"
                  :class="isHover ? 'bg-green-500' : 'bg-white'"
                />
                <div
                  class="absolute h-[4px] z-[-0] mt-[6px] inset-y-0 left-0 w-full bg-gray-500 rounded-full"
                />
              </div>
              <div class="text-white text-xs pl-2">
                {{ totalTimeText }}
              </div>
            </div>

            <!-- Playback Buttons -->
            <div class="flex items-center justify-center gap-4 md:gap-6">
              <button @click="useSong.prevSong()">
                <SkipBackward fillColor="#FFFFFF" :size="28" />
              </button>
              <button
                class="p-3 rounded-full bg-white"
                @click="useSong.playOrPauseThisSong(currentArtist, currentTrack)"
              >
                <Play v-if="!isPlaying" fillColor="#181818" :size="32" />
                <Pause v-else fillColor="#181818" :size="32" />
              </button>
              <button @click="useSong.nextSong()">
                <SkipForward fillColor="#FFFFFF" :size="28" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.rangeDotHidden[type="range"]::-webkit-slider-thumb {
  opacity: 0;
  transition: opacity 0.2s ease;
}

[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 12px;
  height: 12px;
  background: white;
  border-radius: 50%;
  cursor: pointer;
  transition: transform 0.2s ease, opacity 0.2s ease;
}

[type="range"]::-webkit-slider-thumb:hover {
  transform: scale(1.2);
  background: #1bd760;
}

[type="range"]::-moz-range-thumb {
  width: 12px;
  height: 12px;
  background: white;
  border-radius: 50%;
  cursor: pointer;
  border: none;
  transition: transform 0.2s ease, opacity 0.2s ease;
}

[type="range"]::-moz-range-thumb:hover {
  transform: scale(1.2);
  background: #1bd760;
}

#MusicPlayer {
  height: 100vh;
  height: 100dvh; /* Respect dynamic viewport height on mobile */
  padding-bottom: env(safe-area-inset-bottom);
}

#MusicPlayer.expanded {
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}


</style>