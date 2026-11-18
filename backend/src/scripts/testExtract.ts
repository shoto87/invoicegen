import fs from 'fs';
import path from 'path';
import { extractInvoiceFromPdf } from '../services/invoiceExtractor';

async function run() {
  const files = [
    'invoice_priya_sharma_INV-2026-101.pdf',
    'invoice_rajesh_patel_INV-2026-202.pdf',
    'invoice_ananya_reddy_INV-2026-303.pdf',
  ];

  for (const f of files) {
    const p = path.resolve(__dirname, '../../../sample_invoices', f);
    const buf = fs.readFileSync(p);
    const result = await extractInvoiceFromPdf(buf);
    console.log(`\n=================== FILE: ${f} ===================`);
    console.log(`👤 Customer: ${result.customerName}`);
    console.log(`📱 Mobile/WhatsApp: ${result.customerPhone}`);
    console.log(`📄 Invoice No: ${result.invoiceNumber}`);
    console.log(`📅 Date: ${result.invoiceDate}`);
    console.log(`💰 Grand Total: ₹${result.totalAmount.toLocaleString('en-IN')}`);
    console.log(`💎 Items:`, result.items.map((i) => i.description).join(', '));
    console.log(`🎯 Confidence Score: ${result.confidence}%`);
  }
}

run().catch(console.error);
