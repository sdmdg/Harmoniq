<template>
  <div class="p-6">
    <h1 class="text-xl font-semibold text-white mb-4">Reports</h1>

    <!-- Filters -->
    <div class="mb-5 grid grid-cols-1 md:grid-cols-3 gap-3">
      <input
        v-model.trim="q"
        placeholder="Search description or reporter…"
        class="rounded-xl bg-neutral-800 border border-neutral-700 px-3 py-2 text-neutral-100"
      />

      <select
        v-model="filter.category"
        class="rounded-xl bg-neutral-800 border border-neutral-700 px-3 py-2 text-neutral-100"
      >
        <option value="">All categories</option>
        <option v-for="c in categories" :key="c" :value="c">{{ c }}</option>
      </select>

      <select
        v-model="filter.status"
        class="rounded-xl bg-neutral-800 border border-neutral-700 px-3 py-2 text-neutral-100"
      >
        <option value="">All statuses</option>
        <option v-for="s in STATUSES" :key="s" :value="s">{{ labelStatus(s) }}</option>
      </select>
    </div>

    <!-- Cards -->
    <div v-if="!loading && paged.length" class="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
      <article
        v-for="r in paged"
        :key="r.id"
        class="rounded-2xl border border-neutral-800 bg-neutral-900 p-4 flex flex-col gap-4"
      >
        <!-- Top -->
        <header class="flex items-start justify-between gap-4">
          <div class="min-w-0">
            <div class="text-xs text-neutral-400">{{ formatDate(r.created_at) }}</div>
            <div class="text-neutral-100 font-medium truncate">{{ r.reporter_name || 'Unknown' }}</div>
            <div class="text-xs text-neutral-500 truncate">{{ r.reporter_email || '—' }}</div>
          </div>
          <div class="flex flex-col items-end gap-2 shrink-0">
            <span class="text-xs px-2 py-1 rounded-lg bg-neutral-800 text-neutral-300">
              {{ r.category }}
            </span>
            <span :class="badgeClass(r.status)">{{ labelStatus(r.status) }}</span>
          </div>
        </header>

        <!-- Quick meta -->
        <div class="flex flex-wrap items-center gap-2 text-xs text-neutral-400">
          <span class="px-2 py-1 rounded-lg bg-neutral-800 text-neutral-300">
            Issue: <span class="text-neutral-100">{{ r.issue_type }}</span>
          </span>
          <span class="px-2 py-1 rounded-lg bg-neutral-800 text-neutral-300">
            ID: <span class="text-neutral-100">{{ r.id }}</span>
          </span>
        </div>

        <!-- Bottom actions -->
        <footer class="flex items-center justify-between gap-3 pt-2 border-t border-neutral-800">
          <button
            class="px-3 py-1.5 rounded-lg bg-neutral-800 text-neutral-100 hover:bg-neutral-700 text-sm"
            @click="openReport(r)"
          >
            View
          </button>

          <div class="flex items-center gap-2">
            <select
              v-model="statusDraft[r.id]"
              class="rounded-lg bg-neutral-800 border border-neutral-700 px-2 py-1 text-xs text-neutral-100"
            >
              <option disabled value="">Change status…</option>
              <option v-for="s in STATUSES" :key="s" :value="s">{{ labelStatus(s) }}</option>
            </select>

            <button
              class="text-xs px-2 py-1 rounded-lg bg-green-600 text-white disabled:opacity-50"
              :disabled="!statusDraft[r.id] || statusDraft[r.id] === r.status || saving[r.id]"
              @click="updateStatus(r)"
            >
              {{ saving[r.id] ? 'Saving…' : 'Save' }}
            </button>
          </div>
        </footer>
      </article>
    </div>

    <!-- Loading / empty -->
    <div v-if="loading" class="text-neutral-400">Loading…</div>
    <div v-else-if="!paged.length" class="text-neutral-400">No reports found.</div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="mt-5 flex items-center gap-3">
      <button class="px-3 py-1 rounded-lg bg-neutral-800 disabled:opacity-50"
              :disabled="page===1" @click="page--">Prev</button>
      <div class="text-neutral-400 text-sm">Page {{ page }} / {{ totalPages }}</div>
      <button class="px-3 py-1 rounded-lg bg-neutral-800 disabled:opacity-50"
              :disabled="page===totalPages" @click="page++">Next</button>
    </div>

    <!-- MODAL -->
    <transition name="fade">
      <div
        v-if="showModal"
        class="fixed inset-0 z-50 flex items-center justify-center"
        @keydown.esc="closeModal"
      >
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/70" @click="closeModal"></div>

        <!-- Dialog -->
        <div
          class="relative z-10 w-[92vw] max-w-3xl rounded-2xl bg-neutral-900 border border-neutral-700 p-5 shadow-xl"
          role="dialog" aria-modal="true" aria-label="Report details"
        >
          <!-- Header -->
          <header class="flex items-start justify-between mb-4">
            <div class="min-w-0">
              <h2 class="text-lg font-semibold text-neutral-100">Report details</h2>
              <div class="text-xs text-neutral-400">
                Created: <span class="text-neutral-300">{{ formatDate(active.created_at) }}</span>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <span :class="badgeClass(active.status)">{{ labelStatus(active.status) }}</span>
              <button
                class="p-1 rounded-lg bg-neutral-800 hover:bg-neutral-700"
                @click="closeModal" aria-label="Close"
              >✕</button>
            </div>
          </header>

          <!-- Summary grid -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            <div class="rounded-xl bg-neutral-800/40 border border-neutral-800 p-3">
              <div class="text-[11px] text-neutral-400 mb-0.5">Reporter</div>
              <div class="text-neutral-100 truncate">{{ active.reporter_name || 'Unknown' }}</div>
            </div>

            <div class="rounded-xl bg-neutral-800/40 border border-neutral-800 p-3">
              <div class="text-[11px] text-neutral-400 mb-0.5">Email</div>
              <a
                :href="active.reporter_email ? `mailto:${active.reporter_email}` : '#'"
                class="text-neutral-100 underline decoration-neutral-600 hover:decoration-neutral-300 truncate"
              >{{ active.reporter_email || '—' }}</a>
            </div>

            <div class="rounded-xl bg-neutral-800/40 border border-neutral-800 p-3">
              <div class="text-[11px] text-neutral-400 mb-0.5">Report ID</div>
              <div class="text-neutral-100 truncate">{{ active.id }}</div>
            </div>

            <div class="rounded-xl bg-neutral-800/40 border border-neutral-800 p-3">
              <div class="text-[11px] text-neutral-400 mb-0.5">Category</div>
              <div class="text-neutral-100">{{ active.category }}</div>
            </div>

            <div class="rounded-xl bg-neutral-800/40 border border-neutral-800 p-3">
              <div class="text-[11px] text-neutral-400 mb-0.5">Issue type</div>
              <div class="text-neutral-100">{{ active.issue_type }}</div>
            </div>

            <div class="rounded-xl bg-neutral-800/40 border border-neutral-800 p-3">
              <div class="text-[11px] text-neutral-400 mb-0.5">Current status</div>
              <div class="text-neutral-100">{{ labelStatus(active.status) }}</div>
            </div>
          </div>

          <!-- Description -->
          <div class="mb-4">
            <div class="text-xs text-neutral-400 mb-1">Description</div>
            <div
              class="rounded-xl border border-neutral-800 bg-neutral-950 p-3 max-h-64 overflow-auto text-neutral-100 whitespace-pre-wrap"
            >
              {{ active.description || '—' }}
            </div>
          </div>

          <!-- Actions -->
          <div class="flex items-center justify-end gap-2">
            <select
              v-model="statusDraft[active.id]"
              class="rounded-lg bg-neutral-800 border border-neutral-700 px-3 py-2 text-sm text-neutral-100"
            >
              <option v-for="s in STATUSES" :key="s" :value="s">{{ labelStatus(s) }}</option>
            </select>
            <button
              class="px-3 py-2 rounded-lg bg-green-600 text-white disabled:opacity-50"
              :disabled="statusDraft[active.id] === active.status || saving[active.id]"
              @click="updateStatus(active)"
            >
              {{ saving[active.id] ? 'Saving…' : 'Save status' }}
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, defineComponent } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/utils/axios.js'

