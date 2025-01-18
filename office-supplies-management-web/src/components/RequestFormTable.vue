<template>
    <v-table class="main-table">
        <thead>
            <tr>
                <th class="text-left">
                    STT
                </th>
                <th class="text-left">
                    Số phiếu yêu cầu
                </th>
                <th class="text-left">Người thực hiện</th>
                <th class="text-left">Phòng ban</th>
                <th class="text-left">Ngày thực hiện</th>
                <th class="text-left">Thao tác</th>

            </tr>
        </thead>
        <tbody>
            <tr v-for="item in fakeDates">
                <td>{{ item.id }}</td>
                <td>{{ item.number }}</td>
                <td>{{ item.people }}</td>
                <td>{{ item.dep }}</td>
                <td>{{ item.date }}</td>
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
        id: 1,
        number: "PYC001/01",
        people: "Diep Tu Thi Hong",
        dep:"Phong Ke Toan",
        date: "2023-01-01"
    },
    {
        id: 2,
        number: "PYC001/01",
        people: "Diep Tu Thi Hong",
        dep:"Phong Ke Toan",
        date: "2023-01-01"
    },
    {
        id: 3,
        number: "PYC001/01",
        people: "Diep Tu Thi Hong",
        dep:"Phong Ke Toan",
        date: "2023-01-01"
    },
    {
        id: 4,
        number: "PYC001/01",
        people: "Diep Tu Thi Hong",
        dep:"Phong Ke Toan",
        date: "2023-01-01"
    },
    {
        id: 5,
        number: "PYC001/01",
        people: "Diep Tu Thi Hong",
        dep:"Phong Ke Toan",
        date: "2023-01-01"
    },
    {
        id: 6,
        number: "PYC001/01",
        people: "Diep Tu Thi Hong",
        dep:"Phong Ke Toan",
        date: "2023-01-01"
    },
    {
        id: 7,
        number: "PYC001/01",
        people: "Diep Tu Thi Hong",
        dep:"Phong Ke Toan",
        date: "2023-01-01"
    },
    {
        id: 8,
        number: "PYC001/01",
        people: "Diep Tu Thi Hong",
        dep:"Phong Ke Toan",
        date: "2023-01-01"
    },
    {
        id: 9,
        number: "PYC001/01",
        people: "Diep Tu Thi Hong",
        dep:"Phong Ke Toan",
        date: "2023-01-01"
    }
])
</script>