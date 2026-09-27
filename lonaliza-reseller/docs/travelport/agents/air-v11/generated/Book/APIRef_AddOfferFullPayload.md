# Add Offer Full Payload API&#160;Reference

## Source

- **Local HTML:** `docs/travelport/travelport api guide/travelport-airapi json/support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/Book/APIRef_AddOfferFullPayload.html` (UTF-8 mirror)
- **Official base:** `https://support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/` + same relative path

## Plaintext extract (lossy)

Add Offer Full Payload API&#160;Reference Skip To Main Content Account Settings Logout placeholder Account Settings Logout Filter: All Files Submit Search Filter: All Files Submit Search Add Offer Full Payload API&#160;Reference Request Response Example request Example response POST book/airoffer/reservationworkbench/ {workbenchID} /offers/buildfromproducts For {workbenchID} send the workbench identifier returned in ReservationResponse/Identifer/value in the workbench create response. Base path: Pre-production https://api.pp.travelport.net/11/air/ Production https://api.travelport.net/11/air/ Related Content: Air Booking Guide , Booking Session Workflow Use the Add&#160;Offer full payload request to add an offer to the reservation workbench as part of the booking workflow. The full payload request sends full itinerary details instead of identifiers from the Search response as in the reference payload request . Full payload supported for NDC only on specific carriers. For other carriers, use the reference payload instead. For detailed NDC&#160;support by carrier, see the Knowledge Base article NDC capabilities by airline through JSON API (see Knowledge Base NDC&#160;Resources if you need login assistance). For GDS, you can send either a reference payload or a full payload. Add Multiple Offers (GDS) You can repeat the Add Offer request as needed to combine multiple offers into one reservation, either in the initial booking workflow or for an existing reservation. While there is no limit on the number of offers that can be combined, a reservation cannot have more than 16 flight segments. Also supported in the Add Offer reference payload request. Your PCC must be provisioned for multi-offers; contact your Travelport representative if necessary. GDS only; not supported for NDC. Add offer to expired booking (GDS&#160;only) You can use this or the reference payload request to add an offer to an existing reservation, such as when the previously added offer has expired and can no longer be booked. Start with a post-commit workbench . GDS only; not supported for NDC. Pricing modifiers and brand information The full payload request supports optional pricing modifiers and/or brand information. You must send these modifiers during the initial booking workbench session - you cannot add them later. Pricing modifiers: If no pricing modifier is sent, the auto stored fare is added to the reservation. If a requested modifier does not have any fares associated with it, the Add Offer step returns a successful response but the Commit step will fail and return the error message No Fare Found . Brand information: You can store fares with brand information at either or both the offer or segment level. To store brand information at the offer level, send PricingModifiersAir/Brand/tier with any valid brand tier value. To store brand information at the segment level, send the brand tier with the flight segment in ProductCriteriaAir/SpecificFlightCriteria/brandtier. You can send brandTier for any or all segments. There is no change in the response when brand information is requested. Brand details are returned after booking in the Reservation Retrieve . Request As part of the request requirements, also see Authentication and Common Air API Headers . Query Parameters None. Request Body Basic Add Offer Request - Full Payload Show Request Body Table Object Description Required/Optional OfferQueryBuildFromProducts &#160; Top level object. Contains BuildFromProductsRequest. Required BuildFromProductsRequest Top level object. Contains PassengerCriteria, ProductCriteriaAir, and PricingModifiersAir (optional). Required OfferConstruction GDS only; NDC does not support filed fares. Send only to file separate filed fares by either traveler or segment, or both. Must include either or both travelerRefs or specificFlightCriteriaRefs, and PricingModifiersAir. After booking, fares can be autopriced as needed with the Autoprice / Manual Fare API . Show Example OfferConstruction object "OfferConstruction": [ { "@type": "OfferConstructionReservation", "travelerRefs": [ "travelerRefId_1", "travelerRefId_2", "travelerRefId_3" ], "specificFlightCriteriaRefs": [ "SFC_1" ], "PricingModifiersAir": { "@type": "PricingModifiersAir", "TaxExemption": { "@type": "TaxExemption", "allTaxesExemptInd": true }, "FareSelection": { "@type": "FareSelectionDetail", "fareType": "PublicFaresOnly" } } } ], Optional travelerRefs String array. Send the travelerRef id/s of one or more traveler/s to apply the fare in PricingModifiersAir to. Optional. Send with OfferConstruction specificFlightCriteriaRefs String array. Send the SpecificFlightCriteria id of the segment/s to apply the fare in PricingModifiersAir to. Optional. Send with OfferConstruction PricingModifiersAir Send the standard PricingModifiersAir object (see following table)&#160;to specify the fare to apply to this traveler, segment, or both. Required with OfferConstruction PassengerCriteria Defines the type of passenger. Send one PassengerCriteria object for each passenger type code (PTC). For a full list of PTCs, see the Tools page for the SOAP/XML API&#160;Reference Data file. May include TravelerGeographicLocation. Required passengerTypeCode The PTC of the passenger type. Any traveler sent without a PTC value is defaulted to ADT. PTC can be sent or omitted for ADT passenger. AirReservation defaults the PTC&#160;to ADT and returns it in the Reservation Retrieve. Required number The number of passengers in that PTC for this request. Default is 1. Required age The age of the passenger. Notes on PTC and age Travelport recommends sending age only with PTCs that require age for pricing. For child passengers, Travelport recommends sending the age of the child in the age attribute plus the PTC CNN. Travelport recommends against sending CNN without age, or the CHD PTC. Many fares cannot be quoted for CHD. The age for CNN&#160;is generally between 2 and 11 inclusive, with ADT fares returned for ages 12 and up; however, this can vary by airline and country. The age for INF&#160;must be either 0 or 1. During booking, date of birth is required for all child and infant PTCs ( Add Traveler payload in Traveler/birthDate). Optional TravelerGeographicLocation Optional object for requesting local citizen/local resident fares for Spain and associated islands. You must also send a PTC relevant to the local resident fares; e.g., ADR for adult resident, CHR for child resident. GDS only; not supported for NDC. Optional value String. IATA code specifying the location relevant to the local citizen//local resident fare. Optional travelerGeographicLocationType String. The type of location. Supported values are&#160; Country City State/Province Optional ProductCriteriaAir Array. Each instance is one leg of the itinerary. Includes one or more SpecificFlightCriteria objects. Includes SupplierLocator when adding a passive segment. Required SpecificFlightCriteria Array. Each instance is one flight on that leg. Required carrier String. IATA code of airline carrier for flight. Required flightNumber String. Flight number assigned by airline. Required departureDate String. Departure date of flight in YYYY-MM-DD format (e.g., departureDate="2024-12-06") Required departureTime String. Departure time of flight. HH:MM:SS (24-hour) format (e.g., departureTime="18:00"). Required arrivalDate String. Arrival date of flight in YYYY-MM-DD format. Required arrivalTime String. Arrival time of flight in HH:MM:SS (24-hour) format. Required from String. IATA airport code of departure. Required to String. IATA airport code of arrival. Required cabin String. Cabin class to book. Required classOfService String. Class of service to book. Required segmentSequence Order of this segment in this leg, starting with 1 for the first segment on the leg. A segment is one flight with the same flight number. Note that the segmentSequence value for connecting flights is the same; for example, for two connecting flights on the outbound or first leg of the itinerary, both flights have the segmentSequence value 1 . Required AvailabilitySourceCode Recommended to send in the full payload request. GDS&#160;only; not supported for NDC. Supported values and definitions for AvailabilitySourceCode: A:&#160;AVS (availability and schedules) B:&#160;Travelport cache C:&#160;AVS D:&#160;Direct Access E:&#160;Travelport cache F: Travelport cache G: Travelport cache H: Travelport cache I: Travelport cache K: Travelport cache L:&#160;Last seat availability M:&#160;Unknown source O: Travelport cache P: Travelport cache Q:&#160;Travelport cache S:&#160;Seamless T:&#160;Travelport cache U:&#160;Unknown source X:&#160;Customer reusing availability data from customer cache (data originally obtained from Travelport) Y:&#160;Customer reusing data obtained from another system (e.g., another GDS) (data may be fresh or stored in customer cache) Z:&#160;Customer sold from e-streamed data stored in customer cache Optional but recommended boundFlightsInd This indicator is not sent by the user but instead is sent if included in the information stored in the price by the carrier. The bound flights indicator boundFlightsInd is a Boolean variable indicating segments are married/bound. When returned with a value of true, the flight segments are polled together and usually share the same fare basis code and class of service. The indicator is returned as true for all leading segments on one leg of the flight, and not returned for the last segment of the bound flight leg journey, indicating where the bound flights end. For example, if an O&amp;D&#160;pair has 3 flight segments, boundFlightsInd is returned for the first two segments on that leg. If the segments are not bound, boundFlightsInd is false and not returned. Not returned for NDC. n/a brandTier Send only if requesting to store brand information at the segment level. A segment is one flight with the same flight number. You can send brandTier for any or all instances of SpecificFlightCriteria. To store brand information at the offer level instead, see PricingModifiersAir below. Optional passiveSegmentStatus AirReservation 25.11.58 and later. GDS only; not supported for NDC. See Passive Segments in the Air Booking Guide for examples and more details. String. Send only to add an air segment booked outside the Travelport GDS, called a passive segment An air segment booked in a system outside the Travleport GDS. Adding a passive air segment to a booking maintains all travel details as part of the complete itinerary. . Updates the Travelport booking with any details received from the supplier for the passive segment. Recommended to also send SupplierLocator per below. Supported for the following segment status codes: AK (passive segment confirmed outside the GDS) BK (passive segment booked with carrier) segment statuses; YK (Hold confirmed airline space) Optional SupplierLocator Send to add a locator code for a passive segment. Recommended to always send with SpecificFlightCriteria /passiveSegmentStatus per above. Required for ticket issuance; if not sent in Add Offer, must be added with a terminal program prior to ticketing. Recommended if passiveSegmentStatus is sent value String. Supplier/airline locator code for the passive segment. Required if SupplierLocator is sent supplierCode String. Two-letter&#160;IATA carrier code for the airline the passive segment is booked on. Required if SupplierLocator is sent PricingModifiersAir &#160; Any optional pricing modifiers. See PricingModifiersAir table below. Optional OrganizationInformation Use to send optional India GST SSR&#160;Remarks in GSTRegistrationNumber. Optional GSTRegistrationNumber Send to add India GST (Goods and Services Tax) SSRs. If sent, all of the following are required; these are details for the business purchasing the goods and services in the GST: country : String. IATA country code, should be IND . address : String. Business address. companyName : String. Business name. email : String. Business email address. telephone : String. Business telephone number. value : String. GST&#160;registered number for the business. See India GST SSRs in the Remarks &amp;&#160;Service Requests Guide for important details. All values are required if sent &#160; OrganizationInformation Any optional account codes. Optional GSTRegistrationNumber Send to add India GST (Goods and Services Tax) SSRs. If sent, all of the following are required; these are details for the business purchasing the goods and services in the GST: country : String. IATA country code, should be IND . address : String. Business address. companyName : String. Business name. email : String. Business email address. telephone : String. Business telephone number. value : String. GST&#160;registered number for the business. See India GST SSRs in the Remarks &amp;&#160;Service Requests Guide for important details. All values are required if sent PricingModifiersAir (optional pricing modifiers) Optionally, you can store fares with one or more pricing modifiers. If a pricing modifier is not added, the auto stored fare is added to the reservation. There is no change in the AirReservation response when pricing modifiers are requested. AirReservation applies modifiers from Add Offer and earlier steps as follows: Modifiers sent in the Add Offer request (supported for both full and reference payload) If no modifiers are sent in Add Offer, any pricing modifiers sent in AirPrice are applied If no modifiers were sent in AirPrice, or if AirPrice was not sent, any pricing modifiers sent in Search are applied GDS only; not supported for NDC. If the requested modifier does not have any fares associated with it, the workbench commit fails and returns the error message No Fare Found . Pricing happens at commit, not at Add Offer. Show PricingModifiersAir table Object Description Required/Optional PricingModifiersAir &#160; Any optional pricing modifiers. Required only when sending fare modifiers. Includes FareSelection. Optional currencyCode The currency code for overriding the default currency associated with your PCC provisioned by Travelport. Optional TicketingPCC GDS only, not supported for NDC . String, 2-10 characters supported. Overrides the ticketing PCC&#160;associated with your account to specify an alternate PCC and return pricing based on that PCC. (PCC is the pseudo city code; a travel provider's identification code for the JSON APIs, provisioned from Travelport.) Optional PricingPCC GDS only, not supported for NDC . String, 2-10 characters supported. Use to send a faring PCC for which a selective access or code group agreement exists between that PCC and the PCC associated with your account. The following combinations of PricingPCC and FareSelection/fareType=PrivateFaresOnly (see immediately below) return results as follows: PricingPCC sent and PrivateFaresOnly not requested: If a selective access or group agreement exists, both public and private fares (if available) are returned for the requesting and providing PCC. PricingPCC sent and PrivateFaresOnly not requested: If no selective access or group agreement exists, only public fares are returned. PricingPCC sent and PrivateFaresOnly is requested: If a selective access or group agreement exists that allows private fare access, private fares (if available) are returned for the requesting and providing PCC. PricingPCC sent and PrivateFaresOnly is requested: If a selective access or group agreement exists but does not allow private fares access, or if no agreement exists, an error is returned. Optional ManualFareAdjustment AirReservation 24.11.50 and later. GDS only, not supported for NDC. Number up to 2 decimal places. Send to manually adjust the base fare amount on all fares. You can adjust the base fare for all PTCs or only specified PTCs. You can increase or decrease the base fare by either an amount or a percentage. Send with @type value ManualFareAdjustmentDiscount to decrease the base fare. Send with @type value ManualFareAdjustmentIncrease to increase the fare. For an example see the Add Offer Reference Payload API&#160;Reference . If a fare is adjusted in Add Offer using ManualFareAdjustment, in the workbench commit and Reservation Retrieve responses, FareGuaranteePolicy/Code/value returns M to indicate the fare has been manipulated. If the PCC currency and the country of origin currency are different, then the amount or percentage is applied to the filed amount base fare that is converted into the PCC currency. Optional passengerTypeCodes Send the PTC or PTCs to be increased or decreased. This increases or decreases the fare for all passengers with the PTC/s. If not sent, ManualFareAdjustment applies to all PTCs. Optional AmountPercentPercent Send to adjust the base fare by a percentage as follows: Percent :&#160;Send percentage of the base fare to be decreased or increased, up to two decimal places. For example, the value 20.5 would either increase (when sent in @type ManualFareAdjustmentIncrease) or decrease (when sent in @type ManualFareAdjustmentDiscount) the base fare by 20.5%. Either AmountPercentPercent or AmountPercentAmount is required if ManualFareAdjustment is sent AmountPercentAmount Send to adjust the base fare by an amount as follows: Amount : Send the amount value to either increase or decrease the base fare, up to two decimal places. For example, the value 14.75 for a base fare in&#160;the currency USD would either increase (when sent in @type ManualFareAdjustmentIncrease) or decrease (when sent in @type ManualFareAdjustmentDiscount) the base fare by $14.75. Either AmountPercentPercent or AmountPercentAmount is required if ManualFareAdjustment is sent TaxExemption Sends specific tax codes to mark as tax exempt. TaxExemption supports up to nine values for countries, or nine values for taxCodes, or up to nine values in countries and taxCodes combined. Key value pairs; send either or both countries and taxCodes or allTaxesExemptInd: countries:&#160;Array. One or more countries in which the taxCodes sent are tax exempt. taxCodes:&#160;Array. One or more tax codes to mark as exempt. allTaxesExemptInd: Indicator. Send with value true to mark all taxes on the itinerary as tax exempt. Optional FareSelection Additional optional fare modifiers. Stores fare types including private fares (negotiated), public fares (published), or net fares (consolidator fares, or any negotiated wholesale price that is further marked up for sale to customers). Optional fareType Allows you to store either a private fare or a public fare, or the lowest of either private or public fares. These can be combined. Supported values are: PublicFaresOnly:&#160;Only public fares for specified itinerary. PrivateFaresOnly:&#160;Only private fares for the itinerary. Private&amp;PublicFares:&#160;Lowest of all public and private fares. NetFaresOnly:&#160;Only net fares. Optional refundableOnlyInd true stores only refundable fares, false stores only non-refundable fares. Optional prohibitMinStayFaresInd true stores only fares that do not require a minimum stay; false allows minimum stay fares. Optional prohibitMaxStayFaresInd true stores only fares that do not require a maximum stay; false allows maximum stay fares. Optional prohibitAdvancePurchaseFaresInd true stores only fares that do not require advance purchase; false allows fares with advance purchase restrictions. Optional validatingCarrier Allows you to specify the carrier to override the default validating carrier (the airline designator that the ticket is issued against).&#160;String to send the IATA code for a carrier to override the default validating carrier. If the validating carrier code is not supported for an itinerary, the response returns the error Ticketing Agreement does not exist . If an invalid validating carrier code is sent in the request, the response returns the error Unknown Carrier . Optional Brand Send in PricingModifiersAir only if requesting to store a fare with brand details at the offer level. Optional tier The brand tier. Optional Response The response returns the system-generated offer identifier. This identifier must be sent in several subsequent transactions, such as payment and ticketing. Show Response Body Table Object Description OfferListResponse Top level object. OfferID Top level object. Identifier Returns the system-generated offer identifier in the following key value pairs; in this case authority is Travelport : authority : Source of information. value : Unique system-generated identifier. Example Request The following example full payload request adds an offer for a one-way itinerary. Show Example Add Offer full payload request for one-way { "OfferQueryBuildFromProducts": { "BuildFromProductsRequest": { "@type": "BuildFromProductsRequestAir", "PassengerCriteria": [ { "number": 1, "passengerTypeCode": "ADT" } ], "ProductCriteriaAir": [ { "SpecificFlightCriteria": [ { "flightNumber": "1177", "carrier": "UA", "departureDate": "2022-01-09", "departureTime": "10:15:00", "arrivalDate": "2022-01-09", "arrivalTime": "15:09:00", "from": "DEN", "to": "ATL", "classOfService": "P", "cabin": "First", "segmentSequence": 1, "brandTier": "9" } ] } ] } } } Show Example Add Offer&#160;full payload request for round trip { "OfferQueryBuildFromProducts": { "BuildFromProductsRequest": { "@type": "BuildFromProductsRequestAir", "PassengerCriteria": [ { "number": 1, "age": 25, "passengerTypeCode": "ADT" } ], "ProductCriteriaAir": [ { "SpecificFlightCriteria": [ { "flightNumber": "733", "carrier": "QF", "departureDate": "2022-01-09", "departureTime": "08:35:00", "arrivalDate": "2022-01-09", "arrivalTime": "10:10:00", "from": "SYD", "to": "ADL", "classOfService": "Q", "cabin": "Economy", "segmentSequence": 1, "brandTier": "1" }, { "flightNumber": "680", "carrier": "QF", "departureDate": "2022-01-09", "departureTime": "12:05:00", "arrivalDate": "2022-01-09", "arrivalTime": "13:50:00", "from": "ADL", "to": "MEL", "classOfService": "Q", "cabin": "Economy", "segmentSequence": 2, "brandTier": "1" } ] }, { "SpecificFlightCriteria": [ { "flightNumber": "402", "carrier": "QF", "departureDate": "2022-01-16", "departureTime": "06:00:00", "arrivalDate": "2022-01-16", "arrivalTime": "07:25:00", "from": "MEL", "to": "SYD", "classOfService": "Q", "cabin": "Economy", "segmentSequence": 1, "brandTier": "1" } ] } ] } } } Show Example payload to book a passive segment (book a segment from outside the JSON APIs) { "OfferQueryBuildFromProducts": { "lowFareFinderInd": true, "returnBrandedFaresInd": true, "BuildFromProductsRequest": { "@type": "BuildFromProductsRequestAir", "PricingModifiersAir": { "@type": "PricingModifiersAirDetail" }, "PassengerCriteria": [ { "@type": "PassengerCriteria", "number": 1, "passengerTypeCode": "ADT" }, { "@type": "PassengerCriteria", "number": 1, "passengerTypeCode": "CHD" } ], "ProductCriteriaAir": [ { "SpecificFlightCriteria": [ { "flightNumber": "1814", "carrier": "KL", "departureDate": "2025-04-26", "departureTime": "07:00:00", "arrivalDate": "2025-04-26", "arrivalTime": "08:05:00", "from": "FRA", "to": "AMS", "classOfService": "T", "cabin": "Economy", "segmentSequence": 1, "passiveSegmentStatus": "AK" } ], "SupplierLocator": { "value": "WTR84G", "supplierCode": "KL" } } ] } } }, Example Response The response returns the system-generated offer identifier. This identifier must be sent in several subsequent transactions, such as payment and ticketing. Show Example Add Offer Response { "OfferListResponse": { "OfferID": [ { "@type": "OfferIdentifier", "Identifier": { "authority": "Travelport", "value": "ec33332f-bdde-4bca-bebf-e81568f0d205" } } ] } }

