<script setup>
import { ref, onMounted, watch } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'
import MenuItem from './components/MenuItem.vue';
import MusicPlayer from './components/MusicPlayer.vue'
import ChevronUp from 'vue-material-design-icons/ChevronUp.vue';
import ChevronDown from 'vue-material-design-icons/ChevronDown.vue';
import ChevronRight from 'vue-material-design-icons/ChevronRight.vue';
import ChevronLeft from 'vue-material-design-icons/ChevronLeft.vue';

import { useSongStore } from './stores/song'
import { storeToRefs } from 'pinia';

const useSong = useSongStore()
const { isPlaying, currentTrack } = storeToRefs(useSong)

onMounted(() => { isPlaying.value = false })

let openMenu = ref(false)

// Get the current route object
const route = useRoute()

// Computed properties to check route meta for hiding elements
const hideSidebar = () => route.meta.hideSidebar || false;
const hideTopNav = () => route.meta.hideTopNav || false;
const hidePlayer = () => route.meta.hidePlayer || false;

// Watch for changes in the URL's album ID and fetch album data
watch(() => route.params.album_id, async (newAlbumId) => {
  if (newAlbumId) {
    console.log(`Route changed to album ID: ${newAlbumId}`);
    await useSong.fetchAlbum(newAlbumId);
  }
}, { immediate: true });

</script>

<template>
  <div class="min-h-screen bg-black">

    <div v-if="!hideSidebar()" id="SideNav" class="h-[100%] p-6 w-[240px] fixed z-50 bg-black">
      <RouterLink to="/home"> <img width="180" src="/images/icons/logo.png">
      </RouterLink>
      <div class="my-8"></div>
      <ul>
        <RouterLink to="/home">
          <MenuItem class="ml-[1px]" :iconSize="23" name="Home" iconString="home" pageUrl="/home" />
        </RouterLink>
        <RouterLink to="/search">
          <MenuItem class="ml-[1px]" :iconSize="24" name="Search" iconString="search" pageUrl="/search" />
        </RouterLink>
        <RouterLink to="/library">
          <MenuItem class="ml-[2px]" :iconSize="23" name="Your Library" iconString="library" pageUrl="/library" />
        </RouterLink>
        <div class="py-3.5"></div>
        <MenuItem :iconSize="24" name="Create Playlist" iconString="playlist" pageUrl="/playlist" />
        <MenuItem class="-ml-[1px]" :iconSize="27" name="Liked Songs" iconString="liked" pageUrl="/liked" />
      </ul>
      <div class="border-b border-b-gray-700"></div>
      <ul>
        <li class="font-semibold text-[13px] mt-3 text-gray-300 hover:text-white">My Playlist #1</li>
        <li class="font-semibold text-[13px] mt-3 text-gray-300 hover:text-white">My Playlist #2</li>
        <li class="font-semibold text-[13px] mt-3 text-gray-300 hover:text-white">My Playlist #3</li>
        <li class="font-semibold text-[13px] mt-3 text-gray-300 hover:text-white">My Playlist #4</li>
      </ul>
    </div>

    <div
      v-if="!hideTopNav()"
      id="TopNav"
      class="
        w-[calc(100%-240px)]
        h-[60px]
        fixed
        right-0
        z-20
        bg-[#101010]
        bg-opacity-80
        flex
        items-center
        justify-between
      "
      style="background-color: rgba(16, 16, 16, 0.8); backdrop-filter: blur(10px);"
    >
      <div class="flex items-center ml-6">

      </div>

      <button @click="openMenu = !openMenu" :class="openMenu ? 'bg-[#282828]' : 'bg-black'"
        class="bg-black hover:bg-[#282828] rounded-full p-0.5 mr-8 mt-0.5 cursor-pointer">
        <div class="flex items-center">
          <img
            class="rounded-full"
            width="27"
            src="https://yt3.ggpht.com/e9o-24_frmNSSVvjS47rT8qCHgsHNiedqgXbzmrmpsj6H1ketcufR1B9vLXTZRa30krRksPj=s88-c-k-c0x00ffffff-no-rj-mo"
          >
          <div class="text-white text-[14px] ml-1.5 font-semibold">Malaka</div>
          <ChevronDown v-if="!openMenu" @click="openMenu = true" fillColor="#FFFFFF" :size="25" />
          <ChevronUp v-else @click="openMenu = false" fillColor="#FFFFFF" :size="25" />
        </div>
      </button>

      <span v-if="openMenu"
        class="fixed w-[190px] bg-[#282828] shadow-2xl z-50 rounded-sm top-[52px] right-[35px] p-1 cursor-pointer">
        <ul class="text-gray-200 font-semibold text-[14px]">
          <li class="px-3 py-2.5 hover:bg-[#3E3D3D] border-b border-b-gray-600">Profile</li>
          <li class="px-3 py-2.5 hover:bg-[#3E3D3D]">Log out</li>
        </ul>
      </span>
    </div>

    <div
      :class="{ 'w-full': hideSidebar(), 'w-[calc(100%-240px)]': !hideSidebar() }"
      class="
        fixed
        right-0
        top-0
        overflow-auto
        h-full
        bg-gradient-to-b
        from-[#000]
        to-black
      "
    >
      <div v-if="!hideTopNav()" class="mt-[70px]"></div>

      <RouterView />

      <div v-if="!hidePlayer()" class="mb-[100px]"></div>
    </div>

    <MusicPlayer v-if="currentTrack && !hidePlayer()" />

  </div>
</template>

<style scoped>
/* No specific custom styles needed for App.vue, Tailwind handles it */
</style>
