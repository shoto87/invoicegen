import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  FileText,
  Upload,
  Search,
  Download,
  Eye,
  Sparkles,
  CheckCircle2,
  Phone,
  Send,
  X,
  AlertCircle,
  FileCheck,
  ExternalLink,
  MessageSquare,
} from "lucide-react";
import { apiClient } from "../api/client";
import { Invoice } from "../types";
import { Badge } from "../components/common/Badge";
import { Skeleton } from "../components/common/Skeleton";
import { EmptyState } from "../components/common/EmptyState";

export const InvoicesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");

  // Upload & Extraction Modal State
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [extracting, setExtracting] = useState(false);
  const [extractError, setExtractError] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<any | null>(null);

  // Verification Form State
  const [verifiedName, setVerifiedName] = useState("");
  const [verifiedPhone, setVerifiedPhone] = useState("");
  const [verifiedInvoiceNo, setVerifiedInvoiceNo] = useState("");
  const [verifiedAmount, setVerifiedAmount] = useState<number | string>("");
  const [verifiedDate, setVerifiedDate] = useState("");
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  // WhatsApp Dispatch Modal State
  const [whatsAppModalOpen, setWhatsAppModalOpen] = useState(false);
  const [activeInvoice, setActiveInvoice] = useState<Invoice | null>(null);
  const [dispatching, setDispatching] = useState(false);
  const [dispatchResult, setDispatchResult] = useState<any | null>(null);

  // Fetch Invoices
  const { data, isLoading } = useQuery<{ data: Invoice[] }>({
    queryKey: ["invoices"],
    queryFn: async () => {
      const res = await apiClient.get("/invoices");
      return res.data;
    },
  });

  const { data: whatsappConfigResponse } = useQuery<{
    data: {
      configured: boolean;
      testMode: boolean;
      senderPhone: string | null;
      testRecipient: string | null;
      templateName: string;
    };
  }>({
    queryKey: ["whatsappConfig"],
    queryFn: async () => (await apiClient.get("/whatsapp/config")).data,
  });
  const whatsappConfig = whatsappConfigResponse?.data;

  const invoices = data?.data || [];
  const filtered = invoices.filter(
    (inv) =>
      inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.customerId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.customerId?.mobileNumber?.includes(searchTerm),
  );

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Upload and Extract Handler
  const handleFileUpload = async (file: File) => {
    setSelectedFile(file);
    setExtracting(true);
    setExtractError(null);
    setExtractedData(null);

    const formData = new FormData();
    formData.append("invoiceFile", file);

    try {
      const res = await apiClient.post("/invoices/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const extracted = res.data.data.extracted;
      setExtractedData(extracted);
      setVerifiedName(extracted.customerName || "");
      setVerifiedPhone(extracted.customerPhone || "");
      setVerifiedInvoiceNo(extracted.invoiceNumber || "");
      setVerifiedAmount(extracted.totalAmount || "");
      setVerifiedDate(
        extracted.invoiceDate || new Date().toISOString().split("T")[0],
      );
    } catch (err: any) {
      setExtractError(
        err.response?.data?.error ||
          err.message ||
          "Failed to extract PDF data",
      );
    } finally {
      setExtracting(false);
    }
  };

  // Quick Select Sample Invoice Helper
  const handleLoadSamplePdf = async (sampleFileName: string) => {
    setExtracting(true);
    setExtractError(null);
    try {
      const response = await fetch(`/sample_invoices/${sampleFileName}`);
      const blob = await response.blob();
      const file = new File([blob], sampleFileName, {
        type: "application/pdf",
      });
      await handleFileUpload(file);
    } catch (err: any) {
      setExtractError(`Failed to load sample: ${err.message}`);
      setExtracting(false);
    }
  };

  // Verify and Save to MongoDB
  const handleVerifyAndSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setExtracting(true);
    setExtractError(null);

    try {
      const payload = {
        customerName: verifiedName,
        customerPhone: verifiedPhone,
        whatsappNumber: verifiedPhone,
        invoiceNumber: verifiedInvoiceNo,
        invoiceDate: verifiedDate,
        totalAmount: Number(verifiedAmount),
        taxAmount: Math.round(Number(verifiedAmount) * 0.03),
        items: extractedData?.items || [
          {
            description: "Gold & Diamond Jewellery",
            total: Number(verifiedAmount),
          },
        ],
      };

      const res = await apiClient.post("/invoices/verify-and-save", payload);
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
      queryClient.invalidateQueries({ queryKey: ["customers"] });

      setSaveSuccess(
        `Invoice #${verifiedInvoiceNo} verified & saved for ${verifiedName}!`,
      );
      const savedInvoice = res.data.data;

      // Automatically open WhatsApp Dispatch confirmation
      setTimeout(() => {
        setUploadModalOpen(false);
        setSaveSuccess(null);
        setSelectedFile(null);
        setExtractedData(null);
        setActiveInvoice(savedInvoice);
        setWhatsAppModalOpen(true);
      }, 1200);
    } catch (err: any) {
      setExtractError(
        err.response?.data?.error ||
          err.message ||
          "Failed to save verified invoice",
      );
    } finally {
      setExtracting(false);
    }
  };

  // Dispatch WhatsApp Message
  const handleSendWhatsApp = async (invoiceId: string) => {
    setDispatching(true);
    try {
      const res = await apiClient.post(`/whatsapp/send-invoice/${invoiceId}`);
      setDispatchResult(res.data.data);
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
    } catch (err: any) {
      alert(
        `WhatsApp dispatch failed: ${err.response?.data?.error || err.message}`,
      );
    } finally {
      setDispatching(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-stone-200">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
            Invoice Management
          </h1>
          <p className="text-sm text-stone-600 mt-1">
            Upload PDF invoices, extract customer mobile & WhatsApp numbers
            automatically, and dispatch digital invoices with review links.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setUploadModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white bg-burgundy-900 hover:bg-burgundy-950 rounded-xl shadow-md transition-all active:scale-95"
          >
            <Upload className="w-4 h-4 text-gold-400" />
            <span>Upload & Extract Invoice PDF</span>
          </button>
        </div>
      </div>

      {/* Quick Sample Invoices Callout */}
      <div className="p-5 bg-white border border-gold-300/60 rounded-2xl shadow-luxury space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-gold-600" />
            <h3 className="font-bold text-sm sm:text-base text-stone-900">
              Ready-to-Test Dummy Invoice PDFs
            </h3>
          </div>
          <Badge variant="gold">Phase 2 Pipeline Active</Badge>
        </div>
        <p className="text-xs text-stone-600">
          Click any of these 3 generated sample invoices to automatically
          extract the customer's phone number, invoice amount, and line items:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
          <button
            onClick={() => {
              setUploadModalOpen(true);
              handleLoadSamplePdf("invoice_priya_sharma_INV-2026-101.pdf");
            }}
            className="p-3 bg-ivory-50 hover:bg-ivory-200/60 rounded-xl border border-stone-200 text-left transition-all group"
          >
            <div className="font-bold text-xs text-burgundy-900 flex items-center justify-between">
              <span>Priya Sharma</span>
              <span className="font-mono text-gold-700">₹2,40,454</span>
            </div>
            <div className="text-[11px] text-stone-600 font-mono mt-1 flex items-center gap-1">
              <Phone className="w-3 h-3 text-emerald-600" /> +91 98765 43210
            </div>
            <div className="text-[10px] text-stone-400 mt-1">
              22K Bridal Choker • Click to Extract →
            </div>
          </button>

          <button
            onClick={() => {
              setUploadModalOpen(true);
              handleLoadSamplePdf("invoice_rajesh_patel_INV-2026-202.pdf");
            }}
            className="p-3 bg-ivory-50 hover:bg-ivory-200/60 rounded-xl border border-stone-200 text-left transition-all group"
          >
            <div className="font-bold text-xs text-burgundy-900 flex items-center justify-between">
              <span>Rajesh Patel</span>
              <span className="font-mono text-gold-700">₹1,28,750</span>
            </div>
            <div className="text-[11px] text-stone-600 font-mono mt-1 flex items-center gap-1">
              <Phone className="w-3 h-3 text-emerald-600" /> +91 98220 12345
            </div>
            <div className="text-[10px] text-stone-400 mt-1">
              18K Solitaire Ring • Click to Extract →
            </div>
          </button>

          <button
            onClick={() => {
              setUploadModalOpen(true);
              handleLoadSamplePdf("invoice_ananya_reddy_INV-2026-303.pdf");
            }}
            className="p-3 bg-ivory-50 hover:bg-ivory-200/60 rounded-xl border border-stone-200 text-left transition-all group"
          >
            <div className="font-bold text-xs text-burgundy-900 flex items-center justify-between">
              <span>Ananya Reddy</span>
              <span className="font-mono text-gold-700">₹2,03,940</span>
            </div>
            <div className="text-[11px] text-stone-600 font-mono mt-1 flex items-center gap-1">
              <Phone className="w-3 h-3 text-emerald-600" /> +91 99887 76655
            </div>
            <div className="text-[10px] text-stone-400 mt-1">
              Antique Temple Kada • Click to Extract →
            </div>
          </button>
        </div>
      </div>

      {/* Invoices List Table */}
      <div className="bg-white rounded-2xl border border-stone-200/90 shadow-luxury p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="Search by invoice number, customer, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-burgundy-900/20"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-12 w-full rounded-xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No Invoices Recorded Yet"
            description="Upload an invoice PDF above or select one of our pre-generated dummy PDFs to extract phone numbers and details."
            actionText="Upload PDF Invoice"
            onAction={() => setUploadModalOpen(true)}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-stone-200 text-stone-500 font-semibold uppercase text-xs">
                  <th className="py-3 px-3">Invoice #</th>
                  <th className="py-3 px-3">Customer</th>
                  <th className="py-3 px-3">Extracted Phone</th>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3 text-right">Amount</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-3 text-right">WhatsApp Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filtered.map((inv) => (
                  <tr
                    key={inv._id}
                    className="hover:bg-ivory-50/70 transition-colors"
                  >
                    <td className="py-3.5 px-3 font-mono font-medium text-stone-900">
                      {inv.invoiceNumber}
                    </td>
                    <td className="py-3.5 px-3 font-medium text-stone-800">
                      {inv.customerId?.name || "Customer"}
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 text-xs">
                        {inv.customerId?.whatsappNumber ||
                          inv.customerId?.mobileNumber ||
                          "N/A"}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-stone-500">
                      {new Date(inv.invoiceDate).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="py-3.5 px-3 text-right font-bold text-stone-900">
                      {formatCurrency(inv.totalAmount)}
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <Badge variant="success">Verified</Badge>
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <button
                        onClick={() => {
                          setActiveInvoice(inv);
                          setWhatsAppModalOpen(true);
                          setDispatchResult(null);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-all"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Send WhatsApp</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ================================================================= */}
      {/* 1. UPLOAD & EXTRACTION MODAL */}
      {/* ================================================================= */}
      {uploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-stone-200/90 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-stone-200">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-burgundy-900 text-gold-400 flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-stone-900">
                    PDF Invoice Extractor
                  </h3>
                  <p className="text-xs text-stone-500">
                    Extract customer number, invoice date & jewellery totals
                  </p>
                </div>
              </div>
              <button
                onClick={() => setUploadModalOpen(false)}
                className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error Message */}
            {extractError && (
              <div className="my-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{extractError}</span>
              </div>
            )}

            {/* Success Message */}
            {saveSuccess && (
              <div className="my-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{saveSuccess}</span>
              </div>
            )}

            {/* Dropzone */}
            {!extractedData && (
              <div className="mt-6 space-y-4">
                <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-stone-300 hover:border-burgundy-900 rounded-2xl bg-ivory-50/70 hover:bg-ivory-100 transition-all cursor-pointer">
                  <Upload className="w-8 h-8 text-burgundy-900 mb-2 animate-bounce" />
                  <span className="text-sm font-semibold text-stone-800">
                    Choose a PDF file or Drag & Drop here
                  </span>
                  <span className="text-xs text-stone-400 mt-1">
                    Supports Jewellery PDF Invoices up to 10MB
                  </span>
                  <input
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileUpload(e.target.files[0]);
                      }
                    }}
                  />
                </label>

                {extracting && (
                  <div className="p-4 bg-burgundy-50 border border-burgundy-200 rounded-xl text-center space-y-2">
                    <div className="inline-block animate-spin w-6 h-6 border-2 border-burgundy-900 border-t-transparent rounded-full" />
                    <p className="text-xs font-semibold text-burgundy-900">
                      Parsing PDF Text & Extracting Customer Mobile Number...
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Extracted Details & Verification Form */}
            {extractedData && (
              <form
                onSubmit={handleVerifyAndSave}
                className="mt-6 space-y-5 animate-in fade-in"
              >
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-semibold text-emerald-900">
                    <FileCheck className="w-4 h-4 text-emerald-600" />
                    <span>Fields Successfully Extracted from PDF</span>
                  </div>
                  <Badge variant="success">
                    {extractedData.confidence}% Confidence
                  </Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Customer Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={verifiedName}
                      onChange={(e) => setVerifiedName(e.target.value)}
                      className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-burgundy-900/20"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Extracted Mobile / WhatsApp *
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-emerald-600" />
                      <input
                        type="text"
                        required
                        value={verifiedPhone}
                        onChange={(e) => setVerifiedPhone(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 bg-emerald-50/50 border border-emerald-300 rounded-xl text-sm font-mono font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Invoice Number *
                    </label>
                    <input
                      type="text"
                      required
                      value={verifiedInvoiceNo}
                      onChange={(e) => setVerifiedInvoiceNo(e.target.value)}
                      className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-burgundy-900/20"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Invoice Total Amount (INR) *
                    </label>
                    <input
                      type="number"
                      required
                      value={verifiedAmount}
                      onChange={(e) => setVerifiedAmount(e.target.value)}
                      className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-bold text-burgundy-900 focus:outline-none focus:ring-2 focus:ring-burgundy-900/20"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-stone-100">
                  <button
                    type="button"
                    onClick={() => {
                      setExtractedData(null);
                      setSelectedFile(null);
                    }}
                    className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-900"
                  >
                    ← Upload Another PDF
                  </button>

                  <button
                    type="submit"
                    disabled={extracting}
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-burgundy-900 hover:bg-burgundy-950 text-white font-semibold text-sm rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-4 h-4 text-gold-400" />
                    <span>
                      {extracting
                        ? "Saving..."
                        : "Verify & Proceed to WhatsApp"}
                    </span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* 2. WHATSAPP DISPATCH MODAL */}
      {/* ================================================================= */}
      {whatsAppModalOpen && activeInvoice && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-stone-200/90 shadow-2xl max-w-lg w-full p-6 sm:p-8 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-stone-900">
                    Send WhatsApp Invoice
                  </h3>
                  <p className="text-xs text-stone-500">
                    {whatsappConfig?.testMode ? "Test recipient" : "Recipient"}:{" "}
                    {whatsappConfig?.testMode
                      ? whatsappConfig.testRecipient || "Not configured"
                      : `${activeInvoice.customerId?.name || "Customer"} (${activeInvoice.customerId?.whatsappNumber || activeInvoice.customerId?.mobileNumber})`}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setWhatsAppModalOpen(false)}
                className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {dispatchResult ? (
              <div className="py-6 text-center space-y-4 animate-in fade-in">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h4 className="font-serif font-bold text-xl text-stone-900">
                  Message Accepted by WhatsApp
                </h4>
                <p className="text-xs text-stone-600">
                  Delivery is not confirmed until Meta sends a delivery status
                  update. Recipient:{" "}
                  <strong className="font-mono text-emerald-800">
                    {dispatchResult.recipientPhone}
                  </strong>
                  .
                </p>

                <div className="p-4 bg-ivory-50 rounded-2xl border border-stone-200 text-left text-xs space-y-2">
                  <div>
                    Sender:{" "}
                    <strong>
                      {dispatchResult.senderPhone || "Meta configured sender"}
                    </strong>
                  </div>
                  <div>
                    Template: <strong>{dispatchResult.templateName}</strong>
                  </div>
                  <div className="break-all">
                    Provider message ID:{" "}
                    <strong className="font-mono">
                      {dispatchResult.providerMessageId}
                    </strong>
                  </div>
                </div>

                <button
                  onClick={() => setWhatsAppModalOpen(false)}
                  className="w-full py-2.5 bg-burgundy-900 hover:bg-burgundy-950 text-white font-semibold text-xs sm:text-sm rounded-xl transition-all"
                >
                  Close & Return to Invoices
                </button>
              </div>
            ) : (
              <div className="mt-4 space-y-4">
                <div className="bg-[#EFEAE2] p-4 rounded-2xl border border-stone-300 font-sans text-xs text-stone-800 space-y-2">
                  <p className="font-bold text-stone-900">
                    WhatsApp Cloud API template
                  </p>
                  <p>
                    Template:{" "}
                    <strong>
                      {whatsappConfig?.templateName ||
                        "Loading configuration..."}
                    </strong>
                  </p>
                  <p>
                    Sender:{" "}
                    <strong>
                      {whatsappConfig?.senderPhone ||
                        "Configure sender in backend environment"}
                    </strong>
                  </p>
                  {!whatsappConfig?.configured && (
                    <p className="text-rose-700">
                      Meta Cloud API credentials are not configured.
                    </p>
                  )}
                </div>

                <button
                  onClick={() => handleSendWhatsApp(activeInvoice._id)}
                  disabled={
                    dispatching ||
                    !whatsappConfig?.configured ||
                    (whatsappConfig.testMode && !whatsappConfig.testRecipient)
                  }
                  className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>
                    {dispatching
                      ? "Sending via WhatsApp Cloud API..."
                      : "Send WhatsApp Template"}
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
