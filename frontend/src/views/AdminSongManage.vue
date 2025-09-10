<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import apiClient from '@/utils/axios'

const query = ref('')
const page = ref(1)
const limit = ref(10)
const total = ref(0)
const songs = ref([])
const loading = ref(false)
const error = ref('')
const success = ref('')

const showConfirm = ref(false)
const target = ref(null)

const totalPages = computed(() => Math.max(1, Math.ceil(total.value / limit.value)))

// player state
const isPlayerOpen = ref(false)
const current = ref(null)
const src = ref('')
const audioEl = ref(null)

const FILE_SERVER = import.meta.env.VITE_FILE_SERVER 

async function fetchSongs() {
  loading.value = true
  error.value = ''
  try {
    const { data } = await apiClient.get('/api/songs', {
      params: { query: query.value || null, page: page.value, limit: limit.value }
    })
    songs.value = data?.items ?? []
    total.value = data?.total ?? songs.value.length
  } catch (e) {
    console.error(e)
    error.value = 'Failed to load songs.'
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
    success.value = 'Song deleted.'
    total.value = Math.max(0, total.value - 1)
    if (songs.value.length === 0 && page.value > 1) {
      page.value -= 1
      await fetchSongs()
    }
    if (current.value && current.value.id === id) stopPlayer()
  } catch (e) {
    console.error(e)
    error.value = 'Delete failed.'
    songs.value = rollback
  } finally {
    target.value = null
  }
}

function fmtTime(sec) {
  if (sec === null || sec === undefined) return '—'
  const m = Math.floor(sec / 60), s = Math.floor(sec % 60)
  return `${m}:${String(s).padStart(2,'0')}`
}


function songUrlById(id) {
  // files are stored as <uuid>.mp3 under /public/songs/
  return `${FILE_SERVER}/public/songs/${encodeURIComponent(id)}.mp3`
}

async function playSong(row) {
  current.value = row
  src.value = songUrlById(row.id)
  isPlayerOpen.value = true

  
  await nextTick()
  try {
    audioEl.value?.load()
    await audioEl.value?.play()
  } catch (e) {
   
    console.debug('Playback will start on user interaction', e)
  }
}

function stopPlayer() {
  try { audioEl.value?.pause() } catch {}
  isPlayerOpen.value = false
  src.value = ''
  current.value = null
}

// debounce search
let t
watch([query, limit], () => {
  clearTimeout(t)
  t = setTimeout(() => { page.value = 1; fetchSongs() }, 250)
})
watch(page, fetchSongs)

onMounted(fetchSongs)
</script>

<template>
  <div class="p-6 text-white">
    <div class="mb-5 flex items-center justify-between">
      <h1 class="text-2xl font-semibold">Songs</h1>
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
            <td colspan="4" class="px-4 py-6 text-center text-zinc-400">Loading…</td>
          </tr>
          <tr v-for="s in songs" :key="s.id" class="border-t border-zinc-800">
            <td class="px-4 py-3">{{ s.title }}</td>
            <td class="px-4 py-3">{{ s.album_name ?? '—' }}</td>
             <td class="px-4 py-3">{{ s.genre }}</td>  <!-- new -->
        <td class="px-4 py-3">{{ s.mood }}</td>  
            <td class="px-4 py-3 text-right">
              <div class="flex items-center justify-end gap-2">
                <button class="rounded-lg bg-zinc-700 px-3 py-1.5 hover:bg-zinc-600" @click="playSong(s)">
                  Play
                </button>
                <button class="rounded-lg bg-red-600 px-3 py-1.5 hover:bg-red-500" @click="askDelete(s)">
                  Delete
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="!loading && songs.length === 0">
            <td colspan="4" class="px-4 py-6 text-center text-zinc-400">No songs found.</td>
          </tr>
        </tbody>
      </table>
    </div>

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

    
    <div  v-if="isPlayerOpen"
  class="fixed bottom-0 right-0 z-50 border-t border-zinc-800 bg-zinc-900 md:left-60 left-0">
      <div class="flex items-center gap-4 px-4 py-3">
        <div class="min-w-0">
          <div class="truncate font-medium">{{ current && current.title }}</div>
          <div class="truncate text-xs text-zinc-400">{{ current && current.artist_name }}</div>
        </div>
        <audio ref="audioEl" :src="src" controls class="w-full"></audio>
        <button class="rounded bg-zinc-800 px-3 py-1.5" @click="stopPlayer">Close</button>
      </div>
    </div>
  </div>
</template>
