# Travel Agency Address API&#160;Reference

## Source

- **Local HTML:** `docs/travelport/travelport api guide/travelport-airapi json/support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/Book/TravelAgency/APIRef_TravelAgencyAddress.html` (UTF-8 mirror)
- **Official base:** `https://support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/` + same relative path

## Plaintext extract (lossy)

Travel Agency Address API&#160;Reference Skip To Main Content Account Settings Logout placeholder Account Settings Logout Filter: All Files Submit Search Filter: All Files Submit Search Travel Agency Address API&#160;Reference Request Response Example request Example response POST ticket/travelagency/reservationworkbench/ {workbenchID} /travelagency/addaddress For {workbenchID} send the workbench identifier returned in ReservationResponse/Identifer/value in the workbench create response. Base path: Pre-production https://api.pp.travelport.net/11/air/ Production https://api.travelport.net/11/air/ Put ticket/travelagency/reservationworkbench/ {workbenchID} /travelagency/ {travelagencyID} /updateaddress For {travelagencyID} send the identifier returned in TravelAgency/id in the Workbench Create and Workbench Retrieve responses. See the POST&#160;request above for other variables and the base path. DEL ticket/travelagency/reservationworkbench/ {workbenchID} /travelagency/ {travelagencyID} /deleteaddress {addressID} For {travelagencyID} send the identifier returned in TravelAgency/id in the Workbench Create and Workbench Retrieve responses. For {addressD} send the identifier returned in TravelAgency/Address/id in the Workbench Create and Workbench Retrieve responses. See the POST&#160;request above for other variables and the base path. Related Content: Booking Guide , Travel Agency Details API&#160;Reference The Travel Agency Address API supports POST, PUT, and DEL requests to add, modify, or delete a travel agency address to the booking in the current workbench. All requests must be sent as part of a workbench session, either during the initial booking workflow or a post-commit workbench for an existing booking, and followed by a workbench commit . For adding only, you can instead use the Travel Agency Details API&#160;to add all travel agency details in a single request using one payload. Using the Travel Agency Details API for adding is recommended, as the individual POST endpoints for the travel agency corporate ID, telephone, email, and address APIs will eventually be deprecated. The reservation retrieve for a booking returns any travel agency details associated with that booking. Use the Travel Agency requests only for travel agency contact details. Create and modify traveler details in the Add Traveler and Traveler Updatable Items requests. Request As part of the request requirements, also see Authentication and Common Air API Headers . Query Parameters None. Request Body Use the following request for the update operation. The delete request does not have a message body. Note the different endpoints for each operation per above. Show Request Body Table Object Description Required/Optional TravelAgencyQueryTravelAgencyAddressWrapper Top level object. Required TravelAgencyQueryTravelAgencyAddress Top level object. Required Address Top level object for address data. Includes AddressLine, City, StateProv, Country, PostalCode, Addressee objects. Required role Role for this address. Optional AddressLine The street address. Required City The city of the address. Required StateProv The state or province of the address. Key value pair: name:&#160;Name of the state or province. Required Country The country of the address. name :&#160;Name of the country. Required PostalCode The postal code of the address. Required Addressee Contact name at the address. Optional Response The response to the update request returns the travel agency identifier and the details sent in the request. Show Response Body Table Object Description TravelAgencyResponse Top level object. Includes TravelAgency object. TravelAgency Travel agency identifier. Key value pair: id : System-generated internal id for this travel agency. Identifier System-generated identifier for response: authority : Source of information. value : Unique system-generated identifier. Address Id for the address sent in the add or update request. Key value pair: id : System-generated internal id for this address. Must be sent in any subsequent update or delete request for this address. Example Request Show Example add travel agency address request { "TravelAgencyQueryTravelAgencyAddressWrapper": { "TravelAgencyQueryTravelAgencyAddress": { "Address": { "@type": "AddressDetail", "AddressLine": "28 BROAD STREET", "City": "ENGLEWOOD", "StateProv": { "name": "COLORADO" }, "Country": { "name": "US" }, "PostalCode": "80111", "Addressee": "ONE TEST" "role": "Business" } } } } Example Response The following response is returned for the add pr update operation. The delete response returns a No Content message. Show Example add or update travel agency address response { "TravelAgencyResponse": { "TravelAgency": { "@type": "TravelAgencyDetail", "id": "travelagency_1", "Identifier": { "value": "fc9ab7f1-c6ec-4787-a978-ae7f793704d6", "authority": "Travelport" }, "Address": [ { "@type": "AddressDetail", "id": "address_1" } ] } } }

## Literal `<pre>` excerpts from HTML

### Block 1

```
{
 "TravelAgencyQueryTravelAgencyAddressWrapper": {
  "TravelAgencyQueryTravelAgencyAddress": {
   "Address": {
    "@type": "AddressDetail",
    "AddressLine": "28 BROAD STREET",
    "City": "ENGLEWOOD",
    "StateProv": {
     "name": "COLORADO"
    },
    "Country": {
     "name": "US"
    },
    "PostalCode": "80111",
    "Addressee": "ONE TEST"
    "role": "Business"
   }
  }
 }
}
```

### Block 2

```
{
 "TravelAgencyResponse": {
  "TravelAgency": {
   "@type": "TravelAgencyDetail",
   "id": "travelagency_1",
   "Identifier": {
    "value": "fc9ab7f1-c6ec-4787-a978-ae7f793704d6",
    "authority": "Travelport"
   },
   "Address": [
    {
     "@type": "AddressDetail",
     "id": "address_1"
    }
   ]
  }
 }
}
```

