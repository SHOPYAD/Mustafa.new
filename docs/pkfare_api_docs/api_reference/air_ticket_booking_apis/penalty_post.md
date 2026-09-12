# Penalty - PKFARE Flight Buyer API

## Function

Through Penalty API, users can get the refund and reissue/revalidation penalty for specific flight. It needs to be invoked after using PrecisePricing API within 30 minutes (We suggest invoking this API 10 seconds after you get the response of PrecisePricing), and the corresponding fare rule will be responded.

## Versioning

| Version | Sandbox Invoking Address | Update |
| --- | --- | --- |
| Penalty | [https://api.pkfare.com/penalty]() |  |
| Penalty_V2 | [https://api.pkfare.com/penalty]()V2 | Add solutionId to enhance tracebility and visibility |
| Penalty_V2(json format) | [https://api.pkfare.com/json/penaltyV2]() | Add solutionId to enhance tracebility and visibility; Support json formatted requesting strcuture |
| Penalty_V3(json format) | [https://api.pkfare.com/json/penaltyV3]() | Add fare rules for different product tags, including PKFARE-defined special product types and airline-standard branded fares, etc. |

## Error Code List

| errorCode | errorMsg | Description |
| --- | --- | --- |
| 0 | ok | request has been processed successfully |
| S001 | System error | system error |
| P001 | - | wrong parameter |
| B002 | Partner is not exists | partnerID does not exist |
| B003 | Illegal sign | illegal sign. Please check your signature |
| B023 | Penalty failed | collecting fare rule failed |

### Request

Authentication

object {2} 

required

penalty

object {3} 

required

solutionId

string 

required

Unique identification returned in PrecisePricing, request with it for associating with the Pricing solution and linking to the entire request process

journeys

object {1} 

required

specified journey data. Need to include all the journeys

Product tag, must be filled in according to PKFARE\'s designated code (only one tag is supported in this version). Please enter the product tag associated with the Pricing price.

    {
      "authentication": {
        "partnerId": "",
        "sign": ""
      },
      "penalty": {
        "solutionId": "PzUCBPJcbjvM5wqPGyeWnPXeZ2GS3UqgaqwrjuL+2fEBlZeMkErCTwwvYiNazxsbvoqLgOOR356Z4//Z427LAzafqmJynNyOaM6n2toAOEdbnDJRcUmp9tXbkdPd2hWbM9bgS1m1cXJysep1MCoVkzPhWIEYO4ZnyQv+KmY3XlDHl6A/to+8pwEyyRONS7p9RFfrAkT1FRYRDQVh4uZM66xeojCRnfKsH8cwr1yaskW/K1WLaWD4qMiLCgYk6XyczNKCTidYkpCgEgHVpIrQITF26QXQyMhWJzLqXZLH1WUwemyaHD7Xz5tB7q4rsAlv",
        "journeys": {
          "journey_0": [
            {
              "airline": "FD",
              "arrival": "DMK",
              "arrivalDate": "2024-12-16",
              "arrivalTime": "00:20",
              "bookingCode": "X",
              "departure": "HKG",
              "departureDate": "2024-12-15",
              "departureTime": "22:20",
              "flightNum": "503"
            }
          ]
        },
        "tag": "SAVER"
      }
    }

### Request samples

### Responses

HTTP Code: 200

Content Type : JSON

error message. If return to "OK", order cancels successfully

penalties

array\[string\]

required

penalties are ordered by time of journey segments. Using "\\n" as a line break

remark

string  or null 

optional

if the penalties are not retrieved, remark will apply

    {
      "errorCode": "0",
      "errorMsg": "ok",
      "data": {
        "penalties": [
          "Refer to structured rules."
        ]
      }
    }

Modified at 3 months ago

