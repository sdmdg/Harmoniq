<script setup>
import { ref } from 'vue';
import apiClient from '../utils/axios';
import { useRouter } from 'vue-router';
import ParticleBackground from '../components/ParticleBackground.vue';

// Reactive variables to store email and password
const email = ref('');
const password = ref('');
const rememberMe = ref(false);
const errorMessage = ref('');

const router = useRouter();

const handleLogin = async () => {
    errorMessage.value = '';

    try {
        const response = await apiClient.post('api/auth/login/', {
            email: email.value,
            password: password.value,
            rememberMe: rememberMe.value,
        });

        const { token, user } = response.data;

        // Store the JWT token
        localStorage.setItem('jwt_token', token);

        // Store user information
        localStorage.setItem('user_data', JSON.stringify(user));

        // Redirect to home page after successful login
        router.push('/home');

        console.log('Login successful!', { token, user });

    } catch (error) {
        console.error('Login failed:', error);
        if (error.response && error.response.data && error.response.data.message) {
            errorMessage.value = error.response.data.message;
        } else {
            errorMessage.value = 'An unexpected error occurred. Please try again.';
        }
    }
};
</script>

<template>
    <div class="relative min-h-screen bg-black overflow-hidden">
        <!-- Particle background component -->
        <ParticleBackground />

        <!-- Login form container, positioned above the canvas -->
        <div class="relative z-10 flex items-center justify-center min-h-screen p-4">
            <div class="w-full max-w-md bg-[#181818] rounded-lg shadow-lg p-8">
                <center><img src="images/icons/logo.png" style="width: 80%;"></center>
                <h4 class="text-white text-3xl font-bold text-center mb-6">Log In</h4>

                <form @submit.prevent="handleLogin">
                    <div class="mb-4">
                        <label for="email" class="block text-gray-300 text-sm font-semibold mb-2">Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            placeholder="your@example.com"
                            class="shadow-sm appearance-none border border-[#535353] rounded w-full py-3 px-4 text-white leading-tight focus:outline-none focus:ring-1 focus:ring-[#1ED760] bg-[#3E3E3E] placeholder-gray-400"
                            v-model="email" required
                        />
                    </div>

                    <div class="mb-6">
                        <label for="password" class="block text-gray-300 text-sm font-semibold mb-2">Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            placeholder="********"
                            class="shadow-sm appearance-none border border-[#535353] rounded w-full py-3 px-4 text-white leading-tight focus:outline-none focus:ring-1 focus:ring-[#1ED760] bg-[#3E3E3E] placeholder-gray-400"
                            v-model="password" required
                        />
                    </div>

                    <p v-if="errorMessage" class="text-red-500 text-sm text-center mb-4">{{ errorMessage }}</p>

                    <div class="flex items-center justify-between mb-6">
                        <label class="flex items-center text-gray-300 text-sm">
                            <input type="checkbox" class="form-checkbox h-4 w-4 text-[#1ED760] transition duration-150 ease-in-out bg-[#3E3E3E] border-[#535353] rounded focus:ring-[#1ED760]"
                            id="rememberMe"
                            name="rememberMe"
                            v-model="rememberMe" />
                            <span class="ml-2">Remember me</span>
                        </label>
               <!--          <a href="#" class="inline-block align-baseline font-bold text-sm text-[#1ED760] hover:text-[#1DB954]">
                            Forgot Password?
                        </a> -->
                    </div>

                    <div class="flex items-center justify-center">
                        <button
                            type="submit"
                            class="bg-[#1ED760] hover:bg-[#1DB954] text-black font-bold py-3 px-6 rounded-full focus:outline-none focus:shadow-outline w-full transition duration-200 ease-in-out"
                        >
                            Login
                        </button>
                    </div>
                </form>

                <p class="text-center text-gray-400 text-sm mt-8">
                    
                    Don't have an account?
                    <router-link to="/register" class="font-bold text-[#1ED760] hover:text-[#1DB954]">Sign Up</router-link>
                </p>
            </div>
        </div>
    </div>
</template>
