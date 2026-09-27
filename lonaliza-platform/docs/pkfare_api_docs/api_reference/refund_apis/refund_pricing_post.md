# Refund Pricing - PKFARE Flight Buyer API

POST/json/refundPricing/generate

### Function

This API is used for price inquiries for refunded tickets. The purchaser request initiates an application according to the order number and the ticket number for which the refund is to be processed. After the application and verification is successful, the system will generate a Refund Pricing inquiry record in the system.

`Note` This API provides Postman examples, which you can obtain by contacting your account manager.

### Error Code List

| error code | error message | description |
| --- | --- | --- |
| 0 | Ok | success |
| P001 | xxx is illegal | invalid parameters |
| B002 | Partner is not exists | invalid partner |
| B003 | Illegal sign | Illegal sign |
| B048 | Invalid buyer | Invalid buyer |
| B037 | Order is not exist | Order is not exist |
| S001 | System error | system error |
| B134 | Refund is not applicable for passenger \[pax name\] | The passenger and ticket in the application already have an associated voided ticket or refund order and the status of the voided ticket or refund order is valid, and it is not allowed to initiate another refund offer application. |
| B142 | Passenger or ticket number is not in the order | The order number in the request does not match the passenger or ticket number |
| B143 | Involuntary Refund is not applicable to check refundable price, please request refund request directly. | Refund Pricing does not provide quotes for Involuntary Refund. |
| B136 | This is not all passengers and routings of the order, please kindly check. | The parameter "allPaxOfOrder" is 1, but part of the ticket information is missing from the pnrList. |
| B146 | Order#\[Order number\] is not applicable for refund. | The order in the request is not a ticket issuance or change order and cannot be requested for a refund. |
| B140 | Refund is not applicable for ticket number \[ticket number\] | The ticket in the application is found to have a status of USED for all segments after the ticket is extracted, and it is not allowed to initiate a refund offer request again. |
| B147 | Ticket(s) \[ticket number\] is No-show, refund is not applicable. | The ticket in the application has exceeded the No-show time limit and no refunds are allowed. |
| B145 | Passenger(s) must request to refund same routing for one time. If routing is varies, please request per passenger. | In the case of multiple passengers, the itineraries for which refunds are requested must be the same. If the itineraries are not identical, the itinerary must be as requested by the passenger |
| B148 | UploadFileId is not exist. | The Upload Filed ID in the request does not exist |
| B150 | This order was changed, please kindly use change order number. | The order number specified in the request is the original order, and the passenger+segment specified in the PnrList already has a change order |
| B152 | pnrList information is not same as order, please kindly check. | In the request, the journey of the order number and the information of the pnrList do not match |
| B166 | Please request refund for whole routings of the ticket(s). | For some GDS orders, the system rules do not allow partial refund, please re-try by selecting the whole journey |
| B168 | Ticket is not applicable to check refund pricing, please call refund request directly. | In the request, if the ticket has been confirmed and reissued, the rules could not be applied automatically and please raise Refund Request directly |
| B190 | Please select all passengers and segments before submitting. | In cases of refund for the whole order, please select every passengers and segments before sending the request. |

### 请求参数

Authentication

object {2} 

required

allPaxOfOrder

integer 

required

tag for all passengers，0-No，1-Yes。If the value is “1”, system will check whether pnrlist includes all passengers.

refundType

integer 

required

Refund Type：0-Voluntary, 1-Involuntary

refundReason

string 

required

Refund reason：0-Personal Reason, 1-Illness Reason, 2-Schedule Change Reason, 3-Crisis Reason， 4-Visa Refusal

uploadedFileIds

array\[string\]

optional

File ID, At most 99 files are supported.

pnrList

array \[object {9}\] 

required

PNR list and ticket number list.

canceledReservationBeforeDeparture

integer 

optional

