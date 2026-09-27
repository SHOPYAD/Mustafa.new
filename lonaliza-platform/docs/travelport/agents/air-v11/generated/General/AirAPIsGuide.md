# Air APIs Guide

## Source

- **Local HTML:** `docs/travelport/travelport api guide/travelport-airapi json/support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/General/AirAPIsGuide.html` (UTF-8 mirror)
- **Official base:** `https://support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/` + same relative path

## Plaintext extract (lossy)

Air APIs Guide Skip To Main Content Account Settings Logout placeholder Account Settings Logout Filter: All Files Submit Search Filter: All Files Submit Search Air APIs Guide This guide provides a general introduction to using the Air APIs to search for and book air travel. It discusses basic travel terms you need to know to develop your applications and how those terms are represented in the responses. It also summarizes the general workflow from searching for flights through ticketing. The terms and concepts in this guide are essential to understanding travel development for all the Air APIs. After this guide, continue with the Air Search Guide . Also see Using the Help for details about the information in this online help. In this guide: Basic Concepts PTCs, Service Levels, Branded Fares Itinerary, Leg, Segment Offers in the Air APIs Offers in Search Responses Offers in Booking, Ticketing, and Exchanges/Refunds Reference Payload and Full Payload Request Formats Identifiers in the Air APIs GDS&#160;and NDC Content Identifiers for NDC and GDS JSON APIs List by Functional Area JSON APIs&#160;End-to-End Workflows Minimum Required Workflow Full Workflow with Optional Steps Basic Concepts First let's look at terms used across the travel industry. These help you understand the request and response structure of all Air APIs. PTCs, Service Levels, Branded Fares The Travelport Search APIs support any of the following types of itineraries. An itinerary is the entire trip a traveler wants to book. One way:&#160;Trip to a single destination; e.g., LHR &gt; CDG. Round trip: Trip to a single destination and back to the original point of departure; e.g., LHR &gt; CDG and CDG &gt; LHR Multi-city: Trip to multiple destinations; e.g., LHR &gt; CDG &gt; AMS &gt; BCN. Open-jaw: Trip to one destination and a return from another city; e.g., LHR &gt; CDG and AMS &gt; LHR. The airline industry categorizes travelers under various passenger type codes (PTCs) . The most common PTCs are Adult (ADT), Child (CNN), and Infant (INF). You can request a maximum of nine passengers in one search. An airfare with certain features included in the price is a branded fare . For example, a branded fare may include a seat assignment choice and wifi at no extra charge. An upsell is a fare presented along with the base fare as a higher level of service, and is usually a branded fare. Upsell to a higher brand is an integral part of branding. Branded fares and upsells are detailed in the Air Search Guide. Airlines provide different service levels , grouping services into cabin classes . The following are standard cabin classes: Economy: Travelers receive standard services with no perks. Identified by cabin class code Y or the word COACH . Premium Economy: Travelers receive a better seating preference than Economy class. Identified by cabin class code W . Business: Travelers receive more service than economy but fewer than First. Identified by cabin class code C. First:&#160;Travelers receive upgraded service; the most expensive fares. Identified by cabin class code F. Itinerary, Leg, Segment Next, let's look at the parts of an itinerary, sometimes called a journey. To illustrate let's use an example round-trip booking from LAX&gt;MSP: The trip starts with a direct flight from LAX&gt;MSP. The return has a change of planes in DEN, so MSP&gt;DEN&gt;LAX. In our example, the itinerary includes everything: LAX&gt;MSP and MSP&gt;DEN&gt;LAX. A leg is the part of the itinerary from one origin to one destination. A leg is also called an origin and destination (O&amp;D) pair. Our example has two legs: LAX&gt;MSP is the first leg, also called the outbound leg. MSP&gt;DEN&gt;LAX is the second leg, also called the return or inbound leg. A segment is one single flight on a leg. In our example, the first leg has one segment (LAX&gt;MSP). The return leg has two segments (MSP&gt;DEN and DEN&gt;LAX) because there is a change of plane. A flight on a single segment can have one or more stops that don't require a change of plane. In this case the flight number remains the same. This is called a direct flight and is not the same as a nonstop flight. A nonstop flight does not make any stop between the origin and destination. Offers in the Air APIs Now let's look at how these terms are represented in the actual JSON code used to request and return air travel. Here's the basic workflow for travel booking, described later in Workflow Summary : Search :&#160;Enter itinerary details and shop for flights. Price : Confirm pricing on flights (optional in some cases; required for NDC and some low-cost carriers). Book : A workflow of linked API calls to establish a workbench session, add an offer In the Search APIs, an offer is a product available at a specific price under a set of terms and conditions. An offer includes the flight or connecting flights for one leg of the itinerary, plus a service level that includes the cabin class and any fare codes that may apply. At booking, the selected offer from the Search response - including the flight/s, service level, price, terms and conditions, and brand if applicable - is converted into a single Offer object that is subsequently returned for that booking. and traveler data to the workbench, and commit the workbench to create a held booking, aka reservation. Ticket : Issue tickets for the held booking. Offers in Search Responses In the Search APIs, the various options a customer can choose from are called offers . Offers are returned in the responses through the full workflow. Starting with the Search APIs, a search returns multiple offers for each leg on the itinerary, depending on availability on that route. Offers for each leg The flight or connecting flights between one origin and destination pair. For example, on a round-trip flight, LAX &gt; MSP could be the first leg (aka outbound leg) and MSP &gt; DEN &gt; LAX could be the second leg (aka inbound leg). The APIs use the term product for one leg of the itinerary. are returned in the CatalogProductOffering object. Key point: One leg = CatalogProductOffering object In the example below, one instance of CatalogProductOffering is the O&amp;D&#160;pair ORD &gt; ATL. The second instance is the return/inbound leg ATL &gt; ORD. Show Example CatalogProductOffering objects for two legs The core of each offer is the product , which is the flight or connecting flights on that leg plus a service level. The service level includes the cabin class and any applicable fare codes. Key point: Flight + service level = Product object Each offer presents a product that's available at a specific price under a set of terms and conditions. These may include minimum stay requirements or the number of checked bags allowed. In the Search APIs, this information is combined in the ProductBrandOffering object. Key point: Product + price +&#160;terms and conditions = ProductBrandOffering object This concept of an offer continues throughout the JSON API booking workflow and is frequently used in this online help. Show Example ProductBrandOffering object for one offer The same product may be returned in multiple offers at different price points and terms and conditions, and included in various brands. Instead of repeating all this common information in each offer, the Search APIs consolidate it in the ReferenceList object later in the response. So, each offer returns a price and cross-references to the details of its product, brand, and set of terms and conditions. For example, product details are returned in ReferenceListProduct. The example code below shows all the information returned for one product. The product p0 provides the specific class of service, cabin class, and the fare basis code and type, and cross-references to a set of connecting flights. Flight details are returned in instances of ReferenceListFlight for s16 and s17 (not shown here). Show Example Product details { "@type": "ReferenceListProduct", "Product": [ { "@type": "ProductAir", "totalDuration": "PT6H13M", "id": "p0", "Quantity": 1, "FlightSegment": [ { "@type": "FlightSegment", "sequence": 1, "connectionDuration": "PT1H11M", "boundFlightsInd": true, "Flight": { "@type": "FlightID", "FlightRef": "s16" } }, { "@type": "FlightSegment", "sequence": 2, "Flight": { "@type": "FlightID", "FlightRef": "s17" } } ], "PassengerFlight": [ { "@type": "PassengerFlight", "passengerQuantity": 1, "passengerTypeCode": "ADT", "FlightProduct": [ { "@type": "FlightProduct", "segmentSequence": [ 1, 2 ], "classOfService": "C", "cabin": "First", "fareBasisCode": "BAA0AFFN", "fareType": "PublicFare", "Brand": { "@type": "BrandID", "BrandRef": "b0" } } ] } ] }, Offers in Booking, Ticketing, and Exchanges/Refunds After the Search and optional price confirmation steps, book the flight/s: Initiate a workbench session. Send a selected offer from a Search response. Send traveler details. Commit the workbench to create a booking. At that point the offer from the Search response - including the service level, price, and terms and conditions - is converted into a single Offer object. This offer data remains the same for all subsequent calls for that booking, including ticketing, modifications, and exchanges/refunds. Key point: Product + price +&#160;terms and conditions = Offer object in Book and following transactions The example below shows the structure of the entire Offer object after the booking commit. The single Identifer/value a83529a3-b291-493c-bdde-e2135f8eb3a4 and Offer/id offer_1 can be used from this point on to refer to that offer as a whole. In addition, the Receipt object returns a booking confirmation code, also called a locator code or PNR. Show Example Offer object after booking selected offer The example below shows the complete JSON&#160;code of the booking commit response. Show Example Book Commit response - consolidated offer details { "ReservationResponse": { "@type": "ReservationResponse", "Reservation": { "@type": "Reservation", "Offer": [ { "@type": "Offer", "id": "offer_1", "Identifier": { "authority": "Travelport", "value": "a83529a3-b291-493c-bdde-e2135f8eb3a4" }, "Product": [ { "@type": "ProductAir", "id": "product_1", "FlightSegment": [ { "@type": "FlightSegment", "id": "FlightSegment_01", "sequence": 1, "connectionDuration": "PT50M", "boundFlightsInd": true, "Flight": { "@type": "FlightDetail", "duration": "PT2H22M", "carrier": "UA", "number": "763", "equipment": "777", "id": "Flight_01", "Departure": { "@type": "Departure", "location": "ORD", "date": "2023-03-03", "time": "09:45:00" }, "Arrival": { "@type": "Arrival", "location": "ATL", "date": "2023-03-03", "time": "13:07:00" }, "AvailabilitySourceCode": "P" } }, { "@type": "FlightSegment", "id": "FlightSegment_02", "sequence": 2, "Flight": { "@type": "FlightDetail", "duration": "PT1H57M", "carrier": "UA", "number": "2290", "equipment": "319", "id": "Flight_02", "Departure": { "@type": "Departure", "location": "ATL", "date": "2023-03-03", "time": "13:57:00" }, "Arrival": { "@type": "Arrival", "location": "DEN", "date": "2023-03-03", "time": "16:54:00" }, "AvailabilitySourceCode": "P" } } ], "PassengerFlight": [ { "@type": "PassengerFlight", "passengerQuantity": 1, "passengerTypeCode": "ADT", "FlightProduct": [ { "@type": "FlightProduct", "segmentSequence": [ 1, 2 ], "classOfService": "S", "cabin": "Economy" } ] } ] } ], "Price": { "@type": "PriceDetail", "id": "PriceDetail_1", "CurrencyCode": { "value": "AUD" }, "Base": 272, "TotalTaxes": 55.3, "TotalFees": 0, "TotalPrice": 327.3, "PriceBreakdown": [ { "@type": "PriceBreakdownAir", "quantity": 1, "requestedPassengerType": "ADT", "Amount": { "@type": "Amount", "currencySource": "Charged", "approximateInd": true, "CurrencyCode": { "decimalPlace": 2, "value": "AUD" }, "Base": 272, "Taxes": { "@type": "TaxesDetail", "TotalTaxes": 55.3, "Tax": [ { "currencyCode": "AUD", "taxCode": "AY", "value": 8.1 }, { "currencyCode": "AUD", "taxCode": "US", "value": 20.4 }, { "currencyCode": "AUD", "taxCode": "XF", "value": 13 }, { "currencyCode": "AUD", "taxCode": "ZP", "value": 13.8 } ] }, "Total": 327.3 }, "FiledAmount": { "currencyCode": "USD", "decimalPlace": 2, "value": 189.77 } } ] }, "TermsAndConditionsFull": [ { "@type": "TermsAndConditionsFullAir", "Identifier": { "authority": "Travelport", "value": "cc6d639c-a1dc-4226-be71-ac3d62806d88" } }, { "@type": "TermsAndConditionsFullAir", "ExpiryDate": "2023-02-02T23:59:00Z", "PaymentTimeLimit": "2023-02-02T23:59:00Z" } ] } ], "Traveler": [ { "@type": "Traveler", "birthDate": "1986-11-11", "gender": "Male", "passengerTypeCode": "ADT", "id": "travelerRefId_1", "Identifier": { "authority": "Travelport", "value": "0d6b4ede-db45-4bfa-bdd6-68e04e795278" }, "PersonName": { "@type": "PersonName", "Given": "TESTFIRST", "Surname": "TESTLAST" }, "Telephone": [ { "@type": "TelephoneDetail", "countryAccessCode": "1", "phoneNumber": "212456121", "id": "telephone_1", "cityCode": "ORD", "role": "Home" } ], "Email": [ { "value": "Traveler*On*e@gmail.com" } ], "TravelDocument": [ { "@type": "TravelDocumentDetail", "docNumber": "A123123", "docType": "Passport", "expireDate": "2033-01-31", "issueCountry": "US", "birthDate": "1986-11-11", "Gender": "Male", "PersonName": { "@type": "PersonName", "Given": "TESTFIRST", "Surname": "TESTLAST" } } ] } ], "Receipt": [ { "@type": "ReceiptConfirmation", "Identifier": { "authority": "Travelport", "value": "eccd6c3e-f9c3-428c-94e0-cf0b604d8af6" }, "Confirmation": { "@type": "ConfirmationHold", "Locator": { "source": "1G", "value": "3HQHK3" }, "OfferStatus": { "@type": "OfferStatusAir", "StatusAir": [ { "flightRefs": [ "Flight_01", "Flight_02" ], "code": "HK", "value": "Confirmed" } ] } } }, { "@type": "ReceiptConfirmation", "Identifier": { "authority": "Travelport", "value": "1738f433-7f18-4f9b-9665-cc7e804f22ba" }, "Confirmation": { "@type": "ConfirmationHold", "Locator": { "source": "UA", "value": "IYF0MD" } } } ], "ReservationComment": [ { "@type": "ReservationComment", "commentSource": "Agency" } ] }, } }, Reference and Full Payload Requests Using the identifiers detailed above, many of the Air APIs allow you to send information either by referring to a previous result. Several APIs also support sending full details instead. Reference payload request : Sends reference identifiers from a previous response. Supported for NDC and GDS. Full payload request : Sends full details without a reference to any previous response. Can be used to send information returned in a previous JSON API&#160;response or from a non-Travelport source. The Air APIs provide support for NDC only through reference payload requests that refer to previous responses in the workflow. For this reason, full payload requests are not supported for NDC in most cases. The examples below show a reference payload Add Offer request, and then a full payload Add Offer request. The reference payload example sends response, offer, and product identifiers from a cached, previous AirPrice response while the second, full payload example sends complete flight details. Show Example reference payload request for Add Offer { "OfferQueryBuildFromCatalogProductOfferings": { "BuildFromCatalogProductOfferingsRequest": { "@type": "BuildFromCatalogProductOfferingsRequestAir", "CatalogProductOfferingsIdentifier": { "Identifier": { "value": "1fceb004-aaca-4657-930a-cb6304fa89e2" } }, "CatalogProductOfferingSelection": [ { "CatalogProductOfferingIdentifier": { "Identifier": { "value": "QF_CPO0" } }, "ProductIdentifier": [ { "Identifier": { "value": "QFp0" } } ] }, { "CatalogProductOfferingIdentifier": { "Identifier": { "value": "QF_CPO1" } }, "ProductIdentifier": [ { "Identifier": { "value": "QFp24" } } ] } ] } } } Show Example full payload request for Add Offer { "OfferQueryBuildFromProducts": { "BuildFromProductsRequest": { "@type": "BuildFromProductsRequestAir", "PassengerCriteria": [ { "number": 1, "age": 25, "passengerTypeCode": "ADT" } ], "ProductCriteriaAir": [ { "SpecificFlightCriteria": [ { "flightNumber": "733", "carrier": "QF", "departureDate": "2022-01-09", "departureTime": "08:35:00", "arrivalDate": "2022-01-09", "arrivalTime": "10:10:00", "from": "SYD", "to": "ADL", "classOfService": "Q", "cabin": "Economy", "segmentSequence": 1, "brandTier": "1" }, { "flightNumber": "680", "carrier": "QF", "departureDate": "2022-01-09", "departureTime": "12:05:00", "arrivalDate": "2022-01-09", "arrivalTime": "13:50:00", "from": "ADL", "to": "MEL", "classOfService": "Q", "cabin": "Economy", "segmentSequence": 2, "brandTier": "1" } ] }, { "SpecificFlightCriteria": [ { "flightNumber": "402", "carrier": "QF", "departureDate": "2022-01-16", "departureTime": "06:00:00", "arrivalDate": "2022-01-16", "arrivalTime": "07:25:00", "from": "MEL", "to": "SYD", "classOfService": "Q", "cabin": "Economy", "segmentSequence": 1, "brandTier": "1" } ] } ] } } } Identifiers in the Air APIs The Air APIs rely on several types of identifiers used for different purposes: Troubleshooting and tracking ids : The JSON &#160; Air APIs include two objects that can be used to track API calls throughout the workflow . First is the transactionId object returned under the first top-level object of every response. This unique system-generated ID is generated by the JSON &#160;APIs and returned automatically. The same value is returned for all API calls that are connected in a workflow, such as if a reference AirPrice request is sent after a Search request, or if a series of API&#160;calls are made in the workbench. The transaction ID&#160;is returned in two places:&#160;the transactionId object and the the E2EtrackingId header field. Optionally, developers can send their own custom trace ID in the traceID field in the header to serve as their own tracking number; if a traceId is sent, all responses in the workflow return that string in the traceId object. In the example below, no trace ID was sent in the request header so only transactionId is returned. For details see Transaction and Trace IDs . Long identifiers : Many objects in the same response return an identifier in Identifier/value . This is always a long system-generated string, for example, 3cecf1be-0b21-4881-8f33-ae11c8d7b708 . Such identifier values are unique within the same transaction and across all Search transactions. These identifiers must frequently be sent in subsequent reference payload requests to refer to data in a preceding response. Short reference ids : An id is an internal reference number in the id object and is always a short, system-generated string, such as p1 or SQ_CPO1 . An id is unique within the response but not across multiple responses. This type of id is used to cross-reference details in a offer with consolidated reference information in the same response for offers, products, brands, flights, etc., or to provide a short identifier for an object, such as Offer/id offer_1 . Be sure to code your API to send the correct id and/or identifier values from the response when required in a subsequent request. These mappings are noted in the API&#160;references for each API. The following example shows several types of identifiers in a Search API&#160;response. Show Example Identifiers GDS and NDC Content The Air APIs support both NDC&#160;and GDS content, or simply NDC and GDS. These terms refer to the content distribution method: GDS stands for Global Distribution System. A GDS aggregates and distributes air, hotel, and car rental content such as schedules, fares, and upsells. Travelport owns the Galileo, Worldspan, and Apollo GDSs, which are also known by the IATA abbreviations 1G, 1P, and 1V. NDC is for New Distribution Capability,&#160;a program launched by the International Air Transport Association (IATA), the trade association for the world's airlines. NDC distributes content directly from airlines to online travel agencies. NDC content is provided and fulfilled directly by the airline, and may include differentiated content available only through the airlines' direct channels. Although most workflows, requests, and responses are the same for both&#160;GDS&#160;and NDC, airline-specific processes do create some differences. Some functionality is supported only for NDC or only for GDS. The NDC Guide compares NDC and GDS and details high-level differences by API. Individual API&#160;references provide object-level details on differences in usage or responses. Because NDC is only available to provisioned customers, the online help has a separate NDC top-level menu to group information that is applicable only to NDC. If the online help doesn't include the text GDS only; not supported for NDC or vice versa, the functionality presented is supported for both NDC and GDS in the same way. Any differences in NDC and GDS functionality are noted where applicable. To access NDC&#160;content you must be provisioned for NDC with Travelport and registered with the NDC&#160;airline. Content for both NDC&#160;and GDS in the JSON &#160;APIs is sourced from the Galileo GDS (Global Distribution System) for most customers. NDC content from the Apollo and Worldspan GDSs is available to specifically provisioned customers. See the NDC Guide for Apollo and Worldspan . Identifiers for NDC and GDS The Air APIs APIs return slightly different identifiers for NDC&#160;and GDS. In the short ids for brands, flights, terms and conditions, etc., NDC incorporates the carrier code and GDS does not.&#160;For example, NDC products on Singapore Airlines are numbered SQp0, SQp1, and so on., while GDS product identifiers are p0, p1, and so on. Air APIs List by Functional Area The following table lists the general areas of the JSON Air APIs and summarizes the functionality available in each. This general description does not cover all possible options. See the workflow diagrams in the following section. Also see the linked guides (guides provide a functional overview and basic usage information for each type of API) and the API&#160;references (a full technical reference for every API, including endpoints, headers, and object-level details such as supported formats and values). Step Air APIs Description Associated Guide Search &#160; Search Next Leg Search Flight Specific Search Air Availability Search for flights for either the entire itinerary at once (Search API), or the first leg and then the subsequent leg (Search +&#160;Next Leg Search APIs). Flights are returned as offers in the search results. If desired, use the Flight Specific Search API to return additional upsell options on selected flights. Alternately, you can use Air Availability to focus your search on availability rather than cost. Air Availability returns flights along with seat availability by class of service. It does not return pricing information. Air Search Guide Price AirPrice Confirm pricing on a selected offer. Optional for most carriers; required for some NDC and low-cost carriers. Air Pricing Guide Fare Rules Fare Rules Request fare rules by type (short, long, structured). Optional. Fare Rules Guide Book Create Initial Workbench Add Offer Add&#160;Traveler Workbench Commit Reservation Retrieve Establish a workbench session for sending requests to book an offer: Initiate a workbench session. Add the offer you want to book using either of the following: Send Add Offer with reference identifiers from for the offer to book from a previous Search or AirPrice response. Reference payload request. Send Add Offer with all required itinerary details. Full payload request. Can be sent with or without first using the JSON Search APIs. Add traveler details to the booking using either of the following: Send Add Traveler with required traveler details. If your agency already has traveler details stored in the Travelport host system, you can send Host Profile Move to copy traveler details from the host into the JSON API&#160;booking workbench. Commit the workbench to create a held booking, or reservation. Booking Guide Seats Seat Map Seat Book Optional. You can check seat availability and book seats at various points in the workfow. Seats Guide Ancillaries Ancillary Shop Ancillary Price Ancillary Book Optional. You can shop for and book paid ancillaries such as paid baggage at various points in the workfow. Ancillary and EMD Guide Remarks Various Traveler and Remarks payloads Optional. Several APIs support adding special service requests and remarks at various points in the workflow. Some remarks are required by certain carriers. Remarks &amp;&#160;Service Requests Guide &amp; API&#160;Reference Custom Rules Custom&#160;Rule APIs Optional. If your agency has configured custom rules in a separate booking file management tool, you can add them to bookings to validate against specific criteria when you commit the workbench. Booking Guide Travel Agency Details Travel Agency APIs Optional. Add and manage travel agency details for your bookings. Travel Agency Details API&#160;Reference Travel Agency Corporate ID API Reference Ticket Post-Commit Workbench Add Form of Payment (FOP) Add&#160;Payment Workbench Commit A booking must be ticketed within a certain time or it expires. Send requests in a workbench to ticket a held booking: Initiate a workbench session. Send details for the form of payment to use. Send that payment. Commit the workbench to issue tickets. Ticketing Guide Air APIs End-to-End Workflows Minimum Required Workflow The following diagram shows the API requests in the minimum required workflow to search, book, and ticket a flight in the Air APIs. The Air APIs provide additional options for some of these steps; see the preceding section for a full list. Each box in the diagram represents one API call in the workflow. Note that the above Air APIs workflow uses reference payload requests, which send identifiers to select an offer from previous&#160;API responses. Optionally, you can send the AirPrice full payload request and omit the Search request, or send an Add Offer full payload request and omit the Search and AirPrice requests. This allows you to source your flights outside the JSON APIs and skip these steps of the JSON workflow. Full Workflow with Optional Steps The following diagram shows all required API&#160;requests in the JSON &#160;API workflow plus several optional steps. Each box in the diagram represents one API call in the workflow. Some steps can take place at other points in the workflow; see these guides for support details: See All Book and Ticketing Workflows for all book and ticketing options. Fare Rules can be requested after Search, after Price, or for an existing reservation. Seats and ancillaries can be shopped and/or added at various points in the workflow per the Seats and Ancillaries guides. Comments and special service requests can be added either in the initial booking flow or in a post-commit session. Form of payment for GDS can be added during either initial booking or ticketing. Form of payment for NDC can be added at ticketing unless you use the NDC-only Instant Pay Workflow . Note that the above Air APIs workflow uses reference payload requests, which send identifiers to select an offer from previous&#160;API responses. Optionally, you can send the AirPrice full payload request and omit the Search request, or send an Add Offer full payload request and omit the Search and AirPrice requests. This allows you to source your flights outside the JSON APIs and skip these steps of the JSON workflow.

