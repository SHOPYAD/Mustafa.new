# Payment API&#160;Reference

## Source

- **Local HTML:** `docs/travelport/travelport api guide/travelport-airapi json/support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/Ticketing/APIRef_AddPayment.html` (UTF-8 mirror)
- **Official base:** `https://support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/` + same relative path

## Plaintext extract (lossy)

Payment API&#160;Reference Skip To Main Content Account Settings Logout placeholder Account Settings Logout Filter: All Files Submit Search Filter: All Files Submit Search Payment API&#160;Reference Request Response Example request Example response POST paymentoffer/reservationworkbench/ {workbenchID} /payments For {workbenchID} send the workbench identifier returned in ReservationResponse/Identifer/value in the workbench create response. Base path: Pre-production https://api.pp.travelport.net/11/air/ Production https://api.travelport.net/11/air/ Related Content: Ticketing Guide The Payment step takes place in a ticketing workbench session and applies the payment sent previously in the Form of Payment request to the offer/s specified in the Payment request payload. Payment can be sent for any type of offer, including air, seats, and ancillaries. Payment can be made for multiple offers and multiple types of offers in the same request. Form of payment information must either already be present in the reservation or the workbench. At workbench commit, tickets or EMDs are issued for any offer payment has been sent for. Payment is also required prior to ticketing when exchanging tickets in the case of an even exchange, or an add collect (price of new itinerary is greater than existing itinerary). In the case of an add collect, send Payment with a zero amount in Amount/value. See the Exchange, Refund, and Void Guide for details. Request As part of the request requirements, also see Authentication and Common Air API Headers . Query Parameters None. Request Body If multiple forms of payment have been added, repeat the Payment step for each FOP. The Payment request can include multiple offer IDs, such as for the itinerary and for paid seats, but supports only one FOP. Show Request Body Table Object Description Required/Optional Payment Top level object. Includes Amount, FormOfPaymentIdentifier, OfferIdentifier, TravelerIdentierRef objects. For exchange ticketing only, may includes Fees and/or Taxes objects. Required id A user-assigned identifier for the payment. Supports up to 256 alphanumeric characters. Required Payment/ Identifier Payment identifier. Required authority For both GDS and NDC send with the value Travelport . Required value This is a placeholder value that has no use at this time. Any text can be sent. Required Amount Top level object for amount of payment. When exchanging a GDS ticket , do not send Amount here when choosing to forfeit residual amounts during the exchange; see below. Required code Currency code that applies to the payment. Required minorUnit The smallest unit of currency for the currency in code . For example; the smallest denomination in USD is the cent, which is 1/100 of a USD, and the minor unit value is 2 . Not all currencies have a minor unit. Required Optional for exchange ticketing currencySource Enum. The system requesting or returning the currency code. Supported values are Supplier , Charged , Requested . Required Optional for exchange ticketing value The amount of the charge for this payment, in the currency noted in the code object. When exchanging a GDS ticket , in the case of even exchange or a refund for the exchanged itinerary, send Add Payment with Amount/value with 0 (zero). Required FormOfPaymentIdentifier Top level object for FOP&#160;to reference. Required id The id for the form of payment to be charged. Must match to a FOP already in the reservation or added to the workbench. Required FormOfPaymentRef The id for the form of payment to use. Must be the same value sent in FormOfPaymentRef in the Add FOP request . Must also match the value sent above in FormOfPaymentIdentifier/id. Required FormOfPaymentIdentifier/ Identifier Send the payment identifier returned in the Add Form of Payment response. Required authority Send with the value Travelport . Required value This is a placeholder value that has no use at this time. Any text can be sent. Required OfferIdentifier Top level object for the offer/s to send payment for. If the booking contains multiple offers, send an instance of OfferIdentifier for all offers you are ready to ticket or issue an EMD&#160;for. For example, a booking could contain multiple offers for any of the following: air and one or more ancillaries or paid seats multiple air offers air and/or hotel and car offers (as support for multi-content bookings is developed) Includes Identifier object. Required id Id for the offer to which this payment should apply. Required offerRef Id for the offer to which this payment should apply. Same value as sent in id . See above note for id and multiple offers. Required OfferIdentifier/ Identifier &#160; Required authority Send with the value Travelport for all content. Required value The system-generated offer identifier returned in the applicable Search, Seats, Ancillary etc. response. Required Fees Used only when exchanging a GDS ticket to add payment for change fees or other fees. When sending only one Add Payment request for both an add collect and fees, using the same FOP for both, send both Amount/value above and Fees/Total Fees in the same request. To use multiple FOP , send one Add Payment request for the add collect (Amount/value), and another Add Payment request for the fees, each referring to the separate FOP to use. Standard Fees object: @type :&#160;String. Send with Fees . TotalFees :&#160;Send the total amount of the fees to pay for. Optional, used only for exchange ticketing TravelerIdentifierRef Array. Send only when exchanging a GDS ticket to specify the traveler in case of multiple FOPs, or to forfeit residual amounts for only specific traveler/s. If not sent, the forfeit is applied to all travelers on the reservation. Standard TravelerIdentifierRef object: passengerTypeCode : String. IATA PTC code for this traveler. id : String. Traveler short id. Optional, used only for exchange ticketing Amount or BaseAmount or Taxes Send only when exchanging a GDS ticket to forfeit residual amounts during the exchange. To forfeit residual amounts, send Add FOP with the FormOfPaymentForfeit payload. In the Add Payment request, send the identifier for the forfeit FOP in FormOfPaymentIdentifier above. Do not send the Amount object above; instead, send one and only one of the following objects at the end of the payload as appropriate to identify the amount to forfeit: Forfeit the total residual amount: Amount object, example: "Amount": { "code": "USD", "value": 863.40 } Forfeit the base amount: BaseAmount object, example: "BaseAmount": { "code": "USD", "value": 123.45 } } Forfeit the total tax amount: Taxes object with TotalTaxes, example: "Taxes": { "@type": "TaxesDetail", "TotalTaxes": 23.0 } Forfeit an Individual tax: Taxes object with individual Tax object, example: "Taxes": { "@type": "TaxesDetail", "Tax": [ { "currencyCode": "USD", "taxCode": "YQ", "value": 34 } ] } To forfeit for only specific traveler/s, also send TravelerIdentifierRef per above. If no traveler ID/s are sent, the forfeit is automatically applied to all travelers in a reservation Optional, used only for exchange ticketing to forfeit amounts Response Show Response Body Table Object Description PaymentResponse Top level object for response. Payment Includes Identifier object. Identifier Returns confirmation identifier. authority: For GDS content this value is Travelport . For NDC content this value is the issuing carrier's name. value: Confirmation identifier. This identifier has no subsequent use at this time. Example Request Show Example Payment request for air offer { "Payment": { "id": "payment_1", "Identifier": { "authority": "Travelport", "value": "A0656EFF-FAF4-456F-B061-0161008D6A5E" }, "Amount": { "code": "USD", "minorUnit": 2, "currencySource": "Charged", "approximateInd": true, "value": "2773.5" }, "FormOfPaymentIdentifier": { "id": "formOfPayment_5", "FormOfPaymentRef": "formOfPayment_5", "Identifier": { "authority": "Travelport", "value": "A0656EFF-FAF4-456F-B061-0161008D6FOP" } }, "OfferIdentifier": [ { "id": "offer_1", "offerRef": "offer_1", "Identifier": { "authority": "Travelport", "value": "4ac0a1d8-fd2a-4192-83f5-cab69979ef4e" } } ] } } To issue the ticket and an EMD&#160;for a paid seat or ancillary, send all applicable offer IDs per this example. Show Example Add Payment request for air and&#160;ancillary offera In this example, offer_1 is the itinerary and an_o1 is the ancillary offer. { "Payment": { "id": "payment_1", "Identifier": { "authority": "Travelport", "value": "A0656EFF-FAF4-456F-B061-0161008D6A5E" }, "Amount": { "code": "AUD", "minorUnit": 2, "currencySource": "Charged", "approximateInd": true, "value": 63.1 }, "FormOfPaymentIdentifier": { "id": "formOfPayment_5", "FormOfPaymentRef": "formOfPayment_5", "Identifier": { "authority": "Travelport", "value": "A0656EFF-FAF4-456F-B061-0161008D6FOP" } }, "OfferIdentifier": [ { "id": "offer_1", "offerRef": "offer_1", "Identifier": { "authority": "Travelport", "value": "07664bb3-37a0-4c63-a2ef-ed71b5f48d49" } }, { "id": "an_o1", "Identifier": { "authority": "Travelport", "value": "3427d42c-a72d-49ff-b29e-7bb8faa28a47" } } ] } } When exchanging a GDS ticket , you can choose to forfeit residual amounts. Send Add FOP with the FormOfPaymentForfeit payload. In the Add Payment request, per the examples below, specify what to forfeit. Show Example Add Payment request to forfeit the total residual amount (GDS exchange ticketing only) The following example shows the Add Payment payload to forfeit all residual amounts from a GDS ticket exchange. { "Payment": { "id": "payment_3", "Identifier": { "authority": "Travelport", "value": "A0656EFF-FAF4-456F-B061-0161008D6A5E" }, "FormOfPaymentIdentifier": { "id": "formOfPayment_1", "FormOfPaymentRef": "formOfPayment_1", "Identifier": { "authority": "Travelport", "value": "a26164ec-02b8-41ef-af61-a837a76d5adb" } }, "OfferIdentifier": [ { "id": "offer_1", "offerRef": "offer_1", "Identifier": { "authority": "Travelport", "value": "58100d86-b984-432b-82eb-c7286c061193" } } ], "Amount": { "code": "USD", "value": 863.4 } } } Show Example Add Payment request to forfeit individual tax (GDS exchange ticketing only) The following example shows the Add Payment payload to forfeit one individual tax. { "Payment": { "id": "payment_2", "Identifier": { "authority": "Travelport", "value": "A0656EFF-FAF4-456F-B061-0161008D6A5E" }, "FormOfPaymentIdentifier": { "id": "formOfPayment_1", "FormOfPaymentRef": "formOfPayment_1", "Identifier": { "authority": "Travelport", "value": "a26164ec-02b8-41ef-af61-a837a76d5adb" } }, "OfferIdentifier": [ { "id": "offerModify_1", "offerRef": "offerModify_1", "Identifier": { "authority": "Travelport", "value": "58100d86-b984-432b-82eb-c7286c061193" } } ], "Taxes": { "@type": "TaxesDetail", "Tax": [ { "currencyCode": "USD", "taxCode": "YQ", "value": 34 } ] } } } Example Response The response returns a confirmation identifier. Show Example Response { "PaymentResponse": { "Payment": { "@type": "PaymentIdentifier", "Identifier": { "authority": "Travelport", "value": "af076693-cfc3-49f3-b7d6-554aa9d8bfce" } } } }

