<template>
    <card>
        <h4 slot="header" class="card-title">Chỉnh sửa phiếu yêu cầu</h4>
        <form>
            <div class="row">
                <div class="col-md-3">
                    <label for="createdBy">Người thực hiện</label>
                    <base-input type="text" v-model="requester" readonly></base-input>
                </div>
                <div class="col-md-3">
                    <label for="department">Phòng ban</label>
                    <base-input type="text" v-model="userDepartment" readonly></base-input>
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
                            <th>
                                
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr
                            v-for="(productRow, index) in productRows"
                            :key="index"
                            :class="{ 'disabled-row': productRow.isDeleted }"
                        >
                            <td>{{ index + 1 }}</td>
                            <td>
                                <select
                                    v-model="productRow.selectedProduct"
                                    class="form-control"
                                    :disabled="productRow.isDeleted"
                                    @change="updateProductDetails(index)"
                                >
                                    <option v-if="productRow.selectedProduct" :value="productRow.selectedProduct">
                                        {{ productRow.selectedProduct.name }}
                                    </option>
                                    <option v-else disabled>Chọn sản phẩm</option>
                                    <option
                                        v-for="product in availableProducts(index)"
                                        :key="product.productID"
                                        :value="product"
                                        v-if="!productRow.isDeleted"
                                    >
                                        {{ product.name }}
                                    </option>
                                </select>
                            </td>
                            <td>{{ productRow.unitCurrency || 'Chưa có' }}</td>
                            <td>
                                <input
                                    type="number"
                                    v-model="productRow.quantity"
                                    :disabled="productRow.isDeleted"
                                    min="1"
                                    class="form-control"
                                    @input="calculateTotal(index)"
                                />
                            </td>
                            <td>{{ productRow.unitPrice || 0 }}</td>
                            <td>{{ productRow.totalPrice || 0 }}</td>
                            <td>
                                <button
                                    type="button"
                                    @click="removeProductRow(index)"
                                    class="btn btn-danger btn-sm"
                                    title="Xóa sản phẩm"
                                >
                                    <i class="fa fa-trash"></i>
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div class="recommendations-panel">
                <h5>Gợi ý sản phẩm</h5>
                <table class="table">
                    <thead>
                        <tr>
                            <th>Sản phẩm</th>
                            <th>Số lượng</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(recommendation, index) in recommendations" :key="index">
                            <td>{{ recommendation.Product }}</td>
                            <td>{{ recommendation.Quantity }}</td>
                            <td>
                                <button
                                    class="btn btn-sm btn-primary"
                                    @click.prevent="addRecommendedProduct(recommendation)"
                                >
                                    Thêm
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div class="text-center position-relative">
                <div style="display: flex; flex-direction: row; justify-content: space-between;">
                    <button type="button" class="btn btn-add-product" @click="addProductRow"
                        style="border-color: rgb(220, 68, 5); max-height: fit-content;">
                        <i class="fa fa-plus" style="color: rgb(220, 68, 5);"></i>
                    </button>
                    <div>
                        <label for="totalAmount">Tổng cộng</label>
                        <base-input type="text" v-model="totalAmountFormatted" readonly></base-input>
                    </div>
                </div>

                <button type="submit" class="btn btn-info btn-fill float-right" @click.prevent="updateTicket">
                    Cập nhật phiếu yêu cầu
                </button>
            </div>
        </form>
    </card>
