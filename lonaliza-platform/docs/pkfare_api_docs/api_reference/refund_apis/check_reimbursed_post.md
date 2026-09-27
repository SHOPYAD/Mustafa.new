# CheckReimbursed - PKFARE Flight Buyer API

POST/json/refundReimburse/check

### Function Description

Through CheckReimbursed API, you are able to request with a order number to check reimbursement status.

### Error Code List

| Error Code | Error Message | Description |
| --- | --- | --- |
| 0 | Ok | Success |
| P001 | xxx is illegal | Request parameter is illegal, xxx will display request parameter |
| B002 | Partner is not exists | Partner is not exists. |
| B003 | Illegal sign | Signature is illegal |
| B048 | Invalid buyer | Buyer is invalid, please contact PKFARE account manager |
| S001 | System error | System error |
| B037 | Order is not exist | Order is not exist |
| B141 | Order is not a refund order. | Order number in the request is not a refund order |

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

Error Code，0-Success，Others-Failed

warningMsg

string 

optional

Return data, will not be empty when error code is "0".

reimbursedOrderNum

string 

required

PKFARE order number - Refund Order or Void Order

reimbursedOrderStatus

string 

required

Order Status：REFUND, REIMBURSED; VOID, REIMBURSED

Payment gateway: Prepay, Alipay, Voucher

paySerialNum

string 

optional

reimbursedAmount

number 

required

voucherList

array \[object {12}\] 

optional

When payment gateway is voucher, voucher information will return.

voucherFileId

array\[string\]

optional

When payment gateway is voucher, a file ID may be returned. You can download the file by DownloadFile API.

    {
      "errorCode": "0",
      "errorMsg": "ok",
      "data": {
        "reimbursedOrderNum": "916787120452531002",
        "reimbursedOrderStatus": "Reimbursed",
        "payGate": "Voucher",
        "currency": "USD",
        "voucherList": [
          {
            "lastName": "YANGABC",
            "firstName": "TIFFANY",
            "birthday": "1990-08-23",
            "sex": "F",
            "psgType": "ADT",
            "voucherNumber": "1234567890123",
            "voucherCurrency": "THB",
            "voucherAmount": 222.22,
            "voucherValidFrom": "2023-03-20",
            "voucherValidEnd": "2023-03-22",
            "useFor": [
              1
            ],
            "usageLimitation": 0
          }
        ],
        "voucherFileId": [
          "cc20fde65a836ad3e1555729c11745eb"
        ]
      }
    }

Modified at 5 个月前

