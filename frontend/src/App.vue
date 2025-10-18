<script setup>
import { ref, onMounted, watch, onUnmounted } from "vue";
import { RouterLink, RouterView, useRoute, useRouter } from "vue-router";
import MenuItem from "./components/MenuItem.vue";
import MusicPlayer from "./components/MusicPlayer.vue";
import ChevronUp from "vue-material-design-icons/ChevronUp.vue";
import ChevronDown from "vue-material-design-icons/ChevronDown.vue";
import Plus from "vue-material-design-icons/Plus.vue";
import Menu from "vue-material-design-icons/Menu.vue";
import Close from "vue-material-design-icons/Close.vue";
import CreatePlaylistModal from "./components/CreatePlaylistModal.vue";
import SearchResults from "./components/SearchResults.vue";
import { useSongStore } from "./stores/song";
import AccentBackground from "./components/AccentBackground.vue";

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
const isSidebarOpen = ref(false); // Mobile sidebar toggle

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
    isSidebarOpen.value = false; // Close sidebar on route change
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
    //router.push("/login");
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
  if (!window.location.pathname.includes("password-reset")) {
    isPlaying.value = false;
    fetchUser();
    fetchUserPlaylists();
  }
});

const searchQuery = ref("");
const searchResults = ref(null);
const isSearching = ref(false);
const searchContainer = ref(null);

const handleSearch = async () => {
  if (!searchQuery.value.trim() || searchQuery.value.trim().length < 2) {
    searchResults.value = null;
    return;
  }
  try {
    isSearching.value = true;
    const response = await apiClient.get(
      `/api/search/all?query=${encodeURIComponent(searchQuery.value)}`
    );
    searchResults.value = response.data; // { tracks:[], albums:[], artists:[] }
  } catch (error) {
    console.error("Search failed:", error);
  } finally {
    isSearching.value = false;
  }
};

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});

const handleClickOutside = (event) => {
  if (searchContainer.value && !searchContainer.value.contains(event.target)) {
    searchResults.value = null;
  }
};

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
});

// Toggle sidebar for mobile
const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value;
};
</script>

