# Document List API&#160;Reference

## Source

- **Local HTML:** `docs/travelport/travelport api guide/travelport-airapi json/support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/Book/APIRef_DocumentList.html` (UTF-8 mirror)
- **Official base:** `https://support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/` + same relative path

## Plaintext extract (lossy)

Document List API&#160;Reference Skip To Main Content Account Settings Logout placeholder Account Settings Logout Filter: All Files Submit Search Filter: All Files Submit Search Document List API&#160;Reference Request Response Example request Example response Get documents/documentlist/ {LocatorCode} Base path: The base path for this API varies from that for other JSON &#160; Air APIs and does not include air at the end. Pre-production https://api.pp.travelport.net/11/ Production https://api.travelport.net/11/ Related Content: Air Booking Guide Document List retrieves a list of tickets, invoices, MCOs, and EMDs associated with a record locator. The request can retrieve this information even after the booking and associated documents are purged from the airline's database. Unlike Document History , Document List does not return details of the documents; instead it returns each document's type, status, transaction date, and PCC. The JSON Air APIs provide the following APIs to retrieve bookings and tickets: To retrieve all booking details, use Reservation Retrieve . Returns all booking, payment, and ticketing information currently on a booking, To retrieve a list of all ticket numbers on a booking, use Ticket List . To retrieve details for all tickets associated with a booking (GDS&#160;only), or for a single ticket for NDC, use Ticket Retrieve . To return a list of documents on a booking, such as tickets, invoices, MCOs, and EMDs, use Document List . To return histories of up to six documents on a booking, such as tickets, invoices, MCOs, and EMDs, use Document History . Request As part of the request requirements, also see Authentication and Common Air API Headers . Query Parameters None. Request Body None. Response Show Response Body Table Object Description DocumentHistoryListResponse Top-level object for response. Includes the documentHistoryList object. documentHistoryList Array. One instance returned for each document associated with the record locator provided in the endpoint. Includes the documentListSummary object. Key value pairs: name: Passenger name associated with the document. documentListSummary Document details. Key value pairs; not all are applicable to and returned for all types of documents: platingAirline : Code of the plating airline of this document. number : Document number, such as a 13-digit ticket number or 9-digit invoice number. documentType : Enum. Document type. Supported values and meanings: E: GDS ticket N: NDC ticket M: MCO (miscellaneous change order) F: Service fee I: Invoice D: GDS EMD C: NDC EMD actionStatus : Enum. Status of the document. Supported values and meanings: I: Issue R: Refund RC: Refund cancel V: Void VE: Void Exchange E: Exchange transactionDateTimeUTC : Transaction date and time stamp in UTC. pseudoCityCode : PCC associated with the document. Example Request This request has no message payload. Example Response For additional examples, download the developer toolkits and see Using Postman and Developer Toolkits . Show Example Document&#160;List response { "DocumentHistoryListResponse": { "@type": "DocumentHistoryListResponse", "documentHistoryList": [ { "name": "GATER/ALLIE", "documentListSummary": [ { "platingAirline": "VA", "number": "7959905312628", "documentType": "E", "actionStatus": "I", "transactionDateTimeUTC": "2025-06-19T20:34:00.000Z", "pseudoCityCode": "XB7" } ] }, { "name": "GATER/ALLIE", "documentListSummary": [ { "platingAirline": "VA", "number": "7959905312629", "documentType": "E", "actionStatus": "E", "transactionDateTimeUTC": "2025-06-19T20:39:00.000Z", "pseudoCityCode": "XB7" } ] }, { "name": "GATER/ALLIE", "documentListSummary": [ { "number": "122484", "documentType": "I", "transactionDateTimeUTC": "2025-06-19T20:39:00.000Z", "pseudoCityCode": "XB7" } ] } ] } }

## Literal `<pre>` excerpts from HTML

### Block 1

```
{
 "DocumentHistoryListResponse": {
  "@type": "DocumentHistoryListResponse",
  "documentHistoryList": [
   {
    "name": "GATER/ALLIE",
    "documentListSummary": [
     {
      "platingAirline": "VA",
      "number": "7959905312628",
      "documentType": "E",
      "actionStatus": "I",
      "transactionDateTimeUTC": "2025-06-19T20:34:00.000Z",
      "pseudoCityCode": "XB7"
     }
    ]
   },
   {
    "name": "GATER/ALLIE",
    "documentListSummary": [
     {
      "platingAirline": "VA",
      "number": "7959905312629",
      "documentType": "E",
      "actionStatus": "E",
      "transactionDateTimeUTC": "2025-06-19T20:39:00.000Z",
      "pseudoCityCode": "XB7"
     }
    ]
   },
   {
    "name": "GATER/ALLIE",
    "documentListSummary": [
     {
      "number": "122484",
      "documentType": "I",
      "transactionDateTimeUTC": "2025-06-19T20:39:00.000Z",
      "pseudoCityCode": "XB7"
     }
    ]
   }
  ]
 }
}
```

