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
      <RouterLink to="/adminUsersManage" 
        class="block bg-gray-800/50 p-6 rounded-lg shadow-md
        hover:bg-gray-800/70 focus:outline-none focus:ring-2
        focus:ring-green-500 cursor-pointer" aria-label="View all users" >
        <h2 class="text-lg font-semibold text-gray-300">Total Users</h2>
        <p class="text-4xl font-bold text-white mt-2">{{ totalUsers }}</p>
      </RouterLink>
      <RouterLink
        to="/adminUsersManage"    
        class="block bg-gray-800/50 p-6 rounded-lg shadow-md hover:bg-gray-800/70
               focus:outline-none focus:ring-2 focus:ring-green-500 cursor-pointer"
        aria-label="View all artists"
      >
        <h2 class="text-lg font-semibold text-gray-300">Total Artists</h2>
        <p class="text-4xl font-bold text-white mt-2">{{ totalArtists }}</p>
      </RouterLink>
      <RouterLink
        to="/adminSongsManage"     
        class="block bg-gray-800/50 p-6 rounded-lg shadow-md hover:bg-gray-800/70
               focus:outline-none focus:ring-2 focus:ring-green-500 cursor-pointer"
        aria-label="View all songs"
      >
        <h2 class="text-lg font-semibold text-gray-300">Total Songs</h2>
        <p class="text-4xl font-bold text-white mt-2">{{ totalSongs }}</p>
      </RouterLink>
       <RouterLink
        to="/admin/playlists" 
        class="block bg-gray-800/50 p-6 rounded-lg shadow-md hover:bg-gray-800/70
               focus:outline-none focus:ring-2 focus:ring-green-500 cursor-pointer"
        aria-label="View all playlists"
      >
        <h2 class="text-lg font-semibold text-gray-300">Total Playlists</h2>
        <p class="text-4xl font-bold text-white mt-2">{{ totalPlaylists }}</p>
      </RouterLink>
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
