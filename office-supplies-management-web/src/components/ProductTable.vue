<template>
    <v-table class="main-table product-table">
        <thead>
            <tr>
                <th class="text-left">STT</th>
                <th class="text-left">Tên sản phẩm</th>
                <th class="text-left">Đơn vị tính</th>
                <th class="text-left">Đơn giá</th>
                <th class="text-left">Thao tác</th>

            </tr>
        </thead>
        <tbody>
            <tr v-for="(item, index) in fakeDates">
                <td>{{ index + 1 }}</td>
                <td>{{ item.productName }}</td>
                <td>{{ item.unit }}</td>
                <td>{{ item.unitPrice }}</td>
                <td><v-icon icon="mdi-dots-vertical"></v-icon></td>
            </tr>
        </tbody>
    </v-table>
</template>

<script setup lang="ts">
import "@/assets/table.css"
import { ref } from "vue";
const fakeDates = ref([
    {
        productName: "San pham 1",
        unit: "Don vi 1",
        unitPrice: "100000",

    },
    {
        productName: "San pham 2",
        unit: "Don vi 2",
        unitPrice: "200000",
    },
    {
        productName: "San pham 3",
        unit: "Don vi 3",
        unitPrice: "300000",
    },
    {
        productName: "San pham 4",
        unit: "Don vi 4",
        unitPrice: "400000",
    },
    {
        productName: "San pham 5",
        unit: "Don vi 5",
        unitPrice: "500000",
    },
    {
        productName: "San pham 6",
        unit: "Don vi 6",
        unitPrice: "600000",
    },
    {
        productName: "San pham 7",
        unit: "Don vi 7",
        unitPrice: "700000",
    },
    {
        productName: "San pham 8",
        unit: "Don vi 8",
        unitPrice: "800000",
    },
    {
        productName: "San pham 9",
        unit: "Don vi 9",
        unitPrice: "900000",
    },
    {
        productName: "San pham 10",
        unit: "Don vi 10",
        unitPrice: "1000000",
    },
    {
        productName: "San pham 11",
        unit: "Don vi 11",
        unitPrice: "1100000",
    },
    {
        productName: "San pham 12",
        unit: "Don vi 12",
        unitPrice: "1200000",
    }
])
</script>