# Batch Void API&#160;Reference

## Source

- **Local HTML:** `docs/travelport/travelport api guide/travelport-airapi json/support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/Ticketing/APIRef_BatchVoid.html` (UTF-8 mirror)
- **Official base:** `https://support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/` + same relative path

## Plaintext extract (lossy)

Batch Void API&#160;Reference Skip To Main Content Account Settings Logout placeholder Account Settings Logout Filter: All Files Submit Search Filter: All Files Submit Search Batch Void API&#160;Reference Request Response Example request Example response POST documents/void Base path: The base path for this API varies from that for other JSON &#160; Air APIs and does not include air at the end. Pre-production https://api.pp.travelport.net/11/ Production https://api.travelport.net/11/ Related Content: Exchange, Refund, and Void Guide The Batch Void API voids multiple tickets or documents, including EMDs Electronic miscellaneous document (EMD); issued for a paid seat, ancillary, or any other paid service after successful payment. See the Ancillary and EMD Guide. and MCOs Miscellaneous change order (MCO); can be created when an exchanged ticket has residual value after the exchange. , on a single booking. You can either void all documents of a specific type (ticket, EMD, or MCO), or send a list of individual ticket or document numbers to void. All tickets and/or documents must be on the same booking. Not supported for NDC, see Exchange, Refund, and Void Guide for NDC. Request As part of the request requirements, also see Authentication and Common Air API Headers . Query Parameters None. Request Body Show Request Body Table Object Description Required/Optional locator Locator code of the booking with the document/s to void. Key value pair: value : Booking locator code Required documentVoid Array. Required documentType The document type to void. To void all documents of a specific type, send only documentType without number. Supported values are: Ticket EMD MCO &#160; number The document or ticket number to void. If not sent, all documents of the type sent in documentType are voided. Optional Response Show Response Body Table Object Description DocumentVoidListResponse Top level object. Includes Result, Identifier, and documentStatus. Result Returns transaction result in the status object. Identifier Standard Travelport identifier for the response. authority : Source of information. value : Unique system-generated identifier. documentStatus Array. One instance for each document voided. Key value pairs: documentType: Type of document: Ticket, EMD, or MCO. number: Ticket or document number. status: Status of void request for this document. Example Request For additional examples, download the developer toolkits and see Using Postman and Developer Toolkits . Show Example Request { "locator": { "value": "D74QB5" }, "documentVoid": [ { "documentType": "Ticket", "number": [ "0019905447250" ] }, { "documentType": "Ticket", "number": [ "0019905447251" ] }, { "documentType": "Ticket", "number": [ "0019905447252" ] } ] } Example Response For additional examples, download the developer toolkits and see Using Postman and Developer Toolkits . Show Example Response { "DocumentVoidListResponse": { "@type": "DocumentVoidListResponse", "Result": { "@type": "Result", "status": "Complete" }, "Identifier": { "value": "0156e157-c426-473b-bf83-c58bd2df807d", "authority": "TVPT" }, "documentStatus": [ { "documentType": "Ticket", "number": "0019905447250", "status": "VOID" }, { "documentType": "Ticket", "number": "0019905447251", "status": "VOID" }, { "documentType": "Ticket", "number": "0019905447252", "status": "VOID" } ] } }

## Literal `<pre>` excerpts from HTML

### Block 1

```
{
 "locator": {
  "value": "D74QB5"
 },
 "documentVoid": [
  {
   "documentType": "Ticket",
   "number": [
    "0019905447250"
   ]
  },
  {
   "documentType": "Ticket",
   "number": [
    "0019905447251"
   ]
  },
  {
   "documentType": "Ticket",
   "number": [
    "0019905447252"
   ]
  }
 ]
}
```

### Block 2

```
{
 "DocumentVoidListResponse": {
  "@type": "DocumentVoidListResponse",
  "Result": {
   "@type": "Result",
   "status": "Complete"
  },
  "Identifier": {
   "value": "0156e157-c426-473b-bf83-c58bd2df807d",
   "authority": "TVPT"
  },
  "documentStatus": [
   {
    "documentType": "Ticket",
    "number": "0019905447250",
    "status": "VOID"
   },
   {
    "documentType": "Ticket",
    "number": "0019905447251",
    "status": "VOID"
   },
   {
    "documentType": "Ticket",
    "number": "0019905447252",
    "status": "VOID"
   }
  ]
 }
}
```

