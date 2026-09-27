# Form of Payment API&#160;Reference

## Source

- **Local HTML:** `docs/travelport/travelport api guide/travelport-airapi json/support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/Ticketing/APIRef_AddFOP.html` (UTF-8 mirror)
- **Official base:** `https://support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/` + same relative path

## Plaintext extract (lossy)

Form of Payment API&#160;Reference Skip To Main Content Account Settings Logout placeholder Account Settings Logout Filter: All Files Submit Search Filter: All Files Submit Search Form of Payment API&#160;Reference Request Response Example request Example response POST payment/reservationworkbench/ {workbenchID} /formofpayment For {workbenchID} send the workbench identifier returned in ReservationResponse/Identifer/value in the workbench create response. Base path: Pre-production https://api.pp.travelport.net/11/air/ Production https://api.travelport.net/11/air/ PUT payment/reservationworkbench/ {workbenchID} /formofpayment/ {FormOfPayment_Identifier} For {workbenchID} send the workbench identifier returned in ReservationResponse/Identifer/value in the workbench create response. For {FormOfPayment_Identifier} send the id of the form of payment to update. See POST request above for base path. Del payment/reservationworkbench/ {workbenchID} /formofpayment/ {FormOfPayment_Identifier} For {workbenchID} send the workbench identifier returned in ReservationResponse/Identifer/value in the workbench create response. For {FormOfPayment_Identifier} send the id of the form of payment to delete. See POST request above for base path. Related Content: Booking Guide , Ticketing Guide The Form of Payment (FOP) POST request adds payment details to a workbench. To apply the payment information to one or more offers, FOP must be followed with Payment . The PUT and DEL endpoints above modify or delete either an FOP&#160;added in the current workbench session or a stored FOP on a booking. Include the workbench identifier and the form of payment identifier in the endpoint, per the example below. The PUT&#160;request sends any of the payloads detailed here. PUT or DEL https://api.travelport.com/11/air/payment/reservationworkbench/cfa7a3a6-fefa-47e7-87a7-5c5cbde146cf/formofpayment/formOfPayment_1 For GDS only, FOP can be stored with a booking and charged later; FOP is required during ticketing if not sent during booking. FOP is not stored for a held NDC booking and should be sent only at time of ticketing. Add Multiple Forms of Payment (GDS only) For GDS only, you can add up to two FOP in either the booking or ticketing workflow by sending a Form of Payment request for each FOP. At ticketing you must send a separate Add Payment request for each FOP. The additional FOP can be any supported form of payment. Multiple FOP&#160;are supported only for bookings with a single passenger. Request As part of the request requirements, also see Authentication and Common Air API Headers . Query Parameters None. Request Body Form of Payment offers several payloads to support the type of FOP sent. The payloads on this page are supported for both the POST and PUT endpoints above. The DEL request does not send a request payload. Cash and credit card FOPs are supported for both GDS and NDC. Agent invoice and non-standard credit card FOPs&#160;are supported for GDS&#160;only. Show Request Body Table for Credit Card FOP Object Description Required/Optional FormOfPaymentPaymentCard Top-level for request. Can include FormOfPaymentRef, Identifier, PaymentCard, and ExtendedPayment objects. Required inhibitPaymentCardAuthorizationInd Boolean. Used to indicate whether a card is standard. true: Indicates payment card is non-standard. false or not sent: Indicates payment card is standard. Optional id String. Send a custom identifier for this FOP. Supports up to 256 alphanumeric characters. Required FormOfPaymentRef String. Send a custom identifier for this FOP. Supports up to 256 alphanumeric characters. Must be the same value sent in FormOfPaymentPaymentCard @id per above. Required Identifier Identifier details. Key value pairs: authority : Source of information. value : Unique system-generated identifier. Required PaymentCard Credit card details. Can include the CardType, CardCode, CardHolderName, CardNumber, SeriesCode, and Address objects. Required expireDate Expiration date of the card in MMYY format. Required CardType Type of card. String. This value must be Credit Required CardCode Two-character code for the credit card, such as VI &#160;for Visa. To use IATA Easy Pay, send CardCode with the value EP and CardNumber with the card number. The SeriesCode (CVV code), expireDate, and other details are not required. Required CardHolderName Text string for the cardholder name. Key value pair: approvalCode :&#160;Send approval code if available. Required except for Easy Pay CardNumber Top level object for the credit card number. Send with @type CardNumber. Includes PlainText. Required PlainText The credit card number. Required SeriesCode Top level object for the CVV&#160;code. The CVV&#160;code is required for an NDC itinerary. It is not used for GDS itineraries. Required for NDC except for Easy Pay PlainText The credit card three-digit CVV&#160;code. Required Address Billing address details. Includes Number, Street, AddressLine, City, StateProv, Country, and PostalCode objects. Optional Number Top level object for street number of billing address. Optional value Street number value. Optional Street Top level object for street name of billing address. Optional value Street name value. Optional AddressLine Extra address line. Optional City The city of the billing address. Optional StateProv Top level object. Optional value State or province of billing address. Optional Country Country of billing address. Optional PostalCode Postal code of billing address. Optional ExtendedPayment Sends payment details to pay in installments with this credit card. Supported for general use and for the Brazilian business practice Pagos Parcelados. For Pagos Parcelados, this form of payment must be a credit card issued in Brazil. Supported on bookings with a single passenger and a single fare quote. Also supported for an add collect when exchanging GDS tickets. The API does not validate whether the carrier accepts payment in installments, or if the credit card is eligible for Pagos Parcelados (credit card must be issued in Brazil). If you issue a ticket using installments that is not accepted, the airline sends a debit memo. In the subsequent Add Payment request, send in Amount/value the total amount of the reservation, not the amount of the first installment payment. Key value pairs: numberOfInstallments :&#160;Integer. Total number of payments to be charged to this credit card. Required whenever ExtendedPayment is sent. The following key value pairs are used only for Pagos Parcelados; all are required for Pagos Parcelados: firstInstallment : Integer, up to 2 decimal places. Amount of the first installment to be paid. Must include payment of all taxes, any OB fee amounts for the payment card and the Pay Later plan, and the first installment of the basic fare. Send in the same currency as the payment. remainingAmount : Total amount remaining to be paid after payment of the first installment. This amount will be divided equally across the remaining number of installments. Send in the same currency as the payment. otatoCode : String. Send the otato code required for this card. Optional Although the JSON APIs support cash FOP for both GDS and NDC, not all NDC&#160;carriers support cash FOP. For detailed NDC&#160;support by carrier, see the Knowledge Base article NDC capabilities by airline through JSON API (see Knowledge Base NDC&#160;Resources if you need login assistance). Show Request Body Table for Cash FOP Object Description Required/Optional FormOfPaymentCash Top level object. Required id String. Send a custom identifier for this form of payment. Supports up to 256 alphanumeric characters. Required agentNonRefundableInd AirReservation 24.11.45 and later. Boolean. Send with a value of true to indicate the payment is non-refundable; do not send if false. If sent, the workbench commit and Reservation Retrieve responses return agentNonRefundableInd with a value of true . Can send with FreeText object below to include a text description. Not supported for ticketless carriers or NDC. Optional FormOfPaymentRef String. Send a custom identifier for this form of payment. Supports up to 256 alphanumeric characters. Must be the same value sent in FormOfPaymentCash/id above. Required Identifier Top level object. Required authority For GDS content this value is Travelport . For NDC content this value is the issuing carrier's name. Required value This is a placeholder value that has no use at this time. Any text can be sent. Required FreeText AirReservation 24.11.45 and later. String, 35-character limit. Optional object to send any free text description for agentNonRefundableInd. If sent, returned in the workbench commit and Reservation Retrieve responses. Optional Show Request Body Table for Agent Invoice FOP (GDS&#160;only) Object Description Required/Optional FormOfPaymentInvoice Top level object. Required id String. Send a custom identifier for this form of payment. Supports up to 256 alphanumeric characters. Required FormOfPaymentRef String. Send a custom identifier for this form of payment. Supports up to 256 alphanumeric characters. Required Identifier Top level object. Required authority For GDS content this value is Travelport . Required value This is a placeholder value that has no use at this time. Any text can be sent. Required InvoiceNumber Agent invoice number. Required Show Request Body Table for Check FOP (GDS&#160;only) Object Description Required/Optional FormOfPaymentCheck Top level object. Required FormOfPaymentRef String. Send a custom identifier for this form of payment. Supports up to 256 alphanumeric characters. Required id String. Send a custom identifier for this form of payment. Supports up to 256 alphanumeric characters. Required Identifier Top level object. Required authority For GDS content this value is Travelport . Required value This is a placeholder value that has no use at this time. Any text can be sent. Required When exchanging a GDS ticket , you can send the FormOfPaymentForfeit Add FOP payload to forfeit residual amounts during the exchange/reissue of a ticket. In the subsequent Add Payment request, specify whether to forfeit the total residual amount, the base amount, the total taxes, or individual taxes with a tax code. Show FOP Forfeit Request Body Table Object Description Required/Optional FormOfPaymentForfeit Top level object. Key value pairs: forfeitInd: id : Send a custom identifier to use for this FOP. Required FormOfPaymentRef String. Custom identifier for form of payment. Required Identifier Identifier for request. Key value pairs: authority :&#160;Source of information. value :&#160;Custom identification string. Required When exchanging a GDS ticket , you can send the FormOfPaymentWaiverCode Add FOP payload to waive a change fee, with or without a waiver code. Waiver FOP is applied to all travelers in a reservation. Show Add FOP&#160;Waiver Request Body Table Object Description Required/Optional FormOfPaymentWaiverCode Top level object. Key value pair: id : Send a custom identifier to use for this FOP. Required FormOfPaymentRef Send the same custom identifier sent in FormOfPaymentWaiverCode/id. Required Identifier Identifier for waiver code. Key value pairs: authority :&#160;Source of information. value :&#160;Custom identifier for waiver FOP. &#160; WaiverCode Optional waiver code. Key value pair: value : The waiver code. If sent, added to the Endorsement Box in the reservation. Optional Response Show Response Body Table Object Description FormofPaymentResponse Top level object for response. Identifier Returns confirmation. For GDS content authority is Travelport ; for NDC content authority is the issuing carrier's name. identifier. The identifier in value has no subsequent use at this time. Key value pairs: authority : Source of information. value : Unique system-generated identifier. Example Request The request payload below for an NDC itinerary sends a standard credit card, which is the only FOP supported in the JSON APIs for NDC. Note that for NDC you must send the CVV&#160;code in SeriesCode. Show Example Request - Credit Card FOP { "FormOfPaymentPaymentCard": { "id": "formOfPayment_5", "FormOfPaymentRef": "formOfPayment_5", "Identifier": { "authority": "Travelport", "value": "A0656EFF-FAF4-456F-B061-0161008D6FOP" }, "PaymentCard": { "@type": "PaymentCardDetail", "id": "paymentCard_4", "expireDate": "0139", "CardType": "Credit", "CardCode": "VI", "CardHolderName": "JANE DOE", "approvalCode": "123456", "CardNumber": { "@type": "CardNumber", "PlainText": "4987654321098769" }, "SeriesCode": { "PlainText": "123" } } } } The example request payload below sends a cash FOP. Show Example Request - Cash FOP { "FormOfPaymentCash": { "id": "formOfPayment_5", "FormOfPaymentRef": "formOfPayment_5", "Identifier": { "authority": "Travelport", "value": "A0656EFF-FAF4-456F-B061-0161008D6FOP" } } } Show Example Request - Cash FOP with nonrefundable indicator { "FormOfPaymentCash" : { "id" : "formOfPayment_1", "FormOfPaymentRef" : "a111", "agentNonRefundableInd" : true, "Identifier" : { "value" : "A0656EFF-FAF4-456F-B061-0161008D7C4E", "authority" : "Travelport" }, "FreeText" : "Test for Non-Ref" } } The example request payload below sends an agent invoice as FOP. GDS only; not supported for NDC. Show Example Request - Agent invoice FOP { "FormOfPaymentInvoice": { "id": "1", "FormOfPaymentRef": "1", "Identifier": { "value": "A0656EFF-FAF4-456F-B061-0161008D6FOP", "authority": "Travelport" }, "InvoiceNumber": "34324343" } } The example request payload below sends a non-standard credit card (inhibitPaymentCardAuthorizationInd is sent as true for a CardCode value of HD ) as FOP. GDS only; not supported for NDC. Show Example Request - Non-standard credit card { "FormOfPaymentPaymentCard": { "inhibitPaymentCardAuthorizationInd": true, "id": "formOfPayment_5", "FormOfPaymentRef": "formOfPayment_5", "PaymentCard": { "@type": "PaymentCardDetail", "id": "paymentCard_4", "expireDate": "0522", "approvalCode": "Z555444", "CardType": "Credit", "CardCode": "HD", "CardHolderName": "JANE DOE", "CardNumber": { "PlainText": "9431330036187707" } } } } The example request payload below sends a check FOP. GDS only; not supported for NDC. Show Example Request - Check FOP&#160;(GDS&#160;only) { "FormOfPaymentCheck": { "FormOfPaymentRef": "formOfPayment_1", "id": "formOfPayment_1", "Identifier": { "authority": "Travelport", "value": "A0656EFF-FAF4-456F-B061-0161008D7C4E" } } } The example request payload below sends a card number for IATA Easy Pay. Show Example - IATA Easy Pay FOP { "FormOfPaymentPaymentCard": { "id": "formOfPayment_5", "FormOfPaymentRef": "formOfPayment_5", "Identifier": { "authority": "Travelport", "value": "A0656EFF-FAF4-456F-B061-0161008D6FOP" }, "PaymentCard": { "@type": "PaymentCardDetail", "expireDate": "0139", "CardType": "Credit", "CardCode": "EP", "CardNumber": { "PlainText": "xxxxxxxx00000005" } } } } When exchanging a GDS ticket , you can choose to forfeit residual amounts. Send Add FOP with the FormOfPaymentForfeit payload below. In the subsequent Add Payment request, specify whether to forfeit the total residual amount, the base amount, the total taxes, or individual taxes. Show Example Add FOP&#160;forfeit request (GDS exchange ticketing only) { "FormOfPaymentForfeit": { "forfeitInd": true, "id": "formOfPayment_5", "FormOfPaymentRef": "formOfPayment_5", "Identifier": { "authority": "Travelport", "value": "2e88da9b-f4c2-4044-8607-c7b74ba4c657" } } } When exchanging a GDS ticket , send the following payload to waive a change fee for all travelers. Show Example Add FOP&#160;for waiver request (GDS&#160;exchange ticketing only) { "FormOfPaymentWaiverCode": { "id": "formOfPayment_6", "FormOfPaymentRef": "formOfPayment_6", "Identifier": { "value": "A0656EFF-FAF4-456F-B061-0161008D7C4E", "authority": "Travelport" }, "WaiverCode": { "value": "ABC123" } } } Example Response The response to the POST request returns a confirmation identifier. The value returned has no subsequent use in the workflow at this time. A successful response for the DEL or PUT request returns a 204[No Content] message. There is no response message payload. Show Example Response { "FormOfPaymentResponse": { "Identifier": { "authority": "Travelport", "value": "558f8744-3554-4382-a1ff-3461f02e436f" } } }

