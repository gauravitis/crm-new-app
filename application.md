== Background

The company requires a centralized Customer Relationship Management (CRM) system to streamline operations related to item management, client information storage, employee management, and, most critically, the generation, tracking, and management of quotations. The goal is to ensure data consistency, easy data retrieval, and seamless integration between components. 

The CRM will primarily be used to manage items, clients, employees, and quotations, and support order and payment tracking post-quotation approval. All data will be stored in Firebase to ensure real-time synchronization across components and interfaces. The system will also facilitate generating quotations in Word and PDF formats, with customizable terms, conditions, and notes. Additionally, saved quotations will be editable, downloadable, and trackable, with a detailed status flow.

== Requirements

=== Must Have
- **Items Page**: 
  - Ability to list and store item details with fields: Catalogue ID, Description, Pack Size, CAS Number, HSN Code, Brand/Make, Price.
  - Data storage and synchronization with Firebase.
  
- **Clients Page**:
  - Ability to store and view client details including: Name, Company, Address, Email, Phone.

- **Employee Page**:
  - Ability to store and view employee details including: Name, Email, Mobile.

- **Quotation Page**:
  - Dropdown to select one of the three companies: CHEMBIO LIFESCIENCES, CHEMBIO LIFESCIENCES PVT. LTD, CHEMLAB SYNTHESIS.
  - Dropdown to select an employee (Quotation creator).
  - Client auto-complete feature linked to the client database.
  - Item detail fields for each item in a quotation:
    - Catalogue ID, Description, Pack Size, Quantity, Price, CAS Number, HSN Code, Unit Rate, Discount %, Discounted Rate, Extended Rate, GST %, Total GST, Total Price.
  - Terms and Conditions section:
    - Dropdown for Payment Terms.
    - Common Terms and Conditions (static text).
  - Notes section for additional comments.
  - Buttons for "Download Quotation" (PDF/Word) and "Save Quotation".
  - Data storage in Firebase with synchronization across all pages.

- **Saved Quotations Page**:
  - List of saved quotations with features to:
    - Edit, download, view details.
    - Update quotation status (Sent, Approved, Rejected).
  - Mark "Approved" quotations as "Pending Orders".

- **Pending Orders Page**:
  - Manage order and payment tracking for approved quotations.
  - Track individual items within a quotation.

- **Quotation Document Generation**:
  - Generate quotations in Word and PDF formats.

=== Should Have
- Search and filtering capabilities for Items, Clients, Employees, and Quotations.
- Automatic calculation of Discounted Rate, Extended Rate, Total GST, and Total Price in the Quotation page.


== Method

The data flow will synchronize client, item, and quotation data across all pages in real-time using Firebase's capabilities.

=== Database Schema

1. **Items Collection**
   - `catalogue_id`: String
   - `description`: String
   - `pack_size`: String
   - `cas_number`: String
   - `hsn_code`: String
   - `brand`: String
   - `price`: Number

2. **Clients Collection**
   - `name`: String
   - `company`: String
   - `address`: String
   - `email`: String
   - `phone`: String

3. **Employees Collection**
   - `name`: String
   - `email`: String
   - `mobile`: String

4. **Quotations Collection**
   - `company`: Enum (`"CHEMBIO LIFESCIENCES"`, `"CHEMBIO LIFESCIENCES PVT. LTD"`, `"CHEMLAB SYNTHESIS"`)
   - `created_by`: Reference to Employees Collection
   - `client`: Reference to Clients Collection
   - `items`: Array of:
     - `catalogue_id`: Reference to Items Collection
     - `description`: String
     - `pack_size`: String
     - `quantity`: Number
     - `price`: Number
     - `unit_rate`: Number (calculated)
     - `discount_percentage`: Number
     - `discounted_rate`: Number (calculated)
     - `extended_rate`: Number (calculated)
     - `gst_percentage`: Number
     - `total_gst`: Number (calculated)
     - `total_price`: Number (calculated)
   - `payment_terms`: String
   - `common_terms`: String
   - `notes`: String
   - `status`: Enum (`"Draft"`, `"Sent"`, `"Approved"`, `"Rejected"`)

