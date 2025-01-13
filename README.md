# CRM Application with Quotation System

A modern, feature-rich Customer Relationship Management (CRM) system built with Vue 3, TypeScript, and Firebase. This application specializes in managing client relationships, generating professional quotations, and handling business operations efficiently.

## 🌟 Features

### Client Management
- Add and manage client profiles
- Store client details including contact information, GST numbers, and addresses
- Track client interactions and history

### Quotation System
- Create professional quotations with a modern UI
- Dynamic company selection with automatic detail population
- Automatic calculations for:
  - Item-wise pricing
  - Discounts
  - GST calculations
  - Total amounts
- Generate professional Word and PDF documents
- Customizable terms and conditions
- Bank details integration

### Product Catalog
- Maintain a comprehensive product catalog
- Store product details including:
  - Catalogue ID
  - Description
  - Pack Size
  - HSN Code
  - Brand/Make
  - Pricing

### Document Generation
- Generate professional quotations in both Word and PDF formats
- Company letterhead integration
- Dynamic bank details
- Automatic calculations and formatting
- Professional layout and design

## 🛠️ Technical Stack

### Frontend
- Vue 3 with Composition API
- TypeScript for type safety
- Vite as build tool
- Vuetify for UI components
- Pinia for state management

### Backend & Services
- Firebase for backend services
  - Firestore for database
  - Firebase Authentication
  - Firebase Storage
- Vercel for deployment

### Document Generation
- docx for Word document generation
- jsPDF for PDF generation

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Git

### Installation
1. Clone the repository:
```bash
git clone https://github.com/gauravitis/crm-new-app.git
cd crm-new-app
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory and add your Firebase configuration:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

4. Start the development server:
```bash
npm run dev
```

## 📦 Build and Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Vercel
The project is configured for seamless deployment to Vercel. The `vercel.json` configuration handles:
- Build commands
- Output directory configuration
- Routing rules
- Cache control headers

## 🔧 Project Structure

```
src/
├── assets/          # Static assets
├── components/      # Vue components
├── router/         # Vue Router configuration
├── store/          # Pinia store modules
├── services/       # Firebase and other service integrations
├── types/          # TypeScript type definitions
├── utils/          # Utility functions
└── views/          # Page components
```

## 🧩 Key Components

### QuotationPage
- Main component for quotation creation
- Handles dynamic form inputs
- Manages calculations and validations
- Integrates with document generation

### DocumentGenerator
- Handles Word and PDF generation
- Implements professional layouts
- Manages dynamic content placement
- Handles calculations and formatting

## 🔐 Security

- Firebase Authentication for user management
- Secure environment variable handling
- Data validation and sanitization
- Proper error handling

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Authors

- **Gaurav Kumar** - *Initial work and maintenance*

## 🙏 Acknowledgments

- Vue.js team for the amazing framework
- Firebase team for the backend services
- Vercel for hosting and deployment
- All contributors and users of the application
