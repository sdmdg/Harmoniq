<script setup>
import { useRouter } from "vue-router";
import { useSongStore } from "../stores/song";

const props = defineProps({
  type: { type: String, required: true }, // "track" | "album" | "artist"
  item: { type: Object, required: true },
});

const router = useRouter();
const songStore = useSongStore();

// Play a track with the proper artist/collection context
const playTrack = (track) => {
  let artistInfo = track.artist || track.albumArtist || { name: "Unknown" }; 
  // depending on your API response, you might need track.artist or track.album.artist
  songStore.playOrPauseThisSong(artistInfo, track);
};

const goToAlbum = (id) => router.push(`/album/${id}`);
const goToArtist = (id) => router.push(`/artist/${id}`);
</script>

<template>
  <div
    class="flex items-center px-3 py-2 rounded-md hover:bg-[#1f1f1f] cursor-pointer transition"
    @click="
      type === 'track'
        ? playTrack(item)
        : type === 'album'
        ? goToAlbum(item.id)
        : goToArtist(item.id)
    "
  >
    <!-- Cover or photo -->
    <img
      v-if="type === 'track' || type === 'album'"
      :src="`http://localhost:3000/public/images/${item.albumCover}`"
      class="w-12 h-12 rounded object-cover mr-4"
    />
    <img
      v-else-if="type === 'artist'"
      :src="`http://localhost:3000/public/images/${item.photo}`"
      class="w-12 h-12 rounded-full object-cover mr-4"
    />

    <!-- Details -->
    <div class="flex flex-col">
      <span class="text-white font-semibold text-sm">
        {{ item.name }}
      </span>

      <span
        v-if="type === 'track'"
        class="text-gray-400 text-xs"
      >
        {{ item.artist }} • {{ formatDuration(item.duration) }}
      </span>

      <span
        v-else-if="type === 'album'"
        class="text-gray-400 text-xs"
      >
        Album • {{ item.artist }}
      </span>

      <span
        v-else-if="type === 'artist'"
        class="text-gray-400 text-xs"
      >
        Artist
      </span>
    </div>
  </div>
</template>

<script>
function formatDuration(dur) {
  if (!dur) return "0:00";
  const [m, s] = dur.split(";");
  return `${m}:${s.padStart(2, "0")}`;
}
</script>
