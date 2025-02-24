<template>
    <div class="content">
      <div class="container-fluid">
        <div class="row">
          <div class="col-md-12">
            <nav aria-label="breadcrumb">
            <ol class="breadcrumb">
              <li class="breadcrumb-item"><router-link to="/admin">Trang chủ</router-link></li>
              <li class="breadcrumb-item"><router-link to="/admin/table-list">Danh mục VPP</router-link></li>
              <li class="breadcrumb-item active">Chỉnh sửa sản phẩm</li>
            </ol>
          </nav>
            <edit-product-form></edit-product-form>
          </div>
        </div>
      </div>
    </div>
  </template>
  <script>
    import EditProductForm from '../EditProduct/EditProductForm.vue';
  
    export default {
      components: {
        EditProductForm,
      }
    }
  
  </script>
  <style>
  
  </style>
  