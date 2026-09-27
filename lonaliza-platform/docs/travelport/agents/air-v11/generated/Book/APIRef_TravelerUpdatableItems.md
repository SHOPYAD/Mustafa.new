# Traveler Updatable Items API&#160;Reference

## Source

- **Local HTML:** `docs/travelport/travelport api guide/travelport-airapi json/support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/Book/APIRef_TravelerUpdatableItems.html` (UTF-8 mirror)
- **Official base:** `https://support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/` + same relative path

## Plaintext extract (lossy)

Traveler Updatable Items API&#160;Reference Skip To Main Content Account Settings Logout placeholder Account Settings Logout Filter: All Files Submit Search Filter: All Files Submit Search Traveler Updatable Items API&#160;Reference Request Response Example request Example response POST book/updatableItem/reservationworkbench/ {workbenchID} /travelerupdatableitems/buildfromtraveler For {workbenchID} send the workbench identifier returned in ReservationResponse/Identifer/value in the workbench create response. Base path: Pre-production https://api.pp.travelport.net/11/air/ Production https://api.travelport.net/11/air/ Related Content: Booking Guide , Traveler Modify Guide Use the Updatable Items request to return a list of traveler information that can be updated. Updatable Items retrieves by one or more traveler IDs a list of objects that are updatable for that traveler/s, and returns for each an indicator for whether that item can be added, modified, or deleted. It is sent as part of a workbench session, either during the initial booking workflow or a post-commit workbench for an existing reservation. It is followed by a Traveler Update request to implement changes.&#160; See the Traveler Modify Guide for a list of supported changes. Request As part of the request requirements, also see Authentication and Common Air API Headers . Query Parameters None. Request Body Show Request Body Table Object Description TravelerUpdatableItemsQueryBuildFromTraveler Top level object. Identifier Array. Sends identifier/s as string/s for the traveler/s to retrieve a list of updatable items for. After you establish a post-commit workbench session , send a request for updatable items with the traveler identifier for each traveler to update. You can request one or more travelers on the same reservation. If you need the traveler identifiers, retrieve the reservation before you create the workbench, or retrieve the workbench to get full reservation details. The payload must send the traveler identifier for each passenger with information to update. Response Show Response Body Table Object Description TravelerUpdatableItemsListResponse Top level object. Key value pairs: transactionId : System-generated unique ID for this response. Can be used for internal tracking and troubleshooting. traceId : Returned if a custom trace ID was sent in the request header. See Transaction and Trace IDs for details. See Identifiers in the JSON &#160;APIs for more about identifiers across all JSON &#160;APIs. Includes Identifier and TravelerUpdatableItemsID. TravelerUpdatableItemsID Key value pairs: travelerIdentifier: Traveler identifier for traveler to which this updatable item applies. id: Short id for TravelerUpdatableItemsID object. Includes Identifier object. TravelerUpdatableItemsID/ Identifier Returns an identifier for the TravelerUpdatableItemsID object in these key value pairs: authority : Source of information. value : Unique system-generated identifier. TravelerUpdatableItem Returns array of updatable objects with an @type value of TravelerUpdatableItem/ {ItemName} per below; for example, TravelerUpdatableItemEmail. @type value TravelerUpdatableItem {ObjectName} Currently supported objects are: TravelerUpdatableItemEmail TravelerUpdatableItemTelephone TravelerUpdatableItemAddress TravelerUpdatableItemCustomerLoyalty TravelerUpdatableItemTravelDocument TravelerUpdatableItemPersonName TravelerUpdatableItemComments Object for the type of data supported for modification, deletion, or addition. Each supported object includes all of the following objects: Identifier: Unique system-generated identifier for this data element; must be sent in any subsequent Traveler Update request to add, modify, or delete the data in this instance. {action}Ind : Returns any of the following key value pairs that are true: modifiableInd: true indicates currently existing data that can be modified on the booking. deletableInd: true indicates currently existing data that can be deleted from the booking. addableInd: true indicates this type of data can be added to the booking. {CurrentData} : When data exists and is either modifiable or deletable, this object returns the current data in that object. Supported objects in the corresponding TravelerUpdatableItem{objectName} are: Email Telephone Address CustomerLoyalty TravelDocument PersonName Comments TravelerUpdatableItemsListResponse/ Identifier Unique system-generated identifier for this response as a whole. The value in Identifier/value must be sent in the endpoint for any subsequent Traveler Update request for the data in this response. authority : Source of information. value : Unique system-generated identifier. Example Request Show Example Updatable Items Request for one traveler { "TravelerUpdatableItemsQueryBuildFromTraveler": { "TravelerIdentifier": [ "371c780b-75ba-448a-8656-aa156f6c363c" ] } } Example Response The following example returns the information supported for adding, modifying, and deleting. Show Example { "TravelerUpdatableItemsListResponse": { "@type": "TravelerUpdatableItemsListResponse", "transactionId": "453eb1a8-3b4c-4cb0-8f76-b06bb33613cb", "traceId": "default_34d6b060-1308-44a2-978e-15021f9fbfb2", "TravelerUpdatableItemsID": [ { "@type": "TravelerUpdatableItems", "travelerIdentifier": "371c780b-75ba-448a-8656-aa156f6c363c", "id": "travelerUpdatableItems1", "Identifier": { "authority": "Travelport", "value": "5350c4c5-37d7-4a9f-8807-9e73e04ef457" }, "TravelerUpdatableItem": [ { "@type": "TravelerUpdatableItemEmail", "modifiableInd": true, "deletableInd": true, "Identifier": "69b414bb-6747-47de-a8bf-1e0b4a8ae328", "Email": { "emailType": "TO", "value": "indranil.ghosh@travelport.com" } }, { "@type": "TravelerUpdatableItemEmail", "addableInd": true, "Identifier": "585fac39-7123-4409-b721-b2665fa34b6e" }, { "@type": "TravelerUpdatableItemTelephone", "modifiableInd": true, "deletableInd": true, "Identifier": "2590fba4-a7c3-4d0d-9b41-989eb4dcdc22", "Telephone": { "@type": "TelephoneDetail", "countryAccessCode": "1", "areaCityCode": "719", "phoneNumber": "6401108", "extension": "123", "id": "telephone_1", "cityCode": "DEN", "role": "Mobile" } }, { "@type": "TravelerUpdatableItemTelephone", "addableInd": true, "Identifier": "d0652918-c5c6-4273-b72d-635ffba0263a" }, { "@type": "TravelerUpdatableItemAddress", "addableInd": true, "Identifier": "1661b29c-388d-4a8c-896e-c0a597e439bf" }, { "@type": "TravelerUpdatableItemCustomerLoyalty", "addableInd": true, "Identifier": "8fe1e8d3-5e75-4c95-86c3-817ef930d18e" }, { "@type": "TravelerUpdatableItemTravelDocument", "modifiableInd": true, "deletableInd": true, "Identifier": "4e61a940-c2c9-43bd-af09-727b5f6559d7", "TravelDocument": { "@type": "TravelDocumentDetail", "docNumber": "88989889", "docType": "Passport", "expireDate": "2024-12-05", "issueCountry": "US", "birthDate": "1991-12-12", "Gender": "Male", "PersonName": { "@type": "PersonName", "Given": "SAM", "Surname": "HOUSTON" } } }, { "@type": "TravelerUpdatableItemTravelDocument", "modifiableInd": true, "deletableInd": true, "Identifier": "01dcc23f-97ea-4be4-ae27-c640ffa95dea", "TravelDocument": { "@type": "TravelDocumentDetail", "birthDate": "1940-09-18", "Gender": "Male", "PersonName": { "@type": "PersonName", "Given": "Sam", "Middle": "Tex", "Surname": "Houston" } } }, { "@type": "TravelerUpdatableItemTravelDocument", "addableInd": true, "Identifier": "ef2e4357-ceba-40da-bfb5-f5854433a590" }, { "@type": "TravelerUpdatableItemPersonName", "modifiableInd": true, "Identifier": "1e498ecb-ed3f-45bf-8384-ba5a932141b4", "PersonNameUpdatable": { "@type": "PersonNameUpdatable", "Given": "SAM", "Surname": "HOUSTON" } }, { "@type": "TravelerUpdatableItemComments", "addableInd": true, "Identifier": "725da179-4ffa-404c-a13e-eacf41fb1167" } ] } ], "Identifier": { "authority": "Travelport", "value": "e19aae3d-5af1-4527-97ae-f484207c4ea3" } } }

