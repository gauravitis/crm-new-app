<template>
  <div>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 mb-4">Saved Quotations</h1>
      </v-col>
    </v-row>

    <!-- Filters -->
    <v-row>
      <v-col cols="12" md="3">
        <v-text-field
          v-model="filters.search"
          label="Search Quotations"
          prepend-inner-icon="mdi-magnify"
          clearable
          @update:model-value="applyFilters"
        ></v-text-field>
      </v-col>
      <v-col cols="12" md="3">
        <v-select
          v-model="filters.status"
          :items="['All', 'Pending', 'Approved', 'Rejected']"
          label="Status"
          @update:model-value="applyFilters"
        ></v-select>
      </v-col>
      <v-col cols="12" md="3">
        <v-text-field
          v-model="filters.dateFrom"
          label="Date From"
          type="date"
          @update:model-value="applyFilters"
        ></v-text-field>
      </v-col>
      <v-col cols="12" md="3">
        <v-text-field
          v-model="filters.dateTo"
          label="Date To"
          type="date"
          @update:model-value="applyFilters"
        ></v-text-field>
      </v-col>
    </v-row>

    <!-- Quotations Table -->
    <v-data-table
      :headers="headers"
      :items="filteredQuotations"
      :loading="loading"
      class="elevation-1"
    >
      <template v-slot:item.date="{ item }">
        {{ formatDate(item.date) }}
      </template>

      <template v-slot:item.total="{ item }">
        ₹{{ (item.total || 0).toFixed(2) }}
      </template>

      <template v-slot:item.clientId="{ item }">
        {{ getClientName(item.clientId) }}
      </template>

      <template v-slot:item.status="{ item }">
        <v-chip
          :color="getStatusColor(item.status)"
          size="small"
        >
          {{ item.status }}
        </v-chip>
      </template>

      <template v-slot:item.actions="{ item }">
        <v-tooltip text="View Details">
          <template v-slot:activator="{ props }">
            <v-icon
              v-bind="props"
              size="small"
              class="mr-2"
              @click="viewQuotation(item)"
            >
              mdi-eye
            </v-icon>
          </template>
        </v-tooltip>
        <v-tooltip text="Download PDF">
          <template v-slot:activator="{ props }">
            <v-icon
              v-bind="props"
              size="small"
              class="mr-2"
              @click="downloadPDF(item)"
            >
              mdi-file-pdf-box
            </v-icon>
          </template>
        </v-tooltip>
        <v-tooltip text="Download Word">
          <template v-slot:activator="{ props }">
            <v-icon
              v-bind="props"
              size="small"
              class="mr-2"
              @click="downloadWord(item)"
            >
              mdi-file-word-box
            </v-icon>
          </template>
        </v-tooltip>
        <v-tooltip text="Update Status">
          <template v-slot:activator="{ props }">
            <v-icon
              v-bind="props"
              size="small"
              @click="openStatusDialog(item)"
            >
              mdi-pencil
            </v-icon>
          </template>
        </v-tooltip>
      </template>
    </v-data-table>

    <!-- View Quotation Dialog -->
    <v-dialog v-model="viewDialog" max-width="900px">
      <v-card>
        <v-card-title>
          <span class="text-h5">Quotation Details</span>
        </v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12" md="6">
              <p><strong>Quotation Number:</strong> {{ selectedQuotation?.quotationNumber }}</p>
              <p><strong>Date:</strong> {{ selectedQuotation?.date ? formatDate(selectedQuotation.date) : 'N/A' }}</p>
              <p><strong>Valid Until:</strong> {{ selectedQuotation?.validUntil ? formatDate(selectedQuotation.validUntil) : 'N/A' }}</p>
              <p><strong>Status:</strong> {{ selectedQuotation?.status }}</p>
            </v-col>
            <v-col cols="12" md="6">
              <p><strong>Client:</strong> {{ selectedQuotation?.clientId ? getClientName(selectedQuotation.clientId) : 'N/A' }}</p>
              <p><strong>Sales Representative:</strong> {{ selectedQuotation?.employeeId ? getEmployeeName(selectedQuotation.employeeId) : 'N/A' }}</p>
              <p><strong>Total Amount:</strong> ₹{{ selectedQuotation?.total?.toFixed(2) || '0.00' }}</p>
            </v-col>
          </v-row>

          <v-divider class="my-4"></v-divider>

          <h3 class="text-h6 mb-2">Items</h3>
          <v-table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Quantity</th>
                <th>Unit Rate</th>
                <th>Discount %</th>
                <th>Discounted Rate</th>
                <th>GST %</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in selectedQuotation?.items" :key="item.catalogueId">
                <td>{{ getItemName(item.catalogueId) }}</td>
                <td>{{ item.quantity }}</td>
                <td>₹{{ item.unitRate?.toFixed(2) }}</td>
                <td>{{ item.discountPercentage }}%</td>
                <td>₹{{ item.discountedRate?.toFixed(2) }}</td>
                <td>{{ item.gstPercentage }}%</td>
                <td>₹{{ item.totalPrice?.toFixed(2) }}</td>
              </tr>
            </tbody>
          </v-table>

          <v-divider class="my-4"></v-divider>

          <v-row>
            <v-col cols="12" md="6" offset-md="6">
              <div class="d-flex justify-space-between mb-2">
                <strong>Subtotal:</strong>
                <span>₹{{ selectedQuotation?.subtotal?.toFixed(2) || '0.00' }}</span>
              </div>
              <div class="d-flex justify-space-between mb-2">
                <strong>Total GST:</strong>
                <span>₹{{ selectedQuotation?.totalGst?.toFixed(2) || '0.00' }}</span>
              </div>
              <v-divider class="my-2"></v-divider>
              <div class="d-flex justify-space-between">
                <strong>Grand Total:</strong>
                <span>₹{{ selectedQuotation?.total?.toFixed(2) || '0.00' }}</span>
              </div>
            </v-col>
          </v-row>

          <v-divider class="my-4"></v-divider>

          <h3 class="text-h6 mb-2">Terms and Notes</h3>
          <p><strong>Payment Terms:</strong></p>
          <p class="ml-4">{{ selectedQuotation?.paymentTerms || 'N/A' }}</p>
          <p><strong>Terms and Conditions:</strong></p>
          <p class="ml-4">{{ selectedQuotation?.commonTerms || 'N/A' }}</p>
          <p v-if="selectedQuotation?.notes"><strong>Additional Notes:</strong></p>
          <p class="ml-4">{{ selectedQuotation?.notes }}</p>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" variant="text" @click="viewDialog = false">
            Close
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Update Status Dialog -->
    <v-dialog v-model="statusDialog" max-width="400px">
      <v-card>
        <v-card-title>
          <span class="text-h5">Update Status</span>
        </v-card-title>
        <v-card-text>
          <v-select
            v-model="newStatus"
            :items="['pending', 'approved', 'rejected']"
            label="Status"
          ></v-select>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey-darken-1" variant="text" @click="statusDialog = false">
            Cancel
          </v-btn>
          <v-btn color="primary" variant="text" @click="updateStatus">
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
import { doc, updateDoc, addDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';
import { jsPDF } from 'jspdf';
import { generateWordDocument } from '../utils/documentGenerator';

// Add Company interface
interface Company {
  id: string;
  name: string;
  address: string;
  email: string;
  phone: string;
  gstNumber: string;
}

// Add QuotationItem interface
interface QuotationItem {
  catalogueId: string;
  description: string;
  packSize: string;
  quantity: number;
  unitRate: number;
  discountPercentage: number;
  discountedRate: number;
  extendedRate: number;
  gstPercentage: number;
  totalGst: number;
  totalPrice: number;
}

// Update Quotation interface
interface Quotation {
  id: string;
  quotationNumber: string;
  employeeId: string;
  clientId: string;
  date: string;
  validUntil: string;
  items: QuotationItem[];
  paymentTerms: string;
  commonTerms: string;
  notes: string;
  status: string;
  subtotal: number;
  totalGst: number;
  total: number;
  createdAt: Date;
}

const store = useStore();
const loading = ref(false);
const viewDialog = ref(false);
const statusDialog = ref(false);
const selectedQuotation = ref<Quotation | null>(null);
const newStatus = ref('');
const snackbar = ref({
  show: false,
  text: '',
  color: 'success'
});

const filters = ref({
  search: '',
  status: 'All',
  dateFrom: '',
  dateTo: ''
});

const headers = [
  { 
    title: 'Quotation #',
    key: 'quotationNumber',
    sortable: true
  },
  { 
    title: 'Date',
    key: 'date',
    sortable: true
  },
  { 
    title: 'Client',
    key: 'clientId',
    sortable: true
  },
  { 
    title: 'Total',
    key: 'total',
    sortable: true,
    align: 'end'
  },
  { 
    title: 'Status',
    key: 'status',
    sortable: true
  },
  { 
    title: 'Actions',
    key: 'actions',
    sortable: false,
    align: 'center'
  }
];

const companies = ref<Company[]>([]);

// Add fetchCompanies function
const fetchCompanies = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'Companies'));
    companies.value = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Company));
  } catch (error) {
    console.error('Error fetching companies:', error);
  }
};

