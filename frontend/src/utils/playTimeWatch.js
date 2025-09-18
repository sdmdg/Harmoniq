// src/plugins/playtime.js
import { watch } from 'vue'
import { useSongStore } from '../stores/song'
import apiClient from '../utils/axios'

export function setupPlaytimeWatcher() {
  const store = useSongStore()

  // Local counter for actual listened time in seconds
  let listenedSeconds = 0
  // Track last time we sent an update
  let lastSentSeconds = 0
  let rafId = null
  let lastTimestamp = null
  let currentTrackId = null

  const updateCounter = (timestamp) => {
    if (!lastTimestamp) lastTimestamp = timestamp
    const delta = (timestamp - lastTimestamp) / 1000 // convert ms to seconds
    lastTimestamp = timestamp

    if (store.isPlaying) {
      listenedSeconds += delta

      // Send update every 15 seconds of listened time
      if (Math.floor(listenedSeconds) - lastSentSeconds >= 15) {
        lastSentSeconds = Math.floor(listenedSeconds)

        apiClient.post('/api/songs/update', {
          trackId: store.currentTrack.id,
          listenedSeconds: lastSentSeconds,
        }).then(() => {
          console.log('Playtime update sent at', lastSentSeconds, 'seconds')
        }).catch(err => console.error('Failed to update playtime:', err))
      }
    }

    // Continue the loop
    rafId = requestAnimationFrame(updateCounter)
  }

  watch(
    () => [store.audio, store.isPlaying, store.currentTrack],
    ([audio, isPlaying, track]) => {
      if (!audio) return

      // Reset counters when a new song starts
      if (track?.id !== currentTrackId) {
        listenedSeconds = 0
        lastSentSeconds = 0
        currentTrackId = track?.id
      }

      // Cancel any previous loop
      if (rafId) {
        cancelAnimationFrame(rafId)
        rafId = null
      }

      lastTimestamp = null

      if (isPlaying) rafId = requestAnimationFrame(updateCounter)
    },
    { immediate: true }
  )
}
