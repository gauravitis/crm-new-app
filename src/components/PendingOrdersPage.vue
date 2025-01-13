<template>
  <div>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 mb-4">Pending Orders</h1>
      </v-col>
    </v-row>

    <!-- Filters -->
    <v-row>
      <v-col cols="12" md="4">
        <v-text-field
          v-model="filters.search"
          label="Search Orders"
          prepend-inner-icon="mdi-magnify"
          clearable
          @update:model-value="applyFilters"
        ></v-text-field>
      </v-col>
      <v-col cols="12" md="4">
        <v-select
          v-model="filters.paymentStatus"
          :items="['All', 'Pending', 'Partial', 'Completed']"
          label="Payment Status"
          @update:model-value="applyFilters"
        ></v-select>
      </v-col>
      <v-col cols="12" md="4">
        <v-select
          v-model="filters.deliveryStatus"
          :items="['All', 'Pending', 'In Progress', 'Delivered']"
          label="Delivery Status"
          @update:model-value="applyFilters"
        ></v-select>
      </v-col>
    </v-row>

    <!-- Orders Table -->
    <v-data-table
      :headers="headers"
      :items="filteredOrders"
      :loading="loading"
      class="elevation-1"
    >
      <template v-slot:item.orderNumber="{ item }">
        {{ item.orderNumber }}
      </template>

      <template v-slot:item.quotationNumber="{ item }">
        {{ item.quotationNumber }}
      </template>

      <template v-slot:item.date="{ item }">
        {{ item.date ? new Date(item.date).toLocaleDateString() : 'N/A' }}
      </template>

      <template v-slot:item.clientId="{ item }">
        {{ getClientName(item.clientId) }}
      </template>

      <template v-slot:item.total="{ item }">
        ₹{{ (item.total || 0).toFixed(2) }}
      </template>

      <template v-slot:item.paymentStatus="{ item }">
        <v-chip
          :color="getPaymentStatusColor(item.paymentStatus)"
          size="small"
        >
          {{ item.paymentStatus }}
        </v-chip>
      </template>

      <template v-slot:item.deliveryStatus="{ item }">
        <v-chip
          :color="getDeliveryStatusColor(item.deliveryStatus)"
          size="small"
        >
          {{ item.deliveryStatus }}
        </v-chip>
      </template>

      <template v-slot:item.actions="{ item }">
        <v-tooltip text="View Details">
          <template v-slot:activator="{ props }">
            <v-icon
              v-bind="props"
              size="small"
              class="mr-2"
              @click="viewOrder(item)"
            >
              mdi-eye
            </v-icon>
          </template>
        </v-tooltip>
        <v-tooltip text="Update Payment">
          <template v-slot:activator="{ props }">
            <v-icon
              v-bind="props"
              size="small"
              class="mr-2"
              @click="openPaymentDialog(item)"
            >
              mdi-currency-inr
            </v-icon>
          </template>
        </v-tooltip>
        <v-tooltip text="Update Delivery">
          <template v-slot:activator="{ props }">
            <v-icon
              v-bind="props"
              size="small"
              @click="openDeliveryDialog(item)"
            >
              mdi-truck-delivery
            </v-icon>
          </template>
        </v-tooltip>
      </template>
    </v-data-table>

    <!-- View Order Dialog -->
    <v-dialog v-model="viewDialog" max-width="900px">
      <v-card>
        <v-card-title>
          <span class="text-h5">Order Details</span>
        </v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12" md="6">
              <p><strong>Order Number:</strong> {{ selectedOrder?.orderNumber || 'N/A' }}</p>
              <p><strong>Date:</strong> {{ selectedOrder?.date ? new Date(selectedOrder.date).toLocaleDateString() : 'N/A' }}</p>
              <p><strong>Client:</strong> {{ selectedOrder?.clientId ? getClientName(selectedOrder.clientId) : 'N/A' }}</p>
              <p><strong>Total Amount:</strong> ₹{{ selectedOrder?.total?.toFixed(2) || '0.00' }}</p>
            </v-col>
            <v-col cols="12" md="6">
              <p><strong>Payment Status:</strong> {{ selectedOrder?.paymentStatus || 'N/A' }}</p>
              <p><strong>Delivery Status:</strong> {{ selectedOrder?.deliveryStatus || 'N/A' }}</p>
              <p><strong>Paid Amount:</strong> ₹{{ selectedOrder?.paidAmount?.toFixed(2) || '0.00' }}</p>
              <p><strong>Balance:</strong> ₹{{ ((selectedOrder?.total || 0) - (selectedOrder?.paidAmount || 0)).toFixed(2) }}</p>
            </v-col>
          </v-row>

          <v-divider class="my-4"></v-divider>

          <h3 class="text-h6 mb-2">Items</h3>
          <v-table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in selectedOrder?.items" :key="item.itemId">
                <td>{{ getItemName(item.itemId) }}</td>
                <td>{{ item.quantity }}</td>
                <td>₹{{ item.price }}</td>
                <td>₹{{ item.total }}</td>
                <td>
                  <v-chip
                    :color="getDeliveryStatusColor(item.status)"
                    size="small"
                  >
                    {{ item.status }}
                  </v-chip>
                </td>
              </tr>
            </tbody>
          </v-table>

          <v-divider class="my-4"></v-divider>

          <h3 class="text-h6 mb-2">Payment History</h3>
          <v-table v-if="selectedOrder?.payments?.length">
            <thead>
              <tr>
                <th>Date</th>
                <th>Amount</th>
                <th>Mode</th>
                <th>Reference</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="payment in selectedOrder.payments" :key="payment.date">
                <td>{{ new Date(payment.date).toLocaleDateString() }}</td>
                <td>₹{{ payment.amount }}</td>
                <td>{{ payment.mode }}</td>
                <td>{{ payment.reference }}</td>
              </tr>
            </tbody>
          </v-table>
          <p v-else class="text-subtitle-1 text-grey">No payments recorded yet</p>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" variant="text" @click="viewDialog = false">
            Close
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Payment Dialog -->
    <v-dialog v-model="paymentDialog" max-width="500px">
      <v-card>
        <v-card-title>
          <span class="text-h5">Record Payment</span>
        </v-card-title>
        <v-card-text>
          <v-form ref="paymentForm" v-model="paymentValid">
            <v-text-field
              v-model.number="payment.amount"
              label="Amount*"
              type="number"
              prefix="₹"
              :rules="rules.amount"
              required
            ></v-text-field>
            <v-select
              v-model="payment.mode"
              :items="['Cash', 'Bank Transfer', 'Cheque', 'UPI']"
              label="Payment Mode*"
              :rules="rules.paymentMode"
              required
            ></v-select>
            <v-text-field
              v-model="payment.reference"
              label="Reference Number"
              hint="Transaction ID, Cheque number, etc."
              persistent-hint
            ></v-text-field>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey-darken-1" variant="text" @click="paymentDialog = false">
            Cancel
          </v-btn>
          <v-btn color="primary" variant="text" @click="recordPayment" :disabled="!paymentValid">
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delivery Dialog -->
    <v-dialog v-model="deliveryDialog" max-width="500px">
      <v-card>
        <v-card-title>
          <span class="text-h5">Update Delivery Status</span>
        </v-card-title>
        <v-card-text>
          <v-select
            v-model="newDeliveryStatus"
            :items="['pending', 'in progress', 'delivered']"
            label="Delivery Status*"
          ></v-select>
          <v-textarea
            v-model="deliveryNotes"
            label="Notes"
            rows="3"
            hint="Add any relevant delivery information"
            persistent-hint
          ></v-textarea>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey-darken-1" variant="text" @click="deliveryDialog = false">
            Cancel
          </v-btn>
          <v-btn color="primary" variant="text" @click="updateDeliveryStatus">
            Update
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snackbar -->
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      :timeout="3000"
    >
      {{ snackbar.text }}
      <template v-slot:actions>
        <v-btn
          color="white"
          variant="text"
          @click="snackbar.show = false"
        >
          Close
        </v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useStore } from '../store';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../services/firebase';