onMounted(async () => {
  loading.value = true;
  await Promise.all([
    store.fetchQuotations(),
    store.fetchClients(),
    store.fetchEmployees(),
    fetchCompanies()
  ]);
  console.log('Fetched quotations:', store.quotations);
  loading.value = false;
});

const filteredQuotations = computed(() => {
  return store.quotations.filter(quotation => {
    let matches = true;

    // Search filter
    if (filters.value.search) {
      const searchTerm = filters.value.search.toLowerCase();
      matches = matches && (
        quotation.quotationNumber.toLowerCase().includes(searchTerm) ||
        getClientName(quotation.clientId).toLowerCase().includes(searchTerm)
      );
    }

    // Status filter
    if (filters.value.status !== 'All') {
      matches = matches && quotation.status.toLowerCase() === filters.value.status.toLowerCase();
    }

    // Date range filter
    if (filters.value.dateFrom) {
      matches = matches && new Date(quotation.date) >= new Date(filters.value.dateFrom);
    }
    if (filters.value.dateTo) {
      matches = matches && new Date(quotation.date) <= new Date(filters.value.dateTo);
    }

    return matches;
  });
});

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    pending: 'warning',
    approved: 'success',
    rejected: 'error'
  };
  return colors[status.toLowerCase()] || 'grey';
};

