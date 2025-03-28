<template>
  <nav class="navbar navbar-expand-lg">
    <div class="container-fluid">
      <a class="navbar-brand" href="#">QUẢN LÝ CẤP PHÁT VĂN PHÒNG PHẨM</a>
      <button
        type="button"
        class="navbar-toggler navbar-toggler-right"
        :class="{ toggled: $sidebar.showSidebar }"
        aria-controls="navigation-index"
        aria-expanded="false"
        aria-label="Toggle navigation"
        @click="toggleSidebar"
      >
        <span class="navbar-toggler-bar burger-lines"></span>
        <span class="navbar-toggler-bar burger-lines"></span>
        <span class="navbar-toggler-bar burger-lines"></span>
      </button>
      <div class="collapse navbar-collapse justify-content-end">
        <ul class="navbar-nav ml-auto">
          <!-- Bell Icon with Unread Count -->
          <li class="nav-item notification-bell" @click="toggleNotificationMenu">
            <i class="fa fa-bell"></i>
            <span v-if="unreadCount > 0" class="notification-count">{{ unreadCount }}</span>
          </li>

          <!-- Notification Dropdown Menu -->
          <div v-if="showNotificationMenu" class="notification-menu">
            <ul>
              <li
                v-for="notification in recentUnreadNotifications"
                :key="notification.notificationID"
                @click="viewNotification(notification)"
              >
                {{ notification.message }}
              </li>
              <li v-if="recentUnreadNotifications.length === 0">Không có thông báo mới</li>
            </ul>
          </div>

          <!-- Welcome Text -->
          <span class="mr-2 welcome-text">Xin chào, {{ userName }} ({{ userRole_v }})</span>

          <!-- Logout -->
          <li class="nav-item dropdown" ref="dropdown" style="cursor: pointer;">
            <i class="fa fa-sign-out-alt" @click="logout"></i>
            <span class="ml-2 logout-text" @click="logout">Đăng xuất</span>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      userName: localStorage.getItem("userName") || "Người dùng",
      userRole: localStorage.getItem("userRole") || "Khách",
      unreadCount: 0, // Number of unread notifications
      recentUnreadNotifications: [], // List of recent unread notifications
      showNotificationMenu: false, // Toggle for the notification dropdown menu
      userID: localStorage.getItem("userId"),
      token: localStorage.getItem("authToken"),
      userRole_v: '',
      department: localStorage.getItem("department"),
    };
  },
  async mounted() {
  // Delay execution for 246ms to allow localStorage data to populate
  setTimeout(async () => {
    // Retrieve localStorage data again after the delay
    this.userID = localStorage.getItem("userId");
    this.token = localStorage.getItem("authToken");
    this.userName = localStorage.getItem("userName") || "Người dùng";
    this.userRole = localStorage.getItem("userRole") || "Khách";
    // if user role has 'Leader' => toggle = 1
    this.department = localStorage.getItem("department") || "Phòng ban";
    //if has employee => nhân viên + department
    //if has leader => trưởng phòng + department
    if (this.userRole === 'Finance Management Employee') {
      this.userRole_v = 'Nhân viên ' + this.department;
    } else if (this.userRole === 'Dep Leader') {
      this.userRole_v = 'Trưởng phòng ' + this.department;
    } else if (this.userRole === 'Sup Leader') {
      this.userRole_v = 'Trưởng phòng ' + this.department;
    } else {
      this.userRole_v = 'Nhân viên ' + this.department;
    }

    // Fetch unread notifications count and recent unread notifications
    if (this.userID && this.token) {
      await this.fetchUnreadCount();
      await this.fetchRecentUnreadNotifications();
    } else {
      console.error("User ID or token is missing from localStorage.");
    }
  }, 246);
},
  methods: {
    toggleSidebar() {
      this.$sidebar.displaySidebar(!this.$sidebar.showSidebar);
    },
    async fetchUnreadCount() {
      try {
        const response = await axios.get(`https://localhost:7162/Notification/unread/count/${this.userID}`, {
          headers: { Authorization: `Bearer ${this.token}` },
        });
        this.unreadCount = response.data || 0;
      } catch (error) {
        console.error("Error fetching unread count:", error);
      }
    },
    async fetchRecentUnreadNotifications() {
      try {
        const response = await axios.get(`https://localhost:7162/Notification/unread-by-user`, {
          headers: { Authorization: `Bearer ${this.token}` },
          params: { userId: this.userID },
        });
        this.recentUnreadNotifications = response.data.slice(0, 5); // Limit to 5 notifications
      } catch (error) {
        console.error("Error fetching recent unread notifications:", error);
      }
    },
    toggleNotificationMenu() {
      this.showNotificationMenu = !this.showNotificationMenu;
    },
    async viewNotification(notification) {
      try {
        // Mark the notification as read
        await axios.put(
          `https://localhost:7162/Notification/mark-as-read/${notification.notificationID}`,
          {},
          { headers: { Authorization: `Bearer ${this.token}` } }
        );

        // Update the local state
        this.unreadCount = Math.max(this.unreadCount - 1, 0);
        this.recentUnreadNotifications = this.recentUnreadNotifications.filter(
          (n) => n.notificationID !== notification.notificationID
        );

        // Navigate to the appropriate page
        const requestID = notification.requestID;
        let targetRoute = "";

        if (this.userRole === "Sup Leader") {
          if (notification.message.includes("phẩm")) {
            targetRoute = "/admin/table-list";
          } else {
            targetRoute = `/admin/viewsummary/${requestID}`;
          }
        } else if (this.userRole === "Finance Management Employee") {
          if (notification.message.includes("phẩm")) {
            targetRoute = `/admin/editproduct/${requestID}`;
          } else if (notification.message.includes("hợp")) {
            targetRoute = `/admin/viewsummary/${requestID}`;
          } else {
            targetRoute = `/admin/viewrequest/${requestID}`;
          }
        } else {
          if (notification.message.includes("phẩm")) {
            targetRoute = `/admin/editproduct/${requestID}`;
          } else {
            targetRoute = `/admin/viewrequest/${requestID}`;
          }
        }

        // Force navigation even if the target route is the same
        if (this.$route.path === targetRoute) {
          await this.$router.replace({ path: "/refresh" }); // Temporary route
          await this.$router.replace(targetRoute); // Navigate to the target route
        } else {
          await this.$router.push(targetRoute);
        }
      } catch (error) {
        console.error("Error marking notification as read or navigating:", error);
      }
    },
    logout() {
      localStorage.clear();
      this.$router.push("/");
    },
  },
};
</script>

<style scoped>
/* Bell Icon Styling */
.notification-bell {
  position: relative;
  display: inline-block;
  cursor: pointer;
  font-size: 24px;
  color: #6c757d;
  margin-right: 15px;
}

.notification-bell:hover {
  color: #007bff;
}

.notification-bell .notification-count {
  position: absolute;
  top: -5px;
  right: -5px;
  background-color: red;
  color: white;
  font-size: 12px;
  font-weight: bold;
  border-radius: 50%;
  padding: 2px 6px;
}

/* Notification Dropdown Menu */
.notification-menu {
  position: absolute;
  top: 50px;
  right: 15px;
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 5px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  width: 300px;
}

.notification-menu ul {
  list-style: none;
  margin: 0;
  padding: 10px;
}

.notification-menu ul li {
  padding: 10px;
  cursor: pointer;
  border-bottom: 1px solid #f1f1f1;
}

.notification-menu ul li:hover {
  background-color: #f8f9fa;
}

.notification-menu ul li:last-child {
  border-bottom: none;
}

/* Welcome Text Styling */
.welcome-text {
  font-weight: bold;
  font-size: 1.24rem;
  margin-right: 100px;
}

/* Logout Text Styling */
.logout-text {
  cursor: pointer;
}
</style>