# Ancillary Shop API&#160;Reference

## Source

- **Local HTML:** `docs/travelport/travelport api guide/travelport-airapi json/support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/Ancillaries/APIRef_AncillaryShop.html` (UTF-8 mirror)
- **Official base:** `https://support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/` + same relative path

## Plaintext extract (lossy)

Ancillary Shop API&#160;Reference Skip To Main Content Account Settings Logout placeholder Account Settings Logout Filter: All Files Submit Search Filter: All Files Submit Search Ancillary Shop API&#160;Reference Request Response Example request Example response POST ancillaryshop/catalogofferingsancillaries Base path: Pre-production https://api.pp.travelport.net/11/air/ Production https://api.travelport.net/11/air/ Related Content: Ancillary and EMD&#160;Guide , Ancillary Workflow Diagram The Ancillary&#160;Shop request searches for available ancillaries. It can be sent after pricing, in the initial booking workbench, or for an existing reservation. The request uses the same endpoint but a different payload for each option, per below. See the Ancillary and EMD&#160;Guide for workflow details and specific ancillaries supported. For paid seats use the seat requests in the Seats Guide . Request As part of the request requirements, also see Authentication and Common Air API Headers . Query Parameters None. Request Body Be sure to see the Ancillary and EMD&#160;Guide for currently supported ancillaries in each flow. Ancillary shop request after AirPrice (no workbench; GDS only) Ancillaries 24.11.34 and later. GDS only; not supported for NDC. To shop NDC ancillaries after pricing, use the ancillary shop request payload sent in the initial workbench, next. This request supports ancillary shop for an entire offer. Show Ancillary Shop Request Body Table - after AirPrice Object Description Required/Optional CatalogOfferingsQueryAncillaries Top level object. Required AncillaryOfferings Top level object. Required BuildFromOfferList Top level object. Required OfferListIdentifier Top level object. Required OfferIdentifier Sends offer identifier. Key value pair: id : Sends offer identifier for the offer for which to shop for associated ancillaries. Required Ancillary shop request in the initial booking workflow (pre-commit) In the initial booking workflow, for either GDS or NDC, use the following payload. For NDC only, you can send this same payload to shop ancillaries after AirPrice without a workbench. For GDS, see the section above for the payload to send after AirPrice. Show Ancillary Shop Request Body Table - new reservation Object Description Required/Optional CatalogOfferingsQueryAncillaries Top level object. Required AncillaryOfferings Top level object. Required BuildFromOffer Top level object. Required OfferIdentifier Top level object. Required Identifier (for the offer) Sends offer identifier. Key value pair: value : Sends offer identifier for the offer for which to shop for associated ancillaries. For GDS, send the value from CatalogProductOffering/Identifier/value in the Search response. For NDC, if you priced the offer, send the value from OfferListResponse/Identifier/value in the AirPrice response. Required ProductIdentifier Sends product identifier. Required Identifier (for the product) Sends product identifier. Repeat for each product as needed. Key value pair: value : Sends product identifier from the offer for which to shop for associated ancillaries (from the Search response in CatalogProductOffering/ProductBrandOptions/ProductBrandOffering/Product/productRef). Required Ancillary shop request for existing reservation (post-commit) For an existing reservation, for either GDS or NDC, use the following payload. Show Ancillary Shop Request Body Table - existing reservation Object Description Required/Optional CatalogOfferingsQueryAncillaries Top level object. Required AncillaryOfferings Top level object. Required BuildFromReservationWorkbench Top level object. Required ReservationIdentifier Top level object. Required Identifier Sends workbench identifier. Key value pair: value : Send the reservation workbench identifier returned in Offer/Identifier/value in the workbench create response. Required Response The Ancillary Shop response is the same following a request sent in either the initial booking flow or for an existing reservation. Most objects returned are standard model objects; see the Reservation Retrieve response for additional details on any of the objects below. Show Ancillary Shop Response Table Object Description CatalogOfferingsAncillaryListResponse Top level object. Includes CatalogOfferingsID, Identifier, and ReferenceList. CatalogOfferingsID Top level object for offers. Includes CatalogOffering and TravelerIdentiferRef. Returns an instance of CatalogOfferingsID @type CatalogOfferingsTraveler; the value returned in id in this instance must be passed in any subsequent Ancillary Price request. Key value pairs: id :&#160;Internal id for the group of offers. CatalogOffering Array of individual ancillary offers. Key value pair: id : Internal offer id. Each instance includes Identifier, ProductOptions, Price, and TermsAndConditions objects. CatalogOffering/ Identifier Identifier for the offer. Key value pairs: authority : Source of information. value : Unique system-generated identifier. CatalogOffering/Identifier/value and /authority must be sent in subsequent ancillary price and/or book requests. ContentSource String.&#160;Identifies the source of the ancillary offer, either GDS or NDC . ProductOptions Top level object for products in the offer. Includes Product object. Product Array. Returns one or more instances with @type ProductAncillary to detail the ancillary product. Key value pair: id :&#160;Internal product id. Includes Quantity and Ancillary. CatalogOffering/ProductOptions/Product/id must be sent as the product identifier in any subsequent ancillary price and/or book requests. Quantity The available number of this ancillary product. Ancillary Details of this ancillary. In each instance of Ancillary, the @type designator may be either of the following: AncillaryAirBaggage: Returned for paid baggage. AncillaryAir:&#160;Returned for all other types of ancillaries, both paid (e.g., lounge access, priority boarding, paid seat assignments) and free ancillaries (e.g., wheelchair, free seat assignments). Key value pairs for ancillary baggage only are: soldByPieceInd : Boolean. Returned only if true. Indicates baggage allowance is by piece, such as one, two, or three pieces. soldByWeightInd : Boolean. Returned only if true. Indicates the baggage is allowed by weight, either kilograms or pounds, such as 50 pounds or 35 kilograms. Includes Description and FlightRef. Description Supplier-provided description of this ancillary product. Key value pairs: code :&#160;Supplier code for ancillary. value :&#160;Supplier description of ancillary. subgroup :&#160;Ancillary subgroup; returned if available. NDC&#160;only; not supported for GDS. FlightRef Internal reference number for the flight on which this ancillary is available. Matches to FlightRef in ReferenceList/ReferenceListFlight. BaggageType Ancillaries 25.11.47. GDS only; not supported for NDC Returned only for carry-on baggage with the value CarryOn ; for example, "BaggageType": "CarryOn" . Price Price details for this ancillary product in this offer. Includes CurrencyCode, Base, TotalTaxes, TotalPrice, PriceBreakdown objects. CurrencyCode The currency in which the price is returned. Unless changed in the request, the currency is the default associated with your provisioned PCC from Travelport. Key value pairs: decimalPlace: &#160;Number of decimal places in the currency. value: &#160;Currency code value. Base Base price before taxes. TotalTaxes Sum of all taxes for the product. TotalPrice Total price including base and taxes. &#160; &#160; &#160; PriceBreakdown/inclusiveOfTaxInd PriceBreakdown/Commission/application (possible values Non-paying and Commissionable) PriceBreakdown/Description: issuanceReasonCode value PriceBreakdown Array. Price breakdown for ancillary cost. In PriceBreakdown, the following are returned only for GDS, not NDC: inclusiveOfTaxInd: Ancillary price includes taxes if true . Commission/application (possible values Non-paying and Commissionable ) Description: issuanceReasonCode value TermsAndConditions Returned with @typeTermsAndConditionsAncillary. Terms and conditions for this ancillary product in this offer. Includes TravelerProduct and ApplicationLimit. In TermsAndConditions, the following are returned only for GDS, not NDC: fulfillmentType associatedItem Refundability validatingAirline TravelerProduct Includes TravelerIdentifierRef. TravelerIdentiferRef Returns details of the traveler the ancillary is requested for. Key value pairs: id :&#160;Internal system-generated traveler id. value :&#160;Internal system-generated traveler id. ApplicationLimit Any restrictions on the number of this ancillary product that can be purchased. Key value pairs: start :&#160;Minimum quantity that can be purchased. end : Maximum quantity that can be purchased. value : The unit represented by this quantity. Possible values are: PassengerSegment: Ancillary limit applies to each passenger at the segment level. E.g, Itinerary is LON-SIN-LON and the ancillary limit is “n” per segment per passenger. Segment: Ancillary limit applies to all passengers at the segment level (one flight, or flights under the same number). Itinerary: Ancillary limit applies to all passengers for the full itinerary. Passenger: Ancillary limit applies per passenger for the full itinerary. PassengerOD: Ancillary limit applies per passenger for the origin destination. E.g., Itinerary is LON X/SIN SYD X/SIN LON and the ancillary limit is “n” per origin destination (LON XSIN SYD) Other For example, a start quantity of 1 and end quantity of 2 with a value of Itinerary means that at least 1 but no more than 2 of this ancillary product can be purchased for the full itinerary. CatalogOfferingsAncillaryListResponse/ Identifier Identifier for ancillary shop response as a whole. Key value pairs: authority : Source of information. value : Unique system-generated identifier. CatalogOfferingsAncillaryListResponse/Identifier/value must be sent as the response identifier in subsequent ancillary price and/or book requests. ReferenceList Consolidates flight details in ReferenceList/ReferenceListFlight. Includes ReferenceListFlight. See table below. The ancillary response returns ReferenceList/ReferenceListFlight for flight details. Does not return the AvailabilitySourceCode or IntermediateStop objects below. Object Description ReferenceListFlight Returns an array of Flight objects that match to the flights that make up a product. ReferenceListFlight is a common object in the model. Not all objects in this table may be returned in this specific API. Flight One instance for one flight. Key value pairs: distance : Distance covered by the flight. duration : Time of the flight in hours (H) and minutes (M). carrier : Airline carrier. number : Flight number. operatingCarrier : When the carrier has filed a codeshare operating carrier for the flight, the IATA code for that codeshare carrier. operatingCarrierName : Name of the marketing operating carrier. operatingCarrierNumber :&#160;Number of the operating carrier flight. If there is no operating carrier number, then CO2 emission estimates for operating carriers is not supported. GDS only; not returned for NDC. Returned only in Search response. equipment : Equipment model. Note that TRN, TRS, and BUS equipment codes indicate ground transportation. id : id for internal flight reference number, also used in products and offers. For GDS, formatted as the letter ‘s’+ unique numeric value, as in s1 . NDC flight ids include the NDC carrier code, as in QFs1 . subjectToGovernmentApproval : Returned with value of true when an airline has filed in its schedule that availability for a specific flight is subject to government approval. GDS only, not supported for NDC. Returned only in the Search API&#160;response. Includes Departure, Arrival, AvailabilitySourceCode, and IntermediateStop objects. Departure Departure details. Key value pairs are the location , date , time , and terminal of departure. Arrival Arrival details. Key value pairs are the location , date , time , and terminal of arrival. AvailabilitySourceCode Returned to assist in troubleshooting. Returned in the Search, Air Availability, Exchange Search, AirPrice, and Workbench Commit responses. Recommended to send in the AirPrice Full Payload and Add Offer Full Payload requests. Not returned for Ancillary Shop or Fare Rules. GDS&#160;only; not supported for NDC. Supported values and definitions for AvailabilitySourceCode: A:&#160;AVS (availability and schedules) B:&#160;Travelport cache C:&#160;AVS D:&#160;Direct Access E:&#160;Travelport cache F: Travelport cache G: Travelport cache H: Travelport cache I: Travelport cache K: Travelport cache L:&#160;Last seat availability M:&#160;Unknown source O: Travelport cache P: Travelport cache Q:&#160;Travelport cache S:&#160;Seamless T:&#160;Travelport cache U:&#160;Unknown source X:&#160;Customer reusing availability data from customer cache (data originally obtained from Travelport) Y:&#160;Customer reusing data obtained from another system (e.g., another GDS) (data may be fresh or stored in customer cache) Z:&#160;Customer sold from e-streamed data stored in customer cache IntermediateStop Returned if the flight has a technical stop but does not incur a change in flight number. Returned in the Search, AirPrice, Exchange Search responses. In ReservationRetrieve, IntermediateStop is returned in Offer/Product/Flight instead of ReferenceListFlight. Not returned for Ancillary Shop or Fare Rules. Key value pairs: arrivalFlightDuration: Length in hours and minutes of the flight arriving at the intermediate stop. departureFlightDuration: Length in hours and minutes of the flight departing the intermediate stop. duration: Length in hours and minutes between the arrival and departure at the intermediate stop. equipment : Equipment model, if there is a change of equipment during the stop. arrivalDate: Arrival date for stop. departureDate: Departure date of stop. arrivalTime: Arrival time for stop. departurelTime: &#160; sic; note spelling of departurelTime with the letter l between departure and time Departure time for stop. arrivalTerminal: Arrival terminal for stop. departureTerminal: Departure terminal for stop. value: The code for the airport where the intermediate stop occurs. Example Request For additional examples, download the developer toolkits and see Using Postman and Developer Toolkits . Be sure to see the Ancillary and EMD&#160;Guide for currently supported ancillaries in each flow. Ancillary shop request after AirPrice (no workbench; GDS only) Show Example Ancillary&#160;Shop request after AirPrice (no workbench, GDS&#160;only) { "CatalogOfferingsQueryAncillaries": { "AncillaryOfferings": { "@type": "AncillaryOfferingsBuildFromOfferList", "BuildFromOfferList": { "OfferListIdentifier": "238ef294-4d0f-4d6f-838e-154ddaf2c7be_PC", "OfferIdentifier": [ { "id": "o0" } ] } } } } Ancillary shop request in the initial booking workflow (pre-commit) Show Example Ancillary Shop Request - new reservation The following example payload, sent for a new reservation, sends offer and product identifiers from the Search response. { "CatalogOfferingsQueryAncillaries": { "AncillaryOfferings": { "@type": "AncillaryOfferingsBuildFromOffer", "BuildFromOffer": { "@type": "BuildFromOfferAir", "OfferIdentifier": { "Identifier": { "value": "653f9c6f-4618-44e5-8f2d-2a23dd6fcc40_PC" } }, "ProductIdentifier": [ { "Identifier": { "value": "p0" } } ] } } } } Ancillary shop request for existing reservation (post-commit) Show Example Ancillary Shop Request - existing reservation The following example payload, sent for an existing reservation, sends the workbench identifier. { "CatalogOfferingsQueryAncillaries": { "AncillaryOfferings": { "@type": "AncillaryOfferingsBuildFromReservationWorkbench", "BuildFromReservationWorkbench": { "ReservationIdentifier": { "Identifier": { "value": "85d34008-c5ad-42f6-99ee-a7c0e6d5a2a3" } } } } } } Example Response The Ancillary Shop response is the same regardless of where in the workflow the shop request is sent. Show Example Ancillary&#160;Shop response { "CatalogOfferingsAncillaryListResponse": { "@type": "CatalogOfferingsAncillaryListResponse", "transactionId": "3c68a982-41e8-4846-90b1-5a79a58f268e:ppnd1001", "CatalogOfferingsID": [ { "@type": "CatalogOfferingsTraveler", "id": "CT1", "CatalogOffering": [ { "@type": "CatalogOffering", "id": "anc_off1", "ProductOptions": [ { "@type": "ProductOptions", "Product": [ { "@type": "ProductAncillary", "id": "an1", "Quantity": 1, "Ancillary": { "@type": "AncillaryAirBaggage", "Description": [ { "code": "BG", "subCode": "021", "ssrCode": "PETC", "value": "PET IN CABIN UP TO 8 KG" }, { "value": "C-RepriceRequired" } ], "FlightRef": [ "s1", "s2" ], "BaggageType": "CarryOn" } } ] } ], "Price": { "@type": "PriceDetail", "CurrencyCode": { "value": "EUR" }, "Base": 80, "TotalTaxes": 0, "TotalPrice": 80, "PriceBreakdown": [ { "@type": "PriceBreakdownAncillaryAir", "inclusiveOfTaxInd": true, "Amount": { "@type": "Amount", "Taxes": { "@type": "TaxesDetail", "Tax": [ { "value": 0 } ] } }, "Commission": { "@type": "Commission", "application": "Non-paying" }, "Description": { "issuanceReasonCode": "C", "value": "Associated to a flight coupon of a ticket" } } ] }, "TermsAndConditions": { "@type": "TermsAndConditionsAncillary", "validatingAirline": "FB", "fulfillmentType": "EMD-A Associated", "associatedItem": "Flight", "ExpiryDate": "2049-12-12T00:00:00Z", "ApplicationLimit": { "value": "PassengerSegment" } } }, { "@type": "CatalogOffering", "id": "anc_off2", "ProductOptions": [ { "@type": "ProductOptions", "Product": [ { "@type": "ProductAncillary", "id": "an2", "Quantity": 1, "Ancillary": { "@type": "AncillaryAirBaggage", "Description": [ { "code": "BG", "subCode": "026", "ssrCode": "AVIH", "value": "PET IN HOLD UP TO 23KG" }, { "value": "C-RepriceRequired" } ], "FlightRef": [ "s1", "s2" ] } } ] } ], "Price": { "@type": "PriceDetail", "CurrencyCode": { "value": "EUR" }, "Base": 110, "TotalTaxes": 0, "TotalPrice": 110, "PriceBreakdown": [ { "@type": "PriceBreakdownAncillaryAir", "inclusiveOfTaxInd": true, "Amount": { "@type": "Amount", "Taxes": { "@type": "TaxesDetail", "Tax": [ { "value": 0 } ] } }, "Commission": { "@type": "Commission", "application": "Non-paying" }, "Description": { "issuanceReasonCode": "C", "value": "Associated to a flight coupon of a ticket" } } ] }, "TermsAndConditions": { "@type": "TermsAndConditionsAncillary", "validatingAirline": "FB", "fulfillmentType": "EMD-A Associated", "associatedItem": "Flight", "ExpiryDate": "2049-12-12T00:00:00Z", "ApplicationLimit": { "value": "PassengerSegment" } } }, { "@type": "CatalogOffering", "id": "anc_off3", "ProductOptions": [ { "@type": "ProductOptions", "Product": [ { "@type": "ProductAncillary", "id": "an3", "Quantity": 1, "Ancillary": { "@type": "AncillaryAirBaggage", "Description": [ { "code": "BG", "subCode": "05X", "ssrCode": "AVIH", "value": "PET IN HOLD UP TO 45 KG" }, { "value": "C-RepriceRequired" } ], "FlightRef": [ "s1", "s2" ] } } ] } ], "Price": { "@type": "PriceDetail", "CurrencyCode": { "value": "EUR" }, "Base": 150, "TotalTaxes": 0, "TotalPrice": 150, "PriceBreakdown": [ { "@type": "PriceBreakdownAncillaryAir", "inclusiveOfTaxInd": true, "Amount": { "@type": "Amount", "Taxes": { "@type": "TaxesDetail", "Tax": [ { "value": 0 } ] } }, "Commission": { "@type": "Commission", "application": "Non-paying" }, "Description": { "issuanceReasonCode": "C", "value": "Associated to a flight coupon of a ticket" } } ] }, "TermsAndConditions": { "@type": "TermsAndConditionsAncillary", "validatingAirline": "FB", "fulfillmentType": "EMD-A Associated", "associatedItem": "Flight", "ExpiryDate": "2049-12-12T00:00:00Z", "ApplicationLimit": { "value": "PassengerSegment" } } }, { "@type": "CatalogOffering", "id": "anc_off4", "ProductOptions": [ { "@type": "ProductOptions", "Product": [ { "@type": "ProductAncillary", "id": "an5", "Quantity": 1, "Ancillary": { "@type": "AncillaryAirBaggage", "soldByPieceInd": true, "Description": [ { "code": "BG", "subCode": "0CE", "ssrCode": "CBAG", "value": "3RD BAG UPTO50LB23KG 62LI158CM" }, { "value": "C-RepriceRequired" } ], "FlightRef": [ "s1", "s2" ], "Measurement": [ { "measurementType": "Weight", "unit": "Kilograms", "value": 23 } ] } } ] } ], "Price": { "@type": "PriceDetail", "CurrencyCode": { "value": "EUR" }, "Base": 120, "TotalTaxes": 0, "TotalPrice": 120, "PriceBreakdown": [ { "@type": "PriceBreakdownAncillaryAir", "inclusiveOfTaxInd": true, "Amount": { "@type": "Amount", "Taxes": { "@type": "TaxesDetail", "Tax": [ { "value": 0 } ] } }, "Commission": { "@type": "Commission", "application": "Non-paying" }, "Description": { "issuanceReasonCode": "C", "value": "Associated to a flight coupon of a ticket" } } ] }, "TermsAndConditions": { "@type": "TermsAndConditionsAncillary", "validatingAirline": "FB", "fulfillmentType": "EMD-A Associated", "associatedItem": "Flight", "ExpiryDate": "2049-12-12T00:00:00Z", "ApplicationLimit": { "start": "3", "end": "3", "value": "PassengerSegment" } } } ], "TravelerIdentifierRef": [ { "passengerTypeCode": "ADT", "id": "travelerRefId_1" } ] } ], "Result": { "@type": "Result", "Warning": [ { "@type": "Warning", "Message": "SERVICES RELATED TO THE FARE MAY EXIST - MUST PRICE THE PNR" } ] }, "Identifier": { "authority": "Travelport", "value": "7cea1dc4-92e5-4097-bfe6-2dc821f876c4_PC" }, "ReferenceList": [ { "@type": "ReferenceListFlight", "Flight": [ { "@type": "Flight", "carrier": "FB", "number": "1771", "operatingCarrier": "FB", "operatingCarrierName": "Bulgaria Air", "id": "s1", "Departure": { "@type": "Departure", "location": "SOF", "date": "2025-09-01", "time": "12:55:00" }, "Arrival": { "@type": "Arrival", "location": "FCO", "date": "2025-09-01", "time": "13:50:00" } }, { "@type": "Flight", "carrier": "FB", "number": "1709", "operatingCarrier": "FB", "operatingCarrierName": "Bulgaria Air", "id": "s2", "Departure": { "@type": "Departure", "location": "FCO", "date": "2025-09-01", "time": "14:40:00" }, "Arrival": { "@type": "Arrival", "location": "LCY", "date": "2025-09-01", "time": "16:15:00" } } ] } ] } }

