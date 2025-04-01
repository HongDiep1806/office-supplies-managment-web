<template>
  <div>
    <button v-if="showCreateSummaryButton" @click="createSummary" class="btn btn-info btn-fill float-right"
      style="position: absolute; top: 0; right: 0;min-width: fit-content; margin: 2%;">Tạo Phiếu Tổng Hợp</button>
    <table class="table">
      <thead>
        <tr style="background-color: rgb(220, 68, 5); color: white;">
          <th v-for="column in columns" :key="column" style="color: white;">
            <div class="d-flex align-items-center justify-content-between">
              <span>{{ column }}</span>
              <!-- Only show sort icons for "Giá" -->
              <span v-if="enableSorting && column === 'Giá'" class="sort-icons">
                <span
                  class="sort-arrow"
                  :class="{ active: sortColumn === column && sortDirection === 'asc' }"
                  @click="toggleSort(column, 'asc')"
                >
                  ▲
                </span>
                <span
                  class="sort-arrow"
                  :class="{ active: sortColumn === column && sortDirection === 'desc' }"
                  @click="toggleSort(column, 'desc')"
                >
                  ▼
                </span>
              </span>
            </div>
          </th>
          <th v-if="displayStatus" style="color: white;">Trạng thái</th>
          <th v-if="displayActions" style="color: white;">
            
          </th>
        </tr>
      </thead>
      <tbody>
                  <tr
            v-for="(item, rowIndex) in paginatedData"
            :key="rowIndex"
            @click="$emit('row-click', item)"
            :style="{ cursor: 'pointer' }"
            class="clickable-row"
          >
          
          <td>{{ (currentPage - 1) * pageSize + rowIndex + 1 }}</td>
          <td v-for="(column, colIndex) in columns.slice(1)" :key="colIndex">
            {{ itemValueByIndex(item, colIndex + 1) }}
          </td>

          <td v-if="displayStatus && (domain === 'request'|| domain==='summary')">
            <span :class="['status-badge', getStatusClass(item)]" style="min-width: 50px;">
              <i :class="getStatusIcon(item)"></i> {{ getStatusText(item) }}
            </span>
          </td>

          <td v-if="displayActions" style="text-align: center; vertical-align: middle;">
            <div style="display: inline-flex; justify-content: center; align-items: center; gap: 10px;">
              <button type="button" class="icon btn btn-info btn-sm" v-if="canView" @click="navigateToViewForm(item)">
                <i class="fa fa-eye"></i>
              </button>
              <button type="button" @click="navigateToEditForm(item)" class="icon btn btn-warning btn-sm"
                v-if="(item.Status === 'Chưa duyệt' && domain === 'request' && userRole === 'Employee') || domain === 'product' && userRole === 'Finance Management Employee'">
                <i class="fa fa-edit"></i>
              </button>
              <button type="button" @click="openDeleteDialog(item)" class="icon btn btn-danger btn-sm"
                v-if="(item.Status === 'Chưa duyệt' && domain === 'request' && userRole === 'Employee') || (domain === 'product' && userRole === 'Finance Management Employee')">
                <i class="fa fa-trash"></i>
              </button>
              <td @click.stop>
            <input
              type="checkbox"
              v-model="selectedRequests"
              :value="item.requestID"
              v-show="item.Status === 'Đã duyệt' && item.IsCollectedInSummary === false && userRole === 'Finance Management Employee'"
              class="icon"
            />
          </td>
              <!-- <div v-if="showCheckboxColumn" class="icon btn-sm">
                <input type="checkbox" v-model="selectedRequests" :value="item.requestID"
                  v-show="item.Status === 'Đã duyệt' && item.IsCollectedInSummary === false" class="icon"/>
              </div> -->
            </div>
          </td>
          
        
        </tr>
      </tbody>
    </table>
    <nav>
      <ul class="pagination" style="color: rgb(220, 68, 5) !important;">
        <li class="page-item" :class="{ disabled: currentPage === 1 }" @click="changePage(currentPage - 1)">
          <button class="page-link">Previous</button>
        </li>
        <li v-for="page in totalPages" :key="page" class="page-item" :class="{ active: page === currentPage }"
          @click="changePage(page)">
          <button class="page-link">{{ page }}</button>
        </li>
        <li class="page-item" :class="{ disabled: currentPage === totalPages }" @click="changePage(currentPage + 1)">
          <button class="page-link">Next</button>
        </li>
      </ul>
    </nav>
    <div v-if="dialog" class="dialog-overlay">
      <div class="dialog-box">
        <p>Bạn có chắc chắn muốn xóa không?</p>
        <div class="dialog-actions">
          <button @click="dialog = false" class="btn btn-cancel">Hủy</button>
          <button @click="confirmDelete" class="btn btn-delete">Xóa</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: "l-table",
  props: {
    columns: Array,
    data: Array,
    apiURL: String,
    domain: String,
    pageSize: {
      type: Number,
      default: 10,
    },
    displayActions: Boolean,
    displayStatus: Boolean,
    canEdit: Boolean,
    canView: Boolean,
    canDelete: Boolean,
    enableSorting: {  // New prop to enable/disable sorting
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      currentPage: 1,
      dialog: false,
      itemToDelete: null,
      sortColumn: '', // Current column being sorted
      sortDirection: '', // Current sort direction ('asc' or 'desc')
      sortableColumns: ['Giá', 'Sửa đổi lần cuối'], // Only these two columns will be sortable
      type: ['success', 'danger', 'warning'],
      notifications: {
        topCenter: false,
      },
      userRole: localStorage.getItem('userRole'),
      selectedRequests: [],
      token: localStorage.getItem('authToken'),
      userID: localStorage.getItem('userId'),
      department: localStorage.getItem('department'),
      productname: '',
    };
  },
  computed: {
    showCheckboxColumn() {
      return this.domain === 'request' && this.userRole === 'Finance Management Employee';
    },
    showCreateSummaryButton() {
      return this.selectedRequests.length > 0;
    },
    paginatedData() {
      const startIndex = (this.currentPage - 1) * this.pageSize;
      return this.data.slice(startIndex, startIndex + this.pageSize);
    },
    totalPages() {
      return Math.ceil(this.data.length / this.pageSize);
    },
    sortableColumnsArray() {
      // Make sure we have a valid array to prevent the "includes" error
      return this.sortableColumns || [];
    }
  },
  methods: {
    itemValueByIndex(item, colIndex) {
      const values = Object.values(item);
      return values[colIndex] !== undefined ? values[colIndex] : '';
    },
    showCheckbox(item) {
      return this.domain === 'request' && this.userRole === 'Finance Management Employee' && item.Status === 'Đã duyệt';
    },
    itemValueByIndex(item, colIndex) {
      const values = Object.values(item);
      return values[colIndex] !== undefined ? values[colIndex] : '';
    },
    changePage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
      }
    },
    navigateToEditForm(item) {
      if (this.domain === 'product') {
        this.$router.push({ name: 'Edit Product', params: { id: item.productID } });
      } else if (this.domain === 'request') {
        this.$router.push({ name: 'Edit Request', params: { id: item.requestID } });
      }
    },
    navigateToViewForm(item) {
      if (this.domain === 'request') {
        this.$router.push({ name: 'View Request', params: { id: item.requestID, status: item.Status } });
      }else if (this.domain === 'summary'){
        this.$router.push ({ name: 'View Summary', params: { summaryId: item.summaryID } });
      }
    },
    openDeleteDialog(item) {
      this.itemToDelete = item;
      this.dialog = true;
    },
    async confirmDelete() {
  if (this.domain === 'product') {
    if (!this.itemToDelete) return;
    try {
      const productId = this.itemToDelete.productID;

      // Fetch the product details by its ID to get the product name
      const productResponse = await axios.get(`${this.apiURL}/${productId}`, {
        headers: { Authorization: `Bearer ${this.token}` }
      });
      const productName = productResponse.data.name;
      //console.log('Fetched product name:', productName);
      await axios.delete(`${this.apiURL}/${productId}`, {
        headers: { Authorization: `Bearer ${this.token}` }
      });

      const index = this.data.findIndex(product => product.productID === productId);
      if (index !== -1) {
        this.data.splice(index, 1);
      }

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
        message: `The product ${productName} has been deleted by ${username}.`,
        requestID: productId,
        sender: this.userID,
      }));

      for (const notification of notifications) {
        //console.log(`Sending notification: ${JSON.stringify(notification)}`);
        await axios.post('https://localhost:7162/Notification', notification, {
          headers: { Authorization: `Bearer ${this.token}` },
        });
      }

      this.dialog = false;
      this.notifySuccess('top', 'right');

    } catch (error) {
      console.error("Delete error:", error);
      this.dialog = false;
      this.notifyError('top', 'right');
    }
  } else if (this.domain === 'request') {
    if (!this.itemToDelete) return;
    try {
      const requestId = this.itemToDelete.requestID;
      await axios.delete(`${this.apiURL}/${requestId}`, {
        headers: { Authorization: `Bearer ${this.token}` }
      });

      const index = this.data.findIndex(r => r.requestID === requestId);
      if (index !== -1) {
        this.data.splice(index, 1);
      }

      // Fetch the username by userID
      const usernameResponse = await axios.get(`https://localhost:7162/User/getNameById${this.userID}`, {
        headers: { Authorization: `Bearer ${this.token}` }
      });
      const username = usernameResponse.data;
      //console.log('Fetched username:', username);

      // Fetch the department leader
      const department = this.getUserDepartment(this.itemToDelete.userID);
      const departmentLeaderResponse = await axios.get(`https://localhost:7162/User/department-leader?department=${department}`, {
        headers: { Authorization: `Bearer ${this.token}` },
      });
      const departmentLeader = departmentLeaderResponse.data;

      // Send notifications to userID and department leader
      const notifications = [
        {
          userID: this.itemToDelete.userID,
          message: `Your request ${requestId} has been deleted by ${username}.`,
          requestID: requestId,
          sender: this.userID,
        },
        {
          userID: departmentLeader.userID,
          message: `Request ${requestId} from your department has been deleted by ${username}.`,
          requestID: requestId,
          sender: this.userID,
        }
      ];

      for (const notification of notifications) {
        //console.log(`Sending notification: ${JSON.stringify(notification)}`);
        await axios.post('https://localhost:7162/Notification', notification, {
          headers: { Authorization: `Bearer ${this.token}` },
        });
      }

      this.dialog = false;
      this.notifySuccess('top', 'right');

    } catch (error) {
      console.error("Delete error:", error);
      this.dialog = false;
      this.notifyError('top', 'right');
    }
  }
},
    async notifySuccess(verticalAlign, horizontalAlign) {
      this.$notifications.notify({
        message: `<span>Xóa sản phẩm thành công</span>`,
        icon: 'nc-icon nc-app',
        horizontalAlign: horizontalAlign,
        verticalAlign: verticalAlign,
        type: this.type[0]
      });
    },
    async notifyError(verticalAlign, horizontalAlign) {
      this.$notifications.notify({
        message: `<span>Xóa sản phẩm thất bại</span>`,
        icon: 'nc-icon nc-app',
        horizontalAlign: horizontalAlign,
        verticalAlign: verticalAlign,
        type: this.type[1]
      });
    },
    getStatusText(item) {
      //console.log("log trong table" + item.Status);
      return item.Status;
    },
    getStatusClass(item) {
      if (item.Status === "Đã duyệt") {
        return "status-approved";
      } else if (item.Status === "Đang xử lý") {
        return "status-pending";
      } else if (item.Status === "Không duyệt") {
        return "status-rejected";
      } else if (item.Status === "Chưa duyệt") {
        return "status-loading";
      }else if (item.Status === "Đã tổng hợp"){
        return "status-collected"
      }
    },
    getStatusIcon(item) {
      if (item.Status === "Đã duyệt") {
    return "fa fa-check-circle";
  } else if (item.Status === "Chưa duyệt") {
    return "fa fa-spinner";
  } else if (item.Status === "Đang xử lý") {
    return "fa fa-hourglass-half";
  } else if (item.Status === "Không duyệt") {
    return "fa fa-times-circle";
  } else if (item.Status === "Đã tổng hợp") {
    return "fa fa-archive"; // Icon cho trạng thái đã tổng hợp
  }
  return "";
    },
    createSummary() {
      this.$router.push({ name: 'Create Summary', params: {requestIds: this.selectedRequests.join(',')  } });
      //console.log("Tạo phiếu tổng hợp từ các request:", this.selectedRequests);
    },
    toggleSort(column, direction) {
      console.log(`Toggling sort for ${column} in ${direction} direction`);
      
      if (this.sortColumn === column && this.sortDirection === direction) {
        // If already sorted in the same direction, reset sorting
        this.sortColumn = '';
        this.sortDirection = '';
      } else {
        // Set the column and direction for sorting
        this.sortColumn = column;
        this.sortDirection = direction;
      }
      
      // Sort the data
      this.sortData();
    },
    
    sortData() {
      // This method actually sorts the data
      if (!this.sortColumn || !this.data) {
        return; // No sorting needed
      }
      
      this.data.sort((a, b) => {
        let valueA = a[this.sortColumn];
        let valueB = b[this.sortColumn];
        
        // Handle numeric values (including currency)
        if (this.isNumericColumn(this.sortColumn)) {
          // Extract numeric value from formatted strings (like "1.000.000 ₫")
          valueA = this.extractNumericValue(valueA);
          valueB = this.extractNumericValue(valueB);
          
          // Compare as numbers
          return this.sortDirection === 'asc' 
            ? valueA - valueB 
            : valueB - valueA;
        }
        
        // Handle date values
        if (this.isDateColumn(this.sortColumn)) {
          // Convert date strings to timestamps for comparison
          try {
            // Try to handle various date formats
            let timestampA = this.parseDateToTimestamp(valueA);
            let timestampB = this.parseDateToTimestamp(valueB);
            
            return this.sortDirection === 'asc' 
              ? timestampA - timestampB 
              : timestampB - timestampA;
          } catch (error) {
            console.error('Date parsing error:', error);
            // Fall back to string comparison if date parsing fails
            if (typeof valueA === 'string') valueA = valueA.toLowerCase();
            if (typeof valueB === 'string') valueB = valueB.toLowerCase();
          }
        }
        
        // Default: string comparison
        if (typeof valueA === 'string') valueA = valueA.toLowerCase();
        if (typeof valueB === 'string') valueB = valueB.toLowerCase();
        
        if (this.sortDirection === 'asc') {
          return valueA > valueB ? 1 : valueA < valueB ? -1 : 0;
        } else {
          return valueA < valueB ? 1 : valueA > valueB ? -1 : 0;
        }
      });
    },

    // Helper method to check if a column contains numeric values
    isNumericColumn(column) {
      return column === 'Giá' || column.includes('Price') || column.includes('Amount') || column.includes('Cost');
    },

    // Helper method to check if a column contains date values
    isDateColumn(column) {
      return column.includes('Date') || column.includes('Time') || column === 'Sửa đổi lần cuối' || column === 'Last Adjusted';
    },

    // Helper method to extract numeric value from formatted strings
    extractNumericValue(value) {
      if (typeof value !== 'string') {
        return value;
      }
      
      // Remove currency symbols, spaces, and replace decimal commas with points
      const numericString = value
        .replace(/[^\d.,]/g, '') // Remove everything except digits, dots, and commas
        .replace(/\./g, '')      // Remove dots (thousands separators in Vietnamese format)
        .replace(/,/g, '.');     // Replace commas with dots for decimal places
        
      return parseFloat(numericString) || 0;
    },

    // Improved date parsing method
    parseDateToTimestamp(dateStr) {
      if (!dateStr) return 0;
      
      // If it's already a Date object
      if (dateStr instanceof Date) return dateStr.getTime();

      // For debugging
      console.log('Parsing date:', dateStr);
      
      // Handle common Vietnamese date format: DD/MM/YYYY
      if (typeof dateStr === 'string') {
        // Try DD/MM/YYYY format first (most likely for Vietnamese dates)
        const dateRegex = /(\d{1,2})\/(\d{1,2})\/(\d{4})/;
        const match = dateStr.match(dateRegex);
        
        if (match) {
          const day = parseInt(match[1], 10);
          const month = parseInt(match[2], 10) - 1; // Months are 0-based in JS
          const year = parseInt(match[3], 10);
          
          // Check if we have time components
          let hours = 0, minutes = 0, seconds = 0;
          const timeMatch = dateStr.match(/(\d{1,2}):(\d{1,2})(:(\d{1,2}))?/);
          if (timeMatch) {
            hours = parseInt(timeMatch[1], 10) || 0;
            minutes = parseInt(timeMatch[2], 10) || 0;
            seconds = parseInt(timeMatch[4], 10) || 0;
          }
          
          const date = new Date(year, month, day, hours, minutes, seconds);
          const timestamp = date.getTime();
          
          if (!isNaN(timestamp)) {
            console.log('Parsed timestamp:', timestamp, 'from', dateStr, 'as', date.toLocaleString());
            return timestamp;
          }
        }
      }
      
      // Try direct parsing as a fallback
      const timestamp = new Date(dateStr).getTime();
      
      // Return timestamp, or 0 if parsing failed
      if (isNaN(timestamp)) {
        console.warn('Failed to parse date:', dateStr);
        return 0;
      }
      
      console.log('Direct parsed timestamp:', timestamp, 'from', dateStr);
      return timestamp;
    },

    // Add this method to your methods section
    getFieldNameForColumn(column) {
      // Map display column names to actual field names in the data
      const columnMapping = {
        'Sửa đổi lần cuối': 'updatedDate',  // Replace with your actual field name
        'Giá': 'price'                      // Replace with your actual field name
      };
      
      return columnMapping[column] || column;
    },
  },

};
</script>

