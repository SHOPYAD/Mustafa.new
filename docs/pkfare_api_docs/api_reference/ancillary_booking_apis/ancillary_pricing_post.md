# AncillaryPricing - PKFARE Flight Buyer API

## Function

Through AncillaryPricing API, you can search ancillary products and get product details.

Paid baggage and seat selection are available in the initial booking. It is able to search multiple ancillary products at the  
same time or search them separately.

The passengers and journeys are required when adding ancillary in the inital booking. The request structure of  
AncillaryPricing is the same as that of PrecisePricing. It is necessary to use PrecisePricing service before using this  
interface. The whole process should be limited to 30 mins.

Additionally, paid baggage is also available in the postbooking process. The air order number is required in the  
AncillaryPricing request when adding ancillary after the booking. AncillaryPricing Results are valid within half an hour.

## Versioning

| Version | Sandbox Invoking Address | Update |
| --- | --- | --- |
| ancillaryPricing | [https://api.pkfare.com/ancillaryPricing]() | Support in-booking paid baggage |
| ancillaryPricing_V3 | [http://api.pkfare.com/ancillaryPricingV3]() | Support in-booking seat selection |
| ancillaryPricing_V4 | [http://api.pkfare.com/ancillaryPricingV4]() | Support postbooking paid bag |
| ancillaryPricing_V5 | [http://api.pkfare.com/ancillaryPricingV]()5 | Add solutionId to enhance tracebility and visibility |
| ancillaryPricing_V5(json format) | [http://api.pkfare.com/json/ancillaryPricingV5]() | Add solutionId to enhance tracebility and visibility;Support json formatted requesting parameter |
| ancillaryPricing_V6(json format) | [http://api.pkfare.com/json/ancillaryPricingV6]() | New feature: now support shopping and booking prices for different product tags, including PKFARE-defined special product types and airline-standard branded fares, etc. |

_Below is the most updated version_

## Request Example

1.  One-Way Journey (Search Baggage)

`{     "authentication": {         "partnerId":"partnerId",         "sign":"sign"     },     "pricing": {         "adults": 1,         "children": 0,         "ancillary": [             1         ],         "solutionId": "1",         "journeys": {             "journey_0": [                 {                     "airline":"TR",                     "arrival":"HKG",                     "arrivalDate":"2022-04-23",                     "arrivalTime":"10:05",                     "bookingCode":"O",                     "departure":"SIN",                     "departureDate":"2022-04-23",                     "departureTime":"06:00",                     "flightNum":"980"                 }             ]         }     } }`

2.  One-Way Journey(Search Seat)

`{     "authentication": {         "partnerId":"partnerId",         "sign":"sign"     },     "pricing": {         "adults": 1,         "children": 0,         "ancillary": [             2         ],         "solutionId": "1",         "journeys": {             "journey_0": [                 {                     "airline":"TR",                     "arrival":"HKG",                     "arrivalDate":"2022-04-23",                     "arrivalTime":"10:05",                     "bookingCode":"O",                     "departure":"SIN",                     "departureDate":"2022-04-23",                     "departureTime":"06:00",                     "flightNum":"980"                 }             ]         }     } }`

3.Round Journey (Search Baggage)

`{     "authentication": {         "partnerId":"partnerId",         "sign":"sign"     },     "pricing": {         "adults": 1,         "children": 0,         "ancillary": [             1         ],         "solutionId": "1",         "journeys": {             "journey_0": [                 {                     "airline":"TR",                     "arrival":"HKG",                     "arrivalDate":"2022-04-23",                     "arrivalTime":"10:05",                     "bookingCode":"O",                     "departure":"SIN",                     "departureDate":"2022-04-23",                     "departureTime":"06:00",                     "flightNum":"980"                 }             ],             "journey_1": [                 {                     "airline":"TR",                     "arrival":"SIN",                     "arrivalDate":"2022-04-25",                     "arrivalTime":"14:50",                     "bookingCode":"W",                     "departure":"HKG",                     "departureDate":"2022-04-25",                     "departureTime":"10:55",                     "flightNum":"981"                 }             ]         }     } }`

4.  Round Journey (Search Baggage And Seat)

`{     "authentication": {         "sign": "sign",         "partnerId": "partnerId"     },     "pricing": {         "journeys": {             "journey_1": [                 {                     "departureTime": "09:20",                     "flightNum": "625",                     "arrival": "SGN",                     "arrivalTime": "10:45",                     "bookingCode": "S",                     "departure": "DAD",                     "departureDate": "2023-12-10",                     "airline": "VJ",                     "arrivalDate": "2023-12-10"                 },                 {                     "departureTime": "19:00",                     "flightNum": "895",                     "arrival": "DEL",                     "arrivalTime": "22:50",                     "bookingCode": "S",                     "departure": "SGN",                     "departureDate": "2023-12-10",                     "airline": "VJ",                     "arrivalDate": "2023-12-10"                 }             ],             "journey_0": [                 {                     "departureTime": "00:05",                     "flightNum": "896",                     "arrival": "SGN",                     "arrivalTime": "06:20",                     "bookingCode": "I",                     "departure": "DEL",                     "departureDate": "2023-11-30",                     "airline": "VJ",                     "arrivalDate": "2023-11-30"                 },                 {                     "departureTime": "17:20",                     "flightNum": "632",                     "arrival": "DAD",                     "arrivalTime": "18:35",                     "bookingCode": "I",                     "departure": "SGN",                     "departureDate": "2023-11-30",                     "airline": "VJ",                     "arrivalDate": "2023-11-30"                 }             ]         },         "children": "1",         "solutionId": "1",         "adults": "2",         "ancillary": [             1,             2         ]     } }`

   
5\. Open Jaw (Search Baggage)

`{     "authentication": {         "partnerId":"partnerId",         "sign":"sign"     },     "pricing": {         "adults": 1,         "children": 0,         "ancillary": [             1         ],         "solutionId": "1",         "journeys": {             "journey_0": [                 {                     "airline":"TR",                     "arrival":"HKG",                     "arrivalDate":"2022-04-23",                     "arrivalTime":"10:05",                     "bookingCode":"O",                     "departure":"SIN",                     "departureDate":"2022-04-23",                     "departureTime":"06:00",                     "flightNum":"980"                 }             ],             "journey_1": [                 {                     "airline":"TR",                     "arrival":"CNX",                     "arrivalDate":"2022-04-25",                     "arrivalTime":"14:50",                     "bookingCode":"W",                     "departure":"HKG",                     "departureDate":"2022-04-25",                     "departureTime":"10:55",                     "flightNum":"981"                 }             ]         }     } }`

6.  Search Postbooking Baggage

`{     "authentication": {         "sign": "sign",         "partnerId": "partnerId"     },     "data": {         "airOrderNum": "917070354395357001",         "ancillary": [             1         ]     } }`

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
| B039 | Can\\\\'t find the related data of XXX. | Wrong parameter. Can\\\\'t find the related data of XXX, like illegal city/country/area/airline. |
| B046 | Interface is limited, the routing is offlined by PKFARE. | Look to book control. If you need this routing, please contact PKFARE API for assistant. |
| B068 | The segment detail is different between solutionid field and journey field. | Please verify whether the information in the pricing request matches the details from the shopping response. |
| B121 | Supplier is offline | Supplier is not at working time, please contact PKFARE API support. |
| B190 | No ancillary product found. | No ancillary product found. |
| B191 | The air order number is not existed. | The air order number is not existed. |

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

Unique identification of each solution from Shopping API, request with it for associating with the Shopping solution and linking to the entire request process. In the case of a pricing failure, please retry by filling in this parameter with \"direct pricing\" string to trigger the direct pricing mechanism.

Cabin class \[\"\" - the lowest cabin, Y - Economy, W - PremiumEconomy, C - business class, F - first class\] if both \"cabin\" and \"bookingCode\" is valued and not inconsistent, precisePricing service would base on \"bookingCode\".

solutionKey

string 

optional

Recommend to request with this parameters for the sake of data quality monitor.

Product tag, must use the code defined by PKFARE. Only one tag can be specified in this version. When making a direct pricing request with a tag, PKFARE may return multiple prices with different tags for the requested flight. For non-direct pricing requests, the tag can be omitted, in which case PKFARE will always perform single-price validation based on the Shopping cached price tag associated with the solutionId.\

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

