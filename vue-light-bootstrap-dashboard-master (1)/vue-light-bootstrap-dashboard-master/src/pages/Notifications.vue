<template>
  <div class="content">
    <div class="container-fluid">
      <!-- Search Filters -->
      <div class="search-filters d-flex flex-wrap align-items-center gap-3 p-3 bg-light rounded shadow-sm">
        <!-- Search Input -->
        <div class="form-group mb-0 flex-grow-7">
          <label class="form-label">Tìm kiếm thông báo</label>
          <input v-model="searchQuery" class="form-control" placeholder="Nhập từ khóa..." />
        </div>

        <!-- Dropdown Menu -->
        <div class="form-group mb-0 flex-grow-1">
          <label class="form-label">Lọc thông báo</label>
          <select v-model="filterType" class="form-control" @change="filterNotifications">
            <option value="all">Tất cả</option>
            <option value="unread">Chưa đọc</option>
          </select>
        </div>

        <!-- Mark All as Read Button -->
        <div class="form-group mb-0 flex-grow-2">
          <label class="form-label">&nbsp;</label> <!-- Blank label for alignment -->
          <button class="btn btn-success btn-mark-all" @click="markAllAsRead">
            <i class="fa fa-check"></i> Đánh dấu tất cả đã đọc
          </button>
        </div>
      </div>

      <!-- Notifications Table -->
      <div class="table-responsive">
        <table class="table table-hover table-striped">
          <thead>
            <tr>
              <th style="width: 5%;">STT</th>
              <th style="width: 65%;">Thông báo</th>
              <th style="width: 30%;">Thời gian</th>
              <!-- <th style="width: 10%;">Đã đọc</th> -->
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(notification, index) in paginatedNotifications"
              :key="notification.notificationID"
              @click="viewNotification(notification)"
              class="clickable-row"
            >
              <td>{{ (currentPage - 1) * itemsPerPage + index + 1 }}</td>
              <td :class="{ 'font-weight-bold': !notification.isRead }">
                {{ notification.message }}
              </td>
              <td>{{ formatDate(notification.createdDate) }}</td>
              <!-- <td>
                <span
                  :class="['badge', notification.isRead ? 'badge-success' : 'badge-danger']"
                >
                  {{ notification.isRead ? 'Đã xem' : 'Chưa xem' }}
                </span>
              </td> -->
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <nav class="pagination-container">
        <ul class="pagination justify-content-end">
          <li class="page-item" :class="{ disabled: currentPage === 1 }">
            <button class="page-link" @click="changePage(currentPage - 1)">Trước</button>
          </li>
          <li
            class="page-item"
            v-for="page in totalPages"
            :key="page"
            :class="{ active: currentPage === page }"
          >
            <button class="page-link" @click="changePage(page)">{{ page }}</button>
          </li>
          <li class="page-item" :class="{ disabled: currentPage === totalPages }">
            <button class="page-link" @click="changePage(currentPage + 1)">Tiếp</button>
          </li>
        </ul>
      </nav>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      searchQuery: '', // For search functionality
      userID: localStorage.getItem('userId'),
      token: localStorage.getItem('authToken'),
      userRole: localStorage.getItem('userRole'),
      apiNotifications: [],
      currentPage: 1,
      itemsPerPage: 10,
      filterType: 'all', // Default filter type
    };
  },
  computed: {
    filteredNotifications() {
      let filtered = this.apiNotifications;
      if (this.filterType === 'unread') {
        filtered = filtered.filter((notification) => !notification.isRead);
      }
      return filtered.filter((notification) =>
        notification.message.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    },
    paginatedNotifications() {
      const startIndex = (this.currentPage - 1) * this.itemsPerPage;
      const endIndex = startIndex + this.itemsPerPage;
      return this.filteredNotifications.slice(startIndex, endIndex);
    },
    totalPages() {
      return Math.ceil(this.filteredNotifications.length / this.itemsPerPage);
    },
  },
  methods: {
    async fetchNotifications() {
      try {
        const response = await axios.get(`https://localhost:7162/Notification/user/${this.userID}`, {
          headers: { Authorization: `Bearer ${this.token}` },
        });
        this.apiNotifications = response.data.sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate));
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    },
    filterNotifications() {
      if (this.filterType === 'unread') {
        this.apiNotifications = this.apiNotifications.filter((notification) => !notification.isRead);
      } else {
        this.fetchNotifications(); // Reload all notifications
      }
      this.currentPage = 1; // Reset to the first page
    },
    async fetchRecentUnreadNotifications() {
      try {
        const response = await axios.get(`https://localhost:7162/Notification/unread-by-user`, {
          headers: { Authorization: `Bearer ${this.token}` },
          params: { userId: this.userID },
        });

        // Sort notifications by creation date (latest first)
        this.apiNotifications = response.data.sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate));
      } catch (error) {
        console.error("Error fetching recent unread notifications:", error);
      }
    },
    searchNotifications() {
      this.currentPage = 1; // Reset to the first page when searching
    },
    async viewNotification(notification) {
      try {
        // Mark the notification as read if it is not already read
        if (!notification.isRead) {
          await axios.put(
            `https://localhost:7162/Notification/mark-as-read/${notification.notificationID}`,
            {},
            { headers: { Authorization: `Bearer ${this.token}` } }
          );
          notification.isRead = true; // Update the local state
        }

        // Navigate to the appropriate page based on the notification message
        const requestID = notification.requestID;
        if (this.userRole === 'Sup Leader') {
          if (notification.message.includes('phẩm')) {
            this.$router.push('/admin/table-list');
          } else {
            this.$router.push(`/admin/viewsummary/${requestID}`);
          }
        } else if (this.userRole === 'Finance Management Employee') {
          if (notification.message.includes('phẩm')) {
            this.$router.push(`/admin/editproduct/${requestID}`);
          } else if (notification.message.includes('hợp')) {
            this.$router.push(`/admin/viewsummary/${requestID}`);
          } else {
            this.$router.push(`/admin/viewrequest/${requestID}`);
          }
        } else {
          if (notification.message.includes('phẩm')) {
            this.$router.push(`/admin/editproduct/${requestID}`);
          } else {
            this.$router.push(`/admin/viewrequest/${requestID}`);
          }
        }
      } catch (error) {
        console.error('Error marking notification as read or navigating:', error);
      }
    },
    async markAllAsRead() {
      try {
        const unreadNotifications = this.apiNotifications.filter(
          (notification) => !notification.isRead
        );
        for (const notification of unreadNotifications) {
          await axios.put(
            `https://localhost:7162/Notification/mark-as-read/${notification.notificationID}`,
            {},
            { headers: { Authorization: `Bearer ${this.token}` } }
          );
          notification.isRead = true; // Update the local state
        }

        // Reload the page to ensure the top navigation bar updates
        window.location.reload();
      } catch (error) {
        console.error('Error marking all notifications as read:', error);
      }
    },
    changePage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
      }
    },
    formatDate(date) {
      const options = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      };
      return new Date(date).toLocaleString('vi-VN', options).replace(',', '');
    },
  },
  async mounted() {
    await this.fetchNotifications();
  },
};
</script>

