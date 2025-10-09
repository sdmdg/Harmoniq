<script setup>
import { ref, toRefs, onMounted } from 'vue'
import Heart from 'vue-material-design-icons/Heart.vue'
import Play from 'vue-material-design-icons/Play.vue'
import Pause from 'vue-material-design-icons/Pause.vue'
import apiClient from '../utils/axios'
import { useSongStore } from '../stores/song'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'

const useSong = useSongStore()
const { isPlaying, currentTrack } = storeToRefs(useSong)
const router = useRouter()

const fileServerBaseUrl = import.meta.env.VITE_FILE_SERVER || 'http://localhost:3000'

let isHover = ref(false)
let isLiked = ref(false)
const user = ref(null)

// Fetch user from localStorage
const fetchUser = () => {
  const userData = localStorage.getItem('user_data')
  if (userData) {
    user.value = JSON.parse(userData)
  } else {
    router.push('/login')
  }
}

const props = defineProps({
  track: Object,
  artist: Object,
  index: Number,
  duration: String
})

const { track, artist, index, duration } = toRefs(props)

// Fetch liked state on mount
onMounted(async () => {
  fetchUser()
  if (!user.value) return

  try {
    const res = await apiClient.get(`/api/playlist/liked-songs/${user.value.id}`)
    isLiked.value = res.data.tracks.some(song => song.id === track.value.id)
  } catch (err) {
    console.error("Error fetching liked songs:", err)
  }
})

// Toggle like/unlike
const toggleLike = async () => {
  try {
    if (!isLiked.value) {
      await apiClient.post('/api/songs/like', { songId: track.value.id })
      isLiked.value = true
    } else {
      await apiClient.post('/api/songs/unlike', { songId: track.value.id })
      isLiked.value = false
    }
  } catch (err) {
    console.error("Toggle like error:", err)
  }
}
</script>

<template>
  <li
    class="flex h-[50px] items-center justify-between rounded-md hover:bg-[#2A2929] transition-colors duration-200 px-2 py-2.0"
    @mouseenter="isHover = true"
    @mouseleave="isHover = false"
  >
    <!-- LEFT SECTION -->
    <div class="flex items-center flex-1 min-w-0">
      <!-- Play/Pause Button -->
      <div v-if="isHover" class="w-[50px] ml-[14px] mr-[6px] cursor-pointer">
        <Play
          v-if="!isPlaying"
          fillColor="#FFFFFF"
          :size="25"
          @click="useSong.playOrPauseThisSong(artist, track)"
        />
        <Play
          v-else-if="isPlaying && currentTrack.name !== track.name"
          fillColor="#FFFFFF"
          :size="25"
          @click="useSong.loadSong(artist, track)"
        />
        <Pause v-else fillColor="#FFFFFF" :size="25" @click="useSong.playOrPauseSong()" />
      </div>

      <!-- Index & Album Cover -->
      <div v-else class="relative w-[50px] ml-5 flex items-center justify-center">
        <img
          class="absolute w-[40px] h-[40px] rounded-sm -z-10 brightness-[0.5]"
          :src="`${fileServerBaseUrl}/public/images/${track.albumCover || track.albumcover || artist.albumCover || 'default_album.png'}`"
          alt="Album Cover"
        />
        <span
          :class="{'text-green-500': currentTrack && currentTrack.id === track.id, 'text-white': !isHover}"
          class="font-semibold z-10"
        >
          {{ index }}
        </span>
      </div>

      <!-- Track & Artist -->
      <div class="ml-3 flex-1 min-w-0">
        <div
          :class="{
            'text-green-500': currentTrack && currentTrack.id === track.id
          }"
          class="text-white font-semibold truncate leading-tight"
        >
          {{ track.name }}
        </div>
        <div class="text-sm font-semibold text-gray-400 truncate leading-tight">
          {{ track.artist || artist.name }}
        </div>
      </div>
    </div>

    <!-- RIGHT SECTION -->
    <div class="flex items-center gap-1 ml-2 shrink-0">
      <button type="button" @click.stop="toggleLike">
        <Heart :fillColor="isLiked ? '#1BD760' : '#FFFFFF'" :size="20" />
      </button>
      <div class="text-xs text-gray-400 w-[40px] text-right">
        {{ duration }}
      </div>
    </div>
  </li>
</template>


<style scoped>
li:hover {
  transition: background-color 0.2s ease-in-out;
}
</style>
