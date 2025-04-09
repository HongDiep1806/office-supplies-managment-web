<template>
  <div>
    <card>
      <div class="header-container">
        <h4 slot="header" class="card-title">Chi tiết phiếu yêu cầu</h4>
        <!-- Button moved to the top-right -->
        <button
          type="button"
          class="btn btn-primary btn-journey"
          @click="toggleJourneyModal"
        >
          Hành trình phiếu
        </button>
      </div>
      <form>
        <div class="row">
          <div class="col-md-2">
            <label for="createdBy">Người thực hiện</label>
            <base-input type="text" :value="userName" readonly></base-input>
          </div>
          <div class="col-md-2">
            <label for="department">Phòng ban</label>
            <base-input type="text" :value="userDepartment" readonly></base-input>
          </div>
          <div class="col-md-2">
            <label for="ticketNumber">Số phiếu</label>
            <base-input type="text" :value="ticketNumber" readonly></base-input>
          </div>
          <div class="col-md-2">
            <label for="createdDate">Ngày thực hiện</label>
            <base-input type="text" :value="requestDate" readonly></base-input>
          </div>
          <div class="col-md-2">
            <label for="requestStatus">Trạng thái</label>
            <base-input type="text" :value="requestStatus" readonly></base-input>
          </div>
          <div class="col-md-2" v-if="userRole === 'Finance Management Employee'">
            <label for="abnormalityTag">Bất thường</label>
            <div
              class="status-box"
              :class="{
                abnormal: isAbnormal && requestStatus !== 'QLTC từ chối',
                rejected: requestStatus === 'QLTC từ chối',
                normal: !isAbnormal && requestStatus !== 'QLTC từ chối',
              }"
            >
              <span v-if="requestStatus === 'QLTC từ chối'">
                Đã từ chối
              </span>
              <span v-else-if="abnormalityTag">
                {{ translateAbnormalityTag(abnormalityTag) }}
              </span>
              <span v-else>
                Bình thường
              </span>
            </div>
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

        <!-- Abnormality Description Section -->
        

        <div class="row" v-if="userRole !== 'Sup Leader'">
          <div class="col-md-12">
            <label for="noteDepLead">Ghi chú của Trưởng phòng</label>
            <textarea
              id="noteDepLead"
              class="form-control"
              v-model="noteDepLead"
              :readonly="!isNoteDepLeadEditable"
              rows="4"
            ></textarea>
          </div>
        </div>
        <div class="row" v-if="userRole !== 'Sup Leader'">
          <div class="col-md-12">
            <label for="noteSupLead">Ghi chú của Phòng QLTC</label>
            <textarea
              id="noteSupLead"
              class="form-control"
              v-model="noteSupLead"
              :readonly="!isNoteFinanceEditable"
              rows="4"
            ></textarea>
          </div>
        </div>
        <div v-if="isAbnormal && userRole == 'Finance Management Employee'" class="abnormality-description">
          <label for="abnormalityDescription" class="font-weight-bold">Chi tiết</label>
          <textarea
            id="abnormalityDescription"
            class="form-control"
            rows="3"
            readonly
            :value="abnormalityDescription"
          ></textarea>
        </div>
        <!-- Duyệt/KHÔNG Duyệt Buttons -->
        <div class="text-center position-relative">
          <div style="display: flex; flex-direction: row; justify-content: end;">
            <div>
              <label for="totalAmount">Tổng cộng</label>
              <p class="total-amount-input">{{ formattedTotalAmount }}</p>
            </div>
          </div>
          <button
            type="button"
            class="btn btn-info btn-fill float-right"
            @click="showModal('accept')"
            v-if="userRole == 'Dep Leader' && requestStatus === 'Trưởng phòng chưa duyệt' || requestStatus == 'QLTC chưa duyệt' && userRole == 'Finance Management Employee'"
          >
            Duyệt phiếu yêu cầu
          </button>
          <button
            type="button"
            class="btn btn-cancel btn-fill float-right"
            @click="showModal('reject')"
            style="margin-right: 10px;"
            v-if="userRole == 'Dep Leader' && requestStatus === 'Trưởng phòng chưa duyệt' || requestStatus == 'QLTC chưa duyệt' && userRole == 'Finance Management Employee'"
          >
            Không duyệt phiếu
          </button>
          <button type="submit" class="btn btn-cancel btn-fill float-right" @click.prevent="updateTicket"
            style="margin-right: 10px;" v-if="isNoteDepLeadEditable || isNoteFinanceEditable">
            Gửi ghi chú
          </button>
        </div>

        <!-- Green Block for Approved Status -->
        <!-- <div
          v-if="isApproved"
          class="alert alert-success text-center mt-4"
        >
          Phiếu yêu cầu đã được thông qua
        </div> -->
      </form>
    </card>

    <!-- Modal -->
    <div v-if="isModalVisible" class="modal-overlay">
      <div class="modal-content">
        <h4>{{ modalTitle }}</h4>
        <p>{{ modalMessage }}</p>
        <textarea
          v-model="modalNote"
          class="form-control"
          placeholder="Nhập ghi chú..."
          rows="4"
        ></textarea>
        <div class="modal-actions">
          <button class="btn btn-secondary cancel-btn" @click="closeModal">Hủy</button>
          <button class="btn btn-primary confirm-btn" @click="submitModalAction">Xác nhận</button>
        </div>
      </div>
    </div>

    <!-- Modal for Hành trình phiếu -->
    <div v-if="showJourneyModal" class="modal-overlay">
      <div class="modal-content">
        <h4 class="modal-title">Hành trình phiếu</h4>
        <button class="close-btn" @click="toggleJourneyModal">×</button>
        <div class="table-responsive mt-4">
          <table class="table table-bordered">
            <thead>
              <tr>
                <th>Hành động</th>
                <th>Người hành động</th>
                <th>Thời gian</th>
                <th>Ghi chú</th> <!-- New column for notes -->
              </tr>
            </thead>
            <tbody>
              <tr v-for="(action, index) in journeyData" :key="index">
                <td>{{ action.action }}</td>
                <td>{{ action.actor }}</td>
                <td>{{ action.time }}</td>
                <td>{{ action.note }}</td> <!-- Display the note -->
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
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
      userRole: localStorage.getItem('userRole'),
      requestStatus: '',
      token: localStorage.getItem('authToken'),
      isModalVisible: false,
      modalTitle: '',
      modalMessage: '',
      modalNote: '',
      modalAction: '',
      abnormalityTag: '', // Holds the abnormality tag text
      isAbnormal: false, // Indicates if the request is abnormal
      abnormalityDescription: '', // Holds the abnormality description
      showJourneyModal: false, // Controls visibility of the journey modal
      journeyData: [], // Data for the journey table
      isApproved: false, // Indicates if the request is approved
    };
  },
  async mounted() {
    this.token = localStorage.getItem('authToken');
    const requestId = this.$route.params.id;
    const request = await axios.get(`https://localhost:7162/Request/getbyid/${requestId}`, {headers: { Authorization: `Bearer ${this.token}` }});
    this.isDeleted = request.data.isDeleted; // Store the isDeleted value
  if (this.isDeleted) {
    //go to not found page in new tab 
    window.open('/admin/not-found', '_blank');
    //push back to request table if userrole dep leader, else request history
    if (this.userRole == 'Dep Leader') {
      this.$router.push('/admin/view-all-request');
    }
    
  }
    this.userID = request.data.userID;
    this.requestNumber = request.data.requestCode;
    this.ticketNumber = request.data.requestCode;
    this.requestDate = new Date(request.data.createdDate).toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).replace(',', '');
    this.totalAmount = request.data.totalPrice;
    this.noteDepLead = request.data.noteDepLead; // Fetch the note from the backend
    this.noteSupLead = request.data.noteSupLead; // Fetch the note from the backend
    const { isProcessedByDepLead, isApprovedByDepLead, isApprovedBySupLead } = request.data;
    const { isCollectedInSummary, isSummaryBeProcessed, isSummaryBeApproved} = request.data;
    if (!isProcessedByDepLead  && !isApprovedByDepLead && !isApprovedBySupLead ) {
      this.requestStatus = 'Trưởng phòng chưa duyệt';
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
        this.isApproved = true; // Set approved status
      }
      else if (isCollectedInSummary && isSummaryBeProcessed && !isSummaryBeApproved){
        this.requestStatus = 'QLTC từ chối';
      }
      else if (isCollectedInSummary && !isSummaryBeProcessed && !isSummaryBeApproved){
        this.requestStatus = 'Chờ duyệt';
      }
      else if (!isCollectedInSummary && !isSummaryBeProcessed && !isSummaryBeApproved){
        this.requestStatus = 'Chờ tổng hợp';
      }
      else {
        this.requestStatus = 'Không xác định';
      }
    }
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

    try {
      // Fetch abnormality status
      
      const abnormalityResponse = await axios.get(`http://localhost:5000/check_request_abnormality?request_id=${requestId}`);
      if (abnormalityResponse.data.IsAbnormal) {
        const descriptions = abnormalityResponse.data.Descriptions;
        this.abnormalityDescription = descriptions.join('\n'); // Combine descriptions into a single string
        this.isAbnormal = true;
        this.abnormalityTag = abnormalityResponse.data.AbnormalTypes.join(', '); // Set the abnormality tag
      } else {
        this.abnormalityDescription = 'Không có bất thường';
        this.isAbnormal = false;
        this.abnormalityTag = 'Bình thường'; // Set to "Bình thường" if no abnormalities
      }
      // if (this.requestStatus == 'QLTC từ chối'){
      //   this.abnormalityTag = 'Đã từ chối';
      //   this.isAbnormal = false;
      //   this.abnormalityDescription = ''; // Clear abnormality description
      // }
      if (this.requestStatus === 'QLTC từ chối') {
      this.abnormalityTag = 'Đã từ chối';
      this.isAbnormal = true; // Mark as abnormal
    }
      
    } catch (error) {
      console.error('Error fetching abnormality status:', error);
      this.abnormalityDescription = 'Không xác định';
      this.isAbnormal = false;
      this.abnormalityTag = 'Không xác định'; // Handle error case
    }

    // try {
    //   // Fetch journey data
    //   const journeyResponse = await axios.get(`https://localhost:7162/Request/journey/${requestId}`, {
    //     headers: { Authorization: `Bearer ${this.token}` },
    //   });
    //   this.journeyData = journeyResponse.data.map((item) => ({
    //     action: item.action,
    //     actor: item.actor,
    //     time: new Date(item.time).toLocaleString('vi-VN', {
    //       year: 'numeric',
    //       month: '2-digit',
    //       day: '2-digit',
    //       hour: '2-digit',
    //       minute: '2-digit',
    //     }).replace(',', ''),
    //   }));
    // } catch (error) {
    //   console.error('Error fetching journey data:', error);
    // }
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
    async retrainModels() {
      try {
        const response = await axios.post('http://localhost:5000/retrain_anomaly_models');
        console.log('Retrain success:', response.data.message);
      } catch (error) {
        console.error('Retrain failed:', error);
      }
    },
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
        const currentDateTime = new Date().toISOString(); // Use ISO format for consistency

        // Set the note to "Chấp thuận" with the current date and time
        const actionNote = `Chấp thuận - ${new Date().toLocaleString('vi-VN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        }).replace(',', '')}`;
        const fullNote = `${this.modalNote.trim()} (${actionNote})`;

        const payload = {
          noteDepLead: this.noteDepLead,
          noteSupLead: this.noteSupLead,
          dateDepLeadApprove: this.userRole === 'Dep Leader' ? currentDateTime : null,
          dateSupLeadApprove: this.userRole === 'Finance Management Employee' ? currentDateTime : null,
        };

        if (this.userRole === 'Dep Leader') {
          this.noteDepLead = fullNote; // Update the note for Dep Leader
          await axios.put(
            `https://localhost:7162/Request/approveByDepLeader/${requestId}?note=${encodeURIComponent(this.noteDepLead)}`,
            payload,
            { headers: { Authorization: `Bearer ${this.token}` } }
          );
          // Call retrain model
          await this.retrainModels();
        } else if (this.userRole === 'Finance Management Employee') {
          this.noteSupLead = fullNote; // Update the note for Finance Management Employee
          await axios.put(
            `https://localhost:7162/Request/approveRequestByFinEmployee/${requestId}?note=${encodeURIComponent(this.noteSupLead)}`,
            payload,
            { headers: { Authorization: `Bearer ${this.token}` } }
          );
        }

        this.notifySuccess('bottom', 'right');
        this.sendNotifications('approve');
        this.$router.push('/admin/view-all-request');
      } catch (error) {
        console.error('Lỗi khi cập nhật phiếu yêu cầu:', error);
        this.notifyError('bottom', 'right');
      }
    },
    async updateTicket() {
      try {
        const requestId = this.$route.params.id;
        const currentDateTime = new Date().toISOString(); // Use ISO format for consistency

        // Set the note to "Từ chối" with the current date and time
        const actionNote = `Từ chối - ${new Date().toLocaleString('vi-VN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        }).replace(',', '')}`;
        const fullNote = `${this.modalNote.trim()} (${actionNote})`;

        const payload = {
          noteDepLead: this.noteDepLead,
          noteSupLead: this.noteSupLead,
          dateDepLeadApprove: this.userRole === 'Dep Leader' ? currentDateTime : null,
          dateSupLeadApprove: this.userRole === 'Finance Management Employee' ? currentDateTime : null,
        };

        if (this.userRole === 'Dep Leader') {
          this.noteDepLead = fullNote; // Update the note for Dep Leader
          await axios.put(
            `https://localhost:7162/Request/notapproveByDepLeader/${requestId}?note=${encodeURIComponent(this.noteDepLead)}`,
            payload,
            { headers: { Authorization: `Bearer ${this.token}` } }
          );
        } else if (this.userRole === 'Finance Management Employee') {
          this.noteSupLead = fullNote; // Update the note for Finance Management Employee
          await axios.put(
            `https://localhost:7162/Request/notapproveByFinEmployee/${requestId}?note=${encodeURIComponent(this.noteSupLead)}`,
            payload,
            { headers: { Authorization: `Bearer ${this.token}` } }
          );
        }

        this.notifySuccess('bottom', 'right');
        this.sendNotifications('not approve');
        this.$router.push('/admin/view-all-request');
      } catch (error) {
        console.error('Lỗi khi cập nhật phiếu yêu cầu:', error);
        this.notifyError('bottom', 'right');
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
        const action_viet = action === 'approve' ? 'được chấp thuận' : 'bị từ chối';
        if (this.userRole === 'Dep Leader') {
          if (action === 'approve') {
            const financeUsersResponse = await axios.get(`https://localhost:7162/User/users-by-type-id?userTypeID=4`, {
              headers: { Authorization: `Bearer ${this.token}` },
            });
            const financeUsers = financeUsersResponse.data;
            financeUsers.forEach((leader) => {
              notifications.push({
                userID: leader.userID,
                message: `Phiếu yêu cầu ${requestCode} đã ${action_viet} bởi trưởng phòng.`,
                requestID: requestId,
                sender: this.userID,
              });
            });

            notifications.push({
              userID: userID,
              message: `Phiếu yêu cầu ${requestCode} đã ${action_viet} bởi trưởng phòng.`,
              requestID: requestId,
              sender: this.userID,
            });
          } else {
            notifications.push({
              userID: userID,
              message: `Phiếu yêu cầu ${requestCode} đã ${action_viet} bởi trưởng phòng.`,
              requestID: requestId,
              sender: this.userID,
            });
          }
        } else if (this.userRole === 'Finance Management Employee') {
          notifications.push({
            userID: userID,
            message: `Phiếu yêu cầu ${requestCode} đã ${action_viet} bởi P.QLTC.`,
            requestID: requestId,
            sender: this.userID,
          });

          if (departmentLeader) {
            notifications.push({
              userID: departmentLeader.userID,
              message: `Phiếu yêu cầu ${requestCode} đã ${action_viet} bởi P.QLTC.`,
              requestID: requestId,
              sender: this.userID,
            });
          }
        }

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
    },
    showModal(action) {
      this.isModalVisible = true;
      this.modalAction = action;
      this.modalTitle = action === 'accept' ? 'Xác nhận duyệt phiếu yêu cầu' : 'Xác nhận không duyệt phiếu yêu cầu';
      this.modalMessage = action === 'accept' ? 'Bạn có chắc chắn muốn duyệt phiếu yêu cầu này?' : 'Bạn có chắc chắn không muốn duyệt phiếu yêu cầu này?';
    },
    closeModal() {
      this.isModalVisible = false;
      this.modalNote = '';
    },
    async submitModalAction() {
      if (this.modalAction === 'accept') {
        await this.approveTicket();
      } else if (this.modalAction === 'reject') {
        await this.updateTicket();
      }
      this.closeModal();
    },
    toggleJourneyModal() {
      this.showJourneyModal = !this.showJourneyModal;
      if (this.showJourneyModal) {
        this.fetchJourneyData();
      }
    },
    async fetchJourneyData() {
      try {
        const requestId = this.$route.params.id;
        const requestResponse = await axios.get(
          `https://localhost:7162/Request/getbyid/${requestId}`,
          { headers: { Authorization: `Bearer ${this.token}` } }
        );

        const request = requestResponse.data;
        const journey = [];

        // Add "Created by" action
        const userResponse = await axios.get(
          `https://localhost:7162/User/getbyid/${request.userID}`,
          { headers: { Authorization: `Bearer ${this.token}` } }
        );
        const creatorName = userResponse.data.fullName;
        journey.push({
          action: 'Đã tạo bởi',
          actor: creatorName,
          time: new Date(request.createdDate).toLocaleString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }),
        });

        // Fetch department leader's name
        const departmentLeaderResponse = await axios.get(
          `https://localhost:7162/User/department-leader?department=${userResponse.data.department}`,
          { headers: { Authorization: `Bearer ${this.token}` } }
        );
        const departmentLeaderName = departmentLeaderResponse.data.fullName;

        // Add Dep Leader action
        if (request.isProcessedByDepLead) {
          journey.push({
            action: request.isApprovedByDepLead
              ? `Trường phòng đã duyệt`
              : `Trường phòng từ chối`,
            actor: departmentLeaderName,
            time: new Date(request.dateDepLeadApprove).toLocaleString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }),
            note: request.noteDepLead || 'Không có ghi chú', // Include Dep Leader's note
          });
        }

        // Add Sup Leader action (including rejection case)
        if (request.isProcessedByDepLead && request.isApprovedByDepLead && request.isApprovedBySupLead) {
          journey.push({
            action: 'QLTC đã duyệt',
            actor: 'QLTC',
            time: new Date(request.dateSupLeadApprove).toLocaleString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }),
            note: request.noteSupLead || 'Không có ghi chú', 
          });
        }
        if (!request.isProcessedByDepLead && request.isApprovedByDepLead && !request.isApprovedBySupLead) {
          journey.push({
            action: request.isApprovedByDepLead
              ? `Trường phòng đã duyệt`
              : `Trường phòng từ chối`,
            actor: departmentLeaderName,
            time: new Date(request.dateDepLeadApprove).toLocaleString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }),
            note: request.noteDepLead || 'Không có ghi chú', // Include Dep Leader's note
          });
          journey.push({
            action: 'QLTC từ chối',
            actor: 'QLTC',
            time: new Date(request.dateSupLeadApprove).toLocaleString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }),
            note: request.noteSupLead || 'Không có ghi chú', 
          });
        }

        // Add Summary action if applicable
        if (request.isCollectedInSummary && request.summaryID) {
          const summaryResponse = await axios.get(
            `https://localhost:7162/Summary/${request.summaryID}`,
            { headers: { Authorization: `Bearer ${this.token}` } }
          );
          const summary = summaryResponse.data;
          journey.push({
              action: 'Đã tổng hợp trong phiếu mã số ' + summary.summaryCode,
              actor: 'QLTC',
              time: new Date(summary.createdDate).toLocaleString('vi-VN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
              }),
              note: summary.note || 'Không có ghi chú', // Include the note in the journey data
            });
          if (summary.isProcessedBySupLead) {
            console.log('Summary approved by Sup Lead:', summary.isApprovedBySupLead);
            journey.push({
              action: summary.isApprovedBySupLead
                ? 'QLTC đã duyệt phiếu tổng hợp'
                : 'QLTC từ chối phiếu tổng hợp',
              actor: 'QLTC',
              time: new Date(summary.updateDate).toLocaleString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }),
              note: summary.note || 'Không có ghi chú', // Include the note in the journey data
            });
          }
        }

        this.journeyData = journey;
      } catch (error) {
        console.error('Error fetching journey data:', error);
      }
    },
    formatDateToUTC7(dateString) {
      // Parse the date string into a Date object
      const date = new Date(dateString);

      // Adjust the date to UTC+7 manually
      const utcOffset = 7 * 60 * 60 * 1000; // UTC+7 in milliseconds
      const adjustedDate = new Date(date.getTime() + utcOffset);

      // Format the adjusted date
      return adjustedDate.toLocaleString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    },
    translateAbnormalityTag(tag) {
      const translations = {
        TotalPrice: 'Giá',
        Quantity: 'Số lượng',
      };

      // Split tags by comma, translate each, and join them back
      return tag
        .split(',')
        .map((t) => translations[t.trim()] || t.trim())
        .join(', ');
    },
  },
};
</script>

