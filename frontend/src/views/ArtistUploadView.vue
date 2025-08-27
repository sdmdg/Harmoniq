<template>
  <div class="min-h-screen bg-black text-white">
    <div class="max-w-3xl mx-auto px-6 py-14">
      <h1 class="text-4xl font-extrabold text-center mb-8">Artist: Upload a Song</h1>

      <div class="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-8 space-y-6">
        <!-- Title -->
        <div class="space-y-2">
          <label class="text-sm text-zinc-300">Song Title</label>
          <input
            v-model="songTitle"
            type="text"
            placeholder="Enter song title"
            class="w-full bg-zinc-800/60 border border-emerald-500/40 focus:border-emerald-400 rounded-lg px-4 py-3 outline-none"
          />
        </div>

        <!-- File -->
        <div class="space-y-2">
          <label class="text-sm text-zinc-300">Select File</label>
          <input
            type="file"
            accept="audio/*"
            @change="handleFileChange"
            class="w-full bg-zinc-800/60 border border-zinc-700 rounded-lg px-4 py-2"
          />
        </div>

        <!-- Album chooser (hardcoded + local create) -->
        <div class="space-y-2">
          <label class="text-sm text-zinc-300">Save to Album</label>

          <div class="flex gap-3 items-center">
            <select
              v-model="selectedAlbumId"
              class="flex-1 bg-zinc-800/60 border border-zinc-700 rounded-lg px-4 py-3"
            >
              <option disabled value="">-- Select an album --</option>
              <option v-for="a in albums" :key="a._id" :value="a._id">
                {{ a.title }}
              </option>
            </select>

            <button
              type="button"
              class="px-4 py-3 rounded-lg bg-zinc-800 border border-zinc-700 hover:bg-zinc-700"
              @click="showCreateAlbum = !showCreateAlbum"
            >
              {{ showCreateAlbum ? 'Cancel' : '+ New Album' }}
            </button>
          </div>

          <!-- Local-only 'create album' (no API) -->
          <div v-if="showCreateAlbum" class="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
            <input
              v-model="newAlbumTitle"
              type="text"
              placeholder="Album title"
              class="md:col-span-2 bg-zinc-800/60 border border-zinc-700 rounded-lg px-4 py-3"
            />
            <button
              type="button"
              class="px-4 py-3 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-black font-semibold"
              :disabled="!newAlbumTitle"
              @click="createLocalAlbum"
            >
              Create
            </button>
          </div>
        </div>

        <button
          class="w-full rounded-full py-4 text-lg font-semibold bg-emerald-500 hover:bg-emerald-600 text-black disabled:opacity-60 disabled:cursor-not-allowed"
          :disabled="isUploading || !songFile || !songTitle || !selectedAlbumId"
          @click="handleUpload"
        >
          {{ isUploading ? 'Uploading…' : 'Upload Song' }}
        </button>

        <p v-if="uploadMessage" class="text-center text-sm" :class="uploadOk ? 'text-emerald-400' : 'text-red-400'">
          {{ uploadMessage }}
        </p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ArtistUploadView',
  data() {
    return {
      // normal upload state
      songTitle: '',
      songFile: null,
      isUploading: false,
      uploadMessage: '',
      uploadOk: false,

      // hardcoded albums + local create state
      albums: [
        { _id: 'a1', title: 'My Debut Album' },
        { _id: 'a2', title: 'Chill Vibes' },
        { _id: 'a3', title: 'Live at Home' },
      ],
      selectedAlbumId: '',
      showCreateAlbum: false,
      newAlbumTitle: '',
    }
  },
  methods: {
    handleFileChange(e) {
      this.songFile = e.target.files[0]
    },
    // purely local create: add to dropdown, select it, no API calls
    createLocalAlbum() {
      const title = this.newAlbumTitle?.trim()
      if (!title) return
      const newId = `local_${Date.now()}`
      this.albums.unshift({ _id: newId, title })
      this.selectedAlbumId = newId
      this.newAlbumTitle = ''
      this.showCreateAlbum = false
    },
    // DEV: simulate a successful upload with no network calls
    async handleUpload() {
      if (!this.songFile || !this.songTitle || !this.selectedAlbumId) return
      this.isUploading = true
      this.uploadMessage = ''
      this.uploadOk = false

      // Simulate latency and success
      setTimeout(() => {
        this.uploadOk = true
        this.uploadMessage = 'Upload successful! (dev mode – no backend call)'
        // Reset fields (keep album selected for convenience)
        this.songTitle = ''
        this.songFile = null
        this.isUploading = false
      }, 700)
    },
  },
}
</script>

<style scoped>
/* Tailwind utility classes are used inline */
</style>
