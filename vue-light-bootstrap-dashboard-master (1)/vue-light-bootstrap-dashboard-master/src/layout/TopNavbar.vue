<template>
  <div :key="$route.fullPath">
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
            <div class="notification-container">
              <!-- Bell Icon with Unread Count -->
              <div class="notification-bell" @click="toggleNotificationMenu">
                <i class="fa fa-bell"></i>
                <span v-if="unreadCount > 0" class="notification-count">{{ notificationCountDisplay }}</span>
              </div>

              <!-- Notification Dropdown Menu -->
              <div v-if="showNotificationMenu" class="notification-menu">
                <ul>
                  <li
                    v-for="notification in recentUnreadNotifications"
                    :key="notification.notificationID"
                    @click="viewNotification(notification)"
                  >
                    <div>{{ notification.message }}</div>
                    <div class="notification-time">
                      {{ formatNotificationDate(notification.createdDate) }}
                    </div>
                  </li>
                  <li v-if="recentUnreadNotifications.length === 0">Không có thông báo mới</li>
                </ul>
              </div>
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
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      currentKey: Date.now(), // Initialize with a unique value
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
    console.log("Component mounted for route:", this.$route.fullPath);
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
  watch: {
    $route(to, from) {
      // Reload data when the route changes
      this.loadData();
    },
  },
  beforeRouteUpdate(to, from, next) {
    // Reload data when the route changes
    this.loadData();
    next();
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

        // Sort notifications by creation date (latest first)
        this.recentUnreadNotifications = response.data.sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate));
      } catch (error) {
        console.error("Error fetching recent unread notifications:", error);
      }
    },
    toggleNotificationMenu() {
      this.showNotificationMenu = !this.showNotificationMenu;
    },
    async viewNotification(notification) {
      console.log("Navigating to notification:", notification);
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

        // Determine the target route
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

        // Update the key to force component reload
        this.currentKey = Date.now();

        // Navigate to the target route
        await this.$router.push(targetRoute);

        // Close the notification menu after navigation
        this.showNotificationMenu = false;
      } catch (error) {
        console.error("Error marking notification as read or navigating:", error);
      }
    },
    loadData() {
      console.log("Loading data for route:", this.$route.fullPath);
      // Fetch the necessary data for the component
      this.fetchRecentUnreadNotifications();
      // Add any other data-fetching logic here
    },
    logout() {
      localStorage.clear();
      this.$router.push("/");
    },
    formatNotificationDate(dateString) {
      const date = new Date(dateString);
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear(); // Add the year
      return `${hours}:${minutes} ${day}/${month}/${year}`; // Include the year in the format
    },
  },
  computed: {
    notificationCountDisplay() {
      return this.unreadCount > 5 ? "5+" : this.unreadCount.toString();
    },
  },
};
</script>

<style scoped>
/* Notification Container */
.notification-container {
  position: relative;
  display: inline-block;
}

/* Bell Icon Styling */
.notification-bell {
  position: relative;
  display: inline-block;
  cursor: pointer;
  font-size: 24px;
  color: #6c757d;
  margin-right: 10px; /* Adjusted from 15px to 10px to move it left */
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
  top: 40px; /* Adjust to align below the bell icon */
  right: 0; /* Align with the bell icon */
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 5px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  width: 300px;
  max-height: 300px; /* Limit height to show more notifications */
  overflow-y: auto; /* Add vertical scrollbar */
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

.notification-time {
  font-size: 12px;
  color: #6c757d;
  margin-top: 5px;
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