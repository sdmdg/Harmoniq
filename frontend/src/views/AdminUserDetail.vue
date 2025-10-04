<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { useRoute, useRouter } from "vue-router";
import apiClient from "@/utils/axios";

// router + params
const route = useRoute();
const router = useRouter();

// File server configuration
const fileServerBaseUrl =
  import.meta.env.VITE_FILE_SERVER || "http://localhost:3000";

// state
const user = ref(null);
const loading = ref(true); // start true so the page shows the loader first
const err = ref("");

// Profile image state
const imageLoading = ref(true);
const imageError = ref(false);

// Profile image URL computation
const profileImageUrl = computed(() => {
  if (!user.value?.profile_pic) {
    return "/avatar.jpg"; // fallback to default avatar
  }

  // If it's already a full URL, use it directly
  if (user.value.profile_pic.startsWith("http")) {
    return user.value.profile_pic;
  }

  // Construct the full URL using the profile_pic path from database
  return `${fileServerBaseUrl}/public/images/${user.value.profile_pic}`;
});

// Image event handlers
const handleImageLoad = () => {
  imageLoading.value = false;
  imageError.value = false;
};

const handleImageError = (event) => {
  imageLoading.value = false;
  imageError.value = true;
  console.log("Profile image failed to load:", event.target.src);
  console.log("Falling back to default avatar");
  event.target.src = "/avatar.jpg";
};

