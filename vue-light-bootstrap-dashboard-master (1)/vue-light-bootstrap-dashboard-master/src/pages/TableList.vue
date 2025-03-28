<template>
  <div class="content">
    <div class="container-fluid">
      <div class="row">
        <div class="col-12">
          <card class="strpied-tabled-with-hover" body-classes="table-full-width table-responsive">
            <template slot="header">
              <div style="display: flex; justify-content: space-between; padding: 0px 15px;">
                <div>
                  <h4 class="card-title">Danh mục Văn phòng phẩm</h4>
                  <p class="card-category">Danh sách mã sản phẩm</p>
                </div>
                <div>
                  <button v-if="userRole === 'Finance Management Employee'" class="btn btn-info btn-fill float-right"
                    @click="navigateToCreateProduct()">Tạo mới</button>
                </div>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 0px 15px; margin-top: 10px;">
                <div class="search-filters d-flex flex-wrap align-items-center gap-3 p-3 bg-light rounded shadow-sm">
  <div class="form-group mb-0">
    <label class="form-label">Tên sản phẩm</label>
    <input v-model="searchName" class="form-control" placeholder="Nhập tên sản phẩm" />
  </div>
  <div class="form-group mb-0">
    <label class="form-label">Mã sản phẩm</label>
    <input v-model="searchCode" class="form-control" placeholder="Nhập mã sản phẩm" />
  </div>
  <div class="form-group mb-0">
    <label class="form-label">Giá tối thiểu</label>
    <input v-model="minPrice" type="number" class="form-control" placeholder="Tối thiểu" />
  </div>
  <div class="form-group mb-0">
    <label class="form-label">Giá tối đa</label>
    <input v-model="maxPrice" type="number" class="form-control" placeholder="Tối đa" />
  </div>
  <button class="btn btn-primary mt-3 btn-search" @click="searchProduct">
    <i class="fa fa-search"></i> Tìm kiếm
  </button>
</div>
                
              </div>
            </template>

            <l-table class="table-hover table-striped" :columns="table1.columns" :data="filteredData"
              :apiURL="'https://localhost:7162/Product'" :domain="'product'"
              :displayActions="userRole === 'Finance Management Employee'" :canEdit="true" :canDelete="true">
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

const tableColumns = ['STT', 'Tên sản phẩm', 'Mã sản phẩm', 'Đơn vị', 'Giá', 'Sửa đổi lần cuối']

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
      userRole: '',
      token: localStorage.getItem('authToken'),
      searchName: '',
      searchCode: '',
      minPrice: '',
      maxPrice: '',
      searchQuery: ''
    }
  },
  computed: {
    filteredData() {
      if (this.searchQuery) {
        return this.table1.data.filter(item => item['Tên sản phẩm'].toLowerCase().includes(this.searchQuery.toLowerCase()));
      }
      return this.table1.data;
    }
  },
  methods: {
    fetchProductData() {
      const token = localStorage.getItem('authToken'); // Lấy token từ localStorage

      axios.get('https://localhost:7162/Product', {
        headers: {
          Authorization: `Bearer ${this.token}` // Đính kèm token vào header
        }
      })
        .then(response => {
          this.table1.data = response.data
          .sort((a, b) => new Date(b.productID) - new Date(a.productID))
          .map((item, index) => ({
            productID: item.productID, // Include it in the object
            'Tên sản phẩm': item.name,
            'Mã sản phẩm': item.code,
            'Đơn vị': item.unitCurrency,
            'Giá': new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.unitPrice),
            'Last Adjusted': new Date(item.adjustDate).toLocaleString()
          }));
          //console.log(this.table1.data);
        })
        .catch(error => {
          console.error('Error fetching data:', error);
        });

      const decodeToken = jwtDecode(token);
      this.userRole = decodeToken.Role;
    },
    navigateToCreateProduct() {
      this.$router.push('/admin/createproduct');
    },
    async searchProduct() {
      try {
        const response = await axios.get('https://localhost:7162/Product/search', {
          params: {
            name: this.searchName,
            code: this.searchCode,
            minPrice: this.minPrice,
            maxPrice: this.maxPrice
          },
          headers: {
            Authorization: `Bearer ${this.token}`
          }
        });
        this.table1.data = response.data.map((item, index) => ({
          productID: item.productID,
          'Tên sản phẩm': item.name,
          'Mã sản phẩm': item.code,
          'Đơn vị': item.unitCurrency,
          'Giá': new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.unitPrice),
          'Last Adjusted': new Date(item.adjustDate).toLocaleString()
        }));
      } catch (error) {
        console.error('Error searching products:', error);
      }
    }
  },
  mounted() {
    this.fetchProductData()
  },
}
</script>

<style scoped>
.search-filters {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 15px; /* Adds spacing between filter items */
  padding: 15px;
  background-color: #f8f9fa; /* Light background for better contrast */
  border-radius: 8px; /* Rounded corners */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* Subtle shadow for a modern look */
}

.search-filters .form-group {
  flex: 1; /* Ensures all inputs take equal space */
  min-width: 200px; /* Prevents inputs from becoming too small */
}

.search-filters .form-label {
  font-weight: bold;
  font-size: 0.9rem;
  margin-bottom: 5px;
  display: block;
}

.search-filters .form-control {
  border-radius: 5px;
  border: 1px solid #ced4da;
  padding: 8px 12px;
}

.btn-search {
  white-space: nowrap; /* Prevents text wrapping */
  padding: 10px 20px;
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: 5px; /* Adds spacing between the icon and text */
}
</style>

<style>
@media (max-width: 768px) {
  .btn-responsive {
    width: 100%;
    display: block;
    text-align: center;
  }
}
</style>