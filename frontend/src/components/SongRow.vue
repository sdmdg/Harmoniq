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

const userPlaylists = ref([])
const showPlaylistModal = ref(false)
const selectedSongId = ref(null) //  store the song to add

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
  duration: String,
  canLiked: { type: Boolean, default: true }
})

const { track, artist, index, duration, canLiked } = toRefs(props)

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

const openPlaylistModal = async (songId) => {
  try {
    selectedSongId.value = songId
    const response = await apiClient.get("/api/playlist/get/all")
    let playlists = response.data
    console.log(playlists)

    // Filter playlists that do NOT already contain this song
    playlists = playlists.filter(playlist => 
      !playlist.tracks?.some(track => track.id === songId)
    )

    userPlaylists.value = playlists
    showPlaylistModal.value = true
  } catch (error) {
    console.error("Failed to fetch user playlists:", error)
  }
}


// add song to selected playlist
const addToPlaylist = async (playlistId) => {
  try {
    if (!selectedSongId.value) {
      alert("Song ID not found!")
      return
    }

    await apiClient.post(`/api/playlist/add-song`, {
      playlistId,
      songId: selectedSongId.value,
    })

    alert(" Song added to playlist!")
    showPlaylistModal.value = false
  } catch (err) {
    console.error("Failed to add song:", err)
    alert(" Failed to add song to playlist.")
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
      <button v-if="canLiked" type="button" @click.stop="toggleLike">
        <Heart :fillColor="isLiked ? '#1BD760' : '#FFFFFF'" :size="20" />
      </button>
      <button type="button" @click.stop="openPlaylistModal(track.id)">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5 text-white hover:text-green-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
      </button>
      <div class="text-xs text-gray-400 w-[40px] text-right">
        {{ duration }}
      </div>
    </div>
    <!-- Playlist Popup Modal -->
<div
  v-if="showPlaylistModal"
  class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50"
>
  <div class="bg-neutral-900 rounded-2xl w-[400px] max-h-[500px] p-5 border border-neutral-700 shadow-lg">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-white font-semibold text-lg">Add to Playlist</h2>
      <button
        @click="showPlaylistModal = false"
        class="text-gray-400 hover:text-white text-xl font-bold"
      >
        &times;
      </button>
    </div>

    <div v-if="userPlaylists.length === 0" class="text-gray-400 text-sm text-center py-6">
      No playlists found.
    </div>

    <div v-else class="overflow-y-auto h-[360px] scrollbar-hidden pb-4">
      <ul class="space-y-0">
        <li
          v-for="playlist in userPlaylists"
          :key="playlist.id"
          class="flex items-center justify-between hover:bg-neutral-800 px-4 py-2 rounded-md cursor-pointer"
          @click="addToPlaylist(playlist.id)"
        >
          <div class="flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none"
                 viewBox="0 0 24 24" stroke="currentColor"
                 class="h-5 w-5 text-green-400">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M3 10h18M3 6h18M3 14h10m6 0h2m-8 4h8" />
            </svg>
            <span class="text-white font-medium">{{ playlist.title }}</span>
          </div>
          <span class="text-gray-400 text-xs">→</span>
        </li>
      </ul>
    </div>
  </div>
</div>

  </li>
</template>


<style scoped>
li:hover {
  transition: background-color 0.2s ease-in-out;
}
</style>
