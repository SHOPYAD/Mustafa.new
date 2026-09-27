# Document History API&#160;Reference

## Source

- **Local HTML:** `docs/travelport/travelport api guide/travelport-airapi json/support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/Book/APIRef_DocumentHistory.html` (UTF-8 mirror)
- **Official base:** `https://support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/` + same relative path

## Plaintext extract (lossy)

Document History API&#160;Reference Skip To Main Content Account Settings Logout placeholder Account Settings Logout Filter: All Files Submit Search Filter: All Files Submit Search Document History API&#160;Reference Request Response Example request Example response POST documents/history Base path: The base path for this API varies from that for other JSON &#160; Air APIs and does not include air at the end. Pre-production https://api.pp.travelport.net/11/ Production https://api.travelport.net/11/ Related Content: Air Booking Guide Document History retrieves the history of all documents associated with a record locator code. This request can retrieve this information even after the booking and tickets are purged from the airline's database. You can request documents by any of the following: Record locator: Returns all documents associated with that locator Document type:&#160;Returns all documents of the specified type/s Document number:&#160;Returns history of the specified document/s only The response can return the following types of documents as applicable and as requested: Tickets, including issuance, exchange, void, and refund transactions MCOs Miscellaneous change order (MCO); can be created when an exchanged ticket has residual value after the exchange. EMDs Invoices The JSON Air APIs provide the following APIs to retrieve bookings and tickets: To retrieve all booking details, use Reservation Retrieve . Returns all booking, payment, and ticketing information currently on a booking, To retrieve a list of all ticket numbers on a booking, use Ticket List . To retrieve details for all tickets associated with a booking (GDS&#160;only), or for a single ticket for NDC, use Ticket Retrieve . To return a list of documents on a booking, such as tickets, invoices, MCOs, and EMDs, use Document List . To return histories of up to six documents on a booking, such as tickets, invoices, MCOs, and EMDs, use Document History . Request As part of the request requirements, also see Authentication and Common Air API Headers . Query Parameters None. Request Body Show Request Body Table for Document List Object Description Required/Optional locator String. Supports sending one record locator code. If documentNumbers is not also sent, the response returns all documents associated with the locator code. Required documentNumbers Array, up to six. Document number and type details. In each instance, you can send either number (to return the history of a specific document) or documentType (to return all documents of that type). Key value pairs: number : String. The document number. documentType : Enum for the requested document type . Supported values and meanings are: TKT:&#160;Ticket MCO:&#160;Miscellaneous change order EMD:&#160;Electronic miscellaneous document INV:&#160;Invoice Optional Response The objects returned in documentHistories vary according to the type of document returned. See the developer toolkits for the Swagger files for full specifications. Show Response Body Table Object Description DocumentHistoryResponse Wrapper object for response. documentHistories Array. One instance returned for each unique document. Specific objects returned vary according to the type of document. number Document number and type. Key value pairs: number : String. The document number. documentType : String. The document type. Possible values returned are: TKT:&#160;Ticket MCO:&#160;Miscellaneous change order EMD:&#160;Electronic miscellaneous document TASF:&#160;Service fee INV:&#160;Invoice issueDateTimeUTC String. Transaction date and time stamp of document issuance in UTC. issuingGTID String. The issuing terminal ID. issuingAgent String. The initials of the agent issuing the document. issuingPseudoCityCode String. PCC issuing the document. issuingIATA String. Issuing IATA number. countryCode String. ISO country code where document was issued. travelportLocator Travelport-issued locator or cancellation code for the document. Key value pairs: value : String. The locator code. locatorType : The type of reservation. source : The system that generated the reservation. supplierLocator The external or supplier-issued locator or cancellation code for the document. Key value pairs: value : String. The locator code. source : The system that generated the reservation. name String. Traveler name the document was issued for. pricingDateTimeUTC String. Pricing date and time stamp in UTC. pricingPseudoCityCode String. PCC pricing the document. agentEnteredDetails Any agent-entered details submitted at pricing or ticketing. May include the following: ticketModifierString : String. Modifiers applied at ticketing. fareQuoteModifierString : String. Modifiers applied at pricing. formOfPayment Form of payment applied to this document. Key value pairs: formOfPaymentType : String. Type of FOP. amount : Number. Amount of payment for this FOP. ticketSegments Flight details. For each flight segment (returned as sequence ), returns the standard objects ClassOfService, Departure, Arrival, etc. See Offer/Product/FlightSegment in the Reservation Retrieve API&#160;Reference for details. documentDetail Pricing for this document. Objects returned vary by document type. mcoDetail MCO detail information. May include the following: issuedFor : String. The reason the MCO was issued, such as residual value. reasonForIssuanceCode : String. Code for the reason the MCO was issued. issuedAt : String. MCO issuance IATA location code. relatedDocument Any documents related to this document, such as a ticket or invoice. Key value pairs: number : String. The ticket or invoice number. documentType : String. The document type. associatedDocument Any documents associated with this document, such as an EMD&#160;or MCO. Key value pairs: number : String. The EMD&#160;or MCO number. documentType : String. The document type. exchanges For exchanged tickets, pricing for the exchange, including original and previous issue details, new pricing for the exchange. Specific objects returned vary by exchange details. Example Request For additional examples, download the developer toolkits and see Using Postman and Developer Toolkits . The request payload requires the locator code. Sending one ore more document numbers associated with that locator code is optional. Show Example Request by locator code { "locator": "BXVCNS" } Show Example Request by locator code and document number { "locator": "BXVCNS", "documentNumbers": [ { "number": "7959905312629", "documentType": "TKT" } ] } Example Response For additional examples, download the developer toolkits and see Using Postman and Developer Toolkits . In response to a request that sends a record locator and a specific ticket number, the following response returns one instance of documentHistories, for the requested document. Show Example Document History response to request with record locator and document number { "DocumentHistoryResponse": { "@type": "DocumentHistoryResponse", "documentHistories": [ { "number": { "number": "7959905312629", "numberOfConjunctiveTickets": 0, "documentType": "TKT" }, "issueDateTimeUTC": "2025-06-19T20:39:00.000Z", "issuingGTID": "4A21FB", "issuingAgent": "IF", "issuingPseudoCityCode": "XB7", "issuingIATA": "96120603", "countryCode": "AU", "travelportLocator": { "value": "BXVCNS", "locatorType": "GDS", "source": "1G" }, "supplierLocator": { "value": "JWGLFY", "source": "GDS" }, "name": "GATER/ALLIE", "pricingDateTimeUTC": "2025-06-19", "pricingPseudoCityCode": "XB7", "platingAirline": "VA", "agentEnteredDetails": { "ticketModifierString": [ "P01/S1.2/FEX7959905312628/CVA/1" ] }, "formOfPayment": [ { "formOfPaymentType": "CA", "amount": 144.99 } ], "ticketSegments": [ { "sequence": 1, "ClassOfService": "M", "FareBasisCode": "NZLT0", "Status": "OpenForUse", "Carrier": "VA", "Number": "0951", "Departure": { "@type": "Departure", "location": "SYD", "date": "2025-07-05", "time": "15:00:00" }, "Arrival": { "@type": "Arrival", "location": "BNE" }, "FlightStatusCode": "HK", "ValidDateRange": { "start": "2025-07-05", "end": "2025-07-05" }, "TicketBaggage": { "quantity": 0, "soldByPieceInd": true }, "connectionInd": false }, { "sequence": 2, "ClassOfService": "M", "FareBasisCode": "UZLT0", "Status": "OpenForUse", "Carrier": "VA", "Number": "0912", "Departure": { "@type": "Departure", "location": "BNE", "date": "2025-07-23", "time": "06:35:00" }, "Arrival": { "@type": "Arrival", "location": "SYD" }, "FlightStatusCode": "HK", "ValidDateRange": { "start": "2025-07-23", "end": "2025-07-23" }, "TicketBaggage": { "quantity": 0, "soldByPieceInd": true }, "connectionInd": false } ], "documentDetail": { "documentPricingDetail": { "base": { "value": 239.13, "code": "AUD", "minorUnit": 2 }, "totalDocumentPrice": { "value": 342.31, "code": "AUD", "minorUnit": 2 }, "taxes": { "@type": "TaxesDetail", "TotalTaxes": 103.18, "Tax": [ { "value": 4.18, "taxCode": "UO" }, { "value": 90, "taxCode": "YR" }, { "value": 9, "taxCode": "UO" } ] }, "fareCalculation": { "fareCalculationString": "SYD VA BNE160.47VA SYD78.66AUD239.13END" }, "commissionPercent": 0, "restrictions": [ "* NONREF 239.13 AUD///PENALTIES APPLY/RESTRICTIONS APPLY/N" ] } }, "exchanges": { "newPricingDetail": { "base": { "value": 239.13, "code": "AUD", "minorUnit": 2 }, "totalDocumentPrice": { "value": 432.99, "code": "AUD", "minorUnit": 2 }, "totalFees": { "value": 90, "code": "AUD", "minorUnit": 2 }, "totalAdditionalCollection": { "value": 144.99 }, "taxes": { "@type": "TaxesDetail", "Tax": [ { "value": 50.14, "taxCode": "QR" }, { "value": 30.36, "taxCode": "UO" }, { "value": 14.36, "taxCode": "WG" } ] }, "paidTaxes": { "@type": "TaxesDetail", "Tax": [ { "value": 50.14, "taxCode": "QR" }, { "value": 26.18, "taxCode": "UO" }, { "value": 14.36, "taxCode": "WG" } ] }, "feeBreakdown": [ { "atType": "Fee", "@type": "Fee", "description": "Change Fee", "FeeAmountOrPercent": { "@type": "FeeAmountOrPercentAmount", "Amount": { "value": 90, "code": "AUD", "minorUnit": 2 } } } ] }, "originalIssue": { "value": "7959905312628", "issuingCity": "SYD", "issueDate": "2025-06-20", "agencyCodeIATA": "9612060", "documentType": "TKT" }, "previousIssue": [ { "value": "7959905312628", "documentType": "TKT" } ] } } ] } } In response to a request that sends only a record locator, the following response returns tickets and an invoice associated with that locator. Show Example Document History response to request with only record locator { "DocumentHistoryResponse": { "@type": "DocumentHistoryResponse", "documentHistories": [ { "number": { "number": "7959905312628", "numberOfConjunctiveTickets": 0, "documentType": "TKT" }, "issueDateTimeUTC": "2025-06-19T20:34:00.000Z", "issuingGTID": "DFD708", "issuingAgent": "27", "issuingPseudoCityCode": "XB7", "issuingIATA": "96120603", "countryCode": "AU", "travelportLocator": { "value": "BXVCNS", "locatorType": "GDS", "source": "1G" }, "supplierLocator": { "value": "JWGLFY", "source": "GDS" }, "name": "GATER/ALLIE", "pricingDateTimeUTC": "2025-06-19", "pricingPseudoCityCode": "XB7", "platingAirline": "VA", "agentEnteredDetails": { "fareQuoteModifierString": [ "/BFMU" ], "ticketModifierString": [ "S1.2/ET/FS/CVA" ] }, "formOfPayment": [ { "formOfPaymentType": "CA", "amount": 288 } ], "ticketSegments": [ { "sequence": 1, "ClassOfService": "M", "FareBasisCode": "TZLT0", "Status": "Exchanged", "Carrier": "VA", "Number": "0901", "Departure": { "@type": "Departure", "location": "SYD", "date": "2025-07-01", "time": "06:00:00" }, "Arrival": { "@type": "Arrival", "location": "BNE" }, "FlightStatusCode": "HK", "ValidDateRange": { "start": "2025-07-01", "end": "2025-07-01" }, "TicketBaggage": { "quantity": 0, "soldByPieceInd": true }, "connectionInd": false }, { "sequence": 2, "ClassOfService": "M", "FareBasisCode": "UZLT0", "Status": "Exchanged", "Carrier": "VA", "Number": "0912", "Departure": { "@type": "Departure", "location": "BNE", "date": "2025-07-23", "time": "06:35:00" }, "Arrival": { "@type": "Arrival", "location": "SYD" }, "FlightStatusCode": "HK", "ValidDateRange": { "start": "2025-07-23", "end": "2025-07-23" }, "TicketBaggage": { "quantity": 0, "soldByPieceInd": true }, "connectionInd": false } ], "documentDetail": { "documentPricingDetail": { "base": { "value": 197.32, "code": "AUD", "minorUnit": 2 }, "totalDocumentPrice": { "value": 288, "code": "AUD", "minorUnit": 2 }, "taxes": { "@type": "TaxesDetail", "TotalTaxes": 90.68, "Tax": [ { "value": 50.14, "taxCode": "QR" }, { "value": 14.36, "taxCode": "WG" }, { "value": 26.18, "taxCode": "UO" } ] }, "fareCalculation": { "fareCalculationString": "SYD VA BNE 118.66 VA SYD 78.66 AUD197.32END" }, "commissionPercent": 0, "restrictions": [ "RESTRICTIONS APPLY/NONEND", "NONREF/", "PENALTIES APPLY" ] } } }, { "number": { "number": "7959905312629", "numberOfConjunctiveTickets": 0, "documentType": "TKT" }, "issueDateTimeUTC": "2025-06-19T20:39:00.000Z", "issuingGTID": "4A21FB", "issuingAgent": "IF", "issuingPseudoCityCode": "XB7", "issuingIATA": "96120603", "countryCode": "AU", "travelportLocator": { "value": "BXVCNS", "locatorType": "GDS", "source": "1G" }, "supplierLocator": { "value": "JWGLFY", "source": "GDS" }, "name": "GATER/ALLIE", "pricingDateTimeUTC": "2025-06-19", "pricingPseudoCityCode": "XB7", "platingAirline": "VA", "agentEnteredDetails": { "ticketModifierString": [ "P01/S1.2/FEX7959905312628/CVA/1" ] }, "formOfPayment": [ { "formOfPaymentType": "CA", "amount": 144.99 } ], "ticketSegments": [ { "sequence": 1, "ClassOfService": "M", "FareBasisCode": "NZLT0", "Status": "OpenForUse", "Carrier": "VA", "Number": "0951", "Departure": { "@type": "Departure", "location": "SYD", "date": "2025-07-05", "time": "15:00:00" }, "Arrival": { "@type": "Arrival", "location": "BNE" }, "FlightStatusCode": "HK", "ValidDateRange": { "start": "2025-07-05", "end": "2025-07-05" }, "TicketBaggage": { "quantity": 0, "soldByPieceInd": true }, "connectionInd": false }, { "sequence": 2, "ClassOfService": "M", "FareBasisCode": "UZLT0", "Status": "OpenForUse", "Carrier": "VA", "Number": "0912", "Departure": { "@type": "Departure", "location": "BNE", "date": "2025-07-23", "time": "06:35:00" }, "Arrival": { "@type": "Arrival", "location": "SYD" }, "FlightStatusCode": "HK", "ValidDateRange": { "start": "2025-07-23", "end": "2025-07-23" }, "TicketBaggage": { "quantity": 0, "soldByPieceInd": true }, "connectionInd": false } ], "documentDetail": { "documentPricingDetail": { "base": { "value": 239.13, "code": "AUD", "minorUnit": 2 }, "totalDocumentPrice": { "value": 342.31, "code": "AUD", "minorUnit": 2 }, "taxes": { "@type": "TaxesDetail", "TotalTaxes": 103.18, "Tax": [ { "value": 4.18, "taxCode": "UO" }, { "value": 90, "taxCode": "YR" }, { "value": 9, "taxCode": "UO" } ] }, "fareCalculation": { "fareCalculationString": "SYD VA BNE160.47VA SYD78.66AUD239.13END" }, "commissionPercent": 0, "restrictions": [ "* NONREF 239.13 AUD///PENALTIES APPLY/RESTRICTIONS APPLY/N" ] } }, "exchanges": { "newPricingDetail": { "base": { "value": 239.13, "code": "AUD", "minorUnit": 2 }, "totalDocumentPrice": { "value": 432.99, "code": "AUD", "minorUnit": 2 }, "totalFees": { "value": 90, "code": "AUD", "minorUnit": 2 }, "totalAdditionalCollection": { "value": 144.99 }, "taxes": { "@type": "TaxesDetail", "Tax": [ { "value": 50.14, "taxCode": "QR" }, { "value": 30.36, "taxCode": "UO" }, { "value": 14.36, "taxCode": "WG" } ] }, "paidTaxes": { "@type": "TaxesDetail", "Tax": [ { "value": 50.14, "taxCode": "QR" }, { "value": 26.18, "taxCode": "UO" }, { "value": 14.36, "taxCode": "WG" } ] }, "feeBreakdown": [ { "atType": "Fee", "@type": "Fee", "description": "Change Fee", "FeeAmountOrPercent": { "@type": "FeeAmountOrPercentAmount", "Amount": { "value": 90, "code": "AUD", "minorUnit": 2 } } } ] }, "originalIssue": { "value": "7959905312628", "issuingCity": "SYD", "issueDate": "2025-06-20", "agencyCodeIATA": "9612060", "documentType": "TKT" }, "previousIssue": [ { "value": "7959905312628", "documentType": "TKT" } ] } }, { "number": { "number": "122484", "documentType": "INV" }, "issueDateTimeUTC": "2025-06-19T20:39:00.000Z", "issuingGTID": "4A21FB", "issuingAgent": "IF", "issuingPseudoCityCode": "XB7", "issuingIATA": "96120603", "countryCode": "AU", "travelportLocator": { "value": "BXVCNS", "locatorType": "GDS", "source": "1G" }, "supplierLocator": { "value": "JWGLFY", "source": "GDS" }, "name": "GATER/ALLIE", "pricingDateTimeUTC": "2025-06-19", "pricingPseudoCityCode": "XB7", "agentEnteredDetails": { "ticketModifierString": [ "P01/S1.2/FEX7959905312628/CVA/1" ] }, "formOfPayment": [ { "formOfPaymentType": "CA", "amount": 144.99 } ], "ticketSegments": [ { "sequence": 1, "ClassOfService": "M", "FareBasisCode": "NZLT0", "Status": "OpenForUse", "Carrier": "VA", "Number": "0951", "Departure": { "@type": "Departure", "location": "SYD", "date": "2025-07-05", "time": "15:00:00" }, "Arrival": { "@type": "Arrival", "location": "BNE" }, "FlightStatusCode": "HK", "ValidDateRange": { "start": "2025-07-05", "end": "2025-07-05" }, "TicketBaggage": { "quantity": 0, "soldByPieceInd": true }, "connectionInd": false }, { "sequence": 2, "ClassOfService": "M", "FareBasisCode": "UZLT0", "Status": "OpenForUse", "Carrier": "VA", "Number": "0912", "Departure": { "@type": "Departure", "location": "BNE", "date": "2025-07-23", "time": "06:35:00" }, "Arrival": { "@type": "Arrival", "location": "SYD" }, "FlightStatusCode": "HK", "ValidDateRange": { "start": "2025-07-23", "end": "2025-07-23" }, "TicketBaggage": { "quantity": 0, "soldByPieceInd": true }, "connectionInd": false } ], "documentDetail": { "documentPricingDetail": { "base": { "value": 239.13, "code": "AUD", "minorUnit": 2 }, "totalDocumentPrice": { "value": 342.31, "code": "AUD", "minorUnit": 2 }, "taxes": { "@type": "TaxesDetail", "TotalTaxes": 103.18, "Tax": [ { "value": 4.18, "taxCode": "UO" }, { "value": 90, "taxCode": "YR" }, { "value": 9, "taxCode": "UO" } ] }, "fareCalculation": { "fareCalculationString": "SYD VA BNE160.47VA SYD78.66AUD239.13END" }, "commissionPercent": 0, "restrictions": [ "* NONREF 239.13 AUD///PENALTIES APPLY/RESTRICTIONS APPLY/N" ] } }, "relatedDocument": { "number": "7959905312629", "documentType": "TKT" }, "exchanges": { "newPricingDetail": { "base": { "value": 239.13, "code": "AUD", "minorUnit": 2 }, "totalDocumentPrice": { "value": 432.99, "code": "AUD", "minorUnit": 2 }, "totalFees": { "value": 90, "code": "AUD", "minorUnit": 2 }, "totalAdditionalCollection": { "value": 144.99 }, "taxes": { "@type": "TaxesDetail", "Tax": [ { "value": 50.14, "taxCode": "QR" }, { "value": 30.36, "taxCode": "UO" }, { "value": 14.36, "taxCode": "WG" } ] }, "paidTaxes": { "@type": "TaxesDetail", "Tax": [ { "value": 50.14, "taxCode": "QR" }, { "value": 26.18, "taxCode": "UO" }, { "value": 14.36, "taxCode": "WG" } ] }, "feeBreakdown": [ { "atType": "Fee", "@type": "Fee", "description": "Change Fee", "FeeAmountOrPercent": { "@type": "FeeAmountOrPercentAmount", "Amount": { "value": 90, "code": "AUD", "minorUnit": 2 } } } ] }, "originalIssue": { "value": "7959905312628", "issuingCity": "SYD", "issueDate": "2025-06-20", "agencyCodeIATA": "9612060", "documentType": "TKT" }, "previousIssue": [ { "value": "7959905312628", "documentType": "TKT" } ] } } ] } }

