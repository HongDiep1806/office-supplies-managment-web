<template>
  <div class="wrapper">
    <side-bar>
      <mobile-menu slot="content"></mobile-menu>
      <sidebar-link to="/admin/overview">
        <i class="nc-icon nc-chart-pie-35"></i>
        <p>Trang chủ</p>
      </sidebar-link>
      <sidebar-link to="/admin/table-list">
        <i class="nc-icon nc-bullet-list-67"></i>
        <p>Danh mục VPP</p>
      </sidebar-link>
      <sidebar-link to="/admin/request-table" v-if="role ==='Employee'">
        <i class="nc-icon nc-notes"></i>
        <p>Lịch sử Phiếu yêu cầu</p>
      </sidebar-link>
      <sidebar-link to="/admin/view-all-request" v-if="role ==='Finance Management Employee'|| role ==='Dep Leader'">
        <i class="nc-icon nc-notes"></i>
        <p>QL Phiếu yêu cầu</p>
      </sidebar-link>
      <sidebar-link to="/admin/summary-table" v-if="role ==='Finance Management Employee' || role ==='Sup Leader'">
        <i class="nc-icon nc-paper-2"></i>
        <p>QL Phiếu tổng hợp</p>
      </sidebar-link>
      
      <sidebar-link to="/admin/export-file" v-if="role ==='Sup Leader'">
        <i class="nc-icon nc-paper-2"></i>
        <p>Xuất file</p>
      </sidebar-link>
      <!-- <sidebar-link to="/admin/icons">
        <i class="nc-icon nc-atom"></i>
        <p>Icons</p>
      </sidebar-link>
      <sidebar-link to="/admin/maps">
        <i class="nc-icon nc-pin-3"></i>
        <p>Maps</p>
      </sidebar-link> -->
      <sidebar-link to="/admin/notifications">
        <i class="nc-icon nc-bell-55"></i>
        <p>Thông Báo</p>
      </sidebar-link>
      <sidebar-link to="#" @click.native="logout">
        <i class="nc-icon nc-button-power"></i>
        <p>Đăng xuất</p>
      </sidebar-link>
    </side-bar>
    <div class="main-panel">
      <top-navbar></top-navbar>
      <dashboard-content @click="toggleSidebar"> </dashboard-content>
      <content-footer></content-footer>
    </div>
  </div>
</template>

<style lang="scss"></style>

<script>
import TopNavbar from "./TopNavbar.vue";
import ContentFooter from "./ContentFooter.vue";
import DashboardContent from "./Content.vue";
import MobileMenu from "./MobileMenu.vue";
import jwtDecode from 'jwt-decode';

export default {
  components: {
    TopNavbar,
    ContentFooter,
    DashboardContent,
    MobileMenu,
  },
  data() {
    return {
      permissions: [],
      role: '',
    };
  },
  methods: {
    toggleSidebar() {
      if (this.$sidebar.showSidebar) {
        this.$sidebar.displaySidebar(false);
      }
    },
    logout() {
      localStorage.clear();
      this.$router.push("/login");
    }

  },
  async mounted() {
    // this.permissions = localStorage.getItem('permissions');
    const token = localStorage.getItem('authToken');
  if (token) {
    try {
      const decoded = jwtDecode(token);
      this.userName = decoded.name || 'User';
      this.userRole = decoded.Role || 'User';
      this.userID = decoded.sub || 'User';
      this.permissions = decoded.Permission || [];
      this.department = decoded.Department || 'User';
      localStorage.setItem('userName', this.userName);
      localStorage.setItem('userRole', this.userRole);
      localStorage.setItem('userId', this.userID);
      localStorage.setItem('permissions', JSON.stringify(this.permissions));
      localStorage.setItem('department', this.department);
    } catch (error) {
      console.error('Invalid token:', error);
    }
  }
    this.role = localStorage.getItem('userRole');

  }
};
</script>