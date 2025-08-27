<template>
  <div class="min-h-screen bg-[#0f0f10] text-white">
    <!-- Header -->
    <header class="sticky top-0 z-10 backdrop-blur bg-[#0f0f10]/70 border-b border-white/5">
      <div class="mx-auto max-w-7xl px-6 py-6 flex items-center justify-between">
        <h1 class="text-3xl font-extrabold tracking-tight">
          <span class="bg-gradient-to-r from-[#1ED760] to-[#22e27a] bg-clip-text text-transparent">Report Management</span>
        </h1>

        <!-- Filter pills -->
        <div class="inline-flex rounded-full bg-white/5 p-1">
          <button
            @click="filter = 'all'"
            class="px-4 py-2 rounded-full text-sm font-semibold transition"
            :class="filter === 'all' ? 'bg-[#1ED760] text-black shadow-sm' : 'text-white/80 hover:bg-white/10'"
          >
            All
          </button>
          <button
            @click="filter = 'pending'"
            class="px-4 py-2 rounded-full text-sm font-semibold transition"
            :class="filter === 'pending' ? 'bg-[#1ED760] text-black shadow-sm' : 'text-white/80 hover:bg-white/10'"
          >
            Pending
          </button>
          <button
            @click="filter = 'completed'"
            class="px-4 py-2 rounded-full text-sm font-semibold transition"
            :class="filter === 'completed' ? 'bg-[#1ED760] text-black shadow-sm' : 'text-white/80 hover:bg-white/10'"
          >
            Completed
          </button>
        </div>
      </div>
    </header>

    <!-- Content -->
    <main class="mx-auto max-w-7xl px-6 py-8">
      <!-- Empty state -->
      <div
        v-if="filteredReports.length === 0"
        class="rounded-2xl border border-white/10 bg-gradient-to-b from-[#151516] to-[#0f0f10] p-12 text-center"
      >
        <div class="mx-auto mb-3 h-14 w-14 rounded-full bg-white/5 grid place-items-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7" viewBox="0 0 24 24" fill="currentColor">
            <path
              d="M11.001 10h2v5h-2v-5zm0-4h2v2h-2V6z"
            />
            <path
              fill-rule="evenodd"
              d="M12 2C6.477 2 2 6.478 2 12s4.477 10 10 10 10-4.478 10-10S17.523 2 12 2zm0 18
                 a8 8 0 100-16 8 8 0 000 16z"
              clip-rule="evenodd"
            />
          </svg>
        </div>
        <p class="text-lg text-white/80">No reports found for this status.</p>
      </div>

      <!-- Card grid -->
      <div
        v-else
        class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
      >
        <article
          v-for="report in filteredReports"
          :key="report.id"
          class="group relative overflow-hidden rounded-2xl border border-white/10 bg-[#121317] shadow-[0_10px_30px_-10px_rgba(0,0,0,0.6)] transition-transform duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_40px_-12px_rgba(0,0,0,0.7)]"
        >
          <!-- Top accent -->
          <div class="h-1.5 w-full bg-gradient-to-r from-[#1ED760] via-emerald-400/80 to-[#1ED760]"></div>

          <div class="p-5">
            <!-- Status chip -->
            <div class="absolute right-3 top-3">
              <span
                class="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide"
                :class="report.status === 'pending'
                  ? 'bg-red-500/20 text-red-300 ring-1 ring-red-500/30'
                  : 'bg-green-500/20 text-green-300 ring-1 ring-green-500/30'"
              >
                <span class="h-1.5 w-1.5 rounded-full"
                      :class="report.status === 'pending' ? 'bg-red-400' : 'bg-green-400'"></span>
                {{ report.status }}
              </span>
            </div>

            <!-- Reason -->
            <h3 class="mb-2 line-clamp-2 text-xl font-bold text-white group-hover:text-white">
              {{ report.reason }}
            </h3>

            <!-- Meta -->
            <div class="mb-4 space-y-1 text-[13px] text-white/70">
              <p>
                <span class="text-white/40">Report ID:</span>
                <span class="ml-1 font-mono text-white/80">{{ report.id }}</span>
              </p>
              <p>
                <span class="text-white/40">Reported by:</span>
                <span class="ml-1 font-semibold">{{ report.reportedBy }}</span>
              </p>
              <p>
                <span class="text-white/40">Date:</span>
                <span class="ml-1">{{ report.date }}</span>
              </p>
            </div>

            <!-- Related content chips -->
            <div class="mb-5">
              <h4 class="mb-2 text-sm font-semibold text-white/80">Related</h4>
              <div class="flex flex-wrap gap-2">
                <span
                  v-if="report.song"
                  class="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/90 hover:bg-white/10 cursor-default"
                  title="Song"
                >
                  🎵 <span class="font-medium">{{ report.song.title }}</span>
                </span>

                <span
                  v-if="report.artist"
                  class="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/90 hover:bg-white/10 cursor-default"
                  title="Artist"
                >
                  👤 <span class="font-medium">{{ report.artist.name }}</span>
                </span>

                <span
                  v-if="report.album"
                  class="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/90 hover:bg-white/10 cursor-default"
                  title="Album"
                >
                  💿 <span class="font-medium">{{ report.album.title }}</span>
                </span>

                <span
                  v-if="!report.song && !report.artist && !report.album"
                  class="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/60"
                >
                  No linked items
                </span>
              </div>
            </div>

            <!-- Actions -->
            <div class="mt-4 flex items-center justify-between">
              <div class="text-xs text-white/40">Quick actions</div>
              <div class="flex items-center gap-2">
                <button
                  v-if="report.status === 'pending'"
                  @click="markAsCompleted(report.id)"
                  class="rounded-full bg-[#1ED760] px-4 py-2 text-sm font-extrabold text-black transition hover:bg-[#1DB954] focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
                >
                  Mark as Completed
                </button>

                <button
                  @click="deleteReport(report.id)"
                  class="rounded-full border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-bold text-red-200 transition hover:bg-red-500/20 focus:outline-none focus:ring-2 focus:ring-red-400/40"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </article>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const reports = ref([
  {
    id: 'rep-001',
    reason: 'Copyright Infringement',
    reportedBy: 'user123',
    date: '2025-08-25',
    status: 'pending',
    song: { id: 'song-1', title: 'Song Title 1' },
    artist: { id: 'artist-1', name: 'Artist A' },
    album: { id: 'album-1', title: 'Album X' },
  },
  {
    id: 'rep-002',
    reason: 'Incorrect Song Information',
    reportedBy: 'Jane Doe',
    date: '2025-08-24',
    status: 'pending',
    song: { id: 'song-2', title: 'Song Title 2' },
    artist: { id: 'artist-2', name: 'Artist B' },
    album: null,
  },
  {
    id: 'rep-003',
    reason: 'Offensive Content',
    reportedBy: 'John Smith',
    date: '2025-08-23',
    status: 'completed',
    song: { id: 'song-3', title: 'Song Title 3' },
    artist: { id: 'artist-3', name: 'Artist C' },
    album: { id: 'album-3', title: 'Album Z' },
  },
  {
    id: 'rep-004',
    reason: 'Profile Picture is Inappropriate',
    reportedBy: 'Alice',
    date: '2025-08-22',
    status: 'pending',
    song: null,
    artist: { id: 'artist-4', name: 'Artist D' },
    album: null,
  },
]);

const filter = ref('all');

const filteredReports = computed(() => {
  if (filter.value === 'all') return reports.value;
  return reports.value.filter((r) => r.status === filter.value);
});

const markAsCompleted = (reportId) => {
  const report = reports.value.find((r) => r.id === reportId);
  if (report) {
    report.status = 'completed';
    console.log(`Report ${reportId} marked as completed.`);
  }
};

const deleteReport = (reportId) => {
  reports.value = reports.value.filter((r) => r.id !== reportId);
  console.log(`Report ${reportId} deleted.`);
};
</script>

<style scoped>
/* Optional: clamp helper without Tailwind plugin */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
