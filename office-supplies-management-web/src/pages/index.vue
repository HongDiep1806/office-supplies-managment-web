<template>
  <div class="app">
    <header class="header">
      <NavBar></NavBar>
    </header>
    <div class="container">
      <SideBar class="container-child"></SideBar>
      <div class="main-body container-child">
        <Cards class="main-body-child"></Cards>
        <div class="recent-request main-body-child">
          <div class="recent-request-header">
            <h1 class="recent-request-title">Yêu cầu mới nhất</h1>
          </div>
          <Table></Table>
        </div>
      </div>


    </div>
  </div>


</template>

<script lang="ts" setup>
import { ref } from 'vue'
import NavBar from '@/components/NavBar.vue';
import SideBar from '@/components/SideBar.vue';
import Cards from '@/components/Cards.vue';
import Table from '@/components/Table.vue';
</script>
<style>
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
}

</style>
