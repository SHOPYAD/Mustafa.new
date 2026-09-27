# Ticket Retrieve API&#160;Reference

## Source

- **Local HTML:** `docs/travelport/travelport api guide/travelport-airapi json/support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/Ticketing/APIRef_TicketRetrieve.html` (UTF-8 mirror)
- **Official base:** `https://support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/` + same relative path

## Plaintext extract (lossy)

Ticket Retrieve API&#160;Reference Skip To Main Content Account Settings Logout placeholder Account Settings Logout Filter: All Files Submit Search Filter: All Files Submit Search Ticket Retrieve API&#160;Reference Request Response Example request Example response POST ticket/tickets/getbylocator Base path: Pre-production https://api.pp.travelport.net/11/air/ Production https://api.travelport.net/11/air/ Related Content: Ticketing Guide The Ticket Retrieve request returns details for a single ticket for NDC, or for all tickets associated with a record locator for GDS. Although the JSON &#160;Ticket Retrieve API supports retrieving NDC&#160;tickets, not all NDC carriers support retrieving NDC tickets through the EDIFACT/GDS path used by the JSON APIs. For the most consistent and reliable retrieve, best practice is to use Travelport Smartpoint Cloud to display NDC tickets. Note that ticket display functionality for NDC transactions is not supported in terminal programs. The JSON Air APIs provide the following APIs to retrieve bookings and tickets: To retrieve all booking details, use Reservation Retrieve . Returns all booking, payment, and ticketing information currently on a booking, To retrieve a list of all ticket numbers on a booking, use Ticket List . To retrieve details for all tickets associated with a booking (GDS&#160;only), or for a single ticket for NDC, use Ticket Retrieve . To return a list of documents on a booking, such as tickets, invoices, MCOs, and EMDs, use Document List . To return histories of up to six documents on a booking, such as tickets, invoices, MCOs, and EMDs, use Document History . For GDS&#160;and NDC differences in the JSON APIs, see the support tables for seats , ancillaries , fare rules , and exchanges/refunds , and the NDC&#160;and GDS Functionality Comparison . For differences within NDC by individual carriers, see NDC capabilities by airline through JSON API in the Travelport Knowledge Base. See Knowledge Base NDC&#160;Resources if you need login assistance. Request As part of the request requirements, also see Authentication and Common Air API Headers . Query Parameters None. Request Body Show Request Body Table Object Description Required/Optional TicketQueryGetByLocator Top level object Includes Locator and TicketNumber. Required Locator Top level object for locator code. Required value Send the reservation locator code. Required locatorType Send with the value Locator . Required TIcketNumber Top level object for ticket number. Required for NDC Do not send for GDS value Send the ticket number. Required for NDC Do not send for GDS contentSource Send with the value NDC . Required for NDC Do not send for GDS Response For each ticket returned, the response returns the reservation locator, traveler name, form of payment details, flight departure and arrival information, a price breakdown by PTC, and agency information. Not all details may be returned if not part of the booking record. Show Response Body Table Object Description TicketListResponse Top level object for response. Includes the Ticket object. Ticket Contains all ticketing details. May include the following: numberOfTicketsIssued : The number of tickets issued. Multiple ticket numbers are issued for itineraries with more than four segments, or for more than one passenger. Depending on the data available for the ticket, may include the Identifier, PersonName, ReservationLocator, FormOfPayment, TicketSegment, TicketPrice, PassengerTypeCode, ValidatingCarrier, PricingType, AgencyInfo, Restrictions, and FlightProduct objects. Identifier Contains the ticket number in the value attribute. PersonName Traveler name. Key value pairs: Given : Traveler given name. Surname : Traveler surname. ReservationLocator Reservation locator. Key value pairs: supplierCode :&#160;Supplier ID for the supplier issuing the ticket. value :&#160;Reservation locator code. FormOfPayment Top level object for the type of form of payment. Includes&#160;PaymentCard if payment was made by credit card. PaymentCard If payment was made by credit card, card details. Key value pairs: expireDate : Card expiration date. approvalCode : Approval code for the transaction. CardCode : Card code. Contains CardNumber object. CardNumber Returned if payment was made by credit card. Key value pairs: encryptedValue : Card number in encrypted format. TicketSegment Flight details for the flight or connecting flights making up one leg of the itinerary. Multiple instances are returned for itineraries with more than one leg, such as round-trip or multi-city. Key value pairs: sequence : Identifies the order of this leg within the itinerary. ClassOfService : Class of service code. FareBasisCode :&#160;Fare basis code for the flight. Status : Ticket status. Possible values vary with any actions that may have been taken with the ticket and may include any of the following: CheckedIn Closed Exchanged InfoOnly Lifted/Boarded OpenForUse OtherAirlineControl Void Refund Suspended Unavailable Used Carrier : Airline carrier code. Number : Flight number. Includes Departure, Arrival, and TicketBaggage objects. Departure Key value pairs: location :&#160;Airport code of departure. date : Date of departure. time : Time of departure. Arrival Key value pairs: location :&#160;Airport code of arrival. date : Date of arrival. time : Time of arrival. TicketBaggage Any baggage that is part of the ticket. TicketPrice Ticket price details. Key value pairs: fareCalculation :&#160;When available, FareCalculation returns the fare calculation ladder for all public and private fare types filed by an agency or an airline. Returned as a string with unlimited bytes. GDS only, not supported for NDC. Includes CurrencyCode, Base, Taxes, and Total objects. CurrencyCode Indicates in the value attribute the code for the currency in which the amounts in TicketPrice are returned. Base The amount of the base fare. Taxes Top level object for individual Tax objects for each separate tax in the fare. Tax Each instance of Tax provides details on a specific tax: currencyCode : The currency code of the tax. taxCode : The country code imposing the tax. value :&#160;The amount of the tax, in the currency specified in Amount/currencyCode. Total Total of all taxes plus base fare. PassengerTypeCode PTC for the passenger on this ticket. ValidatingCarrier The&#160;IATA code for the validating carrier. PricingType This value is usually Auto Priced but could be Manual if back-end processing was required to issue the ticket. Restrictions Any fare restriction information returned by the carrier. AgencyInfo Details about the ticketing agency. Key value pairs: ticketedDate : Date the itinerary was ticketed in YYYY-DD-MM format. name : Ticketing agency name. ticketingPCC : Agency PCC. code : Agency code. ticketingCountry : Agency country. ticketingCity : Agency city. FlightProduct Class of service and fare code details for each flight in the itinerary. Key value pairs: segmentSequence : Identifies this flight in the sequence, starting with 1 for the first flight in the sequence. Matches the sequence numbers in FlightSegment/sequence. Flight Segment contains the flight details such as departure, arrival, and time. classOfService : The booked class of service. fareBasisCode : The fare basis code, also called the ticket designator. Example Request Show Example NDC&#160;Ticket Retrieve request { "TicketQueryGetByLocator": { "Locator": { "value": "7KPPBF", "locatorType": "Locator" }, "TicketNumber": [ { "value": "0572317564374", "contentSource": "NDC" } ] } } Example Response For additional examples, download the developer toolkits and see Using Postman and Developer Toolkits . Show Example single ticket response for NDC (supported for GDS &amp;&#160;NDC) { "TicketListResponse": { "@type": "TicketListResponse", "Ticket": [ { "@type": "Ticket", "numberOfTicketsIssued": 1, "Identifier": { "value": "0572317692477" }, "PersonName": { "@type": "PersonName", "Prefix": "MR", "Given": "PX ADTTWO", "Surname": "SRNMONE" }, "ReservationLocator": { "supplierCode": "1G", "value": "7KTHMC" }, "FormOfPayment": [ { "value": "Cash" } ], "TicketSegment": [ { "@type": "TicketSegment", "sequence": 1, "ClassOfService": "T", "FareBasisCode": "TYS0BALA", "Status": "OpenForUse", "Carrier": "AF", "Number": "1437", "Departure": { "@type": "Departure", "location": "AMS", "date": "2024-07-16", "time": "15:45:00" }, "Arrival": { "@type": "Arrival", "location": "CDG", "date": "2024-07-16", "time": "17:05:00" }, "TicketBaggage": { "@type": "TicketBaggage", "quantity": 0 } } ], "TicketPrice": { "@type": "TicketPrice", "fareCalculation": "G", "CurrencyCode": { "value": "EUR" }, "Base": 61, "Taxes": { "@type": "TaxesDetail", "TotalTaxes": 72.28, "Tax": [ { "currencyCode": "EUR", "taxCode": "YR", "value": 2 }, { "currencyCode": "EUR", "taxCode": "CJ", "value": 17.08 }, { "currencyCode": "EUR", "taxCode": "RN", "value": 24.15 }, { "currencyCode": "EUR", "taxCode": "VV", "value": 29.05 } ] }, "Total": 133.28 }, "PassengerTypeCode": "ADT", "ValidatingCarrier": "057", "PricingType": "Auto Priced", "AgencyInfo": { "ticketedDate": "2024-06-26", "name": "MARCO ET VASCO", "ticketingPCC": "680I", "code": "2026159", "ticketingCountry": "FR", "ticketingCity": "PAR" } } ] } } Show Example multiple ticket retrieve response for GDS (supported for GDS&#160;only) { "TicketListResponse": { "@type": "TicketListResponse", "TicketID": [ { "@type": "TicketSummary", "numberOfTicketsIssued": 1, "Identifier": { "value": "0019905359181" }, "PersonName": { "@type": "PersonName", "Given": "NAVNEET SINGH MR", "Surname": "NEGI ADT" }, "ReservationLocator": { "supplierCode": "1G", "value": "CMT80R" }, "FormOfPayment": [ { "value": "Cash" } ], "TicketSegment": [ { "@type": "TicketSegment", "sequence": 1, "ClassOfService": "S", "FareBasisCode": "SLN0D4M5", "Status": "OpenForUse", "Carrier": "AA", "Number": "6969", "Departure": { "@type": "Departure", "location": "DEN", "date": "2025-08-15", "time": "18:35:00" }, "Arrival": { "@type": "Arrival", "location": "LHR" }, "FlightStatusCode": "OK", "TicketBaggage": { "@type": "TicketBaggage", "quantity": 1, "soldByPieceInd": true } } ], "TicketPrice": { "@type": "TicketPrice", "fareCalculation": "G", "fareBreakdown": "DEN AA LON 285.00 NUC285.00END ROE1.0", "CurrencyCode": { "decimalPlace": 2, "value": "AUD" }, "Base": 443.00, "Taxes": { "@type": "TaxesDetail", "TaxInfo": [ { "@type": "TaxInfo", "TaxCode": "XF", "Amount": 4.50, "TaxBreakdown": [ { "@type": "TaxBreakdown", "AirportCode": "DEN", "Amount": 4.50 } ] } ], "Tax": [ { "currencyCode": "AUD", "taxCode": "AY", "decimalPlace": 2, "value": 8.70 }, { "currencyCode": "AUD", "taxCode": "US", "decimalPlace": 2, "value": 35.60 }, { "currencyCode": "AUD", "taxCode": "YR", "decimalPlace": 2, "value": 279.30 }, { "currencyCode": "AUD", "taxCode": "XF", "decimalPlace": 2, "value": 7.00 } ] }, "Total": 773.60, "Commission": { "@type": "CommissionPercent", "Percent": 0.05 }, "FiledAmount": { "currencyCode": "USD", "decimalPlace": 2, "value": 285.00 } }, "PassengerTypeCode": "ADT", "ValidatingCarrier": "001", "PricingType": "Auto Priced", "Restrictions": [ "[NONREF/RESTRICTIONS APPLY]" ], "AgencyInfo": { "ticketedDate": "2025-07-15", "name": "GALILEO SOUTHERN CROSS", "ticketingPCC": "XB7", "code": "02345243", "ticketingCountry": "AU", "ticketingCity": "SYD" } }, { "@type": "TicketSummary", "numberOfTicketsIssued": 1, "Identifier": { "value": "0019905359182" }, "PersonName": { "@type": "PersonName", "Given": "NAVNEET KUMAR MR", "Surname": "SHARMA ADT" }, "ReservationLocator": { "supplierCode": "1G", "value": "CMT80R" }, "FormOfPayment": [ { "value": "Cash" } ], "TicketSegment": [ { "@type": "TicketSegment", "sequence": 1, "ClassOfService": "S", "FareBasisCode": "SLN0D4M5", "Status": "OpenForUse", "Carrier": "AA", "Number": "6969", "Departure": { "@type": "Departure", "location": "DEN", "date": "2025-08-15", "time": "18:35:00" }, "Arrival": { "@type": "Arrival", "location": "LHR" }, "FlightStatusCode": "OK", "TicketBaggage": { "@type": "TicketBaggage", "quantity": 1, "soldByPieceInd": true } } ], "TicketPrice": { "@type": "TicketPrice", "fareCalculation": "G", "fareBreakdown": "DEN AA LON 285.00 NUC285.00END ROE1.0", "CurrencyCode": { "decimalPlace": 2, "value": "AUD" }, "Base": 443.00, "Taxes": { "@type": "TaxesDetail", "TaxInfo": [ { "@type": "TaxInfo", "TaxCode": "XF", "Amount": 4.50, "TaxBreakdown": [ { "@type": "TaxBreakdown", "AirportCode": "DEN", "Amount": 4.50 } ] } ], "Tax": [ { "currencyCode": "AUD", "taxCode": "AY", "decimalPlace": 2, "value": 8.70 }, { "currencyCode": "AUD", "taxCode": "US", "decimalPlace": 2, "value": 35.60 }, { "currencyCode": "AUD", "taxCode": "YR", "decimalPlace": 2, "value": 279.30 }, { "currencyCode": "AUD", "taxCode": "XF", "decimalPlace": 2, "value": 7.00 } ] }, "Total": 773.60, "Commission": { "@type": "CommissionPercent", "Percent": 0.05 }, "FiledAmount": { "currencyCode": "USD", "decimalPlace": 2, "value": 285.00 } }, "PassengerTypeCode": "ADT", "ValidatingCarrier": "001", "PricingType": "Auto Priced", "Restrictions": [ "[NONREF/RESTRICTIONS APPLY]" ], "AgencyInfo": { "ticketedDate": "2025-07-15", "name": "GALILEO SOUTHERN", "ticketingPCC": "XB7", "code": "02345243", "ticketingCountry": "AU", "ticketingCity": "SYD" } } ] } }