## Literal `<pre>` excerpts from HTML

### Block 1

```
{
 "FormOfPaymentPaymentCard": {
  "id": "formOfPayment_5",
  "FormOfPaymentRef": "formOfPayment_5",
  "Identifier": {
   "authority": "Travelport",
   "value": "A0656EFF-FAF4-456F-B061-0161008D6FOP"
  },
  "PaymentCard": {
   "@type": "PaymentCardDetail",
   "id": "paymentCard_4",
   "expireDate": "0139",
   "CardType": "Credit",
   "CardCode": "VI",
   "CardHolderName": "JANE DOE",
   "approvalCode": "123456",
   "CardNumber": {
    "@type": "CardNumber",
    "PlainText": "4987654321098769"
   },
   "SeriesCode": {
    "PlainText": "123"
   }
  }
 }
}
```

### Block 2

```
{
    "FormOfPaymentCash": {
        "id": "formOfPayment_5",
        "FormOfPaymentRef": "formOfPayment_5",
        "Identifier": {
            "authority": "Travelport",
            "value": "A0656EFF-FAF4-456F-B061-0161008D6FOP"
        }
    }
}
```

### Block 3

```
{
  "FormOfPaymentCash" : {
    "id" : "formOfPayment_1",
    "FormOfPaymentRef" : "a111",
    "agentNonRefundableInd" : true,
    "Identifier" : {
      "value" : "A0656EFF-FAF4-456F-B061-0161008D7C4E",
      "authority" : "Travelport"
    },
    "FreeText" : "Test for Non-Ref"
  }
  }
```

