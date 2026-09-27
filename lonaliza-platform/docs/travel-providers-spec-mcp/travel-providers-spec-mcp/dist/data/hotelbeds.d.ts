export declare const HOTELBEDS_SPECS: {
    provider: string;
    type: string;
    docsUrl: string;
    auth: {
        type: string;
        signatureAlgorithm: string;
        headers: {
            "Api-key": string;
            "X-Signature": string;
            Accept: string;
        };
    };
    endpoints: {
        availability_search: {
            id: string;
            path: string;
            method: string;
            description: string;
            sampleRequest: {
                stay: {
                    checkIn: string;
                    checkOut: string;
                };
                occupancies: {
                    rooms: number;
                    adults: number;
                    children: number;
                }[];
                destination: {
                    code: string;
                };
            };
            sampleResponse: {
                hotels: {
                    hotels: {
                        code: number;
                        name: string;
                        rooms: {
                            code: string;
                            name: string;
                            rates: {
                                rateKey: string;
                                rateType: string;
                                net: string;
                                rateComments: string;
                            }[];
                        }[];
                    }[];
                };
            };
        };
        check_rates: {
            id: string;
            path: string;
            method: string;
            description: string;
            sampleRequest: {
                rooms: {
                    rateKey: string;
                }[];
            };
            sampleResponse: {
                hotel: {
                    code: number;
                    rooms: {
                        rates: {
                            rateKey: string;
                            rateType: string;
                            net: string;
                            cancellationPolicies: {
                                amount: string;
                                from: string;
                            }[];
                        }[];
                    }[];
                };
            };
        };
        create_booking: {
            id: string;
            path: string;
            method: string;
            description: string;
            sampleRequest: {
                holder: {
                    name: string;
                    surname: string;
                };
                rooms: {
                    rateKey: string;
                    paxes: {
                        roomId: number;
                        type: string;
                        name: string;
                        surname: string;
                    }[];
                }[];
                clientReference: string;
            };
            sampleResponse: {
                booking: {
                    reference: string;
                    clientReference: string;
                    status: string;
                    totalNet: string;
                    currency: string;
                };
            };
        };
        cancel_booking: {
            id: string;
            path: string;
            method: string;
            description: string;
            sampleRequest: {
                bookingId: string;
            };
            sampleResponse: {
                booking: {
                    reference: string;
                    status: string;
                    cancellationReference: string;
                };
            };
        };
    };
};
