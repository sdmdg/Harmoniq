<script>
import Heart from "vue-material-design-icons/Heart.vue";
import Play from "vue-material-design-icons/Play.vue";
import Pause from "vue-material-design-icons/Pause.vue";

export default {
  name: "PlaylistView",
  components: {
    Heart,
    Play,
    Pause,
  },
  data() {
    return {
      playlist: {
        title: "My Playlist",
        songs: [
          {
            id: "a1",
            title: "Alone - Alan Walker",
            duration: "03:45",
            genre: "Pop",
            mood: "Happy",
            track_order: 1,
            image: "http://localhost:3000/public/images/img1.jpeg",
            src: "http://localhost:3000/public/songs/Alan%20Walker%20-%20Alone.mp3",
          },
          {
            id: "a2",
            title: "Faded - Alan Walker",
            duration: "04:10",
            genre: "Rock",
            mood: "Energetic",
            track_order: 2,
            image: "http://localhost:3000/public/images/img2.jpeg",
            src: "http://localhost:3000/public/songs/Alan%20Walker%20-%20Faded.mp3",
          },
          {
            id: "a3",
            title: "Intro - Alan Walker",
            duration: "02:55",
            genre: "Jazz",
            mood: "Calm",
            track_order: 3,
            image: "http://localhost:3000/public/images/img3.jpeg",
            src: "http://localhost:3000/public/songs/Alan%20Walker%20-%20Intro.mp3",
          },
          {
            id: "a4",
            title: "Dream",
            duration: "05:20",
            genre: "Hip-Hop",
            mood: "Excited",
            track_order: 4,
            image: "http://localhost:3000/public/images/img4.jpeg",
            src: "http://localhost:3000/public/songs/Alan%20Walker%20-%20Dream.mp3",
          },
        ],
      },
      currentSongId: null,
      audio: null,
    };
  },
  computed: {
    currentSong() {
      return this.playlist.songs.find((s) => s.id === this.currentSongId) || null;
    },
  },
  methods: {
    togglePlay(song) {
      if (this.currentSongId === song.id) {
        // Pause current
        this.audio.pause();
        this.currentSongId = null;
      } else {
        if (this.audio) {
          this.audio.pause();
        }
        this.audio = new Audio(song.src);
        this.audio.play();
        this.currentSongId = song.id;
      }
    },
  },
};
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-gray-900 to-black p-6">
    <h1
      class="text-4xl font-extrabold mb-8 text-center text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-green-500"
    >
      {{ playlist.title }}
    </h1>

    <div class="grid grid-cols-4 gap-6">
      <!-- Left sidebar (Now Playing) -->
      <div
        class="col-span-1 flex flex-col items-center text-white bg-gray-800 rounded-xl p-6 shadow-lg"
      >
        <h2 class="text-lg font-bold mb-4">Now Playing</h2>

        <div v-if="currentSong" class="flex flex-col items-center text-center">
          <img
            :src="currentSong.image"
            alt="album art"
            class="w-48 h-48 rounded-lg shadow-md mb-4"
          />
          <h3 class="text-xl font-bold">{{ currentSong.title }}</h3>
          <p class="text-gray-400 text-sm mb-4">
            {{ currentSong.genre }} • {{ currentSong.mood }} •
            {{ currentSong.duration }}
          </p>

          <!-- Play/Pause control for current song -->
          <button
            @click="togglePlay(currentSong)"
            class="p-3 bg-green-500 hover:bg-green-600 rounded-full shadow-md"
          >
            <Play v-if="currentSongId !== currentSong.id" class="w-7 h-7 text-black" />
            <Pause v-else class="w-7 h-7 text-black" />
          </button>
        </div>

        <p v-else class="text-gray-400">No song playing</p>
      </div>

      <!-- Playlist (3/4 width) -->
      <div class="col-span-3">
        <ul class="flex flex-col gap-6">
          <li
            v-for="song in playlist.songs"
            :key="song.id"
            class="bg-gradient-to-r from-gray-800 via-gray-900 to-black rounded-xl p-6 flex flex-col md:flex-row justify-between items-center shadow-xl hover:scale-105 hover:shadow-2xl transition transform duration-300"
          >
            <!-- Song image -->
            <img
              :src="song.image"
              alt="album art"
              class="w-20 h-20 rounded-lg shadow-md"
            />

            <!-- Song details -->
            <div class="flex-1 md:ml-6 space-y-2">
              <h2 class="text-xl font-bold text-white">{{ song.title }}</h2>
              <p class="text-gray-400 text-sm md:text-base">
                {{ song.genre }} • {{ song.mood }} • {{ song.duration }}
              </p>
            </div>

            <!-- Actions -->
            <div class="flex items-center gap-4">
              <!-- Track order -->
              <span class="text-sm text-gray-400 font-mono"
                >#{{ song.track_order }}</span
              >

              <!-- Play/Pause -->
              <button
                @click="togglePlay(song)"
                class="p-2 bg-green-500 hover:bg-green-600 rounded-full shadow-md"
              >
                <Play
                  v-if="currentSongId !== song.id"
                  class="w-6 h-6 text-black"
                />
                <Pause v-else class="w-6 h-6 text-black" />
              </button>

              <!-- Like -->
              <button
                class="p-2 bg-pink-500 hover:bg-pink-600 rounded-full shadow-md"
              >
                <Heart class="w-6 h-6 text-white" />
              </button>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
