# Discard Workbench API&#160;Reference

## Source

- **Local HTML:** `docs/travelport/travelport api guide/travelport-airapi json/support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/Workbench/APIRef_WorkbenchDiscard.html` (UTF-8 mirror)
- **Official base:** `https://support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/` + same relative path

## Plaintext extract (lossy)

Discard Workbench API&#160;Reference Skip To Main Content Account Settings Logout placeholder Account Settings Logout Filter: All Files Submit Search Filter: All Files Submit Search Discard Workbench API&#160;Reference Request Response Example request Example response Del book/session/reservationworkbench/ {workbenchID} For {workbenchID} send the workbench identifier returned in ReservationResponse/Identifer/value in the workbench create response. Base path: Pre-production https://api.pp.travelport.net/11/air/ Production https://api.travelport.net/11/air/ Related Content: Booking Guide , Ticketing Guide At any point in a booking or ticketing workflow, if necessary, you can discard the workbench and any information in it. You do not need to discard any workbench you have committed, only a workbench you do not want to commit. Worbenches/sessions stay open for 30 minutes before expiring. Request As part of the request requirements, also see Authentication and Common Air API Headers . Query Parameters None. Request Body Show Request Body Table Object Description Required/Optional Reservation Empty container to ignore the workbench. Required Response HTTP&#160;204 No Content message. Example Request Send a blank ReservationID object in the payload request per the example request below. Show Example Request { "ReservationID": { } } Example Response HTTP&#160;204 No Content message.

## Literal `<pre>` excerpts from HTML

### Block 1

```
{
    "ReservationID": {
                
    }
}
```

