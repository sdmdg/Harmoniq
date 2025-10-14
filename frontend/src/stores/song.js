import { defineStore } from "pinia";
import CryptoJS from "crypto-js";
import apiClient from "../utils/axios";

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

// --- Helpers for CryptoJS fallback ---
// ArrayBuffer -> CryptoJS WordArray
function arrayBufferToWordArray(ab) {
  const u8 = new Uint8Array(ab);
  const words = [];
  for (let i = 0; i < u8.length; i += 4) {
    words.push(
      ((u8[i] || 0) << 24) |
      ((u8[i + 1] || 0) << 16) |
      ((u8[i + 2] || 0) << 8) |
      ((u8[i + 3] || 0))
    );
  }
  return CryptoJS.lib.WordArray.create(words, u8.length);
}

// CryptoJS WordArray -> ArrayBuffer
function wordArrayToArrayBuffer(wordArray) {
  const { words, sigBytes } = wordArray;
  const ab = new ArrayBuffer(sigBytes);
  const u8 = new Uint8Array(ab);
  let idx = 0;
  for (let i = 0; i < words.length; i++) {
    let w = words[i];
    if (idx < sigBytes) u8[idx++] = (w >>> 24) & 0xff;
    if (idx < sigBytes) u8[idx++] = (w >>> 16) & 0xff;
    if (idx < sigBytes) u8[idx++] = (w >>> 8) & 0xff;
    if (idx < sigBytes) u8[idx++] = w & 0xff;
  }
  return ab;
}

function hexToWordArray(hex) {
  const u8 = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    u8[i / 2] = parseInt(hex.slice(i, i + 2), 16);
  }
  return arrayBufferToWordArray(u8.buffer);
}

// The unified decrypt function: tries WebCrypto first, falls back to CryptoJS
async function decryptAesCbcToArrayBuffer(encryptedArrayBuffer, ENCRYPTION_KEY_HEX) {
  // If Web Crypto is available and has importKey, use it (secure, fast)
  if (typeof crypto !== "undefined" && crypto.subtle && typeof crypto.subtle.importKey === "function") {
    try {
      const keyBytes = hexToBytes(ENCRYPTION_KEY_HEX);
      const key = await crypto.subtle.importKey(
        "raw",
        keyBytes,
        { name: "AES-CBC" },
        false,
        ["decrypt"]
      );
      const iv = hexToBytes(ENCRYPTION_IV_HEX);
      return await crypto.subtle.decrypt({ name: "AES-CBC", iv }, key, encryptedArrayBuffer);
    } catch (e) {
      console.warn("WebCrypto decryption failed or unavailable, falling back to crypto-js:", e);
      // fall through to CryptoJS fallback
    }
  }

  // CryptoJS fallback (works without HTTPS) - AES-CBC PKCS7
  try {
    const keyWA = hexToWordArray(ENCRYPTION_KEY_HEX);
    const ivWA = hexToWordArray(ENCRYPTION_IV_HEX);
    const cipherWA = arrayBufferToWordArray(encryptedArrayBuffer);

    // Build CipherParams
    const cipherParams = CryptoJS.lib.CipherParams.create({ ciphertext: cipherWA });

    const decryptedWA = CryptoJS.AES.decrypt(cipherParams, keyWA, {
      iv: ivWA,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });

    const outAb = wordArrayToArrayBuffer(decryptedWA);
    return outAb;
  } catch (e) {
    // If fallback fails, rethrow so the caller can handle/reset state
    console.error("CryptoJS fallback decryption failed:", e);
    throw e;
  }
}

