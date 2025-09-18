<script setup>
import { toRefs } from 'vue'
import { RouterLink } from 'vue-router'
import Play from 'vue-material-design-icons/Play.vue';

const props = defineProps({
  image: String,
  title: String,
  subTitle: String
})
const { image, title, subTitle } = toRefs(props)
</script>

<template>
  <RouterLink to="">
    <div 
      class="bg-[#111111] w-[180px] h-[240px] p-4 rounded-md m-2 hover:bg-[#252525] cursor-pointer flex flex-col group"
    >
      <!-- Image wrapper with overlay -->
      <div class="relative w-full aspect-square">
        <img 
          class="rounded-md w-full h-full object-cover" 
          :src="image" 
          alt="cover"
        />
        <!-- Play button  -->
        <div 
          class="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <div class="text-black rounded-full p-3 shadow-lg">
                <Play
                    v-if="!isPlaying"
                    fillColor="#FFFFFF"
                    :size="45"
                    @click="useSong.playOrPauseThisSong(artist, track)"
                />
          </div>
        </div>
      </div>

      <!-- Text -->
      <div class="text-white pt-3 font-semibold text-[15px] truncate">
        {{ title }}
      </div>
      <div class="text-gray-400 text-[13px] truncate">
        {{ subTitle }}
      </div>
    </div>
  </RouterLink>
</template>
