<template>
  <div class="content">
    <div class="container-fluid">
      <div class="row">
        <div class="col-12">
          <card class="strpied-tabled-with-hover"
                body-classes="table-full-width table-responsive"
          >
            <template slot="header">
              <div style="display: flex; justify-content: space-between;padding: 0px 15px;">
                <div>
                  <h4 class="card-title">Danh mục Văn phòng phẩm</h4>
                  <p class="card-category">Danh sách mã sản phẩm</p>
                </div>
                <div>
                  <button style="border: none;border-radius: 5px;background-color: green; color: white; padding: 5px;box-shadow: 1px 1px 1px 1px lightgreen;">Thêm sản phẩm</button>
                </div>
              </div>
            </template>

            <l-table class="table-hover table-striped"
                     :columns="table1.columns"
                     :data="table1.data">
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

  const tableColumns = ['ID', 'Tên sản phẩm','Mã sản phẩm', 'Đơn vị', 'Giá']

  export default {
    components: {
      LTable,
      Card
    },
    data () {
      return {
        table1: {
          columns: [...tableColumns],
          data: [] 
        },
        table2: {
          columns: [...tableColumns],
          data: [] 
        }
      }
    },
    methods: {
      fetchProductData() {
        axios.get('https://localhost:7162/Product') // API URL
          .then(response => {
            this.table1.data = response.data
            console.log(response.data)
          })
          .catch(error => {
            console.error('Error fetching data:', error)
          })
      }
    },
    mounted() {
      this.fetchProductData()
    }
  }
</script>

<style>
</style>
