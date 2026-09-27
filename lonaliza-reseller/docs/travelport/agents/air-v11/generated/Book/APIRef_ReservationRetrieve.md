# Reservation Retrieve API&#160;Reference

## Source

- **Local HTML:** `docs/travelport/travelport api guide/travelport-airapi json/support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/Book/APIRef_ReservationRetrieve.html` (UTF-8 mirror)
- **Official base:** `https://support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/` + same relative path

## Plaintext extract (lossy)

Reservation Retrieve API&#160;Reference Skip To Main Content Account Settings Logout placeholder Account Settings Logout Filter: All Files Submit Search Filter: All Files Submit Search Reservation Retrieve API&#160;Reference Request Response Example request Example response Get book/reservation/reservations/ {LocatorCode} &#160; or book/reservation/reservations ?identifierType={ticketNumber} &#160; For {LocatorCode} &#160;send the locator code returned at booking commit or in Reservation Retrieve in Receipt/Confirmation/Locator/value. For {ticketNumber} &#160;send a ticket number on the reservation to retrieve. Either the ticket number or locator code is required. Base path: Pre-production https://api.pp.travelport.net/11/air/ Production https://api.travelport.net/11/air/ Related Content: Reservation Retrieve Guide , Booking Guide , Multi-Content Booking Guide (Air, Hotel, Car)&#160;Content , Ticketing Guide Use Reservation Retrieve to retrieve details about a booking. If the booking has been ticketed, Reservation&#160;Retrieve returns booking, payment, and ticketing details. The JSON Air APIs provide the following APIs to retrieve bookings and tickets: To retrieve all booking details, use Reservation Retrieve . Returns all booking, payment, and ticketing information currently on a booking, To retrieve a list of all ticket numbers on a booking, use Ticket List . To retrieve details for all tickets associated with a booking (GDS&#160;only), or for a single ticket for NDC, use Ticket Retrieve . To return a list of documents on a booking, such as tickets, invoices, MCOs, and EMDs, use Document List . To return histories of up to six documents on a booking, such as tickets, invoices, MCOs, and EMDs, use Document History . Reservation Retrieve and Post-Commit Workbench return air, hotel, and/or car segments for any reservation that includes that content, called a multi-content booking . All segments must have been booked with the JSON Air APIs, JSON Hotel APIs , JSON Car APIs (release pending), or a Travelport+ terminal program. You can add either GDS or&#160;NDC air offers to a hotel and/or car booking, but not both. See the Multi-content Booking Guide (Air, Hotel, Car) for workflows and examples. Request As part of the request requirements, also see Authentication and Common Air API Headers . Query Parameters Parameter Description Required/Optional TicketOrLocatorCode Sends the record locator to retrieve reservation details. Sends the ticket number to retrieve reservation details for a reservation or ticketed itinerary. The response is the same as for a reservation retrieve request sending the ticket number. Example: https://api.travelport.com/11/air/book/reservation/reservations/2BPSMS Either ticket number or record locator is required identifierType GDS&#160;only; not supported for NDC. Sends the ticket number to retrieve reservation details for a ticketed itinerary. The response is the same as for a reservation retrieve request sending the record locator. Example: https://api.travelport.com/11/air/book/reservation/reservations/?identifierType=0067744639158 Either ticket number or record locator is required detailViewInd The detail view returns any document override, accounting, historical, and DOCI remarks added to the booking, and any custom rules added to a booking. Supported values: true: Returns detail view. false: Does not return detail view. Default. Optional viewBrandCompleteInfoInd GDS&#160;only; not supported for NDC. Request the return of brand attributes in the reservation retrieve. Supported values: true: Returns brand attributes in Offer/Product/PassengerFlight/FlightProduct/Brand. false: Does not return brand attributes. Default. Optional viewBaggageDetailInd &#160; GDS&#160;only; not supported for NDC. Request the return of baggage dimension and fee details in the reservation retrieve. Supported values: true: Returns additional baggage details in TermsAndConditionsFull/BaggageAllowance. false: Does not return baggage details. Default. Optional fareRuleType Enumeration for the type of fare rules requested. Supported values: Structured LongText (GDS&#160;only) ShortText Optional fareRuleCategories Enumeration. Send only if requesting structured fare rules. If fareRuleType=Structured and fareRuleCategories is not sent, all structured fare rules are returned. Supported values; only Penalties is supported for NDC: AdvanceReservationTicketing MinimumStay MaximumStay Stopovers Penalties VoluntaryRefunds VoluntaryChanges Optional includeFlightAmenitiesInd Request the return of additional flight amenities, provided by ATPCO as RouteHappy data. Supported values: true: Returns flight amenity data in ReferenceList/ReferenceListAmenity . false: Does not return flight amenity data. Default. Optional Request Body No message payload. Response The information returned in the Reservation Retrieve response varies depending on the information that has been added to the reservation at the time of retrieve, whether the reservation&#160;has been ticketed, and whether the reservation was created using the Travelport JSON APIs or another program. Reservation Retrieve, Workbench Commit, Post-Commit Workbench responses The structure detailed here for the Reservation Retrieve response is the same as for the following responses: Workbench Commit :&#160;Response is structured the same. Post-Commit Workbench Create &#160;and Workbench Retrieve : Response is structured the same plus a workbench identifier. However, the requests for Workbench Commit, Post-Commit Workbench Create, and Workbench&#160;Retrieve do not support the query parameters available in&#160;Reservation Retrieve and do not return the following: any document override, accounting, historical, and DOCI remarks any custom rules brand attributes baggage dimension and fee details fare rules ATPCO RouteHappy flight amenities ReservationResponse objects Object Description ReservationResponse Top level object for response. Includes Reservation and Result objects. May include ReferenceList. Reservation Top-level object for reservation details. See Reservation Objects table immediately below for details. Result Returns any error or warning message. See Error Messaging for details. ReferenceList Returned only when flight amenities were requested with the includeFlightAmenitiesInd query parameter. Includes ReferenceListAmenity ; see table below. Reservation objects The Reservation objects returns details on the booking. Show Response Body Table - Reservation objects The table below lists the primary objects returned in the Reservation object. See the links provided to additional tables for more detailed objects. Object Description Reservation Top-level object for reservation details. Generally includes the Identifier, Offer, Traveler, and ReservationDisplaySequence objects. Depending on the information in the reservation, may include Receipt, ReservationComment, PrimaryContact, CustomAuxiliarySegment. Key value pairs: notificationDate : For held bookings, date by which the booking must be ticketed or the offer expires. HH:MM format (e.g., "notificationDate": "2023-07-11",). GDS only; not supported for NDC. autoDeleteDate : Date the reservation will be purged and no longer available. Returned in the Reservation Retrieve, Workbench Commit, and Post-Commit Workbench responses if autoDeleteDate was sent in the Workbench&#160;Commit request to create a retention segment or a shell booking in case of certain booking failures. Identifier Identifier for Reservation object. Key value pairs: authority: Returns the value Travelport . value: &#160;Internal system-generated identifier. Offer Array. Each instance returns details about one offer on the reservation. Key value pairs: id: Internal short id for the offer. For air, an offer could be the flight/s, seats, or a paid ancillary. Additional instances of Offer are returned by default if the booking includes hotel and/or car segments. The hotel and/or car segments must have been booked with the JSON Hotel APIs or JSON Car APIs (full release pending), or a terminal program. See the Multi-Content Booking Guide (Air, Hotel, Car). For objects see the tables below for Offer object - Air , Offer&#160;object - Hotel , and Offer object - Car . For NDC only, when an airline-initiated flight change has occurred, the Reservation Retrieve response returns the Offer object with @type OfferModify and scheduleChangeInd=true to indicate a change has occurred. See NDC&#160;Flight Disruption Handing in the Air Booking Guide for details. Traveler Array. One instance for each unique traveler on the reservation. See Traveler objects table below. FormOfPayment Returned if form of payment has been added to this booking. See FormOfPayment table below. Payment Returned if payment has been made for an offer in this booking. See Payment table below. Receipt Array. Returns confirmation details, including the booking locator code. May return multiple instances with @type values ReceiptConfirmation (for booking confirmations) or ReceiptPayment (for ticketed bookings). See Receipt objects table below. ReservationComment Any remarks added to the reservation. See ReservationComment table below. TravelAgency AirReservation 25.11.58.2 and later. Any travel agency details added to the reservation. See Travel Agency Details . Group AirReservation 25.11.53 and later. Returned for a group booking, which are bookings with 10 or more passengers. Key value pairs: unallocatedPlaces : totalGroupPlaces minus the number of passengers currently on booking. totalGroupPlaces:&#160; Total number of passengers allowed on this booking. id : Internal system-generated short id. Includes the following objects: Identifier :&#160;Standard object identifier with authority (usually Travelport) and value (system-generated identifiers). GroupName :&#160;Name assigned to the group booking. Creating group bookings is not supported in the JSON APIs and must be created with a separate program. Show Example Group object "Group": { "@type": "Group", "unallocatedPlaces": 8, "totalGroupPlaces": 11, "id": "group_1", "Identifier": { "authority": "Travelport", "value": "b12f085a-c10c-4faa-bd02-aee0985d1522" }, "GroupName": "PARISREUNION" }, SpecialService Returned for special service requirements. Currently returned only for fare family brand codes that apply the SSR BFFF. See SpecialService table below. PrimaryContact Any primary contact details for the reservation. See PrimaryContact table below. CustomAuxiliarySegment &#160; Returns any auxiliary segments on a booking. Auxiliary segments can include air taxi, cars, hotels, surface transportation, and tours. TUR (tour) or SUR (surface) segments are commonly used for rail content, but can be used for other ground transportation such as taxis, surface transportation and tours. This content cannot be booked in the JSON APIs but is returned in the reservation retrieve when booked through another Travelport platform or an external provider. Includes the following objects: Identifier :Standard Travelport internal identifier with authority and value . SegmentType : Either TUR for tour or SUR for surface. StatusCode :&#160;Status code for booking. Quantity :&#160;Amount of this segment on the booking. Location :&#160;Pickup location code. Date :&#160;Start date of segment. CustomText : Any custom text. SupplierCode :&#160;Two-character provider/vendor code. May be returned as ZZ, the generic vendor code for a service provider in the Travelport system. Show Example CustomAuxiliarySegment object { "@type": "CustomAuxiliarySegment", "id": "customAuxiliarySegment_1", "Identifier": { "authority": "Travelport", "value": "27222aa9-e49f-4b14-96b6-7ebfaac75f8b" }, "SegmentType": "TUR", "StatusCode": "BK", "Quantity": 1, "Location": "RNO", "Date": "2024-11-26", "CustomText": "CF-08291647", "SupplierCode": "ZZ" }, ReservationDisplaySequence Returned to provide the chronological (by date) order of all offers on the booking. If a booking includes car and/or hotel segments along with air segments, includes those offers. Returned for all reservations even if hotel/car content is not on the booking. See Multi-Content Booking Guide (Air, Hotel, Car) for more details. Includes DisplaySequence object. May include AuxiliaryDisplaySequence, UnpricedSegmentDisplaySequence. DisplaySequence One instance for each air, hotel, or car offer on the booking. Includes the following: displaySequence : The segment number in the system. A value of 1 indicates this offer occurs first in the itinerary, 2 second, etc. OfferRef : System-generated offer id for that offer; corresponds to the value in Offer/id. ProductRef : System-generated product id that product; corresponds to the value in Offer/Product/id. Each hotel and car segment is returned as a single product. For air, each leg of the air itinerary is a single product. For example, a round-trip flight booking has two instances of DisplaySequence, each with a separate ProductRef value. Sequence :&#160;Returned for air segments; the flight sequence number in the itinerary. AuxiliaryDisplaySequence Returned if a booking includes auxiliary segments per above. One instance for each tour or surface segment on the booking. Includes the following: displaySequence : The segment number in the system. A value of 1 indicates this offer occurs first in the itinerary, 2 second, etc. CustomAuxiliarySegmentRef : System-generated id for this auxiliary segment; corresponds to the value in CustomAuxiliarySegment/id. Show Example ReservationDisplaySequence object with CustomAuxiliarySegment "ReservationDisplaySequence": { "@type": "ReservationDisplaySequence", "DisplaySequence": [ { "@type": "DisplaySequence", "displaySequence": 3, "OfferRef": "offer_1", "ProductRef": "product_1", "Sequence": 3 } ], "AuxiliaryDisplaySequence": [ { "@type": "AuxiliaryDisplaySequence", "displaySequence": 2, "CustomAuxiliarySegmentRef": "customAuxiliarySegment_1" }, { "@type": "AuxiliaryDisplaySequence", "displaySequence": 4, "CustomAuxiliarySegmentRef": "customAuxiliarySegment_2" } ] } UnpricedSegmentDisplaySequence Returned if a booking has unpriced segments (GDS&#160;only) to indicate the sequence of that content in the air itinerary. displaySequence : The segment number in the system. A value of 1 indicates this offer occurs first in the itinerary, 2 second, etc. UnpricedFlightSegmentRef : System-generated id for this unpriced segment; corresponds to the value in UnpricedFlightSegment/id. UnpricedSegments Returned if a booking has unpriced segment/s An air segment without any associated fare or pricing, generally booked for availability versus cost. Shown in the UnpricedSegments object instead of the Offer object. GDS only; NDC does not use unpriced segments. (GDS&#160;only). Includes UnpricedFlightSegment. UnpricedFlightSegment For the unpriced segment, returns standard flight details as returned in Product/FlightSegment . Offer object - Air Show Response Body Table - Offer objects for air The table below details the Offer object returned in the response for air content. See the following tables for additional details. Offer - primary objects Object Description Offer Array. Each instance returns details about one offer on the reservation. An offer could be flight/s on the itinerary, seats, or a paid ancillary. Key value pair: id: &#160;Internal short identifier for the offer. scheduleChangeInd :&#160;Returned when an airline-initiated flight change has occurred. In this case the Offer @type is OfferModify. NDC only; not supported for GDS. For NDC only, when an airline-initiated flight change has occurred, the Reservation Retrieve response returns the Offer object with @type OfferModify and scheduleChangeInd=true to indicate a change has occurred. See NDC&#160;Flight Disruption Handing in the Air Booking Guide for details. Includes Identifier, ContentSource, Product, Price, TermsAndConditionsFull. A seats offer returns seats details in the following: id: Seat offer ID. Product: Seat product details: Ancillary: Includes FlightRef, which returns a flight identifier for the flight on which this seat is assigned. SeatAssignment: &#160;The number of the selected seat for the flight in FlightRef. Net Fare Data GDS only; NDC does not support net fares. For any fare that has a private fare component, the Offer object in the reservation retrieve includes the objects NetFareInfo and FareBreakdownConstruction. The following additional details are returned in these objects in Offer: CAR and value codes: Product/PassengerFlight/carCode (Commercial Airline Agreement number) and /valueCode (value code for the fare); also returned in AirReservation. Tour code:&#160;TermsAndConditionsFull/OrganizationInformation/OrganizationIdentifier Endorsement: TermsAndConditionsFull Commission amount or percentage and net base amount: Price/PriceBreakdown/Commission Ticket base audit: NetFareInfo/TicketBaseAudit Ticket passenger: NetFareInfo/TicketBasePassenger Fare calculation indicator (FCI): FareGuaranteePolicy Fare calculation ladder: NetFareBreakdownConstruction and NetFareInfo/NetFareBreakdownConstruction If there are multiple travelers with multiple PTCs, multiple fare quotes are returned. To return net fare data the Search request must have included in PricingModifiersAir/FareSelection/fareType a value that supports net fares, either NetFaresOnly or AllFares. Identifier Identifier for this offer in the following key value pairs; note that GDS offers return the value Travelport in authority while NDC&#160;offers return the carrier code of the issuing NDC carrier: authority : Source of information. value : Unique system-generated identifier. ContentSource AirReservation 25.11.60 and later. String. Indicates whether the offer is from GDS or NDC. Supported values: GDS: The offer is from the Travelport GDS, as identified by the value Travelport in Identifier/authority (see preceding row). NDC:&#160;The offer is from the NDC&#160;carrier identified in Identifier/authority (see preceding row). Product Array. Each instance returns details for one product on this offer. For air offers, a product is one leg of the air itinerary, or it could be for seats or a paid ancillary. See Product table below. Price Total price and price breakdown for this offer. See Price table below. TermsAndConditionsFull Terms and conditions for this offer. See TermsAndConditionsFull table below. Offer/Product objects for @type ProductAir (flights) Each instance of Product returns details for one product on this offer. In the&#160; JSON APIs a product is one leg of the air itinerary, or it could be for seats or a paid ancillary. The following table outlines objects in Product with @type ProductAir for flights. Object Description Product Array. One instance for each product id. Not all objects in this table may be returned for all bookings. Key value pairs: totalDuration : Total time length of the segment in hours (H) and minutes (M). id :&#160;Product id. Includes Identifier, FlightSegment, and PassengerFlight objects. Identifier Identifier information for this instance of Product. authority : Source of information. value : Unique system-generated identifier. FlightSegment Array. One instance for each segment in the product. Key value pairs: id :&#160;Internal system-assigned short id for this segment. sequence :&#160;Order of the sequence; e.g., 1 for the first segment on the leg. boundFlightsInd : Boolean variable indicating segments are married/bound. When returned true , indicates the flight segments in a single or double connection must be sold together. When true, the indicator is returned for all leading segments on one leg of the flight, and not returned for the last segment of the bound flight leg journey, indicating where the bound flights end. For example, if an O&amp;D&#160;pair has 3 flight segments, boundFlightsInd is returned for the first two segments on that leg. If the segments are not bound, boundFlightsInd is false and not returned. GDS&#160;only; not returned for NDC. Includes Flight object. Flight Array. One instance for each flight in the product. Key value pairs: duration : Time of the flight in hours (H) and minutes (M). carrier : Airline carrier. number : Flight number. operatingCarrier : When the carrier has filed a codeshare operating carrier for the flight, the IATA code for that codeshare carrier. operatingCarrierName : Name of the marketing operating carrier. equipment : Equipment model. Note that TRN, TRS, and BUS equipment codes indicate ground transportation. id : id for internal flight reference number, also used in products and offers. subjectToGovernmentApproval : Returned with value of true when an airline has filed in its schedule that availability for a specific flight is subject to government approval. GDS only, not supported for NDC. Returned only in the Search API&#160;response. Identifier :&#160;Standard Travelport Identifier object with authority and value . Includes Flight, Departure, and Arrival objects. AvailabilitySourceCode Returned in the Workbench Commit response but not the Reservation Retrieve response. Can be used to assist in troubleshooting. GDS&#160;only; not supported for NDC. Supported values and definitions for AvailabilitySourceCode: A:&#160;AVS (availability and schedules) B:&#160;Travelport cache C:&#160;AVS D:&#160;Direct Access E:&#160;Travelport cache F: Travelport cache G: Travelport cache H: Travelport cache I: Travelport cache K: Travelport cache L:&#160;Last seat availability M:&#160;Unknown source O: Travelport cache P: Travelport cache Q:&#160;Travelport cache S:&#160;Seamless T:&#160;Travelport cache U:&#160;Unknown source X:&#160;Customer reusing availability data from customer cache (data originally obtained from Travelport) Y:&#160;Customer reusing data obtained from another system (e.g., another GDS) (data may be fresh or stored in customer cache) Z:&#160;Customer sold from e-streamed data stored in customer cache Departure Departure details. Key value pairs are the location , date , time , and terminal of departure. Arrival Arrival details. Key value pairs are the location , date , time , and terminal of arrival. IntermediateStop GDS only; not supported for NDC. Returned if the flight has a technical stop but does not incur a change in flight number. Key value pairs: arrivalFlightDuration: Length in hours and minutes of the flight arriving at the stop. departureFlightDuration: Length in hours and minutes of the flight departing the stop. duration: Length in hours and minutes on the ground of the intermediate stop. equipment : Equipment model, if there is a change of equipment during the stop. arrivalDate: Arrival date for stop. departureDate: Departure date of stop. arrivalTime: Arrival time for stop. departureTime: &#160;Departure time for stop. arrivalTerminal: Arrival terminal for stop. departureTerminal: Departure terminal for stop. value: The code for the airport where the intermediate stop occurs. PassengerFlight Returns PTC and class/fare information for each PTC. One instance per PTC. Key value pairs: passengerQuantity : Number of passengers in this PTC. passengerTypeCode : The PTC code. Includes the FlightProduct object. FlightProduct Key value pairs: segmentSequence :&#160;Order of the corresponding flight in the sequence. classOfService : Class of service code. cabin :&#160;Cabin class. fareBasisCode :&#160;Fare basis code for the flight. fareType :&#160;Indicates the fare type. Possible values are AirlinePrivateFare, AgencyPrivateFare, PublicFare, or NetFare (net fares are not supported for NDC). TicketDesignator : String. NDC&#160;only. Tour : String for tour code. NDC only. Brand The brand reference id for the fare. Key value pairs: name :&#160;The brand name assigned by the carrier. tier : Brand tier assigned by the carrier. id : Brand id assigned by the carrier. Optional Brand Attributes Returned in the Reservation Retrieve response only if brand attributes were requested using the viewBrandCompleteInfoInd query parameter . BrandAttribute Array of features that are included, chargeable, or not offered for this brand. Contains one or more instances of the two paired key value pairs classification and inclusion : classification : The brand attribute classification. Possible values are: CarryOn CheckedBag Meals SeatAssignment Rebooking Refund WiFi PersonalItem PremiumSeat LieFlatSeat inclusion : Possible values are: Included : Attribute is included in the brand at no additional charge. Chargeable : Attribute is available for the brand at a cost. Not Offered: Attribute is not available for this brand. The following Brand subattributes are returned if filed by the carrier: groupCode : Carrier group code. subGroupCode : Carrier sub-group code. subCode : Carrier sub-code. Offer/Price objects The following table applies only to airfare prices. For hotel and car prices, see Multi-Content Bookings with Hotel and Car below. Object Description Price Returns price details for the instance of Offer in which it is returned. Key value pair: id :&#160;Short system-generated id for this price. Includes Base, TotalTaxes, TotalFees, TotalPrice, CurrencyCode, and PriceBreakdown objects. The amounts in Base, TotalTaxes, TotalFees, and TotalPrice are inclusive of all travelers across all PTCs. The amounts in PriceBreakdown apply to one traveler with the PTC returned in that instance. Price is a common object in the model. Not all objects in this table may be returned in this specific response. These objects apply only to airfare prices. In a Reservation Retrieve, Price objects for other types of offers on a booking, such as seats and ancillaries, generally include only the CurrencyCode, Base, and TotalPrice objects. CurrencyCode The currency in which the price is returned. Unless changed in the request, the currency is the default associated with your provisioned PCC from Travelport. Key value pairs: decimalPlace: &#160;Number of decimal places in the currency. value: &#160;Currency code value. Base Number. Base price for all passengers with this PTC before taxes and fees. TotalTaxes Number. Sum of all taxes for this price. TotalFees Sum of all fees in this price. TotalPrice Total price for all passengers with this PTC including base cost, taxes, and fees. PriceBreakdown @type PriceBreakdownAir Array. Price breakdown by PTC, one instance returned for each PTC type. Amounts returned apply to one passenger with the PTC in this instance. Key value pairs: quantity :&#160;Number of passengers in that PTC. requestedPassengerType The PTC to which the PriceBreakdown applies. Includes the Amount object. For GDS may return FiledAmount, FareCalculation, and/or Commission per below. For NDC may return Discount, PassengerCriteriaRefs, TravelerIdentifierRef per below. In Reservation Retrieve, includes the TravelerRefs object to identify the traveler associated with this instance of PriceBreakdown. Each PriceBreakdownAir object returns pricing for one passenger of a single PTC. On multi-passenger itineraries, refer to TotalPrice for a total price for the itinerary. PriceBreakdown @type PriceBreakdownAncillaryAir If NDC&#160;bundled offers were requested in the Search request by sending includeBundledAncillariesInd, for any NDC bundled offers, PriceBreakdown returns an instance with the @type PriceBreakdownAncillaryAir to define the included ancillary and pricing. NDC only; bundled offers not supported for GDS. AirPrice reference payload response only; not returned in the Reservation Retrieve. Show Example Request "PriceBreakdown": [ { "@type": "PriceBreakdownAir", "Amount": { "@type": "Amount", "Base": 97, "CurrencyCode": { "value": "EUR" }, "Fees": { "@type": "FeesDetail", "Fee": [ { "@type": "Fee", "description": "AggregatorFee", "FeeAmountOrPercent": { "@type": "FeeAmountOrPercentAmount", "Amount": { "code": "EUR", "value": 1.33 } } } ], "TotalFees": 1.33 }, "Taxes": { "@type": "TaxesDetail", "Tax": [ { "taxCode": "YR", "value": 1.5 }, { "taxCode": "CJ", "value": 22.28 }, { "taxCode": "RN", "value": 32.05 }, { "taxCode": "VV", "value": 30.25 } ], "TotalTaxes": 86.08 }, "Total": 184.41 }, "quantity": 1, "requestedPassengerType": "ADT" }, { "@type": "PriceBreakdownAncillaryAir", "Amount": { "@type": "Amount", "Base": 14, "CurrencyCode": { "decimalPlace": 2, "value": "EUR" }, "Fees": { "@type": "FeesDetail", "TotalFees": 0 }, "Total": 14 }, "Description": { "code": "A", "ssrCode": "SEAT", "subCode": "0B5", "value": "Bundled_SEAT" }, "PassengerTypeCode": "ADT", "quantity": 1 } ], Amount Includes CurrencyCode (same as listed above), Base, Taxes, Fees, and Total objects. Base Base cost for one passenger of this PTC type. Taxes Includes TotalTaxes (sum of all individual taxes) and an array of Tax objects for individual taxes. TotalTaxes Sum total of all taxes for one passenger of this PTC type. Tax Array of Tax objects for individual taxes. Key value pairs: currencyCode : Currency code in which the value is returned. taxCode : Code for the tax. exemptInd : Returned if a tax was marked exempt in the Search, AirPrice, or Add Offer request with the TaxExemption pricing modifer. GDS only; not supported for NDC. value :&#160;Amount of the tax. Returned as 0 if a tax was marked as exempt with TaxExemption per above. description : Short summary of the tax. Note that descriptions are not returned for tax codes YQ and YR, which are fees charged by airlines and not government-imposed taxes. Fees or FeesDetail Provides breakdown of fees, if applicable. Includes TotalFees object to return sum of any fees for that PTC. May include array of Fee objects to break down individual fees. Fee Array for individual fees, if applicable. Key value pairs: feeCode : The code for the fee, such as OB for OB fees. description : Any description for that fee code. text : The amount of the fee. If OB-T fees are part of the price, those are detailed here. OB-T fees are ticketing fees independent of the form of payment. They are defined by the carrier and can be based on any of multiple criteria. Total Total of base cost and all fees and taxes for one passenger of this PTC type. TravelerRefs Returned only in Reservation Retrieve to identify the traveler associated with this instance of PriceBreakdown in case of multiple offers on the booking. NetBaseAmount Net ticket data (NTD) is returned in the AirPrice, AirReservation, Exchange Search, and Reservation Retrieve responses for any GDS fare that has a private fare component (fareType=AgencyPrivateFare). When NTD is returned, TermsAndConditionsFuill includes FareGuaranteePolicy to return the fare calculation indicator for the fare. When NTD&#160;is returned, PriceBreakdown may include NetBaseAmount. Key value pairs: currencyCode: Code for the currency in which this amount is returned. decimalPlace: &#160;Number of decimal places in the currency. value: &#160;Base amount. Not supported for NDC; NDC&#160;does not return net fares. FiledAmount Returned only in the Price APIs. GDS only; not supported for NDC. Returned when the origin currency is not the same as the PCC currency to show the currency in which the base fare has been filed. The fare returned in PriceBreakdown/Amount (above) is the equivalent currency in the PCC currency. Key value pairs: currencyCode: Code for the currency in which the base fare was filed. decimalPlace: &#160;Number of decimal places in the currency. value: &#160;Amount of the base fare. FareCalculation Returned in Price APIs, Reservation Retrieve, and Exchange Search. GDS only; not supported for NDC. For each PTC, when available, FareCalculation returns the fare calculation ladder for all public and private fare types filed by an agency or an airline. Returned as a string with unlimited bytes. Commission Returned only in the responses for the Search and Price APIs. GDS only; not supported for NDC. Any commission filed by an airline in a CAT35 fare is returned in PriceBreakdownAir/Commission. The amount is either a percent of the fare component (@type CommissionPercent and the Percent object) or an amount (@type CommissionAmount with Amount @value). Discount Returned only in the Search APIs responses. NDC&#160;only; not supported for GDS. Returned for a fare discounted off the published price, such as a promotional discount. Not returned for privately negotiated discounts such as private fares. Key value pairs: description : Text description of this discount. currencyCode : Currency code discount is returned in. decimalPlace :&#160;Number of decimal places in the currency the discount is returned in. value : Actual amount of the discount. PassengerCriteriaRefs NDC&#160;only; not supported for GDS. Returned for NDC in the price response if a traveler identifier was sent for this traveler in the Search&gt;AirPrice Reference Payload flow, or in the AirPrice full payload request. See example below. TravelerIdentifierRef NDC&#160;only; not supported for GDS. Returned for NDC in the price response if age was sent for this traveler in the Search&gt;AirPrice Reference Payload flow, or in the AirPrice full payload request. See example below. Show Example excerpt "PassengerCriteriaRefs": [ "x02" ], "TravelerIdentifierRef": { "ages": [ 11 ] } Offer/TermsAndConditionsFull objects Object Description TermsAndConditionsFull for air offers @type TermsAndConditionsFullAir For seats and ancillary offers, which return @type TermsAndConditionsFullAncillary, see Ancillary Shop Provides applicable terms and conditions for air offers. Key value pairs: secureFlightPassengerDataRequiredInd: Returned only when true to indicate the airline requires additional passenger data for one or more travelers to complete the reservation per Secure&#160;Flight Passenger Data requirements . Returned for both GDS&#160;and NDC in AirPrice; returned only for GDS in Reservation Retrieve. May include ExpiryDate, TextBlock, BaggageAllowance, ValidatingAirline, TicketingAgency, PaymentTimeLimit, TourCodes, FareRuleInfo, and Penalties objects. TermsAndConditionsFull is a common object in the model. Not all objects in this table may be returned in this specific response. Standalone Price does not return TermsAndConditionsFull. ExpiryDate The date and time the offer will expire and no longer be valid.&#160; TextBlock Includes TextFormatted object. TextFormatted Array. Returns free text terms and conditions. PaymentTimeLimit The local (per the point of sale) date and time by which the offer must be ticketed. Not returned for a ticketed booking. BaggageAllowance &#160; Array. If returned by the carrier, details about a specific type of baggage, or if a baggage embargo is in effect. The baggage allowance is displayed by baggage type with associated conditions (max pieces, weight, and unit of weight) and charges (fee with currency code), if applicable. Key value pairs, returned as available: url : Link to additional baggage policy information. passengerTypeCodes :&#160;PTC/s to which this baggage allowance applies. SegmentSequenceList :&#160;Segment/s on which this baggage allowance applies. baggageType : Type of baggage to which this allowance applies. Possible values are FirstCheckedBag , SecondCheckedBag , AdditionalBags , CarryOn , BaggageEmbargo . May include BaggageItem. In the Reservation Retrieve request, you can send the optional query parameter viewBaggageDetailInd=true to include additional baggage details in the response in TermsAndConditionsFull/BaggageAllowance. GDS only; not supported for NDC. BaggageItem Baggage-related data including measurements and baggageType may not always be returned for every offer depending on the information sent by the carrier. As returned by the carrier, baggage allowance details. Key value pairs: quantity: &#160;The number of baggage items allowed. Not returned for baggage allowances by weight. The following baggage indicators are returned as applicable in AirPrice if the Reservation Retrieve request sends detailViewInd and viewBaggageDetailInd as true: includedInOfferPrice : String. Possible values: Yes: Baggage is included in the price. No: Baggage is not included in the price; available for an additional charge. Unknown: Unknown if baggage is included in the price. soldByPieceInd : Boolean. Returned only if true. Indicates baggage allowance is by piece, such as one, two, or three pieces. soldByWeightInd : Boolean. Returned only if true. Indicates the baggage is allowed by weight, either kilograms or pounds, such as 50 pounds or 35 kilograms. Depending on the information returned by the carrier, may include the Measurement, BaggageFee, Text objects. BaggageFee For paid baggage, cost for this item of baggage: code : Currency code for cost. approximateInd : Boolean; true indicates the charge is approximate, false indicates the charge is an exact price. value : Cost of baggage in currency code above. Text Text string providing measurements for the allowed baggage dimension; for example, UPTO50LB/23KG AND UPTO62LI/158LCM . Measurement Measurement details for BaggageItem as applicable and available. Key value pairs: measurementType: Type of measurement specified, such as weight, height, width, etc. unit: Unit in which measurement is specified, such as Kilograms, Inches, Centimeters, etc. value: The number of units allowed for this measurement type. Baggage measurements are not always returned. NDC returns quantity and measurement details for FirstCheckedBag, SecondCheckedBag, AdditionalBags, and CarryOn when returned by the NDC carrier. NDC returns measurements in structured format in the Search response when the NDC carrier returns them as structured; otherwise, the measurements are returned as a text string in the Text object above. For GDS, baggage measurements are returned in Text. FareGuaranteePolicy Net ticket data (NTD) is returned in the AirPrice, AirReservation, Exchange Search, and Reservation Retrieve responses for any GDS fare that has a private fare component (fareType=AgencyPrivateFare). When NTD is returned, TermsAndConditionsFuill includes FareGuaranteePolicy to return the fare calculation indicator for the fare. Includes&#160;Code object. GDS only; NDC&#160;does not support net fares. Code Returned in FareGuaranteePolicy to identify the quote type, if that information was returned by the airline. Key value pairs: value: Quote type; 1 byte and alpha only from A to Z. A: Airline Private Fares are autopriced. Guaranteed quote with a fare that was filed with a fare distributor (ATPCO, SITA, etc.). B: Built (Manual Fare) on Galileo. C: Computer generated, not guaranteed. (Used when YY sectors are included or there is a ticket time limit within hours after reservation is made.) G: Computer generated and guaranteed quote (autopriced by Galileo). H: Host Airline. The filed fare was created as a result of the Claim PNR type function which transfers data from an airline system to Galileo for ticketing purposes. I: Invalidated. Caused by a change to the flight segments contained in the filed fare. M: Manipulated (manual fare). For example, pricing modifier(s) may have been used, such as ManualFareAdjustment. Not guaranteed. N: Outside of IATA Europe, the guarantee policy is 'guaranteed at time of ticket issue '. (When a 'G' status is not ticketed by midnight local time of the CRT location where the fare was originally stored, the status indicator changes to N and is not guaranteed.) P: Agency private fare. Not guaranteed. For example, if an airline private fare was manipulated such as if a pricing modifier was used. Agency private fares and airline private fares are autopriced in the same fare quote. Airline private fares are autopriced but have an 'hours' code for ticket time limit after reservation. R: Restored (after ticket was issued). T: Ticketed (used in the historical record to indicate ticketed). U: Un-ticketable. Applies when there is insufficient or corrupted data. X: Expired filed fare, not guaranteed. Z: Agency private fare was used with no rules override. Guaranteed. ValidatingAirline Top level object. includes ValidatingAirline. ValidatingAirline/ ValidatingAirline String. The code for the carrier on which the ticket is issued. TicketingAgency If TicketingPCC was sent in an AirPrice request to override the default ticketing agency, TicketingAgency returns the PCC of the overriding agency. Not returned if no override request was made. GDS only; not supported for NDC. Includes Code and ProductRef objects. Code PCC of the overriding or default ticket agency. ProductRef Cross-reference to the product this ticketing agency PCC applies to. PricingAgency If PricingPCC was sent in an AirPrice request to override the default pricing agency, PricingAgency returns the PCC of the overriding agency. Not returned if no override request was made. GDS only; not supported for NDC. Includes Code object. Code PCC of any overriding pricing agency. FareRuleInfo Returned in the Reservation Retrieve if requested with the fareRuleType query parameter. Returns fare rules in an array of objects in FareRuleInfo. Key value pairs: flightsRefs : Cross-reference/s to the flight/s the fare rule applies to. May include TextFareRule objects. TextFareRule Array. Returns the name and text of the rule itself: name : The name of the rule. value : The freeform text of the rule. Penalties Returns change and cancel penalties for this set of terms and conditions. For GDS, Penalties returns the most restrictive CAT16 penalty details; NDC penalty rules are not necessarily filed in a specific category (CAT). Includes the PassengerTypeCodes object and either or both the Change and Cancel objects. In the AirPrice responses for both full and reference payload, Penalties is not returned if excludePenaltiesInd=true was sent in the AirPrice request, or requested in the Search request and not overridden by excludePenaltiesInd=false in the AirPrice request. Not all NDC carriers return penalty details. Some NDC carriers may not return Change or Cancel/Penalty/Amount when a change is permitted, which means there is no charge for the change. Change Returned in Penalties object with type ChangePermitted if a change is permitted after booking. Key value pairs: penaltyTypes: Type of penalty that applies to change. Supported values: BeforeDeparture AfterDeparture Anytime NoShow Minimum Maximum ExchangeRequired ExchangeNotRequired Includes PenaltyAppliesTo and Penalty objects. Cancel Returned in Penalties object with type CancelPermitted if a cancellation is permitted after booking. Key value pairs: penaltyTypes: Type of penalty that applies to cancellation. Supported values: BeforeDeparture AfterDeparture Anytime NoShow Minimum Maximum ExchangeRequired ExchangeNotRequired Includes PenaltyAppliesTo and Penalty objects. PenaltyAppliesTo Returned in Change and Cancel objects to specify what the change or cancel penalty applies to. Supported values: OneWay RoundTrip PerTicket PerCoupon PerDirectionOfTravel Returns ProductRefs, PenaltyAppliesTo, Penalty objects. ProductRefs Cross-references the product ids these penalties apply to. SegmentSequence List of any segment sequence numbers these penalties apply to. Penalty Returned in Change and Cancel objects to specify either a percentage or amount for a change or cancel penalty. Penalty @type PenaltyPercent returns the following: Percent :&#160;Percent of fare charged for the penalty. Penalty @type PenaltyAmount returns the following: Amount :&#160;Amount of penalty fee: code : Currency code for the penalty. minorUnit : Minor unit places of currency. value . Amount of penalty in the currency code above. Some NDC carriers may not return Penalty/Amount when a change is permitted, which means there is no charge for the change. PassengerTypeCodes PTCs to which the penalties returned apply. Offer object - Hotel Multi-content bookings include air and hotel and/or car content. The hotel and/or car segments must have been booked with the JSON Hotel APIs or JSON Car APIs (full release pending), or a terminal program. See Multi-Content Booking Guide (Air, Hotel, Car) for details and examples. Just as with air, an instance of Offer is returned for each hotel booking on the reservation. Offer/Product is returned with @type ProductHospitality for hotel content. The table below outlines the Offer objects for hotel content. Price details also differ from air prices and are listed below. Show Response Body Table - Offer for hotel (Offer/Product @type ProductHospitality) Object Description Offer Array. Each instance returns details about one offer on the reservation. Key value pairs: id: Internal short id for this offer. Includes Identifier, Product, Price, and TermsAndConditionsFull objects. Identifier Identifier for this offer with the following key value pairs: authority : Source of information. value : Unique system-generated identifier. Product Array. One instance for each product on the booking. Hotel content is returned with @type ProductHospitality. Key value pairs: bookingCode : Hotel booking code. propertyName : Name of property offering this product. . guests :&#160;Number of guests on reservation. adaCompliant : Yes/No for ADA compliance. id :&#160;System-assigned product id. Includes Identifier, Quantity, PropertyKey, RoomType, Email, DateRange, TravelerContact, PropertyAddress, and Telephone objects. Product/ Identifier Identifier information for this instance of Product. authority : Source of information. value : Unique system-generated identifier. Quantity Number of rooms in Product. PropertyKey Property code details in the following key value pairs: chainCode : Chain code for the property propertyCode : Property code for the property. RoomType Room type detail. Key value pairs: numberOfUnits : The number of rooms combined to create this room type. reqdGuaranteeType : Denotes the form of guarantee for this room. Includes the RoomCharacteristics, Description, and RoomAmenity objects. RoomCharacteristics Room details. Key value pairs: category : Category of the room. smokingAllowed : Yes or No indicator for smoking. wifiIncluded : Yes or No indicator for wifi. nonSmokingInd : true or false indicator for non-smoking. Includes BedConfiguration object. BedConfiguration Configuration of bed(s) in room. Key value pairs: quantity : Number of beds in the room. size : Size of bed(s) in the room. bedType : Bed type values as follows: FUTON 200 KING 58 QUEEN 86 TWIN 113 TATAMI 202 SOFA 102 ROLLAWAY 91 MURPHY 201 CRIB 26 WATERBED 195 FULL&#160;249 ROUND 250 Description Room description. Key value pairs: value : String for room description text (e.g. Save 15 Pct Off Studio King Suite Full Breakfast:Free WiFi:32in TV ). Email Email address for hotel contact. DateRange Check-in and -out dates. Key value pairs: start : Check-in date in YYYY-MM-DD format. end : Check-out date in YYYY-MM-DD format. TravelerContact Contact details. PropertyAddress Address of the property in standard AddressLine, City, StateProv, Country, Postal Code objects. Telephone Standard telephone object. Price Price details for the hotel offer. Includes CurrencyCode, Base, TotalPrice, and PriceBreakdown objects. CurrencyCode Currency code for this price. decimalPlace :&#160;Number of decimal places in this currency. codeAuthority :&#160;Currency code. Base Number. The base cost of the hotel offer per night before any taxes and fees. TotalPrice Number. The total price of the hotel offer for all nights and including any taxes and fees. PriceBreakdown Hotel segment price breakdown. The objects and information returned can vary by provider and location. Key value pairs: roomPricingType : String. Pricing type, such as Per night or Per stay .or per stay. priceChangesDuringStayInd : Boolean. If true the rate changes during the stay. ratePlanCode : Any negotiated rate code/s returned. If roomPricingType = Per night, the amounts in PriceBreakdown apply to a nightly rate, and the NightlyRate object is returned: NightlyRate : Number of nights per stay in nights . If roomPricingType = Per stay, the amounts in PriceBreakdown apply to the entire hotel stay, and Description is returned: Description : A rate description text string, e.g., Advance Purchase-Ro-Free WiFi . Amount Amount for hotel segment. approximateInd :&#160;Boolean; true indicates this is a calculated value; false indicates this is the value returned by the property. CurrencyCode : Same as above. TotalRate : Total for hotel segment, either per night or per stay per above. TermsAndConditionsFull Terms and conditions for this offer. Depending on available information, may include CustomerLoyalty, TextBlock, Guarantee, CancelPenalty, AcceptedCreditCard, Description, DepositPolicy, and/or RatePaymentInfo objects. CustomerLoyalty Customer loyalty / frequent traveler program details. Key value pairs: supplierType : Type of customer loyalty program such as hotel. supplier : Code of supplier for loyalty program. shareWithSupplier : Carrier codes of any suppliers with loyalty program cross-accrual for this supplier. value : customer loyalty number value. TextBlock Any applicable terms and conditions text information. TermsAndConditions The terms and conditions applicable to that CatalogOffering. Includes the following attribute: Includes Guarantee, CancelPenalty, AcceptedCreditCard, Description, MealsIncluded, and ProductRateCode Info objects. Guarantee If sent by the provider, Guarantee indicates whether payment is required to hold the room. Key value pairs: code : Any guarantee code. type : Type of guarantee. Possible values include: GuaranteeRequired:&#160;A credit card number is required for reservation but will not be charged. DepositRequired: A deposit is charged to a credit card to make a reservation. PrepayRequired: The entire amount for the stay is charged to the credit card to make a reservation. This amount is usually nonrefundable. CancelPenalty Cancellation penalty details. Includes Deadline and HotelPenalty objects. Deadline Cancellation penalty deadline details. Includes SpecificDate, Time, and Refundable. SpecificDate Details on cancellation penalty. Key value pairs: specific : Date in YYYY-MM-DD format. duration : Duration from start date. durationUnit : Duration measurement unit in elapsed time or day of the week. Possible values include: Minutes Hours Days Months SUN MON TUES WED THU FRI SAT Time The deadline time in 24-hour HH:MM:SS format. Refundable String. Yes indicates refundable; No non-refundable. HotelPenalty Cancellation penalty as either an amount or percentage. AcceptedCreditCard Array. One instance for each accepted credit cards. Key value pair: value: Two-character code of credit card type. Description Text strings for room and rate descriptions. MealsIncluded The following meal indicators are returned as true if applicable: breakfastInd lunchInd dinnerInd ProductRateCodeInfo Top-level object.&#160; Includes RateCodeInfo. RateCodeInfo Rate code information. Key value pairs: value: The negotiated rate plan code. rateName: Name of the rate plan. rateID: ID of the rate plan associated with the negotiated rate plan code. rateCategory: OTA rate category code. Possible values include: Military Convention Credential Weekly Association All FamilyPlan Club Monthly RackGeneral FullInclusive Promotional Government Industry/TravelAgentRate PrePaid Weekend Corporate Mutli-DayPackage Tour Employee MultLevel/Negotiated/Secure Package Other Leisure VIP SeniorCitizen DepositPolicy Deposit policy details. RatePaymentInfo String for rate payment information. Possible values include PrePay , PostPay , or Unknown . Offer object - Car Multi-content bookings include air and hotel and/or car content. The hotel and/or car segments must have been booked with the JSON Hotel APIs or JSON Car APIs (full release pending), or a terminal program. See Multi-Content Booking Guide (Air, Hotel, Car) for details and examples. Just as with air, an instance of Offer is returned for each car booking on the reservation. Offer/Product is returned with @type ProductVehicle for car content. The table below details the Offer objects for car content. Price details also differ from air prices and are listed below. Show Response Body Table - Offer for car (Product @type ProductVehicle) Object Description Offer Array. Each instance returns details about one offer on the reservation. Key value pairs: id: Internal short id for this offer. Includes Identifier, Product, and Price objects. May include TermsAndConditionsFull. Identifier Identifier for this offer with the following key value pairs: authority : Source of information. value : Unique system-generated identifier. Product Array. One instance for each product on the booking. Car content is returned with @type ProductVehicle. Key value pairs: id :&#160;System-assigned product id. Includes Identifier, Quantity, and Vehicle objects. Identifier Identifier information for this instance of Product. authority : Source of information. value : Unique system-generated identifier. Quantity Number of cars in Product. Vehicle Vehicle details in the following key value pairs: doorCount : Text string for door type and count. airConditioningInd : Boolean indicator for air conditioning; true indicates car has air conditioning. Includes VehicleMakeModel, TransmissionTypeCode, VehicleCategoryCode, FuelTypeCode, VehicleSizeCode, and VehicleDateLocation objects. VehicleMakeModel Vehicle make and model codes: code : Code for this vehicle make and model. vendorCode : Code for make and model used by vendor. TransmissionTypeCode For this and the following rows, for vehicle category, type, transmission, and fuel type codes, see the ACRISS Car Classification codes . Vehicle transmission type details: codeContext : Source of value, usually ACRISS . value : Code for vehicle fuel type. VehicleCategoryCode Vehicle category details: codeContext : Source of value, usually ACRISS . value : Code for vehicle fuel type. FuelTypeCode Vehicle fuel type details: codeContext : Source of value, usually ACRISS . value : Code for vehicle fuel type. VehicleSizeCode Vehicle category details: codeContext : Source of value, usually ACRISS. value : Code for vehicle size. VehicleDateLocation Pickup and dropoff details. Includes RentalPickup and RentalReturn objects. RentalPickup Details about the rental pickup. date : Vehicle pickup date in YYYY-MM-DD format. time : Vehicle pickup time in HH:MM:SS format. Includes VendorLocation. VendorLocation Vendor location pickup details including rentalLocationNumber, rentalLocationName, and code (the IATA three-letter airport code or a 6-character location code, e.g., FRAT01). RentalReturn Details about the rental dropoff. date : Vehicle dropoff date in YYYY-MM-DD format. time : Vehicle dropoff time in HH:MM:SS format. VendorLocation : Vendor location dropoff details including rentalLocationNumber, rentalLocationName, and code (the IATA three-letter airport code or a 6-character location code, e.g., FRAT01). Price Price of car offer. Includes CurrencyCode and PriceBreakdown objects. CurrencyCode Currency code for this price. decimalPlace :&#160;Number of decimal places in this currency. value :&#160;Currency code. PriceBreakdown Vehicle price breakdown. Objects and data returned may vary by vendor and location. Includes RateDistance, ApproximateRate, and RateQualifier objects. RateDistance Rate costs by distance: allowance :&#160;Returned when distance is limited with this rate; the number of distance units allowed in this rate. unlimitedDistanceInd : Returned if true to indicate unlimited distance is allowed. distanceUnits :&#160;Units of the distance allowed, such as Miles or Kilometers . ratePeriod :&#160;Duration in which the allowance can be used. ApproximateRate Returned if vehicle rate is approximate. Includes BaseRate. BaseRate Base vehicle rate if approximate. Key value pairs: code : Currency code base rate is returned in value. approximateInd : Returned as true if base rate is approximate. value : Approximate amount of base rate. RateQualifier String for rate qualifier. TermsAndConditionsFull Any terms and conditions for this vehicle offer. May include ProductRateCodeInfo. ProductRateCodeInfo Any rate code applicable to this rental. Includes RateCodeInfo. RateCodeInfo Rate code for this rental. Key value pair: value :&#160;Rate code value. Traveler object Show Response Body Table - Traveler objects The table below details the Traveler object returned in ReservationResponse. Object Description Traveler Array. Returns one instance for each passenger on the reservation. Includes all traveler information sent in the Add Traveler request and certain additional traveler details sent in Remarks . Some traveler details can also be added as part of Reservation Modify . Key value pairs: passengerTypeCode : The PTC code. birthDate : Passenger date of birth in YYYY-MM-DD format. gender : Returned if minimum secure flight information was sent. Supported values are Male,&#160;Female, Unknown. id :&#160;Short system-generated traveler id. Includes Identifier. May include PersonName, Address, Telephone, Email, CustomerLoyalty, and TravelDocument. Objects returned depend on information sent at booking for this traveler; see Add Traveler API&#160;Reference and Remarks Guide for details on additional supported objects. All email addresses are associated with the first traveler on the reservation for GDS. NDC supports contact information for each traveler on the reservation. Identifier System-generated traveler reference details. Key value pairs: authority : Source of information. value : Unique system-generated identifier. TravelerProduct Returned only if a seat or seats were booked for this traveler, or if unpriced segment An air segment without any associated fare or pricing, generally booked for availability versus cost. Shown in the UnpricedSegments object instead of the Offer object. GDS only; NDC does not use unpriced segments. are associated with this traveler. Includes TravelerRef, OfferRef, ProductRef, and ConfirmationStatusEnum. TravelerRef String. Id for the traveler for this offer or unpriced segment; also returned in Traveler/id. OfferRef String. Id for the seat offer. Cross-references to value in corresponding Offer/id. ProductRef String. Id for the product offer. Cross-references to value in corresponding Offer/Product/id. ConfirmationStatusEnum Status of seat booking.&#160;Possible values are Pending, Confirmed, Cancelled, Rejected. UnpricedFlightSegmentRefs String. Returned in TravelerProduct if unpriced segments An air segment without any associated fare or pricing, generally booked for availability versus cost. Shown in the UnpricedSegments object instead of the Offer object. GDS only; NDC does not use unpriced segments. are associated with this traveler. Cross-references to value in corresponding UnpricedFlightSegment/id. Form of Payment object Show Response Body Table - FormOfPayment objects The table below details the FormOfPayment object returned in ReservationResponse. Object Description FormOfPayment Returned if Form Of Payment (FOP) has been added to the booking. Always returned if the itinerary has been ticketed. Key value pairs: id :&#160;User-assigned custom ID sent with the Add Form of Payment request. Includes Identifier object. Identifier System-generated identifier values for the form of payment added in the booking or ticketing workbench. Key value pairs: authority : Source of information. value : Unique system-generated identifier. Payment object Show Response Body Table - Payment objects The table below details the Payment object returned in ReservationResponse. Payment is returned only for a reservation&#160;retrieve for a ticketed itinerary, as payment is sent only as part of ticketing. Object Description Payment Payment details if Payment has been added. Always returned if the itinerary has been ticketed. Key value pairs: id :&#160;User-assigned custom ID sent with the Add Payment request. PaymentRef User-assigned value sent with the Add Payment request. Identifier System-generated identifier values for this payment. Key value pairs: authority : Source of information. value : Unique system-generated identifier. Amount Payment amount details. Key value pairs: code : Code of currency in which payment was made. minorUnit : The smallest unit of currency for the currency in code . For example; the smallest denomination in USD is the cent, which is 1/100 of a USD, and the minor unit value is 2 . Not all currencies have a minor unit. value : Amount of the payment made. FormOfPaymentIdentifier Top level object to identify the form of payment to which this payment was charged. Includes FormOfPaymentRef and Identifier. FormOfPaymentRef User-assigned custom ID sent with the Add Form of Payment request. Receipt object Show Response Body Table - Receipt objects The Receipt object with the @type value ReceiptConfirmation is generally returned for all reservations to send the locator code for the booking. The Receipt object with the @type value ReceiptPayment is returned for ticketed reservations, any offer that has been paid for, and EMDs. Receipt @type ReceiptConfirmation / ReceiptCancellation Object Description Receipt @type ReceiptConfirmation or @type ReceiptCancellation Array. May return multiple instances with various @type values: @type ReceiptConfirmation applies to the booking and at least one instance is returned for all reservations to return the booking locator code @type ReceiptCancellation includes a Cancellation object instead of Confirmation. Currently returned only for NDC bookings. An upcoming release will align the responses and return @type ReceiptCancellation for both canceled GDS and NDC bookings. @type ReceiptPayment applies to the payment (see next table below). Show Example ReceiptCancellation object { "@type": "ReceiptCancellation", "Identifier": { "authority": "Travelport", "value": "a2fd7c20-2fef-4151-9904-7f6eef71b7f0" }, "Cancellation": { "@type": "CancellationHold", "Locator": { "source": "1A", "value": "FBYU87" } } }, Includes Identifier and either Confirmation or, for canceled NDC bookings only, Cancellation. Identifier Internal system-generated identifier for this receipt confirmation. Key value pairs: authority : Source of information. value : Unique system-generated identifier. Confirmation Returned for all reservations both before and after ticketing. Confirmation details. Includes Locator. May include OfferStatus, UnpricedSegmentsStatus. Cancellation Returned for canceled NDC bookings only. Includes Locator. May include OfferStatus. Locator The reservation&#160;locator code issued for this booking. All bookings return this unique alphanumeric identifier. Must be sent in several other transactions. Key value pairs: source : The issuer of this locator code, either Travelport or the carrier code. creationdate : Booking date of the reservation in local time. value : The&#160;reservation&#160;locator code. OfferStatus Returns segment confirmation details. StatusAir Confirmation details by flights. Key value pairs: flightRefs : List of flight IDs to which this status applies. code : IATA standard 2-byte status code for the reservation, e.g., HK or XX. value : The accompanying enumeration for the status code. Supported values: Confirmed Cancelled Pending Modified Rejected Waitlisted For GDS, a value in OfferStatus/StatusAir/code of either TK &#160;or UN indicates the flight has schedule change information. To accept the schedule change, send a workbench commit request with the scheduleChangeAcceptedInd indicator set to true . For NDC, schedule change information is returned in ReservationComment; see the ReservationComment objects table below. UnpricedSegmentsStatus Returned if reservation has unpriced segment/s An air segment without any associated fare or pricing, generally booked for availability versus cost. Shown in the UnpricedSegments object instead of the Offer object. GDS only; NDC does not use unpriced segments. . Details of segment varies by type of unpriced content. Generally includes UnpricedFlightSegment object with standard flight details as returned in Product/FlightSegment . GDS only; NDC does not support unpriced segments. Receipt @type ReceiptPayment Object Description Receipt @type ReceiptPayment Array. Each instance applies to one traveler on one ticket. Instances of Receipt @type ReceiptPayment apply to the ticket and are returned only after an itinerary has been ticketed. Key value pairs: dateTime : Date and time stamp when receipt issued. id : Internal identifier for receipt. Includes ReceiptRef, Identifier, OfferRef, PaymentIdentifier, and Document objects. An instance of ReceiptPayment is returned for each traveler on each ticket number. This supports returning end-to-end ticket audit information in the event of a ticket change or reissue, and supports customers in making their own back office and financial calculations. ReceiptRef Internal Identifier for receipt. Identifier System-generated internal Identifier for receipt. Key value pairs: authority: Returns the value Travelport . value: &#160;Internal system-generated identifier for the response. OfferRef Array. String/s with the offer reference id to which this receipt applies. PaymentIdentifier Identifier for the payment used for the ticket. This is the user-assigned value sent in Add Payment . Document Array. Top level object for ticket or EMD&#160;details for one passenger. Key value pairs: historicInd :&#160;Boolean. Returned for exchanged tickets to indicates ticket has been exchanged.&#160; Notes on Document @type values Any EMDs &#160;are returned with a Document @type value of either DocumentEMD for open EMDs or DocumentEMDRefund for refunded EMDs, plus the EMD number (in Number object), the traveler to which that EMD applies (in TravelerIdentiferRef), the amount (Amount), and a description of the EMD&#160;in EMDDescription. If the ticket has been exchanged, the newly issued tickets are returned with Document @type DocumentTicketExchange . The previous tickets are not returned in the Reservation Retrieve response. In addition, the exchanged status is also reflected in the Offer object, which is returned with @type= OfferModify and which returns the difference between the previous price and the exchanged price in Offer/ModifyPrice. The Document @type value DocumentMCO returns the MCO number for any exchanged ticket that has an MCO&#160;associated with it. (An MCO (miscellaneous change order) is created for any exchanged ticket that has residual value remaining after the exchange.) The following Document @type values indicate a ticket status. Ticket Status Document @type value Open DocumentTicket Exchanged DocumentTicketExchange Refund canceled DocumentTicket Refund DocumentTicketRefund Void / Void of exchange DocumentTicketVoid No cancel refund DocumentTicket Non reportable refund DocumentTicketRefund Open EMD DocumentEMD Refunded EMD DocumentEMDRefund MCO for an exchanged ticket (not a ticket status) DocumentMCO Number Ticket or EMD&#160;number. TravelerIdentifierRef Identifier for traveler to which the ticket or EMD&#160;applies. Key value pairs: passengerTypeCode : PTC of passenger. id :&#160;Short traveler identifer. value : System-generated traveler identifier. Amount Details on ticket or EMD&#160;price in the following standard model objects as applicable: CurrencyCode : Currency code amounts are returned in. Base : Base price before taxes and fees. Taxes : Includes TotalTaxes to sum all taxes and an array of Tax objects for individual taxes. Total :&#160;Total price for this passenger. EMDDescription EMD&#160;details. value : String with details of the bag/s, seat/s, or other ancillaries this EMD was issued for. For NDC, this string may return details of multiple ancillaries combined, as in SEAT 5C 6D . CumulativeValue Returns the cumulative value of a document when it has been exchanged multiple times. May include applicable standard pricing objects per Amount above. IssuingPCC PCC that issued the ticket. FiledAmount The base amount of a ticket price or net price that is filed in local currency. Key value pairs: currencyCode : Currency code of filed amount. decimalPlace : Number of decimal places. value : Filed amount value. SpecialService object Show Response Body Table - SpecialService objects The table below details the SpecialService object. Object Description SpecialService Returned for specific SSRs (special service requirements). Currently returned only for fare family brand codes that apply the SSR BFFF. Key value pairs: id :&#160;System-generated id for this requirement. For SSR BFFF, includes Identifier, AppliesTo, Status, TravelerIdentifierRef, SSRCode, FreeText, and Quantity objects. Show Example SpecialService object for SSRCode BFFF "SpecialService": [ { "@type": "SpecialServiceRequirement", "id": "SpecialService_1", "Identifier": { "authority": "Travelport", "value": "eabe7fdd-86f3-4c0f-8c2c-425312716ba0" }, "AppliesTo": { "@type": "AppliesToOfferProductSegment", "OfferIdentifier": { "offerRef": "offer_1" }, "ProductIdentifier": { "productRef": "product_1" }, "SegmentSequenceList": [ 1 ] }, "Status": { "value": "Confirmed" }, "TravelerIdentifier": { "TravelerRef": "travelerRefId_1", "Identifier": { "authority": "Travelport", "value": "1e3ca199-9b77-45b3-b16f-e4dd05d5d99a" } }, "SSRCode": "BFFF", "FreeText": "AV/CLASSIC", "Quantity": 1 }, { "@type": "SpecialServiceRequirement", "id": "SpecialService_4", "Identifier": { "authority": "Travelport", "value": "7776a4bd-a1ab-48b9-97ed-200972b48620" }, "AppliesTo": { "@type": "AppliesToOfferProductSegment", "OfferIdentifier": { "offerRef": "offer_1" }, "ProductIdentifier": { "productRef": "product_2" }, "SegmentSequenceList": [ 2 ] }, "Status": { "value": "Confirmed" }, "TravelerIdentifier": { "TravelerRef": "travelerRefId_2", "Identifier": { "authority": "Travelport", "value": "31dade09-2fb9-4dce-9a9f-8db05463d0fa" } }, "SSRCode": "BFFF", "FreeText": "AV/CLASSIC", "Quantity": 1 } ], Identifier Standard Travelport identifier for this special service in the following key value pairs: authority : Source of information. value : Unique system-generated identifier. AppliesTo The offer, product, and/or segment this special service requirement applies to. Includes OfferIdentifier, ProductIdentifier, and SegmentSequenceList objects. Status Key value pairs: value :&#160;String. Supplier-provided text for the status of the special service. TravelerIdentifierRef Identifiers for the traveler this special service requirement applies to. Includes TravelerRef and Identifier objects. SSRCode Text value of SSR code. FreeText String. Supplier-provided text describing the special service. Quantity Quantity of the special service. ReservationComment object Show Response Body Table - ReservationComment objects The table below details the ReservationComment object, which is returned in ReservationResponse only when certain remarks have been added to the reservation. See the Remarks &amp;&#160;Service Requests Guide for request formats and additional examples of remarks returned. Object Description ReservationComment If OSI, notepad, vendor, or itinerary remarks were added during the reservation workflow, those comments are returned by default in ReservationComment. Comments from carriers may also be returned in ReservationComment per the example below. Note the following: Notepad and OSI&#160;remarks are returned with a value of Agency in ReservationComment/commentSource. Vendor comments are returned with a value of Supplier in ReservationComment/commentSource. For ticketless carriers the value Ticketless is returned in Comment/name. Key value pairs: commentSource :&#160;Source of the comment. shareWith : Indicates other recipients of comment. Includes Comment object. For NDC, ReservationComment returns the comment NDC&#160;CONTENT&#160;HAS&#160;CHANGED when a schedule change has occurred. To accept the schedule change, send a workbench commit request with the scheduleChangeAcceptedInd indicator set to true . For GDS, a value in OfferStatus/StatusAir/code of either TK &#160;or UN indicates the flight has schedule change information. See the Receipt objects table above. Show Example ReservationComment "ReservationComment": [ { "@type": "ReservationComment", "commentSource": "Supplier", "shareWithSupplier": [ "NK" ], "Comment": [ { "name": "Ticketless", "value": "VIXXXXXXXXXXXX5550/D0422/RAMA SARAVANA" }, { "name": "Ticketless", "value": "ADTK1GTONK ON/BEFORE 20JUN 1023Z OTHERWISE WILL BE XLD" }, { "name": "Ticketless", "value": "MOST FARES EXCL GOV FARES REQUIRE TKT WITHIN 24 HRS" }, ] } ], Comment Includes the following key value pairs: name: Name assigned to the comment. value: Text of the comment. PrimaryContact object Show Response Body Table - PrimaryContact objects The table below details the PrimaryContact object returned in ReservationResponse. PrimaryContact is returned only when primary contact details were sent in the Add Traveler during booking . Some traveler details can also be added as part of Reservation Modify . Object Description PrimaryContact Primary contact details. Key value pairs: shareWith : Indicates other recipients of comment. id :&#160;Custom id for the contact details. TravelerIdentifier Top level object. Identifier Key value pairs: value : Identifier for traveler the primary contact details are associated with. ReferenceList objects Reservation Retrieve returns the ReferenceList object only if flight amenity details were requested with the includeFlightAmenitiesInd query parameter . Amenities are detailed in ReferenceList\ReferenceListAmenity per below. Show Response Body Table - ReferenceListAmenity objects Object Description ReferenceListAmenity If flight amenities were requested with includeFlightAmenitiesInd=true, the response returns ReferenceLIstAmenity to list all available amenities across all flights. Flight amenities are provided by ATPCO as RouteHappy data. ATPCO&#160;flight amenities do not support the Premium Business cabin. If the fare is in Premium Business, Travelport's system does not look for flight amenities. All other cabins are supported. If flight amenity data is requested but not available, the Result object returns a warning message that flight amenity data is unavailable. This could be due to a time out or some other issue while accessing the flight amenities data. Amenity Array. One instance for each specific amenity. Key value pairs: id: Travelport-assigned amenity id used for cross-referencing by each flight with this amenity. Includes Category and Text objects. Category String. The flight amenity category. Flight amenity categories are as follows and may include the following data as provided by ATPCO: Aircraft: cabin pressure, model and type Beverage: alcoholic and non-alcoholic beverages and whether available for a fee or free; highlights premium beverages in business/first Entertainment: passenger entertainment options Flight: airline flight schedules and equipment types with the associated amenities ID for each carrier Food: food per flight and flight cabin and whether available for a fee or free; food is classified as breakfast, lunch, dinner, snacks, and light meals, and as premium when available in business/first Layout: seating layout such as classic layouts to premium cabin configurations Power: availability of AC power outlets, USB ports, or both Seat: physical seat type for every sub fleet in every cabin of the aircraft, including legroom, pitch, width, flatness and type. Note that seat metrics are returned in centimeters because the default language is English. WiFi: availability, type, coverage, rollout, performance, and whether available free or for a fee Text A description of the amenity in the following key value pairs: language : Code for the language returned in value. value : String. A short text description of this amenity. Example Request No message payload. Example Response The objects and data returned in a reservation retrieve varies according to the information present in the reservation and whether the reservation has been ticketed. Several examples follow. For Reservation&#160;Retrieve examples with air, car, and hotel content, see the Multi-Content Booking Guide (Air, Hotel, Car)&#160;Content . For additional examples, download the developer toolkits and see Using Postman and Developer Toolkits . The following example shows a reservation retrieve for a one-way NDC&#160;held booking. Show Example reservation retrieve - one-way NDC&#160;held booking { "ReservationResponse": { "@type": "ReservationResponse", "Reservation": { "@type": "Reservation", "Identifier": { "authority": "Travelport", "value": "0ac7cfce-6192-4f32-b6b7-6dede455c17b" }, "Offer": [ { "@type": "Offer", "id": "offer_1", "Identifier": { "authority": "AA", "value": "MTVhM2E4ZjQtM2Y2Mi00MzlmLTgyMzctYWVlYzMwZTA4ODY5fFA1QjQyQTU3My1CMTIxLTRGODMtODY3OHN4aHRiMTR5MjNydmMtMS0x" }, "Product": [ { "@type": "ProductAir", "totalDuration": "PT2H29M", "id": "product_1", "Identifier": { "authority": "AA", "value": "3e08fb8b-b5ed-42e6-be7f-f0e628307d26" }, "FlightSegment": [ { "@type": "FlightSegment", "sequence": 1, "Flight": { "@type": "Flight", "duration": "PT2H29M", "carrier": "AA", "number": "6221", "equipment": "E75", "id": "seg_1", "Identifier": { "authority": "AA", "value": "6bc12b59-3387-4509-8975-64cd37e28d7d" }, "Departure": { "@type": "DepartureDetail", "terminal": "0", "location": "LAX", "date": "2025-03-21", "time": "09:22:00" }, "Arrival": { "@type": "ArrivalDetail", "location": "DEN", "date": "2025-03-21", "time": "12:51:00" } } } ], "PassengerFlight": [ { "@type": "PassengerFlight", "passengerQuantity": 1, "passengerTypeCode": "ADT", "FlightProduct": [ { "@type": "FlightProduct", "segmentSequence": [ 1 ], "classOfService": "L", "cabin": "Economy", "fareBasisCode": "LUAIYSN1", "fareType": "PublicFare", "Brand": { "@type": "Brand", "name": "Main Cabin" } } ] } ] } ], "Price": { "@type": "PriceDetail", "CurrencyCode": { "decimalPlace": 2, "value": "AUD" }, "Base": 370, "TotalTaxes": 51.8, "TotalPrice": 421.8, "PriceBreakdown": [ { "@type": "PriceBreakdownAir", "quantity": 1, "requestedPassengerType": "ADT", "Amount": { "@type": "Amount", "CurrencyCode": { "decimalPlace": 2, "value": "AUD" }, "Base": 370, "Taxes": { "@type": "TaxesDetail", "TotalTaxes": 51.8, "Tax": [ { "taxCode": "US", "description": "U.S.A Transportation Tax", "value": 27.7 }, { "taxCode": "XF", "description": "U.S Passenger Facility Charge", "value": 7.1 }, { "taxCode": "ZP", "description": "U.S. Flight Segment Tax", "value": 8.2 }, { "taxCode": "AY", "description": "Passenger Civil Aviation Security Service Fee", "value": 8.8 } ] }, "Total": 421.8 } } ] }, "TermsAndConditionsFull": [ { "@type": "TermsAndConditionsFullAir", "ExpiryDate": "2025-02-23T23:59:00Z", "TextBlock": [ { "@type": "TextBlockDetail", "description": "FARE RULES", "title": "Ticketing", "TextFormatted": [ { "value": "NONREF/FAREDIF/" }, { "value": "CXL BY FLT TIME OR NOVALUE" } ] } ], "BaggageAllowance": [ { "@type": "BaggageAllowanceDetail", "passengerTypeCodes": [ "ADT" ], "baggageType": "FirstCheckedBag", "ProductRef": [ "product_1" ], "BaggageItem": [ { "@type": "BaggageItem", "quantity": 0 } ], "SegmentSequenceList": [ 1 ], "Text": [ "0PC" ] }, { "@type": "BaggageAllowanceDetail", "passengerTypeCodes": [ "ADT" ], "baggageType": "CarryOn", "ProductRef": [ "product_1" ], "BaggageItem": [ { "@type": "BaggageItem", "quantity": 2 } ], "SegmentSequenceList": [ 1 ], "Text": [ "2PC" ] } ], "FareRuleInfo": [ { "@type": "FareRuleInfoText", "flightsRefs": [ "seg_1" ], "TextFareRule": [ { "name": "Cancel", "value": "Not Allowed" } ] } ], "PaymentTimeLimit": "2025-02-23T23:59:00Z", "Penalties": [ { "@type": "Penalties", "Change": [ { "@type": "ChangePermitted", "ProductRefs": [ "product_1" ] } ], "Cancel": [ { "@type": "CancelNotPermitted", "ProductRefs": [ "product_1" ], "NotPermittedInd": "true" } ], "PassengerTypeCodes": [ "ADT" ] } ] } ] } ], "Traveler": [ { "@type": "Traveler", "birthDate": "1986-11-11", "gender": "Male", "passengerTypeCode": "ADT", "id": "trav_1", "TravelerRef": "trav_1", "Identifier": { "authority": "Travelport", "value": "QURUfFQx" }, "PersonName": { "@type": "PersonName", "Given": "TESTFIRST", "Surname": "TESTLAST" }, "Telephone": [ { "@type": "Telephone", "countryAccessCode": "1", "phoneNumber": "212456121", "id": "4", "cityCode": "ORD", "role": "Home" } ], "Email": [ { "id": "email_1", "validInd": true, "value": "TRAVELERONE@GMAIL.COM" } ], "TravelDocument": [ { "@type": "TravelDocumentDetail", "docNumber": "A123123", "docType": "Passport", "expireDate": "2035-02-21", "issueCountry": "US", "birthDate": "1986-11-11", "Gender": "Male", "PersonName": { "@type": "PersonName", "Given": "TestFirst", "Surname": "TestLast" } } ] } ], "Receipt": [ { "@type": "ReceiptConfirmation", "id": "receipt_1", "Identifier": { "authority": "AA", "value": "4afd7900-bcf6-4473-9109-44bd60d14ffb" }, "OfferRef": [ "offer_1" ], "Confirmation": { "@type": "ConfirmationHold", "Locator": { "source": "AA", "sourceContext": "OrderId", "value": "AA001HGO3HWA4" } } }, { "@type": "ReceiptConfirmation", "id": "receipt_2", "Identifier": { "authority": "AA", "value": "ba4391ec-e0da-4290-98ca-f17d5b7b1060" }, "OfferRef": [ "offer_1" ], "Confirmation": { "@type": "ConfirmationHold", "Locator": { "source": "AA", "sourceContext": "VendorLocator", "value": "IKRWES" }, "OfferStatus": { "@type": "OfferStatusAir", "StatusAir": [ { "flightRefs": [ "seg_1" ], "code": "HK", "value": "Confirmed" } ] } } }, { "@type": "ReceiptConfirmation", "Identifier": { "authority": "Travelport", "value": "9acfe47e-c903-491b-b3d1-c8bb80970815" }, "Confirmation": { "@type": "ConfirmationHold", "Locator": { "source": "1G", "creationDate": "2025-02-22", "value": "B7KT1S" } } } ], "ReservationComment": [ { "@type": "ReservationComment", "id": "reservationComment_1", "Comment": [ { "id": "comment_1", "name": "SWITT1G/XB7/99999992/SYD/1G/T/AU/AUD/001TEST", "language": "EN", "value": "SWITT1G/XB7/99999992/SYD/1G/T/AU/AUD/001TEST" } ] } ], "ReservationDisplaySequence": { "@type": "ReservationDisplaySequence", "DisplaySequence": [ { "@type": "DisplaySequence", "displaySequence": 1, "OfferRef": "offer_1", "ProductRef": "product_1", "Sequence": 1 } ] } } } } Reservation Retrieve - ticketed one-way GDS itinerary The following example shows a ticketed one-way GDS itinerary. For comparison purposes, note that the example booking shown here, with Travelport locator code BXPJVM, is also shown in the Workbench Commit API&#160;Reference examples for the commit response for both the initial booking workbench and the ticketing workbench, and in the Workbench Create for a in the Reservation Retrieve. Show Example retrieve for GDS ticketed booking { "ReservationResponse": { "@type": "ReservationResponse", "Reservation": { "@type": "Reservation", "Identifier": { "authority": "Travelport", "value": "f22fbe87-e17b-4e9d-b5f2-096f93a396bf" }, "Offer": [ { "@type": "Offer", "id": "offer_1", "Identifier": { "authority": "Travelport", "value": "ee4ca6f4-127b-49b6-b74c-7840bb1ae121" }, "ContentSource": "GDS", "Product": [ { "@type": "ProductAir", "id": "product_1", "Identifier": { "authority": "Travelport", "value": "0dc2b9c4-baef-4af5-bdf2-2656393b5cae" }, "FlightSegment": [ { "@type": "FlightSegment", "id": "FlightSegment_01", "sequence": 1, "Flight": { "@type": "Flight", "duration": "PT2H34M", "carrier": "AA", "number": "2755", "equipment": "319", "id": "Flight_01", "Identifier": { "authority": "Travelport", "value": "12634c53-880e-4b80-831c-8fe795f73c24" }, "Departure": { "@type": "Departure", "location": "ORD", "date": "2025-06-28", "time": "07:00:00" }, "Arrival": { "@type": "Arrival", "location": "DEN", "date": "2025-06-28", "time": "08:39:00" } } } ], "PassengerFlight": [ { "@type": "PassengerFlight", "passengerQuantity": 1, "passengerTypeCode": "ADT", "FlightProduct": [ { "@type": "FlightProduct", "segmentSequence": [ 1 ], "classOfService": "Y", "cabin": "Economy", "fareBasisCode": "B0AIZNN1", "fareType": "PublicFare", "Brand": { "@type": "Brand", "name": "MAIN CABIN", "tier": 4, "id": "1752032" } } ] } ] } ], "Price": { "@type": "PriceDetail", "id": "PriceDetail_1", "CurrencyCode": { "value": "AUD" }, "Base": 854, "TotalTaxes": 89.6, "TotalFees": 0, "TotalPrice": 943.6, "PriceBreakdown": [ { "@type": "PriceBreakdownAir", "quantity": 1, "requestedPassengerType": "ADT", "Amount": { "@type": "Amount", "CurrencyCode": { "decimalPlace": 2, "value": "USD" }, "Base": 514.59 }, "TravelerRefs": [ "travelerRefId_1" ] }, { "@type": "PriceBreakdownAir", "quantity": 1, "requestedPassengerType": "ADT", "Amount": { "@type": "Amount", "currencySource": "Charged", "approximateInd": true, "CurrencyCode": { "decimalPlace": 2, "value": "AUD" }, "Base": 854, "Taxes": { "@type": "TaxesDetail", "TotalTaxes": 89.6, "Tax": [ { "currencyCode": "AUD", "taxCode": "AY", "value": 9.3 }, { "currencyCode": "AUD", "taxCode": "US", "value": 64.1 }, { "currencyCode": "AUD", "taxCode": "XF", "value": 7.5 }, { "currencyCode": "AUD", "taxCode": "ZP", "value": 8.7 } ] }, "Total": 943.6 }, "FiledAmount": { "currencyCode": "USD", "decimalPlace": 2, "value": 514.59 }, "TravelerRefs": [ "travelerRefId_1" ], "FareCalculation": "CHI AA DEN Q0.17 514.42B0AIZNN1 USD514.59END" } ] }, "TermsAndConditionsFull": [ { "@type": "TermsAndConditionsFullAir", "secureFlightPassengerDataRequiredInd": true, "Identifier": { "authority": "Travelport", "value": "9dc1e6ed-b81d-42a1-bf44-3635ea7b69f6" }, "ExpiryDate": "2025-05-29T23:59:00Z", "BaggageAllowance": [ { "@type": "BaggageAllowanceDetail", "passengerTypeCodes": [ "ADT" ], "SegmentSequenceList": [ 1 ], "Text": [ "0PC" ] } ], "ValidatingAirline": [ { "@type": "ValidatingAirline", "ValidatingAirline": "AA" } ], "TicketingAgency": [ { "@type": "TicketingAgency", "Code": "PCC" } ], "PaymentTimeLimit": "2025-05-30T23:59:00Z", "PricingAgency": [ { "@type": "PricingAgency", "Code": "PCC" } ], "FareGuaranteePolicy": [ { "@type": "FareGuaranteePolicy", "passengerTypeCodes": [ "ADT" ], "Code": { "value": "G" } } ] }, { "@type": "TermsAndConditionsFullAir", "Restriction": [ { "value": "NONREF/FAREDIF/" }, { "value": "CXL BY FLT TIME OR NOVALUE" } ] } ] } ], "Traveler": [ { "@type": "Traveler", "birthDate": "1986-11-11", "gender": "Male", "passengerTypeCode": "ADT", "id": "travelerRefId_1", "Identifier": { "authority": "Travelport", "value": "41fa22da-1e54-4fe4-8500-040d45b5853b" }, "PersonName": { "@type": "PersonName", "Given": "TESTFIRST", "Surname": "TESTLAST" }, "Telephone": [ { "@type": "TelephoneDetail", "countryAccessCode": "1", "phoneNumber": "212456121", "id": "telephone_1", "cityCode": "ORD", "role": "Home" } ], "Email": [ { "emailType": "TO", "value": "TravelerOne@gmail.com" } ], "TravelDocument": [ { "@type": "TravelDocumentDetail", "birthDate": "1986-11-11", "Gender": "Male", "PersonName": { "@type": "PersonName", "Given": "TESTFIRST", "Surname": "TESTLAST" } }, { "@type": "TravelDocumentDetail", "docNumber": "A123123", "docType": "Passport", "expireDate": "2035-05-28", "issueCountry": "US", "birthDate": "1986-11-11", "Gender": "Male", "PersonName": { "@type": "PersonName", "Given": "TESTFIRST", "Surname": "TESTLAST" } } ] } ], "FormOfPayment": [ { "@type": "FormOfPaymentCash", "id": "formOfPayment_1", "Identifier": { "authority": "Travelport", "value": "9e03db58-2765-4ab7-a231-9723c2648dc4" } } ], "Payment": [ { "@type": "Payment", "id": "payment_1", "PaymentRef": "payment_1", "Identifier": { "authority": "Travelport", "value": "faecf15a-919c-478f-8203-68fc6602eb7c" }, "Amount": { "minorUnit": 2, "value": 943.6 }, "FormOfPaymentIdentifier": { "FormOfPaymentRef": "formOfPayment_1" } } ], "Receipt": [ { "@type": "ReceiptConfirmation", "Identifier": { "authority": "Travelport", "value": "36c277b9-aca1-49c8-9e0f-42b2f42e4061" }, "Confirmation": { "@type": "ConfirmationHold", "Locator": { "source": "1G", "creationDate": "2025-05-28", "value": "BXPJVM" }, "OfferStatus": { "@type": "OfferStatusAir", "StatusAir": [ { "flightRefs": [ "Flight_01" ], "code": "HK", "value": "Confirmed" } ] } } }, { "@type": "ReceiptConfirmation", "Identifier": { "authority": "Travelport", "value": "a0aa46fa-73e5-43c2-9727-4fbd159717d7" }, "Confirmation": { "@type": "ConfirmationHold", "Locator": { "source": "AA", "value": "IUSHNW" } } }, { "@type": "ReceiptPayment", "dateTime": "2025-05-28T22:28:00Z", "id": "receipt_1", "ReceiptRef": "receipt_1", "Identifier": { "authority": "Travelport", "value": "6a640efd-f887-46dc-b9c4-42c7036bbc00" }, "OfferRef": [ "offer_1" ], "Document": [ { "@type": "DocumentTicket", "Number": "0019905292727", "TravelerIdentifierRef": { "passengerTypeCode": "ADT", "id": "travelerRefId_1", "value": "a3aa614c-3d5c-416c-aee0-ab440b82c469" }, "Amount": { "@type": "Amount", "CurrencyCode": { "decimalPlace": 2, "value": "AUD" }, "Base": 854, "Taxes": { "@type": "TaxesDetail", "TotalTaxes": 89.6, "TaxInfo": [ { "@type": "TaxInfo", "TaxCode": "XF", "Amount": 4.5, "TaxBreakdown": [ { "@type": "TaxBreakdown", "AirportCode": "ORD", "Amount": 4.5 } ] }, { "@type": "TaxInfo", "TaxCode": "ZP", "Amount": 5.2, "TaxBreakdown": [ { "@type": "TaxBreakdown", "AirportCode": "ORD", "Amount": 5.2 } ] } ], "Tax": [ { "taxCode": "AY", "value": 9.3 }, { "taxCode": "US", "value": 64.1 }, { "taxCode": "XF", "value": 7.5 }, { "taxCode": "ZP", "value": 8.7 } ] }, "Total": 943.6 }, "IssuingPCC": "PCC", "FiledAmount": { "currencyCode": "USD", "decimalPlace": 2, "value": 514.59 } } ], "PaymentIdentifier": { "id": "payment_1", "PaymentRef": "payment_1", "Identifier": { "authority": "Travelport", "value": "faecf15a-919c-478f-8203-68fc6602eb7c" } } } ], "ReservationDisplaySequence": { "@type": "ReservationDisplaySequence", "DisplaySequence": [ { "@type": "DisplaySequence", "displaySequence": 1, "OfferRef": "offer_1", "ProductRef": "product_1", "Sequence": 1 } ] } } } } Reservation Retrieve with flight amenity data The following example shows RouteHappy flight amenity data returned when flight amenities are requested with the includeFlightAmenitiesInd query parameter. Show Example retrieve with flight amenity data { "ReservationResponse": { "@type": "ReservationResponse", "Reservation": { "@type": "Reservation", "Identifier": { "authority": "Travelport", "value": "9d2f62d2-86c1-4d23-9310-9fd6791a2ad1" }, "Offer": [ { "@type": "Offer", "id": "offer_1", "Identifier": { "authority": "Travelport", "value": "cb56e837-c065-47f1-af00-b381dd8e8d8b" }, "Product": [ { "@type": "ProductAir", "id": "product_1", "Identifier": { "authority": "Travelport", "value": "4ea1830b-94a9-4624-8877-c480bc8ba921" }, "FlightSegment": [ { "@type": "FlightSegment", "id": "FlightSegment_01", "sequence": 1, "connectionDuration": "PT1H38M", "amenityRefs": [ "a3", "a5", "a7", "a9", "a11", "a12", "a13", "a14" ], "boundFlightsInd": true, "Flight": { "@type": "Flight", "duration": "PT5H42M", "carrier": "UA", "number": "1757", "equipment": "777", "id": "Flight_01", "Identifier": { "authority": "Travelport", "value": "e5a71f5b-b46d-4b45-bde1-f56809fdf1bb" }, "Departure": { "@type": "Departure", "location": "IAD", "date": "2024-09-30", "time": "18:15:00" }, "Arrival": { "@type": "Arrival", "location": "SFO", "date": "2024-09-30", "time": "20:57:00" } } }, { "@type": "FlightSegment", "id": "FlightSegment_02", "sequence": 2, "amenityRefs": [ "a0", "a1", "a2", "a4", "a6", "a8", "a9", "a10" ], "Flight": { "@type": "Flight", "duration": "PT1H49M", "carrier": "UA", "number": "1318", "equipment": "7M8", "id": "Flight_02", "Identifier": { "authority": "Travelport", "value": "6dcf5cef-f095-4963-b8ff-9cbcede55119" }, "Departure": { "@type": "Departure", "location": "SFO", "date": "2024-09-30", "time": "22:35:00" }, "Arrival": { "@type": "Arrival", "location": "PDX", "date": "2024-10-01", "time": "00:24:00" } } } ], "PassengerFlight": [ { "@type": "PassengerFlight", "passengerQuantity": 1, "passengerTypeCode": "ADT", "FlightProduct": [ { "@type": "FlightProduct", "segmentSequence": [ 1, 2 ], "classOfService": "Y", "cabin": "Economy" } ] } ] } ], "TermsAndConditionsFull": [ { "@type": "TermsAndConditionsFullAir", "secureFlightPassengerDataRequiredInd": true, "Identifier": { "authority": "Travelport", "value": "57f01f9c-ee45-4e7c-9eeb-c355da7eb36f" } } ] } ], "Traveler": [ { "@type": "Traveler", "birthDate": "1980-03-03", "gender": "Male", "passengerTypeCode": "ADT", "id": "travelerRefId_1", "Identifier": { "authority": "Travelport", "value": "05fdacfc-ca1e-4cd1-ab89-7e61191a8561" }, "PersonName": { "@type": "PersonName", "Given": "SAM HON", "Surname": "HOUSTON" }, "Telephone": [ { "@type": "TelephoneDetail", "phoneNumber": "7139998887", "id": "telephone_1", "cityCode": "IAH", "role": "Mobile" } ], "TravelDocument": [ { "@type": "TravelDocumentDetail", "birthDate": "1980-03-03", "Gender": "Male", "PersonName": { "@type": "PersonName", "Given": "SAM ", "Surname": "HOUSTON" } } ] } ], "Receipt": [ { "@type": "ReceiptConfirmation", "Identifier": { "authority": "Travelport", "value": "17127c61-7323-499d-b594-ad39d5c69696" }, "Confirmation": { "@type": "ConfirmationHold", "Locator": { "source": "1G", "creationDate": "2024-09-16", "value": "8SRYC9" }, "OfferStatus": { "@type": "OfferStatusAir", "StatusAir": [ { "flightRefs": [ "Flight_01", "Flight_02" ], "code": "HK", "value": "Confirmed" } ] } } }, { "@type": "ReceiptConfirmation", "Identifier": { "authority": "Travelport", "value": "e5109aa1-fb3c-45b5-8534-dce81f45f686" }, "Confirmation": { "@type": "ConfirmationHold", "Locator": { "source": "UA", "value": "ID0YFD" } } } ], "ReservationComment": [ { "@type": "ReservationComment", "commentSource": "Supplier", "shareWith": "Agency", "shareWithSupplier": [ "UA" ], "id": "RSRVComment_1", "Comment": [ { "id": "VeiComment_1", "name": "Vendor Remarks", "value": "ADTK1GKK1.TKT UA SEGS BY 27SEP24 TO AVOID AUTO CXL /EARLIER" }, { "id": "VeiComment_2", "name": "Vendor Remarks", "value": "ADTK1GKK1 .TICKETING MAY BE REQUIRED BY FARE RULE" } ] } ], "ReservationDisplaySequence": { "@type": "ReservationDisplaySequence", "DisplaySequence": [ { "@type": "DisplaySequence", "displaySequence": 1, "OfferRef": "offer_1", "ProductRef": "product_1", "Sequence": 1 }, { "@type": "DisplaySequence", "displaySequence": 2, "OfferRef": "offer_1", "ProductRef": "product_1", "Sequence": 2 } ] } }, "Result": { "@type": "Result", "Warning": [ { "@type": "Warning", "Message": "NO FARES FOUND" } ] }, "ReferenceList": [ { "@type": "ReferenceListAmenity", "Amenity": [ { "@type": "Amenity", "id": "a0", "Category": "WiFi", "Text": { "language": "en", "value": "Streaming Capable Wi-Fi (fee)" } }, { "@type": "Amenity", "id": "a1", "Category": "Food", "Text": { "language": "en", "value": "Premium snacks (fee)" } }, { "@type": "Amenity", "id": "a2", "Category": "Aircraft", "Text": { "language": "en", "value": "737 MAX (narrowbody)" } }, { "@type": "Amenity", "id": "a3", "Category": "Layout", "Text": { "language": "en", "value": "3-4-3 seat layout" } }, { "@type": "Amenity", "id": "a4", "Category": "Power", "Text": { "language": "en", "value": "Power &amp; USB outlets" } }, { "@type": "Amenity", "id": "a5", "Category": "Aircraft", "Text": { "language": "en", "value": "777 (widebody)" } }, { "@type": "Amenity", "id": "a6", "Category": "Layout", "Text": { "language": "en", "value": "3-3 seat layout" } }, { "@type": "Amenity", "id": "a7", "Category": "Power", "Text": { "language": "en", "value": "Power outlet" } }, { "@type": "Amenity", "id": "a8", "Category": "Entertainment", "Text": { "language": "en", "value": "Seatback on-demand video" } }, { "@type": "Amenity", "id": "a9", "Category": "Beverage", "Text": { "language": "en", "value": "Alcohol (fee) &amp; beverages provided" } }, { "@type": "Amenity", "id": "a10", "Category": "Seat", "Text": { "language": "en", "value": "76 cm seat pitch" } }, { "@type": "Amenity", "id": "a11", "Category": "Seat", "Text": { "language": "en", "value": "79 cm seat pitch" } }, { "@type": "Amenity", "id": "a12", "Category": "Entertainment", "Text": { "language": "en", "value": "Streaming entertainment" } }, { "@type": "Amenity", "id": "a13", "Category": "WiFi", "Text": { "language": "en", "value": "Basic web browsing (fee)" } }, { "@type": "Amenity", "id": "a14", "Category": "Food", "Text": { "language": "en", "value": "Light meal (fee)" } } ] } ] } } The following example shows the objects returned when a booking has unpriced content, detailed in the UnpricedSegments, UnpricedFlightSegmentRefs, UnpricedSegmentsStatus, and UnpricedSegmentDisplaySequence released with AirReservation 25.11.69. GDS only; NDC carriers do not support unpriced segments. Show Example Reservation Retrieve response with unpriced segment { "ReservationResponse": { "@type": "ReservationResponse", "Reservation": { "@type": "Reservation", "Identifier": { "authority": "Travelport", "value": "acf49665-28c6-4e93-965f-8479a05782b1" }, "Offer": [ { "@type": "Offer", "id": "offer_1", "Identifier": { "authority": "Travelport", "value": "16e236bc-b209-4dd9-af16-4e70f91d2a34" }, "ContentSource": "GDS", "Product": [ { "@type": "ProductAir", "id": "product_1", "Identifier": { "authority": "Travelport", "value": "c600a801-1cec-416d-bf62-b69e7b573c01" }, "FlightSegment": [ { "@type": "FlightSegment", "id": "FlightSegment_01", "sequence": 1, "Flight": { "@type": "Flight", "duration": "PT3H55M", "carrier": "SQ", "number": "874", "equipment": "359", "id": "Flight_01", "Identifier": { "authority": "Travelport", "value": "b1f5d977-215c-4795-9593-b48e59f09654" }, "Departure": { "@type": "Departure", "location": "SIN", "date": "2025-05-09", "time": "07:25:00" }, "Arrival": { "@type": "Arrival", "location": "HKG", "date": "2025-05-09", "time": "11:20:00" } } } ], "PassengerFlight": [ { "@type": "PassengerFlight", "passengerQuantity": 1, "passengerTypeCode": "ADT", "FlightProduct": [ { "@type": "FlightProduct", "segmentSequence": [ 1 ], "classOfService": "Y", "cabin": "Economy", "fareBasisCode": "Y11SGOPO", "fareType": "AirlinePrivateFare", "Brand": { "@type": "Brand", "name": "ECONOMY FLEXI", "tier": 4, "id": "1721314" } } ] } ] } ], "Price": { "@type": "PriceDetail", "id": "PriceDetail_1", "CurrencyCode": { "value": "USD" }, "Base": 663, "TotalTaxes": 68.4, "TotalFees": 0, "TotalPrice": 731.4, "PriceBreakdown": [ { "@type": "PriceBreakdownAir", "quantity": 1, "requestedPassengerType": "ADT", "Amount": { "@type": "Amount", "CurrencyCode": { "decimalPlace": 2, "value": "SGD" }, "Base": 892 }, "TravelerRefs": [ "travelerRefId_1" ], "NetBaseAmount": { "currencyCode": "SGD", "decimalPlace": 2, "value": 892 } }, { "@type": "PriceBreakdownAir", "quantity": 1, "requestedPassengerType": "ADT", "Amount": { "@type": "Amount", "currencySource": "Charged", "approximateInd": true, "CurrencyCode": { "decimalPlace": 2, "value": "USD" }, "Base": 663, "Taxes": { "@type": "TaxesDetail", "TotalTaxes": 68.4, "Tax": [...] }, "Total": 731.4 }, "Commission": { "@type": "CommissionAmount", "Amount": { "code": "USD", "minorUnit": 4, "value": 0 } }, "FiledAmount": { "currencyCode": "SGD", "decimalPlace": 2, "value": 892 }, "TravelerRefs": [ "travelerRefId_1" ], "FareCalculation": "SIN SQ HKG 666.60Y11SGOPO NUC666.60END ROE1.338125" } ] }, "TermsAndConditionsFull": [ {...}, {...} ] } ], "Traveler": [ { "@type": "Traveler", "passengerTypeCode": "ADT", "id": "travelerRefId_1", "Identifier": { "authority": "Travelport", "value": "4dfb7cd9-3651-4641-adc0-ccf2f3b358bb" }, "PersonName": { "@type": "PersonName", "Given": "JIM", "Surname": "BOWIE" }, "Telephone": [ ... ] } ], "TravelerProduct": [ { "@type": "TravelerProduct", "id": "travelerProduct_1", "TravelerRef": "travelerRefId_1", "UnpricedFlightSegmentRefs": [ "unPricedFlightSegment_1" ] } ], "Payment": [ { "@type": "Payment", "id": "payment_1", "PaymentRef": "payment_1", "Identifier": { "authority": "Travelport", "value": "eeb96c78-c234-430f-99df-fa2a90bb7b49" }, "Amount": { "minorUnit": 2, "value": 731.4 }, "FormOfPaymentIdentifier": { "FormOfPaymentRef": "formOfPayment_1" } } ], "Receipt": [ { "@type": "ReceiptConfirmation", "Identifier": { "authority": "Travelport", "value": "5b193a75-b62c-440d-85d6-e66c819520f6" }, "Confirmation": { "@type": "ConfirmationHold", "Locator": { "source": "1G", "creationDate": "2025-04-15", "value": "BXF90D" }, "OfferStatus": { "@type": "OfferStatusAir", "StatusAir": [ { "flightRefs": [ "Flight_01" ], "code": "HK", "value": "Confirmed" } ] }, "UnpricedSegmentsStatus": [ { "@type": "UnpricedSegmentsStatus", "StatusAir": [ { "flightRefs": [ "Flight_02" ], "code": "HK", "value": "Confirmed" } ] } ] } }, { "@type": "ReceiptConfirmation", "Identifier": { "authority": "Travelport", "value": "a69986cc-0ca2-41c3-a126-7f4346163686" }, "Confirmation": { "@type": "ConfirmationHold", "Locator": { "source": "1A", "value": "62OB43" } } }, { "@type": "ReceiptPayment", "dateTime": "2025-04-15T19:42:00Z", "id": "receipt_1", "ReceiptRef": "receipt_1", "Identifier": { "authority": "Travelport", "value": "9ee32f47-d590-4e9f-bf67-6969b022b33e" }, "OfferRef": [ "offer_1" ], "Document": [ { "@type": "DocumentTicket", "Number": "6189905257307", "TravelerIdentifierRef": { "passengerTypeCode": "ADT", "id": "travelerRefId_1", "value": "27a7756a-b347-405f-aee0-65fe2fcad082" }, "Amount": { "@type": "Amount", "CurrencyCode": { "decimalPlace": 2, "value": "USD" }, "Base": 663, "Taxes": { "@type": "TaxesDetail", "TotalTaxes": 68.4, "Tax": [...] }, "Total": 731.4 }, "IssuingPCC": "XB7", "FiledAmount": { "currencyCode": "SGD", "decimalPlace": 2, "value": 892 } } ], "PaymentIdentifier": { "id": "payment_1", "PaymentRef": "payment_1", "Identifier": { "authority": "Travelport", "value": "eeb96c78-c234-430f-99df-fa2a90bb7b49" } } } ], "UnpricedSegments": { "@type": "UnpricedSegments", "UnpricedFlightSegment": [ { "@type": "UnpricedFlightSegment", "id": "unPricedFlightSegment_1", "sequence": 2, "passengerQuantity": 1, "cabin": "Economy", "classOfService": "Y", "Flight": { "@type": "Flight", "duration": "PT2H20M", "carrier": "CX", "number": "901", "equipment": "773", "id": "Flight_02", "Identifier": { "authority": "Travelport", "value": "603363e7-c502-4c0a-9d95-1a295834ac67" }, "Departure": { "@type": "Departure", "location": "HKG", "date": "2025-05-22", "time": "09:00:00" }, "Arrival": { "@type": "Arrival", "location": "MNL", "date": "2025-05-22", "time": "11:20:00" } } } ] }, "ReservationDisplaySequence": { "@type": "ReservationDisplaySequence", "DisplaySequence": [ { "@type": "DisplaySequence", "displaySequence": 1, "OfferRef": "offer_1", "ProductRef": "product_1", "Sequence": 1 } ], "UnpricedSegmentDisplaySequence": [ { "@type": "UnpricedSegmentDisplaySequence", "displaySequence": 2, "UnpricedFlightSegmentRef": "unPricedFlightSegment_1" } ] } } } } Reservation Retrieve for Exchanged GDS Ticket The GDS itinerary in the following example is a ticketed itinerary that has been exchanged for a different itinerary. Although the previously booked offer is not returned, several objects indicate the exchanged status: Offer @type= OfferModify , Document @type= DocumentTicketExchange , and Offer/ModifyPrice returns the difference between the previous price and the exchanged price. Show Example - Exchanged GDS itinerary { "ReservationResponse": { "@type": "ReservationResponse", "Reservation": { "@type": "Reservation", "Identifier": { "authority": "Travelport", "value": "52639c16-3e48-4678-9256-fde96a725fd7" }, "Offer": [ { "@type": "OfferModify", "id": "offer_1", "Identifier": { "authority": "Travelport", "value": "7f2c4bbc-4555-4173-9252-7e31a42fac1c" }, "Product": [ { "@type": "ProductAir", "id": "product_1", "Identifier": { "authority": "Travelport", "value": "fdc0ed7a-94a2-437c-8d11-9032f6636d66" }, "FlightSegment": [ { "@type": "FlightSegment", "id": "FlightSegment_01", "sequence": 1, "Flight": { "@type": "Flight", "duration": "PT3H15M", "carrier": "EK", "number": "0512", "id": "Flight_01", "Identifier": { "authority": "Travelport", "value": "a20455cd-c108-40bc-84f7-489d0eee1827" }, "Departure": { "@type": "Departure", "location": "DXB", "date": "2023-07-23", "time": "22:00:00" }, "Arrival": { "@type": "Arrival", "location": "DEL", "date": "2023-07-24", "time": "02:45:00" } } }, { "@type": "FlightSegment", "id": "FlightSegment_02", "sequence": 2, "connectionDuration": "PT3H15M", "Flight": { "@type": "Flight", "duration": "PT2H", "carrier": "UK", "number": "0975", "equipment": "320", "id": "Flight_02", "Identifier": { "authority": "Travelport", "value": "b931c0f4-c407-44c7-9c08-2e10ad478106" }, "Departure": { "@type": "Departure", "location": "DEL", "date": "2023-07-24", "time": "06:00:00" }, "Arrival": { "@type": "Arrival", "location": "BOM", "date": "2023-07-24", "time": "08:00:00" } } } ], "PassengerFlight": [ { "@type": "PassengerFlight", "passengerQuantity": 1, "passengerTypeCode": "ADT", "FlightProduct": [ { "@type": "FlightProduct", "segmentSequence": [ 1 ], "classOfService": "R", "cabin": "First", "fareBasisCode": "RLOWFAE1", "fareType": "PublicFare", "Brand": { "@type": "Brand" } }, { "@type": "FlightProduct", "segmentSequence": [ 2 ], "classOfService": "P", "cabin": "First", "fareBasisCode": "RLOWFAE1", "fareType": "PublicFare", "Brand": { "@type": "Brand" } } ] } ] } ], "Price": { "@type": "PriceDetail", "CurrencyCode": { "decimalPlace": 2, "value": "AUD" }, "Base": 1118, "TotalTaxes": 127, "TotalFees": 0, "TotalPrice": 1245, "PriceBreakdown": [ { "@type": "PriceBreakdownAir", "quantity": 1, "requestedPassengerType": "ADT", "Amount": { "@type": "Amount", "CurrencyCode": { "decimalPlace": 2, "value": "AUD" }, "Base": 1118, "Taxes": { "@type": "TaxesDetail", "TotalTaxes": 127, "Tax": [ { "taxCode": "AE", "value": 31 }, { "taxCode": "F6", "value": 14.5 }, { "taxCode": "TP", "value": 2.1 }, { "taxCode": "YQ", "value": 77.3 }, { "taxCode": "ZR", "value": 2.1 } ] }, "Fees": { "@type": "FeesDetail", "TotalFees": 0 }, "Total": 1245 }, "FiledAmount": { "currencyCode": "AED", "decimalPlace": 0, "value": 2710 }, "FareCalculation": "DXB EK X/DEL UK BOM737.27NUC737.27ENDROE3.67275" } ] }, "TermsAndConditionsFull": [ { "@type": "TermsAndConditionsFullAirChange", "id": "termsAndConditions_1", "Identifier": { "authority": "Travelport", "value": "c68c1053-e108-484d-bff8-4f5634fb1a1e" }, "Restriction": [ { "value": "* NON-END/FLEX PLUS" } ], "ValidatingAirline": [ { "@type": "ValidatingAirline", "ValidatingAirline": "EK" } ], "FareGuaranteePolicy": [ { "@type": "FareGuaranteePolicy", "passengerTypeCodes": [ "ADT" ], "Code": { "codeContext": "Travelport", "value": "G" } }, { "@type": "FareGuaranteePolicy", "passengerTypeCodes": [ "ADT" ], "Code": { "codeContext": "Travelport", "value": "G" } } ] } ], "ModifyPrice": { "@type": "ModifyPriceDetail", "id": "modifyPrice_2", "CurrencyCode": { "decimalPlace": 2, "value": "AUD" }, "Base": 17, "TotalFees": 0, "TotalPrice": 17, "PriceBreakdown": [ { "@type": "PriceBreakdownAir", "quantity": 1, "requestedPassengerType": "ADT", "Amount": { "@type": "Amount", "CurrencyCode": { "decimalPlace": 2, "value": "AUD" }, "Base": 17, "Fees": { "@type": "FeesDetail", "TotalFees": 0 }, "Total": 17 } } ] } } ], "Traveler": [ { "@type": "Traveler", "birthDate": "1991-12-12", "gender": "Male", "passengerTypeCode": "ADT", "id": "travelerRefId_1", "Identifier": { "authority": "Travelport", "value": "514d0312-6267-46ca-9e8d-4ae675f8767c" }, "PersonName": { "@type": "PersonName", "Given": "TESTTRAVELLER", "Surname": "ONE" }, } ], "Payment": [ { "@type": "Payment", "id": "payment_1", "PaymentRef": "payment_1", "Identifier": { "authority": "Travelport", "value": "1b030060-535c-4c35-b494-461e57b85ce0" }, "Amount": { "minorUnit": 2, "value": 1228 }, "FormOfPaymentIdentifier": { "FormOfPaymentRef": "formOfPayment_1" } }, { "@type": "Payment", "id": "payment_2", "PaymentRef": "payment_2", "Identifier": { "authority": "Travelport", "value": "ecdd1c3f-8b1f-425e-9ed2-9170d61eea29" }, "Amount": { "minorUnit": 2, "value": 17 }, "FormOfPaymentIdentifier": { "FormOfPaymentRef": "formOfPayment_1" } } ], "Receipt": [ { "@type": "ReceiptConfirmation", "Identifier": { "authority": "Travelport", "value": "318af9f0-0f38-4d33-90c5-19c984d8c9f5" }, "Confirmation": { "@type": "ConfirmationHold", "Locator": { "source": "1G", "value": "4QC71L" }, "OfferStatus": { "@type": "OfferStatusAir", "StatusAir": [ { "flightRefs": [ "Flight_01", "Flight_02" ], "code": "HK", "value": "Confirmed" } ] } } }, { "@type": "ReceiptConfirmation", "Identifier": { "authority": "Travelport", "value": "380f09a1-6764-4535-83e1-22a8bc574e48" }, "Confirmation": { "@type": "ConfirmationHold", "Locator": { "source": "EK", "value": "KCAESN" } } }, { "@type": "ReceiptConfirmation", "Identifier": { "authority": "Travelport", "value": "c647b437-6533-4995-9a43-1f9b7e852caa" }, "Confirmation": { "@type": "ConfirmationHold", "Locator": { "source": "1A", "value": "6Y4E9I" } } }, { "@type": "ReceiptPayment", "dateTime": "2023-06-22T12:01:00Z", "id": "receipt_1", "ReceiptRef": "receipt_1", "Identifier": { "authority": "Travelport", "value": "c9acb529-d0bd-4d7d-9d4d-06e0c20f537a" }, "OfferRef": [ "offer_1" ], "PaymentIdentifier": { "PaymentRef": "payment_1" }, "Document": [ { "@type": "DocumentTicket", "historicInd": true, "Number": "1769249908758", "TravelerIdentifierRef": { "passengerTypeCode": "ADT", "id": "travelerRefId_1", "value": "8af516ed-efaa-4757-8b4d-0f3ef0c7acd5" }, "Amount": { "@type": "Amount", "CurrencyCode": { "decimalPlace": 2, "value": "AUD" }, "Base": 1101, "Taxes": { "@type": "TaxesDetail", "TotalTaxes": 127, "Tax": [ { "taxCode": "AE", "value": 31 }, { "taxCode": "F6", "value": 14.5 }, { "taxCode": "TP", "value": 2.1 }, { "taxCode": "ZR", "value": 2.1 }, { "taxCode": "YQ", "value": 77.3 } ] }, "Total": 1228 }, "IssuingPCC": "79JP", "FiledAmount": { "currencyCode": "AED", "decimalPlace": 2, "value": 26.7 } } ] }, { "@type": "ReceiptPayment", "dateTime": "2023-06-22T12:11:00Z", "id": "receipt_2", "ReceiptRef": "receipt_2", "Identifier": { "authority": "Travelport", "value": "ed062944-6ff6-48f0-b4f4-6b3dd3b50f3d" }, "OfferRef": [ "offer_1" ], "Document": [ { "@type": "DocumentTicketExchange", "exchangeInd": true, "Number": "1769249908758", "TravelerIdentifierRef": { "passengerTypeCode": "ADT", "id": "travelerRefId_1", "value": "8af516ed-efaa-4757-8b4d-0f3ef0c7acd5" } } ] }, { "@type": "ReceiptPayment", "dateTime": "2023-06-22T12:11:00Z", "id": "receipt_3", "ReceiptRef": "receipt_3", "Identifier": { "authority": "Travelport", "value": "f22a9efc-4bdf-45a3-89ec-e24ba328e380" }, "OfferRef": [ "offer_1" ], "PaymentIdentifier": { "PaymentRef": "payment_2" }, "Document": [ { "@type": "DocumentTicket", "Number": "1769249908760", "TravelerIdentifierRef": { "passengerTypeCode": "ADT", "id": "travelerRefId_1", "value": "8af516ed-efaa-4757-8b4d-0f3ef0c7acd5" }, "Amount": { "@type": "Amount", "CurrencyCode": { "decimalPlace": 2, "value": "AUD" }, "Base": 1118, "Taxes": { "@type": "TaxesDetail", "TotalTaxes": 0 }, "Total": 17 }, "CumulativeValue": { "@type": "CumulativeValue", "approximateInd": true, "CurrencyCode": { "decimalPlace": 2, "value": "AUD" }, "Base": 1118, "Taxes": { "@type": "TaxesDetail", "TotalTaxes": 127, "Tax": [ { "taxCode": "AE", "value": 31 }, { "taxCode": "F6", "value": 14.5 }, { "taxCode": "TP", "value": 2.1 }, { "taxCode": "ZR", "value": 2.1 }, { "taxCode": "YQ", "value": 77.3 } ] }, "Total": 1245 }, "IssuingPCC": "79JP", "FiledAmount": { "currencyCode": "AED", "decimalPlace": 2, "value": 27.1 } } ] } ], "ReservationDisplaySequence": { "@type": "ReservationDisplaySequence", "DisplaySequence": [ { "@type": "DisplaySequence", "displaySequence": 1, "OfferRef": "offer_1", "ProductRef": "product_1", "Sequence": 1 }, { "@type": "DisplaySequence", "displaySequence": 2, "OfferRef": "offer_1", "ProductRef": "product_1", "Sequence": 2 } ] } } } } &#160;

