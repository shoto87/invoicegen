import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

interface InvoiceData {
  fileName: string;
  shopName: string;
  shopAddress: string;
  shopGstin: string;
  invoiceNumber: string;
  invoiceDate: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  customerAddress: string;
  items: Array<{
    desc: string;
    purity: string;
    grossWt: string;
    netWt: string;
    rate: string;
    making: string;
    total: number;
  }>;
  subtotal: number;
  gst: number;
  grandTotal: number;
}

const sampleInvoices: InvoiceData[] = [
  {
    fileName: 'invoice_priya_sharma_INV-2026-101.pdf',
    shopName: 'MAHARAJA JEWELLERS & DIAMONDS',
    shopAddress: '42, Zaveri Bazaar, Kalbadevi, Mumbai - 400002',
    shopGstin: '27AABCU9603R1ZM',
    invoiceNumber: 'INV-2026-101',
    invoiceDate: '30-Oct-2026',
    customerName: 'Priya Sharma',
    customerPhone: '+91 98765 43210',
    customerEmail: 'priya.sharma@example.com',
    customerAddress: 'Flat 402, Sea Green Apts, Worli, Mumbai',
    items: [
      {
        desc: '22K Traditional Bridal Gold Choker Necklace',
        purity: '22K (916 Hallmarked)',
        grossWt: '24.500 g',
        netWt: '24.200 g',
        rate: '₹7,250 / g',
        making: '₹8,500',
        total: 175450,
      },
      {
        desc: 'Matching 22K Royal Gold Earrings (Pair)',
        purity: '22K (916 Hallmarked)',
        grossWt: '8.200 g',
        netWt: '8.000 g',
        rate: '₹7,250 / g',
        making: '₹3,200',
        total: 58000,
      },
    ],
    subtotal: 233450,
    gst: 7003.5,
    grandTotal: 240454,
  },
  {
    fileName: 'invoice_rajesh_patel_INV-2026-202.pdf',
    shopName: 'AURAJEWEL BOUTIQUE',
    shopAddress: '88, Commercial Street, Tasker Town, Bangalore - 560001',
    shopGstin: '29AABCS1234D1Z2',
    invoiceNumber: 'INV-2026-202',
    invoiceDate: '28-Oct-2026',
    customerName: 'Rajesh Patel',
    customerPhone: '+91 98220 12345',
    customerEmail: 'rajesh.patel@example.com',
    customerAddress: 'Plot 15, Indiranagar 1st Stage, Bangalore',
    items: [
      {
        desc: '18K Solitaire Diamond Ring (0.75ct VVS-1 / E)',
        purity: '18K (750 Hallmarked)',
        grossWt: '4.800 g',
        netWt: '4.650 g',
        rate: '₹5,400 / g',
        making: '₹6,500',
        total: 125000,
      },
    ],
    subtotal: 125000,
    gst: 3750,
    grandTotal: 128750,
  },
  {
    fileName: 'invoice_ananya_reddy_INV-2026-303.pdf',
    shopName: 'SRI LAKSHMI GOLD & DIAMOND PALACE',
    shopAddress: 'Plot 12, Road No. 36, Jubilee Hills, Hyderabad - 500033',
    shopGstin: '36AABCP7890R1ZY',
    invoiceNumber: 'INV-2026-303',
    invoiceDate: '25-Oct-2026',
    customerName: 'Ananya Reddy',
    customerPhone: '+91 99887 76655',
    customerEmail: 'ananya.reddy@example.com',
    customerAddress: 'Villa 7, Banjara Hills, Hyderabad',
    items: [
      {
        desc: '22K Antique Temple Finish Gold Kada (Pair)',
        purity: '22K (916 Hallmarked)',
        grossWt: '28.000 g',
        netWt: '27.500 g',
        rate: '₹7,200 / g',
        making: '₹7,800',
        total: 198000,
      },
    ],
    subtotal: 198000,
    gst: 5940,
    grandTotal: 203940,
  },
];

