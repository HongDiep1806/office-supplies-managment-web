<!-- <template>
  <card>
    <template #header>
      <h4 class="card-title">Tạo phiếu tổng hợp</h4>
    </template>
    <form>
      <div class="table-responsive" v-if="requests.length > 0">
        <table class="table">
          <thead>
            <tr>
              <th>STT</th>
              <th>Mã số Phiếu yêu cầu</th>
              <th>Người thực hiện</th>
              <th>Phòng ban</th>
              <th>Ngày thực hiện</th>
              <th>Chi tiết</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="(request, index) in requests">
              <tr>
                <td>{{ index + 1 }}</td>
                <td>{{ request.requestCode }}</td>
                <td>{{ getUserFullName(request.userID) }}</td>
                <td>{{ getUserDepartment(request.userID) }}</td>
                <td>{{ formatDateTime(request.createdDate) }}</td>
                <td>
                  <button
                    @click.prevent="toggleDetails(request)"
                    class="btn btn-sm btn-info"
                  >
                    {{ request.showDetails ? 'Ẩn' : 'Xem' }}
                  </button>
                </td>
              </tr>
              <tr v-if="request.showDetails" class="details-row">
                <td colspan="6">
                  <div class="details-container">
                    <h5>Chi tiết phiếu yêu cầu: {{ request.requestCode }}</h5>
                    <div class="row">
                      <div class="col-md-3">
                        <label for="createdBy">Người thực hiện</label>
                        <base-input type="text" :value="getUserFullName(request.userID)" readonly></base-input>
                      </div>
                      <div class="col-md-3">
                        <label for="department">Phòng ban</label>
                        <base-input type="text" :value="getUserDepartment(request.userID)" readonly></base-input>
                      </div>
                      <div class="col-md-3">
                        <label for="ticketNumber">Số phiếu</label>
                        <base-input type="text" :value="request.requestCode" readonly></base-input>
                      </div>
                      <div class="col-md-3">
                        <label for="createdDate">Ngày thực hiện</label>
                        <base-input type="date" :value="formatDate(request.createdDate)" readonly></base-input>
                      </div>
                    </div>
                    <div class="table-responsive">
                      <table class="table">
                        <thead>
                          <tr>
                            <th>STT</th>
                            <th>Tên sản phẩm</th>
                            <th>Đơn vị tính</th>
                            <th>Số lượng</th>
                            <th>Đơn giá</th>
                            <th>Thành tiền</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr v-for="(productRow, index) in getProductRows(request.product_Requests)" :key="index">
                            <td>{{ index + 1 }}</td>
                            <td>{{ getProductName(productRow.selectedProduct) }}</td>
                            <td>{{ productRow.unitCurrency || 'Chưa có' }}</td>
                            <td>{{ productRow.quantity }}</td>
                            <td>{{ formatCurrency(productRow.unitPrice) }}</td>
                            <td>{{ formatCurrency(productRow.totalPrice) }}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
    </form>
  </card>
</template> -->
<template>
  <card>
    <template #header>
      <h4 class="card-title">Tạo phiếu tổng hợp</h4>
    </template>
    <form>
      <div class="table-responsive" v-if="requests.length > 0">
        <table class="table">
          <thead>
            <tr>
              <th>STT</th>
              <th>Mã số Phiếu yêu cầu</th>
              <th>Người thực hiện</th>
              <th>Phòng ban</th>
              <th>Ngày thực hiện</th>
              <th>Chi tiết</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="(request, index) in requests">
              <tr>
                <td>{{ index + 1 }}</td>
                <td>{{ request.requestCode }}</td>
                <td>{{ getUserFullName(request.userID) }}</td>
                <td>{{ getUserDepartment(request.userID) }}</td>
                <td>{{ formatDateTime(request.createdDate) }}</td>
                <td>
                  <button
                    @click.prevent="toggleDetails(request)"
                    class="btn btn-sm btn-info"
                  >
                    {{ request.showDetails ? 'Ẩn' : 'Xem' }}
                  </button>
                </td>
              </tr>
              <tr v-if="request.showDetails" class="details-row">
                <td colspan="6">
                  <div class="details-container">
                    <div class="details-header">
                      <div class="details-item">
                        <label for="createdBy">Người thực hiện</label>
                        <base-input type="text" :value="getUserFullName(request.userID)" readonly></base-input>
                      </div>
                      <div class="details-item">
                        <label for="department">Phòng ban</label>
                        <base-input type="text" :value="getUserDepartment(request.userID)" readonly></base-input>
                      </div>
                      <div class="details-item">
                        <label for="ticketNumber">Số phiếu</label>
                        <base-input type="text" :value="request.requestCode" readonly></base-input>
                      </div>
                      <div class="details-item">
                        <label for="createdDate">Ngày thực hiện</label>
                        <base-input type="date" :value="formatDate(request.createdDate)" readonly></base-input>
                      </div>
                    </div>
                    <div class="table-responsive">
                      <table class="table">
                        <thead>
                          <tr>
                            <th>STT</th>
                            <th>Tên sản phẩm</th>
                            <th>Đơn vị tính</th>
                            <th>Số lượng</th>
                            <th>Đơn giá</th>
                            <th>Thành tiền</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr v-for="(productRow, index) in getProductRows(request.product_Requests)" :key="index">
                            <td>{{ index + 1 }}</td>
                            <td>{{ getProductName(productRow.selectedProduct) }}</td>
                            <td>{{ productRow.unitCurrency || 'Chưa có' }}</td>
                            <td>{{ productRow.quantity }}</td>
                            <td>{{ formatCurrency(productRow.unitPrice) }}</td>
                            <td>{{ formatCurrency(productRow.totalPrice) }}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
      <div class="form-group text-center">
        <button type="button" class="btn btn-primary" @click="createSummary">Tạo phiếu tổng hợp</button>
      </div>
    </form>
  </card>
