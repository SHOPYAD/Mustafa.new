# Cancel Workbench Items API&#160;Reference

## Source

- **Local HTML:** `docs/travelport/travelport api guide/travelport-airapi json/support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/Workbench/APIRef_CancelWorkbenchItems.html` (UTF-8 mirror)
- **Official base:** `https://support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/` + same relative path

## Plaintext extract (lossy)

Cancel Workbench Items API&#160;Reference Skip To Main Content Account Settings Logout placeholder Account Settings Logout Filter: All Files Submit Search Filter: All Files Submit Search Cancel Workbench Items API&#160;Reference Request Response Example request Example response POST book/reservationworkbench/ {workbenchID} /reservations/cancelitems For {workbenchID} send the workbench identifier returned in ReservationResponse/Identifer/value in the workbench create response. Base path: The base path for this API varies from that for other JSON &#160; Air APIs and does not include air at the end. Pre-production https://api.pp.travelport.net/11/ Production https://api.travelport.net/11/ Related Content: Air Booking Guide , Booking Session Workflow The Cancel Workbench Items API supports several options for canceling GDS air offers, NDC air offers, GDS filed fares, and hotel segments. The available cancel options vary between the initial workbench (during booking) and for a held booking (post-booking). Cancel Workbench Items cannot be used after a booking is ticketed. For all supported cancel options, see Cancel Offers, Products, Segments, and Filed Fares from a Booking in the Booking Guide. Cancel Workbench Items must always be followed by a Workbench Commit to commit the changes. If all offers were removed, a shell booking A shell booking contains only traveler details and no offers. Created if all offers are removed from a booking with Cancel Workbench Items and the workbench is committed with only traveler details, or if a booking fails at commit and the autoDeleteDate query parameter was included in the commit request (see the Booking Guide). is created to retain traveler details, and you can search for new offers to add to that booking. A workbench retrieve before Cancel Workbench is recommended to sync all data. Cancel Workbench Items supports NDC content only in the initial booking workbench, see the Booking Guide for details. Cancel Workbench Items cannot be used for an existing NDC booking: instead, use the NDC&#160; Reshop and Reprice APIs to modify the booking, or Cancel to cancel it. Request As part of the request requirements, also see Authentication and Common Air API Headers . Query Parameters None. Request Body The following payload provides options to cancel the entire reservation, all offers, or only selected offers, products, or segments. See the introductory section above for which options are supported for NDC/GDS and in the initial and post-commit workbench. Note that this payload does not support any NDC post-commit options; instead, to modify an NDC held booking, create a post-commit workbench and use the NDC&#160;Cancel API . Show Request Body Table to cancel entire reservation or one or more specified offers, products, segments Object Description Required/Optional @type Identifier. Send with value CancelRequest Required cancelAllInd Indicator. Send with value true to cancel the entire booking and remove all data from workbench. &#160; Required Optional. Send only to cancel entire initial workbench or held booking. Must be followed immediately by a Workbench Commit . cancelOffers Object to cancel offers. Send to cancel one, multiple, or all offers (all offers includes all air, hotel, and car offers but retain traveler data in the workbench. Optional. Send to cancel specific offers instead of entire booking (see cancelAllInd above) or unpriced segments (see cancelUnpricedSegments below) objectType String. Supported values: CancelAllOffers : Send to cancel all offers, including all air, hotel, and car offers. CancelSelectedOffers : Send to cancel only specified offers. Must also send offerProductSelection to specify the offers to cancel. Required if cancelOffers or cancelUnpricedSegments sent offerProductSelection &#160; Send if sending objectType=CancelSelectedOffers to cancel one or more specified offers. Send one instance for each offer to cancel, or each offer with a product or segment to cancel. Key value pairs: sendPassiveNotificationInd : Send with value true only if specified offer includes one or more passive segments An air segment booked in a system outside the Travleport GDS. Adding a passive air segment to a booking maintains all travel details as part of the complete itinerary. . Ignored for non-passive segments. True causes the message to be sent to the vendor airline system.&#160;The corresponding Travelport+ terminal entry is X{n} in which n=segment number. Includes offerID object. Includes productSegmentSequenceArray only if canceling only one or more products or segments in an air offer instead of the entire offer. (Hotel and car offers do not have products or segments.) Required if canceling specific offers sendPassiveNotificationInd Boolean.&#160;Send with true to indicate cancellation of a passive segment. Optional retainSegmentsInd Boolean. Send with true to cancel only the filed fare on the specified GDS offers on the booking but retain the segment/s and all flight details. The offer becomes an unpriced segment/s An air segment without any associated fare or pricing, generally booked for availability versus cost. Shown in the UnpricedSegments object instead of the Offer object. GDS only; NDC does not use unpriced segments. and is returned in the UnpricedSegments object with no pricing information. Does not affect any hotel or car content on the booking. Supported for both objectType/CancelAllOffers and /CancelSelectedOffers. Supported for existing bookings; supported in the initial booking workflow only if the fare is already stored. GDS only; NDC does not support unpriced segments or removing filed fares. Optional offerID Send if canceling one or more specified offers, or products or segments within an air offer. Includes the following: offerRef : Optional. The internal short offer ID that starts with o , such as o0, o1, o2, etc. If sent, Identifier/authority below is not required. Identifier : Standard Travelport Identifier object for the offer to cancel: authority : Required only if OfferRef was not sent. Send the value in Identifier/authority for the offer. value :&#160;Required. Send the value in Identifier/value for the offer. Required if canceling specific offers productSegmentSequenceArray Send if canceling one or more specified products or segments in an offer. Includes the following: productID : The internal short product ID that starts with p , such as p0, p1, p2, etc. segmentSequenceArray : Comma-delimited array. Send only if canceling one or more segments in an air offer. Send the segment sequence of each segment to cancel. Identifier : Standard Travelport Identifier object for the product to cancel: authority : Required only if OfferRef was not sent. Send the value in Identifier/authority for the product. value :&#160;Required. Send the value in Identifier/value for the product. segmentSequenceArray : Comma-delimited array. Send only if canceling one or more segments in an air offer. Send the segment sequence of each segment to cancel. &#160; Required if canceling a product or segment within one or more air offers cancelUnpricedSegments Send to cancel one, multiple, or all unpriced segments. Required if canceling unpriced segments objectType String. Supported values: CancelAllUnpricedSegments : Send to cancel all unpriced segments. CancelSelectedUnpricedSegments : Send to cancel only specified unpriced segments. Must also send unpricedFlightSegmentIDRefs to specify the unpriced segments to cancel. If sent, must also send flightSegmentSelection. Required if cancelUnpricedSegments sent flightSegmentSelection Send to cancel specified unpriced segments. Includes the following: sendPassiveNotificationInd : Send with value true only if specified unpriced segments include one or more passive segments An air segment booked in a system outside the Travleport GDS. Adding a passive air segment to a booking maintains all travel details as part of the complete itinerary. . Ignored for non-passive segments. True causes the message to be sent to the vendor airline system.&#160;The corresponding Travelport+ terminal entry is X{n} in which n=segment number. unpricedFlightSegmentIDRefs : String array. Send the segment IDs of the unpriced segments to cancel, as in "unpricedFlightSegmentIDRefs": [ "unPricedFlightSegment_1", "unPricedFlightSegment_2" ] &#160; Required if cancelUnpricedSegments sent Response All of the request payloads above return a transaction identifier in the same format in the response. Show Response Body Table Object Description ReservationResponse Top level object. Reservation Top level object. Includes Identifier. Identifier Standard Travelport system-generated transaction identifier. Key value pairs: authority : Source of information. value : Unique system-generated identifier. Example Request For details on when the following payloads are supported, and GDS&#160;and NDC support, see Cancel Offers, Products, Segments from a Booking in the Booking Guide. The following payload cancels the entire booking. Show Example request to cancel entire reservation { "@type": "CancelRequest", "cancelAllInd": true } The following payload cancels all offers (air, hotel, and car as applicable) on a GDS held booking. Supported only for GDS in the post-commit workbench. Show Example request to cancel all offers (inclusive of air/car/hotel) { "@type": "CancelRequest", "cancelOffers": { "objectType": "CancelAllOffers" } } The following payload includes retainSegmentsInd to cancel the filed fare from all air offers (supported for GDS only) and retain the segments. The segments are converted from the Offer object to UnpricedSegment. Show Example request to cancel filed fare from all air offers { "@type": "CancelRequest", "cancelOffers": { "objectType": "CancelAllOffers" "retainSegmentsInd": true } } The following payload cancels two specified offers and leaves all other offers on the booking. Show Example request to cancel multiple offers { "@type": "CancelRequest", "cancelOffers": { "objectType": "CancelSelectedOffers", "offerProductSelection": [ { "sendPassiveNotificationInd": true, "offerID": { "Identifier": { "authority": "Travelport", "value": "30420d72-2d73-4506-bd93-e4f7da67d04d" } } }, { "sendPassiveNotificationInd": true, "offerID": { "Identifier": { "authority": "Travelport", "value": "8b72118d-0247-449b-89bd-6ab554f550df" } } } ] } } The following payload includes retainSegmentsInd to cancel the filed fare from specified air offers (supported for GDS only) and retain the segments. The segments are converted from the Offer object to UnpricedSegment. Show Example request to cancel filed fare on select air offers { "@type": "CancelRequest", "cancelOffers": { "objectType": "CancelSelectedOffers", "offerProductSelection": [ { "sendPassiveNotificationInd": true, "retainSegmentsInd": true, "offerID": { "Identifier": { "authority": "Travelport", "value": "d937ddcd-34a0-4da9-aa97-ad54056a726b" } } } ] } } The following payload cancels a product within an offer. Show Example request to cancel a product within an offer { "@type": "CancelRequest", "cancelOffers": { "objectType": "CancelSelectedOffers", "offerProductSelection": [ { "sendPassiveNotificationInd": true, "offerID": { "Identifier": { "authority": "Travelport", "value": "672ccee8-d754-48a6-a5be-830098eb6429" } }, "productSegmentSequenceArray": [ { "productID": { "Identifier": { "authority": "Travelport", "value": "7687b84c-aa13-4d8c-b7d0-622ea57a9573" } } } ] } ] } } The following payload cancels a segment within a product. Show Example request to cancel a segment within a product { "@type": "CancelRequest", "cancelOffers": { "objectType": "CancelSelectedOffers", "offerProductSelection": [ { "sendPassiveNotificationInd": true, "offerID": { "Identifier": { "authority": "Travelport", "value": "64efc64a-6871-479f-873f-2ccde84da74b" } }, "productSegmentSequenceArray": [ { "productID": { "Identifier": { "authority": "Travelport", "value": "4ac1483f-4d8b-405a-b90b-b1ea00f8f069" } }, "segmentSequenceArray": [ 4,5 ] } ] } ] } } The following payload cancels multiple product and segment combinations. Show Example request to cancel multiple product and segment combinations { "@type": "CancelRequest", "cancelOffers": { "objectType": "CancelSelectedOffers", "offerProductSelection": [ { "sendPassiveNotificationInd": true, "offerID": { "Identifier": { "authority": "Travelport", "value": "ada4e19a-b52a-43cd-b1ed-e9a1c5cee7d8" } } }, { "sendPassiveNotificationInd": true, "offerID": { "Identifier": { "authority": "Travelport", "value": "accc35ff-9dde-45cd-810e-afc2612f74c2" } }, "productSegmentSequenceArray": [ { "productID": { "Identifier": { "authority": "Travelport", "value": "ae4ee9ee-88de-4d05-a07a-360c2e8aaad6" } } } ] } ] } } Show Example request to cancel all unpriced segments { "@type": "CancelRequest", "cancelUnpricedSegments": { "objectType": "CancelAllUnpricedSegments" } } Show Example request to cancel specific unpriced segments { "@type": "CancelRequest", "cancelUnpricedSegments": { "objectType": "CancelSelectedUnpricedSegments", "flightSegmentSelection": [ { "sendPassiveNotificationInd": true, "unpricedFlightSegmentIDRefs": [ "unPricedFlightSegment_1" ] } ] } } Show Example request to cancel offer and unpriced segment { "@type": "CancelRequest", "cancelOffers": { "objectType": "CancelSelectedOffers", "offerProductSelection": [ { "sendPassiveNotificationInd": true, "offerID": { "Identifier": { "authority": "Travelport", "value": "f09eb521-0b9f-463e-8176-025356af0d7b" } } } ] }, "cancelUnpricedSegments": { "objectType": "CancelSelectedUnpricedSegments", "flightSegmentSelection": [ { "sendPassiveNotificationInd": true, "unpricedFlightSegmentIDRefs": [ "unPricedFlightSegment_1", "unPricedFlightSegment_2" ] } ] } } Example Response All of the request payloads above return a transaction identifier in the response per the example below. Show Example { "ReservationResponse": { "Reservation": { "@type": "Reservation", "Identifier": { "value": "8521bef5-da95-496f-9b03-fc3b1fcac50b", "authority": "Travelport" } } } }

