<template>
  <div>
    <v-row>
      <v-col cols="12" class="d-flex align-center">
        <h1 class="text-h4">Companies</h1>
        <v-spacer></v-spacer>
        <v-btn
          color="primary"
          @click="dialog = true"
        >
          <v-icon start>mdi-plus</v-icon>
          Add Company
        </v-btn>
      </v-col>
    </v-row>

    <!-- Companies Table -->
    <v-card>
      <v-data-table
        :headers="headers"
        :items="companies"
        :loading="loading"
      >
        <template v-slot:item.actions="{ item }">
          <v-icon
            size="small"
            class="me-2"
            @click="editItem(item.raw)"
          >
            mdi-pencil
          </v-icon>
          <v-icon
            size="small"
            @click="deleteItem(item.raw)"
          >
            mdi-delete
          </v-icon>
        </template>
      </v-data-table>
    </v-card>

    <!-- Add/Edit Dialog -->
    <v-dialog
      v-model="dialog"
      max-width="800px"
    >
      <v-card>
        <v-card-title>
          <span class="text-h5">{{ editedId ? 'Edit' : 'Add' }} Company</span>
        </v-card-title>

        <v-card-text>
          <v-container>
            <v-row>
              <!-- Basic Information -->
              <v-col cols="12">
                <div class="text-h6 mb-2">Basic Information</div>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="editedItem.name"
                  label="Company Name*"
                  :rules="[(v: string) => !!v || 'Name is required']"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="editedItem.phone"
                  label="Contact Number*"
                  :rules="[(v: string) => !!v || 'Phone number is required']"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="editedItem.email"
                  label="Email*"
                  type="email"
                  :rules="[(v: string) => !!v || 'Email is required']"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="editedItem.address"
                  label="Address*"
                  :rules="[(v: string) => !!v || 'Address is required']"
                  required
                  rows="3"
                ></v-textarea>
              </v-col>

              <!-- Tax Information -->
              <v-col cols="12">
                <div class="text-h6 mb-2">Tax Information</div>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="editedItem.gstNumber"
                  label="GST Number*"
                  :rules="[(v: string) => !!v || 'GST Number is required']"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="editedItem.panNumber"
                  label="PAN Number*"
                  :rules="[(v: string) => !!v || 'PAN Number is required']"
                  required
                ></v-text-field>
              </v-col>

              <!-- Bank Details -->
              <v-col cols="12">
                <div class="text-h6 mb-2">Bank Details</div>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="editedItem.bankName"
                  label="Bank Name*"
                  :rules="[(v: string) => !!v || 'Bank Name is required']"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="editedItem.accountNumber"
                  label="Account Number*"
                  :rules="[(v: string) => !!v || 'Account Number is required']"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="editedItem.ifscCode"
                  label="IFSC Code*"
                  :rules="[(v: string) => !!v || 'IFSC Code is required']"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="editedItem.branchName"
                  label="Branch Name*"
                  :rules="[(v: string) => !!v || 'Branch Name is required']"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="editedItem.accountType"
                  label="Account Type*"
                  :items="['Savings', 'Current']"
                  :rules="[(v: string) => !!v || 'Account Type is required']"
                  required
                ></v-select>
              </v-col>

              <!-- Logo Upload -->
              <v-col cols="12">
                <div class="text-h6 mb-2">Company Logo</div>
              </v-col>
              <v-col cols="12">
                <v-file-input
                  v-model="logoFile"
                  label="Company Logo"
                  accept="image/*"
                  prepend-icon="mdi-camera"
                  @change="handleLogoUpload"
                ></v-file-input>
              </v-col>
              <v-col cols="12" v-if="editedItem.logo">
                <v-img
                  :src="editedItem.logo"
                  max-width="200"
                  contain
                  class="mx-auto"
                ></v-img>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="error"
            variant="text"
            @click="closeDialog"
          >
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            variant="text"
            @click="save"
          >
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="deleteDialog" max-width="500px">
      <v-card>
        <v-card-title class="text-h5">Delete Company</v-card-title>
        <v-card-text>
          Are you sure you want to delete this company?
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="error"
            variant="text"
            @click="deleteDialog = false"
          >
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            variant="text"
            @click="deleteItemConfirm"
          >
            OK
          </v-btn>
          <v-spacer></v-spacer>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { collection, getDocs, doc, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../services/firebase';

interface Company {
  id: string;
  name: string;
  address: string;
  email: string;
  phone: string;
  gstNumber: string;
  panNumber: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  branchName: string;
  accountType: string;
  logo?: string;
}

const companies = ref<Company[]>([]);
const loading = ref(true);
const dialog = ref(false);
const deleteDialog = ref(false);
const editedId = ref<string | null>(null);
const itemToDelete = ref<Company | null>(null);

const headers = [
  { title: 'Company Name', key: 'name' },
  { title: 'GST Number', key: 'gstNumber' },
  { title: 'PAN Number', key: 'panNumber' },
  { title: 'Phone', key: 'phone' },
  { title: 'Email', key: 'email' },
  { title: 'Actions', key: 'actions', sortable: false },
];

const defaultItem: Omit<Company, 'id'> = {
  name: '',
  address: '',
  email: '',
  phone: '',
  gstNumber: '',
  panNumber: '',
  bankName: '',
  accountNumber: '',
  ifscCode: '',
  branchName: '',
  accountType: 'Current',
  logo: ''
};

const editedItem = ref({ ...defaultItem });

const logoFile = ref<File | null>(null);

const handleLogoUpload = async (file: File | null) => {
  if (!file) return;
  
  try {
    const fileRef = storageRef(storage, `company-logos/${file.name}`);
    await uploadBytes(fileRef, file);
    const downloadURL = await getDownloadURL(fileRef);
    editedItem.value.logo = downloadURL;
  } catch (error) {
    console.error('Error uploading logo:', error);
  }
};

const fetchCompanies = async () => {
  try {
    loading.value = true;
    const querySnapshot = await getDocs(collection(db, 'Companies'));
    companies.value = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Company));
  } catch (error) {
    console.error('Error fetching companies:', error);
  } finally {
    loading.value = false;
  }
};

const editItem = (item: Company) => {
  editedId.value = item.id;
  editedItem.value = { ...item };
  dialog.value = true;
};

const deleteItem = (item: Company) => {
  itemToDelete.value = item;
  deleteDialog.value = true;
};

const closeDialog = () => {
  dialog.value = false;
  editedId.value = null;
  editedItem.value = { ...defaultItem };
};

const save = async () => {
  try {
    if (logoFile.value) {
      await handleLogoUpload(logoFile.value);
    }

    if (editedId.value) {
      // Update existing company
      await updateDoc(doc(db, 'Companies', editedId.value), {
        ...editedItem.value
      });
    } else {
      // Add new company
      await addDoc(collection(db, 'Companies'), {
        ...editedItem.value
      });
    }
    closeDialog();
    await fetchCompanies();
  } catch (error) {
    console.error('Error saving company:', error);
  }
};

const deleteItemConfirm = async () => {
  if (itemToDelete.value) {
    try {
      await deleteDoc(doc(db, 'Companies', itemToDelete.value.id));
      await fetchCompanies();
    } catch (error) {
      console.error('Error deleting company:', error);
    }
  }
  deleteDialog.value = false;
  itemToDelete.value = null;
};

onMounted(fetchCompanies);
</script> 