</template>


<script>
import axios from 'axios';

export default {
  data() {
    return {
      createdDate: new Date().toISOString().slice(0, 10),
      requests: [],
      users: {},
      totalAmount: 0,
      requestIds: [],
      showDetails: false, // Thêm biến showDetails
    };
  },
  computed: {
    firstUser() {
      if (this.requests.length > 0) {
        return this.users[this.requests[0].userID] || { fullName: "Đang tải...", department: "Đang tải..." };
      }
      return { fullName: "", department: "" };
    }
  },
  async created() {
    const requestIdsParam = this.$route.params.requestIds;
    if (!requestIdsParam) {
      console.warn('requestIds is undefined hoặc trống.');
      return;
    }
    this.requestIds = requestIdsParam.split(',').filter(id => id.trim() !== '');
    if (this.requestIds.length === 0) {
      console.warn('requestIds trống sau khi tách.');
      return;
    }
    await this.fetchRequests();
  },
  methods: {
    async fetchRequests() {
      try {
        const responses = await Promise.all(
          this.requestIds.map(id => this.fetchRequestById(id))
        );
        this.requests = responses.filter(request => request !== null).map(request => ({
          ...request,
          showDetails: false, // Thêm showDetails vào mỗi request
        }));
        this.calculateTotal();
        const userIds = [...new Set(this.requests.map(req => req.userID))];
        await this.fetchUsers(userIds);
      } catch (error) {
        console.error('Lỗi khi lấy dữ liệu request:', error);
      }
    },
    async fetchRequestById(id) {
      try {
        const response = await axios.get(`https://localhost:7162/Request/getbyid/${id}`);
        return response.data;
      } catch (error) {
        console.warn(`Lỗi khi lấy request ${id}:`, error);
        return null;
      }
    },
    async fetchUsers(userIds) {
      try {
        const responses = await Promise.all(
          userIds.map(userID => this.fetchUserById(userID))
        );
        responses.forEach(user => {
          if (user) {
            this.$set(this.users, user.userID, user);
          }
        });
      } catch (error) {
        console.error('Lỗi khi lấy thông tin người dùng:', error);
      }
    },
    async fetchUserById(userID) {
      try {
        const response = await axios.get(`https://localhost:7162/User/getbyid/${userID}`);
        return response.data;
      } catch (error) {
        console.warn(`Lỗi khi lấy thông tin người dùng ${userID}:`, error);
        return null;
      }
    },
    toggleDetails(request) {
      this.$set(request, 'showDetails', !request.showDetails);
    },
    calculateTotal() {
      this.totalAmount = this.requests.reduce((total, request) => total + (request.totalPrice || 0), 0);
    },
    createSummary() {
      console.log('Tạo phiếu tổng hợp với requestIds:', this.requestIds);
      console.log('Tổng tiền:', this.totalAmount);
    },
    formatDateTime(dateString) {
      if (!dateString) return "N/A";
      const date = new Date(dateString);
      return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
    },
    getUserFullName(userID) {
      if (this.users[userID] && this.users[userID].fullName) {
        return this.users[userID].fullName;
      }
      return 'N/A';
    },
    getUserDepartment(userID) {
      if (this.users[userID] && this.users[userID].department) {
        return this.users[userID].department;
      }
      return 'N/A';
    },
    getProductName(product) {
      if (product && product.name) {
        return product.name;
      }
      return 'Chưa chọn';
    },
    formatDate(dateString) {
      if (!dateString) return '';
      return dateString.substr(0, 10);
    },
    getProductRows(productRequests) {
      if (!this.products || !productRequests) {
        return []; // Trả về mảng rỗng nếu this.products hoặc productRequests là undefined
      }
      return productRequests.map((item) => {
        const product = this.products.find((p) => p.productID === item.productID);
        return {
          selectedProduct: product,
          quantity: item.quantity,
          unitCurrency: product ? product.unitCurrency : 'Chưa có',
          unitPrice: product ? product.unitPrice : 0,
          totalPrice: product ? item.quantity * product.unitPrice : 0,
        };
      });
    },
    formatCurrency(value) {
      return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value || 0);
    },
    async createSummary() {
      const userID = localStorage.getItem('userId');
      const requestIDs = this.requests.map(request => request.requestID);

      if (!userID || requestIDs.length === 0) {
        console.error('Không có request hoặc userID để tạo phiếu tổng hợp.');
        return;
      }

      const payload = {
        userID: userID,
        requestIDs: requestIDs,
      };

      axios.post('https://localhost:7162/Summary', payload)
        .then(response => {
          console.log('Phiếu tổng hợp đã được tạo thành công:', response.data);
          // Xử lý kết quả trả về từ API (ví dụ: hiển thị thông báo thành công)
          this.$router.push('/admin/summary-table');
        })
        .catch(error => {
          console.error('Lỗi khi tạo phiếu tổng hợp:', error);
          // Xử lý lỗi (ví dụ: hiển thị thông báo lỗi)
        });
    },
  },
  async mounted() {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get('https://localhost:7162/Product/allproductsincludedeleted', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      this.products = response.data;
    } catch (error) {
      console.error('Lỗi khi lấy danh sách sản phẩm:', error);
    }
  },
};
</script>
<style scoped>
.details-row {
  background-color: #f8f9fa;
}

.details-container {
  padding: 15px;
  width: 100%;
}

.details-header {
  display: flex;
  justify-content: space-between;
}

.details-item {
  flex: 1;
  margin-right: 10px;
}

.details-item:last-child {
  margin-right: 0;
}
</style>
