# Ancillary Book API&#160;Reference

## Source

- **Local HTML:** `docs/travelport/travelport api guide/travelport-airapi json/support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/Ancillaries/APIRef_AncillaryBook.html` (UTF-8 mirror)
- **Official base:** `https://support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/` + same relative path

## Plaintext extract (lossy)

Ancillary Book API&#160;Reference Skip To Main Content Account Settings Logout placeholder Account Settings Logout Filter: All Files Submit Search Filter: All Files Submit Search Ancillary Book API&#160;Reference Request Response Example request Example response POST book/airoffer/reservationworkbench/ {workbenchID} /offers/buildancillaryoffersfromcatalogofferings For {workbenchID} send the workbench identifier returned in ReservationResponse/Identifer/value in the workbench create response. Base path: Pre-production https://api.pp.travelport.net/11/air/ Production https://api.travelport.net/11/air/ Related Content: Ancillary and EMD Guide , Ancillary&#160;Shop API Reference , Ancillary Workflow Diagram The Ancillary&#160;Book request adds a selected ancillary to a workbench for an existing reservation. You must first send an Ancillary Shop request and, for NDC&#160;only, an Ancillary&#160;Price request . Ancillaries can include baggage, pets, meals, lounge access, wifi, etc. See the Ancillary and EMD Guide for a list of supported ancillaries. To book seats, use the Seat Book request. To add ancillaries or seats to a multi-offer booking , send the Ancillary Shop or Seat Map request, then send one book request for each offer, in any order. Supported in the initial booking workflow only for free seats; supported for an existing booking for ancillaries and free and paid seats. GDS only; multi-offers not supported for NDC. You may also need to add payment for the ancillary in the same workbench session. See payment and EMD&#160;details in the Ancillary and EMD Guide . Request As part of the request requirements, also see Authentication and Common Air API Headers . Query Parameters None. Request Body Show Ancillary&#160;Book Request Body Table - GDS Object Description Required/Optional OfferQueryBuildAncillaryOffersFromCatalogOfferings Top level object. Required BuildAncillaryOffersFromCatalogOfferings Top level object. Required CatalogOfferingsIdentifier Includes response transaction identifiers from the ancillary shop response. Required id Send the value returned in CatalogOfferingsID/id from the Ancillary Shop response . Required CatalogOfferingsIdentifier/ Identifier Sends identifiers from ancillary shop response. Required authority Send the value in CatalogOfferingsID/CatalogOffering/Identifier/authority from the Ancillary Shop response . Required value Send the value in CatalogOfferingsID/CatalogOffering/Identifier/value from the Ancillary Shop response . Required CatalogOfferingIdentifier Sends offer identifier. Required id Send value in CatalogOfferingsID/CatalogOffering/id from the Ancillary Shop response . &#160; ProductIdentifier Sends product identifier. Required id Send the value in CatalogOfferingsID/CatalogOffering/ProductOptions/Product/id for the product you want to book from the Ancillary Shop response . Required TravelerIdentifierRef Sends identifier of traveler for whom to price the ancillary. Required id Send the value in CatalogOfferingsID/TravelerIdentifierRef/id from the Ancillary Shop response . You can also verify passenger ID&#160;details via a Reservation Retrieve . Required Quantity The amount of this ancillary product requested. Required Comments Array. Send any comments for the ancillary offer/s. Key value pairs: value: Text of actual comment name: String. Name of the comment type. Ancillaries 25.11.50: Some carriers require a freeform text comment for certain types of ancillary bookings. When possible, the Ancillary Book API determines the required comment from a static SSR table maintained by Travelport and automatically adds that comment to the booking, returning it in a SpecialService object. If the comment or formatting is not accepted by the carrier, the ancillary booking fails. Recommended best practice is to send in the Ancillary Book request the applicable comment for carriers that require it when possible. See the examples later in this topic. Optional Show Ancillary&#160;Book Request Body Table - NDC Because Ancillary Price is a required step for NDC ancillaries, and not supported for GDS, the NDC ancillary book request sends identifiers from the Ancillary Price response, not the Ancillary Shop response. Object Description Required/Optional OfferQueryBuildAncillaryOffersFromCatalogOfferings Top level object. Required BuildAncillaryOffersFromCatalogOfferings Top level object. Required CatalogOfferingsIdentifier Includes response transaction identifiers from the ancillary price response. Required id Send the value returned in CatalogOfferingsID/id from the Ancillary Shop response . Required CatalogOfferingsIdentifier/ Identifier Sends transaction identifiers from ancillary price response. Required authority Send the value in OfferListResponse/Identifier/authority from the Ancillary Price response . Required value Send the value in OfferListResponse/Identifier/value from the Ancillary Price response . Required CatalogOfferingIdentifier Sends offer identifier. Required id Send value in OfferID/id from the Ancillary Price response . Required ProductIdentifier Sends product identifier. Required id Send the value in OfferID/Product/id from the Ancillary Price response . Required TravelerIdentifierRef Sends identifier of traveler for whom to book the ancillary. Required id Send identifier of traveler for whom to book the ancillary, returned in the Create Workbench response . You can also verify passenger ID&#160;details via a Reservation Retrieve . Required Quantity The amount of this ancillary product requested. Required Response The Ancillary Book response returns details of the ancillary added to the workbench. Show Ancillary Book Response Table Object Description OfferListResponse Top level object. Returns OfferID,&#160;Identifier, and ReferenceList objects. OfferID Returns product and pricing details for booked offer. Key value pair: id : Internal offer id. Includes Identifier, Product, Price, and TermsAndConditions objects. OfferID/ Identifier Identifier for the offer. Key value pairs: authority : Source of information. value : Unique system-generated identifier. ContentSource String.&#160;Identifies the source of the ancillary offer, either GDS or NDC . Product Array. Returns one instance of @type ProductAncillary to detail the ancillary product. Key value pair: id :&#160;Internal product id. Includes Quantity and Ancillary. Quantity The available number of this ancillary product. Ancillary Details of this ancillary. Includes Description and FlightRef. Description Supplier-provided description of this ancillary product. Key value pairs: code :&#160;Supplier code for ancillary. value :&#160;Supplier description of ancillary. FlightRef Internal reference number for the flight on which this ancillary is available. Matches to FlightRef in ReferenceList/ReferenceListFlight. Price Price details for this ancillary. Includes CurrencyCode, Base, TotalTaxes, TotalPrice objects. CurrencyCode The currency in which the price is returned. Unless changed in the request, the currency is the default associated with your provisioned PCC from Travelport. Key value pairs: decimalPlace: &#160;Number of decimal places in the currency. value: &#160;Currency code value. Base Base price before taxes. TotalTaxes Sum of all taxes for the product. TotalPrice Total price including base and taxes. TermsAndConditionsFull Returned with @typeTermsAndConditionsFullAncillary. Terms and conditions for this ancillary. Includes TravelerProduct and ApplicationLimit. TravelerProduct Includes TravelerIdentifierRef. TravelerIdentiferRef Returns details of the traveler the ancillary is priced for. Key value pairs: id :&#160;Internal system-generated traveler id. value :&#160;Internal system-generated traveler id. ApplicationLimit Any restrictions on the number of this ancillary product that can be purchased. Key value pairs: start :&#160;Minimum quantity that can be purchased. end : Maximum quantity that can be purchased. value : The unit represented by this quantity. Possible values are: PassengerSegment: Ancillary limit applies to each passenger at the segment level. E.g, Itinerary is LON-SIN-LON and the ancillary limit is “n” per segment per passenger. Segment: Ancillary limit applies to all passengers at the segment level (one flight, or flights under the same number). Itinerary: Ancillary limit applies to all passengers for the full itinerary. Passenger: Ancillary limit applies per passenger for the full itinerary. PassengerOD: Ancillary limit applies per passenger for the origin destination. E.g., Itinerary is LON X/SIN SYD X/SIN LON and the ancillary limit is “n” per origin destination (LON XSIN SYD) Other For example, a start quantity of 1 and end quantity of 2 with a value of Itinerary means that at least 1 but no more than 2 of this ancillary product can be purchased for the full itinerary. OfferListResponse/ Identifier Identifier for ancillary price response as a whole. Key value pairs: authority : Source of information. value : Unique system-generated identifier. CatalogOfferingsAncillaryListResponse/Identifier/value must be sent as the response identifier in subsequent ancillary price and/or book requests. ReferenceList Consolidates flight details in ReferenceList/ReferenceListFlight. Includes ReferenceListFlight. See table below. The ancillary book response returns ReferenceList/ReferenceListFlight for flight details, ReferenceListFlight is a common object in the model; Ancillaries does not return the AvailabilitySourceCode or IntermediateStop objects below. Object Description ReferenceListFlight Returns an array of Flight objects that match to the flights that make up a product. ReferenceListFlight is a common object in the model. Not all objects in this table may be returned in this specific API. Flight One instance for one flight. Key value pairs: distance : Distance covered by the flight. duration : Time of the flight in hours (H) and minutes (M). carrier : Airline carrier. number : Flight number. operatingCarrier : When the carrier has filed a codeshare operating carrier for the flight, the IATA code for that codeshare carrier. operatingCarrierName : Name of the marketing operating carrier. operatingCarrierNumber :&#160;Number of the operating carrier flight. If there is no operating carrier number, then CO2 emission estimates for operating carriers is not supported. GDS only; not returned for NDC. Returned only in Search response. equipment : Equipment model. Note that TRN, TRS, and BUS equipment codes indicate ground transportation. id : id for internal flight reference number, also used in products and offers. For GDS, formatted as the letter ‘s’+ unique numeric value, as in s1 . NDC flight ids include the NDC carrier code, as in QFs1 . subjectToGovernmentApproval : Returned with value of true when an airline has filed in its schedule that availability for a specific flight is subject to government approval. GDS only, not supported for NDC. Returned only in the Search API&#160;response. Includes Departure, Arrival, AvailabilitySourceCode, and IntermediateStop objects. Departure Departure details. Key value pairs are the location , date , time , and terminal of departure. Arrival Arrival details. Key value pairs are the location , date , time , and terminal of arrival. AvailabilitySourceCode Returned to assist in troubleshooting. Returned in the Search, Air Availability, Exchange Search, AirPrice, and Workbench Commit responses. Recommended to send in the AirPrice Full Payload and Add Offer Full Payload requests. Not returned for Ancillary Shop or Fare Rules. GDS&#160;only; not supported for NDC. Supported values and definitions for AvailabilitySourceCode: A:&#160;AVS (availability and schedules) B:&#160;Travelport cache C:&#160;AVS D:&#160;Direct Access E:&#160;Travelport cache F: Travelport cache G: Travelport cache H: Travelport cache I: Travelport cache K: Travelport cache L:&#160;Last seat availability M:&#160;Unknown source O: Travelport cache P: Travelport cache Q:&#160;Travelport cache S:&#160;Seamless T:&#160;Travelport cache U:&#160;Unknown source X:&#160;Customer reusing availability data from customer cache (data originally obtained from Travelport) Y:&#160;Customer reusing data obtained from another system (e.g., another GDS) (data may be fresh or stored in customer cache) Z:&#160;Customer sold from e-streamed data stored in customer cache IntermediateStop Returned if the flight has a technical stop but does not incur a change in flight number. Returned in the Search, AirPrice, Exchange Search responses. In ReservationRetrieve, IntermediateStop is returned in Offer/Product/Flight instead of ReferenceListFlight. Not returned for Ancillary Shop or Fare Rules. Key value pairs: arrivalFlightDuration: Length in hours and minutes of the flight arriving at the intermediate stop. departureFlightDuration: Length in hours and minutes of the flight departing the intermediate stop. duration: Length in hours and minutes between the arrival and departure at the intermediate stop. equipment : Equipment model, if there is a change of equipment during the stop. arrivalDate: Arrival date for stop. departureDate: Departure date of stop. arrivalTime: Arrival time for stop. departurelTime: &#160; sic; note spelling of departurelTime with the letter l between departure and time Departure time for stop. arrivalTerminal: Arrival terminal for stop. departureTerminal: Departure terminal for stop. value: The code for the airport where the intermediate stop occurs. Example Request For additional examples, download the developer toolkits and see Using Postman and Developer Toolkits . The GDS ancillary book request sends identifiers from the Ancillary Shop request. Ancillary Price is not supported for GDS. The NDC ancillary book request sends identifiers from the Ancillary Price request, which is a mandatory step for NDC ancillaries. Show Example Ancillary Book Request - GDS { "OfferQueryBuildAncillaryOffersFromCatalogOfferings": { "BuildAncillaryOffersFromCatalogOfferings": [ { "@type": "BuildAncillaryOffersFromCatalogOfferings", "CatalogOfferingsIdentifier": { "id": "CT1", "Identifier": { "authority": "Travelport", "value": "85d34008-c5ad-42f6-99ee-a7c0e6d5a2a3" } }, "CatalogOfferingIdentifier": { "id": "anc_off2" }, "ProductIdentifier": { "id": "an2" }, "TravelerIdentifierRef": { "id": "travelerRefId_1" }, "Quantity": 1 } ] } } Show Example Ancillary Book Request - NDC This example request books non-baggage ancillaries. "OfferQueryBuildAncillaryOffersFromCatalogOfferings": { "BuildAncillaryOffersFromCatalogOfferings": [ { "@type": "BuildAncillaryOffersFromCatalogOfferings", "CatalogOfferingsIdentifier": { "id": "CT1", "Identifier": { "authority": "Travelport", "value": "027e6479-56a2-4048-b331-810502d52830" } }, "CatalogOfferingIdentifier": { "id": "anc_off4" }, "ProductIdentifier": { "id": "an4" }, "TravelerIdentifierRef": { "id": "travelerRefId_1" }, "Quantity": 1 }, { "@type": "BuildAncillaryOffersFromCatalogOfferings", "CatalogOfferingsIdentifier": { "id": "CT1", "Identifier": { "authority": "Travelport", "value": "027e6479-56a2-4048-b331-810502d52830" } }, "CatalogOfferingIdentifier": { "id": "anc_off6" }, "ProductIdentifier": { "id": "an6" }, "TravelerIdentifierRef": { "id": "travelerRefId_2" }, "Quantity": 1 } ] } } Some carriers require a freeform text comment for certain types of ancillary bookings. The following example shows a complete Ancillary Book request including a Comments object to send a required freeform text comment. If such a comment is required by the carrier but not provided, when possible, Ancillary Book determines the required comment from a static SSR table maintained by Travelport and automatically adds that comment to the booking; see the response examples below. If the comment or formatting is not accepted by the carrier, the ancillary booking fails. Recommended best practice is to send in the Ancillary Book request the applicable comment for carriers that require it when possible. Show Example request with freeform text comment { "OfferQueryBuildAncillaryOffersFromCatalogOfferings": { "BuildAncillaryOffersFromCatalogOfferings": [ { "@type": "BuildAncillaryOffersFromCatalogOfferings", "CatalogOfferingsIdentifier": { "id": "CT1", "Identifier": { "authority": "Travelport", "value": "{{resIdentifier}}" } }, "CatalogOfferingIdentifier": { "id": "anc_off5" }, "ProductIdentifier": { "id": "an5" }, "TravelerIdentifierRef": { "id": "travelerRefId_1" }, "Quantity": 1, "Comments": { "@type": "Comments", "Comment": [ { "value": "Extra 1KG", "name": "SSRFreeText" } ] } } ] } } &#160; Example Response Show Example Ancillary Book Response The following example includes details about the ancillary added to the workbench. { "OfferListResponse": { "transactionId": "261428fc-2428-411f-89e6-e9c8deef6c79", "OfferID": [ { "@type": "Offer", "id": "an_o1", "Identifier": { "authority": "Travelport", "value": "45616c60-f5af-40e1-b978-d195b9c9d731" }, "Product": [ { "@type": "ProductAncillary", "id": "an1", "Quantity": 1, "Ancillary": { "@type": "AncillaryAir", "quantity": 1, "Description": [ { "code": "BG", "subCode": "0C1", "value": "EXTRA 15KG FOR KG ALLOWANCE" } ], "FlightRef": [ "Flight_01" ] } } ], "Price": { "@type": "PriceDetail", "CurrencyCode": { "value": "AUD" }, "Base": 22.73, "TotalTaxes": 2.27, "TotalPrice": 25 }, "TermsAndConditionsFull": [ { "@type": "TermsAndConditionsFullAncillary", "TravelerProduct": [ { "@type": "TravelerProduct", "TravelerIdentifierRef": { "name": "TESTFIRST", "passengerTypeCode": "ADT", "id": "travelerRefId_1", "value": "" }, "ProductRefs": [ "an1" ] } ], "ApplicationLimit": { "value": "PassengerSegment" } } ] } ], "Identifier": { "authority": "Travelport", "value": "85d34008-c5ad-42f6-99ee-a7c0e6d5a2a3" }, "ReferenceList": [ { "@type": "ReferenceListFlight", "Flight": [ { "@type": "Flight", "duration": "PT1H35M", "carrier": "QF", "number": "407", "equipment": "73H", "id": "Flight_01", "Identifier": { "authority": "Travelport", "value": "feb8d4aa-338e-4e0f-930b-eeaa1ce2a2cc" }, "Departure": { "@type": "Departure", "location": "SYD", "date": "2022-07-13", "time": "06:45:00" }, "Arrival": { "@type": "Arrival", "location": "MEL", "date": "2022-07-13", "time": "08:20:00" } } ] } ] } } Show Example for NDC non-baggage ancillary The following example shows the response for booking a non-baggage ancillary for NDC. { "OfferListResponse": { "@type": "OfferListResponse", "transactionId": "0eb997a8-98d9-4b8b-8d8d-78639a9b7d02", "traceId": "33aefc0e-1de4-4848-adfd-0a5d34a72c68", "OfferID": [ { "@type": "Offer", "id": "an_o1", "Identifier": { "authority": "Travelport", "value": "c8b257ac-22a7-4692-bf82-8642efa4a00c" }, "Product": [ { "@type": "ProductAncillary", "id": "product_bag_01_1", "Quantity": 1, "Ancillary": { "@type": "AncillaryAirBaggage", "quantity": 1, "Description": [ { "code": "BG", "subCode": "0EC", "value": "BICYCLE" }, { "code": "ASVC", "subCode": "SSR", "value": "**8SPCV3/C/0EC/BIKE/EUR/5500/2/BICYCLE" } ], "FlightRef": [ "Flight_01" ] } } ], "Price": { "@type": "PriceDetail", "CurrencyCode": { "value": "EUR" }, "Base": 55, "TotalTaxes": 0, "TotalPrice": 55, "PriceBreakdown": [ { "@type": "PriceBreakdownAncillaryAir", "Amount": { "@type": "Amount", "Taxes": { "@type": "TaxesDetail", "Tax": [ { "value": 0 } ] } }, "TravelerIdentifierRef": { "name": "-KRISHNA K MR", "passengerTypeCode": "ADT", "id": "travelerRefId_1", "value": "-KK" } } ] }, "TermsAndConditionsFull": [ { "@type": "TermsAndConditionsFullAncillary", "ApplicationLimit": { "start": "1", "end": "1", "value": "PassengerSegment" } } ] }, { "@type": "Offer", "id": "an_o2", "Identifier": { "authority": "Travelport", "value": "2b7b2763-7c5b-42b5-b798-92538ddb5aeb" }, "Product": [ { "@type": "ProductAncillary", "id": "product_bag_01_2", "Quantity": 1, "Ancillary": { "@type": "AncillaryAirBaggage", "quantity": 1, "Description": [ { "code": "PT", "subCode": "0BT", "value": "PET IN CABIN" }, { "code": "ASVC", "subCode": "SSR", "value": "**8SPCV3/C/0BT/PETC/EUR/12500/2/PET IN CABIN" } ], "FlightRef": [ "Flight_01" ] } } ], "Price": { "@type": "PriceDetail", "CurrencyCode": { "value": "EUR" }, "Base": 125, "TotalTaxes": 0, "TotalPrice": 125, "PriceBreakdown": [ { "@type": "PriceBreakdownAncillaryAir", "Amount": { "@type": "Amount", "Taxes": { "@type": "TaxesDetail", "Tax": [ { "value": 0 } ] } }, "TravelerIdentifierRef": { "name": "-KRISHNAA K MR", "passengerTypeCode": "ADT", "id": "travelerRefId_2", "value": "-KK" } } ] }, "TermsAndConditionsFull": [ { "@type": "TermsAndConditionsFullAncillary", "ApplicationLimit": { "start": "1", "end": "1", "value": "PassengerSegment" } } ] } ], "Identifier": { "authority": "Travelport", "value": "4acbb8cd-fdbc-4867-9263-881413a97f33" }, "ReferenceList": [ { "@type": "ReferenceListFlight", "Flight": [ { "@type": "Flight", "duration": "PT1H20M", "carrier": "AF", "number": "1018", "operatingCarrier": "A5", "operatingCarrierName": "HOP", "equipment": "E90", "id": "Flight_01", "Identifier": { "authority": "Travelport", "value": "c5c8a951-dd2a-4982-bd4b-eb4acbca89d0" }, "Departure": { "@type": "Departure", "location": "CDG", "date": "2024-11-23", "time": "20:45:00" }, "Arrival": { "@type": "Arrival", "location": "FRA", "date": "2024-11-23", "time": "22:05:00" } } ] } ] } } Some carriers require a freeform text comment for certain types of ancillary bookings. If such a comment is not provided, when possible, Ancillary Book determines the required comment from a static SSR table maintained by Travelport and automatically adds that comment to the booking. The following example shows the Special Service object automatically added in this case. If the comment or formatting is not accepted by the carrier, the ancillary booking fails. Recommended best practice is to send in the Ancillary Book request the applicable comment for carriers that require it when possible, per the example request earlier. Show Example excerpt for SpecialService object with automatic freeform text comment ..."SpecialService": [ { "@type": "SpecialService", "id": "SpecialService_1", "Identifier": { "authority": "Travelport", "value": "16a81b70-13ed-49eb-a726-92bd7b56fac3" }, "AppliesTo": { "@type": "AppliesToOfferProductSegment", "OfferIdentifier": { "offerRef": "offer_1" }, "ProductIdentifier": { "productRef": "product_1" }, "SegmentSequenceList": [ 1 ] }, "Status": { "value": "Pending" }, "TravelerIdentifier": { "TravelerRef": "travelerRefId_1", "Identifier": { "authority": "Travelport", "value": "117229b7-1927-410e-8fcd-f6be5e323836" } }, "Quantity": 1, "FreeText": "**C/0AA/XBAG/PRE PAID BAGGAGE", "SSRCode": "ASVC" }, { "@type": "SpecialService", "id": "SpecialService_2", "Identifier": { "authority": "Travelport", "value": "6485dbcf-7f59-45cd-833c-f4c2272ff4e1" }, "AppliesTo": { "@type": "AppliesToOfferProductSegment", "OfferIdentifier": { "offerRef": "offer_1" }, "ProductIdentifier": { "productRef": "product_1" }, "SegmentSequenceList": [ 1 ] }, "Status": { "value": "Pending" }, "TravelerIdentifier": { "TravelerRef": "travelerRefId_1", "Identifier": { "authority": "Travelport", "value": "117229b7-1927-410e-8fcd-f6be5e323836" } }, "Quantity": 1, "FreeText": "PREPAID", "SSRCode": "XBAG" }...