const getClientName = (clientId: string) => {
  const client = store.clients.find(c => c.id === clientId);
  return client ? client.name : 'Unknown Client';
};

const getEmployeeName = (employeeId: string) => {
  const employee = store.employees.find(e => e.id === employeeId);
  return employee ? employee.name : 'Unknown Employee';
};

const getItemName = (itemId: string) => {
  const item = store.items.find(i => i.id === itemId);
  return item ? item.catalogueId : 'Unknown Item';
};

const viewQuotation = (quotation: any) => {
  selectedQuotation.value = quotation;
  viewDialog.value = true;
};

const openStatusDialog = (quotation: any) => {
  selectedQuotation.value = quotation;
  newStatus.value = quotation.status;
  statusDialog.value = true;
};

const updateStatus = async () => {
  if (!selectedQuotation.value?.id) return;
  
  try {
    const quotationRef = doc(db, 'Quotations', selectedQuotation.value.id);
    await updateDoc(quotationRef, {
      status: newStatus.value
    });

    // If the quotation is approved, create a new order
    if (newStatus.value.toLowerCase() === 'approved') {
      const orderData = {
        quotationId: selectedQuotation.value.id,
        quotationNumber: selectedQuotation.value.quotationNumber,
        clientId: selectedQuotation.value.clientId,
        employeeId: selectedQuotation.value.employeeId,
        items: selectedQuotation.value.items.map(item => ({
          ...item,
          status: 'pending'
        })),
        date: new Date().toISOString(),
        total: selectedQuotation.value.total,
        paidAmount: 0,
        paymentStatus: 'pending',
        deliveryStatus: 'pending',
        createdAt: new Date(),
        status: 'pending'
      };

      await addDoc(collection(db, 'orders'), orderData);
    }
    
    await Promise.all([
      store.fetchQuotations(),
      store.fetchOrders()
    ]);
    
    statusDialog.value = false;
    snackbar.value = {
      show: true,
      text: 'Status updated successfully!',
      color: 'success'
    };
  } catch (error) {
    console.error('Error updating status:', error);
    snackbar.value = {
      show: true,
      text: 'Error updating status. Please try again.',
      color: 'error'
    };
  }
};

