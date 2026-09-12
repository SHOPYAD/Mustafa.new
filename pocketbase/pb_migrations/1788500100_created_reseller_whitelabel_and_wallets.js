/// <reference path="../pb_data/types.d.ts" />
// Reseller White Label, B2B Wallets, and Bookings Collections

migrate((app) => {
  // 1. White Label Settings
  try {
    const wlSettings = new Collection({
      id: "rs_wl_settings_01",
      name: "reseller_whitelabel_settings",
      type: "base",
      system: false,
      fields: [
        { id: "rw_flights_suppliers", name: "flightsEnabledSuppliers", type: "json" },
        { id: "rw_flights_markup", name: "flightsMarkupPercent", type: "number" },
        { id: "rw_hotels_suppliers", name: "hotelsEnabledSuppliers", type: "json" },
        { id: "rw_hotels_markup", name: "hotelsMarkupPercent", type: "number" },
        { id: "rw_transfers_suppliers", name: "transfersEnabledSuppliers", type: "json" },
        { id: "rw_transfers_markup", name: "transfersMarkupPercent", type: "number" },
        { id: "rw_paid_monthly", name: "paidTierMonthlyPrice", type: "number" },
        { id: "rw_min_deposit", name: "minDepositAmount", type: "number" },
        { id: "rw_card_fee", name: "cardFeePercent", type: "number" },
        { id: "rw_card_hold", name: "cardHoldDays", type: "number" },
        { id: "rw_bank_name", name: "bankName", type: "text" },
        { id: "rw_bank_beneficiary", name: "bankBeneficiary", type: "text" },
        { id: "rw_bank_iban", name: "bankIban", type: "text" },
        { id: "rw_bank_swift", name: "bankSwift", type: "text" },
        { id: "rw_bank_currency", name: "bankCurrency", type: "text" },
        { id: "rw_bank_notes", name: "bankInstructions", type: "text" },
      ],
      listRule: null,
      viewRule: null,
      createRule: null,
      updateRule: null,
      deleteRule: null,
    });
    app.save(wlSettings);
  } catch (e) {
    // collection might already exist
  }

  // 2. B2B Wallet Transactions
  try {
    const walletTx = new Collection({
      id: "b2b_wallet_tx_01",
      name: "b2b_wallet_transactions",
      type: "base",
      system: false,
      fields: [
        { id: "bwt_company", name: "company", type: "relation", relation: { collectionId: "reseller_companies_01", cascadeDelete: false, maxSelect: 1 } },
        { id: "bwt_type", name: "type", type: "select", required: true, values: ["deposit_bank", "deposit_card", "booking_deduction", "manual_adjustment", "refund"] },
        { id: "bwt_amount", name: "amount", type: "number", required: true },
        { id: "bwt_fee", name: "fee", type: "number" },
        { id: "bwt_net", name: "netAmount", type: "number", required: true },
        { id: "bwt_status", name: "status", type: "select", required: true, values: ["pending", "cleared", "failed", "rejected"] },
        { id: "bwt_service", name: "serviceType", type: "text" },
        { id: "bwt_ref", name: "referenceId", type: "text" },
        { id: "bwt_clear_date", name: "clearanceDate", type: "text" },
        { id: "bwt_proof", name: "proofFile", type: "file", maxSelect: 1, maxSize: 5242880 },
        { id: "bwt_notes", name: "notes", type: "text" },
      ],
      listRule: null,
      viewRule: null,
      createRule: null,
      updateRule: null,
      deleteRule: null,
    });
    app.save(walletTx);
  } catch (e) {
    // collection might already exist
  }

  // 3. B2B Bookings
  try {
    const b2bBookings = new Collection({
      id: "b2b_bookings_01",
      name: "b2b_bookings",
      type: "base",
      system: false,
      fields: [
        { id: "bbb_company", name: "company", type: "relation", relation: { collectionId: "reseller_companies_01", cascadeDelete: false, maxSelect: 1 } },
        { id: "bbb_type", name: "bookingType", type: "select", required: true, values: ["flight", "hotel", "transfer"] },
        { id: "bbb_ref", name: "bookingRef", type: "text", required: true },
        { id: "bbb_pnr", name: "pnr", type: "text" },
        { id: "bbb_passenger", name: "passengerName", type: "text" },
        { id: "bbb_email", name: "customerEmail", type: "text" },
        { id: "bbb_phone", name: "customerPhone", type: "text" },
        { id: "bbb_supplier_id", name: "supplierId", type: "text" },
        { id: "bbb_supplier_cost", name: "supplierCost", type: "number" },
        { id: "bbb_markup", name: "platformMarkup", type: "number" },
        { id: "bbb_total", name: "totalCharged", type: "number", required: true },
        { id: "bbb_status", name: "status", type: "select", required: true, values: ["confirmed", "pending", "failed", "cancelled"] },
        { id: "bbb_voucher", name: "voucherUrl", type: "text" },
        { id: "bbb_ticket_data", name: "ticketData", type: "json" },
        { id: "bbb_notes", name: "notes", type: "text" },
      ],
      listRule: null,
      viewRule: null,
      createRule: null,
      updateRule: null,
      deleteRule: null,
    });
    app.save(b2bBookings);
  } catch (e) {
    // collection might already exist
  }

  // 4. Custom Domains Management
  try {
    const customDomains = new Collection({
      id: "rs_custom_domains_01",
      name: "reseller_custom_domains",
      type: "base",
      system: false,
      fields: [
        { id: "rcd_company", name: "company", type: "relation", relation: { collectionId: "reseller_companies_01", cascadeDelete: false, maxSelect: 1 } },
        { id: "rcd_domain", name: "domain", type: "text", required: true },
        { id: "rcd_subdomain", name: "initialSubdomain", type: "text" },
        { id: "rcd_dns_ok", name: "dnsVerified", type: "bool" },
        { id: "rcd_ssl_ok", name: "sslActive", type: "bool" },
        { id: "rcd_status", name: "status", type: "select", required: true, values: ["pending", "approved", "rejected"] },
        { id: "rcd_diag", name: "dnsDiagnostics", type: "text" },
        { id: "rcd_req_at", name: "requestedAt", type: "text" },
        { id: "rcd_app_at", name: "approvedAt", type: "text" },
      ],
      listRule: null,
      viewRule: null,
      createRule: null,
      updateRule: null,
      deleteRule: null,
    });
    app.save(customDomains);
  } catch (e) {
    // collection might already exist
  }
}, (app) => {
  // down migrations
});