## Literal `<pre>` excerpts from HTML

### Block 1

```
{
  "@type": "CancelRequest",
  "cancelAllInd": true
}
```

### Block 2

```
{
 "@type": "CancelRequest",
 "cancelOffers": {
  "objectType": "CancelAllOffers"
 }
}
```

### Block 3

```
{
    "@type": "CancelRequest",
    "cancelOffers": {
        "objectType": "CancelAllOffers"
        "retainSegmentsInd": true
    }
}
```

### Block 4

```
{
 "@type": "CancelRequest",
 "cancelOffers": {
  "objectType": "CancelSelectedOffers",
  "offerProductSelection": [
   {
    "sendPassiveNotificationInd": true,
    "offerID": {
     "Identifier": {
      "authority": "Travelport",
      "value": "30420d72-2d73-4506-bd93-e4f7da67d04d"
     }
    }
   },
   {
    "sendPassiveNotificationInd": true,
    "offerID": {
     "Identifier": {
      "authority": "Travelport",
      "value": "8b72118d-0247-449b-89bd-6ab554f550df"
     }
    }
   }
  ]
 }
}
```

### Block 5

```
{
 "@type": "CancelRequest",
 "cancelOffers": {
  "objectType": "CancelSelectedOffers",
  "offerProductSelection": [
   {
    "sendPassiveNotificationInd": true,
    "retainSegmentsInd": true,
    "offerID": {
     "Identifier": {
      "authority": "Travelport",
      "value": "d937ddcd-34a0-4da9-aa97-ad54056a726b"
     }
    }
   }
  ]
 }
}
```

