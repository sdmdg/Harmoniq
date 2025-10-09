<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

const goHome = () => {
  router.push('/home');
};
</script>

<template>
  <div class="flex flex-col items-center justify-center min-h-screen bg-black text-white p-4">
    <h1 class="text-6xl font-bold text-red-500 mb-4">404</h1>
    <h2 class="text-3xl font-semibold mb-6">Page Not Found</h2>
    <p class="text-lg text-gray-400 mb-8 text-center max-w-lg">
      Oops! The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
    </p>
    <button
      @click="goHome"
      class="bg-[#1ED760] hover:bg-[#1DB954] text-black font-bold py-3 px-6 rounded-full focus:outline-none focus:shadow-outline transition duration-200 ease-in-out"
    >
      Go to Home Page
    </button>
  </div>
</template>

<style scoped>
/* No specific custom styles needed for NotFoundView, Tailwind handles it. */
</style>