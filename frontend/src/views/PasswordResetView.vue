<template>
  <div class="relative min-h-screen bg-black flex items-center justify-center p-4">
    <div class="w-full max-w-md bg-[#181818] rounded-lg shadow-lg p-8 text-white">
      <h2 class="text-3xl font-bold text-center mb-6">Reset Your Password</h2>

      <p class="text-gray-400 text-center mb-4">
        Enter your new password below to reset your account password.
      </p>

      <form @submit.prevent="submitPassword" class="space-y-4">
        <div>
          <label class="block text-gray-300 text-sm font-semibold mb-2">New Password</label>
          <input
            type="password"
            v-model="newPassword"
            placeholder="Enter new password"
            class="w-full py-3 px-4 bg-[#3E3E3E] border border-[#535353] rounded text-white focus:outline-none focus:ring-1 focus:ring-[#1ED760]"
            required
          />
        </div>

        <div>
          <label class="block text-gray-300 text-sm font-semibold mb-2">Confirm Password</label>
          <input
            type="password"
            v-model="confirmPassword"
            placeholder="Confirm new password"
            class="w-full py-3 px-4 bg-[#3E3E3E] border border-[#535353] rounded text-white focus:outline-none focus:ring-1 focus:ring-[#1ED760]"
            required
          />
        </div>

        <button
          type="submit"
          class="w-full bg-[#1ED760] hover:bg-[#1DB954] text-black font-bold py-3 px-6 rounded-full transition duration-200 ease-in-out"
        >
          Reset Password
        </button>
      </form>

      <p v-if="error" class="text-red-500 text-sm mt-4 text-center">{{ error }}</p>
      <p v-if="success" class="text-[#1ED760] text-sm mt-4 text-center">{{ success }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const token = route.query.token || ''

const newPassword = ref('')
const confirmPassword = ref('')
const error = ref('')
const success = ref('')

const submitPassword = async () => {
  error.value = ''
  success.value = ''

  if (!token) {
    error.value = 'Invalid or missing token.'
    return
  }

  if (newPassword.value !== confirmPassword.value) {
    error.value = 'Passwords do not match.'
    return
  }

  try {
    const res = await axios.post('http://localhost:5000/api/auth/pwd-change', {
      new_password: newPassword.value,
      token
    })

    success.value = res.data.message || 'Password reset successfully!'
    newPassword.value = ''
    confirmPassword.value = ''

    // Optionally redirect to login after a short delay
    setTimeout(() => {
      localStorage.removeItem('jwt_token');
      localStorage.removeItem('user_data');
      router.push('/login')
    }, 2000)
  } catch (err) {
    console.error(err)
    error.value = err.response?.data?.message || 'Failed to reset password.'
  }
}
</script>

<style scoped>
body {
  margin: 0;
  font-family: Arial, sans-serif;
}
</style>
