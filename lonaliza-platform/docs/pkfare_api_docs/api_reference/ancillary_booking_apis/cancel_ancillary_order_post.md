# CancelAncillaryOrder - PKFARE Flight Buyer API

## Function

You can cancel the ancillary order through CancelAncillaryOrder API before AncillaryTicketing.

## Error Code List

| errorCode | errorMsg |
| --- | --- |
| 0 | ok |
| B001 | Business exception |
| B002 | Partner does not exist. |
| B003 | Illegal sign. |
| P006 | Invalid parameter. |
| B182 | Invalid AncillaryOrderNum |
| B183 | The ancillary order has been canceled and please don\'t make duplicate cancellations. |
| B184 | Cancel failed due to invalid ancillary status |

### Request

Authentication

object {2} 

required

cancel

object {1} 

required

ancillaryOrderNum

string 

required

Ancillary order number returned from AncillaryBooking

    {
      "authentication": {
        "sign": "",
        "partnerId": ""
      },
      "cancel": {
        "ancillaryOrderNum": "917049521951368303"
      }
    }

### Request samples

### Responses

HTTP Code: 200

Content Type : JSON

    {
      "errorCode": "0",
      "errorMsg": "ok"
    }

Modified at 3 months ago

