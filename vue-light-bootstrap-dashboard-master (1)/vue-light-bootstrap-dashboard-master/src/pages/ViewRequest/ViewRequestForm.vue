<template>
  <card>
    <h4 slot="header" class="card-title">Chi tiết phiếu yêu cầu</h4>
    <form>
      <div class="row">
        <div class="col-md-3">
          <label for="createdBy">Người thực hiện</label>
          <base-input type="text" :value="userName" readonly></base-input>
        </div>
        <div class="col-md-3">
          <label for="department">Phòng ban</label>
          <base-input type="text" :value="userDepartment" readonly></base-input>
        </div>
        <div class="col-md-3">
          <label for="ticketNumber">Số phiếu</label>
          <base-input type="text" :value="ticketNumber" readonly></base-input>
        </div>
        <div class="col-md-3">
          <label for="createdDate">Ngày thực hiện</label>
          <base-input type="date" :value="requestDate" readonly></base-input>
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
            <tr v-for="(productRow, index) in productRows" :key="index">
              <td>{{ index + 1 }}</td>
              <td>{{ productRow.selectedProduct ? productRow.selectedProduct.name : 'Chưa chọn' }}</td>
              <td>{{ productRow.unitCurrency || 'Chưa có' }}</td>
              <td>{{ productRow.quantity }}</td>
              <td>
                {{
                  new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                  }).format(productRow.unitPrice || 0)
                }}
              </td>
              <td>
                {{
                  new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                  }).format(productRow.totalPrice || 0)
                }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="text-center position-relative">
        <div style="display: flex; flex-direction: row; justify-content: end;">
          <!-- <button type="button" class="btn btn-add-product" @click="addProductRow"
                        style="border-color: rgb(220, 68, 5); max-height: fit-content;">
                        <i class="fa fa-plus" style="color: rgb(220, 68, 5);"></i>
                    </button> -->
          <div>
            <label for="totalAmount">Tổng cộng</label>
            <p class="total-amount-input">{{ formattedTotalAmount }}</p>
            <!-- <base-input type="text" readonly class="total-amount-input"><p>{{ formattedTotalAmount }}</p></base-input> -->
          </div>
        </div>
        <button type="submit" class="btn btn-info btn-fill float-right" @click.prevent="approveTicket" v-if="userRole !== 'Employee' && requestStatus === 'Chưa duyệt'">
          Duyệt phiếu yêu cầu
        </button>
        <button type="submit" class="btn btn-cancel btn-fill float-right" @click.prevent="updateTicket"
          style="margin-right: 10px;" v-if="userRole !== 'Employee' && requestStatus === 'Chưa duyệt'">
          Không duyệt phiếu
        </button>
      </div>
    </form>
  </card>
</template>

<script>
import Card from 'src/components/Cards/Card.vue';
import BaseInput from '../../components/Inputs/BaseInput.vue';
import axios from 'axios';

