<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";
import apiClient from "../utils/axios";
import admin_Recentactivity from "../components/admin_Recentactivity.vue";
const router = useRouter();
const totalUsers = ref(0);
const totalArtists = ref(0);
const totalSongs = ref(0);
const totalPlaylists = ref(0);

const loading = ref(false);
const err = ref("");

async function fetchDashboardData() {
  loading.value = true;
  err.value = "";
  try {
    const { data } = await apiClient.get("/api/admin/dashboard");
    totalUsers.value = data.totalUsers ?? 0;
    totalArtists.value = data.totalArtists ?? 0;
    totalSongs.value = data.totalSongs ?? 0;
    totalPlaylists.value = data.totalPlaylists ?? 0;
  } catch (error) {
    console.error("Failed to fetch admin dashboard data:", error);
    const status = error?.response?.status;

    if (status === 401) {
      // not authenticated or token expired
      router.push("/login");
      return;
    }
    if (status === 403) {
      // authenticated but not admin
      router.push("/home");
      return;
    }
    err.value = error?.response?.data?.message || "Something went wrong.";
  } finally {
    loading.value = false;
  }
}

// optional: refetch when tab becomes active again
function onVisibility() {
  if (document.visibilityState === "visible") fetchDashboardData();
}

onMounted(() => {
  fetchDashboardData();
  document.addEventListener("visibilitychange", onVisibility);
});
onBeforeUnmount(() => {
  document.removeEventListener("visibilitychange", onVisibility);
});
</script>

<template>
  <div class="p-8">
    <h1 class="text-3xl font-bold text-green-500 mb-6">Admin Dashboard</h1>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <!-- Users -->
      <RouterLink
        to="/adminUsersManage"
        class="block bg-gray-800/50 p-6 rounded-lg shadow-md hover:bg-gray-800/70 focus:outline-none focus:ring-2 focus:ring-green-500 cursor-pointer"
        aria-label="View all users"
      >
        <h2 class="text-lg font-semibold text-gray-300">Total Users</h2>
        <p class="text-4xl font-bold text-white mt-2">{{ totalUsers }}</p>
      </RouterLink>
      <RouterLink
        to="/adminUsersManage"
        class="block bg-gray-800/50 p-6 rounded-lg shadow-md hover:bg-gray-800/70 focus:outline-none focus:ring-2 focus:ring-green-500 cursor-pointer"
        aria-label="View all artists"
      >
        <h2 class="text-lg font-semibold text-gray-300">Total Artists</h2>
        <p class="text-4xl font-bold text-white mt-2">{{ totalArtists }}</p>
      </RouterLink>
      <RouterLink
        to="/adminSongsManage"
        class="block bg-gray-800/50 p-6 rounded-lg shadow-md hover:bg-gray-800/70 focus:outline-none focus:ring-2 focus:ring-green-500 cursor-pointer"
        aria-label="View all songs"
      >
        <h2 class="text-lg font-semibold text-gray-300">Total Songs</h2>
        <p class="text-4xl font-bold text-white mt-2">{{ totalSongs }}</p>
      </RouterLink>
      <RouterLink
        to="/admin/playlists"
        class="block bg-gray-800/50 p-6 rounded-lg shadow-md hover:bg-gray-800/70 focus:outline-none focus:ring-2 focus:ring-green-500 cursor-pointer"
        aria-label="View all playlists"
      >
        <h2 class="text-lg font-semibold text-gray-300">Total Playlists</h2>
        <p class="text-4xl font-bold text-white mt-2">{{ totalPlaylists }}</p>
      </RouterLink>
    </div>

    <!-- Admin Actions -->
    <div class="bg-gray-800/50 p-6 rounded-lg shadow-md mb-8">
      <h2 class="text-xl font-bold text-white mb-4">Admin Actions</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <RouterLink
          to="/admin/model-upload"
          class="flex items-center justify-center p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-semibold"
        >
          <svg
            class="w-5 h-5 mr-2"
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
          Upload AI Models
        </RouterLink>

        <RouterLink
          to="/adminUsersManage"
          class="flex items-center justify-center p-4 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-semibold"
        >
          <svg
            class="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
            />
          </svg>
          Manage Users
        </RouterLink>

        <RouterLink
          to="/adminSongsManage"
          class="flex items-center justify-center p-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-semibold"
        >
          <svg
            class="w-5 h-5 mr-2"
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
          Manage Songs
        </RouterLink>
      </div>
    </div>

    <!--         <div class="bg-[#181818] p-6 rounded-lg shadow-md mb-8">
            <h2 class="text-xl font-bold text-white mb-4">Quick Actions</h2>
            <div class="flex flex-wrap gap-4">
                <button class="bg-[#1ED760] hover:bg-[#1DB954] text-black font-bold py-2 px-4 rounded-full transition duration-200">Manage Users</button>
                <button class="bg-[#1ED760] hover:bg-[#1DB954] text-black font-bold py-2 px-4 rounded-full transition duration-200">Manage Artists</button>
                <button class="bg-[#1ED760] hover:bg-[#1DB954] text-black font-bold py-2 px-4 rounded-full transition duration-200">Review Uploads</button>
                <button class="bg-[#1ED760] hover:bg-[#1DB954] text-black font-bold py-2 px-4 rounded-full transition duration-200">System Logs</button>
            </div>
        </div> -->

    <div class="bg-[#181818] p-6 rounded-lg shadow-md">
      <admin_-recentactivity :initialLimit="10" />
    </div>
  </div>
</template>