## Literal `<pre>` excerpts from HTML

### Block 1

```
{
    "OfferQueryBuildAncillaryOffersFromCatalogOfferings": {
        "BuildAncillaryOffersFromCatalogOfferings": [
            {
                "@type": "BuildAncillaryOffersFromCatalogOfferings",
                "CatalogOfferingsIdentifier": {
                    "id": "CT1",
                    "Identifier": {
                        "authority": "Travelport",
                        "value": "85d34008-c5ad-42f6-99ee-a7c0e6d5a2a3"
                    }
                },
                "CatalogOfferingIdentifier": {
                    "id": "anc_off2"
                },
                "ProductIdentifier": {
                    "id": "an2"
                },
                "TravelerIdentifierRef": {
                    "id": "travelerRefId_1"
                },
                "Quantity": 1
            }
        ]
    }
}
```

### Block 2

```
"OfferQueryBuildAncillaryOffersFromCatalogOfferings": {
        "BuildAncillaryOffersFromCatalogOfferings": [
            {
                "@type": "BuildAncillaryOffersFromCatalogOfferings",
                "CatalogOfferingsIdentifier": {
                    "id": "CT1",
                    "Identifier": {
                        "authority": "Travelport",
                        "value": "027e6479-56a2-4048-b331-810502d52830"
                    }
                },
                "CatalogOfferingIdentifier": {
                    "id": "anc_off4"
                },
                "ProductIdentifier": {
                    "id": "an4"
                },
                "TravelerIdentifierRef": {
                    "id": "travelerRefId_1"
                },
                "Quantity": 1
            },
            {
                "@type": "BuildAncillaryOffersFromCatalogOfferings",
                "CatalogOfferingsIdentifier": {
                    "id": "CT1",
                    "Identifier": {
                        "authority": "Travelport",
                        "value": "027e6479-56a2-4048-b331-810502d52830"
                    }
                },
                "CatalogOfferingIdentifier": {
                    "id": "anc_off6"
                },
                "ProductIdentifier": {
                    "id": "an6"
                },
                "TravelerIdentifierRef": {
                    "id": "travelerRefId_2"
                },
                "Quantity": 1
            }
        ]
    }
}
```