<style scoped>
.header-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.btn-journey {
  position: absolute;
  top: 6px;
  right: 6px;
  padding: 6px 13px; /* Reduced padding by 20% */
  font-size: 0.8rem; /* Reduced font size by 20% */
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  width: 600px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: relative;
}

.modal-title {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 20px;
}

.close-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
}

.table-responsive {
  margin-top: 20px;
}

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

.status-box {
  display: flex;
  align-items: center; /* Vertically center the text */
  justify-content: center; /* Horizontally center the text */
  height: 38px; /* Match the height of the input boxes */
  border: 1px solid #ccc; /* Match the border style of the input boxes */
  border-radius: 4px; /* Match the border radius of the input boxes */
  font-size: 14px; /* Match the font size of the input boxes */
  color: #fff; /* White text */
  padding: 0 12px; /* Add padding for consistent spacing */
  box-sizing: border-box; /* Ensure padding doesn't affect size */
  width: 100%; /* Ensure it takes the full width of the column */
}

.status-box.abnormal {
  background-color: #fd7e14; /* Red background for abnormal */
}

.status-box.rejected {
  background-color: #dc3545; /* Orange background for rejected */
}

.status-box.normal {
  background-color: #28a745; /* Green background for normal */
}

.alert-success {
  font-weight: bold;
  font-size: 1.2rem;
}

