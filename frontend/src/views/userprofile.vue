<script setup>
import { ref, onMounted, watch, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import api from "@/utils/axios"; // your axios wrapper
import { useSongStore } from "@/stores/song";
import MusicPlayer from "@/components/MusicPlayer.vue";

const route = useRoute();
const router = useRouter();
const id = route.params.id;
const songStore = useSongStore();

// File server configuration
const fileServerBaseUrl =
  import.meta.env.VITE_FILE_SERVER || "http://localhost:3000";

// --- page state
const loading = ref(true);
const errorMsg = ref("");

// --- summary
const summary = ref(null);

// Profile image URL computation
const profileImageUrl = computed(() => {
  if (!summary.value?.pic_path) {
    return "/avatar.jpg"; // fallback to default avatar
  }

  // Construct the full URL using the pic_path from database
  return `${fileServerBaseUrl}/public/images/${summary.value.pic_path}`;
});

// Image loading state
const imageLoading = ref(true);
const imageError = ref(false);

// Image event handlers
const handleImageLoad = () => {
  imageLoading.value = false;
  imageError.value = false;
};

const handleImageError = (event) => {
  imageLoading.value = false;
  imageError.value = true;
  console.log("Profile image failed to load:", event.target.src);
  console.log("Falling back to default avatar");
  event.target.src = "/avatar.jpg";
};

// --- tabs
const tab = ref("overview"); // overview | activity | liked | playlists | uploads | reports

// --- activity
const acts = ref([]);
const actsLoading = ref(false);
const actsPage = ref(1);
const actsLimit = ref(20);
const actsTotal = ref(0);
const actsType = ref("all"); // all | liked | playlist | uploaded | report
const actsRange = ref("30d"); // 7d | 30d | all

// --- liked
const liked = ref([]);
const likedPage = ref(1);
const likedLimit = ref(20);
const likedTotal = ref(0);
const likedLoading = ref(false);

// --- playlists
const playlists = ref([]);
const playlistsLoading = ref(false);

// --- uploads
const uploads = ref([]);
const upPage = ref(1);
const upLimit = ref(20);
const upTotal = ref(0);
const upLoading = ref(false);

// --- reports
const reports = ref([]);
const repLoading = ref(false);
const statusDraft = ref({});
const saving = ref({});

// Modal state
const showModal = ref(false);
const activeReport = ref(null);

// Modal functions
function openReport(report) {
  activeReport.value = report;
  statusDraft.value[report.id] = report.status;
  showModal.value = true;
}

function closeModal() {
  showModal.value = false;
  activeReport.value = null;
}
// helpers
function back() {
  router.back();
}
function fmtDate(d) {
  return d ? new Date(d).toLocaleString() : "—";
}
function fmtOnlyDate(d) {
  return d ? new Date(d).toLocaleDateString() : "—";
}
function fmtDur(sec) {
  if (sec === null || sec === undefined) return "—";
  const m = Math.floor(sec / 60),
    s = String(sec % 60).padStart(2, "0");
  return `${m}:${s}`;
}
function labelStatus(s) {
  if (s === "pending") return "Pending";
  if (s === "in_progress") return "In Progress";
  if (s === "rejected") return "Rejected";
  if (s === "completed") return "Completed";
  return s;
}
function badgeClass(status) {
  const base = "px-3 py-1 rounded-lg text-xs font-medium";
  if (status === "completed")
    return `${base} bg-green-900/40 text-green-300 border border-green-800`;
  if (status === "in_progress")
    return `${base} bg-blue-900/40 text-blue-300 border border-blue-800`;
  if (status === "rejected")
    return `${base} bg-red-900/40 text-red-300 border border-red-800`;
  if (status === "pending")
    return `${base} bg-yellow-900/40 text-yellow-300 border border-yellow-800`;
  return `${base} bg-zinc-700 text-zinc-300 border border-zinc-600`;
}

// navigation
function openPlaylist(playlistId) {
  router.push(`/playlist/${playlistId}`);
}

// music player functions
function playSong(song) {
  console.log("Playing liked song - original data:", song);

  // Create artist object (simple format)
  const artistData = {
    name: song.artists || "Unknown Artist",
  };

  // Create track object with the exact format the store expects
  const trackData = {
    id: song.song_id || song.id,
    name: song.title,
    artist: song.artists || "Unknown Artist",
    duration: song.duration,
    albumCover: song.albumCover || "default.png",
    key: song.encryption_key || "", // Store expects 'key', not 'encryption_key'
    encryption_key: song.encryption_key || "", // Keep both for compatibility
    album_id: song.album_id || null,
    path: song.song_id
      ? `${song.song_id}.mp3`
      : song.id
      ? `${song.id}.mp3`
      : "", // Store expects 'path'
  };

  console.log("Final artist data:", artistData);
  console.log("Final track data:", trackData);

  // Use the exact same method as SongRow component
  try {
    songStore.loadSong(artistData, trackData);
  } catch (error) {
    console.error("Error in loadSong:", error);
    // Fallback to the other method if loadSong fails
    try {
      songStore.playOrPauseThisSong(artistData, trackData);
    } catch (fallbackError) {
      console.error("Error in fallback method:", fallbackError);
    }
  }
}

// loaders
async function loadSummary() {
  const { data } = await api.get(`/api/admin/users/${id}/summary`);
  summary.value = data;
}
async function loadActivities() {
  actsLoading.value = true;
  try {
    const { data } = await api.get(`/api/admin/users/${id}/activities`, {
      params: {
        page: actsPage.value,
        limit: actsLimit.value,
        type: actsType.value,
        range: actsRange.value,
      },
    });
    acts.value = data.data;
    actsTotal.value = data.total;
  } finally {
    actsLoading.value = false;
  }
}
async function loadLiked() {
  likedLoading.value = true;
  try {
    const { data } = await api.get(`/api/admin/users/${id}/liked`, {
      params: { page: likedPage.value, limit: likedLimit.value },
    });
    liked.value = data.data;
    likedTotal.value = data.total;
  } finally {
    likedLoading.value = false;
  }
}
async function loadPlaylists() {
  playlistsLoading.value = true;
  try {
    const { data } = await api.get(`/api/admin/users/${id}/playlists`);
    playlists.value = data;
  } finally {
    playlistsLoading.value = false;
  }
}
async function loadUploads() {
  upLoading.value = true;
  try {
    const { data } = await api.get(`/api/admin/users/${id}/uploads`, {
      params: { page: upPage.value, limit: upLimit.value },
    });
    uploads.value = data.data;
    upTotal.value = data.total;
  } finally {
    upLoading.value = false;
  }
}
async function loadReports() {
  repLoading.value = true;
  try {
    const { data } = await api.get(`/api/admin/users/${id}/reports`);
    reports.value = Array.isArray(data) ? data : data.data ?? [];
  } finally {
    repLoading.value = false;
  }
}
async function updateStatus(r) {
  const newStatus = statusDraft.value[r.id];
  if (!newStatus || newStatus === r.status) return;
  saving.value[r.id] = true;
  try {
    await api.put(`/api/reports/${r.id}/status`, { status: newStatus });
    r.status = newStatus;
    statusDraft.value[r.id] = newStatus;
  } catch (e) {
    statusDraft.value[r.id] = r.status;
    alert(e?.response?.data?.message || "Failed to update status");
  } finally {
    saving.value[r.id] = false;
  }
}

// Play function for uploaded songs
function playUploadedSong(song) {
  const track = {
    id: song.id,
    name: song.title,
    key: song.encryption_key || "", // Most user uploads won't have encryption keys
    path: song.id,
  };

  const artist = {
    id: "user-uploads",
    title: "User Uploads",
    tracks: uploads.value.map((s) => ({
      id: s.id,
      name: s.title,
      key: s.encryption_key || "",
      path: s.id,
    })),
  };

  songStore.playOrPauseThisSong(artist, track);
}

onMounted(async () => {
  try {
    await loadSummary();
    await Promise.all([loadActivities(), loadPlaylists()]);
  } catch (e) {
    console.error(e);
    errorMsg.value = "Failed to load user";
  } finally {
    loading.value = false;
  }
});

// reactive reloads
watch([actsPage, actsType, actsRange], loadActivities);
watch([likedPage, likedLimit], loadLiked);
watch([upPage, upLimit], loadUploads);
watch(tab, (t) => {
  if (t === "liked" && !liked.value.length) loadLiked();
  if (t === "uploads" && !uploads.value.length) loadUploads();
  if (t === "reports" && !reports.value.length) loadReports();
});
</script>

<template>
  <div class="min-h-screen bg-black p-6">
    <!-- Header matching model upload theme -->
    <div class="mb-8">
      <div class="flex items-center gap-4 mb-6">
        <button
          @click="back"
          class="flex items-center gap-2 px-3 py-2 bg-gray-800/50 hover:bg-gray-800 border border-gray-700 rounded-lg text-gray-300 hover:text-white transition-colors"
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
            />
          </svg>
          Back
        </button>
        <div>
          <h1 class="text-2xl font-bold text-green-400">User Profile</h1>
          <p class="text-gray-400 mt-1">
            Comprehensive user management and analytics
          </p>
        </div>
      </div>

      <!-- Error Display -->
      <div
        v-if="errorMsg"
        class="mb-6 p-4 bg-gray-800 border border-red-500/30 rounded-lg"
      >
        <div class="flex items-center gap-2 text-red-400">
          <svg
            class="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          {{ errorMsg }}
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-20">
      <div class="text-center">
        <div
          class="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"
        ></div>
        <p class="text-gray-400">Loading user profile...</p>
      </div>
    </div>

    <!-- Main Content -->
    <div
      v-else-if="summary"
      class="grid grid-cols-1 xl:grid-cols-[380px,1fr] gap-8"
    >
      <!-- LEFT SIDEBAR: Enhanced User Card -->
      <aside class="space-y-6">
        <!-- User Identity Card -->
        <div class="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
          <!-- Profile Header -->
          <div class="flex items-start gap-4 mb-6">
            <div class="relative">
              <!-- Loading spinner -->
              <div
                v-if="imageLoading"
                class="absolute inset-0 flex items-center justify-center bg-gray-800 rounded-2xl border-2 border-green-500/30"
              >
                <div
                  class="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"
                ></div>
              </div>

              <!-- Profile image -->
              <img
                :src="profileImageUrl"
                @load="handleImageLoad"
                @error="handleImageError"
                class="w-20 h-20 rounded-2xl object-cover border-2 border-green-500/30 shadow-lg transition-opacity duration-300"
                :class="{ 'opacity-0': imageLoading }"
                :alt="`${summary.user_name}'s avatar`"
              />

              <!-- Status indicator -->
              <div
                class="absolute -bottom-2 -right-2 w-6 h-6 bg-green-500 rounded-full border-2 border-gray-800 flex items-center justify-center"
              >
                <svg
                  class="w-3 h-3 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fill-rule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clip-rule="evenodd"
                  />
                </svg>
              </div>
            </div>
            <div class="flex-1 min-w-0">
              <h2 class="text-xl font-bold text-white mb-1 truncate">
                {{ summary.user_name }}
              </h2>
              <p class="text-gray-400 text-sm mb-3 truncate">
                {{ summary.email }}
              </p>
              <span
                class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium capitalize"
                :class="
                  summary.role === 'admin'
                    ? 'bg-red-600 text-white'
                    : summary.role === 'artist'
                    ? 'bg-purple-600 text-white'
                    : 'bg-blue-600 text-white'
                "
              >
                <svg
                  class="w-3 h-3 mr-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fill-rule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z"
                    clip-rule="evenodd"
                  />
                </svg>
                {{ summary.role }}
              </span>
            </div>
          </div>

          <!-- User Details -->
          <div class="space-y-3 mb-6">
            <div class="flex items-center gap-3 text-sm">
              <svg
                class="w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span class="text-gray-400">Joined:</span>
              <span class="text-white font-medium">{{
                fmtOnlyDate(summary.created_at)
              }}</span>
            </div>
            <div class="flex items-center gap-3 text-sm">
              <svg
                class="w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span class="text-gray-400">Last active:</span>
              <span class="text-white font-medium">{{
                fmtDate(summary.last_active)
              }}</span>
            </div>
            <div class="flex items-center gap-3 text-sm">
              <svg
                class="w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                />
              </svg>
              <span class="text-gray-400">ID:</span>
              <span
                class="text-xs text-gray-500 font-mono bg-gray-800/50 px-2 py-1 rounded"
                >{{ summary.id }}</span
              >
            </div>
          </div>
        </div>

        <!-- Enhanced Stats Grid -->
        <div class="grid grid-cols-2 gap-4">
          <!-- Liked Songs -->
          <div
            class="group bg-gradient-to-br from-pink-900/20 to-red-900/20 backdrop-blur-sm border border-green-500/20 rounded-xl p-4 hover:border-green-500/40 transition-all duration-300 cursor-pointer"
            @click="tab = 'liked'"
          >
            <div class="flex items-center justify-between mb-2">
              <svg
                class="w-6 h-6 text-pink-400 group-hover:text-pink-300 transition-colors"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fill-rule="evenodd"
                  d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                  clip-rule="evenodd"
                />
              </svg>
              <span
                class="text-2xl font-bold text-white group-hover:scale-110 transition-transform"
                >{{ summary.liked_count }}</span
              >
            </div>
            <p
              class="text-xs text-gray-400 group-hover:text-gray-300 transition-colors"
            >
              Liked Songs
            </p>
          </div>

          <!-- Playlists -->
          <div
            class="group bg-gradient-to-br from-blue-900/20 to-indigo-900/20 backdrop-blur-sm border border-green-500/20 rounded-xl p-4 hover:border-green-500/40 transition-all duration-300 cursor-pointer"
            @click="tab = 'playlists'"
          >
            <div class="flex items-center justify-between mb-2">
              <svg
                class="w-6 h-6 text-blue-400 group-hover:text-blue-300 transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                />
              </svg>
              <span
                class="text-2xl font-bold text-white group-hover:scale-110 transition-transform"
                >{{ summary.playlist_count }}</span
              >
            </div>
            <p
              class="text-xs text-gray-400 group-hover:text-gray-300 transition-colors"
            >
              Playlists
            </p>
          </div>

          <!-- Uploads -->
          <div
            class="group bg-gradient-to-br from-green-900/20 to-emerald-900/20 backdrop-blur-sm border border-green-500/20 rounded-xl p-4 hover:border-green-500/40 transition-all duration-300 cursor-pointer"
            @click="tab = 'uploads'"
          >
            <div class="flex items-center justify-between mb-2">
              <svg
                class="w-6 h-6 text-green-400 group-hover:text-green-300 transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <span
                class="text-2xl font-bold text-white group-hover:scale-110 transition-transform"
                >{{ summary.upload_count }}</span
              >
            </div>
            <p
              class="text-xs text-gray-400 group-hover:text-gray-300 transition-colors"
            >
              Uploads
            </p>
          </div>

          <!-- Reports -->
          <div
            class="group bg-gradient-to-br from-yellow-900/20 to-orange-900/20 backdrop-blur-sm border border-green-500/20 rounded-xl p-4 hover:border-green-500/40 transition-all duration-300 cursor-pointer"
            @click="tab = 'reports'"
          >
            <div class="flex items-center justify-between mb-2">
              <svg
                class="w-6 h-6 text-yellow-400 group-hover:text-yellow-300 transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <span
                class="text-2xl font-bold text-white group-hover:scale-110 transition-transform"
                >{{ summary.report_count }}</span
              >
            </div>
            <p
              class="text-xs text-gray-400 group-hover:text-gray-300 transition-colors"
            >
              Reports
            </p>
          </div>
        </div>
      </aside>

      <!-- RIGHT: Modern Tab Navigation + Content -->
      <section class="space-y-6">
        <!-- Enhanced Tab Navigation -->
        <div
          class="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-2"
        >
          <div class="flex flex-wrap gap-1">
            <button
              v-for="t in [
                {
                  key: 'overview',
                  label: 'Overview',
                  icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z',
                },
                // {
                //   key: 'activity',
                //   label: 'Activity',
                //   icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
                // },
                {
                  key: 'liked',
                  label: 'Liked',
                  icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z',
                },
                {
                  key: 'playlists',
                  label: 'Playlists',
                  icon: 'M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3',
                },
                {
                  key: 'uploads',
                  label: 'Uploads',
                  icon: 'M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12',
                },
                {
                  key: 'reports',
                  label: 'Reports',
                  icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
                },
              ]"
              :key="t.key"
              class="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
              :class="
                t.key === tab
                  ? 'bg-green-600 text-white shadow-lg'
                  : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
              "
              @click="tab = t.key"
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
                  :d="t.icon"
                />
              </svg>
              {{ t.label }}
            </button>
          </div>
        </div>

        <!-- OVERVIEW TAB -->
        <div v-if="tab === 'overview'" class="space-y-6">
          <div class="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
            <div class="flex items-center justify-between mb-4">
              <div>
                <h3 class="text-xl font-bold text-white mb-2">
                  Recent Activity
                </h3>
                <p class="text-gray-400">
                  Track user engagement and behavior patterns
                </p>
              </div>
              <select
                v-model="actsRange"
                class="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:border-green-500 focus:outline-none transition-colors"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="all">All time</option>
              </select>
            </div>

            <!-- Activity List -->
            <div
              class="space-y-3 max-h-80 overflow-y-auto scrollbar-thin scrollbar-track-gray-800 scrollbar-thumb-gray-600"
            >
              <div
                v-for="a in acts.slice(0, 10)"
                :key="a.activity_type + a.ref_id + a.created_at"
                class="flex items-center gap-4 p-4 bg-gray-700/30 rounded-xl border border-gray-600/30 hover:border-gray-500/50 transition-all duration-200"
              >
                <!-- Activity Icon -->
                <div class="flex-shrink-0">
                  <div
                    class="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500/20 to-blue-500/20 border border-green-500/30 flex items-center justify-center"
                  >
                    <svg
                      class="w-5 h-5 text-green-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        v-if="a.activity_type === 'liked'"
                      />
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                        v-else-if="a.activity_type === 'playlist'"
                      />
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        v-else-if="a.activity_type === 'uploaded'"
                      />
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        v-else-if="a.activity_type === 'report'"
                      />
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                        v-else
                      />
                    </svg>
                  </div>
                </div>

                <!-- Activity Details -->
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 mb-1">
                    <span
                      class="inline-flex items-center px-2 py-1 text-xs font-medium rounded-lg bg-green-900/30 text-green-300 border border-green-500/30 capitalize"
                    >
                      {{ a.activity_type }}
                    </span>
                  </div>
                  <p class="text-white font-medium truncate">
                    {{ a.title || "—" }}
                  </p>
                </div>

                <!-- Timestamp -->
                <div class="flex-shrink-0 text-right">
                  <div class="text-sm text-gray-400">
                    {{ fmtDate(a.created_at) }}
                  </div>
                </div>
              </div>

              <!-- Empty State -->
              <div v-if="!acts.length" class="text-center py-8">
                <p class="text-gray-400">No activity yet</p>
              </div>
            </div>
          </div>
        </div>

        <!-- LIKED SONGS TAB -->
        <div v-else-if="tab === 'liked'" class="space-y-6">
          <div class="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
            <div class="flex items-center justify-between mb-6">
              <div class="flex items-center gap-3">
                <div
                  class="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500/20 to-red-500/20 border border-pink-500/30 flex items-center justify-center"
                >
                  <svg
                    class="w-6 h-6 text-pink-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <h3 class="text-xl font-bold text-white">Liked Songs</h3>
                  <p class="text-gray-400">Total: {{ likedTotal }} songs</p>
                </div>
              </div>
            </div>

            <!-- Loading State -->
            <div
              v-if="likedLoading"
              class="flex items-center justify-center py-12"
            >
              <div class="text-center">
                <div
                  class="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto mb-3"
                ></div>
                <p class="text-gray-400">Loading liked songs...</p>
              </div>
            </div>

            <!-- Songs Table -->
            <div v-else class="space-y-4">
              <!-- Table Header -->
              <div
                class="hidden md:grid grid-cols-4 gap-4 px-4 py-2 text-sm font-medium text-gray-400 border-b border-gray-700/50"
              >
                <div>Song</div>
                <!-- <div>Artists</div>
                <div>Duration</div> -->
                <div>Liked At</div>
              </div>

              <!-- Songs List -->
              <div
                class="space-y-2 max-h-96 overflow-y-auto scrollbar-thin scrollbar-track-gray-800 scrollbar-thumb-gray-600"
              >
                <div
                  v-for="s in liked"
                  :key="s.song_id + s.created_at"
                  class="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-800/30 rounded-xl border border-gray-700/30 hover:border-green-500/50 hover:bg-gray-800/60 hover:shadow-lg hover:shadow-green-500/10 transition-all duration-200 cursor-pointer"
                  @click="playSong(s)"
                >
                  <!-- Song Title -->
                  <div class="flex items-center gap-3">
                    <div
                      class="relative w-12 h-12 rounded-lg bg-gradient-to-br from-green-600/20 to-green-700/20 border border-green-500/30 flex items-center justify-center hover:from-green-600 hover:to-green-700 hover:border-green-500 transition-all duration-200"
                    >
                      <!-- Play button -->
                      <svg
                        class="w-6 h-6 text-green-400 hover:text-white transition-colors duration-200"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fill-rule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                          clip-rule="evenodd"
                        />
                      </svg>
                    </div>
                    <div class="min-w-0">
                      <p
                        class="text-white font-medium truncate hover:text-green-300 transition-colors duration-200"
                      >
                        {{ s.title }}
                      </p>
                      <p class="text-sm text-gray-400 md:hidden">
                        by {{ s.artists || "Unknown Artist" }}
                      </p>
                    </div>
                  </div>

                  <!-- Artists -->
                  <!-- <div class="hidden md:flex items-center">
                    <p class="text-gray-300 truncate">
                      {{ s.artists || "Unknown Artist" }}
                    </p>
                  </div> -->

                  <!-- Duration -->
                  <!-- <div class="hidden md:flex items-center">
                    <span class="text-gray-400 font-mono">{{
                      fmtDur(s.duration)
                    }}</span>
                  </div> -->

                  <!-- Liked At -->
                  <div
                    class="flex items-center justify-between md:justify-start"
                  >
                    <span class="text-gray-400 text-sm">{{
                      fmtDate(s.created_at)
                    }}</span>
                    <div
                      class="md:hidden flex items-center gap-2 text-sm text-gray-500"
                    >
                      <span>{{ fmtDur(s.duration) }}</span>
                    </div>
                  </div>
                </div>

                <!-- Empty State -->
                <div v-if="!liked.length" class="text-center py-12">
                  <svg
                    class="w-16 h-16 text-gray-600 mx-auto mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                  <p class="text-gray-400 text-lg font-medium mb-1">
                    No liked songs
                  </p>
                  <p class="text-gray-500">
                    This user hasn't liked any songs yet
                  </p>
                </div>
              </div>

              <!-- Pagination -->
              <div
                class="flex items-center justify-between pt-4 border-t border-gray-700/50"
              >
                <div class="text-sm text-gray-400">
                  Showing {{ Math.min(likedPage * likedLimit, likedTotal) }} of
                  {{ likedTotal }} songs
                </div>
                <div class="flex gap-2">
                  <button
                    class="px-4 py-2 rounded-lg bg-gray-700/50 border border-gray-600 text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-600/50 transition-colors"
                    :disabled="likedPage === 1"
                    @click="likedPage--"
                  >
                    Previous
                  </button>
                  <button
                    class="px-4 py-2 rounded-lg bg-gray-700/50 border border-gray-600 text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-600/50 transition-colors"
                    :disabled="likedPage * likedLimit >= likedTotal"
                    @click="likedPage++"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- PLAYLISTS TAB -->
        <div v-else-if="tab === 'playlists'" class="space-y-6">
          <div class="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
            <div class="flex items-center gap-3 mb-6">
              <div
                class="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30 flex items-center justify-center"
              >
                <svg
                  class="w-6 h-6 text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                  />
                </svg>
              </div>
              <div>
                <h3 class="text-xl font-bold text-white">User Playlists</h3>
                <p class="text-gray-400">
                  {{ playlists.length }} playlist{{
                    playlists.length !== 1 ? "s" : ""
                  }}
                  created
                </p>
              </div>
            </div>

            <!-- Loading State -->
            <div
              v-if="playlistsLoading"
              class="flex items-center justify-center py-12"
            >
              <div class="text-center">
                <div
                  class="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-3"
                ></div>
                <p class="text-gray-400">Loading playlists...</p>
              </div>
            </div>

            <!-- Playlists Grid -->
            <div
              v-else-if="playlists.length"
              class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              <div
                v-for="p in playlists"
                :key="p.id"
                class="group bg-gradient-to-br from-gray-800/40 to-black/60 rounded-2xl p-5 border border-gray-600/50 hover:border-green-500/50 hover:shadow-lg hover:shadow-green-500/10 transition-all duration-300 cursor-pointer"
                @click="openPlaylist(p.id)"
              >
                <!-- Playlist Artwork -->
                <div class="relative mb-4">
                  <div
                    class="aspect-square rounded-xl bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/20 flex items-center justify-center group-hover:scale-105 transition-transform duration-300"
                  >
                    <svg
                      class="w-12 h-12 text-green-400 group-hover:text-green-300 transition-colors"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                      />
                    </svg>
                  </div>

                  <!-- Play Button Overlay -->
                  <div
                    class="absolute inset-0 flex items-center justify-center bg-black/60 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    @click.stop="openPlaylist(p.id)"
                  >
                    <div
                      class="w-14 h-14 rounded-full bg-green-500 flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform duration-300"
                    >
                      <svg
                        class="w-6 h-6 text-white ml-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fill-rule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                          clip-rule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                <!-- Playlist Info -->
                <div>
                  <h4
                    class="text-white font-semibold truncate mb-1 group-hover:text-green-300 transition-colors"
                  >
                    {{ p.title }}
                  </h4>
                  <div class="flex items-center gap-2 text-sm text-gray-400">
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
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    {{ fmtOnlyDate(p.created_at) }}
                  </div>

                  <!-- Additional playlist metadata -->
                  <div class="mt-2 flex items-center justify-between">
                    <span class="text-xs text-gray-500">
                      {{ p.song_count || 0 }} songs
                    </span>
                    <div class="flex items-center gap-1">
                      <div class="w-2 h-2 rounded-full bg-green-500"></div>
                      <span class="text-xs text-gray-500">Active</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Empty State -->
            <div v-else class="text-center py-12">
              <svg
                class="w-16 h-16 text-gray-600 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                />
              </svg>
              <p class="text-gray-400 text-lg font-medium mb-1">
                No playlists found
              </p>
              <p class="text-gray-500">
                This user hasn't created any playlists yet
              </p>
            </div>
          </div>
        </div>

        <!-- UPLOADS TAB -->
        <div v-else-if="tab === 'uploads'" class="space-y-6">
          <div class="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
            <div class="flex items-center gap-3 mb-6">
              <div
                class="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 flex items-center justify-center"
              >
                <svg
                  class="w-6 h-6 text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
              </div>
              <div>
                <h3 class="text-xl font-bold text-white">Uploaded Songs</h3>
                <p class="text-gray-400">
                  {{ upTotal }} song{{ upTotal !== 1 ? "s" : "" }} uploaded
                </p>
              </div>
            </div>

            <!-- Loading State -->
            <div
              v-if="upLoading"
              class="flex items-center justify-center py-12"
            >
              <div class="text-center">
                <div
                  class="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-3"
                ></div>
                <p class="text-gray-400">Loading uploads...</p>
              </div>
            </div>

            <!-- Uploads Table -->
            <div v-else class="space-y-4">
              <!-- Table Header -->
              <div
                class="hidden md:grid grid-cols-4 gap-4 px-4 py-2 text-sm font-medium text-gray-400 border-b border-gray-700/50"
              >
                <div>Song</div>
                <div>Artist</div>
                <div>Upload Date</div>
                <div>Actions</div>
              </div>

              <!-- Uploads List -->
              <div class="space-y-2 max-h-96 overflow-y-auto">
                <div
                  v-for="s in uploads"
                  :key="s.id"
                  class="grid grid-cols-1 md:grid-cols-4 gap-4 p-3 bg-gradient-to-br from-gray-800/40 to-black/60 rounded-lg border border-green-500/20 hover:border-green-500/40 hover:shadow-lg hover:shadow-green-500/10 transition-all duration-300"
                >
                  <!-- Song Title -->
                  <div class="flex items-center gap-3">
                    <div
                      class="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30 flex items-center justify-center"
                    >
                      <svg
                        class="w-5 h-5 text-green-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                        />
                      </svg>
                    </div>
                    <div>
                      <p class="text-white font-medium">{{ s.title }}</p>
                      <p class="text-sm text-gray-400 md:hidden">
                        by {{ s.artist_name || "Unknown Artist" }}
                      </p>
                    </div>
                  </div>

                  <!-- Artist -->
                  <div class="hidden md:flex items-center">
                    <p class="text-gray-300">
                      {{ s.artist_name || "Unknown Artist" }}
                    </p>
                  </div>

                  <!-- Upload Date -->
                  <div class="flex items-center">
                    <span class="text-gray-400 text-sm">{{
                      fmtDate(s.created_at)
                    }}</span>
                  </div>

                  <!-- Actions (Desktop) -->
                  <div class="hidden md:flex items-center">
                    <button
                      @click="playUploadedSong(s)"
                      class="px-3 py-1.5 rounded-lg text-sm font-medium bg-green-600 hover:bg-green-500 text-white transition-colors"
                    >
                      {{
                        songStore.currentTrack?.id === s.id &&
                        songStore.isPlaying
                          ? "Pause"
                          : "Play"
                      }}
                    </button>
                  </div>
                </div>

                <!-- Empty State -->
                <div v-if="!uploads.length" class="text-center py-12">
                  <svg
                    class="w-16 h-16 text-gray-600 mx-auto mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  <p class="text-gray-400 text-lg font-medium mb-1">
                    No uploads found
                  </p>
                  <p class="text-gray-500">
                    This user hasn't uploaded any songs yet
                  </p>
                </div>
              </div>

              <!-- Pagination -->
              <div
                class="flex items-center justify-between pt-4 border-t border-gray-700/50"
              >
                <div class="text-sm text-gray-400">
                  Showing {{ Math.min(upPage * upLimit, upTotal) }} of
                  {{ upTotal }} uploads
                </div>
                <div class="flex gap-2">
                  <button
                    class="px-3 py-1 rounded-lg bg-gray-800/50 border border-green-500/20 text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-800 hover:border-green-500/40 transition-all duration-300"
                    :disabled="upPage === 1"
                    @click="upPage--"
                  >
                    Previous
                  </button>
                  <button
                    class="px-3 py-1 rounded-lg bg-gray-800/50 border border-green-500/20 text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-800 hover:border-green-500/40 transition-all duration-300"
                    :disabled="upPage * upLimit >= upTotal"
                    @click="upPage++"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- filepath: d:\Harmoniq\frontend\src\views\userprofile.vue -->
        <!-- REPORTS TAB -->
        <div v-else-if="tab === 'reports'" class="space-y-6">
          <div class="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
            <div class="flex items-center gap-3 mb-6">
              <div
                class="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30 flex items-center justify-center"
              >
                <svg
                  class="w-6 h-6 text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <div>
                <h3 class="text-xl font-bold text-white">User Reports</h3>
                <p class="text-gray-400">
                  {{ reports.length }} report{{
                    reports.length !== 1 ? "s" : ""
                  }}
                  submitted
                </p>
              </div>
            </div>

            <!-- Loading State -->
            <div
              v-if="repLoading"
              class="flex items-center justify-center py-12"
            >
              <div class="text-center">
                <div
                  class="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-3"
                ></div>
                <p class="text-gray-400">Loading reports...</p>
              </div>
            </div>

            <!-- Reports Grid -->
            <div
              v-else-if="reports.length"
              class="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
            >
              <article
                v-for="r in reports"
                :key="r.id"
                class="bg-gradient-to-br from-gray-800/40 to-black/60 rounded-2xl border border-green-500/20 p-5 hover:border-green-500/40 hover:shadow-lg hover:shadow-green-500/10 transition-all duration-300"
              >
                <!-- Header -->
                <header class="flex items-start justify-between gap-4 mb-4">
                  <div class="min-w-0 flex-1">
                    <div class="text-xs text-gray-400 mb-1">
                      {{ fmtDate(r.created_at) }}
                    </div>
                    <!-- <div class="text-white font-medium truncate">
                      {{ r.reporter_name || "Unknown User" }}
                    </div>
                    <div class="text-xs text-gray-500 truncate">
                      {{ r.reporter_email || "No email provided" }}
                    </div> -->
                  </div>
                  <div class="flex flex-col items-end gap-2 shrink-0">
                    <span
                      class="text-xs px-2 py-1 rounded-lg bg-gray-800/50 text-gray-300 border border-green-500/20"
                    >
                      {{ r.category }}
                    </span>
                    <span :class="badgeClass(r.status)">{{
                      labelStatus(r.status)
                    }}</span>
                  </div>
                </header>

                <!-- Issue Details -->
                <div class="mb-4">
                  <div class="text-xs text-gray-400 mb-2">Issue Details</div>
                  <div class="flex flex-wrap items-center gap-2 text-xs">
                    <span
                      class="px-2 py-1 rounded-lg bg-gray-800/50 text-gray-300 border border-green-500/20"
                    >
                      Type: {{ r.issue_type }}
                    </span>
                    <span
                      class="px-2 py-1 rounded-lg bg-gray-800/50 text-gray-300 border border-green-500/20"
                    >
                      ID: #{{ r.id }}
                    </span>
                  </div>
                </div>

                <!-- Description Preview -->
                <!-- <div class="mb-4">
                  <div class="text-xs text-gray-400 mb-1">Description</div>
                  <div class="text-sm text-gray-300 line-clamp-2">
                    {{ r.description || "No description provided" }}
                  </div>
                </div> -->

                <!-- Actions -->
                <footer
                  class="flex items-center justify-between gap-3 pt-3 border-t border-gray-700/50"
                >
                  <button
                    class="px-3 py-1.5 rounded-lg bg-green-500 text-white hover:bg-green-600 text-sm border border-green-400 transition-colors"
                    @click="openReport(r)"
                  >
                    View Report
                  </button>
                  <div class="flex items-center gap-2">
                    <select
                      v-model="statusDraft[r.id]"
                      class="rounded-lg bg-gray-800/50 border border-green-500/20 px-2 py-1 text-white focus:border-green-500 focus:outline-none text-sm"
                    >
                      <option
                        v-for="s in [
                          'pending',
                          'in_progress',
                          'rejected',
                          'completed',
                        ]"
                        :key="s"
                        :value="s"
                      >
                        {{ labelStatus(s) }}
                      </option>
                    </select>
                    <button
                      :disabled="
                        !statusDraft[r.id] ||
                        statusDraft[r.id] === r.status ||
                        saving[r.id]
                      "
                      @click="updateStatus(r)"
                      class="px-3 py-1 rounded-lg bg-green-500 text-white border border-green-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-600 text-sm"
                    >
                      {{ saving[r.id] ? "Saving..." : "Save" }}
                    </button>
                  </div>
                </footer>
              </article>
            </div>

            <!-- Empty State -->
            <div v-else class="text-center py-12">
              <svg
                class="w-16 h-16 text-gray-600 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <p class="text-gray-400 text-lg font-medium mb-1">
                No reports found
              </p>
              <p class="text-gray-500">
                This user hasn't submitted any reports yet
              </p>
            </div>
          </div>

          <!-- Modal for report details -->
          <transition name="fade">
            <div
              v-if="showModal && activeReport"
              class="fixed inset-0 z-50 flex items-center justify-center p-4"
              @keydown.esc="closeModal"
            >
              <div
                class="absolute inset-0 bg-black/80"
                @click="closeModal"
              ></div>
              <div
                class="relative z-10 w-full max-w-2xl rounded-xl bg-gray-800/50 border border-green-500/30 shadow-2xl max-h-[90vh] overflow-hidden"
              >
                <header
                  class="flex items-start justify-between p-6 border-b border-gray-700/50"
                >
                  <div class="min-w-0">
                    <h2 class="text-xl font-bold text-green-400 mb-1">
                      Report Details
                    </h2>
                    <div class="text-sm text-gray-400">
                      Submitted:
                      <span class="text-gray-300">{{
                        fmtDate(activeReport.created_at)
                      }}</span>
                    </div>
                  </div>
                  <button
                    class="p-2 rounded-lg bg-gray-800/50 hover:bg-gray-800 text-gray-400 hover:text-white transition-colors border border-green-500/20"
                    @click="closeModal"
                    aria-label="Close"
                  >
                    ✕
                  </button>
                </header>

                <div class="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    <!-- <div>
                      <div class="text-xs text-gray-400 mb-1">Reporter</div>
                      <div class="text-white font-medium">
                        {{ activeReport.reporter_name || "Unknown User" }}
                      </div>
                    </div>
                    <div>
                      <div class="text-xs text-gray-400 mb-1">Email</div>
                      <div class="text-green-400">
                        {{ activeReport.reporter_email || "Not provided" }}
                      </div>
                    </div> -->
                    <div>
                      <div class="text-xs text-gray-400 mb-1">Report ID</div>
                      <div class="text-white font-mono">
                        #{{ activeReport.id }}
                      </div>
                    </div>
                    <div>
                      <div class="text-xs text-gray-400 mb-1">Category</div>
                      <div class="text-white">{{ activeReport.category }}</div>
                    </div>
                    <div>
                      <div class="text-xs text-gray-400 mb-1">Issue Type</div>
                      <div class="text-white">
                        {{ activeReport.issue_type }}
                      </div>
                    </div>
                    <div>
                      <div class="text-xs text-gray-400 mb-1">
                        Current Status
                      </div>
                      <span :class="badgeClass(activeReport.status)">{{
                        labelStatus(activeReport.status)
                      }}</span>
                    </div>
                  </div>

                  <div class="mb-6">
                    <div class="text-sm text-gray-400 mb-2">Description</div>
                    <div
                      class="bg-gray-800/50 rounded-lg border border-green-500/20 p-4 max-h-64 overflow-auto"
                    >
                      <div class="text-white whitespace-pre-wrap">
                        {{
                          activeReport.description || "No description provided"
                        }}
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  class="flex items-center justify-end gap-3 p-6 border-t border-gray-700/50 bg-gray-800/30"
                >
                  <select
                    v-model="statusDraft[activeReport.id]"
                    class="rounded-lg bg-gray-800/50 border border-green-500/20 px-4 py-2 text-white focus:border-green-500 focus:outline-none"
                  >
                    <option
                      v-for="s in [
                        'pending',
                        'in_progress',
                        'rejected',
                        'completed',
                      ]"
                      :key="s"
                      :value="s"
                    >
                      {{ labelStatus(s) }}
                    </option>
                  </select>
                  <button
                    :disabled="
                      !statusDraft[activeReport.id] ||
                      statusDraft[activeReport.id] === activeReport.status ||
                      saving[activeReport.id]
                    "
                    @click="updateStatus(activeReport)"
                    class="px-4 py-2 rounded-lg bg-green-500 text-white border border-green-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-600"
                  >
                    {{
                      saving[activeReport.id] ? "Saving..." : "Update Status"
                    }}
                  </button>
                  <button
                    @click="closeModal"
                    class="px-4 py-2 rounded-lg bg-gray-800/50 text-white border border-gray-600 hover:bg-gray-800 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </transition>
        </div>

        <!-- ...existing code... -->
      </section>
    </div>

    <!-- Loading State Fallback -->
    <div v-else class="flex items-center justify-center py-20">
      <div class="text-center">
        <div
          class="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"
        ></div>
        <p class="text-gray-400">Loading user profile...</p>
      </div>
    </div>

    <!-- Music Player -->
    <div
      class="fixed left-0 right-0 bottom-0 z-50 border-t border-gray-800 bg-gray-900 md:left-60"
    >
      <MusicPlayer />
    </div>
  </div>
