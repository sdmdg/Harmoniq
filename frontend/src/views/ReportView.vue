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

      <!-- Category filter -->
      <select
        v-model="filter.category"
        class="rounded-xl bg-neutral-800 border border-neutral-700 px-3 py-2 text-neutral-100"
      >
        <option value="">All categories</option>
        <option v-for="c in categories" :key="c" :value="c">{{ c }}</option>
      </select>

      <!-- Status filter -->
      <select
        v-model="filter.status"
        class="rounded-xl bg-neutral-800 border border-neutral-700 px-3 py-2 text-neutral-100"
      >
        <option value="">All statuses</option>
        <option v-for="s in STATUSES" :key="s" :value="s">{{ labelStatus(s) }}</option>
      </select>
    </div>

    <!-- Card grid -->
    <div
      v-if="!loading && paged.length"
      class="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
    >
      <article
        v-for="r in paged"
        :key="r.id"
        class="rounded-2xl border border-neutral-800 bg-neutral-900 p-4 flex flex-col gap-3"
      >
        <header class="flex items-start justify-between gap-2">
          <div>
            <div class="text-sm text-neutral-400">{{ formatDate(r.created_at) }}</div>
            <div class="text-neutral-100 font-medium">
              {{ r.reporter_name || 'Unknown' }}
            </div>
            <div class="text-xs text-neutral-500">{{ r.reporter_email || '—' }}</div>
          </div>

          <div class="flex flex-col items-end gap-2">
            <span class="text-xs px-2 py-1 rounded-lg bg-neutral-800 text-neutral-300">
              {{ r.category }}
            </span>
            <span :class="badgeClass(r.status)">{{ labelStatus(r.status) }}</span>
          </div>
        </header>

        <div class="text-neutral-200 whitespace-pre-wrap">
          {{ r.description }}
        </div>

        <footer class="flex items-center justify-between gap-2 pt-2 border-t border-neutral-800">
          <div class="text-xs text-neutral-400">
            Issue type: <span class="text-neutral-200">{{ r.issue_type }}</span>
          </div>

          <!-- Optional: inline status update -->
          <div class="flex items-center gap-2">
            <select
              v-model="statusDraft[r.id]"
              class="rounded-lg bg-neutral-800 border border-neutral-700 px-2 py-1 text-xs text-neutral-100"
            >
              <option v-for="s in STATUSES" :key="s" :value="s">{{ labelStatus(s) }}</option>
            </select>
            <button
              class="text-xs px-2 py-1 rounded-lg bg-green-600 text-white disabled:opacity-50"
              :disabled="statusDraft[r.id] === r.status || saving[r.id]"
              @click="updateStatus(r)"
            >
              {{ saving[r.id] ? 'Saving…' : 'Save' }}
            </button>
          </div>
        </footer>
      </article>
    </div>

    <!-- Empty / loading states -->
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import api from '@/utils/axios.js'

const loading = ref(false)
const rows = ref([])
const q = ref('')

// Filters
const filter = ref({ category: '', status: '' })

// Taxonomy (same list you use when submitting a report)
const categories = ['Content Issues', 'User & Safety', 'Technical Issues']

// New status set
const STATUSES = ['in_progress', 'rejected', 'completed']

onMounted(fetchReports)
async function fetchReports () {
  loading.value = true
  try {
    const { data } = await api.get('/api/reports')
    rows.value = Array.isArray(data) ? data : []
    // init status draft
    for (const r of rows.value) statusDraft.value[r.id] = r.status
  } catch (e) {
    console.error('fetchReports error', e)
  } finally {
    loading.value = false
  }
}

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
      const hay =
        `${r.description} ${r.reporter_name ?? ''} ${r.reporter_email ?? ''}`.toLowerCase()
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

// Inline status update
const statusDraft = ref({})
const saving = ref({})

async function updateStatus (r) {
  const newStatus = statusDraft.value[r.id]
  if (!newStatus || newStatus === r.status) return
  saving.value[r.id] = true
  try {
    await api.put(`/api/reports/${r.id}/status`, { status: newStatus })
    r.status = newStatus
  } catch (e) {
    console.error('updateStatus error', e)
    // revert draft
    statusDraft.value[r.id] = r.status
    alert(e?.response?.data?.message || 'Failed to update status')
  } finally {
    saving.value[r.id] = false
  }
}

// UI helpers
function formatDate (iso) { try { return new Date(iso).toLocaleString() } catch { return iso } }
function labelStatus (s) {
  if (s === 'in_progress') return 'In progress'
  if (s === 'rejected') return 'Rejected'
  if (s === 'completed') return 'Completed'
  return s
}
function badgeClass (status) {
  const base = 'px-2 py-1 rounded-lg text-xs'
  if (status === 'completed')  return `${base} bg-green-900/40 text-green-300`
  if (status === 'in_progress')return `${base} bg-yellow-900/40 text-yellow-300`
  if (status === 'rejected')   return `${base} bg-red-900/40 text-red-300`
  return `${base} bg-neutral-800 text-neutral-300`
}
</script>
