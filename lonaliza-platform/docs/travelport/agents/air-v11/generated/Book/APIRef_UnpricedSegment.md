# Unpriced Segment API&#160;Reference

## Source

- **Local HTML:** `docs/travelport/travelport api guide/travelport-airapi json/support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/Book/APIRef_UnpricedSegment.html` (UTF-8 mirror)
- **Official base:** `https://support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/` + same relative path

## Plaintext extract (lossy)

Unpriced Segment API&#160;Reference Skip To Main Content Account Settings Logout placeholder Account Settings Logout Filter: All Files Submit Search Filter: All Files Submit Search Unpriced Segment API&#160;Reference Request Response Example request Example response POST book/airoffer/reservationworkbench/{workbenchID}/offers/unpricedsegments For {workbenchID} send the workbench identifier returned in ReservationResponse/Identifer/value in the workbench create response. Base path: Pre-production https://api.pp.travelport.net/11/air/ Production https://api.travelport.net/11/air/ Related Content: Booking Guide Use the Unpriced Segment API in either the booking or post-booking workflow to add an unpriced segment to the workbench. You can send the Unpriced Segment request instead of the Add Offer API in the booking workflow. Or, to add both an unpriced segment and an offer, you can send both Unpriced Segment and Add Offer. Unpriced Segment adds flight/s as unpriced segments An air segment without any associated fare or pricing, generally booked for availability versus cost. Shown in the UnpricedSegments object instead of the Offer object. GDS only; NDC does not use unpriced segments. instead of as an offer, which is by definition priced. Unpriced segments can be priced using the AutoPrice/Manual Fare API . GDS only; NDC does not support unpriced segments. Request As part of the request requirements, also see Authentication and Common Air API Headers . Query Parameters None. Request Body Show Request Body Table Object Description Required/Optional UnpricedSegments Top level object for request. Required UnpricedFlightSegment Array. One instance for each unpriced segment to add. Required sequence Sequence of the leg to add the segment for. Required passengerQuantity Number. Number of passengers on this segment. Optional classOfService String. Class of service of the segment. Optional passiveSegmentStatus String. Send when adding a passive segment with the passive segment code. Optional Flight Array. One instance for each flight in the product. Standard Flight object, including Deaprtue and Arrival. id : id for internal flight reference number, formatted as s[x} as in s1 . carrier : Airline carrier. number : Flight number. Required Departure Departure details. Key value pairs the location and date of arrival. Required Arrival Arrival details. Key value pairs are the location and date of arrival. Required Response Show Response Body Table Object Description UnpricedSegmentsResponse Top level object for response. Key value pairs: Result Messages about the operation status. Key value pairs: status:&#160;String. Status of request. Example Request For additional examples, download the developer toolkits and see Using Postman and Developer Toolkits . &#160; Show Example Request { "UnpricedSegments": { "@type": "UnpricedSegments", "UnpricedFlightSegment": [ { "@type": "UnpricedFlightSegment", "sequence": 1, "passengerQuantity": 2, "classOfService": "K", "passiveSegmentStatus": "AK", "Flight": { "@type": "Flight", "id": "1", "carrier": "QF", "number": "1251", "Departure": { "@type": "Departure", "location": "BNE", "date": "2025-11-30" }, "Arrival": { "@type": "Arrival", "location": "MEL", "date": "2025-11-30" } } } ] } } Example Response For additional examples, download the developer toolkits and see Using Postman and Developer Toolkits . &#160; Show Example Response { "UnpricedSegmentsResponse": { "transactionId": "1c6ebd45-0538-447a-b666-6e056f612d71", "Result": { "@type": "Result", "status": "Complete" } } }

## Literal `<pre>` excerpts from HTML

### Block 1

```
{
 "UnpricedSegments": {
  "@type": "UnpricedSegments",
  "UnpricedFlightSegment": [
   {
    "@type": "UnpricedFlightSegment",
    "sequence": 1,
    "passengerQuantity": 2,
    "classOfService": "K",
    "passiveSegmentStatus": "AK",
    "Flight": {
     "@type": "Flight",
     "id": "1",
     "carrier": "QF",
     "number": "1251",
     "Departure": {
      "@type": "Departure",
      "location": "BNE",
      "date": "2025-11-30"
     },
     "Arrival": {
      "@type": "Arrival",
      "location": "MEL",
      "date": "2025-11-30"
     }
    }
   }
  ]
 }
}
```

### Block 2

```
{
    "UnpricedSegmentsResponse": {
        "transactionId": "1c6ebd45-0538-447a-b666-6e056f612d71",
        "Result": {
            "@type": "Result",
            "status": "Complete"
        }
    }
}
```