<template>
  <div class="min-h-screen bg-black">
    <!-- Mobile Menu Button -->
    <button
      v-if="!isSidebarOpen"
      @click="toggleSidebar"
      class="lg:hidden fixed top-4 left-4 z-[60] bg-black hover:bg-[#282828] rounded-full p-2 transition-colors"
    >
    <Menu class="z-[60]" v-if="!isSidebarOpen && !hideSidebar()" fillColor="#FFFFFF" :size="24" />

    </button>

    <!-- Overlay for mobile sidebar -->
    <div
      v-if="isSidebarOpen && !hideSidebar()"
      @click="isSidebarOpen = false"
      class="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
    ></div>

    <!-- Sidebar -->
    <div
      v-if="!hideSidebar()"
      id="SideNav"
      :class="{
        'translate-x-0': isSidebarOpen,
        '-translate-x-full': !isSidebarOpen,
      }"
      class="h-full p-6 w-[240px] fixed z-50 bg-black transition-transform duration-300 lg:translate-x-0 overflow-y-auto"
    >
      <RouterLink to="/home">
        <img
          class="transition-transform duration-200"
          width="180"
          src="/images/icons/logo.png"
          alt="Logo"
        />
      </RouterLink>

      <div class="my-8"></div>

      <ul>
        <!--  Listener & Artist   -->
        <RouterLink v-if="userRole !== 'admin'" to="/home">
          <MenuItem :iconSize="23" name="Home" iconString="home" />
        </RouterLink>
        <RouterLink v-if="userRole !== 'admin'" to="/library">
          <MenuItem :iconSize="23" name="Your Library" iconString="library" />
        </RouterLink>
        <RouterLink v-if="userRole !== 'admin'" to="/liked-songs">
          <MenuItem :iconSize="23" name="Liked Songs" iconString="liked" />
        </RouterLink>

        <!--  Specific Features   -->
        <div
          v-if="userRole !== 'admin'"
          class="border-b border-b-gray-700 my-4"
        ></div>
        <RouterLink v-if="userRole !== 'admin'" to="/upload">
          <MenuItem :iconSize="23" name="Upload Songs" iconString="upload" />
        </RouterLink>
        <RouterLink v-if="userRole == 'artist'" to="/albums">
          <MenuItem :iconSize="23" name="My Albums" iconString="album" />
        </RouterLink>
        <RouterLink v-if="userRole !== 'admin'" to="/reportIssue">
          <MenuItem
            :iconSize="23"
            name="Report an Issue"
            iconString="report"
          />
        </RouterLink>

        <!--  Admin   -->
        <RouterLink v-if="userRole == 'admin'" to="/admin-dashboard">
          <MenuItem :iconSize="23" name="Dashboard" iconString="home" />
        </RouterLink>
        <RouterLink v-if="userRole == 'admin'" to="/reports">
          <MenuItem :iconSize="23" name="Report" iconString="report" />
        </RouterLink>
        <RouterLink v-if="userRole == 'admin'" to="/adminSongsManage">
          <MenuItem :iconSize="23" name="Songs" iconString="song" />
        </RouterLink>
        <RouterLink v-if="userRole == 'admin'" to="/adminAlbumsManage">
          <MenuItem :iconSize="23" name="Albums" iconString="album" />
        </RouterLink>
        <RouterLink v-if="userRole == 'admin'" to="/adminUsersManage">
          <MenuItem :iconSize="23" name="Users" iconString="users" />
        </RouterLink>
        <RouterLink v-if="userRole == 'admin'" to="/admin/model-upload">
          <li class="flex items-center justify-start pb-4 cursor-pointer group">
            <div class="flex items-center">
              <svg
                class="w-6 h-6 text-gray-400 group-hover:text-white transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <div
                class="font-semibold text-[14px] ml-4 mt-0.5 text-gray-400 group-hover:text-white transition-colors"
              >
                <span> AI Models</span>
              </div>
            </div>
          </li>
        </RouterLink>
      </ul>

      <!--  Playlist  -->
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

        <div class="overflow-y-auto h-[360px] scrollbar-hidden pb-4">
          <ul class="space-y-0">
            <li v-for="playlist in userPlaylists" :key="playlist.id">
              <RouterLink :to="`/playlist/${playlist.id}`">
                <MenuItem
                  :iconSize="24"
                  :name="playlist.title"
                  iconString="list"
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

    <!-- Top Navigation -->
    <div
      v-if="!hideTopNav()"
      id="TopNav"
      class="w-full lg:w-[calc(100%-240px)] h-[60px] fixed right-0 z-20 bg-[#101010] bg-opacity-80 flex items-center justify-between px-4 lg:px-6"
      style="
        background-color: rgba(16, 16, 16, 0.8);
        backdrop-filter: blur(10px);
      "
    >
      <!-- Spacer for mobile menu button -->
      <div class="w-10 lg:hidden"></div>

      <div
        v-if="userRole !== 'admin'"
        class="relative flex items-center flex-1 mx-4 lg:mx-0 lg:flex-initial"
        ref="searchContainer"
      >
        <input
          type="text"
          v-model="searchQuery"
          @input="handleSearch"
          placeholder="Search songs, albums, artists, podcasts"
          class="w-full md:w-[300px] bg-[#282828] text-white rounded-full py-2 px-4 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-[#1ED760]"
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

      <div class="relative ml-auto">
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
                `${fileServerBaseUrl}/public/images/default.png`
              "
              alt="Profile Image"
            />
            <div class="text-white text-[14px] ml-1.5 font-semibold hidden sm:block">
              {{ userName }}
            </div>
            <ChevronDown v-if="!openMenu" fillColor="#FFFFFF" :size="25" class="hidden sm:block" />
            <ChevronUp v-else fillColor="#FFFFFF" :size="25" class="hidden sm:block" />
          </div>
        </button>
        <span
          v-if="openMenu"
          class="fixed w-[190px] bg-[#282828] shadow-2xl z-50 rounded-lg top-[52px] right-[16px] lg:right-[35px] py-2 px-1 text-gray-200"
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

    <!-- Search Results (Teleported outside to avoid positioning issues) -->
    <Teleport to="body">
      <div
        v-if="searchResults && !hideTopNav()"
        class="fixed z-[60] rounded-lg shadow-2xl"
        :class="{
          'top-[70px] left-[16px] right-[16px] md:left-auto md:right-auto md:w-[400px]': true,
          'md:left-[calc(240px+24px)]': !hideSidebar(),
          'md:left-[24px]': hideSidebar()
        }"
        style="background-color: rgba(24, 24, 24, 0.98); backdrop-filter: blur(10px);"
      >
        <div class="overflow-y-auto max-h-[calc(100vh-100px)] rounded-lg">
          <SearchResults
            :results="searchResults"
            @item-selected="searchResults = null"
          />
        </div>
      </div>
    </Teleport>

    <!-- Main Content -->
    <div
      :class="{
        'w-full': hideSidebar(),
        'w-full lg:w-[calc(100%-240px)]': !hideSidebar(),
      }"
      class="fixed right-0 top-0 overflow-auto h-full bg-gradient-to-b from-[#000] to-black"
    >
    <!-- Accent Background -->
    <AccentBackground />
      <div v-if="!hideTopNav()" class="mt-[60px] bg-opacity-0"></div>
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