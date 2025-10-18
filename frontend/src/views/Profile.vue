<script setup>
import { ref, onMounted, watch } from 'vue';
import apiClient from '../utils/axios';
import { useRouter } from 'vue-router';

// Reactive variables for user and UI state
const user = ref(null);
const activeTab = ref('general'); // 'general' or 'artist'
const errorMessage = ref('');
const successMessage = ref('');
const profileImageUrl = ref('');

// Reactive variables for form inputs
const currentPassword = ref('');
const newPassword = ref('');
const confirmNewPassword = ref('');
const artistName = ref('');
const artistDescription = ref('');
const profileImageFile = ref(null);

const router = useRouter();

const fileServerBaseUrl = import.meta.env.VITE_FILE_SERVER || 'http://localhost:3000';

// Fetch user data and initial profile image from localStorage and API
const fetchUser = async () => {
    const userData = localStorage.getItem('user_data');
    if (userData) {
        user.value = JSON.parse(userData);
    
        try {
            const response = await apiClient.get(`api/profile/image/${user.value.id}`);
            profileImageUrl.value = `${fileServerBaseUrl}/public/images/${response.data.pic_path}`;
        } catch (error) {
            console.error('Failed to fetch profile image:', error);
        }

        // Conditionally fetch artist details if the user is an artist
        if (user.value.role === 'artist') {
            try {
                // Call the new backend endpoint to get artist details
                const artistResponse = await apiClient.get(`api/profile/artist-details/${user.value.id}`);
                const artistData = artistResponse.data;
                
                // Update the reactive variables with the fetched data
                artistName.value = artistData.artist_name || '';
                artistDescription.value = artistData.description || '';

                // Optionally, update the local storage and reactive user object
                const updatedUser = { ...user.value, artist_name: artistData.artist_name, artist_description: artistData.description };
                localStorage.setItem('user_data', JSON.stringify(updatedUser));
                user.value = updatedUser;

            } catch (error) {
                console.error('Failed to fetch artist details:', error);
            }
        }
    } else {
        router.push('/login');
    }
};

// Handle password change for a listener
const handlePasswordChange = async () => {
    errorMessage.value = '';
    successMessage.value = '';

    if (newPassword.value !== confirmNewPassword.value) {
        errorMessage.value = 'New passwords do not match.';
        return;
    }

    try {
        await apiClient.post('api/profile/update-password', {
            currentPassword: currentPassword.value,
            newPassword: newPassword.value,
        });

        successMessage.value = 'Password updated successfully!';
        currentPassword.value = '';
        newPassword.value = '';
        confirmNewPassword.value = '';

    } catch (error) {
        console.error('Password change failed:', error);
        errorMessage.value = error.response?.data?.message || 'Failed to change password.';
    }
};

// Handle the profile image file selection
const handleFileChange = (event) => {
    const file = event.target.files[0];
    profileImageFile.value = file;
};

// Handle the profile image upload
const handleImageUpload = async () => {
    errorMessage.value = '';
    successMessage.value = '';

    if (!profileImageFile.value) {
        errorMessage.value = 'Please select an image to upload.';
        return;
    }

    const formData = new FormData();
    formData.append('file', profileImageFile.value);

    try {
        const response = await apiClient.post('api/profile/upload-image', formData, {  
            headers: { 'Content-Type': 'multipart/form-data' },
        });

        // Update the profile image URL with the new URL from the API response
        profileImageUrl.value = response.data.imageUrl;
        successMessage.value = 'Profile image uploaded successfully!';
        profileImageFile.value = null;
        fetchUser();
    
    } catch (error) {
        console.error('Image upload failed:', error);
        errorMessage.value = error.response?.data?.message || 'Failed to upload profile image.';
    }
};

// Handle a listener becoming an artist
const handleArtistPublish = async () => {
    errorMessage.value = '';
    successMessage.value = '';

    if (!artistName.value) {
        errorMessage.value = 'Artist name is required.';
        return;
    }

    try {
        const response = await apiClient.post('api/profile/become-artist', {
            artistName: artistName.value,
            artistDescription: artistDescription.value,
        });

        // Update local user data and the reactive user object
        const updatedUser = { ...user.value, ...response.data };
        localStorage.removeItem('user_data');
        localStorage.removeItem('jwt_token');
        user.value = updatedUser;
        
        successMessage.value = 'Congratulations! Your role has been successfully updated. Please log out and log back in to access your new artist features.';
        setTimeout(() => {
            router.push('/login');
        }, 2000);

    } catch (error) {
        console.error('Failed to become an artist:', error);
        errorMessage.value = error.response?.data?.message || 'Failed to update to artist role.';
    }
};

