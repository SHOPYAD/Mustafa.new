# ModifyOrderStatus - PKFARE Flight Buyer API

## Function Description

Using the ModifyOrderStatus API, users can set order status as 'ISSED' for flight orders if the current order status is 'Paid, to be issued' in **sandbox environment**.

Caution

#### You can only make ticket issuance for flight orders in the test environment. It does not support ticket issuance modification for the real orders.

## Target Reader

The ModifyOrderStatus interface documentation is intended for web developers, maintenance and managers with some web development skills, an understanding of one of the major development languages such as Java, Python, ASP.NET, PHP, Node.js, and a basic knowledge of HTTP network protocols.

## URLs

| Version | Sandbox Invoking Address | Update |
| --- | --- | --- |
| ModifyOrderStatus (jsonformat) | [https://api.pkfare.com/json/buyer/fake/modifyOrder]() |  |

### Request

Authentication

object {2} 

required

fakeModifyOrder

object {1} 

required

    {
      "authentication": {
        "partnerId": "",
        "sign": ""
      },
      "fakeModifyOrder": {
        "orderNum": "917167813545685601"
      }
    }

### Request samples

### Responses

HTTP Code: 200

Content Type : JSON

error code,refer to Error Code List

    {
      "errorCode": "0",
      "errorMsg": "ok"
    }

Modified at 3 months ago