## Literal `<pre>` excerpts from HTML

### Block 1

```
{
        "@type": "ReferenceListProduct",
        "Product": [
          {
            "@type": "ProductAir",
            "totalDuration": "PT6H13M",
            "id": "p0",
            "Quantity": 1,
            "FlightSegment": [
              {
                "@type": "FlightSegment",
                "sequence": 1,
                "connectionDuration": "PT1H11M",
                "boundFlightsInd": true,
                "Flight": {
                  "@type": "FlightID",
                  "FlightRef": "s16"
                }
              },
              {
                "@type": "FlightSegment",
                "sequence": 2,
                "Flight": {
                  "@type": "FlightID",
                  "FlightRef": "s17"
                }
              }
            ],
            "PassengerFlight": [
              {
                "@type": "PassengerFlight",
                "passengerQuantity": 1,
                "passengerTypeCode": "ADT",
                "FlightProduct": [
                  {
                    "@type": "FlightProduct",
                    "segmentSequence": [
                      1,
                      2
                    ],
                    "classOfService": "C",
                    "cabin": "First",
                    "fareBasisCode": "BAA0AFFN",
                    "fareType": "PublicFare",
                    "Brand": {
                      "@type": "BrandID",
                      "BrandRef": "b0"
                    }
                  }
                ]
              }
            ]
          },
```

