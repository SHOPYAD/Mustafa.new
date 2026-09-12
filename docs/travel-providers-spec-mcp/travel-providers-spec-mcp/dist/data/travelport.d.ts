export declare const TRAVELPORT_SPECS: {
    provider: string;
    type: string;
    docsUrl: string;
    auth: {
        type: string;
        tokenEndpointProduction: string;
        tokenEndpointSandbox: string;
        apiBaseUrlProduction: string;
        apiBaseUrlSandbox: string;
        requiredHeaders: {
            Authorization: string;
            XAUTH_TRAVELPORT_ACCESSGROUP: string;
            "TVP-PCC-Core": string;
            "Travelport-TraceId": string;
            "Content-Type": string;
            Accept: string;
        };
    };
    endpoints: {
        air_search_complete: {
            id: string;
            path: string;
            method: string;
            category: string;
            description: string;
            sampleRequest: {
                CatalogOfferingsQueryRequest: {
                    CatalogOfferingsRequest: {
                        offersPerPage: number;
                        PassengerCriteria: {
                            value: string;
                            number: number;
                        }[];
                        SearchCriteriaFlight: {
                            departureDate: string;
                            From: {
                                value: string;
                            };
                            To: {
                                value: string;
                            };
                        }[];
                        SearchModifiersAir: {
                            CarrierPreference: {
                                type: string;
                            }[];
                            CabinPreference: {
                                cabin: string;
                            }[];
                        };
                    };
                };
            };
            sampleResponse: {
                CatalogOfferingsResponse: {
                    CatalogOfferings: {
                        CatalogOffering: {
                            id: string;
                            Price: {
                                TotalTaxes: number;
                                Base: number;
                                TotalPrice: number;
                                CurrencyCode: {
                                    value: string;
                                };
                            };
                            ProductOptions: {
                                Product: {
                                    FlightRefs: string[];
                                    Brand: {
                                        BrandRef: string;
                                        name: string;
                                    };
                                    PassengerFlight: {
                                        flightRef: string;
                                        passengerQuantity: number;
                                        baggageAllowance: {
                                            maxWeight: {
                                                value: number;
                                                unit: string;
                                            };
                                        }[];
                                    }[];
                                }[];
                            }[];
                        }[];
                    };
                    ReferenceList: {
                        Flight: {
                            id: string;
                            carrier: string;
                            number: string;
                            Departure: {
                                location: string;
                                date: string;
                                time: string;
                            };
                            Arrival: {
                                location: string;
                                date: string;
                                time: string;
                            };
                            duration: string;
                            equipment: string;
                        }[];
                    }[];
                };
            };
        };
        air_price: {
            id: string;
            path: string;
            method: string;
            category: string;
            description: string;
            sampleRequest: {
                AirPriceRequest: {
                    OfferQueryBuildFromCatalogOfferings: {
                        BuildFromCatalogOfferingsRequest: {
                            CatalogOfferingRef: {
                                value: string;
                            };
                            ProductIdentifier: {
                                id: string;
                                productRef: string;
                            }[];
                        };
                    };
                };
            };
            sampleResponse: {
                AirPriceResponse: {
                    AirPriceResult: {
                        Offer: {
                            id: string;
                            Price: {
                                Base: number;
                                TotalTaxes: number;
                                TotalPrice: number;
                                CurrencyCode: {
                                    value: string;
                                };
                            };
                        };
                    };
                };
            };
        };
        air_reservation: {
            id: string;
            path: string;
            method: string;
            category: string;
            description: string;
            sampleRequest: {
                CreateReservation: {
                    OfferRef: {
                        value: string;
                    };
                    Traveler: {
                        id: string;
                        PersonName: {
                            Prefix: string;
                            Given: string;
                            Surname: string;
                        };
                        Telephone: {
                            PhoneNumber: string;
                        }[];
                        Email: {
                            value: string;
                        }[];
                        TravelerType: string;
                    }[];
                    FormOfPayment: {
                        id: string;
                        FormOfPaymentCash: {};
                    }[];
                };
            };
            sampleResponse: {
                ReservationResponse: {
                    Reservation: {
                        id: string;
                        Locator: {
                            value: string;
                        };
                        Receipt: {
                            Confirmation: {
                                value: string;
                            };
                        }[];
                    };
                };
            };
        };
        air_ticket: {
            id: string;
            path: string;
            method: string;
            category: string;
            description: string;
            sampleRequest: {
                TicketRequest: {
                    ReservationLocator: {
                        value: string;
                    };
                };
            };
            sampleResponse: {
                TicketResponse: {
                    TicketResult: {
                        Status: string;
                        TicketNumber: {
                            value: string;
                        }[];
                    };
                };
            };
        };
        air_cancel: {
            id: string;
            path: string;
            method: string;
            category: string;
            description: string;
            sampleRequest: {
                ReservationCancelRequest: {
                    ReservationLocator: {
                        value: string;
                    };
                };
            };
            sampleResponse: {
                ReservationCancelResponse: {
                    Status: string;
                };
            };
        };
        air_seatmaps: {
            id: string;
            path: string;
            method: string;
            category: string;
            description: string;
            sampleRequest: {
                SeatMapRequest: {
                    FlightRef: {
                        value: string;
                    };
                };
            };
            sampleResponse: {
                SeatMapResponse: {
                    Rows: {
                        number: number;
                        Seats: {
                            seat: string;
                            status: string;
                            price: number;
                        }[];
                    }[];
                };
            };
        };
        air_ancillary: {
            id: string;
            path: string;
            method: string;
            category: string;
            description: string;
            sampleRequest: {
                CatalogAncillaryRequest: {
                    ReservationLocator: {
                        value: string;
                    };
                };
            };
            sampleResponse: {
                CatalogAncillaryResponse: {
                    Ancillary: {
                        code: string;
                        description: string;
                        price: number;
                    }[];
                };
            };
        };
        hotel_search_complete: {
            id: string;
            path: string;
            method: string;
            category: string;
            description: string;
            sampleRequest: {
                HotelSearchModifiers: {
                    NumberOfAdults: number;
                    RatesVendors: never[];
                };
                HotelStay: {
                    CheckinDate: string;
                    CheckoutDate: string;
                };
                HotelSearchLocation: {
                    HotelLocation: {
                        Location: string;
                    };
                };
            };
            sampleResponse: {
                HotelSearchResult: {
                    HotelProperty: {
                        propertyCode: string;
                        name: string;
                        hotelChain: string;
                        propertyInfo: {
                            address: {
                                address: string[];
                                city: string;
                                country: string;
                            };
                            ratings: {
                                ratingProvider: string;
                                value: string;
                            }[];
                            imageURLs: {
                                imageURL: string[];
                            };
                            amenities: string[];
                        };
                        roomTypes: {
                            roomTypeCode: string;
                            description: string[];
                            rates: {
                                rateKey: string;
                                totalRate: {
                                    value: number;
                                    currency: string;
                                };
                            }[];
                        }[];
                    }[];
                };
            };
        };
        search_hotels: {
            id: string;
            path: string;
            method: string;
            category: string;
            description: string;
            sampleRequest: {
                StayCriteria: {
                    CheckInDate: string;
                    CheckOutDate: string;
                    Guests: {
                        Age: number;
                    }[];
                    Rooms: number;
                };
                LocationCriteria: {
                    Address: {
                        City: string;
                        CountryCode: string;
                    };
                };
            };
            sampleResponse: {
                HotelList: {
                    HotelId: string;
                    Name: string;
                    Rating: number;
                    LeadRate: {
                        Amount: number;
                        Currency: string;
                    };
                }[];
            };
        };
        hotel_rates: {
            id: string;
            path: string;
            method: string;
            category: string;
            description: string;
            sampleRequest: {
                HotelId: string;
                CheckInDate: string;
                CheckOutDate: string;
                Rooms: {
                    Adults: number;
                }[];
            };
            sampleResponse: {
                Rooms: {
                    RoomCode: string;
                    RoomName: string;
                    RateKey: string;
                    TotalPrice: {
                        Total: number;
                        Currency: string;
                    };
                    CancellationPolicy: {
                        FreeCancellationBefore: string;
                    };
                }[];
            };
        };
        create_booking: {
            id: string;
            path: string;
            method: string;
            category: string;
            description: string;
            sampleRequest: {
                RateKey: string;
                Travelers: {
                    Prefix: string;
                    FirstName: string;
                    LastName: string;
                    PhoneNumber: string;
                }[];
                Payment: {
                    FormOfPayment: string;
                };
            };
            sampleResponse: {
                BookingId: string;
                ConfirmationNumber: string;
                Status: string;
            };
        };
        cancel_booking: {
            id: string;
            path: string;
            method: string;
            category: string;
            description: string;
            sampleRequest: {
                BookingId: string;
            };
            sampleResponse: {
                Status: string;
                RefundAmount: number;
                Penalty: number;
            };
        };
    };
};
