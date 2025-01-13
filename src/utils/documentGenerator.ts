import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, BorderStyle, AlignmentType, HeightRule, VerticalAlign, TabStopType, TabStopPosition, TabStopLeader, WidthType, TableAnchorType, RelativeHorizontalPosition, RelativeVerticalPosition } from 'docx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { db } from '../services/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { saveAs } from 'file-saver';

// Types
interface Company {
  name: string;
  address: string;
  phone: string;
  email: string;
  gst: string;
  pan: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
}

interface Client {
  name: string;
  company: string;
  address: string;
  email: string;
  phone: string;
  gst: string;
  contactPerson: string;
}

interface Item {
  catalogueId: string;
  description: string;
  packSize: string;
  quantity: number;
  unitRate: number;
  discount: number;
  discountedPrice: number;
  gst: number;
  gstValue: number;
  total: number;
  hsnCode: string;
  expandedPrice: number;
  leadTime: string;
  brand: string;
}

interface CreatedBy {
  name: string;
  email: string;
  mobile: string;
}

interface QuotationData {
  company: Company;
  quotationNumber: string;
  date: string;
  client: Client;
  items: Item[];
  subTotal: number;
  gstTotal: number;
  grandTotal: number;
  paymentTerms: string;
  commonTerms: string;
  notes: string;
  createdBy: CreatedBy;
  validUntil: string;
  terms: string;
}

// Add type for jsPDF with autoTable
interface jsPDFWithAutoTable extends jsPDF {
  autoTable: (options: any) => void;
  previousAutoTable: {
    finalY: number;
  };
}

// Helper function to format date
const formatDate = (date: string | Date) => {
  const d = new Date(date);
  return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
};

// Helper function to format currency
const formatCurrency = (amount: number): string => {
  return `₹${amount.toFixed(2)}`;
};

