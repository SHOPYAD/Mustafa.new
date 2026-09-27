# Transaction and Trace IDs

## Source

- **Local HTML:** `docs/travelport/travelport api guide/travelport-airapi json/support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/General/TraceIDs.html` (UTF-8 mirror)
- **Official base:** `https://support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/` + same relative path

## Plaintext extract (lossy)

Transaction and Trace IDs Skip To Main Content Account Settings Logout placeholder Account Settings Logout Filter: All Files Submit Search Filter: All Files Submit Search Transaction and Trace IDs The JSON Air APIs support transaction and trace IDs for both GDS and NDC content. These IDs can be used to assist in tracking and troubleshooting if you need Support Options . Tracking IDs in the Request The JSON APIs support two separate tracking IDs, one issued by Travelport by default ( transactionId ) and another that customers can send by choice ( traceId ). The traceId is sent in the message request header, and both transactionId and traceId are returned in the response header and/or response payload depending on transaction type. transactionId is unique to a single transaction and returned in most APIs. Note that the header may be titled e2etrackingid instead of transactionId. See the table below. When returned, the response payload object is always transactionId. traceId is returned only if sent by the customer. Can be sent in all transaction types to add the same common identifier to all transactions in a workflow. Do not confuse traceId with the Open Telemetry TraceId header. Show table for transactionId and e2etrackingid This table lists whether the Travelport-issued tracking ID is returned in the response header as e2etrackingid or transactionid, and whether returned in the response payload, always as transactionid. N/A means transactionId is not returned in the response payload. This list is not inclusive of all JSON APIs. API Response header Response payload Search e2etrackingid transactionId AirPrice reference payload e2etrackingid N/A Create Workbench transactionid N/A Add Offer reference payload transactionid N/A Add Traveler transactionid N/A Pre-commit workbench retrieve transactionid N/A Seat map in workbench e2etrackingid N/A Seat Book transactionid transactionId Ancillary Shop e2etrackingid transactionId Ancillary Price e2etrackingid transactionId Ancillary Book transactionid transactionId Add remarks (reservation comments) transactionid N/A Accounting remarks transactionid N/A Primary contact remarks transactionid N/A Special services list remarks transactionid N/A Profile move transactionid N/A Traveler updatable item transactionid transactionId Traveler update transactionid N/A Workbench Commit transactionid N/A Reservation retrieve transactionid N/A Fare rules e2etrackingid transactionId Post commit workbench transactionid N/A Add form of payment transactionid N/A Add payment transactionid N/A Exchange Search transactionid N/A Exchange Eligibility transactionid N/A For more about headers, see Common Air API Headers . Do not change the TraceID value in subsequent transactions in the same flow, such as between transactions in the same workbench session. For example, don't send a value of ABC in the header of the request to establish a workbench and then change that value to 123 when you add an offer. Show Example request headers with traceId Accept: application/json Content-Type: application/json XAUTH_TRAVELPORT_ACCESSGROUP: 36CFECCB-9A27-4A78-8B4D-7272F3830C20 Accept-Version: 11 Content-Version: 11 taxBreakDown: true traceId: TVP123 Authorization: Bearer eyJhbGciOiJkaXIiLCJlbmMiOiJBMTI4Q0JDLUhTMjU2IiwianRpIjoibXN2cmF2aGswYWs2In0..QqiW_TNK0GbMcM6s-.. User-Agent: PostmanRuntime/7.43.4 Cache-Control: no-cache Postman-Token: 858b12bb-10de-4489-b2da-a993957bb041 Host: api.pp.travelport.com Accept-Encoding: gzip, deflate, br Connection: keep-alive Cookie: akaalb_API_PP=1746738460~op=SEARCHPLUS_API_PP:searchplus_apim-direct_zu2_pp|~rv=96~m=searchplus_apim-direct_zu2_pp:0|~os=70385e00aec375405facb619cb3d7c12~id=9583fc9cc010cb848fe55df8c362e441 Tracking IDs in the Response All JSON API responses return the system-generated transaction ID. Most responses return the ID&#160;in the transactionId object in the first object of the response payload (object name varies by API) and in the e2etrackingid field in the response header, although some APIs return it only in the header. If you send a trace ID in the header, the response returns that ID. Most responses return a traceId object with your traceID value in the first object in the response payload and in the TraceID field in the response header, although some APIs return it only in the header. If you do not send a trace ID, traceId is not returned. The following example shows the transaction and trace IDs as returned in the headers and response payloads of different APIs. Depending on the API, the transactionId is returned in a response header titled either transactionid or e2etrackingid .In the response payload, the transactionId is always returned in the transactionId object. Show Example response headers with transactionId returned in e2etrackingid Content-Type: application/json content-version: 11 e2etrackingid: 7f665ede-abde-4fe7-b8b7-54fa153f6246 Content-Encoding: gzip Content-Length: 6243 Date: Thu, 08 May 2025 20:53:59 GMT Connection: keep-alive Vary: Accept-Encoding Server-Timing: cdn-cache; desc=MISS Server-Timing: edge; dur=237 Server-Timing: origin; dur=2167 Server-Timing: ak_p; desc="1746737637123_389073145_527038739_239945_27908_2_16_-";dur=1 Akamai-GRN: 0.f9c83017.1746737637.1f69f913 Show Example payload response excerpts with transactionId only { "CatalogProductOfferingsResponse": { "@type": "CatalogProductOfferingsResponse", "transactionId": "452a28d3-67d8-4c77-a867-b1d0fdece7d5", &#160; { "OfferListResponse": { "@type": "OfferListResponse", "transactionId": "aeac4215-fffa-a8fc-d5f3-ad09b4e5a13d:ppn", Show Example response headers with both transactionId and traceId Content-Type: application/json transactionid: 765c0565-a436-473e-9f16-462bbe95a1e0 traceid: TVP123 content-version: 11 Content-Encoding: gzip Content-Length: 1249 Date: Thu, 08 May 2025 21:10:34 GMT Connection: keep-alive Vary: Accept-Encoding Server-Timing: cdn-cache; desc=MISS Server-Timing: edge; dur=8 Server-Timing: origin; dur=3212 Server-Timing: ak_p; desc="1746738631175_389073145_528121150_321427_22640_7_3_-";dur=1 Akamai-GRN: 0.f9c83017.1746738631.1f7a7d3e Show Example payload response excerpts with transactionId and traceId { "CatalogProductOfferingsResponse": { "@type": "CatalogProductOfferingsResponse", "transactionId": "7f665ede-abde-4fe7-b8b7-54fa153f6246", "traceId": "TVP123", "CatalogProductOfferings": { "@type": "CatalogProductOfferings", "Identifier": { "value": "1a763955-d784-431f-89c1-4de207f9db44" }, &#160; { "CatalogOfferingsAncillaryListResponse": { "@type": "CatalogOfferingsAncillaryListResponse", "transactionId": "5085fef3-c0b3-4c15-86e1-2e7bc80b23cb", "traceId": "38168bbf-c8b7-4171-866a-8f3d22e2dc61", &#160; { "ReservationResponse": { "@type": "ReservationResponse", "transactionId": "a1c2e9da-1deb-4c82-bb22-746994f468c4", "traceId": "18717099-fa41-4452-b75b-54a7eaddfa8b", &#160;

