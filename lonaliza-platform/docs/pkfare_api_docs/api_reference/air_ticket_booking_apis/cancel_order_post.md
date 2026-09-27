# CancelOrder - PKFARE Flight Buyer API

## Function

Through Cancel API, users can cancel orders and PNRs generated in GDS by PKFARE. Cancel API is used for canceling orders before ticketing.

## Versioning

| Version | Sandbox Invoking Address | Update |
| --- | --- | --- |
| cancelOrder | [https://api.pkfare.com/cancel]() |  |
| cancelOrder (json format) | [https://api.pkfare.com/json/cancel]() | Support json-formatted requesting structure |

## Error Code List

| errorCode | errorMsg | Description |
| --- | --- | --- |
| 0 | ok | request has been processed successfully |
| S001 | System error | system error |
| P001 | - | wrong parameter |
| B002 | Partner is not exists | partnerID does not exist |
| B003 | Illegal sign | illegal sign. Please check your signature |
| B009 | Order status is invalid | order status is not to_be_paid |
| B010 | Order number not exist | order number does not exist |
| B037 | Order is not exists. OrderNum:XXX | Order is not exists |
| B041 | The order has been cancelled | Order has been canceled |

### Request

Authentication

object {2} 

required

cancel

object {2} 

required

orderNum returned from PreciseBooking

virtualPnr

string 

optional

    {
      "authentication": {
        "partnerId": "",
        "sign": ""
      },
      "cancel": {
        "orderNum": "917132752968703001",
        "virtualPnr": "WC7JP4"
      }
    }

### Request samples

### Responses

HTTP Code: 200

Content Type : JSON

    {
      "errorCode": "0",
      "errorMsg": "OK"
    }

Modified at 3 months ago

