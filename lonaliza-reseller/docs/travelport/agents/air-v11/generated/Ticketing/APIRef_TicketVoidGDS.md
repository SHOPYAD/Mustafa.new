# Single Ticket Void API&#160;Reference

## Source

- **Local HTML:** `docs/travelport/travelport api guide/travelport-airapi json/support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/Ticketing/APIRef_TicketVoidGDS.html` (UTF-8 mirror)
- **Official base:** `https://support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/` + same relative path

## Plaintext extract (lossy)

Single Ticket Void API&#160;Reference Skip To Main Content Account Settings Logout placeholder Account Settings Logout Filter: All Files Submit Search Filter: All Files Submit Search Single Ticket Void API&#160;Reference Request Response Example request Example response Put ticket/tickets/updatestatus/ {ticketID} Send the ticket number in {ticketID} . Base path: Pre-production https://api.pp.travelport.net/11/air/ Production https://api.travelport.net/11/air/ Related Content: Exchange, Refund, and Void Guide Use the Ticket Void API to void a single GDS ticket. Generally a ticket can be voided only within the same day it was issued. See Exchange, Refund, and Void Guide for limitations. AirTicketing takes into account tickets issued past midnight and on weekends and holidays in determining the allowable void period. Supported only for ARC&#160;users, not BSP. Not supported for NDC, see Exchange, Refund, and Void Guide for NDC. To cancel a GDS reservation that has not been ticketed, see the Reservation&#160;Cancel (GDS) and Cancel Workbench Items API&#160;references. Request As part of the request requirements, also see Authentication and Common Air API Headers . TicketVoid requires a PUT request with the ticket number. There are no query parameters. Send an empty TicketQueryUpdateTicket object in the payload per below. Show Request Body Table Object Description Required/Optional TicketQueryUpdateTicket Empty object. Required Response The TicketVoid response returns a result status. Show Response Body Table Object Description TicketIdResponse Top level object for response. Includes Result. May include SettlementAuthorizationCode. Result Returns the status of the void request. Key value pair: status: Returns a value of Complete if the ticket was successfully voided. If the ticket was not voided, an error message specific to the failure reason is returned. SettlementAuthorizationCode Returned if provided by the carrier. Example Request Show Example Request { "TicketQueryUpdateTicket" : { } } Example Response The example below shows a ticket void response with a status of Complete . A settlement authorization code may or may not be returned. Show Example TicketVoid Response { "TicketIdResponse": { "Result": { "status": "Complete" }, "SettlementAuthorizationCode": "125ZBHKCZD3S3" } } &#160;

## Literal `<pre>` excerpts from HTML

### Block 1

```
{
  "TicketQueryUpdateTicket" : {
   
  }
}
```

### Block 2

```
{
    "TicketIdResponse": {
        "Result": {
            "status": "Complete"
        },
        "SettlementAuthorizationCode": "125ZBHKCZD3S3"
    }
}
```

