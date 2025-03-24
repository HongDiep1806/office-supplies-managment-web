<template>
  <div class="content">
    <div class="container-fluid">
      <card>
        <div class="table-responsive">
          <table class="table table-hover table-striped">
            <thead>
              <tr>
                <th>Message</th>
                <th>Date</th>
                <th>Is Read</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="notification in paginatedNotifications" :key="notification.notificationID">
                <td :class="{ 'font-weight-bold': !notification.isRead }">{{ notification.message }}</td>
                <td>{{ new Date(notification.createdDate).toLocaleString() }}</td>
                <td>{{ notification.isRead ? 'Yes' : 'No' }}</td>
                <td>
                  <button
                    class="btn btn-sm"
                    :class="notification.isRead ? 'btn-secondary' : 'btn-primary'"
                    @click="markAsRead(notification.notificationID)"
                    :disabled="notification.isRead"
                  >
                    Mark as read
                  </button>
                  <button
                    class="btn btn-info btn-sm"
                    @click="viewRequest(notification.requestID)"
                  >
                    View
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <button class="btn btn-primary mt-3" @click="markAllAsRead">Mark All as Read</button>
        <nav aria-label="Page navigation example">
          <ul class="pagination justify-content-center">
            <li class="page-item" :class="{ disabled: currentPage === 1 }">
              <a class="page-link" href="#" @click.prevent="changePage(currentPage - 1)">Previous</a>
            </li>
            <li class="page-item" v-for="page in totalPages" :key="page" :class="{ active: currentPage === page }">
              <a class="page-link" href="#" @click.prevent="changePage(page)">{{ page }}</a>
            </li>
            <li class="page-item" :class="{ disabled: currentPage === totalPages }">
              <a class="page-link" href="#" @click.prevent="changePage(currentPage + 1)">Next</a>
            </li>
          </ul>
        </nav>
      </card>
    </div>
  </div>
</template>

<script>
import Card from 'src/components/Cards/Card.vue'
import axios from 'axios'

export default {
  components: {
    Card
  },
  data() {
    return {
      type: ['', 'info', 'success', 'warning', 'danger'],
      notifications: {
        topCenter: false
      },
      userID: localStorage.getItem('userId'), // Assuming userID is stored in localStorage
      token: localStorage.getItem('authToken'),
      userRole: localStorage.getItem('userRole'), // Assuming token is stored in localStorage
      apiNotifications: [], // To store notifications fetched from the API
      currentPage: 1,
      itemsPerPage: 10
    }
  },
  computed: {
    paginatedNotifications() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.apiNotifications.slice(start, end);
    },
    totalPages() {
      return Math.ceil(this.apiNotifications.length / this.itemsPerPage);
    }
  },
  methods: {
    async markAllAsRead() {
      try {
        await axios.put(`https://localhost:7162/Notification/mark-all-as-read/${this.userID}`, {}, {
          headers: { Authorization: `Bearer ${this.token}` }
        });
        this.apiNotifications = this.apiNotifications.map(notification => {
          notification.isRead = true;
          return notification;
        });
      } catch (error) {
        console.error('Error marking all notifications as read:', error);
      }
    },
    async fetchNotifications() {
      try {
        const response = await axios.get(`https://localhost:7162/Notification/user/${this.userID}`, {
          headers: { Authorization: `Bearer ${this.token}` }
        });
        this.apiNotifications = response.data.sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate));
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    },
    async markAsRead(notificationID) {
      try {
        await axios.put(`https://localhost:7162/Notification/mark-as-read/${notificationID}`, {}, {
          headers: { Authorization: `Bearer ${this.token}` }
        });
        this.apiNotifications = this.apiNotifications.map(notification => {
          if (notification.notificationID === notificationID) {
            notification.isRead = true;
          }
          return notification;
        });
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    },
    viewRequest(requestID) {
      if (this.userRole === 'Sup Leader') {
        if (this.apiNotifications.find(notification => notification.requestID === requestID).message.includes("product")) {
          this.$router.push('/admin/table-list');
          return;
        } else {
          this.$router.push(`/admin/viewsummary/${requestID}`);
        }
      } else if (this.userRole === 'Finance Management Employee'){
        if (this.apiNotifications.find(notification => notification.requestID === requestID).message.includes("product")) {
          this.$router.push(`/admin/editproduct/${requestID}`);
          return;
        } else if (this.apiNotifications.find(notification => notification.requestID === requestID).message.includes("summary")) {
          this.$router.push(`/admin/viewsummary/${requestID}`);
        } else {
          this.$router.push(`/admin/viewrequest/${requestID}`);
        }
      }
      else {
        if (this.apiNotifications.find(notification => notification.requestID === requestID).message.includes("product")) {
          this.$router.push(`/admin/editproduct/${requestID}`);
          return;
        } else {
          this.$router.push(`/admin/viewrequest/${requestID}`);
        }
      }
    },
    changePage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
      }
    }
  },
  async mounted() {
    await this.fetchNotifications();
  }
}
</script>

<style lang="scss">
</style>