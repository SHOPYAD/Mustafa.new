# Ticketing - PKFARE Flight Buyer API

## Function

Through Ticketing API, users can request PKFARE to deduct credits (currently only Prepay and Alipay are supported). Ticket numbers would be provided by TickeitngNumPush or orderDetail API.

## Versioning

| Version | Sandbox Invoking Address | Update |
| --- | --- | --- |
| ticketing | [https://api.pkfare.com/ticketing]() |  |
| ticketing (json format) | [https://api.pkfare.com/json/ticketing]() | Support json-formatted requesting strcuture |

_Below is the most updated version._

## Error Code List

| errorCode | errorMsg | Description |
| --- | --- | --- |
| 0 | ok | request has been processed successfully |
| S001 | System error | system error |
| P001 | - | wrong parameter |
| B002 | Partner is not exists | partnerID does not exist |
| B003 | Illegal sign | illegal sign. Please check your signature |
| B009 | Order status is invalid | order status is invalid |
| B010 | Order number not exist | order number does not exist |
| B022 | Ticketing failed | balance left is not enough to pay the order |
| B024 | Order has been paid | order has already been paid. No need to pay again |

### Request

authentication

object {2} 

required

ticketing

object {5} 

required

PNR returned by PreciseBooking

email address \[to receive schedule-changed notice\]

contact name, formatted with \"last name/first name\" or \"first name\"

    {
      "authentication": {
        "partnerId": "",
        "sign": ""
      },
      "ticketing": {
        "email": "jango.wang@pkfare.com",
        "name": "Jango/Wang",
        "orderNum": "1012674912",
        "telNum": "13249073855",
        "PNR": "KHZ1WU"
      }
    }

### Request samples

### Responses

HTTP Code: 200

Content Type : JSON

error code; refer to error code list

only if the errorCode returns \"0\", returned data would not be null. Data is in JSON format, which contains three collection objects: solutions, flights, segments

order number in PKFARE system

orderAmount

integer 

optional

transactionExpense

number 

optional

    {
      "errorCode": "0",
      "errorMsg": "ok",
      "data": {
        "orderNum": "1012704540",
        "orderAmount": 2015,
        "transactionExpense": 2.02,
        "payAmount": 2017.02
      }
    }

Modified at 3 months ago

