<template>
  <div>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 mb-4">Create Quotation</h1>
      </v-col>
    </v-row>

    <v-form ref="form" v-model="valid">
      <!-- Company, Employee, and Client Selection -->
      <v-card class="mb-4">
        <v-card-title>Basic Details</v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12" md="4">
              <v-text-field
                v-model="quotationNumber"
                label="Quotation Number"
                readonly
                density="compact"
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="4">
              <v-select
                v-model="quotation.company"
                :items="companies"
                item-title="name"
                item-value="id"
                label="Select Company*"
                :rules="[(v: string | null) => !!v || 'Company is required']"
                required
                @update:model-value="handleCompanySelect"
              ></v-select>
            </v-col>
            <v-col cols="12" md="4">
              <v-select
                v-model="quotation.employeeId"
                :items="store.employees"
                item-title="name"
                item-value="id"
                label="Select Employee*"
                :rules="[(v: string | null) => !!v || 'Employee is required']"
                required
              ></v-select>
            </v-col>
            <v-col cols="12" md="4">
              <v-autocomplete
                v-model="quotation.clientId"
                :items="store.clients"
                item-title="name"
                item-value="id"
                label="Select Client*"
                :rules="[(v: string | null) => !!v || 'Client is required']"
                required
                @update:model-value="handleClientSelect"
              ></v-autocomplete>
            </v-col>
          </v-row>

          <!-- Client Details Display -->
          <v-row v-if="selectedClient">
            <v-col cols="12" md="6">
              <div class="text-subtitle-1">Client Details:</div>
              <div>Company: {{ selectedClient.company }}</div>
              <div>Address: {{ selectedClient.address }}</div>
            </v-col>
            <v-col cols="12" md="6">
              <div>Email: {{ selectedClient.email }}</div>
              <div>Phone: {{ selectedClient.phone }}</div>
              <div>GST: {{ selectedClient.gst }}</div>
            </v-col>
          </v-row>

          <!-- Add Company Details Display -->
          <v-col v-if="quotation.companyDetails" cols="12">
            <v-divider class="my-4"></v-divider>
            <div class="text-subtitle-1 mb-2">Company Details:</div>
            <v-row>
              <v-col cols="12" md="6">
                <div>Address: {{ quotation.companyDetails.address }}</div>
                <div>GST Number: {{ quotation.companyDetails.gstNumber }}</div>
                <div>Email: {{ quotation.companyDetails.email }}</div>
                <div>Phone: {{ quotation.companyDetails.phone }}</div>
              </v-col>
              <v-col cols="12" md="6">
                <div>Bank: {{ quotation.companyDetails.bankName }}</div>
                <div>Account: {{ quotation.companyDetails.accountNumber }}</div>
                <div>IFSC: {{ quotation.companyDetails.ifscCode }}</div>
                <div>Branch: {{ quotation.companyDetails.branchName }}</div>
              </v-col>
            </v-row>
          </v-col>
        </v-card-text>
      </v-card>

      <!-- Items Section -->
      <v-card class="mb-4">
        <v-card-title class="d-flex align-center">
          Items
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            @click="addItem"
          >
            <v-icon start>mdi-plus</v-icon>
            Add Item
          </v-btn>
        </v-card-title>
        <v-card-text>
          <v-row v-for="(item, index) in quotation.items" :key="index" class="mb-4">
            <v-col cols="12">
              <div class="d-flex justify-space-between align-center">
                <div class="text-h6">Item {{ index + 1 }}</div>
                <v-btn
                  icon
                  color="error"
                  variant="text"
                  @click="removeItem(index)"
                >
                  <v-icon>mdi-delete</v-icon>
                </v-btn>
              </div>
            </v-col>
            <v-col cols="12" md="6">
              <v-autocomplete
                v-model="item.catalogueId"
                :items="store.items"
                item-title="catalogueId"
                item-value="id"
                label="Select Item*"
                :rules="[(v: string | null) => !!v || 'Item is required']"
                required
                @update:model-value="(val: string) => handleItemSelect(val, index)"
              ></v-autocomplete>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="item.description"
                label="Description"
                readonly
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="3">
              <v-text-field
                v-model="item.packSize"
                label="Pack Size"
                readonly
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="3">
              <v-text-field
                v-model.number="item.quantity"
                type="number"
                label="Quantity*"
                :rules="[/* eslint-disable-next-line */
                  (v: number | null) => !!v || 'Quantity is required',
                  (v: number | null) => (v && v > 0) || 'Quantity must be greater than 0'
                ]"
                required
                @input="calculateItemTotals(index)"
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="3">
              <v-text-field
                v-model.number="item.unitRate"
                type="number"
                label="Unit Rate*"
                prefix="₹"
                readonly
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="3">
              <v-text-field
                v-model.number="item.discountPercentage"
                type="number"
                label="Discount %"
                suffix="%"
                @input="calculateItemTotals(index)"
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="3">
              <v-text-field
                v-model.number="item.discountedRate"
                type="number"
                label="Discounted Rate"
                prefix="₹"
                readonly
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="3">
              <v-text-field
                v-model.number="item.extendedRate"
                type="number"
                label="Extended Rate"
                prefix="₹"
                readonly
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="3">
              <v-text-field
                v-model.number="item.gstPercentage"
                type="number"
                label="GST %"
                suffix="%"
                @input="calculateItemTotals(index)"
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="3">
              <v-text-field
                v-model.number="item.totalGst"
                type="number"
                label="Total GST"
                prefix="₹"
                readonly
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="3">
              <v-text-field
                v-model.number="item.totalPrice"
                type="number"
                label="Total Price"
                prefix="₹"
                readonly
              ></v-text-field>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <!-- Totals Section -->
      <v-card class="mb-4">
        <v-card-title>Totals</v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12" md="4" offset-md="8">
              <v-text-field
                v-model="subtotal"
                label="Subtotal"
                prefix="₹"
                readonly
                density="compact"
              ></v-text-field>
              <v-text-field
                v-model="totalGst"
                label="Total GST"
                prefix="₹"
                readonly
                density="compact"
              ></v-text-field>
              <v-divider class="my-2"></v-divider>
              <v-text-field
                v-model="grandTotal"
                label="Grand Total"
                prefix="₹"
                readonly
                density="compact"
                class="text-h6"
              ></v-text-field>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <!-- Terms and Notes -->
      <v-card class="mb-4">
        <v-card-title>Terms and Notes</v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12" md="6">
              <v-select
                v-model="quotation.paymentTerms"
                :items="paymentTermsOptions"
                label="Payment Terms*"
                :rules="[(v: string | null) => !!v || 'Payment terms are required']"
                required
              ></v-select>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12">
              <v-textarea
                v-model="quotation.commonTerms"
                label="Common Terms and Conditions"
                rows="4"
                readonly
              ></v-textarea>
            </v-col>
            <v-col cols="12">
              <v-textarea
                v-model="quotation.notes"
                label="Additional Notes"
                rows="4"
              ></v-textarea>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <!-- Action Buttons -->
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          color="primary"
          :loading="loading"
          :disabled="!valid"
          @click="saveQuotation"
        >
          Save Quotation
        </v-btn>
        <v-btn
          color="primary"
          :loading="loading"
          :disabled="!valid"
          @click="downloadQuotation"
        >
          Download Quotation
        </v-btn>
      </v-card-actions>
    </v-form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useStore } from '../store';
