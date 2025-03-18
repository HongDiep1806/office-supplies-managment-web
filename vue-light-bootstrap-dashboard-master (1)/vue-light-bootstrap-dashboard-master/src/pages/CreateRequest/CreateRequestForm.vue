<template>
    <card>
        <h4 slot="header" class="card-title">Tạo phiếu yêu cầu</h4>
        <form>
            <div class="row">
                <div class="col-md-3">
                    <label for="createdBy">Người thực hiện</label>
                    <base-input type="text" placeholder="Nhập người thực hiện" v-model="requester" readonly></base-input>
                </div>
                <div class="col-md-3">
                    <label for="department">Phòng ban</label>
                    <base-input type="text" placeholder="Nhập phòng ban" v-model="userDepartment" readonly></base-input>
                </div>
                <div class="col-md-3">
                    <label for="ticketNumber">Số phiếu</label>
                    <base-input type="text" v-model="ticketNumber" readonly></base-input>
                </div>
                <div class="col-md-3">
                    <label for="createdDate">Ngày thực hiện</label>
                    <base-input type="date" v-model="requestDate" readonly></base-input>
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
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(productRow, index) in productRows" :key="index">
                            <td>{{ index + 1 }}</td>
                            <td>
                                <select v-model="productRow.selectedProduct" @change="updateProductDetails(index)" class="form-control">
                                    <option value="" disabled>Chọn sản phẩm</option>
                                    <option v-for="product in availableProducts(index)" :key="product.id" :value="product">
                                        {{ product.name }}
                                    </option>
                                </select>
                            </td>
                            <td>{{ productRow.unitCurrency || 'Chưa có' }}</td>
                            <td>
                                <input type="number" v-model="productRow.quantity" min="1" @input="calculateTotal(index)" class="form-control" />
                            </td>
                            <td>{{ productRow.unitPrice || 0 }}</td>
                            <td>{{ productRow.totalPrice || 0 }}</td>
                            <td>
                                <button type="button" @click="removeProductRow(index)" class="btn btn-danger btn-sm">
                                    <i class="fa fa-trash"></i>
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div class="text-center position-relative">
                <div style="display: flex; flex-direction: row; justify-content: space-between;">
                    <button type="button" class="btn btn-add-product" @click="addProductRow" style="border-color: rgb(220, 68, 5); max-height: fit-content;">
                        <i class="fa fa-plus" style="color: rgb(220, 68, 5);"></i>
                    </button>
                    <div>
                        <label for="totalAmount">Tổng cộng</label>
                        <base-input type="text" placeholder="Tổng cộng" v-model="totalAmountFormatted" readonly></base-input>
                    </div>
                </div>
                <button type="submit" class="btn btn-info btn-fill float-right" @click.prevent="createTicket">
                    Tạo phiếu yêu cầu
                </button>
            </div>
        </form>
    </card>
</template>

<script>
import Card from 'src/components/Cards/Card.vue';
import BaseInput from '../../components/Inputs/BaseInput.vue';
import jwtDecode from 'jwt-decode';
import axios from 'axios';

export default {
    components: {
        Card,
        BaseInput,
    },
    data() {
        return {
            requester: '',
            requestDate: new Date().toISOString().substr(0, 10),
            ticketNumber: '',
            products: [],
            productRows: [
                { selectedProduct: null, unitCurrency: '', unitPrice: 0, quantity: 1, totalPrice: 0 },
            ],
            userName: '',
            userID: 0,
            userDepartment: '',
            type: ['success', 'danger', 'warning'],
            requestNumber: 0,
            token: localStorage.getItem('authToken')
        };
    },
    methods: {
        async notifySuccess(verticalAlign, horizontalAlign) {
            this.$notifications.notify({
                message: `<span>Tạo Phiếu yêu cầu thành công</span>`,
                icon: 'nc-icon nc-app',
                horizontalAlign: horizontalAlign,
                verticalAlign: verticalAlign,
                type: this.type[0]
            });
        },
        async notifyError(verticalAlign, horizontalAlign) {
            this.$notifications.notify({
                message: `<span>Tạo Phiếu yêu cầu thất bại</span>`,
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
        },
        generateTicketNumber() {
            const today = new Date();
            const month = String(today.getMonth() + 1).padStart(2, '0');
            const year = String(today.getFullYear()).slice(-2);
            return `PYC${year}/${month}/${this.requestNumber}`;
        },
        addProductRow() {
            this.productRows.push({ selectedProduct: null, unitCurrency: '', unitPrice: 0, quantity: 1, totalPrice: 0 });
        },
        removeProductRow(index) {
            this.productRows.splice(index, 1);
        },
        updateProductDetails(index) {
            const selectedProduct = this.productRows[index].selectedProduct;
            if (selectedProduct) {
                this.productRows[index].unitCurrency = selectedProduct.unitCurrency;
                this.productRows[index].unitPrice = selectedProduct.unitPrice;
                this.calculateTotal(index);
            }
        },
        calculateTotal(index) {
            const productRow = this.productRows[index];
            productRow.totalPrice = productRow.quantity * productRow.unitPrice;
        },
        async createTicket() {
            if (!this.productRows.some((row) => row.selectedProduct)) {
                this.notifyWarning('top', 'right');
                return;
            }

            try {
                const requestData = {
                    totalPrice: this.totalAmount,
                    requestCode: this.ticketNumber,
                    userID: this.userID,
                    products: this.productRows
                        .filter((row) => row.selectedProduct)
                        .map((row) => ({
                            productID: row.selectedProduct.productID,
                            quantity: row.quantity,
                        })),
                };

                const response = await axios.post('https://localhost:7162/Request', requestData, {
                    headers: {
                        Authorization: `Bearer ${this.token}`,
                    },
                });

                await this.notifySuccess('top', 'right');
                await this.$router.push('/admin/request-table');
            } catch (error) {
                this.notifyError('top', 'right');
            }
        },
        availableProducts(index) {
            const selectedProductIds = this.productRows
                .filter((row, i) => i < index && row.selectedProduct)
                .map((row) => row.selectedProduct && row.selectedProduct.id);
            const filteredSelectedProductIds = selectedProductIds.filter(id => id !== undefined);

            return this.products.filter((product) => !filteredSelectedProductIds.includes(product.id));
        },
    },
    async mounted() {
        try {
            const response = await axios.get('https://localhost:7162/Product', {
                headers: {
                    Authorization: `Bearer ${this.token}`,
                },
            });
            this.products = response.data;
        } catch (error) {
            console.error('Lỗi khi lấy danh sách sản phẩm:', error);
        }

        const decodeToken = jwtDecode(this.token);
        this.userID = decodeToken.sub;
        this.userName = decodeToken.name;
        this.requester = this.userName;

        const number = await axios.get('https://localhost:7162/Request/count', { headers: { Authorization: `Bearer ${this.token}` } });
        this.requestNumber = number.data;
        this.ticketNumber = this.generateTicketNumber();

        try {
            const user = await axios.get(`https://localhost:7162/User/${decodeToken.email}`, { headers: { Authorization: `Bearer ${this.token}` } });
            this.userDepartment = user.data.department;
        } catch (error) {
            console.error('Lỗi khi lấy thông tin người dùng:', error);
        }
    },
    computed: {
        totalAmount() {
            return this.productRows.reduce((sum, product) => sum + product.totalPrice, 0);
        },
        totalAmountFormatted() {
            return this.totalAmount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
        },
    },
};
</script>