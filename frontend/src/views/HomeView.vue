<script setup>
import { ref, onMounted } from 'vue'
import apiClient from '../utils/axios'
import HomeCard from '../components/HomeCard.vue'

const recentSongs = ref([])
const loading = ref(true)
const error = ref(null)

const fileServerBaseUrl = import.meta.env.VITE_FILE_SERVER || 'http://localhost:3000';

const fetchRecentSongs = async () => {
  try {
    loading.value = true
    const response = await apiClient.get('/api/profile/recent')
    recentSongs.value = response.data
  } catch (err) {
    console.error('Error fetching recent songs:', err)
    error.value = 'Failed to load songs.'
  } finally {
    loading.value = false
  }
}

onMounted(fetchRecentSongs)
</script>

<template>
  <div class="p-8">
    <div>
      <h1
        class="text-white text-2xl font-semibold"
      >
        Listen again
      </h1>
    </div>

    <div class="py-1.5"></div>

    <div v-if="loading" class="text-gray-400">Loading...</div>
    <div v-else-if="error" class="text-red-500">{{ error }}</div>

    <div v-else class="flex items-center space-x-4 overflow-x-auto">
      <HomeCard
        v-for="(song, index) in recentSongs"
        :key="song.id || index"
        :image="`${fileServerBaseUrl}/public/images/${song.cover_image || 'default_album.png'}`"
        :title="song.title"
        :subTitle="song.artist"
      />
    </div>
  </div>
</template>
