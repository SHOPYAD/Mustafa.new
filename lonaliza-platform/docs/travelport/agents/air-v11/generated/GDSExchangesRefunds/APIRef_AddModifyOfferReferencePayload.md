# Add/Modify Offer Reference Payload API Reference

## Source

- **Local HTML:** `docs/travelport/travelport api guide/travelport-airapi json/support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/GDSExchangesRefunds/APIRef_AddModifyOfferReferencePayload.html` (UTF-8 mirror)
- **Official base:** `https://support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/` + same relative path

## Plaintext extract (lossy)

Add/Modify Offer Reference Payload API Reference Skip To Main Content Account Settings Logout placeholder Account Settings Logout Filter: All Files Submit Search Filter: All Files Submit Search Add/Modify Offer Reference Payload API Reference Request Response Example request Example response POST book/offer/reservationworkbench/ {workbenchID} /offers/buildfromcatalogofferings For {workbenchID} send the workbench identifier returned in ReservationResponse/Identifer/value in the workbench create response. Base path: Pre-production https://api.pp.travelport.net/11/air/ Production https://api.travelport.net/11/air/ Related Content: Exchange, Refund, and Void Guide Send the Add/Modify Offer request as part of the GDS ticket exchange process. The Add/Modify Offer reference payload sends identifiers from an offer returned in a preceding Exchange Search response to use that offer to modify the offer on the current itinerary. The system compares the existing itinerary with the new itinerary, deletes any flight segments no longer needed, and adds the new flight segments. Any unmodified segments remain as they are. Send Add/Modify after using Exchange Search to search for a new itinerary. After Add/Modify Offer, send Workbench Commit either hold or ticket the modified itinerary. The Add/Modify Offer reference payload request supports the automated exchange workflow, in which updates are made and new ticket/s issued using the JSON APIs, Manual exchanges, which ticket a modified itinerary after making updates outside the JSON APIs, are not supported. Request As part of the request requirements, also see Authentication and Common Air API Headers . Query Parameters None. Request Body Show Add/Modify Offer Request Body Table (reference payload) Object Description Required/Optional OfferQueryBuildFromCatalogOfferings Top level object. Required BuildFromCatalogOfferingsRequest Top level object. Required CatalogOfferingsIdentifier Top level object for transaction identifier from the Exchange Search response. Key value pair: id :&#160;The id value from the Exchange Search response. Required CatalogOfferingsIdentifier/ Identifier Transaction identifier from the Exchange Search response. Required value Send value from CatalogOfferings/Identifier/value Required authority Send value from CatalogOfferings/Identifier/authority Required CatalogOfferingIdentifier Top level object for offer identifier from the Exchange Search response for the offer you want to exchange for. Required CatalogOfferingIdentifier/ Identifier Offer identifier from the Exchange Search response. Required value Send value from CatalogOffering/id Required authority Send with the value Travelport Required Response The response returns a confirmation identifier. Show Add/Modify Response Body Table (reference payload) Object Description OfferListResponse Top level object. Includes Offer object. Offer Top level object. Includes Identifier object. Identifier Internal identifier for the response. Key value pairs: authority : Source of information. value : Unique system-generated identifier. Example Request For additional examples, download the developer toolkits and see Using Postman and Developer Toolkits . The response returns a confirmation identifier per below. Show Example { "OfferQueryBuildFromCatalogOfferings": { "BuildFromCatalogOfferingsRequest": { "@type": "BuildFromCatalogOfferingsRequestAir", "CatalogOfferingsIdentifier": { "id": "CatalogOfferings_1", "Identifier": { "value": "04373e5e-b6b8-4cae-93eb-b630bcf6afdc", "authority": "Travelport" } }, "CatalogOfferingIdentifier": { "Identifier": { "value": "o0.0", "authority": "Travelport" } } } } } Example Response For additional examples, download the developer toolkits and see Using Postman and Developer Toolkits . The response returns a confirmation identifier per below. Show Example { "OfferListResponse": { "@type": "OfferListResponse", "transactionId": "f4d3d4c5-4b40-4f91-8093-be086c1bc6a5", "traceId": "modify offer_track", "Offer": [ { "@type": "Offer", "id": "offer_1", "Identifier": { "authority": "Travelport", "value": "942bb26d-a9e8-49ca-996f-f25056efa87f" } } ] } }

## Literal `<pre>` excerpts from HTML

### Block 1

```
{
 "OfferQueryBuildFromCatalogOfferings": {
  "BuildFromCatalogOfferingsRequest": {
   "@type": "BuildFromCatalogOfferingsRequestAir",
   "CatalogOfferingsIdentifier": {
    "id": "CatalogOfferings_1",
    "Identifier": {
     "value": "04373e5e-b6b8-4cae-93eb-b630bcf6afdc",
     "authority": "Travelport"
    }
   },
   "CatalogOfferingIdentifier": {
    "Identifier": {
     "value": "o0.0",
     "authority": "Travelport"
    }
   }
  }
 }
}
```

### Block 2

```
{
 "OfferListResponse": {
  "@type": "OfferListResponse",
  "transactionId": "f4d3d4c5-4b40-4f91-8093-be086c1bc6a5",
  "traceId": "modify offer_track",
  "Offer": [
   {
    "@type": "Offer",
    "id": "offer_1",
    "Identifier": {
     "authority": "Travelport",
     "value": "942bb26d-a9e8-49ca-996f-f25056efa87f"
    }
   }
  ]
 }
}
```