.btn-primary {
  padding: 10px 20px;
  font-size: 1rem;
}

.abnormality-description {
  margin-top: 20px;
  margin-bottom: 20px; /* Add spacing between description and buttons */
  width: 100%; /* Full width of the card */
}

.abnormality-description label {
  margin-bottom: 8px;
  display: block;
  font-size: 1rem;
  font-weight: bold;
}

.abnormality-description .form-control {
  width: 100%; /* Ensure the text box spans the full width */
  resize: none; /* Disable resizing */
  background-color: #f8f9fa; /* Light background for readability */
  border: 1px solid #ced4da; /* Match the border style */
  font-size: 1rem; /* Match the font size */
  color: #495057; /* Text color */
  cursor: text; /* Change cursor to text selection (I icon) */
}

textarea.form-control {
  width: 100%; /* Full width */
  resize: none; /* Disable resizing */
  background-color: #f8f9fa; /* Light background for readability */
  border: 1px solid #ced4da; /* Match the border style */
  font-size: 1rem; /* Match the font size */
  color: #495057; /* Text color */
  padding: 8px 12px; /* Add padding for better spacing */
  border-radius: 4px; /* Match the border radius */
  box-sizing: border-box; /* Ensure padding doesn't affect size */
}

.modal-content .table {
  width: 100%;
  border-collapse: collapse; /* Ensure borders are collapsed */
  border: 1px solid #dee2e6; /* Add a border to the table */
}

.modal-content .table th,
.modal-content .table td {
  border: 1px solid #dee2e6; /* Add borders to table cells */
  padding: 8px;
  text-align: left;
}

.modal-content .table th {
  background-color: #f8f9fa; /* Light background for the header */
  font-weight: bold;
  text-transform: uppercase;
}
</style>