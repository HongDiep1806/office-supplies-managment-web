<template>
    <div class="content">
      <div class="container-fluid">
        <div class="row">
          <div class="col-md-12">
            <nav aria-label="breadcrumb">
              <ol class="breadcrumb">
                <li class="breadcrumb-item"><router-link to="/admin">Trang chủ</router-link></li>
                <li class="breadcrumb-item"><router-link to="/admin/request-table">Quản lí Phiếu tổng hợp</router-link></li>
                <li class="breadcrumb-item active">Tạo Phiếu tổng hợp</li>
              </ol>
            </nav>
            <create-summary-form></create-summary-form>
          </div>
        </div>
      </div>
    </div>
  </template>
    <script>

import CreateSummaryForm from './CreateSummary/CreateSummaryForm.vue';

    
      export default {
        components: {
            CreateSummaryForm
        }
      }
    
    </script>
    <style>
    
    </style>
    