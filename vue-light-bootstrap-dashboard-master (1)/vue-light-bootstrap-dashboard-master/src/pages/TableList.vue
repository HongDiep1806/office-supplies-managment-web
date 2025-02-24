<template>
  <div class="content">
    <div class="container-fluid">
      <div class="row">
        <div class="col-12">
          <card class="strpied-tabled-with-hover" body-classes="table-full-width table-responsive">
            <template slot="header">
              <div style="display: flex; justify-content: space-between;padding: 0px 15px;">
                <div>
                  <h4 class="card-title">Danh mục Văn phòng phẩm</h4>
                  <p class="card-category">Danh sách mã sản phẩm</p>
                </div>
                <div>
                  <button v-if="userRole === 'Finance Management Employee'" class="btn btn-info btn-fill float-right"
                    @click="navigateToCreateProduct()">Tạo mới</button>
                </div>
              </div>
            </template>

            <l-table class="table-hover table-striped" :columns="table1.columns" :data="table1.data"
              :apiURL="'https://localhost:7162/Product'" :domain="'product'"
              :displayActions="userRole == 'Finance Management Employee'">
            </l-table>
          </card>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import LTable from 'src/components/Table.vue'
import Card from 'src/components/Cards/Card.vue'
import axios from 'axios'
import jwtDecode from 'jwt-decode'

const tableColumns = ['STT', 'Tên sản phẩm', 'Mã sản phẩm', 'Đơn vị', 'Giá']

export default {
  components: {
    LTable,
    Card
  },
  data() {
    return {
      table1: {
        columns: [...tableColumns],
        data: []
      },
      table2: {
        columns: [...tableColumns],
        data: []
      },
      userRole: ''
    }
  },
  methods: {
    fetchProductData() {
      const token = localStorage.getItem('authToken'); // Lấy token từ localStorage

      axios.get('https://localhost:7162/Product', {
        headers: {
          Authorization: `Bearer ${token}` // Đính kèm token vào header
        }
      })
        .then(response => {
          this.table1.data = response.data
          .sort((a, b) => new Date(b.productID) - new Date(a.productID))
          .map((item, index) => ({
            productID: item.productID, // Include it in the object
            // STT: index + 1,
            'Tên sản phẩm': item.name,
            'Mã sản phẩm': item.code,
            'Đơn vị': item.unitCurrency,
            'Giá': new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.unitPrice)
          }));
          console.log(this.table1.data);
        })
        .catch(error => {
          console.error('Error fetching data:', error);
        });

      const decodeToken = jwtDecode(token);
      this.userRole = decodeToken.Role;
    }

    ,
    navigateToCreateProduct() {
      this.$router.push('/admin/createproduct');
    },
  },
  mounted() {
    this.fetchProductData()
  },

}
</script>

<style>
@media (max-width: 768px) {
  .btn-responsive {
    width: 100%;
    display: block;
    text-align: center;
  }
}
</style>
