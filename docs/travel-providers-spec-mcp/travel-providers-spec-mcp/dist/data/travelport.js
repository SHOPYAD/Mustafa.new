export const TRAVELPORT_SPECS = {
    provider: "Travelport",
    type: "Flights & Hotels (Travelport+ JSON APIs Air v11 & Stays v11 & Hotel v12)",
    docsUrl: "https://developer.travelport.com/",
    auth: {
        type: "OAuth2 Password Grant or Client Credentials",
        tokenEndpointProduction: "https://auth.travelport.net/oauth/token",
        tokenEndpointSandbox: "https://auth.pp.travelport.net/oauth/token",
        apiBaseUrlProduction: "https://api.travelport.net",
        apiBaseUrlSandbox: "https://api.pp.travelport.net",
        requiredHeaders: {
            "Authorization": "Bearer <ACCESS_TOKEN>",
            "XAUTH_TRAVELPORT_ACCESSGROUP": "<ACCESS_GROUP_ID>",
            "TVP-PCC-Core": "<TARGET_BRANCH_OR_PCC>",
            "Travelport-TraceId": "<UUID>",
            "Content-Type": "application/json",
            "Accept": "application/json"
        }
    },
    endpoints: {
        // Air Endpoints (JSON APIs Air v11)
        air_search_complete: {
            id: "travelport_air_search_complete",
            path: "/11/air/search/searchcomplete",
            method: "POST",
            category: "Air Search",
            description: "Low Fare Search across global network carriers, low-cost carriers, and NDC content via Travelport+.",
            sampleRequest: {
                CatalogOfferingsQueryRequest: {
                    CatalogOfferingsRequest: {
                        offersPerPage: 50,
                        PassengerCriteria: [{ value: "ADT", number: 1 }],
                        SearchCriteriaFlight: [
                            {
                                departureDate: "2026-10-15",
                                From: { value: "DXB" },
                                To: { value: "IST" }
                            }
                        ],
                        SearchModifiersAir: {
                            CarrierPreference: [{ type: "Permitted" }],
                            CabinPreference: [{ cabin: "Economy" }]
                        }
                    }
                }
            },
            sampleResponse: {
                CatalogOfferingsResponse: {
                    CatalogOfferings: {
                        CatalogOffering: [
                            {
                                id: "co_1",
                                Price: { TotalTaxes: 120.0, Base: 350.0, TotalPrice: 470.0, CurrencyCode: { value: "USD" } },
                                ProductOptions: [
                                    {
                                        Product: [
                                            {
                                                FlightRefs: ["fl_1"],
                                                Brand: { BrandRef: "br_1", name: "Economy Value" },
                                                PassengerFlight: [{ flightRef: "fl_1", passengerQuantity: 1, baggageAllowance: [{ maxWeight: { value: 23, unit: "Kilograms" } }] }]
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    },
                    ReferenceList: [
                        {
                            Flight: [
                                {
                                    id: "fl_1",
                                    carrier: "EK",
                                    number: "123",
                                    Departure: { location: "DXB", date: "2026-10-15", time: "10:00:00" },
                                    Arrival: { location: "IST", date: "2026-10-15", time: "14:15:00" },
                                    duration: "PT4H15M",
                                    equipment: "77W"
                                }
                            ]
                        }
                    ]
                }
            }
        },
        air_price: {
            id: "travelport_air_price",
            path: "/11/air/price/price",
            method: "POST",
            category: "Air Price",
            description: "Reprices and re-validates selected flight offer before booking, verifying baggage, cancellation rules, and fare brands.",
            sampleRequest: {
                AirPriceRequest: {
                    OfferQueryBuildFromCatalogOfferings: {
                        BuildFromCatalogOfferingsRequest: {
                            CatalogOfferingRef: { value: "co_1" },
                            ProductIdentifier: [{ id: "pr_1", productRef: "pr_1" }]
                        }
                    }
                }
            },
            sampleResponse: {
                AirPriceResponse: {
                    AirPriceResult: {
                        Offer: {
                            id: "off_final_1",
                            Price: { Base: 350.0, TotalTaxes: 120.0, TotalPrice: 470.0, CurrencyCode: { value: "USD" } }
                        }
                    }
                }
            }
        },
        air_reservation: {
            id: "travelport_air_reservation",
            path: "/11/air/book/airreservation",
            method: "POST",
            category: "Air Booking",
            description: "Creates Travelport Universal Record (PNR) and passenger reservations with traveler details and form of payment.",
            sampleRequest: {
                CreateReservation: {
                    OfferRef: { value: "off_final_1" },
                    Traveler: [
                        {
                            id: "trv_1",
                            PersonName: { Prefix: "MR", Given: "Ahmed", Surname: "Almansoori" },
                            Telephone: [{ PhoneNumber: "+971501234567" }],
                            Email: [{ value: "ahmed@example.com" }],
                            TravelerType: "ADT"
                        }
                    ],
                    FormOfPayment: [{ id: "fop_1", FormOfPaymentCash: {} }]
                }
            },
            sampleResponse: {
                ReservationResponse: {
                    Reservation: {
                        id: "res_tvp_998811",
                        Locator: { value: "6K9XPQ" },
                        Receipt: [{ Confirmation: { value: "EK/882193" } }]
                    }
                }
            }
        },
        air_ticket: {
            id: "travelport_air_ticket",
            path: "/11/air/ticket/ticket",
            method: "POST",
            category: "Air Ticketing",
            description: "Issues electronic tickets (e-tickets) for confirmed Travelport reservation.",
            sampleRequest: {
                TicketRequest: {
                    ReservationLocator: { value: "6K9XPQ" }
                }
            },
            sampleResponse: {
                TicketResponse: {
                    TicketResult: {
                        Status: "Ticketed",
                        TicketNumber: [{ value: "176-9928172631" }]
                    }
                }
            }
        },
        air_cancel: {
            id: "travelport_air_cancel",
            path: "/11/air/cancel/cancel",
            method: "POST",
            category: "Air Cancel",
            description: "Cancels active reservation and voids/refunds associated flight segments.",
            sampleRequest: {
                ReservationCancelRequest: {
                    ReservationLocator: { value: "6K9XPQ" }
                }
            },
            sampleResponse: {
                ReservationCancelResponse: {
                    Status: "Cancelled"
                }
            }
        },
        air_seatmaps: {
            id: "travelport_air_seatmaps",
            path: "/11/air/seats/seatmaps",
            method: "POST",
            category: "Air Seats",
            description: "Retrieves seat availability and pricing for specific flight legs.",
            sampleRequest: {
                SeatMapRequest: {
                    FlightRef: { value: "fl_1" }
                }
            },
            sampleResponse: {
                SeatMapResponse: {
                    Rows: [{ number: 12, Seats: [{ seat: "12A", status: "Available", price: 25.0 }] }]
                }
            }
        },
        air_ancillary: {
            id: "travelport_air_ancillary",
            path: "/11/air/ancillary/catalog",
            method: "POST",
            category: "Air Ancillary",
            description: "Retrieves catalog of chargeable ancillaries such as extra baggage, priority boarding, and special meals.",
            sampleRequest: {
                CatalogAncillaryRequest: {
                    ReservationLocator: { value: "6K9XPQ" }
                }
            },
            sampleResponse: {
                CatalogAncillaryResponse: {
                    Ancillary: [{ code: "0AA", description: "First Checked Bag", price: 50.0 }]
                }
            }
        },
        // Hotel Endpoints (Universal JSON API v12 & Stays v11)
        hotel_search_complete: {
            id: "travelport_hotel_search_complete",
            path: "/12/hotel/search/searchcomplete",
            method: "POST",
            category: "Hotel Search (Live Universal GDS)",
            description: "Searches genuine GDS properties with high-resolution Leonardo CDN / IcePortal photos, GIATA star ratings, 40+ amenities, and real GDS room rates.",
            sampleRequest: {
                HotelSearchModifiers: {
                    NumberOfAdults: 2,
                    RatesVendors: []
                },
                HotelStay: {
                    CheckinDate: "2026-09-15",
                    CheckoutDate: "2026-09-18"
                },
                HotelSearchLocation: {
                    HotelLocation: { Location: "DXB" }
                }
            },
            sampleResponse: {
                HotelSearchResult: {
                    HotelProperty: [
                        {
                            propertyCode: "00372",
                            name: "Mercure Gold Hotel Al Mina Rd Dubai",
                            hotelChain: "MC",
                            propertyInfo: {
                                address: { address: ["Al Mina Road", "Bur Dubai"], city: "Dubai", country: "AE" },
                                ratings: [{ ratingProvider: "GIATA", value: "4" }],
                                imageURLs: {
                                    imageURL: [
                                        "https://travelport.leonardocontentcloud.com/imageRepo/6/0/137/740/157/mercure-gold-hotel_o.jpg",
                                        "https://travelport.leonardocontentcloud.com/imageRepo/6/0/137/740/158/exterior_o.jpg"
                                    ]
                                },
                                amenities: ["Free WiFi", "Swimming pool", "Fitness center", "Restaurant", "Room service"]
                            },
                            roomTypes: [
                                {
                                    roomTypeCode: "SUP2",
                                    description: ["Superior Room With 2 Single Beds"],
                                    rates: [{ rateKey: "TP_RATE_00372_1", totalRate: { value: 780.0, currency: "AED" } }]
                                }
                            ]
                        }
                    ]
                }
            }
        },
        search_hotels: {
            id: "travelport_search_hotels",
            path: "/stays/search/hotels",
            method: "POST",
            category: "Hotel Search (Stays v11)",
            description: "Search hotel properties by city, geo-coordinates, or hotel IDs with check-in/out and room criteria via Stays v11.",
            sampleRequest: {
                StayCriteria: {
                    CheckInDate: "2026-10-15",
                    CheckOutDate: "2026-10-20",
                    Guests: [{ Age: 30 }, { Age: 28 }],
                    Rooms: 1
                },
                LocationCriteria: {
                    Address: { City: "Istanbul", CountryCode: "TR" }
                }
            },
            sampleResponse: {
                HotelList: [
                    {
                        HotelId: "TP-IST-9812",
                        Name: "The Ritz-Carlton, Istanbul",
                        Rating: 5,
                        LeadRate: { Amount: 1250.0, Currency: "USD" }
                    }
                ]
            }
        },
        hotel_rates: {
            id: "travelport_hotel_rates",
            path: "/stays/rates",
            method: "POST",
            category: "Hotel Rates",
            description: "Retrieve comprehensive room types, board basis, and cancellation penalties for selected property.",
            sampleRequest: {
                HotelId: "TP-IST-9812",
                CheckInDate: "2026-10-15",
                CheckOutDate: "2026-10-20",
                Rooms: [{ Adults: 2 }]
            },
            sampleResponse: {
                Rooms: [
                    {
                        RoomCode: "DLX_KNG",
                        RoomName: "Deluxe King Bosphorus View",
                        RateKey: "TP_RATE_KEY_8821901",
                        TotalPrice: { Total: 1250.0, Currency: "USD" },
                        CancellationPolicy: { FreeCancellationBefore: "2026-10-12T23:59:00Z" }
                    }
                ]
            }
        },
        create_booking: {
            id: "travelport_create_booking",
            path: "/stays/bookings",
            method: "POST",
            category: "Hotel Booking",
            description: "Book hotel room using selected RateKey and guest traveler profile.",
            sampleRequest: {
                RateKey: "TP_RATE_KEY_8821901",
                Travelers: [
                    { Prefix: "MR", FirstName: "Ahmed", LastName: "Almansoori", PhoneNumber: "+905551234567" }
                ],
                Payment: { FormOfPayment: "AgencyAccount" }
            },
            sampleResponse: {
                BookingId: "TP-RES-2026-88123",
                ConfirmationNumber: "RC-IST-44129",
                Status: "Confirmed"
            }
        },
        cancel_booking: {
            id: "travelport_cancel_booking",
            path: "/stays/bookings/{bookingId}/cancel",
            method: "POST",
            category: "Hotel Cancel",
            description: "Cancel confirmed Travelport hotel booking.",
            sampleRequest: { BookingId: "TP-RES-2026-88123" },
            sampleResponse: { Status: "Cancelled", RefundAmount: 1250.0, Penalty: 0.0 }
        }
    }
};
