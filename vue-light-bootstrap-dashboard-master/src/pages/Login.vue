<template>
    <div class="d-flex justify-content-center align-items-center min-vh-100">
      <div class="card shadow p-4" style="width: 400px;">
        <div class="text-center mb-4">
          <h3>Login</h3>
          <p>Please enter your credentials.</p>
        </div>
        <form @submit.prevent="handleLogin">
          <div class="mb-3">
            <label for="email" class="form-label">Email address</label>
            <input
              type="email"
              id="email"
              class="form-control"
              v-model="email"
              placeholder="Enter your email"
              required
            />
          </div>
          <div class="mb-3">
            <label for="password" class="form-label">Password</label>
            <input
              type="password"
              id="password"
              class="form-control"
              v-model="password"
              placeholder="Enter your password"
              required
            />
          </div>
          <button type="submit" class="btn btn-primary w-100">Login</button>
        </form>
        <div class="mt-3 text-center">
          <a href="#" class="text-decoration-none">Forgot your password?</a>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  
  export default {
  data() {
    return {
      email: '',
      password: '',
    };
  },
  methods: {
    handleLogin() {
      
      // Perform login logic here
      this.$router.push('/admin');
    }
}
  }
  </script>
  
  <style scoped>
  body {
    background-color: #f8f9fa;
  }
  </style>
  