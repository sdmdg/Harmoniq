<script setup>
import { ref } from 'vue';
import apiClient from '../utils/axios';
import { useRouter } from 'vue-router';
import ParticleBackground from '../components/ParticleBackground.vue';

const username = ref('');
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const errorMessage = ref('');

const router = useRouter();

// Password validation pattern
const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

const handleRegister = async () => {
    errorMessage.value = '';

    // Client-side password confirmation check
    if (password.value !== confirmPassword.value) {
        errorMessage.value = 'Passwords do not match.';
        return;
    }

    // Password strength validation
    if (!passwordPattern.test(password.value)) {
        errorMessage.value =
            'Password must contain at least one lowercase letter, one uppercase letter, one symbol, one number, and be 8 or more characters long.';
        return;
    }

    try {
        const response = await apiClient.post('api/auth/register/', {
            username: username.value,
            email: email.value,
            password: password.value,
        });

        const { token, user } = response.data;
        console.log('Registration successful!', { token, user });

        router.push('/login');
    } catch (error) {
        console.error('Registration failed:', error);
        if (error.response?.data?.message) {
            errorMessage.value = error.response.data.message;
        } else {
            errorMessage.value = 'An unexpected error occurred during registration. Please try again.';
        }
    }
};
</script>

<template>
    <div class="relative min-h-screen bg-black overflow-hidden">
        <ParticleBackground />

        <div class="relative z-10 flex items-center justify-center min-h-screen p-4">
            <div class="w-full max-w-md bg-[#181818] rounded-lg shadow-lg p-8">
                <center><img src="/images/icons/logo.png" style="width: 80%;" alt="Logo"></center>
                <h4 class="text-white text-3xl font-bold text-center mb-6">Create Account</h4>

                <form @submit.prevent="handleRegister">
                    <!-- Username Field -->
                    <div class="mb-4">
                        <label for="username" class="block text-gray-300 text-sm font-semibold mb-2">Username</label>
                        <input
                            type="text"
                            id="username"
                            placeholder="Choose a username"
                            class="shadow-sm border border-[#535353] rounded w-full py-3 px-4 text-white focus:outline-none focus:ring-1 focus:ring-[#1ED760] bg-[#3E3E3E] placeholder-gray-400"
                            v-model="username"
                            required
                        />
                    </div>

                    <!-- Email Field -->
                    <div class="mb-4">
                        <label for="email" class="block text-gray-300 text-sm font-semibold mb-2">Email</label>
                        <input
                            type="email"
                            id="email"
                            placeholder="your@example.com"
                            class="shadow-sm border border-[#535353] rounded w-full py-3 px-4 text-white focus:outline-none focus:ring-1 focus:ring-[#1ED760] bg-[#3E3E3E] placeholder-gray-400"
                            v-model="email"
                            required
                        />
                    </div>

                    <!-- Password Field -->
                    <div class="mb-4">
                        <label for="password" class="block text-gray-300 text-sm font-semibold mb-2">Password</label>
                        <input
                            type="password"
                            id="password"
                            placeholder="********"
                            class="shadow-sm border border-[#535353] rounded w-full py-3 px-4 text-white focus:outline-none focus:ring-1 focus:ring-[#1ED760] bg-[#3E3E3E] placeholder-gray-400"
                            v-model="password"
                            required
                        />
                        <p class="text-gray-400 text-xs mt-1">
                            Password must contain one lowercase letter, one uppercase letter, one symbol, one number, and be at least 8 characters long.
                        </p>
                    </div>

                    <!-- Confirm Password Field -->
                    <div class="mb-6">
                        <label for="confirmPassword" class="block text-gray-300 text-sm font-semibold mb-2">Confirm Password</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            placeholder="********"
                            class="shadow-sm border border-[#535353] rounded w-full py-3 px-4 text-white focus:outline-none focus:ring-1 focus:ring-[#1ED760] bg-[#3E3E3E] placeholder-gray-400"
                            v-model="confirmPassword"
                            required
                        />
                    </div>

                    <p v-if="errorMessage" class="text-red-500 text-sm text-center mb-4">{{ errorMessage }}</p>

                    <!-- Register Button -->
                    <div class="flex items-center justify-center">
                        <button
                            type="submit"
                            class="bg-[#1ED760] hover:bg-[#1DB954] text-black font-bold py-3 px-6 rounded-full w-full transition duration-200 ease-in-out"
                        >
                            Register
                        </button>
                    </div>
                </form>

                <!-- Link to Login Page -->
                <p class="text-center text-gray-400 text-sm mt-8">
                    Already have an account?
                    <router-link to="/login" class="font-bold text-[#1ED760] hover:text-[#1DB954]">Log In</router-link>
                </p>
            </div>
        </div>
    </div>
</template>
