<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import apiClient from '../utils/axios';

const router = useRouter();
const totalUsers = ref(0);
const totalArtists = ref(0);
const totalSongs = ref(0);
const totalPlaylists = ref(0);

const fetchDashboardData = async () => {
    try {
        // Assume you have a new API endpoint for admin dashboard data
        const response = await apiClient.get('/api/admin/dashboard');
        const data = response.data;
        totalUsers.value = data.totalUsers;
        totalArtists.value = data.totalArtists;
        totalSongs.value = data.totalSongs;
        totalPlaylists.value = data.totalPlaylists;
    } catch (error) {
        console.error('Failed to fetch admin dashboard data:', error);
        // Handle unauthorized access, e.g., redirect to login
        if (error.response && error.response.status === 403) {
            router.push('/home'); // Or a dedicated unauthorized page
        }
    }
};

onMounted(() => {
    fetchDashboardData();
});
</script>

<template>
    <div class="p-8">
        <h1 class="text-3xl font-bold text-white mb-6">Admin Dashboard</h1>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div class="bg-[#181818] p-6 rounded-lg shadow-md">
                <h2 class="text-lg font-semibold text-gray-300">Total Users</h2>
                <p class="text-4xl font-bold text-white mt-2">{{ totalUsers }}</p>
            </div>
            <div class="bg-[#181818] p-6 rounded-lg shadow-md">
                <h2 class="text-lg font-semibold text-gray-300">Total Artists</h2>
                <p class="text-4xl font-bold text-white mt-2">{{ totalArtists }}</p>
            </div>
            <div class="bg-[#181818] p-6 rounded-lg shadow-md">
                <h2 class="text-lg font-semibold text-gray-300">Total Songs</h2>
                <p class="text-4xl font-bold text-white mt-2">{{ totalSongs }}</p>
            </div>
            <div class="bg-[#181818] p-6 rounded-lg shadow-md">
                <h2 class="text-lg font-semibold text-gray-300">Total Playlists</h2>
                <p class="text-4xl font-bold text-white mt-2">{{ totalPlaylists }}</p>
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
            <h2 class="text-xl font-bold text-white mb-4">Recent Activity</h2>
            <p class="text-gray-400">Recent user sign-ups, song uploads, and other activities will be displayed here.</p>
        </div>
    </div>
</template>