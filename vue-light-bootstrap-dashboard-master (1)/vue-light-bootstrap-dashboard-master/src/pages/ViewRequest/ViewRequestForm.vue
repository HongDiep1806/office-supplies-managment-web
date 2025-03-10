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
                        <base-input type="text" v-model="formattedTotalAmount" readonly></base-input>
                    </div>
                </div>

                <button type="submit" class="btn btn-info btn-fill float-right" @click.prevent="updateTicket">
                    Duyệt phiếu yêu cầu
                </button>
                <button type="submit" class="btn btn-cancel btn-fill float-right" @click.prevent="updateTicket" style="margin-right: 10px;">
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
        totalAmount: 0
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
  };
  </script>
  
  <style scoped>
  .total-amount-input {
    color: white;
    border: none;
    padding: 8px 12px;
    border-radius: 4px;
    font-size: 16px;
    width: 150px;
    text-align: center !important;
  }
  
  .total-amount-input:focus {
    box-shadow: 0 0 5px rgba(255, 255, 255, 0.5);
  }
  </style>