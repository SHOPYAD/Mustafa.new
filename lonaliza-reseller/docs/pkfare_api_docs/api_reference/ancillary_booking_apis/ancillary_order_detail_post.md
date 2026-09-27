# AncillaryOrderDetail - PKFARE Flight Buyer API

## Function

Through AncillaryOrderDetail API, you can check ancillary order details

## Error Code List

| errorCode | errorMsg |
| --- | --- |
| 0 | ok |
| S001 | System error |
| P002 | XXX is missing |
| B002 | Partner is not exists |
| B003 | Illegal sign |
| B036 | Order is not exist |

### Request

Authentication

object {2} 

required

ancillaryOrderNum

string 

required

    {
      "authentication": {
        "sign": "",
        "partnerId": ""
      },
      "data": {
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

required

PKFARE ancillary order number

airOrderNum

string 

required

associated air order number

ancillaryOrderStatus

string 

required

the status of ancillary order

ancillaryOrderType

string 

required

ancillary order type, ORIGIN-Ticketing Order

saleStage

integer 

required

sales stage：0- prebooking stage; 1-postbooking stage

ancillaryType

integer 

required

ancillary type：1-baggage; 2- seat

createTime

string 

required

ancillary order created time（GMT）

Form of payment, Alipay or Prepay

paySerialNum

string 

required

Serial Number of payment transaction

lastTktTime

string 

required

latest ticketing time (GMT)

passengers

array \[object {6}\] 

required

journeys

array \[object {2}\] 

required

ancillaryInfos

array \[object {2}\] 

optional

    {
      "errorCode": "0",
      "errorMsg": "ok",
      "data": {
        "ancillaryOrderNum": "917137127561609502",
        "airOrderNum": "917137127561609501",
        "ancillaryOrderStatus": "ISS_PRC",
        "ancillaryOrderType": "ORIGIN",
        "saleStage": 0,
        "ancillaryType": 1,
        "createTime": "2024-04-21T15:19:17+00:00",
        "pnr": "OV35WN",
        "payGate": "Prepay",
        "paySerialNum": "PREPAY_20240421231934_917137127571609501_3163",
        "lastTktTime": "2024-04-21T17:19+00:00",
        "passengers": [
          {
            "lastName": "LEEE",
            "firstName": "ANOUNG",
            "psgType": "ADT",
            "birthday": "1989-07-18",
            "sex": "F",
            "passengerID": "25122869"
          },
          {
            "lastName": "CHO",
            "firstName": "HEEJUJU",
            "psgType": "ADT",
            "birthday": "1996-05-10",
            "sex": "F",
            "passengerID": "25122888"
          }
        ],
        "journeys": [
          {
            "journeyID": "21808125",
            "segments": [
              {
                "airline": "VJ",
                "departure": "ICN",
                "departureDate": "2024-05-08",
                "departureTime": "01:45",
                "arrival": "PQC",
                "arrivalDate": "05:10",
                "arrivalTime": "2024-05-08",
                "flightNum": "975",
                "bookingCode": "U",
                "segmentKey": "24281583"
              }
            ]
          },
          {
            "journeyID": "21808126",
            "segments": [
              {
                "airline": "VJ",
                "departure": "PQC",
                "departureDate": "2024-05-11",
                "departureTime": "18:00",
                "arrival": "ICN",
                "arrivalDate": "01:25",
                "arrivalTime": "2024-05-12",
                "flightNum": "978",
                "bookingCode": "I",
                "segmentKey": "24281584"
              }
            ]
          }
        ],
        "ancillaryInfos": [
          {
            "baggages": {
              "passengerID": "25122879",
              "journeyID": "21808126",
              "payBaggageType": 1,
              "baggagePiece": -1,
              "baggageWeight": "20KG",
              "baggageCurrency": "USD",
              "baggagePrice": "26.78",
              "description": "Baggage 20kgs"
            }
          },
          {
            "baggages": {
              "passengerID": "25122879",
              "journeyID": "21808125",
              "payBaggageType": 1,
              "baggagePiece": -1,
              "baggageWeight": "20KG",
              "baggageCurrency": "USD",
              "baggagePrice": "31.06",
              "description": "Baggage 20kgs"
            }
          },
          {
            "baggages": {
              "passengerID": "25122880",
              "journeyID": "21808126",
              "payBaggageType": 1,
              "baggagePiece": -1,
              "baggageWeight": "20KG",
              "baggageCurrency": "USD",
              "baggagePrice": "26.78",
              "description": "Baggage 20kgs"
            }
          },
          {
            "baggages": {
              "passengerID": "25122880",
              "journeyID": "21808125",
              "payBaggageType": 1,
              "baggagePiece": -1,
              "baggageWeight": "20KG",
              "baggageCurrency": "USD",
              "baggagePrice": "31.06",
              "description": "Baggage 20kgs"
            }
          }
        ]
      }
    }

Modified at a year ago

