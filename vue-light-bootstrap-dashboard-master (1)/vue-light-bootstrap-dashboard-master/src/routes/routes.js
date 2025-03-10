import DashboardLayout from '../layout/DashboardLayout.vue'
// GeneralViews
import NotFound from '../pages/NotFoundPage.vue'

// Admin pages
import Overview from 'src/pages/Overview.vue'
import UserProfile from 'src/pages/UserProfile.vue'
import TableList from 'src/pages/TableList.vue'
import Typography from 'src/pages/Typography.vue'
import Icons from 'src/pages/Icons.vue'
import Maps from 'src/pages/Maps.vue'
import Notifications from 'src/pages/Notifications.vue'
import Upgrade from 'src/pages/Upgrade.vue'
import Login from 'src/pages/Login.vue'
import CreateProduct from '../pages/CreateProduct.vue'
import EditProduct from '../pages/UserProfile/EditProduct.vue'
import CreateRequest from '../pages/CreateRequest.vue'
import ViewRequestDetails from '../pages/ViewRequestDetails.vue'
import EditRequest from '../pages/EditRequest.vue'
import RequestHistoryTable from '../pages/RequestHistoryTable.vue'
import ViewAllRequests from '../pages/ViewAllRequests.vue'
const routes = [
  {
    path: '/',
    component: Login
  },
  {
    path: '/login',
    component: Login
  },
  {
    path: '/admin',
    component: DashboardLayout,
    redirect: '/admin/overview',
    meta: { requiresAuth: true }, // Thêm meta yêu cầu xác thực
    children: [
      {
        path: 'overview',
        name: 'Overview',
        component: Overview,
        meta: { requiresAuth: true }
      },
      {
        path: 'user',
        name: 'User',
        component: UserProfile,
        meta: { requiresAuth: true }
      },
      {
        path: 'table-list',
        name: 'Table List',
        component: TableList,
        meta: { requiresAuth: true }
      },
      {
        path: 'request-table',
        name: 'Request Table',
        component: RequestHistoryTable,
        meta: { requiresAuth: true }
      },
      {
        path: 'typography',
        name: 'Typography',
        component: Typography,
        meta: { requiresAuth: true }
      },
      {
        path: 'icons',
        name: 'Icons',
        component: Icons,
        meta: { requiresAuth: true }
      },
      {
        path: 'maps',
        name: 'Maps',
        component: Maps,
        meta: { requiresAuth: true }
      },
      {
        path: 'notifications',
        name: 'Notifications',
        component: Notifications,
        meta: { requiresAuth: true }
      },
      {
        path: 'upgrade',
        name: 'Upgrade to PRO',
        component: Upgrade,
        meta: { requiresAuth: true }
      },
      {
        path: 'createproduct',
        name: 'Create Product',
        component: CreateProduct,
        meta: { requiresAuth: true }
      },
      {
        path: 'editproduct/:id',
        name: 'Edit Product',
        component: EditProduct,
        meta: { requiresAuth: true }
      },
      {
        path: 'createrequest',
        name: 'Create Request',
        component: CreateRequest,
        meta: { requiresAuth: true }
      },
      {
        path: 'viewrequest/:id',
        name: 'View Request',
        component: ViewRequestDetails,
        meta: { requiresAuth: true }
      },
      {
        path: 'editrequest/:id',
        name: 'Edit Request',
        component: EditRequest,
        meta: { requiresAuth: true }
      },
      {
        path: 'view-all-request',
        name: 'View All Request',
        component: ViewAllRequests,
        meta: {requiresAuth: true}
      }
      
    ]
  },
  { path: '*', component: NotFound }
]

export default routes