export default {
  components: {
    Card,
    BaseInput,
  },
  data() {
    return {
      requestDate: '',
      ticketNumber: '',
      products: [],
      productRows: [],
      userName: '',
      userID: 0,
      userDepartment: '',
      requestNumber: 0,
      totalAmount: 0,
      type: ['success', 'danger', 'warning'],
      userRole: '',
      requestStatus: '',  

    };
  },
  async mounted() {
    const requestId = this.$route.params.id;
    const request = await axios.get(`https://localhost:7162/Request/getbyid/${requestId}`);
    this.userID = request.data.userID;
    this.requestNumber = request.data.requestCode;
    this.ticketNumber = request.data.requestCode;
    this.requestDate = request.data.createdDate.substr(0, 10);
    this.totalAmount = request.data.totalPrice;
    this.requestStatus = this.$route.params.status;
    try {
      const token = localStorage.getItem('authToken');
      this.userRole = localStorage.getItem('userRole');
      const response = await axios.get('https://localhost:7162/Product/allproductsincludedeleted', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      this.products = response.data;
    } catch (error) {
      console.error('Lỗi khi lấy danh sách sản phẩm:', error);
    }

    this.productRows = request.data.product_Requests.map((item) => {
      const product = this.products.find((p) => p.productID === item.productID);
      return {
        selectedProduct: product,
        quantity: item.quantity,
        unitCurrency: product ? product.unitCurrency : 'Chưa có',
        unitPrice: product ? product.unitPrice : 0,
        totalPrice: product ? item.quantity * product.unitPrice : 0,
      };
    });

    try {
      const user = await axios.get(`https://localhost:7162/User/getbyid/${this.userID}`);
      this.userDepartment = user.data.department;
      this.userName = user.data.fullName;
    } catch (error) {
      console.error('Lỗi khi lấy thông tin người dùng:', error);
    }
  },
  computed: {
    // totalAmount() {
    //   return this.productRows.reduce((sum, product) => sum + product.totalPrice, 0);
    // },
    formattedTotalAmount() {
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
      }).format(this.totalAmount);
    },
  },
  methods: {
    async notifySuccess(verticalAlign, horizontalAlign) {
      this.$notifications.notify({
        message: `<span>Cập nhật phiếu yêu cầu thành công</span>`,
        icon: 'nc-icon nc-app',
        horizontalAlign: horizontalAlign,
        verticalAlign: verticalAlign,
        type: this.type[0],
      });
    },
    async notifyError(verticalAlign, horizontalAlign) {
      this.$notifications.notify({
        message: `<span>Cập nhật phiếu yêu cầu thất bại</span>`,
        icon: 'nc-icon nc-app',
        horizontalAlign: horizontalAlign,
        verticalAlign: verticalAlign,
        type: this.type[1],
      });
    },
    async notifyWarning(verticalAlign, horizontalAlign) {
      this.$notifications.notify({
        message: `<span>Vui lòng nhập đủ thông tin</span>`,
        icon: 'nc-icon nc-app',
        horizontalAlign: horizontalAlign,
        verticalAlign: verticalAlign,
        type: this.type[2],
      });
    },
    async approveTicket() {
      try {
        const token = localStorage.getItem('authToken');
        const requestId = this.$route.params.id;
        if (this.userRole === 'Dep Leader') {
          const response = await axios.put(`https://localhost:7162/Request/approveByDepLeader/${requestId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          console.log("thành công" + response.data);
        this.notifySuccess('top', 'right');
        this.$router.push('/admin/view-all-request');
        } else if (this.userRole === 'Finance Management Employee') {
          const token = localStorage.getItem('authToken');
          const response = await axios.put(`https://localhost:7162/Request/approveRequestByFinEmployee/${requestId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          console.log("thành công" + response.data);
        this.notifySuccess('top', 'right');
        this.$router.push('/admin/view-all-request');

        }
        
      } catch (error) {
        console.error('Lỗi khi cập nhật phiếu yêu cầu:', error);
      }
    },
    async updateTicket() {
    try {
      const token = localStorage.getItem('authToken');
      const requestId = this.$route.params.id;
      if (this.userRole === 'Dep Leader') {
        const response = await axios.put(`https://localhost:7162/Request/notapproveByDepLeader/${requestId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log("Không duyệt thành công" + response.data);
        this.notifySuccess('top', 'right');
        this.$router.push('/admin/view-all-request');
      } else if (this.userRole === 'Finance Management Employee') {
        const response = await axios.put(`https://localhost:7162/Request/notapproveByFinEmployee/${requestId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log("Không duyệt thành công" + response.data);
        this.notifySuccess('top', 'right');
        this.$router.push('/admin/view-all-request');
      }
    } catch (error) {
      console.error('Lỗi khi cập nhật phiếu yêu cầu:', error);
    }
  },
    
  },
};
</script>

<style scoped>
.total-amount-input {
  border: 1px solid #ccc;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 16px;
  width: 150px;
  text-align: center !important;
  background-color: #F5F5F5;
  color: #888888;
}

.total-amount-input:focus {
  box-shadow: 0 0 5px rgba(255, 255, 255, 0.5);
}
</style>