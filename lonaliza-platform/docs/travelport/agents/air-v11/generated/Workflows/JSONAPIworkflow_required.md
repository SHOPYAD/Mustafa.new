# JSON APIs Required Full Workflow

## Source

- **Local HTML:** `docs/travelport/travelport api guide/travelport-airapi json/support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/Workflows/JSONAPIworkflow_required.html` (UTF-8 mirror)
- **Official base:** `https://support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/` + same relative path

## Plaintext extract (lossy)

JSON APIs Required Full Workflow Skip To Main Content Account Settings Logout placeholder Account Settings Logout Filter: All Files Submit Search Filter: All Files Submit Search JSON APIs Required Full Workflow The following diagram shows the API requests in the minimum required workflow to ticket a flight in the JSON&#160;APIs. Also see JSON &#160;APIs Full Workflow with Optional Steps and All Book and Ticketing Workflows for additional options. Each box in the diagram represents one API call in the workflow. Related Content: JSON Air APIs Guide , Air Search Guide , Booking Guide , Ticketing Guide Note that the above Air APIs workflow uses reference payload requests, which send identifiers to select an offer from previous&#160;API responses. Optionally, you can send the AirPrice full payload request and omit the Search request, or send an Add Offer full payload request and omit the Search and AirPrice requests. This allows you to source your flights outside the JSON APIs and skip these steps of the JSON workflow.

