# AncillaryTicketing - PKFARE Flight Buyer API

## Function

Through AncillaryTicketing API, you can request PKFARE to deduct ancillary order payment (currently only Prepay is supported).  
It’s not allowed to pay multiple ancillary orders with the same ancillary product type at the same time.  
After the payment, the status of the ancillary order will turn to be issued.

## Error Code List

| errorCode | errorMsg |
| --- | --- |
| 0 | ok |
| S001 | System error |
| P001 | ancillaryOrderNum is illegal |
| B002 | Partner is not exists |
| B003 | Illegal sign |
| B009 | Order status is invalid |
| B010 | Order number not exist |
| B022 | Ticketing failed |
| B024 | Order has been paid |
| B082 | It\'s not allowed to pay multiple ancillary orders with the same ancillary type at the same time. |

### Request

Authentication

object {2} 

required

ticketing

object {1} 

required

ancillaryOrderNum

string 

required

PKFARE ancillary order number, which is returned from AncillaryBooking

    {
      "authentication": {
        "sign": "",
        "partnerId": ""
      },
      "ticketing": {
        "ancillaryOrderNum": "917049521951368303"
      }
    }

### Request samples

### Responses

HTTP Code: 200

Content Type : JSON

error code, refer to Error Code List

Only if the errorCode returns "0", returned data would not be null.

ancillaryOrderNum

string 

optional

PKFARE ancillary order number

orderAmount

integer 

optional

transactionExpense

integer 

optional

payAmount

integer 

optional

    {
      "errorCode": "0",
      "errorMsg": "ok",
      "data": {
        "ancillaryOrderNum": "917134367036776903",
        "orderAmount": 21,
        "transactionExpense": 0,
        "payAmount": 21
      }
    }

Modified at a year ago

