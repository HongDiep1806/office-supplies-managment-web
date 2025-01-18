<template>
    <div class="form-container">
        <h2>PHIẾU YÊU CẦU CẤP VĂN PHÒNG PHẨM</h2>

        <form @submit.prevent="handleSubmit" class="form-grid">
            <!-- User Information -->
            <div class="form-row">
                <div class="form-field">
                    <label for="name">Người thực hiện: </label>
                    <input type="text" v-model="form.name" id="name" name="name" required
                        placeholder="Enter your full name" />
                </div>
                <div class="form-field">
                    <label for="department">Phòng ban: </label>
                    <input type="text" v-model="form.department" id="department" name="department" required
                        placeholder="Enter your department" />
                </div>
            </div>

            <!-- Add Product Button -->
            <div class="add-button-container">
                <div class="created-date">
                    <label for="">Ngày thực hiện:</label>
                    <h4>{{ formattedDate }}</h4>
                </div>

                <button type="button" @click="addProduct" class="add-button">+</button>
            </div>

            <!-- Products Table -->
            <table class="products-table">
                <thead>
                    <tr>
                        <th>STT</th>
                        <th>Mã sản phẩm</th>
                        <th>Tên sản phẩm</th>
                        <th>Số lượng</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(product, index) in form.products">
                        <td>{{ index + 1 }}</td>
                        <td>{{ product + "-" + index }}</td>
                        <td>
                            <select v-model="product.name" required class="product-select">
                                <option value="" disabled>Select a product</option>
                                <option v-for="option in productOptions" value="{{ option }}">{{ option }}</option>
                            </select>
                        </td>
                        <td>
                            <input type="number" v-model="product.quantity" placeholder="Enter quantity" min="1"
                                required class="quantity-input" />
                            <button type="button" @click="removeProduct(index)" class="delete-button">
                                &times;
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
            <!-- Submit Button -->
            <div class="form-row submit-btn">
                <button type="submit" class="submit-button">Tạo yêu cầu</button>
            </div>
        </form>

        <!-- Display submission result -->
        <div v-if="submissionResult">
            <h3>Request Submitted!</h3>
            <pre>{{ submissionResult }}</pre>
        </div>
    </div>
</template>


<script lang="ts">
import { ref } from 'vue';
import "@/assets/requestform.css"

interface Product {
    name: string;
    quantity: number;
}

interface SuppliesRequest {
    name: string;
    department: string;
    products: Product[];
}


export default {

    name: 'OfficeSuppliesRequest',
    setup() {
        const form = ref<SuppliesRequest>({
            name: '',
            department: '',
            products: [{ name: '', quantity: 1 }]
        });

        const submissionResult = ref<string | null>(null);

        const addProduct = () => {
            form.value.products.push({ name: '', quantity: 1 });
        };

        const removeProduct = (index: number) => {
            form.value.products.splice(index, 1);
        };

        const handleSubmit = () => {
            submissionResult.value = JSON.stringify(form.value, null, 2);
            form.value = { name: '', department: '', products: [{ name: '', quantity: 1 }] };
        };

        return {
            form,
            addProduct,
            removeProduct,
            handleSubmit,
            submissionResult,
            formattedDate: Date.now().toLocaleString(),
            productOptions: ["pen", "pencil", "eraser", "notebook", "paper"
            ]
        };
    }
};
</script>


<style></style>
