<template>
    <head>
        <link rel="stylesheet" href="../assets/navbar.css">
    </head>
    <div class="nav-layout">
     <ul class="nav-items">
        <li><img src="../assets/logo.png" class="main-logo"></img></li>
        <li><h1>{{ props.title }}</h1></li>
     </ul>   
     <ul class="nav-items">
        <li class="nav-item"><v-icon icon="mdi-account-circle-outline"></v-icon>Sign in</li>
        <li class="nav-item"><v-icon icon="mdi-account"></v-icon>Sign up</li>
     </ul>
    </div>
</template>
<script setup lang="ts">
import "@/assets/navbar.css"
const props = defineProps<{ title:string }>()
</script>
