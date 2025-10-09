<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

const goHome = () => {
  // If the user is forbidden, redirecting to home might be the best option,
  router.push('/home');
};

const goBack = () => {
  // Attempt to go back in browser history
  router.go(-1);
};
</script>

<template>
  <div class="flex flex-col items-center justify-center min-h-screen bg-black text-white p-4">
    <h1 class="text-6xl font-bold text-yellow-500 mb-4">403</h1>
    <h2 class="text-3xl font-semibold mb-6">Access Denied: Forbidden</h2>
    <p class="text-lg text-gray-400 mb-8 text-center max-w-lg">
      You do not have the necessary permissions to view this page.
      Please contact the administrator if you believe this is an error.
    </p>
    <div class="flex space-x-4">
      <button
        @click="goHome"
        class="bg-[#1ED760] hover:bg-[#1DB954] text-black font-bold py-3 px-6 rounded-full focus:outline-none focus:shadow-outline transition duration-200 ease-in-out"
      >
        Go to Home Page
      </button>
      <button
        @click="goBack"
        class="bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-full focus:outline-none focus:shadow-outline transition duration-200 ease-in-out"
      >
        Go Back
      </button>
    </div>
  </div>
</template>

<style scoped>
/* No specific custom styles needed for ForbiddenView, Tailwind handles it. */
</style>