## Literal `<pre>` excerpts from HTML

### Block 1

```
{
    "locator": "BXVCNS"
            }
```

### Block 2

```
{
    "locator": "BXVCNS",
    "documentNumbers": [
        {
            "number": "7959905312629",
            "documentType": "TKT"
        }
    ]
}
```

### Block 3

```
{
 "DocumentHistoryResponse": {
  "@type": "DocumentHistoryResponse",
  "documentHistories": [
   {
    "number": {
     "number": "7959905312629",
     "numberOfConjunctiveTickets": 0,
     "documentType": "TKT"
    },
    "issueDateTimeUTC": "2025-06-19T20:39:00.000Z",
    "issuingGTID": "4A21FB",
    "issuingAgent": "IF",
    "issuingPseudoCityCode": "XB7",
    "issuingIATA": "96120603",
    "countryCode": "AU",
    "travelportLocator": {
     "value": "BXVCNS",
     "locatorType": "GDS",
     "source": "1G"
    },
    "supplierLocator": {
     "value": "JWGLFY",
     "source": "GDS"
    },
    "name": "GATER/ALLIE",
    "pricingDateTimeUTC": "2025-06-19",
    "pricingPseudoCityCode": "XB7",
    "platingAirline": "VA",
    "agentEnteredDetails": {
     "ticketModifierString": [
      "P01/S1.2/FEX7959905312628/CVA/1"
     ]
    },
    "formOfPayment": [
     {
      "formOfPaymentType": "CA",
      "amount": 144.99
     }
    ],
    "ticketSegments": [
     {
      "sequence": 1,
      "ClassOfService": "M",
      "FareBasisCode": "NZLT0",
      "Status": "OpenForUse",
      "Carrier": "VA",
      "Number": "0951",
      "Departure": {
       "@type": "Departure",
       "location": "SYD",
       "date": "2025-07-05",
       "time": "15:00:00"
      },
      "Arrival": {
       "@type": "Arrival",
       "location": "BNE"
      },
      "FlightStatusCode": "HK",
      "ValidDateRange": {
       "start": "2025-07-05",
       "end": "2025-07-05"
      },
      "TicketBaggage": {
       "quantity": 0,
       "soldByPieceInd": true
      },
      "connectionInd": false
     },
     {
      "sequence": 2,
      "ClassOfService": "M",
      "FareBasisCode": "UZLT0",
      "Status": "OpenForUse",
      "Carrier": "VA",
      "Number": "0912",
      "Departure": {
       "@type": "Departure",
       "location": "BNE",
       "date": "2025-07-23",
       "time": "06:35:00"
      },
      "Arrival": {
       "@type": "Arrival",
       "location": "SYD"
      },
      "FlightStatusCode": "HK",
      "ValidDateRange": {
       "start": "2025-07-23",
       "end": "2025-07-23"
      },
      "TicketBaggage": {
       "quantity": 0,
       "soldByPieceInd": true
      },
      "connectionInd": false
     }
    ],
    "documentDetail": {
     "documentPricingDetail": {
      "base": {
       "value": 239.13,
       "code": "AUD",
       "minorUnit": 2
      },
      "totalDocumentPrice": {
       "value": 342.31,
       "code": "AUD",
       "minorUnit": 2
      },
      "taxes": {
       "@type": "TaxesDetail",
       "TotalTaxes": 103.18,
       "Tax": [
        {
         "value": 4.18,
         "taxCode": "UO"
        },
        {
         "value": 90,
         "taxCode": "YR"
        },
        {
         "value": 9,
         "taxCode": "UO"
        }
       ]
      },
      "fareCalculation": {
       "fareCalculationString": "SYD VA BNE160.47VA SYD78.66AUD239.13END"
      },
      "commissionPercent": 0,
      "restrictions": [
       "* NONREF 239.13 AUD///PENALTIES APPLY/RESTRICTIONS APPLY/N"
      ]
     }
    },
    "exchanges": {
     "newPricingDetail": {
      "base": {
       "value": 239.13,
       "code": "AUD",
       "minorUnit": 2
      },
      "totalDocumentPrice": {
       "value": 432.99,
       "code": "AUD",
       "minorUnit": 2
      },
      "totalFees": {
       "value": 90,
       "code": "AUD",
       "minorUnit": 2
      },
      "totalAdditionalCollection": {
       "value": 144.99
      },
      "taxes": {
       "@type": "TaxesDetail",
       "Tax": [
        {
         "value": 50.14,
         "taxCode": "QR"
        },
        {
         "value": 30.36,
         "taxCode": "UO"
        },
        {
         "value": 14.36,
         "taxCode": "WG"
        }
       ]
      },
      "paidTaxes": {
       "@type": "TaxesDetail",
       "Tax": [
        {
         "value": 50.14,
         "taxCode": "QR"
        },
        {
         "value": 26.18,
         "taxCode": "UO"
        },
        {
         "value": 14.36,
         "taxCode": "WG"
        }
       ]
      },
      "feeBreakdown": [
       {
        "atType": "Fee",
        "@type": "Fee",
        "description": "Change Fee",
        "FeeAmountOrPercent": {
         "@type": "FeeAmountOrPercentAmount",
         "Amount": {
          "value": 90,
          "code": "AUD",
          "minorUnit": 2
         }
        }
       }
      ]
     },
     "originalIssue": {
      "value": "7959905312628",
      "issuingCity": "SYD",
      "issueDate": "2025-06-20",
      "agencyCodeIATA": "9612060",
      "documentType": "TKT"
     },
     "previousIssue": [
      {
       "value": "7959905312628",
       "documentType": "TKT"
      }
     ]
    }
   }
  ]
 }
}
```

