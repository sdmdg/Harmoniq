<!-- src/views/ReportDetail.vue -->
<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import apiClient from '../utils/axios'

const route = useRoute()
const router = useRouter()

const loading = ref(true)
const err = ref('')
const msg = ref('')
const report = ref(null)

const STATUS_OPTIONS = [
  { value: 'pending',      label: 'Pending' },
  { value: 'in_progress',  label: 'In Progress' },
  { value: 'resolved',     label: 'Resolved' }
]
const statusValue = ref('')

const statusPillClass = computed(() => {
  const s = (report.value?.status || 'pending')
  return {
    pending:      'bg-yellow-900/30 border-yellow-700 text-yellow-300',
    in_progress:  'bg-blue-900/30   border-blue-700   text-blue-300',
    resolved:     'bg-green-900/30  border-green-700  text-green-300'
  }[s] || 'bg-neutral-800 border-neutral-700 text-gray-300'
})

async function load() {
  loading.value = true
  err.value = ''
  msg.value = ''
  try {
    const { data } = await apiClient.get(`/api/reports/${route.params.id}`)
    report.value = data
    statusValue.value = data?.status || 'pending'
  } catch (e) {
    err.value = e?.response?.data?.message || 'Failed to load report'
  } finally {
    loading.value = false
  }
}

// Optional: hook to your update-status API if you have it
async function saveStatus() {
  if (!report.value) return
  msg.value = ''
  err.value = ''
  try {
    await apiClient.put(`/api/reports/${report.value.id}/status`, { status: statusValue.value })
    report.value.status = statusValue.value
    msg.value = 'Status updated.'
  } catch (e) {
    err.value = e?.response?.data?.message || 'Failed to update status'
  }
}

onMounted(load)
</script>

<template>
  <div class="p-6">
    <div class="mb-5 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <button
          type="button"
          class="px-3 py-1 rounded-lg border border-neutral-700 bg-neutral-800 text-sm"
          @click="router.back()"
        >
          ← Back
        </button>
        <h1 class="text-2xl font-bold text-white">Report Details</h1>
      </div>
      <div class="text-sm text-gray-400">
        ID: <span class="font-mono text-gray-200">{{ report?.id ?? '—' }}</span>
      </div>
    </div>

    <div v-if="loading" class="text-gray-400">Loading…</div>
    <div v-else-if="err" class="text-red-400">{{ err }}</div>

    <div v-else class="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-5">
      <div class="flex flex-wrap items-center gap-3">
        <div class="text-sm text-gray-400">Created:</div>
        <div class="text-white text-sm">
          {{ new Date(report.created_at).toLocaleString() }}
        </div>

        <div class="ml-4 text-sm text-gray-400">Status:</div>
        <span class="px-2 py-0.5 rounded text-xs border" :class="statusPillClass">
          {{ (report.status || 'pending').replace('_',' ') }}
        </span>
      </div>

      <div class="grid md:grid-cols-2 gap-4">
        <div class="p-4 bg-neutral-800 rounded-xl border border-neutral-700">
          <h3 class="text-sm text-gray-400 mb-2">Reporter</h3>
          <div class="text-white">
            <div>{{ report.reporter_name || '—' }}</div>
            <div class="text-gray-300 text-sm">{{ report.reporter_email || '—' }}</div>
          </div>
        </div>

        <div class="p-4 bg-neutral-800 rounded-xl border border-neutral-700">
          <h3 class="text-sm text-gray-400 mb-2">Metadata</h3>
          <div class="text-white text-sm space-y-1">
            <div><span class="text-gray-400">Category:</span> {{ report.category || '—' }}</div>
            <div><span class="text-gray-400">Issue Type:</span> {{ report.issue_type || '—' }}</div>
          </div>
        </div>
      </div>

      <div class="p-4 bg-neutral-800 rounded-xl border border-neutral-700">
        <h3 class="text-sm text-gray-400 mb-2">Description</h3>
        <p class="text-gray-200 whitespace-pre-wrap">{{ report.description }}</p>
      </div>

      <!-- Optional status editor -->
      <div class="p-4 bg-neutral-800 rounded-xl border border-neutral-700">
        <h3 class="text-sm text-gray-400 mb-3">Update Status</h3>
        <div class="flex items-center gap-3">
          <select
            v-model="statusValue"
            class="bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-gray-200 outline-none"
          >
            <option v-for="o in STATUS_OPTIONS" :key="o.value" :value="o.value">
              {{ o.label }}
            </option>
          </select>
          <button
            type="button"
            class="px-4 py-2 rounded-lg bg-green-600"
            @click="saveStatus"
          >
            Save
          </button>
          <span v-if="msg" class="text-green-400 text-sm">{{ msg }}</span>
          <span v-if="err && !loading" class="text-red-400 text-sm">{{ err }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
