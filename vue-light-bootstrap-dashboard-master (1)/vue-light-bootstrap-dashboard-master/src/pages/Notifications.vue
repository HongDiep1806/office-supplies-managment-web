<template>
  <div class="content">
    <div class="container-fluid">
      <card>
        <!-- <div class="places-buttons">
          <div class="row justify-content-center">
            <div class="col-6 text-center">
              <h5>Notifications Places
                <p class="category">Click to view notifications</p>
              </h5>
            </div>
          </div>
          <div class="row justify-content-center">
            <div class="col-md-3 col-md-offset-1">
              <button class="btn btn-default btn-block" @click="notifyVue('top', 'left')">Top Left</button>
            </div>
            <div class="col-md-3">
              <button class="btn btn-default btn-block" @click="notifyVue('top', 'center')">Top Center</button>
            </div>
            <div class="col-md-3">
              <button class="btn btn-default btn-block" @click="notifyVue('top', 'right')">Top Right</button>
            </div>
          </div>
          <div class="row justify-content-center">
            <div class="col-md-3 col-md-offset-1">
              <button class="btn btn-default btn-block" @click="notifyVue('bottom', 'left')">Bottom Left</button>
            </div>
            <div class="col-md-3">
              <button class="btn btn-default btn-block" @click="notifyVue('bottom', 'center')">Bottom Center</button>
            </div>
            <div class="col-md-3">
              <button class="btn btn-default btn-block" @click="notifyVue('bottom', 'right')">Bottom Right</button>
            </div>
          </div>
        </div> -->
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
              <tr v-for="notification in apiNotifications" :key="notification.notificationID">
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
      apiNotifications: [] // To store notifications fetched from the API
    }
  },
  methods: {
    async fetchNotifications() {
      try {
        const response = await axios.get(`https://localhost:7162/Notification/user/${this.userID}`, {
          headers: { Authorization: `Bearer ${this.token}` }
        });
        this.apiNotifications = response.data.sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate));
        //this.showNotifications();
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    },
    showNotifications() {
      this.apiNotifications.forEach(notification => {
        const color = Math.floor((Math.random() * 4) + 1);
        this.$notifications.notify({
          message: `<span>${notification.message}</span>`,
          icon: 'nc-icon nc-app',
          horizontalAlign: 'right', // Use valid horizontalAlign value
          verticalAlign: 'top', // Use valid verticalAlign value
          type: this.type[color]
        });
      });
    },
    notifyVue(verticalAlign, horizontalAlign) {
      const color = Math.floor((Math.random() * 4) + 1);
      this.$notifications.notify({
        message: `<span>Welcome to <b>Light Bootstrap Dashboard</b> - a beautiful freebie for every web developer.</span>`,
        icon: 'nc-icon nc-app',
        horizontalAlign: horizontalAlign,
        verticalAlign: verticalAlign,
        type: this.type[color]
      });
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
      this.$router.push(`/admin/viewsummary/${requestID}`);
      } else {
        this.$router.push(`/admin/viewrequest/${requestID}`);
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