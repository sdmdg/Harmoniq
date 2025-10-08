<template>
  <div class="min-h-screen bg-black text-white">
    <!-- Header -->
    <div class="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm">
      <div class="px-6 py-4">
        <h1 class="text-2xl font-bold text-green-400">Album Management</h1>
        <p class="text-gray-400 text-sm mt-1">
          Manage all albums on your platform
        </p>
      </div>
    </div>

    <div class="p-6 space-y-6">
      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
          <div class="text-gray-400 text-sm">Total Albums</div>
          <div class="text-2xl font-bold text-white">{{ total }}</div>
        </div>
        <div class="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
          <div class="text-gray-400 text-sm">Active Albums</div>
          <div class="text-2xl font-bold text-white">
            {{ albums.filter((a) => !a.isBlocked).length }}
          </div>
        </div>
        <div class="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
          <div class="text-gray-400 text-sm">Blocked Albums</div>
          <div class="text-2xl font-bold text-white">
            {{ albums.filter((a) => a.isBlocked).length }}
          </div>
        </div>
        <div class="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
          <div class="text-gray-400 text-sm">Total Tracks</div>
          <div class="text-2xl font-bold text-white">
            {{ albums.reduce((sum, a) => sum + (a.trackCount || 0), 0) }}
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="bg-gray-900/30 border border-gray-800 rounded-lg p-4">
        <div
          class="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between"
        >
          <div
            class="flex flex-col sm:flex-row gap-3 items-start sm:items-center flex-1"
          >
            <div class="relative flex-1 max-w-md">
              <input
                v-model="search"
                class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 pr-10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Search albums by title or artist..."
                @keydown.enter="loadAlbums()"
              />
              <div class="absolute right-3 top-2.5 flex items-center gap-1">
                <button
                  v-if="search"
                  @click="clearSearch"
                  class="text-gray-400 hover:text-white transition-colors duration-200"
                  title="Clear search"
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
                      d="M6 18L18 6M6 6l12 12"
                    ></path>
                  </svg>
                </button>
                <svg
                  class="w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  ></path>
                </svg>
              </div>
            </div>

            <div class="flex gap-2">
              <button
                class="px-4 py-2 rounded-lg border transition-all duration-200 text-sm font-medium"
                :class="
                  statusFilter === 'all'
                    ? 'bg-green-600 border-green-600 text-white'
                    : 'border-gray-700 text-gray-300 hover:border-green-500 hover:text-green-400'
                "
                @click="statusFilter = 'all'"
              >
                All Albums
              </button>
              <button
                class="px-4 py-2 rounded-lg border transition-all duration-200 text-sm font-medium"
                :class="
                  statusFilter === 'active'
                    ? 'bg-green-600 border-green-600 text-white'
                    : 'border-gray-700 text-gray-300 hover:border-green-500 hover:text-green-400'
                "
                @click="statusFilter = 'active'"
              >
                Active
              </button>
              <button
                class="px-4 py-2 rounded-lg border transition-all duration-200 text-sm font-medium"
                :class="
                  statusFilter === 'blocked'
                    ? 'bg-green-600 border-green-600 text-white'
                    : 'border-gray-700 text-gray-300 hover:border-green-500 hover:text-green-400'
                "
                @click="statusFilter = 'blocked'"
              >
                Blocked
              </button>
            </div>
          </div>

          <div class="flex gap-3">
            <button
              @click="loadAlbums()"
              :disabled="loading"
              class="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-lg font-medium transition-colors duration-200"
            >
              {{ loading ? "Loading..." : "Refresh" }}
            </button>
          </div>
        </div>
      </div>

      <!-- Albums Table -->
      <div
        class="bg-gray-900/30 border border-gray-800 rounded-lg overflow-hidden"
      >
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-800/50 border-b border-gray-700">
              <tr>
                <th
                  class="text-left py-3 px-4 text-gray-300 font-medium text-sm"
                >
                  Album
                </th>
                <th
                  class="text-left py-3 px-4 text-gray-300 font-medium text-sm"
                >
                  Artist
                </th>
                <th
                  class="text-left py-3 px-4 text-gray-300 font-medium text-sm"
                >
                  Year
                </th>
                <th
                  class="text-left py-3 px-4 text-gray-300 font-medium text-sm"
                >
                  Tracks
                </th>
                <th
                  class="text-left py-3 px-4 text-gray-300 font-medium text-sm"
                >
                  Status
                </th>
                <th
                  class="text-right py-3 px-4 text-gray-300 font-medium text-sm"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="album in filteredAlbums"
                :key="album.id"
                class="border-b border-gray-800 hover:bg-gray-800/30 transition-colors duration-150"
              >
                <td class="py-3 px-4">
                  <div class="font-medium text-white">{{ album.name }}</div>
                </td>
                <td class="py-3 px-4">
                  <div class="text-gray-300">{{ album.artistName }}</div>
                </td>
                <td class="py-3 px-4">
                  <div class="text-gray-400">
                    {{ album.releaseYear || "—" }}
                  </div>
                </td>
                <td class="py-3 px-4">
                  <div class="text-gray-300">{{ album.trackCount || 0 }}</div>
                </td>
                <td class="py-3 px-4">
                  <span
                    :class="[
                      'px-2 py-1 rounded-full text-xs font-medium',
                      album.isBlocked
                        ? 'bg-red-900/50 text-red-300 border border-red-500/30'
                        : 'bg-green-900/50 text-green-300 border border-green-500/30',
                    ]"
                  >
                    {{ album.isBlocked ? "Blocked" : "Active" }}
                  </span>
                </td>
                <td class="py-3 px-4">
                  <div class="flex gap-2 justify-end">
                    <button
                      @click="viewAlbum(album.id)"
                      class="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium transition-colors duration-200"
                    >
                      View
                    </button>
                    <button
                      @click="playAlbum(album.id)"
                      class="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm font-medium transition-colors duration-200"
                    >
                      Play
                    </button>
                    <button
                      v-if="!album.isBlocked"
                      @click="blockAlbum(album)"
                      :disabled="busyId === album.id"
                      class="px-3 py-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white rounded text-sm font-medium transition-colors duration-200"
                    >
                      {{ busyId === album.id ? "Blocking..." : "Block" }}
                    </button>
                    <button
                      v-else
                      @click="unblockAlbum(album)"
                      :disabled="busyId === album.id"
                      class="px-3 py-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded text-sm font-medium transition-colors duration-200"
                    >
                      {{ busyId === album.id ? "Unblocking..." : "Unblock" }}
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          <!-- Empty State -->
          <div
            v-if="!loading && filteredAlbums.length === 0"
            class="text-center py-12"
          >
            <svg
              class="mx-auto h-12 w-12 text-gray-400 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
              ></path>
            </svg>
            <p class="text-gray-400 text-lg">No albums found</p>
            <p class="text-gray-500 text-sm">
              Try adjusting your search or filter criteria
            </p>
          </div>

          <!-- Loading State -->
          <div v-if="loading" class="text-center py-12">
            <div
              class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"
            ></div>
            <p class="text-gray-400 mt-2">Loading albums...</p>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div
        class="flex items-center justify-between text-sm text-gray-400"
        v-if="!loading"
      >
        <div>
          Showing {{ (page - 1) * limit + 1 }} to
          {{ Math.min(page * limit, total) }} of {{ total }} albums
        </div>
        <div class="flex gap-2">
          <button
            @click="prevPage()"
            :disabled="page <= 1"
            class="px-3 py-2 border border-gray-700 rounded-lg hover:border-green-500 hover:text-green-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            Previous
          </button>
          <button
            @click="nextPage()"
            :disabled="page >= pageCount"
            class="px-3 py-2 border border-gray-700 rounded-lg hover:border-green-500 hover:text-green-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from "vue";
