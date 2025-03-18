<template>
  <card>
    <template #header>
      <h4 class="card-title">Chi tiết phiếu tổng hợp</h4>
    </template>
    <form>
      <div class="summary-info">
        <div class="info-item">
          <label>Mã phiếu tổng hợp:</label>
          <span>{{ summary.summaryCode }}</span>
        </div>
        <div class="info-item">
          <label>Người tạo:</label>
          <span>{{ getUserFullName(summary.userID) }}</span>
        </div>
        <div class="info-item">
          <label>Phòng ban:</label>
          <span>{{ getUserDepartment(summary.userID) }}</span>
        </div>
        <div class="info-item">
          <label>Ngày tạo:</label>
          <span>{{ formatDateTime(summary.createdDate) }}</span>
        </div>
        <div class="info-item">
          <label>Tổng tiền:</label>
          <span>{{ formatCurrency(summary.totalPrice) }}</span>
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
            <div class="request-info">
              <div><strong>Người thực hiện:</strong> {{ getUserFullName(request.userID) }}</div>
              <div><strong>Phòng ban:</strong> {{ getUserDepartment(request.userID) }}</div>
              <div><strong>Ngày thực hiện:</strong> {{ formatDateTime(request.createdDate) }}</div>
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

      <button type="button" class="btn btn-info btn-fill float-right" @click.prevent="updateSummary(true)" v-if="showApproveButton">
        Duyệt phiếu tổng hợp
      </button>
      <button type="button" class="btn btn-danger btn-fill float-right" @click.prevent="updateSummary(false)" style="margin-right: 10px;" v-if="showApproveButton">
        Không duyệt phiếu
      </button>
    </form>
  </card>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      summary: {},
      requests: [],
      users: {},
      products: [],
      showApproveButton: false,
      userRole:'',
      type: ['success', 'danger', 'warning'],

    };
  },
  async created() {
    const summaryId = this.$route.params.summaryId;
    if (!summaryId) {
      console.warn('summaryId is undefined.');
      return;
    }
    await this.fetchSummary(summaryId);
    await this.fetchRequests();
    await this.fetchProducts();
  },
  methods: {
    async fetchSummary(summaryId) {
      try {
        const response = await axios.get(`https://localhost:7162/Summary/${summaryId}`);
        this.summary = response.data;
        const userIds = [this.summary.userID];
        await this.fetchUsers(userIds);
      } catch (error) {
        console.error('Lỗi khi lấy thông tin summary:', error);
      }
    },
    async fetchRequests() {
      try {
        const responses = await Promise.all(
          this.summary.requestIDs.map(id => this.fetchRequestById(id))
        );
        this.requests = responses.filter(request => request !== null).map(request => ({
          ...request,
          showDetails: false,
        }));
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
        return [];
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
    async fetchProducts() {
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
    async updateSummary(isApproved) {
      try {
        const requestData = {
          summaryID: this.summary.summaryID,
          isProcessedBySupLead: true,
          isApprovedBySupLead: isApproved
        };

        const response = await axios.put('https://localhost:7162/Summary/update', requestData, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`,
            'Content-Type': 'application/json'
          }
        });

        this.summary.isProcessedBySupLead = true;
        this.summary.isApprovedBySupLead = isApproved;


        this.notifySuccess('top', 'right');
        this.$router.push('/admin/summary-table');
      } catch (error) {
        console.error("Lỗi khi cập nhật phiếu tổng hợp:", error);
        this.notifyError('top', 'right');
        this.$router.push('/admin/summary-table');

      }
    },
    async notifySuccess(verticalAlign, horizontalAlign) {
      this.$notifications.notify({
        message: <span>Cập nhật phiếu tổng hợp thành công</span>,
        icon: 'nc-icon nc-app',
        horizontalAlign: horizontalAlign,
        verticalAlign: verticalAlign,
        type: this.type[0],
      });
    },
    async notifyError(verticalAlign, horizontalAlign) {
      this.$notifications.notify({
        message: <span>Cập nhật phiếu tổng hợp thất bại</span>,
        icon: 'nc-icon nc-app',
        horizontalAlign: horizontalAlign,
        verticalAlign: verticalAlign,
        type: this.type[1],
      });
    },
  },
  async mounted() {
    await this.fetchSummary(this.$route.params.summaryId);
    await this.fetchRequests();
    await this.fetchProducts();

    const userRole = localStorage.getItem('userRole');
    this.userRole = userRole;

    console.log("log trong summary table: ", this.userRole);
    console.log("log trong summary table: ", this.summary && this.summary.isProcessedBySupLead); // Thêm kiểm tra summary

    if (this.userRole === 'Sup Leader' && this.summary && this.summary.isProcessedBySupLead === false) {
      this.showApproveButton = true;
    }
  }
};
</script>
<style scoped>
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
