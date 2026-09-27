# NDC Guide for Apollo and Worldspan

## Source

- **Local HTML:** `docs/travelport/travelport api guide/travelport-airapi json/support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/NDC/NDCPVGuide.html` (UTF-8 mirror)
- **Official base:** `https://support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/` + same relative path

## Plaintext extract (lossy)

NDC Guide for Apollo and Worldspan Skip To Main Content Account Settings Logout placeholder Account Settings Logout Filter: All Files Submit Search Filter: All Files Submit Search NDC Guide for Apollo and Worldspan At this time NDC&#160;content from Apollo and Worldspan is available for American Airlines. Please contact your Travelport account manager for more information about provisioning and availability in your market. This guide details how NDC&#160;content from Apollo and Worldspan is handled in the JSON APIs, including how it is identified in responses. To access NDC&#160;content you must be provisioned for NDC with Travelport and with the NDC&#160;airline. For GDS&#160;and NDC differences in the JSON APIs, see the support tables for seats , ancillaries , fare rules , and exchanges/refunds , and the NDC&#160;and GDS Functionality Comparison . For differences within NDC by individual carriers, see NDC capabilities by airline through JSON API in the Travelport Knowledge Base. See Knowledge Base NDC&#160;Resources if you need login assistance. Related Content: JSON Air APIs Guide , NDC&#160;Guide , NDC&#160;FAQs In this topic: Basic Concepts Source Values for Apollo and Worldspan Content Supported Carriers and Functionality Carriers Countries Functionality by GDS Basic Concepts Content for both NDC&#160;and GDS in the JSON &#160;APIs is sourced from the Galileo GDS (Global Distribution System) for most customers. NDC content from the Apollo and Worldspan GDSs is available to specifically provisioned customers, for specific carriers and countries per below. Most workflows, requests, and responses across the JSON &#160;APIs work the same for both GDS and NDC content, with minor differences noted in the help where applicable. The exception is that changes to the air itinerary, and voids, exchanges, and refunds, are handled by separate JSON APIs and follow different workflows. This results from differences in how NDC&#160;carriers implement these processes. The NDC menu at the top of every page groups these NDC-specific APIs. Otherwise, all Guides and API&#160;References apply to both NDC and GDS. All NDC content, regardless of source (Travelport+/ JSON , Apollo, or Worldspan), is handled the same in the JSON APIs. The only differences are: Responses identify the source of content with a specific source locator code per the next section Only specific carriers per below support Apollo and Worldspan NDC content For a discussion of GDS and NDC in general, see NDC&#160;Basic Concepts in the NDC&#160;Guide. Source Values for Apollo and Worldspan Content All workflows, requests, and responses are the same for all NDC&#160;content, with the one exception of the Locator source value returned for a booking. When a booking is confirmed, the booking commit response and all subsequent Reservation Retrieve responses return a confirmation with a Confirmation/Locator/source object that identifies the source GDS of the booking: 1G :&#160;Galileo/Travelport+&#160; 1P :&#160;Worldspan 1V :&#160;Apollo For example, the following example confirmation excerpt comes from Apollo. "Confirmation": { "@type": "ConfirmationHold", "Locator": { "source": "1V", "value": "V33QDW" } } See the Booking Guide and Reservation Retrieve Guide for more about booking confirmations and details in the JSON APIs. Supported Carriers and Countries Carriers American Airlines (AA) and United Airlines (UA) support NDC&#160;content from Worldspan and Apollo in the JSON APIs. Countries AA NDC content is available in multiple countries. Apollo and Worldspan customers in the United States, Canada, and Mexico were bulk provisioned. This content is available in other countries using the current NDC provisioning channels. Supported Functionality by GDS The following table lists JSON functionality support in each GDS. Functionality Travelport+ Apollo Worldspan Shop Yes Yes Yes Price Yes Yes Yes Fare rules Yes Yes Yes Book Yes Yes Yes Ticket Yes Yes Yes Comments and special service requests Yes Yes Yes Ancillaries and seats Yes Yes Yes Cancel Yes Yes In progress Traveler update Yes Yes In progress PNR Sync/Order Change Yes In progress In progress Divide Reservation Yes Planned Planned Refunds Yes Planned Planned Exchanges Yes Planned Planned Manual fare quote Yes Planned Planned &#160;

## Literal `<pre>` excerpts from HTML

### Block 1

```
"Confirmation": {
  "@type": "ConfirmationHold",
  "Locator": {
    "source": "1V",
    "value": "V33QDW"
  }
}
```

