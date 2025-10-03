<script setup>
import { ref, onMounted } from 'vue'
import Heart from 'vue-material-design-icons/Heart.vue'
import apiClient from '../utils/axios'

const emit = defineEmits(["play"]);

const props = defineProps({
  track: { type: Object, required: true },
  index: { type: Number, required: true },
  duration: { type: String, default: '' },
  albumImage: { type: String, default: '/heart.jpeg' }
});

const fileServerBaseUrl = import.meta.env.VITE_FILE_SERVER || 'http://localhost:3000';

const isLiked = ref(false);
const user = ref(null);
const fetchUser = () => {
  const userData = localStorage.getItem('user_data');
  if (userData) {
    user.value = JSON.parse(userData);
    console.log('User data:', user.value);
  } else {
    router.push('/login');
  }
};

// Check initial liked state (optional: if your API supports it)
onMounted(async () => {
  fetchUser();
  if (!user.value) return;
  console.log('Fetching liked state for user:', user.value.id, 'and track:', props.track.id);
  try {
    const res = await apiClient.get(`/api/playlist/liked-songs/${user.value.id}`);
    isLiked.value = res.data.some(song => song.id === props.track.id);
  } catch (err) {
    console.error("Error fetching liked state:", err);
  }
});

const toggleLike = async () => {
  try {
    if (!isLiked.value) {
      await apiClient.post('/api/songs/like', { songId: props.track.id })
      isLiked.value = true
    } else {
      await apiClient.post('/api/songs/unlike', { songId: props.track.id })
      isLiked.value = false
    }
  } catch (err) {
    console.error("Toggle like error:", err)
  }
}
</script>

<template>
  <div
    class="flex items-center justify-between px-5 py-2 hover:bg-[#2a2a2a] rounded-md cursor-pointer"
    @click="emit('play', track)"
  >
    <!-- Left side: index + cover + title -->
    <div class="flex items-center space-x-3">
      <span class="text-gray-400 w-6">{{ index }}</span>

      <img 
        class="w-[30px] h-[30px] rounded-sm brightness-[0.5]" 
        :src="`${fileServerBaseUrl}/public/images/${albumImage || track.albumcover || 'default_album.png'}`"
        alt="Album Cover"
      />

      <span class="text-white font-medium truncate">{{ track.title }}</span>
    </div>

    <!-- Right side: heart + duration -->
    <div class="flex items-center space-x-3">
      <button type="button" @click.stop="toggleLike">
        <Heart :fillColor="isLiked ? '#1BD760' : '#FFFFFF'" :size="22" />
      </button>
      <div class="text-gray-400 text-sm">
        {{ duration }}
      </div>
    </div>
  </div>
</template>

<style scoped>
div:hover {
  transition: background-color 0.2s ease-in-out;
}
</style>
