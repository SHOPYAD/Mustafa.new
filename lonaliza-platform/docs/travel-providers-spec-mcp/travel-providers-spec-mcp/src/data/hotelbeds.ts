export const HOTELBEDS_SPECS = {
  provider: "Hotelbeds",
  type: "Hotels (APItude Booking & Content API)",
  docsUrl: "https://developer.hotelbeds.com/",
  auth: {
    type: "Api-key & X-Signature header",
    signatureAlgorithm: "SHA256(ApiKey + Secret + Math.floor(Date.now() / 1000))",
    headers: {
      "Api-key": "<API_KEY>",
      "X-Signature": "<HEX_DIGEST>",
      "Accept": "application/json"
    }
  },
  endpoints: {
    availability_search: {
      id: "hotelbeds_search",
      path: "/hotel-api/1.0/hotels",
      method: "POST",
      description: "Search hotel availability across destination codes or hotel IDs with occupancy.",
      sampleRequest: {
        stay: { checkIn: "2026-10-15", checkOut: "2026-10-20" },
        occupancies: [{ rooms: 1, adults: 2, children: 0 }],
        destination: { code: "IST" }
      },
      sampleResponse: {
        hotels: {
          hotels: [
            {
              code: 10485,
              name: "Swissotel The Bosphorus Istanbul",
              rooms: [
                {
                  code: "DBL.DX",
                  name: "Double Deluxe",
                  rates: [
                    {
                      rateKey: "20261015|20261020|W|10485|DBL.DX|RO|RO||1|1|1",
                      rateType: "BOOKABLE",
                      net: "950.00",
                      rateComments: "Non-refundable policy applies after specified deadline."
                    }
                  ]
                }
              ]
            }
          ]
        }
      }
    },
    check_rates: {
      id: "hotelbeds_check_rates",
      path: "/hotel-api/1.0/checkrates",
      method: "POST",
      description: "Pre-booking rate valuation step. Re-checks price and locks rateKey.",
      sampleRequest: {
        rooms: [{ rateKey: "20261015|20261020|W|10485|DBL.DX|RO|RO||1|1|1" }]
      },
      sampleResponse: {
        hotel: {
          code: 10485,
          rooms: [
            {
              rates: [
                {
                  rateKey: "20261015|20261020|W|10485|DBL.DX|RO|RO||1|1|1",
                  rateType: "BOOKABLE",
                  net: "950.00",
                  cancellationPolicies: [
                    { amount: "950.00", from: "2026-10-13T23:59:00+02:00" }
                  ]
                }
              ]
            }
          ]
        }
      }
    },
    create_booking: {
      id: "hotelbeds_create_booking",
      path: "/hotel-api/1.0/bookings",
      method: "POST",
      description: "Confirm booking using validated rateKey and guest allocation.",
      sampleRequest: {
        holder: { name: "Ahmed", surname: "Almansoori" },
        rooms: [
          {
            rateKey: "20261015|20261020|W|10485|DBL.DX|RO|RO||1|1|1",
            paxes: [
              { roomId: 1, type: "AD", name: "Ahmed", surname: "Almansoori" },
              { roomId: 1, type: "AD", name: "Sara", surname: "Almansoori" }
            ]
          }
        ],
        clientReference: "LONALIZA-HB-9988"
      },
      sampleResponse: {
        booking: {
          reference: "182-9988210",
          clientReference: "LONALIZA-HB-9988",
          status: "CONFIRMED",
          totalNet: "950.00",
          currency: "EUR"
        }
      }
    },
    cancel_booking: {
      id: "hotelbeds_cancel_booking",
      path: "/hotel-api/1.0/bookings/{bookingId}",
      method: "DELETE",
      description: "Cancel confirmed Hotelbeds reservation.",
      sampleRequest: { bookingId: "182-9988210" },
      sampleResponse: {
        booking: { reference: "182-9988210", status: "CANCELLED", cancellationReference: "CAN-4421" }
      }
    }
  }
};
