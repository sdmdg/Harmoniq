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
      songFeatures: null,
      isEditing: false, // new flag for edit mode
    };
  },
  methods: {
    handleFileChange(event) {
      this.songFile = event.target.files[0];
    },
    async handleUpload() {
      if (!this.songFile && !this.isEditing) return;

      this.isUploading = true;
      this.uploadMessage = "";
      if (!this.isEditing) this.songFeatures = null;

      const formData = new FormData();
      formData.append("title", this.songTitle);
      if (this.songFile) formData.append("file", this.songFile);

      // Hardcoded features (simulating AI extraction)
      formData.append("albumId", "842710bf-365c-4f74-86d5-b78e8ed6b63e");
      formData.append("duration", "0:5");
      formData.append("trackNumber", "1");
      formData.append("bpm", "120");
      formData.append("valence", "0.65");
      formData.append("arousal", "0.40");
      formData.append("genre", "Pop");
      formData.append("mood", "Happy");

      try {
        const token = localStorage.getItem("jwt_token");
        const response = await fetch("http://localhost:5000/api/songs/upload-song", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        if (!response.ok) throw new Error("Upload failed!");
        const data = await response.json();

        this.uploadMessage = this.isEditing
          ? "Song updated successfully!"
          : "Song uploaded successfully!";

        this.songFile = null;
        if (this.$refs.fileInput) this.$refs.fileInput.value = null;

        this.songFeatures = data.song || {
          duration: "03:45",
          track_number: "1",
          bpm: "120",
          valence: "0.65",
          arousal: "0.40",
          genre: "Pop",
          mood: "Happy",
        };

        this.isEditing = false;
      } catch (err) {
        console.error(err);
        this.uploadMessage = "Error uploading song.";
      } finally {
        this.isUploading = false;
      }
    },

    resetUpload() {
      this.songTitle = "";
      this.songFile = null;
      this.songFeatures = null;
      this.uploadMessage = "";
      this.isEditing = false;
      if (this.$refs.fileInput) this.$refs.fileInput.value = null;
    },

    startEdit() {
      this.isEditing = true;
      this.songTitle = this.songFeatures?.title || this.songTitle;
    },
  },
};
</script>

<template>
  <div class="relative min-h-screen bg-black overflow-hidden">
    <ParticleBackground class="absolute inset-0 z-0" />

    <!-- Upload form -->
    <div class="relative z-10 flex justify-center items-start p-4 pt-20">
      <div class="w-full max-w-md bg-[#181818] bg-opacity-90 rounded-lg shadow-lg p-6">
        <h1 class="text-white text-2xl font-bold text-center mb-6">
          {{ isEditing ? "Edit Song" : "Upload Your Song" }}
        </h1>

        <!-- Show form if no features yet OR in editing mode -->
        <form
          v-if="!songFeatures || isEditing"
          @submit.prevent="handleUpload"
          class="flex flex-col gap-4"
        >
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
              :required="!isEditing"
              class="w-full p-2 rounded bg-[#3E3E3E] text-white border border-[#535353] focus:outline-none focus:ring-1 focus:ring-[#1ED760]"
            />
          </div>

          <button
            type="submit"
            :disabled="isUploading"
            class="bg-[#1ED760] hover:bg-[#1DB954] text-black font-bold py-3 px-6 rounded-full focus:outline-none focus:shadow-outline w-full transition duration-200 ease-in-out"
          >
            {{ isUploading ? "Saving..." : isEditing ? "Save Changes" : "Upload Song" }}
          </button>
        </form>

        <div v-if="uploadMessage" class="mt-4 text-white font-semibold text-center">
          {{ uploadMessage }}
        </div>
      </div>
    </div>

    <!-- Extracted features -->
    <div v-if="songFeatures && !isEditing" class="relative z-10 w-full mt-10 bg-[#111] py-8">
      <h2 class="text-2xl font-bold text-white text-center mb-6">Extracted Song Features</h2>

      <div class="flex justify-center flex-wrap gap-4 px-4">
        <div class="bg-[#1ED760] text-black rounded-lg shadow-md px-6 py-6 flex flex-col items-center min-w-[150px]">
          <span class="text-sm font-medium">Duration</span>
          <span class="text-lg font-bold">{{ songFeatures.duration }}</span>
        </div>
        <div class="bg-[#1ED760] text-black rounded-lg shadow-md px-6 py-6 flex flex-col items-center min-w-[150px]">
          <span class="text-sm font-medium">Track #</span>
          <span class="text-lg font-bold">{{ songFeatures.track_number }}</span>
        </div>
        <div class="bg-[#1ED760] text-black rounded-lg shadow-md px-6 py-6 flex flex-col items-center min-w-[150px]">
          <span class="text-sm font-medium">BPM</span>
          <span class="text-lg font-bold">{{ songFeatures.bpm }}</span>
        </div>
        <div class="bg-[#1ED760] text-black rounded-lg shadow-md px-6 py-6 flex flex-col items-center min-w-[150px]">
          <span class="text-sm font-medium">Genre</span>
          <span class="text-lg font-bold">{{ songFeatures.genre }}</span>
        </div>
        <div class="bg-[#1ED760] text-black rounded-lg shadow-md px-6 py-6 flex flex-col items-center min-w-[150px]">
          <span class="text-sm font-medium">Mood</span>
          <span class="text-lg font-bold">{{ songFeatures.mood }}</span>
        </div>
      </div>

      <!-- Buttons -->
      <div class="flex justify-center mt-6 gap-4">
        <button
          @click="startEdit"
          class="bg-[#FFD700] hover:bg-[#E6C200] text-black font-bold py-2 px-6 rounded-full transition duration-200"
        >
          Edit Song
        </button>
        <button
          @click="resetUpload"
          class="bg-[#FF4747] hover:bg-[#E63939] text-white font-bold py-2 px-6 rounded-full transition duration-200"
        >
          Upload Another Song
        </button>
      </div>
    </div>
  </div>
</template>
