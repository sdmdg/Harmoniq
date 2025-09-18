<template>
  <div class="min-h-screen bg-black text-white p-6">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-green-400 mb-2">Song Management</h1>
      <p class="text-gray-400">Manage your music library with advanced filtering and classification</p>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div class="bg-gray-800/50 rounded-xl p-6 border border-gray-800">
        <div class="text-gray-400 text-sm mb-1">Total Songs</div>
        <div class="text-2xl font-bold text-white">{{ total }}</div>
      </div>
      <div class="bg-gray-800/50 rounded-xl p-6 border border-gray-800">
        <div class="text-gray-400 text-sm mb-1">Unique Albums</div>
        <div class="text-2xl font-bold text-white">{{ uniqueAlbums.length }}</div>
      </div>
      <div class="bg-gray-800/50 rounded-xl p-6 border border-gray-800">
        <div class="text-gray-400 text-sm mb-1">Genres</div>
        <div class="text-2xl font-bold text-white">{{ uniqueGenres.length }}</div>
      </div>
      <div class="bg-gray-800/50 rounded-xl p-6 border border-gray-800">
        <div class="text-gray-400 text-sm mb-1">Moods</div>
        <div class="text-2xl font-bold text-white">{{ uniqueMoods.length }}</div>
      </div>
    </div>

    <!-- Filters and Search -->
    <div class="bg-gray-800/50 rounded-xl p-6 border border-gray-800 mb-8">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <!-- Search -->
        <div class="lg:col-span-2">
          <label class="block text-sm font-medium text-gray-300 mb-2">Search Songs</label>
          <div class="relative">
            <input
              v-model.trim="query"
              type="text"
              placeholder="Search by title or artist..."
              class="w-full bg-gray-800 border border-gray-800 rounded-lg px-4 py-2.5 text-white placeholder-gray-400 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none"
            />
            <svg class="absolute right-3 top-3 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        <!-- Album Filter -->
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">Album</label>
          <select
            v-model="selectedAlbum"
            class="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none"
          >
            <option value="">All Albums</option>
            <option v-for="album in uniqueAlbums" :key="album" :value="album">{{ album }}</option>
          </select>
        </div>

        <!-- Genre Filter -->
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">Genre</label>
          <select
            v-model="selectedGenre"
            class="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none"
          >
            <option value="">All Genres</option>
            <option v-for="genre in uniqueGenres" :key="genre" :value="genre">{{ genre }}</option>
          </select>
        </div>

        <!-- Mood Filter -->
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">Mood</label>
          <select
            v-model="selectedMood"
            class="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none"
          >
            <option value="">All Moods</option>
            <option v-for="mood in uniqueMoods" :key="mood" :value="mood">{{ mood }}</option>
          </select>
        </div>
      </div>

      <!-- Filter Actions -->
      <div class="flex items-center justify-between mt-4 pt-4 border-t border-gray-800">
        <div class="flex items-center gap-4">
          <span class="text-sm text-gray-400">{{ filteredSongs.length }} songs found</span>
          <select
            v-model="limit"
            class="bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-1.5 text-white text-sm focus:border-green-500 outline-none"
          >
            <option :value="10">10 per page</option>
            <option :value="20">20 per page</option>
            <option :value="50">50 per page</option>
            <option :value="100">100 per page</option>
          </select>
        </div>
        <button
          @click="clearFilters"
          class="px-4 py-2 text-sm bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-gray-300 transition-colors"
        >
          Clear Filters
        </button>
      </div>
    </div>

    <!-- Alert Messages -->
    <div v-if="error" class="mb-6 p-4 bg-red-900/50 border border-red-700 rounded-lg text-red-200">
      {{ error }}
    </div>
    <div v-if="success" class="mb-6 p-4 bg-green-900/50 border border-green-700 rounded-lg text-green-200">
      {{ success }}
    </div>

    <!-- Songs Table -->
    <div class="bg-gray-800/50 rounded-xl border border-gray-800 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-800/50">
            <tr>
              <th class="text-left py-4 px-6 text-sm font-medium text-gray-300">Song</th>
              <th class="text-left py-4 px-6 text-sm font-medium text-gray-300">Album</th>
              <th class="text-left py-4 px-6 text-sm font-medium text-gray-300">Genre</th>
              <th class="text-left py-4 px-6 text-sm font-medium text-gray-300">Mood</th>
             
              <th class="text-right py-4 px-6 text-sm font-medium text-gray-300">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="6" class="py-12 text-center text-gray-400">
                <div class="flex items-center justify-center gap-2">
                  <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-green-500"></div>
                  Loading songs...
                </div>
              </td>
            </tr>

            <tr
              v-for="song in paginatedSongs"
              :key="song.id"
              class="border-t border-gray-800 hover:bg-gray-800/30 transition-colors"
            >
              <td class="py-4 px-6">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                    <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM15.657 6.343a1 1 0 011.414 0A9.972 9.972 0 0119 12a9.972 9.972 0 01-1.929 5.657 1 1 0 11-1.414-1.414A7.971 7.971 0 0017 12a7.971 7.971 0 00-1.343-4.243 1 1 0 010-1.414z" clip-rule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <div class="font-medium text-white">{{ song.title }}</div>
                    <div class="text-sm text-gray-400">{{ song.artist_name }}</div>
                  </div>
                </div>
              </td>
              <td class="py-4 px-6">
                <span class="text-gray-300">{{ song.album_name || '—' }}</span>
              </td>
              <td class="py-4 px-6">
                <span v-if="song.genre" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-900/50 text-blue-200 border border-blue-800">
                  {{ song.genre }}
                </span>
                <span v-else class="text-gray-500">—</span>
              </td>
              <td class="py-4 px-6">
                <span v-if="song.mood" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-900/50 text-purple-200 border border-purple-800">
                  {{ song.mood }}
                </span>
                <span v-else class="text-gray-500">—</span>
              </td>
             
              <td class="py-4 px-6">
                <div class="flex items-center justify-end gap-2">
                  <button
                    @click="playRow(song)"
                    :disabled="!song.encryption_key"
                    :class="[
                      'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                      song.encryption_key
                        ? 'bg-green-600 hover:bg-green-500 text-white'
                        : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                    ]"
                    :title="song.encryption_key ? 'Play/Pause' : 'Missing encryption key'"
                  >
                    {{ songStore.currentTrack?.id === song.id && songStore.isPlaying ? 'Pause' : 'Play' }}
                  </button>
                  <button
                    @click="askDelete(song)"
                    class="px-3 py-1.5 rounded-lg text-sm font-medium bg-red-600 hover:bg-red-500 text-white transition-colors"
                  >
                    Delete
                  </button>
                </div>

                <!-- Buffering indicator -->
                <div
                  v-if="songStore.currentTrack?.id === song.id && songStore.isBuffering"
                  class="mt-2 text-xs text-green-400"
                >
                  Buffering... {{ songStore.downloadProgress }}%
                </div>
              </td>
            </tr>

            <tr v-if="!loading && filteredSongs.length === 0">
              <td colspan="6" class="py-12 text-center text-gray-400">
                <div class="flex flex-col items-center gap-2">
                  <svg class="w-12 h-12 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                  </svg>
                  <p>No songs found matching your criteria</p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="border-t border-gray-800 px-6 py-4 flex items-center justify-between">
        <div class="text-sm text-gray-400">
          Showing {{ ((currentPage - 1) * limit) + 1 }} to {{ Math.min(currentPage * limit, filteredSongs.length) }} of {{ filteredSongs.length }} songs
        </div>
        <div class="flex items-center gap-2">
          <button
            @click="currentPage--"
            :disabled="currentPage <= 1"
            class="px-3 py-1.5 rounded-lg text-sm bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-700 text-gray-300 transition-colors"
          >
            Previous
          </button>
          <span class="px-3 py-1.5 text-sm text-gray-400">
            Page {{ currentPage }} of {{ totalPages }}
          </span>
          <button
            @click="currentPage++"
            :disabled="currentPage >= totalPages"
            class="px-3 py-1.5 rounded-lg text-sm bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-700 text-gray-300 transition-colors"
          >
            Next
          </button>
        </div>
      </div>
    </div>

    <!-- Confirm Dialog -->
    <ConfirmDialog
      :open="showConfirm"
      title="Delete Song"
      :message="target ? `Are you sure you want to delete '${target.title}'? This action cannot be undone.` : ''"
      @cancel="showConfirm = false"
      @confirm="doDelete"
    />

    <!-- Music Player -->
    <div class="fixed left-0 right-0 bottom-0 z-50 border-t border-gray-800 bg-gray-900 md:left-60">
      <MusicPlayer />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import apiClient from '@/utils/axios'