### Block 4

```
{
  "FormOfPaymentInvoice": {
    "id": "1",
    "FormOfPaymentRef": "1",
    "Identifier": {
      "value": "A0656EFF-FAF4-456F-B061-0161008D6FOP",
      "authority": "Travelport"
    },
    "InvoiceNumber": "34324343"
  }
}
```

### Block 5

```
{
 "FormOfPaymentPaymentCard": {
  "inhibitPaymentCardAuthorizationInd": true,
  "id": "formOfPayment_5",
  "FormOfPaymentRef": "formOfPayment_5",
  "PaymentCard": {
   "@type": "PaymentCardDetail",
   "id": "paymentCard_4",
   "expireDate": "0522",
   "approvalCode": "Z555444",
   "CardType": "Credit",
   "CardCode": "HD",
   "CardHolderName": "JANE DOE",
   "CardNumber": {
    "PlainText": "9431330036187707"
   }
  }
 }
}
```

### Block 6

```
{
 "FormOfPaymentCheck": {
  "FormOfPaymentRef": "formOfPayment_1",
  "id": "formOfPayment_1",
  "Identifier": {
   "authority": "Travelport",
   "value": "A0656EFF-FAF4-456F-B061-0161008D7C4E"
  }
 }
}
```

### Block 7

```
{
 "FormOfPaymentPaymentCard": {
  "id": "formOfPayment_5",
  "FormOfPaymentRef": "formOfPayment_5",
  "Identifier": {
   "authority": "Travelport",
   "value": "A0656EFF-FAF4-456F-B061-0161008D6FOP"
  },
  "PaymentCard": {
   "@type": "PaymentCardDetail",
   "expireDate": "0139",
   "CardType": "Credit",
   "CardCode": "EP",
   "CardNumber": {
    "PlainText": "xxxxxxxx00000005"
   }
  }
 }
}
```

### Block 8

```
{
 "FormOfPaymentForfeit": {
  "forfeitInd": true,
  "id": "formOfPayment_5",
  "FormOfPaymentRef": "formOfPayment_5",
  "Identifier": {
   "authority": "Travelport",
   "value": "2e88da9b-f4c2-4044-8607-c7b74ba4c657"
  }
 }
}
```

### Block 9

```
{
 "FormOfPaymentWaiverCode": {
  "id": "formOfPayment_6",
  "FormOfPaymentRef": "formOfPayment_6",
  "Identifier": {
   "value": "A0656EFF-FAF4-456F-B061-0161008D7C4E",
   "authority": "Travelport"
  },
  "WaiverCode": {
   "value": "ABC123"
  }
 }
}
```

### Block 10

```
{
    "FormOfPaymentResponse": {
        "Identifier": {
            "authority": "Travelport",
            "value": "558f8744-3554-4382-a1ff-3461f02e436f"
        }
    }
}
```

