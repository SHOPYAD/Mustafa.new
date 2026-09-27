# Add Offer Reference Payload API&#160;Reference

## Source

- **Local HTML:** `docs/travelport/travelport api guide/travelport-airapi json/support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/Book/APIRef_AddOfferRefPayload.html` (UTF-8 mirror)
- **Official base:** `https://support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/` + same relative path

## Plaintext extract (lossy)

Add Offer Reference Payload API&#160;Reference Skip To Main Content Account Settings Logout placeholder Account Settings Logout Filter: All Files Submit Search Filter: All Files Submit Search Add Offer Reference Payload API&#160;Reference Request Response Example request Example response POST book/airoffer/reservationworkbench/ {workbenchID} /offers/buildfromcatalogproductofferings For {workbenchID} send the workbench identifier returned in ReservationResponse/Identifer/value in the workbench create response. Base path: Pre-production https://api.pp.travelport.net/11/air/ Production https://api.travelport.net/11/air/ Related Content: Air Booking Guide , Booking Session Workflow Use the Add&#160;Offer reference payload request to add an offer to the reservation workbench as part of the booking workflow. The reference payload request sends identifiers from the Search response instead of full itinerary details. NDC&#160;supports only the reference payload detailed here. For GDS, you can send either a reference payload or a full payload . Start with a post-commit workbench . before sending Add Offer, per the booking workflow . To use the Add Offer reference payload request following a search request, your initial Search request must send offersPerPage to invoke caching if that Search was journey-based (leg-based search results are always cached). If you add the offer after a price request, you can send the transaction identifier from the AirPrice response. Add Multiple Offers (GDS) In either the initial booking workflow, or for an existing reservation, you can send one or more Add Offer requests to add multiple GDS air offers in a single booking. While there is no specific limit on the number of offers that can be combined, a reservation cannot have more than 16 flight segments. Also supported in the Add Offer full payload request. GDS only; not supported for NDC. Your PCC must be provisioned for multi-offers; contact your Travelport representative if necessary. See Multi-offer&#160;Bookings in the Booking Guide. You can also use Add Offer to add a GDS air offer to an existing reservation that has hotel and/or car offers. See the Multi-Content Booking Guide (Air, Car, Hotel) for workflow details. Add offer to expired booking For GDS only, you can use this Add Offer reference payload request, or the Add Offer full payload request , to add an offer to an existing reservation, such as when the previously added offer has expired and can no longer be booked. (For NDC, use the NDC-specific Standalone Reprice API instead to add an offer to an expired booking.) Request As part of the request requirements, also see Authentication and Common Air API Headers . Query Parameters None. Request Body Basic Add Offer Request - Reference Payload Show Request Body Table Object Description Required/Optional OfferQueryBuildFromCatalogProductOfferings Top level object for request. Required BuildFromCatalogProductOfferingsRequest Top level object for identifiers from search response. Top level object. Includes CatalogProductOfferingsIdentifier and PricingModifiersAir (optional). Required CatalogProductOfferingsIdentifier Top level object for transaction identifier from either the Search or AirPrice response. Includes Identifier object. The Search response does not return the CatalogProductOfferings/Identifier object if caching is not invoked with offersPerPage in the Search request. A subsequent reference payload request to those search results cannot be sent without caching and the CatalogProductOfferings/Identifier value. Required Identifier Top level object. Includes value. Required value Sends the transaction identifier the preceding response this request refers to. To add an offer from a previous Search, Next Leg Search, or Flight Specific Search response, send the value returned in that response in the object CatalogProductOfferings/Identifier/value To add an offer from a previous Price response, either full or reference payload, send the value returned in the Price response in the object OfferListResponse/Identifier/value When adding an offer from a previous Price response, either full or reference payload, you must remove the _PC&#160;from the end of the identifier returned in Price, as in "value": "f4d60db0-4367-4456-97be-3dc8e194950e_PC" Required CatalogProductOfferingSelection Top level object for offer and product identifiers from the search response. Array. Send one instance for each offer. Required CatalogProductOfferingIdentifier Top level object for offer identifier. Array. Includes Identifier object. Required Identifier Top level object. Includes value. Required value Sends the offer identifier from the Search, Next Leg Search, or Flight Specific Search response in CatalogProductOfferings/CatalogProductOffering/id To add an offer from a previous Price response, either full or reference payload, send the value returned in the response in OfferListResponse/OfferID/Identifier/value Required ProductIdentifier Top level object for product identifier. Array. Includes Identifier object. Required Identifier Top level object. Includes value. Required value Sends the product identifier from the Search, Next Leg Search, or Flight Specific Search response in CatalogProductOfferings/CatalogProductOffering/ProductBrandOptions/ ProductBrandOffering/Product/productRef To add an offer from a previous Price response, either full or reference payload, send the value returned in the response in OfferListResponse/OfferID/Product//id Required OrganizationInformation Any optional account codes. Optional GSTRegistrationNumber Send to add India GST (Goods and Services Tax) SSRs. If sent, all of the following are required; these are details for the business purchasing the goods and services in the GST: country : String. IATA country code, should be IND . address : String. Business address. companyName : String. Business name. email : String. Business email address. telephone : String. Business telephone number. value : String. GST&#160;registered number for the business. See India GST SSRs in the Remarks &amp;&#160;Service Requests Guide for important details. All values are required if sent &#160; PricingModifiersAir &#160; Any optional pricing modifiers. See PricingModifiersAir table below. GDS only; modifiers are not supported for NDC. Optional PricingModifiersAir (optional pricing modifiers) Optionally, you can store fares with one or more pricing modifiers. If a pricing modifier is not added, the auto stored fare is added to the reservation. There is no change in the AirReservation response when pricing modifiers are requested. AirReservation applies modifiers from Add Offer and earlier steps as follows: Modifiers sent in the Add Offer request (supported for both full and reference payload) If no modifiers are sent in Add Offer, any pricing modifiers sent in AirPrice are applied. If no modifiers were sent in AirPrice, or if AirPrice was not sent, any pricing modifiers sent in Search are applied. GDS only; pricing modifiers are not supported for NDC. If the requested modifier does not have any fares associated with it, the workbench commit fails and returns the error message No Fare Found . Pricing happens at commit, not at Add Offer. Show PricingModifiersAir Table Object Description Required/Optional PricingModifiersAir &#160; Any optional pricing modifiers. Required only when sending fare modifiers. Includes FareSelection. Optional currencyCode The currency code for overriding the default currency associated with your PCC provisioned by Travelport. Optional TicketingPCC GDS only, not supported for NDC . String, 2-10 characters supported. Overrides the ticketing PCC&#160;associated with your account to specify an alternate PCC and return pricing based on that PCC. (PCC is the pseudo city code; a travel provider's identification code for the JSON APIs, provisioned from Travelport.) Optional PricingPCC GDS only, not supported for NDC . String, 2-10 characters supported. Use to send a faring PCC for which a selective access or code group agreement exists between that PCC and the PCC associated with your account. The following combinations of PricingPCC and FareSelection/fareType=PrivateFaresOnly (see immediately below) return results as follows: PricingPCC sent and PrivateFaresOnly not requested: If a selective access or group agreement exists, both public and private fares (if available) are returned for the requesting and providing PCC. PricingPCC sent and PrivateFaresOnly not requested: If no selective access or group agreement exists, only public fares are returned. PricingPCC sent and PrivateFaresOnly is requested: If a selective access or group agreement exists that allows private fare access, private fares (if available) are returned for the requesting and providing PCC. PricingPCC sent and PrivateFaresOnly is requested: If a selective access or group agreement exists but does not allow private fares access, or if no agreement exists, an error is returned. Optional ManualFareAdjustment AirReservation 24.11.50 and later. GDS only, not supported for NDC. Number up to 2 decimal places. Send to manually adjust the base fare amount on all fares. You can adjust the base fare for all PTCs or only specified PTCs. You can increase or decrease the base fare by either an amount or a percentage. Send with @type value ManualFareAdjustmentDiscount to decrease the base fare. Send with @type value ManualFareAdjustmentIncrease to increase the fare. If a fare is adjusted in Add Offer using ManualFareAdjustment, in the workbench commit and Reservation Retrieve responses, FareGuaranteePolicy/Code/value returns M to indicate the fare has been manipulated. "FareGuaranteePolicy": [ { "@type": "FareGuaranteePolicy", "passengerTypeCodes": [ "ADT", "CHD" ], "Code": { "value": "M" } } ] If the PCC currency and the country of origin currency are different, then the amount or percentage is applied to the filed amount base fare that is converted into the PCC currency. Show Example excerpt The following excerpted PricingModifiersAir object increases the base fare by an amount of 10.5 for ADT passengers, and discounts the base fare by 5% for CHD passengers. "PricingModifiersAir": { "@type": "PricingModifiersAir", "ManualFareAdjustment": { "@type": "ManualFareAdjustmentIncrease", "passengerTypeCodes": [ "ADT" ], "AmountPercent": { "@type": "AmountPercentAmount", "Amount": { "value": 10.5 } } }, { "@type": "ManualFareAdjustmentDiscount", "passengerTypeCodes": [ "CHD" ], " AmountPercent ": { "@type": "AmountPercentPercent", "Percent": 5 } } ] Optional passengerTypeCodes Send the PTC or PTCs to be increased or decreased. This increases or decreases the fare for all passengers with the PTC/s. If not sent, ManualFareAdjustment applies to all PTCs. Optional AmountPercentPercent Send to adjust the base fare for the specified PTC/s by a percentage as follows: Percent :&#160;Send percentage of the base fare to be decreased or increased, up to two decimal places. For example, the value 20.5 would either increase (when sent in @type ManualFareAdjustmentIncrease) or decrease (when sent in @type ManualFareAdjustmentDiscount) the base fare by 20.5%. Either AmountPercentPercent or AmountPercentAmount is required if ManualFareAdjustment is sent AmountPercentAmount Send to adjust the base fare for the specified PTC/s by an amount as follows: Amount : Send the amount value to either increase or decrease the base fare, up to two decimal places. For example, the value 14.75 for a base fare in&#160;the currency USD would either increase (when sent in @type ManualFareAdjustmentIncrease) or decrease (when sent in @type ManualFareAdjustmentDiscount) the base fare by $14.75. Either AmountPercentPercent or AmountPercentAmount is required if ManualFareAdjustment is sent TaxExemption Sends specific tax codes to mark as tax exempt. Send either or both the key value pairs countries and taxCodes or allTaxesExemptInd per below. TaxExemption supports up to nine values for countries, or nine values for taxCodes, or up to nine values in countries and taxCodes combined. Optional countries Array. One or more two-letter alphanumeric codes for the countries in which the taxCodes sent are tax exempt. Must send with taxCodes. Optional taxCodes Array. One or more two-letter alphanumeric tax codes to mark as exempt. Must send with countries if sent. Optional allTaxesExemptInd Boolean. Send with true to omit all taxes from the response. Do not send if false ; use countries and taxCodes to specify which taxes to exempt. Optional FareSelection Additional optional fare modifiers. Stores fare types including private fares (negotiated), public fares (published), or net fares (consolidator fares, or any negotiated wholesale price that is further marked up for sale to customers). Optional fareType Allows you to store either a private fare or a public fare, or the lowest of either private or public fares. These can be combined. Supported values are: PublicFaresOnly:&#160;Only public fares for specified itinerary. PrivateFaresOnly:&#160;Only private fares for the itinerary. Private&amp;PublicFares:&#160;Lowest of all public and private fares. NetFaresOnly:&#160;Only net fares. Optional refundableOnlyInd true stores only refundable fares, false stores only non-refundable fares. Optional prohibitMinStayFaresInd true stores only fares that do not require a minimum stay; false allows minimum stay fares. Optional prohibitMaxStayFaresInd true stores only fares that do not require a maximum stay; false allows maximum stay fares. Optional prohibitAdvancePurchaseFaresInd true stores only fares that do not require advance purchase; false allows fares with advance purchase restrictions. Optional validatingCarrier Allows you to specify the carrier to override the default validating carrier (the airline designator that the ticket is issued against).&#160;String to send the IATA code for a carrier to override the default validating carrier. If the validating carrier code is not supported for an itinerary, the response returns the error Ticketing Agreement does not exist . If an invalid validating carrier code is sent in the request, the response returns the error Unknown Carrier . Optional FareModifiers Top level object for account codes. Required only when sending account code. Optional Account Sends account codes for negotiated fares. Optional code The account code to price. Optional Brand Send in PricingModifiersAir only if requesting to store a fare with brand details at the offer level. Optional tier The brand tier. Optional Response The response returns the system-generated offer identifier. This identifier must be sent in several subsequent transactions, such as payment and ticketing. Show Response Body Table Object Description OfferListResponse Top level object. OfferID Top level object. Identifier Returns the system-generated offer identifier in the following key value pairs; in this case authority value is Travelport : authority : Source of information. value : Unique system-generated identifier. Example Request Show Example Add Offer reference payload request for one way offer The following reference payload is for GDS. { "OfferQueryBuildFromCatalogProductOfferings": { "BuildFromCatalogProductOfferingsRequest": { "@type": "BuildFromCatalogProductOfferingsRequestAir", "CatalogProductOfferingsIdentifier": { "Identifier": { "value": "b6179851-fd68-4cba-a010-f6dc3235b398" } }, "CatalogProductOfferingSelection": [ { "CatalogProductOfferingIdentifier": { "Identifier": { "value": "o1" } }, "ProductIdentifier": [ { "Identifier": { "value": "p0" } } ] } ] } } } Show Example Add Offer reference payload request for round trip offer The following reference payload is for NDC. The only difference is that NDC identifiers offer and product identifiers include the airline code, in this case, QF . { "OfferQueryBuildFromCatalogProductOfferings": { "BuildFromCatalogProductOfferingsRequest": { "@type": "BuildFromCatalogProductOfferingsRequestAir", "CatalogProductOfferingsIdentifier": { "Identifier": { "value": "1fceb004-aaca-4657-930a-cb6304fa89e2" } }, "CatalogProductOfferingSelection": [ { "CatalogProductOfferingIdentifier": { "Identifier": { "value": "QF_CPO0" } }, "ProductIdentifier": [ { "Identifier": { "value": "QFp0" } } ] }, { "CatalogProductOfferingIdentifier": { "Identifier": { "value": "QF_CPO1" } }, "ProductIdentifier": [ { "Identifier": { "value": "QFp24" } } ] } ] } } } Example Response The response returns the system-generated offer identifier. This identifier must be sent in several subsequent transactions, such as payment and ticketing. Show Example Add Offer Response { "OfferListResponse": { "OfferID": [ { "@type": "OfferIdentifier", "Identifier": { "authority": "Travelport", "value": "12ec2ce3-b451-404c-ab2a-16c5b049d70b" } } ] } }

