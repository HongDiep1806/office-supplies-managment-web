<template>
  <card>
    <div class="header-container">
      <h4 slot="header" class="card-title">Chi tiết phiếu yêu cầu</h4>
      <div class="status-box">{{ requestStatus }}</div>
    </div>
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

      <div class="row" v-if="userRole !== 'Sup Leader'">
        <div class="col-md-12">
          <label for="noteDepLead">Ghi chú của trưởng phòng</label>
          <base-input type="text" v-model="noteDepLead" :readonly="!isNoteDepLeadEditable"></base-input>
        </div>
      </div>
      <div class="row" v-if="userRole !== 'Sup Leader'">
        <div class="col-md-12">
          <label for="noteSupLead">Ghi chú của Phòng QLTC</label>
          <base-input type="text" v-model="noteSupLead" :readonly="!isNoteFinanceEditable"></base-input>
        </div>
      </div>

      <div class="text-center position-relative">
        <div style="display: flex; flex-direction: row; justify-content: end;">
          <div>
            <label for="totalAmount">Tổng cộng</label>
            <p class="total-amount-input">{{ formattedTotalAmount }}</p>
          </div>
        </div>
        <button type="submit" class="btn btn-info btn-fill float-right" @click.prevent="approveTicket" v-if="userRole == 'Dep Leader' && requestStatus === 'Dep chưa duyệt' || requestStatus == 'QLTC chưa duyệt' && userRole == 'Finance Management Employee'">
          Duyệt phiếu yêu cầu
        </button>
        <button type="submit" class="btn btn-cancel btn-fill float-right" @click.prevent="enableNoteEditing"
          style="margin-right: 10px;" v-if="userRole == 'Dep Leader' && requestStatus === 'Dep chưa duyệt' || requestStatus == 'QLTC chưa duyệt' && userRole == 'Finance Management Employee'">
          Không duyệt phiếu
        </button>
        <button type="submit" class="btn btn-cancel btn-fill float-right" @click.prevent="updateTicket"
          style="margin-right: 10px;" v-if="isNoteDepLeadEditable || isNoteFinanceEditable">
          Gửi ghi chú
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
      noteDepLead: '',
      noteSupLead: '',
      isNoteDepLeadEditable: false,
      isNoteFinanceEditable: false,
      type: ['success', 'danger', 'warning'],
      userRole: '',
      requestStatus: '',  
      token: localStorage.getItem('authToken')
    };
  },
  async mounted() {
    this.token = localStorage.getItem('authToken');
    const requestId = this.$route.params.id;
    const request = await axios.get(`https://localhost:7162/Request/getbyid/${requestId}`, {headers: { Authorization: `Bearer ${this.token}` }});
    this.userID = request.data.userID;
    this.requestNumber = request.data.requestCode;
    this.ticketNumber = request.data.requestCode;
    this.requestDate = request.data.createdDate.substr(0, 10);
    this.totalAmount = request.data.totalPrice;
    this.noteDepLead = request.data.noteDepLead; // Fetch the note from the backend
    this.noteSupLead = request.data.noteSupLead; // Fetch the note from the backend
    //console.log IsProcessedByDepLead, IsApprovedByDepLead, IsApprovedBySupLead
    //console.log(request.data.isProcessedByDepLead)
    const { isProcessedByDepLead, isApprovedByDepLead, isApprovedBySupLead } = request.data;
    const { isCollectedInSummary, isSummaryBeProcessed, isSummaryBeApproved} = request.data;
    if (!isProcessedByDepLead  && !isApprovedByDepLead && !isApprovedBySupLead ) {
      this.requestStatus = 'Dep chưa duyệt';
    } else if (isProcessedByDepLead && !isApprovedByDepLead  && !isApprovedBySupLead) {
      this.requestStatus = 'Dep từ chối';
    } else if (isProcessedByDepLead && isApprovedByDepLead  && !isApprovedBySupLead) {
      this.requestStatus = 'QLTC chưa duyệt';
    } else if (!isProcessedByDepLead && isApprovedByDepLead  && !isApprovedBySupLead) {
      this.requestStatus = 'QLTC từ chối';
    }
    else {
      if (isCollectedInSummary && isSummaryBeProcessed && isSummaryBeApproved){
        this.requestStatus = 'Đã duyệt';
      }
      else if (isCollectedInSummary && isSummaryBeProcessed && !isSummaryBeApproved){
        this.requestStatus = 'QLTC từ chối';
      }
      else if (isCollectedInSummary && isSummaryBeProcessed && !isSummaryBeApproved){
        this.requestStatus = 'Chờ duyệt';
      }
      else if (!isCollectedInSummary && isSummaryBeProcessed && !isSummaryBeApproved){
        this.requestStatus = 'Chờ tổng hợp';
      }
      else {
        this.requestStatus = 'Không xác định';
      }
    }
    //console.log(this.requestStatus);
    try {
      this.userRole = localStorage.getItem('userRole');
      const response = await axios.get('https://localhost:7162/Product/allproductsincludedeleted', {
        headers: {
          Authorization: `Bearer ${this.token}`,
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
      const user = await axios.get(`https://localhost:7162/User/getbyid/${this.userID}`, {headers: { Authorization: `Bearer ${this.token}` }});
      this.userDepartment = user.data.department;
      this.userName = user.data.fullName;
    } catch (error) {
      console.error('Lỗi khi lấy thông tin người dùng:', error);
    }
  },
  computed: {
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
        const requestId = this.$route.params.id;
        const payload = { noteDepLead: this.noteDepLead, noteSupLead: this.noteSupLead };
        if (this.userRole === 'Dep Leader') {
          const response = await axios.put(`https://localhost:7162/Request/approveByDepLeader/${requestId}`, payload, {
            headers: {
              Authorization: `Bearer ${this.token}`,
            },
          });
          //console.log("thành công" + response.data);
          this.notifySuccess('top', 'right');
          this.sendNotifications('approve');
          this.$router.push('/admin/view-all-request');
        } else if (this.userRole === 'Finance Management Employee') {
          const response = await axios.put(`https://localhost:7162/Request/approveRequestByFinEmployee/${requestId}`, payload, {
            headers: {
              Authorization: `Bearer ${this.token}`,
            },
          });
          //console.log("thành công" + response.data);
          this.notifySuccess('top', 'right');
          this.sendNotifications('approve');
          this.$router.push('/admin/view-all-request');
        }
      } catch (error) {
        console.error('Lỗi khi cập nhật phiếu yêu cầu:', error);
        this.notifyError('top', 'right');
      }
    },
    async updateTicket() {
      try {
        const requestId = this.$route.params.id;
         // Use the noteDepLead for the note
        if (this.userRole === 'Dep Leader') {
          const note = this.noteDepLead;
          const response = await axios.put(`https://localhost:7162/Request/notapproveByDepLeader/${requestId}?note=${encodeURIComponent(note)}`, null, {
            headers: {
              Authorization: `Bearer ${this.token}` },
          });
          //console.log("Không duyệt thành công" + response.data);
          this.notifySuccess('top', 'right');
          this.sendNotifications('not approve');
          this.$router.push('/admin/view-all-request');
        } else if (this.userRole === 'Finance Management Employee') {
          const note = this.noteSupLead;
          const response = await axios.put(`https://localhost:7162/Request/notapproveByFinEmployee/${requestId}?note=${encodeURIComponent(note)}`, null, {
            headers: {
              Authorization: `Bearer ${this.token}` },
          });
          //console.log("Không duyệt thành công" + response.data);
          this.notifySuccess('top', 'right');
          this.sendNotifications('not approve');
          this.$router.push('/admin/view-all-request');
        }
      } catch (error) {
        console.error('Lỗi khi cập nhật phiếu yêu cầu:', error);
        this.notifyError('top', 'right');
      }
    },
    async sendNotifications(action) {
      try {
        const requestId = this.$route.params.id;
        const request = await axios.get(`https://localhost:7162/Request/getbyid/${requestId}`, {
          headers: { Authorization: `Bearer ${this.token}` },
        });
        const userID = request.data.userID;
        const user = await axios.get(`https://localhost:7162/User/getbyid/${userID}`, {
          headers: { Authorization: `Bearer ${this.token}` },
        });
        const department = user.data.department;
        const departmentLeaderResponse = await axios.get(`https://localhost:7162/User/department-leader?department=${department}`, {
          headers: { Authorization: `Bearer ${this.token}` },
        });
        const departmentLeader = departmentLeaderResponse.data;
        const requestCode = request.data.requestCode;
        const notifications = [];

        if (this.userRole === 'Dep Leader') {
          if (action === 'approve') {
            // Send notification to all users with userTypeID 4
            const financeUsersResponse = await axios.get(`https://localhost:7162/User/users-by-type-id?userTypeID=4`, {
              headers: { Authorization: `Bearer ${this.token}` },
            });
            const financeUsers = financeUsersResponse.data;
            financeUsers.forEach((leader) => {
              notifications.push({
                userID: leader.userID,
                message: `Request ${requestCode} has been ${action} by department leader.`,
                requestID: requestId,
                sender: this.userID,
              });
            });

            // Send notification to the user who created the request
            notifications.push({
              userID: userID,
              message: `Your request ${requestCode} has been ${action} by department leader.`,
              requestID: requestId,
              sender: this.userID,
            });
          } else {
            // Send notification to the user who created the request
            notifications.push({
              userID: userID,
              message: `Your request ${requestCode} has been ${action} by department leader.`,
              requestID: requestId,
              sender: this.userID,
            });
          }
        } else if (this.userRole === 'Finance Management Employee') {
          // Send notification to the user who created the request
          notifications.push({
            userID: userID,
            message: `Your request ${requestCode} has been ${action} by finance management employee.`,
            requestID: requestId,
            sender: this.userID,
          });

          // Send notification to the department leader
          if (departmentLeader) {
            notifications.push({
              userID: departmentLeader.userID,
              message: `Request ${requestCode} has been ${action} by finance management employee.`,
              requestID: requestId,
              sender: this.userID,
            });
          }
        }

        // Send each notification individually
        for (const notification of notifications) {
          await axios.post('https://localhost:7162/Notification', notification, {
            headers: { Authorization: `Bearer ${this.token}` },
          });
        }
      } catch (error) {
        console.error('Error sending notifications:', error);
      }
    },
    enableNoteEditing() {
      if (this.userRole == 'Dep Leader') {
        this.isNoteDepLeadEditable = true;
      }
      else if (this.userRole == 'Finance Management Employee') {
        this.isNoteFinanceEditable = true;
      }
    }
  },
};
</script>


<style scoped>
.total-amount-input {
  .header-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.status-box {
  background-color: #f5f5f5;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 8px 12px;
  font-size: 16px;
  color: #888888;
}

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