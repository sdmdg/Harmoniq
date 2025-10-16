<script setup>
import { ref, onMounted } from 'vue'
import apiClient from '../utils/axios'
import SongCard from '../components/SongCard.vue'
import QuickPickCard from '../components/SongCardRow.vue'
import AlbumItem from '../components/AlbumCard.vue'
import ArtistItem from '../components/ArtistCard.vue'
import { useSongStore } from "../stores/song";
import Music from 'vue-material-design-icons/Music.vue';
const songStore = useSongStore()

const recentSongs = ref([])
const quickPicks = ref([])
const albums = ref([])
const newReleases = ref([])
const artists = ref([])
const loading = ref(true)
const error = ref(null)
const randomText = ref("")

const fileServerBaseUrl = import.meta.env.VITE_FILE_SERVER || 'http://localhost:3000'
const buttonTexts = [
  "Start Your Mix",
  "Play Smart Radio",
  "Start Harmoniq Radio"
]

const fetchData = async () => {
  try {
    loading.value = true
    const response = await apiClient.get('/api/profile/getHomePage')
    // simulate delay to see animation more clearly
    setTimeout(() => {
      recentSongs.value = response.data.recent
      quickPicks.value = response.data.quickPicks
      albums.value = response.data.albums
      newReleases.value = response.data.newReleases,
      artists.value = response.data.artists
      loading.value = false
    }, 500)
  } catch (err) {
    console.error('Error fetching recent songs:', err)
    error.value = 'Failed to load songs.'
    loading.value = false
  }
}

onMounted(() => {
  fetchData();
  const randomIndex = Math.floor(Math.random() * buttonTexts.length)
  randomText.value = buttonTexts[randomIndex]
})

const startRadio = () => {
  if (recentSongs.value && recentSongs.value.length > 0) {
    const randomSong = recentSongs.value[Math.floor(Math.random() * recentSongs.value.length)];
    songStore.playOrPauseThisSongRadio(randomSong)
    console.log("Radio started!")
  } else {
    console.warn("No recent songs available to start radio.")
  }
}

</script>

<template>
  <div v-if="loading || error" class="p-8">
    <div v-if="loading" class="text-gray-400">Loading...</div>
    <div v-else-if="error" class="text-red-500">{{ error }}</div>
  </div>

  <!-- Header with Start Radio Button -->
  <div v-if="recentSongs?.length > 0" class="flex justify-between items-center px-8 pt-6">
    <h1 class="text-white text-3xl font-bold">Home</h1>

    <button
      @click="startRadio"
      class="relative overflow-hidden px-7 py-2.5 rounded-full font-semibold text-white
            bg-gradient-to-r from-fuchsia-500 via-purple-500 to-indigo-600
            shadow-lg transition-all transform hover:scale-105 hover:shadow-2xl
            animate-gradient-move flex items-center gap-2 group"
    >
      <!-- Headphones Icon -->
      <span class="text-lg transition-transform group-hover:rotate-12">
        <Music
          fillColor="#FFFFFF"
          :size="24"
        />
        </span>

      <!-- Text -->
      <span class="relative z-10 tracking-wide">{{ randomText }}</span>

      <!-- Shimmer Effect -->
      <div
        class="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 blur-sm animate-shimmer"
      ></div>
    </button>

  </div>

  <!-- Recent Songs -->
  <div v-if="recentSongs.length" class="p-8">
    <h1 class="text-white text-2xl font-semibold">Listen again</h1>
    <div class="py-1.5"></div>

    <!-- Always render container, animate children -->
    <transition-group
      name="fade-slide"
      tag="div"
      class="flex items-center space-x-4 overflow-x-auto"
      appear
    >
      <SongCard
        v-for="song in recentSongs"
        :key="song.id"
        :image="`${fileServerBaseUrl}/public/images/${song.albumcover}`"
        :title="song.name"
        :subTitle="song.artist"
        :track="song"
        :is-radio="true"
      />
    </transition-group>
  </div>

  <!-- Quick Picks -->
  <div v-if="quickPicks.length" class="p-8">
    <h1 class="text-white text-2xl font-semibold">Quick picks</h1>
    <div class="py-1.5"></div>

    <div class="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
      <div class="grid grid-rows-4 grid-flow-col auto-cols-max gap-4">
        <transition-group
          name="fade-slide"
          tag="div"
          class="contents"
          appear
        >
          <QuickPickCard
            v-for="song in quickPicks"
            :key="song.id"
            :image="`${fileServerBaseUrl}/public/images/${song.albumcover}`"
            :title="song.name"
            :subTitle="song.artist"
            :track="song"
            :is-radio="true"
            class="transition-transform duration-300"
          />
        </transition-group>
      </div>
    </div>
  </div>

  <!-- Albums -->
  <div v-if="albums.length" class="p-8">
    <h1 class="text-white text-2xl font-semibold">Albums for you</h1>
    <div class="py-1.5"></div>

    <transition-group
      name="fade-slide"
      tag="div"
      class="flex items-center space-x-4 overflow-x-auto"
      appear
    >
      <AlbumItem
        v-for="album in albums"
        :key="album.id"
        :album="album"
      />
    </transition-group>
  </div>

  <!-- New releases -->
  <div v-if="newReleases.length" class="p-8">
    <h1 class="text-white text-2xl font-semibold">New releases</h1>
    <div class="py-1.5"></div>

    <!-- Albums list -->
    <transition-group
      name="fade-slide"
      tag="div"
      class="flex items-center space-x-4 overflow-x-auto"
      appear
    >
      <AlbumItem
        v-for="album in newReleases"
        :key="album.id"
        :title="album.title"
        :subTitle="album.artist"
        :album="album"
      />
    </transition-group>
  </div>


  <!-- Artists -->
  <div v-if="artists.length" class="p-8">
    <h1 class="text-white text-2xl font-semibold">Artists you'll love</h1>
    <div class="py-1.5"></div>

    <transition-group
      name="fade-slide"
      tag="div"
      class="flex items-center space-x-4 overflow-x-auto"
      appear
    >
      <ArtistItem 
        v-for="artist in artists"
        :key="artist.id"
        :id="artist.id" 
        :image="artist.cover" 
        :name="artist.name" 
        :is-following="artist.isFollowing"
        :listenerCount="artist.listenerCount"
      />
    </transition-group>
  </div>
</template>

<style>
/* Fade + slide animation */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.4s ease;
}
.fade-slide-enter-from {
  opacity: 0;
  transform: translateX(20px);
}
.fade-slide-enter-to {
  opacity: 1;
  transform: translateX(0);
}
.fade-slide-leave-from {
  opacity: 1;
  transform: translateX(0);
}
.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(20px);
}

@keyframes gradientMove {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.animate-gradient-move {
  background-size: 200% 200%;
  animation: gradientMove 4s ease infinite;
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  50% { transform: translateX(100%); }
  100% { transform: translateX(100%); }
}

.animate-shimmer {
  animation: shimmer 2.5s linear infinite;
}

</style>
