<template>

    <head>
        <link rel="stylesheet" href="../assets/sidebar.css">

    </head>
    <div class="sidebar-layout">
        <ul class="sidebar-items">
            <li class="sidebar-item" v-for="title in titles" :class="{ 'active': isActive(title.path) }">
                <a :href="title.path" class="sidebar sidebar-item__link">
                    <v-icon :icon="title.icon" class="sidebar-item__icon"></v-icon>
                    {{ title.title }}
                </a>
            </li>
        </ul>
    </div>
</template>
<script setup lang="ts">
import "@/assets/sidebar.css"
import { ref } from "vue";
import router from "@/router";
const titles = [
    { title: "Trang chủ", icon: "mdi-view-dashboard-outline", path: "/" },
    { title: "Tạo phiếu yêu cầu cấp VPP", icon: "mdi-folder-plus-outline", path: "/create-request" },
    { title: "Tạo phiếu tổng hợp VPP", icon: "mdi-folder-plus-outline", path: "/create-collection" },
    { title: "Quản lý phiếu yêu cầu cấp VPP", icon: "mdi-folder-table-outline", path: "/manage-request" },
    { title: "Quản lý phiếu tổng hợp VPP", icon: "mdi-folder-text-outline", path: "/manage-collection" }]
const isActive = (path:string) => {
    return router.currentRoute.value.path === path
}
</script>