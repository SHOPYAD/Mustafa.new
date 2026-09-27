# Exchange Eligibility API&#160;Reference

## Source

- **Local HTML:** `docs/travelport/travelport api guide/travelport-airapi json/support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/GDSExchangesRefunds/APIRef_ExchangeEligibility.html` (UTF-8 mirror)
- **Official base:** `https://support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/` + same relative path

## Plaintext extract (lossy)

Exchange Eligibility API&#160;Reference Skip To Main Content Account Settings Logout placeholder Account Settings Logout Filter: All Files Submit Search Filter: All Files Submit Search Exchange Eligibility API&#160;Reference Request Response Example request Example response Get eligibility/ticketchangeeligibilities Base path: The base path for this API varies from that for other JSON &#160; Air APIs and does not include air at the end. Pre-production https://api.pp.travelport.net/11/ Production https://api.travelport.net/11/ Related Content: Exchange, Refund, and Void Guide GDS&#160;only. For NDC&#160;exchange functionality, see the Exchange, Refund, and Void Guide . The Eligibility API is the first step in the GDS exchange workflow. It is an optional step. Eligibility returns information about whether a ticket may have value in an exchange or refund scenario, and the range of potential exchange and refund fees. This information relates only to fees, not any fare or tax difference for the itinerary. After the Eligibility request, create a post-commit workbench and send an Exchange Search request. Request As part of the request requirements, also see Authentication and Common Air API Headers . Query Parameters Send either the Ticket or Locator parameter per below. Ticket returns eligibility details for only the one traveler on the ticket, while Locator returns details for all travelers on that reservation. A request by reservation locator for a reservation that has multiple open tickets for one passenger will return eligibility information only for the last ticket listed in the reservation. In this scenario you should instead send the request by ticket number. Parameter Description Required/Optional Ticket The ticket number of the ticketed itinerary to request eligibility information for. Append ?Ticket and the ticket number to the GET&#160;request. Use the Ticket parameter when sending an Eligibility request for any ticket with multiple offers. Either ticket number or locator is required. Locator The reservation&#160;locator of the itinerary to request eligibility information for. Append ?Locator and the reservation&#160;locator to the GET&#160;request. Not supported for any ticket with multiple offers. Either ticket number or locator is required. Request Body There is no message payload. Response The Eligibility response returns details on whether the ticket can be exchanged or refunded, and the range of possible change fees. Show Response Body Table Object Description TicketChangeEligibilityListResponse Top level object for response. Key value pairs: transactionId : System-generated unique ID for this response. Can be used for internal tracking and troubleshooting. traceId : Returned if a custom trace ID was sent in the request header. See Transaction and Trace IDs for details. See Identifiers in the JSON &#160;APIs for more about identifiers across all JSON &#160;APIs. TicketChangeEligibility Details about whether the ticket can be exchanged or refunded. Key value pairs: exchangeable : Possible values are All , Some , or None , indicating whether all, some, or none of the fare components are eligible for exchange. refundable : Possible values are All , Some , or None , indicating whether all, some, or none of the fare components are eligible for refund. automationNotSupportedInd : Returned with a value of true only if automated exchanges are not allowed. With this indicator the following warning is also returned:&#160; Carrier is not currently supported for automated exchanges. Exchange must be processed manually. objID : Ticket number sequence for exchange or refund. Note that for itineraries with multiple passengers, the response returns eligibility details at the passenger level. If there are multiple passengers of the same PTC type, the response returns details and the ticket number for each passenger are returned. Identifier Transaction identifier information. Key value pairs: authority : This value is always Travelport as the transaction issuer. value : The ticket number sent with the eligibility request. Penalties &#160; Top level object for penalty fees charged for changes to this itinerary. Includes the Change object. Change Details about maximum or minimum change fees charged for changes to this itinerary. Includes the Penalty object and the following key value pair: penaltyTypes : A value of Maximum indicates the Change object lists maximum change fees; a value of Minimum indicates it lists minimum change fees. Penalty Top level object for Amount object. Penalty/Amount The amount of any change fee. Key value pairs: code : The currency code in which the value is returned. approximateInd : Returned only if a currency is converted. If returned, the value is always true , indicating that the fee is approximate because of currency conversion. value : The amount of the change fee, either maximum or minimum per Change/penaltyTypes. minorUnit: &#160;The smallest unit of currency for the currency in code . For example; the smallest denomination in USD is the cent, which is 1/100 of a USD, and the minor unit value is 2 . Not all currencies have a minor unit. Example Request For additional examples, download the developer toolkits and see Using Postman and Developer Toolkits . This request has no message payload. Example Response For additional examples, download the developer toolkits and see Using Postman and Developer Toolkits . Note the response returns eligibility at the passenger level, not the PTC level. Show Example Response The response below returns details for each passenger on a reservation with three ADT travelers. Details for each traveler are returned in a separate instance of TicketChangeEligibility. { "TicketChangeEligibilityListResponse": { "traceId": "Test_TripChange_Eligibility_1417", "TicketChangeEligibility": [ { "@type": "TicketChangeEligibility", "exchangeable": "All", "refundable": "None", "objID": "ticketChangeEligibility_1", "Identifier": { "authority": "Travelport", "value": "2203768448152" }, "Penalties": { "Change": [ { "@type": "ChangePermitted", "penaltyTypes": [ "Maximum" ], "Penalty": [ { "@type": "PenaltyAmount", "Amount": { "code": "AUD", "minorUnit": 2, "value": 0 } } ] }, { "@type": "ChangePermitted", "penaltyTypes": [ "Minimum" ], "Penalty": [ { "@type": "PenaltyAmount", "Amount": { "code": "AUD", "minorUnit": 2, "value": 0 } } ] } ] }, "PassengerTypeCode": "ADT" }, { "@type": "TicketChangeEligibility", "exchangeable": "All", "refundable": "None", "objID": "ticketChangeEligibility_2", "Identifier": { "authority": "Travelport", "value": "2203768448150" }, "Penalties": { "Change": [ { "@type": "ChangePermitted", "penaltyTypes": [ "Maximum" ], "Penalty": [ { "@type": "PenaltyAmount", "Amount": { "code": "AUD", "minorUnit": 2, "value": 0 } } ] }, { "@type": "ChangePermitted", "penaltyTypes": [ "Minimum" ], "Penalty": [ { "@type": "PenaltyAmount", "Amount": { "code": "AUD", "minorUnit": 2, "value": 0 } } ] } ] }, "PassengerTypeCode": "ADT" }, { "@type": "TicketChangeEligibility", "exchangeable": "All", "refundable": "None", "objID": "ticketChangeEligibility_3", "Identifier": { "authority": "Travelport", "value": "2203768448151" }, "Penalties": { "Change": [ { "@type": "ChangePermitted", "penaltyTypes": [ "Maximum" ], "Penalty": [ { "@type": "PenaltyAmount", "Amount": { "code": "AUD", "minorUnit": 2, "value": 0 } } ] }, { "@type": "ChangePermitted", "penaltyTypes": [ "Minimum" ], "Penalty": [ { "@type": "PenaltyAmount", "Amount": { "code": "AUD", "minorUnit": 2, "value": 0 } } ] } ] }, "PassengerTypeCode": "ADT" } ] } } &#160;