### Block 4

```
{
 "DocumentHistoryResponse": {
  "@type": "DocumentHistoryResponse",
  "documentHistories": [
   {
    "number": {
     "number": "7959905312628",
     "numberOfConjunctiveTickets": 0,
     "documentType": "TKT"
    },
    "issueDateTimeUTC": "2025-06-19T20:34:00.000Z",
    "issuingGTID": "DFD708",
    "issuingAgent": "27",
    "issuingPseudoCityCode": "XB7",
    "issuingIATA": "96120603",
    "countryCode": "AU",
    "travelportLocator": {
     "value": "BXVCNS",
     "locatorType": "GDS",
     "source": "1G"
    },
    "supplierLocator": {
     "value": "JWGLFY",
     "source": "GDS"
    },
    "name": "GATER/ALLIE",
    "pricingDateTimeUTC": "2025-06-19",
    "pricingPseudoCityCode": "XB7",
    "platingAirline": "VA",
    "agentEnteredDetails": {
     "fareQuoteModifierString": [
      "/BFMU"
     ],
     "ticketModifierString": [
      "S1.2/ET/FS/CVA"
     ]
    },
    "formOfPayment": [
     {
      "formOfPaymentType": "CA",
      "amount": 288
     }
    ],
    "ticketSegments": [
     {
      "sequence": 1,
      "ClassOfService": "M",
      "FareBasisCode": "TZLT0",
      "Status": "Exchanged",
      "Carrier": "VA",
      "Number": "0901",
      "Departure": {
       "@type": "Departure",
       "location": "SYD",
       "date": "2025-07-01",
       "time": "06:00:00"
      },
      "Arrival": {
       "@type": "Arrival",
       "location": "BNE"
      },
      "FlightStatusCode": "HK",
      "ValidDateRange": {
       "start": "2025-07-01",
       "end": "2025-07-01"
      },
      "TicketBaggage": {
       "quantity": 0,
       "soldByPieceInd": true
      },
      "connectionInd": false
     },
     {
      "sequence": 2,
      "ClassOfService": "M",
      "FareBasisCode": "UZLT0",
      "Status": "Exchanged",
      "Carrier": "VA",
      "Number": "0912",
      "Departure": {
       "@type": "Departure",
       "location": "BNE",
       "date": "2025-07-23",
       "time": "06:35:00"
      },
      "Arrival": {
       "@type": "Arrival",
       "location": "SYD"
      },
      "FlightStatusCode": "HK",
      "ValidDateRange": {
       "start": "2025-07-23",
       "end": "2025-07-23"
      },
      "TicketBaggage": {
       "quantity": 0,
       "soldByPieceInd": true
      },
      "connectionInd": false
     }
    ],
    "documentDetail": {
     "documentPricingDetail": {
      "base": {
       "value": 197.32,
       "code": "AUD",
       "minorUnit": 2
      },
      "totalDocumentPrice": {
       "value": 288,
       "code": "AUD",
       "minorUnit": 2
      },
      "taxes": {
       "@type": "TaxesDetail",
       "TotalTaxes": 90.68,
       "Tax": [
        {
         "value": 50.14,
         "taxCode": "QR"
        },
        {
         "value": 14.36,
         "taxCode": "WG"
        },
        {
         "value": 26.18,
         "taxCode": "UO"
        }
       ]
      },
      "fareCalculation": {
       "fareCalculationString": "SYD VA BNE 118.66 VA SYD 78.66 AUD197.32END"
      },
      "commissionPercent": 0,
      "restrictions": [
       "RESTRICTIONS APPLY/NONEND",
       "NONREF/",
       "PENALTIES APPLY"
      ]
     }
    }
   },
   {
    "number": {
     "number": "7959905312629",
     "numberOfConjunctiveTickets": 0,
     "documentType": "TKT"
    },
    "issueDateTimeUTC": "2025-06-19T20:39:00.000Z",
    "issuingGTID": "4A21FB",
    "issuingAgent": "IF",
    "issuingPseudoCityCode": "XB7",
    "issuingIATA": "96120603",
    "countryCode": "AU",
    "travelportLocator": {
     "value": "BXVCNS",
     "locatorType": "GDS",
     "source": "1G"
    },
    "supplierLocator": {
     "value": "JWGLFY",
     "source": "GDS"
    },
    "name": "GATER/ALLIE",
    "pricingDateTimeUTC": "2025-06-19",
    "pricingPseudoCityCode": "XB7",
    "platingAirline": "VA",
    "agentEnteredDetails": {
     "ticketModifierString": [
      "P01/S1.2/FEX7959905312628/CVA/1"
     ]
    },
    "formOfPayment": [
     {
      "formOfPaymentType": "CA",
      "amount": 144.99
     }
    ],
    "ticketSegments": [
     {
      "sequence": 1,
      "ClassOfService": "M",
      "FareBasisCode": "NZLT0",
      "Status": "OpenForUse",
      "Carrier": "VA",
      "Number": "0951",
      "Departure": {
       "@type": "Departure",
       "location": "SYD",
       "date": "2025-07-05",
       "time": "15:00:00"
      },
      "Arrival": {
       "@type": "Arrival",
       "location": "BNE"
      },
      "FlightStatusCode": "HK",
      "ValidDateRange": {
       "start": "2025-07-05",
       "end": "2025-07-05"
      },
      "TicketBaggage": {
       "quantity": 0,
       "soldByPieceInd": true
      },
      "connectionInd": false
     },
     {
      "sequence": 2,
      "ClassOfService": "M",
      "FareBasisCode": "UZLT0",
      "Status": "OpenForUse",
      "Carrier": "VA",
      "Number": "0912",
      "Departure": {
       "@type": "Departure",
       "location": "BNE",
       "date": "2025-07-23",
       "time": "06:35:00"
      },
      "Arrival": {
       "@type": "Arrival",
       "location": "SYD"
      },
      "FlightStatusCode": "HK",
      "ValidDateRange": {
       "start": "2025-07-23",
       "end": "2025-07-23"
      },
      "TicketBaggage": {
       "quantity": 0,
       "soldByPieceInd": true
      },
      "connectionInd": false
     }
    ],
    "documentDetail": {
     "documentPricingDetail": {
      "base": {
       "value": 239.13,
       "code": "AUD",
       "minorUnit": 2
      },
      "totalDocumentPrice": {
       "value": 342.31,
       "code": "AUD",
       "minorUnit": 2
      },
      "taxes": {
       "@type": "TaxesDetail",
       "TotalTaxes": 103.18,
       "Tax": [
        {
         "value": 4.18,
         "taxCode": "UO"
        },
        {
         "value": 90,
         "taxCode": "YR"
        },
        {
         "value": 9,
         "taxCode": "UO"
        }
       ]
      },
      "fareCalculation": {
       "fareCalculationString": "SYD VA BNE160.47VA SYD78.66AUD239.13END"
      },
      "commissionPercent": 0,
      "restrictions": [
       "* NONREF 239.13 AUD///PENALTIES APPLY/RESTRICTIONS APPLY/N"
      ]
     }
    },
    "exchanges": {
     "newPricingDetail": {
      "base": {
       "value": 239.13,
       "code": "AUD",
       "minorUnit": 2
      },
      "totalDocumentPrice": {
       "value": 432.99,
       "code": "AUD",
       "minorUnit": 2
      },
      "totalFees": {
       "value": 90,
       "code": "AUD",
       "minorUnit": 2
      },
      "totalAdditionalCollection": {
       "value": 144.99
      },
      "taxes": {
       "@type": "TaxesDetail",
       "Tax": [
        {
         "value": 50.14,
         "taxCode": "QR"
        },
        {
         "value": 30.36,
         "taxCode": "UO"
        },
        {
         "value": 14.36,
         "taxCode": "WG"
        }
       ]
      },
      "paidTaxes": {
       "@type": "TaxesDetail",
       "Tax": [
        {
         "value": 50.14,
         "taxCode": "QR"
        },
        {
         "value": 26.18,
         "taxCode": "UO"
        },
        {
         "value": 14.36,
         "taxCode": "WG"
        }
       ]
      },
      "feeBreakdown": [
       {
        "atType": "Fee",
        "@type": "Fee",
        "description": "Change Fee",
        "FeeAmountOrPercent": {
         "@type": "FeeAmountOrPercentAmount",
         "Amount": {
          "value": 90,
          "code": "AUD",
          "minorUnit": 2
         }
        }
       }
      ]
     },
     "originalIssue": {
      "value": "7959905312628",
      "issuingCity": "SYD",
      "issueDate": "2025-06-20",
      "agencyCodeIATA": "9612060",
      "documentType": "TKT"
     },
     "previousIssue": [
…
```

