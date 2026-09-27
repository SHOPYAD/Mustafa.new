# Ancillary Price API&#160;Reference (NDC)

## Source

- **Local HTML:** `docs/travelport/travelport api guide/travelport-airapi json/support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/Ancillaries/APIRef_AncillaryPrice.html` (UTF-8 mirror)
- **Official base:** `https://support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/` + same relative path

## Plaintext extract (lossy)

Ancillary Price API&#160;Reference (NDC) Skip To Main Content Account Settings Logout placeholder Account Settings Logout Filter: All Files Submit Search Filter: All Files Submit Search Ancillary Price API&#160;Reference (NDC) Request Response Example request Example response POST ancillaryprice/offers/buildancillaryoffersfromcatalogofferings Base path: Pre-production https://api.pp.travelport.net/11/air/ Production https://api.travelport.net/11/air/ Related Content: Ancillary and EMD&#160;Guide , Ancillary Shop API Reference , Ancillary Workflow Diagram The Ancillary&#160;Price request confirms pricing for a selected ancillary. It can be sent either as part of the initial booking workflow, or for an existing reservation. The request uses the same endpoint and payload in each flow. See the Ancillary and EMD&#160;Guide for currently supported ancillaries in each flow. You must first create a new or post-commit workbench and send an Ancillary Shop request . After pricing, add the selected ancillary to the workbench . Ancillary pricing is a required step for NDC ancillaries. Not supported for GDS. Request As part of the request requirements, also see Authentication and Common Air API Headers . Query Parameters None. Request Body Show Ancillary Price Request Body Table Object Description Required/Optional OfferQueryBuildAncillaryOffersFromCatalogOfferings Top level object. Required BuildAncillaryOffersFromCatalogOfferings Top level object. Required CatalogOfferingsIdentifier Includes response transaction identifiers from the ancillary shop response. Required CatalogOfferingsIdentifier/ Identifier Sends identifiers from ancillary shop response. Required authority Send the value in CatalogOfferingsID/CatalogOffering/Identifier/authority from the Ancillary Shop response . Required value Send the value in CatalogOfferingsID/CatalogOffering/Identifier/value from the Ancillary Shop response . Required CatalogOfferingIdentifier Sends offer identifier. Required id Send value in CatalogOfferingsID/CatalogOffering/id from the Ancillary Shop response . Required ProductIdentifier Sends product identifier. Required id Send the value in CatalogOfferingsID/CatalogOffering/ProductOptions/Product/id for the product to price from the Ancillary Shop response . Required TravelerIdentifierRef Sends identifier of offers for traveler. Required id Send the value returned in CatalogOfferingsID @type CatalogOfferingsTraveler/id from the Ancillary Shop response . Required Quantity The amount of this ancillary product requested. Required Response Show Ancillary Price Response Table Object Description OfferListResponse Top level object. Returns OfferID,&#160;Identifier, and ReferenceList objects. OfferID Returns product and pricing details for requested offer. Key value pair: id : Internal offer id. Includes Identifier, Product, Price, and TermsAndConditionsFull objects. OfferID/ Identifier Identifier for the offer. Key value pairs: authority : Source of information. value : Unique system-generated identifier. OfferID/Identifier/value and /authority must be sent in any subsequent ancillary book requests. Product Array. Returns one or more instances of @type ProductAncillary to detail the ancillary product. Key value pair: id :&#160;Internal product id. Includes Quantity and Ancillary. CatalogOffering/ProductOptions/Product/id must be sent as the product identifier in subsequent ancillary price and/or book requests. Quantity The available number of this ancillary product. Ancillary Details of this ancillary. Includes Description and FlightRef. Description Supplier-provided description of this ancillary product. Key value pairs: code :&#160;Supplier code for ancillary. value :&#160;Supplier description of ancillary. subgroup :&#160;Ancillary subgroup; returned if available. NDC&#160;only; not supported for GDS. FlightRef Internal reference number for the flight on which this ancillary is available. Matches to FlightRef in ReferenceList/ReferenceListFlight. Price Price details for this ancillary. Ancillary pricing may vary by carrier for whether the price returned is per individual ancillary (e.g., price is for one checked bag when two were requested) or all requested ancillaries (e.g., price is for two checked bags when two were requested). Includes CurrencyCode, Base, TotalTaxes, TotalPrice objects. CurrencyCode The currency in which the price is returned. Unless changed in the request, the currency is the default associated with your provisioned PCC from Travelport. Key value pairs: decimalPlace: &#160;Number of decimal places in the currency. value: &#160;Currency code value. Base Base price before taxes. TotalTaxes Sum of all taxes for the product. TotalPrice Total price including base and taxes. TermsAndConditionsFull Returned with @typeTermsAndConditionsFullAncillary. Terms and conditions for this ancillary. Includes TravelerProduct and ApplicationLimit. TravelerProduct Includes TravelerIdentifierRef. TravelerIdentiferRef Returns details of the traveler the ancillary is priced for. Key value pairs: id :&#160;Internal system-generated traveler id. value :&#160;Internal system-generated traveler id. ApplicationLimit Any restrictions on the number of this ancillary product that can be purchased. Key value pairs: start :&#160;Minimum quantity that can be purchased. end : Maximum quantity that can be purchased. value : The unit represented by this quantity. Possible values are: PassengerSegment: Ancillary limit applies to each passenger at the segment level. E.g, Itinerary is LON-SIN-LON and the ancillary limit is “n” per segment per passenger. Segment: Ancillary limit applies to all passengers at the segment level (one flight, or flights under the same number). Itinerary: Ancillary limit applies to all passengers for the full itinerary. Passenger: Ancillary limit applies per passenger for the full itinerary. PassengerOD: Ancillary limit applies per passenger for the origin destination. E.g., Itinerary is LON X/SIN SYD X/SIN LON and the ancillary limit is “n” per origin destination (LON XSIN SYD) Other For example, a start quantity of 1 and end quantity of 2 with a value of Itinerary means that at least 1 but no more than 2 of this ancillary product can be purchased for the full itinerary. OfferListResponse/ Identifier Identifier for ancillary price response as a whole. Key value pairs: authority : Source of information. value : Unique system-generated identifier. CatalogOfferingsAncillaryListResponse/Identifier/value must be sent as the response identifier in subsequent ancillary price and/or book requests. ReferenceList Consolidates flight details in ReferenceList/ReferenceListFlight. Includes ReferenceListFlight. See table below. The ancillary price response returns ReferenceList/ReferenceListFlight for flight details, Note it does not return the AvailabilitySourceCode or IntermediateStop objects below. Object Description ReferenceListFlight Returns an array of Flight objects that match to the flights that make up a product. ReferenceListFlight is a common object in the model. Not all objects in this table may be returned in this specific API. Flight One instance for one flight. Key value pairs: distance : Distance covered by the flight. duration : Time of the flight in hours (H) and minutes (M). carrier : Airline carrier. number : Flight number. operatingCarrier : When the carrier has filed a codeshare operating carrier for the flight, the IATA code for that codeshare carrier. operatingCarrierName : Name of the marketing operating carrier. operatingCarrierNumber :&#160;Number of the operating carrier flight. If there is no operating carrier number, then CO2 emission estimates for operating carriers is not supported. GDS only; not returned for NDC. Returned only in Search response. equipment : Equipment model. Note that TRN, TRS, and BUS equipment codes indicate ground transportation. id : id for internal flight reference number, also used in products and offers. For GDS, formatted as the letter ‘s’+ unique numeric value, as in s1 . NDC flight ids include the NDC carrier code, as in QFs1 . subjectToGovernmentApproval : Returned with value of true when an airline has filed in its schedule that availability for a specific flight is subject to government approval. GDS only, not supported for NDC. Returned only in the Search API&#160;response. Includes Departure, Arrival, AvailabilitySourceCode, and IntermediateStop objects. Departure Departure details. Key value pairs are the location , date , time , and terminal of departure. Arrival Arrival details. Key value pairs are the location , date , time , and terminal of arrival. AvailabilitySourceCode Returned to assist in troubleshooting. Returned in the Search, Air Availability, Exchange Search, AirPrice, and Workbench Commit responses. Recommended to send in the AirPrice Full Payload and Add Offer Full Payload requests. Not returned for Ancillary Shop or Fare Rules. GDS&#160;only; not supported for NDC. Supported values and definitions for AvailabilitySourceCode: A:&#160;AVS (availability and schedules) B:&#160;Travelport cache C:&#160;AVS D:&#160;Direct Access E:&#160;Travelport cache F: Travelport cache G: Travelport cache H: Travelport cache I: Travelport cache K: Travelport cache L:&#160;Last seat availability M:&#160;Unknown source O: Travelport cache P: Travelport cache Q:&#160;Travelport cache S:&#160;Seamless T:&#160;Travelport cache U:&#160;Unknown source X:&#160;Customer reusing availability data from customer cache (data originally obtained from Travelport) Y:&#160;Customer reusing data obtained from another system (e.g., another GDS) (data may be fresh or stored in customer cache) Z:&#160;Customer sold from e-streamed data stored in customer cache IntermediateStop Returned if the flight has a technical stop but does not incur a change in flight number. Returned in the Search, AirPrice, Exchange Search responses. In ReservationRetrieve, IntermediateStop is returned in Offer/Product/Flight instead of ReferenceListFlight. Not returned for Ancillary Shop or Fare Rules. Key value pairs: arrivalFlightDuration: Length in hours and minutes of the flight arriving at the intermediate stop. departureFlightDuration: Length in hours and minutes of the flight departing the intermediate stop. duration: Length in hours and minutes between the arrival and departure at the intermediate stop. equipment : Equipment model, if there is a change of equipment during the stop. arrivalDate: Arrival date for stop. departureDate: Departure date of stop. arrivalTime: Arrival time for stop. departurelTime: &#160; sic; note spelling of departurelTime with the letter l between departure and time Departure time for stop. arrivalTerminal: Arrival terminal for stop. departureTerminal: Departure terminal for stop. value: The code for the airport where the intermediate stop occurs. Example Request For additional examples, download the developer toolkits and see Using Postman and Developer Toolkits . Show Example Ancillary Price Request The following ancillary price requests pricing confirmation on offer SQa1 and product SQpa0 for traveler CT1 . { "OfferQueryBuildAncillaryOffersFromCatalogOfferings": { "BuildAncillaryOffersFromCatalogOfferings": [ { "@type": "BuildAncillaryOffersFromCatalogOfferings", "CatalogOfferingsIdentifier": { "Identifier": { "authority": "Travelport", "value": "653f9c6f-4618-44e5-8f2d-2a23dd6fcc40_PC" } }, "CatalogOfferingIdentifier": { "id": "SQa1" }, "ProductIdentifier": { "id": "SQpa0" }, "Quantity": 1, "TravelerIdentifierRef": { "id": "CT1" } } ] } } Example Response Show Example Ancillary Price Response The following example response confirms pricing for two paid bags. { "OfferListResponse": { "OfferID": [ { "@type": "Offer", "id": "SQa1", "Identifier": { "authority": "SQ", "value": "U1AyRi05NTMxNzAwNTk0NTYxODUwNjY5LTl8U1AyRi05NTMxNzAwNTk0NTYxODUwNjY5LTktMnxBRFR8UEFYMXxTUlYwfFNFRzJ8MXxTUQ==" }, "Product": [ { "@type": "ProductAncillary", "id": "SQpa0", "Quantity": 1, "Ancillary": { "@type": "AncillaryAir", "Description": [ { "code": "XBAG", "value": "ONE KILOGRAM BAGGAGE" } ], "FlightRef": [ "SQs1" ] } } ], "Price": { "@type": "PriceDetail", "CurrencyCode": { "value": "SGD" }, "Base": 15.5, "TotalTaxes": 0, "TotalPrice": 15.5, "PriceBreakdown": [ { "@type": "PriceBreakdownAncillary", "quantity": 1, "Amount": { "@type": "Amount", "CurrencyCode": { "value": "SGD" }, "Base": 15.5, "Taxes": { "@type": "Taxes", "TotalTaxes": 0 }, "Total": 15.5 } } ] }, "TermsAndConditionsFull": [ { "@type": "TermsAndConditionsFullAncillary", "ApplicationLimit": { "start": "1", "end": "1", "value": "PassengerSegment" } } ] } ], "Identifier": { "authority": "Travelport", "value": "653f9c6f-4618-44e5-8f2d-2a23dd6fcc40_PC" }, "ReferenceList": [ { "@type": "ReferenceListFlight", "Flight": [ { "@type": "Flight", "duration": "PT3H55M", "carrier": "SQ", "number": "883", "id": "SQs1", "Departure": { "@type": "Departure", "location": "HKG", "date": "2022-06-13", "time": "14:25:00" }, "Arrival": { "@type": "Arrival", "location": "SIN", "date": "2022-06-13", "time": "18:20:00" } } ] } ] } }

