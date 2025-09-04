<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import apiClient from '../utils/axios'

const props = defineProps({ initialLimit: { type: Number, default: 10 } })

const router = useRouter()
const activities = ref([])
const loading = ref(false)
const err = ref('')

const range = ref('today')
const ALL_TYPES = ['user_signup','artist_added','song_upload','playlist_created','report_submitted']
const selectedType = ref('')
const searchText = ref('')
const limit = ref(props.initialLimit)
const offset = ref(0)
const hasMore = ref(false)

function setType(t){ selectedType.value = (selectedType.value === t ? '' : t); load(true) }
function setRange(val){ range.value = val; load(true) }

async function load(reset=false){
  if(reset){ offset.value=0; activities.value=[] }
  loading.value = true; err.value = ''
  try{
    const { data } = await apiClient.get('/api/admin/activity', {
      params: {
        range: range.value || undefined,
        types: selectedType.value || undefined,
        q:     searchText.value || undefined,
        limit: limit.value,
        offset: offset.value
      }
    })
    activities.value = reset ? data : [...activities.value, ...data]
    hasMore.value = data.length === limit.value
    if(hasMore.value) offset.value += limit.value
  }catch(e){
    err.value = e?.response?.data?.message || 'Failed to load activity'
  }finally{
    loading.value = false
  }
}
async function goToEntity(a) {
  const id = String(a?.entity_id ?? '')
  const type = a?.target_type
  console.log('[goToEntity] click', { id, type, a })

  if (!id || !type) {
    console.warn('[goToEntity] Missing id/type', a)
    return
  }

  let path = null
  if (type === 'artist')   path = `/artist/${id}`
  else if (type === 'album')    path = `/album/${id}`
  else if (type === 'playlist') path = `/playlist/${id}`
  else if (type === 'report')   path = `/reports/${id}`
  else if (type === 'user')     path = `/usersignup/${id}`
  else if (type === 'song')     console.warn('[goToEntity] No /song/:id route yet')
  else console.warn('[goToEntity] No matching route for', type)

  if (!path) return

  try {
    console.log('[goToEntity] navigating to', path)
    await router.push(path)
    console.log('[goToEntity] done')
  } catch (e) {
    console.error('[goToEntity] navigation error', e)
  }
}


function manageReport(a){
  router.push({ name: 'report-detail', params: { id: a.entity_id } })
}

onMounted(()=>load(true))
</script>

<template>
  <div class="bg-[#181818] p-6 rounded-lg shadow-md">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-xl font-bold text-white">Recent Activity</h2>

      <div class="flex items-center gap-2">
        <!-- Time filter (single-select) -->
        <div class="bg-neutral-900 border border-neutral-800 rounded-lg p-1 flex">
          <button class="px-3 py-1 rounded-md text-sm"
                  :class="range==='today' ? 'bg-neutral-800 text-white' : 'text-gray-300'"
                  @click="setRange('today')">Today</button>
          <button class="px-3 py-1 rounded-md text-sm"
                  :class="range==='7d' ? 'bg-neutral-800 text-white' : 'text-gray-300'"
                  @click="setRange('7d')">7d</button>
          <button class="px-3 py-1 rounded-md text-sm"
                  :class="range==='30d' ? 'bg-neutral-800 text-white' : 'text-gray-300'"
                  @click="setRange('30d')">30d</button>
          <button class="px-3 py-1 rounded-md text-sm"
                  :class="range==='' ? 'bg-neutral-800 text-white' : 'text-gray-300'"
                  @click="setRange('')">All</button>
        </div>

        <!-- Search -->
        <input v-model.trim="searchText"
               @keyup.enter="load(true)"
               placeholder="Search name…"
               class="bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-gray-200 w-48 outline-none" />
        <button class="px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-sm"
                @click="load(true)">
          Search
        </button>
      </div>
    </div>

    <!-- Type chips (SINGLE-SELECT + All) -->
    <div class="flex flex-wrap gap-2 mb-4">
      <button
        class="px-3 py-1 rounded-full text-xs border"
        :class="selectedType === '' 
                ? 'bg-green-600 border-green-500 text-black' 
                : 'bg-neutral-900 border-neutral-700 text-gray-300'"
        @click="setType('')">
        All
      </button>

      <button v-for="t in ALL_TYPES" :key="t"
              class="px-3 py-1 rounded-full text-xs border"
              :class="selectedType === t
                      ? 'bg-green-600 border-green-500 text-black'
                      : 'bg-neutral-900 border-neutral-700 text-gray-300'"
              @click="setType(t)">
        {{ t.replaceAll('_',' ') }}
      </button>
    </div>

    <!-- Content -->
    <div v-if="loading" class="text-gray-400">Loading…</div>
    <div v-else-if="err" class="text-red-400">{{ err }}</div>

    <ul v-else class="space-y-3">
      <li v-for="a in activities" :key="`${a.type}-${a.entity_id}-${a.created_at}`"
          class="flex items-start gap-3 p-3 rounded-lg bg-neutral-900 border border-neutral-800">
        <span class="mt-1 inline-block h-2.5 w-2.5 rounded-full"
              :class="{
                'bg-green-500': a.type==='user_signup' || a.type==='playlist_created',
                'bg-blue-500' : a.type==='song_upload' || a.type==='artist_added',
                'bg-yellow-500': a.type==='report_submitted',
                // 'bg-purple-500': a.type==='report_status_changed'
              }"></span>

        <div class="flex-1">
          <div class="text-sm text-white">
            <strong class="capitalize">{{ a.type.replaceAll('_',' ') }}</strong>
            <span class="text-gray-300"> — {{ a.title }}</span>
            <span v-if="a.status" class="ml-2 text-xs px-2 py-0.5 rounded bg-neutral-800 border border-neutral-700">{{ a.status }}</span>
          </div>
          <div class="text-xs text-gray-400 mt-1">
            {{ new Date(a.created_at).toLocaleString() }}
          </div>
        </div>

        <div class="flex items-center gap-2">
        <button
  type="button"
  class="px-3 py-1 bg-green-600 rounded-lg text-white"
  @click="goToEntity(a)"
>
  View
</button>
          <button v-if="a.type==='report_submitted' || a.type==='report_status_changed'"
                  class="text-xs px-2 py-1 bg-neutral-800 rounded border border-neutral-700 hover:bg-neutral-700"
                  @click="manageReport(a)">Manage</button>
        </div>
      </li>
    </ul>

    <div class="mt-4">
      <button v-if="hasMore && !loading"
              class="px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg"
              @click="load(false)">
        Load more
      </button>
    </div>
  </div>
</template>
