# AuraJewel SaaS

### Multi-Tenant Jewellery Invoice Automation, WhatsApp Dispatch & Feedback Management

AuraJewel is a B2B SaaS platform specifically engineered for jewellery houses, luxury retailers, and boutiques to automate post-sale invoice processing, WhatsApp communication, customer feedback collection, and Google Reviews synchronisation.

---

## 💎 Features Completed in Phase 1 (Foundation)

1. **Multi-Tenant Logical Isolation:**
   - Strict `shopId` indexing across all Mongoose models.
   - Tenant isolation middleware guarantees no cross-shop data leaks.

2. **Role-Based Access Control (RBAC):**
   - Distinct roles: `super_admin`, `shop_owner`, and `staff`.
   - Access and refresh token lifecycle with HTTP-only cookies and bcrypt password hashing (salt 12).

3. **Live Database-Backed Dashboard:**
   - Real-time aggregation pipelines on MongoDB collections.
   - Monthly sales revenue chart (Recharts AreaChart).
   - WhatsApp delivery breakdown (Delivered, Read, Failed).
   - 1-to-5 star customer rating distribution.
   - Interactive **"Seed Demo Jewellery Data"** button to populate realistic jewellery records in 1 click.

4. **Persistent Luxury Sidebar (8 Application Modules):**
   - Dashboard
   - Invoices
   - Customers
   - WhatsApp Messages
   - Customer Feedback
   - Google Reviews
   - Reports & Analytics
   - Settings

5. **Brand Aesthetics:**
   - Deep burgundy palette (`#3F0E18`, `#26070E`)
   - Warm ivory backgrounds (`#FAF7F2`)
   - Subtle gold accents (`#D4AF37`)
   - High-contrast typography (`Plus Jakarta Sans` and `Playfair Display`)

---

## 🚀 Quick Start Guide

### 1. Start Backend API

```bash
cd backend
npm install
npm run dev
```

- API starts at `http://localhost:5000`
- Health check: `http://localhost:5000/api/health`
- _Automatic fallback:_ If no local or Atlas MongoDB is running, the backend boots an embedded in-memory MongoDB instance automatically.

### 2. Start Frontend App

```bash
cd frontend
npm install
npm run dev
```

- Web app opens at `http://localhost:5173`

### 3. Demo Credentials

- **Email:** `owner@aurajewel.com`
- **Password:** `password123`
  _(Or click the "Fill Demo Credentials" button on `/login`)_

### 4. WhatsApp Cloud API Test

The invoice send action uses Meta's WhatsApp Cloud API. To test safely, configure the following in `backend/.env`:

```env
META_WHATSAPP_PHONE_NUMBER_ID=<Meta phone number ID>
META_WHATSAPP_ACCESS_TOKEN=<Meta access token>
META_WHATSAPP_SENDER_PHONE=+919284571131
META_WHATSAPP_TEST_MODE=true
META_WHATSAPP_TEST_RECIPIENT=<country-code-prefixed Meta-approved recipient>
META_WHATSAPP_TEMPLATE_NAME=hello_world
META_WHATSAPP_TEMPLATE_LANGUAGE=en_US
```

The phone number ID and access token come from Meta's WhatsApp Cloud API setup; the sender phone number alone cannot authenticate requests. In test mode, messages go only to `META_WHATSAPP_TEST_RECIPIENT`, which must be added/verified as a recipient in Meta. The default `hello_world` template is for verifying connectivity. For an invoice template, create and approve a template whose body variables are `{{1}}` customer name, `{{2}}` invoice number, `{{3}}` shop name, and `{{4}}` formatted total, then set `META_WHATSAPP_TEMPLATE_NAME` accordingly. Keep access tokens only in the backend `.env`, never in frontend code or source control.

The API response means Meta accepted the message request; it does not mean the recipient received it. Delivery/read confirmation requires a configured Meta webhook and is not included in this test integration yet.

---

## 📚 Technical Documentation

- [Technical Architecture & Schema Blueprint](ARCHITECTURE.md)
- [Phase 1 Deliverables & Walkthrough Artifact](C:/Users/lenovo/.gemini/antigravity-ide/brain/b7a12a33-5dea-420e-8d2f-8a86368cc639/phase1_deliverables_and_walkthrough.md)
# invoicegen