</template>

<style scoped>
/* Custom Scrollbar matching model upload theme */
.scrollbar-thin {
  scrollbar-width: thin;
  scrollbar-color: rgb(75 85 99) rgb(55 65 81);
}

.scrollbar-thin::-webkit-scrollbar {
  width: 6px;
}

.scrollbar-thin::-webkit-scrollbar-track {
  background: rgb(55 65 81);
  border-radius: 3px;
}

.scrollbar-thin::-webkit-scrollbar-thumb {
  background: rgb(75 85 99);
  border-radius: 3px;
}

.scrollbar-thin::-webkit-scrollbar-thumb:hover {
  background: rgb(107 114 128);
}

.scrollbar-track-gray-800 {
  scrollbar-color: rgb(75 85 99) rgb(55 65 81);
}

.scrollbar-thumb-gray-600 {
  scrollbar-color: rgb(75 85 99) rgb(55 65 81);
}

/* Fade transition for modal */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Enhanced hover effects */
.group:hover .group-hover\:scale-105 {
  transform: scale(1.05);
}

.group:hover .group-hover\:scale-100 {
  transform: scale(1);
}

.group:hover .group-hover\:scale-110 {
  transform: scale(1.1);
}

.group:hover .group-hover\:text-pink-300 {
  color: rgb(249 168 212);
}

.group:hover .group-hover\:text-blue-300 {
  color: rgb(147 197 253);
}

.group:hover .group-hover\:text-green-300 {
  color: rgb(134 239 172);
}

.group:hover .group-hover\:text-yellow-300 {
  color: rgb(253 224 71);
}

.group:hover .group-hover\:text-gray-300 {
  color: rgb(209 213 219);
}

/* Responsive grid improvements */
@media (max-width: 768px) {
  .grid-cols-1.md\:grid-cols-4,
  .grid-cols-1.md\:grid-cols-3 {
    gap: 0.75rem;
  }
}
</style>