## Literal `<pre>` excerpts from HTML

### Block 1

```
{
  "TicketChangeEligibilityListResponse": {
    "traceId": "Test_TripChange_Eligibility_1417",
    "TicketChangeEligibility": [
      {
        "@type": "TicketChangeEligibility",
        "exchangeable": "All",
        "refundable": "None",
        "objID": "ticketChangeEligibility_1",
        "Identifier": {
          "authority": "Travelport",
          "value": "2203768448152"
        },
        "Penalties": {
          "Change": [
            {
              "@type": "ChangePermitted",
              "penaltyTypes": [
                "Maximum"
              ],
              "Penalty": [
                {
                  "@type": "PenaltyAmount",
                  "Amount": {
                    "code": "AUD",
                    "minorUnit": 2,
                    "value": 0
                  }
                }
              ]
            },
            {
              "@type": "ChangePermitted",
              "penaltyTypes": [
                "Minimum"
              ],
              "Penalty": [
                {
                  "@type": "PenaltyAmount",
                  "Amount": {
                    "code": "AUD",
                    "minorUnit": 2,
                    "value": 0
                  }
                }
              ]
            }
          ]
        },
        "PassengerTypeCode": "ADT"
      },
      {
        "@type": "TicketChangeEligibility",
        "exchangeable": "All",
        "refundable": "None",
        "objID": "ticketChangeEligibility_2",
        "Identifier": {
          "authority": "Travelport",
          "value": "2203768448150"
        },
        "Penalties": {
          "Change": [
            {
              "@type": "ChangePermitted",
              "penaltyTypes": [
                "Maximum"
              ],
              "Penalty": [
                {
                  "@type": "PenaltyAmount",
                  "Amount": {
                    "code": "AUD",
                    "minorUnit": 2,
                    "value": 0
                  }
                }
              ]
            },
            {
              "@type": "ChangePermitted",
              "penaltyTypes": [
                "Minimum"
              ],
              "Penalty": [
                {
                  "@type": "PenaltyAmount",
                  "Amount": {
                    "code": "AUD",
                    "minorUnit": 2,
                    "value": 0
                  }
                }
              ]
            }
          ]
        },
        "PassengerTypeCode": "ADT"
      },
      {
        "@type": "TicketChangeEligibility",
        "exchangeable": "All",
        "refundable": "None",
        "objID": "ticketChangeEligibility_3",
        "Identifier": {
          "authority": "Travelport",
          "value": "2203768448151"
        },
        "Penalties": {
          "Change": [
            {
              "@type": "ChangePermitted",
              "penaltyTypes": [
                "Maximum"
              ],
              "Penalty": [
                {
                  "@type": "PenaltyAmount",
                  "Amount": {
                    "code": "AUD",
                    "minorUnit": 2,
                    "value": 0
                  }
                }
              ]
            },
            {
              "@type": "ChangePermitted",
              "penaltyTypes": [
                "Minimum"
              ],
              "Penalty": [
                {
                  "@type": "PenaltyAmount",
                  "Amount": {
                    "code": "AUD",
                    "minorUnit": 2,
                    "value": 0
                  }
                }
              ]
            }
          ]
        },
        "PassengerTypeCode": "ADT"
      }
    ]
  }
}
```