// 🔊 Pinia player + UI
import { useSongStore } from '@/stores/song'
import MusicPlayer from '@/components/MusicPlayer.vue'

const songStore = useSongStore()

// --- table/query state ---
const query = ref('')
const page = ref(1)
const limit = ref(10)
const total = ref(0)
const songs = ref([])
const loading = ref(false)
const error = ref('')
const success = ref('')

// Filter states
const selectedAlbum = ref('')
const selectedGenre = ref('')
const selectedMood = ref('')
const currentPage = ref(1)

// delete confirm
const showConfirm = ref(false)
const target = ref(null)

// Computed properties for unique values
const uniqueAlbums = computed(() => {
  const albums = songs.value
    .map(song => song.album_name)
    .filter(album => album && album.trim())
  return [...new Set(albums)].sort()
})

const uniqueGenres = computed(() => {
  const genres = songs.value
    .map(song => song.genre)
    .filter(genre => genre && genre.trim())
  return [...new Set(genres)].sort()
})

const uniqueMoods = computed(() => {
  const moods = songs.value
    .map(song => song.mood)
    .filter(mood => mood && mood.trim())
  return [...new Set(moods)].sort()
})

// Filtered songs based on all criteria
const filteredSongs = computed(() => {
  let filtered = songs.value

  // Text search
  if (query.value) {
    const searchTerm = query.value.toLowerCase()
    filtered = filtered.filter(song =>
      song.title?.toLowerCase().includes(searchTerm) ||
      song.artist_name?.toLowerCase().includes(searchTerm)
    )
  }

  // Album filter
  if (selectedAlbum.value) {
    filtered = filtered.filter(song => song.album_name === selectedAlbum.value)
  }

  // Genre filter
  if (selectedGenre.value) {
    filtered = filtered.filter(song => song.genre === selectedGenre.value)
  }

  // Mood filter
  if (selectedMood.value) {
    filtered = filtered.filter(song => song.mood === selectedMood.value)
  }

  return filtered
})

