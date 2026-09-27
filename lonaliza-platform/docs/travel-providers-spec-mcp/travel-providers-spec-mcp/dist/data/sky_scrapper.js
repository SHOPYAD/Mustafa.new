export const SKY_SCRAPPER_SPECS = {
    provider: "SkyScrapper",
    type: "Flights Scraping & Discovery (apiheya Google Flights & Skyscanner API)",
    docsUrl: "https://rapidapi.com/apiheya/api/sky-scrapper",
    auth: {
        type: "RapidAPI Key Header",
        apiBaseUrl: "https://sky-scrapper.p.rapidapi.com",
        requiredHeaders: {
            "x-rapidapi-host": "sky-scrapper.p.rapidapi.com",
            "x-rapidapi-key": "<RAPIDAPI_KEY>",
            "Accept": "application/json"
        }
    },
    endpoints: {
        check_server: {
            id: "sky_check_server",
            path: "/api/v1/checkServer",
            method: "GET",
            category: "System Health",
            description: "Checks operational status and latency of the scraping cluster.",
            sampleRequest: {},
            sampleResponse: { status: true, message: "Server is running" }
        },
        search_airport: {
            id: "sky_search_airport",
            path: "/api/v1/flights/searchAirport",
            method: "GET",
            category: "Airport Discovery",
            description: "Auto-completes and maps city/airport names to entityId and skyId tokens.",
            sampleRequest: { queryParams: { query: "Dubai", locale: "en-US" } },
            sampleResponse: {
                status: true,
                data: [{ skyId: "DXB", entityId: "27539520", presentation: { title: "Dubai", subtitle: "United Arab Emirates" } }]
            }
        },
        search_flights: {
            id: "sky_search_flights",
            path: "/api/v2/flights/searchFlights",
            method: "GET",
            category: "Flight Search",
            description: "Searches live Google Flights / Skyscanner itineraries for one-way and round trips.",
            sampleRequest: {
                queryParams: {
                    originSkyId: "DXB",
                    destinationSkyId: "IST",
                    originEntityId: "27539520",
                    destinationEntityId: "27539655",
                    date: "2026-10-15",
                    adults: 1,
                    cabinClass: "economy",
                    currency: "USD"
                }
            },
            sampleResponse: {
                status: true,
                data: {
                    itineraries: [
                        {
                            id: "it_ek_77812",
                            price: { raw: 350.0, formatted: "$350" },
                            legs: [{ origin: { id: "DXB" }, destination: { id: "IST" }, carriers: { marketing: [{ name: "Emirates" }] } }]
                        }
                    ]
                }
            }
        },
        price_calendar: {
            id: "sky_price_calendar",
            path: "/api/v1/flights/getPriceCalendar",
            method: "GET",
            category: "Price Trends Calendar",
            description: "Retrieves 30-day low fare matrix across departure dates between origin and destination.",
            sampleRequest: {
                queryParams: { originSkyId: "DXB", destinationSkyId: "IST", originEntityId: "27539520", destinationEntityId: "27539655", fromDate: "2026-10-01" }
            },
            sampleResponse: {
                status: true,
                data: { flights: { days: [{ day: "2026-10-15", price: 350.0, group: "low" }] } }
            }
        }
    }
};
