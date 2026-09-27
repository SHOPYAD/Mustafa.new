export declare const SEERU_SPECS: {
    provider: string;
    type: string;
    docsUrl: string;
    auth: {
        type: string;
        header: string;
        tokenFormat: string;
        endpoints: {
            flightsSandbox: string;
            flightsProduction: string;
            hotelsSandbox: string;
            hotelsProduction: string;
            rideSandbox: string;
            rideProduction: string;
        };
    };
    endpoints: {
        air_search_init: {
            id: string;
            path: string;
            method: string;
            category: string;
            description: string;
            sampleRequest: {
                pathParams: {
                    trips: string;
                    adults: number;
                    children: number;
                    infants: number;
                };
                queryParams: {
                    cabin: string;
                    direct: string;
                };
            };
            sampleResponse: {
                search_id: string;
            };
        };
        air_result_poll: {
            id: string;
            path: string;
            method: string;
            category: string;
            description: string;
            sampleRequest: {
                pathParams: {
                    searchId: string;
                };
                queryParams: {
                    after: number;
                };
            };
            sampleResponse: {
                complete: number;
                last_result: number;
                result: {
                    trip_id: string;
                    price: number;
                    tax: number;
                    currency: string;
                    legs: {
                        carrier: string;
                        flight_number: string;
                        origin: string;
                        destination: string;
                        departure_date: string;
                        arrival_date: string;
                        bags: {
                            ADT: {
                                checked: {
                                    allowance: string;
                                    desc: string;
                                };
                                cabin: {
                                    allowance: string;
                                };
                            };
                        };
                    }[];
                }[];
            };
        };
        air_fare_check: {
            id: string;
            path: string;
            method: string;
            category: string;
            description: string;
            sampleRequest: {
                booking: {
                    trip_id: string;
                };
            };
            sampleResponse: {
                status: string;
                booking: {
                    trip_id: string;
                    price: number;
                    tax: number;
                    verified: boolean;
                };
            };
        };
        air_booking_save: {
            id: string;
            path: string;
            method: string;
            category: string;
            description: string;
            sampleRequest: {
                booking: {
                    trip_id: string;
                };
                passengers: {
                    type: string;
                    title: string;
                    first_name: string;
                    last_name: string;
                    dob: string;
                    nationality: string;
                    passport_no: string;
                }[];
                contact: {
                    email: string;
                    phone: string;
                };
            };
            sampleResponse: {
                status: string;
                order_id: string;
            };
        };
        air_order_issue: {
            id: string;
            path: string;
            method: string;
            category: string;
            description: string;
            sampleRequest: {
                order_id: string;
            };
            sampleResponse: {
                status: string;
                message: string;
            };
        };
        air_order_cancel: {
            id: string;
            path: string;
            method: string;
            category: string;
            description: string;
            sampleRequest: {
                order_id: string;
            };
            sampleResponse: {
                status: string;
                message: string;
            };
        };
        hotel_search: {
            id: string;
            path: string;
            method: string;
            category: string;
            description: string;
            sampleRequest: {
                destination: {
                    type: string;
                    code: string;
                    name: string;
                };
                check_in: string;
                check_out: string;
                occupancies: {
                    room_id: number;
                    adults: number;
                    children: never[];
                }[];
                residency: string;
                nationality: string;
                currency: string;
            };
            sampleResponse: {
                search_id: string;
            };
        };
        hotel_result_poll: {
            id: string;
            path: string;
            method: string;
            category: string;
            description: string;
            sampleRequest: {
                pathParams: {
                    search_id: string;
                };
                queryParams: {
                    page: number;
                    limit: number;
                    sort_by: string;
                };
            };
            sampleResponse: {
                is_completed: boolean;
                hotels: {
                    hotel_id: string;
                    name: string;
                    star_rating: number;
                    price: number;
                    currency: string;
                    thumbnail: string;
                    has_free_cancellation: boolean;
                }[];
            };
        };
        hotel_rooms: {
            id: string;
            path: string;
            method: string;
            category: string;
            description: string;
            sampleRequest: {
                search_id: string;
                hotel_id: string;
            };
            sampleResponse: {
                rooms: {
                    room_id: string;
                    room_name: string;
                    rate_id: string;
                    price: number;
                    meal: string;
                    cancellation_policy: {
                        free_until: string;
                    };
                }[];
            };
        };
        hotel_fare: {
            id: string;
            path: string;
            method: string;
            category: string;
            description: string;
            sampleRequest: {
                search_id: string;
                rate_id: string;
            };
            sampleResponse: {
                status: string;
                fare_token: string;
                price: number;
            };
        };
        hotel_booking: {
            id: string;
            path: string;
            method: string;
            category: string;
            description: string;
            sampleRequest: {
                fare_token: string;
                lead_passenger: {
                    first_name: string;
                    last_name: string;
                    email: string;
                    phone: string;
                };
                rooms: {
                    room_index: number;
                    guests: {
                        first_name: string;
                        last_name: string;
                        type: string;
                    }[];
                }[];
            };
            sampleResponse: {
                order_id: string;
                status: string;
                total_amount: number;
            };
        };
        hotel_order_issue: {
            id: string;
            path: string;
            method: string;
            category: string;
            description: string;
            sampleRequest: {
                order_id: string;
            };
            sampleResponse: {
                status: string;
                hotel_confirmation_code: string;
            };
        };
        hotel_voucher: {
            id: string;
            path: string;
            method: string;
            category: string;
            description: string;
            sampleRequest: {
                queryParams: {
                    order_id: string;
                };
            };
            sampleResponse: {
                voucher_url: string;
            };
        };
        hotel_cancel: {
            id: string;
            path: string;
            method: string;
            category: string;
            description: string;
            sampleRequest: {
                order_id: string;
            };
            sampleResponse: {
                status: string;
                refund_amount: number;
                penalty: number;
            };
        };
        ride_search: {
            id: string;
            path: string;
            method: string;
            category: string;
            description: string;
            sampleRequest: {
                pickup: {
                    type: string;
                    code: string;
                };
                dropoff: {
                    type: string;
                    address: string;
                };
                datetime: string;
                passengers: number;
                luggage: number;
            };
            sampleResponse: {
                vehicles: {
                    vehicle_id: string;
                    name: string;
                    capacity: number;
                    price: number;
                    currency: string;
                }[];
            };
        };
        ride_booking: {
            id: string;
            path: string;
            method: string;
            category: string;
            description: string;
            sampleRequest: {
                vehicle_id: string;
                flight_number: string;
                passenger: {
                    name: string;
                    phone: string;
                };
            };
            sampleResponse: {
                booking_id: string;
                status: string;
            };
        };
    };
};
