<template>
  <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
    <div class="w-full max-w-md rounded-xl bg-zinc-900 text-white shadow-xl">
      <div class="p-6">
        <h3 class="mb-2 text-lg font-semibold">{{ title }}</h3>
        <p class="mb-6 text-sm text-zinc-300">{{ message }}</p>
        <div class="flex justify-end gap-2">
          <button class="rounded-lg bg-zinc-700 px-4 py-2 hover:bg-zinc-600" @click="$emit('cancel')">
            Cancel
          </button>
          <button class="rounded-lg bg-red-600 px-4 py-2 hover:bg-red-500" @click="$emit('confirm')">
            Delete
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  open: Boolean,
  title: { type: String, default: 'Delete item?' },
  message: { type: String, default: '' }
})
</script>
