export const PARASUT_SPECS = {
    provider: "Paraşüt",
    type: "Accounting & E-Invoicing (Paraşüt API v4 / E-Fatura & E-Arşiv)",
    docsUrl: "https://apidocs.parasut.com/",
    auth: {
        type: "OAuth2 Password / Refresh Token",
        tokenEndpoint: "https://api.parasut.com/oauth/token",
        apiBaseUrl: "https://api.parasut.com/v4/{company_id}",
        requiredHeaders: {
            "Authorization": "Bearer <ACCESS_TOKEN>",
            "Content-Type": "application/json",
            "Accept": "application/json"
        }
    },
    endpoints: {
        oauth_token: {
            id: "parasut_oauth_token",
            path: "/oauth/token",
            method: "POST",
            category: "Authentication",
            description: "Obtains 2-hour OAuth2 access token and refresh token via client credentials and agency credentials.",
            sampleRequest: {
                grant_type: "password",
                client_id: "<CLIENT_ID>",
                client_secret: "<CLIENT_SECRET>",
                username: "agency@example.com",
                password: "<PASSWORD>",
                redirect_uri: "urn:ietf:wg:oauth:2.0:oob"
            },
            sampleResponse: {
                access_token: "pt_acc_99881122",
                token_type: "bearer",
                expires_in: 7200,
                refresh_token: "pt_ref_33445566"
            }
        },
        get_contacts: {
            id: "parasut_get_contacts",
            path: "/v4/{company_id}/contacts",
            method: "GET",
            category: "Customer Management",
            description: "Searches existing registered customer contacts by email or tax number.",
            sampleRequest: {
                queryParams: { "filter[email]": "customer@example.com" }
            },
            sampleResponse: {
                data: [{ id: "10982", type: "contacts", attributes: { name: "Ahmed Almansoori", email: "customer@example.com" } }]
            }
        },
        create_contact: {
            id: "parasut_create_contact",
            path: "/v4/{company_id}/contacts",
            method: "POST",
            category: "Customer Creation",
            description: "Registers new traveler or corporate customer contact with tax number or foreign tourist passport marker.",
            sampleRequest: {
                data: {
                    type: "contacts",
                    attributes: {
                        name: "Ahmed Almansoori",
                        email: "customer@example.com",
                        contact_type: "person",
                        tax_number: "11111111111",
                        tax_office: "Yurtdisi",
                        city: "Dubai",
                        country: "United Arab Emirates",
                        is_abroad: true,
                        account_type: "customer"
                    }
                }
            },
            sampleResponse: {
                data: { id: "10982", type: "contacts", attributes: { name: "Ahmed Almansoori" } }
            }
        },
        create_sales_invoice: {
            id: "parasut_create_sales_invoice",
            path: "/v4/{company_id}/sales_invoices",
            method: "POST",
            category: "Sales Invoices",
            description: "Generates draft sales invoice with itemized line details (flights, hotels, service fees, and VAT rates).",
            sampleRequest: {
                data: {
                    type: "sales_invoices",
                    attributes: {
                        item_type: "invoice",
                        description: "Tourism Booking - PNR: V8XYZW",
                        issue_date: "2026-10-15",
                        currency: "USD"
                    },
                    relationships: {
                        contact: { data: { id: "10982", type: "contacts" } },
                        details: {
                            data: [
                                {
                                    type: "sales_invoice_details",
                                    attributes: {
                                        quantity: 1,
                                        unit_price: 365.0,
                                        vat_rate: 0,
                                        description: "Flight Ticket IST-DXB"
                                    }
                                }
                            ]
                        }
                    }
                }
            },
            sampleResponse: {
                data: { id: "55441", type: "sales_invoices", attributes: { net_total: 365.0, gross_total: 365.0 } }
            }
        },
        create_e_archive: {
            id: "parasut_create_e_archive",
            path: "/v4/{company_id}/e_archives",
            method: "POST",
            category: "E-Arşiv Signing",
            description: "Digitally signs sales invoice with official Turkish Revenue Administration (GİB) E-Arşiv certificate.",
            sampleRequest: {
                data: {
                    type: "e_archives",
                    relationships: {
                        sales_invoice: { data: { id: "55441", type: "sales_invoices" } }
                    }
                }
            },
            sampleResponse: {
                data: { id: "77881", type: "e_archives", attributes: { status: "signed", uuid: "d9e8f7-9912-4412" } }
            }
        },
        pdf_download: {
            id: "parasut_pdf_download",
            path: "/v4/{company_id}/e_archives/{id}/pdf",
            method: "GET",
            category: "E-Arşiv PDF",
            description: "Retrieves downloadable official signed tax invoice PDF URL for traveler receipt delivery.",
            sampleRequest: { pathParams: { id: "77881" } },
            sampleResponse: {
                data: { attributes: { url: "https://e-fatura.parasut.com/invoices/77881.pdf", expires_at: "2026-10-15T23:59:00Z" } }
            }
        }
    }
};
