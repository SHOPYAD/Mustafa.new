# Cancel Payment API&#160;Reference

## Source

- **Local HTML:** `docs/travelport/travelport api guide/travelport-airapi json/support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/NDC/APIRef_CancelPayment.html` (UTF-8 mirror)
- **Official base:** `https://support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/` + same relative path

## Plaintext extract (lossy)

Cancel Payment API&#160;Reference Skip To Main Content Account Settings Logout placeholder Account Settings Logout Filter: All Files Submit Search Filter: All Files Submit Search Cancel Payment API&#160;Reference Request Response Example request Example response POST paymentoffer/reservationworkbench/ {workbenchID} /payments/ {paymentID} For {workbenchID} send the workbench identifier returned in ReservationResponse/Identifer/value in the workbench create response. For {paymentID} send the identifier in Payment/id returned in the workbench create response. Base path: Pre-production https://api.pp.travelport.net/11/air/ Production https://api.travelport.net/11/air/ Related Content: Exchange, Refund, and Void Guide NDC&#160;only; not supported for GDS. Supported only for Qantas (QF). For NDC on supporting carriers only, you can use the Cancel Payment API&#160;to cancel the payment on a ticket. This refunds the payment, cancels the ticket but retains the itinerary, and creates a held booking for later fulfillment. For example, you might want to use this workflow to use a different payment method than was sent in ticketing. You must establish a workbench session before sending the Cancel Payment request detailed here. After sending Cancel Payment, you must commit the workbench to implement the change. For GDS&#160;and NDC differences in the JSON APIs, see the support tables for seats , ancillaries , fare rules , and exchanges/refunds , and the NDC&#160;and GDS Functionality Comparison . For differences within NDC by individual carriers, see NDC capabilities by airline through JSON API in the Travelport Knowledge Base. See Knowledge Base NDC&#160;Resources if you need login assistance. Request As part of the request requirements, also see Authentication and Common Air API Headers . Query Parameters None. Request Body After creating a post-commit workbench , send a POST request to the endpoint above. There is no message payload. Example Request No message payload. Example Response For a successful cancel payment request, Cancel Payment returns an empty PaymentResponse object per below. After successfully canceling the payment, commit the workbench to implement the change. Because no payment is present in the workbench, the ticket is voided but the segments are retained. Show Example Cancel Payment response { "PaymentResponse": {} } If the ticket is outside the void period, Cancel Payment returns the following error message without canceling the payment or changing the ticket in any way. In this case you cannot void the ticket. See the Exchange, Refund, and Void Guide for other available options, depending on fare rules. Show Example Cancel Payment response for error outside void period { "ErrorResponse": { "Result": { "Error": [ { "@type": "Error", "StatusCode": 405, "Message": "Cannot cancel the ticket. The Reservation is outside void period." } ] } } }

## Literal `<pre>` excerpts from HTML

### Block 1

```
{
    "PaymentResponse": {}
}
```

### Block 2

```
{
  "ErrorResponse": {
    "Result": {
      "Error": [
        {
          "@type": "Error",
          "StatusCode": 405,
          "Message": "Cannot cancel the ticket. The Reservation is outside void period."
        }
      ]
    }
  }
}
```