import { useRouter } from "vue-router";
import { useSongStore } from "../stores/song";
import apiClient from "../utils/axios";

const router = useRouter();
const useSong = useSongStore();

// Reactive data
const albums = ref([]);
const total = ref(0);
const page = ref(1);
const limit = ref(20);
const pageCount = ref(1);
const search = ref("");
const statusFilter = ref("all");
const loading = ref(false);
const busyId = ref(null);

// Environment config
const fileServerBaseUrl =
  import.meta.env.VITE_FILE_SERVER || "http://localhost:3000";
const API_BASE = import.meta.env.VITE_BACKEND_SERVER || "http://localhost:5000";

// Computed properties
const filteredAlbums = computed(() => {
  let filtered = albums.value;

  if (statusFilter.value === "active") {
    filtered = filtered.filter((album) => !album.isBlocked);
  } else if (statusFilter.value === "blocked") {
    filtered = filtered.filter((album) => album.isBlocked);
  }

  return filtered;
});

// Utility functions
// (Cover-related functions removed as cover column is no longer needed)

// API functions
async function loadAlbums() {
  loading.value = true;
  try {
    const params = new URLSearchParams({
      page: String(page.value),
      limit: String(limit.value),
      search: search.value.trim(),
      includeBlocked: "true",
    });

    console.log("Loading albums from:", `/api/album/list?${params.toString()}`);
    const response = await apiClient.get(
      `/api/album/list?${params.toString()}`
    );

    console.log("Album response:", response.data);

    if (response.data) {
      // Handle both array response and paginated response
      if (Array.isArray(response.data)) {
        albums.value = response.data;
        total.value = response.data.length;
        pageCount.value = 1;
        console.log("Loaded albums (array):", albums.value.length);
      } else {
        albums.value =
          response.data.items || response.data.albums || response.data;
        total.value = response.data.total || albums.value.length;
        page.value = response.data.page || 1;
        pageCount.value =
          response.data.pageCount || Math.ceil(total.value / limit.value);
        console.log("Loaded albums (object):", albums.value.length);
      }
    }
  } catch (error) {
    console.error("Failed to load albums:", error);
    console.error("Error details:", error.response?.data || error.message);
    // Handle authentication errors
    if (error.response?.status === 401) {
      router.push("/login");
      return;
    } else if (error.response?.status === 403) {
      router.push("/home");
      return;
    }
    albums.value = [];
    alert("Failed to load albums. Please try again.");
  } finally {
    loading.value = false;
  }
}

