<script setup>
import { ref, onMounted, watch } from "vue";
import { RouterLink, RouterView, useRoute, useRouter } from "vue-router";
import MenuItem from "./components/MenuItem.vue";
import MusicPlayer from "./components/MusicPlayer.vue";
import ChevronUp from "vue-material-design-icons/ChevronUp.vue";
import ChevronDown from "vue-material-design-icons/ChevronDown.vue";
import Plus from "vue-material-design-icons/Plus.vue";
import CreatePlaylistModal from "./components/CreatePlaylistModal.vue";

import { useSongStore } from "./stores/song";

import { storeToRefs } from "pinia";
import apiClient from "./utils/axios.js";

const router = useRouter();
const useSong = useSongStore();
// Use destructuring for isPlaying from storeToRefs for reactivity
const { isPlaying, currentTrack } = storeToRefs(useSong);

const isModalOpen = ref(false);
let openMenu = ref(false);
const userName = ref("");
const profileImageUrl = ref("");
const userPlaylists = ref([]);
const fileServerBaseUrl = import.meta.env.VITE_FILE_SERVER;
const userRole = ref(""); // Reactive variable for the user's role

const route = useRoute();

const hideSidebar = () => route.meta.hideSidebar || false;
const hideTopNav = () => route.meta.hideTopNav || false;
const hidePlayer = () => route.meta.hidePlayer || false;

// Function to fetch album data, to be called when needed
const fetchAlbumData = async (albumId) => {
  if (albumId) {
    console.log(`Route changed to album ID: ${albumId}`);
    await useSong.fetchAlbum(albumId);
  }
};

const updateUserData = () => {
  // Check if the user is authenticated (e.g., by checking for user data in localStorage)
  const userData = localStorage.getItem("user_data");
  if (userData) {
    // Only fetch data if the user is logged in
    fetchUser();
    fetchUserPlaylists();
  }
};

// Watch for any change in the route's path
watch(
  () => route.fullPath,
  () => {
    updateUserData();
  }
);

// Initial data fetch on component mount
onMounted(() => {
  isPlaying.value = false;
  updateUserData();
});

// Watch for changes to the album_id route parameter and fetch album data
watch(
  () => route.params.album_id,
  (newAlbumId) => {
    fetchAlbumData(newAlbumId);
  },
  { immediate: true }
); // 'immediate: true' ensures the watch runs on initial component load as well

const fetchUser = async () => {
  const userData = localStorage.getItem("user_data");
  if (userData) {
    const parsedUser = JSON.parse(userData);
    userName.value = parsedUser.username || "";
    userRole.value = parsedUser.role || "user";
    try {
      const response = await apiClient.get(
        `api/profile/image/${parsedUser.id}`
      );
      profileImageUrl.value = `${fileServerBaseUrl}/public/images/${response.data.pic_path}`;
    } catch (error) {
      console.error("Failed to fetch profile image:", error);
    }
  } else {
    router.push("/login");
  }
};

const fetchUserPlaylists = async () => {
  try {
    const response = await apiClient.get("api/playlist/get/all");
    userPlaylists.value = response.data;
  } catch (error) {
    console.error("Failed to fetch user playlists:", error);
  }
};

const createPlaylist = () => {
  isModalOpen.value = true;
};

const handlePlaylistCreated = (newPlaylist) => {
  // Add the newly created playlist to the local list
  userPlaylists.value.push(newPlaylist);
  // Close the modal
  isModalOpen.value = false;
  fetchUserPlaylists();
};

const logout = () => {
  localStorage.removeItem("jwt_token");
  localStorage.removeItem("song");
  localStorage.removeItem("user_data");
  sessionStorage.clear();
  window.location.href = "/login";
};

// Use onMounted to fetch initial data
onMounted(() => {
  isPlaying.value = false;
  fetchUser();
  fetchUserPlaylists();
});
</script>

