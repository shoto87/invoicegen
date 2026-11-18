import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

export const env = {
  PORT: process.env.PORT || "5001",
  NODE_ENV: process.env.NODE_ENV || "development",
  MONGODB_URI:
    process.env.MONGODB_URI || "mongodb://localhost:27017/aurajewel_saas",
  USE_MEMORY_DB_FALLBACK: process.env.USE_MEMORY_DB_FALLBACK !== "false",
  JWT_ACCESS_SECRET:
    process.env.JWT_ACCESS_SECRET ||
    "aurajewel_super_secret_access_jwt_key_2026_luxury_jewel_token",
  JWT_REFRESH_SECRET:
    process.env.JWT_REFRESH_SECRET ||
    "aurajewel_super_secret_refresh_jwt_key_2026_luxury_jewel_token",
  JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  CLIENT_URL: process.env.CLIENT_URL || "http://localhost:5173",
  WHATSAPP_PHONE_NUMBER_ID: process.env.META_WHATSAPP_PHONE_NUMBER_ID || "",
  WHATSAPP_ACCESS_TOKEN: process.env.META_WHATSAPP_ACCESS_TOKEN || "",
  WHATSAPP_SENDER_PHONE: process.env.META_WHATSAPP_SENDER_PHONE || "",
  WHATSAPP_TEMPLATE_NAME:
    process.env.META_WHATSAPP_TEMPLATE_NAME || "hello_world",
  WHATSAPP_TEMPLATE_LANGUAGE:
    process.env.META_WHATSAPP_TEMPLATE_LANGUAGE || "en_US",
  WHATSAPP_GRAPH_API_VERSION:
    process.env.META_WHATSAPP_GRAPH_API_VERSION || "v23.0",
  WHATSAPP_TEST_MODE: process.env.META_WHATSAPP_TEST_MODE !== "false",
  WHATSAPP_TEST_RECIPIENT: process.env.META_WHATSAPP_TEST_RECIPIENT || "",
};
