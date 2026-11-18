import fs from 'fs';
import path from 'path';

async function testUpload() {
  // 1. Login to get token
  const loginRes = await fetch('http://localhost:5000/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'owner@aurajewel.com',
      password: 'password123',
    }),
  });
  const loginData: any = await loginRes.json();
  const token = loginData.data.accessToken;
  console.log('✓ Logged in as:', loginData.data.user.email);

  // 2. Upload sample PDF
  const samplePdfPath = path.resolve(__dirname, '../../../sample_invoices/invoice_priya_sharma_INV-2026-101.pdf');
  const buffer = fs.readFileSync(samplePdfPath);
  const blob = new Blob([buffer], { type: 'application/pdf' });
  const form = new FormData();
  form.append('invoiceFile', blob, 'invoice_priya_sharma_INV-2026-101.pdf');

  const uploadRes = await fetch('http://localhost:5000/api/v1/invoices/upload', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: form,
  });

  const uploadData: any = await uploadRes.json();
  console.log('\n✓ PDF Upload & Extraction API Response:');
  console.log('Extracted Details:', uploadData.data.extracted);

  const ext = uploadData.data.extracted;

  // 3. Verify & Save
  const saveRes = await fetch('http://localhost:5000/api/v1/invoices/verify-and-save', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      customerName: ext.customerName,
      customerPhone: ext.customerPhone,
      whatsappNumber: ext.whatsappNumber,
      invoiceNumber: `${ext.invoiceNumber}-${Date.now().toString().slice(-4)}`,
      invoiceDate: ext.invoiceDate,
      totalAmount: ext.totalAmount,
      taxAmount: ext.taxAmount,
      items: ext.items,
    }),
  });

  const saveData: any = await saveRes.json();
  console.log('\n✓ Verified & Saved in MongoDB:');
  console.log('Invoice ID:', saveData.data._id);
  console.log('Customer Linked:', saveData.data.customerId.name, 'Phone:', saveData.data.customerId.mobileNumber);

  // 4. Send WhatsApp message
  const invoiceId = saveData.data._id;
  const waRes = await fetch(`http://localhost:5000/api/v1/whatsapp/send-invoice/${invoiceId}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const waData: any = await waRes.json();
  console.log('\n✓ WhatsApp Dispatched:');
  console.log('Message ID:', waData.data.messageId);
  console.log('Recipient Phone:', waData.data.recipientPhone);
  console.log('Feedback URL:', waData.data.feedbackUrl);
  console.log('Status:', waData.data.status);
  console.log('\nRendered Message Content:\n', waData.data.renderedContent);
}

testUpload().catch(console.error);