## Literal `<pre>` excerpts from HTML

### Block 1

```
"PricingModifiersAir": {
	 "@type": "PricingModifiersAir",
	 "ManualFareAdjustment":     {
        "@type": "ManualFareAdjustmentIncrease",
        "passengerTypeCodes": [
            "ADT"
        ],
        "AmountPercent": {
            "@type": "AmountPercentAmount",
            "Amount": {
                "value": 10.5
            }
        }
    },
    {
        "@type": "ManualFareAdjustmentDiscount",
        "passengerTypeCodes": [
            "CHD"
        ],
        " AmountPercent ": {
            "@type": "AmountPercentPercent",
            "Percent": 5
        }
    }
]
```

### Block 2

```
{
 "OfferQueryBuildFromCatalogProductOfferings": {
  "BuildFromCatalogProductOfferingsRequest": {
   "@type": "BuildFromCatalogProductOfferingsRequestAir",
   "CatalogProductOfferingsIdentifier": {
    "Identifier": {
     "value": "b6179851-fd68-4cba-a010-f6dc3235b398"
    }
   },
   "CatalogProductOfferingSelection": [
    {
     "CatalogProductOfferingIdentifier": {
      "Identifier": {
       "value": "o1"
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
   ]
  }
 }
}
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
 "OfferListResponse": {
  "OfferID": [
   {
    "@type": "OfferIdentifier",
    "Identifier": {
     "authority": "Travelport",
     "value": "12ec2ce3-b451-404c-ab2a-16c5b049d70b"
    }
   }
  ]
 }
}
```