### Block 2

```
{
 "ReservationResponse": {
  "@type": "ReservationResponse",
  "Reservation": {
   "@type": "Reservation",
   "Offer": [
    {
     "@type": "Offer",
     "id": "offer_1",
     "Identifier": {
      "authority": "Travelport",
      "value": "a83529a3-b291-493c-bdde-e2135f8eb3a4"
     },
     "Product": [
      {
       "@type": "ProductAir",
       "id": "product_1",
       "FlightSegment": [
        {
         "@type": "FlightSegment",
         "id": "FlightSegment_01",
         "sequence": 1,
         "connectionDuration": "PT50M",
         "boundFlightsInd": true,
         "Flight": {
          "@type": "FlightDetail",
          "duration": "PT2H22M",
          "carrier": "UA",
          "number": "763",
          "equipment": "777",
          "id": "Flight_01",
          "Departure": {
           "@type": "Departure",
           "location": "ORD",
           "date": "2023-03-03",
           "time": "09:45:00"
          },
          "Arrival": {
           "@type": "Arrival",
           "location": "ATL",
           "date": "2023-03-03",
           "time": "13:07:00"
          },
          "AvailabilitySourceCode": "P"
         }
        },
        {
         "@type": "FlightSegment",
         "id": "FlightSegment_02",
         "sequence": 2,
         "Flight": {
          "@type": "FlightDetail",
          "duration": "PT1H57M",
          "carrier": "UA",
          "number": "2290",
          "equipment": "319",
          "id": "Flight_02",
          "Departure": {
           "@type": "Departure",
           "location": "ATL",
           "date": "2023-03-03",
           "time": "13:57:00"
          },
          "Arrival": {
           "@type": "Arrival",
           "location": "DEN",
           "date": "2023-03-03",
           "time": "16:54:00"
          },
          "AvailabilitySourceCode": "P"
         }
        }
       ],
       "PassengerFlight": [
        {
         "@type": "PassengerFlight",
         "passengerQuantity": 1,
         "passengerTypeCode": "ADT",
         "FlightProduct": [
          {
           "@type": "FlightProduct",
           "segmentSequence": [
            1,
            2
           ],
           "classOfService": "S",
           "cabin": "Economy"
          }
         ]
        }
       ]
      }
     ],
     "Price": {
      "@type": "PriceDetail",
      "id": "PriceDetail_1",
      "CurrencyCode": {
       "value": "AUD"
      },
      "Base": 272,
      "TotalTaxes": 55.3,
      "TotalFees": 0,
      "TotalPrice": 327.3,
      "PriceBreakdown": [
       {
        "@type": "PriceBreakdownAir",
        "quantity": 1,
        "requestedPassengerType": "ADT",
        "Amount": {
         "@type": "Amount",
         "currencySource": "Charged",
         "approximateInd": true,
         "CurrencyCode": {
          "decimalPlace": 2,
          "value": "AUD"
         },
         "Base": 272,
         "Taxes": {
          "@type": "TaxesDetail",
          "TotalTaxes": 55.3,
          "Tax": [
           {
            "currencyCode": "AUD",
            "taxCode": "AY",
            "value": 8.1
           },
           {
            "currencyCode": "AUD",
            "taxCode": "US",
            "value": 20.4
           },
           {
            "currencyCode": "AUD",
            "taxCode": "XF",
            "value": 13
           },
           {
            "currencyCode": "AUD",
            "taxCode": "ZP",
            "value": 13.8
           }
          ]
         },
         "Total": 327.3
        },
        "FiledAmount": {
         "currencyCode": "USD",
         "decimalPlace": 2,
         "value": 189.77
        }
       }
      ]
     },
     "TermsAndConditionsFull": [
      {
       "@type": "TermsAndConditionsFullAir",
       "Identifier": {
        "authority": "Travelport",
        "value": "cc6d639c-a1dc-4226-be71-ac3d62806d88"
       }
      },
      {
       "@type": "TermsAndConditionsFullAir",
       "ExpiryDate": "2023-02-02T23:59:00Z",
       "PaymentTimeLimit": "2023-02-02T23:59:00Z"
      }
     ]
    }
   ],
   "Traveler": [
    {
     "@type": "Traveler",
     "birthDate": "1986-11-11",
     "gender": "Male",
     "passengerTypeCode": "ADT",
     "id": "travelerRefId_1",
     "Identifier": {
      "authority": "Travelport",
      "value": "0d6b4ede-db45-4bfa-bdd6-68e04e795278"
     },
     "PersonName": {
      "@type": "PersonName",
      "Given": "TESTFIRST",
      "Surname": "TESTLAST"
     },
     "Telephone": [
      {
       "@type": "TelephoneDetail",
       "countryAccessCode": "1",
       "phoneNumber": "212456121",
       "id": "telephone_1",
       "cityCode": "ORD",
       "role": "Home"
      }
     ],
     "Email": [
      {
       "value": "Traveler*On*e@gmail.com"
      }
     ],
     "TravelDocument": [
      {
       "@type": "TravelDocumentDetail",
       "docNumber": "A123123",
       "docType": "Passport",
       "expireDate": "2033-01-31",
       "issueCountry": "US",
       "birthDate": "1986-11-11",
       "Gender": "Male",
       "PersonName": {
        "@type": "PersonName",
        "Given": "TESTFIRST",
        "Surname": "TESTLAST"
       }
      }
     ]
    }
   ],
   "Receipt": [
    {
     "@type": "ReceiptConfirmation",
     "Identifier": {
      "authority": "Travelport",
      "value": "eccd6c3e-f9c3-428c-94e0-cf0b604d8af6"
     },
     "Confirmation": {
      "@type": "ConfirmationHold",
      "Locator": {
       "source": "1G",
       "value": "3HQHK3"
      },
      "OfferStatus": {
       "@type": "OfferStatusAir",
       "StatusAir": [
        {
         "flightRefs": [
          "Flight_01",
          "Flight_02"
         ],
         "code": "HK",
         "value": "Confirmed"
        }
       ]
      }
     }
    },
    {
     "@type": "ReceiptConfirmation",
     "Identifier": {
      "authority": "Travelport",
      "value": "1738f433-7f18-4f9b-9665-cc7e804f22ba"
     },
     "Confirmation": {
      "@type": "ConfirmationHold",
      "Locator": {
       "source": "UA",
       "value": "IYF0MD"
      }
     }
    }
   ],
   "ReservationComment": [
    {
     "@type": "ReservationComment",
     "commentSource": "Agency"
    }
   ]
  },
 }
},
```