### Block 3

```
{
 "OfferQueryBuildAncillaryOffersFromCatalogOfferings": {
  "BuildAncillaryOffersFromCatalogOfferings": [
   {
    "@type": "BuildAncillaryOffersFromCatalogOfferings",
    "CatalogOfferingsIdentifier": {
     "id": "CT1",
     "Identifier": {
      "authority": "Travelport",
      "value": "{{resIdentifier}}"
     }
    },
    "CatalogOfferingIdentifier": {
     "id": "anc_off5"
    },
    "ProductIdentifier": {
     "id": "an5"
    },
    "TravelerIdentifierRef": {
     "id": "travelerRefId_1"
    },
    "Quantity": 1,
    "Comments": {
     "@type": "Comments",
     "Comment": [
      {
       "value": "Extra 1KG",
       "name": "SSRFreeText"
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
    "OfferListResponse": {
        "transactionId": "261428fc-2428-411f-89e6-e9c8deef6c79",
        "OfferID": [
            {
                "@type": "Offer",
                "id": "an_o1",
                "Identifier": {
                    "authority": "Travelport",
                    "value": "45616c60-f5af-40e1-b978-d195b9c9d731"
                },
                "Product": [
                    {
                        "@type": "ProductAncillary",
                        "id": "an1",
                        "Quantity": 1,
                        "Ancillary": {
                            "@type": "AncillaryAir",
                            "quantity": 1,
                            "Description": [
                                {
                                    "code": "BG",
                                    "subCode": "0C1",
                                    "value": "EXTRA 15KG FOR KG ALLOWANCE"
                                }
                            ],
                            "FlightRef": [
                                "Flight_01"
                            ]
                        }
                    }
                ],
                "Price": {
                    "@type": "PriceDetail",
                    "CurrencyCode": {
                        "value": "AUD"
                    },
                    "Base": 22.73,
                    "TotalTaxes": 2.27,
                    "TotalPrice": 25
                },
                "TermsAndConditionsFull": [
                    {
                        "@type": "TermsAndConditionsFullAncillary",
                        "TravelerProduct": [
                            {
                                "@type": "TravelerProduct",
                                "TravelerIdentifierRef": {
                                    "name": "TESTFIRST",
                                    "passengerTypeCode": "ADT",
                                    "id": "travelerRefId_1",
                                    "value": ""
                                },
                                "ProductRefs": [
                                    "an1"
                                ]
                            }
                        ],
                        "ApplicationLimit": {
                            "value": "PassengerSegment"
                        }
                    }
                ]
            }
        ],
        "Identifier": {
            "authority": "Travelport",
            "value": "85d34008-c5ad-42f6-99ee-a7c0e6d5a2a3"
        },
        "ReferenceList": [
            {
                "@type": "ReferenceListFlight",
                "Flight": [
                    {
                        "@type": "Flight",
                        "duration": "PT1H35M",
                        "carrier": "QF",
                        "number": "407",
                        "equipment": "73H",
                        "id": "Flight_01",
                        "Identifier": {
                            "authority": "Travelport",
                            "value": "feb8d4aa-338e-4e0f-930b-eeaa1ce2a2cc"
                        },
                        "Departure": {
                            "@type": "Departure",
                            "location": "SYD",
                            "date": "2022-07-13",
                            "time": "06:45:00"
                        },
                        "Arrival": {
                            "@type": "Arrival",
                            "location": "MEL",
                            "date": "2022-07-13",
                            "time": "08:20:00"
                        }
                    }
                ]
            }
        ]
    }
}
```

