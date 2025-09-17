<!-- src/views/AdminSongManage.vue -->
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

// delete confirm
const showConfirm = ref(false)
const target = ref(null)

const totalPages = computed(() => Math.max(1, Math.ceil(total.value / limit.value)))

// Build the “artist” container that the store expects.
// We keep it in a computed so next/prev work across whatever is currently listed.
const artist = computed(() => ({
  id: 'admin-all-songs',
  title: 'All Songs',
  tracks: (songs.value || []).map(r => ({
    id: r.id,                 // UUID
    name: r.title,            // display name
    key: r.encryption_key,    // AES key (hex)
    path: r.id                // store turns into "<id>.mp3.encrypted"
  }))
}))

async function fetchSongs () {
  loading.value = true
  error.value = ''
  try {
    const { data } = await apiClient.get('/api/songs', {
      params: { query: query.value || null, page: page.value, limit: limit.value }
    })
    songs.value = data?.items ?? []
    total.value = Number(data?.total ?? songs.value.length)

    // keep the artist’s tracklist in sync for next/prev
    if (
      songStore.currentTrack &&
      !artist.value.tracks.some(t => t.id === songStore.currentTrack.id)
    ) {
      // if current track fell off the page due to filtering, we keep playing;
      // next/prev will still work if the track is in currentArtist.tracks.
      // Optionally: you could rebind currentArtist to `artist.value` here.
    }
  } catch (e) {
    console.error(e)
    error.value = 'Failed to load songs.'
    songs.value = []
  } finally {
    loading.value = false
  }
}

function askDelete (row) {
  target.value = row
  showConfirm.value = true
}

async function doDelete () {
  const id = target.value?.id
  showConfirm.value = false
  if (!id) return

  const rollback = songs.value.slice()
  songs.value = songs.value.filter(s => s.id !== id)
  try {
    await apiClient.delete(`/api/songs/${id}`)
    success.value = 'Song deleted.'
    total.value = Math.max(0, total.value - 1)
    if (songs.value.length === 0 && page.value > 1) {
      page.value -= 1
      await fetchSongs()
    }
    // stop the player if the deleted one is currently playing
    if (songStore.currentTrack?.id === id) {
      songStore.stop()
      songStore.resetState()
    }
  } catch (e) {
    console.error(e)
    error.value = 'Delete failed.'
    songs.value = rollback
  } finally {
    target.value = null
  }
}

function fmtTime (sec) {
  if (sec === null || sec === undefined || Number.isNaN(sec)) return '—'
  const m = Math.floor(sec / 60); const s = Math.floor(sec % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

// ── Player wiring ──────────────────────────────────────────────────────────────

// Play/Pause the row’s song using your store + encrypted file flow
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
function prevGlobal () { songStore.prevSong() }
function nextGlobal () { songStore.nextSong() }
function togglePlayPause () { songStore.playOrPauseSong() }

// search & pagination reactions
let debounce
watch([query, limit], () => {
  clearTimeout(debounce)
  debounce = setTimeout(() => { page.value = 1; fetchSongs() }, 250)
})
watch(page, fetchSongs)

onMounted(fetchSongs)
</script>

<template>
  <div class="p-6 text-white">
    <div class="mb-5 flex items-center justify-between">
      <h1 class="text-2xl font-semibold">Songs</h1>

     

      <!-- Search & page size -->
      <div class="flex items-center gap-2">
        <input
          v-model.trim="query"
          type="text"
          placeholder="Search title…"
          class="w-72 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 outline-none"
        />
        <select v-model="limit" class="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2">
          <option :value="10">10</option>
          <option :value="20">20</option>
          <option :value="50">50</option>
          <option :value="100">100</option>
        </select>
      </div>
    </div>

    <div v-if="error" class="mb-4 rounded-lg border border-red-700 bg-red-950 px-4 py-3 text-red-200">
      {{ error }}
    </div>
    <div v-if="success" class="mb-4 rounded-lg border border-emerald-700 bg-emerald-950 px-4 py-3 text-emerald-200">
      {{ success }}
    </div>

    <!-- Table -->
    <div class="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900">
      <table class="w-full text-sm">
        <thead class="bg-zinc-800/60 text-zinc-300">
          <tr>
            <th class="px-4 py-3 text-left">Title</th>
            <th class="px-4 py-3 text-left">Album</th>
            <th class="px-4 py-3 text-left">Genre</th>
            <th class="px-4 py-3 text-left">Mood</th>
            <th class="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="5" class="px-4 py-6 text-center text-zinc-400">Loading…</td>
          </tr>

          <tr
            v-for="s in songs"
            :key="s.id"
            class="border-t border-zinc-800 hover:bg-zinc-800/40"
          >
            <td class="px-4 py-3">
              <div class="font-medium">{{ s.title }}</div>
              <div class="text-xs text-zinc-400">
                {{ s.artist_name  }}
              </div>
            </td>
            <td class="px-4 py-3">{{ s.album_name ?? '—' }}</td>
            <td class="px-4 py-3">{{ s.genre || '—' }}</td>
            <td class="px-4 py-3">{{ s.mood || '—' }}</td>
            <td class="px-4 py-3 text-right">
              <div class="flex items-center justify-end gap-2">
                <button
                  class="rounded-lg bg-zinc-700 px-3 py-1.5 hover:bg-zinc-600 disabled:opacity-50"
                  :disabled="!s.encryption_key"
                  :title="s.encryption_key ? 'Play/Pause' : 'Missing encryption key'"
                  @click="playRow(s)"
                >
                  {{ songStore.currentTrack?.id === s.id && songStore.isPlaying ? 'Pause' : 'Play' }}
                </button>
                <button
                  class="rounded-lg bg-red-600 px-3 py-1.5 hover:bg-red-500"
                  @click="askDelete(s)"
                >
                  Delete
                </button>
              </div>

              <!-- Inline progress while downloading/decrypting this exact row -->
              <div
                v-if="songStore.currentTrack?.id === s.id && songStore.isBuffering"
                class="mt-2 text-xs text-zinc-400"
              >
                Buffering… {{ songStore.downloadProgress }}%
              </div>
            </td>
          </tr>

          <tr v-if="!loading && songs.length === 0">
            <td colspan="5" class="px-4 py-6 text-center text-zinc-400">No songs found.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div class="mt-4 flex items-center justify-between">
      <div class="text-xs text-zinc-400">Page {{ page }} / {{ totalPages }}</div>
      <div class="flex gap-2">
        <button class="rounded bg-zinc-800 px-3 py-1.5 disabled:opacity-50" :disabled="page<=1" @click="page--">Prev</button>
        <button class="rounded bg-zinc-800 px-3 py-1.5 disabled:opacity-50" :disabled="page>=totalPages" @click="page++">Next</button>
      </div>
    </div>

    <ConfirmDialog
      :open="showConfirm"
      title="Delete song?"
      :message="target ? `This will remove '${target.title}'.` : ''"
      @cancel="showConfirm = false"
      @confirm="doDelete"
    />

    <!-- Docked player UI (reads from the same Pinia store) -->
    <div class="fixed left-0 right-0 bottom-0 z-50 border-t border-zinc-800 bg-zinc-900 md:left-60">
      <MusicPlayer />
    </div>
  </div>
</template>

<style scoped>
table { border-collapse: collapse; }
</style>
