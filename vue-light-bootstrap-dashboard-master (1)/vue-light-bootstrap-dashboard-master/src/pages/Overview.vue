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
        <div class="col-md-12">
          <chart-card ref="chartCard" :chart-data="barChart.data" :chart-options="barChart.options" chart-type="StackedBar">
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

      <!-- <div class="row" v-if="userRole === 'Sup Leader'">
        <div class="col-12">
          <div class="card">
            <div class="card-header">
              <h4 class="card-title">Xuất Báo Cáo Sản Phẩm</h4>
              <p class="card-category">Chọn khoảng thời gian để xuất báo cáo</p>
            </div>
            <div class="card-body">
              <div class="row">
                <div class="col-md-4">
                  <label for="export-start-date">Ngày bắt đầu:</label>
                  <input
                    type="date"
                    id="export-start-date"
                    v-model="exportStartDate"
                    class="form-control"
                  />
                </div>
                
                <div class="col-md-4">
                  <label for="export-end-date">Ngày kết thúc:</label>
                  <input
                    type="date"
                    id="export-end-date"
                    v-model="exportEndDate"
                    class="form-control"
                  />
                </div>
                
                <div class="col-md-4 d-flex align-items-end">
                  <button
                    @click="downloadProductReport"
                    class="btn btn-info btn-fill"
                    style="width: 100%; margin-top: 25px;"
                  >
                    Tải Báo Cáo
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div> -->

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
                    <option value="">Tất cả phòng ban</option>
                    <option v-for="department in departments" :key="department" :value="department">
                      {{ department }}
                    </option>
                  </select>
                </div>
              </div>
              <div class="row">
                <div class="col-md-12">
                  <div class="button-container float-right" style="margin-top: 5px;">
                    <!-- Tải về Excel Button -->
                    <button 
                      @click="downloadApprovedRequestsExcel" 
                      class="btn btn-success btn-fill" 
                      style="margin-right: 10px;"
                    >
                      <i class="nc-icon nc-cloud-download-93"></i> Tải về Excel
                    </button>
                    <!-- Lấy Dữ Liệu Button -->
                    <button 
                      @click="fetchSummariesByDateRange" 
                      class="btn btn-info btn-fill"
                    >
                      Lấy Dữ Liệu
                    </button>
                  </div>
                </div>
              </div>
            </template>
            <l-table class="table-hover table-striped" :columns="tableData.columns" :data="tableData.data"
              :displayStatus="false" :domain="'request'" :displayActions="false" :canEdit="false" :canDelete="false"
              :canView="true" :apiURL="'https://localhost:7162/Request'"></l-table>
          </card>
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
              :displayStatus="true" :domain="'request'" :displayActions="false" :canEdit="false" :canDelete="false"
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
              :displayStatus="true" :domain="'request'" :displayActions="false" :canEdit="false" :canDelete="false"
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
              :displayStatus="true" :domain="'request'" :displayActions="false" :canEdit="false" :canDelete="false"
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
      colorPalette: ['#17a2b8',  '#dc3545', '#ffc107', '#6f42c1', '#28a745', '#007bff', '#fd7e14', '#6610f2', '#6c757d', '#17a2b8'],
      departmentColors: {
      },
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
      exportEndDate: new Date().toISOString().split('T')[0],  // Today's date
      exportStartDate: (() => {
        // Set start date to 3 months before end date
        const threeMonthsPrior = new Date();
        threeMonthsPrior.setMonth(threeMonthsPrior.getMonth() - 3);
        return threeMonthsPrior.toISOString().split('T')[0];
      })(),
      barChart: {
        data: {
          labels: ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'],
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
            'Ngày tạo': new Date(item.createdDate).toLocaleDateString('vi-VN', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            }) + ' ' + new Date(item.createdDate).toLocaleTimeString('vi-VN', {
              hour: '2-digit',
              minute: '2-digit',
            }),
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
    // Generate monthly date ranges
    const monthlyDateRanges = this.getMonthlyDateRanges(currentYear);

    // Fetch department costs for each month
    for (const { startDate, endDate } of monthlyDateRanges) {
      try {
        const response = await axios.get('https://localhost:7162/Summary/department-costs', {
          headers: { Authorization: `Bearer ${this.token}` },
          params: { startDate, endDate },
        });

        if (response.data && Array.isArray(response.data)) {
          response.data.forEach((item) => {
            // Find or create the department series
            let departmentSeries = this.barChart.data.series.find(
              (series) => series.name === item.department
            );

            if (!departmentSeries) {
              departmentSeries = { name: item.department, data: Array(12).fill(0) };
              this.barChart.data.series.push(departmentSeries);
            }

            // Update the cost for the current month
            const monthIndex = new Date(startDate).getMonth();
            departmentSeries.data[monthIndex] = item.cost;

            // Assign a color to the department if not already assigned
            if (!this.departmentColors[item.department]) {
              const colorIndex = Object.keys(this.departmentColors).length % this.colorPalette.length;
              this.departmentColors[item.department] = this.colorPalette[colorIndex];
            }
          });
        }
      } catch (error) {
        console.error(`Error fetching data for ${startDate} - ${endDate}:`, error);
      }
    }

    console.log('barChart.data.series:', this.barChart.data.series);
    console.log('Department colors:', this.departmentColors);

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

      // Validate date inputs
      if (selectedStartDate > today || selectedEndDate > today) {
        alert('Ngày bắt đầu và ngày kết thúc không được lớn hơn ngày hiện tại.');
        return;
      }

      if (!this.startDate || !this.endDate) {
        alert('Vui lòng chọn cả ngày bắt đầu và ngày kết thúc.');
        return;
      }

      try {
        // Prepare API parameters
        const params = {
          startDate: this.startDate,
          endDate: this.endDate,
        };

        // Add department to params only if a specific department is selected
        if (this.selectedDepartment) {
          params.department = this.selectedDepartment;
        }

        // Debug the params being sent
        console.log('API Params:', params);

        // Fetch data from the API
        const response = await axios.get(
          `https://localhost:7162/Request/approved-requests-by-date-range-and-department`,
          {
            headers: { Authorization: `Bearer ${this.token}` },
            params,
          }
        );

        if (response.data && Array.isArray(response.data)) {
          // Sort the response data by createdDate in descending order (newest first)
          response.data.sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate));

          // Resolve user names for each request
          const userPromises = response.data.map((item) => this.getUserName(item.userID));
          const userNames = await Promise.all(userPromises);

          // Map the response data to the table format
          this.tableData.data = response.data.map((item, index) => ({
            requestID: item.requestID,
            'Mã số phiếu': item.requestCode,
            'Người tạo': userNames[index],
            'Ngày tạo': new Date(item.createdDate).toLocaleDateString('vi-VN', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            }) + ' ' + new Date(item.createdDate).toLocaleTimeString('vi-VN', {
              hour: '2-digit',
              minute: '2-digit',
            }),
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
            'Ngày tạo': new Date(item.createdDate).toLocaleDateString('vi-VN', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            }) + ' ' + new Date(item.createdDate).toLocaleTimeString('vi-VN', {
              hour: '2-digit',
              minute: '2-digit',
            }),
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
    getMonthlyDateRanges(year) {
      // Array of first dates for each month
      const firstDates = [
        '01/01', '01/02', '01/03', '01/04', '01/05', '01/06',
        '01/07', '01/08', '01/09', '01/10', '01/11', '01/12',
      ];

      // Array of last dates for each month in a non-leap year
      const lastDatesNonLeap = [
        '31/01', '28/02', '31/03', '30/04', '31/05', '30/06',
        '31/07', '31/08', '30/09', '31/10', '30/11', '31/12',
      ];

      // Array of last dates for each month in a leap year
      const lastDatesLeap = [
        '31/01', '29/02', '31/03', '30/04', '31/05', '30/06',
        '31/07', '31/08', '30/09', '31/10', '30/11', '31/12',
      ];

      // Determine if the year is a leap year
      const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;

      // Select the appropriate last dates array
      const lastDates = isLeapYear ? lastDatesLeap : lastDatesNonLeap;

      // Generate the date ranges
      const dateRanges = [];
      for (let i = 0; i < 12; i++) {
        const startDate = `${year}-${firstDates[i].split('/')[1]}-${firstDates[i].split('/')[0]}`;
        const endDate = `${year}-${lastDates[i].split('/')[1]}-${lastDates[i].split('/')[0]}`;
        dateRanges.push({
          startDate,
          endDate,
        });
      }

      return dateRanges;
    },
    async downloadProductReport() {
      if (!this.exportStartDate || !this.exportEndDate) {
        alert('Vui lòng chọn cả ngày bắt đầu và ngày kết thúc.');
        return;
      }
    
      try {
        const response = await axios.get(
          `https://localhost:7162/Summary/export-product-report`,
          {
            headers: { Authorization: `Bearer ${this.token}` },
            params: {
              startDate: this.exportStartDate,
              endDate: this.exportEndDate,
            },
            responseType: 'blob', // Ensure the response is treated as a file
          }
        );
    
        // Create a link to download the file
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        
        // Log the headers to debug
        console.log('Response headers:', response.headers);
        
        // Extract filename from content-disposition header
        let fileName = 'report.xlsx';
        
        // In axios, header names are normalized to lowercase
        const contentDisposition = response.headers['content-disposition'];
        console.log('Content-Disposition header:', contentDisposition);
        
        if (contentDisposition) {
          // Try to extract the filename* parameter (RFC 5987 encoded)
          const filenameStarRegex = /filename\*=UTF-8''([^;]+)/i;
          const filenameStarMatch = contentDisposition.match(filenameStarRegex);
          if (filenameStarMatch && filenameStarMatch[1]) {
            fileName = decodeURIComponent(filenameStarMatch[1]);
            console.log('Extracted filename from filename*:', fileName);
          } else {
            // Try to extract the filename parameter
            const filenameRegex = /filename=["']?([^"';]+)["']?/i;
            const filenameMatch = contentDisposition.match(filenameRegex);
            if (filenameMatch && filenameMatch[1]) {
              fileName = filenameMatch[1];
              console.log('Extracted filename from filename:', fileName);
            } else {
              // If both extraction methods fail, generate a meaningful filename
              fileName = `report-${this.exportStartDate}-${this.exportEndDate}.xlsx`;
              console.log('Generated filename:', fileName);
            }
          }
        } else {
          // If no content-disposition header, use the date range to generate a name
          fileName = `report-${this.exportStartDate}-${this.exportEndDate}.xlsx`;
          console.log('No content-disposition header, generated filename:', fileName);
        }
    
        link.href = url;
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        console.log(`Downloaded file: ${fileName}`);
      } catch (error) {
        console.error('Lỗi khi tải báo cáo:', error);
        alert('Lỗi khi tải báo cáo. Vui lòng thử lại.');
      }
    },
    async downloadApprovedRequestsExcel() {
      if (!this.startDate || !this.endDate) {
        alert('Vui lòng chọn cả ngày bắt đầu và ngày kết thúc.');
        return;
      }
    
      try {
        const params = {
          startDate: this.startDate,
          endDate: this.endDate,
        };
    
        // Add department to params only if a specific department is selected
        if (this.selectedDepartment) {
          params.department = this.selectedDepartment;
        }
        
        const response = await axios.get(
          `https://localhost:7162/Summary/export-approved-requests`,
          {
            headers: { Authorization: `Bearer ${this.token}` },
            params,
            responseType: 'blob', // Ensure the response is treated as a file
          }
        );
    
        // Create a link to download the file
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        
        // Extract filename from content-disposition header
        let fileName = this.selectedDepartment
  ? `PYC-da-duyet-${this.selectedDepartment}-${this.startDate}-${this.endDate}.xlsx`
  : `PYC-da-duyet-${this.startDate}-${this.endDate}.xlsx`;
        
        // In axios, header names are normalized to lowercase
        const contentDisposition = response.headers['content-disposition'];
        
        if (contentDisposition) {
          // Try to extract the filename* parameter (RFC 5987 encoded)
          const filenameStarRegex = /filename\*=UTF-8''([^;]+)/i;
          const filenameStarMatch = contentDisposition.match(filenameStarRegex);
          if (filenameStarMatch && filenameStarMatch[1]) {
            fileName = decodeURIComponent(filenameStarMatch[1]);
          } else {
            // Try to extract the filename parameter
            const filenameRegex = /filename=["']?([^"';]+)["']?/i;
            const filenameMatch = contentDisposition.match(filenameRegex);
            if (filenameMatch && filenameMatch[1]) {
              fileName = filenameMatch[1];
            }
          }
        }
    
        link.href = url;
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        console.log(`Downloaded file: ${fileName}`);
        
        // Show success notification
        this.$notifications.notify({
          message: 'Tải xuống báo cáo thành công!',
          icon: 'nc-icon nc-check-2',
          horizontalAlign: 'right',
          verticalAlign: 'bottom',
          type: 'success'
        });
      } catch (error) {
        console.error('Lỗi khi tải báo cáo:', error);
        alert('Lỗi khi tải báo cáo. Vui lòng thử lại.');
      }
    },
  },
  watch: {
    selectedDepartment(newVal) {
      console.log('Selected Department:', newVal);
    },
  },
};
</script>

<style scoped>



.legend i {
  margin-right: 5px;
}

.card .form-control {
  display: block;
  width: 100%;
  padding: 0.375rem 0.75rem;
  font-size: 1rem;
  line-height: 1.5;
  color: #495057;
  background-color: #fff;
  background-clip: padding-box;
  border: 1px solid #ced4da;
  border-radius: 0.25rem;
  box-shadow: inset 0 1px 2px rgb(0 0 0 / 8%);
}

.card .btn {
  display: inline-block;
  font-weight: 400;
  text-align: center;
  white-space: nowrap;
  vertical-align: middle;
  user-select: none;
  border: 1px solid transparent;
  padding: 0.375rem 0.75rem;
  font-size: 1rem;
  line-height: 1.5;
  border-radius: 0.25rem;
  transition: color 0.15s ease-in-out, background-color 0.15s ease-in-out, border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
}

.form-control {
  display: block !important;
  visibility: visible !important;
}

button.btn-info {
  display: block !important;
  visibility: visible !important;
}

.button-container {
  display: flex;
  justify-content: flex-end;
}

.button-container .btn i {
  margin-right: 5px;
}
</style>