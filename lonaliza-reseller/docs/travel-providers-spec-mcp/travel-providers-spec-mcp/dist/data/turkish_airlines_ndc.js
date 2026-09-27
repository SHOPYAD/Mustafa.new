export const TURKISH_AIRLINES_NDC_SPECS = {
  provider: "Turkish Airlines (TKCONNECT)",
  type: "Direct Connect / IATA NDC (Schema v21.3)",
  docsUrl: "https://www.turkishairlines.com/en-tr/tkconnect/resources/",
  auth: {
    type: "API Gateway Key + Agency IATA PCC",
    headers: {
      "X-Api-Key": "<TK_API_KEY>",
      "X-IATA-Code": "<IATA_NUMBER>",
      "Content-Type": "application/json"
    }
  },
  endpoints: {
    air_shopping: {
      id: "tk_air_shopping",
      path: "/ndc/v21_3/AirShopping",
      method: "POST",
      description: "Official IATA AirShoppingRQ. Queries flights across Turkish Airlines network with EcoFly, ExtraFly, and Business branded fares.",
      sampleRequest: {
        AirShoppingRQ: {
          Party: { Sender: { TravelAgency: { IATA_Number: "2321456" } } },
          CoreQuery: {
            OriginDest: [
              { Origin: "IST", Destination: "JFK", DepDate: "2026-11-01" },
              { Origin: "JFK", Destination: "IST", DepDate: "2026-11-10" }
            ]
          },
          Paxs: { Pax: [{ PaxID: "PAX1", PTC: "ADT" }] }
        }
      },
      sampleResponse: {
        AirShoppingRS: {
          OffersGroup: {
            AirlineOffers: [
              {
                OfferID: "TK_OFFER_99812",
                TotalPrice: { SimpleCurrencyPrice: { Value: 980.00, Code: "USD" } },
                FareDetail: { Brand: "ExtraFly", BaggageAllowance: "2x23KG" }
              }
            ]
          }
        }
      }
    },
    offer_price: {
      id: "tk_offer_price",
      path: "/ndc/v21_3/OfferPrice",
      method: "POST",
      description: "Confirm OfferPrice, taxes, and dynamic ancillaries (preferred seat selection, extra baggage).",
      sampleRequest: {
        OfferPriceRQ: {
          Query: { OfferID: "TK_OFFER_99812" }
        }
      },
      sampleResponse: {
        OfferPriceRS: {
          PricedOffer: {
            OfferID: "TK_OFFER_99812_CONFIRMED",
            TotalPrice: { Value: 980.00, Code: "USD" }
          }
        }
      }
    },
    order_create: {
      id: "tk_order_create",
      path: "/ndc/v21_3/OrderCreate",
      method: "POST",
      description: "Commit order, generate PNR, and issue e-tickets via BSP/ARC cash settlement or agency credit line.",
      sampleRequest: {
        OrderCreateRQ: {
          Query: {
            Offer: { OfferID: "TK_OFFER_99812_CONFIRMED" },
            Passengers: [
              {
                PaxID: "PAX1",
                Name: { Given: "AHMED", Surname: "ALMANSOORI" },
                Contact: { Email: "guest@example.com", Phone: "+905551234567" }
              }
            ],
            Payment: { Method: "BSP_CASH" }
          }
        }
      },
      sampleResponse: {
        OrderViewRS: {
          Order: {
            OrderID: "TK-ORD-881293",
            BookingReference: "TK77QA",
            TicketDocInfo: [{ TicketNumber: "235-8899221144" }],
            OrderStatus: "Ticketed"
          }
        }
      }
    },
    order_cancel: {
      id: "tk_order_cancel",
      path: "/ndc/v21_3/OrderCancel",
      method: "POST",
      description: "Cancel confirmed PNR, calculate refund penalty, and void/refund ticket.",
      sampleRequest: {
        OrderCancelRQ: { OrderID: "TK-ORD-881293" }
      },
      sampleResponse: {
        OrderCancelRS: {
          Status: "Cancelled",
          RefundAmount: { Value: 850.00, Code: "USD" },
          Penalty: { Value: 130.00, Code: "USD" }
        }
      }
    }
  }
};