<style scoped>
input[type="checkbox"] {
  width: 16px; /* Set a fixed width for the checkbox */
  height: 16px; /* Set a fixed height for the checkbox */
  border: 2px solid #ccc; /* Add a border */
  border-radius: 4px; /* Optional: Add rounded corners */
  cursor: pointer; /* Show a pointer cursor */
  appearance: auto; /* Use the default browser appearance */
  -webkit-appearance: checkbox; /* Ensure it looks like a checkbox in WebKit browsers */
  -moz-appearance: checkbox; /* Ensure it looks like a checkbox in Firefox */
  outline: none; /* Remove the outline */
  position: relative;
}

input[type="checkbox"]:checked {
  background-color: rgb(220, 68, 5); /* Set the background color when checked */
  border-color: rgb(220, 68, 5); /* Set the border color when checked */
}

input[type="checkbox"]:checked::before {
  content: '\f00c'; /* Font Awesome checkmark */
  font-family: 'Font Awesome 5 Free';
  font-weight: 900;
  font-size: 14px; /* Adjust the size of the checkmark */
  color: white;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 14px;
  font-weight: bold;
  padding: 6px 12px;
  border-radius: 15px;
  text-align: center;
  width: max-content;
}

.status-approved {
  background-color: #28a745;
  color: white;
}

