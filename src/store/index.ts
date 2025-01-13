import { defineStore } from 'pinia';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';

interface Item {
  id: string;
  catalogueId: string;
  description: string;
  packSize: string;
  casNumber?: string;
  hsnCode?: string;
  brand: string;
  price: number;
}

interface Client {
  id: string;
  name: string;
  company: string;
  address: string;
  email: string;
  phone: string;
  gst: string;
}

interface Employee {
  id: string;
  name: string;
  email: string;
  mobile: string;
  employeeId?: string;
  role?: string;
  department?: string;
  address?: string;
  createdAt?: Date;
}

interface CompanyDetails {
  address: string;
  email: string;
  phone: string;
  gst: string;
}

interface Quotation {
  id: string;
  quotationNumber: string;
  employeeId: string;
  clientId: string;
  date: string;
  validUntil: string;
  items: any[];
  terms: string;
  notes: string;
  status: string;
  createdAt: Date;
  subtotal: number;
  gst: number;
  total: number;
  wordDocumentUrl?: string;
  pdfDocumentUrl?: string;
  lastGeneratedAt?: Date;
}

interface State {
  items: Item[];
  clients: Client[];
  employees: Employee[];
  quotations: Quotation[];
  orders: any[];
  loading: boolean;
  companyDetails: CompanyDetails;
  commonTerms: string;
  snackbar: {
    show: boolean;
    text: string;
    color: 'success' | 'error' | 'info';
  };
}

export const useStore = defineStore('main', {
  state: (): State => ({
    items: [],
    clients: [],
    employees: [],
    quotations: [],
    orders: [],
    loading: false,
    companyDetails: {
      address: '123 Business Park, Industrial Area, City - 123456',
      email: 'info@chembio.com',
      phone: '+91 1234567890',
      gst: 'GSTIN12345678901234'
    },
    commonTerms: `1. Prices are valid for 30 days from the date of quotation
2. Payment terms: 50% advance, balance before delivery
3. Delivery within 2-3 weeks from order confirmation
4. GST will be charged as applicable`,
    snackbar: {
      show: false,
      text: '',
      color: 'success'
    }
  }),

  getters: {
    getItemById: (state) => (id: string) => state.items.find(item => item.id === id),
    getClientById: (state) => (id: string) => state.clients.find(client => client.id === id),
    getEmployeeById: (state) => (id: string) => state.employees.find(employee => employee.id === id),
    pendingOrders: (state) => state.orders.filter(order => order.status === 'pending')
  },

  actions: {
    async fetchItems() {
      try {
        this.loading = true;
        console.log('Fetching items from Firestore...');
        const querySnapshot = await getDocs(collection(db, 'Items'));
        console.log('Raw items docs:', querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        
        this.items = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            catalogueId: data.catalogueId || '',
            description: data.description || '',
            packSize: data.packSize || '',
            casNumber: data.casNumber || '',
            hsnCode: data.hsnCode || '',
            brand: data.brand || '',
            price: Number(data.price) || 0
          } as Item;
        });
        
        console.log('All processed items:', this.items);
      } catch (error) {
        console.error('Error fetching items:', error);
      } finally {
        this.loading = false;
      }
    },

    async fetchClients() {
      try {
        this.loading = true;
        const querySnapshot = await getDocs(collection(db, 'Clients'));
        this.clients = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Client[];
      } catch (error) {
        console.error('Error fetching clients:', error);
      } finally {
        this.loading = false;
      }
    },

    async fetchEmployees() {
      try {
        this.loading = true;
        console.log('Store: Fetching employees from Firestore...');
        
        const querySnapshot = await getDocs(collection(db, 'Employees'));
        console.log('Store: Raw employee docs:', querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        
        this.employees = querySnapshot.docs.map(doc => {
          const data = doc.data();
          const employee = {
            id: doc.id,
            name: data.name || '',
            email: data.email || '',
            mobile: data.mobile || '',
            employeeId: data.employeeId || '',
            role: data.role || '',
            department: data.department || '',
            address: data.address || '',
            createdAt: data.createdAt?.toDate() || null
          } as Employee;
          console.log('Store: Processed employee:', employee);
          return employee;
        });
        
        console.log('Store: All processed employees:', this.employees);
      } catch (error) {
        console.error('Error fetching employees:', error);
      } finally {
        this.loading = false;
      }
    },

    async fetchQuotations() {
      try {
        this.loading = true;
        const querySnapshot = await getDocs(collection(db, 'Quotations'));
        this.quotations = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate(),
            date: data.date || data.createdAt?.toDate().toISOString(),
            total: data.total || data.items?.reduce((sum: number, item: any) => sum + (item.totalPrice || 0), 0) || 0,
            status: data.status?.toLowerCase() || 'pending'
          };
        }) as Quotation[];
        console.log('Processed quotations:', this.quotations);
      } catch (error) {
        console.error('Error fetching quotations:', error);
      } finally {
        this.loading = false;
      }
    },

    async fetchOrders() {
      try {
        this.loading = true;
        console.log('Fetching orders from Firestore...');
        const querySnapshot = await getDocs(collection(db, 'orders'));
        console.log('Raw orders:', querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        
        this.orders = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            orderNumber: data.orderNumber || '',
            quotationNumber: data.quotationNumber || '',
            clientId: data.clientId || '',
            employeeId: data.employeeId || '',
            date: data.date || data.createdAt?.toDate()?.toISOString() || new Date().toISOString(),
            items: data.items || [],
            total: Number(data.total) || 0,
            paidAmount: Number(data.paidAmount) || 0,
            paymentStatus: data.paymentStatus?.toLowerCase() || 'pending',
            deliveryStatus: data.deliveryStatus?.toLowerCase() || 'pending',
            payments: data.payments || [],
            deliveryNotes: data.deliveryNotes || '',
            createdAt: data.createdAt?.toDate() || new Date()
          };
        });
        
        console.log('Processed orders:', this.orders);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        this.loading = false;
      }
    },

    async fetchAllData() {
      try {
        this.loading = true;
        await Promise.all([
          this.fetchItems(),
          this.fetchClients(),
          this.fetchEmployees(),
          this.fetchQuotations(),
          this.fetchOrders()
        ]);
      } catch (error) {
        console.error('Error fetching all data:', error);
      } finally {
        this.loading = false;
      }
    },

    showSnackbar(text: string, color: 'success' | 'error' | 'info' = 'success') {
      this.snackbar = {
        show: true,
        text,
        color
      };
      setTimeout(() => {
        this.snackbar.show = false;
      }, 3000);
    }
  }
}); 