## Literal `<pre>` excerpts from HTML

### Block 1

```
{
 "Payment": {
  "id": "payment_1",
  "Identifier": {
   "authority": "Travelport",
   "value": "A0656EFF-FAF4-456F-B061-0161008D6A5E"
  },
  "Amount": {
   "code": "USD",
   "minorUnit": 2,
   "currencySource": "Charged",
   "approximateInd": true,
   "value": "2773.5"
  },
  "FormOfPaymentIdentifier": {
   "id": "formOfPayment_5", 
   "FormOfPaymentRef": "formOfPayment_5", 
   "Identifier": {
    "authority": "Travelport",
    "value": "A0656EFF-FAF4-456F-B061-0161008D6FOP" 
   }
  },
  "OfferIdentifier": [
   {
    "id": "offer_1",
    "offerRef": "offer_1",
    "Identifier": {
     "authority": "Travelport",
     "value": "4ac0a1d8-fd2a-4192-83f5-cab69979ef4e"
    }
   }
  ]
 }
}
```

### Block 2

```
{
 "Payment": {
  "id": "payment_1",
  "Identifier": {
   "authority": "Travelport",
   "value": "A0656EFF-FAF4-456F-B061-0161008D6A5E"
  },
  "Amount": {
   "code": "AUD",
   "minorUnit": 2,
   "currencySource": "Charged",
   "approximateInd": true,
   "value": 63.1
  },
  "FormOfPaymentIdentifier": {
   "id": "formOfPayment_5",
   "FormOfPaymentRef": "formOfPayment_5",
   "Identifier": {
    "authority": "Travelport",
    "value": "A0656EFF-FAF4-456F-B061-0161008D6FOP"
   }
  },
  "OfferIdentifier": [
   {
    "id": "offer_1",
    "offerRef": "offer_1",
    "Identifier": {
     "authority": "Travelport",
     "value": "07664bb3-37a0-4c63-a2ef-ed71b5f48d49"
    }
   },
   {
    "id": "an_o1",
    "Identifier": {
     "authority": "Travelport",
     "value": "3427d42c-a72d-49ff-b29e-7bb8faa28a47"
    }
   }
  ]
 }
}
```

