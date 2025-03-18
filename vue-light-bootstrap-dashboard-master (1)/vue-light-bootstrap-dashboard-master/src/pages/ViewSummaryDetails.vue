<template>
    <div class="content">
      <div class="container-fluid">
        <div class="row">
          <div class="col-md-12">
            <nav aria-label="breadcrumb">
              <ol class="breadcrumb">
                <li class="breadcrumb-item"><router-link to="/admin">Trang chủ</router-link></li>
                <li class="breadcrumb-item">
                  <router-link :to="requestManagementPath">Quản lí Phiếu tổng hợp</router-link>
                </li>
                <li class="breadcrumb-item active">Chi tiết Phiếu tổng hợp</li>
              </ol>
            </nav>
            <view-summary-form></view-summary-form>
          </div>
        </div>
      </div>
    </div>
  </template>
  <script>

import ViewSummaryForm from './ViewSummary/ViewSummaryForm.vue';

  
  export default {
    components: {
      ViewSummaryForm,
    },
    data() {
      return {
        requestManagementPath: '/admin/summary-table', 
      };
    },
    mounted() {
      const userRole = localStorage.getItem('userRole');
  
      if (userRole === 'Dep Leader' || userRole === 'Finance Management Employee') {
        this.requestManagementPath = '/admin/summary-table';
      }
    }
  };
  </script>
  
  <style></style>