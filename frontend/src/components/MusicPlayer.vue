<script setup>
// NO CHANGES NEEDED IN THE SCRIPT SECTION.
// All the logic for playback, seeking, and time updates is solid.
import { ref, watch, onMounted, nextTick } from 'vue'
import MusicPlayerVolume from '../components/MusicPlayerVolume.vue'
import Heart from 'vue-material-design-icons/Heart.vue'
import Play from 'vue-material-design-icons/Play.vue'
import Pause from 'vue-material-design-icons/Pause.vue'
import SkipBackward from 'vue-material-design-icons/SkipBackward.vue'
import SkipForward from 'vue-material-design-icons/SkipForward.vue'
import PlaylistItem from '../components/SongRow.vue' // your playlist item component

import { useSongStore } from '../stores/song'
import { storeToRefs } from 'pinia'

const useSong = useSongStore()
const { isPlaying, audio, currentTrack, currentArtist } = storeToRefs(useSong)

const fileServerBaseUrl = import.meta.env.VITE_FILE_SERVER || 'http://localhost:3000'

const isHover = ref(false)
const isExpanded = ref(false) // expanded state
const range = ref(0)
const currentTimeText = ref('0:00')
const totalTimeText = ref('0:00')
const seeker = ref(null)
const seekerContainer = ref(null)
let timeUpdateInterval = null

const formatTime = (sec) => {
  if (!sec) return '0:00'

  // If sec is a string like "3;18"
  if (typeof sec === 'string' && sec.includes(';')) {
    const [minutes, seconds] = sec.split(';')
    return `${minutes}:${seconds.padStart(2, '0')}`
  }

  // Otherwise, treat as number of seconds
  const s = Number(sec)
  if (isNaN(s)) return '0:00'

  const m = Math.floor(s / 60)
  const rem = Math.floor(s % 60)
  return `${m}:${rem.toString().padStart(2, '0')}`
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
    v-if="currentTrack"
    id="MusicPlayer"
    class="fixed bottom-0 left-0 w-full z-50 bg-[#181818] border-t border-t-[#272727] transition-all duration-500 ease-in-out"
    :class="isExpanded ? 'h-[500px]' : 'h-[90px]'" style="background-color: rgba(24,24,24,0.8); backdrop-filter: blur(10px);"
  >

    <div class="relative flex h-full w-full items-center px-4">
      
      <div
        class="flex items-center transition-all duration-500 ease-in-out"
        :class="isExpanded ? 'w-1/3 flex-col justify-center' : 'w-1/4 flex-row'"
      >
        <img
          :src="`${fileServerBaseUrl}/public/images/${currentTrack.albumCover || currentArtist.albumCover || currentTrack.albumcover || currentArtist.albumcover || 'default_album.png'}`"
          class="rounded-md shadow-2xl transition-all duration-500 ease-in-out hover:scale-105 cursor-pointer"
          :class="isExpanded ? 'w-56 h-56 mb-6' : 'w-14 h-14 mr-4'"
          @click="isExpanded = !isExpanded"
        />
        <div 
          class="flex flex-col transition-all duration-500 ease-in-out"
          :class="isExpanded ? 'items-center text-center' : 'items-start'"
        >
          <div class="text-white font-semibold" :class="isExpanded ? 'text-2xl' : 'text-sm'">
            {{ currentTrack.name }}
          </div>
          <div class="text-gray-400 font-medium" :class="isExpanded ? 'text-lg' : 'text-xs'">
            {{ currentTrack.artist || currentArtist.artist }}
          </div>
        </div>
    
        <div v-if="isExpanded" class=" transition-all duration-500 ease-in-out">
            <MusicPlayerVolume />
        </div>
      </div>

      <div class="flex-1 flex flex-col justify-center items-center h-full px-4">
        
        <div v-if="isExpanded"
          class="flex-1 w-full overflow-y-auto transition-all duration-1000 ease-in-out"
          :class="isExpanded ? 'opacity-100 mt-6' : 'opacity-0 h-0'"
        >
          <div class="text-white text-lg font-semibold mb-3">Up Next</div>
          <div class="bg-[#101010] w-full h-full bg-opacity-25 rounded-sm overflow-hidden">
            <ul>
              <div v-if="!currentArtist.tracks" class="text-white text-s mb-3">Nothing to show here</div>
              <PlaylistItem
                v-for="(track, idx) in currentArtist.tracks"
                :key="track.id"
                :track="track"
                :artist="currentArtist"
                :index="idx + 1"
                :duration="formatTime(track.duration)"
              />
            </ul>
          </div>
        </div>
        <br v-if="isExpanded" class=" transition-all duration-500 ease-in-out">
        
        <div class="flex flex-col items-center justify-center w-full transition-all duration-500 ease-in-out"
          :class="isExpanded ? 'pb-6' : ''"
        >
          <div class="buttons flex items-center justify-center h-[30px] mb-2">
            <button class="mx-2" @click="useSong.prevSong()"><SkipBackward fillColor="#FFFFFF" :size="25"/></button>
            <button class="p-1.5 rounded-full bg-white mx-3" @click="useSong.playOrPauseThisSong(currentArtist, currentTrack)">
              <Play v-if="!isPlaying" fillColor="#181818" :size="30"/>
              <Pause v-else fillColor="#181818" :size="30"/>
            </button>
            <button class="mx-2" @click="useSong.nextSong()"><SkipForward fillColor="#FFFFFF" :size="25"/></button>
          </div>

        <!-- Seeker -->
        <div class="flex items-center w-full max-w-lg ">
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
              class="pointer-events-none mt-[6px] absolute h-[4px] z-10 inset-y-0 left-0 rounded-full"
              :style="`width: ${range}%; transition: width 0.25s linear;`"
              :class="isHover ? 'bg-green-500' : 'bg-white'"
            />
            <div class="absolute h-[4px] z-[-0] mt-[6px] inset-y-0 left-0 w-full bg-gray-500 rounded-full" />
          </div>
          <div class="text-white text-[12px] pl-2 pt-[11px]">{{ totalTimeText }}</div>
        </div>


        </div>
      </div>
      
      <div v-if="!isExpanded" class="w-1/4 flex items-center justify-end pr-2">
        <MusicPlayerVolume />
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
  background: #1BD760;
}

</style>