## Literal `<pre>` excerpts from HTML

### Block 1

```
"OfferConstruction": [
    {
     "@type": "OfferConstructionReservation",
     "travelerRefs": [
      "travelerRefId_1",
      "travelerRefId_2",
      "travelerRefId_3"
     ],
     "specificFlightCriteriaRefs": [
      "SFC_1"
     ],
     "PricingModifiersAir": {
      "@type": "PricingModifiersAir",
      "TaxExemption": {
       "@type": "TaxExemption",
       "allTaxesExemptInd": true
      },
      "FareSelection": {
       "@type": "FareSelectionDetail",
       "fareType": "PublicFaresOnly"
      }
     }
    }
   ],
```

### Block 2

```
{
    "OfferQueryBuildFromProducts": {
        "BuildFromProductsRequest": {
            "@type": "BuildFromProductsRequestAir",
            "PassengerCriteria": [
                {
                    "number": 1,
                    "passengerTypeCode": "ADT"
                }
            ],
            "ProductCriteriaAir": [
                {
                    "SpecificFlightCriteria": [
                        {
                            "flightNumber": "1177",
                            "carrier": "UA",
                            "departureDate": "2022-01-09",
                            "departureTime": "10:15:00",
                            "arrivalDate": "2022-01-09",
                            "arrivalTime": "15:09:00",
                            "from": "DEN",
                            "to": "ATL",
                            "classOfService": "P",
                            "cabin": "First",
                            "segmentSequence": 1,
                            "brandTier": "9"
                        }
                    ]
                }
            ]
        }
    }
}
```

