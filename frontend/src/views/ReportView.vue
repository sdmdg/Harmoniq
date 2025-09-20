<template>
  <div class="p-6 bg-black min-h-screen">
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-green-400 mb-2">Report Management</h1>
      <p class="text-gray-400">Monitor and manage user reports on your platform</p>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div class="bg-gray-800/50 rounded-xl p-4 border border-slate-700">
        <div class="text-gray-400 text-sm mb-1">Total Reports</div>
        <div class="text-2xl font-bold text-white">{{ totalReports }}</div>
      </div>
      <div class="bg-gray-800/50 rounded-xl p-4 border border-slate-700">
        <div class="text-gray-400 text-sm mb-1">Pending</div>
        <div class="text-2xl font-bold text-yellow-400">{{ pendingReports }}</div>
      </div>
      <div class="bg-gray-800/50 rounded-xl p-4 border border-slate-700">
        <div class="text-gray-400 text-sm mb-1">In Progress</div>
        <div class="text-2xl font-bold text-blue-400">{{ inProgressReports }}</div>
      </div>
      <div class="bg-gray-800/50 rounded-xl p-4 border border-slate-700">
        <div class="text-gray-400 text-sm mb-1">Completed</div>
        <div class="text-2xl font-bold text-green-400">{{ completedReports }}</div>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-black rounded-xl p-4 border border-slate-700 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="relative">
          <input
            v-model.trim="q"
            placeholder="Search description or reporter..."
            class="w-full rounded-lg bg-gray-800/50 border border-slate-600 px-4 py-2 text-white placeholder-gray-400 focus:border-green-400 focus:outline-none"
          />
          <svg class="absolute right-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <select
          v-model="filter.category"
          class="rounded-lg bg-gray-800/50 border border-slate-600 px-4 py-2 text-white focus:border-green-400 focus:outline-none"
        >
          <option value="">All Categories</option>
          <option v-for="c in categories" :key="c" :value="c">{{ c }}</option>
        </select>

        <select
          v-model="filter.status"
          class="rounded-lg bg-gray-800/50 border border-slate-600 px-4 py-2 text-white focus:border-green-400 focus:outline-none"
        >
          <option value="">All Statuses</option>
          <option v-for="s in STATUSES" :key="s" :value="s">{{ labelStatus(s) }}</option>
        </select>
      </div>
    </div>

    <!-- Reports Grid -->
    <div v-if="!loading && paged.length" class="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
      <article
        v-for="r in paged"
        :key="r.id"
        class="bg-gray-800/50 rounded-xl border border-slate-700 p-4 hover:border-slate-600 transition-colors"
      >
        <!-- Header -->
        <header class="flex items-start justify-between gap-4 mb-4">
          <div class="min-w-0 flex-1">
            <div class="text-xs text-gray-400 mb-1">{{ formatDate(r.created_at) }}</div>
            <div class="text-white font-medium truncate">{{ r.reporter_name || 'Unknown User' }}</div>
            <div class="text-xs text-gray-500 truncate">{{ r.reporter_email || 'No email provided' }}</div>
          </div>
          <div class="flex flex-col items-end gap-2 shrink-0">
            <span class="text-xs px-2 py-1 rounded-lg bg-black text-gray-300 border border-green-500">
              {{ r.category }}
            </span>
            <span :class="badgeClass(r.status)">{{ labelStatus(r.status) }}</span>
          </div>
        </header>

        <!-- Issue Details -->
        <div class="mb-4">
          <div class="text-xs text-gray-400 mb-2">Issue Details</div>
          <div class="flex flex-wrap items-center gap-2 text-xs">
            <span class="px-2 py-1 rounded-lg bg-black text-gray-300 border border-slate-600">
              Type: {{ r.issue_type }}
            </span>
            <span class="px-2 py-1 rounded-lg bg-black text-gray-300 border border-slate-600">
              ID: #{{ r.id }}
            </span>
          </div>
        </div>

        <!-- Description Preview -->
        <!-- <div class="mb-4">
          <div class="text-xs text-gray-400 mb-1">Description</div>
          <div class="text-sm text-gray-300 line-clamp-2">
            {{ r.description || 'No description provided' }}
          </div>
        </div> -->

        <!-- Actions -->
        <footer class="flex items-center justify-between gap-3 pt-3 border-t border-slate-700">
          <button
            class="px-3 py-1.5 rounded-lg bg-green-700 text-white hover:bg-slate-600 text-sm border border-slate-600 transition-colors"
            @click="openReport(r)"
          >
            View Report
          </button>

          <div class="flex items-center gap-2">
            <select
              v-model="statusDraft[r.id]"
              class="rounded-lg bg-slate-900 border border-slate-600 px-2 py-1 text-xs text-white focus:border-green-400 focus:outline-none"
            >
              <option disabled value="">Change status...</option>
              <option v-for="s in STATUSES" :key="s" :value="s">{{ labelStatus(s) }}</option>
            </select>

            <button
              class="text-xs px-3 py-1.5 rounded-lg bg-green-600 text-white disabled:opacity-50 hover:bg-green-700 transition-colors"
              :disabled="!statusDraft[r.id] || statusDraft[r.id] === r.status || saving[r.id]"
              @click="updateStatus(r)"
            >
              {{ saving[r.id] ? 'Saving...' : 'Save' }}
            </button>
          </div>
        </footer>
      </article>
    </div>

    <!-- Loading / Empty States -->
    <div v-if="loading" class="text-center py-12">
      <div class="inline-flex items-center gap-2 text-gray-400">
        <svg class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Loading reports...
      </div>
    </div>
    
    <div v-else-if="!paged.length" class="text-center py-12">
      <div class="text-gray-400 mb-2">No reports found</div>
      <div class="text-sm text-gray-500">Try adjusting your search filters</div>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="flex items-center justify-center gap-4 mt-8">
      <button 
        class="px-4 py-2 rounded-lg bg-slate-800 text-white disabled:opacity-50 border border-slate-700 hover:bg-slate-700 transition-colors"
        :disabled="page === 1" 
        @click="page--"
      >
        Previous
      </button>
      <div class="text-gray-400 text-sm">
        Page {{ page }} of {{ totalPages }} ({{ filtered.length }} total)
      </div>
      <button 
        class="px-4 py-2 rounded-lg bg-slate-800 text-white disabled:opacity-50 border border-slate-700 hover:bg-slate-700 transition-colors"
        :disabled="page === totalPages" 
        @click="page++"
      >
        Next
      </button>
    </div>

    <!-- Modal -->
    <transition name="fade">
      <div
        v-if="showModal && active"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        @keydown.esc="closeModal"
      >
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/80" @click="closeModal"></div>

        <!-- Dialog -->
        <div
          class="relative z-10 w-full max-w-4xl rounded-xl bg-slate-900 border border-slate-700 shadow-2xl max-h-[90vh] overflow-hidden"
          role="dialog" 
          aria-modal="true" 
          aria-label="Report details"
        >
          <!-- Header -->
          <header class="flex items-start justify-between p-6 border-b border-slate-700">
            <div class="min-w-0">
              <h2 class="text-xl font-bold text-green-400 mb-1">Report Details</h2>
              <div class="text-sm text-gray-400">
                Submitted: <span class="text-gray-300">{{ formatDate(active.created_at) }}</span>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <span :class="badgeClass(active.status)">{{ labelStatus(active.status) }}</span>
              <button
                class="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-gray-400 hover:text-white transition-colors border border-slate-600"
                @click="closeModal" 
                aria-label="Close"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
          </header>

          <!-- Content -->
          <div class="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            <!-- Summary Grid -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              <div class="bg-slate-800 rounded-lg border border-slate-700 p-4">
                <div class="text-xs text-gray-400 mb-1">Reporter</div>
                <div class="text-white font-medium">{{ active.reporter_name || 'Unknown User' }}</div>
              </div>

              <div class="bg-slate-800 rounded-lg border border-slate-700 p-4">
                <div class="text-xs text-gray-400 mb-1">Email</div>
                <a
                  v-if="active.reporter_email"
                  :href="`mailto:${active.reporter_email}`"
                  class="text-green-400 hover:text-green-300 underline transition-colors"
                >
                  {{ active.reporter_email }}
                </a>
                <span v-else class="text-gray-500">Not provided</span>
              </div>

              <div class="bg-slate-800 rounded-lg border border-slate-700 p-4">
                <div class="text-xs text-gray-400 mb-1">Report ID</div>
                <div class="text-white font-mono">#{{ active.id }}</div>
              </div>

              <div class="bg-slate-800 rounded-lg border border-slate-700 p-4">
                <div class="text-xs text-gray-400 mb-1">Category</div>
                <div class="text-white">{{ active.category }}</div>
              </div>

              <div class="bg-slate-800 rounded-lg border border-slate-700 p-4">
                <div class="text-xs text-gray-400 mb-1">Issue Type</div>
                <div class="text-white">{{ active.issue_type }}</div>
              </div>

              <div class="bg-slate-800 rounded-lg border border-slate-700 p-4">
                <div class="text-xs text-gray-400 mb-1">Current Status</div>
                <span :class="badgeClass(active.status)">{{ labelStatus(active.status) }}</span>
              </div>
            </div>

            <!-- Description -->
            <div class="mb-6">
              <div class="text-sm text-gray-400 mb-2">Description</div>
              <div class="bg-slate-800 rounded-lg border border-slate-700 p-4 max-h-64 overflow-auto">
                <div class="text-white whitespace-pre-wrap">
                  {{ active.description || 'No description provided' }}
                </div>
              </div>
            </div>
          </div>

          <!-- Footer Actions -->
          <div class="flex items-center justify-end gap-3 p-6 border-t border-slate-700 bg-slate-800/50">
            <select
              v-model="statusDraft[active.id]"
              class="rounded-lg bg-slate-900 border border-slate-600 px-4 py-2 text-white focus:border-green-400 focus:outline-none"
            >
              <option v-for="s in STATUSES" :key="s" :value="s">{{ labelStatus(s) }}</option>
            </select>
            <button
              class="px-6 py-2 rounded-lg bg-green-600 text-white disabled:opacity-50 hover:bg-green-700 transition-colors font-medium"
              :disabled="statusDraft[active.id] === active.status || saving[active.id]"
              @click="updateStatus(active)"
            >
              {{ saving[active.id] ? 'Saving...' : 'Update Status' }}
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/utils/axios.js'