</template>
<script>
import Card from 'src/components/Cards/Card.vue';
import BaseInput from '../../components/Inputs/BaseInput.vue';
import axios from 'axios';
import jwtDecode from 'jwt-decode';

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
            productRows: [],
            userDepartment: '',
            userID: 0,
            type: ['success', 'danger', 'warning'],
            requestNumber: 0,
            totalAmountFromApi: 0,
            request: {},
            token: localStorage.getItem('authToken'),
            recommendedProducts: [],
            recommendations: [], // Add recommendations data property
            
        };
    },
    async mounted() {
        //get local storage department from authtoken
        const requestId = this.$route.params.id;
        const request = await axios.get(`https://localhost:7162/Request/getbyid/${requestId}`, {
            headers: { Authorization: `Bearer ${this.token}` },
        });
        this.request = request.data;
        this.requestDate = new Date().toISOString().substr(0, 10);
        this.ticketNumber = request.data.requestCode;
        this.userID = request.data.userID;
        this.requestNumber = request.data.requestCode;
        this.totalAmountFromApi = request.data.totalPrice;

        try {
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
                product_RequestID: item.product_RequestID,
                selectedProduct: product,
                quantity: item.quantity,
                unitCurrency: product ? product.unitCurrency : 'Chưa có',
                unitPrice: product ? product.unitPrice : 0,
                totalPrice: product ? item.quantity * product.unitPrice : 0,
                isDeleted: product ? product.isDeleted : false,
            };
        });

        try {
            const user = await axios.get(`https://localhost:7162/User/getbyid/${this.userID}`, {
                headers: { Authorization: `Bearer ${this.token}` },
            });
            this.userDepartment = user.data.department || 'Không xác định';
            this.requester = user.data.fullName;
        } catch (error) {
            console.error('Lỗi khi lấy thông tin người dùng:', error);
        }

        // Fetch recommendations from the recommendation API
        await this.fetchRecommendations();
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
        addProductRow() {
            this.productRows.push({ selectedProduct: null, unitCurrency: '', unitPrice: 0, quantity: 1, totalPrice: 0, isDeleted: false });
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
        availableProducts(index) {
            const selectedProductIds = this.productRows
                .filter((row, i) => i !== index && row.selectedProduct)
                .map((row) => row.selectedProduct.productID);
            return this.products.filter((product) => !selectedProductIds.includes(product.productID) && !product.isDeleted);
        },
        async updateTicket() {
            if (!this.productRows.some((row) => row.selectedProduct)) {
                this.notifyWarning('bottom', 'right');
                return;
            }

            const updatedRequest = {
                requestID: parseInt(this.$route.params.id),
                totalPrice: this.totalAmount,
                requestCode: this.ticketNumber,
                createdDate: this.request.createdDate || new Date().toISOString(), // Ensure createdDate is included
                userID: this.userID,
                products: this.productRows
                    .filter((row) => row.selectedProduct)
                    .map((row) => ({
                        product_RequestID: row.product_RequestID || 0, // Default to 0 if not provided
                        productID: row.selectedProduct.productID,
                        quantity: row.quantity,
                    })),
                isProcessedByDepLead: this.request.isProcessedByDepLead || false,
                isApprovedByDepLead: this.request.isApprovedByDepLead || false,
                isApprovedBySupLead: this.request.isApprovedBySupLead || false,
                isSummaryBeProcessed: this.request.isSummaryBeProcessed || false,
                isSummaryBeApproved: this.request.isSummaryBeApproved || false,
                isCollectedInSummary: this.request.isCollectedInSummary || false,
                dateDepLeadApprove: this.request.dateDepLeadApprove || null,
                noteDepLead: this.request.noteDepLead || '',
                dateSupLeadApprove: this.request.dateSupLeadApprove || null,
                noteSupLead: this.request.noteSupLead || '',
            };

            try {
                await axios.put(`https://localhost:7162/Request`, updatedRequest, {
                    headers: {
                        Authorization: `Bearer ${this.token}`,
                    },
                });
                this.notifySuccess('bottom', 'right');
                this.$router.push('/admin/request-table');
            } catch (error) {
                console.log(updatedRequest); // Log the request payload for debugging
                console.error('Error updating request:', error.response ? error.response.data : error);
                this.notifyError('bottom', 'right');
            }
        },
        async fetchRecommendations() {
            try {
                const department = localStorage.getItem('department'); // Get department from localStorage
                const response = await axios.get(`http://127.0.0.1:5000/recommend_ml?department=${department}`);
                this.recommendations = response.data; // Store the recommendations in a data property
            } catch (error) {
                console.error('Error fetching recommendations:', error);
            }
        },
        addRecommendedProduct(recommendation) {
            const product = this.products.find((p) => p.name === recommendation.Product);
            if (product) {
                if (this.productRows.length === 1 && !this.productRows[0].selectedProduct) {
                    // Update the first product row directly
                    this.productRows[0].selectedProduct = product;
                    this.productRows[0].unitCurrency = product.unitCurrency;
                    this.productRows[0].unitPrice = product.unitPrice;
                    this.productRows[0].quantity = recommendation.Quantity;
                    this.productRows[0].totalPrice = product.unitPrice * recommendation.Quantity;
                } else {
                    // Add a new product row
                    this.productRows.push({
                        selectedProduct: product,
                        unitCurrency: product.unitCurrency,
                        unitPrice: product.unitPrice,
                        quantity: recommendation.Quantity,
                        totalPrice: product.unitPrice * recommendation.Quantity,
                        isDeleted: false,
                    });
                }
            }
        },
    },
    computed: {
        totalAmount() {
            return this.productRows.reduce((total, row) => total + row.totalPrice, 0);
        },
        totalAmountFormatted() {
            const amount = this.productRows.length > 0 ? this.totalAmount : this.totalAmountFromApi;
            return amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
        },
    },
};
</script>

<style scoped>
.disabled-row {
    background-color: #f0f0f0 !important;
    /* Màu xám nhạt */
    color: #999 !important;
    /* Màu chữ xám */
}

.disabled-row .btn-danger {
    pointer-events: auto !important;
    /* Cho phép xóa hàng */
    color: black !important;
}
</style>