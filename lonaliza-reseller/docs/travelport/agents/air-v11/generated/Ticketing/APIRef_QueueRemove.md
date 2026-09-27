# Queue Remove API&#160;Reference

## Source

- **Local HTML:** `docs/travelport/travelport api guide/travelport-airapi json/support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/Ticketing/APIRef_QueueRemove.html` (UTF-8 mirror)
- **Official base:** `https://support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/` + same relative path

## Plaintext extract (lossy)

Queue Remove API&#160;Reference Skip To Main Content Account Settings Logout placeholder Account Settings Logout Filter: All Files Submit Search Filter: All Files Submit Search Queue Remove API&#160;Reference Request Response Example request Example response POST queue/queue/remove Base path: Pre-production https://api.pp.travelport.net/11/air/ Production https://api.travelport.net/11/air/ Related Content: Ticketing Guide , Queue Placement , Queue List Use Queue Remove to remove one or more bookings from a specified queue. Each Travelport PCC has a set of numbered queues. Queues provide the ability to place a booking into an area that allows you to manage, sort, and store booking files, messages from vendors, and manage workflow. Queue management distributes messages from vendors and customers to the specified queues for action. Bookings can be added to a queue either by sending an optional payload to specify a queue at booking at Workbench Commit, or the Queue Placement API . Request As part of the request requirements, also see Authentication and Common Air API Headers . Query Parameters None. Request Body Show Request Body Table Object Description Required/Optional AgencyQueueSummary Top level object for request. Required ReservationIdentifier Top level object. Required value Locator code of the reservation to remove from the queue. Required Queue Queue details. Multiple instances of Queue can be sent. Each instance is one individual queue. Required value Queue number. Required category Customer-defined category within a queue. Optional dateOffset Numeric value for a date range. Optional pccOverride PCC to override the agency default PCC for that queue. Optional Response Show Response Body Table Object Description BaseResponse Top level object. Result Top level object. status Status of queue placement. Example Request Show Example queue remove request { "@type": "AgencyQueueSummary", "ReservationIdentifier": { "value": “ABC123” }, "Queue": [ { "value": 23, "pccOverride": "1AA1", "category": "AR", "dateOffset": 3 } ] } Example Response Show Example queue remove response { "BaseResponse": { "@type": "BaseResponse", "Result": { "@type": "Result", "status": "Complete" } } } &#160;

## Literal `<pre>` excerpts from HTML

### Block 1

```
{
 "@type": "AgencyQueueSummary",
 "ReservationIdentifier": {
   "value": “ABC123”
 },
 "Queue": [
   {
     "value": 23,
     "pccOverride": "1AA1",
     "category": "AR",     
     "dateOffset": 3
   }
 ]
}
```

### Block 2

```
{
 "BaseResponse": {
  "@type": "BaseResponse",
  "Result": {
   "@type": "Result",
   "status": "Complete"
  }
 }
}
```

