import { defineStore } from 'pinia'

// Define the base URL for your file server.
const fileServerBaseUrl = import.meta.env.VITE_FILE_SERVER || 'http://localhost:3000';

export const useSongStore = defineStore('song', {
    state: () => ({
        isPlaying: false,
        audio: null,
        currentArtist: null,
        currentTrack: null
    }),
    actions: {
        loadSong(artist, track) {
            this.currentArtist = artist;
            this.currentTrack = track;

            if (this.audio && this.audio.src) {
                this.audio.pause();
                this.isPlaying = false;
                this.audio.src = '';
            }

            this.audio = new Audio();
            this.audio.src = `${fileServerBaseUrl}/public/songs/${track.path}`;
            console.log(this.audio.src);

            setTimeout(() => {
                this.isPlaying = true;
                this.audio.play();
            }, 200);
        },

        playOrPauseSong() {
            if (this.audio.paused) {
                this.isPlaying = true;
                this.audio.play();
            } else {
                this.isPlaying = false;
                this.audio.pause();
            }
        },

        playOrPauseThisSong(artist, track) {
            if (!this.audio || !this.audio.src || (this.currentTrack.id !== track.id)) {
                this.loadSong(artist, track);
                return;
            }

            this.playOrPauseSong();
        },

        // Corrected prevSong to use the dynamic currentArtist object
        prevSong() {
            if (!this.currentArtist || !this.currentTrack) return;
            const currentTrackIndex = this.currentArtist.tracks.findIndex(t => t.id === this.currentTrack.id);
            const prevTrackIndex = currentTrackIndex > 0 ? currentTrackIndex - 1 : this.currentArtist.tracks.length - 1;
            const track = this.currentArtist.tracks[prevTrackIndex];
            this.loadSong(this.currentArtist, track);
        },

        // Corrected nextSong to use the dynamic currentArtist object
        nextSong() {
            if (!this.currentArtist || !this.currentTrack) return;
            const currentTrackIndex = this.currentArtist.tracks.findIndex(t => t.id === this.currentTrack.id);
            const nextTrackIndex = (currentTrackIndex + 1) % this.currentArtist.tracks.length;
            const track = this.currentArtist.tracks[nextTrackIndex];
            this.loadSong(this.currentArtist, track);
        },

        // Corrected playFromFirst to use the dynamic currentArtist object
        playFromFirst() {
            if (!this.currentArtist) return;
            this.resetState();
            let track = this.currentArtist.tracks[0];
            this.loadSong(this.currentArtist, track);
        },

        resetState() {
            this.isPlaying = false;
            if (this.audio) {
                this.audio.pause();
                this.audio.src = '';
            }
            this.audio = null;
            this.currentArtist = null;
            this.currentTrack = null;
        }
    },
    persist: true
});