### Block 3

```
{
 "OfferQueryBuildFromCatalogProductOfferings": {
  "BuildFromCatalogProductOfferingsRequest": {
   "@type": "BuildFromCatalogProductOfferingsRequestAir",
   "CatalogProductOfferingsIdentifier": {
    "Identifier": {
     "value": "1fceb004-aaca-4657-930a-cb6304fa89e2"
    }
   },
   "CatalogProductOfferingSelection": [
    {
     "CatalogProductOfferingIdentifier": {
      "Identifier": {
       "value": "QF_CPO0"
      }
     },
     "ProductIdentifier": [
      {
       "Identifier": {
        "value": "QFp0"
       }
      }
     ]
    },
    {
     "CatalogProductOfferingIdentifier": {
      "Identifier": {
       "value": "QF_CPO1"
      }
     },
     "ProductIdentifier": [
      {
       "Identifier": {
        "value": "QFp24"
       }
      }
     ]
    }
   ]
  }
 }
}
```

### Block 4

```
{
    "OfferQueryBuildFromProducts": {
        "BuildFromProductsRequest": {
            "@type": "BuildFromProductsRequestAir",
            "PassengerCriteria": [
                {
                    "number": 1,
                    "age": 25,
                    "passengerTypeCode": "ADT"
                }
            ],
            "ProductCriteriaAir": [
                {
                    "SpecificFlightCriteria": [
                        {
                            "flightNumber": "733",
                            "carrier": "QF",
                            "departureDate": "2022-01-09",
                            "departureTime": "08:35:00",
                            "arrivalDate": "2022-01-09",
                            "arrivalTime": "10:10:00",
                            "from": "SYD",
                            "to": "ADL",
                            "classOfService": "Q",
                            "cabin": "Economy",
                            "segmentSequence": 1,
                            "brandTier": "1"
                        },
                        {
                            "flightNumber": "680",
                            "carrier": "QF",
                            "departureDate": "2022-01-09",
                            "departureTime": "12:05:00",
                            "arrivalDate": "2022-01-09",
                            "arrivalTime": "13:50:00",
                            "from": "ADL",
                            "to": "MEL",
                            "classOfService": "Q",
                            "cabin": "Economy",
                            "segmentSequence": 2,
                            "brandTier": "1"
                        }
                    ]
                },
                {
                    "SpecificFlightCriteria": [
                        {
                            "flightNumber": "402",
                            "carrier": "QF",
                            "departureDate": "2022-01-16",
                            "departureTime": "06:00:00",
                            "arrivalDate": "2022-01-16",
                            "arrivalTime": "07:25:00",
                            "from": "MEL",
                            "to": "SYD",
                            "classOfService": "Q",
                            "cabin": "Economy",
                            "segmentSequence": 1,
                            "brandTier": "1"
                        }
                    ]
                }
            ]
        }
    }
}
```

