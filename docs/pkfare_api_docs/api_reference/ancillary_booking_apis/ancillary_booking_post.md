# AncillaryBooking - PKFARE Flight Buyer API

## Function

You can add ancillary products and create an ancillary order in PKFARE through AncillaryBooking API. It is necessary to use AncillaryPricing service before using this interface.

## Error Code List

| errorCode | errorMsg |
| --- | --- |
| 0 | ok |
| S001 | System error. |
| P001 | XXX is illegal. |
| P002 | XXX is missing. |
| P006 | Invalid parameter. |
| B002 | Partner is not exists. |
| B003 | Illegal sign. |
| B005 | Can not find any matching ancillaryPricing result within 30 minutes. |
| B009 | Order status is invalid |
| B010 | The order was not found |
| B017 | Price is changed. |
| B029 | Duplicate reservations have been found for passenger XXX/XXX in order XXX. |
| B071 | Itinerary is different between request and order. |
| B075 | There are duplicate bookings and the same passenger is only allowed to choose one of baggage weights in the same journey. |

### Request

Authentication

object {2} 

required

airOrderNum

string 

required

buyerOrder

string 

optional

your order number if you want to store at PKFARE side

ancillaryBooking

object {1} 

required

ancillary booking information

baggages

array \[object {2}\] 

required

    {
      "authentication": {
        "sign": "{{}}",
        "partnerId": "{{}}"
      },
      "airOrderNum": "917049521951368301",
      "ancillaryBooking": {
        "baggages": [
          {
            "passenger": {
              "birthday": "2003-03-23",
              "firstName": "XiaoJun",
              "lastName": "Zhong",
              "psgType": "ADT",
              "sex": "M"
            },
            "products": [
              {
                "ancillaryKey": "38781f820e9ee25737d7b313410b5317"
              },
              {
                "ancillaryKey": "2781c40741271185391c4ef5dab51df5"
              }
            ]
          },
          {
            "passenger": {
              "birthday": "2003-03-23",
              "firstName": "Harris",
              "lastName": "Kaufman",
              "psgType": "ADT",
              "sex": "M"
            },
            "products": [
              {
                "ancillaryKey": "38781f820e9ee25737d7b313410b5317"
              },
              {
                "ancillaryKey": "2781c40741271185391c4ef5dab51df5"
              }
            ]
          },
          {
            "passenger": {
              "birthday": "2015-03-23",
              "firstName": "Yue",
              "lastName": "Hong",
              "psgType": "CHD",
              "sex": "M"
            },
            "products": [
              {
                "ancillaryKey": "38781f820e9ee25737d7b313410b5317"
              },
              {
                "ancillaryKey": "2781c40741271185391c4ef5dab51df5"
              }
            ]
          }
        ]
      }
    }

### Request samples

### Responses

HTTP Code: 200

Content Type : JSON

error code, refer to Error Code List

baggageOrder

object {3} 

optional

    {
      "errorCode": "0",
      "errorMsg": "ok",
      "data": {
        "baggageOrder": {
          "ancillaryOrderNum": "917134367036776903",
          "baggages": [
            {
              "passenger": {
                "birthday": "2003-03-23",
                "firstName": "Vivian",
                "lastName": "Guo",
                "psgType": "ADT",
                "sex": "M"
              },
              "baggageDetails": [
                {
                  "ancillaryKey": "51b015fc291b71604b8fd1325a883602",
                  "payBaggageType": 1,
                  "baggagePiece": 1,
                  "baggageWeight": "10KG",
                  "baggageCurrency": "CNY",
                  "baggagePrice": 21,
                  "journey": [
                    {
                      "airline": "TR",
                      "flightNum": "307",
                      "departure": "SGN",
                      "departureDate": "2024-05-18",
                      "departureTime": "15:15",
                      "arrival": "SIN",
                      "arrivalDate": "2024-05-18",
                      "arrivalTime": "18:20",
                      "bookingCode": "O",
                      "cabinClass": "ECONOMY"
                    }
                  ]
                }
              ]
            }
          ]
        }
      }
    }

Modified at a year ago