const categories = ['Content Issues', 'User & Safety', 'Technical Issues']
const STATUSES = ['pending', 'in_progress', 'rejected', 'completed']
const pageSize = 9

const loading = ref(false)
const rows = ref([])
const q = ref('')
const filter = ref({ category: '', status: '' })
const page = ref(1)
const statusDraft = ref({})
const saving = ref({})
const showModal = ref(false)
const active = ref(null)

const totalReports = computed(() => rows.value.length)
const pendingReports = computed(() => rows.value.filter(r => r.status === 'pending').length)
const inProgressReports = computed(() => rows.value.filter(r => r.status === 'in_progress').length)
const completedReports = computed(() => rows.value.filter(r => r.status === 'completed').length)

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

const fetchReports = async () => {
  loading.value = true
  try {
    const { data } = await api.get('/api/reports')
    rows.value = Array.isArray(data) ? data : []

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

const openReportById = async (id) => {
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

const updateStatus = async (r) => {
  const newStatus = statusDraft.value[r.id]
  if (!newStatus || newStatus === r.status) return
  saving.value[r.id] = true
  try {
    await api.put(`/api/reports/${r.id}/status`, { status: newStatus })
    r.status = newStatus
    statusDraft.value[r.id] = newStatus
  } catch (e) {
    console.error('updateStatus error', e)
    statusDraft.value[r.id] = r.status
    alert(e?.response?.data?.message || 'Failed to update status')
  } finally {
    saving.value[r.id] = false
  }
}

const openReport = (r) => {
  active.value = r
  if (statusDraft.value[r.id] === undefined) {
    statusDraft.value[r.id] = r.status || 'pending'
  }
  showModal.value = true
  router.replace({ path: route.path, query: { open: r.id } })
}

const closeModal = () => {
  showModal.value = false
  active.value = null
  router.replace({ path: route.path, query: {} })
}

const formatDate = (iso) => { 
  try { 
    return new Date(iso).toLocaleString() 
  } catch { 
    return iso 
  } 
}

const labelStatus = (s) => {
  if (s === 'pending') return 'Pending'
  if (s === 'in_progress') return 'In Progress'
  if (s === 'rejected') return 'Rejected'
  if (s === 'completed') return 'Completed'
  return s
}

const badgeClass = (status) => {
  const base = 'px-3 py-1 rounded-lg text-xs font-medium'
  if (status === 'completed') return `${base} bg-green-900/40 text-green-300 border border-green-800`
  if (status === 'in_progress') return `${base} bg-blue-900/40 text-blue-300 border border-blue-800`
  if (status === 'rejected') return `${base} bg-red-900/40 text-red-300 border border-red-800`
  if (status === 'pending') return `${base} bg-yellow-900/40 text-yellow-300 border border-yellow-800`
  return `${base} bg-slate-700 text-gray-300 border border-slate-600`
}

const route = useRoute()
const router = useRouter()

watch([q, filter], () => { page.value = 1 })

watch(() => route.query.open, async (newId, oldId) => {
  if (newId && newId !== oldId) {
    await openReportById(newId)
  } else if (!newId && showModal.value) {
    closeModal()
  }
})

onMounted(async () => {
  await fetchReports()
  const idToOpen = route.query.open
  if (idToOpen) await openReportById(idToOpen)
})
</script>

<style>
.fade-enter-active, .fade-leave-active { 
  transition: opacity 0.15s ease; 
}
.fade-enter-from, .fade-leave-to { 
  opacity: 0; 
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
