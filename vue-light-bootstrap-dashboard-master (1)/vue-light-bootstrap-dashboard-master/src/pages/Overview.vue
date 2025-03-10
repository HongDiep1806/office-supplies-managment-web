<template>
  <div class="content">
    <div class="container-fluid">
      <div class="row">
        <div class="col-md-12">
          <stats-card class="stats-card-custom">
            <template v-slot:header>
              <div class="header-icon-container">
                <span class="clock">{{ currentTime }}</span>
              </div>
            </template>

            <template v-slot:content>
              <p class="card-category">Xin chào</p>
              <h4 class="card-title">{{ userName }}</h4>
            </template>
          </stats-card>
        </div>
      </div>

      <div class="row" v-if="userRole==='Sup Leader'">
        <div class="col-xl-3 col-md-6">
          <stats-card>
            <template v-slot:header>
              <i class="nc-icon nc-refresh-02 text-warning"></i>
            </template>
            <template v-slot:content>
              <p class="card-category">Yêu cầu chờ duyệt</p>
              <h4 class="card-title">105GB</h4>
            </template>
            <template v-slot:footer>
              <i class="fa fa-refresh"></i> Updated now
            </template>
          </stats-card>
        </div>

        <div class="col-xl-3 col-md-6">
          <stats-card>
            <template v-slot:header>
              <i class="nc-icon nc-check-2 text-success"></i>
            </template>
            <template v-slot:content>
              <p class="card-category">Yêu cầu đã duyệt</p>
              <h4 class="card-title">$1,345</h4>
            </template>
            <template v-slot:footer>
              <i class="fa fa-calendar-o"></i> Last day
            </template>
          </stats-card>
        </div>

        <div class="col-xl-3 col-md-6">
          <stats-card>
            <template v-slot:header>
              <i class="nc-icon nc-refresh-02 text-danger"></i>
            </template>
            <template v-slot:content>
              <p class="card-category">Tổng hợp chờ duyệt</p>
              <h4 class="card-title">45</h4>
            </template>
            <template v-slot:footer>
              <i class="fa fa-clock-o"></i> Last day
            </template>
          </stats-card>
        </div>

        <div class="col-xl-3 col-md-6">
          <stats-card>
            <template v-slot:header>
              <i class="nc-icon nc-check-2 text-success"></i>
            </template>
            <template v-slot:content>
              <p class="card-category">Tổng hợp đã duyệt</p>
              <h4 class="card-title">+45</h4>
            </template>
            <template v-slot:footer>
              <i class="fa fa-refresh"></i> Updated now
            </template>
          </stats-card>
        </div>
      </div>

      <div class="row">
        <div class="col-md-12">
          <chart-card 
            :chart-data="barChart.data" 
            :chart-options="barChart.options"
            chart-type="StackedBar">
            <template v-slot:header>
              <h4 class="card-title">Overviews</h4>
              <p class="card-category">All products including Taxes</p>
            </template>
            <template v-slot:footer>
              <div class="legend">
                <i class="fa fa-circle text-info"></i> Tesla Model S
                <i class="fa fa-circle text-danger"></i> BMW 5 Series
                <i class="fa fa-circle text-warning"></i> Nissan Leaf
              </div>
              <hr>
              <div class="stats">
                <i class="fa fa-check"></i> Data information certified
              </div>
            </template>
          </chart-card>
        </div>
      </div>

      <div class="row">
        <div class="col-12">
          <card class="strpied-tabled-with-hover" body-classes="table-full-width table-responsive">
            <template v-slot:header>
              <h4 class="card-title">Lịch sử Phiếu yêu cầu gần đây</h4>
              <p class="card-category">Các Phiếu yêu cầu đã tạo gần đây của bạn</p>
            </template>
            <l-table class="table-hover table-striped" :columns="tableData.columns" :data="tableData.data" :displayStatus="true" :domain="'request'" :displayActions="true" :canEdit="false" :canDelete="false" :canView="true" :apiURL="'https://localhost:7162/Request'"></l-table>
          </card>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ChartCard from 'src/components/Cards/ChartCard.vue'
import StatsCard from 'src/components/Cards/StatsCard.vue'
import LTable from 'src/components/Table.vue'
import Card from 'src/components/Cards/Card.vue'
import jwtDecode from 'jwt-decode'
import axios from 'axios'

export default {
  components: {
    ChartCard,
    StatsCard,
    LTable,
    Card
  },
  data() {
    return {
      currentTime: '',
      userName: 'Nguyen Van A',
      userRole: '',
      userID: '',
      department: '',
      permissions: [],
      tableData: {
      columns: ['STT', 'Mã số phiếu', 'Ngày tạo', 'Tổng tiền'],
      data: []
      },
      barChart: {
        data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
          series: [
            [500, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200],
            [500, 200, 280, 580, 453, 353, 300, 364, 368, 410, 636, 695],
            [500, 243, 280, 580, 453, 353, 300, 364, 368, 410, 636, 1500],
            [500, 243, 280, 580, 453, 353, 300, 364, 368, 410, 636, 695]
          ]
        },
        options: {
          seriesBarDistance: 10,
          axisX: {
            showGrid: false
          },
          height: '245px',
        },
        responsiveOptions: [
          ['screen and (max-width: 640px)', {
            seriesBarDistance: 5,
            axisX: {
              labelInterpolationFnc(value) {
                return value[0]
              }
            }
          }]
        ]
      }
    };
  },
  mounted() {
    this.updateClock();
    setInterval(this.updateClock, 1000);

    const token = localStorage.getItem('authToken');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        this.userName = decoded.name || 'User';
        this.userRole = decoded.Role || 'User';
        this.userID = decoded.sub || 'User';
        this.permissions = decoded.Permission || [];
        this.department = decoded.Department || 'User'; 
        console.log('User name:', this.userName);
        console.log('User role:', this.userRole);
        localStorage.setItem('userName', this.userName);
        localStorage.setItem('userRole', this.userRole);
        localStorage.setItem('userId', this.userID);
        localStorage.setItem('permissions', JSON.stringify(this.permissions));
        localStorage.setItem('department', this.department);
      } catch (error) {
        console.error('Invalid token:', error);
      }
    }

    if(this.userRole === 'Finance Management Employee' || this.userRole==='Employee') {
      this.fetchRequestData();
    }
  },
  methods: {
    updateClock() {
      const now = new Date();
      this.currentTime = now.toLocaleTimeString();
    },
    async fetchRequestData() {
      if (!this.userID) return; // Nếu không có userID, không gọi API

      try {
        const response = await axios.get(`https://localhost:7162/Request/${this.userID}`,{timeout:50000});

        this.tableData.data = response.data
          .sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate)) // Sort newest first
          .slice(0, 10) // Get only the top 10 elements
          .map((item, index) => ({
            // STT: index + 1,
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
            Status : item.isApprovedBySupLead && item.isApprovedByDepLead ? "Đã duyệt" : item.isApprovedByDepLead && !item.isApprovedBySupLead ? "Đang xử lý" :"Chưa duyệt"
          }));
      } catch (error) {
        console.error('Lỗi khi lấy danh sách phiếu yêu cầu:', error);
      }
    }
  }
};
</script>

<style scoped>
/* .clock {
  font-size: 1.2rem;
  font-weight: bold;
} */
</style>
