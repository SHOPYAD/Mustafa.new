# Book air tickets with ancillaries

## Overview

💡

**Mark wants to travel from Hong Kong to Sinapore. He will be leaving on 8th May and return on 8th June. He prefers economic class. And he wants to buy an extra luggage as well.**

To fulfill his needs, We need to:

1.  search for flights
2.  select a flight solution and an ancillary
3.  create an order
4.  pay the order
5.  notify him of airPNR and ticket numbers

* * *

## Search for flights

💡

**Mark input origins, destinations, departure date, return date and cabin class and search for flights.**

To build the payload you'll need the flight itinerary - which should include the origin(s), destination(s) and departure date(s) - and information about the passengers. Here's how we search for Mark's flights by using Shopping API:

Postman example \[More details refer to Shopping API introduction\]

`{     "search": {         "nonstop": 0,         "children": 0,         "solutions": 0,         "adults": 1,         "airline": "",         "searchAirLegs": [             {                 "cabinClass": "Economy",                 "origin": "BKK",                 "destination": "SIN",                 "departureDate": "2023-05-08"             },             {                 "cabinClass": "Economy",                 "origin": "SIN",                 "destination": "BKK",                 "departureDate": "2023-06-08"             }         ]     },     "authentication": {         "sign": "111",         "partnerId": "111"     } }`

Shopping response structure:

*   **Solution** : Multiple solutions with corresponding prices are displayed.
*   **Journey** : Each solution includes Journeys. One way trip only includes a Journey\_0 in Journeys and round trip includes both Journey\_0(outbound) and Journey\_1(inbound). Open Jaw includes both Journey\_0(first journey) and Journey\_1(second journey). The keys in Journey\_0 or Journey\_1 correspond to FlightId in Flights.
*   **Flight** : Describes the relationship between Journey and Segment.
*   **Segment** : segment details.

**Note:**

1.  'Sign' field is combined and MD5 encrypted with PartnerID and PartnerKEY
2.  Shopping response is deliverd by GZIP. You have to decompress it first, and then you will get JAVA data.
3.  Shopping request need to encrypted by BASE64.(json format now supported)
4.  The miniRule you receive from shopping response is only for reference. Please call penalty API to get the penalty in text format.

* * *

## Select a flight solution and an ancillary

💡

**Mark will check one of solutions that he is interested in.**

You have to check its realtime availability and price by calling precisePricing API. After that, you can call Penalty API to get the penalty information of flights.

Based on the solution you received in the shopping response, you have to request with all the necessary journey information, pax type, pax count, cabin class and so on. And we will respond you whether it is available or not and its current price since the inventory and price is dynamic.

Example:

`{    "pricing": {     "journeys": {       "journey_0": [         {           "airline": "FD",           "flightNum": "501",           "arrival": "DMK",           "arrivalDate": "2024-12-15",           "arrivalTime": "16:40",           "departure": "HKG",           "departureDate": "2024-12-15",           "departureTime": "14:40",           "bookingCode": "Z"         }       ],       "journey_1": [         {           "airline": "FD",           "flightNum": "504",           "arrival": "HKG",           "arrivalDate": "2024-12-30",           "arrivalTime": "19:15",           "departure": "DMK",           "departureDate": "2024-12-30",           "departureTime": "15:30",           "bookingCode": "A"         }       ]     },     "adults": 1,     "children": 1,     "infants": 0,     "solutionId": "iXf1ufZoOsBU+MpHfwQD6vzfcE3X5BFe1Vxl3oa9iNn1Noc75XschKYpLVXfU17PcPI7oU/EVSKjQj2Xuxt9QoSJGTP7oW12BBtDUQvlAzaZ1z0zhjr4N5cJVh2fElsdEXXtCGI00H3Nvx98/d2z6lUfU0Yhuny0kj/rOz4IMMmghIhWyGDa4e4T7y3BrTjFwEPZh0nHoEykVO13sMp0vXt8ub60T12OXl9dooXkhpqN51MhNjyCkSYjIYff//DJ1cRBps9+3e58SI0ifR8P6FiCKSCYOmCQLFKKLU0P8+Xlv4BsqxNY0pdOKT7LeR3w2PMGgt1zSCyEXZCwy/+BBLA66j01ytAzieUvdZ3sqLyc8+7IG23vo1JfqVtlJo/pvRdlQyp6gQGJDPraSkTCSvA==",     "cabin": ""   } }

More details may refer to precisePricing API introduction.

📌

Mark wants to buy an extra luggage!

you may need to call our ancillaryPricing API to check the paid baggage's availability and price. You can show ancillary information to your customers.

Example:

`{   "authentication": {     "sign": "111",     "partnerId": "111"   },   "pricing": {     "journeys": {       "journey_0": [         {           "departureTime": "14:40",           "flightNum": "501",           "arrival": "DMK",           "arrivalTime": "16:40",           "bookingCode": "Z",           "departure": "HKG",           "departureDate": "2024-12-15",           "airline": "FD",           "arrivalDate": "2024-12-15"         }       ],       "journey_1": [         {           "departureTime": "15:30",           "flightNum": "504",           "arrival": "HKG",           "arrivalTime": "17:15",           "bookingCode": "A",           "departure": "DMK",           "departureDate": "2024-12-30",           "airline": "FD",           "arrivalDate": "2024-12-30"         }       ]     },     "children": "0",     "solutionId": "iXf1ufZoOsBU+MpHfwQD6vzfcE3X5BFe1Vxl3oa9iNn1Noc75XschKYpLVXfU17PcPI7oU/EVSKjQj2Xuxt9QoSJGTP7oW12BBtDUQvlAzaZ1z0zhjr4N5cJVh2fElsdEXXtCGI00H3Nvx98/d2z6lUfU0Yhuny0kj/rOz4IMMmghIhWyGDa4e4T7y3BrTjFwEPZh0nHoEykVO13sMp0vXt8ub60T12OXl9dooXkhpqN51MhNjyCkSYjIYff//DJ1cRBps9+3e58SI0ifR8P6FiCKSCYOmCQLFKKLU0P8+Xlv4BsqxNY0pdOKT7LeR3w2PMGgt1zSCyEXZCwy/+BBLA66j01ytAzieUvdZ3sqLyc8+7IG23vo1JfqVtlJo/pvRdlQyp6gQGJDPraSkTCSvA==",     "adults": "1",     "ancillary": [       1,       2     ]   } }

Note

1.  If you request precisePricing with a certain `solutionid`, it may be not available for all kinds of reason and we will respond you error message. If you still want to book this flight, please request again and fill the `solutionid`parameter with string _**"direct pricing"**_, we will try our best to get the seats for you from another booking code with a fare.
2.  The after-sale penalty you collect in PrecisePricing\_V6 is for reference only. Please refer to Penalty API if you need to make a reservation.
3.  We also support calling precisePricing without Shopping call, but it will have much possibility of no availability. When you try direct precisePricing, please request us with `solutionid` parameter filling by string _**"direct pricing"**_.
4.  Before calling ancillaryPricing, you have to call precisePricing\_V2 within 30 mins before that.

* * *

## Create an order

💡

At this moment, Mark stays in your booking page. They are inputting their personal information and contact information.

You may need to call preciseBooking to create an order for this flight and affiliated ancillary based on this API's requirement and structure. We recommend you to call pricing again before preciseBooking call. So you may get the real time price again. If the price changed, you can show the updated price to your customer. If price change happens in the preciseBooking call, we will directly respond you error.

Example

`{   "authentication": {     "sign": "111",     "partnerId": "111"   },   "booking": {     "passengers": [       {         "passengerIndex": 1,         "birthday": "1993-06-22",         "firstName": "Mary",         "lastName": "Jones",         "nationality": "PH",         "psgType": "ADT",         "sex": "F",         "ffpNumber": "125003559853",         "ffpAirline": "CA",         "ktn": "1029490",         "redress": "2039401"       },       {         "passengerIndex": 2,         "birthday": "2021-04-12",         "firstName": "Jason",         "lastName": "Smith",         "nationality": "PH",         "psgType": "CHD",         "sex": "M",         "ffpNumber": "125003559853",         "...13036 bytes truncated...