## Literal `<pre>` excerpts from HTML

### Block 1

```
"Group": {
    "@type": "Group",
    "unallocatedPlaces": 8,
    "totalGroupPlaces": 11,
    "id": "group_1",
    "Identifier": {
     "authority": "Travelport",
     "value": "b12f085a-c10c-4faa-bd02-aee0985d1522"
    },
    "GroupName": "PARISREUNION"
   },
```

### Block 2

```
{
     "@type": "CustomAuxiliarySegment",
     "id": "customAuxiliarySegment_1",
     "Identifier": {
      "authority": "Travelport",
      "value": "27222aa9-e49f-4b14-96b6-7ebfaac75f8b"
     },
     "SegmentType": "TUR",
     "StatusCode": "BK",
     "Quantity": 1,
     "Location": "RNO",
     "Date": "2024-11-26",
     "CustomText": "CF-08291647",
     "SupplierCode": "ZZ"
    },
```

### Block 3

```
"ReservationDisplaySequence": {
    "@type": "ReservationDisplaySequence",
    "DisplaySequence": [
     {
      "@type": "DisplaySequence",
      "displaySequence": 3,
      "OfferRef": "offer_1",
      "ProductRef": "product_1",
      "Sequence": 3
     }
    ],
    "AuxiliaryDisplaySequence": [
     {
      "@type": "AuxiliaryDisplaySequence",
      "displaySequence": 2,
      "CustomAuxiliarySegmentRef": "customAuxiliarySegment_1"
     },
     {
      "@type": "AuxiliaryDisplaySequence",
      "displaySequence": 4,
      "CustomAuxiliarySegmentRef": "customAuxiliarySegment_2"
     }
    ]
   }
```

