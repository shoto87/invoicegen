import { Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import { AuthenticatedRequest } from '../types';
import { Invoice } from '../models/Invoice';
import { Customer } from '../models/Customer';
import { WhatsAppMessage } from '../models/WhatsAppMessage';
import { Feedback } from '../models/Feedback';
import { successResponse } from '../utils/apiResponse';

export async function getDashboardStats(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const shopId = new Types.ObjectId(req.shopId as string);

    // 1. Total Invoices & Revenue
    const [invoiceAgg] = await Invoice.aggregate([
      { $match: { shopId } },
      {
        $group: {
          _id: null,
          totalCount: { $sum: 1 },
          totalRevenue: { $sum: '$totalAmount' },
        },
      },
    ]);

    const totalInvoices = invoiceAgg?.totalCount || 0;
    const totalRevenue = invoiceAgg?.totalRevenue || 0;

    // 2. Total Customers
    const totalCustomers = await Customer.countDocuments({ shopId });

    // 3. WhatsApp Messages Stats
    const whatsAppStats = await WhatsAppMessage.aggregate([
      { $match: { shopId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    let messagesSent = 0;
    let messagesDelivered = 0;
    let messagesFailed = 0;
    let messagesRead = 0;

    whatsAppStats.forEach((item) => {
      if (item._id === 'sent') messagesSent += item.count;
      if (item._id === 'delivered') messagesDelivered += item.count;
      if (item._id === 'read') {
        messagesDelivered += item.count; // Read is also delivered
        messagesRead += item.count;
      }
      if (item._id === 'failed') messagesFailed += item.count;
    });

    const totalWhatsAppDispatched = messagesSent + messagesDelivered + messagesFailed;

    // 4. Customer Feedback & Average Rating
    const [feedbackAgg] = await Feedback.aggregate([
      { $match: { shopId } },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          avgRating: { $avg: '$rating' },
        },
      },
    ]);

    const totalFeedback = feedbackAgg?.count || 0;
    const averageRating = feedbackAgg ? Number(feedbackAgg.avgRating.toFixed(1)) : 0;

    // 5. Monthly Sales Aggregation (Last 6 Months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlySalesAgg = await Invoice.aggregate([
      {
        $match: {
          shopId,
          invoiceDate: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$invoiceDate' },
            month: { $month: '$invoiceDate' },
          },
          revenue: { $sum: '$totalAmount' },
          invoicesCount: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlySales = monthlySalesAgg.map((item) => ({
      month: `${monthNames[item._id.month - 1]} ${item._id.year}`,
      revenue: item.revenue,
      count: item.invoicesCount,
    }));

    // 6. WhatsApp Delivery Chart Data
    const deliveryChart = [
      { status: 'Delivered', count: messagesDelivered, fill: '#10B981' },
      { status: 'Sent', count: messagesSent, fill: '#3B82F6' },
      { status: 'Read', count: messagesRead, fill: '#8B5CF6' },
      { status: 'Failed', count: messagesFailed, fill: '#EF4444' },
    ];

    // 7. Customer Rating Distribution (1 to 5 Stars)
    const ratingAgg = await Feedback.aggregate([
      { $match: { shopId } },
      {
        $group: {
          _id: '$rating',
          count: { $sum: 1 },
        },
      },
    ]);

    const ratingDistribution = [1, 2, 3, 4, 5].map((star) => {
      const match = ratingAgg.find((r) => r._id === star);
      return {
        star: `${star} Star`,
        count: match ? match.count : 0,
      };
    });

    // 8. Recent Invoices
    const recentInvoices = await Invoice.find({ shopId })
      .sort({ createdAt: -1 })
      .limit(6)
      .populate('customerId', 'name mobileNumber')
      .lean();

    // 9. Recent Customer Feedback
    const recentFeedback = await Feedback.find({ shopId })
      .sort({ createdAt: -1 })
      .limit(4)
      .populate('customerId', 'name')
      .populate('invoiceId', 'invoiceNumber totalAmount')
      .lean();

    successResponse(
      res,
      {
        summary: {
          totalInvoices,
          totalRevenue,
          totalCustomers,
          whatsapp: {
            total: totalWhatsAppDispatched,
            sent: messagesSent,
            delivered: messagesDelivered,
            read: messagesRead,
            failed: messagesFailed,
          },
          feedback: {
            total: totalFeedback,
            averageRating,
          },
        },
        charts: {
          monthlySales,
          deliveryChart,
          ratingDistribution,
        },
        recentInvoices,
        recentFeedback,
      },
      'Dashboard metrics retrieved successfully.'
    );
  } catch (err) {
    next(err);
  }
}

/**
 * Seed realistic jewellery shop data into actual MongoDB collections for testing & demonstration
 */
export async function seedSampleData(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const shopId = new Types.ObjectId(req.shopId as string);

    // Delete existing sample records for this shop to avoid collisions
    await Invoice.deleteMany({ shopId });
    await Customer.deleteMany({ shopId });
    await WhatsAppMessage.deleteMany({ shopId });
    await Feedback.deleteMany({ shopId });

    // 1. Create Customers
    const customersData = [
      {
        shopId,
        name: 'Priya Sharma',
        mobileNumber: '+919876543210',
        whatsappNumber: '+919876543210',
        email: 'priya.sharma@example.com',
        consentStatus: 'granted' as const,
        totalInvoicesCount: 2,
        totalSpent: 285000,
        notes: 'VIP client, prefers 22K bridal gold ornaments',
      },
      {
        shopId,
        name: 'Rajesh Verma',
        mobileNumber: '+919823456789',
        whatsappNumber: '+919823456789',
        email: 'rajesh.verma@example.com',
        consentStatus: 'granted' as const,
        totalInvoicesCount: 1,
        totalSpent: 145000,
        notes: 'Purchased diamond solitaire ring for anniversary',
      },
      {
        shopId,
        name: 'Ananya Iyer',
        mobileNumber: '+919811223344',
        whatsappNumber: '+919811223344',
        email: 'ananya.iyer@example.com',
        consentStatus: 'granted' as const,
        totalInvoicesCount: 1,
        totalSpent: 92000,
        notes: 'Traditional Temple jewellery collector',
      },
      {
        shopId,
        name: 'Vikram Malhotra',
        mobileNumber: '+919988776655',
        whatsappNumber: '+919988776655',
        email: 'vikram.m@example.com',
        consentStatus: 'granted' as const,
        totalInvoicesCount: 1,
        totalSpent: 340000,
        notes: 'Festive shopping - 24K gold bullion and necklace',
      },
      {
        shopId,
        name: 'Meera Patel',
        mobileNumber: '+919712345678',
        whatsappNumber: '+919712345678',
        email: 'meera.p@example.com',
        consentStatus: 'granted' as const,
        totalInvoicesCount: 1,
        totalSpent: 68000,
        notes: 'Rose gold diamond bracelet',
      },
    ];

    const createdCustomers = await Customer.insertMany(customersData);

    // 2. Create Invoices across the last few months
    const now = new Date();
    const m1 = new Date(now.getFullYear(), now.getMonth() - 3, 12);
    const m2 = new Date(now.getFullYear(), now.getMonth() - 2, 18);
    const m3 = new Date(now.getFullYear(), now.getMonth() - 1, 5);
    const m4 = new Date(now.getFullYear(), now.getMonth() - 1, 24);
    const m5 = new Date(now.getFullYear(), now.getMonth(), 8);
    const m6 = new Date(now.getFullYear(), now.getMonth(), 28);

    const invoicesData = [
      {
        shopId,
        customerId: createdCustomers[0]._id,
        invoiceNumber: 'INV-2026-001',
        invoiceDate: m1,
        totalAmount: 185000,
        taxAmount: 5550,
        items: [
          {
            description: '22K Traditional Gold Choker Necklace',
            grossWeight: 28.5,
            netWeight: 28.0,
            purity: '22K (916)',
            metalRate: 6150,
            makingCharges: 8500,
            stoneCharges: 4350,
            total: 185000,
          },
        ],
        status: 'verified' as const,
        extractionConfidence: 98,
        paymentStatus: 'paid' as const,
      },
      {
        shopId,
        customerId: createdCustomers[1]._id,
        invoiceNumber: 'INV-2026-002',
        invoiceDate: m2,
        totalAmount: 145000,
        taxAmount: 4350,
        items: [
          {
            description: '18K Solitaire Diamond Ring (VVS-1 / E)',
            grossWeight: 4.8,
            netWeight: 4.6,
            purity: '18K (750)',
            metalRate: 5100,
            makingCharges: 6500,
            stoneCharges: 115000,
            total: 145000,
          },
        ],
        status: 'verified' as const,
        extractionConfidence: 99,
        paymentStatus: 'paid' as const,
      },
      {
        shopId,
        customerId: createdCustomers[2]._id,
        invoiceNumber: 'INV-2026-003',
        invoiceDate: m3,
        totalAmount: 92000,
        taxAmount: 2760,
        items: [
          {
            description: 'Antique Temple Finish Gold Jhumkas',
            grossWeight: 14.2,
            netWeight: 13.9,
            purity: '22K (916)',
            metalRate: 6200,
            makingCharges: 4200,
            stoneCharges: 1600,
            total: 92000,
          },
        ],
        status: 'verified' as const,
        extractionConfidence: 95,
        paymentStatus: 'paid' as const,
      },
      {
        shopId,
        customerId: createdCustomers[3]._id,
        invoiceNumber: 'INV-2026-004',
        invoiceDate: m4,
        totalAmount: 340000,
        taxAmount: 10200,
        items: [
          {
            description: '24K Fine Gold Coin (50g)',
            grossWeight: 50.0,
            netWeight: 50.0,
            purity: '24K (999)',
            metalRate: 6700,
            makingCharges: 1500,
            stoneCharges: 0,
            total: 340000,
          },
        ],
        status: 'verified' as const,
        extractionConfidence: 100,
        paymentStatus: 'paid' as const,
      },
      {
        shopId,
        customerId: createdCustomers[4]._id,
        invoiceNumber: 'INV-2026-005',
        invoiceDate: m5,
        totalAmount: 68000,
        taxAmount: 2040,
        items: [
          {
            description: '18K Rose Gold Diamond Tennis Bracelet',
            grossWeight: 9.1,
            netWeight: 8.8,
            purity: '18K (750)',
            metalRate: 5150,
            makingCharges: 4500,
            stoneCharges: 28000,
            total: 68000,
          },
        ],
        status: 'verified' as const,
        extractionConfidence: 96,
        paymentStatus: 'paid' as const,
      },
      {
        shopId,
        customerId: createdCustomers[0]._id,
        invoiceNumber: 'INV-2026-006',
        invoiceDate: m6,
        totalAmount: 100000,
        taxAmount: 3000,
        items: [
          {
            description: '22K Royal Gold Kangan Bangles (Pair)',
            grossWeight: 15.6,
            netWeight: 15.2,
            purity: '22K (916)',
            metalRate: 6300,
            makingCharges: 3500,
            stoneCharges: 800,
            total: 100000,
          },
        ],
        status: 'verified' as const,
        extractionConfidence: 97,
        paymentStatus: 'paid' as const,
      },
    ];

    const createdInvoices = await Invoice.insertMany(invoicesData);

    // 3. Create WhatsApp Messages
    const messagesData = [
      {
        shopId,
        invoiceId: createdInvoices[0]._id,
        customerId: createdCustomers[0]._id,
        recipientPhone: createdCustomers[0].whatsappNumber,
        templateName: 'jewellery_invoice_notification',
        messageContent: 'Dear Priya Sharma, thank you for your purchase with us! Your digital invoice INV-2026-001 (₹1,85,000) is ready.',
        status: 'read' as const,
        feedbackToken: 'fb-token-001',
        sentAt: m1,
        deliveredAt: m1,
        readAt: m1,
      },
      {
        shopId,
        invoiceId: createdInvoices[1]._id,
        customerId: createdCustomers[1]._id,
        recipientPhone: createdCustomers[1].whatsappNumber,
        templateName: 'jewellery_invoice_notification',
        messageContent: 'Dear Rajesh Verma, your invoice INV-2026-002 for the Solitaire Diamond Ring is attached.',
        status: 'delivered' as const,
        feedbackToken: 'fb-token-002',
        sentAt: m2,
        deliveredAt: m2,
      },
      {
        shopId,
        invoiceId: createdInvoices[2]._id,
        customerId: createdCustomers[2]._id,
        recipientPhone: createdCustomers[2].whatsappNumber,
        templateName: 'jewellery_invoice_notification',
        messageContent: 'Dear Ananya Iyer, thank you for shopping your Temple finish Jhumkas with us.',
        status: 'sent' as const,
        feedbackToken: 'fb-token-003',
        sentAt: m3,
      },
      {
        shopId,
        invoiceId: createdInvoices[3]._id,
        customerId: createdCustomers[3]._id,
        recipientPhone: createdCustomers[3].whatsappNumber,
        templateName: 'jewellery_invoice_notification',
        messageContent: 'Dear Vikram Malhotra, invoice INV-2026-004 has been dispatched to your WhatsApp.',
        status: 'failed' as const,
        failureReason: 'Customer phone was temporarily unreachable on WhatsApp Cloud Gateway',
        feedbackToken: 'fb-token-004',
        sentAt: m4,
      },
    ];

    await WhatsAppMessage.insertMany(messagesData);

    // 4. Create Feedback Submissions
    const feedbackData = [
      {
        shopId,
        invoiceId: createdInvoices[0]._id,
        customerId: createdCustomers[0]._id,
        rating: 5,
        comment: 'Exquisite craftsmanship on the choker! The gold hallmark and invoice transparency was top tier.',
        uniqueToken: 'fb-token-001',
        submittedAt: m1,
        status: 'acknowledged' as const,
      },
      {
        shopId,
        invoiceId: createdInvoices[1]._id,
        customerId: createdCustomers[1]._id,
        rating: 5,
        comment: 'She said YES! The diamond sparkle is breathtaking. Truly appreciate the prompt WhatsApp invoice.',
        uniqueToken: 'fb-token-002',
        submittedAt: m2,
        status: 'submitted' as const,
      },
      {
        shopId,
        invoiceId: createdInvoices[2]._id,
        customerId: createdCustomers[2]._id,
        rating: 4,
        comment: 'Beautiful design. Billing was quick and staff was very polite.',
        uniqueToken: 'fb-token-003',
        submittedAt: m3,
        status: 'submitted' as const,
      },
    ];

    await Feedback.insertMany(feedbackData);

    successResponse(
      res,
      {
        customersCount: createdCustomers.length,
        invoicesCount: createdInvoices.length,
        messagesCount: messagesData.length,
        feedbackCount: feedbackData.length,
      },
      'Realistic jewellery shop demonstration data successfully seeded into MongoDB!'
    );
  } catch (err) {
    next(err);
  }
}
