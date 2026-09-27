# PKFARE Flight Buyer API Documentation Structure

## Main Sections Found:

1. **Guides**
   - Quick Start (current page)
   - Tricks for Playing with PKFARE API
   - Book air tickets with ancillaries
   - Raise refund requests
   - Raise change requests
   - Receive flight rescheduled notification
   - Add Paid Bags after the Booking

2. **API Reference**

3. **Development Instructions**

4. **Notice**

## Current Page: Quick Start
- Contains API Interaction Workflow diagram
- Basic setup instructions
- Prerequisites for using PKFARE API

## Next Steps:
- Navigate through all sections systematically
- Extract content from each page
- Organize into proper Markdown structure



## Tricks for Playing with PKFARE API
- How to use booking code wisely
- How to improve Shopping responding time
- How to manage price change
- How to use orderDetail APIs wisely
- How to avoid duplicate booking
- How to avoid retriving PNR failure
- How to optimize buyer’s cache and reduce pricing verification failures



## Book air tickets with ancillaries
- Overview
- Search for flights
- Select a flight solution and an ancillary
- Create an order
- Pay the order
- Notify customers of airPNR and ticket numbers



## Raise refund requests
- Overview
- Voluntary Refund Procedure
- RefundPricing Request
- RefundPricing Response
- UploadAttachmentFile Request
- UploadAttachmentFile Response
- checkRefundPricing Request
- checkRefundPricing Response
- Refund Request
- Refund Request (duplicate heading, will fix later)
- RefundReqeust Response
- Refund status
- CheckRefund Request
- CheckRefund Response
- RefundResultNotify Request
- RefundResultNotify Response
- CheckReimbursed Request
- CheckReimbursed Response
- ReimbursedResultNotify Request
- ReimbursedResultNotify Response
- DownloadAttachmentFile Request
- DownloadAttachmentFile Response
- Involuntary Refund Procedure



## Raise change requests
- Overview
- Voluntary Change Procedure
- ChangeReshop Request
- ChangeReshop Response
- Change Request
- Change Response
- Check Order status and change amount
- OrderDetail Request
- OrderDetail Response
- Pre-check before payment
- OrderPricing Request
- OrderPricing Response
- Ticketing
- Ticketing Request
- Ticketing Response
- Get Ticket Issuance Result
- OrderDetail Request (duplicate heading, will fix later)
- OrderDetail Response (duplicate heading, will fix later)
- TicketIssuanceNotify Request
- TicketIssuanceNotify Response
- Change Passenger Info
- UploadAttachmentFile Request (duplicate heading, will fix later)
- UploadAttachmentFile Response (duplicate heading, will fix later)
- Change Passenger Info Request
- Change Passenger Info Response



## Receive flight rescheduled notification
- Overview
- Notify your customers
- Accept the flight changes



## Add Paid Bags after the Booking
- Overview
- Add Paid Bags after the Booking
- API Workflow
- Search Ancillary Product
- Select the Product and Create Ancillary Orders
- Cancel Ancillary Orders
- Pay Ancillary Orders
- Check the Status of Ancillary Orders



## API Reference
### Air ticket booking APIs
- TicketIssuanceNotify_V2
  - Function
  - Versioning
  - Character Encoding
  - Request
    - Schema
    - Example
  - Response
    - Schema
    - Example



- ShoppingPOST
  - Function
  - Versioning
  - Error Code List
  - Request
  - Request samples
  - Responses



- PrecisePricingPOST
  - Function
  - Versioning
  - Error Code List
  - Request
  - Request samples
  - Responses



- PenaltyPOST
  - Function
  - Versioning
  - Error Code List
  - Request
  - Request samples
  - Responses



- PreciseBookingPOST
  - Function
  - Versioning
  - Error Code List
  - Request
  - Request samples
  - Responses



- OrderPricingPOST
  - Function
  - Versioning
  - Error Code List
  - Request
  - Request samples
  - Responses



- TicketingPOST
  - Function
  - Versioning
  - Error Code List
  - Request
  - Request samples
  - Responses



- CancelOrderPOST
  - Function
  - Versioning
  - Error Code List
  - Request
  - Request samples
  - Responses



- OrderDetailPOST
  - Function
  - Versioning
  - Order Status List
  - Error Code List
  - Request
  - Request samples
  - Responses



- RequestTicketingPOST
  - Function Description
  - Target Reader
  - URLs
  - Error Code List
  - Request
  - Request samples
  - Responses



- ModifyOrderStatusPOST
  - Function Description
  - Target Reader
  - URLs
  - Request
  - Request samples
  - Responses



## Ancillary booking APIs



- AncillaryStatusPush
  - Function
  - Versioning
  - Character Encoding
  - Request
  - Response



- AncillaryPricingPOST
  - Function
  - Versioning
  - Request Example
  - Error Code List
  - Request
  - Request samples
  - Responses



- AncillaryBookingPOST
  - Function
  - Error Code List
  - Request
  - Request samples
  - Responses



- CancelAncillaryOrderPOST
  - Function
  - Error Code List
  - Request
  - Request samples
  - Responses



- AncillaryTicketingPOST
  - Function
  - Error Code List
  - Request
  - Request samples
  - Responses



- AncillaryOrderDetailPOST
  - Function
  - Error Code List
  - Request
  - Request samples
  - Responses



## Flight schedule change APIs



- ScheduleChangeNotify
  - Document Description
  - Request Parameter
  - Response Parameter



- GetScheduleChangeReply
  - Document Description
  - Request
  - Response
  - Appendix



## Refund APIs



## Refund APIs



- RefundResultNotify
  - Document Description
  - Request
  - Response
  - Repush



- ReimbursedResultNotify
  - Description
  - Request
  - Response
  - Retry mechanism



- Refund PricingPOST
  - Function
  - Error Code List
  - Request Parameters
  - Responses



- CheckRefundPricingPOST
  - Function
  - Error Code List
  - Request Parameters
  - Responses



- RefundRequestPOST
  - Function Description
  - Error Code List
  - Request Parameters
  - Responses



- CheckRefundPOST
  - Function
  - Error Code List
  - Request Parameters
  - Responses



- CheckReimbursedPOST
  - Function Description
  - Error Code List
  - Request Parameters
  - Responses



- DownloadAttachmentFile APIPOST
  - Function
  - Error Code List
  - Request Parameters
  - Responses



- UploadAttachmentFile APIPOST
  - Function
  - Error Code List
  - Special Notes on Interface Requests
  - Request Parameters
  - Responses



## Development Instructions




- Signature
  - Description
  - Example



- Order Status Explanation
  - Order status/Item status[For ancillaries]
  - Scenarios



- Booking errors explanation and suggestions
  - Error code - B005
  - Error code - P008
  - Error code - B004
  - Error code - B029
  - Error code - B065



- Price Breakdown Explanation
  - Price Breakdown



- Airlines available from PKFARE
  - Best-Selling Airlines
  - Best-Selling Airlines with ancillaries



- PKFARE Operation Notice
  - PKFARE Operation Schedule
  - Escalation Matrix
  - PKFARE Portal
  - PKFARE Email Configuration



- How to retrieve airlines' PNR and ticket numbers
  - Ticket Number and PNR Mapping – Interface Parameter Explanation
  - Data Source Prioritization
  - Fallback Logic (When pnrList is Missing)
  - Best Practices



- Notice
  - Release Note