export const useSongStore = defineStore("song", {
  state: () => ({
    isRadio: false,
    isPlaying: false,
    isBuffering: false,
    volume: 80,
    vol: 80,
    downloadProgress: 0, // 0..100 (best-effort; only if server sends Content-Length)
    audio: null, // HTMLAudioElement
    objectUrl: null, // current blob URL to revoke
    currentArtist: null,
    currentTrack: null,
    _fetchAbort: null, // AbortController for the active download
    _isFetchingRecommendations: false, // Prevent duplicate fetches
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
        // Check if the track has an encryption key (truthy string)
        const hasEncryptionKey = !!(track && track.key && String(track.key).trim() !== "");

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
                this.downloadProgress = Math.round((received / contentLength) * 100);
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

          // ---- 2) Decrypt fully in memory (with fallback) ----
          const keyHex = String(track.key).trim();
          let decryptedArrayBuffer;
          try {
            decryptedArrayBuffer = await decryptAesCbcToArrayBuffer(encryptedBuffer, keyHex);
          } catch (e) {
            console.error("Decryption failed:", e);
            throw e;
          }

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
      // Check if we're switching from radio to normal mode or changing artists
      const isChangingContext =
        !this.currentArtist ||
        !artist ||
        this.currentArtist.name !== artist.name;

      this.isRadio = false;

      if (
        !this.audio ||
        (this.currentTrack && this.currentTrack.id !== track.id) ||
        isChangingContext
      ) {
        this.loadSong(artist, track);
        return;
      }
      this.playOrPauseSong();
    },

    playOrPauseThisSongRadio: async function (track) {
      try {
        // If no audio or new track, start new radio session
        if (
          !this.audio ||
          !this.audio.src ||
          (this.currentTrack && this.currentTrack.id !== track.id)
        ) {
          // --- Fetch radio recommendations ---
          const res = await apiClient.get(
            `/api/recommend/getSongBasedRecommendations/${track.id}`
          );
          const data = res.data;

          // fallback if no recommendations
          const recommendations = (data?.recommendations || []).map((rec) => ({
            id: rec.id,
            name: rec.name,
            artist: rec.artist,
            duration: `${rec.duration.minutes};${rec.duration.seconds}`,
            album: rec.album_id,
            path: rec.id,
            key: rec.encryption_key,
            albumcover: rec.albumcover,
          }));
          
          this.isRadio = true;

          // --- Create a pseudo artist (radio playlist) ---
          // --- Remove duplicates based on ID ---
          const seen = new Set();
          const uniqueTracks = [track, ...recommendations].filter(t => {
            if (seen.has(t.id)) return false;
            seen.add(t.id);
            return true;
          });

          this.currentArtist = { tracks: uniqueTracks };

          // --- Start playing from the selected track ---
          await this.loadSong(this.currentArtist, track);
          return;
        }

        // If the same track is already loaded, just toggle play/pause
        this.playOrPauseSong();
      } catch (error) {
        console.error("Error starting radio mode:", error);
      }
    },

    async _fetchMoreRecommendations() {
      if (this._isFetchingRecommendations || !this.isRadio || !this.currentTrack) {
        return;
      }

      try {
        this._isFetchingRecommendations = true;
        
        // Use the current track as the seed for new recommendations
        const res = await apiClient.get(
          `/api/recommend/getSongBasedRecommendations/${this.currentTrack.id}`
        );
        const data = res.data;

        const newRecommendations = (data?.recommendations || []).map((rec) => ({
          id: rec.id,
          name: rec.name,
          artist: rec.artist,
          duration: `${rec.duration.minutes};${rec.duration.seconds}`,
          album: rec.album_id,
          path: rec.id,
          key: rec.encryption_key,
          albumcover: rec.albumcover,
        }));

        // Filter out duplicates by checking existing track IDs
        const existingIds = new Set(this.currentArtist.tracks.map(t => t.id));
        const uniqueNewTracks = newRecommendations.filter(t => !existingIds.has(t.id));

        // Append new recommendations to the playlist
        if (uniqueNewTracks.length > 0) {
          this.currentArtist.tracks.push(...uniqueNewTracks);
          console.log(`Added ${uniqueNewTracks.length} new recommendations to radio playlist`);
        }
      } catch (error) {
        console.error("Error fetching more recommendations:", error);
      } finally {
        this._isFetchingRecommendations = false;
      }
    },

    prevSong() {
      if (!this.currentArtist || !this.currentTrack) return;
      const idx = this.currentArtist.tracks.findIndex(
        (t) => t.id === this.currentTrack.id
      );
      const prevIdx = idx > 0 ? idx - 1 : this.currentArtist.tracks.length - 1;
      this.loadSong(this.currentArtist, this.currentArtist.tracks[prevIdx]);
    },

    async nextSong() {
      if (!this.currentArtist || !this.currentTrack) return;
      
      const idx = this.currentArtist.tracks.findIndex(
        (t) => t.id === this.currentTrack.id
      );
      const nextIdx = (idx + 1) % this.currentArtist.tracks.length;

      // Check if we're at the last song in radio mode
      if (this.isRadio && nextIdx === this.currentArtist.tracks.length - 1) {
        // Fetch more recommendations in the background before playing the last song
        this._fetchMoreRecommendations();
      }

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
      this.isRadio = false;
      this._abortFetchIfAny();
      this._teardownAudio();
      this.currentArtist = null;
      this.currentTrack = null;
      this._isFetchingRecommendations = false;
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