<style scoped>
.search-filters {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 15px;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.search-filters .form-group {
  display: flex;
  flex-direction: column;
}

.flex-grow-7 {
  flex: 7;
}

.flex-grow-1 {
  flex: 1;
}

.flex-grow-2 {
  flex: 2;
}

.search-filters .form-label {
  font-weight: bold;
  font-size: 0.9rem;
  margin-bottom: 5px;
  display: block;
}

.search-filters .form-control {
  border-radius: 5px;
  border: 1px solid #ced4da;
  padding: 8px 12px;
}

.btn-mark-all {
  white-space: nowrap;
  padding: 8px 16px; /* Adjust padding to match other elements */
  font-size: 1rem;
  display: flex;
  align-items: center; /* Align content vertically */
  justify-content: center;
  gap: 5px;
  height: 38px; /* Match the height of the dropdown */
  line-height: 1; /* Ensure proper vertical alignment */
  margin-top: 0; /* Remove unnecessary top margin */
}

.btn-search {
  white-space: nowrap;
  padding: 10px 20px;
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: 5px;
}

.btn-unread {
  white-space: nowrap;
  padding: 10px 20px;
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: 5px;
  background-color: #ffc107; /* Warning color */
  color: #fff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.btn-unread:hover {
  background-color: #e0a800;
}

.table th {
  background-color: rgb(220, 68, 5); /* Orange color */
  color: white;
  font-weight: bold;
}

.table th,
.table td {
  padding: 12px 15px;
  text-align: left;
  border-bottom: 1px solid #dee2e6;
}

.table tbody tr:hover {
  background-color: #f1f1f1;
}

.clickable-row {
  cursor: pointer;
}

.badge {
  padding: 5px 10px;
  border-radius: 12px;
  font-size: 0.875rem;
}

.badge-success {
  background-color: #28a745;
  color: #fff;
}

.badge-danger {
  background-color: #dc3545;
  color: #fff;
}

.btn-sm {
  padding: 5px 10px;
  font-size: 0.875rem;
}

.pagination-container {
  margin-top: 20px;
}

.pagination .page-item.active .page-link {
  background-color: #007bff;
  border-color: #007bff;
  color: #fff;
}

.pagination .page-item.disabled .page-link {
  color: #6c757d;
  pointer-events: none;
}

.pagination .page-link {
  color: #007bff;
  border: 1px solid #dee2e6;
  padding: 5px 10px;
  border-radius: 5px;
}

.font-weight-bold {
  font-weight: bold;
}
</style>