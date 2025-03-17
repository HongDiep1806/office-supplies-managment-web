<template>
  <div class="content">
    <div class="container-fluid">
      <div class="row">
        <div class="col-md-12">
          <nav aria-label="breadcrumb">
            <ol class="breadcrumb">
              <li class="breadcrumb-item"><router-link to="/admin">Trang chủ</router-link></li>
              <li class="breadcrumb-item" v-if="userRole!=='Sup Leader'">
                <router-link :to="requestManagementPath" >Quản lí Phiếu yêu cầu</router-link>
              </li>
              <li class="breadcrumb-item active">Chi tiết Phiếu yêu cầu</li>
            </ol>
          </nav>
          <view-request-form></view-request-form>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import ViewRequestForm from './ViewRequest/ViewRequestForm.vue';

export default {
  components: {
    ViewRequestForm,
  },
  data() {
    return {
      requestManagementPath: '/admin/request-table', 
      userRole: ''// Giá trị mặc định
    };
  },
  mounted() {
    const userRole = localStorage.getItem('userRole');
    this.userRole = userRole;
    if (userRole === 'Dep Leader' || userRole === 'Finance Management Employee') {
      this.requestManagementPath = '/admin/view-all-request';
    }
  }
};
</script>

<style></style>