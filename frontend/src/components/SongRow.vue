<script setup>
import { ref, toRefs } from 'vue'
import Heart from 'vue-material-design-icons/Heart.vue';
import Play from 'vue-material-design-icons/Play.vue';
import Pause from 'vue-material-design-icons/Pause.vue';

import { useSongStore } from '../stores/song'
import { storeToRefs } from 'pinia';
const useSong = useSongStore()
const { isPlaying, currentTrack } = storeToRefs(useSong)

const fileServerBaseUrl = import.meta.env.VITE_FILE_SERVER || 'http://localhost:3000';

let isHover = ref(false)

const props = defineProps({
    track: Object,
    artist: Object,
    index: Number,
    duration: String // <-- New prop to accept the formatted duration
})

const { track, artist, index, duration } = toRefs(props)
</script>

<template>
    <li
        class="flex items-center justify-between rounded-md hover:bg-[#2A2929]"
        @mouseenter="isHover = true"
        @mouseleave="isHover = false"
    >
        <div class="flex items-center w-full py-1.5">
            <div v-if="isHover" class="w-[40px] ml-[14px] mr-[6px] cursor-pointer">
                <Play
                    v-if="!isPlaying"
                    fillColor="#FFFFFF"
                    :size="25"
                    @click="useSong.playOrPauseThisSong(artist, track)"
                />
                <Play
                    v-else-if="isPlaying && currentTrack.name !== track.name"
                    fillColor="#FFFFFF"
                    :size="25"
                    @click="useSong.loadSong(artist, track)"
                />
                <Pause v-else fillColor="#FFFFFF" :size="25" @click="useSong.playOrPauseSong()"/>
            </div>
                <div v-else class="relative w-[40px] ml-5 flex items-center justify-center">
                <img 
                    class="absolute w-[30px] h-[30px] rounded-sm -z-10 brightness-[0.5]" 
                    :src="`${fileServerBaseUrl}/public/images/${track.albumCover || artist.albumCover || 'default_album.png'}`"
                    alt="Album Cover"
                >
                <span 
                    :class="{'text-green-500': currentTrack && currentTrack.id === track.id, 'text-white': !isHover}"
                    class="font-semibold z-10"
                >
                    {{ index }}
                </span>
            </div>
            <div>
                <div
                    :class="{'text-green-500': currentTrack && currentTrack.id === track.id}"
                    class="text-white font-semibold"
                >
                    {{ track.name }}
                </div>
                <div class="text-sm font-semibold text-gray-400">{{ track.artist || artist.name }}</div>
            </div>
        </div>
        <div class="flex items-center">
            <button type="button" v-if="isHover">
                <Heart fillColor="#1BD760" :size="22"/>
            </button>
            <div class="text-xs mx-5 text-gray-400">
                {{ duration }}             </div>
        </div>
    </li>
</template>