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
  <span v-for="(seriesItem, index) in barChart.data.series" :key="index">
    <i class="fa fa-circle" :style="{ color: departmentColors[seriesItem.name] }"></i> {{ seriesItem.name }}
  </span>
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
                <div class="col-md-4">
                  <label for="start-date">Ngày bắt đầu:</label>
                  <input type="date" id="start-date" v-model="startDate" class="form-control">
                </div>
                <div class="col-md-4">
                  <label for="end-date">Ngày kết thúc:</label>
                  <input type="date" id="end-date" v-model="endDate" class="form-control">
                </div>
                <div class="col-md-4">
                  <label for="department">Phòng ban:</label>
                  <select id="department" v-model="selectedDepartment" class="form-control">
                    <option value="" disabled>Chọn phòng ban</option>
                    <option v-for="department in departments" :key="department" :value="department">
                      {{ department }}
                    </option>
                  </select>
                </div>
              </div>
              <div class="row">
                <div class="col-md-12">
                  <button @click="fetchSummariesByDateRange" class="btn btn-info btn-fill float-right" style="margin-top: 5px;">Lấy Dữ Liệu</button>
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
//       ::v-deep .ct-series-a .ct-bar { stroke: #17a2b8; } 
// ::v-deep .ct-series-b .ct-bar { stroke: #ffc107; } 
// ::v-deep .ct-series-c .ct-bar { stroke: #6f42c1; } 
// ::v-deep .ct-series-d .ct-bar { stroke: #28a745; } 
// ::v-deep .ct-series-e .ct-bar { stroke: #dc3545; } 
// ::v-deep .ct-series-f .ct-bar { stroke: #007bff; } 
// ::v-deep .ct-series-g .ct-bar { stroke: #fd7e14; } 
// ::v-deep .ct-series-h .ct-bar { stroke: #6610f2; }
// ::v-deep .ct-series-i .ct-bar { stroke: #6c757d; } 
// ::v-deep .ct-series-j .ct-bar { stroke: #17a2b8; } 
      colorPalette: ['#17a2b8',  '#dc3545', '#ffc107', '#6f42c1', '#28a745', '#007bff', '#fd7e14', '#6610f2', '#6c757d', '#17a2b8'],
      departmentColors: {
  // CDS: '#17a2b8',  // Blue
  // ABC: '#dc3545',   // Red
  // KT: '#ffc107',      // Orange
  // CSKH: '#6f42c1',    // Purple
  // SXKD: '#28a745',    // Green
       
},
// Map to hold department -> color
      selectedDepartment: '',
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
            offset: 100,
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
      departments: [],
      legendClasses: ['text-info', 'text-danger', 'text-warning', 'text-success'],
    };
  },
  async mounted() {
    this.updateClock();
    setInterval(this.updateClock, 1000);

    // Gọi API để lấy dữ liệu với endDate là ngày hiện tại
    const datetimenow = new Date().toISOString().split('T')[0];
    this.endDate = datetimenow; // Gán giá trị cho endDate
    //startDAte default is 3 month prior
    const startDate = new Date().toISOString().split('T')[0];
    const threeMonthsPrior = new Date(new Date(startDate).setMonth(new Date(startDate).getMonth() - 3)).toISOString().split('T')[0];
    this.startDate = threeMonthsPrior; // Gán giá trị cho startDate

    const token = localStorage.getItem('authToken');
    this.token = token;
    if (token) {
      try {
        const decoded = jwtDecode(token);
        this.userName = decoded.name || 'User';
        this.userRole = decoded.Role || 'User';
        this.userID = decoded.sub || 'User';
        this.permissions = decoded.Permission;
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
    if (this.userRole === 'Sup Leader') {
      await this.fetchDepartmentData();
      await this.fetchSummariesByDateRange(); // Gọi hàm để fetch dữ liệu
      await this.fetchReportData();
      console.log("log departments", this.departments);
      console.log("series", JSON.stringify(this.barChart.data.series, null, 2));

    } 
    else if (this.userRole === 'Finance Management Employee' || this.userRole === 'Employee'|| this.userRole === 'Dep Leader') {
      await this.fetchRequestData();
    }
    //delay about 1500ms
    // await new Promise(resolve => setTimeout(resolve, 1500));
    await this.fetchUnreadNotifications();
  },
  methods: {
    async fetchDepartmentData() {
  try {
    const response = await axios.get('https://localhost:7162/User/unique-departments', {
      headers: { Authorization: `Bearer ${this.token}` },
      timeout: 50000
    });
    this.departments = response.data;

    // Populate departmentColors with the correct colors
    this.departments.forEach((department, index) => {
      this.departmentColors[department] = this.colorPalette[index % this.colorPalette.length];
    });
  } catch (error) {
    console.error('Lỗi khi lấy danh sách phòng ban:', error);
  }
},
    async fetchUnreadNotifications() {
  try {
    const response = await axios.get(`https://localhost:7162/Notification/unread-by-user`, {
      headers: { Authorization: `Bearer ${this.token}` },
      params: {
        userId: this.userID
      }
    });

    if (response.data && response.data.length > 0) {
      this.notifySuccess('bottom', 'right', 'Bạn có thông báo mới');
    }
  } catch (error) {
    console.error('Error fetching unread notifications:', error);
  }
},
async notifySuccess(verticalAlign, horizontalAlign, message) {
  this.$notifications.notify({
    message: `<span>${message}</span>`,
    icon: 'nc-icon nc-app',
    horizontalAlign: horizontalAlign,
    verticalAlign: verticalAlign,
    type: 'info'
  });
},
    getLegendClass(index) {
      return this.legendClasses[index % this.legendClasses.length];
  },
 
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
          response = await axios.get(`https://localhost:7162/Request/${this.userID}`, {headers: { Authorization: `Bearer ${this.token}` }, timeout: 50000 });
        } else if(this.userRole === 'Dep Leader'){
          response = await axios.get(`https://localhost:7162/Request/department/${this.department}`, {
                headers: { Authorization: `Bearer ${this.token}` },
                timeout: 100000
            });
        }

        // Lấy danh sách các Promise từ getUserName
        const userPromises = response.data
        .sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate))
        .map(item => this.getUserName(item.userID));

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
                  if (!item.isProcessedByDepLead && item.isApprovedByDepLead) {
                    return "Không duyệt";
                  } else if(!item.isProcessedByDepLead && !item.isApprovedByDepLead){
                    return "Chưa duyệt";
                  }else if (item.isProcessedByDepLead && item.isApprovedByDepLead) {
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

                } else if (this.userRole === 'Employee') {
                  if (item.isProcessedByDepLead) {
                    if (item.isApprovedByDepLead) {
                      if (item.isApprovedBySupLead) {
                        if(item.isSummaryBeProcessed){
                          if(item.isCollectedInSummary){
                            return "Đã duyệt";
                          }else{
                            return "Không duyệt";
                          }
                        }else{
                          return "Đang xử lý";
                        }
                      }else{
                        return "Đang xử lý";
                      }
                    } else {
                      return "Không duyệt";
                    }
                  } else {
                    if (item.isApprovedByDepLead && !item.isApprovedBySupLead) {
                      return "Không duyệt";
                    } else if (!item.isApprovedByDepLead && !item.isApprovedBySupLead) {
                      return "Chưa duyệt";
                    }
                  }
                }
                return "Không xác định"; // Trường hợp mặc định
              })(),
          }));
          //console.log("log data sau khi map", this.tableData.data);
      } catch (error) {
        console.error('Lỗi khi lấy danh sách phiếu yêu cầu:', error);
      }
    },
    async getUserName(userID) {
  try {
    const response = await axios.get(`https://localhost:7162/User/getNameById${userID}`, {
      headers: { Authorization: `Bearer ${this.token}` },
      timeout: 50000
    });
    return response.data;
  } catch (error) {
    console.error('Lỗi khi lấy tên người dùng:', error);
    return 'Người dùng không xác định'; // Trả về giá trị mặc định nếu có lỗi
  }
}

