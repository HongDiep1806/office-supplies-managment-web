<template>
  <div class="content">
    <div class="container-fluid">
      <!-- Search Filters -->
      <div class="search-filters d-flex flex-wrap align-items-center gap-3 p-3 bg-light rounded shadow-sm">
        <div class="form-group mb-0">
          <label class="form-label">Tìm kiếm thông báo</label>
          <input v-model="searchQuery" class="form-control" placeholder="Nhập từ khóa..." />
        </div>
        <button class="btn btn-primary mt-3 btn-search" @click="searchNotifications">
          <i class="fa fa-search"></i> Tìm kiếm
        </button>
        <button class="btn btn-success mt-3 btn-mark-all" @click="markAllAsRead">
          <i class="fa fa-check"></i> Đánh dấu tất cả đã đọc
        </button>
      </div>

      <!-- Notifications Table -->
      <div class="table-responsive">
        <table class="table table-hover table-striped">
          <thead>
            <tr>
              <th style="width: 5%;">STT</th>
              <th style="width: 60%;">Thông báo</th>
              <th style="width: 25%;">Thời gian</th>
              <th style="width: 10%;">Đã đọc</th>
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
              <td>{{ notification.message }}</td>
              <td>{{ formatDate(notification.createdDate) }}</td>
              <td>
                <span
                  :class="['badge', notification.isRead ? 'badge-success' : 'badge-danger']"
                >
                  {{ notification.isRead ? 'Đã xem' : 'Chưa xem' }}
                </span>
              </td>
              <!-- <td>
                <button
                  class="btn btn-primary btn-sm"
                  @click.stop="viewNotification(notification)"
                >
                  <i class="fa fa-eye"></i> Xem
                </button>
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
    };
  },
  computed: {
    filteredNotifications() {
      const filtered = this.apiNotifications.filter((notification) =>
        notification.message.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
      return filtered;
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
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(date).toLocaleDateString(undefined, options);
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
  flex: 1;
  min-width: 200px;
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

.btn-search {
  white-space: nowrap;
  padding: 10px 20px;
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: 5px;
}

.btn-mark-all {
  white-space: nowrap;
  padding: 10px 20px;
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: 5px;
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
</style>