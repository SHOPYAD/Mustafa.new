# CheckRefundPricing - PKFARE Flight Buyer API

POST/json/refundPricing/check

### Function

This API is used through RefundPricingId returned by the RefundPricing interface for the active query of the refund price.

### Error Code List

| error code | error message | description |
| --- | --- | --- |
| 0 | Ok | success |
| P001 | xxx is illegal | invalid parameters |
| B002 | Partner is not exists | Partner is not exists |
| B003 | Illegal sign | Illegal sign |
| B048 | Invalid buyer | Invalid buyer |
| B137 | RefundPricingId is not exist | RefundPricingId is not exist |
| S001 | System error | System error |

### 请求参数

Authentication

object {2} 

required

refundPricingId

string 

required

refundPricingId that returnd by refundPricing API

    {
      "authentication": {
        "sign": "",
        "partnerId": ""
      },
      "data": {
        "refundPricingId": "16786982431662414"
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

refund status： 1-Refund Pricing和Supplier Pricing，2-Refund Priced， 3-Canceled

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
        "merchantFee": 0,
        "needUploadFileId": 0,
        "orderNum": "917141251521581901",
        "passengerPriceList": [
          {
            "birthday": "1999-04-22",
            "cardNum": "K06065609",
            "cardType": "P",
            "firstName": "Hoi Ching",
            "lastName": "Ng",
            "segmentList": [
              {
                "airPnr": "42NN8L",
                "arrival": "TPE",
                "bookingCode": "N",
                "cabinClass": "ECONOMY",
                "departure": "HKG",
                "flightNum": "CI924",
                "pnr": "42NN8L",
                "segmentNo": 1,
                "ticketNum": "29770346473"
              },
              {
                "airPnr": "42NN8L",
                "arrival": "HKG",
                "bookingCode": "N",
                "cabinClass": "ECONOMY",
                "departure": "TPE",
                "flightNum": "CI921",
                "pnr": "42NN8L",
                "segmentNo": 1,
                "ticketNum": "29770346473"
              }
            ],
            "sex": "F"
          }
        ],
        "refundPriceId": "17142189997610810",
        "refundPricingStatus": "refund pricing",
        "refundReason": 0,
        "refundType": 0
      },
      "errorCode": "0",
      "errorMsg": "ok"
    }

Modified at 5 个月前

