<template>
  <div class="relative w-full h-full bg-[#000000] overflow-auto">
    <div
    class="relative flex flex-col md:flex-row items-end h-[350px] md:h-[400px] text-white p-6"
    :style="`background: linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,1)), url('${artist.image}'); background-size: cover; background-position: center;`"
    >
    <div class="relative z-10 flex flex-col justify-end w-full h-full">
        <p class="text-xs font-bold mb-1">Artist</p>
        <h1 class="text-3xl md:text-6xl font-bold font-sans">{{ artist.name }}</h1>
        <div class="flex items-center text-sm font-light mt-2">
        <p>{{ artist.monthlyAudience }} monthly listeners</p>
        </div>
        <p class="text-sm font-light text-gray-300 mt-2 max-w-2xl">{{ artist.description }}</p>
    </div>
    </div>

    <div class="p-6">
      <div class="flex items-center mb-6">
        <button class="bg-[#1ED760] text-black font-bold py-3 px-6 rounded-full hover:scale-105 transition-transform duration-200 flex items-center whitespace-nowrap">
            <Play fillColor="#000000" :size="20" />
            <span class="ml-2">Shuffle</span>
        </button>
        <button class="ml-4 bg-transparent border border-gray-500 text-white font-bold py-3 px-6 rounded-full hover:bg-gray-800 transition-colors duration-200">
          <span class="ml-2">Follow</span>
        </button>
      </div>

      <div>
        <h2 class="text-2xl font-bold mb-4 text-white">Top songs</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-4">
          <div v-for="(song, index) in artist.topSongs" :key="index" class="flex items-center space-x-4 p-2 rounded-lg hover:bg-gray-800 transition-colors duration-200 cursor-pointer">
            <img :src="song.cover" alt="Song Cover" class="w-12 h-12 rounded-lg object-cover">
            <div>
              <p class="text-white font-semibold truncate">{{ song.title }}</p>
              <p class="text-gray-400 text-sm">{{ song.artist }}</p>
            </div>
            <div class="ml-auto text-gray-400 text-sm">
              {{ song.plays }} plays
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { RouterLink } from 'vue-router';
import Play from 'vue-material-design-icons/Play.vue';

// Dummy data for a fictional artist and their songs
const artist = ref({
  name: 'Alan Walker',
  monthlyAudience: '238M',
  description: `Alan Walker teams up with Sofia Reyes and Farruko for his new single Old Habits, dropping August 8. Get ready! Pre-Save here: https://ffm.to/old-habits
Alan first burst onto the scene in late 2015 with his debut hit single “Faded,” which now nears 4 billion views on YouTube. With over 160 million followers across his social platforms, 50 billion YouTube views, and over 90 billion total streams, the young artist from Bergen, Norway, is just getting started. On August 8, he’s introducing a whole new universe for Walkers: a fan-powered future where shared interest becomes community. Sign up now at 
www.worldofwalker.com`,
  image: 'https://lh3.googleusercontent.com/1-Ipiq-y8WyAcWn88nuxwTHaaBWMg8VkCBuP3puDCec-neD3v-7SqoBRzmmBKmA-lir_Ie70yw9EKHk=w1920-h800-p-l90-rj',
  topSongs: [
    { title: 'Faded', artist: 'Alan Walker', plays: '5.3B', cover: 'https://lh3.googleusercontent.com/WbQvmYqxKwEbLPj5zSlYe5vrxipjJAaCxqB1cJxyzljnvIr9i4Ix9fyxK9h9BXq5a3jyvPdvGKI_2vWXnA=w544-h544-l90-rj' },
    { title: 'On My Way', artist: 'Alan Walker', plays: '1.5B', cover: 'https://lh3.googleusercontent.com/WbQvmYqxKwEbLPj5zSlYe5vrxipjJAaCxqB1cJxyzljnvIr9i4Ix9fyxK9h9BXq5a3jyvPdvGKI_2vWXnA=w544-h544-l90-rj' },
    { title: 'All Falls Down', artist: 'Alan Walker', plays: '900M', cover: 'https://lh3.googleusercontent.com/mOxS-HGSPLkUsQIlZZP7drX1x-ewJT5YW8O8FKt5HWR5lZ2b8NAQldscy6n8TV34dQKkND2489goh3zH=w544-h544-l90-rj' },
    { title: 'Alone', artist: 'Alan Walker', plays: '1.2B', cover: 'https://lh3.googleusercontent.com/Y19VtLffjcBZ2gMjaD_aMf2w_G4GX49EnycaJDA0tVzIn4GMKn0-sY6njoodgOquCfvUpyKyOp1jYZch9A=w544-h544-l90-rj' },
  ],
});
</script>