## Literal `<pre>` excerpts from HTML

### Block 1

```
{
 "OfferQueryBuildAncillaryOffersFromCatalogOfferings": {
  "BuildAncillaryOffersFromCatalogOfferings": [
   {
    "@type": "BuildAncillaryOffersFromCatalogOfferings",
    "CatalogOfferingsIdentifier": {
     "Identifier": {
      "authority": "Travelport",
      "value": "653f9c6f-4618-44e5-8f2d-2a23dd6fcc40_PC"
     }
    },
    "CatalogOfferingIdentifier": {
     "id": "SQa1"
    },
    "ProductIdentifier": {
     "id": "SQpa0"
    },
    "Quantity": 1,
    "TravelerIdentifierRef": {
     "id": "CT1"
    }
   }
  ]
 }
}
```

### Block 2

```
{
 "OfferListResponse": {
  "OfferID": [
   {
    "@type": "Offer",
    "id": "SQa1",
    "Identifier": {
     "authority": "SQ",
     "value": "U1AyRi05NTMxNzAwNTk0NTYxODUwNjY5LTl8U1AyRi05NTMxNzAwNTk0NTYxODUwNjY5LTktMnxBRFR8UEFYMXxTUlYwfFNFRzJ8MXxTUQ=="
    },
    "Product": [
     {
      "@type": "ProductAncillary",
      "id": "SQpa0",
      "Quantity": 1,
      "Ancillary": {
       "@type": "AncillaryAir",
       "Description": [
        {
         "code": "XBAG",
         "value": "ONE KILOGRAM BAGGAGE"
        }
       ],
       "FlightRef": [
        "SQs1"
       ]
      }
     }
    ],
    "Price": {
     "@type": "PriceDetail",
     "CurrencyCode": {
      "value": "SGD"
     },
     "Base": 15.5,
     "TotalTaxes": 0,
     "TotalPrice": 15.5,
     "PriceBreakdown": [
      {
       "@type": "PriceBreakdownAncillary",
       "quantity": 1,
       "Amount": {
        "@type": "Amount",
        "CurrencyCode": {
         "value": "SGD"
        },
        "Base": 15.5,
        "Taxes": {
         "@type": "Taxes",
         "TotalTaxes": 0
        },
        "Total": 15.5
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
   "value": "653f9c6f-4618-44e5-8f2d-2a23dd6fcc40_PC"
  },
  "ReferenceList": [
   {
    "@type": "ReferenceListFlight",
    "Flight": [
     {
      "@type": "Flight",
      "duration": "PT3H55M",
      "carrier": "SQ",
      "number": "883",
      "id": "SQs1",
      "Departure": {
       "@type": "Departure",
       "location": "HKG",
       "date": "2022-06-13",
       "time": "14:25:00"
      },
      "Arrival": {
       "@type": "Arrival",
       "location": "SIN",
       "date": "2022-06-13",
       "time": "18:20:00"
      }
     }
    ]
   }
  ]
 }
}
```