## Literal `<pre>` excerpts from HTML

### Block 1

```
{
    "TravelerUpdatableItemsQueryBuildFromTraveler": {
        "TravelerIdentifier": [
            "371c780b-75ba-448a-8656-aa156f6c363c"
        ]
    }
}
```

### Block 2

```
{
    "TravelerUpdatableItemsListResponse": {
        "@type": "TravelerUpdatableItemsListResponse",
        "transactionId": "453eb1a8-3b4c-4cb0-8f76-b06bb33613cb",
        "traceId": "default_34d6b060-1308-44a2-978e-15021f9fbfb2",
        "TravelerUpdatableItemsID": [
            {
                "@type": "TravelerUpdatableItems",
                "travelerIdentifier": "371c780b-75ba-448a-8656-aa156f6c363c",
                "id": "travelerUpdatableItems1",
                "Identifier": {
                    "authority": "Travelport",
                    "value": "5350c4c5-37d7-4a9f-8807-9e73e04ef457"
                },
                "TravelerUpdatableItem": [
                    {
                        "@type": "TravelerUpdatableItemEmail",
                        "modifiableInd": true,
                        "deletableInd": true,
                        "Identifier": "69b414bb-6747-47de-a8bf-1e0b4a8ae328",
                        "Email": {
                            "emailType": "TO",
                            "value": "indranil.ghosh@travelport.com"
                        }
                    },
                    {
                        "@type": "TravelerUpdatableItemEmail",
                        "addableInd": true,
                        "Identifier": "585fac39-7123-4409-b721-b2665fa34b6e"
                    },
                    {
                        "@type": "TravelerUpdatableItemTelephone",
                        "modifiableInd": true,
                        "deletableInd": true,
                        "Identifier": "2590fba4-a7c3-4d0d-9b41-989eb4dcdc22",
                        "Telephone": {
                            "@type": "TelephoneDetail",
                            "countryAccessCode": "1",
                            "areaCityCode": "719",
                            "phoneNumber": "6401108",
                            "extension": "123",
                            "id": "telephone_1",
                            "cityCode": "DEN",
                            "role": "Mobile"
                        }
                    },
                    {
                        "@type": "TravelerUpdatableItemTelephone",
                        "addableInd": true,
                        "Identifier": "d0652918-c5c6-4273-b72d-635ffba0263a"
                    },
                    {
                        "@type": "TravelerUpdatableItemAddress",
                        "addableInd": true,
                        "Identifier": "1661b29c-388d-4a8c-896e-c0a597e439bf"
                    },
                    {
                        "@type": "TravelerUpdatableItemCustomerLoyalty",
                        "addableInd": true,
                        "Identifier": "8fe1e8d3-5e75-4c95-86c3-817ef930d18e"
                    },
                    {
                        "@type": "TravelerUpdatableItemTravelDocument",
                        "modifiableInd": true,
                        "deletableInd": true,
                        "Identifier": "4e61a940-c2c9-43bd-af09-727b5f6559d7",
                        "TravelDocument": {
                            "@type": "TravelDocumentDetail",
                            "docNumber": "88989889",
                            "docType": "Passport",
                            "expireDate": "2024-12-05",
                            "issueCountry": "US",
                            "birthDate": "1991-12-12",
                            "Gender": "Male",
                            "PersonName": {
                                "@type": "PersonName",
                                "Given": "SAM",
                                "Surname": "HOUSTON"
                            }
                        }
                    },
                                        {
                        "@type": "TravelerUpdatableItemTravelDocument",
                        "modifiableInd": true,
                        "deletableInd": true,
                        "Identifier": "01dcc23f-97ea-4be4-ae27-c640ffa95dea",
                        "TravelDocument": {
                            "@type": "TravelDocumentDetail",
                            "birthDate": "1940-09-18",
                            "Gender": "Male",
                            "PersonName": {
                                "@type": "PersonName",
                                "Given": "Sam",
                                "Middle": "Tex",
                                "Surname": "Houston"
                            }
                        }
                    },
                    {
                        "@type": "TravelerUpdatableItemTravelDocument",
                        "addableInd": true,
                        "Identifier": "ef2e4357-ceba-40da-bfb5-f5854433a590"
                    },
                    {
                        "@type": "TravelerUpdatableItemPersonName",
                        "modifiableInd": true,
                        "Identifier": "1e498ecb-ed3f-45bf-8384-ba5a932141b4",
                        "PersonNameUpdatable": {
                            "@type": "PersonNameUpdatable",
                            "Given": "SAM",
                            "Surname": "HOUSTON"
                        }
                    },
                    {
                        "@type": "TravelerUpdatableItemComments",
                        "addableInd": true,
                        "Identifier": "725da179-4ffa-404c-a13e-eacf41fb1167"
                    }
                ]
            }
        ],
        "Identifier": {
            "authority": "Travelport",
            "value": "e19aae3d-5af1-4527-97ae-f484207c4ea3"
        }
    }
}
```

