<script>
import ParticleBackground from "../components/ParticleBackground.vue";

export default {
  name: "UploadView",
  components: {
    ParticleBackground,
  },
  data() {
    return {
      songTitle: "",
      songFile: null,
      isUploading: false,
      uploadMessage: "",
    };
  },
  methods: {
    handleFileChange(event) {
      this.songFile = event.target.files[0];
    },
    async handleUpload() {
      if (!this.songFile) return;

      this.isUploading = true;
      this.uploadMessage = "";

      const formData = new FormData();
      formData.append("title", this.songTitle);
      formData.append("file", this.songFile);

      try {
        const response = await fetch("http://localhost:8000/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) throw new Error("Upload failed!");

        this.uploadMessage = "Song uploaded successfully!";
        this.songTitle = "";
        this.songFile = null;
        this.$refs.fileInput.value = null;
      } catch (err) {
        console.error(err);
        this.uploadMessage = "Error uploading song.";
      } finally {
        this.isUploading = false;
      }
    },
  },
};
</script>

<template>
  <div class="relative min-h-screen bg-black overflow-hidden">
    <!-- Particle background fixed fullscreen -->
    <ParticleBackground class="absolute inset-0 z-0" />

    <!-- Upload form container above particles -->
    <div class="relative z-10 flex justify-center items-start min-h-screen p-4 pt-20">
      <div class="w-full max-w-md bg-[#181818] bg-opacity-90 rounded-lg shadow-lg p-6">
        <h1 class="text-white text-2xl font-bold text-center mb-6">Upload Your Song</h1>

        <form @submit.prevent="handleUpload" class="flex flex-col gap-4">
          <div>
            <label for="title" class="text-white text-sm font-semibold">Song Title:</label>
            <input
              type="text"
              id="title"
              v-model="songTitle"
              required
              class="w-full p-2 rounded text-white bg-[#3E3E3E] border border-[#535353] focus:outline-none focus:ring-1 focus:ring-[#1ED760] placeholder-gray-400"
              placeholder="Enter song title"
            />
          </div>

          <div>
            <label for="file" class="text-white text-sm font-semibold">Select File:</label>
            <input
              type="file"
              id="file"
              ref="fileInput"
              @change="handleFileChange"
              accept="audio/*"
              required
              class="w-full p-2 rounded bg-[#3E3E3E] text-white border border-[#535353] focus:outline-none focus:ring-1 focus:ring-[#1ED760]"
            />
          </div>

          <button
            type="submit"
            :disabled="isUploading"
            class="bg-[#1ED760] hover:bg-[#1DB954] text-black font-bold py-3 px-6 rounded-full focus:outline-none focus:shadow-outline w-full transition duration-200 ease-in-out"
          >
            {{ isUploading ? "Uploading..." : "Upload Song" }}
          </button>
        </form>

        <div v-if="uploadMessage" class="mt-4 text-white font-semibold text-center">
          {{ uploadMessage }}
        </div>
      </div>
    </div>
  </div>
</template>
