<template>
  <card>
    <template #header>
      <h4 class="card-title">Tạo phiếu tổng hợp</h4>
    </template>
    <form>
      <div class="row">
        <div class="col-md-3">
          <label for="createdBy">Người thực hiện</label>
          <base-input type="text" placeholder="Nhập người thực hiện" v-model="requester" readonly></base-input>
        </div>
        <div class="col-md-3">
          <label for="department">Phòng ban</label>
          <base-input type="text" placeholder="Nhập phòng ban" v-model="userDepartment" readonly></base-input>
        </div>
        <div class="col-md-3">
          <label for="ticketNumber">Mã số phiếu</label>
          <base-input type="text" v-model="ticketNumber" readonly></base-input>
        </div>
        <div class="col-md-3">
          <label for="createdDate">Ngày thực hiện</label>
          <base-input type="date" v-model="createdDate" readonly></base-input>
        </div>
      </div>

      <div class="request-list" v-if="requests.length > 0">
        <div v-for="(request, index) in requests" :key="index" class="request-card">
          <div class="request-header">
            <span class="request-title">Phiếu yêu cầu: {{ request.requestCode }}</span>
            <button @click.prevent="toggleDetails(request)" class="toggle-button">
              {{ request.showDetails ? 'Ẩn' : 'Xem' }}
            </button>
          </div>
          <div v-if="request.showDetails" class="request-details">
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
            <div class="product-list">
              <div v-for="(productRow, idx) in getProductRows(request.product_Requests)" :key="idx" class="product-item">
                <div class="product-name">{{ getProductName(productRow.selectedProduct) }}</div>
                <div class="product-meta">
                  <span><strong>ĐVT:</strong> {{ productRow.unitCurrency || 'Chưa có' }}</span>
                  <span><strong>SL:</strong> {{ productRow.quantity }}</span>
                  <span><strong>Đơn giá:</strong> {{ formatCurrency(productRow.unitPrice) }}</span>
                  <span><strong>Thành tiền:</strong> {{ formatCurrency(productRow.totalPrice) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-if="requests.length > 0" class="total-amount">
        <strong>Tổng tiền:</strong> {{ formatCurrency(totalAmount) }}
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
      requester: localStorage.getItem('userName'),
      userDepartment: localStorage.getItem('department'),
      summaryNumber: '',
      ticketNumber: '',
      token: localStorage.getItem('authToken')
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
    generateTicketNumber() {
      const today = new Date();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const year = String(today.getFullYear()).slice(-2);
      return `PTH${year}/${month}/${this.summaryNumber}`;
    },
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
        const response = await axios.get(`https://localhost:7162/Request/getbyid/${id}`, {headers: { Authorization: `Bearer ${this.token}` }});
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
        const response = await axios.get(`https://localhost:7162/User/getbyid/${userID}`, {headers: { Authorization: `Bearer ${this.token}` }});
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
    async createSummary() {
      const userID = localStorage.getItem('userId');
      const requestIDs = this.requests.map(request => request.requestID);

      if (!userID || requestIDs.length === 0) {
        console.error('Không có request hoặc userID để tạo phiếu tổng hợp.');
        return;
      }

      const payload = {
        summaryCode: this.ticketNumber,
        userID: userID,
        requestIDs: requestIDs,
      };

      try {
        const response = await axios.post('https://localhost:7162/Summary', payload, {
          headers: { Authorization: `Bearer ${this.token}` }
        });
        console.log('Phiếu tổng hợp đã được tạo thành công:', response.data);
        this.$router.push('/admin/summary-table');
      } catch (error) {
        console.error('Lỗi khi tạo phiếu tổng hợp:', error);
      }
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
  },
  async mounted() {
    try {
      const response = await axios.get('https://localhost:7162/Product/allproductsincludedeleted', {
        headers: { Authorization: `Bearer ${this.token}` }
      });
      this.products = response.data;
      const response2 = await axios.get('https://localhost:7162/Summary/count', {headers: { Authorization: `Bearer ${this.token}` }});
      this.summaryNumber = response2.data;
      this.ticketNumber = this.generateTicketNumber();
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
.summary-info {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.info-item {
  flex: 1;
  min-width: 200px;
}

.request-list {
  margin-top: 20px;
}

.request-card {
  border: 1px solid #ddd;
  border-radius: 10px;
  padding: 15px;
  margin-bottom: 15px;
  background: #f9f9f9;
}

.request-header {
  display: flex;
  justify-content: space-between;
  font-weight: bold;
  margin-bottom: 10px;
}

.toggle-button {
  background: none;
  border: none;
  color: blue;
  cursor: pointer;
}

.request-details {
  background: #fff;
  padding: 10px;
  border-radius: 5px;
}

.product-list {
  margin-top: 10px;
}

.product-item {
  background: #eee;
  padding: 10px;
  border-radius: 5px;
  margin-bottom: 5px;
}

.product-name {
  font-weight: bold;
}

.product-meta {
  display: flex;
  gap: 10px;
  font-size: 14px;
}
</style>