const handleArtistUpdate = async () => {
    errorMessage.value = '';
    successMessage.value = '';

    if (!artistName.value) {
        errorMessage.value = 'Artist name is required.';
        return;
    }

    try {
        const response = await apiClient.post('api/profile/update-artist-details', {
            artistName: artistName.value,
            artistDescription: artistDescription.value,
        });

        // Update local user data and the reactive user object
        const updatedUser = { ...user.value, ...response.data };
        localStorage.setItem('user_data', JSON.stringify(updatedUser));
        user.value = updatedUser;

        successMessage.value = 'Artist profile updated successfully!';

    } catch (error) {
        console.error('Failed to update artist profile:', error);
        errorMessage.value = error.response?.data?.message || 'Failed to update artist details.';
    }
}


onMounted(() => {
    fetchUser();
});

const goBack = () => {
    router.go(-1);
};

onMounted(() => {
    fetchUser();
});

</script>

<template>
  <div class="relative min-h-screen bg-black overflow-hidden">
    <ParticleBackground />

    <div class="relative z-10 flex items-center justify-center min-h-screen p-4">
      <div class="w-full max-w-lg bg-[#181818] rounded-lg shadow-lg p-8 text-white">
        <button
          @click="goBack"
          class="absolute top-4 left-4 text-white hover:text-[#1ED760] transition-colors"
          aria-label="Go back"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <h2 class="text-3xl font-bold text-center mb-6">Your Profile</h2>

                <!-- Tab Navigation -->
                <div class="flex border-b border-[#535353] mb-6">
                    <button
                        @click="activeTab = 'general'"
                        :class="{ 'border-[#1ED760] text-[#1ED760]': activeTab === 'general', 'border-transparent text-gray-400': activeTab !== 'general' }"
                        class="flex-1 py-2 text-center text-lg font-semibold border-b-2 hover:border-[#1ED760] transition-colors"
                    >
                        General
                    </button>
                    <button
                        v-if="user && user.role !== 'admin'"
                        @click="activeTab = 'artist'"
                        :class="{ 'border-[#1ED760] text-[#1ED760]': activeTab === 'artist', 'border-transparent text-gray-400': activeTab !== 'artist' }"
                        class="flex-1 py-2 text-center text-lg font-semibold border-b-2 hover:border-[#1ED760] transition-colors"
                    >
                        Artist
                    </button>
                </div>

                <!-- Messages -->
                <p v-if="successMessage" class="text-[#1ED760] text-sm text-center mb-4">{{ successMessage }}</p>
                <p v-if="errorMessage" class="text-red-500 text-sm text-center mb-4">{{ errorMessage }}</p>

                <!-- General Content -->
                <div v-if="activeTab === 'general'" class="mt-4">
                    <div class="mb-2">
                        <h3 class="text-xl font-bold mb-4">Profile Info</h3>
                    </div>
    
                    <div class="mb-8">
                        <h3 class="text-l font-bold mb-4">Profile Image</h3>
                        <div class="flex items-center space-x-4 mb-6">
                            <!-- Display current profile image or a placeholder -->
                            <img
                                v-if="profileImageUrl"
                                :src="profileImageUrl"
                                alt="Profile Image"
                                class="w-24 h-24 rounded-full object-cover border-2 border-[#1ED760]"
                            />
                            <div v-else class="w-24 h-24 rounded-full bg-gray-600 flex items-center justify-center text-gray-300 border-2 border-gray-500">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.414-1.414a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            
                            <!-- Upload form -->
                            <form @submit.prevent="handleImageUpload" class="flex-1 space-y-4">
                                <div>
                                    <label class="block text-gray-300 text-sm font-semibold mb-2">Upload New Image</label>
                                    <input
                                        type="file"
                                        @change="handleFileChange"
                                        class="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#1ED760] file:text-black hover:file:bg-[#1DB954]"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    class="bg-[#1ED760] hover:bg-[#1DB954] text-black font-bold py-2 px-4 rounded-full focus:outline-none focus:shadow-outline transition duration-200 ease-in-out"
                                >
                                    Upload Image
                                </button>
                            </form>
                        </div>
                        
                        <!-- Username -->
                        <div class="mb-2">
                        <label class="block text-gray-400 text-sm font-semibold mb-1">Username</label>
                        <p class="text-white text-sm">{{ user?.username }}</p>
                        </div>

                        <!-- Email -->
                        <div class="mb-2">
                        <label class="block text-gray-400 text-sm font-semibold mb-1">Email</label>
                        <p class="text-white text-sm">{{ user?.email }}</p>
                        </div>
                    </div>
                    
                    <h3 class="text-xl font-bold mb-4">Change Your Password</h3>
                    <form @submit.prevent="handlePasswordChange">
                        <div class="mb-4">
                            <label for="currentPassword" class="block text-gray-300 text-sm font-semibold mb-2">Current Password</label>
                            <input
                                type="password"
                                id="currentPassword"
                                name="currentPassword"
                                placeholder="Enter current password"
                                class="shadow-sm appearance-none border border-[#535353] rounded w-full py-3 px-4 text-white leading-tight focus:outline-none focus:ring-1 focus:ring-[#1ED760] bg-[#3E3E3E] placeholder-gray-400"
                                v-model="currentPassword" required
                            />
                        </div>
                        <div class="mb-4">
                            <label for="newPassword" class="block text-gray-300 text-sm font-semibold mb-2">New Password</label>
                            <input
                                type="password"
                                id="newPassword"
                                name="newPassword"
                                placeholder="Enter new password"
                                class="shadow-sm appearance-none border border-[#535353] rounded w-full py-3 px-4 text-white leading-tight focus:outline-none focus:ring-1 focus:ring-[#1ED760] bg-[#3E3E3E] placeholder-gray-400"
                                v-model="newPassword" required
                            />
                            <p class="text-gray-400 text-xs mt-1">
                                Password must contain one lowercase letter, one uppercase letter, one symbol, one number, and be at least 8 characters long.
                            </p>
                        </div>
                        <div class="mb-6">
                            <label for="confirmNewPassword" class="block text-gray-300 text-sm font-semibold mb-2">Confirm New Password</label>
                            <input
                                type="password"
                                id="confirmNewPassword"
                                name="confirmNewPassword"
                                placeholder="Confirm new password"
                                class="shadow-sm appearance-none border border-[#535353] rounded w-full py-3 px-4 text-white leading-tight focus:outline-none focus:ring-1 focus:ring-[#1ED760] bg-[#3E3E3E] placeholder-gray-400"
                                v-model="confirmNewPassword" required
                            />
                        </div>
                        <div class="flex items-center justify-center">
                            <button
                                type="submit"
                                class="bg-[#1ED760] hover:bg-[#1DB954] text-black font-bold py-3 px-6 rounded-full focus:outline-none focus:shadow-outline w-full transition duration-200 ease-in-out"
                            >
                                Change Password
                            </button>
                        </div>
                    </form>
                </div>

                <!-- Artist Content -->
                <div v-if="activeTab === 'artist'" class="mt-4">
                    <!-- If user is an artist, show the update form. If a listener, show the 'become an artist' form -->
                    <h3 class="text-xl font-bold mb-4">{{ user && user.role === 'artist' ? 'Update Profile' : 'Become an Artist' }}</h3>
                    <form @submit.prevent="user && user.role === 'artist' ? handleArtistUpdate() : handleArtistPublish()">
                        <div class="mb-4">
                            <label for="artistName" class="block text-gray-300 text-sm font-semibold mb-2">Artist Name</label>
                            <input
                                type="text"
                                id="artistName"
                                name="artistName"
                                placeholder="Enter your artist name"
                                class="shadow-sm appearance-none border border-[#535353] rounded w-full py-3 px-4 text-white leading-tight focus:outline-none focus:ring-1 focus:ring-[#1ED760] bg-[#3E3E3E] placeholder-gray-400"
                                v-model="artistName" required
                            />
                        </div>
                        <div class="mb-6">
                            <label for="artistDescription" class="block text-gray-300 text-sm font-semibold mb-2">Description</label>
                            <textarea
                                id="artistDescription"
                                name="artistDescription"
                                placeholder="Tell us about yourself as an artist..."
                                rows="4"
                                class="shadow-sm appearance-none border border-[#535353] rounded w-full py-3 px-4 text-white leading-tight focus:outline-none focus:ring-1 focus:ring-[#1ED760] bg-[#3E3E3E] placeholder-gray-400"
                                v-model="artistDescription"
                            ></textarea>
                        </div>
                        <div class="flex items-center justify-center">
                            <button
                                type="submit"
                                class="bg-[#1ED760] hover:bg-[#1DB954] text-black font-bold py-3 px-6 rounded-full focus:outline-none focus:shadow-outline w-full transition duration-200 ease-in-out"
                            >
                                {{ user && user.role === 'artist' ? 'Save Changes' : 'Publish' }}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</template>
