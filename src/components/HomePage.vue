<template>
  <div>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 mb-4">Welcome to CRM System</h1>
      </v-col>
    </v-row>

    <v-row v-if="store.loading">
      <v-col cols="12" class="text-center">
        <v-progress-circular
          indeterminate
          color="primary"
          size="64"
        ></v-progress-circular>
      </v-col>
    </v-row>

    <template v-else>
      <v-row>
        <v-col cols="12" md="4">
          <v-card class="mb-4">
            <v-card-title class="bg-primary white--text">
              <v-icon left color="white">mdi-package-variant</v-icon>
              Items
            </v-card-title>
            <v-card-text class="text-h5 text-center py-4">
              {{ itemCount }} Items
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" md="4">
          <v-card class="mb-4">
            <v-card-title class="bg-success white--text">
              <v-icon left color="white">mdi-account-group</v-icon>
              Clients
            </v-card-title>
            <v-card-text class="text-h5 text-center py-4">
              {{ clientCount }} Clients
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" md="4">
          <v-card class="mb-4">
            <v-card-title class="bg-warning white--text">
              <v-icon left color="white">mdi-file-document</v-icon>
              Quotations
            </v-card-title>
            <v-card-text class="text-h5 text-center py-4">
              {{ quotationCount }} Quotations
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12" md="6">
          <v-card>
            <v-card-title>
              Recent Quotations
              <v-spacer></v-spacer>
              <v-btn color="primary" variant="text" to="/saved-quotations">
                View All
                <v-icon right>mdi-chevron-right</v-icon>
              </v-btn>
            </v-card-title>
            <v-list v-if="recentQuotations.length > 0">
              <v-list-item v-for="quotation in recentQuotations" :key="quotation.id">
                <v-list-item-title>{{ getClientName(quotation.clientId) }}</v-list-item-title>
                <v-list-item-subtitle>{{ formatDate(quotation.date) }}</v-list-item-subtitle>
                <template v-slot:append>
                  <v-chip :color="getStatusColor(quotation.status)" size="small">
                    {{ quotation.status }}
                  </v-chip>
                </template>
              </v-list-item>
            </v-list>
            <v-card-text v-else class="text-center py-4">
              No quotations yet
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" md="6">
          <v-card>
            <v-card-title>
              Pending Orders
              <v-spacer></v-spacer>
              <v-btn color="primary" variant="text" to="/pending-orders">
                View All
                <v-icon right>mdi-chevron-right</v-icon>
              </v-btn>
            </v-card-title>
            <v-list v-if="pendingOrders.length > 0">
              <v-list-item v-for="order in pendingOrders" :key="order.id">
                <v-list-item-title>{{ getClientName(order.clientId) }}</v-list-item-title>
                <v-list-item-subtitle>Order #{{ order.quotationNumber }}</v-list-item-subtitle>
                <template v-slot:append>
                  <v-chip color="warning" size="small">Pending</v-chip>
                </template>
              </v-list-item>
            </v-list>
            <v-card-text v-else class="text-center py-4">
              No pending orders
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useStore } from '../store';

const store = useStore();

// Load data when component is mounted
onMounted(async () => {
  try {
    await store.fetchAllData();
  } catch (error) {
    console.error('Error loading data:', error);
  }
});

// Computed properties
const itemCount = computed(() => store.items.length);
const clientCount = computed(() => store.clients.length);
const quotationCount = computed(() => store.quotations.length);

const recentQuotations = computed(() => {
  return store.quotations
    .slice()
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);
});

const pendingOrders = computed(() => {
  return store.orders
    .filter(order => order.paymentStatus === 'pending' || order.deliveryStatus === 'pending')
    .slice(0, 5);
});

// Helper functions
const getClientName = (clientId: string) => {
  const client = store.clients.find(c => c.id === clientId);
  return client ? client.name : 'Unknown Client';
};

const formatDate = (date: string | Date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    draft: 'grey',
    pending: 'warning',
    approved: 'success',
    rejected: 'error'
  };
  return colors[status.toLowerCase()] || 'grey';
};
</script>

<style scoped>
.v-card-text {
  padding-top: 0;
}
</style> 