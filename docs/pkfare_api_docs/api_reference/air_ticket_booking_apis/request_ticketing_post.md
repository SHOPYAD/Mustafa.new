# RequestTicketing - PKFARE Flight Buyer API

## Function Description

Using the TicketingRequest API, users can send ticket issuance reminders for flight orders.

1.  You can only prompt ticket issuance for flight orders. It does not support ticket issuance reminders for ancillary orders.
2.  It supports simultaneous ticket issuance reminders for multiple orders. The same order can only be prompted once within a 10-minute period.

## Target Reader

The RequestTicketing interface documentation is intended for web developers, maintenance and managers with some web development skills, an understanding of one of the major development languages such as Java, Python, ASP.NET, PHP, Node.js, and a basic knowledge of HTTP network protocols.

## URLs

| Version | Sandbox Invoking Address | Update |
| --- | --- | --- |
| requestTicketing | [http://api.pkfare.com/requestTicketing]() |  |
| requestTicketing(json format) | [http://api.pkfare.com/json/requestTicketing]() | Support json formatted requesting structure |

## Error Code List

| erroCode | erroMsg | Description |
| --- | --- | --- |
| 0 | ok | Request has been processed successfully. |
| S001 | System error | System error |
| S002 | timeout | Request timeout |
| P001 | - | Parameter is illegal |
| B037 | Order is not exists. | Order is not exists. |
| B179 | Duplicate ticketing request within 10 minutes. | Duplicate ticketing request for the same order within 10 minutes. |
| B180 | The order status is not issuing. | Only Issuing order can be used in this API. |
| B181 | The ticketing reminder list contains more than 100 orders. | The ticketing reminder list contains more than 100 orders. |

### Request

Authentication

object {2} 

required

issuingOrdersPush

array\[string\]

required

Ticket issuance reminder order list. PKFARE orders

    {
      "authentication": {
        "partnerId": "",
        "sign": ""
      },
      "data": {
        "issuingOrdersPush": [
          "cillum dolore Ut"
        ]
      }
    }

### Request samples

### Responses

HTTP Code: 200

Content Type : JSON

error code,refer to Error Code List

data

array \[object {3}\] 

optional

Showing details of failed ticket issuance orders.

Order numbers for failed ticket issuance orders. 【PKFARE】Order Number

Error codes for failed ticket issuance orders. error code,refer to Error Code List

Error messages for failed ticket issuance orders. error message,refer to Error Code List

    {
      "errorCode": "0",
      "errorMsg": "OK",
      "data": []
    }

Modified at 3 months ago

