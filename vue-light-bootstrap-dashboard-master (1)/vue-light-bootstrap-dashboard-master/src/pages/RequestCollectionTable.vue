<template>
  <div class="content">
    <div class="container-fluid">
      <div class="row">
        <div class="col-12">
          <card class="strpied-tabled-with-hover" body-classes="table-full-width table-responsive">
            <template slot="header">
              <div style="display: flex; justify-content: space-between;padding: 0px 15px;">
                <div>
                  <h4 class="card-title">Danh sách Phiếu yêu cầu</h4>
                  <p class="card-category">Danh sách các yêu cầu đã tạo</p>
                </div>
                <div>
                  <button class="btn btn-info btn-fill float-right" @click="navigateToCreateRequest">Tạo mới</button>
                </div>
              </div>
            </template>
            <l-table class="table-hover table-striped" :columns="table1.columns" :data="table1.data" :displayStatus="true" :domain="'request'">
            </l-table>
          </card>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import jwtDecode from 'jwt-decode'; // Giải mã token để lấy userID
import LTable from 'src/components/Table.vue';
import Card from 'src/components/Cards/Card.vue';

export default {
  components: {
    LTable,
    Card
  },
  data() {
    return {
      table1: {
        columns: ['STT', 'Mã số phiếu', 'Ngày tạo', 'Tổng tiền'],
        data: []
      },
      userID: null
    };
  },
  methods: {
    async fetchRequestData() {
      if (!this.userID) return; // Nếu không có userID, không gọi API

      try {
        const response = await axios.get(`https://localhost:7162/Request/${this.userID}`);

        this.table1.data = response.data
          .sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate)) // Sort newest first
          .map((item, index) => ({
            STT: index + 1,
            'Mã số phiếu': item.requestCode,
            'Ngày tạo': new Date(item.createdDate).toLocaleString('vi-VN', {
              hour: '2-digit',
              minute: '2-digit',
              day: '2-digit',
              month: '2-digit',
              year: 'numeric'
            }).replace(',', ''),
            'Tổng tiền': new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.totalPrice),
            Status : item.isApprovedBySupLead && item.isApprovedByDepLead ? true : false
          }));
      } catch (error) {
        console.error('Lỗi khi lấy danh sách phiếu yêu cầu:', error);
      }
    }
    ,
    navigateToCreateRequest() {
      this.$router.push('/admin/createrequest');
    }
  },
  mounted() {
    // Lấy userID từ token trong localStorage
    const token = localStorage.getItem('authToken');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        this.userID = decoded.sub || null; // Giả sử `sub` là userID
      } catch (error) {
        console.error('Token không hợp lệ:', error);
      }
    }

    this.fetchRequestData(); // Gọi API sau khi lấy được userID
  }
};
</script>

<style></style>