## Literal `<pre>` excerpts from HTML

### Block 1

```
{
	"TicketQueryGetByLocator": {
		"Locator": {
			"value": "7KPPBF",
			"locatorType": "Locator"
		},
		"TicketNumber": [
			{
				"value": "0572317564374",
				"contentSource": "NDC"
			}
		]
	}
}
```

### Block 2

```
{
 "TicketListResponse": {
  "@type": "TicketListResponse",
  "Ticket": [
   {
    "@type": "Ticket",
    "numberOfTicketsIssued": 1,
    "Identifier": {
     "value": "0572317692477"
    },
    "PersonName": {
     "@type": "PersonName",
     "Prefix": "MR",
     "Given": "PX ADTTWO",
     "Surname": "SRNMONE"
    },
    "ReservationLocator": {
     "supplierCode": "1G",
     "value": "7KTHMC"
    },
    "FormOfPayment": [
     {
      "value": "Cash"
     }
    ],
    "TicketSegment": [
     {
      "@type": "TicketSegment",
      "sequence": 1,
      "ClassOfService": "T",
      "FareBasisCode": "TYS0BALA",
      "Status": "OpenForUse",
      "Carrier": "AF",
      "Number": "1437",
      "Departure": {
       "@type": "Departure",
       "location": "AMS",
       "date": "2024-07-16",
       "time": "15:45:00"
      },
      "Arrival": {
       "@type": "Arrival",
       "location": "CDG",
       "date": "2024-07-16",
       "time": "17:05:00"
      },
      "TicketBaggage": {
       "@type": "TicketBaggage",
       "quantity": 0
      }
     }
    ],
    "TicketPrice": {
     "@type": "TicketPrice",
     "fareCalculation": "G",
     "CurrencyCode": {
      "value": "EUR"
     },
     "Base": 61,
     "Taxes": {
      "@type": "TaxesDetail",
      "TotalTaxes": 72.28,
      "Tax": [
       {
        "currencyCode": "EUR",
        "taxCode": "YR",
        "value": 2
       },
       {
        "currencyCode": "EUR",
        "taxCode": "CJ",
        "value": 17.08
       },
       {
        "currencyCode": "EUR",
        "taxCode": "RN",
        "value": 24.15
       },
       {
        "currencyCode": "EUR",
        "taxCode": "VV",
        "value": 29.05
       }
      ]
     },
     "Total": 133.28
    },
    "PassengerTypeCode": "ADT",
    "ValidatingCarrier": "057",
    "PricingType": "Auto Priced",
    "AgencyInfo": {
     "ticketedDate": "2024-06-26",
     "name": "MARCO ET VASCO",
     "ticketingPCC": "680I",
     "code": "2026159",
     "ticketingCountry": "FR",
     "ticketingCity": "PAR"
    }
   }
  ]
 }
}
```