## Literal `<pre>` excerpts from HTML

### Block 1

```
{
    "CatalogProductOfferingsResponse": {
        "@type": "CatalogProductOfferingsResponse",
        "transactionId": "452a28d3-67d8-4c77-a867-b1d0fdece7d5",
```

### Block 2

```
{
    "OfferListResponse": {
        "@type": "OfferListResponse",
        "transactionId": "aeac4215-fffa-a8fc-d5f3-ad09b4e5a13d:ppn",
```

### Block 3

```
{
    "CatalogProductOfferingsResponse": {
        "@type": "CatalogProductOfferingsResponse",
        "transactionId": "7f665ede-abde-4fe7-b8b7-54fa153f6246",
        "traceId": "TVP123",
        "CatalogProductOfferings": {
            "@type": "CatalogProductOfferings",
            "Identifier": {
                "value": "1a763955-d784-431f-89c1-4de207f9db44"
            },
```

### Block 4

```
{
    "CatalogOfferingsAncillaryListResponse": {
        "@type": "CatalogOfferingsAncillaryListResponse",
        "transactionId": "5085fef3-c0b3-4c15-86e1-2e7bc80b23cb",
        "traceId": "38168bbf-c8b7-4171-866a-8f3d22e2dc61",
```

### Block 5

```
{
    "ReservationResponse": {
        "@type": "ReservationResponse",
        "transactionId": "a1c2e9da-1deb-4c82-bb22-746994f468c4",
        "traceId": "18717099-fa41-4452-b75b-54a7eaddfa8b",
```

