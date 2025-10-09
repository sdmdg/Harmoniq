<template>
  <div class="min-h-screen bg-black text-white">
    <!-- Header -->
    <div
      class="bg-gray-900/80 border-b border-gray-600 sticky top-0 z-10 backdrop-blur-sm"
    >
      <div class="max-w-5xl mx-auto px-6 py-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <button
              @click="goBack"
              class="flex items-center gap-2 px-3 py-2 bg-gray-800/80 hover:bg-gray-700 rounded-lg transition-colors border border-gray-600"
            >
              <svg
                class="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 19l-7-7 7-7"
                ></path>
              </svg>
              Back
            </button>
            <h1 class="text-xl font-bold text-white">Song Details</h1>
          </div>

          <!-- Remove buttons from top corner -->
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-20">
      <div class="text-center">
        <div
          class="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"
        ></div>
        <p class="text-gray-400">Loading song details...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="max-w-4xl mx-auto px-6 py-20">
      <div class="text-center">
        <div
          class="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-4"
        >
          <svg
            class="w-8 h-8 text-red-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
        </div>
        <h2 class="text-xl font-semibold text-white mb-2">Song Not Found</h2>
        <p class="text-gray-400 mb-6">{{ error }}</p>
        <button
          @click="goBack"
          class="px-6 py-2 bg-green-500 hover:bg-green-600 rounded-lg text-white transition-colors"
        >
          Go Back
        </button>
      </div>
    </div>

    <!-- Song Content -->
    <div v-else-if="song" class="max-w-5xl mx-auto px-6 py-4">
      <!-- Song Header -->
      <div
        class="bg-gray-900/60 rounded-xl p-6 mb-6 border border-gray-600 shadow-lg"
      >
        <div class="flex items-start gap-6">
          <!-- Album Art Placeholder -->
          <div
            class="w-32 h-32 bg-gradient-to-br from-teal-600 via-cyan-600 to-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg border border-teal-400/30"
          >
            <svg
              class="w-12 h-12 text-white/80"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.369 4.369 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z"
              ></path>
            </svg>
          </div>

          <!-- Song Info -->
          <div class="flex-1 min-w-0">
            <div class="mb-2">
              <span
                class="inline-block px-2 py-1 bg-green-500/20 border border-green-500/30 rounded text-green-300 text-xs font-medium"
              >
                Song
              </span>
            </div>
            <h1 class="text-2xl font-bold text-white mb-3 break-words">
              {{ song.title }}
            </h1>

            <!-- Artist and Album Info -->
            <div class="flex flex-wrap items-center gap-4 mb-3 text-sm">
              <div class="flex items-center gap-2">
                <svg
                  class="w-4 h-4 text-gray-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fill-rule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z"
                    clip-rule="evenodd"
                  ></path>
                </svg>
                <span class="text-gray-300">by</span>
                <span class="text-white font-medium">{{
                  song.artist_name || "Unknown Artist"
                }}</span>
              </div>
              <div v-if="song.album_name" class="flex items-center gap-2">
                <svg
                  class="w-4 h-4 text-gray-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z"></path>
                  <path
                    fill-rule="evenodd"
                    d="M3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z"
                    clip-rule="evenodd"
                  ></path>
                </svg>
                <span class="text-gray-300">from</span>
                <span class="text-white font-medium">{{
                  song.album_name
                }}</span>
              </div>
            </div>

            <!-- Buffering indicator -->
            <div
              v-if="
                songStore.currentTrack?.id === song.id && songStore.isBuffering
              "
              class="flex items-center gap-2 text-green-400 mb-3"
            >
              <div
                class="animate-spin rounded-full h-3 w-3 border-b-2 border-green-400"
              ></div>
              <span class="text-xs"
                >Buffering... {{ songStore.downloadProgress }}%</span
              >
            </div>

            <!-- Action Buttons -->
            <div class="flex flex-wrap items-center gap-3">
              <button
                @click="playSong"
                class="flex items-center gap-2 px-4 py-2 bg-green-600/80 hover:bg-green-600 rounded-lg text-white font-medium transition-colors border border-green-500/50 shadow-md"
              >
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    v-if="
                      songStore.currentTrack?.id === song.id &&
                      songStore.isPlaying
                    "
                    d="M6 4h4v12H6zM14 4h4v12h-4z"
                  />
                  <path
                    v-else
                    d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z"
                  />
                </svg>
                {{
                  songStore.currentTrack?.id === song.id && songStore.isPlaying
                    ? "Pause"
                    : "Play"
                }}
              </button>

              <button
                v-if="isAdmin"
                @click="deleteSong"
                class="flex items-center gap-2 px-4 py-2 bg-red-600/80 hover:bg-red-600 rounded-lg text-white font-medium transition-colors border border-red-500/50"
              >
                <svg
                  class="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  ></path>
                </svg>
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Song Details Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Basic Information -->
        <div class="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
          <h2
            class="text-lg font-semibold text-white mb-4 flex items-center gap-2"
          >
            <svg
              class="w-4 h-4 text-green-500"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fill-rule="evenodd"
                d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0v12h8V4H6z"
                clip-rule="evenodd"
              ></path>
            </svg>
            Basic Information
          </h2>
          <div class="space-y-3">
            <div class="flex justify-between items-start">
              <span class="text-gray-300 font-medium text-sm">Title:</span>
              <span
                class="text-white text-right max-w-xs break-words text-sm font-semibold"
                >{{ song.title }}</span
              >
            </div>
            <div class="flex justify-between items-start">
              <span class="text-gray-300 font-medium text-sm">Artist:</span>
              <span
                class="text-green-300 text-right max-w-xs break-words text-sm font-semibold"
                >{{ song.artist_name || "Unknown Artist" }}</span
              >
            </div>
            <div class="flex justify-between items-start">
              <span class="text-gray-300 font-medium text-sm">Album:</span>
              <span
                class="text-blue-300 text-right max-w-xs break-words text-sm font-semibold"
                >{{ song.album_name || "No Album" }}</span
              >
            </div>
            <div
              v-if="song.durationSeconds"
              class="flex justify-between items-start"
            >
              <span class="text-gray-300 font-medium text-sm">Duration:</span>
              <span
                class="text-white text-right text-sm font-mono font-semibold"
                >{{ formatTime(song.durationSeconds) }}</span
              >
            </div>
            <div class="flex justify-between items-start">
              <span class="text-gray-300 font-medium text-sm">ID:</span>
              <span
                class="text-green-300 text-right font-mono text-xs break-all font-bold"
                >{{ song.id }}</span
              >
            </div>
          </div>
        </div>

        <!-- Technical Information -->
        <div class="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
          <h2
            class="text-lg font-semibold text-white mb-4 flex items-center gap-2"
          >
            <svg
              class="w-4 h-4 text-green-500"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"
              ></path>
            </svg>
            Technical Details
          </h2>
          <div class="space-y-3">
            <div v-if="song.genre" class="flex justify-between items-center">
              <span class="text-gray-300 font-medium text-sm">Genre:</span>
              <span
                class="px-3 py-1 bg-green-600/30 border border-green-500/50 rounded-lg text-green-300 text-xs font-semibold shadow-sm"
              >
                {{ song.genre }}
              </span>
            </div>
            <div v-if="song.mood" class="flex justify-between items-center">
              <span class="text-gray-300 font-medium text-sm">Mood:</span>
              <span
                class="px-3 py-1 bg-gray-700/60 border border-gray-600/60 rounded-lg text-gray-200 text-xs font-semibold shadow-sm"
              >
                {{ song.mood }}
              </span>
            </div>
            <div v-if="song.bpm" class="flex justify-between items-center">
              <span class="text-gray-300 font-medium text-sm">BPM:</span>
              <span
                class="text-white font-mono text-sm font-bold bg-gray-800/40 px-2 py-1 rounded border border-gray-600/50"
                >{{ song.bpm }}</span
              >
            </div>
            <div v-if="song.valence !== null && song.valence !== undefined">
              <div class="flex justify-between items-center mb-1">
                <span class="text-gray-300 font-medium text-sm">Valence:</span>
                <span class="text-purple-400 font-mono text-sm font-bold">{{
                  Number(song.valence).toFixed(2)
                }}</span>
              </div>
              <div
                class="w-full bg-gray-900/80 rounded-full h-3 border border-gray-700/80 shadow-inner"
              >
                <div
                  class="bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 h-3 rounded-full transition-all duration-500 shadow-sm"
                  :style="{ width: `${song.valence * 10}%` }"
                ></div>
              </div>
              <div class="text-xs text-purple-300 mt-1">
                {{ (song.valence * 10).toFixed(1) }}%
              </div>
            </div>
            <div v-if="song.arousal !== null && song.arousal !== undefined">
              <div class="flex justify-between items-center mb-1">
                <span class="text-gray-300 font-medium text-sm">Arousal:</span>
                <span class="text-teal-400 font-mono text-sm font-bold">{{
                  Number(song.arousal).toFixed(2)
                }}</span>
              </div>
              <div
                class="w-full bg-gray-900/80 rounded-full h-3 border border-gray-700/80 shadow-inner"
              >
                <div
                  class="bg-gradient-to-r from-teal-600 via-cyan-600 to-emerald-600 h-3 rounded-full transition-all duration-500 shadow-sm"
                  :style="{ width: `${song.arousal * 10}%` }"
                ></div>
              </div>
              <div class="text-xs text-teal-300 mt-1">
                {{ (song.arousal * 10).toFixed(1) }}%
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Confirm Delete Dialog -->
    <ConfirmDialog
      :open="showDeleteConfirm"
      title="Delete Song"
      :message="
        song
          ? `Are you sure you want to delete '${song.title}'? This action cannot be undone.`
          : ''
      "
      @cancel="showDeleteConfirm = false"
      @confirm="confirmDelete"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useSongStore } from "../stores/song.js";
