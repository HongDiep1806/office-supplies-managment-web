<template>
  <div class="app">
    <header class="header">
      <NavBar></NavBar>
    </header>
    <div class="container">
      <SideBar class="container-child"></SideBar>
      <div class="main-body container-child">
        <RequestForm></RequestForm>
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
import RequestForm from '@/components/RequestForm.vue';
</script>
<style>
.container {
  display: flex;
  justify-content: space-between;
  gap: 0;
}

.container-child {
  flex: 1;
}
</style>