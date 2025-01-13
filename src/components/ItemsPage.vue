<template>
  <div>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 mb-4">Items Management</h1>
      </v-col>
    </v-row>

    <!-- Add/Edit Item Dialog -->
    <v-dialog v-model="dialog" max-width="600px">
      <template v-slot:activator="{ props }">
        <v-btn
          color="primary"
          dark
          class="mb-4"
          v-bind="props"
        >
          <v-icon start>mdi-plus</v-icon>
          Add New Item
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
                    v-model="editedItem.catalogueId"
                    label="Catalogue ID*"
                    :rules="[(v: string) => !!v || 'Catalogue ID is required']"
                    required
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model.number="editedItem.price"
                    label="Price*"
                    type="number"
                    prefix="₹"
                    :rules="[
                      (v: number) => !!v || 'Price is required',
                      (v: number) => v > 0 || 'Price must be greater than 0'
                    ]"
                    required
                  ></v-text-field>
                </v-col>
                <v-col cols="12">
                  <v-textarea
                    v-model="editedItem.description"
                    label="Description*"
                    :rules="[(v: string) => !!v || 'Description is required']"
                    required
                    rows="3"
                  ></v-textarea>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="editedItem.packSize"
                    label="Pack Size*"
                    :rules="[(v: string) => !!v || 'Pack Size is required']"
                    required
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="editedItem.casNumber"
                    label="CAS Number"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="editedItem.hsnCode"
                    label="HSN Code"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="editedItem.brand"
                    label="Brand/Make*"
                    :rules="[(v: string) => !!v || 'Brand/Make is required']"
                    required
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
        <v-card-title class="text-h5">Delete Item</v-card-title>
        <v-card-text>
          Are you sure you want to delete this item?
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey-darken-1" variant="text" @click="closeDelete">Cancel</v-btn>
          <v-btn color="error" variant="text" @click="deleteItemConfirm">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Items Table -->
    <v-data-table
      :headers="headers"
      :items="store.items"
      :search="search"
      :loading="loading"
      item-value="id"
    >
      <template v-slot:top>
        <v-text-field
          v-model="search"
          label="Search Items"
          class="mx-4"
          prepend-inner-icon="mdi-magnify"
          clearable
        ></v-text-field>
      </template>

      <template v-slot:item.price="{ item }">
        ₹{{ item.price.toFixed(2) }}
      </template>

      <template v-slot:item.actions="{ item }">
        <v-icon size="small" class="mr-2" @click="editItem(item)">
          mdi-pencil
        </v-icon>
        <v-icon size="small" @click="deleteItem(item)">
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

interface Item {
  id?: string;
  catalogueId: string;
  description: string;
  packSize: string;
  casNumber?: string;
  hsnCode?: string;
  brand: string;
  price: number;
}

const store = useStore();
const form = ref<any>(null);
const dialog = ref(false);
const deleteDialog = ref(false);
const valid = ref(true);
const loading = ref(false);
const search = ref('');

const headers = [
  { title: 'Catalogue ID', key: 'catalogueId' },
  { title: 'Description', key: 'description' },
  { title: 'Pack Size', key: 'packSize' },
  { title: 'CAS Number', key: 'casNumber' },
  { title: 'HSN Code', key: 'hsnCode' },
  { title: 'Brand/Make', key: 'brand' },
  { title: 'Price', key: 'price' },
  { title: 'Actions', key: 'actions', sortable: false }
];

const defaultItem: Item = {
  catalogueId: '',
  description: '',
  packSize: '',
  casNumber: '',
  hsnCode: '',
  brand: '',
  price: 0
};

const editedIndex = ref(-1);
const editedItem = ref<Item>({ ...defaultItem });

const formTitle = computed(() => {
  return editedIndex.value === -1 ? 'New Item' : 'Edit Item';
});

onMounted(async () => {
  loading.value = true;
  await store.fetchItems();
  loading.value = false;
});

const editItem = (item: Item & { id: string }) => {
  editedIndex.value = store.items.indexOf(item);
  editedItem.value = Object.assign({}, item);
  dialog.value = true;
};

const deleteItem = (item: Item & { id: string }) => {
  editedIndex.value = store.items.indexOf(item);
  editedItem.value = Object.assign({}, item);
  deleteDialog.value = true;
};

const deleteItemConfirm = async () => {
  if (!editedItem.value.id) return;

  try {
    await deleteDoc(doc(db, 'Items', editedItem.value.id));
    await store.fetchItems();
    closeDelete();
  } catch (error) {
    console.error('Error deleting item:', error);
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
    console.log('Saving item:', editedItem.value);
    if (editedIndex.value > -1 && editedItem.value.id) {
      // Update existing item
      const itemRef = doc(db, 'Items', editedItem.value.id);
      const { id, ...itemData } = editedItem.value;
      console.log('Updating item with data:', itemData);
      await updateDoc(itemRef, itemData);
    } else {
      // Add new item
      const { id, ...itemData } = editedItem.value;
      console.log('Adding new item with data:', itemData);
      await addDoc(collection(db, 'Items'), itemData);
    }
    console.log('Item saved successfully, fetching updated items...');
    await store.fetchItems();
    console.log('Items fetched:', store.items);
    close();
  } catch (error) {
    console.error('Error saving item:', error);
  }
};
</script> 