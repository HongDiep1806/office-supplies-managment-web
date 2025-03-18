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
                UnitPrice: 0
            },
            type: ['success', 'danger', 'warning'],
            notifications: {
                topCenter: false
            },
            unitCurrencies: ['Cái', 'Quyển', 'Cây'],
            token: localStorage.getItem('authToken')
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
                    const response = await axios.post("https://localhost:7162/Product", this.product, {
                        headers: {
                            Authorization: `Bearer ${this.token}` // Đính kèm token vào header
                        }
                    });
                    console.log("Response:", response.data);
                    if (response.data == true) {
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
                        UnitPrice: 0
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