## Literal `<pre>` excerpts from HTML

### Block 1

```
{
 "CatalogOfferingsQueryAncillaries": {
  "AncillaryOfferings": {
   "@type": "AncillaryOfferingsBuildFromOfferList",
   "BuildFromOfferList": {
    "OfferListIdentifier": "238ef294-4d0f-4d6f-838e-154ddaf2c7be_PC",
    "OfferIdentifier": [
     {
      "id": "o0"
     }
    ]
   }
  }
 }
}
```

### Block 2

```
{
 "CatalogOfferingsQueryAncillaries": {
  "AncillaryOfferings": {
   "@type": "AncillaryOfferingsBuildFromOffer",
   "BuildFromOffer": {
    "@type": "BuildFromOfferAir",
    "OfferIdentifier": {
     "Identifier": {
      "value": "653f9c6f-4618-44e5-8f2d-2a23dd6fcc40_PC"
     }
    },
    "ProductIdentifier": [
     {
      "Identifier": {
       "value": "p0"
      }
     }
    ]
   }
  }
 }
}
```

### Block 3

```
{
 "CatalogOfferingsQueryAncillaries": {
  "AncillaryOfferings": {
   "@type": "AncillaryOfferingsBuildFromReservationWorkbench",
   "BuildFromReservationWorkbench": {
    "ReservationIdentifier": {
     "Identifier": {
      "value": "85d34008-c5ad-42f6-99ee-a7c0e6d5a2a3"
     }
    }
   }
  }
 }
}
```