### Block 5

```
{
 "OfferListResponse": {
  "@type": "OfferListResponse",
  "transactionId": "0eb997a8-98d9-4b8b-8d8d-78639a9b7d02",
  "traceId": "33aefc0e-1de4-4848-adfd-0a5d34a72c68",
  "OfferID": [
   {
    "@type": "Offer",
    "id": "an_o1",
    "Identifier": {
     "authority": "Travelport",
     "value": "c8b257ac-22a7-4692-bf82-8642efa4a00c"
    },
    "Product": [
     {
      "@type": "ProductAncillary",
      "id": "product_bag_01_1",
      "Quantity": 1,
      "Ancillary": {
       "@type": "AncillaryAirBaggage",
       "quantity": 1,
       "Description": [
        {
         "code": "BG",
         "subCode": "0EC",
         "value": "BICYCLE"
        },
        {
         "code": "ASVC",
         "subCode": "SSR",
         "value": "**8SPCV3/C/0EC/BIKE/EUR/5500/2/BICYCLE"
        }
       ],
       "FlightRef": [
        "Flight_01"
       ]
      }
     }
    ],
    "Price": {
     "@type": "PriceDetail",
     "CurrencyCode": {
      "value": "EUR"
     },
     "Base": 55,
     "TotalTaxes": 0,
     "TotalPrice": 55,
     "PriceBreakdown": [
      {
       "@type": "PriceBreakdownAncillaryAir",
       "Amount": {
        "@type": "Amount",
        "Taxes": {
         "@type": "TaxesDetail",
         "Tax": [
          {
           "value": 0
          }
         ]
        }
       },
       "TravelerIdentifierRef": {
        "name": "-KRISHNA K MR",
        "passengerTypeCode": "ADT",
        "id": "travelerRefId_1",
        "value": "-KK"
       }
      }
     ]
    },
    "TermsAndConditionsFull": [
     {
      "@type": "TermsAndConditionsFullAncillary",
      "ApplicationLimit": {
       "start": "1",
       "end": "1",
       "value": "PassengerSegment"
      }
     }
    ]
   },
   {
    "@type": "Offer",
    "id": "an_o2",
    "Identifier": {
     "authority": "Travelport",
     "value": "2b7b2763-7c5b-42b5-b798-92538ddb5aeb"
    },
    "Product": [
     {
      "@type": "ProductAncillary",
      "id": "product_bag_01_2",
      "Quantity": 1,
      "Ancillary": {
       "@type": "AncillaryAirBaggage",
       "quantity": 1,
       "Description": [
        {
         "code": "PT",
         "subCode": "0BT",
         "value": "PET IN CABIN"
        },
        {
         "code": "ASVC",
         "subCode": "SSR",
         "value": "**8SPCV3/C/0BT/PETC/EUR/12500/2/PET IN CABIN"
        }
       ],
       "FlightRef": [
        "Flight_01"
       ]
      }
     }
    ],
    "Price": {
     "@type": "PriceDetail",
     "CurrencyCode": {
      "value": "EUR"
     },
     "Base": 125,
     "TotalTaxes": 0,
     "TotalPrice": 125,
     "PriceBreakdown": [
      {
       "@type": "PriceBreakdownAncillaryAir",
       "Amount": {
        "@type": "Amount",
        "Taxes": {
         "@type": "TaxesDetail",
         "Tax": [
          {
           "value": 0
          }
         ]
        }
       },
       "TravelerIdentifierRef": {
        "name": "-KRISHNAA K MR",
        "passengerTypeCode": "ADT",
        "id": "travelerRefId_2",
        "value": "-KK"
       }
      }
     ]
    },
    "TermsAndConditionsFull": [
     {
      "@type": "TermsAndConditionsFullAncillary",
      "ApplicationLimit": {
       "start": "1",
       "end": "1",
       "value": "PassengerSegment"
      }
     }
    ]
   }
  ],
  "Identifier": {
   "authority": "Travelport",
   "value": "4acbb8cd-fdbc-4867-9263-881413a97f33"
  },
  "ReferenceList": [
   {
    "@type": "ReferenceListFlight",
    "Flight": [
     {
      "@type": "Flight",
      "duration": "PT1H20M",
      "carrier": "AF",
      "number": "1018",
      "operatingCarrier": "A5",
      "operatingCarrierName": "HOP",
      "equipment": "E90",
      "id": "Flight_01",
      "Identifier": {
       "authority": "Travelport",
       "value": "c5c8a951-dd2a-4982-bd4b-eb4acbca89d0"
      },
      "Departure": {
       "@type": "Departure",
       "location": "CDG",
       "date": "2024-11-23",
       "time": "20:45:00"
      },
      "Arrival": {
       "@type": "Arrival",
       "location": "FRA",
       "date": "2024-11-23",
       "time": "22:05:00"
      }
     }
    ]
   }
  ]
 }
}
```