### Block 3

```
{
 "Payment": {
  "id": "payment_3",
  "Identifier": {
   "authority": "Travelport",
   "value": "A0656EFF-FAF4-456F-B061-0161008D6A5E"
  },
  "FormOfPaymentIdentifier": {
   "id": "formOfPayment_1",
   "FormOfPaymentRef": "formOfPayment_1",
   "Identifier": {
    "authority": "Travelport",
    "value": "a26164ec-02b8-41ef-af61-a837a76d5adb"
   }
  },
  "OfferIdentifier": [
   {
    "id": "offer_1",
    "offerRef": "offer_1",
    "Identifier": {
     "authority": "Travelport",
     "value": "58100d86-b984-432b-82eb-c7286c061193"
    }
   }
  ],
  "Amount": {
   "code": "USD",
   "value": 863.4
  }
 }
}
```

### Block 4

```
{
 "Payment": {
  "id": "payment_2",
  "Identifier": {
   "authority": "Travelport",
   "value": "A0656EFF-FAF4-456F-B061-0161008D6A5E"
  },
  "FormOfPaymentIdentifier": {
   "id": "formOfPayment_1",
   "FormOfPaymentRef": "formOfPayment_1",
   "Identifier": {
    "authority": "Travelport",
    "value": "a26164ec-02b8-41ef-af61-a837a76d5adb"
   }
  },
  "OfferIdentifier": [
   {
    "id": "offerModify_1",
    "offerRef": "offerModify_1",
    "Identifier": {
     "authority": "Travelport",
     "value": "58100d86-b984-432b-82eb-c7286c061193"
    }
   }
  ],
  "Taxes": {
   "@type": "TaxesDetail",
   "Tax": [
    {
     "currencyCode": "USD",
     "taxCode": "YQ",
     "value": 34
    }
   ]
  }
 }
}
```

### Block 5

```
{
    "PaymentResponse": {
        "Payment": {
            "@type": "PaymentIdentifier",
            "Identifier": {
                "authority": "Travelport",
                "value": "af076693-cfc3-49f3-b7d6-554aa9d8bfce"
            }
        }
    }
}
```

