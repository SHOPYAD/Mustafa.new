# Traveler Update API&#160;Reference

## Source

- **Local HTML:** `docs/travelport/travelport api guide/travelport-airapi json/support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/Book/APIRef_TravelerUpdate.html` (UTF-8 mirror)
- **Official base:** `https://support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/` + same relative path

## Plaintext extract (lossy)

Traveler Update API&#160;Reference Skip To Main Content Account Settings Logout placeholder Account Settings Logout Filter: All Files Submit Search Filter: All Files Submit Search Traveler Update API&#160;Reference Request Response Example request Example response Put book/traveler/reservationworkbench/ {workbenchID} /travelers/updatefromtravelerupdateditems/ {TravelerUpdatableItemsListResponseIdentifier} For {workbenchID} send the workbench identifier returned in ReservationResponse/Identifer/value in the workbench create response. For {TravelerUpdatableItemsListResponseIdentifier} send the system-generated transaction identifier returned in the preceding Traveler Updatable Items response in TravelerUpdatableItemsListResponse/Identifier/value. Base path: Pre-production https://api.pp.travelport.net/11/air/ Production https://api.travelport.net/11/air/ Related Content: Booking Guide , Traveler Modify Guide The Traveler Update request follows an Traveler Updatable Items request and makes a change to one or more objects returned in that Updatable Items response. It is sent as part of a workbench session, either during the initial booking workflow or a post-commit workbench for an existing reservation. It is followed by a workbench commit .&#160; See the Traveler Modify Guide for a list of supported changes. Request As part of the request requirements, also see Authentication and Common Air API Headers . Query Parameters None. Request Body Show Request Body Table Object Description Required/Optional TravelerQueryUpdate Top level object. Required TravelerUpdatedItem Item/s to update. Array. Send one instance for each TravelerUpdatableItem from the Updatable Items response that you want to modify. Send with one of the following indicators for the desired action with the information sent in TravelerUpdatableItemID below: addInd:&#160;Set to true to add. deleteInd: Set to true to delete. modifyInd:&#160;Set to true to remove the current information and replace with the information in this request. Required @type value TravelerUpdatedItem {ObjectName} Send with @type set to the type for the object to modify as returned in the Updatable Items response. Supported objects are: TravelerUpdatedItemEmail TravelerUpdatedtemTelephone TravelerUpdatedItemAddress TravelerUpdatedItemCustomerLoyalty TravelerUpdatedItemTravelDocument TravelerUpdatedItemPersonName TravelerUpdatedItemComments Required TravelerUpdatableItemID The unique value returned in TravelerUpdatableItem/Identifier in the Updatable Items response for the item you want to add/modify/delete. Required {ObjectName} The appropriate object name and all associated attributes supported for modification for that object. See the Add Traveler API&#160;Reference for details of traveler-related objects for the following supported objects to send: Email Telephone Address CustomerLoyalty TravelDocument PersonName Comments Required Response The response returns a 204 No Content message. Example Request Show Example request to modify traveler name Updating traveler name is supported only for NDC&#160;on select carriers. { "TravelerQueryUpdate": { "TravelerUpdatedItem": [ { "@type": "TravelerUpdatedItemPersonName", "modifyInd": true, "TravelerUpdatableItemID": "6f0ae183-1ffd-4862-89a3-c8df0bd4be42", "PersonNameUpdatable": { "Given": "TESTFIRSTABC", "Surname": "TESTLAST" } } ] } } Show Example request to add frequent flyer/FQTV { "TravelerQueryUpdate": { "TravelerUpdatedItem": [ { "@type": "TravelerUpdatedItemCustomerLoyalty", "addInd": true, "TravelerUpdatableItemID": "2abe9c17-0f5f-4368-94c7-fa6b36749bf6", "CustomerLoyalty": { "id": "customerLoyalty_1", "supplier": "QF", "cardHolderName": "LOYTEST JORDAN", "value": "1295036" } } ] } } Show Example request to delete travel document { "TravelerQueryUpdate": { "TravelerUpdatedItem": [ { "@type": "TravelerUpdatedItemTravelDocument", "deleteInd": true, "TravelerUpdatableItemID": "52da40ee-7eda-4844-b7aa-1d57c3667560" } ] } } Show Example request to modify name remarks { "TravelerQueryUpdate": { "TravelerUpdatedItem": [ { "@type": "TravelerUpdatedItemComments", "modifyInd": true, "TravelerUpdatableItemID": "a9736dc1-c6b4-4e71-8c1c-5f04761d60ca", "Comments": { "@type": "Comments", "Comment": [ { "id": "comment_1", "value": "Name remarks update" } ] } } ] } } Example Response The response returns a 204 No Content message.

## Literal `<pre>` excerpts from HTML

### Block 1

```
{
 "TravelerQueryUpdate": {
  "TravelerUpdatedItem": [
   {
    "@type": "TravelerUpdatedItemPersonName",
    "modifyInd": true,
    "TravelerUpdatableItemID": "6f0ae183-1ffd-4862-89a3-c8df0bd4be42",
    "PersonNameUpdatable": {
     "Given": "TESTFIRSTABC",
     "Surname": "TESTLAST"
    }
   }
  ]
 }
}
```

### Block 2

```
{
 "TravelerQueryUpdate": {
  "TravelerUpdatedItem": [
   {
    "@type": "TravelerUpdatedItemCustomerLoyalty",
    "addInd": true,
    "TravelerUpdatableItemID": "2abe9c17-0f5f-4368-94c7-fa6b36749bf6",
    "CustomerLoyalty": {
     "id": "customerLoyalty_1",
     "supplier": "QF",
     "cardHolderName": "LOYTEST JORDAN",
     "value": "1295036"
    }
   }
  ]
 }
}
```

### Block 3

```
{
  "TravelerQueryUpdate": {
    "TravelerUpdatedItem": [
      {
        "@type": "TravelerUpdatedItemTravelDocument",
        "deleteInd": true,
        "TravelerUpdatableItemID": "52da40ee-7eda-4844-b7aa-1d57c3667560"
      }
    ]
  }
}
```

### Block 4

```
{
 "TravelerQueryUpdate": {
  "TravelerUpdatedItem": [
   {
    "@type": "TravelerUpdatedItemComments",
    "modifyInd": true,
    "TravelerUpdatableItemID": "a9736dc1-c6b4-4e71-8c1c-5f04761d60ca",
    "Comments": {
     "@type": "Comments",
     "Comment": [
      {
       "id": "comment_1",
       "value": "Name remarks update"
      }
     ]
    }
   }
  ]
 }
}
```

