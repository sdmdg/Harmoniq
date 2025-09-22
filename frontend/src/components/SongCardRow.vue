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
  track: Object
})
const { image, title, subTitle, track } = toRefs(props)

// Play a track
const playTrack = (track) => {
  const artistInfo = track.artist || { name: "Unknown" }
  songStore.playOrPauseThisSong(artistInfo, track)
}

// Format play count
const formatPlays = (count) => {
  if (!count || count <= 0) return null
  return `${count.toLocaleString()} plays`
}

</script>

<template>
  <div 
    class="bg-[#111111] w-[280px] h-[70px] rounded-md flex overflow-hidden shadow-md hover:bg-[#252525] cursor-pointer group"
    @click.stop="playTrack(track)"
  >
    <!-- Image -->
    <div class="relative w-[70px] h-full flex-shrink-0">
      <img 
        class="w-full h-full object-cover" 
        :src="image" 
        alt="cover"
      />
      <!-- Play overlay -->
      <div v-if="!(currentTrack && currentTrack.id === track.id) || !isPlaying" class="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
        <div class="p-2 bg-black rounded-full shadow-lg">
          <Play fillColor="#FFFFFF" :size="20" />
        </div>
      </div>
      <div v-if="(currentTrack && currentTrack.id === track.id) && isPlaying" class="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
        <div class="p-2 bg-black rounded-full shadow-lg">
          <Pause fillColor="#FFFFFF" :size="20" />
        </div>
      </div>
    </div>

    <!-- Text -->
    <div class="flex flex-col justify-center px-4 w-full overflow-hidden">
      <!-- Title -->
      <div class="text-white font-semibold text-[15px] truncate">
        {{ title }}
      </div>

      <!-- Subtitle -->
      <div class="text-gray-400 text-[13px] truncate">
        {{ subTitle }}
      </div>

      <!-- Play count + duration -->
      <div class="flex items-center gap-3 text-gray-400 text-[12px]">
        <span v-if="formatPlays(track.play_count)">
          {{ formatPlays(track.play_count) }}
        </span>

        <!-- Dot separator -->
        <div v-if="formatPlays(track.play_count)" class="w-1 h-1 rounded-full bg-gray-400"></div>

        <span>
          {{ track.duration.replace(";", ":") }}
        </span>
      </div>

    </div>
  </div>
</template>
