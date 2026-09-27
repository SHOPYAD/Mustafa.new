# Reservation&#160;Cancel API&#160;Reference (GDS)

## Source

- **Local HTML:** `docs/travelport/travelport api guide/travelport-airapi json/support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/Book/APIRef_ReservationCancelGDS.html` (UTF-8 mirror)
- **Official base:** `https://support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/` + same relative path

## Plaintext extract (lossy)

Reservation&#160;Cancel API&#160;Reference (GDS) Skip To Main Content Account Settings Logout placeholder Account Settings Logout Filter: All Files Submit Search Filter: All Files Submit Search Reservation&#160;Cancel API&#160;Reference (GDS) Request Response Example request Example response POST receipt/reservations/ {LocatorCode} /receipts For {LocatorCode} &#160;send the locator code returned at booking commit or in Reservation Retrieve in Receipt/Confirmation/Locator/value. Base path: Pre-production https://api.pp.travelport.net/11/air/ Production https://api.travelport.net/11/air/ Related Content: Booking Guide , Reservation Retrieve Guide Canceling a GDS reservation requires a single cancel request as detailed here. A reservation is a held booking that has not been ticketed. Alternately, you can use Cancel Workbench Items to cancel the booking, which requires a flow with workbench create and a workbench commit instead of a single call. To cancel an NDC reservation, see the Cancel&#160;API&#160;Reference (NDC) . Request As part of the request requirements, also see Authentication and Common Air API Headers . Query Parameters None. Request Body To cancel a reservation, send a POST request that includes the reservation&#160;to cancel to the endpoint above. There is no message payload. Response Show Response Body Table Object Description ReceiptListResponse Top level object for response. Includes ReceiptID object. ReceiptID Top level object for cancellation details. Key value pair: id: &#160;Internal identifier. Identifier Identifier details for this transaction. In this case, authority is always Travelport and value provides a system-generated internal idnetifier for the response. Key value pairs. authority : Source of information. value : Unique system-generated identifier. Cancellation Top level object for cancellation details. type: Cancellation status. Includes the Locator object. Locator Cancellation details of the canceled itinerary in the following key value pairs: type: Cancellation status. source: &#160;Provider on which the reservation&#160;was created; for GDS this value is 1G . sourceContext : For GDS always returns the value Travelport . value: &#160;The reservation&#160;locator code of the canceled reservation. Example Request There is no message payload. Example Response Show Example GDS reservation&#160;Cancel Response { "ReceiptListResponse": { "ReceiptID": [ { "@type": "ReceiptCancellation", "id": "receipt_1", "Identifier": { "authority": "Travelport", "value": "bae9f140-ff5e-4685-b72f-70a6ef9beedd" }, "Cancellation": { "@type": "CancellationHold", "Locator": { "locatorType": "Locator", "source": "1G", "sourceContext": "Travelport", "value": "0GM4S1" } } } ] } }

## Literal `<pre>` excerpts from HTML

### Block 1

```
{
    "ReceiptListResponse": {
        "ReceiptID": [
            {
                "@type": "ReceiptCancellation",
                "id": "receipt_1",
                "Identifier": {
                    "authority": "Travelport",
                    "value": "bae9f140-ff5e-4685-b72f-70a6ef9beedd"
                },
                "Cancellation": {
                    "@type": "CancellationHold",
                    "Locator": {
                        "locatorType": "Locator",
                        "source": "1G",
                        "sourceContext": "Travelport",
                        "value": "0GM4S1"
                    }
                }
            }
        ]
    }
}
```

