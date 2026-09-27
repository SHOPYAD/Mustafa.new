# Raise refund requests - PKFARE Flight Buyer API

## **Overview**

**a. A passenger wants to raise a voluntary refund request due to personal reason:**

Info

1.  Raise RefundPricing to check the vailidity and refundable amount
2.  UploadAttachment File
3.  Raise RefundRequest to create refund order
4.  Check Reimbursemnt status
5.  DownloadAttachmentFile

**b. A passnger wants to raise an involuntary refund request due to flight schedule change or cancel and you needs to go through the following procedures:**

Info

1.  UploadAttachment File
2.  Raise RefundRequest to create refund order
3.  Check Reimbursement status
4.  DownloadAttachmentFile

* * *

## **Voluntary Refund Procedure**

**When there is a need of voluntary refund request from your customers, you will need to raise refundPricing API to check whether the ticket could be refunded and what is the refundable amount.**

## **RefundPricing Request**

`{     "authentication": {         "partnerId": "sIxxcsRCtssslnHt+BiT4bwONbMw=",         "sign": "234f554590789459af1e610e872896a3c6"     },     "data": {         "allPaxOfOrder": 0,         "refundReason": "2",         "refundType": "1",         "uploadedFileIds": [             "d0asisuddfjasld",             "asdfasdasdas158"         ],         "orderNum": "916783592892089401",         "pnrList": [             {                 "arrival": "SEA",                 "bookingCode": "string",                 "cabinClass": "string",                 "departure": "LAX",                 "flightNum": "DL1473",                 "segmentNo": 1,                 "ticketNums": [                     {                         "birthday": "2003-05-11",                         "cardNum": "string",                         "cardType": "string",                         "firstName": "Joshua",                         "pnr": "AB8SED",                         "airPnr": "AB8SED",                         "lastName": "Perez",                         "sex": "M",                         "ticketNum": "123456"                     }                 ]             }         ]     } }`

## **RefundPricing Response**

`{     "errorCode": "0",     "errorMsg": "ok",     "data": {         "needUploadFileId": 0,         "orderNum": "916777559161841201",         "refundPriceId": "16786066309484323",         "refundPricingStatus": "refund pricing",         "refundReason": 0,         "refundType": 0,         "lastComfirmTime": "2022-02-03 13:00:00"
         "passengerPriceList": [             {                 "birthday": "2003-06-05",                 "cardNum": "G47350571",                 "cardType": "P",                 "firstName": "Justin",                 "lastName": "Lopez",                 "sex": "M",                 "ticketNum": "123456",                 "solutions": {                     "currency": "USD",                     "paidAmount": 1.00,                     "usedAmount": 1.00,                     "nonRefundableAmount": 1.00,                     "refundServiceFee": 1.00,                     "refundAmount": 1.00,                     "FormOfPayment": "PrePay"                 },
                 "segmentList": [                     {                         "arrival": "SIN",                         "bookingCode": "Z",                         "cabinClass": "ECONOMY",                         "departure": "KUL",                         "flightNum": "AK703",                         "pnr": "YMERBD",                         "airPnr": "YMERBD",                         "segmentNo": 1,                         "ticketNum": "1677755872384"                     }                 ]
             }
         ]
     }
 }`

* * *

**In addition, in the response of refundPricing, when "needUploadFileId" specifies 1, you need to upload supporting documents such as passenger passport details using UploadAttachmentFile and retrive fileID in the response and input which under uploadedFilelds in RefundRequest API submitted requesting parameters.**

Note

**The rules vary from airlines to airlines, you do not need to upload passport details if not specifed.**

## **UploadAttachmentFile** **Request**

`{     "authentication": {         "partnerId": "RksVSX7PfZmWYsCD7M4=",         "sign": "17e707b5d9dae8459065dbb139e5f1bd"     }
 }`

**And Attach the file to be uploaded and send the request**

## **UploadAttachmentFile Response**

`{     "errorCode": "0",     "errorMsg": "ok",     "data": {         "fileId": "1ee71d50b4d59ef3e1555729c11745eb",         "fileName": "Pkfarer.jpg"
     }
 }`

Response sample in the case of failure\*\*：\*\*

`{     "errorCode": "B139",     "errorMsg": "File is oversize. It should be less than 5MB." }`