.status-pending {
  background-color: #ffc107;
  color: black;
}

.status-rejected {
  background-color: #dc3545;
  color: white;
}

.status-loading {
  background-color: #17a2b8;
  color: white;
}
.status-collected {
  background-color: #6c757d; /* Màu xám để thể hiện đã tổng hợp */
  color: white;
  font-weight: bold;
}

.status-badge i {
  font-size: 16px;
}

.status-approved {
  color: white;
  font-weight: bold;
}

.status-pending {
  color: white;
  font-weight: bold;
}

tbody tr {
  transition: box-shadow 0.2s ease-in-out;
}

td {
  border: none !important;
}

tbody tr:hover {
  box-shadow: 0 5px 12px rgba(0, 0, 0, 0.2);
  background-color: inherit;
}


.table-striped tbody tr:nth-of-type(odd) {
  background-color: rgba(248, 153, 113, 0.2);
  z-index: 1;
}

.btn {
  width: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.btn-danger {
  border: 2px solid #dc3545 !important;
}

.btn-warning {
  border: 2px solid #e0a800 !important;
  /* Màu đậm hơn để dễ thấy */
}

.icon {
  margin-right: 20px;
  cursor: pointer;
}

.icon:hover {
  color: orangered;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.pagination .page-item.disabled .page-link {
  pointer-events: none;
  opacity: 0.5;
  color: rgb(220, 68, 5);
}

.pagination .page-item.active .page-link {
  background-color: rgb(220, 68, 5);
  border-color: rgb(220, 68, 5);
  color: #fff;
}

.pagination .page-item .page-link {
  color: rgb(220, 68, 5);
  /* Màu cam cho tất cả các số trang */
}


/* CSS cho Dialog */
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.dialog-box {
  background: white;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
  width: 400px;
}

.dialog-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}

.btn {
  padding: 8px 16px;
  /* border: none; */
  cursor: pointer;
}

.btn-cancel {
  background: gray;
  color: white;
}

.btn-delete {
  background: red;
  color: white;
}

/* Add or update this CSS in your <style> section */
.sort-icons {
  display: flex;
  flex-direction: column;
  margin-left: 5px;
  z-index: 10; /* Ensure it's above other elements */
}

.sort-arrow {
  font-size: 0.9rem; /* Make slightly larger */
  color: #ffffff;
  padding: 3px; /* Add padding to increase clickable area */
  cursor: pointer !important; /* Force pointer cursor */
  user-select: none; /* Prevent text selection */
  transition: transform 0.2s, color 0.2s;
  line-height: 1;
  display: block; /* Ensure it takes up space */
}

.sort-arrow:hover {
  transform: scale(1.2);
  color: #ffc107; /* Highlight on hover */
}

.sort-arrow.active {
  color: #ffc107; /* Yellow for active sort */
  font-weight: bold;
}

.clickable-row:hover {
  background-color: rgba(220, 68, 5, 0.1) !important;
  transition: background-color 0.2s;
}
</style>