PNR has been canceled. 0-PNR has not yet been canceled. 1-PNR has been canceled before departure. If the element was not indicated, it will be consider as 0-PNR has not yet been canceled.

    {
      "authentication": {
        "partnerId": "",
        "sign": ""
      },
      "data": {
        "allPaxOfOrder": 0,
        "canceledReservationBeforeDeparture": 0,
        "refundReason": 2,
        "refundType": "1",
        "uploadedFileIds": [
          "42cf3947df03da6ce1555729c11745eb"
        ],
        "orderNum": "916783592892089401",
        "pnrList": [
          {
            "arrival": "SEA",
            "bookingCode": "string",
            "cabinClass": "string",
            "departure": "LAX",
            "flightNum": "DL1473",
            "segmentNo": 1,
            "ticketNums": [
              {
                "birthday": "2003-05-11",
                "cardNum": "string",
                "cardType": "string",
                "firstName": "Joshua",
                "pnr": "AB8SED",
                "airPnr": "AB8SED",
                "lastName": "Perez",
                "sex": "M",
                "ticketNum": "123456"
              }
            ]
          }
        ]
      }
    }

### 示例代码

### Responses

error code，refer to error code list

warningMsg

string 

optional

The returned data, this parameter is not empty only when the error code returns "0"

refundPriceId

string 

required

refundPricingStatus

string 

required

refund status： 1-Refund Pricing and Supplier Pricing，2-Refund Priced， 3-Canceled

lastComfirmTime

string 

optional

last mintue to confirm refund; YYYY-MM-DD HH:MM (UTC+0)

passengerPriceList

array \[object {8}\] 

required

the flight segments that are refunded and price information

refundType

integer 

required

refund type：0-Voluntary, 1-Involuntary -

refundReason

integer 

required

reasons for refund：0-Personal Reason, 1-Illness Reason, 2-Schedule Change Reason, 3-Crisis Reason， 4-Visa Refusal

needUploadFileId

integer 

required

When submit refund request, sometimes the supporting documents are needed, including passport photo and so on; 0-no need; 1-need

    {
      "data": {
        "lastConfirmTime": "2024-04-27 11:24:10",
        "merchantFee": 0,
        "needUploadFileId": 0,
        "orderNum": "917138447433426701",
        "passengerPriceList": [
          {
            "birthday": "1981-06-19",
            "cardType": "",
            "firstName": "KIM",
            "lastName": "JUNGWOOK",
            "segmentList": [
              {
                "airPnr": "LZPIZS",
                "arrival": "TAG",
                "bookingCode": "H",
                "cabinClass": "ECONOMY",
                "departure": "PUS",
                "flightNum": "7C2151",
                "pnr": "LZPIZS",
                "segmentNo": 1,
                "ticketNum": "8065401551090"
              }
            ],
            "sex": "M",
            "solutions": [
              {
                "currency": "USD",
                "formOfPayment": "Depends on payment method",
                "nonRefundableAmount": 0,
                "paidAmount": 86.24,
                "refundAmount": 9.02,
                "refundServiceFee": 8,
                "usedAmount": 69.22
              }
            ]
          },
          {
            "birthday": "2020-06-26",
            "cardType": "",
            "firstName": "KIM",
            "lastName": "JINSEO",
            "segmentList": [
              {
                "airPnr": "LZPIZS",
                "arrival": "TAG",
                "bookingCode": "H",
                "cabinClass": "ECONOMY",
                "departure": "PUS",
                "flightNum": "7C2151",
                "pnr": "LZPIZS",
                "segmentNo": 1,
                "ticketNum": "8065401551090"
              }
            ],
            "sex": "M",
            "solutions": [
              {
                "currency": "USD",
                "formOfPayment": "Depends on payment method",
                "nonRefundableAmount": 0,
                "paidAmount": 86.24,
                "refundAmount": 9.02,
                "refundServiceFee": 8,
                "usedAmount": 69.22
              }
            ]
          }
        ],
        "refundPriceId": "917138447433426701",
        "refundPricingStatus": "2",
        "refundReason": 0,
        "refundType": 0,
        "warningMsg": ""
      },
      "errorCode": "0",
      "errorMsg": "Ok"
    }

