<template>
    <card>
      <h4 slot="header" class="card-title">Tạo phiếu tổng hợp</h4>
      <form>
        <div class="row">
          <div class="col-md-4">
            <label for="createdBy">Người thực hiện</label>
            <base-input type="text" placeholder="Nhập người thực hiện" v-model="createdBy" readonly></base-input>
          </div>
          <div class="col-md-4">
            <label for="department">Phòng ban</label>
            <base-input type="text" placeholder="Nhập phòng ban" v-model="department" readonly></base-input>
          </div>
          <div class="col-md-4">
            <label for="createdDate">Ngày thực hiện</label>
            <base-input type="date" v-model="createdDate" readonly></base-input>
          </div>
        </div>
  
        <div class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th>STT</th>
                <th>Mã số Phiếu yêu cầu</th>
                <th>Người thực hiện</th>
                <th>Phòng ban</th>
                <th>Ngày thực hiện</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(request, index) in requests" :key="request.id">
                <td>{{ index + 1 }}</td>
                <td>{{ request.ticketNumber }}</td>
                <td>{{ request.createdBy }}</td>
                <td>{{ request.department }}</td>
                <td>{{ request.createdDate }}</td>
              </tr>
            </tbody>
          </table>
        </div>
  
        <div class="text-center position-relative">
          <div>
            <label for="totalAmount">Tổng cộng</label>
            <base-input type="text" placeholder="Tổng cộng" v-model="totalAmount" readonly></base-input>
          </div>
  
          <button type="submit" class="btn btn-info btn-fill float-right" @click.prevent="createSummary">
            Tạo phiếu tổng hợp
          </button>
        </div>
      </form>
    </card>
  </template>
  
  <script>
  export default {
    data() {
      return {
        createdBy: 'Người dùng hiện tại',
        department: 'Phòng ban hiện tại',
        createdDate: new Date().toISOString().slice(0, 10),
        requests: [],
        totalAmount: 0,
        requestIds: [],
      };
    },
    mounted() {
      this.requestIds = this.$route.params.requestIds.split(',');
      this.fetchRequests();
    },
    methods: {
      async fetchRequests() {
        try {
          const responses = await Promise.all(
            this.requestIds.map((id) => this.fetchRequestById(id))
          );
          this.requests = responses;
          this.calculateTotal();
        } catch (error) {
          console.error('Lỗi khi lấy dữ liệu request:', error);
        }
      },
      async fetchRequestById(id) {
        // Dữ liệu giả lập
        const fakeData = {
          1: {
            id: 1,
            ticketNumber: 'REQ-001',
            createdBy: 'Nguyễn Văn A',
            department: 'Phòng Kỹ thuật',
            createdDate: '2023-10-26',
            totalPrice: 500,
          },
          2: {
            id: 2,
            ticketNumber: 'REQ-002',
            createdBy: 'Trần Thị B',
            department: 'Phòng Kinh doanh',
            createdDate: '2023-10-27',
            totalPrice: 750,
          },
          3: {
            id: 3,
            ticketNumber: 'REQ-003',
            createdBy: 'Lê Văn C',
            department: 'Phòng Tài chính',
            createdDate: '2023-10-28',
            totalPrice: 1000,
          },
          4: {
            id: 4,
            ticketNumber: 'REQ-004',
            createdBy: 'Phạm Thị D',
            department: 'Phòng Nhân sự',
            createdDate: '2023-10-29',
            totalPrice: 1250,
          },
        };
  
        // Trả về dữ liệu giả lập dựa trên ID
        return fakeData[id] || {
          id: id,
          ticketNumber: `REQ-${id}`,
          createdBy: 'Người dùng ' + id,
          department: 'Phòng ' + id,
          createdDate: new Date().toISOString().slice(0, 10),
          totalPrice: Math.floor(Math.random() * 1000),
        };
      },
      calculateTotal() {
        this.totalAmount = this.requests.reduce(
          (total, request) => total + (request.totalPrice || 0),
          0
        );
      },
      createSummary() {
        console.log('Tạo phiếu tổng hợp với requestIds:', this.requestIds);
        console.log('Tổng tiền:', this.totalAmount);
      },
    },
  };
  </script>