<template>
  <div class="min-h-screen bg-black">
    <div
      v-if="!hideSidebar()"
      id="SideNav"
      class="h-[100%] p-6 w-[240px] fixed z-50 bg-black"
    >
      <RouterLink to="/home">
        <img
          class="transition-transform duration-200 hover:scale-105 active:scale-95"
          width="180"
          src="/images/icons/logo.png"
          alt="Logo"
        />
      </RouterLink>
      <div class="my-8"></div>
      <ul>
        <RouterLink v-if="userRole !== 'admin'" to="/home">
          <MenuItem
            class="ml-[1px]"
            :iconSize="23"
            name="Home"
            iconString="home"
            pageUrl="/home"
          />
        </RouterLink>
        <RouterLink v-if="userRole !== 'admin'" to="/library">
          <MenuItem
            class="ml-[2px]"
            :iconSize="23"
            name="Your Library"
            iconString="library"
            pageUrl="/library"
          />
        </RouterLink>
        <!--     -->
        <RouterLink v-if="userRole == 'admin'" to="/admin-dashboard">
          <MenuItem :iconSize="24" name="Dashboard" iconString="home" />
        </RouterLink>

        <RouterLink v-if="userRole == 'admin'" to="/reports">
          <MenuItem :iconSize="24" name="Report" iconString="library" />
        </RouterLink>

        <!--     -->
        <RouterLink v-if="userRole == 'admin'" to="/adminSongsManage">
          <MenuItem :iconSize="24" name="Songs" iconString="playlist" />
        </RouterLink>

        <RouterLink v-if="userRole !== 'admin'" to="/liked-songs">
          <MenuItem
            class="-ml-[1px]"
            :iconSize="27"
            name="Liked Songs"
            iconString="liked"
            pageUrl="/liked-songs"
          />
        </RouterLink>
        <RouterLink v-if="userRole == 'admin'" to="/adminUsersManage">
          <MenuItem :iconSize="24" name="Users" iconString="playlist" />
             </RouterLink
        >
        <RouterLink v-if="userRole !== 'admin'" to="/upload">
          <MenuItem :iconSize="24" name="Upload Songs" iconString="playlist" />
        </RouterLink>
        <RouterLink v-if="userRole !== 'admin'" to="/reportIssue">
          <MenuItem
            :iconSize="24"
            name="Report an Issue"
            iconString="playlist"
          />
        </RouterLink>
        <RouterLink
          v-if="userRole !== 'admin' && userRole !== 'listener'"
          to="/albums"
        >
          <MenuItem :iconSize="24" name="Albums" iconString="playlist" />
        </RouterLink>
      </ul>

      <div
        v-if="userRole !== 'admin'"
        class="border-b border-b-gray-700 my-4"
      ></div>

      <div>
        <button
          v-if="userRole !== 'admin'"
          @click="createPlaylist"
          class="flex items-center text-gray-300 font-semibold text-[13px] hover:text-white mb-4 transition-colors"
        >
          <div class="bg-white rounded-sm p-1">
            <Plus :size="20" fillColor="#101010" />
          </div>
          <div class="ml-3">Create Playlist</div>
        </button>

        <div
          v-if="userRole !== 'admin'"
          class="border-b border-b-gray-700 my-4"
        ></div>

        <div class="overflow-y-auto h-[360px] scrollbar-hidden">
          <ul class="space-y-0">
            <li v-for="playlist in userPlaylists" :key="playlist.id">
              <RouterLink :to="`/playlist/${playlist.id}`">
                <MenuItem
                  :iconSize="24"
                  :name="playlist.title"
                  iconString="playlist"
                />
              </RouterLink>
            </li>
          </ul>
        </div>
      </div>

      <CreatePlaylistModal
        :isOpen="isModalOpen"
        @close="isModalOpen = false"
        @playlist-created="handlePlaylistCreated"
      />
    </div>

    <div
      v-if="!hideTopNav()"
      id="TopNav"
      class="w-[calc(100%-240px)] h-[60px] fixed right-0 z-20 bg-[#101010] bg-opacity-80 flex items-center justify-between px-6"
      style="
        background-color: rgba(16, 16, 16, 0.8);
        backdrop-filter: blur(10px);
      "
    >
      <div class="flex items-center space-x-4">
        <div class="relative flex items-center">
          <input
            type="text"
            placeholder="What do you want to listen to?"
            class="w-full md:w-[300px] bg-[#282828] text-white rounded-full py-2 px-4 pr-10 focus:outline-none focus:ring-2 focus:ring-[#1ED760]"
          />
          <svg
            class="absolute right-3 w-5 h-5 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>
      <div class="relative">
        <button
          @click="openMenu = !openMenu"
          :class="openMenu ? 'bg-[#282828]' : 'bg-black'"
          class="bg-black hover:bg-[#282828] rounded-full p-0.5 mt-0.5 cursor-pointer"
        >
          <div class="flex items-center">
            <img
              class="rounded-full object-cover w-8 h-8"
              :src="
                profileImageUrl ||
                'http://localhost:3000/public/images/default.png'
              "
              alt="Profile Image"
            />
            <div class="text-white text-[14px] ml-1.5 font-semibold">
              {{ userName }}
            </div>
            <ChevronDown v-if="!openMenu" fillColor="#FFFFFF" :size="25" />
            <ChevronUp v-else fillColor="#FFFFFF" :size="25" />
          </div>
        </button>
        <span
          v-if="openMenu"
          class="fixed w-[190px] bg-[#282828] shadow-2xl z-50 rounded-lg top-[52px] right-[35px] py-2 px-1 text-gray-200"
        >
          <ul class="font-semibold text-sm">
            <RouterLink to="/profile">
              <li
                class="px-3 py-2 rounded-md hover:bg-[#3e3d3d] transition-colors duration-200"
              >
                Profile
              </li>
            </RouterLink>
            <div class="my-2 border-t border-t-gray-600"></div>
            <li
              class="px-3 py-2 rounded-md hover:bg-[#3e3d3d] transition-colors duration-200"
              @click="logout"
            >
              Log out
            </li>
          </ul>
        </span>
      </div>
    </div>

    <div
      :class="{
        'w-full': hideSidebar(),
        'w-[calc(100%-240px)]': !hideSidebar(),
      }"
      class="fixed right-0 top-0 overflow-auto h-full bg-gradient-to-b from-[#000] to-black"
    >
      <div v-if="!hideTopNav()" class="mt-[70px] bg-opacity-0"></div>
      <RouterView />
      <div v-if="!hidePlayer()" class="mb-[100px] bg-opacity-0"></div>
    </div>

    <MusicPlayer v-if="currentTrack && !hidePlayer()" />
  </div>
</template>

<style scoped>
/* CSS to hide the scrollbar */
.scrollbar-hidden::-webkit-scrollbar {
  display: none;
}
.scrollbar-hidden {
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */
}
</style>
