<script setup>
import { useRouter } from 'vue-router'
import ReportForm from '../components/ReportForm.vue'

const router = useRouter()
</script>

<template>
  <div class="min-h-screen">
    <!-- PAGE HEADER -->
    <header class="mx-auto max-w-6xl px-6 pt-10">
      
      <nav class="text-sm text-neutral-400 mb-3" aria-label="Breadcrumb">
        <ol class="flex items-center gap-2">
          <li class="hover:text-white cursor-default">Help &amp; Support</li>
          <li class="opacity-60">/</li>
          <li class="text-white font-medium">Report an Issue</li>
        </ol>
      </nav>

      <!-- Title + Actions -->
      <div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 class="text-3xl font-bold text-white">Report an Issue</h1>
          <p class="text-neutral-400 mt-1">
            Help us fix problems faster. Tell us what went wrong and we’ll follow up.
          </p>
        </div>
        <div class="flex gap-2">
          
         <RouterLink
  to="/support/reporting-guidelines"
  class="px-4 py-2 rounded-xl bg-green-600 hover:bg-green-500 text-white inline-flex items-center justify-center"
>
  Reporting guidelines
</RouterLink>

        </div>
      </div>

      
      <!-- Divider -->
      <div class="border-t border-neutral-800 my-6"></div>
    </header>

    <!-- CONTENT GRID -->
    <main class="mx-auto max-w-6xl px-6 pb-16">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- LEFT: Form -->
        <section class="lg:col-span-2">
          <div class="mx-auto max-w-3xl">
            <div class="rounded-2xl bg-neutral-900 border border-neutral-800 p-6 shadow-lg">
              <h2 class="text-lg font-semibold text-white mb-4 text-center">Submit a Report</h2>
              <ReportForm />
            </div>
          </div>
        </section>

        <!-- RIGHT: Helpful Sidebar -->
        <aside class="lg:col-span-1">
          <div class="rounded-2xl bg-neutral-900 border border-neutral-800 p-5">
            <h3 class="text-white font-semibold">Tips for a fast resolution</h3>
            <ul class="mt-3 list-disc pl-5 text-sm text-neutral-300 space-y-2">
              <li>Describe what you expected vs. what happened</li>
              <li>List exact steps to reproduce (1 → 2 → 3)</li>
              <li>Include timestamps &amp; links (playlist/track)</li>
              <li>Attach screenshots if helpful (max 10MB each)</li>
            </ul>
          </div>

          <div class="rounded-2xl bg-neutral-900 border border-neutral-800 p-5 mt-4">
            <h3 class="text-white font-semibold">Privacy</h3>
            <p class="text-sm text-neutral-300 mt-2">
              Don’t include passwords or payment details. Reports are reviewed only by our support team.
            </p>
          </div>
        </aside>
      </div>
    </main>
  </div>
</template>
