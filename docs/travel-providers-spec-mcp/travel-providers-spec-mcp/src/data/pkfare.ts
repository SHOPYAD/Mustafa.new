export const PKFARE_SPECS = {
  provider: "PKFARE",
  type: "Flights & Hotels (PKFARE Aggregator & Consolidator API)",
  docsUrl: "https://apifox.pkfare.com/apidoc/project-345083",
  auth: {
    type: "MD5 Signature Header/Body Authentication",
    signatureAlgorithm: "MD5(partnerId + partnerKey).toLowerCase()",
    requestFormat: "JSON POST with authentication block { partnerId, sign }",
    apiBaseUrlProduction: "https://api.pkfare.com",
    apiBaseUrlSandbox: "https://api.pkfare.com"
  },
  endpoints: {
    shopping_v10: {
      id: "pkfare_shopping_v10",
      path: "/json/shoppingV10",
      method: "POST",
      category: "Flight Search",
      description: "Official Shopping V10 air search across global GDS (Amadeus, Sabre, Travelport) and LCC carriers with brand fares and multi-tags.",
      sampleRequest: {
        authentication: { partnerId: "<PARTNER_ID>", sign: "<MD5_SIGN>" },
        search: {
          adults: 1,
          children: 0,
          infants: 0,
          nonstop: 0,
          airline: "",
          solutions: 35,
          returnBrandFarePrice: "Y",
          returnMultiTagPrice: "Y",
          searchAirLegs: [
            {
              origin: "DXB",
              destination: "IST",
              departureDate: "2026-10-15",
              cabinClass: "Economy",
              airline: ""
            }
          ]
        }
      },
      sampleResponse: {
        errorCode: "0000",
        data: {
          solutions: [
            {
              solutionId: "sol_pk_88291",
              solutionKey: "sk_991823",
              adtFare: 280.0,
              adtTax: 85.0,
              totalPrice: 365.0,
              currency: "USD",
              flights: ["fl_1"]
            }
          ],
          flights: [
            {
              flightRef: "fl_1",
              segments: ["seg_1"]
            }
          ],
          segments: [
            {
              segmentRef: "seg_1",
              carrier: "FZ",
              flightNumber: "753",
              depAirport: "DXB",
              arrAirport: "IST",
              depDateTime: "2026-10-15 08:30",
              arrDateTime: "2026-10-15 12:45",
              cabinClass: "Economy",
              baggage: "20kg"
            }
          ]
        }
      }
    },
    shopping_v8: {
      id: "pkfare_shopping_v8",
      path: "/json/shoppingV8",
      method: "POST",
      category: "Flight Search (Fallback)",
      description: "Fallback Shopping V8 air search when V10 is undergoing maintenance.",
      sampleRequest: {
        authentication: { partnerId: "<PARTNER_ID>", sign: "<MD5_SIGN>" },
        search: {
          adults: 1,
          children: 0,
          infants: 0,
          nonstop: 0,
          solutions: 30,
          returnTagPrice: "Y",
          searchAirLegs: [{ origin: "DXB", destination: "IST", departureDate: "2026-10-15", cabinClass: "Economy" }]
        }
      },
      sampleResponse: {
        errorCode: "0000",
        data: { solutions: [] }
      }
    },
    precise_pricing_v12: {
      id: "pkfare_precise_pricing_v12",
      path: "/json/precisePricing_V12",
      method: "POST",
      category: "Flight Pricing",
      description: "Mandatory pre-booking fare validation. Re-checks live seat inventory, taxes, and baggage allowances.",
      sampleRequest: {
        Authentication: { partnerId: "<PARTNER_ID>", sign: "<MD5_SIGN>" },
        pricing: {
          solutionId: "sol_pk_88291",
          solutionKey: "sk_991823",
          adults: 1,
          children: 0,
          infants: 0,
          cabin: "Y"
        }
      },
      sampleResponse: {
        errorCode: "0000",
        data: {
          solutionId: "sol_pk_88291",
          totalPrice: 365.0,
          currency: "USD",
          status: "AVAILABLE",
          baggage: { weight: 20, unit: "kg" }
        }
      }
    },
    penalty_v4: {
      id: "pkfare_penalty_v4",
      path: "/json/penaltyV4",
      method: "POST",
      category: "Fare Rules & Penalties",
      description: "Retrieves granular change and cancellation penalty percentages and fees before/after flight departure.",
      sampleRequest: {
        Authentication: { partnerId: "<PARTNER_ID>", sign: "<MD5_SIGN>" },
        penalty: {
          solutionId: "sol_pk_88291",
          journeys: {}
        }
      },
      sampleResponse: {
        errorCode: "0000",
        penalties: [
          "Changes permitted before departure with USD 50 penalty.",
          "Refund permitted before departure with USD 80 penalty.",
          "Non-refundable after departure."
        ]
      }
    },
    precise_booking_v8: {
      id: "pkfare_precise_booking_v8",
      path: "/json/preciseBooking_V8",
      method: "POST",
      category: "Flight Booking",
      description: "Creates live airline PNR and PKFARE order record with passenger identity documents.",
      sampleRequest: {
        Authentication: { partnerId: "<PARTNER_ID>", sign: "<MD5_SIGN>" },
        booking: {
          buyerOrder: "LONA-ORD-2026-9912",
          passengers: [
            {
              psgType: "ADT",
              sex: "M",
              firstName: "AHMED",
              lastName: "ALMANSOORI",
              nationality: "SA",
              birthday: "1990-05-15",
              cardType: "P",
              cardNum: "A12345678",
              cardExpired: "2030-01-01",
              passengerIndex: 1
            }
          ],
          solution: { solutionId: "sol_pk_88291" },
          contact: { name: "AhmedAlmansoori", email: "guest@example.com", mobile: "501234567", telCode: "+966" }
        }
      },
      sampleResponse: {
        errorCode: "0000",
        data: {
          orderNum: "PK-ORD-2026-778899",
          airPnr: "V8XYZW",
          status: "BOOKED",
          timeLimit: "2026-10-14 20:00:00"
        }
      }
    },
    order_pricing_v6: {
      id: "pkfare_order_pricing_v6",
      path: "/json/orderPricingV6",
      method: "POST",
      category: "Pre-Ticketing Verification",
      description: "Re-verifies final order amount before triggering ticketing deduction.",
      sampleRequest: {
        Authentication: { partnerId: "<PARTNER_ID>", sign: "<MD5_SIGN>" },
        orderPricing: { orderNum: "PK-ORD-2026-778899" }
      },
      sampleResponse: {
        errorCode: "0000",
        data: { orderNum: "PK-ORD-2026-778899", finalAmount: 365.0, currency: "USD", status: "PAYABLE" }
      }
    },
    ticketing: {
      id: "pkfare_ticketing",
      path: "/json/ticketing",
      method: "POST",
      category: "Instant Ticketing",
      description: "Triggers instant deduction from deposit and starts automated GDS ticket issuance.",
      sampleRequest: {
        authentication: { partnerId: "<PARTNER_ID>", sign: "<MD5_SIGN>" },
        ticketing: {
          orderNum: "PK-ORD-2026-778899",
          PNR: "V8XYZW",
          email: "guest@example.com",
          name: "AhmedAlmansoori",
          telNum: "+966501234567"
        }
      },
      sampleResponse: {
        errorCode: "0000",
        data: { orderNum: "PK-ORD-2026-778899", status: "TICKETING_IN_PROGRESS" }
      }
    },
    request_ticketing: {
      id: "pkfare_request_ticketing",
      path: "/json/requestTicketing",
      method: "POST",
      category: "Ticketing Notification",
      description: "Notifies PKFARE fulfillment desk to accelerate manual or robotic ticketing.",
      sampleRequest: {
        Authentication: { partnerId: "<PARTNER_ID>", sign: "<MD5_SIGN>" },
        data: { issuingOrdersPush: ["PK-ORD-2026-778899"] }
      },
      sampleResponse: {
        errorCode: "0000",
        success: true
      }
    },
    order_detail_v14: {
      id: "pkfare_order_detail_v14",
      path: "/json/orderDetail/V14",
      method: "POST",
      category: "Order Details & E-Tickets",
      description: "Fetches full order status, issued 13-digit e-ticket numbers, schedule change alerts, and tax breakdowns.",
      sampleRequest: {
        Authentication: { partnerId: "<PARTNER_ID>", sign: "<MD5_SIGN>" },
        data: {
          orderNum: "PK-ORD-2026-778899",
          includeFields: "passengers,journeys,solutions,ancillary,scheduleChange,checkinInfo",
          includeOrderTypes: ["O", "R", "C", "V"]
        }
      },
      sampleResponse: {
        errorCode: "0000",
        data: {
          orderNum: "PK-ORD-2026-778899",
          status: "TICKETED",
          passengers: [
            {
              firstName: "AHMED",
              lastName: "ALMANSOORI",
              ticketNo: "141-9876543210"
            }
          ]
        }
      }
    },
    cancel: {
      id: "pkfare_cancel",
      path: "/json/cancel",
      method: "POST",
      category: "Order Cancellation",
      description: "Cancels an unpaid or pending booking order and releases reserved GDS seats.",
      sampleRequest: {
        Authentication: { partnerId: "<PARTNER_ID>", sign: "<MD5_SIGN>" },
        cancel: { orderNum: "PK-ORD-2026-778899" }
      },
      sampleResponse: {
        errorCode: "0000",
        data: { orderNum: "PK-ORD-2026-778899", status: "CANCELLED" }
      }
    },
    refund_pricing_generate: {
      id: "pkfare_refund_pricing_generate",
      path: "/json/refundPricing/generate",
      method: "POST",
      category: "Refund Quotation",
      description: "Calculates precise airline cancellation penalties and net refundable cash amount.",
      sampleRequest: {
        Authentication: { partnerId: "<PARTNER_ID>", sign: "<MD5_SIGN>" },
        data: { orderNum: "PK-ORD-2026-778899", ticketNums: ["141-9876543210"] }
      },
      sampleResponse: {
        errorCode: "0000",
        data: { refundPricingId: "RF_CALC_88921", refundAmount: 285.0, penaltyAmount: 80.0, currency: "USD" }
      }
    },
    refund_request: {
      id: "pkfare_refund_request",
      path: "/json/refund-api/refundRequest",
      method: "POST",
      category: "Refund Execution",
      description: "Submits formal ticket refund request for processed refundPricingId.",
      sampleRequest: {
        Authentication: { partnerId: "<PARTNER_ID>", sign: "<MD5_SIGN>" },
        data: { refundPricingId: "RF_CALC_88921", orderNum: "PK-ORD-2026-778899", allPaxOfOrder: 1 }
      },
      sampleResponse: {
        errorCode: "0000",
        data: { refundOrderId: "RF_ORD_339120" }
      }
    },
    check_refund: {
      id: "pkfare_check_refund",
      path: "/json/refund-api/checkRefund",
      method: "POST",
      category: "Refund Status",
      description: "Polls execution status of submitted refund order.",
      sampleRequest: {
        Authentication: { partnerId: "<PARTNER_ID>", sign: "<MD5_SIGN>" },
        data: { refundOrderNum: "RF_ORD_339120" }
      },
      sampleResponse: {
        errorCode: "0000",
        data: { status: "REFUNDED", refundedAmount: 285.0, currency: "USD" }
      }
    },
    voiding_v2: {
      id: "pkfare_voiding_v2",
      path: "/json/voiding/v2",
      method: "POST",
      category: "Same-Day Void",
      description: "Same-day void of issued ticket with zero or minimal penalty within the BSP void window.",
      sampleRequest: {
        Authentication: { partnerId: "<PARTNER_ID>", sign: "<MD5_SIGN>" },
        VoidRequest: {
          orderNum: "PK-ORD-2026-778899",
          passenger: [{ firstName: "AHMED", lastName: "ALMANSOORI" }]
        }
      },
      sampleResponse: {
        errorCode: "0000",
        data: { status: "VOIDED", voidFee: 15.0, currency: "USD" }
      }
    },
    change_reshop: {
      id: "pkfare_change_reshop",
      path: "/json/change/reshop",
      method: "POST",
      category: "Ticket Date/Flight Change",
      description: "Searches available alternate dates and computes difference in fare and change fees.",
      sampleRequest: {
        Authentication: { partnerId: "<PARTNER_ID>", sign: "<MD5_SIGN>" },
        changeSearch: { orderNum: "PK-ORD-2026-778899", newDepartureDate: "2026-10-20" }
      },
      sampleResponse: {
        errorCode: "0000",
        data: { availableSolutions: [] }
      }
    },
    ancillary_pricing_v6: {
      id: "pkfare_ancillary_pricing_v6",
      path: "/json/ancillaryPricingV6",
      method: "POST",
      category: "Ancillaries (Baggage & Meals)",
      description: "Retrieves extra baggage purchase tiers and meal selections for confirmed flights.",
      sampleRequest: {
        Authentication: { partnerId: "<PARTNER_ID>", sign: "<MD5_SIGN>" },
        pricing: { solutionId: "sol_pk_88291" }
      },
      sampleResponse: {
        errorCode: "0000",
        data: { baggageTiers: [{ weight: "23kg", price: 45.0, currency: "USD" }] }
      }
    }
  }
};
