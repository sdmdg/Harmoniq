<script setup>
import { toRefs } from 'vue'
import { useSongStore } from "../stores/song";
import Play from 'vue-material-design-icons/Play.vue';
import Pause from 'vue-material-design-icons/Pause.vue';
import { storeToRefs } from 'pinia';

const songStore = useSongStore()
const { isPlaying, currentTrack } = storeToRefs(songStore)

const props = defineProps({
  image: String,
  title: String,
  subTitle: String,
  track: Object,
  isRadio: { type: Boolean, default: false }
})
const { image, title, subTitle, track, isRadio } = toRefs(props)

// Play a track
const playTrack = (track) => {
  const artistInfo = track.artist || { name: "Unknown" }
  if (isRadio.value) {
    songStore.playOrPauseThisSongRadio(track)
  } else {
    songStore.playOrPauseThisSong(artistInfo, track)
  }
}

const formattedDuration = (duration) => {
  if (!duration) return '00:00'

  // Try parsing duration in various possible formats
  let totalSeconds = 0

  if (typeof duration === 'number') {
    totalSeconds = duration
  } else if (typeof duration === 'string') {
    // If already in "MM:SS" or "M:S" format
    const parts = duration.split(':').map(p => parseInt(p))
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      totalSeconds = parts[0] * 60 + parts[1]
    } else if (!isNaN(parseInt(duration))) {
      // Maybe it's just total seconds
      totalSeconds = parseInt(duration)
    } else {
      return '00:00'
    }
  }

  const minutes = Math.floor(totalSeconds / 60)
  const seconds = Math.floor(totalSeconds % 60)
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

// Format play count
const formatPlays = (count) => {
  if (!count || count <= 0) return null
  return `${count.toLocaleString()} plays`
}
</script>

<template>
<div>
  <div 
    class="opacity-80  bg-[#111111] w-[180px] h-[240px] p-4 rounded-md m-2 hover:bg-[#252525] cursor-pointer flex flex-col group"
    @click.stop="playTrack(track)"
  >
    <!-- Image wrapper with overlay -->
    <div class="relative w-full aspect-square rounded-lg overflow-hidden shadow-lg transition-transform duration-300 group-hover:scale-105">
      <img 
        class="rounded-md w-full h-full object-cover" 
        :src="image" 
        alt="cover"
      />
      <!-- Play button  -->
      <div v-if="!(currentTrack && currentTrack.id === track.id) || !isPlaying"
          class="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <div class="text-black rounded-full p-3 shadow-lg">
          <Play
            fillColor="#FFFFFF"
            :size="45"
          />
        </div>
      </div>
      <!-- Pause button  -->
      <div v-if="(currentTrack && currentTrack.id === track.id) & isPlaying"
          class="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <div class="text-black rounded-full p-3 shadow-lg">
          <Pause
            fillColor="#FFFFFF"
            :size="45"
          />
        </div>
      </div>
    </div>

    <!-- Text -->
    <div class="text-white pt-3 font-semibold text-[15px] truncate">
      {{ title }}
    </div>
    <div class="text-gray-400 text-[13px] truncate">
      {{ subTitle }}
      <!-- Play count + duration -->
      <div class="flex items-center gap-3 text-gray-400 text-[12px]">

        <span>
          {{ formattedDuration(track.duration.replace(";", ":")) }}
        </span>
      </div>
    </div>

  </div>
</div>
</template>