/** Small presentational row used in the modal */
const InfoRow = defineComponent({
  name: 'InfoRow',
  props: { label: String, value: [String, Number] },
  template: `
    <div class="rounded-xl bg-neutral-800/40 border border-neutral-800 p-3">
      <div class="text-[11px] text-neutral-400 mb-0.5">{{ label }}</div>
      <div class="text-neutral-100 truncate"><slot name="value">{{ value }}</slot></div>
    </div>
  `
})

const loading = ref(false)
const rows = ref([])
const q = ref('')

const filter = ref({ category: '', status: '' })
const categories = ['Content Issues', 'User & Safety', 'Technical Issues']

// ✅ Include 'pending'
const STATUSES = ['pending', 'in_progress', 'rejected', 'completed']

// Router (for deep-link open/close)
const route = useRoute()
const router = useRouter()

// Fetch
onMounted(async () => {
  await fetchReports()
  const idToOpen = route.query.open
  if (idToOpen) await openReportById(idToOpen)
})

async function fetchReports () {
  loading.value = true
  try {
    const { data } = await api.get('/api/reports')
    rows.value = Array.isArray(data) ? data : []

    // ✅ Normalize: if DB returns null/empty, treat as 'pending'
    for (const r of rows.value) {
      r.status = r.status || 'pending'
      statusDraft.value[r.id] = r.status
    }
  } catch (e) {
    console.error('fetchReports error', e)
  } finally {
    loading.value = false
  }
}

