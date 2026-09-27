# Queue List API&#160;Reference

## Source

- **Local HTML:** `docs/travelport/travelport api guide/travelport-airapi json/support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/Ticketing/APIRef_QueueList.html` (UTF-8 mirror)
- **Official base:** `https://support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/` + same relative path

## Plaintext extract (lossy)

Queue List API&#160;Reference Skip To Main Content Account Settings Logout placeholder Account Settings Logout Filter: All Files Submit Search Filter: All Files Submit Search Queue List API&#160;Reference Request Response Example request Example response POST queue/queue/list Base path: Pre-production https://api.pp.travelport.net/11/air/ Production https://api.travelport.net/11/air/ Related Content: Ticketing Guide , Queue Placement , Queue Remove Queue List returns a list of bookings on a specified queue. Each Travelport PCC has a set of numbered queues. Queues provide the ability to place a booking into an area that allows you to manage, sort, and store booking files, messages from vendors, and manage workflow. Queue management distributes messages from vendors and customers to the specified queues for action. Bookings can be added to a queue either by sending an optional payload to specify a queue at booking at Workbench Commit, or the Queue Placement API. Request As part of the request requirements, also see Authentication and Common Air API Headers . Query Parameters None. Request Body Show Request Body Table Object Description Required/Optional AgencyQueueSummary Top level object for request. Send in the following format: "@type": "AgencyQueueSummary", Required Queue Array. Each instance is one individual queue. Required value Queue number of the queue to provide the list for. Required category Customer-defined category within a queue. Optional dateOffset Numeric value for a date range. Optional pccOverride PCC to override the agency default PCC for that queue. Optional Response Show Response Body Table Object Description AgencyQueueResponse Top level object. Includes Result, Identifier, and AgencyQueue objects. Key value pairs: transactionId : System-generated unique ID for this response. Can be used for internal tracking and troubleshooting. traceId : Returned if a custom trace ID was sent in the request header. See Transaction and Trace IDs for details. See Identifiers in the JSON &#160;APIs for more about identifiers across all JSON &#160;APIs. Result Top level object. status Status of request. Identifier Standard transaction identifiers. Key value pairs: authority : Source of information. value : Unique system-generated identifier. AgencyQueue Object for the queue list. Includes the Identifier, ReservationIdentifier, Queue, and QueueList objects. AgencyQueue/ Identifier Standard transaction identifiers. Key value pairs: authority : Source of information. value : Unique system-generated identifier. ReservationIdentifier Object for the record locator of the booking. Key value pairs: value :&#160;String. Six-character record locator of the booking authority : Source of record locator. Queue Array for queue details. Each instance is one individual queue. Key value pairs: value : Queue number. category : Customer-defined category within a queue. dateOffset : Numeric value for a date range. date : Date and time for a specific customer-defined action within that queue. pccOverride : PCC to override the agency default PCC for that queue. QueueList Array for queue listings. Each instance is one booking on that queue. Includes Name, Locator, and TravelDate objects. Name Name of the passenger on the booking. Locator Booking locator code. TravelDate Date the travel on the booking starts. Example Request Show Example queue list request { "@type": "AgencyQueueSummary", "Queue": [ { "value": 65 "dateOffset": 1, "pccOverride": "XB7", "category": "SH" } ] } Example Response Show Example queue list response { "AgencyQueueResponse": { "@type": "AgencyQueueResponse", "transactionId": "0b5a766b-18b2-45f7-b3cd-59d92786f920", "traceId": "94932db3-5ace-40ac-a15a-1f2b0c5178ce", "AgencyQueue": { "@type": "AgencyQueueDetail", "Identifer": { "authority": "Travelport", "value": "316e64f8-d547-4f73-ab41-d5ce65bcc46e" }, "Queue": [ { "pccOverride": "XB7", "value": 65 } ], "QueueList": [ { "@type": "QueueList", "Name": "1TEST/NIRMAL", "Locator": { "value": "D6ZQPQ" }, "TravelDate": "2025-12-01" }, { "@type": "QueueList", "Name": "1TEST/NIRMAL", "Locator": { "value": "D6XGZN" }, "TravelDate": "2025-11-01" }, { "@type": "QueueList", "Name": "1SNEGI/API", "Locator": { "value": "D6Y02R" }, "TravelDate": "2026-07-20" }, { "@type": "QueueList", "Name": "1SRNMONE/PX FARADHA SHA M", "Locator": { "value": "D6ZN6R" }, "TravelDate": "2025-10-26" }, { "@type": "QueueList", "Name": "1SRNMONE/MA KUMAR PARAMES", "Locator": { "value": "D6ZN6R" }, "TravelDate": "2025-10-26" } ] }, "Identifier": { "authority": "Travelport", "value": "bc6c0121-380f-47a3-aa7b-12c02ffa8da4" } } } &#160;

## Literal `<pre>` excerpts from HTML

### Block 1

```
{
 "@type": "AgencyQueueSummary",
   "Queue": [
    {
     "value": 65
     "dateOffset": 1,
     "pccOverride": "XB7",
     "category": "SH"
    }
  ]
}
```

### Block 2

```
{
 "AgencyQueueResponse": {
  "@type": "AgencyQueueResponse",
  "transactionId": "0b5a766b-18b2-45f7-b3cd-59d92786f920",
  "traceId": "94932db3-5ace-40ac-a15a-1f2b0c5178ce",
  "AgencyQueue": {
   "@type": "AgencyQueueDetail",
   "Identifer": {
    "authority": "Travelport",
    "value": "316e64f8-d547-4f73-ab41-d5ce65bcc46e"
   },
   "Queue": [
    {
     "pccOverride": "XB7",
     "value": 65
    }
   ],
   "QueueList": [
    {
     "@type": "QueueList",
     "Name": "1TEST/NIRMAL",
     "Locator": {
      "value": "D6ZQPQ"
     },
     "TravelDate": "2025-12-01"
    },
    {
     "@type": "QueueList",
     "Name": "1TEST/NIRMAL",
     "Locator": {
      "value": "D6XGZN"
     },
     "TravelDate": "2025-11-01"
    },
    {
     "@type": "QueueList",
     "Name": "1SNEGI/API",
     "Locator": {
      "value": "D6Y02R"
     },
     "TravelDate": "2026-07-20"
    },
    {
     "@type": "QueueList",
     "Name": "1SRNMONE/PX FARADHA SHA M",
     "Locator": {
      "value": "D6ZN6R"
     },
     "TravelDate": "2025-10-26"
    },
    {
     "@type": "QueueList",
     "Name": "1SRNMONE/MA KUMAR PARAMES",
     "Locator": {
      "value": "D6ZN6R"
     },
     "TravelDate": "2025-10-26"
    }
   ]
  },
  "Identifier": {
   "authority": "Travelport",
   "value": "bc6c0121-380f-47a3-aa7b-12c02ffa8da4"
  }
 }
}
```

