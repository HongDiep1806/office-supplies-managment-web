import Vue from "vue";
import VueRouter from "vue-router";
import App from "./App.vue";
import axios from "axios";

// Import Light Bootstrap plugin
import LightBootstrap from "./light-bootstrap-main";

// Import routes
import routes from "./routes/routes";

import "./registerServiceWorker";

// Sử dụng plugin
Vue.use(VueRouter);
Vue.use(LightBootstrap);

// Cấu hình router
const router = new VueRouter({
  mode: "history", // Sử dụng history mode để tránh dấu #
  routes,
  linkActiveClass: "nav-item active",
  scrollBehavior: (to) => {
    if (to.hash) {
      return { selector: to.hash };
    } else {
      return { x: 0, y: 0 };
    }
  },
});

// Middleware kiểm tra đăng nhập
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem("authToken");

  if (to.meta.requiresAuth && !token) {
    next("/"); // Chuyển hướng về trang login nếu chưa đăng nhập
  } else {
    next();
  }
});

// Cấu hình Axios
axios.defaults.baseURL = "http://localhost:7162"; // Đặt URL gốc cho API

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Nếu mã lỗi là 401 (Unauthorized), xóa token và chuyển hướng về login
      localStorage.removeItem("authToken");
      router.push("/"); // Chuyển hướng về trang login
    }
    return Promise.reject(error);
  }
);

/* eslint-disable no-new */
new Vue({
  el: "#app",
  render: (h) => h(App),
  router,
});
