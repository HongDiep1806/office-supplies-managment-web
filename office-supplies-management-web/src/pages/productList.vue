<template>
    <div class="app">
      <header class="header">
        <NavBar :title="title"></NavBar>
      </header>
      <div class="container">
        <SideBar class="container-child"></SideBar>
        <div class="main-body container-child">
            <div class="main-body-child">
                <button class="btn-add-product">Thêm sản phẩm</button>
            </div>
            <ProductTable></ProductTable>
        </div>
  
  
      </div>
    </div>
  
  
  </template>
  
  <script lang="ts" setup>
  import { ref } from 'vue'
  import NavBar from '@/components/NavBar.vue';
  import SideBar from '@/components/SideBar.vue';
  import Cards from '@/components/Cards.vue';
  import Table from '@/components/RequestFormTable.vue';
  import ProductTable from '@/components/ProductTable.vue';
  const title = ref("Danh mục Văn phòng phẩm")
  </script>
  <style>
  .main-body{
    display: flex;
    flex-direction: column;
  }
  .container {
    display: flex;
    justify-content: space-between;
    gap: 0;
    overflow-x: hidden;
  }
  .container-child{
    flex: 1;
  }
  
  .recent-request {
    display: flex;
    flex-direction: column;
  }
  
  .recent-request-title {
    margin: 10px 10px;
    font-size: large !important;
  }
  
  .main-body-child {
    position: relative;
    top: 0;
    left: 0;
    display: flex;
    justify-content: flex-end;
  }
  .btn-add-product{
    display: block;
    /* border: 1px solid black; */
    padding: 5px 5px;
    margin: 10px 10px;
    border-radius: 5px;
    background-color: rgb(16, 162, 62);
    color: white;
    box-shadow: rgb(29, 212, 87) 0px 0px 10px 0px !important;
  }
  
  </style>
  