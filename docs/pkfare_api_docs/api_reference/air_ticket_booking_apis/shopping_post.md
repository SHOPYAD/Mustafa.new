# Shopping - PKFARE Flight Buyer API

## Function

Through Shopping API, users can check flight availability and its price by using relevant parameters. Shopping service supports one-way trip, round trip and open jaw (2 journeys max).

## Versioning

| Version | Sandbox Invoking Address | Update |
| --- | --- | --- |
| Shopping | [https://api.pkfare.com/shopping]() |  |
| Shopping_V2 | [https://api.pkfare.com/shoppingV2]() | Add BaggageMap and MiniRuleMap, only for reference. |
| Shopping_V3 | [https://api.pkfare.com/shoppingV]()3 | Support infant（without seat) tickets. |
| Shopping_V4 | [https://api.pkfare.com/shoppingV]()4 | Add solutionId to enhance tracebility and visibility |
| Shopping_V4(json format) | [https://api.pkfare.com/json/shoppingV4]() | Add solutionId to enhance tracebility and visibility; Support json formatted requesting structure; Support journey-wise airline search ; Support multiple airlines search |
| Shopping_V7(json format) | [https://api.pkfare.com/json/shoppingV7]() | Support virtual interlining content on one-way journeys |
| Shopping_V8(json format) | [https://api.pkfare.com/json/shoppingV8]() | Support shopping prices for different product tags, including PKFARE-defined special product types and airline-standard branded fares, etc. |

_Below is the most updated version_

## Error Code List

| erroCode | erroMsg | Description |
| --- | --- | --- |
| 0 | ok | Request has been processed successfully. |
| S001 | System error. | System error. |
| B002 | Partner is not exists. | PartnerID does not exist. |
| B003 | Illegal sign. | Illegal sign. Please check your signature. |
| P001 | XXX is illegal. | The field of XXX is illegal. |
| P002 | XXX is missing. | The field of XXX is missing. |
| P004 | The maximum number of passengers with seat is 9. | Wrong parameter. The maximum number of passengers with seat is 9. |
| P005 | There should be at least one adult. | Wrong parameter. There should be at least one adult. |
| P009 | The number of infant passengers can not exceed the number of adult passengers. | Wrong parameter. The number of infant passengers can not exceed the number of adult passengers. |
| B013 | Interface is limited, please contact the system administrator. | The route that you request is limited, please contact system administrator. |
| B014 | Shopping failed. | Shopping failed caused by other reasons. |
| B024 | Time-out, please try later. | Time-out. You can try the second searching after a few seconds. |
| B034 | Shopping interface is offline. | Shopping service is limited. |
| B035 | Concurrency limited. Please contact PKFARE API support team for assistant. | Concurrent users control. Please contact PKFARE API support for assistant. |
| B038 | Departure date must be today to a year. | Wrong parameter. Departure date must be today to a year. |
| B039 | Can\'t find the related data of XXX. | Wrong parameter. Can\'t find the related data of XXX, like illegal city/country/area/airline. |
| B046 | Interface is limited, the routing is offlined by PKFARE. | Look to book control. If you need this routing, please contact PKFARE API for assistant. |
| B059 | Shopping failed from upstream. | Shopping failed, shopping error from upstream. Please contact PKFARE API support. |
| B060 | Interface is limited, please contact PKFARE. | Interface is limited, due to restriction rules, please contact PKFARE API support. |
| B009 | Supplier is offline | Supplier is not at working time, please contact PKFARE API support. |
| B066 | Only 2 journeys can be supported, please check your itinerary. | System support maximum 2 journeys shopping at this moment. |
| B195 | Invalid tag | The tag you request is invalid |

### Request

Accept-Encoding

string 

optional

Authentication

object {2} 

required

search

object {9} 

required

Number of adult passenger

Number of child \[age 2-12/14\] passenger

Number of infant \[age 0-2, no seat\] passenger

Only search for non-stop flight\[0= No; 1=Yes\]

Search for specific airline; Support multiples airline (each seperated by comma) ; IATA airlines code

solutions

integer 

optional

Suggested quantity of returned solutions

Product tag, must use the code defined by PKFARE. Only one tag can be specifed inthis version. When a tag is provided: PKFARE will only retumn price for flights matching that tag, witheach flight still providing a single price.When no tag is provided: PKFARE may return price for flights under multiple tags, andeach flight could have multiple prices.

returnTagPrice

string 

optional

Y-Return multi-product price, N - Do not return multi-product price (default to theoriginal mode of requesting the lowest price only).If not specihed, defauits to N.

searchAirLegs

array \[object {5}\] 

required

    {
      "authentication": {
        "partnerId": "",
        "sign": ""
      },
      "search": {
        "adults": 1,
        "children": 0,
        "infants": 0,
        "nonstop": 0,
        "airline": "",
        "solutions": 0,
        "tag": "",
        "returnTagPrice": "Y",
        "searchAirLegs": [
          {
            "cabinClass": "",
            "departureDate": "2024-12-15",
            "destination": "BKK",
            "origin": "HKG",
            "airline": "SQ"
          },
          {
            "cabinClass": "",
            "departureDate": "2024-12-17",
            "destination": "HKG",
            "origin": "BKK",
            "airline": "SQ"
          }
        ]
      }
    }

### Request samples

### Responses

HTTP Code: 200

Content Type : JSON

Error code, refer to error code list

Only if the errorCode returns "0", returned data would not be null. Data is in JSON format, which contains three collection objects: solutions , flights, segments

shoppingKey

string 

required

solutions

array \[object {28}\] 

required

flights

array \[object {6}\] 

required

segments

array \[object {24}\] 

required

    {
      "errorCode": "0",
      "errorMsg": "ok",
      "data": {
        "searchKey": "HKGBKK20241215Y1000",
        "shoppingKey": "f492cad7ce655916d3a19eb3a21bd478",
        "solutions": [
          {
            "solutionKey": "cadce3d7a693476e02a0e841d586fbcb",
            "solutionId": "DMHkxtUMupBvCYeSAZKvI2XPSDdKRK2kK27eMKAEE+F2gdW8n4ZhopICv6eJNS40/IpYhzhI2Tvo2z04wU/8nNwO624PNzeJpVTeq4Ks9ho0cymekKGhBTVe1BQzINIhLz6wpYJ/0VxsriI2fPlN32S6ATG1+ulFve4Lww4Yk3K7Oe5FK5yrrSQurNPrzLnsrZ

