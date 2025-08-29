<template>
  <form @submit.prevent="submit" class="max-w-xl w-full space-y-6 p-6 rounded-2xl bg-neutral-900 border border-neutral-800">
    <header class="space-y-1">
      <h2 class="text-lg font-semibold text-white">Report an Issue</h2>
      <p class="text-sm text-neutral-400">Help us keep the platform accurate and safe.</p>
    </header>

    <!-- Category -->
    <div>
      <label for="category" class="block text-sm text-neutral-300 mb-1">Category</label>
      <select
        id="category"
        v-model="form.category"
        class="w-full rounded-xl bg-neutral-800 border border-neutral-700 px-3 py-2 text-neutral-100"
        required
      >
        <option disabled value="">Select a category…</option>
        <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
      </select>
      <p class="mt-1 text-xs text-neutral-500">Choose the broad area of your complaint.</p>
    </div>

    <!-- Issue type -->
    <div>
      <label for="issueType" class="block text-sm text-neutral-300 mb-1">Issue type</label>
      <select
        id="issueType"
        v-model="form.issueType"
        class="w-full rounded-xl bg-neutral-800 border border-neutral-700 px-3 py-2 text-neutral-100"
        :disabled="!form.category"
        required
      >
        <option disabled value="">Select an issue type…</option>
        <option v-for="opt in issueTypes" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
      </select>
      <p class="mt-1 text-xs text-neutral-500">{{ selectedIssueHelp }}</p>
    </div>

    <!-- Description -->
    <div>
      <label for="description" class="block text-sm text-neutral-300 mb-1">Describe the issue</label>
      <textarea
        id="description"
        v-model.trim="form.description"
        rows="4"
        placeholder="Tell us what happened, where you saw it, and any context…"
        class="w-full rounded-xl bg-neutral-800 border border-neutral-700 px-3 py-2 text-neutral-100"
        required
      ></textarea>
      <p class="mt-1 text-xs text-neutral-500">Avoid personal data unless necessary.</p>
    </div>

    <!-- Actions -->
    <div class="flex items-center gap-3">
      <button
        type="submit"
        class="px-4 py-2 rounded-xl bg-green-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
        :disabled="submitting || !canSubmit"
      >
        {{ submitting ? 'Submitting…' : 'Submit report' }}
      </button>
      <button type="button" class="px-4 py-2 rounded-xl bg-neutral-700 text-neutral-100" @click="$emit('close')">Cancel</button>
      <p v-if="msg" class="text-sm text-green-400">{{ msg }}</p>
      <p v-if="err" class="text-sm text-red-400">{{ err }}</p>
    </div>
  </form>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import api from '@/utils/axios.js' // axios instance with baseURL + token

// ---- Taxonomy (no Payment Issues, no pickers) ----
const TAXONOMY = {
  'Content Issues': [
    { value: 'mislabel',  label: 'Wrong or mislabeled track/album' },
    { value: 'copyright', label: 'Copyright issues (unauthorized, duplicate, pirated)' },
    { value: 'quality',   label: 'Low audio quality (distorted, low bitrate, incomplete)' },
    { value: 'offensive', label: 'Offensive/inappropriate content or metadata' },
    { value: 'unavailable', label: 'Unavailable content shown in listings' },
  ],
  'User & Safety': [
    { value: 'impersonation', label: 'Impersonation / fake artist' },
    { value: 'harassment',    label: 'Harassment or abusive behavior' },
    { value: 'spam',          label: 'Spam / bots / fraudulent engagement' },
  ],
  'Technical Issues': [
    { value: 'app_crash',  label: 'App crashes / freezes' },
    { value: 'playback',   label: 'Playback buffering / stutter' },
    { value: 'auth',       label: 'Login / authentication problems' },
    { value: 'sync',       label: 'Sync / offline downloads not working' },
  ],
}

const form = ref({
  category: '',
  issueType: '',
  description: '',
})

const categories = Object.keys(TAXONOMY)
const issueTypes = computed(() => TAXONOMY[form.value.category] ?? [])
watch(() => form.value.category, () => (form.value.issueType = ''))

const selectedIssueHelp = computed(() => {
  const found = issueTypes.value.find(i => i.value === form.value.issueType)
  if (!found) return 'Select a specific issue within the chosen category.'
  const hints = {
    mislabel: 'Tell us what is wrong (artist/title/cover) and the correct info.',
    copyright: 'Describe what seems unauthorized/duplicate and where you saw it.',
    quality: 'Describe the problem and, if possible, the timestamps.',
    offensive: 'Explain what is inappropriate and where it appears.',
    unavailable: 'Tell us your region and the item that won’t play.',
    impersonation: 'Link or name the fake profile and the real artist.',
    harassment: 'Share what happened and where (playlist, comments, etc.).',
    spam: 'Describe the spam behavior and where you noticed it.',
    app_crash: 'Include device/OS/app version and steps to reproduce.',
    playback: 'Mention network conditions and if it’s specific tracks.',
    auth: 'Include the error message and steps to reproduce.',
    sync: 'Which playlist/tracks fail and what steps you tried.',
  }
  return hints[form.value.issueType] ?? 'Provide any context that helps us resolve this quickly.'
})

const canSubmit = computed(() =>
  !!form.value.category && !!form.value.issueType && !!form.value.description.trim()
)

const submitting = ref(false)
const msg = ref('')
const err = ref('')

async function submit () {
  if (!canSubmit.value) return
  submitting.value = true
  msg.value = ''
  err.value = ''
  try {
    const payload = {
      category: form.value.category,
      issueType: form.value.issueType,
      description: form.value.description.trim(),
    }
    await api.post('/api/reports', payload)

    msg.value = 'Thanks—your report was submitted.'
    form.value.issueType = ''
    form.value.description = ''
  } catch (e) {
    const status = e?.response?.status
    if (status === 401) err.value = 'You need to log in.'
    else if (status === 403) err.value = 'You do not have permission.'
    else err.value = e?.response?.data?.message || 'Failed to submit.'
    console.error('Submit error:', e)
  } finally {
    submitting.value = false
  }
}
</script>
