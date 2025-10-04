<template>
  <div class="min-h-screen bg-black text-white">
    <!-- Header -->
    <div class="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm">
      <div class="px-6 py-4">
        <h1 class="text-2xl font-bold text-green-400">User Management</h1>
        <p class="text-gray-400 text-sm mt-1">
          Manage all users and artists on your platform
        </p>
      </div>
    </div>

    <div class="p-6 space-y-6">
      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
          <div class="text-gray-400 text-sm">Total Users</div>
          <div class="text-2xl font-bold text-white">{{ total }}</div>
        </div>
        <div class="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
          <div class="text-gray-400 text-sm">Artists</div>
          <div class="text-2xl font-bold text-white">
            {{ users.filter((u) => u.role === "artist").length }}
          </div>
        </div>
        <div class="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
          <div class="text-gray-400 text-sm">Listeners</div>
          <div class="text-2xl font-bold text-white">
            {{ users.filter((u) => u.role === "listener").length }}
          </div>
        </div>
        <div class="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
          <div class="text-gray-400 text-sm">Active Today</div>
          <div class="text-2xl font-bold text-white">
            {{ Math.floor(total * 0.3) }}
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="bg-gray-900/30 border border-gray-800 rounded-lg p-4">
        <div
          class="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between"
        >
          <div
            class="flex flex-col sm:flex-row gap-3 items-start sm:items-center flex-1"
          >
            <div class="relative flex-1 max-w-md">
              <input
                v-model="q"
                class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Search users by name or email..."
              />
              <svg
                class="absolute right-3 top-2.5 h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                ></path>
              </svg>
            </div>

            <div class="flex gap-2">
              <button
                class="px-4 py-2 rounded-lg border transition-all duration-200 text-sm font-medium"
                :class="
                  role === ''
                    ? 'bg-green-600 border-green-600 text-white'
                    : 'border-gray-700 text-gray-300 hover:border-green-500 hover:text-green-400'
                "
                @click="role = ''"
              >
                All Users
              </button>
              <button
                class="px-4 py-2 rounded-lg border transition-all duration-200 text-sm font-medium"
                :class="
                  role === 'listener'
                    ? 'bg-green-600 border-green-600 text-white'
                    : 'border-gray-700 text-gray-300 hover:border-green-500 hover:text-green-400'
                "
                @click="role = 'listener'"
              >
                Listeners
              </button>
              <button
                class="px-4 py-2 rounded-lg border transition-all duration-200 text-sm font-medium"
                :class="
                  role === 'artist'
                    ? 'bg-green-600 border-green-600 text-white'
                    : 'border-gray-700 text-gray-300 hover:border-green-500 hover:text-green-400'
                "
                @click="role = 'artist'"
              >
                Artists
              </button>
            </div>
          </div>

          <div class="text-sm text-gray-400">
            Showing {{ users.length }} of {{ total }} users
          </div>
        </div>
      </div>

      <!-- Users Table -->
      <div
        class="bg-gray-900/30 border border-gray-800 rounded-lg overflow-hidden"
      >
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-800/50 border-b border-gray-700">
              <tr>
                <th
                  class="text-left py-4 px-6 text-sm font-semibold text-gray-300"
                >
                  User
                </th>
                <th
                  class="text-left py-4 px-6 text-sm font-semibold text-gray-300"
                >
                  Email
                </th>
                <th
                  class="text-left py-4 px-6 text-sm font-semibold text-gray-300"
                >
                  Role
                </th>
                <th
                  class="text-left py-4 px-6 text-sm font-semibold text-gray-300"
                >
                  Status
                </th>
                <th
                  class="text-right py-4 px-6 text-sm font-semibold text-gray-300"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-800">
              <tr v-if="loading">
                <td colspan="5" class="py-8 px-6 text-center text-gray-400">
                  <div class="flex items-center justify-center gap-2">
                    <div
                      class="animate-spin rounded-full h-5 w-5 border-b-2 border-green-500"
                    ></div>
                    Loading users...
                  </div>
                </td>
              </tr>
              <tr v-else-if="error">
                <td colspan="5" class="py-8 px-6 text-center text-red-400">
                  <div class="flex items-center justify-center gap-2">
                    <svg
                      class="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      ></path>
                    </svg>
                    {{ error }}
                  </div>
                </td>
              </tr>
              <tr v-else-if="!users.length">
                <td colspan="5" class="py-8 px-6 text-center text-gray-400">
                  No users found matching your criteria.
                </td>
              </tr>

              <tr
                v-for="u in users"
                :key="u.id"
                class="hover:bg-gray-800/30 transition-colors duration-150"
              >
                <td class="py-4 px-6">
                  <div class="flex items-center gap-3">
                    <div class="relative">
                      <img
                        :src="getProfileImageUrl(u.pic_path)"
                        @error="
                          $event.target.style.display = 'none';
                          $event.target.nextElementSibling.style.display =
                            'flex';
                        "
                        class="w-10 h-10 rounded-full object-cover border-2 border-gray-700"
                        :alt="u.user_name"
                      />
                      <!-- Fallback div -->
                      <div
                        class="w-10 h-10 rounded-full bg-gray-600 border-2 border-gray-700 flex items-center justify-center"
                        style="display: none"
                      >
                        <svg
                          class="w-5 h-5 text-gray-300"
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
                      <div
                        class="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-900"
                      ></div>
                    </div>
                    <div>
                      <div class="font-medium text-white">
                        {{ u.user_name }}
                      </div>
                      <div v-if="u.artist_name" class="text-sm text-green-400">
                        {{ u.artist_name }}
                      </div>
                    </div>
                  </div>
                </td>
                <td class="py-4 px-6 text-gray-300">{{ u.email }}</td>
                <td class="py-4 px-6">
                  <span
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize"
                    :class="
                      u.role === 'artist'
                        ? 'bg-purple-900/50 text-purple-300 border border-purple-700'
                        : 'bg-blue-900/50 text-blue-300 border border-blue-700'
                    "
                  >
                    {{ u.role }}
                  </span>
                </td>
                <td class="py-4 px-6">
                  <span
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900/50 text-green-300 border border-green-700"
                  >
                    Active
                  </span>
                </td>
                <td class="py-4 px-6 text-right">
                  <button
                    class="inline-flex items-center px-3 py-1.5 border border-gray-700 rounded-lg text-sm font-medium text-gray-300 hover:bg-green-600 hover:border-green-600 hover:text-white transition-all duration-200"
                    @click="openProfile(u)"
                  >
                    <svg
                      class="w-4 h-4 mr-1.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      ></path>
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      ></path>
                    </svg>
                    View Profile
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="bg-gray-800/30 border-t border-gray-700 px-6 py-4">
          <div class="flex items-center justify-between">
            <div class="text-sm text-gray-400">
              Page {{ page }} of {{ totalPages }}
            </div>
            <div class="flex gap-2">
              <button
                class="px-4 py-2 border border-gray-700 rounded-lg text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-gray-300"
                :disabled="page === 1"
                @click="page--"
              >
                Previous
              </button>
              <button
                class="px-4 py-2 border border-gray-700 rounded-lg text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-gray-300"
                :disabled="page === totalPages"
                @click="page++"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Profile Drawer -->
    <div v-if="profileOpen" class="fixed inset-0 z-50 overflow-hidden">
      <div
        class="absolute inset-0 bg-black/60 backdrop-blur-sm"
        @click="profileOpen = false"
      ></div>
      <div
        class="absolute right-0 top-0 h-full w-full max-w-md bg-gray-900 border-l border-gray-800 shadow-2xl"
      >
        <div class="flex flex-col h-full">
          <!-- Header -->
          <div
            class="flex items-center justify-between p-6 border-b border-gray-800"
          >
            <h2 class="text-xl font-bold text-white">User Profile</h2>
            <button
              class="p-2 hover:bg-gray-800 rounded-lg transition-colors duration-200 text-gray-400 hover:text-white"
              @click="profileOpen = false"
            >
              <svg
                class="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
            </button>
          </div>

          <!-- Content -->
          <div class="flex-1 overflow-y-auto p-6">
            <div v-if="!selected" class="flex items-center justify-center py-8">
              <div
                class="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"
              ></div>
            </div>
            <div v-else class="space-y-6">
              <!-- Profile Header -->
              <div class="text-center">
                <div class="relative mx-auto w-20 h-20">
                  <img
                    :src="getProfileImageUrl(selected.pic_path)"
                    @error="
                      $event.target.style.display = 'none';
                      $event.target.nextElementSibling.style.display = 'flex';
                    "
                    class="w-20 h-20 rounded-full object-cover border-4 border-green-500"
                    :alt="selected.user_name"
                  />
                  <!-- Fallback div -->
                  <div
                    class="w-20 h-20 rounded-full bg-gray-600 border-4 border-green-500 flex items-center justify-center absolute top-0 left-0"
                    style="display: none"
                  >
                    <svg
                      class="w-10 h-10 text-gray-300"
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
                </div>
                <h3 class="text-xl font-bold text-white mt-3">
                  {{ selected.user_name }}
                </h3>
                <p class="text-gray-400">{{ selected.email }}</p>
                <span
                  class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium capitalize mt-2"
                  :class="
                    selected.role === 'artist'
                      ? 'bg-purple-900/50 text-purple-300 border border-purple-700'
                      : 'bg-blue-900/50 text-blue-300 border border-blue-700'
                  "
                >
                  {{ selected.role }}
                </span>
              </div>

              <!-- Basic Info -->
              <div class="bg-gray-800/50 rounded-lg p-4 space-y-3">
                <h4 class="font-semibold text-white">Basic Information</h4>
                <div class="grid grid-cols-1 gap-3 text-sm">
                  <div class="flex justify-between">
                    <span class="text-gray-400">User ID:</span>
                    <span class="text-white font-mono">{{ selected.id }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-400">Joined:</span>
                    <span class="text-white">{{
                      new Date(selected.created_at).toLocaleDateString()
                    }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-400">Status:</span>
                    <span class="text-green-400">Active</span>
                  </div>
                </div>
              </div>

              <!-- Artist Info -->
              <div
                v-if="selected.role === 'artist'"
                class="bg-gray-800/50 rounded-lg p-4 space-y-3"
              >
                <h4 class="font-semibold text-white">Artist Information</h4>
                <div class="space-y-3 text-sm">
                  <div>
                    <span class="text-gray-400 block">Artist Name:</span>
                    <span class="text-white">{{
                      selected.artist_name || "—"
                    }}</span>
                  </div>
                  <div>
                    <span class="text-gray-400 block">Description:</span>
                    <span class="text-white">{{
                      selected.description || "No description provided"
                    }}</span>
                  </div>
                </div>
              </div>

              <!-- Actions -->
              <div class="space-y-3">
                <button
                  class="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors duration-200"
                >
                  Send Message
                </button>
                <button
                  class="w-full border border-gray-700 hover:bg-gray-800 text-gray-300 hover:text-white font-medium py-2.5 px-4 rounded-lg transition-all duration-200"
                >
                  View Activity
                </button>
                <button
                  class="w-full border border-red-700 hover:bg-red-900/50 text-red-400 hover:text-red-300 font-medium py-2.5 px-4 rounded-lg transition-all duration-200"
                >
                  Suspend User
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import apiClient from "@/utils/axios";
import { useRouter } from "vue-router";

const router = useRouter();

// File server configuration (same as userprofile.vue)
const fileServerBaseUrl =
  import.meta.env.VITE_FILE_SERVER || "http://localhost:3000";

// Profile image URL computation - simplified with better fallback
const getProfileImageUrl = (picPath) => {
  // Always return the base64 fallback first to avoid any 404s
  const fallbackImage =
    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiM2QjczODAiLz4KPHBhdGggZD0iTTIwIDEyQzE3IDEyIDE0LjUgMTQuNSAxNC41IDE3LjVDMTQuNSAyMC41IDE3IDIzIDIwIDIzQzIzIDIzIDI1LjUgMjAuNSAyNS41IDE3LjVDMjUuNSAxNC41IDIzIDEyIDIwIDEyWiIgZmlsbD0iI0ZGRkZGRiIvPgo8cGF0aCBkPSJNMjAgMjVDMTUuNSAyNSAxMS43NSAyNi43NSAxMS43NSAzMFYzMkgyOC4yNVYzMEMyOC4yNSAyNi43NSAyNC41IDI1IDIwIDI1WiIgZmlsbD0iI0ZGRkZGRiIvPgo8L3N2Zz4K";

  console.log("🖼️ getProfileImageUrl called with:", picPath);

  if (!picPath) {
    console.log("🖼️ No pic_path, using fallback");
    return fallbackImage;
  }

  // If already a full URL, use it directly
  if (picPath.startsWith("http")) {
    console.log("🖼️ Full URL provided:", picPath);
    return picPath;
  }

  // If starts with /, construct from root
  if (picPath.startsWith("/")) {
    const url = `${fileServerBaseUrl}${picPath}`;
    console.log("🖼️ Root path provided:", picPath, "→", url);
    return url;
  }

  // Otherwise, assume it's a filename in images directory
  const url = `${fileServerBaseUrl}/public/images/${picPath}`;
  console.log("🖼️ Filename provided:", picPath, "→", url);
  return url;
};

const q = ref("");
const role = ref(""); // '', 'listener', 'artist'
const page = ref(1);
const limit = ref(10);
const total = ref(0);
const users = ref([]);
const loading = ref(false);
const error = ref("");

const totalPages = computed(() =>
  Math.max(1, Math.ceil(total.value / limit.value))
);

const profileOpen = ref(false);
const selected = ref(null);

async function fetchUsers() {
  loading.value = true;
  error.value = "";
  try {
    const { data } = await apiClient.get("api/admin/users", {
      params: {
        q: q.value,
        role: role.value,
        page: page.value,
        limit: limit.value,
      },
    });

    // Debug: Log the response to see what fields are returned
    console.log("👥 Users API Response:", data);
    console.log("👤 First user data:", data.users?.[0]);

    users.value = data.users;
    total.value = data.total;
  } catch (e) {
    console.error("❌ Failed to fetch users:", e);
    error.value = "Failed to load users";
  } finally {
    loading.value = false;
  }
}

function resetAndFetch() {
  page.value = 1;
  fetchUsers();
}

watch([q, role], resetAndFetch);
watch(page, fetchUsers);
onMounted(fetchUsers);

function openProfile(u) {
  if (u.role === "listener") {
    router.push(`/listener/${u.id}`); // or any route you set up for listener profile
  } else if (u.role === "artist") {
    router.push(`/artist/${u.artist_id}`); // or any route for artist profile
  } else {
    // fallback if role is something else
    console.warn("Unknown role:", u.role);
  }
}
</script>