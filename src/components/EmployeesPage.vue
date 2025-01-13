<template>
  <div>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 mb-4">Employees Management</h1>
      </v-col>
    </v-row>

    <!-- Add/Edit Employee Dialog -->
    <v-dialog v-model="dialog" max-width="800px">
      <template v-slot:activator="{ props }">
        <v-btn
          color="primary"
          dark
          class="mb-4"
          v-bind="props"
        >
          <v-icon start>mdi-plus</v-icon>
          Add New Employee
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
                    label="Employee Name*"
                    :rules="[requiredRule]"
                    required
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="editedItem.employeeId"
                    label="Employee ID*"
                    :rules="[requiredRule]"
                    required
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="editedItem.email"
                    label="Email*"
                    type="email"
                    :rules="emailRules"
                    required
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="editedItem.mobile"
                    label="Mobile Number*"
                    :rules="[requiredRule]"
                    required
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-select
                    v-model="editedItem.role"
                    :items="roles"
                    label="Role*"
                    :rules="[requiredRule]"
                    required
                  ></v-select>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="editedItem.department"
                    label="Department*"
                    :rules="[requiredRule]"
                    required
                  ></v-text-field>
                </v-col>
                <v-col cols="12">
                  <v-textarea
                    v-model="editedItem.address"
                    label="Address"
                    rows="3"
                  ></v-textarea>
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
        <v-card-title class="text-h5">Delete Employee</v-card-title>
        <v-card-text>
          Are you sure you want to delete this employee? This action cannot be undone.
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey-darken-1" variant="text" @click="closeDelete">Cancel</v-btn>
          <v-btn color="error" variant="text" @click="deleteItemConfirm">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Employees Table -->
    <v-data-table
      :headers="headers"
      :items="store.employees"
      :search="search"
      :loading="loading"
      item-value="id"
    >
      <template v-slot:top>
        <v-text-field
          v-model="search"
          label="Search Employees"
          class="mx-4"
          prepend-inner-icon="mdi-magnify"
          clearable
        ></v-text-field>
      </template>

      <template v-slot:item="{ item }">
        <tr>
          <td>{{ item.employeeId }}</td>
          <td>{{ item.name }}</td>
          <td>{{ item.email }}</td>
          <td>{{ item.mobile }}</td>
          <td>{{ item.role }}</td>
          <td>{{ item.department }}</td>
          <td class="text-end">
            <v-icon size="small" class="mr-2" @click="editItem(item)">
              mdi-pencil
            </v-icon>
            <v-icon size="small" @click="deleteItem(item)">
              mdi-delete
            </v-icon>
          </td>
        </tr>
      </template>
    </v-data-table>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useStore } from '../store';
import { collection, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

interface Employee {
  id?: string;
  name: string;
  email: string;
  mobile: string;
  employeeId?: string;
  role?: string;
  department?: string;
  address?: string;
  createdAt?: Date;
}

const store = useStore();
const form = ref<any>(null);
const dialog = ref(false);
const deleteDialog = ref(false);
const valid = ref(true);
const loading = ref(false);
const search = ref('');

const roles = [
  'Sales Representative',
  'Sales Manager',
  'Account Manager',
  'Administrator'
] as const;

type ValidationRule = (v: string) => boolean | string;

const requiredRule: ValidationRule = (v: string) => !!v || 'This field is required';
const emailRules: ValidationRule[] = [
  requiredRule,
  (v: string) => /.+@.+\..+/.test(v) || 'E-mail must be valid'
];

const headers = [
  { title: 'Employee ID', key: 'employeeId', align: 'start' },
  { title: 'Name', key: 'name', align: 'start' },
  { title: 'Email', key: 'email', align: 'start' },
  { title: 'Mobile', key: 'mobile', align: 'start' },
  { title: 'Role', key: 'role', align: 'start' },
  { title: 'Department', key: 'department', align: 'start' },
  { title: 'Actions', key: 'actions', sortable: false, align: 'end' }
];

const defaultItem: Employee = {
  name: '',
  email: '',
  mobile: '',
  employeeId: '',
  role: '',
  department: '',
  address: ''
};

const editedIndex = ref(-1);
const editedItem = ref<Employee>({ ...defaultItem });

const formTitle = computed(() => {
  return editedIndex.value === -1 ? 'New Employee' : 'Edit Employee';
});

onMounted(async () => {
  loading.value = true;
  console.log('Fetching employees...');
  await store.fetchEmployees();
  console.log('Employees fetched:', store.employees);
  loading.value = false;
});

const editItem = (employee: Employee) => {
  if (!employee) return;
  
  editedIndex.value = store.employees.findIndex(e => e.id === employee.id);
  editedItem.value = { ...employee };
  dialog.value = true;
};

const deleteItem = (employee: Employee) => {
  if (!employee) return;
  
  editedIndex.value = store.employees.findIndex(e => e.id === employee.id);
  editedItem.value = { ...employee };
  deleteDialog.value = true;
};

const deleteItemConfirm = async () => {
  if (!editedItem.value.id) return;
  
  try {
    await deleteDoc(doc(db, 'Employees', editedItem.value.id));
    await store.fetchEmployees();
    closeDelete();
  } catch (error) {
    console.error('Error deleting employee:', error);
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
    console.log('Saving employee:', editedItem.value);
    if (editedIndex.value > -1 && editedItem.value.id) {
      // Update existing employee
      const employeeRef = doc(db, 'Employees', editedItem.value.id);
      const { id, createdAt, ...updateData } = editedItem.value;
      await updateDoc(employeeRef, updateData);
      console.log('Employee updated successfully');
    } else {
      // Add new employee
      const docRef = await addDoc(collection(db, 'Employees'), {
        ...editedItem.value,
        createdAt: new Date()
      });
      console.log('New employee added with ID:', docRef.id);
    }
    await store.fetchEmployees();
    console.log('Employees refetched:', store.employees);
    close();
  } catch (error) {
    console.error('Error saving employee:', error);
    // You might want to show an error message to the user here
  }
};
</script>

<style scoped>
.v-card-text {
  padding-top: 0;
}
</style> 