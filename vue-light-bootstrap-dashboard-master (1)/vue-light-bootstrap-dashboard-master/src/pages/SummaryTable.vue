<template>
    <div class="content">
        <div class="container-fluid">
            <div class="row">
                <div class="col-12">
                    <card class="strpied-tabled-with-hover" body-classes="table-full-width table-responsive">
                        <template slot="header">
                            <div style="display: flex; justify-content: space-between;padding: 0px 15px;">
                                <div>
                                    <h4 class="card-title">Danh sách Phiếu tổng hợp</h4>
                                    <p class="card-category">Danh sách các Phiếu tổng hợp đã tạo</p>
                                </div>
                            </div>
                        </template>
                        <l-table class="table-hover table-striped" 
                            :columns="table.columns" 
                            :data="table.data"
                            :displayStatus="true" 
                            :domain="'summary'" 
                            :displayActions="true" 
                            :canEdit="false"
                            :canDelete="false" 
                            :canView="false" 
                            :canOpenNewTab="true" 
                            :apiURL="'https://localhost:7162/Summary'"
                            @row-click="navigateToViewSummary">
                        </l-table>
                    </card>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import axios from 'axios';
import LTable from 'src/components/Table.vue';
import Card from 'src/components/Cards/Card.vue';

export default {
    components: {
        LTable,
        Card
    },
    data() {
        return {
            table: {
                columns: ['STT', 'Mã phiếu','Ngày tạo', 'Tổng tiền'],
                data: [],
            },
            token: localStorage.getItem('authToken')
        };
    },
    methods: {
        async fetchSummaryData() {
            try {
                const token = localStorage.getItem('authToken');
                const response = await axios.get('https://localhost:7162/Summary', {
                    headers: { Authorization: `Bearer ${this.token}` },
                    timeout: 100000
                });
                console.log("API response:", response.data);

                if (response && Array.isArray(response.data)) {
                    this.table.data = response.data
                    .sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate))
                    .map((item, index) => ({
                        summaryID: item.summaryID,
                        'Mã phiếu': item.summaryCode,
                        'Ngày tạo': new Date(item.createdDate).toLocaleString('vi-VN', {
                            hour: '2-digit',
                            minute: '2-digit',
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                        }).replace(',', ''),
                        
                        'Tổng tiền': new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.totalPrice),
                        Status: item.isProcessedBySupLead
                            ? (item.isApprovedBySupLead ? "Đã duyệt" : "Không duyệt")
                            : "Chưa duyệt"

                    }));
                    //console.log("data sum", this.table.data);
                } else {
                    console.error('Unexpected response format:', response);
                }
            } catch (error) {
                console.error('Lỗi khi lấy danh sách Summary:', error);
            }
        },
        
        navigateToViewSummary(item) {
            console.log("Navigating to summary:", item.summaryID);
            this.$router.push(`/admin/viewsummary/${item.summaryID}`);
        }
    },
    mounted() {
        this.fetchSummaryData();
    }
};
</script>

<style>
.clickable-row {
    cursor: pointer;
}

.clickable-row:hover {
    background-color: rgba(220, 68, 5, 0.1) !important;
}
</style>