### Block 6

```
{
    "@type": "CancelRequest",
    "cancelOffers": {
        "objectType": "CancelSelectedOffers",
        "offerProductSelection": [
            {
                "sendPassiveNotificationInd": true,
                "offerID": {
                    "Identifier": {
                        "authority": "Travelport",
                        "value": "672ccee8-d754-48a6-a5be-830098eb6429"
                    }
                },
                "productSegmentSequenceArray": [
                    {
                        "productID": {
                            "Identifier": {
                                "authority": "Travelport",
                                "value": "7687b84c-aa13-4d8c-b7d0-622ea57a9573"
                            }
                        }
                    }
                ]
            }
        ]
    }
}
```

### Block 7

```
{
    "@type": "CancelRequest",
    "cancelOffers": {
        "objectType": "CancelSelectedOffers",
        "offerProductSelection": [
            {
                "sendPassiveNotificationInd": true,
                "offerID": {
                    "Identifier": {
                        "authority": "Travelport",
                        "value": "64efc64a-6871-479f-873f-2ccde84da74b"
                    }
                },
                "productSegmentSequenceArray": [
                    {
                        "productID": {
                            "Identifier": {
                                "authority": "Travelport",
                                "value": "4ac1483f-4d8b-405a-b90b-b1ea00f8f069"
                            }
                        },
                        "segmentSequenceArray": [
                            4,5
                        ]
                    }
                ]
            }
        ]
    }
}
```

