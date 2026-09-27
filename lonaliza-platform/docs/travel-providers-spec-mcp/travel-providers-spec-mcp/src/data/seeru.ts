export const SEERU_SPECS = {
  provider: "Seeru",
  type: "Flights, Hotels & Rides/Transfers (Seeru Travel B2B API v1.0.0)",
  docsUrl: "https://seeru.travel/docs",
  auth: {
    type: "JWT Bearer Token",
    header: "Authorization: Bearer <JWT_TOKEN>",
    tokenFormat: "ES256 signed B2B partner token with office_id, parent_id, id, and hash claims",
    endpoints: {
      flightsSandbox: "https://sandbox-api.seeru.travel/v1/flights",
      flightsProduction: "https://live-api.seeru.travel/v1/flights",
      hotelsSandbox: "https://sandbox-api.seeru.travel/v1/hotels",
      hotelsProduction: "https://live-api.seeru.travel/v1/hotels",
      rideSandbox: "https://sandbox-api.seeru.travel/v1/ride",
      rideProduction: "https://live-api.seeru.travel/v1/ride"
    }
  },
  endpoints: {
    // Flights Endpoints
    air_search_init: {
      id: "seeru_air_search_init",
      path: "/v1/flights/search/{trips}/{adults}/{children}/{infants}",
      method: "GET",
      category: "Air Search",
      description: "Initiates asynchronous multi-GDS and direct-connect air search (e.g. IST-DXB-20261015/1/0/0?cabin=e&direct=0) and returns search_id.",
      sampleRequest: {
        pathParams: {
          trips: "IST-DXB-20261015",
          adults: 1,
          children: 0,
          infants: 0
        },
        queryParams: { cabin: "e", direct: "0" }
      },
      sampleResponse: {
        search_id: "sr_search_99812401"
      }
    },
    air_result_poll: {
      id: "seeru_air_result_poll",
      path: "/v1/flights/result/{searchId}",
      method: "GET",
      category: "Air Search Polling",
      description: "Polls progressive flight search results until complete=100. Supports incremental pagination via ?after={last_result}.",
      sampleRequest: {
        pathParams: { searchId: "sr_search_99812401" },
        queryParams: { after: 0 }
      },
      sampleResponse: {
        complete: 100,
        last_result: 242,
        result: [
          {
            trip_id: "sr_trip_ek_123",
            price: 350.0,
            tax: 120.0,
            currency: "USD",
            legs: [
              {
                carrier: "EK",
                flight_number: "123",
                origin: "DXB",
                destination: "IST",
                departure_date: "2026-10-15 10:00",
                arrival_date: "2026-10-15 14:15",
                bags: { ADT: { checked: { allowance: "30 kg", desc: "30 kg" }, cabin: { allowance: "7 kg" } } }
              }
            ]
          }
        ]
      }
    },
    air_fare_check: {
      id: "seeru_air_fare_check",
      path: "/v1/flights/booking/fare",
      method: "POST",
      category: "Air Fare Validation",
      description: "Verifies live seat availability and freezes price before creating passenger booking.",
      sampleRequest: {
        booking: { trip_id: "sr_trip_ek_123" }
      },
      sampleResponse: {
        status: "OK",
        booking: { trip_id: "sr_trip_ek_123", price: 350.0, tax: 120.0, verified: true }
      }
    },
    air_booking_save: {
      id: "seeru_air_booking_save",
      path: "/v1/flights/booking/save",
      method: "POST",
      category: "Air Booking",
      description: "Creates reservation order with passenger details (Passport, DOB, Nationality) and returns order_id.",
      sampleRequest: {
        booking: { trip_id: "sr_trip_ek_123" },
        passengers: [
          {
            type: "ADT",
            title: "MR",
            first_name: "AHMED",
            last_name: "ALMANSOORI",
            dob: "1992-04-10",
            nationality: "SA",
            passport_no: "A88991122"
          }
        ],
        contact: { email: "guest@example.com", phone: "+966501234567" }
      },
      sampleResponse: {
        status: "OK",
        order_id: "SR-AIR-ORD-88219"
      }
    },
    air_order_issue: {
      id: "seeru_air_order_issue",
      path: "/v1/flights/order/issue",
      method: "POST",
      category: "Air Ticketing",
      description: "Issues electronic tickets and debits the agency B2B credit/deposit balance.",
      sampleRequest: { order_id: "SR-AIR-ORD-88219" },
      sampleResponse: { status: "OK", message: "Tickets issued successfully" }
    },
    air_order_cancel: {
      id: "seeru_air_order_cancel",
      path: "/v1/flights/order/cancel",
      method: "POST",
      category: "Air Cancellation",
      description: "Cancels un-ticketed booking order and releases seat holds.",
      sampleRequest: { order_id: "SR-AIR-ORD-88219" },
      sampleResponse: { status: "OK", message: "Order cancelled" }
    },

    // Hotels Endpoints (Seeru Hotels API v1.0.0)
    hotel_search: {
      id: "seeru_hotel_search",
      path: "/v1/hotels/search",
      method: "POST",
      category: "Hotel Search",
      description: "Initiates asynchronous search for hotel properties in a destination code and returns search_id.",
      sampleRequest: {
        destination: { type: "city", code: "IST", name: "Istanbul" },
        check_in: "2026-10-15",
        check_out: "2026-10-20",
        occupancies: [{ room_id: 1, adults: 2, children: [] }],
        residency: "SA",
        nationality: "SA",
        currency: "USD"
      },
      sampleResponse: {
        search_id: "sr_htl_search_778120"
      }
    },
    hotel_result_poll: {
      id: "seeru_hotel_result_poll",
      path: "/v1/hotels/result/{search_id}",
      method: "GET",
      category: "Hotel Results",
      description: "Retrieves hotel availability cards and pricing for search_id.",
      sampleRequest: {
        pathParams: { search_id: "sr_htl_search_778120" },
        queryParams: { page: 1, limit: 30, sort_by: "price_asc" }
      },
      sampleResponse: {
        is_completed: true,
        hotels: [
          {
            hotel_id: "SH-IST-1092",
            name: "Grand Hyatt Istanbul",
            star_rating: 5,
            price: 185.0,
            currency: "USD",
            thumbnail: "https://media.seeru.travel/hotels/grand_hyatt_ist.jpg",
            has_free_cancellation: true
          }
        ]
      }
    },
    hotel_rooms: {
      id: "seeru_hotel_rooms",
      path: "/v1/hotels/rooms",
      method: "POST",
      category: "Hotel Rooms & Rates",
      description: "Retrieves granular room categories, meal plans, and rate_ids for selected hotel.",
      sampleRequest: {
        search_id: "sr_htl_search_778120",
        hotel_id: "SH-IST-1092"
      },
      sampleResponse: {
        rooms: [
          {
            room_id: "RM_101",
            room_name: "King Room Garden View",
            rate_id: "SR_RATE_991823",
            price: 185.0,
            meal: "Breakfast Included",
            cancellation_policy: { free_until: "2026-10-12T23:59:00Z" }
          }
        ]
      }
    },
    hotel_fare: {
      id: "seeru_hotel_fare",
      path: "/v1/hotels/fare",
      method: "POST",
      category: "Hotel Fare Check",
      description: "Pre-booking rate validation step. Freezes price and returns fare_token.",
      sampleRequest: {
        search_id: "sr_htl_search_778120",
        rate_id: "SR_RATE_991823"
      },
      sampleResponse: {
        status: "OK",
        fare_token: "FARE_TOKEN_LOCKED_998811",
        price: 185.0
      }
    },
    hotel_booking: {
      id: "seeru_hotel_booking",
      path: "/v1/hotels/booking",
      method: "POST",
      category: "Hotel Booking Creation",
      description: "Creates hotel reservation order with guest names in Latin alphabet.",
      sampleRequest: {
        fare_token: "FARE_TOKEN_LOCKED_998811",
        lead_passenger: { first_name: "AHMED", last_name: "ALMANSOORI", email: "guest@example.com", phone: "+966501234567" },
        rooms: [{ room_index: 1, guests: [{ first_name: "AHMED", last_name: "ALMANSOORI", type: "ADULT" }] }]
      },
      sampleResponse: {
        order_id: "SR-HTL-ORD-55441",
        status: "RESERVED",
        total_amount: 185.0
      }
    },
    hotel_order_issue: {
      id: "seeru_hotel_order_issue",
      path: "/v1/hotels/order/issue",
      method: "POST",
      category: "Hotel Order Issuance",
      description: "Confirms and finalizes hotel booking order via agency deposit balance.",
      sampleRequest: { order_id: "SR-HTL-ORD-55441" },
      sampleResponse: { status: "CONFIRMED", hotel_confirmation_code: "HYATT-IST-99120" }
    },
    hotel_voucher: {
      id: "seeru_hotel_voucher",
      path: "/v1/hotels/voucher",
      method: "GET",
      category: "Hotel Voucher",
      description: "Downloads official printable hotel check-in voucher (PDF / HTML).",
      sampleRequest: { queryParams: { order_id: "SR-HTL-ORD-55441" } },
      sampleResponse: { voucher_url: "https://live-api.seeru.travel/v1/hotels/vouchers/55441.pdf" }
    },
    hotel_cancel: {
      id: "seeru_hotel_cancel",
      path: "/v1/hotels/cancel",
      method: "POST",
      category: "Hotel Cancellation",
      description: "Cancels confirmed hotel booking according to supplier cancellation rules.",
      sampleRequest: { order_id: "SR-HTL-ORD-55441" },
      sampleResponse: { status: "CANCELLED", refund_amount: 185.0, penalty: 0.0 }
    },

    // Transfers / Rides Endpoints (Seeru Ride API v1.0.0)
    ride_search: {
      id: "seeru_ride_search",
      path: "/v1/ride/search",
      method: "POST",
      category: "Transfer / Ride Search",
      description: "Searches private airport transfers, VIP sedans, and vans from airport to hotel.",
      sampleRequest: {
        pickup: { type: "airport", code: "IST" },
        dropoff: { type: "hotel", address: "Taksim Square, Istanbul" },
        datetime: "2026-10-15 14:30",
        passengers: 2,
        luggage: 2
      },
      sampleResponse: {
        vehicles: [
          {
            vehicle_id: "V_MERC_VITO",
            name: "Mercedes-Benz Vito VIP",
            capacity: 6,
            price: 45.0,
            currency: "USD"
          }
        ]
      }
    },
    ride_booking: {
      id: "seeru_ride_booking",
      path: "/v1/ride/book",
      method: "POST",
      category: "Transfer / Ride Booking",
      description: "Books transfer vehicle with flight arrival number and passenger contact.",
      sampleRequest: {
        vehicle_id: "V_MERC_VITO",
        flight_number: "EK123",
        passenger: { name: "Ahmed Almansoori", phone: "+966501234567" }
      },
      sampleResponse: {
        booking_id: "SR-RIDE-99128",
        status: "CONFIRMED"
      }
    }
  }
};
