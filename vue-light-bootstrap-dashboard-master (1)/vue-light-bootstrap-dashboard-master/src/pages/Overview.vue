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

      <div class="row" v-if="userRole === 'Sup Leader'">
      </div>

      <div class="row" v-if="userRole === 'Sup Leader'">
        <div class="col-md-12">
          <chart-card ref="chartCard" :chart-data="barChart.data" :chart-options="barChart.options"
            chart-type="StackedBar">
            <template v-slot:header>
              <h4 class="card-title">Tổng quát</h4>
              <p class="card-category">Biểu đồ tổng quát về việc sử dụng VPP các Phòng ban</p>
            </template>
            <template v-slot:footer>
              <div class="legend">
                <i class="fa fa-circle text-info"></i> P. Dịch Vụ Đào Tạo
                <i class="fa fa-circle text-danger"></i> P. Sản Xuất Kinh Doanh
                <i class="fa fa-circle text-warning"></i> P. Tổ Chức Hành Chính
              </div>
              <hr>
              <div class="stats">
                <i class="fa fa-check"></i> Data information certified
              </div>
            </template>
          </chart-card>
        </div>
      </div>

      <div class="row" v-if="userRole === 'Employee'">
        <div class="col-12">
          <card class="strpied-tabled-with-hover" body-classes="table-full-width table-responsive">
            <template v-slot:header>
              <h4 class="card-title">Lịch sử Phiếu yêu cầu gần đây</h4>
              <p class="card-category">Các Phiếu yêu cầu đã tạo gần đây của bạn</p>
            </template>
            <l-table class="table-hover table-striped" :columns="tableData.columns" :data="tableData.data"
              :displayStatus="true" :domain="'request'" :displayActions="true" :canEdit="false" :canDelete="false"
              :canView="true" :apiURL="'https://localhost:7162/Request'"></l-table>
          </card>
        </div>
      </div>

      <div class="row" v-if="userRole === 'Finance Management Employee'">
        <div class="col-12">
          <card class="strpied-tabled-with-hover" body-classes="table-full-width table-responsive">
            <template v-slot:header>
              <h4 class="card-title">Phiếu yêu cầu gần đây</h4>
              <p class="card-category">Các Phiếu yêu cầu đã tạo gần đây</p>
            </template>
            <l-table class="table-hover table-striped" :columns="tableData.columns" :data="tableData.data"
              :displayStatus="true" :domain="'request'" :displayActions="true" :canEdit="false" :canDelete="false"
              :canView="true" :apiURL="'https://localhost:7162/Request'"></l-table>
          </card>
        </div>
      </div>

      <div class="row" v-if="userRole === 'Dep Leader'">
        <div class="col-12">
          <card class="strpied-tabled-with-hover" body-classes="table-full-width table-responsive">
            <template v-slot:header>
              <h4 class="card-title">Phiếu yêu cầu gần đây</h4>
              <p class="card-category">Các Phiếu yêu cầu đã tạo gần đây của phòng {{ department }}</p>
            </template>
            <l-table class="table-hover table-striped" :columns="tableData.columns" :data="tableData.data"
              :displayStatus="true" :domain="'request'" :displayActions="true" :canEdit="false" :canDelete="false"
              :canView="true" :apiURL="'https://localhost:7162/Request'"></l-table>
          </card>
        </div>
      </div>


      <div class="row" v-if="userRole === 'Sup Leader'">
        <div class="col-12">
          <card class="strpied-tabled-with-hover" body-classes="table-full-width table-responsive">
            <template v-slot:header>
              <h4 class="card-title">Báo cáo chi tiết Về việc Cấp phát VPP</h4>
              <p class="card-category">Các Phiếu yêu cầu đã tạo gần đây của bạn</p>
              <div class="row">
                <div class="col-md-6">
                  <label for="start-date">Ngày bắt đầu:</label>
                  <input type="date" id="start-date" v-model="startDate" class="form-control">
                </div>
                <div class="col-md-6">
                  <label for="end-date">Ngày kết thúc:</label>
                  <input type="date" id="end-date" v-model="endDate" class="form-control">
                </div>
              </div>
              <div class="row">
                <div class="col-md-12">
                  <button @click="fetchSummariesByDateRange" class="btn btn-info btn-fill float-right"
                    style="margin-top: 5px;">Lấy Dữ Liệu</button>
                </div>
              </div>
            </template>
            <l-table class="table-hover table-striped" :columns="tableData.columns" :data="tableData.data"
              :displayStatus="false" :domain="'request'" :displayActions="true" :canEdit="false" :canDelete="false"
              :canView="true" :apiURL="'https://localhost:7162/Request'"></l-table>
          </card>
        </div>
      </div>

    </div>
  </div>
</template>
<script>
import ChartCard from 'src/components/Cards/ChartCard.vue';
import StatsCard from 'src/components/Cards/StatsCard.vue';
import LTable from 'src/components/Table.vue';
import Card from 'src/components/Cards/Card.vue';
import jwtDecode from 'jwt-decode';
import axios from 'axios';