// fetch
async function fetchUser() {
  loading.value = true;
  err.value = "";
  try {
    const { data } = await apiClient.get(
      `/api/admin/usersignup/${route.params.id}`
    );

    // Expect data: { id, user_name, email, role, created_at, profile_pic }
    user.value = data ?? null;
  } catch (error) {
    const status = error?.response?.status;
    if (status === 401) {
      router.push("/login");
      return;
    }
    if (status === 403) {
      router.push("/home");
      return;
    }
    err.value =
      error?.response?.data?.message ||
      error?.message ||
      "Failed to load user.";
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

    <!-- Enhanced Loading State -->
    <div
      v-if="loading"
      class="bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] p-8 rounded-2xl shadow-2xl border border-[#333]"
    >
      <div class="flex items-center justify-center space-x-4">
        <div
          class="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1ED760]"
        ></div>
        <span class="text-white font-semibold"
          >Loading user information...</span
        >
      </div>
    </div>

    <!-- Enhanced Error State -->
    <div
      v-else-if="err"
      class="bg-gradient-to-br from-red-900/20 to-red-800/20 border border-red-500/30 p-8 rounded-2xl shadow-2xl"
    >
      <div class="flex items-center space-x-4">
        <svg
          class="w-8 h-8 text-red-400 flex-shrink-0"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fill-rule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
            clip-rule="evenodd"
          />
        </svg>
        <div>
          <h3 class="text-red-400 font-bold text-lg mb-1">
            Error Loading User
          </h3>
          <p class="text-red-300">{{ err }}</p>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div v-else-if="user" class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Left: Enhanced Profile Card -->
      <div
        class="bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] p-8 rounded-2xl shadow-2xl lg:col-span-1 border border-[#333]"
      >
        <div class="flex flex-col items-center">
          <!-- Profile Picture with loading state -->
          <div class="relative">
            <div
              v-if="imageLoading"
              class="w-40 h-40 rounded-full bg-gray-700 animate-pulse flex items-center justify-center"
            >
              <svg
                class="w-8 h-8 text-gray-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fill-rule="evenodd"
                  d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                  clip-rule="evenodd"
                />
              </svg>
            </div>
            <img
              :src="profileImageUrl"
              alt="Profile picture"
              class="w-40 h-40 rounded-full object-cover border-4 border-[#1ED760] shadow-lg transition-all duration-300 hover:scale-105"
              :class="{ 'opacity-0': imageLoading }"
              @load="handleImageLoad"
              @error="handleImageError"
            />
            <!-- Online status indicator -->
            <div
              class="absolute bottom-2 right-2 w-6 h-6 bg-[#1ED760] rounded-full border-4 border-[#1a1a1a] shadow-lg"
            ></div>
          </div>

          <div class="mt-6 text-center w-full">
            <div class="text-3xl font-bold text-white mb-2">
              {{ user.user_name }}
            </div>
            <div class="text-gray-400 text-lg mb-3 break-all">
              {{ user.email }}
            </div>

            <!-- Enhanced Role Badge -->
            <div class="mb-4">
              <span
                class="inline-flex items-center px-4 py-2 rounded-full text-sm font-bold shadow-lg transition-all duration-300"
                :class="
                  user.role === 'admin'
                    ? 'bg-gradient-to-r from-[#1ED760] to-[#1DB954] text-black hover:from-[#1DB954] hover:to-[#169c46]'
                    : user.role === 'artist'
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700'
                    : 'bg-gradient-to-r from-gray-600 to-gray-700 text-white hover:from-gray-700 hover:to-gray-800'
                "
              >
                <!-- Role Icon -->
                <svg
                  v-if="user.role === 'admin'"
                  class="w-4 h-4 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fill-rule="evenodd"
                    d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clip-rule="evenodd"
                  />
                </svg>
                <svg
                  v-else-if="user.role === 'artist'"
                  class="w-4 h-4 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    d="18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z"
                  />
                </svg>
                <svg
                  v-else
                  class="w-4 h-4 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fill-rule="evenodd"
                    d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                    clip-rule="evenodd"
                  />
                </svg>
                {{ user.role }}
              </span>
            </div>

            <!-- Member since info -->
            <div
              class="bg-black/30 rounded-xl p-4 backdrop-blur-sm border border-gray-700/50"
              v-if="user.created_at"
            >
              <div class="text-[#1ED760] text-sm font-semibold mb-1">
                Member Since
              </div>
              <div class="text-white font-medium">
                {{
                  new Date(user.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                }}
              </div>
              <div class="text-gray-400 text-sm mt-1">
                {{
                  Math.floor(
                    (Date.now() - new Date(user.created_at)) /
                      (1000 * 60 * 60 * 24)
                  )
                }}
                days ago
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right: Enhanced Details & Actions -->
      <div
        class="bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] p-8 rounded-2xl shadow-2xl lg:col-span-2 border border-[#333]"
      >
        <h2 class="text-2xl font-bold text-white flex items-center mb-6">
          <svg
            class="w-6 h-6 mr-3 text-[#1ED760]"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fill-rule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z"
              clip-rule="evenodd"
            />
          </svg>
          Account Information
        </h2>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- User ID Card -->
          <div
            class="bg-gradient-to-br from-black/50 to-black/30 rounded-xl p-6 border border-gray-700/50 backdrop-blur-sm hover:border-[#1ED760]/30 transition-all duration-300"
          >
            <div class="flex items-center mb-3">
              <svg
                class="w-5 h-5 text-[#1ED760] mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fill-rule="evenodd"
                  d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                  clip-rule="evenodd"
                />
              </svg>
              <div class="text-[#1ED760] text-sm font-semibold">User ID</div>
            </div>
            <div class="text-white font-bold text-lg break-all">
              {{ user.id }}
            </div>
          </div>

          <!-- Email Card -->
          <div
            class="bg-gradient-to-br from-black/50 to-black/30 rounded-xl p-6 border border-gray-700/50 backdrop-blur-sm hover:border-[#1ED760]/30 transition-all duration-300"
          >
            <div class="flex items-center mb-3">
              <svg
                class="w-5 h-5 text-[#1ED760] mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"
                />
                <path
                  d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"
                />
              </svg>
              <div class="text-[#1ED760] text-sm font-semibold">
                Email Address
              </div>
            </div>
            <div class="text-white font-bold text-lg break-all">
              {{ user.email }}
            </div>
          </div>

          <!-- Role Card -->
          <div
            class="bg-gradient-to-br from-black/50 to-black/30 rounded-xl p-6 border border-gray-700/50 backdrop-blur-sm hover:border-[#1ED760]/30 transition-all duration-300"
          >
            <div class="flex items-center mb-3">
              <svg
                class="w-5 h-5 text-[#1ED760] mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fill-rule="evenodd"
                  d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clip-rule="evenodd"
                />
              </svg>
              <div class="text-[#1ED760] text-sm font-semibold">
                Account Role
              </div>
            </div>
            <div class="text-white font-bold text-lg capitalize">
              {{ user.role }}
            </div>
          </div>

          <!-- Created At Card -->
          <div
            class="bg-gradient-to-br from-black/50 to-black/30 rounded-xl p-6 border border-gray-700/50 backdrop-blur-sm hover:border-[#1ED760]/30 transition-all duration-300"
            v-if="user.created_at"
          >
            <div class="flex items-center mb-3">
              <svg
                class="w-5 h-5 text-[#1ED760] mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fill-rule="evenodd"
                  d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                  clip-rule="evenodd"
                />
              </svg>
              <div class="text-[#1ED760] text-sm font-semibold">
                Account Created
              </div>
            </div>
            <div class="text-white font-bold text-lg">
              {{
                new Date(user.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })
              }}
            </div>
            <div class="text-gray-400 text-sm mt-1">
              {{
                new Date(user.created_at).toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              }}
            </div>
          </div>
        </div>

        <!-- Enhanced Actions Section -->
        <div class="mt-8 pt-6 border-t border-gray-700/50">
          <h3 class="text-lg font-bold text-white mb-4 flex items-center">
            <svg
              class="w-5 h-5 mr-2 text-[#1ED760]"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fill-rule="evenodd"
                d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                clip-rule="evenodd"
              />
            </svg>
            Quick Actions
          </h3>

          <div class="flex flex-wrap gap-4">
            <button
              class="bg-gradient-to-r from-[#1ED760] to-[#1DB954] hover:from-[#1DB954] hover:to-[#169c46] text-black font-bold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center"
              @click="router.back()"
            >
              <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fill-rule="evenodd"
                  d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                  clip-rule="evenodd"
                />
              </svg>
              Back
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Fallback when no user found -->
    <div
      v-else
      class="bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] p-8 rounded-2xl shadow-2xl border border-[#333] text-center"
    >
      <svg
        class="w-16 h-16 text-gray-500 mx-auto mb-4"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          fill-rule="evenodd"
          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z"
          clip-rule="evenodd"
        />
      </svg>
      <h3 class="text-xl font-bold text-white mb-2">User Not Found</h3>
      <p class="text-gray-400 mb-6">
        The requested user could not be found in the system.
      </p>
      <button
        class="bg-gradient-to-r from-[#1ED760] to-[#1DB954] hover:from-[#1DB954] hover:to-[#169c46] text-black font-bold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
        @click="router.back()"
      >
        Back
      </button>
    </div>
  </div>
</template>