const downloadPDF = async (quotation: any) => {
  try {
    const doc = new jsPDF();
    
    // Add company header
    doc.setFontSize(20);
    doc.text('Company Name', 105, 20, { align: 'center' });
    
    // Add quotation details
    doc.setFontSize(12);
    doc.text(`Quotation #: ${quotation.quotationNumber}`, 20, 40);
    doc.text(`Date: ${formatDate(quotation.date)}`, 20, 50);
    doc.text(`Valid Until: ${formatDate(quotation.validUntil)}`, 20, 60);
    
    // Add client details
    const client = store.clients.find(c => c.id === quotation.clientId);
    doc.text('Client Details:', 20, 80);
    doc.text(`Name: ${client?.name || 'N/A'}`, 30, 90);
    doc.text(`Company: ${client?.company || 'N/A'}`, 30, 100);
    doc.text(`Address: ${client?.address || 'N/A'}`, 30, 110);
    
    // Add items table
    let yPos = 140;
    doc.text('Items:', 20, yPos);
    yPos += 10;
    
    // Table headers
    doc.text('Item', 20, yPos);
    doc.text('Qty', 90, yPos);
    doc.text('Rate', 120, yPos);
    doc.text('GST', 150, yPos);
    doc.text('Total', 180, yPos);
    
    yPos += 10;
    
    // Table content
    quotation.items?.forEach((item: any) => {
      const itemName = getItemName(item.catalogueId);
      doc.text(itemName, 20, yPos);
      doc.text(item.quantity?.toString() || '0', 90, yPos);
      doc.text(`₹${item.unitRate?.toFixed(2) || '0.00'}`, 120, yPos);
      doc.text(`${item.gstPercentage || 0}%`, 150, yPos);
      doc.text(`₹${item.totalPrice?.toFixed(2) || '0.00'}`, 180, yPos);
      yPos += 10;
    });
    
    // Add totals
    yPos += 10;
    doc.text(`Subtotal: ₹${quotation.subtotal?.toFixed(2) || '0.00'}`, 120, yPos);
    yPos += 10;
    doc.text(`Total GST: ₹${quotation.totalGst?.toFixed(2) || '0.00'}`, 120, yPos);
    yPos += 10;
    doc.text(`Grand Total: ₹${quotation.total?.toFixed(2) || '0.00'}`, 120, yPos);
    
    // Add terms and conditions
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }
    
    yPos += 20;
    doc.text('Terms and Conditions:', 20, yPos);
    yPos += 10;
    
    // Payment terms
    doc.text(`Payment Terms: ${quotation.paymentTerms || 'N/A'}`, 30, yPos);
    yPos += 10;

    // Common terms
    const terms = (quotation.commonTerms || '').split('\n');
    terms.forEach((term: string) => {
      if (term.trim()) {
        doc.text(term, 30, yPos);
        yPos += 10;
      }
    });
    
    // Additional notes if any
    if (quotation.notes) {
      yPos += 10;
      doc.text('Additional Notes:', 20, yPos);
      yPos += 10;
      doc.text(quotation.notes, 30, yPos);
    }
    
    // Save the PDF
    doc.save(`Quotation-${quotation.quotationNumber}.pdf`);
    
    snackbar.value = {
      show: true,
      text: 'PDF downloaded successfully!',
      color: 'success'
    };
  } catch (error) {
    console.error('Error generating PDF:', error);
    snackbar.value = {
      show: true,
      text: 'Error generating PDF. Please try again.',
      color: 'error'
    };
  }
};

const downloadWord = async (quotation: any) => {
  try {
    const client = store.clients.find(c => c.id === quotation.clientId);
    const employee = store.employees.find(e => e.id === quotation.employeeId);
    const company = companies.value.find(c => c.id === quotation.company);

    if (!client || !employee || !company) {
      throw new Error('Missing required details');
    }

    const quotationData = {
      company: {
        name: company.name,
        address: company.address,
        email: company.email,
        phone: company.phone,
        gst: company.gstNumber
      },
      quotationNumber: quotation.quotationNumber,
      date: formatDate(quotation.date),
      validUntil: formatDate(quotation.validUntil),
      client: {
        name: client.name,
        company: client.company,
        address: client.address,
        email: client.email,
        phone: client.phone,
        gst: client.gst
      },
      items: quotation.items.map((item: any) => ({
        catalogueId: item.catalogueId || '',
        description: item.description || '',
        packSize: item.packSize || '',
        quantity: item.quantity || 0,
        unitRate: item.unitRate || 0,
        discountPercentage: item.discountPercentage || 0,
        discountedRate: item.discountedRate || 0,
        gstPercentage: item.gstPercentage || 0,
        totalGST: item.totalGst || 0,
        total: item.totalPrice || 0
      })),
      subtotal: quotation.subtotal || 0,
      totalGST: quotation.totalGst || 0,
      grandTotal: quotation.total || 0,
      paymentTerms: quotation.paymentTerms || '',
      commonTerms: quotation.commonTerms || '',
      notes: quotation.notes || '',
      createdBy: {
        name: employee.name,
        email: employee.email,
        mobile: employee.mobile
      }
    };

    await generateWordDocument(quotationData);

    snackbar.value = {
      show: true,
      text: 'Word document downloaded successfully!',
      color: 'success'
    };
  } catch (error) {
    console.error('Error generating Word document:', error);
    snackbar.value = {
      show: true,
      text: 'Error generating Word document. Please try again.',
      color: 'error'
    };
  }
};

const applyFilters = () => {
  // The computed property filteredQuotations will automatically update
};

const formatDate = (date: string | undefined) => {
  if (!date) return 'N/A';
  try {
    return new Date(date).toLocaleDateString();
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid Date';
  }
};
</script>

<style scoped>
.v-data-table {
  margin-top: 1rem;
}
</style> 