### Block 4

```
"PriceBreakdown": [
       {
        "@type": "PriceBreakdownAir",
        "Amount": {
         "@type": "Amount",
         "Base": 97,
         "CurrencyCode": {
          "value": "EUR"
         },
         "Fees": {
          "@type": "FeesDetail",
          "Fee": [
           {
            "@type": "Fee",
            "description": "AggregatorFee",
            "FeeAmountOrPercent": {
             "@type": "FeeAmountOrPercentAmount",
             "Amount": {
              "code": "EUR",
              "value": 1.33
             }
            }
           }
          ],
          "TotalFees": 1.33
         },
         "Taxes": {
          "@type": "TaxesDetail",
          "Tax": [
           {
            "taxCode": "YR",
            "value": 1.5
           },
           {
            "taxCode": "CJ",
            "value": 22.28
           },
           {
            "taxCode": "RN",
            "value": 32.05
           },
           {
            "taxCode": "VV",
            "value": 30.25
           }
          ],
          "TotalTaxes": 86.08
         },
         "Total": 184.41
        },
        "quantity": 1,
        "requestedPassengerType": "ADT"
       },
       {
        "@type": "PriceBreakdownAncillaryAir",
        "Amount": {
         "@type": "Amount",
         "Base": 14,
         "CurrencyCode": {
          "decimalPlace": 2,
          "value": "EUR"
         },
         "Fees": {
          "@type": "FeesDetail",
          "TotalFees": 0
         },
         "Total": 14
        },
        "Description": {
         "code": "A",
         "ssrCode": "SEAT",
         "subCode": "0B5",
         "value": "Bundled_SEAT"
        },
        "PassengerTypeCode": "ADT",
        "quantity": 1
       }
      ],
```