// Paginated songs
const paginatedSongs = computed(() => {
  const start = (currentPage.value - 1) * limit.value
  const end = start + limit.value
  return filteredSongs.value.slice(start, end)
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredSongs.value.length / limit.value)))

// Build the "artist" container that the store expects
const artist = computed(() => ({
  id: 'admin-all-songs',
  title: 'All Songs',
  tracks: (songs.value || []).map(r => ({
    id: r.id,
    name: r.title,
    key: r.encryption_key,
    path: r.id
  }))
}))

async function fetchSongs() {
  loading.value = true
  error.value = ''
  try {
    const { data } = await apiClient.get('/api/songs', {
      params: { query: query.value || null, page: page.value, limit: 1000 } // Get all songs for client-side filtering
    })
    songs.value = data?.items ?? []
    total.value = Number(data?.total ?? songs.value.length)

    // Reset to first page when data changes
    currentPage.value = 1
  } catch (e) {
    console.error(e)
    error.value = 'Failed to load songs.'
    songs.value = []
  } finally {
    loading.value = false
  }
}

function askDelete(row) {
  target.value = row
  showConfirm.value = true
}

async function doDelete() {
  const id = target.value?.id
  showConfirm.value = false
  if (!id) return

  const rollback = songs.value.slice()
  songs.value = songs.value.filter(s => s.id !== id)
  try {
    await apiClient.delete(`/api/songs/${id}`)
    success.value = 'Song deleted successfully.'
    total.value = Math.max(0, total.value - 1)
    
    // Clear success message after 3 seconds
    setTimeout(() => { success.value = '' }, 3000)
    
    // Stop the player if the deleted one is currently playing
    if (songStore.currentTrack?.id === id) {
      songStore.stop()
      songStore.resetState()
    }
  } catch (e) {
    console.error(e)
    error.value = 'Delete failed.'
    songs.value = rollback
    setTimeout(() => { error.value = '' }, 5000)
  } finally {
    target.value = null
  }
}

function fmtTime(sec) {
  if (sec === null || sec === undefined || Number.isNaN(sec)) return '—'
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

function clearFilters() {
  query.value = ''
  selectedAlbum.value = ''
  selectedGenre.value = ''
  selectedMood.value = ''
  currentPage.value = 1
}

// ── Player wiring ──────────────────────────────────────────────────────────────

function playRow(row) {
  const track = { id: row.id, name: row.title, key: row.encryption_key, path: row.id }
  if (!track.key) {
    error.value = 'Missing encryption key for this track. Please encrypt/update it first.'
    setTimeout(() => (error.value = ''), 3000)
    return
  }
  const a = {
    id: 'admin-all-songs',
    title: 'All Songs',
    tracks: songs.value.map(r => ({ id: r.id, name: r.title, key: r.encryption_key, path: r.id }))
  }
  songStore.playOrPauseThisSong(a, track)
}

// Watch for filter changes and reset to first page
watch([selectedAlbum, selectedGenre, selectedMood, query, limit], () => {
  currentPage.value = 1
})

// Watch for page changes in original pagination (if still needed)
watch(page, fetchSongs)

onMounted(fetchSongs)
</script>

<style scoped>
table { border-collapse: collapse; }
</style>