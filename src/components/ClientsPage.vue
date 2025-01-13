<template>
  <div>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 mb-4">Clients Management</h1>
      </v-col>
    </v-row>

    <!-- Add/Edit Client Dialog -->
    <v-dialog v-model="dialog" max-width="800px">
      <template v-slot:activator="{ props }">
        <v-btn
          color="primary"
          dark
          class="mb-4"
          v-bind="props"
        >
          <v-icon start>mdi-plus</v-icon>
          Add New Client
        </v-btn>
      </template>
      <v-card>
        <v-card-title>
          <span class="text-h5">{{ formTitle }}</span>
        </v-card-title>

        <v-card-text>
          <v-container>
            <v-form ref="form" v-model="valid">
              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="editedItem.name"
                    label="Client Name*"
                    :rules="[v => !!v || 'Name is required']"
                    required
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="editedItem.company"
                    label="Company Name*"
                    :rules="[v => !!v || 'Company name is required']"
                    required
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="editedItem.email"
                    label="Email"
                    type="email"
                    :rules="emailRules"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="editedItem.phone"
                    label="Phone Number"
                    type="tel"
                  ></v-text-field>
                </v-col>
                <v-col cols="12">
                  <v-textarea
                    v-model="editedItem.address"
                    label="Address*"
                    :rules="[v => !!v || 'Address is required']"
                    required
                    rows="3"
                  ></v-textarea>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="editedItem.gst"
                    label="GST Number"
                    hint="Enter GST number if applicable"
                    persistent-hint
                  ></v-text-field>
                </v-col>
              </v-row>
            </v-form>
          </v-container>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey-darken-1" variant="text" @click="close">Cancel</v-btn>
          <v-btn color="primary" variant="text" @click="save" :disabled="!valid">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="deleteDialog" max-width="400px">
      <v-card>
        <v-card-title class="text-h5">Delete Client</v-card-title>
        <v-card-text>
          Are you sure you want to delete this client? This action cannot be undone.
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey-darken-1" variant="text" @click="closeDelete">Cancel</v-btn>
          <v-btn color="error" variant="text" @click="deleteItemConfirm">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Clients Table -->
    <v-data-table
      :headers="headers"
      :items="store.clients"
      :search="search"
      :loading="loading"
    >
      <template v-slot:top>
        <v-text-field
          v-model="search"
          label="Search Clients"
          class="mx-4"
          prepend-inner-icon="mdi-magnify"
          clearable
        ></v-text-field>
      </template>

      <template v-slot:item.actions="{ item }">
        <v-icon size="small" class="mr-2" @click="editItem(item.raw)">
          mdi-pencil
        </v-icon>
        <v-icon size="small" @click="deleteItem(item.raw)">
          mdi-delete
        </v-icon>
      </template>
    </v-data-table>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useStore } from '../store';
import { collection, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

const store = useStore();
const form = ref<any>(null);
const dialog = ref(false);
const deleteDialog = ref(false);
const valid = ref(true);
const loading = ref(false);
const search = ref('');

const emailRules = [
  (v: string) => !v || /.+@.+\..+/.test(v) || 'E-mail must be valid'
];

const headers = [
  { title: 'Name', key: 'name' },
  { title: 'Company', key: 'company' },
  { title: 'Email', key: 'email' },
  { title: 'Phone', key: 'phone' },
  { title: 'Address', key: 'address' },
  { title: 'GST Number', key: 'gst' },
  { title: 'Actions', key: 'actions', sortable: false }
];

const defaultItem = {
  name: '',
  company: '',
  email: '',
  phone: '',
  address: '',
  gst: ''
};

const editedIndex = ref(-1);
const editedItem = ref({ ...defaultItem });

const formTitle = computed(() => {
  return editedIndex.value === -1 ? 'New Client' : 'Edit Client';
});

onMounted(async () => {
  loading.value = true;
  await store.fetchClients();
  loading.value = false;
});

const editItem = (item: any) => {
  editedIndex.value = store.clients.indexOf(item);
  editedItem.value = Object.assign({}, item);
  dialog.value = true;
};

const deleteItem = (item: any) => {
  editedIndex.value = store.clients.indexOf(item);
  editedItem.value = Object.assign({}, item);
  deleteDialog.value = true;
};

const deleteItemConfirm = async () => {
  try {
    await deleteDoc(doc(db, 'Clients', editedItem.value.id));
    await store.fetchClients();
    closeDelete();
  } catch (error) {
    console.error('Error deleting client:', error);
  }
};

const close = () => {
  dialog.value = false;
  editedIndex.value = -1;
  editedItem.value = { ...defaultItem };
};

const closeDelete = () => {
  deleteDialog.value = false;
  editedIndex.value = -1;
  editedItem.value = { ...defaultItem };
};

const save = async () => {
  if (!form.value?.validate()) return;

  try {
    const clientData = {
      name: editedItem.value.name,
      company: editedItem.value.company,
      email: editedItem.value.email || '',
      phone: editedItem.value.phone || '',
      address: editedItem.value.address,
      gst: editedItem.value.gst || ''
    };

    if (editedIndex.value > -1) {
      // Update existing client
      const clientRef = doc(db, 'Clients', editedItem.value.id);
      await updateDoc(clientRef, clientData);
    } else {
      // Add new client
      await addDoc(collection(db, 'Clients'), clientData);
    }
    await store.fetchClients();
    close();
  } catch (error) {
    console.error('Error saving client:', error);
  }
};
</script> 