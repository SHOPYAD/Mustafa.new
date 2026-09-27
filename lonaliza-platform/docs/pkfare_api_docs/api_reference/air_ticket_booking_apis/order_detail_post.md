# OrderDetail - PKFARE Flight Buyer API

## Function

Through OrderDetail_V9 API, users can check order details including all journey details, ancillary bookings, order status, Airline's PNR schedule change history.

Besides, users could check more detailed schedule change acceptance status regarding a specific flight change.

## Versioning

| Version | Sandbox Invoking Address | Update |
| --- | --- | --- |
| OrderDetail | [https://api.pkfare.com/orderDetail/v2?param=reqParam]() |  |
| OrderDetail_V3 | [https://api.pkfare.com/orderDetail/v3?param=reqParam]() | Paid baggage information is available in order details. |
| OrderDetail_V4 | [https://api.pkfare.com/orderDetail/v4?param=reqParam]() |  |
| OrderDetail_V5 | [https://api.pkfare.com/orderDetail/v5?param=reqParam]() | Schedule change information is available in order details. |
| OrderDetail_V6 | [https://api.pkfare.com/orderDetail/v6?param=reqParam]() | Infant ticket info is available in order details. Ticket voidable info and reject info for change orders is provided. ScheduleChange is optional in includeFields. |
| OrderDetail_V7 | [http://api.pkfare.com/orderDetail/v7?param=reqParam]() | seat information is available in order details; Checkin information is available as well |
| OrderDetail_V7 (json format) | [http://api.pkfare.com/json/orderDetail/v7]() | seat information is available in order details; Checkin information is available as well; Support json-formatted requesting structure |
| OrderDetail_V8 (json format) | [http://api.pkfare.com/json/orderDetail/v8]() | Includes more details (message ID and acceptance status) for schedule change history information |
| OrderDetail_V9 (json format) | [http://api.pkfare.com/json/orderDetail/v9]() | Includes more details for passengers' associated seat information per flight |
| OrderDetail_V10 (json format) | [http://api.pkfare.com/json/orderDetail/v10]() | Includes more details for different product tags, including PKFARE-defined special product types and airline-standard branded fares, etc. |

## Order Status List

| Order Status List |  |
| --- | --- |
| Enum | Description |
| ISS_PRC | Ticket is issuing. |
| CHG_PRC | Change order is proceeding. |
| REFD_PRC | Refund order is proceeding. |
| VOID_PRC | Ticket is voiding. |
| TO_BE_PAID | To be Paid. |
| ISSED | Ticket issued. |
| TO_BE_RSV | To be reserved. |
| UNDER_REVIEW | Under review. |
| HOLD | Order is holding manually, please contact customer service for further action. |
| RSV_FAIL | Reservation failed |
| CLOSED | Order Closed. |
| CNCL | Order Cancelled. |
| CNCL_TO_BE_REIM | Order Cancelled, and reimbursement is under processing. |
| CNCL_REIMED | Order Cancelled, and payment has been reimbused. |
| CHG_RQ | Change Order is requested. |
| CHG_TO_BE_PAID | Change Order is to be paid. |
| CHG_REJ | Change Order is rejected. |
| CHGD | Change Order is changed. |
| REDF_RQ | Refund Order is under review. |
| REFD_REJ | Refund Order is rejected. |
| REFD_TO_BE_REIM | Refunded to be reimbursed. |
| REFD_REIMED | Refunded and reimbursed. |
| REFD | Refunded |
| VOID_REJ | Void request is rejected. |
| VOID_TO_BE_REIM | Void to be reimbursed. |
| VOID_REIMED | Void and reimbursed |
| VOID | Void |

## Error Code List

| erroCode | erroMsg | Description |
| --- | --- | --- |
| 0 | ok | Request has been processed successfully. |
| S001 | System error | System error |
| S002 | timeout | Request timeout |
| P001 | - | Parameter is illegal |
| B002 | Partner is not exists. | PartnerID does not exist |
| B003 | Illegal sign | Illegal sign. Please check your signature |
| B048 | Invalid buyer | Request buyer is not matched with order. |
| B037 | Order is not exists. | Order is not exist. |

### Request

Authentication

object {2} 

required

includeFields

string 

required

User could request with 6 options: passengers, journeys, solutions, cillary, scheduleChange, checkinInfo. The "passenger" and "solutions" is required, while the remaining items are optional.

    {
      "authentication": {
        "partnerId": "",
        "sign": ""
      },
      "data": {
        "orderNum": "917133223962851001",
        "includeFields": "passengers,journeys,solutions,ancillary,scheduleChange,checkinInfo"
      }
    }

### Request samples

### Responses

HTTP Code: 200

Content Type : JSON

error code, refer to Error Code List

Only if the errorCode returns "0", returned data would not be null. Data is refer to Data

orderStatus

string 

required

Order Status，refer to Order Status List

parentOrderNum

string 

optional

【PKFARE】Applicatable to VOID/CHANGE/REFUND order. For VOID order, this is original ticketing order number. For CHANGE order, this is original ticketing order number or previous change order number. For REFUND order, this is original ticketing order number or previous change order number.

refOrderNum

string 

required

【PKFARE】Main order number, it could be consider as the original ticketing order number, it will related with multiple orders if VOID/CHANGE/REFUND requested.

extOrderNum

string 

optional

【PKFARE】Special Remark order number

Order type: O-Ticketing Order, V-Void Order, C-Change Order, R-Refund Order

createdTime

string 

required

Order created time, format: yyyy-mm-dd hh:ss:mm (GMT)

postingDate

string 

required

Order completed time. For Ticketing and Change order, it is ticketing time. For Void order, it is voided time. For Refund order, it is refunded time. Format: yyyy-mm-dd hh:ss:mm (GMT)

permitVoid

integer 

required

Allow to void ticket or not. \[1-yes, 0-not allow\]

lastVoidTime

string 

optional

Voiding deadline. Voiding operation would not be allow after lastVoidTime. (GMT) \[yyyy-mm-dd hh : mm :ss\]

voidServiceFee

number 

optional

rejectReason

string 

optional

A reference number in the PKFARE's sysrem

pnrList

array \[object {9}\] 

required

PNR list as per passengers and flight segments\[When it is empty, please check airPNR under data object\]

platingCarrier

string 

required

Form of payment, Alipay or prepayment

paySerialNum

string 

required

Serial Number of payment transaction

passengers

array \[object {13}\] 

required

journeys

array \[object {7}\] 

required

solutions

array \[object {43}\] 

required

lastTktTime

string 

required

latest ticketing time (GMT)

ancillaryItems

array \[object {6}\] 

required

ancillary order information

scheduleChangeList

array \[object {4}\] 

required

Schedule Change information, the latest version is current routing

checkInInfos

array \[object {8}\] 

required

    {
      "errorCode": "0",
      "errorMsg": "ok",
      "data": {
        "orderStatus": "ISSED",
        "orderNum": "917070354395357001",
        "refOrderNum": "9170703543953570",
        "extOrderNum": "123456789",
        "orderType": "O",
        "createdTime": "2024-02-04 16:30:40",
        "postingDate": "2024-02-04 16:31:13",
        "pnr": "6y6d34",
        "airPnr": "C3pyn0",
        "platingCarrier": "VJ",
        "payGate": "Prepay",
        "paySerialNum": "PREPAY_20240204163055_917070354395357001_2477",
        "passengers": [
          {
            "firstName": "SHASHA",
            "lastName": "XIA",
            "psgType": "ADT",
            "nationality": "CN",
            "sex": "M",
            "birthday": "2003-03-23",
            "cardType": "P",
            "cardNum": "E11887134",
            "cardExpiredDate": "2027-03-31",
            "ticketNum": "C3pyn0",
            "passengerIndex": 1,
            "seats": [
              {
                "airline": "VJ",
                "flightNum": "813",
                "seatNum": "30C"
              }
            ]
          }
        ],
        "journeys": [
          {
            "journeyTime": 145,
            "transferCount": 0,
            "segments": [
              {
                "airline": "VJ",
                "flightNum": "813",
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
                "equipment": "321",
                "stopover": "",
                "stayTime": 0,
                "strDepartureDate": "2023-11-30",
                "strDepartureTime": "00:05",
                "strArrivalDate": "2023-11-30",
                "strArrivalTime": "06:20"
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
        ],
        "scheduleChangeList": [
          {
            "messageId": "1234567",
            "messageCreateTime": "2023-02-22 15:07:10",
            "orderAirlinePnr": "CX/WCK5N6|AA/HMMRAK",
            "orderNum": "916727111389870001",
            "orderPnr": "HMMRRJ",
            "sensitivityLevel": "1",
            "changeFlightList": [
              {
                "journeySeq": "1",
                "segments": [
                  {
                    "airline": "AA",
                    "arrival": "DFW",
                    "arrivalDate": "2023-12-03",
                    "arrivalTime": "16:50",
                    "bookingCode": "C5",
                    "cabinClass": "FIRST",
                    "codeShare": "N",
                    "departure": "HKG",
                    "departureDate": "2023-11-24",
                    "departureTime": "14:20",
                    "equipment": "77W",
                    "flightNum": "126",
                    "stayTime": 0,
                    "stopover": ""
                  }
                ]
              }
            ],
            "originFlightList": [
              {
                "journeySeq": "1",
                "segments": [
                  {
                    "airline": "AA",
                    "arrival": "DFW",
                    "arrivalDate": "2023-12-02",
                    "arrivalTime": "16:50",
                    "bookingCode": "C5",
                    "cabinClass": "FIRST",
                    "codeShare": "N",
                    "departure": "HKG",
                    "departureDate": "2023-11-26",
                    "departureTime": "14:20",
                    "equipment": "77W",
                    "flightNum": "126",
                    "messageType": "2",
                    "stayTime": 0,
                    "stopover": "",
                    "messageType": 2
                  }
                ]
              }
            ],
            "passengers": [
              {
                "birthday": "2003-02-12",
                "cardExpiredDate": "2025-02-05",
                "cardNum": "89374924",
                "cardType": "PP",
                "firstName": "MARK",
                "lastName": "ZUO",
                "nationality": "US",
                "psgType": "ADT",
                "sex": "M",
                "ticketNum": "0063742676484"
              },
              {
                "birthday": "2003-04-01",
                "cardExpiredDate": "2025-03-25",
                "cardNum": "293874123",
                "cardType": "PP",
                "firstName": "DARRYL",
                "lastName": "COX",
                "nationality": "US",
                "psgType": "ADT",
                "sex": "F",
                "ticketNum": "0063742676484"
              }
            ]
          }
        ],
        "checkInInfos": [
          {
            "checkInUrl": "https://www.vietjetair.com/Sites/Web/en/Home",
            "checkInTime": "2023-11-29 00:00:00",
            "checkInDeadline": "2023-11-30 00:00:00",
            "checkInStatus": "NOT_CHECKED_IN",
            "passengers": [
              {
                "firstName": "SHASHA",
                "lastName": "XIA",
                "psgType": "ADT",
                "nationality": "CN",
                "sex": "M",
                "birthday": "2003-03-23",
                "cardType": "P",
                "cardNum": "E11887134",
                "cardExpiredDate": "2027-03-31",
                "ticketNum": "C3pyn0",
                "passengerIndex": 1
              }
            ]
          }
        ]
      }
    }

Modified at 3 months ago