### Block 3

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

### Block 4

```
{
        "OfferQueryBuildFromProducts": {
            "lowFareFinderInd": true,
            "returnBrandedFaresInd": true,
            "BuildFromProductsRequest": {
                "@type": "BuildFromProductsRequestAir",
                "PricingModifiersAir": {
                    "@type": "PricingModifiersAirDetail"
                },
                "PassengerCriteria": [
                    {
                        "@type": "PassengerCriteria",
                        "number": 1,
                        "passengerTypeCode": "ADT"
                    },
                    {
                        "@type": "PassengerCriteria",
                        "number": 1,
                        "passengerTypeCode": "CHD"
                    }
                ],
                "ProductCriteriaAir": [
                    {
                        "SpecificFlightCriteria": [
                            {
                                "flightNumber": "1814",
                                "carrier": "KL",
                                "departureDate": "2025-04-26",
                                "departureTime": "07:00:00",
                                "arrivalDate": "2025-04-26",
                                "arrivalTime": "08:05:00",
                                "from": "FRA",
                                "to": "AMS",
                                "classOfService": "T",
                                "cabin": "Economy",
                                "segmentSequence": 1,
                                "passiveSegmentStatus": "AK"
                            }
                        ],
                        "SupplierLocator": {
                            "value": "WTR84G",
                            "supplierCode": "KL"
                        }
                    }
                ]
            }
        }
    },
```

### Block 5

```
{
    "OfferListResponse": {
        "OfferID": [
            {
                "@type": "OfferIdentifier",
                "Identifier": {
                    "authority": "Travelport",
                    "value": "ec33332f-bdde-4bca-bebf-e81568f0d205"
                }
            }
        ]
    }
}
```

