<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 p-4">
    <div class="bg-[#0a0a0a] rounded-xl shadow-2xl p-8 w-full max-w-md text-white border border-gray-700 transform transition-all scale-100 opacity-100 animate-fade-in">
      
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold text-gray-100">Create New Playlist</h2>
        <button @click="$emit('close')" class="text-gray-400 hover:text-white transition-colors duration-200 focus:outline-none text-3xl leading-none">
          &times;
        </button>
      </div>
      
      <div class="mb-5">
        <label for="playlistName" class="block text-sm font-semibold text-gray-300 mb-2">Playlist Name</label>
        <input
          id="playlistName"
          v-model="playlistName"
          type="text"
          class="w-full bg-[#282828] text-white rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#1ED760] transition-all duration-200 placeholder-gray-500 border border-transparent hover:border-gray-600"
          placeholder="e.g., Chill Vibes, Workout Mix"
        />
      </div>

      <div class="mb-5">
        <label class="block text-sm font-semibold text-gray-300 mb-2">Generate based on...</label>
        <select
          v-model="selectedOption"
          class="w-full bg-[#282828] text-white rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#1ED760] transition-all duration-200 border border-transparent hover:border-gray-600 appearance-none pr-8"
        >
          <option value="">Select an option (Optional)</option>
          <option value="mood">Mood</option>
          <option value="genre">Genre</option>
        </select>
      </div>

      <div v-if="selectedOption === 'mood'" class="mb-5">
        <label for="mood" class="block text-sm font-semibold text-gray-300 mb-2">Select Mood</label>
        <select
          id="mood"
          v-model="selectedMood"
          class="w-full bg-[#282828] text-white rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#1ED760] transition-all duration-200 border border-transparent hover:border-gray-600 appearance-none pr-8"
        >
          <option value="">Select a mood</option>
          <option v-for="mood in moods" :key="mood" :value="mood">{{ mood }}</option>
        </select>
      </div>

      <div v-if="selectedOption === 'genre'" class="mb-5">
        <label for="genre" class="block text-sm font-semibold text-gray-300 mb-2">Select Genre</label>
        <select
          id="genre"
          v-model="selectedGenre"
          class="w-full bg-[#282828] text-white rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#1ED760] transition-all duration-200 border border-transparent hover:border-gray-600 appearance-none pr-8"
        >
          <option value="">Select a genre</option>
          <option v-for="genre in genres" :key="genre" :value="genre">{{ genre }}</option>
        </select>
      </div>

      <div class="flex justify-end space-x-3 mt-6">
        <button
          @click="$emit('close')"
          class="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2.5 px-6 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          Cancel
        </button>
        <button
          @click="createPlaylist"
          :disabled="!playlistName"
          class="bg-[#1ED760] hover:bg-[#1DB954] text-black font-bold py-2.5 px-6 rounded-full transition-colors duration-200 disabled:bg-gray-500 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#1ED760]"
        >
          Create Playlist
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, defineProps, defineEmits, watch ,onMounted} from 'vue';
import apiClient from '../utils/axios';
import { useRoute, useRouter } from 'vue-router';
const props = defineProps({
    isOpen: {
        type: Boolean,
        required: true,
    },
});
const router = useRouter();
const route = useRoute();
const emit = defineEmits(['close', 'playlistCreated']);
const user = ref(null);
const playlistName = ref('');
const selectedOption = ref('');
const selectedMood = ref('');
const selectedGenre = ref('');

// Static data for moods and genres
const moods = ['Chill', 'Happy', 'Energetic', 'Relaxing', 'Sad', 'Angry', 'Romantic'];
const genres = ['Pop', 'Rock', 'Hip Hop', 'Jazz', 'Electronic', 'Classical', 'R&B', 'Country', 'Metal', 'Blues'];

// Watch the isOpen prop and reset fields when it changes to false
watch(() => props.isOpen, (newValue) => {
    if (newValue === false) {
        playlistName.value = '';
        selectedOption.value = '';
        selectedMood.value = '';
        selectedGenre.value = '';
    }
});
const fetchUser = () => {
  const userData = localStorage.getItem('user_data');
  if (userData) {
    user.value = JSON.parse(userData);
    console.log('User data:', user.value);
  } else {
    router.push('/login');
  }
};

onMounted(() => {
  fetchUser();
});
const createPlaylist = async () => {
  if (!playlistName.value) return;

  try {
    const payload = {
      userId: user.value.id,
      title: playlistName.value,  // ✅ match DB column
      type: selectedOption.value || "custom",
      mood: selectedMood.value,
      genre: selectedGenre.value,
    };

    const response = await apiClient.post(
      "api/recommend/createWithRecommendations",
      payload
    );

    emit("playlistCreated", {
      ...response.data.playlist,
      songs: response.data.songs,
    });

    emit("close");
  } catch (error) {
    console.error("Failed to create playlist:", error);
    alert("Failed to create playlist. Please try again.");
  }
};

</script>

<style scoped>
/* Optional: Add custom animation for a smoother modal appearance */
@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
.animate-fade-in {
  animation: fadeIn 0.3s ease-out forwards;
}

/* Custom styling for select dropdown arrow if needed, though appearance-none handles it */
select {
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='none'%3e%3cpath d='M7 7l3-3 3 3m0 6l-3 3-3-3' stroke='%239CA3AF' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3e%3c/svg%3e");
  background-position: right 0.75rem center;
  background-repeat: no-repeat;
  background-size: 1.5em 1.5em;
}
</style>