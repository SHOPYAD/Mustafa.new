# OrderPricing - PKFARE Flight Buyer API

## Function

Through OrderPricing_V4 API, users can check if the PNR and order price are available before doing the payment to ensure the validity of order price and PNR. It is mandatory to invoke OrderPricing before Ticketing. Ticketing need to be done within 30 minutes after OrderPricing.

## Versioning

| Version | Sandbox Invoking Address | Update |
| --- | --- | --- |
| OrderPricing |  [https://api.pkfare.com/orderPricing]() |  |
| OrderPricing_V2 | [https://api.pkfare.com/orderPricingV2]() | Support to check paid baggage price. |
| OrderPricing_V3 | [https://api.pkfare.com/orderPricingV]()3 | Support to check infant ticket price. Display more fare details for change orders. |
| OrderPricing_V4 | [http://api.pkfare.com/orderPricingV4]() | Support to check seat price |
| OrderPricing_V4 (json format) | [http://api.pkfare.com/json/orderPricingV4]() | Support to check seat price; Support json formatted requesting strcture |
| OrderPricing_V5 (json format) | [http://api.pkfare.com/json/orderPricingV5]() | Support checking orders of different product tags, including PKFARE-defined special product types and airline-standard branded fares, etc. |

## Error Code List

| erroCode | erroMsg | Description |
| --- | --- | --- |
| 0 | ok | Request has been processed successfully. |
| P001 | - | Wrong parameter |
| S001 | System error | System error |
| 310 | Retrieve PNR failed, please try again. | Retrieve PNR failed |
| B002 | Partner is not exists | PartnerID does not exist |
| B003 | Illegal sign | Illegal sign. Please check your signature |
| B009 | Order status is invalid | Order status is invalid |
| B010 | The order was not found | The order was not found. |
| B026 | Latest_tkt_time will be expired within 1 hour. | Latest ticketing time will be expired within 1 hour. |
| B101 | supplier status is invalid | Supplier is offline. |
| B102 | Segment status is invalid. | Segment status is invalid. |
| B103 | No airline PNR existed, please try again. | No airline PNR exist. |
| B104 | Flight No. in PNR is not match with the one in the order | Flight No. in PNR is not match with the one in the order . |
| B105 | Passenger No. in PNR is not match with the one in the order | Passenger No. in PNR is not match with the one in the order. |
| B106 | No price | PNR has no filed fare. |
| B107 | Fare changed, and update order failed. Please try again. | Fare changed, and update order failed. |
| B108 | Supplier has cross the day, fare is not guaranteed. | Supplier had crossed the day, fare is not guaranteed. |
| B109 | Supplier has cross the day, and price has changed | Supplier had crossed the day, and price has changed. |
| B112 | The order has been paid before, please update status accordingly. | The order had been paid before. |
| B113 | Filed fare in PNR is not match with the price in the order, and price has changed. | Filed fare in PNR is not match with the price in the order, and price had changed. |
| B114 | Flight changed | Flight changed |
| B115 | Latest_tkt_time has expired. | Latest ticketing time is expired. |
| B116 | Price changed | Price had changed |
| B117 | Order Pricing failed | Caused by other reasons, please connect administrator |
| B118 | PNR status is invalid | PNR status is invalid |
| B119 | Order Pricing failed, please try again | LCC content: Pre-check before payment failed. Please try again |
| B120 | Order Pricing failed | Supplier saved booking failed. |

### Request

Authentication

object {2} 

required

orderPricing

object {1} 

required

    {
      "authentication": {
        "partnerId": "",
        "sign": ""
      },
      "orderPricing": {
        "orderNum": "917131658934384601"
      }
    }

### Request samples

### Responses

HTTP Code: 200

Content Type : JSON

Error code, refer to Error Code List

Returned data, will not be empty when error code is "0". Data is in JSON format, which contains two collections: PricingResult and OrderResult

pricingResult

object {4} 

optional

orderResult

object {2} 

optional

    {
      "errorCode": "0",
      "errorMsg": "ok",
      "data": {
        "pricingResult": {
          "solution": {
            "fareType": "PRIVATE",
            "currency": "CNY",
            "adtFare": 2862,
            "adtTax": 1211,
            "chdFare": 0,
            "chdTax": 0,
            "qCharge": 0,
            "tktFee": 0,
            "platformServiceFee": 0,
            "journeys": {
              "journey_0": [
                "f5deaeeae1538fb6c45901d524ee2f98"
              ]
            },
            "merchantFee": 0,
            "adults": 1,
            "children": 0,
            "infants": 0
          },
          "flights": [
            {
              "flightId": "f5deaeeae1538fb6c45901d524ee2f98",
              "journeyTime": 360,
              "transferCount": 1,
              "lastTktTime": "2023-11-09 13:47:00",
              "segmengtIds": [
                "def32e56f53ad461c6437c0d237ae6db",
                "4abffb5c6b36b9a366075d4726460a66"
              ]
            }
          ],
          "segments": [
            {
              "segmentId": "def32e56f53ad461c6437c0d237ae6db",
              "airline": "VJ",
              "flightNum": "896",
              "cabinClass": "ECONOMY",
              "bookingCode": "I",
              "availabilityCount": 3,
              "departure": "DEL",
              "arrival": "SGN",
              "departureDate": 1701273900000,
              "arrivalDate": 1701296400000,
              "arrivalTime": "06:20",
              "flightTime": 285,
              "codeShare": "N",
              "strDepartureDate": "2023-11-30",
              "strDepartureTime": "00:05",
              "strArrivalDate": "2023-11-30",
              "strArrivalTime": "06:20"
            },
            {
              "segmentId": "4abffb5c6b36b9a366075d4726460a66",
              "airline": "VJ",
              "flightNum": "632",
              "cabinClass": "ECONOMY",
              "bookingCode": "I",
              "availabilityCount": 3,
              "departure": "SGN",
              "arrival": "DAD",
              "departureDate": 1701336000000,
              "arrivalDate": 1701340500000,
              "arrivalTime": "18:35",
              "flightTime": 75,
              "codeShare": "N",
              "strDepartureDate": "2023-11-30",
              "strDepartureTime": "17:20",
              "strArrivalDate": "2023-11-30",
              "strArrivalTime": "18:35"
            }
          ],
          "ancillary": [
            {
              "lastName": "LIN",
              "firstName": "LIHONG",
              "psgType": "ADT",
              "ancillaries": {
                "baggage": [
                  {
                    "ancillaryType": 1,
                    "payBaggageType": 1,
                    "baggagePiece": 2,
                    "baggageWeight": "36KG",
                    "baggageCurrency": "CNY",
                    "baggagePrice": 95,
                    "journeys": [
                      {
                        "airline": "VJ",
                        "flightNum": "896",
                        "departure": "DEL",
                        "departureDate": "2023-11-30",
                        "departureTime": "00:05",
                        "arrival": "SGN",
                        "arrivalDate": "2023-11-30",
                        "arrivalTime": "06:20",
                        "bookingCode": "I"
                      },
                      {
                        "airline": "VJ",
                        "flightNum": "632",
                        "departure": "SGN",
                        "departureDate": "2023-11-30",
                        "departureTime": "17:20",
                        "arrival": "DAD",
                        "arrivalDate": "2023-11-30",
                        "arrivalTime": "18:35",
                        "bookingCode": "I"
                      }
                    ]
                  }
                ]
              }
            }
          ]
        },
        "orderResult": {
          "orderNum": "917131658934384601",
          "orderStatus": "UNPAID",
          "airOrderNum": "917131658934384601",
          "airOrderStatus": "UNPAID",
          "latestTktTime": "2023-11-09 13:47:00",
          "totalPrice": 4073,
          "currency": "CNY",
          "passengers": [
            {
              "firstName": "LIHONG",
              "lastName": "LIN",
              "psgType": "ADT",
              "ticketNum": "",
              "passengerIndex": 1
            }
          ],
          "contact": {
            "email": "test@pkfare.com",
            "firstName": "LIHONG",
            "lastName": "LIN",
            "mobile": "13800138000",
            "phoneCountryCode": "86",
            "phoneNum": "13800138000",
            "postCode": "100000",
            "address": "test address",
            "city": "Beijing",
            "country": "CN"
          },
          "journeys": [
            {
              "journeySeq": 0,
              "segments": [
                {
                  "airline": "VJ",
                  "flightNum": "896",
                  "departure": "DEL",
                  "departureDate": "2023-11-30",
                  "departureTime": "00:05",
                  "arrival": "SGN",
                  "arrivalDate": "2023-11-30",
                  "arrivalTime": "06:20",
                  "bookingCode": "I",
                  "codeShare": "N",
                  "equipment": "321",
                  "stopover": "",
                  "stayTime": 0
                },
                {
                  "airline": "VJ",
                  "flightNum": "632",
                  "departure": "SGN",
                  "departureDate": "2023-11-30",
                  "departureTime": "17:20",
                  "arrival": "DAD",
                  "arrivalDate": "2023-11-30",
                  "arrivalTime": "18:35",
                  "bookingCode": "I",
                  "codeShare": "N",
                  "equipment": "321",
                  "stopover": "",
                  "stayTime": 0
                }
              ]
            }
          ],
          "totalPrice": 4073,
          "currency": "CNY",
          "ancillary": [
            {
              "lastName": "LIN",
              "firstName": "LIHONG",
              "psgType": "ADT",
              "ancillaries": [
                {
                  "ancillaryType": 1,
                  "payBaggageType": 1,
                  "baggagePiece": 2,
                  "baggageWeight": "36KG",
                  "baggageCurrency": "CNY",
                  "baggagePrice": 95,
                  "journeys": [
                    {
                      "airline": "VJ",
                      "flightNum": "896",
                      "departure": "DEL",
                      "departureDate": "2023-11-30",
                      "departureTime": "00:05",
                      "arrival": "SGN",
                      "arrivalDate": "2023-11-30",
                      "arrivalTime": "06:20",
                      "bookingCode": "I"
                    },
                    {
                      "airline": "VJ",
                      "flightNum": "632",
                      "departure": "SGN",
                      "departureDate": "2023-11-30",
                      "departureTime": "17:20",
                      "arrival": "DAD",
                      "arrivalDate": "2023-11-30",
                      "arrivalTime": "18:35",
                      "bookingCode": "I"
                    }
                  ]
                }
              ]
            }
          ]
        }
      }
    }

Modified at 3 months ago