### Block 6

```
..."SpecialService": [
                {
                    "@type": "SpecialService",
                    "id": "SpecialService_1",
                    "Identifier": {
                        "authority": "Travelport",
                        "value": "16a81b70-13ed-49eb-a726-92bd7b56fac3"
                    },
                    "AppliesTo": {
                        "@type": "AppliesToOfferProductSegment",
                        "OfferIdentifier": {
                            "offerRef": "offer_1"
                        },
                        "ProductIdentifier": {
                            "productRef": "product_1"
                        },
                        "SegmentSequenceList": [
                            1
                        ]
                    },
                    "Status": {
                        "value": "Pending"
                    },
                    "TravelerIdentifier": {
                        "TravelerRef": "travelerRefId_1",
                        "Identifier": {
                            "authority": "Travelport",
                            "value": "117229b7-1927-410e-8fcd-f6be5e323836"
                        }
                    },
                    "Quantity": 1,
                    "FreeText": "**C/0AA/XBAG/PRE PAID BAGGAGE",
                    "SSRCode": "ASVC"
                },
                {
                    "@type": "SpecialService",
                    "id": "SpecialService_2",
                    "Identifier": {
                        "authority": "Travelport",
                        "value": "6485dbcf-7f59-45cd-833c-f4c2272ff4e1"
                    },
                    "AppliesTo": {
                        "@type": "AppliesToOfferProductSegment",
                        "OfferIdentifier": {
                            "offerRef": "offer_1"
                        },
                        "ProductIdentifier": {
                            "productRef": "product_1"
                        },
                        "SegmentSequenceList": [
                            1
                        ]
                    },
                    "Status": {
                        "value": "Pending"
                    },
                    "TravelerIdentifier": {
                        "TravelerRef": "travelerRefId_1",
                        "Identifier": {
                            "authority": "Travelport",
                            "value": "117229b7-1927-410e-8fcd-f6be5e323836"
                        }
                    },
                    "Quantity": 1,
                    "FreeText": "PREPAID",
                    "SSRCode": "XBAG"
                }...
```

