<script setup>
import SearchRow from './SearchRow.vue';

const props = defineProps({
  results: {
    type: Object,
    required: true,
    default: () => ({ tracks: [], albums: [], artists: [] }),
  },
});
</script>

<template>
  <div class="p-3 text-white">
    <!-- Tracks -->
    <div v-if="results.tracks && results.tracks.length">
      <h3 class="text-sm font-semibold text-gray-300 mb-2">Tracks</h3>
      <div class="space-y-2">
        <SearchRow
          v-for="track in results.tracks"
          :key="track.id"
          type="track"
          :item="track"
        />
      </div>
    </div>

    <!-- Albums -->
    <div v-if="results.albums && results.albums.length" class="mt-4">
      <h3 class="text-sm font-semibold text-gray-300 mb-2">Albums</h3>
      <div class="space-y-2">
        <SearchRow
          v-for="album in results.albums"
          :key="album.id"
          type="album"
          :item="album"
        />
      </div>
    </div>

    <!-- Artists -->
    <div v-if="results.artists && results.artists.length" class="mt-4">
      <h3 class="text-sm font-semibold text-gray-300 mb-2">Artists</h3>
      <div class="space-y-2">
        <SearchRow
          v-for="artist in results.artists"
          :key="artist.id"
          type="artist"
          :item="artist"
        />
      </div>
    </div>

    <!-- Empty state -->
    <div
      v-if="!results.tracks?.length && !results.albums?.length && !results.artists?.length"
      class="text-gray-400 text-sm text-center py-4"
    >
      No results found.
    </div>
  </div>
</template>
