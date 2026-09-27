# Queue Placement API&#160;Reference

## Source

- **Local HTML:** `docs/travelport/travelport api guide/travelport-airapi json/support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/Ticketing/APIRef_Queue.html` (UTF-8 mirror)
- **Official base:** `https://support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/` + same relative path

## Plaintext extract (lossy)

Queue Placement API&#160;Reference Skip To Main Content Account Settings Logout placeholder Account Settings Logout Filter: All Files Submit Search Filter: All Files Submit Search Queue Placement API&#160;Reference Request Response Example request Example response POST queue/queue Base path: Pre-production https://api.pp.travelport.net/11/air/ Production https://api.travelport.net/11/air/ Related Content: Ticketing Guide , Queue List , Queue Remove Prior to ticketing, you can add queue placement information to a booking.&#160;This adds a specific agency queue to the reservation so that any additional action can be managed as necessary. Queue placement is optional after booking and before ticketing. Each Travelport PCC has a set of numbered queues. Queues provide the ability to place a booking into an area that allows you to manage, sort, and store booking files, messages from vendors, and manage workflow. Queue management distributes messages from vendors and customers to the specified queues for action. The JSON Queue Placement API is one of two ways to specify a queue for a booking. Alternately, you can send an optional payload to specify a queue at booking at Workbench Commit. Request As part of the request requirements, also see Authentication and Common Air API Headers . Query Parameters None. Request Body Show Request Body Table Object Description Required/Optional AgencyQueueSummary Top level object for request. Required ReservationIdentifier Top level object. Required value Locator code of the reservation to add to the queue. Required Queue Queue details. Multiple instances of Queue can be sent. Each instance of Queue is one individual queue. Required value Queue number. For single digit queues, always send with a leading zero, as in 01, 05, 09, etc. Required category Customer-defined category within a queue. For single digit categories, always send with a leading zero, as in 01, 05, 09, etc. Optional dateOffset Numeric value for a date range. Optional date Date and time for a specific customer-defined action within that queue. Optional pccOverride PCC to override the agency default PCC for that queue. Optional Response Show Response Body Table Object Description BaseResponse Top level object. Result Top level object. status Status of queue placement. Example Request Show Example Request { "AgencyQueue": { "ReservationIdentifier": { "value": "6Q04QC" }, "Queue": [ { "pccOverride": "79JP", "value": "67" } ] } } Example Response Show Example Response { "BaseResponse": { "Result": { "status": "Complete" } } } &#160;

## Literal `<pre>` excerpts from HTML

### Block 1

```
{
    "AgencyQueue": {
        "ReservationIdentifier": {
            "value": "6Q04QC"
        },
        "Queue": [
            {
                "pccOverride": "79JP",
                "value": "67"
            }
        ]
    }
}
```

### Block 2

```
{
    "BaseResponse": {
        "Result": {
            "status": "Complete"
        }
    }
}
```

