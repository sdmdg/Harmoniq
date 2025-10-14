<template>
  <div class="p-8">
    <!-- User Playlists -->
    <div class="mb-8">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-white text-2xl font-semibold">Your Playlists</h2>
      </div>

      <!-- Empty State -->
      <div v-if="!userPlaylists.length" class="text-gray-400 text-center py-6">
        <p class="text-lg font-semibold">No playlists yet</p>
        <p class="text-sm mt-2">
          Start by creating your first playlist and add your favorite tracks!
        </p>
      </div>

      <!-- Playlist Grid -->
      <div
        class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6"
      >
        <div
          v-for="playlist in userPlaylists"
          :key="playlist.id"
          class="relative group bg-[#181818] p-4 rounded-lg hover:bg-[#282828] transition duration-200"
        >
          <!-- Playlist Item -->
          <PlaylistItem :playlist="playlist" />

          <!-- Delete Button -->
          <button
            @click.stop="deletePlaylist(playlist.id)"
            class="absolute top-2 right-2 flex items-center justify-center bg-red-600 hover:bg-red-700 text-white text-sm w-7 h-7 rounded-full shadow-md transition-all duration-300 z-10"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Liked Songs -->
    <div class="mb-8">
      <h2 class="text-white text-2xl font-semibold mb-4">Liked Songs</h2>
      <div
        class="p-6 bg-gradient-to-br from-blue-700 to-indigo-900 rounded-lg shadow-xl relative overflow-hidden"
      >
        <div
          class="absolute inset-0 opacity-20"
          style="
            background-image: url('https://picsum.photos/id/1040/1000/1000');
            background-size: cover;
            background-position: center;
          "
        ></div>
        <div class="relative z-10">
          <h3 class="text-white text-2xl font-bold mb-2">Liked Songs</h3>
          <p class="text-white text-sm">{{ likedSongsCount }} liked songs</p>
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

    <!-- User Songs -->
    <div class="mb-8">
      <h2 class="text-white text-2xl font-semibold mb-4">Your Songs</h2>
      <div
        v-if="collection && collection.tracks && collection.tracks.length === 0"
        class="text-gray-400 text-center py-6"
      >
        <p class="text-lg font-semibold">No songs yet</p>
        <p class="text-sm mt-2">
          Start uploading songs to build your collection
        </p>
      </div>

      <div v-else>
        <div class="flex flex-col md:flex-row gap-6">
          <div class="w-full">
            <div class="mt-6 md:mt-0">
              <!-- Header -->
              <div class="flex items-center justify-between px-3 md:px-5 pt-2">
                <div class="flex items-center text-gray-400">
                  <div class="mr-4 md:mr-7 text-xs md:text-sm">#</div>
                  <div class="text-xs md:text-sm">Title</div>
                </div>
                <ClockTimeThreeOutline fillColor="#FFFFFF" :size="18" />
              </div>

              <div
                class="border-b border-b-[#2A2A2A] mt-2 mb-3 md:mb-4"
              ></div>

              <!-- Tracks -->
              <ul class="w-full space-y-1">
                <li
                  v-for="(track, index) in collection?.tracks || []"
                  :key="track.id"
                >
                  <SongRow
                    :artist="collection"
                    :track="track"
                    :index="index + 1"
                    :duration="formatDuration(track.duration)"
                    :can-liked="false"
                  />
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { RouterLink } from "vue-router";
import PlaylistItem from "../components/PlaylistItems.vue";
import apiClient from "../utils/axios";
import SongRow from "../components/SongRow.vue";
import { useSongStore } from "../stores/song";
import { storeToRefs } from "pinia";

const useSong = useSongStore();
const { isPlaying, currentTrack, currentArtist } = storeToRefs(useSong);

const userPlaylists = ref([]);
const likedSongsCount = ref(0);
const user = ref(null);
const collection = ref(null);

// Fetch user
const fetchUser = () => {
  const userData = localStorage.getItem("user_data");
  if (userData) {
    user.value = JSON.parse(userData);
  } else {
    router.push("/login");
  }
};

// Fetch playlists
const fetchUserPlaylists = async () => {
  try {
    const response = await apiClient.get("api/playlist/get/all");
    userPlaylists.value = response.data;
    console.log("Fetched user playlists:", userPlaylists.value);
  } catch (error) {
    console.error("Failed to fetch user playlists:", error);
  }
};

// Delete playlist
const deletePlaylist = async (playlistId) => {
  if (!confirm("Are you sure you want to delete this playlist?")) return;

  try {
    await apiClient.delete(`/api/playlist/delete/${playlistId}`);
    userPlaylists.value = userPlaylists.value.filter(
      (p) => p.id !== playlistId
    );
    alert("✅ Playlist deleted successfully!");
  } catch (error) {
    console.error("Failed to delete playlist:", error);
    alert("❌ Failed to delete playlist.");
  }
};

// Fetch liked songs count
const fetchUserlikedSongCount = async () => {
  if (!user.value) return;
  try {
    const res = await apiClient.get(`/api/playlist/liked-songs/${user.value.id}`);
    likedSongsCount.value = res.data.tracks.length;
  } catch (err) {
    console.error("Error fetching liked songs:", err);
  }
};

// Fetch user's songs
const fetchUserSongs = async () => {
  if (!user.value) return;
  try {
    const response = await apiClient.get(`/api/profile/getUserSongs/${user.value.id}`);
    const tracks = response.data.tracks || [];

    const formattedTracks = tracks.map((track) => ({
      id: track.id,
      name: track.title,
      title: track.title,
      artist: track.artist || "Unknown Artist",
      albumCover: track.albumcover || "default_album.png",
      duration: track.duration,
      album_id: track.album_id,
      encryption_key: track.encryption_key || "",
      key: track.encryption_key || "",
      path: track.id ? `${track.id}.mp3` : "",
    }));

    collection.value = {
      name: "Liked Songs",
      albumCover: "/images/icons/liked-songs.png",
      image: "/images/icons/liked-songs.png",
      tracks: formattedTracks,
    };
  } catch (err) {
    console.error("Error fetching liked songs:", err);
    collection.value = { name: "Liked Songs", tracks: [] };
  }
};

onMounted(() => {
  fetchUser();
  fetchUserSongs();
  fetchUserPlaylists();
  fetchUserlikedSongCount();
});

// Duration formatting
const formatDuration = (durationString) => {
  if (!durationString) return "";
  const [minutes, seconds] = durationString.split(";");
  return `${minutes}:${seconds?.padStart(2, "0") || "00"}`;
};
</script>
