// src/plugins/playtime.js
import { watch } from 'vue'
import { useSongStore } from '../stores/song'
import apiClient from '../utils/axios'

export function setupPlaytimeWatcher() {
  const store = useSongStore()

  // Local counter for actual listened time in seconds
  let listenedSeconds = 0
  // Keep track of which thresholds have been sent
  let sentStates = new Set()
  let rafId = null
  let lastTimestamp = null
  let currentTrackId = null

  const updateCounter = (timestamp) => {
    if (!lastTimestamp) lastTimestamp = timestamp
    const delta = (timestamp - lastTimestamp) / 1000 // convert ms to s
    lastTimestamp = timestamp

    if (store.isPlaying) {
      listenedSeconds += delta

      const duration = store.audio?.duration || 1
      const progress = listenedSeconds / duration

      // Determine state based on actual listened progress
      let state = 0
      if (progress > 1) state = 6
      else if (progress >= 0.99) state = 5
      else if (progress >= 0.75) state = 4
      else if (progress >= 0.5) state = 3
      else if (progress >= 0.25) state = 2
      else if (progress > 0) state = 1

      if (state && state < 100 && !sentStates.has(state) && listenedSeconds > 10) {
        sentStates.add(state)
        apiClient.post('/api/songs/update', {
          trackId: store.currentTrack.id,
          listenedSeconds: Math.floor(listenedSeconds),
        }).then(() => {
          console.log('Playtime state sent:', state, 'Listened:', Math.floor(listenedSeconds))
        }).catch(err => console.error('Failed to update playtime:', err))
      }
    }

    // Continue the loop if the song is still playing
    rafId = requestAnimationFrame(updateCounter)
  }

  watch(
    () => [store.audio, store.isPlaying, store.currentTrack],
    ([audio, isPlaying, track]) => {
      if (!audio) return

      // Reset counter only if a new song starts
      if (track?.id !== currentTrackId) {
        listenedSeconds = 0
        sentStates.clear()
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
