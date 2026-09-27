# RefundRequest - PKFARE Flight Buyer API

POST/json/refund-api/refundRequest

### Function Description

Through RefundRequest API, you are able to request with the passenger who wuold like to make a refund on which segment. System will create a refund request(which is refund order). If you have got a refund pricing ID, which is still valid, you can request with refund pricing ID. If you don't have refund pricing ID, you can make a refund request directly withou refund pricing ID. System will create refund request accordingly.

### Error Code List

| errorCode | errorMsg | Description |
| --- | --- | --- |
| 0 | ok | Success |
| S001 | System error | System error |
| P001 | xxx is illegal | Request parameter is illegal, xxx will display request parameter |
| P001 | xxx is missing | Request parameter is required, xxx will display request parameter |
| B002 | Partner is not exists | Partner is not exists. |
| B003 | Illegal sign | Signature is illegal |
| B048 | Invalid buyer | Buyer is invalid, please contact PKFARE account manager |
| B037 | Order is not exist | Order is not exist |
| B035 | Concurrency limited. Please contact PKFARE API support team for assistant. | Request is over the limiation of concurrency. |
| B134 | Refund is not applicable for passenger \[passenger name\] | Passenger or segment in the request has already request for refund or void, which order status is processing or completed. |
| B135 | Passenger or ticket number is not in the order | Passenger or ticket number in the request is not same as order. |
| B136 | This is not all passengers and routings of the order, please kindly check | "allPaxOfOrder" is 1，but pnrList does not contains all passenger and routings. |
| B137 | RefundPricing is not exist | Refund Pricing ID is not exist |
| B145 | Passenger(s) must request to refund same routing for one time. If routing is varies, please request per passenger. | Multiple passengers request for refund different segments in this request. Please raise refund per passenger. |
| B146 | Order#\[Order number\] is not applicable for refund. | Order number in the request is not issue order and not change order. Refund is not allowed. |
| B149 | Refund Pricing ID#(Refund Pricing ID) has been expired. Please check refund pricing again. | Refund Pricing ID has been expired. |
| B150 | This order was changed, please kindly use change order number. | Passenger and segment in PnrList has requested for change, please use change order number. |
| B152 | pnrList information is not same as order, please kindly check. | pnrList in the request is not same as order. |
| B153 | Duplicated refund request, please kindly check | Passenger and segment in the request has already submit refund, and the refund is still in processing. System does not allow to request again. |
| B154 | pnrList information is not same as refund pricing ID, please kindly check | PnrList information in the request is not same as refund pricing ID, please kindly check. |
| B190 | Please select all passengers and segments before submitting. | In cases of refund for the whole order, please select every passengers and segments before sending the request. |

### 请求参数

Authentication

object {2} 

required

allPaxOfOrder

integer 

required

Identifier for all passengers of the order, 0-No，1-Yes. If request with "1", system will validate whether the request contains all passengers and routings of the order.

refundPricingId

string 

optional

Refund Pricing ID which is returned in Refund Pricing API or Check Refund Pricing API.

PKFARE order number, issued order and change order are supported.

refundType

integer 

required

Refund request type:0-Voluntary, 1-Involuntary.

refundReason

integer 

required

Refund reason：0-Personal Reason, 1-Illness Reason, 2-Schedule Change Reason, 3-Crisis Reason， 4-Visa Refusal

contactPerson

string 

optional

Contact person for refund order. The contact information from Origin Order will be used if contactPerson is not in the request.

Email for refund order. The email from Origin Order will be used if email is not in the request.

Contact telephone number for refund order. The contact information from Origin Order will be used if telNum is not in the request.

uploadFilesIds

array\[string\]

optional

File Id, support 99 files per request

pnrList

array \[object {9}\] 

required

PNR and ticket information

canceledReservationBeforeDeparture

integer 

optional

PNR has been canceled. 0-PNR has not yet been canceled. 1-PNR has been canceled before departure. If the element was not indicated, it will be consider as 0-PNR has not yet been canceled.

    {
      "authentication": {
        "sign": "",
        "partnerId": ""
      },
      "data": {
        "refundPricingId": "16787330658156729",
        "allPaxOfOrder": 1,
        "orderNum": "916783290901993901",
        "pnrList": [
          {
            "airPnr": "EDTCZP",
            "arrival": "SIN",
            "bookingCode": "E",
            "cabinClass": "ECONOMY",
            "departure": "HKG",
            "flightNum": "CX635",
            "pnr": "EDTCZP",
            "segmentNo": "1",
            "ticketNums": [
              {
                "birthday": "2003-01-09",
                "cardNum": "P1234567",
                "cardType": "P",
                "firstName": "CHUN",
                "lastName": "XIN",
                "sex": "M",
                "ticketNum": "EDTCAA"
              }
            ]
          }
        ],
        "refundReason": 0,
        "refundType": 0,
        "uploadFilesIds": [
          "7a570c0877099e8faaaa"
        ]
      }
    }

### 示例代码

### Responses

Error Code, 0-Success，Others-Failed

warningMsg

string 

optional

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

Refund reasons：0-Personal Reason, 1-Illness Reason, 2-Schedule Change Reason, 3-Crisis Reason， 4-Visa Refusal

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
      "errorCode": "0",
      "errorMsg": "ok",
      "data": {
        "orderNum": "916783298501993902",
        "parentOrderNum": "916783298501993901",
        "refOrderNum": "9167832985019939",
        "createTime": "2023-03-10 10:04:02",
        "passengerPriceList": [
          {
            "segmentList": [
              {
                "segmentNo": 2,
                "departure": "YVR",
                "arrival": "MEX",
                "flightNum": "AC996",
                "cabinClass": "ECONOMY",
                "bookingCode": "P"
              }
            ],
            "lastName": "YANG",
            "firstName": "TIFFANYBVC",
            "cardType": "P",
            "cardNum": "E07700466",
            "sex": "F",
            "birthday": "1990-08-23"
          }
        ],
        "refundType": "0",
        "refundReason": "0",
        "orderStatus": "Under review",
        "pnr": "NGLVYT",
        "platingCarrier": "AC",
        "journeys": [
          {
            "journeyTime": 815,
            "segments": [
              {
                "airline": "AC",
                "flightNum": "996",
                "equipment": "7M8",
                "cabinClass": "ECONOMY",
                "bookingCode": "P",
                "departure": "YVR",
                "arrival": "MEX",
                "departureTerminal": "",
                "arrivalTerminal": "",
                "departureDate": "2023-02-17",
                "arrivalDate": "2023-02-17",
                "departureTime": "16:30",
                "arrivalTime": "23:50",
                "flightTime": 440,
                "codeShare": "N"
              }
            ],
            "departureTime": "10:15",
            "arrivalTime": "23:50",
            "departureDate": "2023-02-17",
            "arrivalDate": "2023-02-17"
          }
        ]
      }
    }

