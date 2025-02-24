<template>
  <card>
      <h4 slot="header" class="card-title">Chỉnh sửa sản phẩm</h4>
      <form>
          <div class="row">
              <div class="col-md-6">
                  <label for="productname">Tên sản phẩm</label>
                  <base-input 
                      type="text" 
                      placeholder="Nhập tên sản phẩm" 
                      name="productname" 
                      id="productname"
                      v-model="product.Name">
                  </base-input>
              </div>
              <div class="col-md-6">
                  <label for="productcode">Mã sản phẩm</label>
                  <base-input 
                      type="text" 
                      name="productcode" 
                      id="productcode" 
                      placeholder="Nhập mã sản phẩm"
                      v-model="product.Code">
                  </base-input>
              </div>
          </div>

          <div class="row">
              <div class="col-md-6">
                  <label for="productcurrency">Đơn vị tính</label>
                  <select class="form-control" v-model="product.UnitCurrency">
                      <option value="" disabled>Chọn đơn vị tính</option>
                      <option v-for="currency in unitCurrencies" :key="currency" :value="currency">
                          {{ currency }}
                      </option>
                  </select>
              </div>
              <div class="col-md-6">
                  <label for="productprice">Đơn giá</label>
                  <BaseInput 
                      type="number" 
                      placeholder="Nhập đơn giá" 
                      name="productprice" 
                      id="productprice"
                      v-model="product.UnitPrice">
                  </BaseInput>
              </div>
          </div>
          <div class="text-center">
              <button type="button" class="btn btn-info btn-fill float-right" @click.prevent="updateProduct">
                  Cập nhật sản phẩm
              </button>
          </div>
          <div class="clearfix"></div>
      </form>
  </card>
</template>

<script>
import Card from 'src/components/Cards/Card.vue'
import axios from 'axios';
import BaseInput from '../../components/Inputs/BaseInput.vue';

export default {
components: {
  Card,
  BaseInput
},
data() {
  return {
    product: {
      ProductID: '',
      Name: '',
      Code: '',
      UnitCurrency: '',
      UnitPrice: 0
    },
    unitCurrencies: ['Cái', 'Quyển', 'Cây'],
    type: ['success', 'danger', 'warning'],
    notifications: {
      topCenter: false
    }
  }
},
methods: {
  async navigateBackToTableList() {
    this.$router.push('/admin/table-list');
  },
  async updateProduct() {
    if (this.product.Name && this.product.Code && this.product.UnitCurrency && this.product.UnitPrice) {
      try {
        const response = await axios.put(`https://localhost:7162/Product`, this.product);
        
        console.log("Response:", response.data);
        await this.notifySuccess('top', 'right');
        this.navigateBackToTableList();
      } catch (error) {
        console.error("Error updating product:", error);
        this.notifyError('top', 'right');
      }
    } else {
      this.notifyWarning('top', 'right');
    }
  },
  async notifySuccess(verticalAlign, horizontalAlign) {
    const color = 0
    this.$notifications.notify(
      {
        message: `<span>Cập nhật sản phẩm thành công</span>`,
        icon: 'nc-icon nc-app',
        horizontalAlign: horizontalAlign,
        verticalAlign: verticalAlign,
        type: this.type[color]
      })
  },
  async notifyError(verticalAlign, horizontalAlign) {
    const color = 1
    this.$notifications.notify(
      {
        message: `<span>Cập nhật sản phẩm thất bại, có lỗi xảy ra</span>`,
        icon: 'nc-icon nc-app',
        horizontalAlign: horizontalAlign,
        verticalAlign: verticalAlign,
        type: this.type[color]
      })
  },
  async notifyWarning(verticalAlign, horizontalAlign) {
    const color = 2
    this.$notifications.notify(
      {
        message: `<span>Vui lòng nhập đủ thông tin</span>`,
        icon: 'nc-icon nc-app',
        horizontalAlign: horizontalAlign,
        verticalAlign: verticalAlign,
        type: this.type[color]
      })
  },
},
mounted() {
  const id = this.$route.params.id;
  console.log('Route Params:', id); 

  if (id) {
    axios.get(`https://localhost:7162/Product/${id}`).then((response) => {
      const updatingProduct = response.data;
      this.product.ProductID = updatingProduct.productID;
      this.product.Name = updatingProduct.name;
      this.product.Code = updatingProduct.code;
      this.product.UnitCurrency = updatingProduct.unitCurrency;
      this.product.UnitPrice = updatingProduct.unitPrice;
      console.log("Product fetched:", updatingProduct);
    }).catch(error => {
      console.error("Error fetching product:", error);
    });
  } else {
    console.error("Product ID is undefined!");
  }
}
};
</script>

<style></style>