### Block 4

```
{
 "CatalogOfferingsAncillaryListResponse": {
  "@type": "CatalogOfferingsAncillaryListResponse",
  "transactionId": "3c68a982-41e8-4846-90b1-5a79a58f268e:ppnd1001",
  "CatalogOfferingsID": [
   {
    "@type": "CatalogOfferingsTraveler",
    "id": "CT1",
    "CatalogOffering": [
     {
      "@type": "CatalogOffering",
      "id": "anc_off1",
      "ProductOptions": [
       {
        "@type": "ProductOptions",
        "Product": [
         {
          "@type": "ProductAncillary",
          "id": "an1",
          "Quantity": 1,
          "Ancillary": {
           "@type": "AncillaryAirBaggage",
           "Description": [
            {
             "code": "BG",
             "subCode": "021",
             "ssrCode": "PETC",
             "value": "PET IN CABIN UP TO 8 KG"
            },
            {
             "value": "C-RepriceRequired"
            }
           ],
           "FlightRef": [
            "s1",
            "s2"
           ],
           "BaggageType": "CarryOn"
          }
         }
        ]
       }
      ],
      "Price": {
       "@type": "PriceDetail",
       "CurrencyCode": {
        "value": "EUR"
       },
       "Base": 80,
       "TotalTaxes": 0,
       "TotalPrice": 80,
       "PriceBreakdown": [
        {
         "@type": "PriceBreakdownAncillaryAir",
         "inclusiveOfTaxInd": true,
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
         "Commission": {
          "@type": "Commission",
          "application": "Non-paying"
         },
         "Description": {
          "issuanceReasonCode": "C",
          "value": "Associated to a flight coupon of a ticket"
         }
        }
       ]
      },
      "TermsAndConditions": {
       "@type": "TermsAndConditionsAncillary",
       "validatingAirline": "FB",
       "fulfillmentType": "EMD-A Associated",
       "associatedItem": "Flight",
       "ExpiryDate": "2049-12-12T00:00:00Z",
       "ApplicationLimit": {
        "value": "PassengerSegment"
       }
      }
     },
     {
      "@type": "CatalogOffering",
      "id": "anc_off2",
      "ProductOptions": [
       {
        "@type": "ProductOptions",
        "Product": [
         {
          "@type": "ProductAncillary",
          "id": "an2",
          "Quantity": 1,
          "Ancillary": {
           "@type": "AncillaryAirBaggage",
           "Description": [
            {
             "code": "BG",
             "subCode": "026",
             "ssrCode": "AVIH",
             "value": "PET IN HOLD UP TO 23KG"
            },
            {
             "value": "C-RepriceRequired"
            }
           ],
           "FlightRef": [
            "s1",
            "s2"
           ]
          }
         }
        ]
       }
      ],
      "Price": {
       "@type": "PriceDetail",
       "CurrencyCode": {
        "value": "EUR"
       },
       "Base": 110,
       "TotalTaxes": 0,
       "TotalPrice": 110,
       "PriceBreakdown": [
        {
         "@type": "PriceBreakdownAncillaryAir",
         "inclusiveOfTaxInd": true,
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
         "Commission": {
          "@type": "Commission",
          "application": "Non-paying"
         },
         "Description": {
          "issuanceReasonCode": "C",
          "value": "Associated to a flight coupon of a ticket"
         }
        }
       ]
      },
      "TermsAndConditions": {
       "@type": "TermsAndConditionsAncillary",
       "validatingAirline": "FB",
       "fulfillmentType": "EMD-A Associated",
       "associatedItem": "Flight",
       "ExpiryDate": "2049-12-12T00:00:00Z",
       "ApplicationLimit": {
        "value": "PassengerSegment"
       }
      }
     },
     {
      "@type": "CatalogOffering",
      "id": "anc_off3",
      "ProductOptions": [
       {
        "@type": "ProductOptions",
        "Product": [
         {
          "@type": "ProductAncillary",
          "id": "an3",
          "Quantity": 1,
          "Ancillary": {
           "@type": "AncillaryAirBaggage",
           "Description": [
            {
             "code": "BG",
             "subCode": "05X",
             "ssrCode": "AVIH",
             "value": "PET IN HOLD UP TO 45 KG"
            },
            {
             "value": "C-RepriceRequired"
            }
           ],
           "FlightRef": [
            "s1",
            "s2"
           ]
          }
         }
        ]
       }
      ],
      "Price": {
       "@type": "PriceDetail",
       "CurrencyCode": {
        "value": "EUR"
       },
       "Base": 150,
       "TotalTaxes": 0,
       "TotalPrice": 150,
       "PriceBreakdown": [
        {
         "@type": "PriceBreakdownAncillaryAir",
         "inclusiveOfTaxInd": true,
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
         "Commission": {
          "@type": "Commission",
          "application": "Non-paying"
         },
         "Description": {
          "issuanceReasonCode": "C",
          "value": "Associated to a flight coupon of a ticket"
         }
        }
       ]
      },
      "TermsAndConditions": {
       "@type": "TermsAndConditionsAncillary",
       "validatingAirline": "FB",
       "fulfillmentType": "EMD-A Associated",
       "associatedItem": "Flight",
       "ExpiryDate": "2049-12-12T00:00:00Z",
       "ApplicationLimit": {
        "value": "PassengerSegment"
       }
      }
     },
     {
      "@type": "CatalogOffering",
      "id": "anc_off4",
      "ProductOptions": [
       {
        "@type": "ProductOptions",
        "Product": [
         {
          "@type": "ProductAncillary",
          "id": "an5",
          "Quantity": 1,
          "Ancillary": {
           "@type": "AncillaryAirBaggage",
           "soldByPieceInd": true,
           "Description": [
            {
             "code": "BG",
             "subCode": "0CE",
             "ssrCode": "CBAG",
             "value": "3RD BAG UPTO50LB23KG 62LI158CM"
            },
            {
             "value": "C-RepriceRequired"
            }
           ],
           "FlightRef": [
            "s1",
            "s2"
           ],
           "Measurement": [
            {
             "measurementType": "Weight",
             "unit": "Kilograms",
             "value": 23
            }
           ]
          }
         }
        ]
       }
      ],
      "Price": {
       "@type": "PriceDetail",
       "CurrencyCode": {
        "value": "EUR"
       },
       "Base": 120,
       "TotalTaxes": 0,
       "TotalPrice": 120,
       "PriceBreakdown": [
        {
         "@type": "PriceBreakdownAncillaryAir",
         "inclusiveOfTaxInd": true,
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
         "Commission": {
          "@type": "Commission",
          "application": "Non-paying"
         },
         "Description": {
          "issuanceReasonCode": "C",
          "value": "Associated to a flight coupon of a ticket"
         }
        }
       ]
      },
      "TermsAndConditions": {
       "@type": "TermsAndConditionsAncillary",
       "validatingAirline": "FB",
       "fulfill
…
```