* * *

**Sometimes it might take a few minutes to get the exact refundable price for the order and you could use CheckRefundPricing API to termly pull the refund pricing status to get the price quote. The recommeded frequecy of API pulling is at every 10 minutes.**

## **checkRefundPricing Request**

`{     "authentication": {         "sign": "de3c162dfab2cfb05fe07d73308a80",         "partnerId": "Rw6HvWEDYaF6BPcICoQGJSXhw="     },     "data": {         "refundPricingId": "16786982431662414"
     }
 }`

## **checkRefundPricing Response**

`{     "errorCode": "0",     "errorMsg": "ok",     "data": {         "needUploadFileId": 0,         "orderNum": "916777559161841201",         "refundPriceId": "16786982431662414",         "refundPricingStatus": "refund pricing",         "refundReason": 0,         "refundType": 0,         "lastComfirmTime": "2022-02-03 13:00:00",         "passengerPriceList": [             {                 "birthday": "2003-06-05",                 "cardNum": "G47350571",                 "cardType": "P",                 "firstName": "Justin",                 "lastName": "Lopez",                 "sex": "M",                 "ticketNum": "123456",                 "solutions": {                     "currency": "USD",                     "paidAmount": 1.00,                     "usedAmount": 1.00,                     "nonRefundableAmount": 1.00,                     "refundServiceFee": 1.00,                     "refundAmount": 1.00,                     "FormOfPayment": "PrePay"                 },
                 "segmentList": [                     {                         "arrival": "SIN",                         "bookingCode": "Z",                         "cabinClass": "ECONOMY",                         "departure": "KUL",                         "flightNum": "AK703",                         "pnr": "YMERBD",                         "airPnr": "YMERBD",                         "segmentNo": 1,                         "ticketNum": "1677755872384"                     }
                 ]
             }
         ]
     }
 }`

**If the stauts changes to "refund, priced", it denoted that the price quote has been given and you can proceed to raise Refund Request.**

Note

**In some circumstances, there will be some values missing with 'nonrefundableAmount' and 'refundAmount' sections in the refund pricing response and you should refer to the response in refund request to get the full refund details.**

* * *

## **Refund Request**

**When you got refund pricing ID from the RefundPricng API, you can raise a refund request with this ID**

**Besides, you can directly raise refund request without the pricing ID if you do not want to check the refundable amount first, and the system will automatically generate an ID for this request.**

## **Refund Request**

`{     "authentication": {         "partnerId": "GuLC2tDO2iox9iu45DKYSr9mQ=",         "sign": "994209932dd37a81c951f004c70be7"     },     "data": {         "refundPricingId": "16783330658156729",         "allPaxOfOrder": 1,         "orderNum": "916783298501993901",         "pnrList": [             {                 "airPnr": "EDTCZP",                 "arrival": "SIN",                 "bookingCode": "E",                 "cabinClass": "ECONOMY",                 "departure": "HKG",                 "flightNum": "CX635",                 "segmentNo": 1,                 "ticketNums": [                     {                         "birthday": "2003-05-11",                         "cardNum": "string",                         "cardType": "string",                         "firstName": "Joshua",                         "pnr": "AB8SED",                         "airPnr": "AB8SED",                         "lastName": "Perez",                         "sex": "M",                         "ticketNum": "123456"                     }
                 ]
             }
         ]
     }
 }`

## **RefundReqeust Response**

`{     "errorCode": "0",     "errorMsg": "ok",     "data": {         "refundId": "16783330658156729",         "refundStatus": "refund, request",         "refundAmount": 1.00,         "currency": "USD",         "refundServiceFee": 1.00,         "nonRefundableAmount": 1.00,         "FormOfPayment": "PrePay",         "orderNum": "916783298501993901",         "refundType": 0,         "refundReason": 0,         "refundPriceId": "16783330658156729",         "passengerPriceList": [             {                 "birthday": "2003-06-05",                 "cardNum": "G47350571",                 "cardType": "P",                 "firstName": "Justin",                 "lastName": "Lopez",                 "sex": "M",                 "ticketNum": "123456",                 "solutions": {                     "currency": "USD",                     "paidAmount": 1.00,                     "usedAmount": 1.00,                     "nonRefundableAmount": 1.00,                     "refundServiceFee": 1.00,                     "refundAmount": 1.00,                     "FormOfPayment": "PrePay"                 },
                 "segmentList": [                     {                         "arrival": "SIN",                         "bookingCode": "Z",                         "cabinClass": "ECONOMY",                         "departure": "KUL",                         "flightNum": "AK703",                         "pnr": "YMERBD",                         "airPnr": "YMERBD",                         "segmentNo": 1,                         "ticketNum": "1677755872384"                     }
                 ]
             }
         ]
     }
 }`