function generatePdf(data: InvoiceData, targetPaths: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40, size: 'A4' });

    // Multi-stream pipe
    const streams = targetPaths.map((p) => {
      fs.mkdirSync(path.dirname(p), { recursive: true });
      return fs.createWriteStream(p);
    });

    streams.forEach((stream) => doc.pipe(stream));

    // Header Branding
    doc.fillColor('#3F0E18').fontSize(18).font('Helvetica-Bold').text(data.shopName, { align: 'center' });
    doc.fontSize(9).font('Helvetica').fillColor('#555555').text(data.shopAddress, { align: 'center' });
    doc.text(`GSTIN: ${data.shopGstin} | State Code: 27 | HUID Certified`, { align: 'center' });
    doc.moveDown(0.5);

    doc.strokeColor('#D4AF37').lineWidth(1.5).moveTo(40, doc.y).lineTo(555, doc.y).stroke();
    doc.moveDown(0.8);

    // Title
    doc.fontSize(12).font('Helvetica-Bold').fillColor('#3F0E18').text('RETAIL TAX INVOICE', { align: 'center' });
    doc.moveDown(0.6);

    // Two-Column Meta Box
    const topY = doc.y;

    // Left Column: Customer details
    doc.fontSize(9).font('Helvetica-Bold').fillColor('#26070E').text('BUYER / CUSTOMER DETAILS:', 40, topY);
    doc.font('Helvetica').fontSize(9).fillColor('#222222');
    doc.text(`Customer Name: ${data.customerName}`, 40, topY + 14);
    doc.font('Helvetica-Bold').fillColor('#3F0E18').text(`Mobile / WhatsApp: ${data.customerPhone}`, 40, topY + 28);
    doc.font('Helvetica').fillColor('#222222').text(`Email: ${data.customerEmail}`, 40, topY + 42);
    doc.text(`Address: ${data.customerAddress}`, 40, topY + 56);

    // Right Column: Invoice details
    doc.fontSize(9).font('Helvetica-Bold').fillColor('#26070E').text('INVOICE INFORMATION:', 340, topY);
    doc.font('Helvetica').fontSize(9).fillColor('#222222');
    doc.font('Helvetica-Bold').text(`Invoice No: ${data.invoiceNumber}`, 340, topY + 14);
    doc.font('Helvetica').text(`Invoice Date: ${data.invoiceDate}`, 340, topY + 28);
    doc.text(`Place of Supply: Intra-State`, 340, topY + 42);
    doc.text(`Payment Mode: UPI / Card (Paid)`, 340, topY + 56);

    doc.moveDown(5);

    // Table Header
    const tableY = topY + 85;
    doc.rect(40, tableY, 515, 20).fill('#FAF7F2');
    doc.fillColor('#3F0E18').font('Helvetica-Bold').fontSize(8.5);
    doc.text('Item Description', 45, tableY + 6);
    doc.text('Purity', 240, tableY + 6);
    doc.text('Gross Wt', 315, tableY + 6);
    doc.text('Net Wt', 375, tableY + 6);
    doc.text('Making', 435, tableY + 6);
    doc.text('Amount (INR)', 485, tableY + 6, { width: 65, align: 'right' });

    let itemY = tableY + 25;
    data.items.forEach((item) => {
      doc.fillColor('#222222').font('Helvetica').fontSize(8.5);
      doc.text(item.desc, 45, itemY, { width: 190 });
      doc.text(item.purity, 240, itemY);
      doc.text(item.grossWt, 315, itemY);
      doc.text(item.netWt, 375, itemY);
      doc.text(item.making, 435, itemY);
      doc.font('Helvetica-Bold').text(`₹${item.total.toLocaleString('en-IN')}`, 485, itemY, {
        width: 65,
        align: 'right',
      });
      itemY += 24;
    });

    doc.strokeColor('#E0D5C1').lineWidth(1).moveTo(40, itemY).lineTo(555, itemY).stroke();
    itemY += 10;

    // Financial Summary
    const summaryX = 360;
    doc.fontSize(9).font('Helvetica').fillColor('#555555');
    doc.text('Subtotal (Taxable Value):', summaryX, itemY);
    doc.text(`₹${data.subtotal.toLocaleString('en-IN')}`, 485, itemY, { width: 65, align: 'right' });

    itemY += 14;
    doc.text('CGST (1.5%):', summaryX, itemY);
    doc.text(`₹${(data.gst / 2).toLocaleString('en-IN')}`, 485, itemY, { width: 65, align: 'right' });

    itemY += 14;
    doc.text('SGST (1.5%):', summaryX, itemY);
    doc.text(`₹${(data.gst / 2).toLocaleString('en-IN')}`, 485, itemY, { width: 65, align: 'right' });

    itemY += 18;
    doc.rect(summaryX - 5, itemY - 4, 200, 24).fill('#FAF7F2');
    doc.fillColor('#3F0E18').font('Helvetica-Bold').fontSize(11);
    doc.text('Grand Total:', summaryX, itemY + 2);
    doc.text(`₹${data.grandTotal.toLocaleString('en-IN')}`, 485, itemY + 2, { width: 65, align: 'right' });

    // Footer
    doc.fontSize(8).font('Helvetica').fillColor('#777777');
    doc.text(
      'Terms: Goods once sold are certified for 100% hallmark purity. Lifetime exchange against official invoice.',
      40,
      730,
      { align: 'center', width: 515 }
    );
    doc.font('Helvetica-Bold').fillColor('#3F0E18').text(
      'Thank you for your purchase with us! An automated copy has been sent to your WhatsApp.',
      40,
      745,
      { align: 'center', width: 515 }
    );

    doc.end();

    let finished = 0;
    streams.forEach((stream) => {
      stream.on('finish', () => {
        finished++;
        if (finished === streams.length) resolve();
      });
      stream.on('error', reject);
    });
  });
}

async function main() {
  const rootDir = path.resolve(__dirname, '../../../');
  const backendSampleDir = path.join(rootDir, 'sample_invoices');
  const frontendSampleDir = path.join(rootDir, 'frontend/public/sample_invoices');

  console.log('[Invoice Generator] Generating realistic jewellery PDFs...');

  for (const inv of sampleInvoices) {
    const target1 = path.join(backendSampleDir, inv.fileName);
    const target2 = path.join(frontendSampleDir, inv.fileName);
    await generatePdf(inv, [target1, target2]);
    console.log(`✓ Created: ${inv.fileName} (Customer: ${inv.customerName}, Phone: ${inv.customerPhone})`);
  }

  console.log('[Invoice Generator] All sample invoice PDFs generated successfully.');
}

main().catch(console.error);
