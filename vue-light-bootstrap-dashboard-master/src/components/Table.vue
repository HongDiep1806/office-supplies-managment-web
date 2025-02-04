<template>
  <div>
    <table class="table">
      <thead>
        <slot name="columns">
          <tr>
            <th v-for="column in columns" :key="column">{{ column }}</th>
            <th>Thao tác</th>
          </tr>
        </slot>
      </thead>
      <tbody>
        <tr v-for="(item, rowIndex) in paginatedData" :key="rowIndex">
          <slot :row="item">
            <td
              v-for="(column, colIndex) in columns"
              :key="colIndex"
            >
              {{ itemValueByIndex(item, colIndex) }}
            </td>
            <td style="display: flex;justify-content: space-between;">
              <i class="fa fa-edit"></i>
              <i class="fa fa-trash"></i>
              <i class="fa fa-eye"></i>
            </td>
          </slot>
        </tr>
      </tbody>
    </table>
    <nav>
      <ul class="pagination">
        <li
          class="page-item"
          :class="{ disabled: currentPage === 1 }"
          @click="changePage(currentPage - 1)"
        >
          <a class="page-link" href="#">Previous</a>
        </li>
        <li
          v-for="page in totalPages"
          :key="page"
          class="page-item"
          :class="{ active: page === currentPage }"
          @click="changePage(page)"
        >
          <a class="page-link" href="#">{{ page }}</a>
        </li>
        <li
          class="page-item"
          :class="{ disabled: currentPage === totalPages }"
          @click="changePage(currentPage + 1)"
        >
          <a class="page-link" href="#">Next</a>
        </li>
      </ul>
    </nav>
  </div>
</template>

<script>
export default {
  name: "l-table",
  props: {
    columns: Array,
    data: Array,
    pageSize: {
      type: Number,
      default: 10,
    },
  },
  data() {
    return {
      currentPage: 1,
    };
  },
  computed: {
    totalPages() {
      return Math.ceil(this.data.length / this.pageSize);
    },
    paginatedData() {
      const startIndex = (this.currentPage - 1) * this.pageSize;
      return this.data.slice(startIndex, startIndex + this.pageSize);
    },
  },
  methods: {
    itemValueByIndex(item, colIndex) {
      // Lấy danh sách giá trị của item theo thứ tự
      const values = Object.values(item);
      return values[colIndex] !== undefined ? values[colIndex] : '';
    },
    changePage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
      }
    },
  },
};

</script>
<style scoped>
.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
.pagination .page-item.disabled .page-link {
  pointer-events: none;
  opacity: 0.5;
}
.pagination .page-item.active .page-link {
  background-color: #007bff;
  border-color: #007bff;
  color: #fff;
}
</style>

