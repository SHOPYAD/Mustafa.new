# CheckRefund - PKFARE Flight Buyer API

POST/json/refund-api/checkRefund

### Function

This API is used to inquire about the progress of the refund order refund. The purchaser initiates a request based on the refund order number. After the application and verification is successful, the refund progress information will be returned.

### Error Code List

| error code | error message | description |
| --- | --- | --- |
| 0 | ok | success |
| S001 | System error | System error |
| P001 | xxx is illegal | illegal parameter |
| P001 | xxx is missing | missing parameters |
| B002 | Partner is not exists | Partner is not exists |
| B003 | Illegal sign | Illegal signature |
| B048 | Invalid buyer | invalid buyer |
| B035 | Concurrency limited. Please contact PKFARE API support team for assistant. | Concurrency limited. Please contact PKFARE API support team for assistant. |
| B037 | Order is not exist | Order is not exist |
| B141 | Order is not a refund order. | Order is not a refund order. |

### 请求参数

Authentication

object {2} 

required

PKFARE order number- refund order

    {
      "authentication": {
        "partnerId": "",
        "sign": ""
      },
      "data": {
        "orderNum": "916783298501993902"
      }
    }

### 示例代码

### Responses

error code，refer to error code list

warningMsg

string 

required

Return data, will not be empty when error code is "0".

PKFARE refund order number

parentOrderNum

string 

optional

PKFARE Parent Order number of this refund order, it could be issued order number or change order number

refOrderNum

string 

required

PKFARE general order number, it may include more orders

createTime

string 

required

Order creation time, format yyyy-MM-dd HH:mm:ss，Beijing time(UTC+0)

passengerPriceList

array \[object {11}\] 

required

Passenger and refund pricing information

refundType

integer 

required

Refund type：0-Voluntary, 1-Involuntary

refundReason

integer 

required

Refund reason：0-Personal Reason, 1-Illness Reason, 2-Schedule Change Reason, 3-Crisis Reason， 4-Visa Refusal

orderStatus

string 

required

platingCarrier

string 

required

journeys

array \[object {7}\] 

required

    {
      "data": {
        "airPnr": "7C/Z4UPFY",
        "createTime": "2024-04-28 00:58:53",
        "journeys": [
          {
            "arrivalDate": "2024-05-04",
            "arrivalTime": "23:45",
            "departureDate": "2024-05-04",
            "departureTime": "21:10",
            "journeyTime": 275,
            "segments": [
              {
                "airline": "7C",
                "arrival": "HAN",
                "arrivalDate": "2024-05-04",
                "arrivalTerminal": "1",
                "arrivalTime": "23:45",
                "bookingCode": "H",
                "cabinClass": "Economy",
                "codeShare": "0",
                "departure": "ICN",
                "departureDate": "2024-05-04",
                "departureTerminal": "1",
                "departureTime": "21:10",
                "equipment": "7M8",
                "flightNum": "2803",
                "flightTime": 275,
                "opFltAirline": ""
              }
            ]
          }
        ],
        "orderNum": "917141403397252302",
        "orderStatus": "REFD_RQ",
        "parentOrderNum": "917141403397252301",
        "passengerPriceList": [
          {
            "birthday": "1994-06-30",
            "cardType": "",
            "firstName": "quang ninh",
            "lastName": "Pham",
            "nationality": "VN",
            "psgType": "ADT",
            "segmentList": [
              {
                "airPnr": "7C/Z4UPFY",
                "arrival": "HAN",
                "bookingCode": "H",
                "cabinClass": "Economy",
                "departure": "ICN",
                "flightNum": "7C2803",
                "pnr": "5KAK9C",
                "segmentNo": 1,
                "ticketNum": "8062022260623"
              }
            ],
            "sex": "M"
          }
        ],
        "platingCarrier": "7C",
        "pnr": "5KAK9C",
        "refOrderNum": "9171414033972523",
        "refundReason": 0,
        "refundType": 0
      },
      "errorCode": "0",
      "errorMsg": "ok"
    }

Modified at 5 个月前

