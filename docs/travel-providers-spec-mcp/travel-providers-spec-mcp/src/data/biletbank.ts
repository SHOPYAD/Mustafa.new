export const BILETBANK_SPECS = {
  provider: "BiletBank (Technoly İstanbul)",
  type: "Flights & Hotels (BBOST API)",
  docsUrl: "https://developer.biletbank.com/",
  auth: {
    type: "API Key Header or Session Token",
    headers: { "Client-key": "<CLIENT_KEY>", "Content-Type": "application/json" }
  },
  endpoints: {
    air_search: {
      id: "biletbank_air_search",
      path: "/api/flight/search",
      method: "POST",
      description: "Search domestic and international flights across THY, AJet, Pegasus, SunExpress, and global carriers.",
      sampleRequest: {
        origin: "IST",
        destination: "AYT",
        departureDate: "2026-10-15",
        returnDate: "2026-10-20",
        adultCount: 2,
        childCount: 0,
        infantCount: 0,
        cabinClass: "Economy"
      },
      sampleResponse: {
        flights: [
          {
            flightId: "BB_FL_TK_2410",
            airline: "TK",
            airlineName: "Turkish Airlines",
            flightNumber: "TK2410",
            departure: "IST 08:30",
            arrival: "AYT 09:45",
            fare: { totalAmount: 3850.00, currency: "TRY" },
            packageOptions: ["EcoFly", "ExtraFly", "PrimeFly"]
          }
        ]
      }
    },
    air_price: {
      id: "biletbank_air_price",
      path: "/api/flight/price",
      method: "POST",
      description: "Validate fare rules, baggage allowances, and lock ticket price prior to reservation.",
      sampleRequest: {
        flightId: "BB_FL_TK_2410",
        selectedPackage: "ExtraFly"
      },
      sampleResponse: {
        flightId: "BB_FL_TK_2410",
        baggage: "20 KG",
        priceToken: "BB_PR_TOKEN_99128",
        finalAmount: 4350.00,
        currency: "TRY"
      }
    },
    air_book: {
      id: "biletbank_air_book",
      path: "/api/flight/book",
      method: "POST",
      description: "Create PNR reservation with passenger identity (TCKN / Passport), phone, and email.",
      sampleRequest: {
        priceToken: "BB_PR_TOKEN_99128",
        passengers: [
          {
            firstName: "Ferdos",
            lastName: "Alkan",
            gender: "M",
            birthDate: "1994-05-12",
            citizenId: "12345678901",
            passportNumber: ""
          }
        ],
        contact: { email: "user@example.com", phone: "+905551234567" }
      },
      sampleResponse: {
        pnr: "V8XYZW",
        timeLimit: "2026-10-14T18:00:00+03:00",
        status: "Reserved",
        totalAmount: 4350.00
      }
    },
    air_ticket: {
      id: "biletbank_air_ticket",
      path: "/api/flight/ticket",
      method: "POST",
      description: "Issue e-ticket against agency deposit balance or BiletBank Virtual POS.",
      sampleRequest: {
        pnr: "V8XYZW",
        paymentMethod: "AgencyBalance"
      },
      sampleResponse: {
        pnr: "V8XYZW",
        ticketNumbers: ["235-9988214451"],
        status: "Ticketed"
      }
    }
  }
};