* * *

## **Refund status**

**You can use CheckRefund API to check the refund status.**

## **CheckRefund Request**

`{     "authentication": {         "sign": "de3c162dfab2cfb05fe07d73308a80",         "partnerId": "Rw6HvWEDYaF6BPcICoQGJSXhw="     },     "data": {         "refundId": "16783330658156729"
     }
 }`

## **CheckRefund Response**

`{     "errorCode": "0",     "errorMsg": "ok",     "data": {         "refundId": "16783330658156729",         "refundStatus": "refund, request",         "refundAmount": 1.00,         "currency": "USD",         "refundServiceFee": 1.00,         "nonRefundableAmount": 1.00,         "FormOfPayment": "PrePay",         "orderNum": "916783298501993901",         "refundType": 0,         "refundReason": 0,         "refundPriceId": "16783330658156729",         "passengerPriceList": [             {                 "birthday": "2003-06-05",                 "cardNum": "G47350571",                 "cardType": "P",                 "firstName": "Justin",                 "lastName": "Lopez",                 "sex": "M",                 "ticketNum": "123456",                 "solutions": {                     "currency": "USD",                     "paidAmount": 1.00,                     "usedAmount": 1.00,                     "nonRefundableAmount": 1.00,                     "refundServiceFee": 1.00,                     "refundAmount": 1.00,                     "FormOfPayment": "PrePay"                 },
                 "segmentList": [                     {                         "arrival": "SIN",                         "bookingCode": "Z",                         "cabinClass": "ECONOMY",                         "departure": "KUL",                         "flightNum": "AK703",                         "pnr": "YMERBD",                         "airPnr": "YMERBD",                         "segmentNo": 1,                         "ticketNum": "1677755872384"                     }
                 ]
             }
         ]
     }
 }`

* * *

## **RefundResultNotify Request**

`{     "authentication": {         "partnerId": "GuLC2tDO2iox9iu45DKYSr9mQ=",         "sign": "994209932dd37a81c951f004c70be7"     },     "data": {         "refundId": "16783330658156729",         "refundStatus": "refund, success",         "refundAmount": 1.00,         "currency": "USD",         "refundServiceFee": 1.00,         "nonRefundableAmount": 1.00,         "FormOfPayment": "PrePay",         "orderNum": "916783298501993901",         "refundType": 0,         "refundReason": 0,         "refundPriceId": "16783330658156729",         "passengerPriceList": [             {                 "birthday": "2003-06-05",                 "cardNum": "G47350571",                 "cardType": "P",                 "firstName": "Justin",                 "lastName": "Lopez",                 "sex": "M",                 "ticketNum": "123456",                 "solutions": {                     "currency": "USD",                     "paidAmount": 1.00,                     "usedAmount": 1.00,                     "nonRefundableAmount": 1.00,                     "refundServiceFee": 1.00,                     "refundAmount": 1.00,                     "FormOfPayment": "PrePay"                 },
                 "segmentList": [                     {                         "arrival": "SIN",                         "bookingCode": "Z",                         "cabinClass": "ECONOMY",                         "departure": "KUL",                         "flightNum": "AK703",                         "pnr": "YMERBD",                         "airPnr": "YMERBD",                         "segmentNo": 1,                         "ticketNum": "1677755872384"                     }
                 ]
             }
         ]
     }
 }`

## **RefundResultNotify Response**

`{     "errorCode": "0",     "errorMsg": "ok"
 }`

* * *

## **CheckReimbursed Request**

`{     "authentication": {         "sign": "de3c162dfab2cfb05fe07d73308a80",         "partnerId": "Rw6HvWEDYaF6BPcICoQGJSXhw="     },     "data": {         "refundId": "16783330658156729"
     }
 }`