### Block 5

```
"PassengerCriteriaRefs": [
                  "x02"
                ],
                "TravelerIdentifierRef": {
                  "ages": [
                    11
                  ]
                }
```

### Block 6

```
{
     "@type": "ReceiptCancellation",
     "Identifier": {
      "authority": "Travelport",
      "value": "a2fd7c20-2fef-4151-9904-7f6eef71b7f0"
     },
     "Cancellation": {
      "@type": "CancellationHold",
      "Locator": {
       "source": "1A",
       "value": "FBYU87"
      }
     }
    },
```

### Block 7

```
"SpecialService": [
                {
                    "@type": "SpecialServiceRequirement",
                    "id": "SpecialService_1",
                    "Identifier": {
                        "authority": "Travelport",
                        "value": "eabe7fdd-86f3-4c0f-8c2c-425312716ba0"
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
                        "value": "Confirmed"
                    },
                    "TravelerIdentifier": {
                        "TravelerRef": "travelerRefId_1",
                        "Identifier": {
                            "authority": "Travelport",
                            "value": "1e3ca199-9b77-45b3-b16f-e4dd05d5d99a"
                        }
                    },
                    "SSRCode": "BFFF",
                    "FreeText": "AV/CLASSIC",
                    "Quantity": 1
                },
                {
                    "@type": "SpecialServiceRequirement",
                    "id": "SpecialService_4",
                    "Identifier": {
                        "authority": "Travelport",
                        "value": "7776a4bd-a1ab-48b9-97ed-200972b48620"
                    },
                    "AppliesTo": {
                        "@type": "AppliesToOfferProductSegment",
                        "OfferIdentifier": {
                            "offerRef": "offer_1"
                        },
                        "ProductIdentifier": {
                            "productRef": "product_2"
                        },
                        "SegmentSequenceList": [
                            2
                        ]
                    },
                    "Status": {
                        "value": "Confirmed"
                    },
                    "TravelerIdentifier": {
                        "TravelerRef": "travelerRefId_2",
                        "Identifier": {
                            "authority": "Travelport",
                            "value": "31dade09-2fb9-4dce-9a9f-8db05463d0fa"
                        }
                    },
                    "SSRCode": "BFFF",
                    "FreeText": "AV/CLASSIC",
                    "Quantity": 1
                }
            ],
```

