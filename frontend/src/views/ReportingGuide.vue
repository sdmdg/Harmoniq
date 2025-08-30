<script setup>
import { useRouter } from 'vue-router'
const router = useRouter()

const sections = [
  { id: 'what-to-report', label: 'What you can report' },
  { id: 'what-not-to-include', label: 'What not to include' },
  { id: 'before-you-submit', label: 'Before you submit' },
  { id: 'provide-these-details', label: 'Provide these details' },
  
  { id: 'severity', label: 'Severity levels' },
  { id: 'slas', label: 'Response & timelines' },
  { id: 'privacy', label: 'Privacy & security' },
  { id: 'faq', label: 'FAQ' },
  { id: 'contact', label: 'Need more help?' },
]

function scrollTo(id) {
  const el = document.getElementById(id)
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
</script>

<template>
  <div class="min-h-screen">
    <!-- Header -->
    <header class="mx-auto max-w-6xl px-6 pt-10">
      <nav class="text-sm text-neutral-400 mb-3" aria-label="Breadcrumb">
        <ol class="flex items-center gap-2">
          <li class="hover:text-white cursor-default">Help &amp; Support</li>
          <li class="opacity-60">/</li>
          <li class="text-white font-medium">Reporting guidelines</li>
        </ol>
      </nav>

      <div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 class="text-3xl font-bold text-green-500">Reporting guidelines</h1>
          <p class="text-neutral-400 mt-1">
            Follow these steps to help us diagnose and resolve issues quickly.
          </p>
        </div>
        <div class="flex gap-2">
         
          <button
            class="px-4 py-2 rounded-xl bg-green-600 hover:bg-green-500 text-white"
            @click="router.push('/reportIssue')"
          >
            Report an issue
          </button>
        </div>
      </div>

      <div class="border-t border-neutral-800 my-6"></div>
    </header>

    <!-- Content -->
    <main class="mx-auto max-w-6xl px-6 pb-20">
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <!-- Sidebar TOC -->
<aside class="lg:col-span-1 h-max sticky top-6">
  <div class="rounded-2xl border border-neutral-800 overflow-hidden shadow">
    <!-- Header -->
    <div class="bg-green-500 px-4 py-3">
  <h3 class="text-white font-semibold text-sm tracking-wide uppercase">
    On this page
  </h3>
</div>


    <!-- Navigation list -->
    <nav class="bg-neutral-900 divide-y divide-neutral-800">
      <button
        v-for="s in sections"
        :key="s.id"
        class="w-full text-left px-4 py-3 text-sm text-neutral-300 hover:bg-neutral-800 hover:text-white transition-colors"
        @click="scrollTo(s.id)"
      >
        {{ s.label }}
      </button>
    </nav>
  </div>
</aside>


        <!-- Main content -->
        <section class="lg:col-span-3 space-y-8">
          <!-- What to report -->
          <article id="what-to-report" class="rounded-2xl bg-neutral-900 border border-neutral-800 p-6">
           <h2 class="text-xl text-green-500 font-semibold">What you can report</h2>

            <ul class="mt-3 list-disc pl-5 text-neutral-300 space-y-2">
              <li>Playback problems (not playing, stuttering, wrong track).</li>
              <li>Metadata issues (wrong title/artist/album, incorrect cover art).</li>
              <li>App bugs (crashes, UI glitches, unexpected behavior).</li>
              <li>Account/login issues that don’t involve sensitive info.</li>
              <li>Content policy concerns (inappropriate or infringing content).</li>
            </ul>
          </article>

          <!-- What not to include -->
          <article id="what-not-to-include" class="rounded-2xl bg-neutral-900 border border-neutral-800 p-6">
            <h2 class="text-xl text-green-500 font-semibold">What not to include</h2>
            <p class="mt-2 text-neutral-300">
              Please avoid sharing passwords or personal or sensitive details.
             
            </p>
          </article>

          <!-- Before you submit -->
          <article id="before-you-submit" class="rounded-2xl bg-neutral-900 border border-neutral-800 p-6">
            <h2 class="text-xl text-green-500 font-semibold">Before you submit</h2>
            <ul class="mt-3 list-disc pl-5 text-neutral-300 space-y-2">
              <li>Try logging out/in and check your internet connection.</li>
              <li>Update to the latest app version if applicable.</li>
              <li>Confirm the issue happens more than once.</li>
            </ul>
          </article>

          <!-- Provide these details -->
          <article id="provide-these-details" class="rounded-2xl bg-neutral-900 border border-neutral-800 p-6">
            <h2 class="text-xl text-green-500 font-semibold">Provide these details</h2>
            <ul class="mt-3 list-disc pl-5 text-neutral-300 space-y-2">
              <li><span class="text-white font-medium">Steps to reproduce:</span> numbered list (1 → 2 → 3).</li>
              <li><span class="text-white font-medium">Expected vs. actual result:</span> what you thought should happen vs. what happened.</li>
              <li><span class="text-white font-medium">Timestamps &amp; links:</span> track/album/playlist links, time the issue occurred.</li>
              <li><span class="text-white font-medium">Environment:</span> device, OS/browser version, app version.</li>
              <li><span class="text-white font-medium">Frequency:</span> once, sometimes, always.</li>
            </ul>
          </article>


          <!-- Severity -->
          <article id="severity" class="rounded-2xl bg-neutral-900 border border-neutral-800 p-6">
            <h2 class="text-xl text-green-500 font-semibold">Severity levels</h2>
            <div class="mt-3 grid sm:grid-cols-2 gap-3">
              <div class="rounded-xl border border-neutral-800 p-4 bg-neutral-950/40">
                <p class="text-white font-medium">High</p>
                <p class="text-neutral-300 text-sm mt-1">Crash, data loss, security risk, widespread playback failure.</p>
              </div>
              <div class="rounded-xl border border-neutral-800 p-4 bg-neutral-950/40">
                <p class="text-white font-medium">Medium</p>
                <p class="text-neutral-300 text-sm mt-1">Feature broken for some users, incorrect metadata affecting playback.</p>
              </div>
              <div class="rounded-xl border border-neutral-800 p-4 bg-neutral-950/40">
                <p class="text-white font-medium">Low</p>
                <p class="text-neutral-300 text-sm mt-1">Minor UI issues, cosmetic errors, typos.</p>
              </div>
            </div>
          </article>

          <!-- SLAs -->
          <article id="slas" class="rounded-2xl bg-neutral-900 border border-neutral-800 p-6">
            <h2 class="text-xl text-green-500 font-semibold">Response &amp; timelines</h2>
            <ul class="mt-3 list-disc pl-5 text-neutral-300 space-y-2">
              <li>We usually respond within <span class="text-white font-medium">24–48 hours</span>.</li>
              <li>High severity issues are prioritized and may receive faster follow-up.</li>
              <li>You can track progress on the <span class="text-white font-medium">My Reports</span> page.</li>
            </ul>
          </article>

          <!-- Privacy -->
          <article id="privacy" class="rounded-2xl bg-neutral-900 border border-neutral-800 p-6">
            <h2 class="text-xl text-green-500 font-semibold">Privacy &amp; security</h2>
            <p class="mt-2 text-neutral-300">
              Reports are only visible to our support team. We never share your personal information without consent.
              
            </p>
          </article>

          <!-- FAQ -->
          <article id="faq" class="rounded-2xl bg-neutral-900 border border-neutral-800 p-6">
            <h2 class="text-xl text-green-500 font-semibold">FAQ</h2>
            <details class="mt-3 group border border-neutral-800 rounded-xl p-4">
              <summary class="cursor-pointer text-white font-medium">Can I edit a report after submitting?</summary>
              <p class="text-neutral-300 mt-2">Not yet. Please submit a new report and reference the previous one.</p>
            </details>
            <details class="mt-3 group border border-neutral-800 rounded-xl p-4">
              <summary class="cursor-pointer text-white font-medium">How do I add screenshots later?</summary>
              <p class="text-neutral-300 mt-2">Reply to our follow-up email with attachments, or submit a new report referencing the original ticket.</p>
            </details>
            <details class="mt-3 group border border-neutral-800 rounded-xl p-4">
              <summary class="cursor-pointer text-white font-medium">Where can I see the status?</summary>
              <p class="text-neutral-300 mt-2">Go to <span class="text-white">My Reports</span> from the header or sidebar.</p>
            </details>
          </article>

          <!-- Contact -->
          <article id="contact" class="rounded-2xl bg-neutral-900 border border-neutral-800 p-6">
            <h2 class="text-xl text-green-500 font-semibold">Need more help?</h2>
            <p class="mt-2 text-neutral-300">
              For urgent matters or account security issues, please contact us
              <a href="/support/contact" class="text-green-400 underline">contact us</a>.
            </p>
            <div class="mt-4 flex flex-wrap gap-2">
             
              <button class="px-4 py-2 rounded-xl bg-green-600 hover:bg-green-500 text-white"
                      @click="router.push('/reportIssue')">Report an issue</button>
            </div>
          </article>
        </section>
      </div>
    </main>
  </div>
</template>
