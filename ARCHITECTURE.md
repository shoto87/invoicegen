# AuraJewel SaaS - Architecture & System Blueprint
Multi-Tenant Jewellery Invoice Automation, WhatsApp Dispatch & Feedback Management

Refer to the complete technical architecture and schema definitions below.

## Monorepo Layout
```
invoicereader/
├── backend/                  # Node.js + Express + TypeScript API
│   ├── src/
│   │   ├── config/           # Database, environment variables, security config
│   │   ├── controllers/      # Request handlers (auth, dashboard, shop, etc.)
│   │   ├── middleware/       # Auth (JWT), RBAC, Tenant Isolation, Error handling
│   │   ├── models/           # Mongoose Data Models (Multi-tenant with shopId)
│   │   ├── routes/           # Versioned API routes (/api/v1/*)
│   │   ├── services/         # Business logic layer
│   │   ├── utils/            # JWT helpers, response formatters, seeders
│   │   └── server.ts         # Server entry point
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
├── frontend/                 # React 18 + Vite + TypeScript + Tailwind CSS
│   ├── src/
│   │   ├── api/              # Axios client with interceptors
│   │   ├── components/       # Layout, Sidebar, Header, UI widgets
│   │   ├── context/          # Auth Context & Provider
│   │   ├── pages/            # Dashboard, Invoices, Customers, WhatsApp, Feedback, Reviews, Reports, Settings, Auth
│   │   ├── types/            # TypeScript interfaces
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css         # Burgundy & Ivory luxury theme tokens
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── tailwind.config.cjs
├── package.json              # Monorepo root scripts
└── ARCHITECTURE.md
```

See [technical_architecture_and_roadmap.md](file:///C:/Users/lenovo/.gemini/antigravity-ide/brain/b7a12a33-5dea-420e-8d2f-8a86368cc639/technical_architecture_and_roadmap.md) for full collection schemas and API signatures.
