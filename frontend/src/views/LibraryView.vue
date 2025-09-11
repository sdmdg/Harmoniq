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

    <div class="mb-8">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-white text-2xl font-semibold">Albums</h2>
        <RouterLink
          to="/albums"
          class="text-gray-400 hover:text-white text-sm font-semibold transition-colors"
        >
          See All
        </RouterLink>
      </div>
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
        <div v-for="album in albums" :key="album.id">
          <AlbumItem :album="album" />
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
import AlbumItem from '../components/AlbumItem.vue';
import Play from 'vue-material-design-icons/Play.vue';

// Dummy data for demonstration
const userPlaylists = ref([
  { id: 1, title: 'Chill Vibes', cover: 'https://th.bing.com/th/id/R.db4a2b3b922ba40ddf1dd7ffff1ecc3c?rik=avaRZIRn9KPvhw&pid=ImgRaw&r=0' },
  { id: 2, title: 'Workout Mix', cover: 'https://tse3.mm.bing.net/th/id/OIP.U-MDyfkOMjUlwXitIWJ2NwHaEK?rs=1&pid=ImgDetMain&o=7&rm=3' },
  { id: 3, title: 'Road Trip', cover: 'https://tse2.mm.bing.net/th/id/OIP.Kvc5cYF-wO2BpEqmA6ntBQHaE8?rs=1&pid=ImgDetMain&o=7&rm=3' },
  { id: 4, title: 'Focus Music', cover: 'https://i.ytimg.com/vi/V7CiSaOznLk/maxresdefault.jpg' },
]);

const albums = ref([
  { id: '34bf0bbd-ab57-457f-a9b3-1b2d271285fd', title: 'Different World', artist: 'Alan Walker', cover: 'http://localhost:3000/public/images/2732e7ca-66e5-4ae5-b17e-47624c87949c' },
  { id: '89b47003-6f5c-4c2b-a910-606217908198', title: 'Nine Track Mind', artist: 'charl', cover: 'http://localhost:3000/public/images/22e5a58f-4d87-4715-9669-4c736dc2e1c6' },
  { id: '8b97eb52-4aea-4333-91d2-c0c128210b3b', title: 'Lover', artist: 'Alan Walker', cover: 'http://localhost:3000/public/images/cb163513-4e23-47d2-bf63-b1c6c089eb94' },
  { id: '8d6890ef-5710-439b-aebb-c21f6485f2ad', title: 'Speak Now (Deluxe Package)', artist: 'Alan Walker', cover: 'http://localhost:3000/public/images/484d54a1-1eac-4b6f-8a94-6a3ed599a0c3' },
  { id: '8f641b04-fbe9-416c-8549-69bc7d2fcf80', title: 'Voicenotes', artist: 'Alan Walker', cover: 'http://localhost:3000/public/images/c89894db-6c94-4030-bafb-3fe59cc92f13' },
  { id: 'e6346070-fb8a-4bd9-ab6b-ef26596d587a', title: '1989 (Deluxe)', artist: 'Alan Walker', cover: 'http://localhost:3000/public/images/ae8b588a-ab3b-48a6-9ad4-2230f7c9b936' },
]);

const likedSongsCount = ref(0);

onMounted(() => {
  // fetchUserPlaylists();
  // fetchAlbums();
  // fetchLikedSongsCount();
  likedSongsCount.value = 54;
});
</script>