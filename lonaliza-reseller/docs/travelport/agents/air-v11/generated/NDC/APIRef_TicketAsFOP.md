# Ticket as FOP API&#160;Reference

## Source

- **Local HTML:** `docs/travelport/travelport api guide/travelport-airapi json/support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/NDC/APIRef_TicketAsFOP.html` (UTF-8 mirror)
- **Official base:** `https://support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/` + same relative path

## Plaintext extract (lossy)

Ticket as FOP API&#160;Reference Skip To Main Content Account Settings Logout placeholder Account Settings Logout Filter: All Files Submit Search Filter: All Files Submit Search Ticket as FOP API&#160;Reference Request Response Example request Example response Get book/airoffer/reservationworkbench/ {LocatorCode} /offers/buildfromoffer For {LocatorCode} &#160;send the locator code returned at booking commit or in Reservation Retrieve in Receipt/Confirmation/Locator/value. Send the locator code of the held booking to ticket, not the locator code of the unused ticket. Base path: Pre-production https://api.pp.travelport.net/11/air/ Production https://api.travelport.net/11/air/ Related Content: Booking Guide , Ticketing Guide NDC only; not supported for GDS. For supporting NDC carriers only, the JSON &#160;APIs support using the value on an unused ticket as form of payment (FOP) when ticketing a separate, held booking. For carrier support, see the section Deferred Payment in NDC capabilities by airline through JSON API in the Travelport Knowledge Base. Ticket as FOP&#160;Workflow The following must be in place to use a ticket as FOP:&#160; The passenger has a held booking made with the JSON APIs that is separate from the ticketed itinerary. The passenger has a separate, ticketed itinerary that is either fully unflown or partially flown with no active itineraries and that has not been voided, refunded, or exchanged. Supported Options When applying an unused ticket as FOP: Only one ticket per passenger can be exchanged. Tickets are non-transferable; the name on the ticket must match the name on the held booking. If a held booking has multiple passengers, a ticket must be submitted for every passenger on that held booking. When using multiple tickets as FOP, each ticket must have the same itinerary and coupon status. Tickets cannot have segments with an active itinerary. Workflow Use the following workflow to apply an unused ticket to a held booking: Create post-commit workbench . Send the OfferQueryBuildFromOffer request payload below to the endpoint above. The response returns the value of the ticket that can be applied to any new booking. Form of Payment and Payment may be required in this workbench, depending on the price of the held booking compared to the available ticket value. If the total price of the held booking: exceeds or is the exact same as the value of the unused ticket, before commit, you must send Form of Payment and Payment for either the balance due or in the amount of zero for an even exchange. is less than the value of the unused ticket, at commit, the residual balance on the ticket is issued as a refund in the form of an EMD&#160;coupon. Do not send FOP or Payment. Commit the workbench to issue the new ticket. If payment was made for balance due, the commit issues an EMD for that payment. If a balance remains from the unused ticket, the passive PNR is updated with DI lines referencing the EMD and the amount on it. Request As part of the request requirements, also see Authentication and Common Air API Headers . Query Parameters None. Request Body Show Request Body Table Object Description Required/Optional OfferQueryBuildFromOffer Top level object. Send with @type OfferQueryBuildFromOffer. Includes BuildFromOffer and PaymentCriteria objects. Required BuildFromOffer Top level object. Send with @type BuildFromOffer. Includes OfferIdentifier object. Required OfferIdentifier Top level object for offer identifier details. Includes Identifier object. Required Identifier Identifier values for the ticketed offer. These values are returned in the Post-Commit Workbench response in ReservationResponse/Reservation/Offer/Identifier. Key value pairs: authority : Source of information. value : Unique system-generated identifier. Required PaymentCriteria Send with @type PaymentCriteria. Includes DocumentNumber object. Required DocumentNumber Key value pairs: value : Send the ticket number of the unused ticket to apply as payment. Required Response Pending. Example Request For additional examples, download the developer toolkits and see Using Postman and Developer Toolkits . The example Ticket as FOP request below sends the ticket number for the unused ticket in DocumentNumber. Show Example Request { "OfferQueryBuildFromOffer": { "@type": "OfferQueryBuildFromOffer", "BuildFromOffer": { "@type": "BuildFromOfferAir", "OfferIdentifier": { "Identifier": { "authority": "AA", "value": "QUEwMDFISExaVVRBNHxQb0lQM0ZGMjY5MDYtNEEzQS00RDA5LUIyQkMtMS0x" } }, "PaymentCriteria": { "@type": "PaymentCriteria", "DocumentNumber": [ { "value": "00157438083095" } ] } } } } Example Response For additional examples, download the developer toolkits and see Using Postman and Developer Toolkits . Show Example Commit Response excerpt when additional payment made "Document": [ { "@type": "DocumentTicket", "Number": "00157438169405", "TravelerIdentifierRef": { "value": "trav_1" }, "Amount": { "@type": "Amount", "CurrencyCode": { "decimalPlace": 2, "value": "AUD" }, "Total": 19.3 } }, { "@type": "DocumentEMD", "Number": "00118174128612", "TravelerIdentifierRef": { "value": "trav_1" }, "Amount": { "@type": "Amount", "CurrencyCode": { "decimalPlace": 2, "value": "AUD" }, "Total": 0.2 }, "EMDDescription": { "value": "RESIDUAL VALUE" } } In the following example excerpt from the commit response, the value of the unused ticket exceeded the cost of the held booking. In this case, an instance of Document with @type DocumentTicket returns the ticket number and an amount of 0, while the instance of Document with @type DocumentEMD&#160;has a positive amount of 118.2, indicating that a residual value of 118.2 remained on the ticket and has been issued as an EMD. Show Example Commit Response excerpt for refund "Document": [ { "@type": "DocumentTicket", "Number": "00157438083143", "TravelerIdentifierRef": { "value": "trav_1" }, "Amount": { "@type": "Amount", "CurrencyCode": { "decimalPlace": 2, "value": "AUD" }, "Total": 0 } }, { "@type": "DocumentEMD", "Number": "00118174128531", "TravelerIdentifierRef": { "value": "trav_1" }, "Amount": { "@type": "Amount", "CurrencyCode": { "decimalPlace": 2, "value": "AUD" }, "Total": 118.2 }, "EMDDescription": { "value": "RESIDUAL VALUE" } }