import { collection, addDoc, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';
import { generatePDFDocument, generateWordDocument } from '../utils/documentGenerator';

const store = useStore();
const form = ref<any>(null);
const valid = ref(true);
const loading = ref(false);
const quotationNumber = ref('');

// Replace the companies array with a ref
const companies = ref<Company[]>([]);

// Add Company interface
interface Company {
  id: string;
  name: string;
  address: string;
  gstNumber: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  branchName: string;
  email: string;
  phone: string;
  logo?: string;
}

// Add function to fetch companies
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

// Payment terms options
const paymentTermsOptions = [
  '50% Advance, Balance before delivery',
  '100% Advance',
  'Net 30 days',
  'Net 45 days',
  'Net 60 days'
];

// Default quotation state
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

// Update the quotation interface to include company details
interface Quotation {
  company: string; // This will now store the company ID
  companyDetails?: Company; // Store the full company details
  employeeId: string;
  clientId: string;
  items: QuotationItem[];
  paymentTerms: string;
  commonTerms: string;
  notes: string;
  status: 'Draft' | 'Sent' | 'Approved' | 'Rejected';
}

const quotation = ref<Quotation>({
  company: '',
  employeeId: '',
  clientId: '',
  items: [],
  paymentTerms: '',
  commonTerms: store.commonTerms,
  notes: '',
  status: 'Draft'
});

// Computed properties
const selectedClient = computed(() =>
  store.clients.find(client => client.id === quotation.value.clientId)
);

const subtotal = computed(() => {
  return quotation.value.items.reduce((sum, item) => sum + (item.extendedRate || 0), 0);
});

const totalGst = computed(() => {
  return quotation.value.items.reduce((sum, item) => sum + (item.totalGst || 0), 0);
});

const grandTotal = computed(() => {
  return quotation.value.items.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
});

// Add company selection handler
const handleCompanySelect = (companyId: string) => {
  const selectedCompany = companies.value.find(company => company.id === companyId);
  if (selectedCompany) {
    quotation.value.companyDetails = selectedCompany;
  }
};

// Initialize companies on component mount
onMounted(async () => {
  try {
    quotationNumber.value = await generateQuotationNumber();
    await fetchCompanies();
  } catch (error) {
    console.error('Error in component initialization:', error);
  }
});

// Methods
const handleClientSelect = (clientId: string) => {
  // Additional client selection logic if needed
};

const handleItemSelect = (itemId: string, index: number) => {
  const selectedItem = store.items.find(item => item.id === itemId);
  if (selectedItem && quotation.value.items[index]) {
    quotation.value.items[index] = {
      ...quotation.value.items[index],
      description: selectedItem.description,
      packSize: selectedItem.packSize,
      unitRate: selectedItem.price,
      quantity: 1,
      discountPercentage: 0,
      gstPercentage: 18, // Default GST
      discountedRate: 0,
      extendedRate: 0,
      totalGst: 0,
      totalPrice: 0
    };
    calculateItemTotals(index);
  }
};

const calculateItemTotals = (index: number) => {
  const item = quotation.value.items[index];
  if (!item) return;

  // Calculate discounted rate
  item.discountedRate = item.unitRate * (1 - (item.discountPercentage / 100));
  
  // Calculate extended rate
  item.extendedRate = item.discountedRate * item.quantity;
  
  // Calculate GST
  item.totalGst = item.extendedRate * (item.gstPercentage / 100);
  
  // Calculate total price
  item.totalPrice = item.extendedRate + item.totalGst;
};

const addItem = () => {
  quotation.value.items.push({
    catalogueId: '',
    description: '',
    packSize: '',
    quantity: 1,
    unitRate: 0,
    discountPercentage: 0,
    discountedRate: 0,
    extendedRate: 0,
    gstPercentage: 18,
    totalGst: 0,
    totalPrice: 0
  });
};

const removeItem = (index: number) => {
  quotation.value.items.splice(index, 1);
};

const generateQuotationNumber = async () => {
  try {
    // Get the current financial year
    const today = new Date();
    const currentMonth = today.getMonth(); // 0-11
    const currentYear = today.getFullYear();
    
    // Financial year is from April to March
    const financialYear = currentMonth >= 3 
      ? `${currentYear}-${(currentYear + 1).toString().slice(-2)}` 
      : `${currentYear - 1}-${currentYear.toString().slice(-2)}`;

    // Query the latest quotation number for the current financial year
    const q = query(
      collection(db, 'Quotations'),
      orderBy('quotationNumber', 'desc'),
      limit(1)
    );

    const querySnapshot = await getDocs(q);
    let sequenceNumber = 1;

    if (!querySnapshot.empty) {
      const lastQuotation = querySnapshot.docs[0].data();
      const lastNumber = lastQuotation.quotationNumber;
      if (lastNumber && lastNumber.includes(financialYear)) {
        // Extract the sequence number from the last quotation number
        const lastSequence = parseInt(lastNumber.split('-').pop());
        sequenceNumber = lastSequence + 1;
      }
    }

    // Format the sequence number with leading zeros
    const formattedSequence = String(sequenceNumber).padStart(3, '0');
    
    // Generate the new quotation number
    return `CBL-${financialYear}-${formattedSequence}`;
  } catch (error) {
    console.error('Error generating quotation number:', error);
    return `CBL-${new Date().getTime()}`; // Fallback format
  }
};

const saveQuotation = async () => {
  if (!form.value?.validate()) return;

  try {
    loading.value = true;
    const docRef = await addDoc(collection(db, 'Quotations'), {
      ...quotation.value,
      quotationNumber: quotationNumber.value,
      createdAt: new Date(),
      date: new Date().toISOString(),
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'pending'
    });
    console.log('Quotation saved with ID:', docRef.id);
    await store.fetchQuotations(); // Refresh quotations list
    // Show success message
    store.showSnackbar('Quotation saved successfully!', 'success');
  } catch (error) {
    console.error('Error saving quotation:', error);
    store.showSnackbar('Error saving quotation. Please try again.', 'error');
  } finally {
    loading.value = false;
  }
};

const downloadQuotation = async () => {
  if (!form.value?.validate()) return;
  
  try {
    loading.value = true;
    const selectedCompany = companies.value.find(c => c.id === quotation.value.company);
    console.log('Selected Company:', selectedCompany);
    const client = store.clients.find(c => c.id === quotation.value.clientId);
    const employee = store.employees.find(e => e.id === quotation.value.employeeId);

    if (!selectedCompany || !client || !employee) {
      throw new Error('Missing required details');
    }

    const quotationData = {
      company: {
        name: selectedCompany.name,
        address: selectedCompany.address,
        email: selectedCompany.email,
        phone: selectedCompany.phone,
        gst: selectedCompany.gstNumber,
        pan: selectedCompany.panNumber || '',
        bankName: selectedCompany.bankName || '',
        accountNumber: selectedCompany.accountNumber || '',
        ifscCode: selectedCompany.ifscCode || ''
      },
      quotationNumber: quotationNumber.value,
      date: new Date().toLocaleDateString(),
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      client: {
        name: client.name,
        company: client.company,
        address: client.address,
        email: client.email,
        phone: client.phone,
        gst: client.gst
      },
      items: quotation.value.items.map(item => {
        const catalogueItem = store.items.find(i => i.id === item.catalogueId);
        return {
          catalogueId: catalogueItem?.catalogueId || '',
          description: catalogueItem?.description || '',
          packSize: catalogueItem?.packSize || '',
          hsnCode: catalogueItem?.hsnCode || '',
          brand: catalogueItem?.brand || '',
          quantity: item.quantity,
          unitRate: item.unitRate,
          discount: item.discountPercentage,
          discountedPrice: item.discountedRate,
          gst: item.gstPercentage,
          gstValue: item.totalGst,
          total: item.totalPrice,
          expandedPrice: item.quantity * item.discountedRate
        };
      }),
      subtotal: subtotal.value,
      totalGST: totalGst.value,
      grandTotal: grandTotal.value,
      paymentTerms: quotation.value.paymentTerms,
      commonTerms: quotation.value.commonTerms,
      notes: quotation.value.notes,
      createdBy: {
        name: employee.name,
        email: employee.email,
        mobile: employee.mobile
      }
    };

    // Generate both document data
    await Promise.all([
      generatePDFDocument(quotationData),
      generateWordDocument(quotationData)
    ]);

    // Save the quotation to Firestore
    const docRef = await addDoc(collection(db, 'Quotations'), {
      ...quotation.value,
      quotationNumber: quotationNumber.value,
      createdAt: new Date(),
      date: new Date().toISOString(),
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'pending'
    });

    console.log('Quotation saved with ID:', docRef.id);
    await store.fetchQuotations();

    store.showSnackbar('Quotation saved successfully!', 'success');
  } catch (error) {
    console.error('Error generating documents:', error);
    store.showSnackbar('Error generating documents. Please try again.', 'error');
  } finally {
    loading.value = false;
  }
};

// Add this after the imports
onMounted(async () => {
  loading.value = true;
  console.log('Fetching data for QuotationPage...');
  await Promise.all([
    store.fetchClients(),
    store.fetchEmployees(),
    store.fetchItems()
  ]);
  console.log('Data fetched:', {
    clients: store.clients,
    employees: store.employees,
    items: store.items
  });
  loading.value = false;
});
</script>