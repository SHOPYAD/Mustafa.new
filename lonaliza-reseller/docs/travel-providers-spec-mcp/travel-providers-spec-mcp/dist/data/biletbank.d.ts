export declare const BILETBANK_SPECS: {
    provider: string;
    type: string;
    docsUrl: string;
    auth: {
        type: string;
        headers: {
            "Client-key": string;
            "Content-Type": string;
        };
    };
    endpoints: {
        air_search: {
            id: string;
            path: string;
            method: string;
            description: string;
            sampleRequest: {
                origin: string;
                destination: string;
                departureDate: string;
                returnDate: string;
                adultCount: number;
                childCount: number;
                infantCount: number;
                cabinClass: string;
            };
            sampleResponse: {
                flights: {
                    flightId: string;
                    airline: string;
                    airlineName: string;
                    flightNumber: string;
                    departure: string;
                    arrival: string;
                    fare: {
                        totalAmount: number;
                        currency: string;
                    };
                    packageOptions: string[];
                }[];
            };
        };
        air_price: {
            id: string;
            path: string;
            method: string;
            description: string;
            sampleRequest: {
                flightId: string;
                selectedPackage: string;
            };
            sampleResponse: {
                flightId: string;
                baggage: string;
                priceToken: string;
                finalAmount: number;
                currency: string;
            };
        };
        air_book: {
            id: string;
            path: string;
            method: string;
            description: string;
            sampleRequest: {
                priceToken: string;
                passengers: {
                    firstName: string;
                    lastName: string;
                    gender: string;
                    birthDate: string;
                    citizenId: string;
                    passportNumber: string;
                }[];
                contact: {
                    email: string;
                    phone: string;
                };
            };
            sampleResponse: {
                pnr: string;
                timeLimit: string;
                status: string;
                totalAmount: number;
            };
        };
        air_ticket: {
            id: string;
            path: string;
            method: string;
            description: string;
            sampleRequest: {
                pnr: string;
                paymentMethod: string;
            };
            sampleResponse: {
                pnr: string;
                ticketNumbers: string[];
                status: string;
            };
        };
    };
};
