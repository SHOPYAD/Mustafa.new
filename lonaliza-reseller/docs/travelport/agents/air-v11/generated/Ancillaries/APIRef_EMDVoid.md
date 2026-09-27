# EMD Refund &amp; Void API&#160;Reference

## Source

- **Local HTML:** `docs/travelport/travelport api guide/travelport-airapi json/support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/Ancillaries/APIRef_EMDVoid.html` (UTF-8 mirror)
- **Official base:** `https://support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/` + same relative path

## Plaintext extract (lossy)

EMD Refund &amp; Void API&#160;Reference Skip To Main Content Account Settings Logout placeholder Account Settings Logout Filter: All Files Submit Search Filter: All Files Submit Search EMD Refund &amp; Void API&#160;Reference Request Response Example request Example response Put emds/ {EMDNumber} Base path: Pre-production https://api.pp.travelport.net/11/air/ Production https://api.travelport.net/11/air/ Related Content: Ancillary and EMD&#160;Guide , EMD&#160;Display API&#160;Reference Void an EMD to cancel it. You can also use EMD&#160;void with the GDS&#160;exchange APIs to refund an EMD&#160;back to the original FOP. See the Exchange, Refund, and Void Guide . EMD&#160;Void not supported for NDC. Voiding an EMD&#160;for NDC requires voiding the booking. Request As part of the request requirements, also see Authentication and Common Air API Headers . Query Parameters None. Request Body Show EMD&#160;Void Request Body Table Object Description Required/Optional EMDQueryUpdateEMD Empty top level object. Required status Supported values: REFUND: Voids the EMD and refunds the value to the original FOP. VOID: Voids the EMD and forfeits any residual value. Required Response Show EMD&#160;Void Response Body Table Object Description EMDListResponse Empty top level object. Result Returns messages about transaction. Key value pair: status : Status of transaction. Example Request Show Example EMD&#160;Display VOID Request The message payload sends a blank EMDQueryUpdateEMD object. { "EMDQueryUpdateEMD" : { } } Example Response Show Example EMD&#160;void response The EMD void returns the following response when successful. { "EMDListResponse": { "Result": { "status": "Complete" } } } When a voided EMD is retrieved using the EMD&#160;Display request , the EMDSegment/Status is Void , per the example below. Show Example EMD&#160;Display Response excerpt for voided EMD ... "EMDSegment": [ { "EMDDescription": { "code": "A", "subCode": "0B5", "codeContext": "IATA", "value": "Air transportation" }, "Amount": { "CurrencyCode": { "value": "AUD" }, "Total": 26.36 }, "Status": "Void", "PresentTo": "VA/VIRGIN AUSTRALIA INTERNATIONAL", "PresentAt": "MEL/MELBOURNE" } ], ...

## Literal `<pre>` excerpts from HTML

### Block 1

```
{
  "EMDQueryUpdateEMD" : {
   
  }
}
```

### Block 2

```
{
  "EMDListResponse": {
    "Result": {
      "status": "Complete"
    }
  }
}
```

### Block 3

```
...
    "EMDSegment": [
     {
      "EMDDescription": {
       "code": "A",
       "subCode": "0B5",
       "codeContext": "IATA",
       "value": "Air transportation"
      },
      "Amount": {
       "CurrencyCode": {
        "value": "AUD"
       },
       "Total": 26.36
      },
      "Status": "Void",
      "PresentTo": "VA/VIRGIN AUSTRALIA INTERNATIONAL",
      "PresentAt": "MEL/MELBOURNE"
     }
    ],
...
```

