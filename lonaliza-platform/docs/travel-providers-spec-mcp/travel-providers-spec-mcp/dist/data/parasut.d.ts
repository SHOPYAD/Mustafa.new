export declare const PARASUT_SPECS: {
    provider: string;
    type: string;
    docsUrl: string;
    auth: {
        type: string;
        tokenEndpoint: string;
        apiBaseUrl: string;
        requiredHeaders: {
            Authorization: string;
            "Content-Type": string;
            Accept: string;
        };
    };
    endpoints: {
        oauth_token: {
            id: string;
            path: string;
            method: string;
            category: string;
            description: string;
            sampleRequest: {
                grant_type: string;
                client_id: string;
                client_secret: string;
                username: string;
                password: string;
                redirect_uri: string;
            };
            sampleResponse: {
                access_token: string;
                token_type: string;
                expires_in: number;
                refresh_token: string;
            };
        };
        get_contacts: {
            id: string;
            path: string;
            method: string;
            category: string;
            description: string;
            sampleRequest: {
                queryParams: {
                    "filter[email]": string;
                };
            };
            sampleResponse: {
                data: {
                    id: string;
                    type: string;
                    attributes: {
                        name: string;
                        email: string;
                    };
                }[];
            };
        };
        create_contact: {
            id: string;
            path: string;
            method: string;
            category: string;
            description: string;
            sampleRequest: {
                data: {
                    type: string;
                    attributes: {
                        name: string;
                        email: string;
                        contact_type: string;
                        tax_number: string;
                        tax_office: string;
                        city: string;
                        country: string;
                        is_abroad: boolean;
                        account_type: string;
                    };
                };
            };
            sampleResponse: {
                data: {
                    id: string;
                    type: string;
                    attributes: {
                        name: string;
                    };
                };
            };
        };
        create_sales_invoice: {
            id: string;
            path: string;
            method: string;
            category: string;
            description: string;
            sampleRequest: {
                data: {
                    type: string;
                    attributes: {
                        item_type: string;
                        description: string;
                        issue_date: string;
                        currency: string;
                    };
                    relationships: {
                        contact: {
                            data: {
                                id: string;
                                type: string;
                            };
                        };
                        details: {
                            data: {
                                type: string;
                                attributes: {
                                    quantity: number;
                                    unit_price: number;
                                    vat_rate: number;
                                    description: string;
                                };
                            }[];
                        };
                    };
                };
            };
            sampleResponse: {
                data: {
                    id: string;
                    type: string;
                    attributes: {
                        net_total: number;
                        gross_total: number;
                    };
                };
            };
        };
        create_e_archive: {
            id: string;
            path: string;
            method: string;
            category: string;
            description: string;
            sampleRequest: {
                data: {
                    type: string;
                    relationships: {
                        sales_invoice: {
                            data: {
                                id: string;
                                type: string;
                            };
                        };
                    };
                };
            };
            sampleResponse: {
                data: {
                    id: string;
                    type: string;
                    attributes: {
                        status: string;
                        uuid: string;
                    };
                };
            };
        };
        pdf_download: {
            id: string;
            path: string;
            method: string;
            category: string;
            description: string;
            sampleRequest: {
                pathParams: {
                    id: string;
                };
            };
            sampleResponse: {
                data: {
                    attributes: {
                        url: string;
                        expires_at: string;
                    };
                };
            };
        };
    };
};
