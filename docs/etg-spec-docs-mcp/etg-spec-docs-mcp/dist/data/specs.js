export const ENDPOINT_SPECS = {
    search_by_region: {
        id: 'search_by_region',
        name: 'Search by Region (SERP)',
        category: 'Search',
        path: '/api/b2b/v3/search/serp/region/',
        method: 'POST',
        description: 'Searches for available hotels in a given region ID with prices for requested checkin/checkout dates and guest occupancy.',
        authentication: 'HTTP Basic Auth (KEY_ID:API_KEY)',
        requiredHeaders: {
            'Content-Type': 'application/json',
            'Authorization': 'Basic <BASE64_TOKEN>'
        },
        requestSchema: {
            checkin: 'string (YYYY-MM-DD, required)',
            checkout: 'string (YYYY-MM-DD, required)',
            residency: 'string (ISO 3166-1 alpha-2, e.g. "tr", "us", required)',
            language: 'string (e.g. "en", "ar", "tr", required)',
            currency: 'string (ISO 4217, e.g. "USD", "EUR", "TRY", required)',
            region_id: 'integer (ETG region id, e.g. 2114, required)',
            guests: 'array of objects [{ adults: integer, children: integer[] }] (required)',
            timeout: 'integer (optional, seconds before timeout, default 20)'
        },
        responseSchema: {
            status: 'string ("ok" or "error")',
            data: {
                hotels: 'array of hotel objects with hid, min_price, rates summary',
                total_hotels: 'integer'
            }
        },
        sampleRequest: {
            checkin: "2026-10-10",
            checkout: "2026-10-15",
            residency: "tr",
            language: "en",
            currency: "USD",
            region_id: 2114,
            guests: [
                {
                    adults: 2,
                    children: []
                }
            ]
        },
        sampleResponse: {
            status: "ok",
            data: {
                total_hotels: 45,
                hotels: [
                    {
                        id: "hilton_istanbul_bosphorus",
                        hid: 120485,
                        rates: [
                            {
                                match_hash: "m_hash_123456",
                                book_hash: "b_hash_789012",
                                daily_prices: ["150.00", "150.00", "150.00", "150.00", "150.00"],
                                meal: "breakfast",
                                payment_options: {
                                    payment_types: [
                                        {
                                            amount: "750.00",
                                            currency_code: "USD",
                                            type: "deposit"
                                        }
                                    ]
                                }
                            }
                        ]
                    }
                ]
            }
        },
        businessRules: [
            "Checkin must be today or in the future; checkout must be greater than checkin.",
            "Residency affects net rates and local tax rules. Must accurately reflect customer citizenship/residence.",
            "Children ages must be integers between 0 and 17.",
            "Results are paginated or streamed; cache results temporarily for no more than 15 minutes."
        ]
    },
    retrieve_hotelpage: {
        id: 'retrieve_hotelpage',
        name: 'Retrieve Hotel Page (HP)',
        category: 'Search',
        path: '/api/b2b/v3/search/hp/',
        method: 'POST',
        description: 'Retrieves all available rooms, meal options, cancellation policies, and live book_hashes for a single chosen hotel.',
        authentication: 'HTTP Basic Auth',
        requiredHeaders: { 'Content-Type': 'application/json', 'Authorization': 'Basic <BASE64_TOKEN>' },
        requestSchema: {
            id: 'string (hotel ID / hid, required)',
            checkin: 'string (YYYY-MM-DD, required)',
            checkout: 'string (YYYY-MM-DD, required)',
            residency: 'string (required)',
            language: 'string (required)',
            currency: 'string (required)',
            guests: 'array of room/guest allocations (required)'
        },
        responseSchema: {
            status: 'string ("ok")',
            data: {
                hotels: 'array containing single hotel with detailed room types and rates'
            }
        },
        sampleRequest: {
            id: "hilton_istanbul_bosphorus",
            checkin: "2026-10-10",
            checkout: "2026-10-15",
            residency: "tr",
            language: "en",
            currency: "USD",
            guests: [{ adults: 2 }]
        },
        sampleResponse: {
            status: "ok",
            data: {
                hotels: [
                    {
                        id: "hilton_istanbul_bosphorus",
                        rates: [
                            {
                                book_hash: "b_hash_room_deluxe_king_456",
                                room_name: "Deluxe King Room with Bosphorus View",
                                meal: "all-inclusive",
                                cancellation_penalties: {
                                    free_cancellation_before: "2026-10-07T23:59:59+03:00",
                                    policies: [
                                        {
                                            start_at: "2026-10-08T00:00:00+03:00",
                                            end_at: null,
                                            amount_charge: "150.00",
                                            currency_code: "USD"
                                        }
                                    ]
                                },
                                payment_options: {
                                    payment_types: [{ type: "deposit", amount: "750.00", currency_code: "USD" }]
                                }
                            }
                        ]
                    }
                ]
            }
        },
        businessRules: [
            "Rates returned in HP contain the authoritative 'book_hash' needed for Prebook.",
            "Cancellation policies must be displayed to the end user verbatim before pre-booking.",
            "Check 'payment_options' to know whether deposit, credit card, or pay-at-hotel is permitted."
        ]
    },
    prebook_rate: {
        id: 'prebook_rate',
        name: 'Prebook Rate Validation',
        category: 'Prebook',
        path: '/api/b2b/v3/hotel/prebook/',
        method: 'POST',
        description: 'Mandatory pre-booking check. Validates rate availability, freezes price, and verifies whether price has increased.',
        authentication: 'HTTP Basic Auth',
        requiredHeaders: { 'Content-Type': 'application/json', 'Authorization': 'Basic <BASE64_TOKEN>' },
        requestSchema: {
            hash: 'string (the book_hash from hotelpage, required)',
            price_increase_percent: 'number (percentage price hike allowed without failing, default 0)'
        },
        responseSchema: {
            status: 'string ("ok")',
            data: {
                price_changed: 'boolean',
                rate: 'updated rate object with locked book_hash and finalized cancellation policies'
            }
        },
        sampleRequest: {
            hash: "b_hash_room_deluxe_king_456",
            price_increase_percent: 0
        },
        sampleResponse: {
            status: "ok",
            data: {
                price_changed: false,
                rate: {
                    book_hash: "b_hash_final_locked_789",
                    daily_prices: ["150.00", "150.00", "150.00", "150.00", "150.00"],
                    payment_options: {
                        payment_types: [{ type: "deposit", amount: "750.00", currency_code: "USD" }]
                    }
                }
            }
        },
        businessRules: [
            "NEVER bypass the prebook step before booking; ETG will reject bookings if not pre-validated.",
            "If price_changed is true and price_increase_percent was exceeded, the API returns price_increase error.",
            "The returned rate.book_hash must be passed to the booking form creation step."
        ]
    },
    create_booking_form: {
        id: 'create_booking_form',
        name: 'Create Booking Form Process',
        category: 'Booking',
        path: '/api/b2b/v3/hotel/order/booking/form/',
        method: 'POST',
        description: 'Initializes the booking order session with ETG and generates payment/form requirements.',
        authentication: 'HTTP Basic Auth',
        requiredHeaders: { 'Content-Type': 'application/json', 'Authorization': 'Basic <BASE64_TOKEN>' },
        requestSchema: {
            partner_order_id: 'string (unique UUID/order ID generated by your system, required)',
            book_hash: 'string (validated book_hash from prebook, required)',
            user_ip: 'string (client IP address, required)',
            language: 'string (e.g. "en", optional)'
        },
        responseSchema: {
            status: 'string ("ok")',
            data: {
                partner_order_id: 'string',
                item_id: 'integer',
                order_id: 'integer'
            }
        },
        sampleRequest: {
            partner_order_id: "ORD-2026-987654",
            book_hash: "b_hash_final_locked_789",
            user_ip: "176.240.100.5",
            language: "en"
        },
        sampleResponse: {
            status: "ok",
            data: {
                partner_order_id: "ORD-2026-987654",
                item_id: 54321,
                order_id: 998877
            }
        },
        businessRules: [
            "partner_order_id must be globally unique across your account. Reusing IDs causes errors.",
            "Session expires after 10-15 minutes if finish booking is not executed."
        ]
    },
    start_booking_finish: {
        id: 'start_booking_finish',
        name: 'Start Booking Process (Finish)',
        category: 'Booking',
        path: '/api/b2b/v3/hotel/order/booking/finish/',
        method: 'POST',
        description: 'Executes the booking transaction with guest names, payment model, and contact information.',
        authentication: 'HTTP Basic Auth',
        requiredHeaders: { 'Content-Type': 'application/json', 'Authorization': 'Basic <BASE64_TOKEN>' },
        requestSchema: {
            partner_order_id: 'string (unique internal ID, required)',
            payment_type: {
                type: 'string ("deposit" | "now" | "hotel", required)',
                amount: 'string (required)',
                currency: 'string (required)'
            },
            rooms: 'array of rooms with guest first_name and last_name in Latin letters (required)',
            user: {
                email: 'string (valid email, required)',
                phone: 'string (E.164 phone format, required)'
            },
            partner: {
                partner_order_id: 'string (required)',
                comment: 'string (optional special requests)'
            }
        },
        responseSchema: {
            status: 'string ("ok")',
            data: {
                partner_order_id: 'string'
            }
        },
        sampleRequest: {
            partner_order_id: "ORD-2026-987654",
            payment_type: {
                type: "deposit",
                amount: "750.00",
                currency: "USD"
            },
            rooms: [
                {
                    guests: [
                        { first_name: "Ahmed", last_name: "Almansoori", is_child: false },
                        { first_name: "Sara", last_name: "Almansoori", is_child: false }
                    ]
                }
            ],
            user: {
                email: "guest@example.com",
                phone: "+905551234567"
            },
            partner: {
                partner_order_id: "ORD-2026-987654",
                comment: "Non-smoking room preferred"
            }
        },
        sampleResponse: {
            status: "ok",
            data: {
                partner_order_id: "ORD-2026-987654"
            }
        },
        businessRules: [
            "Guest names must be strictly English/Latin alphabet. Arabic or other scripts must be transliterated.",
            "This initiates an ASYNCHRONOUS reservation process. You must immediately poll the status endpoint or await the webhook."
        ]
    },
    check_booking_status: {
        id: 'check_booking_status',
        name: 'Check Booking Process Status',
        category: 'Booking',
        path: '/api/b2b/v3/hotel/order/booking/finish/status/',
        method: 'POST',
        description: 'Polls the status of the booking order until confirmation or rejection is reached.',
        authentication: 'HTTP Basic Auth',
        requiredHeaders: { 'Content-Type': 'application/json', 'Authorization': 'Basic <BASE64_TOKEN>' },
        requestSchema: {
            partner_order_id: 'string (required)'
        },
        responseSchema: {
            status: 'string ("ok")',
            data: {
                status: 'string ("processing" | "ok" | "failed")',
                error: 'string (if failed, e.g. "sold_out", "price_changed")'
            }
        },
        sampleRequest: {
            partner_order_id: "ORD-2026-987654"
        },
        sampleResponse: {
            status: "ok",
            data: {
                status: "ok",
                order_id: 998877,
                percent: 100
            }
        },
        businessRules: [
            "Poll every 2 to 3 seconds for up to 60-90 seconds.",
            "If status is 'ok', the hotel is confirmed and guaranteed.",
            "If status is 'failed', inspect data.error and reverse internal payment/hold."
        ]
    },
    order_info: {
        id: 'order_info',
        name: 'Retrieve Order Information & Voucher',
        category: 'PostBooking',
        path: '/api/b2b/v3/hotel/order/info/',
        method: 'POST',
        description: 'Retrieves complete invoice, voucher details, hotel confirmation number, and financial summary for an order.',
        authentication: 'HTTP Basic Auth',
        requiredHeaders: { 'Content-Type': 'application/json', 'Authorization': 'Basic <BASE64_TOKEN>' },
        requestSchema: {
            partner_order_id: 'string (optional if order_id is provided)',
            order_id: 'integer (optional if partner_order_id is provided)'
        },
        responseSchema: {
            status: 'string ("ok")',
            data: {
                order_id: 'integer',
                partner_order_id: 'string',
                status: 'string ("confirmed" | "cancelled" | "rejected")',
                hotel_data: 'object with hotel name, address, phone',
                rooms_data: 'object with guest vouchers and checkin/checkout times'
            }
        },
        sampleRequest: {
            partner_order_id: "ORD-2026-987654"
        },
        sampleResponse: {
            status: "ok",
            data: {
                order_id: 998877,
                partner_order_id: "ORD-2026-987654",
                status: "confirmed",
                hotel_confirmation_code: "HILT-TR-88219",
                voucher_download_url: "https://api.ratehawk.com/api/b2b/v3/hotel/order/document/voucher/download/?order_id=998877"
            }
        },
        businessRules: [
            "Used to generate customer confirmation emails and printable vouchers.",
            "Can be polled periodically or triggered via post-booking sync jobs."
        ]
    },
    cancel_order: {
        id: 'cancel_order',
        name: 'Cancel Order',
        category: 'PostBooking',
        path: '/api/b2b/v3/hotel/order/cancel/',
        method: 'POST',
        description: 'Cancels a confirmed reservation according to the contract and hotel cancellation terms.',
        authentication: 'HTTP Basic Auth',
        requiredHeaders: { 'Content-Type': 'application/json', 'Authorization': 'Basic <BASE64_TOKEN>' },
        requestSchema: {
            partner_order_id: 'string (required)'
        },
        responseSchema: {
            status: 'string ("ok")',
            data: {
                status: 'string ("cancelled")',
                penalty_amount: 'string',
                penalty_currency: 'string'
            }
        },
        sampleRequest: {
            partner_order_id: "ORD-2026-987654"
        },
        sampleResponse: {
            status: "ok",
            data: {
                status: "cancelled",
                penalty_amount: "0.00",
                penalty_currency: "USD"
            }
        },
        businessRules: [
            "Cancellation penalties are automatically calculated based on the policy rules at the moment of request.",
            "Always prompt the user with the expected penalty before calling cancel_order."
        ]
    },
    search_by_hotels: {
        id: 'search_by_hotels',
        name: 'Search by Hotel IDs (SERP Hotels)',
        category: 'Search',
        path: '/api/b2b/v3/search/serp/hotels/',
        method: 'POST',
        description: 'Searches for live rates across a specific list of hotel IDs (hids).',
        authentication: 'HTTP Basic Auth',
        requiredHeaders: { 'Content-Type': 'application/json', 'Authorization': 'Basic <BASE64_TOKEN>' },
        requestSchema: {
            checkin: 'string (YYYY-MM-DD, required)',
            checkout: 'string (YYYY-MM-DD, required)',
            residency: 'string (required)',
            language: 'string (required)',
            currency: 'string (required)',
            guests: 'array of room/guest allocations (required)',
            hids: 'array of integer hotel IDs (required)'
        },
        responseSchema: {
            status: 'string ("ok")',
            data: { hotels: 'array of hotel objects with rates' }
        },
        sampleRequest: {
            checkin: "2026-10-10",
            checkout: "2026-10-15",
            residency: "sa",
            language: "en",
            currency: "USD",
            guests: [{ adults: 2, children: [] }],
            hids: [120485, 120486]
        },
        sampleResponse: {
            status: "ok",
            data: { hotels: [] }
        },
        businessRules: [
            "hids parameter accepts up to 100 hotel IDs in a single batch.",
            "Useful for fetching live rates of saved favorites or shortlisted properties."
        ]
    },
    multicomplete: {
        id: 'multicomplete',
        name: 'Multicomplete Search & Autosuggest',
        category: 'Search',
        path: '/api/b2b/v3/search/multicomplete/',
        method: 'POST',
        description: 'Searches regions, cities, and hotels matching keyword query to obtain region_id or hid.',
        authentication: 'HTTP Basic Auth',
        requiredHeaders: { 'Content-Type': 'application/json', 'Authorization': 'Basic <BASE64_TOKEN>' },
        requestSchema: {
            query: 'string (search text, required)',
            language: 'string (e.g. "en", "ar", required)'
        },
        responseSchema: {
            status: 'string ("ok")',
            data: {
                regions: 'array of matching regions with id, name, type, country_code',
                hotels: 'array of matching hotels'
            }
        },
        sampleRequest: {
            query: "Istanbul",
            language: "en"
        },
        sampleResponse: {
            status: "ok",
            data: {
                regions: [{ id: 2095, name: "Istanbul", type: "City", country_code: "TR" }]
            }
        },
        businessRules: [
            "Used for destination autocomplete inputs in frontend search bars.",
            "Returns region_id required for /search/serp/region/."
        ]
    }
};