,
async fetchReportData() {
  const currentYear = new Date().getFullYear();
  this.barChart.data.series = [];
  this.departmentColors = {}; // Reset departmentColors

  try {
    // Fetch the list of unique departments
    const departmentResponse = await axios.get('https://localhost:7162/User/unique-departments', {
      headers: { Authorization: `Bearer ${this.token}` },
      timeout: 50000,
    });

    for (const department of departmentResponse.data) {
      const departmentSeries = [];

      for (let month = 0; month < 12; month++) {
        const startDate = new Date(currentYear, month, 1);
        const endDate = new Date(currentYear, month + 1, 0);
        const formattedStartDate = startDate.toISOString().split('T')[0];
        const formattedEndDate = endDate.toISOString().split('T')[0];

        try {
          const response = await axios.get('https://localhost:7162/Summary/report', {
            headers: { Authorization: `Bearer ${this.token}` },
            params: {
              department: department,
              startDate: formattedStartDate,
              endDate: formattedEndDate,
            },
          });

          departmentSeries.push(typeof response.data === 'number' ? response.data : 0);
        } catch (error) {
          departmentSeries.push(0); // Default to 0 if there's an error
        }
      }

      // Only add the department to the chart if it has non-zero data
      if (departmentSeries.some(value => value > 0)) {
        this.barChart.data.series.push({
          name: department,
          data: departmentSeries,
        });
      }
    }

    // Assign colors based on the order of the series data
    this.barChart.data.series.forEach((seriesItem, index) => {
      this.departmentColors[seriesItem.name] = this.colorPalette[index % this.colorPalette.length];
    });

    console.log("barChart.data.series:", this.barChart.data.series);
    console.log("Department colors:", this.departmentColors);

    // Update the chart
    this.$nextTick(() => {
      this.$refs.chartCard.initChart();
    });
  } catch (error) {
    console.error('Error fetching report data:', error);
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
          const response = await axios.get(`https://localhost:7162/Request/approved-requests-by-date-range-and-department`, {
            headers: { Authorization: `Bearer ${this.token}` },
            params: {
              endDate: this.endDate,
              department: this.selectedDepartment, // Thêm phòng ban vào params
            },
          });

          const userPromises = response.data
          .sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate))
          .map(item => this.getUserName(item.userID));
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
          const response = await axios.get(`https://localhost:7162/Request/approved-requests-by-date-range-and-department`, {
            headers: { Authorization: `Bearer ${this.token}` },
            params: {
              startDate: this.startDate,
              endDate: this.endDate,
              department: this.selectedDepartment, // Thêm phòng ban vào params
            },
          });

          if (response.data && Array.isArray(response.data)) {
            const userPromises = response.data.map(item => this.getUserName(item.userID));
            const userNames = await Promise.all(userPromises);

            this.tableData.data = response.data.map((item, index) => ({
              requestID: item.requestID,
              'Mã số phiếu': item.requestCode,
              'Người tạo': userNames[index], // Use the resolved user names
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
      } else {
        alert('Vui lòng chọn ít nhất ngày kết thúc.');
      }
    },
    async fetchReportDetailData() {

      try {
        const datetimenow = new Date().toISOString().split('T')[0];
        const response = await axios.get(`https://localhost:7162/Request/requests-in-date-range=${datetimenow}`, {headers: { Authorization: `Bearer ${this.token}`} });
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



.legend i {
  margin-right: 5px;
}
</style>