### Block 3

```
{
    "TicketListResponse": {
        "@type": "TicketListResponse",
        "TicketID": [
            {
                "@type": "TicketSummary",
                "numberOfTicketsIssued": 1,
                "Identifier": {
                    "value": "0019905359181"
                },
                "PersonName": {
                    "@type": "PersonName",
                    "Given": "NAVNEET SINGH MR",
                    "Surname": "NEGI ADT"
                },
                "ReservationLocator": {
                    "supplierCode": "1G",
                    "value": "CMT80R"
                },
                "FormOfPayment": [
                    {
                        "value": "Cash"
                    }
                ],
                "TicketSegment": [
                    {
                        "@type": "TicketSegment",
                        "sequence": 1,
                        "ClassOfService": "S",
                        "FareBasisCode": "SLN0D4M5",
                        "Status": "OpenForUse",
                        "Carrier": "AA",
                        "Number": "6969",
                        "Departure": {
                            "@type": "Departure",
                            "location": "DEN",
                            "date": "2025-08-15",
                            "time": "18:35:00"
                        },
                        "Arrival": {
                            "@type": "Arrival",
                            "location": "LHR"
                        },
                        "FlightStatusCode": "OK",
                        "TicketBaggage": {
                            "@type": "TicketBaggage",
                            "quantity": 1,
                            "soldByPieceInd": true
                        }
                    }
                ],
                "TicketPrice": {
                    "@type": "TicketPrice",
                    "fareCalculation": "G",
                    "fareBreakdown": "DEN AA LON 285.00 NUC285.00END ROE1.0",
                    "CurrencyCode": {
                        "decimalPlace": 2,
                        "value": "AUD"
                    },
                    "Base": 443.00,
                    "Taxes": {
                        "@type": "TaxesDetail",
                        "TaxInfo": [
                            {
                                "@type": "TaxInfo",
                                "TaxCode": "XF",
                                "Amount": 4.50,
                                "TaxBreakdown": [
                                    {
                                        "@type": "TaxBreakdown",
                                        "AirportCode": "DEN",
                                        "Amount": 4.50
                                    }
                                ]
                            }
                        ],
                        "Tax": [
                            {
                                "currencyCode": "AUD",
                                "taxCode": "AY",
                                "decimalPlace": 2,
                                "value": 8.70
                            },
                            {
                                "currencyCode": "AUD",
                                "taxCode": "US",
                                "decimalPlace": 2,
                                "value": 35.60
                            },
                            {
                                "currencyCode": "AUD",
                                "taxCode": "YR",
                                "decimalPlace": 2,
                                "value": 279.30
                            },
                            {
                                "currencyCode": "AUD",
                                "taxCode": "XF",
                                "decimalPlace": 2,
                                "value": 7.00
                            }
                        ]
                    },
                    "Total": 773.60,
                    "Commission": {
                        "@type": "CommissionPercent",
                        "Percent": 0.05
                    },
                    "FiledAmount": {
                        "currencyCode": "USD",
                        "decimalPlace": 2,
                        "value": 285.00
                    }
                },
                "PassengerTypeCode": "ADT",
                "ValidatingCarrier": "001",
                "PricingType": "Auto Priced",
                "Restrictions": [
                    "[NONREF/RESTRICTIONS APPLY]"
                ],
                "AgencyInfo": {
                    "ticketedDate": "2025-07-15",
                    "name": "GALILEO SOUTHERN    CROSS",
                    "ticketingPCC": "XB7",
                    "code": "02345243",
                    "ticketingCountry": "AU",
                    "ticketingCity": "SYD"
                }
            },
            {
                "@type": "TicketSummary",
                "numberOfTicketsIssued": 1,
                "Identifier": {
                    "value": "0019905359182"
                },
                "PersonName": {
                    "@type": "PersonName",
                    "Given": "NAVNEET KUMAR MR",
                    "Surname": "SHARMA ADT"
                },
                "ReservationLocator": {
                    "supplierCode": "1G",
                    "value": "CMT80R"
                },
                "FormOfPayment": [
                    {
                        "value": "Cash"
                    }
                ],
                "TicketSegment": [
                    {
                        "@type": "TicketSegment",
                        "sequence": 1,
                        "ClassOfService": "S",
                        "FareBasisCode": "SLN0D4M5",
                        "Status": "OpenForUse",
                        "Carrier": "AA",
                        "Number": "6969",
                        "Departure": {
                            "@type": "Departure",
                            "location": "DEN",
                            "date": "2025-08-15",
                            "time": "18:35:00"
                        },
                        "Arrival": {
                            "@type": "Arrival",
                            "location": "LHR"
                        },
                        "FlightStatusCode": "OK",
                        "TicketBaggage": {
                            "@type": "TicketBaggage",
                            "quantity": 1,
                            "soldByPieceInd": true
                        }
                    }
                ],
                "TicketPrice": {
                    "@type": "TicketPrice",
                    "fareCalculation": "G",
                    "fareBreakdown": "DEN AA LON 285.00 NUC285.00END ROE1.0",
                    "CurrencyCode": {
                        "decimalPlace": 2,
                        "value": "AUD"
                    },
                    "Base": 443.00,
                    "Taxes": {
                        "@type": "TaxesDetail",
                        "TaxInfo": [
                            {
                                "@type": "TaxInfo",
                                "TaxCode": "XF",
                                "Amount": 4.50,
                                "TaxBreakdown": [
                                    {
                                        "@type": "TaxBreakdown",
                                        "AirportCode": "DEN",
                                        "Amount": 4.50
                                    }
                       
…
```

