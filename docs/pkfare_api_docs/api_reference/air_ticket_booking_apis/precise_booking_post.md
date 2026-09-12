# PreciseBooking - PKFARE Flight Buyer API

## Function

Through the most updated version PreciseBooking_V5 API, Seat selection in  the bookings are supported based on the results from AncillaryPricing_V3. 

It's not supported that multiple paid checked bags or multiple paid carry-on bags are added for the same passenger on a single journey, but it's allowed to add a checked bag and a carry-on baggage on a single journey at the same time.

Besides,  it's not allowed to add multiple seats for the same passenger in a flight or select the same seat for multiple passengers in a flight.

It is necessary to use PrecisePricing service before using this interface. The whole process should be limited to 30 mins.

## Versioning

| Version | Sandbox Invoking Address | Update |
| --- | --- | --- |
| PreciseBooking | [https://api.pkfare.com/preciseBooking]() |  |
| PreciseBooking_V2 | [https://api.pkfare.com/preciseBooking_V2]() | It is capable of buying ancillaries |
| PreciseBooking_V3 | [https://api.pkfare.com/preciseBooking_V]()3 | Support infant (no seat) bookings. |
| PreciseBooking_V4 | [http://api.pkfare.com/preciseBooking_V4]() | support seat selection in the initial booking |
| PreciseBooking_V5 | [https://api.pkfare.com/preciseBooking_V]()5 | Add solutionId to enhance tracebility and visibility |
| PreciseBooking_V5(json format) | [https://api.pkfare.com/json/preciseBooking_V5]() | Add solutionId to enhance tracebility and visibility; Support json formatted requesting structure |
| PreciseBooking_V6(json format) | [https://api.pkfare.com/json/preciseBooking_V6]() | Add solutionId to enhance tracebility and visibility; Support json formatted requesting structure |
| PreciseBooking_V7(json format) | [https://api.pkfare.com/json/preciseBooking_V7]() | support booking prices for different product tags, including PKFARE-defined special product types and airline-standard branded fares, etc. |

_Below is the most updated version_

## Error Code List

| erroCode | erroMsg | Description |
| --- | --- | --- |
| 0 | ok | Request has been processed successfully. |
| S001 | System error. | System error. |
| B002 | Partner is not exists. | PartnerID does not exist. |
| B003 | Illegal sign. | Illegal sign. Please check your signature. |
| B035 | Concurrency limited. Please contact PKFARE API support team for assistant. | Concurrency exceeded system limits. |
| P001 | XXX is illegal. | The field of XXX is illegal. |
| P002 | XXX is missing. | The field of XXX is missing. |
| P006 | Invalid parameter. | Value of request cannot pass the validation, please check on the request. |
| 0307 | Reservation failed - Booking class is sold out. | Reservation failed. Seats have been sold out. |
| B004 | There are errors in the passenger type of Adults. | Adult passenger's age does not meet the requirements. |
| B005 | Can not find any matching precisePricing result within 30 minutes. | Can not find the corresponding precisePricing record. Please check the itinerary and passenger numbers. PreciseBooking has to be invoked within 30 minutes after pricing. |
| B006 | Reservation failed - Other. OrderNum is XXX. | Booking fail for other reason. The order has been created which is indicated in Other.OrderNum field |
| B006 | Reservation failed. | Booking fail for other reason. |
| B007 | Reservation failed - Segment status is not HK. | Segment status is invalid from GDS. Please select other flight options. |
| B008 | Itinerary is different between PNR and order. | Itinerary in reservation is different from precisePricing. There might be a flight re-schedule. Please select other flight options. |
| B011 | Reservation failed - Fare is unavailable. | Fare is unavailable form GDS. Please select other flight options. |
| B012 | Reservation failed - Create PNR time out. | Create PNR time out from GDS. Please wait some minutes or select other flight options. |
| B017 | Price is changed. | Price is changed. |
| B023 | Reservation failed - Save price fail. | Fail to save price from GDS. |
| B022 | There are errors in the passenger type of Children | Child passenger's age does not meet the requirements. |
| B025 | Reservation failed - RT PNR fail. | Fail to retieve PNR from GDS. |
| B027 | Airline PNR is missing. | Airline PNR is missing from GDS. |
| B028 | Reservation failed - Time out. | Booking time out from GDS. |
| B029 | Duplicate reservations have been found for passenger XXX/XXX in order XXX, in pnr XXX. | Duplicated reservation is not allowed. If there is an order with same segment and passenger, system will block the second reservation and return error. Please cancel the last duplicated order or pay the last order directly. |
| B030 | Illegal passenger name, please use Chinese character. | Wrong passenger name. If passengers use Chinese ID card to make reservation for China domestic flight, please use Chinese character. |
| B031 | Illegal passenger name, please use correct Chinese character. | Wrong passenger name. If passengers use chinese ID card to make reservation, the chinese name length is over the limitation. |
| B032 | Illegal passport, please use 'N' as document type if you are using Chinese ID card to make reservation. | Illegal passport. If passengers book Chinese flight, please use correct passport. |
| B043 | Reservation failed: Create PNR failed. | Booking failed from GDS. |
| B044 | Reservation failed - Create PNR failed, end transaction failed. | Booking failed from GDS. |
| B062 | The length of passenger name should be 40 English alphabet including / between last name and first name. | Passenger's name should be within 40 English alphabet, including "/" between last name and first name. |
| B064 | The lastName of passegner should be within 2-30 English alphabet. | Passenger's last name should be within 2-30 English alphabet. |
| B065 | Passenger's document information must be filled in for this trip. Passenger's document information contains cardType, cardNum, cardExpiredDate and nationality. | Passenger's document information must be filled in for this trip. Passenger's document information contains cardType, cardNum, cardExpiredDate and nationality.Please contact PKFARE API support. |
| B069 | Reservation failed, this fare has passenger age limitation. | Reservation failed, because this fare has a passenger age limition. |
| B077 | There are erros in the passenger type of infants. | Infant passenger's age does not meet the requirements. |
| B078 | Lack of passengerIndex. | For bookings contain infant(s) , passengerIndex is required for each passenger. |
| B079 | Each infant must be associated to one adult and each adult can only be associated to one infant maximum. | Each infant must be associated to one adult and each adult can only be associated to one infant maximum. |
| B080 | Invalid or duplicated or discontinuous passengerIndex | PassengerIndex must be positive and continuous integers starting from 1. |
| B081 | Error in ancillary passenger info. | Error in ancillary passenger info. |
| B087 | Booking Failed. System has recognized possible churning. | Churning booking behaviour were detected and booking request with the same passenger will be restricted. |
| B192 | Duplicate baggages are not allowed in the same journey. | Only one baggage purchase is allowed for the same journey, all subsequent attempts will be granted with this response. |
| B193 | Multiple seat selection is not allowed in the same flight. | Only one seat selection is allowed for the same journey, all subsequent attempts will be granted with this response. |

### Request

Authentication

object {2} 

required

booking

object {5} 

required

passengers

array \[object {15}\] 

required

solution

object {10} 

required

buyerOrder

string  or null 

optional

Your order number if you want to store at PKFARE side

ancillary

array \[object {2}\] 

optional

contact

object {9} 

optional

    {
      "authentication": {
        "partnerId": "",
        "sign": ""
      },
      "booking": {
        "passengers": [
          {
            "birthday": "2000-01-01",
            "cardExpiredDate": "2025-01-01",
            "cardNum": "P1234567",
            "cardType": "P",
            "firstName": "Jango",
            "lastName": "Wang",
            "nationality": "CN",
            "psgType": "ADT",
            "sex": "M",
            "passengerIndex": 1,
            "ancillary": [
              {
                "ancillaryType": 2,
                "ancillaryKey": "1234567890",
                "ancillaryPrice": 100,
                "ancillaryCurrency": "USD",
                "ancillaryDescription": "seat selection",
                "journeys": [
                  {
                    "airline": "FD",
                    "flightNum": "501",
                    "arrival": "DMK",
                    "arrivalDate": "2024-12-15",
                    "arrivalTime": "16:40",
                    "departure": "HKG",
                    "departureDate": "2024-12-15",
                    "departureTime": "14:40",
                    "bookingCode": "Z"
                  }
                ]
              }
            ]
          }
        ],
        "solution": {
          "solutionId": "iXf1ufZoOsBU+MpHfwQD6vzfcE3X5BFe1Vxl3oa9iNn1Noc75XschKYpLVXfU17PcPI7oU/EVSKjQj2Xuxt9QoSJGTP7oW12BBtDUQvlAzaZ1z0zhjr4N5cJVh2fElsdEXXtCGI00H3Nvx98/d2z6lUfU0Yhuny0kj/rOz4IMMmghIhWyGDa4e4T7y3BrTjFwEPZh0nHoEykVO13sMp0vXt8ub60T12OXl9dooXkhpqN51MhNjyCkSYjIYff//DJ1cRBps9+3e58SI0ifR8P6FiCKSCYOmCQLFKKLU0P8+Xlv4BsqxNY0pdOKT7LeR3w2YGgt1zSCyEXZCwy/+BBLA66j01ytAzieUvdZ3sqLyc8+7IG23vo1JfqVtlJo/pvRdlQyp6gQGJDPraSkTCSvA==",
          "solutionKey": "cadce3d7a693476e02a0e841d586fbcb",
          "journeys": {
            "journey_0": [
              {
                "airline": "FD",
                "flightNum": "501",
                "arrival": "DMK",
                "arrivalDate": "2024-12-15",
                "arrivalTime": "16:40",
                "departure": "HKG",
                "departureDate": "2024-12-15",
                "departureTime": "14:40",
                "bookingCode": "Z"
              }
            ],
            "journey_1": [
              {
                "airline": "FD",
                "flightNum": "504",
                "arrival": "HKG",
                "arrivalDate": "2024-12-30",
                "arrivalTime": "19:15",
                "departure": "DMK",
                "departureDate": "2024-12-30",
                "departureTime": "15:30",
                "bookingCode": "A"
              }
            ]
          },
          "adults": 1,
          "children": 1,
          "infants": 0,
          "fareType": "PRIVATE",
          "currency": "USD",
          "adtFare": 25.69,
          "adtTax": 59.39,
          "chdFare": 0,
          "chdTax": 0,
          "qCharge": 0,
          "tktFee": 0,
          "platformServiceFee": 0,
          "platingCarrier": "VJ",
          "merchantFee": 0,
          "baggageMap": {
            "ADT": [
              {
                "segmentIndexList": [
                  1,
                  2
                ],
                "baggageAmount": "0PC",
                "baggageWeight": null,
                "carryOnAmount": "1PC",
                "carryOnWeight": "7KG",
                "carryOnSize": null
              }
            ]
          },
          "miniRuleMap": {
            "ADT": [
              {
                "segmentIndex": [
                  1,
                  2
                ],
                "miniRules": [
                  {
                    "penaltyType": 0,
                    "isPermited": 0,
                    "when": 0,
                    "noShowTime": null,
                    "noShowTimeUnit": null,
                    "penaltyFee": 0,
                    "penaltyCurrency": null,
                    "description": "Free of charge",
                    "reissueRule": null,
                    "refundRule": null
                  }
                ]
              }
            ]
          }
        },
        "contact": {
          "email": "test@pkfare.com",
          "firstName": "Jango",
          "lastName": "Wang",
          "mobile": "13800138000",
          "phoneCountryCode": "86",
          "phoneNum": "13800138000",
          "postCode": "100000",
          "address": "test address",
          "city": "Beijing",
          "country": "CN"
        }
      }
    }

### Request samples

### Responses

HTTP Code: 200

Content Type : JSON

Error code, refer to Error Code List

Returned data, will not be empty when error code is "0". Data is in JSON format, which contains three collection objects: solutions, flights, segments.

orderNum

string 

required

PKFARE order number

airOrderNum

string 

required

PKFARE air order number

    {
      "errorCode": "0",
      "errorMsg": "ok",
      "data": {
        "orderNum": "916716911545376001",
        "airOrderNum": "916716911545376001"
      }
    }

Modified at 3 months ago

