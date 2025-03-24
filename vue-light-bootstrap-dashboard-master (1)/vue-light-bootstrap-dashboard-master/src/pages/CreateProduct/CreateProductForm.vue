<template>
    <card>
        <h4 slot="header" class="card-title">Tạo sản phẩm</h4>
        <form>
            <div class="row">
                <div class="col-md-6">
                    <label for="productname">Tên sản phẩm</label>
                    <base-input type="text" placeholder="Nhập tên sản phẩm" name="productname" id="productname"
                        v-model="product.Name">
                    </base-input>
                </div>
                <div class="col-md-6">
                    <label for="productcode">Mã sản phẩm</label>
                    <base-input type="text" name="productcode" id="productcode" placeholder="Nhập mã sản phẩm"
                        v-model="product.Code">
                    </base-input>
                </div>
            </div>

            <div class="row">
                <div class="col-md-6">
                    <label for="productcurrency">Đơn vị tính</label>
                    <select class="form-control" id="productcurrency" v-model="product.UnitCurrency">
                        <option value="" disabled>Chọn đơn vị tính</option>
                        <option v-for="unit in unitCurrencies" :key="unit" :value="unit">
                            {{ unit }}
                        </option>
                    </select>
                </div>
                <div class="col-md-6">
                    <label for="productprice">Đơn giá</label>
                    <base-input type="number" placeholder="Nhập đơn giá" name="productprice" id="productprice"
                        v-model="product.UnitPrice">
                    </base-input>
                </div>
            </div>

            <div class="text-center">
                <button type="submit" class="btn btn-info btn-fill float-right" @click.prevent="createProduct">
                    Tạo sản phẩm
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
                Name: '',
                Code: '',
                UnitCurrency: '',
                UnitPrice: 0,
                CreatedDate: '',
                UserIDCreate: ''
            },
            type: ['success', 'danger', 'warning'],
            notifications: {
                topCenter: false
            },
            unitCurrencies: ['Cái', 'Quyển', 'Cây'],
            token: localStorage.getItem('authToken'),
            userID: localStorage.getItem('userId') // Assuming userID is stored in localStorage
        }
    },
    methods: {
  async navigateBackToTableList() {
    this.$router.push('/admin/table-list');
  },
  async createProduct() {
  if (this.product.Name !== '' &&
      this.product.Code !== '' &&
      this.product.UnitCurrency !== '' &&
      this.product.UnitPrice !== 0) {
    try {
      const now = new Date().toISOString();
      this.product.CreatedDate = now;
      this.product.UserIDCreate = this.userID;

      const response = await axios.post("https://localhost:7162/Product", this.product, {
        headers: {
          Authorization: `Bearer ${this.token}` // Đính kèm token vào header
        }
      });
      //("Response:", response.data);
      if (response.data == true) {
        // Fetch the product by its code to get the productID
        const productResponse = await axios.get(`https://localhost:7162/Product/get-by-code?code=${encodeURIComponent(this.product.Code)}`, {
          headers: { Authorization: `Bearer ${this.token}` }
        });
        const productID = productResponse.data.productID;
        //console.log('Fetched productID:', productID);

        // Fetch the username by userID
        const usernameResponse = await axios.get(`https://localhost:7162/User/getNameById${this.userID}`, {
          headers: { Authorization: `Bearer ${this.token}` }
        });
        const username = usernameResponse.data;
        //console.log('Fetched username:', username);

        // Fetch users with userTypeID == 2
        const usersType2Response = await axios.get('https://localhost:7162/User/users-by-type-id?userTypeID=2', {
          headers: { Authorization: `Bearer ${this.token}` },
        });
        const usersWithUserType2 = usersType2Response.data;

        // Fetch users with userTypeID == 4
        const usersType4Response = await axios.get('https://localhost:7162/User/users-by-type-id?userTypeID=4', {
          headers: { Authorization: `Bearer ${this.token}` },
        });
        const usersWithUserType4 = usersType4Response.data;

        // Combine users with userTypeID == 2 and userTypeID == 4
        const usersToNotify = [...usersWithUserType2, ...usersWithUserType4];

        // Send notifications to users with userTypeID == 2 and userTypeID == 4
        const notifications = usersToNotify.map(user => ({
          userID: user.userID,
          message: `A new product ${this.product.Name} has been created by ${username}.`,
          requestID: productID,
          sender: this.userID,
        }));

        for (const notification of notifications) {
          //console.log(`Sending notification: ${JSON.stringify(notification)}`);
          await axios.post('https://localhost:7162/Notification', notification, {
            headers: { Authorization: `Bearer ${this.token}` },
          });
        }

        await this.notifySuccess('top', 'right');
        this.navigateBackToTableList();
      } else {
        await this.notifyError('top', 'right');
      }
      // Reset form after successful submission
      this.product = {
        Name: "",
        Code: "",
        UnitCurrency: "",
        UnitPrice: 0,
        CreatedDate: '',
        UserIDCreate: ''
      };
    } catch (error) {
      console.error("Lỗi khi tạo sản phẩm:", error);
      this.notifyError('top', 'right');
    }
  } else {
    this.notifyWarning('top', 'right');
  }
},
  async notifySuccess(verticalAlign, horizontalAlign) {
    this.$notifications.notify({
      message: `<span>Tạo sản phẩm thành công</span>`,
      icon: 'nc-icon nc-app',
      horizontalAlign: horizontalAlign,
      verticalAlign: verticalAlign,
      type: this.type[0]
    });
  },
  async notifyError(verticalAlign, horizontalAlign) {
    this.$notifications.notify({
      message: `<span>Tạo sản phẩm thất bại. Mã code đã được tạo. Vui lòng nhập mã code khác</span>`,
      icon: 'nc-icon nc-app',
      horizontalAlign: horizontalAlign,
      verticalAlign: verticalAlign,
      type: this.type[1]
    });
  },
  async notifyWarning(verticalAlign, horizontalAlign) {
    this.$notifications.notify({
      message: `<span>Vui lòng nhập đủ thông tin</span>`,
      icon: 'nc-icon nc-app',
      horizontalAlign: horizontalAlign,
      verticalAlign: verticalAlign,
      type: this.type[2]
    });
  }
}
};
</script>

<style></style>