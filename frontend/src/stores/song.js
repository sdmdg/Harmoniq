import { defineStore } from "pinia";

// --- Config ---
const fileServerBaseUrl =
  import.meta.env.VITE_FILE_SERVER || "http://localhost:3000";

// AES-256-CBC (hex from your Python script)
const ENCRYPTION_IV_HEX = "ce0b1f79486e0bead826238530d543f0";

// --- Utils ---
function hexToBytes(hex) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2)
    bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16);
  return bytes;
}

async function decryptAesCbcToArrayBuffer(
  encryptedArrayBuffer,
  ENCRYPTION_KEY_HEX
) {
  const key = await crypto.subtle.importKey(
    "raw",
    hexToBytes(ENCRYPTION_KEY_HEX),
    { name: "AES-CBC" },
    false,
    ["decrypt"]
  );
  const iv = hexToBytes(ENCRYPTION_IV_HEX);
  return crypto.subtle.decrypt(
    { name: "AES-CBC", iv },
    key,
    encryptedArrayBuffer
  );
}

export const useSongStore = defineStore("song", {
  state: () => ({
    isPlaying: false,
    isBuffering: false,
    downloadProgress: 0, // 0..100 (best-effort; only if server sends Content-Length)
    audio: null, // HTMLAudioElement
    objectUrl: null, // current blob URL to revoke
    currentArtist: null,
    currentTrack: null,
    _fetchAbort: null, // AbortController for the active download
  }),

  actions: {
    async loadSong(artist, track) {
      // remember selection early (so UI can render titles/covers)
      this.currentArtist = artist;
      this.currentTrack = track;

      // cancel any in-flight download and clean current audio
      this._abortFetchIfAny();
      this._teardownAudio();

      this.isBuffering = true;
      this.downloadProgress = 0;

      try {
        // Check if the track has an encryption key
        const hasEncryptionKey = track.key && track.key.trim() !== "";

        if (hasEncryptionKey) {
          // ---- ENCRYPTED SONG FLOW ----
          // build encrypted file path safely
          const baseName = (track.path || "").replace(/\.mp3$/i, "");
          const url = `${fileServerBaseUrl}/public/songs/${baseName}.mp3.encrypted`;

          // ---- 1) Download (with optional progress) ----
          const controller = new AbortController();
          this._fetchAbort = controller;

          const res = await fetch(url, { signal: controller.signal });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);

          // stream read for progress (falls back gracefully if not supported)
          const contentLength = Number(res.headers.get("content-length")) || 0;
          let encryptedBuffer;

          if (res.body && "getReader" in res.body) {
            const reader = res.body.getReader();
            const chunks = [];
            let received = 0;
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              chunks.push(value);
              received += value.byteLength;
              if (contentLength) {
                this.downloadProgress = Math.round(
                  (received / contentLength) * 100
                );
              }
            }
            const merged = new Uint8Array(received);
            let offset = 0;
            for (const c of chunks) {
              merged.set(c, offset);
              offset += c.byteLength;
            }
            encryptedBuffer = merged.buffer;
          } else {
            // fallback (no visible progress)
            encryptedBuffer = await res.arrayBuffer();
            this.downloadProgress = 100;
          }

          // If user switched tracks mid-download
          if (controller.signal.aborted) return;

          // ---- 2) Decrypt fully in memory ----
          const decryptedArrayBuffer = await decryptAesCbcToArrayBuffer(
            encryptedBuffer,
            track.key
          );

          // ---- 3) Create Blob URL and play ----
          const blob = new Blob([decryptedArrayBuffer], { type: "audio/mpeg" });
          const objectUrl = URL.createObjectURL(blob);
          this.objectUrl = objectUrl;

          const audio = new Audio(objectUrl);
          audio.preload = "auto";
          audio.onended = () => this.nextSong();
          audio.onplay = () => {
            this.isPlaying = true;
          };
          audio.onpause = () => {
            this.isPlaying = false;
          };

          this.audio = audio;

          try {
            await audio.play();
            this.isPlaying = true;
          } catch (e) {
            // Autoplay blocked: keep audio ready; UI should show a play button
            console.warn("Autoplay prevented; waiting for user gesture.", e);
            this.isPlaying = false;
          }
        } else {
          // ---- NON-ENCRYPTED SONG FLOW ----
          // build plain mp3 file path
          const baseName = (track.path || "").replace(/\.mp3$/i, "");
          const url = `${fileServerBaseUrl}/public/songs/${baseName}.mp3`;

          this.downloadProgress = 100; // No need for progress tracking on direct audio load

          const audio = new Audio(url);
          audio.preload = "auto";
          audio.onended = () => this.nextSong();
          audio.onplay = () => {
            this.isPlaying = true;
          };
          audio.onpause = () => {
            this.isPlaying = false;
          };

          this.audio = audio;

          try {
            await audio.play();
            this.isPlaying = true;
          } catch (e) {
            // Autoplay blocked: keep audio ready; UI should show a play button
            console.warn("Autoplay prevented; waiting for user gesture.", e);
            this.isPlaying = false;
          }
        }
      } catch (err) {
        if (err?.name === "AbortError") return; // harmless: we switched tracks
        console.error("Failed to load song:", err);
        this.resetState();
      } finally {
        this.isBuffering = false;
        this._fetchAbort = null;
      }
    },

    playOrPauseSong() {
      if (!this.audio) return;
      if (this.audio.paused) {
        this.audio
          .play()
          .then(() => {
            this.isPlaying = true;
          })
          .catch(() => {});
      } else {
        this.audio.pause();
        this.isPlaying = false;
      }
    },

    playOrPauseThisSong(artist, track) {
      if (
        !this.audio ||
        !this.audio.src ||
        (this.currentTrack && this.currentTrack.id !== track.id)
      ) {
        this.loadSong(artist, track);
        return;
      }
      this.playOrPauseSong();
    },

    prevSong() {
      if (!this.currentArtist || !this.currentTrack) return;
      const idx = this.currentArtist.tracks.findIndex(
        (t) => t.id === this.currentTrack.id
      );
      const prevIdx = idx > 0 ? idx - 1 : this.currentArtist.tracks.length - 1;
      this.loadSong(this.currentArtist, this.currentArtist.tracks[prevIdx]);
    },

    nextSong() {
      if (!this.currentArtist || !this.currentTrack) return;
      const idx = this.currentArtist.tracks.findIndex(
        (t) => t.id === this.currentTrack.id
      );
      const nextIdx = (idx + 1) % this.currentArtist.tracks.length;
      this.loadSong(this.currentArtist, this.currentArtist.tracks[nextIdx]);
    },

    playFromFirst() {
      if (!this.currentArtist) return;
      this.resetState();
      this.loadSong(this.currentArtist, this.currentArtist.tracks[0]);
    },

    seekTo(seconds) {
      if (!this.audio || Number.isNaN(this.audio.duration)) return;
      this.audio.currentTime = Math.max(
        0,
        Math.min(seconds, this.audio.duration)
      );
    },

    seekToPercent(p0to100) {
      if (!this.audio || Number.isNaN(this.audio.duration)) return;
      const sec =
        (Math.max(0, Math.min(100, p0to100)) / 100) * this.audio.duration;
      this.audio.currentTime = sec;
    },

    stop() {
      if (!this.audio) return;
      this.audio.pause();
      this.audio.currentTime = 0;
      this.isPlaying = false;
    },

    resetState() {
      this.isPlaying = false;
      this.isBuffering = false;
      this.downloadProgress = 0;
      this._abortFetchIfAny();
      this._teardownAudio();
      this.currentArtist = null;
      this.currentTrack = null;
    },

    // --- internals ---
    _abortFetchIfAny() {
      try {
        this._fetchAbort?.abort();
      } catch (_) {}
      this._fetchAbort = null;
    },
    _teardownAudio() {
      if (this.audio) {
        try {
          this.audio.pause();
        } catch (_) {}
        try {
          this.audio.src = "";
        } catch (_) {}
        this.audio = null;
      }
      if (this.objectUrl) {
        try {
          URL.revokeObjectURL(this.objectUrl);
        } catch (_) {}
        this.objectUrl = null;
      }
    },
  },

  persist: true,
});