5. **Orders Collection**
   - `quotation_id`: Reference to Quotations Collection
   - `items_status`: Array of:
     - `item_id`: Reference to Quotations Collection items
     - `status`: Enum (`"Pending"`, `"Shipped"`, `"Delivered"`)
   - `payment_status`: Enum (`"Pending"`, `"Partially Paid"`, `"Paid"`)

=== Component Diagram

```plantuml
@startuml
package CRM_System {
  [Items Page] --> [Firebase Firestore]
  [Clients Page] --> [Firebase Firestore]
  [Employees Page] --> [Firebase Firestore]
  [Quotation Page] --> [Firebase Firestore]
  [Saved Quotations Page] --> [Firebase Firestore]
  [Pending Orders Page] --> [Firebase Firestore]
  [Firebase Firestore] --> [Firebase Storage]
}
@enduml


=== Algorithms and Key Functionalities

1. **Quotation Generation**
   - Input: Selected Company, Employee, Client, Item details, Payment terms, Common terms, Notes.
   - Output: Word/PDF document of the quotation, saved to Firebase.
   - Steps:
     1. User selects the company from the dropdown.
     2. User selects an employee (creator) and a client. The client details auto-fill from the database.
     3. User adds item details to the quotation. Real-time calculations update:
        - Discounted Rate = Unit Rate × (1 - Discount % / 100)
        - Extended Rate = Discounted Rate × Quantity
        - Total GST = Extended Rate × (GST % / 100)
        - Total Price = Extended Rate + Total GST
     4. User selects Payment Terms and enters Notes.
     5. On "Save Quotation":
        - All data is saved to the **Quotations Collection** in Firebase.
        - The status is set to "Draft".
     6. On "Download Quotation":
        - Generate a Word/PDF document using a templating library (e.g., Docxtemplater or jsPDF).
        - Save the document to Firebase Storage.
        - Provide the user a download link.

2. **Auto-complete Client Details**
   - Input: Client Name or Company (partial input).
   - Output: Fills remaining fields (Address, Email, Phone).
   - Steps:
     1. On user input, query **Clients Collection** in Firebase using a `where` clause.
     2. Use Firebase's `onSnapshot` to fetch and auto-fill matching data in real time.

3. **Quotation Status Update**
   - Input: User changes status to Sent, Approved, or Rejected.
   - Output: Status updated in **Quotations Collection**.
   - Steps:
     1. User selects a status.
     2. Firebase updates the `status` field of the quotation.
     3. If status is "Approved," move the quotation's ID to **Orders Collection** and initialize `items_status` and `payment_status`.

4. **Order and Payment Tracking**
   - Input: Quotation ID from Approved Quotation.
   - Output: Tracks each item's shipping and delivery status and the overall payment status.
   - Steps:
     1. Link the quotation in the **Orders Collection** with its items and statuses.
     2. Allow updates to `items_status` and `payment_status` fields.
     3. Update Firebase in real time with any changes.

5. **Real-time Synchronization**
   - Firebase's real-time database capabilities ensure:
     - Pages auto-refresh on data changes.
     - Users see updated data immediately (e.g., edited quotations, new orders).

=== Quotation Template Example (Word/PDF)

The generated document will follow this layout:
1. Header:
   - Company Name and Logo
   - Quotation ID, Date
   - Client Details (Name, Company, Address, Email, Phone)
2. Items Table:
   - Columns: Catalogue ID, Description, Pack Size, Quantity, Price, Discount %, GST %, Total Price.
3. Footer:
   - Payment Terms
   - Common Terms and Conditions
   - Notes

To ensure the quotation document can seamlessly retrieve relevant details for the selected company (like name, address, logo, and contact details), we should centralize the data for the three companies in a dedicated Company Details collection in Firebase. Here's how to handle it:

Proposed Solution:
Add a Company Details collection to the database with the following structure:

Company Details Collection
company_id: Unique identifier for the company.
name: Full name of the company (e.g., CHEMBIO LIFESCIENCES).
address: Physical address of the company.
contact_email: Primary contact email.
contact_phone: Primary contact phone number.
logo_url: URL for the company's logo (uploaded to Firebase Storage).
bank_details: Object containing:
account_name
account_number
ifsc_code
bank_name
This ensures all company-related details are accessible in a single query when generating the quotation.

Workflow During Quotation Creation
Dropdown for Company Selection:

Populate this dropdown using the name field from the Company Details collection.
Associate the selected company with its company_id.
On Document Generation:

Fetch the details of the selected company using the company_id.
Insert the relevant details (e.g., logo, address, contact information, etc.) into the Word/PDF template.

== Implementation

1. **Set Up Firebase Backend**
   - Create a Firebase project and configure Firestore for the database.
   - Define the following collections:
     - **Items Collection**
     - **Clients Collection**
     - **Employees Collection**
     - **Quotations Collection**
     - **Orders Collection**
     - **Company Details Collection**
   - Set up Firebase Storage for saving Word/PDF files and company logos.
   - Configure Firebase Authentication if user logins are needed.

2. **Frontend Development**
   - Use Vue.js with a component-based architecture for modularity.
   - Install necessary libraries:

   - Set up the project structure:
     ```
     /src
       /components
         ItemsPage.vue
         ClientsPage.vue
         EmployeesPage.vue
         QuotationPage.vue
         SavedQuotationsPage.vue
         PendingOrdersPage.vue
       /services
         firebase.js
       /utils
         calculations.js
         documentGenerator.js
     ```
   - Implement individual components:
     - **ItemsPage.jsx**:
       - Form for adding/editing items.
       - Fetch and display items from Firestore.
     - **ClientsPage.jsx**:
       - Form for adding/editing clients.
       - Auto-complete functionality for client search.
     - **EmployeesPage.jsx**:
       - Form for adding/editing employees.
       - List of employees with edit/delete options.
     - **QuotationPage.jsx**:
       - Dropdowns for company, employee, and client selection.
       - Auto-complete for client and item details.
       - Real-time calculation for item totals using `calculations.js`.
       - Save quotation to Firestore and trigger document generation.
     - **SavedQuotationsPage.jsx**:
       - Fetch quotations and display in a list with filters.
       - Buttons for edit, download (PDF/Word), and status updates.
     - **PendingOrdersPage.jsx**:
       - Display approved quotations with tracking options for items and payments.
       - Update statuses for items and payments in real time.

3. **Document Generation**
   - Use a library such as `docxtemplater` (for Word) and `jsPDF` (for PDF).
   - Implement `documentGenerator.js`:
     - Fetch data for the selected quotation and company from Firestore.
     - Populate a pre-designed template with placeholders for dynamic data.
     - Save the document to Firebase Storage and provide a download link.

4. **Real-Time Data Synchronization**
   - Use Firebase `onSnapshot` for real-time updates across all pages.
   - Example for fetching company details in QuotationPage:
     ```javascript
     useEffect(() => {
       const unsubscribe = firebase.firestore().collection('CompanyDetails')
         .onSnapshot(snapshot => {
           setCompanyList(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
         });
       return () => unsubscribe();
     }, []);
     ```

5. **Testing and QA**
   - Write unit tests for calculations in `calculations.js`.
   - Test auto-complete, real-time updates, and document generation.
   - Verify synchronization between pages and data consistency.

6. **Deployment**
   - Deploy the frontend using Vercel Hosting.
   - Ensure Firebase rules are set to allow secure data access.
   - Perform end-to-end testing post-deployment to confirm all components work seamlessly.


Components and Data Fields in the Quotation
Header Information

Company details (e.g., name, address, email, contact number, GST, PAN).
Quotation type: "QUOTATION/PERFORMA INVOICE."
Reference number and date.
Recipient Details

Client name and address.
Attention to (e.g., contact person, email, phone).
Quotation Body

Table structure with fields:
Serial Number
Catalogue Number
Description
Pack Size
HSN Code
Quantity
Unit Rate
Discount %
Discounted Price
Expanded Price
GST %
GST Value
Total
Lead Time
Make
Summary Section

Subtotal, GST Total, and Grand Total.
Bank Details

Bank name, account number, IFSC, branch code, account type.
Terms and Conditions

Payment terms, validity, lead time, and order-related terms.
Footer

Quotation creator's name, mobile, email.
Authorized signatory and space for a signature.
Template Generation Plan
Using this layout:

Dynamic Data Mapping:

Use placeholders for dynamic fields such as company name, client name, item details, totals, and creator details.
Example placeholders in a template:
{{company_name}}, {{client_name}}, {{item_description}}, {{subtotal}}.
Library for Word Generation:

Use docxtemplater to design a template with placeholders corresponding to the above fields.
Save this template as a .docx file and populate it with real data when generating a quotation.
PDF Conversion:

After generating the Word document, convert it to PDF using pdf-lib or Firebase Cloud Functions.

The CRM will be built using a modular architecture to ensure scalability and maintainability. The application will use Firebase as the backend for real-time database synchronization and storage, along with Angular.js for the frontend to provide a seamless user experience.

Frontend Framework: Vue.js
Component-Based Architecture:

Vue.js will be used for creating reusable and modular components for each page (e.g., Items, Clients, Employees, Quotation Page). This will maintain a clear separation of concerns and ensure easy scalability.
State Management:

Vuex will be used to manage global state, such as the list of items, clients, employees, and quotations. It will make managing and accessing shared data across the app efficient.
Vue Router:

Vue Router will manage the navigation between pages, such as Items Page, Clients Page, Employees Page, Quotation Page, Saved Quotations Page, and Pending Orders Page.
Firebase Integration:

Firebase Firestore will be used for real-time synchronization and storing data like items, clients, employees, quotations, and orders.
Firebase Storage will be used to store and retrieve Word and PDF documents generated for quotations.
Libraries for Document Generation:

For Word document generation, docxtemplater can be used, and for PDF generation, jsPDF will be implemented.
Modified System Architecture for Vue.js
The system will have the following components:

Frontend: Vue.js with Vuetify or Bootstrap-Vue (for a responsive and material design UI)
Backend: Firebase (Firestore and Firebase Functions for document generation and PDF conversion)
Storage: Firebase Storage for saving Word/PDF files and company logos
Modified Database Schema
The database schema remains largely the same, as Vue.js is just replacing Angular.js for the frontend. The main changes are in how data is accessed and displayed through Vue components.

Items Collection (same as before)
Clients Collection (same as before)
Employees Collection (same as before)
Quotations Collection (same as before)
Orders Collection (same as before)
Company Details Collection
This will store the company details (name, address, logo, bank info).
Frontend Development Steps with Vue.js
Set up the Vue.js Project:

Create a Vue.js project using Vue CLI.
Install Vuex for state management, Vue Router for routing, and Vuetify for UI components.
Install Firebase SDK and configure it for real-time data synchronization and storage.
Component Structure: Here’s an example structure for your Vue.js project:

plaintext
Copy code
/src
  /components
    ItemsPage.vue
    ClientsPage.vue
    EmployeesPage.vue
    QuotationPage.vue
    SavedQuotationsPage.vue
    PendingOrdersPage.vue
  /store
    index.js (Vuex store for managing application state)
  /router
    index.js (Vue Router for managing navigation)
  /services
    firebase.js (Firebase configuration and functions)
  /utils
    calculations.js (Calculation logic for quotation)
    documentGenerator.js (Logic for generating documents)
Individual Components:

ItemsPage.vue:
Form to add/edit items.
Display items from Firestore.
Use Firebase Firestore to fetch and save data.
ClientsPage.vue:
Form to add/edit clients.
Auto-complete functionality for client search.
Use Firebase Firestore to fetch and save data.
EmployeesPage.vue:
Form to add/edit employees.
List employees with edit/delete options.
QuotationPage.vue:
Dropdowns for company, employee, and client selection.
Auto-complete for client and item details.
Real-time calculation for item totals using calculations.js.
Save quotation data to Firestore and trigger document generation.
SavedQuotationsPage.vue:
List saved quotations with filter and status update options.
Buttons for editing, downloading (PDF/Word), and status updates.
PendingOrdersPage.vue:
Show approved quotations with tracking for orders and payments.
Allow status updates for items and payments in real time.
Vuex Store (State Management)
Use Vuex to manage the global state of items, clients, employees, quotations, etc. The store would handle fetching and storing data to Firestore in real-time, and you can use computed properties to access the data efficiently.

Example of setting up Vuex for state management:

javascript
Copy code
// src/store/index.js
import Vue from 'vue';
import Vuex from 'vuex';
import firebase from 'firebase';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    items: [],
    clients: [],
    employees: [],
    quotations: [],
  },
  mutations: {
    setItems(state, items) {
      state.items = items;
    },
    setClients(state, clients) {
      state.clients = clients;
    },
    setEmployees(state, employees) {
      state.employees = employees;
    },
    setQuotations(state, quotations) {
      state.quotations = quotations;
    },
  },
  actions: {
    fetchItems({ commit }) {
      firebase.firestore().collection('Items').onSnapshot(snapshot => {
        const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        commit('setItems', items);
      });
    },
    fetchClients({ commit }) {
      firebase.firestore().collection('Clients').onSnapshot(snapshot => {
        const clients = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        commit('setClients', clients);
      });
    },
    fetchEmployees({ commit }) {
      firebase.firestore().collection('Employees').onSnapshot(snapshot => {
        const employees = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        commit('setEmployees', employees);
      });
    },
    fetchQuotations({ commit }) {
      firebase.firestore().collection('Quotations').onSnapshot(snapshot => {
        const quotations = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        commit('setQuotations', quotations);
      });
    },
  },
  getters: {
    getItems: state => state.items,
    getClients: state => state.clients,
    getEmployees: state => state.employees,
    getQuotations: state => state.quotations,
  },
});
Document Generation with docxtemplater & jsPDF
Generate Word Documents: Use docxtemplater to create a template with placeholders for dynamic data (e.g., company name, client name, item details). Populate this template with data when generating a quotation.

Generate PDF Documents: Use jsPDF to create a PDF version of the quotation once the Word document is generated, or directly create a PDF from the data.

Example of generating a Word document using docxtemplater:

javascript
Copy code
// src/utils/documentGenerator.js
import Docxtemplater from 'docxtemplater';
import PizZip from 'pizzip';
import fs from 'fs';

export const generateQuotationDoc = (quotationData) => {
  const template = fs.readFileSync('quotation_template.docx', 'binary');
  const zip = new PizZip(template);
  const doc = new Docxtemplater(zip);

  doc.setData(quotationData);
  doc.render();

  const buf = doc.getZip().generate({ type: 'nodebuffer' });
  fs.writeFileSync('generated_quotation.docx', buf);
};
Firebase Integration
Real-time Data Sync: Use onSnapshot to keep the UI in sync with Firebase data, ensuring that the items, quotations, clients, and employees data are always up to date.

Document Storage: Use Firebase Storage to save generated Word and PDF files. You can then provide download links to the user.

Testing and Deployment
Testing: Ensure that your calculations are correct, and test auto-complete, document generation, and real-time updates.

Deployment: Deploy the frontend using Firebase Hosting and ensure that Firebase rules are set to secure the data access.

This approach allows for a scalable and real-time CRM application using Vue.js, Firebase, and other necessary libraries for document generation and real-time synchronization.






