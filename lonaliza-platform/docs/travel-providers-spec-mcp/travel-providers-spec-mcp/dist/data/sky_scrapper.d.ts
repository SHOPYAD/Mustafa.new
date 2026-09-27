export declare const SKY_SCRAPPER_SPECS: {
    provider: string;
    type: string;
    docsUrl: string;
    auth: {
        type: string;
        apiBaseUrl: string;
        requiredHeaders: {
            "x-rapidapi-host": string;
            "x-rapidapi-key": string;
            Accept: string;
        };
    };
    endpoints: {
        check_server: {
            id: string;
            path: string;
            method: string;
            category: string;
            description: string;
            sampleRequest: {};
            sampleResponse: {
                status: boolean;
                message: string;
            };
        };
        search_airport: {
            id: string;
            path: string;
            method: string;
            category: string;
            description: string;
            sampleRequest: {
                queryParams: {
                    query: string;
                    locale: string;
                };
            };
            sampleResponse: {
                status: boolean;
                data: {
                    skyId: string;
                    entityId: string;
                    presentation: {
                        title: string;
                        subtitle: string;
                    };
                }[];
            };
        };
        search_flights: {
            id: string;
            path: string;
            method: string;
            category: string;
            description: string;
            sampleRequest: {
                queryParams: {
                    originSkyId: string;
                    destinationSkyId: string;
                    originEntityId: string;
                    destinationEntityId: string;
                    date: string;
                    adults: number;
                    cabinClass: string;
                    currency: string;
                };
            };
            sampleResponse: {
                status: boolean;
                data: {
                    itineraries: {
                        id: string;
                        price: {
                            raw: number;
                            formatted: string;
                        };
                        legs: {
                            origin: {
                                id: string;
                            };
                            destination: {
                                id: string;
                            };
                            carriers: {
                                marketing: {
                                    name: string;
                                }[];
                            };
                        }[];
                    }[];
                };
            };
        };
        price_calendar: {
            id: string;
            path: string;
            method: string;
            category: string;
            description: string;
            sampleRequest: {
                queryParams: {
                    originSkyId: string;
                    destinationSkyId: string;
                    originEntityId: string;
                    destinationEntityId: string;
                    fromDate: string;
                };
            };
            sampleResponse: {
                status: boolean;
                data: {
                    flights: {
                        days: {
                            day: string;
                            price: number;
                            group: string;
                        }[];
                    };
                };
            };
        };
    };
};