### Block 8

```
"ReservationComment": [
    {
    "@type": "ReservationComment",
    "commentSource": "Supplier",
    "shareWithSupplier": [
        "NK"
    ],
    "Comment": [
        {
        "name": "Ticketless",
        "value": "VIXXXXXXXXXXXX5550/D0422/RAMA SARAVANA"
        },
        {
        "name": "Ticketless",
        "value": "ADTK1GTONK ON/BEFORE 20JUN 1023Z OTHERWISE WILL BE XLD"
        },
        {
        "name": "Ticketless",
        "value": "MOST FARES EXCL GOV FARES REQUIRE TKT WITHIN 24 HRS"
        },
        ]
      }
    ],
```

### Block 9

```
{
 "ReservationResponse": {
  "@type": "ReservationResponse",
  "Reservation": {
   "@type": "Reservation",
   "Identifier": {
    "authority": "Travelport",
    "value": "0ac7cfce-6192-4f32-b6b7-6dede455c17b"
   },
   "Offer": [
    {
     "@type": "Offer",
     "id": "offer_1",
     "Identifier": {
      "authority": "AA",
      "value": "MTVhM2E4ZjQtM2Y2Mi00MzlmLTgyMzctYWVlYzMwZTA4ODY5fFA1QjQyQTU3My1CMTIxLTRGODMtODY3OHN4aHRiMTR5MjNydmMtMS0x"
     },
     "Product": [
      {
       "@type": "ProductAir",
       "totalDuration": "PT2H29M",
       "id": "product_1",
       "Identifier": {
        "authority": "AA",
        "value": "3e08fb8b-b5ed-42e6-be7f-f0e628307d26"
       },
       "FlightSegment": [
        {
         "@type": "FlightSegment",
         "sequence": 1,
         "Flight": {
          "@type": "Flight",
          "duration": "PT2H29M",
          "carrier": "AA",
          "number": "6221",
          "equipment": "E75",
          "id": "seg_1",
          "Identifier": {
           "authority": "AA",
           "value": "6bc12b59-3387-4509-8975-64cd37e28d7d"
          },
          "Departure": {
           "@type": "DepartureDetail",
           "terminal": "0",
           "location": "LAX",
           "date": "2025-03-21",
           "time": "09:22:00"
          },
          "Arrival": {
           "@type": "ArrivalDetail",
           "location": "DEN",
           "date": "2025-03-21",
           "time": "12:51:00"
          }
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
            1
           ],
           "classOfService": "L",
           "cabin": "Economy",
           "fareBasisCode": "LUAIYSN1",
           "fareType": "PublicFare",
           "Brand": {
            "@type": "Brand",
            "name": "Main Cabin"
           }
          }
         ]
        }
       ]
      }
     ],
     "Price": {
      "@type": "PriceDetail",
      "CurrencyCode": {
       "decimalPlace": 2,
       "value": "AUD"
      },
      "Base": 370,
      "TotalTaxes": 51.8,
      "TotalPrice": 421.8,
      "PriceBreakdown": [
       {
        "@type": "PriceBreakdownAir",
        "quantity": 1,
        "requestedPassengerType": "ADT",
        "Amount": {
         "@type": "Amount",
         "CurrencyCode": {
          "decimalPlace": 2,
          "value": "AUD"
         },
         "Base": 370,
         "Taxes": {
          "@type": "TaxesDetail",
          "TotalTaxes": 51.8,
          "Tax": [
           {
            "taxCode": "US",
            "description": "U.S.A Transportation Tax",
            "value": 27.7
           },
           {
            "taxCode": "XF",
            "description": "U.S Passenger Facility Charge",
            "value": 7.1
           },
           {
            "taxCode": "ZP",
            "description": "U.S. Flight Segment Tax",
            "value": 8.2
           },
           {
            "taxCode": "AY",
            "description": "Passenger Civil Aviation Security Service Fee",
            "value": 8.8
           }
          ]
         },
         "Total": 421.8
        }
       }
      ]
     },
     "TermsAndConditionsFull": [
      {
       "@type": "TermsAndConditionsFullAir",
       "ExpiryDate": "2025-02-23T23:59:00Z",
       "TextBlock": [
        {
         "@type": "TextBlockDetail",
         "description": "FARE RULES",
         "title": "Ticketing",
         "TextFormatted": [
          {
           "value": "NONREF/FAREDIF/"
          },
          {
           "value": "CXL BY FLT TIME OR NOVALUE"
          }
         ]
        }
       ],
       "BaggageAllowance": [
        {
         "@type": "BaggageAllowanceDetail",
         "passengerTypeCodes": [
          "ADT"
         ],
         "baggageType": "FirstCheckedBag",
         "ProductRef": [
          "product_1"
         ],
         "BaggageItem": [
          {
           "@type": "BaggageItem",
           "quantity": 0
          }
         ],
         "SegmentSequenceList": [
          1
         ],
         "Text": [
          "0PC"
         ]
        },
        {
         "@type": "BaggageAllowanceDetail",
         "passengerTypeCodes": [
          "ADT"
         ],
         "baggageType": "CarryOn",
         "ProductRef": [
          "product_1"
         ],
         "BaggageItem": [
          {
           "@type": "BaggageItem",
           "quantity": 2
          }
         ],
         "SegmentSequenceList": [
          1
         ],
         "Text": [
          "2PC"
         ]
        }
       ],
       "FareRuleInfo": [
        {
         "@type": "FareRuleInfoText",
         "flightsRefs": [
          "seg_1"
         ],
         "TextFareRule": [
          {
           "name": "Cancel",
           "value": "Not Allowed"
          }
         ]
        }
       ],
       "PaymentTimeLimit": "2025-02-23T23:59:00Z",
       "Penalties": [
        {
         "@type": "Penalties",
         "Change": [
          {
           "@type": "ChangePermitted",
           "ProductRefs": [
            "product_1"
           ]
          }
         ],
         "Cancel": [
          {
           "@type": "CancelNotPermitted",
           "ProductRefs": [
            "product_1"
           ],
           "NotPermittedInd": "true"
          }
         ],
         "PassengerTypeCodes": [
          "ADT"
         ]
        }
       ]
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
     "id": "trav_1",
     "TravelerRef": "trav_1",
     "Identifier": {
      "authority": "Travelport",
      "value": "QURUfFQx"
     },
     "PersonName": {
      "@type": "PersonName",
      "Given": "TESTFIRST",
      "Surname": "TESTLAST"
     },
     "Telephone": [
      {
       "@type": "Telephone",
       "countryAccessCode": "1",
       "phoneNumber": "212456121",
       "id": "4",
       "cityCode": "ORD",
       "role": "Home"
      }
     ],
     "Email": [
      {
       "id": "email_1",
       "validInd": true,
       "value": "TRAVELERONE@GMAIL.COM"
      }
     ],
     "TravelDocument": [
      {
       "@type": "TravelDocumentDetail",
       "docNumber": "A123123",
       "docType": "Passport",
       "expireDate": "2035-02-21",
       "issueCountry": "US",
       "birthDate": "1986-11-11",
       "Gender": "Male",
       "PersonName": {
        "@type": "PersonName",
        "Given": "TestFirst",
        "Surname": "TestLast"
       }
      }
     ]
    }
   ],
   "Receipt": [
    {
     "@type": "ReceiptConfirmation",
     "id": "receipt_1",
     "Identifier": {
      "authority": "AA",
      "value": "4afd7900-bcf6-4473-9109-44bd60d14ffb"
     },
     "OfferRef": [
      "offer_1"
     ],
     "Confirmation": {
      "@type": "ConfirmationHold",
      "Locator": {
       "source": "AA",
       "sourceContext": "OrderId",
       "value": "AA001HGO3HWA4"
      }
     }
    },
    {
     "@type": "ReceiptConfirmation",
     "id": "receipt_2",
     "Identifier": {
      "authority": "AA",
      "value": "ba4391ec-e0da-4290-98ca-f17d5b7b1060"
     },
     "OfferRef": [
      "offer_1"
     ],
     "Confirmation": {
      "@type": "ConfirmationHold",
      "Locator": {
       "source": "AA",
       "sourceContext": "VendorLocator",
       "value": "IKRWES"
      },
      "OfferStatus": {
       "@type": "OfferStatusAir",
       "StatusAir": [
        {
         "flightRefs": [
       
…
```

