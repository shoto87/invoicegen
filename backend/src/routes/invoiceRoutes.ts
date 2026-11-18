import { Router, Response } from 'express';
import multer from 'multer';
import { Types } from 'mongoose';
import { authenticate } from '../middleware/auth';
import { requireTenant } from '../middleware/tenant';
import { AuthenticatedRequest } from '../types';
import { Invoice } from '../models/Invoice';
import { Customer } from '../models/Customer';
import { extractInvoiceFromPdf } from '../services/invoiceExtractor';
import { successResponse, errorResponse } from '../utils/apiResponse';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB limit
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'application/pdf' || file.originalname.endsWith('.pdf')) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF format invoices are allowed'));
    }
  },
});

router.use(authenticate);
router.use(requireTenant);

// 1. List Invoices for current shop
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const skip = (page - 1) * limit;

  const total = await Invoice.countDocuments({ shopId: req.shopId });
  const invoices = await Invoice.find({ shopId: req.shopId })
    .populate('customerId', 'name mobileNumber whatsappNumber')
    .sort({ invoiceDate: -1 })
    .skip(skip)
    .limit(limit);

  successResponse(res, invoices, 'Invoices retrieved successfully.', 200, {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  });
});

// 2. Upload PDF & Extract Information (Customer Name, Phone/WhatsApp, Amount, Items)
router.post('/upload', upload.single('invoiceFile'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.file) {
      errorResponse(res, 'Please provide an invoice PDF file to upload.', 400);
      return;
    }

    const extracted = await extractInvoiceFromPdf(req.file.buffer);

    successResponse(
      res,
      {
        originalFileName: req.file.originalname,
        fileSize: req.file.size,
        extracted,
      },
      'Invoice PDF processed and details extracted successfully.'
    );
  } catch (err: any) {
    console.error('[Invoice Extraction Error]', err);
    errorResponse(res, `Failed to parse invoice PDF: ${err.message}`, 500);
  }
});

// 3. Verify Extracted Details & Save to Database (Deduplicating Customer)
router.post('/verify-and-save', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const shopId = new Types.ObjectId(req.shopId as string);
    const {
      customerName,
      customerPhone,
      whatsappNumber,
      customerEmail,
      invoiceNumber,
      invoiceDate,
      totalAmount,
      taxAmount,
      items,
      notes,
    } = req.body;

    if (!customerPhone || !invoiceNumber || !totalAmount) {
      errorResponse(res, 'Customer phone number, invoice number, and total amount are required.', 400);
      return;
    }

    // Deduplicate or create Customer by phone number in this shop
    let customer = await Customer.findOne({
      shopId,
      mobileNumber: customerPhone.trim(),
    });

    if (!customer) {
      customer = await Customer.create({
        shopId,
        name: customerName ? customerName.trim() : 'Valued Client',
        mobileNumber: customerPhone.trim(),
        whatsappNumber: whatsappNumber ? whatsappNumber.trim() : customerPhone.trim(),
        email: customerEmail ? customerEmail.trim() : undefined,
        consentStatus: 'granted',
        totalInvoicesCount: 1,
        totalSpent: Number(totalAmount),
        lastInvoiceDate: new Date(invoiceDate || Date.now()),
      });
    } else {
      customer.totalInvoicesCount += 1;
      customer.totalSpent += Number(totalAmount);
      customer.lastInvoiceDate = new Date(invoiceDate || Date.now());
      if (customerName && customer.name === 'Valued Client') {
        customer.name = customerName.trim();
      }
      await customer.save();
    }

    // Check if invoice number already exists in this shop
    const existingInvoice = await Invoice.findOne({ shopId, invoiceNumber: invoiceNumber.trim() });
    if (existingInvoice) {
      errorResponse(res, `Invoice with number ${invoiceNumber} already exists in your shop records.`, 409);
      return;
    }

    // Create Invoice
    const invoice = await Invoice.create({
      shopId,
      customerId: customer._id,
      invoiceNumber: invoiceNumber.trim(),
      invoiceDate: new Date(invoiceDate || Date.now()),
      totalAmount: Number(totalAmount),
      taxAmount: Number(taxAmount || 0),
      items: items && items.length > 0 ? items : [{ description: 'Jewellery Ornaments', total: Number(totalAmount) }],
      status: 'verified',
      extractionConfidence: 98,
      paymentStatus: 'paid',
      notes: notes || 'Verified from uploaded PDF',
    });

    const populated = await Invoice.findById(invoice._id).populate('customerId');

    successResponse(
      res,
      populated,
      'Invoice details verified and recorded successfully into your database.',
      201
    );
  } catch (err: any) {
    console.error('[Verify & Save Error]', err);
    errorResponse(res, err.message || 'Failed to save invoice record.', 500);
  }
});

export default router;
