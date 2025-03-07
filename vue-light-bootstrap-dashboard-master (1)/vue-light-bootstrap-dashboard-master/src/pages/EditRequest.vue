<template>
    <div class="content">
      <div class="container-fluid">
        <div class="row">
          <div class="col-md-12">
            <nav aria-label="breadcrumb">
              <ol class="breadcrumb">
                <li class="breadcrumb-item"><router-link to="/admin">Trang chủ</router-link></li>
                <li class="breadcrumb-item"><router-link to="/admin/request-table">Quản lí Phiếu yêu cầu</router-link></li>
                <li class="breadcrumb-item active">Chỉnh sửa Phiếu yêu cầu</li>
              </ol>
            </nav>
            <edit-request-form></edit-request-form>
          </div>
        </div>
      </div>
    </div>
  </template>
    <script>
    import EditRequestForm from './EditRequest/EditRequestForm.vue';
      export default {
        components: {
            EditRequestForm,
        }
      }
    
    </script>
    <style>
    
    </style>
    