### Block 10

```
{
 "ReservationResponse": {
  "@type": "ReservationResponse",
  "Reservation": {
   "@type": "Reservation",
   "Identifier": {
    "authority": "Travelport",
    "value": "f22fbe87-e17b-4e9d-b5f2-096f93a396bf"
   },
   "Offer": [
    {
     "@type": "Offer",
     "id": "offer_1",
     "Identifier": {
      "authority": "Travelport",
      "value": "ee4ca6f4-127b-49b6-b74c-7840bb1ae121"
     },
     "ContentSource": "GDS",
     "Product": [
      {
       "@type": "ProductAir",
       "id": "product_1",
       "Identifier": {
        "authority": "Travelport",
        "value": "0dc2b9c4-baef-4af5-bdf2-2656393b5cae"
       },
       "FlightSegment": [
        {
         "@type": "FlightSegment",
         "id": "FlightSegment_01",
         "sequence": 1,
         "Flight": {
          "@type": "Flight",
          "duration": "PT2H34M",
          "carrier": "AA",
          "number": "2755",
          "equipment": "319",
          "id": "Flight_01",
          "Identifier": {
           "authority": "Travelport",
           "value": "12634c53-880e-4b80-831c-8fe795f73c24"
          },
          "Departure": {
           "@type": "Departure",
           "location": "ORD",
           "date": "2025-06-28",
           "time": "07:00:00"
          },
          "Arrival": {
           "@type": "Arrival",
           "location": "DEN",
           "date": "2025-06-28",
           "time": "08:39:00"
          }
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
            1
           ],
           "classOfService": "Y",
           "cabin": "Economy",
           "fareBasisCode": "B0AIZNN1",
           "fareType": "PublicFare",
           "Brand": {
            "@type": "Brand",
            "name": "MAIN CABIN",
            "tier": 4,
            "id": "1752032"
           }
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
      "Base": 854,
      "TotalTaxes": 89.6,
      "TotalFees": 0,
      "TotalPrice": 943.6,
      "PriceBreakdown": [
       {
        "@type": "PriceBreakdownAir",
        "quantity": 1,
        "requestedPassengerType": "ADT",
        "Amount": {
         "@type": "Amount",
         "CurrencyCode": {
          "decimalPlace": 2,
          "value": "USD"
         },
         "Base": 514.59
        },
        "TravelerRefs": [
         "travelerRefId_1"
        ]
       },
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
         "Base": 854,
         "Taxes": {
          "@type": "TaxesDetail",
          "TotalTaxes": 89.6,
          "Tax": [
           {
            "currencyCode": "AUD",
            "taxCode": "AY",
            "value": 9.3
           },
           {
            "currencyCode": "AUD",
            "taxCode": "US",
            "value": 64.1
           },
           {
            "currencyCode": "AUD",
            "taxCode": "XF",
            "value": 7.5
           },
           {
            "currencyCode": "AUD",
            "taxCode": "ZP",
            "value": 8.7
           }
          ]
         },
         "Total": 943.6
        },
        "FiledAmount": {
         "currencyCode": "USD",
         "decimalPlace": 2,
         "value": 514.59
        },
        "TravelerRefs": [
         "travelerRefId_1"
        ],
        "FareCalculation": "CHI AA DEN Q0.17 514.42B0AIZNN1 USD514.59END"
       }
      ]
     },
     "TermsAndConditionsFull": [
      {
       "@type": "TermsAndConditionsFullAir",
       "secureFlightPassengerDataRequiredInd": true,
       "Identifier": {
        "authority": "Travelport",
        "value": "9dc1e6ed-b81d-42a1-bf44-3635ea7b69f6"
       },
       "ExpiryDate": "2025-05-29T23:59:00Z",
       "BaggageAllowance": [
        {
         "@type": "BaggageAllowanceDetail",
         "passengerTypeCodes": [
          "ADT"
         ],
         "SegmentSequenceList": [
          1
         ],
         "Text": [
          "0PC"
         ]
        }
       ],
       "ValidatingAirline": [
        {
         "@type": "ValidatingAirline",
         "ValidatingAirline": "AA"
        }
       ],
       "TicketingAgency": [
        {
         "@type": "TicketingAgency",
         "Code": "PCC"
        }
       ],
       "PaymentTimeLimit": "2025-05-30T23:59:00Z",
       "PricingAgency": [
        {
         "@type": "PricingAgency",
         "Code": "PCC"
        }
       ],
       "FareGuaranteePolicy": [
        {
         "@type": "FareGuaranteePolicy",
         "passengerTypeCodes": [
          "ADT"
         ],
         "Code": {
          "value": "G"
         }
        }
       ]
      },
      {
       "@type": "TermsAndConditionsFullAir",
       "Restriction": [
        {
         "value": "NONREF/FAREDIF/"
        },
        {
         "value": "CXL BY FLT TIME OR NOVALUE"
        }
       ]
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
      "value": "41fa22da-1e54-4fe4-8500-040d45b5853b"
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
       "emailType": "TO",
       "value": "TravelerOne@gmail.com"
      }
     ],
     "TravelDocument": [
      {
       "@type": "TravelDocumentDetail",
       "birthDate": "1986-11-11",
       "Gender": "Male",
       "PersonName": {
        "@type": "PersonName",
        "Given": "TESTFIRST",
        "Surname": "TESTLAST"
       }
      },
      {
       "@type": "TravelDocumentDetail",
       "docNumber": "A123123",
       "docType": "Passport",
       "expireDate": "2035-05-28",
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
   "FormOfPayment": [
    {
     "@type": "FormOfPaymentCash",
     "id": "formOfPayment_1",
     "Identifier": {
      "authority": "Travelport",
      "value": "9e03db58-2765-4ab7-a231-9723c2648dc4"
     }
    }
   ],
   "Payment": [
    {
     "@type": "Payment",
     "id": "payment_1",
     "PaymentRef": "payment_1",
     "Identifier": {
      "authority": "Travelport",
      "value": "faecf15a-919c-478f-8203-68fc6602eb7c"
     },
     "Amount": {
      "minorUnit": 2,
      "value": 943.6
     },
     "FormOfPaymentIdentifier": {
      "FormOfPaymentRef": "formOfPayment_1"
     }
    }
   ],
   "Receipt": [
    {
     "@type": "ReceiptConfirmation",
     "Identifier": {
      "authority": "Travelport",
      "value": "36c277b9-aca1-49c8-9e0f-42b2f42e4061"
     },
     "Confirmation": {
      "@type": "ConfirmationHold",
      "Locator": {
       "source": "1G",
       "creationD
…
```

