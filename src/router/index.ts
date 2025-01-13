import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../components/HomePage.vue')
  },
  {
    path: '/items',
    name: 'Items',
    component: () => import('../components/ItemsPage.vue')
  },
  {
    path: '/clients',
    name: 'Clients',
    component: () => import('../components/ClientsPage.vue')
  },
  {
    path: '/employees',
    name: 'Employees',
    component: () => import('../components/EmployeesPage.vue')
  },
  {
    path: '/companies',
    name: 'Companies',
    component: () => import('../components/CompaniesPage.vue')
  },
  {
    path: '/quotation',
    name: 'CreateQuotation',
    component: () => import('../components/QuotationPage.vue')
  },
  {
    path: '/saved-quotations',
    name: 'SavedQuotations',
    component: () => import('../components/SavedQuotationsPage.vue')
  },
  {
    path: '/pending-orders',
    name: 'PendingOrders',
    component: () => import('../components/PendingOrdersPage.vue')
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../components/NotFoundPage.vue')
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router; 