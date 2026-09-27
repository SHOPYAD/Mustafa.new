# Ticket List API&#160;Reference

## Source

- **Local HTML:** `docs/travelport/travelport api guide/travelport-airapi json/support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/Ticketing/APIRef_TicketList.html` (UTF-8 mirror)
- **Official base:** `https://support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/` + same relative path

## Plaintext extract (lossy)

Ticket List API&#160;Reference Skip To Main Content Account Settings Logout placeholder Account Settings Logout Filter: All Files Submit Search Filter: All Files Submit Search Ticket List API&#160;Reference Request Response Example request Example response Get receipt/reservations/ {LocatorCode} /receipts For {LocatorCode} &#160;send the locator code returned at booking commit or in Reservation Retrieve in Receipt/Confirmation/Locator/value. Base path: Pre-production https://api.pp.travelport.net/11/air/ Production https://api.travelport.net/11/air/ Related Content: Exchange, Refund, and Void Guide Send a ticket list request to return a list of all ticket numbers on a reservation.&#160;Does not return ticket details. The JSON Air APIs provide the following APIs to retrieve bookings and tickets: To retrieve all booking details, use Reservation Retrieve . Returns all booking, payment, and ticketing information currently on a booking, To retrieve a list of all ticket numbers on a booking, use Ticket List . To retrieve details for all tickets associated with a booking (GDS&#160;only), or for a single ticket for NDC, use Ticket Retrieve . To return a list of documents on a booking, such as tickets, invoices, MCOs, and EMDs, use Document List . To return histories of up to six documents on a booking, such as tickets, invoices, MCOs, and EMDs, use Document History . Request As part of the request requirements, also see Authentication and Common Air API Headers . The Ticket List API requires a GET request with the ticket number to the endpoint above. There are no query parameters or message payload. Response For each ticket on the requested reservation, the response returns the traveler name and the ticket number, returning the objects detailed in the table below. Show Response Body Table Object Description ReceiptListResponse Top level object. Includes the ReceiptID object. ReceiptID Contains all ticketing details. One instance is returned for each ticket on the reservation. Document Top level object. Number Ticket number. Example Request There is no message payload. The GET request looks like: https://api.travelport.com/11/air/receipt/reservations/G8A909/receipts Example Response The response returns the ticket number for each ticket on the requested reservation. The following examples returns two ticket numbers. Show Example Ticket Index Response { "ReceiptListResponse": { "ReceiptID": [ { "@type": "ReceiptPayment", "Document": [ { "@type": "Document", "Number": "0163767353086" }, { "@type": "Document", "Number": "0163767353087" } ] } ] } } &#160;

## Literal `<pre>` excerpts from HTML

### Block 1

```
{
 "ReceiptListResponse": {
  "ReceiptID": [
   {
    "@type": "ReceiptPayment",
    "Document": [
     {
      "@type": "Document",
      "Number": "0163767353086"
     },
     {
      "@type": "Document",
      "Number": "0163767353087"
     }
    ]
   }
  ]
 }
}
```

