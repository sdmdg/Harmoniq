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
  track: Object // pass the full track object from backend
})
const { image, title, subTitle, track } = toRefs(props)

// Play a track with its artist + track context
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
<div>
  <div 
    class="bg-[#111111] w-[180px] h-[240px] p-4 rounded-md m-2 hover:bg-[#252525] cursor-pointer flex flex-col group"
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
</div>
</template>
