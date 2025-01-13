<template>
  <v-app>
    <v-navigation-drawer
      v-model="drawer"
      :rail="rail"
      permanent
      @click="rail = false"
    >
      <v-list-item
        prepend-avatar="https://randomuser.me/api/portraits/men/85.jpg"
        :title="rail ? '' : 'CRM System'"
        :subtitle="rail ? '' : 'Admin Panel'"
        nav
      >
        <template v-slot:append>
          <v-btn
            variant="text"
            icon="mdi-chevron-left"
            @click.stop="rail = !rail"
          ></v-btn>
        </template>
      </v-list-item>

      <v-divider></v-divider>

      <v-list density="compact" nav>
        <v-list-item
          v-for="item in menuItems"
          :key="item.title"
          :value="item.title"
          :to="item.to"
          :prepend-icon="item.icon"
          :title="rail ? '' : item.title"
        ></v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-app-bar>
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
      <v-app-bar-title>{{ currentPageTitle }}</v-app-bar-title>
      <v-spacer></v-spacer>
      <v-btn icon>
        <v-icon>mdi-magnify</v-icon>
      </v-btn>
      <v-btn icon>
        <v-icon>mdi-bell</v-icon>
      </v-btn>
      <v-btn icon>
        <v-icon>mdi-account</v-icon>
      </v-btn>
    </v-app-bar>

    <v-main>
      <v-container fluid>
        <router-view></router-view>
      </v-container>
    </v-main>
  </v-app>

  <!-- Global Snackbar -->
  <v-snackbar
    v-model="store.snackbar.show"
    :color="store.snackbar.color"
    :timeout="3000"
  >
    {{ store.snackbar.text }}
    <template v-slot:actions>
      <v-btn
        color="white"
        variant="text"
        @click="store.snackbar.show = false"
      >
        Close
      </v-btn>
    </template>
  </v-snackbar>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useStore } from './store';

const store = useStore();
const drawer = ref(true);
const rail = ref(false);
const route = useRoute();

const menuItems = [
  {
    title: 'Dashboard',
    icon: 'mdi-view-dashboard',
    to: '/'
  },
  {
    title: 'Items',
    icon: 'mdi-package-variant',
    to: '/items'
  },
  {
    title: 'Clients',
    icon: 'mdi-account-group',
    to: '/clients'
  },
  {
    title: 'Employees',
    icon: 'mdi-account-tie',
    to: '/employees'
  },
  {
    title: 'Companies',
    icon: 'mdi-domain',
    to: '/companies'
  },
  {
    title: 'Create Quotation',
    icon: 'mdi-file-plus',
    to: '/quotation'
  },
  {
    title: 'Saved Quotations',
    icon: 'mdi-file-document',
    to: '/saved-quotations'
  },
  {
    title: 'Pending Orders',
    icon: 'mdi-truck-delivery',
    to: '/pending-orders'
  }
];

const currentPageTitle = computed(() => {
  const currentRoute = menuItems.find(item => item.to === route.path);
  return currentRoute ? currentRoute.title : 'CRM System';
});
</script>

<style>
.v-navigation-drawer__content::-webkit-scrollbar {
  width: 5px;
}

.v-navigation-drawer__content::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.v-navigation-drawer__content::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 5px;
}

.v-navigation-drawer__content::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>
