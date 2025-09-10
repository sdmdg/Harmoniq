<script setup>
import { ref, watch, onMounted, nextTick } from 'vue'
import MusicPlayerVolume from '../components/MusicPlayerVolume.vue'
import Heart from 'vue-material-design-icons/Heart.vue'
import Play from 'vue-material-design-icons/Play.vue'
import Pause from 'vue-material-design-icons/Pause.vue'
import SkipBackward from 'vue-material-design-icons/SkipBackward.vue'
import SkipForward from 'vue-material-design-icons/SkipForward.vue'
const fileServerBaseUrl = import.meta.env.VITE_FILE_SERVER || 'http://localhost:3000';
import { useSongStore } from '../stores/song'
import { storeToRefs } from 'pinia'

const useSong = useSongStore()
const { isPlaying, audio, currentTrack, currentArtist } = storeToRefs(useSong)

const isHover = ref(false)
const range = ref(0)
const currentTimeText = ref('0:00')
const totalTimeText = ref('0:00')
const seeker = ref(null)
const seekerContainer = ref(null)
let timeUpdateInterval = null


const formatTime = (sec) => {
  if (!sec || isNaN(sec)) return '0:00'
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}


const onSeekChange = () => {
  if (!audio.value) return
  useSong.seekToPercent(range.value)
}

const onSeekStart = () => {
  if (!audio.value) return
  audio.value.pause()
}

const onSeekEnd = () => {
  if (!audio.value) return
  audio.value.play().catch(() => {})
}


const startTimeUpdates = () => {
  if (timeUpdateInterval) clearInterval(timeUpdateInterval)
  timeUpdateInterval = setInterval(() => {
    if (!audio.value || isNaN(audio.value.duration)) return
    currentTimeText.value = formatTime(audio.value.currentTime)
    totalTimeText.value = formatTime(audio.value.duration)
    range.value = (audio.value.currentTime / audio.value.duration) * 100
  }, 250)
}

onMounted(() => {
  watch(audio, async () => {
    await nextTick()
    if (!audio.value) return
    startTimeUpdates()
  }, { immediate: true })
})

watch(currentTrack, () => {
  range.value = 0
  currentTimeText.value = '0:00'
  totalTimeText.value = '0:00'
})
</script>

<template>
  <div
    v-if="audio"
    id="MusicPlayer"
    class="fixed flex items-center justify-between bottom-0 w-full z-50 h-[90px] bg-opacity-80 border-t border-t-[#272727]"
    style="background-color: rgba(24,24,24,0.8); backdrop-filter: blur(10px);"
  >
    <!-- Left: Album/artist info -->
    <div class="flex items-center w-1/4">
      <div class="flex items-center ml-4">
        <img
          class="rounded-sm shadow-2xl"
          width="55"
          :src="`${fileServerBaseUrl}/public/images/${currentTrack.albumCover || currentArtist.albumCover || 'default_album.png'}`"
        />
        <div class="ml-4">
          <div class="text-[14px] text-white hover:underline cursor-pointer">{{ currentTrack.name }}</div>
          <div class="text-[11px] text-gray-500 hover:underline hover:text-white cursor-pointer">{{ currentTrack.artist || currentArtist.artist }}</div>
        </div>
      </div>
      <div class="flex items-center ml-8">
        <Heart fillColor="#1BD760" :size="20" />
      </div>
    </div>

    
    <div class="max-w-[35%] mx-auto w-2/4 mb-3">
      <div class="flex-col items-center justify-center">
        <!-- Buttons -->
        <div class="buttons flex items-center justify-center h-[30px]">
          <button class="mx-2" @click="useSong.prevSong()">
            <SkipBackward fillColor="#FFFFFF" :size="25" />
          </button>
          <button class="p-1 rounded-full mx-3 bg-white" @click="useSong.playOrPauseThisSong(currentArtist, currentTrack)">
            <Play v-if="!isPlaying" fillColor="#181818" :size="25" />
            <Pause v-else fillColor="#181818" :size="25" />
          </button>
          <button class="mx-2" @click="useSong.nextSong()">
            <SkipForward fillColor="#FFFFFF" :size="25" />
          </button>
        </div>

        <!-- Seeker -->
        <div class="flex items-center h-[25px]">
          <div class="text-white text-[12px] pr-2 pt-[11px]">{{ currentTimeText }}</div>
          <div
            ref="seekerContainer"
            class="w-full relative mt-2 mb-3"
            @mouseenter="isHover = true"
            @mouseleave="isHover = false"
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
              class="absolute rounded-full my-2 w-full h-0 z-40 appearance-none bg-opacity-100 focus:outline-none accent-white"
              :class="{ 'rangeDotHidden': !isHover }"
            />
            <div
              class="pointer-events-none mt-[6px] absolute h-[4px] z-10 inset-y-0 left-0 w-0"
              :style="`width: ${range}%;`"
              :class="isHover ? 'bg-green-500' : 'bg-white'"
            />
            <div class="absolute h-[4px] z-[-0] mt-[6px] inset-y-0 left-0 w-full bg-gray-500 rounded-full" />
          </div>
          <div class="text-white text-[12px] pl-2 pt-[11px]">{{ totalTimeText }}</div>
        </div>
      </div>
    </div>

    <!-- Right: Volume -->
    <div class="flex items-center w-1/4 justify-end pr-10">
      <MusicPlayerVolume />
    </div>
  </div>
</template>

<style>
.rangeDotHidden[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 0;
  height: 0;
}
</style>
