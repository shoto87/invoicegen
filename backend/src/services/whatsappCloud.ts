import { env } from "../config/env";

interface WhatsAppTemplateInput {
  recipient: string;
  customerName: string;
  shopName: string;
  invoiceNumber: string;
  formattedAmount: string;
}

interface WhatsAppSendResult {
  messageId: string;
  recipientPhone: string;
  senderPhone: string;
  templateName: string;
}

function normalizePhoneNumber(phone: string): string {
  let digits = phone.replace(/\D/g, "");
  if (digits.startsWith("00")) {
    digits = digits.slice(2);
  }
  if (digits.length < 8 || digits.length > 15) {
    throw new Error(
      "WhatsApp recipient must be a valid international phone number.",
    );
  }
  return digits;
}

export function getWhatsAppSetupStatus() {
  return {
    configured: Boolean(
      env.WHATSAPP_PHONE_NUMBER_ID && env.WHATSAPP_ACCESS_TOKEN,
    ),
    testMode: env.WHATSAPP_TEST_MODE,
    senderPhone: env.WHATSAPP_SENDER_PHONE || null,
    testRecipient: env.WHATSAPP_TEST_RECIPIENT || null,
    templateName: env.WHATSAPP_TEMPLATE_NAME,
  };
}

export async function sendWhatsAppTemplate(
  input: WhatsAppTemplateInput,
): Promise<WhatsAppSendResult> {
  if (!env.WHATSAPP_PHONE_NUMBER_ID || !env.WHATSAPP_ACCESS_TOKEN) {
    throw new Error(
      "WhatsApp Cloud API is not configured. Set the phone number ID and access token.",
    );
  }
  if (env.WHATSAPP_TEST_MODE && !env.WHATSAPP_TEST_RECIPIENT) {
    throw new Error(
      "Test mode is enabled. Set META_WHATSAPP_TEST_RECIPIENT to a Meta-approved test recipient.",
    );
  }

  const recipientPhone = normalizePhoneNumber(
    env.WHATSAPP_TEST_MODE ? env.WHATSAPP_TEST_RECIPIENT : input.recipient,
  );
  const template = {
    name: env.WHATSAPP_TEMPLATE_NAME,
    language: { code: env.WHATSAPP_TEMPLATE_LANGUAGE },
  } as Record<string, unknown>;

  if (env.WHATSAPP_TEMPLATE_NAME !== "hello_world") {
    template.components = [
      {
        type: "body",
        parameters: [
          input.customerName,
          input.invoiceNumber,
          input.shopName,
          input.formattedAmount,
        ].map((text) => ({
          type: "text",
          text,
        })),
      },
    ];
  }

  const response = await fetch(
    `https://graph.facebook.com/${env.WHATSAPP_GRAPH_API_VERSION}/${env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.WHATSAPP_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: recipientPhone,
        type: "template",
        template,
      }),
      signal: AbortSignal.timeout(15_000),
    },
  );

  const result = (await response.json()) as {
    messages?: Array<{ id?: string }>;
    error?: { message?: string };
  };
  if (!response.ok || !result.messages?.[0]?.id) {
    throw new Error(
      result.error?.message ||
        `WhatsApp Cloud API returned HTTP ${response.status}.`,
    );
  }

  return {
    messageId: result.messages[0].id,
    recipientPhone: `+${recipientPhone}`,
    senderPhone: env.WHATSAPP_SENDER_PHONE,
    templateName: env.WHATSAPP_TEMPLATE_NAME,
  };
}
