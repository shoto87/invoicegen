import { Router, Response } from "express";
import { Types } from "mongoose";
import { authenticate } from "../middleware/auth";
import { requireTenant } from "../middleware/tenant";
import { AuthenticatedRequest } from "../types";
import { Invoice } from "../models/Invoice";
import { Customer } from "../models/Customer";
import { Shop } from "../models/Shop";
import { WhatsAppMessage } from "../models/WhatsAppMessage";
import { successResponse, errorResponse } from "../utils/apiResponse";
import {
  getWhatsAppSetupStatus,
  sendWhatsAppTemplate,
} from "../services/whatsappCloud";

const router = Router();

router.use(authenticate);
router.use(requireTenant);

router.get("/config", (_req: AuthenticatedRequest, res: Response) => {
  successResponse(
    res,
    getWhatsAppSetupStatus(),
    "WhatsApp test configuration.",
  );
});

// 1. Get WhatsApp Messages Log
router.get("/messages", async (req: AuthenticatedRequest, res: Response) => {
  const messages = await WhatsAppMessage.find({ shopId: req.shopId })
    .populate("customerId", "name mobileNumber")
    .populate("invoiceId", "invoiceNumber totalAmount")
    .sort({ createdAt: -1 })
    .limit(50);

  successResponse(res, messages, "WhatsApp messages retrieved.");
});

// 2. Dispatch Personalized WhatsApp Message for an Invoice
router.post(
  "/send-invoice/:invoiceId",
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const shopId = new Types.ObjectId(req.shopId as string);
      const invoiceId = new Types.ObjectId(req.params.invoiceId);

      const invoice = await Invoice.findOne({
        _id: invoiceId,
        shopId,
      }).populate("customerId");
      if (!invoice) {
        errorResponse(res, "Invoice not found.", 404);
        return;
      }

      const customer: any = invoice.customerId;
      if (!customer || !customer.mobileNumber) {
        errorResponse(
          res,
          "Customer does not have a valid mobile / WhatsApp number.",
          400,
        );
        return;
      }

      const shop = await Shop.findById(shopId);
      const shopName = shop?.name || "AuraJewel Boutique";
      const formattedAmount = new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
      }).format(invoice.totalAmount);

      const messageContent = `Hi ${customer.name}, invoice ${invoice.invoiceNumber} from ${shopName} totals ${formattedAmount}.`;
      const recipient = customer.whatsappNumber || customer.mobileNumber;
      const message = await WhatsAppMessage.create({
        shopId,
        invoiceId,
        customerId: customer._id,
        recipientPhone: recipient,
        templateName: getWhatsAppSetupStatus().templateName,
        messageContent,
        status: "queued",
      });

      let providerResult;
      try {
        providerResult = await sendWhatsAppTemplate({
          recipient,
          customerName: customer.name,
          shopName,
          invoiceNumber: invoice.invoiceNumber,
          formattedAmount,
        });
      } catch (sendError: any) {
        message.status = "failed";
        message.failureReason = sendError.message;
        await message.save();
        errorResponse(
          res,
          sendError.message || "WhatsApp message could not be sent.",
          502,
        );
        return;
      }

      message.status = "sent";
      message.metaMessageId = providerResult.messageId;
      message.recipientPhone = providerResult.recipientPhone;
      message.sentAt = new Date();
      await message.save();

      successResponse(
        res,
        {
          messageId: message._id,
          recipientPhone: providerResult.recipientPhone,
          senderPhone: providerResult.senderPhone,
          customerName: customer.name,
          invoiceNumber: invoice.invoiceNumber,
          status: message.status,
          providerMessageId: providerResult.messageId,
          templateName: providerResult.templateName,
        },
        `WhatsApp accepted the template message for ${providerResult.recipientPhone}.`,
      );
    } catch (err: any) {
      console.error("[WhatsApp Send Error]", err);
      errorResponse(
        res,
        err.message || "Failed to dispatch WhatsApp message.",
        500,
      );
    }
  },
);

export default router;