## Literal `<pre>` excerpts from HTML

### Block 1

```
{
 "OfferQueryBuildFromOffer": {
  "@type": "OfferQueryBuildFromOffer",
  "BuildFromOffer": {
   "@type": "BuildFromOfferAir",
   "OfferIdentifier": {
    "Identifier": {
     "authority": "AA",
     "value": "QUEwMDFISExaVVRBNHxQb0lQM0ZGMjY5MDYtNEEzQS00RDA5LUIyQkMtMS0x"
    }
   },
   "PaymentCriteria": {
    "@type": "PaymentCriteria",
    "DocumentNumber": [
     {
      "value": "00157438083095"
     }
    ]
   }
  }
 }
}
```

### Block 2

```
"Document": [
{
"@type": "DocumentTicket",
"Number": "00157438169405",
"TravelerIdentifierRef": {
"value": "trav_1"
},
"Amount": {
"@type": "Amount",
"CurrencyCode": {
"decimalPlace": 2,
"value": "AUD"
},
"Total": 19.3
}
},
{
"@type": "DocumentEMD",
"Number": "00118174128612",
"TravelerIdentifierRef": {
"value": "trav_1"
},
"Amount": {
"@type": "Amount",
"CurrencyCode": {
"decimalPlace": 2,
"value": "AUD"
},
"Total": 0.2
},
"EMDDescription": {
"value": "RESIDUAL VALUE"
}
}
```

### Block 3

```
"Document": [
{
"@type": "DocumentTicket",
"Number": "00157438083143",
"TravelerIdentifierRef": {
"value": "trav_1"
},
"Amount": {
"@type": "Amount",
"CurrencyCode": {
"decimalPlace": 2,
"value": "AUD"
},
"Total": 0
}
},
{
"@type": "DocumentEMD",
"Number": "00118174128531",
"TravelerIdentifierRef": {
"value": "trav_1"
},
"Amount": {
"@type": "Amount",
"CurrencyCode": {
"decimalPlace": 2,
"value": "AUD"
},
"Total": 118.2
},
"EMDDescription": {
"value": "RESIDUAL VALUE"
}
}
```

