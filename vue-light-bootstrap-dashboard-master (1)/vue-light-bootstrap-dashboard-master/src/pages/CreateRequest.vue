<template>
    <div class="content">
      <div class="container-fluid">
        <div class="row">
          <div class="col-md-12">
            <nav aria-label="breadcrumb">
              <ol class="breadcrumb">
                <li class="breadcrumb-item"><router-link to="/admin">Trang chủ</router-link></li>
                <li class="breadcrumb-item"><router-link to="/admin/request-table">Quản lí Phiếu yêu cầu</router-link></li>
                <li class="breadcrumb-item active">Tạo sản phẩm</li>
              </ol>
            </nav>
            <create-request-form></create-request-form>
          </div>
        </div>
      </div>
    </div>
  </template>
    <script>
      import CreateRequestForm from './CreateRequest/CreateRequestForm.vue';
    
      export default {
        components: {
            CreateRequestForm,
        }
      }
    
    </script>
    <style>
    
    </style>
    