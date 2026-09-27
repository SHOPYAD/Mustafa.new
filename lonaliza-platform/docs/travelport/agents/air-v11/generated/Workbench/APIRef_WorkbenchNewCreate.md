# New Workbench API&#160;Reference

## Source

- **Local HTML:** `docs/travelport/travelport api guide/travelport-airapi json/support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/Workbench/APIRef_WorkbenchNewCreate.html` (UTF-8 mirror)
- **Official base:** `https://support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/` + same relative path

## Plaintext extract (lossy)

New Workbench API&#160;Reference Skip To Main Content Account Settings Logout placeholder Account Settings Logout Filter: All Files Submit Search Filter: All Files Submit Search New Workbench API&#160;Reference Request Response Example request Example response POST book/session/reservationworkbench Base path: Pre-production https://api.pp.travelport.net/11/air/ Production https://api.travelport.net/11/air/ Related Content: Air Booking Guide , Booking Session Workflow Use this request to initiate a workbench for a new reservation. This prerequisite step for booking creates the workbench session in which all booking details are added together to create a reservation at workbench commit . See the Booking Workflow summary and diagrams in the Air Booking Guide for the booking workflow. Request As part of the request requirements, also see Authentication and Common Air API Headers . Query Parameters None. Request Body Show Request Body Table Object Description Required/Optional ReservationID Empty container to request workbench ID. Required Response Show Response Body Table Object Description ReservationResponse Top level object. Reservation Top level object. Includes Identifier. Identifier Workbench identifier. In this case authority is always Travelport, and value is the workbench identifier that must be sent in all subsequent requests for this workbench session. Key value pairs: authority : Source of information. value : Unique system-generated identifier. Example Request Show Example Request { "ReservationID": { } } Example Response The response returns a workbench identifier that must be sent in all subsequent requests for this workbench session. Show Example Response { "ReservationResponse": { "Reservation": { "@type": "Reservation", "Identifier": { "authority": "Travelport", "value": " af9da82f-1966-4134-8561-3fd1a430d62e " } } } }

## Literal `<pre>` excerpts from HTML

### Block 1

```
{
	"ReservationID": { 
	}
}
```

### Block 2

```
{
    "ReservationResponse": {
        "Reservation": {
            "@type": "Reservation",
            "Identifier": {
                "authority": "Travelport",
                "value": "af9da82f-1966-4134-8561-3fd1a430d62e"
            }
        }
    }
}
```

