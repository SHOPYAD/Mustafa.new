# Travel Agency Telephone API&#160;Reference

## Source

- **Local HTML:** `docs/travelport/travelport api guide/travelport-airapi json/support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/Book/TravelAgency/APIRef_TravelAgencyTelephone.html` (UTF-8 mirror)
- **Official base:** `https://support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/` + same relative path

## Plaintext extract (lossy)

Travel Agency Telephone API&#160;Reference Skip To Main Content Account Settings Logout placeholder Account Settings Logout Filter: All Files Submit Search Filter: All Files Submit Search Travel Agency Telephone API&#160;Reference Request Response Example request Example response POST ticket/travelagency/reservationworkbench/ {workbenchID} /travelagency/ {travelagencyID} /addtelephone For {workbenchID} send the workbench identifier returned in ReservationResponse/Identifer/value in the workbench create response. For {travelagencyID} send the identifier returned in TravelAgency/id in the Workbench Create and Workbench Retrieve responses. Base path: Pre-production https://api.pp.travelport.net/11/air/ Production https://api.travelport.net/11/air/ Put ticket/travelagency/reservationworkbench/ {workbenchID} /travelagency/ {travelagencyID} /updatetelephone See the POST&#160;request above for variables and the base path. DEL ticket/travelagency/reservationworkbench/ {workbenchID} /travelagency/ {travelagencyID} /deletetelephone/l {emailID} For {emailID} send the identifier returned in TravelAgency/Email/id in the Workbench Create and Workbench Retrieve responses. See the POST&#160;request above for other variables and the base path. Related Content: Booking Guide , Travel Agency Details API&#160;Reference The Travel Agency Telephone API supports POST, PUT, and DEL requests to add, modify, or delete a travel agency telephone number to the booking in the current workbench. All requests must be sent as part of a workbench session, either during the initial booking workflow or a post-commit workbench for an existing booking, and followed by a workbench commit . For adding only, you can instead use the Travel Agency Details API&#160;to add all travel agency details in a single request using one payload. Using the Travel Agency Details API for adding is recommended, as the individual POST endpoints for the travel agency corporate ID, telephone, email, and address APIs will eventually be deprecated. The reservation retrieve for a booking returns any travel agency details associated with that booking. Use the Travel Agency requests only for travel agency contact details. Create and modify traveler details in the Add Traveler and Traveler Updatable Items requests. Request As part of the request requirements, also see Authentication and Common Air API Headers . Query Parameters None. Request Body Use the following request for the update operation. The delete request does not have a message body. Note the different endpoints for each operation per above. Show Request Body Table Object Description Required/Optional TravelAgencyQueryTravelAgencyTelephoneWrapper Top level object. Required TelephoneDetail &#160; Required countryAccessCode String. Country code for phone number. Optional areaCityCode String. Any city or area code associated with the phone number. Optional phoneNumber String. Max length 32 characters. Phone number value. Optional extension GDS&#160;only; not supported for NDC. String. Extension for a phone number. Optional id String. Custom user-assigned identifier for this phone number. Optional cityCode String. Max length 10 characters. City code for phone number. Optional Response The response returns the travel agency identifier and the details sent in the request. Show Response Body Table Object Description TravelAgencyResponse Top level object. Includes TravelAgency object. TravelAgency Corporate code value. Key value pair: id : System-assigned internal id for this travel agency. Must be sent in any subsequent update or delete request for the address added. This id is not associated with the internal id generated if a corporate ID is added for the same travel agency. The two ids are separate; the value returned here is used only in subsequent update or delete requests for this address. Identifier System-generated identifier for the travel agency; use this in subsequent update and delete request: authority : Source of information. value : Unique system-generated identifier. Telephone Returns the telephone details sent in the request in the following key value pairs: countryAccessCode : Country code for phone number. areaCityCode :&#160;Area code for phone number. phoneNumber : Phone number string. extension :&#160;Any extension for the phone number. id :&#160;User-assigned identifier for this phone number. cityCode :&#160;Any city code associated with the phone number. Example Request Use the following request to modify any part of a travel agency telephone number. The delete request does not send a request payload. Show Example modify travel agency telephone request { "TravelAgencyQueryTravelAgencyTelephoneWrapper": { "TravelAgencyQueryTravelAgencyTelephone": { "Telephone": { "@type": "TelephoneDetail", "id": "telephone_1", "countryAccessCode": "91", "areaCityCode": "666", "phoneNumber": "12345", "extension": "989", "cityCode": "IND" } } } } Example Response The following response is returned for the travel agency telephone modify request. The delete response returns a No Content message. Show Example modify travel agency telephone response { "TravelAgencyResponse": { "TravelAgency": { "@type": "TravelAgencyDetail", "id": "travelAgency_1", "Identifier": { "value": "328a3a99-dd30-486f-9653-37619bdbdbe5", "authority": "Travelport" }, "Telephone": [ { "@type": "Telephone", "id": "telephone_1" } ] } } }

## Literal `<pre>` excerpts from HTML

### Block 1

```
{
 "TravelAgencyQueryTravelAgencyTelephoneWrapper": {
  "TravelAgencyQueryTravelAgencyTelephone": {
   "Telephone": {
    "@type": "TelephoneDetail",
    "id": "telephone_1",
    "countryAccessCode": "91",
    "areaCityCode": "666",
    "phoneNumber": "12345",
    "extension": "989",
    "cityCode": "IND"
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
            "id": "travelAgency_1",
            "Identifier": {
                "value": "328a3a99-dd30-486f-9653-37619bdbdbe5",
                "authority": "Travelport"
            },
            "Telephone": [
                {
                    "@type": "Telephone",
                    "id": "telephone_1"
                }
            ]
        }
    }
}
```