## **CheckReimbursed Response**

`{     "errorCode": "0",     "errorMsg": "ok",     "data": {         "refundId": "16783330658156729",         "reimbursedStatus": "reimbursed, success",         "reimbursedAmount": 1.00,         "currency": "USD",         "refundServiceFee": 1.00,         "nonRefundableAmount": 1.00,         "FormOfPayment": "PrePay",         "orderNum": "916783298501993901",         "refundType": 0,         "refundReason": 0,         "refundPriceId": "16783330658156729",         "passengerPriceList": [             {                 "birthday": "2003-06-05",                 "cardNum": "G47350571",                 "cardType": "P",                 "firstName": "Justin",                 "lastName": "Lopez",                 "sex": "M",                 "ticketNum": "123456",                 "solutions": {                     "currency": "USD",                     "paidAmount": 1.00,                     "usedAmount": 1.00,                     "nonRefundableAmount": 1.00,                     "refundServiceFee": 1.00,                     "refundAmount": 1.00,                     "FormOfPayment": "PrePay"                 },
                 "segmentList": [                     {                         "arrival": "SIN",                         "bookingCode": "Z",                         "cabinClass": "ECONOMY",                         "departure": "KUL",                         "flightNum": "AK703",                         "pnr": "YMERBD",                         "airPnr": "YMERBD",                         "segmentNo": 1,                         "ticketNum": "1677755872384"                     }
                 ]
             }
         ]
     }
 }`

* * *

## **ReimbursedResultNotify Request**

`{     "authentication": {         "partnerId": "GuLC2tDO2iox9iu45DKYSr9mQ=",         "sign": "994209932dd37a81c951f004c70be7"     },     "data": {         "refundId": "16783330658156729",         "reimbursedStatus": "reimbursed, success",         "reimbursedAmount": 1.00,         "currency": "USD",         "refundServiceFee": 1.00,         "nonRefundableAmount": 1.00,         "FormOfPayment": "PrePay",         "orderNum": "916783298501993901",         "refundType": 0,         "refundReason": 0,         "refundPriceId": "16783330658156729",         "passengerPriceList": [             {                 "birthday": "2003-06-05",                 "cardNum": "G47350571",                 "cardType": "P",                 "firstName": "Justin",                 "lastName": "Lopez",                 "sex": "M",                 "ticketNum": "123456",                 "solutions": {                     "currency": "USD",                     "paidAmount": 1.00,                     "usedAmount": 1.00,                     "nonRefundableAmount": 1.00,                     "refundServiceFee": 1.00,                     "refundAmount": 1.00,                     "FormOfPayment": "PrePay"                 },
                 "segmentList": [                     {                         "arrival": "SIN",                         "bookingCode": "Z",                         "cabinClass": "ECONOMY",                         "departure": "KUL",                         "flightNum": "AK703",                         "pnr": "YMERBD",                         "airPnr": "YMERBD",                         "segmentNo": 1,                         "ticketNum": "1677755872384"                     }
                 ]
             }
         ]
     }
 }`

## **ReimbursedResultNotify Response**

`{     "errorCode": "0",     "errorMsg": "ok"
 }`

* * *

## **DownloadAttachmentFile Request**

`{     "authentication": {         "sign": "de3c162dfab2cfb05fe07d73308a80",         "partnerId": "Rw6HvWEDYaF6BPcICoQGJSXhw="     },     "data": {         "fileId": "1ee71d50b4d59ef3e1555729c11745eb"
     }
 }`

## **DownloadAttachmentFile Response**

`{     "errorCode": "0",     "errorMsg": "ok",     "data": {         "fileContent": "string",         "fileName": "string"
     }
 }`

* * *

## **Involuntary Refund Procedure**

**When there is a need of involuntary refund request from your customers, you will need to upload supporting documents such as flight change notification using UploadAttachmentFile and retrive fileID in the response and input which under uploadedFilelds in RefundRequest API submitted requesting parameters.**

Note

**The rules vary from airlines to airlines, you do not need to upload passport details if not specifed.**

* * *

**You can use CheckRefund API to check the refund status.**

* * *

**You can use CheckReimbursed API to check the reimbursement status.**

* * *

**You can use DownloadAttachmentFile API to download the attachment file.**