### Block 11

```
{
 "ReservationResponse": {
  "@type": "ReservationResponse",
  "Reservation": {
   "@type": "Reservation",
   "Identifier": {
    "authority": "Travelport",
    "value": "9d2f62d2-86c1-4d23-9310-9fd6791a2ad1"
   },
   "Offer": [
    {
     "@type": "Offer",
     "id": "offer_1",
     "Identifier": {
      "authority": "Travelport",
      "value": "cb56e837-c065-47f1-af00-b381dd8e8d8b"
     },
     "Product": [
      {
       "@type": "ProductAir",
       "id": "product_1",
       "Identifier": {
        "authority": "Travelport",
        "value": "4ea1830b-94a9-4624-8877-c480bc8ba921"
       },
       "FlightSegment": [
        {
         "@type": "FlightSegment",
         "id": "FlightSegment_01",
         "sequence": 1,
         "connectionDuration": "PT1H38M",
         "amenityRefs": [
          "a3",
          "a5",
          "a7",
          "a9",
          "a11",
          "a12",
          "a13",
          "a14"
         ],
         "boundFlightsInd": true,
         "Flight": {
          "@type": "Flight",
          "duration": "PT5H42M",
          "carrier": "UA",
          "number": "1757",
          "equipment": "777",
          "id": "Flight_01",
          "Identifier": {
           "authority": "Travelport",
           "value": "e5a71f5b-b46d-4b45-bde1-f56809fdf1bb"
          },
          "Departure": {
           "@type": "Departure",
           "location": "IAD",
           "date": "2024-09-30",
           "time": "18:15:00"
          },
          "Arrival": {
           "@type": "Arrival",
           "location": "SFO",
           "date": "2024-09-30",
           "time": "20:57:00"
          }
         }
        },
        {
         "@type": "FlightSegment",
         "id": "FlightSegment_02",
         "sequence": 2,
         "amenityRefs": [
          "a0",
          "a1",
          "a2",
          "a4",
          "a6",
          "a8",
          "a9",
          "a10"
         ],
         "Flight": {
          "@type": "Flight",
          "duration": "PT1H49M",
          "carrier": "UA",
          "number": "1318",
          "equipment": "7M8",
          "id": "Flight_02",
          "Identifier": {
           "authority": "Travelport",
           "value": "6dcf5cef-f095-4963-b8ff-9cbcede55119"
          },
          "Departure": {
           "@type": "Departure",
           "location": "SFO",
           "date": "2024-09-30",
           "time": "22:35:00"
          },
          "Arrival": {
           "@type": "Arrival",
           "location": "PDX",
           "date": "2024-10-01",
           "time": "00:24:00"
          }
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
           "classOfService": "Y",
           "cabin": "Economy"
          }
         ]
        }
       ]
      }
     ],
     "TermsAndConditionsFull": [
      {
       "@type": "TermsAndConditionsFullAir",
       "secureFlightPassengerDataRequiredInd": true,
       "Identifier": {
        "authority": "Travelport",
        "value": "57f01f9c-ee45-4e7c-9eeb-c355da7eb36f"
       }
      }
     ]
    }
   ],
   "Traveler": [
    {
     "@type": "Traveler",
     "birthDate": "1980-03-03",
     "gender": "Male",
     "passengerTypeCode": "ADT",
     "id": "travelerRefId_1",
     "Identifier": {
      "authority": "Travelport",
      "value": "05fdacfc-ca1e-4cd1-ab89-7e61191a8561"
     },
     "PersonName": {
      "@type": "PersonName",
      "Given": "SAM HON",
      "Surname": "HOUSTON"
     },
     "Telephone": [
      {
       "@type": "TelephoneDetail",
       "phoneNumber": "7139998887",
       "id": "telephone_1",
       "cityCode": "IAH",
       "role": "Mobile"
      }
     ],
     "TravelDocument": [
      {
       "@type": "TravelDocumentDetail",
       "birthDate": "1980-03-03",
       "Gender": "Male",
       "PersonName": {
        "@type": "PersonName",
        "Given": "SAM ",
        "Surname": "HOUSTON"
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
      "value": "17127c61-7323-499d-b594-ad39d5c69696"
     },
     "Confirmation": {
      "@type": "ConfirmationHold",
      "Locator": {
       "source": "1G",
       "creationDate": "2024-09-16",
       "value": "8SRYC9"
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
      "value": "e5109aa1-fb3c-45b5-8534-dce81f45f686"
     },
     "Confirmation": {
      "@type": "ConfirmationHold",
      "Locator": {
       "source": "UA",
       "value": "ID0YFD"
      }
     }
    }
   ],
   "ReservationComment": [
    {
     "@type": "ReservationComment",
     "commentSource": "Supplier",
     "shareWith": "Agency",
     "shareWithSupplier": [
      "UA"
     ],
     "id": "RSRVComment_1",
     "Comment": [
      {
       "id": "VeiComment_1",
       "name": "Vendor Remarks",
       "value": "ADTK1GKK1.TKT UA SEGS BY 27SEP24 TO AVOID AUTO CXL /EARLIER"
      },
      {
       "id": "VeiComment_2",
       "name": "Vendor Remarks",
       "value": "ADTK1GKK1 .TICKETING MAY BE REQUIRED BY FARE RULE"
      }
     ]
    }
   ],
   "ReservationDisplaySequence": {
    "@type": "ReservationDisplaySequence",
    "DisplaySequence": [
     {
      "@type": "DisplaySequence",
      "displaySequence": 1,
      "OfferRef": "offer_1",
      "ProductRef": "product_1",
      "Sequence": 1
     },
     {
      "@type": "DisplaySequence",
      "displaySequence": 2,
      "OfferRef": "offer_1",
      "ProductRef": "product_1",
      "Sequence": 2
     }
    ]
   }
  },
  "Result": {
   "@type": "Result",
   "Warning": [
    {
     "@type": "Warning",
     "Message": "NO FARES FOUND"
    }
   ]
  },
  "ReferenceList": [
   {
    "@type": "ReferenceListAmenity",
    "Amenity": [
     {
      "@type": "Amenity",
      "id": "a0",
      "Category": "WiFi",
      "Text": {
       "language": "en",
       "value": "Streaming Capable Wi-Fi (fee)"
      }
     },
     {
      "@type": "Amenity",
      "id": "a1",
      "Category": "Food",
      "Text": {
       "language": "en",
       "value": "Premium snacks (fee)"
      }
     },
     {
      "@type": "Amenity",
      "id": "a2",
      "Category": "Aircraft",
      "Text": {
       "language": "en",
       "value": "737 MAX (narrowbody)"
      }
     },
     {
      "@type": "Amenity",
      "id": "a3",
      "Category": "Layout",
      "Text": {
       "language": "en",
       "value": "3-4-3 seat layout"
      }
     },
     {
      "@type": "Amenity",
      "id": "a4",
      "Category": "Power",
      "Text": {
       "language": "en",
       "value": "Power &amp; USB outlets"
      }
     },
     {
      "@type": "Amenity",
      "id": "a5",
      "Category": "Aircraft",
      "Text": {
       "language": "en",
       "value": "777 (widebody)"
      }
     },
     {
      "@type": "Amenity",
      "id": "a6",
      "Category": "Layout",
      "Text": {
       "language": "en",
       "value": "3-3 seat layout"
      }
     },
     {
      "@type": "Amenity",
      "id": "a7",
      "Category": "Power",
      "Text": {
       "language": "en",
       "valu
…
```

