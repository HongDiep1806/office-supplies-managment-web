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
                  <button
                    v-if="userRole !== 'Finance Management Employee' && userRole !== 'Dep Leader' && userRole !== 'Sup Leader'"
                    class="btn btn-info btn-fill float-right" @click="navigateToCreateRequest">Tạo mới</button>
                </div>
              </div>
            </template>
            <l-table class="table-hover table-striped" :columns="table1.columns" :data="table1.data"
              :displayStatus="true" :domain="'request'" :displayActions="true" :canEdit="false" :canDelete="false"
              :canView="true" :apiURL="'https://localhost:7162/Request'">
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
        data: [],

      },
      userID: null,
      userRole: '',
      department: ''
    };
  },
  methods: {

    async fetchRequestData() {
      try {
        const token = localStorage.getItem('authToken');
        let response;

        if (this.userRole === 'Dep Leader') {
          response = await axios.get(`https://localhost:7162/Request/department/${this.department}`, {
            headers: { Authorization: `Bearer ${token}` },
            timeout: 100000
          });
        } else if (this.userRole === 'Finance Management Employee') {
          response = await axios.get(`https://localhost:7162/Request/approved-requests-list`, {
            headers: { Authorization: `Bearer ${token}` },
            timeout: 100000
          });
        }
        console.log("data gốc api", response.data);
        if (response && Array.isArray(response.data)) {
          this.table1.data = response.data
            .sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate))
            .map((item, index) => ({
              requestID: item.requestID,
              'Mã số phiếu': item.requestCode,
              'Ngày tạo': new Date(item.createdDate).toLocaleString('vi-VN', {
                hour: '2-digit',
                minute: '2-digit',
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
              }).replace(',', ''),
              'Tổng tiền': new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.totalPrice),
              Status: (() => {
                if (this.userRole === 'Dep Leader') {
                  if (!item.isProcessedByDepLead) {
                    return "Chưa duyệt";
                  } else if (item.isProcessedByDepLead && item.isApprovedByDepLead) {
                    return "Đã duyệt";
                  } else if (item.isProcessedByDepLead && !item.isApprovedByDepLead) {
                    return "Không duyệt";
                  }
                } else if (this.userRole === 'Finance Management Employee') {
                  if (!item.isCollectedInSummary) {
                    if (item.isApprovedByDepLead && !item.isProcessedByDepLead) {
                      return "Không duyệt";
                    } else if (item.isApprovedByDepLead && item.isApprovedBySupLead) {
                      return "Đã duyệt";
                    } else if (item.isApprovedByDepLead && !item.isApprovedBySupLead) {
                      return "Chưa duyệt";
                    }
                  } else {
                    return "Đã tổng hợp";
                  }

                }
                return "Không xác định"; // Trường hợp mặc định
              })(),
              IsCollectedInSummary: item.isCollectedInSummary

            }

            ));
          console.log("table data", this.table1.data);
        } else {
          console.error('Unexpected response format:', response);
        }
      } catch (error) {
        console.error('Lỗi khi lấy danh sách phiếu yêu cầu:', error);
      }
    },
    navigateToCreateRequest() {

      this.$router.push('/admin/createrequest');
    }
  },
  mounted() {
    // Lấy userID từ token trong localStorage
    this.userID = localStorage.getItem('userId');
    this.userRole = localStorage.getItem('userRole');
    this.department = localStorage.getItem('department');
    this.fetchRequestData(); // Gọi API sau khi lấy được userID
  }
};
</script>

<style></style>