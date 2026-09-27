# Travel Agency Corporate ID API&#160;Reference

## Source

- **Local HTML:** `docs/travelport/travelport api guide/travelport-airapi json/support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/Book/TravelAgency/APIRef_TravelAgencyCorpID.html` (UTF-8 mirror)
- **Official base:** `https://support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/` + same relative path

## Plaintext extract (lossy)

Travel Agency Corporate ID API&#160;Reference Skip To Main Content Account Settings Logout placeholder Account Settings Logout Filter: All Files Submit Search Filter: All Files Submit Search Travel Agency Corporate ID API&#160;Reference Request Response Example request Example response POST ticket/travelagency/reservationworkbench/ {workbenchID} /travelagency/addcorporatecode For {workbenchID} send the workbench identifier returned in ReservationResponse/Identifer/value in the workbench create response. Base path: Pre-production https://api.pp.travelport.net/11/air/ Production https://api.travelport.net/11/air/ Put ticket/travelagency/reservationworkbench/ {workbenchID} /travelagency/ {travelagencyID} /updatecorporatecode For {travelagencyID} send the agency identifier returned in TravelAgency/id. See the POST&#160;request above for other variables and the base path. DEL ticket/travelagency/reservationworkbench/ {workbenchID} /travelagency/ {travelagencyID} /deletecorporatecode For {travelagencyID} send the agency identifier returned in TravelAgency/id. See the POST&#160;request above for other variables and the base path. Related Content: Booking Guide , Travel Agency Details API&#160;Reference The Travel Agency Corporate ID API supports POST, PUT, and DEL requests to add, modify, or delete a travel agency corporate ID to or from the booking in the current workbench. All requests must be sent as part of a workbench session, either during the initial booking workflow or a post-commit workbench for an existing booking, and followed by a workbench commit . For adding only, you can instead use the Travel Agency Details API&#160;to add all travel agency details in a single request using one payload. Using the Travel Agency Details API for adding is recommended, as the individual POST endpoints for the travel agency corporate ID, telephone, email, and address APIs will eventually be deprecated. The reservation retrieve for a booking returns any travel agency details associated with that booking. Request As part of the request requirements, also see Authentication and Common Air API Headers . Query Parameters None. Request Body Use the following request for both the POST (add) and PUT (update) calls. The DEL&#160;(delete) request does not send a request body. Note the different endpoints for each operation per above. Show Request Body Table Object Description Required/Optional TravelAgencyQueryTravelAgencyCorporateCode Top level object. Required CorporateCode Corporate code value. Required Response The add and update responses return an id for the newly added or updated id. The corporate code value is not returned in this response but is returned in any subsequent Reservation Retrieve. The delete response returns an empty 204 No Content message. Show Response Body Table Object Description TravelAgencyResponse Top level object. Includes TravelAgency object. TravelAgency Corporate code value. Key value pair: id : System-generated id for this travel agency. Identifier System-generated internal identifier for the response: authority : Source of information. value : Unique system-generated identifier. Example Request Use the following request for both the add and update operations; note the different endpoints for each operation per above. Show Example corporate ID request { "TravelAgencyQueryTravelAgencyCorporateCode": { "CorporateCode": "HSBC01GBHRG" } } Example Response The following example response is returned for the add and update operations. The delete response returns a 204 No Content message. Show Example corporate code response { "TravelAgencyResponse": { "TravelAgency": { "@type": "TravelAgency", "id": "HSBC01GBHRG", "Identifier": { "value": "9c65ed3a-b30e-4df7-ad0b-07516d239bea", "authority": "Travelport" } } } }

## Literal `<pre>` excerpts from HTML

### Block 1

```
{
 "TravelAgencyQueryTravelAgencyCorporateCode": {
  "CorporateCode": "HSBC01GBHRG"
 }
}
```

### Block 2

```
{
    "TravelAgencyResponse": {
        "TravelAgency": {
            "@type": "TravelAgency",
            "id": "HSBC01GBHRG",
            "Identifier": {
                "value": "9c65ed3a-b30e-4df7-ad0b-07516d239bea",
                "authority": "Travelport"
            }
        }
    }
}
```

