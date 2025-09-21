<template>
  <div class="p-8">
    <div class="mb-8">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-white text-2xl font-semibold">Your Playlists</h2>
        <RouterLink
          to="/playlists"
          class="text-gray-400 hover:text-white text-sm font-semibold transition-colors"
        >
          See All
        </RouterLink>
      </div>
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
        <div v-for="playlist in userPlaylists" :key="playlist.id">
          <PlaylistItem :playlist="playlist" />
        </div>
      </div>
    </div>

    <div class="mb-8">
      <h2 class="text-white text-2xl font-semibold mb-4">Liked Songs</h2>
      <div class="p-6 bg-gradient-to-br from-blue-700 to-indigo-900 rounded-lg shadow-xl relative overflow-hidden">
        <div class="absolute inset-0 opacity-20" style="background-image: url('https://picsum.photos/id/1040/1000/1000'); background-size: cover; background-position: center;"></div>
        <div class="relative z-10">
          <h3 class="text-white text-2xl font-bold mb-2">Liked Songs</h3>
          <p class="text-white text-sm">
            {{ likedSongsCount }} liked songs
          </p>
          <div class="mt-4">
            <RouterLink
              to="/liked-songs"
              class="inline-block bg-white text-black font-bold py-2 px-6 rounded-full hover:scale-105 transition-transform duration-200"
            >
              Play
            </RouterLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { RouterLink } from 'vue-router';
// Import the new components
import PlaylistItem from '../components/PlaylistItem.vue';
import AlbumItem from '../components/AlbumCard.vue';
import Play from 'vue-material-design-icons/Play.vue';

// Dummy data for demonstration
const userPlaylists = ref([
  { id: 1, title: 'Chill Vibes', cover: 'https://th.bing.com/th/id/R.db4a2b3b922ba40ddf1dd7ffff1ecc3c?rik=avaRZIRn9KPvhw&pid=ImgRaw&r=0' },
  { id: 2, title: 'Workout Mix', cover: 'https://tse3.mm.bing.net/th/id/OIP.U-MDyfkOMjUlwXitIWJ2NwHaEK?rs=1&pid=ImgDetMain&o=7&rm=3' },
  { id: 3, title: 'Road Trip', cover: 'https://tse2.mm.bing.net/th/id/OIP.Kvc5cYF-wO2BpEqmA6ntBQHaE8?rs=1&pid=ImgDetMain&o=7&rm=3' },
  { id: 4, title: 'Focus Music', cover: 'https://i.ytimg.com/vi/V7CiSaOznLk/maxresdefault.jpg' },
]);

const likedSongsCount = ref(0);

onMounted(() => {
  // fetchUserPlaylists();
  // fetchAlbums();
  // fetchLikedSongsCount();
  likedSongsCount.value = 54;
});
</script>