export default {
  components: {
    ChartCard,
    StatsCard,
    LTable,
    Card,
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
        columns: ['STT', 'Mã số phiếu', 'Người tạo', 'Ngày tạo', 'Tổng tiền'],
        data: [],
      },
      token: '',
      startDate: '', // Biến cho ngày bắt đầu
      endDate: '',   // Biến cho ngày kết thúc
      barChart: {
        data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
          series: [],
        },
        options: {
          seriesBarDistance: 1,
          axisX: {
            showGrid: true,
          },
          axisY: {
            offset: 50,
          },
          height: '300px',
          width: '100%',
        },
        responsiveOptions: [
          ['screen and (max-width: 100%)', {
            seriesBarDistance: 5,
            axisX: {
              labelInterpolationFnc(value) {
                return value[0];
              },
            },
          }],
        ],
      },
      departments: ['Dịch Vụ Đào Tạo', 'Sản Xuất Kinh Doanh'],
    };
  },
  async mounted() {
    this.updateClock();
    setInterval(this.updateClock, 1000);

    // Gọi API để lấy dữ liệu với endDate là ngày hiện tại
    const datetimenow = new Date().toISOString().split('T')[0];
    this.endDate = datetimenow; // Gán giá trị cho endDate
    await this.fetchSummariesByDateRange(); // Gọi hàm để fetch dữ liệu

    const token = localStorage.getItem('authToken');
    this.token = token;
    if (token) {
      try {
        const decoded = jwtDecode(token);
        this.userName = decoded.name || 'User';
        this.userRole = decoded.Role || 'User';
        this.userID = decoded.sub || 'User';
        this.permissions = decoded.Permission || [];
        this.department = decoded.Department || 'User';
        localStorage.setItem('userName', this.userName);
        localStorage.setItem('userRole', this.userRole);
        localStorage.setItem('userId', this.userID);
        localStorage.setItem('permissions', JSON.stringify(this.permissions));
        localStorage.setItem('department', this.department);
      } catch (error) {
        console.error('Invalid token:', error);
      }
    }

    if (this.userRole === 'Finance Management Employee' || this.userRole === 'Employee'|| this.userRole === 'Dep Leader') {
      await this.fetchRequestData();
    }
    if (this.userRole === 'Sup Leader') {
      await this.fetchReportData();
    }
  },
  methods: {
    updateClock() {
      const now = new Date();
      this.currentTime = now.toLocaleTimeString();
    },
    async fetchRequestData() {
      if (!this.userID) return;

      try {
        let response;
        if (this.userRole === 'Finance Management Employee') {
          response = await axios.get(`https://localhost:7162/Request/approved-requests-list`, {
            headers: { Authorization: `Bearer ${this.token}` },
            timeout: 100000
          });
        } else if (this.userRole === 'Employee') {
          response = await axios.get(`https://localhost:7162/Request/${this.userID}`, { timeout: 50000 });
        }else if(this.userRole === 'Dep Leader'){
          response = await axios.get(`https://localhost:7162/Request/department/${this.department}`, {
                headers: { Authorization: `Bearer ${this.token}` },
                timeout: 100000
            });
        }

        // Lấy danh sách các Promise từ getUserName
        const userPromises = response.data.map(item => this.getUserName(item.userID));

        // Giải quyết tất cả các Promise
        const userNames = await Promise.all(userPromises);

        this.tableData.data = response.data
          .sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate))
          .slice(0, 10)
          .map((item, index) => ({ // Thêm index để lấy tên người dùng tương ứng
            requestID: item.requestID,
            'Mã số phiếu': item.requestCode,
            'Người tạo': userNames[index], // Lấy tên người dùng từ mảng đã giải quyết
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
          }));
          console.log("log data sau khi map", this.tableData.data);
      } catch (error) {
        console.error('Lỗi khi lấy danh sách phiếu yêu cầu:', error);
      }
    },
    async getUserName(userID) {
      try {
        const response = await axios.get(`https://localhost:7162/User/getNameById${userID}`, { timeout: 50000 });
        return response.data;
      } catch (error) {
        console.error('Lỗi khi lấy tên người dùng:', error);
        return 'Người dùng không xác định'; // Trả về giá trị mặc định nếu có lỗi
      }
    },
    async fetchReportData() {
      const currentYear = new Date().getFullYear();
      this.barChart.data.series = [];

      try {
        for (const department of this.departments) {
          const departmentSeries = [];

          for (let month = 0; month < 12; month++) {
            const startDate = new Date(currentYear, month, 1);
            const endDate = new Date(currentYear, month + 1, 0);

            const formattedStartDate = startDate.toISOString().split('T')[0];
            const formattedEndDate = endDate.toISOString().split('T')[0];

            const response = await axios.get('https://localhost:7162/Summary/report', {
              params: {
                department: department,
                startDate: formattedStartDate,
                endDate: formattedEndDate,
              },
            });

            if (typeof response.data === 'number') {
              departmentSeries.push(response.data);
            } else {
              console.error("Dữ liệu không phải là số:", response.data);
              departmentSeries.push(0);
            }
          }

          this.barChart.data.series.push(departmentSeries);
        }

        this.$nextTick(() => {
          this.$refs.chartCard.initChart(); // Gọi lại phương thức khởi tạo biểu đồ
        });

        console.log("barChart.data.series:", this.barChart.data.series);
      } catch (error) {
        console.error('Lỗi khi lấy dữ liệu báo cáo:', error);
      }
    },
    async fetchSummariesByDateRange() {
      const today = new Date();
      const selectedStartDate = new Date(this.startDate);
      const selectedEndDate = new Date(this.endDate);

      // Kiểm tra xem ngày bắt đầu và ngày kết thúc có lớn hơn ngày hiện tại không
      if (selectedStartDate > today || selectedEndDate > today) {
        alert('Ngày bắt đầu và ngày kết thúc không được lớn hơn ngày hiện tại.');
        return;
      }

      // Nếu chỉ có endDate và không có startDate
      if (!this.startDate && this.endDate) {
        try {
          const response = await axios.get(`https://localhost:7162/Request/requests-in-date-range`, {
            params: {
              endDate: this.endDate,
            },
          });

          const userPromises = response.data.map(item => this.getUserName(item.userID));
            const userNames = await Promise.all(userPromises);

            if (response.data && Array.isArray(response.data)) {
                this.tableData.data = response.data
                .sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate))
                .map((item, index) => ({ // Thêm index vào map
                    requestID: item.requestID,
                    'Mã số phiếu': item.requestCode,
                    'Người tạo': userNames[index], // Lấy tên người dùng từ mảng đã giải quyết
              'Ngày tạo': new Date(item.createdDate).toLocaleString('vi-VN', {
                hour: '2-digit',
                minute: '2-digit',
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
              }).replace(',', ''),
              'Tổng tiền': new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.totalPrice),
            }));
          } else {
            console.error('API trả về dữ liệu không hợp lệ:', response);
            alert('Lỗi khi lấy dữ liệu. Vui lòng thử lại.');
          }
        } catch (error) {
          console.error('Lỗi khi gọi API:', error);
          alert('Lỗi khi gọi API. Vui lòng thử lại.');
        }
      } else if (this.startDate && this.endDate) {
        // Nếu có cả startDate và endDate thì gọi API với cả hai tham số
        try {
          const response = await axios.get(`https://localhost:7162/Request/requests-in-date-range`, {
            params: {
              startDate: this.startDate,
              endDate: this.endDate,
            },
          });

          if (response.data && Array.isArray(response.data)) {
            this.tableData.data = response.data.map((item) => ({
              requestID: item.requestID,
              'Mã số phiếu': item.requestCode,
              'Tổng tiền': new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.totalPrice),
              'Ngày tạo': new Date(item.createdDate).toLocaleString('vi-VN', {
                hour: '2-digit',
                minute: '2-digit',
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
              }).replace(',', ''),
            }));
          } else {
            // console.error('API trả về dữ liệu không hợp lệ:', response);
            alert('Lỗi khi lấy dữ liệu. Vui lòng thử lại.');
          }
        } catch (error) {
          // console.error('Lỗi khi gọi API:', error);
          alert('Lỗi khi gọi API. Vui lòng thử lại.');
        }
      } else {
        alert('Vui lòng chọn ít nhất ngày kết thúc.');
      }
    },
    async fetchReportDetailData() {
      try {
        const datetimenow = new Date().toISOString().split('T')[0];
        const response = await axios.get(`https://localhost:7162/Request/requests-in-date-range=${datetimenow}`);
        if (response && response.data && Array.isArray(response.data)) {
          this.tableData.data = response.data.map((item) => ({
            requestID: item.requestID,
            'Mã số phiếu': item.requestCode,
            'Tổng tiền': new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.totalPrice),
            'Ngày tạo': new Date(item.createdDate).toLocaleString('vi-VN', {
              hour: '2-digit',
              minute: '2-digit',
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            }).replace(',', ''),
          }));
        } else {
          console.error('API trả về dữ liệu không hợp lệ:', response);
          alert('Lỗi khi lấy dữ liệu báo cáo chi tiết. Vui lòng thử lại sau.');
        }
      } catch (error) {
        console.error('Lỗi khi lấy dữ liệu báo cáo chi tiết:', error);
        alert('Lỗi khi lấy dữ liệu báo cáo chi tiết. Vui lòng thử lại sau.');
      }
    },
  },
};
</script>

<style scoped>
/* .clock {
    font-size: 1.2rem;
    font-weight: bold;
} */
</style>