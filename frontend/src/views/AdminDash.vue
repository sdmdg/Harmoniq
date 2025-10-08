<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";
import apiClient from "../utils/axios";
import admin_Recentactivity from "../components/admin_Recentactivity.vue";
const router = useRouter();
const totalUsers = ref(0);
const totalArtists = ref(0);
const totalSongs = ref(0);
const totalAlbums = ref(0);

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
    totalAlbums.value = data.totalAlbums ?? 0;
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
    <div class="mb-8">
      <h1 class="text-4xl font-bold text-green-400 mb-2">Admin Dashboard</h1>
      <p class="text-gray-400">Monitor and manage your music platform</p>
    </div>

    <!-- Stats Cards with better layout -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
      <!-- Users -->
      <RouterLink
        to="/adminUsersManage"
        class="group relative bg-gradient-to-br from-teal-600/20 to-cyan-800/20 border border-teal-500/30 p-6 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer transition-all duration-300"
        aria-label="View all users"
      >
        <div class="flex items-center justify-between mb-4">
          <div
            class="w-12 h-12 bg-teal-500/20 rounded-lg flex items-center justify-center group-hover:bg-teal-500/30 transition-colors"
          >
            <svg
              class="w-6 h-6 text-teal-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"
              ></path>
            </svg>
          </div>
          <div class="text-right">
            <h2 class="text-sm font-medium text-teal-300 mb-1">Total Users</h2>
            <p class="text-3xl font-bold text-white">{{ totalUsers }}</p>
          </div>
        </div>
        <div
          class="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-b-xl"
        ></div>
      </RouterLink>

      <!-- Artists -->
      <RouterLink
        to="/adminUsersManage"
        class="group relative bg-gradient-to-br from-violet-600/20 to-indigo-800/20 border border-violet-500/30 p-6 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 focus:outline-none focus:ring-2 focus:ring-violet-500 cursor-pointer transition-all duration-300"
        aria-label="View all artists"
      >
        <div class="flex items-center justify-between mb-4">
          <div
            class="w-12 h-12 bg-violet-500/20 rounded-lg flex items-center justify-center group-hover:bg-violet-500/30 transition-colors"
          >
            <svg
              class="w-6 h-6 text-violet-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fill-rule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z"
                clip-rule="evenodd"
              ></path>
            </svg>
          </div>
          <div class="text-right">
            <h2 class="text-sm font-medium text-violet-300 mb-1">
              Total Artists
            </h2>
            <p class="text-3xl font-bold text-white">{{ totalArtists }}</p>
          </div>
        </div>
        <div
          class="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 to-indigo-500 rounded-b-xl"
        ></div>
      </RouterLink>

      <!-- Songs -->
      <RouterLink
        to="/adminSongsManage"
        class="group relative bg-gradient-to-br from-green-600/20 to-green-800/20 border border-green-500/30 p-6 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500 cursor-pointer transition-all duration-300"
        aria-label="View all songs"
      >
        <div class="flex items-center justify-between mb-4">
          <div
            class="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center group-hover:bg-green-500/30 transition-colors"
          >
            <svg
              class="w-6 h-6 text-green-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.369 4.369 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z"
              ></path>
            </svg>
          </div>
          <div class="text-right">
            <h2 class="text-sm font-medium text-green-300 mb-1">Total Songs</h2>
            <p class="text-3xl font-bold text-white">{{ totalSongs }}</p>
          </div>
        </div>
        <div
          class="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 to-green-600 rounded-b-xl"
        ></div>
      </RouterLink>

      <!-- Albums -->
      <RouterLink
        to="/adminAlbumsManage"
        class="group relative bg-gradient-to-br from-orange-600/20 to-red-800/20 border border-orange-500/30 p-6 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer transition-all duration-300"
        aria-label="View all albums"
      >
        <div class="flex items-center justify-between mb-4">
          <div
            class="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center group-hover:bg-orange-500/30 transition-colors"
          >
            <svg
              class="w-6 h-6 text-orange-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fill-rule="evenodd"
                d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                clip-rule="evenodd"
              ></path>
            </svg>
          </div>
          <div class="text-right">
            <h2 class="text-sm font-medium text-orange-300 mb-1">
              Total Albums
            </h2>
            <p class="text-3xl font-bold text-white">{{ totalAlbums }}</p>
          </div>
        </div>
        <div
          class="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-red-600 rounded-b-xl"
        ></div>
      </RouterLink>
    </div>

    <!-- Admin Actions -->
    <div
      class="bg-gradient-to-r from-gray-800/50 to-gray-900/50 border border-gray-700/50 p-8 rounded-xl shadow-lg mb-8"
    >
      <div class="mb-6">
        <h2 class="text-2xl font-bold text-white mb-2">Admin Actions</h2>
        <p class="text-gray-400">Quick access to administrative functions</p>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <RouterLink
          to="/admin/model-upload"
          class="group flex items-center justify-center p-4 bg-gradient-to-br from-teal-600/20 to-cyan-800/20 border border-teal-500/30 text-white rounded-lg transition-all duration-300 font-semibold shadow-lg hover:shadow-xl hover:scale-105 hover:from-teal-600/30 hover:to-cyan-800/30"
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
          class="group flex items-center justify-center p-4 bg-gradient-to-br from-green-600/20 to-green-800/20 border border-green-500/30 text-white rounded-lg transition-all duration-300 font-semibold shadow-lg hover:shadow-xl hover:scale-105 hover:from-green-600/30 hover:to-green-800/30"
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
          class="group flex items-center justify-center p-4 bg-gradient-to-br from-violet-600/20 to-indigo-800/20 border border-violet-500/30 text-white rounded-lg transition-all duration-300 font-semibold shadow-lg hover:shadow-xl hover:scale-105 hover:from-violet-600/30 hover:to-indigo-800/30"
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

        <RouterLink
          to="/adminAlbumsManage"
          class="group flex items-center justify-center p-4 bg-gradient-to-br from-orange-600/20 to-red-800/20 border border-orange-500/30 text-white rounded-lg transition-all duration-300 font-semibold shadow-lg hover:shadow-xl hover:scale-105 hover:from-orange-600/30 hover:to-red-800/30"
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
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
          Manage Albums
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
