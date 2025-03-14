<template>
  <card>
    <template #header>
      <h4 class="card-title">Chi tiết phiếu tổng hợp</h4>
    </template>
    <form>
      <div class="summary-info">
        <div class="info-item">
          <label>Mã phiếu tổng hợp:</label>
          <span>{{ summary.summaryID }}</span>
        </div>
        <div class="info-item">
          <label>Người tạo:</label>
          <span>{{ getUserFullName(summary.userID) }}</span>
        </div>
        <div class="info-item">
          <label>Phòng ban: </label>
          <span>{{ getUserDepartment(summary.userID) }}</span>
        </div>
        <div class="info-item">
          <label>Ngày tạo: </label>
          <span>{{ formatDateTime(summary.createdDate) }}</span>
        </div>
        <div class="info-item">
          <label>Tổng tiền: </label>
          <span>{{ formatCurrency(summary.totalPrice) }}</span>
        </div>
        <!-- <div class="info-item">
            <label>Đã xử lý bởi SupLead:</label>
            <span>{{ summary.isProcessedBySupLead ? 'Có' : 'Không' }}</span>
          </div>
          <div class="info-item">
            <label>Đã duyệt bởi SupLead:</label>
            <span>{{ summary.isApprovedBySupLead ? 'Có' : 'Không' }}</span>
          </div> -->
      </div>

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
                  <button @click.prevent="toggleDetails(request)" class="btn btn-sm btn-info">
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
      <button type="button" class="btn btn-info btn-fill float-right" @click.prevent="updateSummary(true)"
        v-if="showApproveButton">
        Duyệt phiếu tổng hợp
      </button>

      <button type="button" class="btn btn-danger btn-fill float-right" @click.prevent="updateSummary(false)"
        style="margin-right: 10px;" v-if="showApproveButton">
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
        message: `<span>Cập nhật phiếu tổng hợp thành công</span>`,
        icon: 'nc-icon nc-app',
        horizontalAlign: horizontalAlign,
        verticalAlign: verticalAlign,
        type: this.type[0],
      });
    },
    async notifyError(verticalAlign, horizontalAlign) {
      this.$notifications.notify({
        message: `<span>Cập nhật phiếu tổng hợp thất bại</span>`,
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
span {
  font-weight: bold;
  margin-left: 5px;
}
</style>