async function blockAlbum(album) {
  if (
    !confirm(
      `Block the album "${album.name}"? This will make it unavailable to users.`
    )
  )
    return;

  busyId.value = album.id;
  try {
    await apiClient.patch(`/api/album/${album.id}/block`);
    await loadAlbums(); // Reload to get updated data
  } catch (error) {
    console.error("Failed to block album:", error);
    alert("Failed to block album. Please try again.");
  } finally {
    busyId.value = null;
  }
}

async function unblockAlbum(album) {
  if (
    !confirm(
      `Unblock the album "${album.name}"? This will make it available to users again.`
    )
  )
    return;

  busyId.value = album.id;
  try {
    await apiClient.patch(`/api/album/${album.id}/unblock`);
    await loadAlbums(); // Reload to get updated data
  } catch (error) {
    console.error("Failed to unblock album:", error);
    alert("Failed to unblock album. Please try again.");
  } finally {
    busyId.value = null;
  }
}

async function viewAlbum(albumId) {
  router.push(`/album/${albumId}`);
}

async function playAlbum(albumId) {
  try {
    // Fetch album details with tracks
    const response = await apiClient.get(`/api/album/get/${albumId}`);
    const albumData = response.data;

    if (albumData && albumData.tracks && albumData.tracks.length > 0) {
      // Create artist object for the song store
      const artist = {
        id: albumData.artistId,
        name: albumData.artist,
        tracks: albumData.tracks,
      };

      // Play the first track
      const firstTrack = albumData.tracks[0];
      useSong.loadSong(artist, firstTrack);
    } else {
      alert("No tracks found in this album.");
    }
  } catch (error) {
    console.error("Failed to play album:", error);
    alert("Failed to play album. Please try again.");
  }
}

// Pagination
function prevPage() {
  if (page.value > 1) {
    page.value--;
    loadAlbums();
  }
}

function nextPage() {
  if (page.value < pageCount.value) {
    page.value++;
    loadAlbums();
  }
}

// Search functionality
function reload() {
  page.value = 1;
  loadAlbums();
}

function clearSearch() {
  search.value = "";
  reload();
}

// Watch for search and filter changes
let searchTimeout;

watch(search, (newSearch) => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    console.log("Search changed to:", newSearch);
    reload();
  }, 300); // Reduced debounce time for more responsive search
});

watch(statusFilter, () => {
  console.log("Status filter changed to:", statusFilter.value);
  // No need to reload for status filter since it's client-side filtering
});

// Lifecycle
onMounted(() => {
  loadAlbums();
});
</script>

<style scoped>
/* Ensure consistent spacing and styling */
.table-row:hover {
  background-color: rgba(31, 41, 55, 0.3);
}

/* Custom scrollbar for the table */
.overflow-x-auto::-webkit-scrollbar {
  height: 6px;
}

.overflow-x-auto::-webkit-scrollbar-track {
  background: rgba(31, 41, 55, 0.5);
  border-radius: 3px;
}

.overflow-x-auto::-webkit-scrollbar-thumb {
  background: rgba(34, 197, 94, 0.5);
  border-radius: 3px;
}

.overflow-x-auto::-webkit-scrollbar-thumb:hover {
  background: rgba(34, 197, 94, 0.7);
}

/* Loading animation */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

/* Button hover effects */
button:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(34, 197, 94, 0.5);
}

/* Status badge animations */
.status-badge {
  transition: all 0.2s ease-in-out;
}

.status-badge:hover {
  transform: scale(1.05);
}
</style>
