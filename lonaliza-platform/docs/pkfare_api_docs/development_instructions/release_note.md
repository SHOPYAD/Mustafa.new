# Release Note - PKFARE Flight Buyer API

## April 2025

## Branded Fare & Custom Product Tag Support Launched

_2025/04/23_

Update

_**Air ticket booking APIs & Ancillary booking APIs:**_

*   json/shoppingV8
*   json/pricingV10
*   json/penaltyV3
*   json/ancillaryPricingV6
*   json/bookingV7
*   json/orderPricingV5
*   json/orderdetailV10

A new feature has been launched across multiple APIs to support differentiated pricing and booking based on various **product tags**, including **PKFARE-defined special product types** and **airline-standard branded fares**.

### Key Benefits:

*   **Rich Product Differentiation:** Enables more accurate representation of both airline fare brands and internal product categories tailored by PKFARE.
*   **Smarter Pricing & Booking Logic:** Improved support for upsell and fare rule alignment across all stages from shopping to post-booking.
*   **Unified Access:** Consistent support across all major modules—shopping, pricing, penalty check, ancillary pricing, booking, and order management.

* * *

## Virtual Interlining Product Support Released

_2025/04/10_

Update

_**Air ticket booking APIs:**_

*   json/shoppingV7
*   json/precisePricing\_V9

The APIs have been updated to support one-way Virtual Interlining products that are highly customizable and competitively priced.

Key Benefits:

*   **More Flight Combinations:** Provides travelers with more flexible and diverse flight options by combining carriers across traditional boundaries.
*   **Better Fares:** Enables access to more competitively priced flights through Virtual Interlining content, helping reduce overall travel costs.

* * *

## August 2024

## Enhanced Ticket Issuance Notifications

_2024/08/29_

Update

_**Air ticket booking APIs:**_

*   `TicketIssuanceNotify_V2`

The API has been updated to provide more detailed information about ticket issuance failures. By incorporating failure reasons, you can now gain a deeper understanding of the underlying causes of ticketing issues.

Key Benefits:

*   **Improved Troubleshooting:** Quickly identify the root cause of ticketing failures.
*   **Enhanced Error Handling:** Implement effective error recovery strategies.
*   **Better Customer Experience:** Provide clear and informative messages to customers about the reasons for ticketing failures.

This enhancement empowers you to proactively address ticketing challenges and maintain a seamless user experience.

* * *

## July 2024

## Deeper Insights into Schedule Change History

_2024/07/16_

Update

_**Air ticket booking APIs:**_

*   `json/orderDetail/v8`

The API has been upgraded to provide more granular information on schedule change history. Now, you can access detailed insights, including message IDs and acceptance statuses, for each schedule change event associated with an order.

This enhanced level of detail empowers you to:

*   **Troubleshoot issues:** Easily identify the root cause of schedule change problems.
*   **Improve decision-making:** Make informed choices based on a comprehensive understanding of schedule change history.
*   **Enhance customer service:** Provide accurate and timely information to customers regarding schedule changes.

By leveraging this API, you can gain a deeper understanding of your order history and optimize your operations accordingly.

* * *

## June 2024

## Take Control of Test Order: Modify Order Status API

_2024/06/02_

The API empowers you to manage test orders effectively. With this API, you can easily update the order status of a "Paid, to be issued" flight order to "ISSUED" in the sandbox environment.

This feature provides greater flexibility and control over your flight bookings test, allowing you to streamline processes.

* * *

## April 2024

## JSON-Powered APIs: Streamlined Integrations

_2024/04/10 & 2024/04/10_

Update

_**Flight schedule change APIs:**_

*   `json/GetScheduleChangeList_V2`
*   `json/AcknowledgeScheduleChange_V2`
*   `json/AcceptScheduleChange_V2`

_**Refund APIs:**_

*   `json/Refund Pricing_V2`
*   `json/CheckRefundPricing_V2`
*   `json/RefundRequest_V2`
*   `json/CheckRefund_V2`
*   `json/CheckReimbursed_V2`
*   `json/DownloadAttachmentFile API_V2`
*   `json/UploadAttachmentFile API_V2`

_**Change APIs :**_

*   `json/ChangeReshop_V2`
*   `json/ChangeRequest_V2`
*   `json/ChangePassenger Info_V2`

_**Void APIS :**_

*   `json/VoidRequest_V2`

_**Ancillary booking APIs :**_

*   `json/ancillaryPricingV5`
*   `json/ancillaryBookingV2`
*   `json/cancelAncillaryOrder`
*   `json/ancillaryTicketingV2`
*   `json/ancillaryOrderDetail`

Multiple APIs now support JSON for both requesting and responding data. This simplifies integration and data exchange.

* * *

## Air Ticket Booking APIs: Now Smarter & More User-Friendly

_2024/04/06_

Update

_**Air ticket booking APIs:**_

*   `precisePricing_V6`
*   `json/precisePricing_V6`
*   `json/penaltyV2`
*   `json/preciseBooking_V5`
*   `json/orderPricingV4`
*   `json/ticketing`
*   `json/cancelOrder`
*   `json/OrderDetail/V7`
*   `json/requestTicketing`

This update brings several improvements to our air ticket booking APIs, focusing on traceability, data visibility, and user experience.

Here\`s a breakdown of the key changes:

*   **SolutionID**: All APIs now include a solutionId field. This allows developers to track requests and improve troubleshooting.
*   **JSON Support**: APIs now support JSON for both requesting and responding data. This simplifies integration and data exchange.
*   **Enhanced Functionality**: Specific updates include:
*   *   `precisePricing_V6`: Now supports checking seat prices.

These updates make the APIs more robust and user-friendly, allowing developers to build more efficient and informative travel booking applications.

* * *

## February 2024

## Introducing GetScheduleChangeReply

_2024/2/26_

This API allows you to receive confirmation results for flight schedule changes that you have previously confirmed. This provides real-time updates on the status of your flight schedule adjustments.

* * *

## Enhanced Traceability with Solution ID for Key APIs

_2024/02/07 & 2024//02/16_

To improve the traceability and visibility of API requests, we have introduced the "solutionId" field in the following APIs:

Update

_**Ancillary booking APIs:**_

*   `ancillaryPricingV5`

_**Air ticket booking APIs:**_

*   `penaltyV2`
*   `PreciseBooking_V5`

By implementing "solutionId" in these APIs, we aim to:

*   Improve troubleshooting: Easily track the origin and flow of requests.
*   Enhance data analysis: Gain better insights into API usage patterns.
*   Provide better support: Offer more efficient and effective customer support.

This update will significantly improve the overall user experience by making API interactions more transparent and manageable.

* * *

## An Enhanced PrecisePricing API

_2024/02/05_

Update

_**Air ticket booking APIs:**_

*   `PrecisePricing_V5`

This updated parameter allow buyers to get the infomation of availability of ancillary services before they call `Ancillarypricing` API.

* * *

## January 2024

## Introducing CancelAncillaryOrder API

_2024/01/30_

**Key Use Case:**

If a passenger decides to change their mind about an ancillary product (e.g., baggage allowance, seat selection) after initially adding it to their booking, this API can be used to cancel the order and avoid unnecessary charges.

**Note:** This API should be used before initiating the ancillary ticketing process.

* * *

_2024/01/05_

Update

_**Ancillary booking APIs:**_

*   `ancillaryBookingV2`

This suite of APIs provides comprehensive support for managing ancillary orders within the PKFARE system.

* * *

