<template>
  <div class="d-flex justify-content-center align-items-center min-vh-100"
    style="background-image: url('https://media.licdn.com/dms/image/v2/C4E1BAQHhunsSgrkEHA/company-background_10000/company-background_10000/0/1614734251750/becamex_idc_vietnam_cover?e=2147483647&v=beta&t=PZSPf-AuHNCCATPClSWGuV1VwJPpnzPUZ5zaspEtwDY');background-repeat: no-repeat; /* Prevent background from repeating */
  background-size: contain;
  background-position: center; 
  background-attachment: fixed;">
    <div class="card shadow p-4" style="width: 400px;">
      <div class="text-center mb-4">
        <h3>Đăng Nhập</h3>
        <p>Hãy đăng nhập vào tài khoản của bạn</p>
      </div>
      <form @submit.prevent="handleLogin">
        <div class="mb-3">
          <label for="email" class="form-label">Email</label>
          <input type="email" id="email" name="email" class="form-control" v-model="email"
            placeholder="Enter your email" required />
        </div>
        <div class="mb-3">
          <label for="password" class="form-label">Mật khẩu</label>
          <input type="password" id="password" name="password" class="form-control" v-model="password"
            placeholder="Enter your password" required />
        </div>
        <button type="submit" class="btn btn-primary w-100">Đăng Nhập</button>
      </form>
      <div class="mt-3 text-center">
        <a href="#" class="text-decoration-none">Quên mật khẩu ?</a>
      </div>
    </div>
  </div>


</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      email: '',
      password: '',
      errorMessage: '',
      type: ['success', 'danger', 'warning'],
    };
  },
  methods: {
    async notifySuccess(verticalAlign, horizontalAlign) {
      this.$notifications.notify({
        message: `<span>Đăng nhập thành công</span>`,
        icon: 'nc-icon nc-app',
        horizontalAlign: horizontalAlign,
        verticalAlign: verticalAlign,
        type: this.type[0]
      });
    },
    async notifyError(verticalAlign, horizontalAlign) {
      this.$notifications.notify({
        message: `<span>Email hoặc mật khẩu sai. Vui lòng nhập lại</span>`,
        icon: 'nc-icon nc-app',
        horizontalAlign: horizontalAlign,
        verticalAlign: verticalAlign,
        type: this.type[1]
      });
    },
    async notifyWarning(verticalAlign, horizontalAlign) {
      this.$notifications.notify({
        message: `<span>Vui lòng nhập đủ thông tin</span>`,
        icon: 'nc-icon nc-app',
        horizontalAlign: horizontalAlign,
        verticalAlign: verticalAlign,
        type: this.type[2]
      });
    },
    async handleLogin() {
      if (this.email === '' || this.password === '') {
        this.notifyWarning('bottom', 'center');
      } else {

        try {
          const response = await axios.post('https://localhost:7162/api/auth/login', {
            email: this.email,
            password: this.password
          });

          const token = response.data.token;
          if (token) {
            // Lưu token vào localStorage hoặc Vuex
            localStorage.setItem('authToken', token);

            // Chuyển hướng đến trang admin
            this.$router.push('/admin');
            await this.notifySuccess('bottom', 'right');
          } else {
            this.errorMessage = 'Invalid email or password';
          }
        } catch (error) {
          if (error.response) {
            // Nếu API trả về lỗi 401 (Unauthorized)
            if (error.response.status === 401) {
              this.errorMessage = 'Email hoặc mật khẩu không đúng';
              await this.notifyError('bottom', 'right');
            } else {
              this.errorMessage = 'Đã xảy ra lỗi. Vui lòng thử lại';
            }
          } else {
            // Lỗi không có phản hồi từ server (network error)
            this.errorMessage = 'Không thể kết nối đến server';
            await this.notifyError('bottom', 'right');
          }
        }
      }
    },


  }
}
</script>


<style scoped>
body {
  background-color: #f8f9fa;
}
</style>