// Generate Word document
export const generateWordDocument = async (quotationData: QuotationData): Promise<void> => {
  try {
    // Document styles
    const styles = {
      header: {
        size: 24, // 12pt
        color: 'FFFFFF',
        bold: true,
        font: 'Calibri'
      },
      subHeader: {
        size: 18, // 9pt
        color: 'FFFFFF',
        font: 'Calibri'
      },
      sectionTitle: {
        size: 24,
        color: 'FFFFFF',
        bold: true,
        font: 'Calibri'
      },
      normalText: {
        size: 18, // 9pt
        font: 'Calibri'
      },
      tableHeader: {
        size: 20,
        color: 'FFFFFF',
        bold: true,
        font: 'Calibri'
      }
    };

    const blueBackground = {
      type: 'fill' as const,
      color: '102850',
      fill: '102850'
    };

    // Company Header with blue background using selected company details
    const headerSection = new Paragraph({
      children: [
        new TextRun({
          text: quotationData.company.name.toUpperCase(),
          ...styles.header
        }),
        new TextRun({
          text: `\n${quotationData.company.address}`,
          ...styles.subHeader,
          break: 1
        }),
        new TextRun({
          text: `\nEmail: ${quotationData.company.email} | Phone: ${quotationData.company.phone}`,
          ...styles.subHeader,
          break: 1
        }),
        new TextRun({
          text: `\nPAN NO.: ${quotationData.company.pan} | GST NO.: ${quotationData.company.gst}`,
          ...styles.subHeader,
          break: 1
        })
      ],
      spacing: {
        after: 300,
        before: 300
      },
      shading: blueBackground,
      alignment: AlignmentType.CENTER
    });

    // Quotation Title
    const quotationTitle = new Paragraph({
      children: [
        new TextRun({
          text: 'QUOTATION/PERFORMA INVOICE',
          bold: true,
          size: 24,
          font: 'Calibri'
        })
      ],
      spacing: {
        after: 300,
        before: 300
      },
      alignment: AlignmentType.CENTER,
      border: {
        bottom: {
          color: '000000',
          size: 15,
          style: BorderStyle.SINGLE
        }
      }
    });

    // Reference and Date with adjusted tabs
    const refAndDate = new Paragraph({
      children: [
        new TextRun({
          text: `Ref No: ${quotationData.quotationNumber}`,
          size: 18,
          bold: true,
          font: 'Calibri'
        }),
        new TextRun({
          text: `\t\t\t\t\t\t\t\t\t\tDate: ${formatDate(quotationData.date)}`,
          size: 18,
          bold: true,
          font: 'Calibri'
        })
      ],
      spacing: {
        before: 100,
        after: 100
      },
      alignment: AlignmentType.LEFT
    });

    // To Section with updated Kind Attn formatting
    const toTable = new Table({
      rows: [
        new TableRow({
          children: [
            new TableCell({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: 'To',
                      size: 18,
                      color: 'FFFFFF',
                      bold: true,
                      font: 'Calibri'
                    })
                  ]
                })
              ],
              shading: {
                type: 'fill',
                color: '102850',
                fill: '102850'
              }
            })
          ]
        }),
        new TableRow({
          children: [
            new TableCell({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: quotationData.client.name,
                      size: 18,
                      bold: true,
                      font: 'Calibri'
                    })
                  ],
                  spacing: { before: 30, after: 30 }
                })
              ],
              borders: {
                top: { style: BorderStyle.SINGLE, size: 1, color: 'E5E5E5' },
                bottom: { style: BorderStyle.SINGLE, size: 1, color: 'E5E5E5' },
                left: { style: BorderStyle.SINGLE, size: 1, color: 'E5E5E5' },
                right: { style: BorderStyle.SINGLE, size: 1, color: 'E5E5E5' }
              }
            })
          ]
        }),
        new TableRow({
          children: [
            new TableCell({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: quotationData.client.address,
                      size: 18,
                      font: 'Calibri'
                    })
                  ],
                  spacing: { before: 30, after: 30 }
                })
              ],
              borders: {
                top: { style: BorderStyle.SINGLE, size: 1, color: 'E5E5E5' },
                bottom: { style: BorderStyle.SINGLE, size: 1, color: 'E5E5E5' },
                left: { style: BorderStyle.SINGLE, size: 1, color: 'E5E5E5' },
                right: { style: BorderStyle.SINGLE, size: 1, color: 'E5E5E5' }
              }
            })
          ]
        }),
        new TableRow({
          children: [
            new TableCell({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({ 
                      text: 'Kind Attn: ',
                      size: 18,
                      bold: true,
                      font: 'Calibri'
                    }),
                    new TextRun({
                      text: 'Dr.',
                      size: 18,
                      bold: true,
                      underline: {},
                      font: 'Calibri'
                    }),
                    new TextRun({
                      text: ' ' + (quotationData.client.contactPerson || quotationData.client.name), 
                      size: 18,
                      bold: true,
                      underline: {},
                      font: 'Calibri'
                    }),
                    new TextRun({ text: ' | Tel: ', size: 18, font: 'Calibri' }),
                    new TextRun({ text: quotationData.client.phone || '', size: 18, font: 'Calibri' }),
                    new TextRun({ text: ' | Email: ', size: 18, font: 'Calibri' }),
                    new TextRun({ text: quotationData.client.email, size: 18, font: 'Calibri' })
                  ],
                  spacing: { before: 30, after: 30 }
                })
              ],
              borders: {
                top: { style: BorderStyle.SINGLE, size: 1, color: 'E5E5E5' },
                bottom: { style: BorderStyle.SINGLE, size: 1, color: 'E5E5E5' },
                left: { style: BorderStyle.SINGLE, size: 1, color: 'E5E5E5' },
                right: { style: BorderStyle.SINGLE, size: 1, color: 'E5E5E5' }
              }
            })
          ]
        })
      ],
      width: { size: 100, type: 'pct' },
      margins: { top: 30, bottom: 30 }
    });

    // Thank you text with proper line breaks
    const thankYouText = new Paragraph({
      children: [
        new TextRun({
          text: 'Dear Sir/Madam,',
          size: 18,
          font: 'Calibri'
        }),
        new TextRun({
          text: '\nThank you for your enquiry. We are pleased to quote our best prices as under:',
          size: 18,
          font: 'Calibri',
          break: 1
        })
      ],
      spacing: {
        before: 200,
        after: 200,
        line: 300
      }
    });

    // Calculate totals before generating document
    const calculateTotals = (items: Item[]): { subTotal: number, gstTotal: number, grandTotal: number } => {
      let subTotal = 0;
      let gstTotal = 0;

      items.forEach(item => {
        const quantity = Number(item.quantity) || 0;
        const unitRate = Number(item.unitRate) || 0;
        const discount = Number(item.discount) || 0;
        const gstPercent = Number(item.gst) || 0;

        const discountedPrice = unitRate * (1 - discount / 100);
        const expandedPrice = discountedPrice * quantity;
        const itemGstValue = expandedPrice * (gstPercent / 100);

        subTotal += expandedPrice;
        gstTotal += itemGstValue;
      });

      const grandTotal = subTotal + gstTotal;

      return {
        subTotal: Number(subTotal.toFixed(2)),
        gstTotal: Number(gstTotal.toFixed(2)),
        grandTotal: Number(grandTotal.toFixed(2))
      };
    };

    const totals = calculateTotals(quotationData.items);

    // Update quotationData with calculated totals
    quotationData.subTotal = totals.subTotal;
    quotationData.gstTotal = totals.gstTotal;
    quotationData.grandTotal = totals.grandTotal;

    // Prepare items with calculated values
    const processedItems = quotationData.items.map(item => {
      const quantity = Number(item.quantity) || 0;
      const unitRate = Number(item.unitRate) || 0;
      const discount = Number(item.discount) || 0;
      const gstPercent = Number(item.gst) || 0;

      const discountedPrice = unitRate * (1 - discount / 100);
      const expandedPrice = discountedPrice * quantity;
      const gstValue = expandedPrice * (gstPercent / 100);
      const total = expandedPrice + gstValue;

      return {
        ...item,
        quantity,
        unitRate,
        discount,
        gst: gstPercent,
        discountedPrice: Number(discountedPrice.toFixed(2)),
        expandedPrice: Number(expandedPrice.toFixed(2)),
        gstValue: Number(gstValue.toFixed(2)),
        total: Number(total.toFixed(2))
      };
    });

    // Add spacing after items table
    const spacingAfterTable = new Paragraph({
      children: [new TextRun({ text: '', size: 24 })],
      spacing: { after: 400 }
    });

    // Items Table with enhanced formatting
    const itemsTable = new Table({
      rows: [
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'S.No', size: 18, font: 'Calibri', bold: true })] })], width: { size: 500, type: WidthType.DXA }, shading: { fill: '102850', color: 'FFFFFF' }, verticalAlign: VerticalAlign.CENTER }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Catalogue Id.', size: 18, font: 'Calibri', bold: true })] })], width: { size: 1000, type: WidthType.DXA }, shading: { fill: '102850', color: 'FFFFFF' }, verticalAlign: VerticalAlign.CENTER }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Description', size: 18, font: 'Calibri', bold: true })] })], width: { size: 2500, type: WidthType.DXA }, shading: { fill: '102850', color: 'FFFFFF' }, verticalAlign: VerticalAlign.CENTER }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Pack Size', size: 18, font: 'Calibri', bold: true })] })], width: { size: 800, type: WidthType.DXA }, shading: { fill: '102850', color: 'FFFFFF' }, verticalAlign: VerticalAlign.CENTER }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'HSN Code', size: 18, font: 'Calibri', bold: true })] })], width: { size: 1000, type: WidthType.DXA }, shading: { fill: '102850', color: 'FFFFFF' }, verticalAlign: VerticalAlign.CENTER }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Qty', size: 18, font: 'Calibri', bold: true })] })], width: { size: 500, type: WidthType.DXA }, shading: { fill: '102850', color: 'FFFFFF' }, verticalAlign: VerticalAlign.CENTER }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Unit Rate', size: 18, font: 'Calibri', bold: true })] })], width: { size: 1000, type: WidthType.DXA }, shading: { fill: '102850', color: 'FFFFFF' }, verticalAlign: VerticalAlign.CENTER }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Discount %', size: 18, font: 'Calibri', bold: true })] })], width: { size: 800, type: WidthType.DXA }, shading: { fill: '102850', color: 'FFFFFF' }, verticalAlign: VerticalAlign.CENTER }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Discounted Price', size: 18, font: 'Calibri', bold: true })] })], width: { size: 1200, type: WidthType.DXA }, shading: { fill: '102850', color: 'FFFFFF' }, verticalAlign: VerticalAlign.CENTER }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Expanded Price', size: 18, font: 'Calibri', bold: true })] })], width: { size: 1200, type: WidthType.DXA }, shading: { fill: '102850', color: 'FFFFFF' }, verticalAlign: VerticalAlign.CENTER }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'GST %', size: 18, font: 'Calibri', bold: true })] })], width: { size: 600, type: WidthType.DXA }, shading: { fill: '102850', color: 'FFFFFF' }, verticalAlign: VerticalAlign.CENTER }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'GST Value', size: 18, font: 'Calibri', bold: true })] })], width: { size: 1000, type: WidthType.DXA }, shading: { fill: '102850', color: 'FFFFFF' }, verticalAlign: VerticalAlign.CENTER }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Total', size: 18, font: 'Calibri', bold: true })] })], width: { size: 1000, type: WidthType.DXA }, shading: { fill: '102850', color: 'FFFFFF' }, verticalAlign: VerticalAlign.CENTER }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Lead Time', size: 18, font: 'Calibri', bold: true })] })], width: { size: 800, type: WidthType.DXA }, shading: { fill: '102850', color: 'FFFFFF' }, verticalAlign: VerticalAlign.CENTER }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Brand', size: 18, font: 'Calibri', bold: true })] })], width: { size: 1000, type: WidthType.DXA }, shading: { fill: '102850', color: 'FFFFFF' }, verticalAlign: VerticalAlign.CENTER })
          ],
          tableHeader: true
        }),
        ...processedItems.map((item, index) => {
          return new TableRow({
            children: [
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: (index + 1).toString(), size: 18, font: 'Calibri' })] })], verticalAlign: VerticalAlign.CENTER }),
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: item.catalogueId || '', size: 18, font: 'Calibri' })] })], verticalAlign: VerticalAlign.CENTER }),
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: item.description || '', size: 18, font: 'Calibri' })] })], verticalAlign: VerticalAlign.CENTER }),
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: item.packSize || '', size: 18, font: 'Calibri' })] })], verticalAlign: VerticalAlign.CENTER }),
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: item.hsnCode || '', size: 18, font: 'Calibri' })] })], verticalAlign: VerticalAlign.CENTER }),
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: item.quantity?.toString() || '', size: 18, font: 'Calibri' })] })], verticalAlign: VerticalAlign.CENTER }),
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: `₹${Number(item.unitRate).toFixed(2)}`, size: 18, font: 'Calibri' })] })], verticalAlign: VerticalAlign.CENTER }),
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: item.discount ? `${item.discount}%` : '0%', size: 18, font: 'Calibri' })] })], verticalAlign: VerticalAlign.CENTER }),
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: `₹${item.discountedPrice.toFixed(2)}`, size: 18, font: 'Calibri' })] })], verticalAlign: VerticalAlign.CENTER }),
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: `₹${item.expandedPrice.toFixed(2)}`, size: 18, font: 'Calibri' })] })], verticalAlign: VerticalAlign.CENTER }),
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: `${item.gst}%`, size: 18, font: 'Calibri' })] })], verticalAlign: VerticalAlign.CENTER }),
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: `₹${item.gstValue.toFixed(2)}`, size: 18, font: 'Calibri' })] })], verticalAlign: VerticalAlign.CENTER }),
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: `₹${item.total.toFixed(2)}`, size: 18, font: 'Calibri' })] })], verticalAlign: VerticalAlign.CENTER }),
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: item.leadTime || '', size: 18, font: 'Calibri' })] })], verticalAlign: VerticalAlign.CENTER }),
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: item.brand || '', size: 18, font: 'Calibri' })] })], verticalAlign: VerticalAlign.CENTER })
            ]
          });
        })
      ],
      width: { size: 100, type: WidthType.PERCENTAGE },
      alignment: AlignmentType.CENTER,
      borders: {
        top: { style: BorderStyle.SINGLE, size: 1, color: 'E5E5E5' },
        bottom: { style: BorderStyle.SINGLE, size: 1, color: 'E5E5E5' },
        left: { style: BorderStyle.SINGLE, size: 1, color: 'E5E5E5' },
        right: { style: BorderStyle.SINGLE, size: 1, color: 'E5E5E5' },
        insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: 'E5E5E5' },
        insideVertical: { style: BorderStyle.SINGLE, size: 1, color: 'E5E5E5' }
      }
    });

    // Add spacing between tables
    const tableSpacing = new Paragraph({
      children: [new TextRun({ text: '', size: 24 })],
      spacing: { before: 100, after: 100 }
    });

    // Create totals table with blue background and white text
    const totalsTable = new Table({
      rows: [
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ 
                children: [new TextRun({ text: 'Sub Total:', size: 18, font: 'Calibri', bold: true, color: 'FFFFFF' })],
                alignment: AlignmentType.LEFT
              })],
              width: { size: 1200, type: WidthType.DXA },
              shading: { fill: '102850' }
            }),
            new TableCell({
              children: [new Paragraph({ 
                children: [new TextRun({ text: `₹${totals.subTotal.toFixed(2)}`, size: 18, font: 'Calibri' })],
                alignment: AlignmentType.RIGHT
              })],
              width: { size: 1000, type: WidthType.DXA }
            })
          ]
        }),
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ 
                children: [new TextRun({ text: 'GST Total:', size: 18, font: 'Calibri', bold: true, color: 'FFFFFF' })],
                alignment: AlignmentType.LEFT
              })],
              width: { size: 1200, type: WidthType.DXA },
              shading: { fill: '102850' }
            }),
            new TableCell({
              children: [new Paragraph({ 
                children: [new TextRun({ text: `₹${totals.gstTotal.toFixed(2)}`, size: 18, font: 'Calibri' })],
                alignment: AlignmentType.RIGHT
              })],
              width: { size: 1000, type: WidthType.DXA }
            })
          ]
        }),
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ 
                children: [new TextRun({ text: 'Grand Total:', size: 18, font: 'Calibri', bold: true, color: 'FFFFFF' })],
                alignment: AlignmentType.LEFT
              })],
              width: { size: 1200, type: WidthType.DXA },
              shading: { fill: '102850' }
            }),
            new TableCell({
              children: [new Paragraph({ 
                children: [new TextRun({ text: `₹${totals.grandTotal.toFixed(2)}`, size: 18, font: 'Calibri', bold: true })],
                alignment: AlignmentType.RIGHT
              })],
              width: { size: 1000, type: WidthType.DXA }
            })
          ]
        })
      ],
      width: { size: 30, type: WidthType.PERCENTAGE },
      alignment: AlignmentType.RIGHT,
      borders: {
        top: { style: BorderStyle.SINGLE, size: 1, color: 'E5E5E5' },
        bottom: { style: BorderStyle.SINGLE, size: 1, color: 'E5E5E5' },
        left: { style: BorderStyle.SINGLE, size: 1, color: 'E5E5E5' },
        right: { style: BorderStyle.SINGLE, size: 1, color: 'E5E5E5' },
        insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: 'E5E5E5' }
      }
    });

    // Create section headers with blue background
    const createSectionHeader = (text: string) => new Paragraph({
      children: [new TextRun({ text, size: 18, font: 'Calibri', bold: true, color: 'FFFFFF' })],
      spacing: { before: 200, after: 100 },
      shading: { fill: '102850' }
    });

    // Bank Details section
    const bankDetailsTitle = createSectionHeader('Bank Details');
    const bankDetails = new Paragraph({
      children: [
        new TextRun({ 
          text: `${quotationData.company.bankName} Account No:- `,
          size: 18,
          font: 'Calibri'
        }),
        new TextRun({ 
          text: quotationData.company.accountNumber,
          size: 18,
          font: 'Calibri',
          underline: {}
        }),
        new TextRun({ 
          text: ` - NEFT/RTGS IFCS : ${quotationData.company.ifscCode}`,
          size: 18,
          font: 'Calibri'
        })
      ],
      spacing: { before: 100, after: 200 }
    });

    // Terms & Conditions section
    const termsTitle = createSectionHeader('Terms & Conditions');
    
    // Create individual paragraphs for each term
    const term1 = new Paragraph({
      children: [new TextRun({ text: '1) 100% payment within 15 days of delivery of items', size: 18, font: 'Calibri' })],
      spacing: { before: 100, after: 100 }
    });

    const term2 = new Paragraph({
      children: [new TextRun({ text: '2) Validity: 30 Days', size: 18, font: 'Calibri' })],
      spacing: { before: 100, after: 100 }
    });

    const term3 = new Paragraph({
      children: [new TextRun({ text: '3) Lead Time: Please check individual items for their lead time', size: 18, font: 'Calibri' })],
      spacing: { before: 100, after: 100 }
    });

    const term4 = new Paragraph({
      children: [new TextRun({ text: '4) Please check the item status before placing order', size: 18, font: 'Calibri' })],
      spacing: { before: 100, after: 100 }
    });

    const term5 = new Paragraph({
      children: [new TextRun({ text: '5) Order once placed will not be cancelled', size: 18, font: 'Calibri' })],
      spacing: { before: 100, after: 200 }
    });

    // Quotation Created By section
    const createdByTitle = createSectionHeader('Quotation Created By');
    
    const employeeName = new Paragraph({
      children: [new TextRun({ text: 'Rajeev Yadav', size: 18, font: 'Calibri' })],
      spacing: { before: 100, after: 100 }
    });

    const employeeMobile = new Paragraph({
      children: [
        new TextRun({ text: 'Mobile: ', size: 18, font: 'Calibri' }),
        new TextRun({ text: '8929800816', size: 18, font: 'Calibri' })
      ],
      spacing: { before: 100, after: 100 }
    });

    const employeeEmail = new Paragraph({
      children: [
        new TextRun({ text: 'Email: ', size: 18, font: 'Calibri' }),
        new TextRun({ text: 'rajeev.chembio@gmail.com', size: 18, font: 'Calibri' })
      ],
      spacing: { before: 100, after: 200 }
    });

    // Add company name and authorized signatory
    const forCompanyText = new Paragraph({
      children: [
        new TextRun({ text: 'For CHEMBIO LIFESCIENCES', size: 18, font: 'Calibri', bold: true })
      ],
      spacing: { before: 400, after: 400 },
      alignment: AlignmentType.RIGHT
    });

    const authorizedSignatoryText = new Paragraph({
      children: [
        new TextRun({ text: 'Authorized Signatory', size: 18, font: 'Calibri' })
      ],
      spacing: { before: 100, after: 100 },
      alignment: AlignmentType.RIGHT
    });

    // Create document with original structure
    const doc = new Document({
      sections: [{
        properties: {
          page: {
            margin: {
              top: 259,    // 0.18"
              bottom: 994, // 0.69"
              left: 288,   // 0.2"
              right: 288   // 0.2"
            }
          }
        },
        children: [
          headerSection,
          quotationTitle,
          refAndDate,
          toTable,
          thankYouText,
          itemsTable,
          tableSpacing,
          totalsTable,
          bankDetailsTitle,
          bankDetails,
          termsTitle,
          term1,
          term2,
          term3,
          term4,
          term5,
          createdByTitle,
          employeeName,
          employeeMobile,
          employeeEmail,
          forCompanyText,
          authorizedSignatoryText
        ]
      }]
    });

    // Use toBlob for browser environment
    const blob = await Packer.toBlob(doc);
    saveAs(blob, `Quotation_${quotationData.quotationNumber}.docx`);

    // Save to Firebase with calculated values
    const documentData = {
      type: 'word',
      quotationNumber: quotationData.quotationNumber,
      date: quotationData.date,
      validUntil: quotationData.validUntil,
      company: quotationData.company,
      client: quotationData.client,
      items: processedItems,
      subTotal: totals.subTotal,
      gstTotal: totals.gstTotal,
      grandTotal: totals.grandTotal,
      paymentTerms: quotationData.paymentTerms,
      commonTerms: quotationData.commonTerms,
      notes: quotationData.notes,
      createdBy: quotationData.createdBy,
      createdAt: new Date()
    };

    try {
      await addDoc(collection(db, 'quotation_documents'), documentData);
    } catch (error) {
      console.error('Error saving to Firebase:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error generating Word document:', error);
    throw error;
  }
};

// Generate PDF document data
export const generatePDFDocument = async (quotationData: QuotationData): Promise<void> => {
  try {
    // Create document data structure
    const documentData = {
      type: 'pdf',
      quotationNumber: quotationData.quotationNumber,
      date: quotationData.date,
      validUntil: quotationData.validUntil,
      company: quotationData.company,
      client: quotationData.client,
      items: quotationData.items,
      subTotal: quotationData.subTotal,
      gstTotal: quotationData.gstTotal,
      grandTotal: quotationData.grandTotal,
      paymentTerms: quotationData.paymentTerms,
      commonTerms: quotationData.commonTerms,
      notes: quotationData.notes,
      createdBy: quotationData.createdBy,
      createdAt: new Date().toISOString()
    };

    // Save to Firestore
    await addDoc(collection(db, 'quotation_documents'), documentData);
  } catch (error) {
    console.error('Error generating PDF document data:', error);
    throw error;
  }
};