### Block 12

```
{
 "ReservationResponse": {
  "@type": "ReservationResponse",
  "Reservation": {
   "@type": "Reservation",
   "Identifier": {
    "authority": "Travelport",
    "value": "acf49665-28c6-4e93-965f-8479a05782b1"
   },
   "Offer": [
    {
     "@type": "Offer",
     "id": "offer_1",
     "Identifier": {
      "authority": "Travelport",
      "value": "16e236bc-b209-4dd9-af16-4e70f91d2a34"
     },
     "ContentSource": "GDS",
     "Product": [
      {
       "@type": "ProductAir",
       "id": "product_1",
       "Identifier": {
        "authority": "Travelport",
        "value": "c600a801-1cec-416d-bf62-b69e7b573c01"
       },
       "FlightSegment": [
        {
         "@type": "FlightSegment",
         "id": "FlightSegment_01",
         "sequence": 1,
         "Flight": {
          "@type": "Flight",
          "duration": "PT3H55M",
          "carrier": "SQ",
          "number": "874",
          "equipment": "359",
          "id": "Flight_01",
          "Identifier": {
           "authority": "Travelport",
           "value": "b1f5d977-215c-4795-9593-b48e59f09654"
          },
          "Departure": {
           "@type": "Departure",
           "location": "SIN",
           "date": "2025-05-09",
           "time": "07:25:00"
          },
          "Arrival": {
           "@type": "Arrival",
           "location": "HKG",
           "date": "2025-05-09",
           "time": "11:20:00"
          }
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
            1
           ],
           "classOfService": "Y",
           "cabin": "Economy",
           "fareBasisCode": "Y11SGOPO",
           "fareType": "AirlinePrivateFare",
           "Brand": {
            "@type": "Brand",
            "name": "ECONOMY FLEXI",
            "tier": 4,
            "id": "1721314"
           }
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
       "value": "USD"
      },
      "Base": 663,
      "TotalTaxes": 68.4,
      "TotalFees": 0,
      "TotalPrice": 731.4,
      "PriceBreakdown": [
       {
        "@type": "PriceBreakdownAir",
        "quantity": 1,
        "requestedPassengerType": "ADT",
        "Amount": {
         "@type": "Amount",
         "CurrencyCode": {
          "decimalPlace": 2,
          "value": "SGD"
         },
         "Base": 892
        },
        "TravelerRefs": [
         "travelerRefId_1"
        ],
        "NetBaseAmount": {
         "currencyCode": "SGD",
         "decimalPlace": 2,
         "value": 892
        }
       },
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
          "value": "USD"
         },
         "Base": 663,
         "Taxes": {
          "@type": "TaxesDetail",
          "TotalTaxes": 68.4,
          "Tax": [...]
         },
         "Total": 731.4
        },
        "Commission": {
         "@type": "CommissionAmount",
         "Amount": {
          "code": "USD",
          "minorUnit": 4,
          "value": 0
         }
        },
        "FiledAmount": {
         "currencyCode": "SGD",
         "decimalPlace": 2,
         "value": 892
        },
        "TravelerRefs": [
         "travelerRefId_1"
        ],
        "FareCalculation": "SIN SQ HKG 666.60Y11SGOPO NUC666.60END ROE1.338125"
       }
      ]
     },
     "TermsAndConditionsFull": [
      {...},
      {...}
     ]
    }
   ],
   "Traveler": [
    {
     "@type": "Traveler",
     "passengerTypeCode": "ADT",
     "id": "travelerRefId_1",
     "Identifier": {
      "authority": "Travelport",
      "value": "4dfb7cd9-3651-4641-adc0-ccf2f3b358bb"
     },
     "PersonName": {
      "@type": "PersonName",
      "Given": "JIM",
      "Surname": "BOWIE"
     },
     "Telephone": [ ... ]
    }
   ],
   "TravelerProduct": [
    {
     "@type": "TravelerProduct",
     "id": "travelerProduct_1",
     "TravelerRef": "travelerRefId_1",
     "UnpricedFlightSegmentRefs": [
      "unPricedFlightSegment_1"
     ]
    }
   ],
   "Payment": [
    {
     "@type": "Payment",
     "id": "payment_1",
     "PaymentRef": "payment_1",
     "Identifier": {
      "authority": "Travelport",
      "value": "eeb96c78-c234-430f-99df-fa2a90bb7b49"
     },
     "Amount": {
      "minorUnit": 2,
      "value": 731.4
     },
     "FormOfPaymentIdentifier": {
      "FormOfPaymentRef": "formOfPayment_1"
     }
    }
   ],
   "Receipt": [
    {
     "@type": "ReceiptConfirmation",
     "Identifier": {
      "authority": "Travelport",
      "value": "5b193a75-b62c-440d-85d6-e66c819520f6"
     },
     "Confirmation": {
      "@type": "ConfirmationHold",
      "Locator": {
       "source": "1G",
       "creationDate": "2025-04-15",
       "value": "BXF90D"
      },
      "OfferStatus": {
       "@type": "OfferStatusAir",
       "StatusAir": [
        {
         "flightRefs": [
          "Flight_01"
         ],
         "code": "HK",
         "value": "Confirmed"
        }
       ]
      },
      "UnpricedSegmentsStatus": [
       {
        "@type": "UnpricedSegmentsStatus",
        "StatusAir": [
         {
          "flightRefs": [
           "Flight_02"
          ],
          "code": "HK",
          "value": "Confirmed"
         }
        ]
       }
      ]
     }
    },
    {
     "@type": "ReceiptConfirmation",
     "Identifier": {
      "authority": "Travelport",
      "value": "a69986cc-0ca2-41c3-a126-7f4346163686"
     },
     "Confirmation": {
      "@type": "ConfirmationHold",
      "Locator": {
       "source": "1A",
       "value": "62OB43"
      }
     }
    },
    {
     "@type": "ReceiptPayment",
     "dateTime": "2025-04-15T19:42:00Z",
     "id": "receipt_1",
     "ReceiptRef": "receipt_1",
     "Identifier": {
      "authority": "Travelport",
      "value": "9ee32f47-d590-4e9f-bf67-6969b022b33e"
     },
     "OfferRef": [
      "offer_1"
     ],
     "Document": [
      {
       "@type": "DocumentTicket",
       "Number": "6189905257307",
       "TravelerIdentifierRef": {
        "passengerTypeCode": "ADT",
        "id": "travelerRefId_1",
        "value": "27a7756a-b347-405f-aee0-65fe2fcad082"
       },
       "Amount": {
        "@type": "Amount",
        "CurrencyCode": {
         "decimalPlace": 2,
         "value": "USD"
        },
        "Base": 663,
        "Taxes": {
         "@type": "TaxesDetail",
         "TotalTaxes": 68.4,
         "Tax": [...]
        },
        "Total": 731.4
       },
       "IssuingPCC": "XB7",
       "FiledAmount": {
        "currencyCode": "SGD",
        "decimalPlace": 2,
        "value": 892
       }
      }
     ],
     "PaymentIdentifier": {
      "id": "payment_1",
      "PaymentRef": "payment_1",
      "Identifier": {
       "authority": "Travelport",
       "value": "eeb96c78-c234-430f-99df-fa2a90bb7b49"
      }
     }
    }
   ],
   "UnpricedSegments": {
    "@type": "UnpricedSegments",
    "UnpricedFlightSegment": [
     {
      "@type": "UnpricedFlightSegment",
      "id": "unPricedFlightSegment_1",
      "sequence": 2,
      "passengerQuantity": 1,
      "cabin": "Economy",
      "classOfService": "Y",
      "Flight": {
       "@type": "Flight",
       "duration": "PT2H20M",
       "carrier": "CX",
       "number": "901",
       "equipment": "
…
```

### Block 13

```
{
 "ReservationResponse": {
  "@type": "ReservationResponse",
  "Reservation": {
   "@type": "Reservation",
   "Identifier": {
    "authority": "Travelport",
    "value": "52639c16-3e48-4678-9256-fde96a725fd7"
   },
   "Offer": [
    {
     "@type": "OfferModify",
     "id": "offer_1",
     "Identifier": {
      "authority": "Travelport",
      "value": "7f2c4bbc-4555-4173-9252-7e31a42fac1c"
     },
     "Product": [
      {
       "@type": "ProductAir",
       "id": "product_1",
       "Identifier": {
        "authority": "Travelport",
        "value": "fdc0ed7a-94a2-437c-8d11-9032f6636d66"
       },
       "FlightSegment": [
        {
         "@type": "FlightSegment",
         "id": "FlightSegment_01",
         "sequence": 1,
         "Flight": {
          "@type": "Flight",
          "duration": "PT3H15M",
          "carrier": "EK",
          "number": "0512",
          "id": "Flight_01",
          "Identifier": {
           "authority": "Travelport",
           "value": "a20455cd-c108-40bc-84f7-489d0eee1827"
          },
          "Departure": {
           "@type": "Departure",
           "location": "DXB",
           "date": "2023-07-23",
           "time": "22:00:00"
          },
          "Arrival": {
           "@type": "Arrival",
           "location": "DEL",
           "date": "2023-07-24",
           "time": "02:45:00"
          }
         }
        },
        {
         "@type": "FlightSegment",
         "id": "FlightSegment_02",
         "sequence": 2,
         "connectionDuration": "PT3H15M",
         "Flight": {
          "@type": "Flight",
          "duration": "PT2H",
          "carrier": "UK",
          "number": "0975",
          "equipment": "320",
          "id": "Flight_02",
          "Identifier": {
           "authority": "Travelport",
           "value": "b931c0f4-c407-44c7-9c08-2e10ad478106"
          },
          "Departure": {
           "@type": "Departure",
           "location": "DEL",
           "date": "2023-07-24",
           "time": "06:00:00"
          },
          "Arrival": {
           "@type": "Arrival",
           "location": "BOM",
           "date": "2023-07-24",
           "time": "08:00:00"
          }
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
            1
           ],
           "classOfService": "R",
           "cabin": "First",
           "fareBasisCode": "RLOWFAE1",
           "fareType": "PublicFare",
           "Brand": {
            "@type": "Brand"
           }
          },
          {
           "@type": "FlightProduct",
           "segmentSequence": [
            2
           ],
           "classOfService": "P",
           "cabin": "First",
           "fareBasisCode": "RLOWFAE1",
           "fareType": "PublicFare",
           "Brand": {
            "@type": "Brand"
           }
          }
         ]
        }
       ]
      }
     ],
     "Price": {
      "@type": "PriceDetail",
      "CurrencyCode": {
       "decimalPlace": 2,
       "value": "AUD"
      },
      "Base": 1118,
      "TotalTaxes": 127,
      "TotalFees": 0,
      "TotalPrice": 1245,
      "PriceBreakdown": [
       {
        "@type": "PriceBreakdownAir",
        "quantity": 1,
        "requestedPassengerType": "ADT",
        "Amount": {
         "@type": "Amount",
         "CurrencyCode": {
          "decimalPlace": 2,
          "value": "AUD"
         },
         "Base": 1118,
         "Taxes": {
          "@type": "TaxesDetail",
          "TotalTaxes": 127,
          "Tax": [
           {
            "taxCode": "AE",
            "value": 31
           },
           {
            "taxCode": "F6",
            "value": 14.5
           },
           {
            "taxCode": "TP",
            "value": 2.1
           },
           {
            "taxCode": "YQ",
            "value": 77.3
           },
           {
            "taxCode": "ZR",
            "value": 2.1
           }
          ]
         },
         "Fees": {
          "@type": "FeesDetail",
          "TotalFees": 0
         },
         "Total": 1245
        },
        "FiledAmount": {
         "currencyCode": "AED",
         "decimalPlace": 0,
         "value": 2710
        },
        "FareCalculation": "DXB EK X/DEL UK BOM737.27NUC737.27ENDROE3.67275"
       }
      ]
     },
     "TermsAndConditionsFull": [
      {
       "@type": "TermsAndConditionsFullAirChange",
       "id": "termsAndConditions_1",
       "Identifier": {
        "authority": "Travelport",
        "value": "c68c1053-e108-484d-bff8-4f5634fb1a1e"
       },
       "Restriction": [
        {
         "value": "* NON-END/FLEX PLUS"
        }
       ],
       "ValidatingAirline": [
        {
         "@type": "ValidatingAirline",
         "ValidatingAirline": "EK"
        }
       ],
       "FareGuaranteePolicy": [
        {
         "@type": "FareGuaranteePolicy",
         "passengerTypeCodes": [
          "ADT"
         ],
         "Code": {
          "codeContext": "Travelport",
          "value": "G"
         }
        },
        {
         "@type": "FareGuaranteePolicy",
         "passengerTypeCodes": [
          "ADT"
         ],
         "Code": {
          "codeContext": "Travelport",
          "value": "G"
         }
        }
       ]
      }
     ],
     "ModifyPrice": {
      "@type": "ModifyPriceDetail",
      "id": "modifyPrice_2",
      "CurrencyCode": {
       "decimalPlace": 2,
       "value": "AUD"
      },
      "Base": 17,
      "TotalFees": 0,
      "TotalPrice": 17,
      "PriceBreakdown": [
       {
        "@type": "PriceBreakdownAir",
        "quantity": 1,
        "requestedPassengerType": "ADT",
        "Amount": {
         "@type": "Amount",
         "CurrencyCode": {
          "decimalPlace": 2,
          "value": "AUD"
         },
         "Base": 17,
         "Fees": {
          "@type": "FeesDetail",
          "TotalFees": 0
         },
         "Total": 17
        }
       }
      ]
     }
    }
   ],
   "Traveler": [
    {
     "@type": "Traveler",
     "birthDate": "1991-12-12",
     "gender": "Male",
     "passengerTypeCode": "ADT",
     "id": "travelerRefId_1",
     "Identifier": {
      "authority": "Travelport",
      "value": "514d0312-6267-46ca-9e8d-4ae675f8767c"
     },
     "PersonName": {
      "@type": "PersonName",
      "Given": "TESTTRAVELLER",
      "Surname": "ONE"
     },
    }
   ],
   "Payment": [
    {
     "@type": "Payment",
     "id": "payment_1",
     "PaymentRef": "payment_1",
     "Identifier": {
      "authority": "Travelport",
      "value": "1b030060-535c-4c35-b494-461e57b85ce0"
     },
     "Amount": {
      "minorUnit": 2,
      "value": 1228
     },
     "FormOfPaymentIdentifier": {
      "FormOfPaymentRef": "formOfPayment_1"
     }
    },
    {
     "@type": "Payment",
     "id": "payment_2",
     "PaymentRef": "payment_2",
     "Identifier": {
      "authority": "Travelport",
      "value": "ecdd1c3f-8b1f-425e-9ed2-9170d61eea29"
     },
     "Amount": {
      "minorUnit": 2,
      "value": 17
     },
     "FormOfPaymentIdentifier": {
      "FormOfPaymentRef": "formOfPayment_1"
     }
    }
   ],
   "Receipt": [
    {
     "@type": "ReceiptConfirmation",
     "Identifier": {
      "authority": "Travelport",
      "value": "318af9f0-0f38-4d33-90c5-19c984d8c9f5"
     },
     "Confirmation": {
      "@type": "ConfirmationHold",
      "Locator": {
       "source": "1G",
       "value": "4QC71L"
      },
      "OfferStatus": {
       "@type": "OfferStatusAir",
       "StatusAir"
…
```