### Block 8

```
{
    "@type": "CancelRequest",
    "cancelOffers": {
        "objectType": "CancelSelectedOffers",
        "offerProductSelection": [
            {
                "sendPassiveNotificationInd": true,
                "offerID": {
                    "Identifier": {
                        "authority": "Travelport",
                        "value": "ada4e19a-b52a-43cd-b1ed-e9a1c5cee7d8"
                    }
                }
            },
            {
                "sendPassiveNotificationInd": true,
                "offerID": {
                    "Identifier": {
                        "authority": "Travelport",
                        "value": "accc35ff-9dde-45cd-810e-afc2612f74c2"
                    }
                },
                "productSegmentSequenceArray": [
                    {
                        "productID": {
                            "Identifier": {
                                "authority": "Travelport",
                                "value": "ae4ee9ee-88de-4d05-a07a-360c2e8aaad6"
                            }
                        }
                    }
                ]
            }
        ]
    }
}
```

### Block 9

```
{
 "@type": "CancelRequest",
 "cancelUnpricedSegments": {
  "objectType": "CancelAllUnpricedSegments"
 }
}
```

### Block 10

```
{
    "@type": "CancelRequest",
    "cancelUnpricedSegments": {
        "objectType": "CancelSelectedUnpricedSegments",
        "flightSegmentSelection": [
            {
                "sendPassiveNotificationInd": true,
                "unpricedFlightSegmentIDRefs": [
                    "unPricedFlightSegment_1"
                ]
            }
        ]
    }
}
```

### Block 11

```
{
    "@type": "CancelRequest",
    "cancelOffers": {
        "objectType": "CancelSelectedOffers",
        "offerProductSelection": [
            {
                "sendPassiveNotificationInd": true,
                "offerID": {
                    "Identifier": {
                        "authority": "Travelport",
                        "value": "f09eb521-0b9f-463e-8176-025356af0d7b"
                    }
                }
            }
        ]
    },
  "cancelUnpricedSegments": {
        "objectType": "CancelSelectedUnpricedSegments",
        "flightSegmentSelection": [
            {
                "sendPassiveNotificationInd": true,
                "unpricedFlightSegmentIDRefs": [
                    "unPricedFlightSegment_1",
                    "unPricedFlightSegment_2"
                ]
            }
        ]
    }
}
```

### Block 12

```
{
 "ReservationResponse": {
  "Reservation": {
   "@type": "Reservation",
   "Identifier": {
    "value": "8521bef5-da95-496f-9b03-fc3b1fcac50b",
    "authority": "Travelport"
   }
  }
 }
}
```

