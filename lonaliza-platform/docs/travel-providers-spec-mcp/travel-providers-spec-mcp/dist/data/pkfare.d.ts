export declare const PKFARE_SPECS: {
    provider: string;
    type: string;
    docsUrl: string;
    auth: {
        type: string;
        signatureAlgorithm: string;
        requestFormat: string;
        apiBaseUrlProduction: string;
        apiBaseUrlSandbox: string;
    };
    endpoints: {
        shopping_v10: {
            id: string;
            path: string;
            method: string;
            category: string;
            description: string;
            sampleRequest: {
                authentication: {
                    partnerId: string;
                    sign: string;
                };
                search: {
                    adults: number;
                    children: number;
                    infants: number;
                    nonstop: number;
                    airline: string;
                    solutions: number;
                    returnBrandFarePrice: string;
                    returnMultiTagPrice: string;
                    searchAirLegs: {
                        origin: string;
                        destination: string;
                        departureDate: string;
                        cabinClass: string;
                        airline: string;
                    }[];
                };
            };
            sampleResponse: {
                errorCode: string;
                data: {
                    solutions: {
                        solutionId: string;
                        solutionKey: string;
                        adtFare: number;
                        adtTax: number;
                        totalPrice: number;
                        currency: string;
                        flights: string[];
                    }[];
                    flights: {
                        flightRef: string;
                        segments: string[];
                    }[];
                    segments: {
                        segmentRef: string;
                        carrier: string;
                        flightNumber: string;
                        depAirport: string;
                        arrAirport: string;
                        depDateTime: string;
                        arrDateTime: string;
                        cabinClass: string;
                        baggage: string;
                    }[];
                };
            };
        };
        shopping_v8: {
            id: string;
            path: string;
            method: string;
            category: string;
            description: string;
            sampleRequest: {
                authentication: {
                    partnerId: string;
                    sign: string;
                };
                search: {
                    adults: number;
                    children: number;
                    infants: number;
                    nonstop: number;
                    solutions: number;
                    returnTagPrice: string;
                    searchAirLegs: {
                        origin: string;
                        destination: string;
                        departureDate: string;
                        cabinClass: string;
                    }[];
                };
            };
            sampleResponse: {
                errorCode: string;
                data: {
                    solutions: never[];
                };
            };
        };
        precise_pricing_v12: {
            id: string;
            path: string;
            method: string;
            category: string;
            description: string;
            sampleRequest: {
                Authentication: {
                    partnerId: string;
                    sign: string;
                };
                pricing: {
                    solutionId: string;
                    solutionKey: string;
                    adults: number;
                    children: number;
                    infants: number;
                    cabin: string;
                };
            };
            sampleResponse: {
                errorCode: string;
                data: {
                    solutionId: string;
                    totalPrice: number;
                    currency: string;
                    status: string;
                    baggage: {
                        weight: number;
                        unit: string;
                    };
                };
            };
        };
        penalty_v4: {
            id: string;
            path: string;
            method: string;
            category: string;
            description: string;
            sampleRequest: {
                Authentication: {
                    partnerId: string;
                    sign: string;
                };
                penalty: {
                    solutionId: string;
                    journeys: {};
                };
            };
            sampleResponse: {
                errorCode: string;
                penalties: string[];
            };
        };
        precise_booking_v8: {
            id: string;
            path: string;
            method: string;
            category: string;
            description: string;
            sampleRequest: {
                Authentication: {
                    partnerId: string;
                    sign: string;
                };
                booking: {
                    buyerOrder: string;
                    passengers: {
                        psgType: string;
                        sex: string;
                        firstName: string;
                        lastName: string;
                        nationality: string;
                        birthday: string;
                        cardType: string;
                        cardNum: string;
                        cardExpired: string;
                        passengerIndex: number;
                    }[];
                    solution: {
                        solutionId: string;
                    };
                    contact: {
                        name: string;
                        email: string;
                        mobile: string;
                        telCode: string;
                    };
                };
            };
            sampleResponse: {
                errorCode: string;
                data: {
                    orderNum: string;
                    airPnr: string;
                    status: string;
                    timeLimit: string;
                };
            };
        };
        order_pricing_v6: {
            id: string;
            path: string;
            method: string;
            category: string;
            description: string;
            sampleRequest: {
                Authentication: {
                    partnerId: string;
                    sign: string;
                };
                orderPricing: {
                    orderNum: string;
                };
            };
            sampleResponse: {
                errorCode: string;
                data: {
                    orderNum: string;
                    finalAmount: number;
                    currency: string;
                    status: string;
                };
            };
        };
        ticketing: {
            id: string;
            path: string;
            method: string;
            category: string;
            description: string;
            sampleRequest: {
                authentication: {
                    partnerId: string;
                    sign: string;
                };
                ticketing: {
                    orderNum: string;
                    PNR: string;
                    email: string;
                    name: string;
                    telNum: string;
                };
            };
            sampleResponse: {
                errorCode: string;
                data: {
                    orderNum: string;
                    status: string;
                };
            };
        };
        request_ticketing: {
            id: string;
            path: string;
            method: string;
            category: string;
            description: string;
            sampleRequest: {
                Authentication: {
                    partnerId: string;
                    sign: string;
                };
                data: {
                    issuingOrdersPush: string[];
                };
            };
            sampleResponse: {
                errorCode: string;
                success: boolean;
            };
        };
        order_detail_v14: {
            id: string;
            path: string;
            method: string;
            category: string;
            description: string;
            sampleRequest: {
                Authentication: {
                    partnerId: string;
                    sign: string;
                };
                data: {
                    orderNum: string;
                    includeFields: string;
                    includeOrderTypes: string[];
                };
            };
            sampleResponse: {
                errorCode: string;
                data: {
                    orderNum: string;
                    status: string;
                    passengers: {
                        firstName: string;
                        lastName: string;
                        ticketNo: string;
                    }[];
                };
            };
        };
        cancel: {
            id: string;
            path: string;
            method: string;
            category: string;
            description: string;
            sampleRequest: {
                Authentication: {
                    partnerId: string;
                    sign: string;
                };
                cancel: {
                    orderNum: string;
                };
            };
            sampleResponse: {
                errorCode: string;
                data: {
                    orderNum: string;
                    status: string;
                };
            };
        };
        refund_pricing_generate: {
            id: string;
            path: string;
            method: string;
            category: string;
            description: string;
            sampleRequest: {
                Authentication: {
                    partnerId: string;
                    sign: string;
                };
                data: {
                    orderNum: string;
                    ticketNums: string[];
                };
            };
            sampleResponse: {
                errorCode: string;
                data: {
                    refundPricingId: string;
                    refundAmount: number;
                    penaltyAmount: number;
                    currency: string;
                };
            };
        };
        refund_request: {
            id: string;
            path: string;
            method: string;
            category: string;
            description: string;
            sampleRequest: {
                Authentication: {
                    partnerId: string;
                    sign: string;
                };
                data: {
                    refundPricingId: string;
                    orderNum: string;
                    allPaxOfOrder: number;
                };
            };
            sampleResponse: {
                errorCode: string;
                data: {
                    refundOrderId: string;
                };
            };
        };
        check_refund: {
            id: string;
            path: string;
            method: string;
            category: string;
            description: string;
            sampleRequest: {
                Authentication: {
                    partnerId: string;
                    sign: string;
                };
                data: {
                    refundOrderNum: string;
                };
            };
            sampleResponse: {
                errorCode: string;
                data: {
                    status: string;
                    refundedAmount: number;
                    currency: string;
                };
            };
        };
        voiding_v2: {
            id: string;
            path: string;
            method: string;
            category: string;
            description: string;
            sampleRequest: {
                Authentication: {
                    partnerId: string;
                    sign: string;
                };
                VoidRequest: {
                    orderNum: string;
                    passenger: {
                        firstName: string;
                        lastName: string;
                    }[];
                };
            };
            sampleResponse: {
                errorCode: string;
                data: {
                    status: string;
                    voidFee: number;
                    currency: string;
                };
            };
        };
        change_reshop: {
            id: string;
            path: string;
            method: string;
            category: string;
            description: string;
            sampleRequest: {
                Authentication: {
                    partnerId: string;
                    sign: string;
                };
                changeSearch: {
                    orderNum: string;
                    newDepartureDate: string;
                };
            };
            sampleResponse: {
                errorCode: string;
                data: {
                    availableSolutions: never[];
                };
            };
        };
        ancillary_pricing_v6: {
            id: string;
            path: string;
            method: string;
            category: string;
            description: string;
            sampleRequest: {
                Authentication: {
                    partnerId: string;
                    sign: string;
                };
                pricing: {
                    solutionId: string;
                };
            };
            sampleResponse: {
                errorCode: string;
                data: {
                    baggageTiers: {
                        weight: string;
                        price: number;
                        currency: string;
                    }[];
                };
            };
        };
    };
};