// Deep-link open helper: find in list, else fetch single
async function openReportById (id) {
  if (!id) return
  let r = Array.isArray(rows.value)
    ? rows.value.find(x => String(x.id) === String(id))
    : null

  if (!r) {
    try {
      const { data } = await api.get(`/api/reports/${id}`)
      r = data
    } catch (e) {
      console.error('openReportById fetch failed', e)
      return
    }
  }
  openReport(r)
}

// react if ?open= changes while staying on page
watch(() => route.query.open, async (newId, oldId) => {
  if (newId && newId !== oldId) {
    await openReportById(newId)
  } else if (!newId && showModal.value) {
    closeModal()
  }
})

// Search + filter + pagination
const page = ref(1)
const pageSize = 9
watch([q, filter], () => { page.value = 1 })

const filtered = computed(() => {
  const term = q.value.toLowerCase()
  return rows.value.filter(r => {
    if (filter.value.category && r.category !== filter.value.category) return false
    if (filter.value.status && r.status !== filter.value.status) return false
    if (term) {
      const hay = `${r.description} ${r.reporter_name ?? ''} ${r.reporter_email ?? ''}`.toLowerCase()
      if (!hay.includes(term)) return false
    }
    return true
  })
})

const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / pageSize)))
const paged = computed(() => {
  const start = (page.value - 1) * pageSize
  return filtered.value.slice(start, start + pageSize)
})

// Status update flow
const statusDraft = ref({})   // { [id]: status|string }
const saving = ref({})

async function updateStatus (r) {
  const newStatus = statusDraft.value[r.id]
  if (!newStatus || newStatus === r.status) return
  saving.value[r.id] = true
  try {
    await api.put(`/api/reports/${r.id}/status`, { status: newStatus })
    r.status = newStatus
    statusDraft.value[r.id] = newStatus // keep select in sync
  } catch (e) {
    console.error('updateStatus error', e)
    statusDraft.value[r.id] = r.status // revert
    alert(e?.response?.data?.message || 'Failed to update status')
  } finally {
    saving.value[r.id] = false
  }
}

// Modal state
const showModal = ref(false)
const active = ref(null)

function openReport (r) {
  active.value = r
  if (statusDraft.value[r.id] === undefined) {
    statusDraft.value[r.id] = r.status || 'pending'
  }
  showModal.value = true
  // reflect selection in URL so /reports?open=<id> survives refresh/share
  router.replace({ path: route.path, query: { open: r.id } })
}

function closeModal () {
  showModal.value = false
  active.value = null
  // clear the query so it doesn't re-open on refresh
  router.replace({ path: route.path, query: {} })
}

// UI helpers
function formatDate (iso) { try { return new Date(iso).toLocaleString() } catch { return iso } }
function labelStatus (s) {
  if (s === 'pending')     return 'Pending'
  if (s === 'in_progress') return 'In progress'
  if (s === 'rejected')    return 'Rejected'
  if (s === 'completed')   return 'Completed'
  return s
}
function badgeClass (status) {
  const base = 'px-2 py-1 rounded-lg text-xs'
  if (status === 'completed')   return `${base} bg-green-900/40 text-green-300`
  if (status === 'in_progress') return `${base} bg-yellow-900/40 text-yellow-300`
  if (status === 'rejected')    return `${base} bg-red-900/40 text-red-300`
  if (status === 'pending')     return `${base} bg-neutral-800 text-neutral-300`
  return `${base} bg-neutral-800 text-neutral-300`
}
</script>

<style>
.fade-enter-active, .fade-leave-active { transition: opacity .15s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
