# PrecisePricing - PKFARE Flight Buyer API

## Function

Through PrecisePricing API, the precise price will be shown with specific flight details, including booking code and seat availability. If specific cabin class is requested (cabin class should be specified in all segments), the lowest fare corresponding to the specified class will be shown.

PrecisePricing service is able to check flight price based on cabin class. We will respond the real-time price and availability.

## Versioning

| Version | Sandbox Invoking Address | Update |
| --- | --- | --- |
| PrecisePricing | [https://api.pkfare.com/precisePricing]() |  |
| PrecisePricing_V2 | [https://api.pkfare.com/precisePricing_V2]() | Add baggageMap and miniRuleMap, only for reference. Offer BookingWithoutCard notification in response. |
| PrecisePricing_V4 | [https://api.pkfare.com/precisePricing_V4]() | Support infant (no seat) . |
| PrecisePricing_V5 | [https://api.pkfare.com/precisePricing_V5]() | Add Ancillary flag to indicate which ancillary service is available |
| PrecisePricing_V6 | [https://api.pkfare.com/precisePricing_V6]() | Add solutionId to enhance tracebility and data visibility |
| PrecisePricing_V6(json foramt) | [https://api.pkfare.com/json/precisePricing_V6]() | Add solutionId to enhance tracebility and data visibility;Support json formatted requesting structure |
| PrecisePricing_V9(json foramt) | [https://api.pkfare.com/json/precisePricing_V9]() | Support pricing virtual interlining content |
| PrecisePricing_V10(json foramt) | [https://api.pkfare.com/json/precisePricing_V10]() | Support pricing different product tags, including PKFARE-defined special product types and airline-standard branded fares, etc. |

*Below is the most updated version*

## Error Code List

| erroCode | erroMsg | Description |
| --- | --- | --- |
| 0 | ok | Request has been processed successfully. |
| S001 | System error. | System error. |
| B002 | Partner does not exists. | PartnerID does not exist. |
| B003 | Illegal sign. | Illegal sign. Please check your signature. |
| B035 | Concurrency limited. Please contact PKFARE API support team for assistant. | Concurrency exceeded system limits. |
| P001 | XXX is illegal. | The field of XXX is illegal. |
| P002 | XXX is missing. | The field of XXX is missing. |
| P004 | The maximum number of passengers with seat is 9. | Wrong parameter. The maximum number of passengers with seat is 9. |
| P005 | There should be at least one adult. | Wrong parameter. There should be at least one adult. |
| P009 | The number of infant passengers can not exceed the number of adult passengers. | Wrong parameter. The number of infant passengers can not exceed the number of adult passengers. |
| B013 | Interface is limited, please contact the system administrator. | The route that you request is limited, please contact system administrator. |
| B015 | Pricing failed. | Pricing failed for other reason. |
| B016 | Flight near take-off, can’t offer pricing service. | Pricing fail. Can not pricing for flights that is near taking off. |
| B018 | Airline or flight restriction. | Airline or flight restriction. |
| B019 | Can not find any supplier for current search. | Can not find any supplier for current search. |
| B020 | Can not find any price for this flight. | Pricing fail. Can not find any price for this flight option. |
| B021 | The booking code you choose has only 0 seat available. | Pricing fail. The booking code you choose has 0 seat left. Please choose other booking code or flight. |
| B026 | LatestTktTime: yyyy-mm-dd hh : mm: ss. | Last ticketing time is not enough to issue ticket. |
| B024 | Pricing TimeOut. | Pricing TimeOut. |
| B035 | Concurrency limited. Please contact PKFARE API support team for assistant. | Concurrent users control. Please contact PKFARE API support for assistant. |
| B039 | Can\\'t find the related data of XXX. | Wrong parameter. Can\\'t find the related data of XXX, like illegal city/country/area/airline. |
| B046 | Interface is limited, the routing is offlined by PKFARE. | Look to book control. If you need this routing, please contact PKFARE API for assistant. |
| B068 | The segment detail is different between solutionid field and journey field. | Please verify whether the information in the pricing request matches the details from the shopping response. |
| B121 | Supplier is offline | Supplier is not at working time, please contact PKFARE API support. |

### Request

Authentication

object {2} 

required

pricing

object {8} 

required

journeys

object {1} 

required

journey_0 outboundtrip, journey_1 inbound trip,

Number of adult passenger

Number of child\[age 2-12/14\] passenger

Number of infant \[age 0-2, no seat\] passenger

solutionId

string 

required

Unique identification of each solution from Shopping API, request with it for associating with the Shopping solution and linking to the entire request process. In the case of a pricing failure, please retry by filling in this parameter with \'direct pricing\' string to trigger the direct pricing mechanism.

Cabin class \[\"\" - the lowest cabin, Y - Economy, W - PremiumEconomy, C - business class, F - first class\] if both \'cabin\' and \'bookingCode\' is valued and not inconsistent, precisePricing service would base on \'bookingCode\'.

solutionKey

string 

optional

Recommend to request with this parameters for the sake of data quality monitor.

Product tag, must use the code defined by PKFARE. Only one tag can be specified in this version. When making a direct pricing request with a tag, PKFARE may return multiple prices with different tags for the requested flight. For non-direct pricing requests, the tag can be omitted, in which case PKFARE will always perform single-price validation based on the Shopping cached price tag associated with the solutionId.​

    {
      "authentication": {
        "partnerId": "",
        "sign": ""
      },
      "pricing": {
        "journeys": {
          "journey_0": [
            {
              "airline": "FD",
              "flightNum": "501",
              "arrival": "DMK",
              "arrivalDate": "2024-12-15",
              "arrivalTime": "16:40",
              "departure": "HKG",
              "departureDate": "2024-12-15",
              "departureTime": "14:40",
              "bookingCode": "Z"
            }
          ],
          "journey_1": [
            {
              "airline": "FD",
              "flightNum": "504",
              "arrival": "HKG",
              "arrivalDate": "2024-12-30",
              "arrivalTime": "19:15",
              "departure": "DMK",
              "departureDate": "2024-12-30",
              "departureTime": "15:30",
              "bookingCode": "A"
            }
          ]
        },
        "adults": 1,
        "children": 1,
        "infants": 0,
        "solutionId": "iXf1ufZoOsBU+MpHfwQD6vzfcE3X5BFe1Vxl3oa9iNn1Noc75XschKYpLVXfU17PcPI7oU/EVSKjQj2Xuxt9QoSJGTP7oW12BBtDUQvlAzaZ1z0zhjr4N5cJVh2fElsdEXXtCGI00H3Nvx98/d2z6lUfU0Yhuny0kj/rOz4IMMmghIhWyGDa4e4T7y3BrTjFwEPZh0nHoEykVO13sMp0vXt8ub60T12OXl9dooXkhpqN51MhNjyCkSYjIYff//DJ1cRBps9+3e58SI0ifR8P6FiCKSCYOmCQLFKKLU0P8+Xlv4BsqxNY0pdOKT7LeR3w2YGgt1zSCyEXZCwy/+BBLA66j01ytAzieUvdZ3sqLyc8+7IG23vo1JfqVtlJo/pvRdlQyp6gQGJDPraSkTCSvA==",
        "cabin": "",
        "tag": "SAVER"
      }
    }

### Request samples

### Responses

HTTP Code: 200

Content Type : JSON

Error code, refer to Error Code List

Returned data, will not be empty when error code is "0". Data is in JSON format, which contains three collection objects: solutions, flights, segments.

solution

object {23} 

required

flights

array \[object {6}\] 

required

segments

array \[object {24}\] 

required

ancillaryAvailability

object {2} 

required

    {
      "errorCode": "0",
      "errorMsg": "ok",
      "data": {
        "solution": {
          "solutionKey": "cadce3d7a693476e02a0e841d586fbcb",
          "solutionId": "DMHkxtUMu...4669 bytes truncated..."

