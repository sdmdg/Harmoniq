<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import { useRoute, useRouter } from "vue-router";
import apiClient from "@/utils/axios";

// router + params
const route = useRoute();
const router = useRouter();

// state
const user = ref(null);
const loading = ref(true);        // start true so the page shows the loader first
const err = ref("");

// fetch
async function fetchUser() {
  loading.value = true;
  err.value = "";
  try {
    const { data } = await apiClient.get(`/api/admin/usersignup/${route.params.id}`);

    // Expect data: { id, user_name, email, role, created_at, profile_pic }
    user.value = data ?? null;
  } catch (error) {
    const status = error?.response?.status;
    if (status === 401) { router.push("/login"); return; }
    if (status === 403) { router.push("/home"); return; }
    err.value = error?.response?.data?.message || error?.message || "Failed to load user.";
  } finally {
    loading.value = false;
  }
}

function onVisibility() {
  if (document.visibilityState === "visible") fetchUser();
}

onMounted(() => {
  fetchUser();
  document.addEventListener("visibilitychange", onVisibility);
});
onBeforeUnmount(() => {
  document.removeEventListener("visibilitychange", onVisibility);
});
</script>

<template>
  <div class="p-8">
    <!-- Page title (match dashboard) -->
    <h1 class="text-3xl font-bold text-green-500 mb-6">New User Signup</h1>

    <!-- Loading -->
    <div v-if="loading" class="bg-[#181818] p-6 rounded-lg shadow-md text-gray-300">
      Loading…
    </div>

    <!-- Error -->
    <div v-else-if="err" class="bg-[#181818] p-6 rounded-lg shadow-md text-red-400">
      Error: {{ err }}
    </div>

    <!-- Content -->
    <div v-else-if="user" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Left: Profile Card -->
      <div class="bg-[#181818] p-6 rounded-lg shadow-md lg:col-span-1">
        <div class="flex flex-col items-center">
          <img
            :src="user.profile_pic?.startsWith('http') ? user.profile_pic : (user.profile_pic ? (apiClient.defaults.baseURL?.replace(/\/$/, '') + '/' + (user.profile_pic.startsWith('/') ? user.profile_pic.slice(1) : user.profile_pic)) : '/default-avatar.png')"
            alt="Profile picture"
            class="w-32 h-32 rounded-full object-cover border-2 border-[#1ED760]"
            @error="($e) => { $e.target.src = '/default-avatar.png' }"
          />

          <div class="mt-4 text-center">
            <div class="text-2xl font-bold text-white">{{ user.user_name }}</div>
            <div class="text-gray-400">{{ user.email }}</div>
            <div class="mt-1 inline-block px-3 py-1 rounded-full text-sm font-semibold"
                 :class="user.role === 'admin' ? 'bg-green-600 text-black' : 'bg-gray-700 text-gray-200'">
              {{ user.role }}
            </div>
            <div class="text-gray-400 text-sm mt-2" v-if="user.created_at">
              Joined: {{ new Date(user.created_at).toLocaleString() }}
            </div>
          </div>
        </div>
      </div>

      <!-- Right: Details & Actions -->
      <div class="bg-[#181818] p-6 rounded-lg shadow-md lg:col-span-2">
        <h2 class="text-xl font-bold text-white mb-4">Account Information</h2>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="bg-black/40 rounded-md p-4">
            <div class="text-green-400 text-sm">User ID</div>
            <div class="text-white font-semibold break-all">{{ user.id }}</div>
          </div>

          <div class="bg-black/40 rounded-md p-4">
            <div class="text-green-400 text-sm">Email</div>
            <div class="text-white font-semibold break-all">{{ user.email }}</div>
          </div>

          <div class="bg-black/40 rounded-md p-4">
            <div class="text-green-400 text-sm">Role</div>
            <div class="text-white font-semibold capitalize">{{ user.role }}</div>
          </div>

          <div class="bg-black/40 rounded-md p-4" v-if="user.created_at">
            <div class="text-green-400 text-sm">Created At</div>
            <div class="text-white font-semibold">
              {{ new Date(user.created_at).toLocaleString() }}
            </div>
          </div>
        </div>

        <!-- Actions (optional) -->
        <div class="mt-6 flex flex-wrap gap-3">
          <button
            class="bg-[#1ED760] hover:bg-[#1DB954] text-black font-bold py-2 px-4 rounded-full transition"
            @click="router.back()"
          >
            ← Back
          </button>

          <!-- Add more admin actions here if needed -->
          <!-- <button class="bg-[#181818] border border-gray-600 hover:bg-[#222] text-white font-medium py-2 px-4 rounded-full">
            Suspend User
          </button> -->
        </div>
      </div>
    </div>

    <!-- Fallback when no user found -->
    <div v-else class="bg-[#181818] p-6 rounded-lg shadow-md text-gray-300">
      No user found.
    </div>
  </div>
</template>