import apiClient from "../utils/axios.js";
import ConfirmDialog from "../components/ConfirmDialog.vue";

const route = useRoute();
const router = useRouter();
const songStore = useSongStore();

const song = ref(null);
const loading = ref(true);
const error = ref("");
const showDeleteConfirm = ref(false);

// Check if user is admin (you may want to adjust this based on your auth system)
const isAdmin = computed(() => {
  // Add your admin check logic here
  return true; // For now, assuming admin access
});

onMounted(() => {
  fetchSong();
});

async function fetchSong() {
  try {
    loading.value = true;
    error.value = "";

    const songId = route.params.id;
    if (!songId) {
      error.value = "No song ID provided";
      return;
    }

    const response = await apiClient.get(`/api/songs/${songId}`);
    console.log("Raw API response:", response);
    console.log("Song data received:", response.data);
    song.value = response.data;
  } catch (err) {
    console.error("Error fetching song:", err);
    error.value = err.response?.data?.message || "Failed to load song details";
  } finally {
    loading.value = false;
  }
}

function goBack() {
  router.go(-1);
}

function playSong() {
  if (song.value) {
    const track = {
      id: song.value.id,
      name: song.value.title,
      key: song.value.encryption_key,
      path: song.value.id,
    };

    const album = {
      id: "song-detail",
      title: "Song Detail",
      tracks: [track],
    };

    songStore.playOrPauseThisSong(album, track);
  }
}

function deleteSong() {
  showDeleteConfirm.value = true;
}

async function confirmDelete() {
  try {
    await apiClient.delete(`/api/songs/${song.value.id}`);
    showDeleteConfirm.value = false;
    router.push("/adminSongsManage");
  } catch (err) {
    console.error("Error deleting song:", err);
    error.value = "Failed to delete song";
  }
}

function formatTime(seconds) {
  if (!seconds) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function formatDate(dateString) {
  if (!dateString) return "";
  return new Date(dateString).toLocaleString();
}
</script>
