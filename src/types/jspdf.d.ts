import { jsPDF } from 'jspdf';

declare module 'jspdf' {
  interface jsPDF {
    getTextDimensions(text: string, options?: any): { w: number; h: number };
  }
}

declare module 'jspdf-autotable' {
  interface jsPDF {
    autoTable(options: any): void;
    previousAutoTable: {
      finalY: number;
    };
  }
} 