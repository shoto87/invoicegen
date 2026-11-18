import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { env } from "./config/env";
import { connectDatabase, disconnectDatabase } from "./config/db";
import { errorHandler } from "./middleware/errorHandler";
import { seedDemoAccount } from "./scripts/seedDemoAccount";

// Route imports
import authRoutes from "./routes/authRoutes";
import shopRoutes from "./routes/shopRoutes";
import dashboardRoutes from "./routes/dashboardRoutes";
import invoiceRoutes from "./routes/invoiceRoutes";
import customerRoutes from "./routes/customerRoutes";
import whatsappRoutes from "./routes/whatsappRoutes";

const app = express();

// Security & Parsing Middlewares
app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      const localDevelopmentOrigin =
        env.NODE_ENV !== "production" &&
        /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin || "");
      if (!origin || origin === env.CLIENT_URL || localDevelopmentOrigin) {
        callback(null, true);
      } else {
        callback(new Error("Origin is not allowed by CORS."));
      }
    },
    credentials: true,
  }),
);
app.use(cookieParser());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

if (env.NODE_ENV !== "test") {
  app.use(morgan("dev"));
}

// System Health Check
app.get("/api/health", (_req, res) => {
  res.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    service: "AuraJewel Backend API",
    version: "1.0.0",
    environment: env.NODE_ENV,
  });
});

// Mount Versioned API Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/shops", shopRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);
app.use("/api/v1/invoices", invoiceRoutes);
app.use("/api/v1/customers", customerRoutes);
app.use("/api/v1/whatsapp", whatsappRoutes);

// Fallback for unmatched API routes
app.use("/api/*", (_req, res) => {
  res.status(404).json({
    success: false,
    error: "API endpoint not found",
  });
});

// Centralized Error Handling Middleware
app.use(errorHandler);

// Bootstrap Server & DB Connection
let server: any = null;

async function bootstrap() {
  try {
    await connectDatabase();
    await seedDemoAccount();

    server = app.listen(Number(env.PORT), () => {
      console.log(`=======================================================`);
      console.log(`💎 AuraJewel SaaS API server running on port ${env.PORT}`);
      console.log(`💎 Health Check: http://localhost:${env.PORT}/api/health`);
      console.log(`💎 Environment: ${env.NODE_ENV}`);
      console.log(`=======================================================`);
    });
  } catch (error) {
    console.error("Failed to bootstrap server:", error);
    process.exit(1);
  }
}

// Graceful Shutdown
const handleGracefulShutdown = async (signal: string) => {
  console.log(
    `\nReceived ${signal}. Gracefully terminating AuraJewel server...`,
  );
  if (server) {
    server.close(async () => {
      console.log("HTTP server closed.");
      await disconnectDatabase();
      console.log("Database disconnected.");
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

process.on("SIGINT", () => handleGracefulShutdown("SIGINT"));
process.on("SIGTERM", () => handleGracefulShutdown("SIGTERM"));

bootstrap();

export default app;