const store = useStore();
const loading = ref(false);
const viewDialog = ref(false);
const paymentDialog = ref(false);
const deliveryDialog = ref(false);
const selectedOrder = ref<Order | null>(null);
const paymentValid = ref(true);
const paymentForm = ref<any>(null);

const snackbar = ref({
  show: false,
  text: '',
  color: 'success'
});

const filters = ref({
  search: '',
  paymentStatus: 'All',
  deliveryStatus: 'All'
});

const payment = ref({
  amount: 0,
  mode: '',
  reference: '',
  date: new Date().toISOString()
});

const newDeliveryStatus = ref('');
const deliveryNotes = ref('');

const headers = [
  { title: 'Order #', key: 'orderNumber', align: 'start' },
  { title: 'Quotation #', key: 'quotationNumber' },
  { title: 'Date', key: 'date' },
  { title: 'Client', key: 'clientId' },
  { title: 'Total', key: 'total' },
  { title: 'Payment Status', key: 'paymentStatus' },
  { title: 'Delivery Status', key: 'deliveryStatus' },
  { title: 'Actions', key: 'actions', sortable: false }
];

onMounted(async () => {
  loading.value = true;
  await Promise.all([
    store.fetchOrders(),
    store.fetchClients(),
    store.fetchItems()
  ]);
  loading.value = false;
});

