<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
    <div class="bg-[#181818] rounded-lg shadow-lg p-6 w-96 text-white">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-bold">Create a new playlist</h2>
        <button @click="$emit('close')" class="text-gray-400 hover:text-white">&times;</button>
      </div>
      
      <div class="mb-4">
        <label for="playlistName" class="block text-sm font-semibold mb-2">Playlist Name</label>
        <input
          id="playlistName"
          v-model="playlistName"
          type="text"
          class="w-full bg-[#282828] text-white rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#1ED760]"
          placeholder="e.g., Chill Vibes"
        />
      </div>

      <div class="mb-6">
        <label class="block text-sm font-semibold mb-2">Generate based on...</label>
        <select
          v-model="selectedOption"
          class="w-full bg-[#282828] text-white rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#1ED760]"
        >
          <option value="">Select an option</option>
          <option value="mood">Mood</option>
          <option value="genre">Genre</option>
        </select>
      </div>

      <div v-if="selectedOption === 'mood'" class="mb-6">
        <label for="mood" class="block text-sm font-semibold mb-2">Select Mood</label>
        <select
          id="mood"
          v-model="selectedMood"
          class="w-full bg-[#282828] text-white rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#1ED760]"
        >
          <option v-for="mood in moods" :key="mood" :value="mood">{{ mood }}</option>
        </select>
      </div>

      <div v-if="selectedOption === 'genre'" class="mb-6">
        <label for="genre" class="block text-sm font-semibold mb-2">Select Genre</label>
        <select
          id="genre"
          v-model="selectedGenre"
          class="w-full bg-[#282828] text-white rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#1ED760]"
        >
          <option v-for="genre in genres" :key="genre" :value="genre">{{ genre }}</option>
        </select>
      </div>

      <div class="flex justify-end space-x-4">
        <button
          @click="$emit('close')"
          class="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-full transition-colors"
        >
          Cancel
        </button>
        <button
          @click="createPlaylist"
          :disabled="!playlistName"
          class="bg-[#1ED760] hover:bg-[#1DB954] text-black font-bold py-2 px-4 rounded-full transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed"
        >
          Create Playlist
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, defineProps, defineEmits, watch } from 'vue';
import apiClient from '../utils/axios';

const props = defineProps({
    isOpen: {
        type: Boolean,
        required: true,
    },
});

const emit = defineEmits(['close', 'playlistCreated']);

const playlistName = ref('');
const selectedOption = ref('');
const selectedMood = ref('');
const selectedGenre = ref('');

// Static data for moods and genres
const moods = ['Chill', 'Happy', 'Energetic', 'Relaxing'];
const genres = ['Pop', 'Rock', 'Hip Hop', 'Jazz', 'Electronic'];

// Watch the isOpen prop and reset fields when it changes to false
watch(() => props.isOpen, (newValue) => {
    if (newValue === false) {
        playlistName.value = '';
        selectedOption.value = '';
        selectedMood.value = '';
        selectedGenre.value = '';
    }
});

const createPlaylist = async () => {
    if (!playlistName.value) return;

    try {
        const payload = {
            name: playlistName.value,
            type: selectedOption.value || 'custom', // Default to 'custom' if no option is selected
            mood: selectedMood.value,
            genre: selectedGenre.value,
        };

        // Send the playlist data to the backend
        const response = await apiClient.post('api/playlist/add', payload);

        emit('playlistCreated', response.data);
        
        // The fields will be reset by the watcher when the modal closes, so we can emit 'close'
        // This makes the logic cleaner since we only have one place to handle resetting
        emit('close');

    } catch (error) {
        console.error('Failed to create playlist:', error);
    }
};
</script>