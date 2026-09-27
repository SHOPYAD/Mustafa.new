# NDC&#160;Exchange and Refund Workflows

## Source

- **Local HTML:** `docs/travelport/travelport api guide/travelport-airapi json/support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/Workflows/NDCExchangeRefund_workflow.html` (UTF-8 mirror)
- **Official base:** `https://support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/` + same relative path

## Plaintext extract (lossy)

NDC&#160;Exchange and Refund Workflows Skip To Main Content Account Settings Logout placeholder Account Settings Logout Filter: All Files Submit Search Filter: All Files Submit Search NDC&#160;Exchange and Refund Workflows Exchange and refund functionality for NDC bookings and tickets is handled by a set of NDC-specific APIs. Use the first workflow to update the air itinerary on a booking, or exchange a ticket for another itinerary. Use the second workflow to cancel tickets and issue a refund if eligible. Each box in the diagram represents one API call in the workflow. Related Content: Exchange, Refund, and Void Guide In the first workflow below, form of payment and payment are required before ticketing in the case of an even exchange or add collect (price of new itinerary is greater than existing itinerary). Some NDC carriers require tickets to be issued at commit while others support booking now and sending payment later. To issue the new tickets at commit, send the Form of Payment and Payment requests before Modify. To hold the booking, do not send FOP or payment information in this workbench.