const filteredOrders = computed(() => {
  return store.orders.filter(order => {
    let matches = true;

    // Search filter
    if (filters.value.search) {
      const searchTerm = filters.value.search.toLowerCase();
      const clientName = getClientName(order.clientId).toLowerCase();
      matches = matches && (
        order.orderNumber?.toLowerCase().includes(searchTerm) ||
        order.quotationNumber?.toLowerCase().includes(searchTerm) ||
        clientName.includes(searchTerm)
      );
    }

    // Payment status filter
    if (filters.value.paymentStatus !== 'All') {
      matches = matches && order.paymentStatus?.toLowerCase() === filters.value.paymentStatus.toLowerCase();
    }

    // Delivery status filter
    if (filters.value.deliveryStatus !== 'All') {
      matches = matches && order.deliveryStatus?.toLowerCase() === filters.value.deliveryStatus.toLowerCase();
    }

    return matches;
  });
});

const getPaymentStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    pending: 'error',
    partial: 'warning',
    completed: 'success'
  };
  return colors[status.toLowerCase()] || 'grey';
};

const getDeliveryStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    pending: 'error',
    'in progress': 'warning',
    delivered: 'success'
  };
  return colors[status.toLowerCase()] || 'grey';
};

const getClientName = (clientId: string) => {
  if (!clientId) return 'Unknown Client';
  const client = store.clients.find(c => c.id === clientId);
  return client?.name || 'Unknown Client';
};

const getItemName = (itemId: string) => {
  const item = store.items.find(i => i.catalogueId === itemId);
  return item ? item.catalogueId : 'Unknown Item';
};

const viewOrder = (order: Order) => {
  selectedOrder.value = order;
  viewDialog.value = true;
};

const openPaymentDialog = (order: Order) => {
  selectedOrder.value = order;
  payment.value = {
    amount: 0,
    mode: '',
    reference: '',
    date: new Date().toISOString()
  };
  paymentDialog.value = true;
};

const openDeliveryDialog = (order: Order) => {
  selectedOrder.value = order;
  newDeliveryStatus.value = order.deliveryStatus;
  deliveryNotes.value = '';
  deliveryDialog.value = true;
};

const recordPayment = async () => {
  if (!paymentForm.value?.validate() || !selectedOrder.value?.id) return;

  try {
    const orderRef = doc(db, 'orders', selectedOrder.value.id);
    const newPaidAmount = (selectedOrder.value.paidAmount || 0) + payment.value.amount;
    const newPaymentStatus = newPaidAmount >= (selectedOrder.value.total || 0) ? 'completed' : 'partial';

    await updateDoc(orderRef, {
      payments: arrayUnion(payment.value),
      paidAmount: newPaidAmount,
      paymentStatus: newPaymentStatus
    });

    await store.fetchOrders();
    paymentDialog.value = false;

    snackbar.value = {
      show: true,
      text: 'Payment recorded successfully!',
      color: 'success'
    };
  } catch (error) {
    console.error('Error recording payment:', error);
    snackbar.value = {
      show: true,
      text: 'Error recording payment. Please try again.',
      color: 'error'
    };
  }
};

const updateDeliveryStatus = async () => {
  if (!selectedOrder.value?.id) return;

  try {
    const orderRef = doc(db, 'Orders', selectedOrder.value.id);
    await updateDoc(orderRef, {
      deliveryStatus: newDeliveryStatus.value,
      deliveryNotes: deliveryNotes.value || null,
      lastUpdated: new Date()
    });

    await store.fetchOrders();
    deliveryDialog.value = false;

    snackbar.value = {
      show: true,
      text: 'Delivery status updated successfully!',
      color: 'success'
    };
  } catch (error) {
    console.error('Error updating delivery status:', error);
    snackbar.value = {
      show: true,
      text: 'Error updating delivery status. Please try again.',
      color: 'error'
    };
  }
};

const applyFilters = () => {
  // The computed property filteredOrders will automatically update
};

interface OrderItem {
  itemId: string;
  quantity: number;
  price: number;
  total: number;
  status: string;
}

interface Payment {
  amount: number;
  mode: string;
  reference: string;
  date: string;
}

interface Order {
  id: string;
  orderNumber: string;
  quotationNumber: string;
  clientId: string;
  employeeId: string;
  date: string;
  items: OrderItem[];
  total: number;
  paidAmount: number;
  paymentStatus: string;
  deliveryStatus: string;
  payments?: Payment[];
  deliveryNotes?: string;
  createdAt: Date;
}

const rules = {
  amount: [
    (v: number) => !!v || 'Amount is required',
    (v: number) => v > 0 || 'Amount must be greater than 0',
    (v: number) => {
      if (!selectedOrder.value) return true;
      const balance = (selectedOrder.value.total || 0) - (selectedOrder.value.paidAmount || 0);
      return v <= balance || 'Amount exceeds balance';
    }
  ],
  paymentMode: [(v: string) => !!v || 'Payment mode is required']
};
</script>

<style scoped>
.v-data-table {
  margin-top: 1rem;
}
</style> 