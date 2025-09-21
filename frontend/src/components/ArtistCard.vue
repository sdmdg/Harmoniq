<script setup>
import { toRefs, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import apiClient from '../utils/axios'   // 🔹 Use your axios instance

const props = defineProps({
  id: String,         // artist id
  image: String,      // artist image (from backend -> cover)
  name: String,       // artist name
  isFollowing: {      // pass down follow state
    type: Boolean,
    default: false
  },
  listenerCount: String // number of listeners (from backend)
})

const { id, image, name, isFollowing, listenerCount } = toRefs(props)

const router = useRouter()
const following = ref(isFollowing.value)
const isProcessing = ref(false)

const fileServerBaseUrl = import.meta.env.VITE_FILE_SERVER || 'http://localhost:3000'

// Keep local state in sync if backend updates
watch(isFollowing, (val) => {
  following.value = val
})

const goToArtist = () => {
  router.push(`/artist/${id.value}`)
}

const toggleFollow = async (e) => {
  e.stopPropagation()
  if (isProcessing.value) return
  isProcessing.value = true

  try {
    if (!following.value) {
      // Follow the artist
      await apiClient.post('/api/artist/follow', { artistId: id.value })
      following.value = true
    } else {
      // Unfollow the artist
      await apiClient.post('/api/artist/unfollow', { artistId: id.value })
      following.value = false
    }
  } catch (error) {
    console.error('Failed to update follow state', error)
    // Optionally revert UI change
  } finally {
    isProcessing.value = false
  }
}
</script>

<template>
  <div 
    class="bg-[] w-[180px] h-[240px] p-4 rounded-md m-2 hover:bg-[#252525] cursor-pointer flex flex-col items-center group"
    @click="goToArtist"
  >
    <!-- Artist Image -->
    <div class="relative w-[120px] h-[120px]">
      <img 
        class="rounded-full w-full h-full object-cover border border-gray-700"
        :src="`${fileServerBaseUrl}/public/images/${image}`"
        alt="artist"
      />
    </div>

    <!-- Name & Listeners -->
    <div class="pt-3 text-center">
      <div class="text-white font-semibold text-[15px] truncate">
        {{ name }}
      </div>
      <div class="text-gray-400 text-sm">
        {{ listenerCount }} listeners
      </div>
    </div>

    <!-- Follow button -->
    <button
      v-if="!following"
      :disabled="isProcessing"
      class="mt-3 px-4 py-1 rounded-full text-sm font-medium transition 
            text-white bg-green-600 hover:bg-green-700"
      @click="toggleFollow"
    >
      Follow
    </button>

    <button
      v-else
      :disabled="isProcessing"
      class="mt-3 px-4 py-1 rounded-full text-sm font-medium 
            text-gray-300"
    >
      Following
    </button>
  </div>
</template>
