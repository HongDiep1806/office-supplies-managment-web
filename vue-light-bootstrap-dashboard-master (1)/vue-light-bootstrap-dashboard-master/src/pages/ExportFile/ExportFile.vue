<template>
  <div class="content">
    <div class="container-fluid">
      <!-- First Dashboard - Product Statistics -->
      <div class="row">
        <div class="col-12">
          <card>
            <template v-slot:header>
              <h4 class="card-title">Thống kê sản phẩm phiếu yêu cầu</h4>
              <p class="card-category">Chi tiết về sản phẩm theo phòng ban</p>
            </template>
            <div class="dashboard-container">
              <iframe
                src="http://localhost:3000/dashboard/14-san-pham-phieu-yeu-cau"
                frameborder="0"
                width="100%"
                height="600"
                allowtransparency
              ></iframe>
            </div>
          </card>
        </div>
      </div>

      <!-- Second Dashboard - Request Statistics -->
      <div class="row mt-4">
        <div class="col-12">
          <card>
            <template v-slot:header>
              <h4 class="card-title">Thống kê phiếu yêu cầu</h4>
              <p class="card-category">Tổng hợp phiếu yêu cầu theo trạng thái</p>
            </template>
            <div class="dashboard-container">
              <iframe
                src="http://localhost:3000/dashboard/13-phieu-yeu-cau"
                frameborder="0"
                width="100%"
                height="600"
                allowtransparency
              ></iframe>
            </div>
          </card>
        </div>
      </div>

      <!-- Export Product Report Section -->
      <div class="row mt-4">
        <div class="col-12">
          <card>
            <template v-slot:header>
              <h4 class="card-title">Xuất Báo Cáo Sản Phẩm</h4>
              <p class="card-category">Chọn khoảng thời gian để xuất báo cáo</p>
            </template>
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
          </card>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Card from 'src/components/Cards/Card.vue';
import jwtDecode from 'jwt-decode';
import axios from 'axios';

export default {
  components: {
    Card,
  },
  data() {
    return {
      token: '',
      userRole: '',
      exportEndDate: new Date().toISOString().split('T')[0],  // Today's date
      exportStartDate: (() => {
        // Set start date to 3 months before end date
        const threeMonthsPrior = new Date();
        threeMonthsPrior.setMonth(threeMonthsPrior.getMonth() - 3);
        return threeMonthsPrior.toISOString().split('T')[0];
      })(),
    };
  },
  mounted() {
    const token = localStorage.getItem('authToken');
    this.token = token;
    if (token) {
      try {
        const decoded = jwtDecode(token);
        this.userRole = decoded.Role || 'User';
        
        // Redirect if not authorized
        if (this.userRole !== 'Sup Leader') {
          this.$router.push('/');
        }
      } catch (error) {
        console.error('Invalid token:', error);
        this.$router.push('/login');
      }
    } else {
      this.$router.push('/login');
    }
  },
  methods: {
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
        
        // Extract filename from content-disposition header
        let fileName = 'report.xlsx';
        
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
            } else {
              // If both extraction methods fail, generate a meaningful filename
              fileName = `report-${this.exportStartDate}-${this.exportEndDate}.xlsx`;
            }
          }
        } else {
          // If no content-disposition header, use the date range to generate a name
          fileName = `report-${this.exportStartDate}-${this.exportEndDate}.xlsx`;
        }
    
        link.href = url;
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        //alert('Tải xuống báo cáo thành công!');
      } catch (error) {
        console.error('Lỗi khi tải báo cáo:', error);
        alert('Lỗi khi tải báo cáo. Vui lòng thử lại.');
      }
    }
  }
};
</script>

<style scoped>
.dashboard-container {
  width: 100%;
  overflow: hidden;
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 0;
}

.dashboard-container iframe {
  border: none;
  width: 100%;
  min-height: 600px;
  transition: height 0.3s ease;
}

.mt-4 {
  margin-top: 1.5rem !important;
}

.form-control {
  display: block !important;
  width: 100%;
  padding: 0.375rem 0.75rem;
  font-size: 1rem;
  color: #495057;
  background-color: #fff;
  border: 1px solid #ced4da;
  border-radius: 0.25rem;
}

.btn-info {
  color: #fff;
  background-color: #17a2b8;
  border-color: #17a2b8;
}

.card-body {
  padding: 1.25rem;
}
</style>