---

## title: "GET /hotel/search/properties/{identifier} — Search pagination"
module: TripServices Stays — Search & Details
api_version: "11.33.0"
source_url: "[https://developer.travelport.com/apis/stays/search-and-details/getpropertiespage.md](https://developer.travelport.com/apis/stays/search-and-details/getpropertiespage.md)"
mirrored_at: "2026-04-30"

# Return additional search results (pagination).

Return additional search results. The v11 hotel search APIs (Search by Location and Search by ID) use pagination by default. Search responses return up to 100 properties in the initial response, or all available properties if fewer than 100. The search response notes the total number of properties found and includes an identifier to be used for retrieving additional pages. If the search response indicates that more than 100 properties are available, you can use this Search Pagination request to retrieve each additional page of 100 properties until all available properties have been retrieved.

Endpoint: GET /hotel/search/properties/{identifier}
Version: 11.33.0
Security: bearerAuth

## Path parameters:

- `identifier` (string, required)
The Identifier of the Properties from which a page is to be returned

## Query parameters:

- `pageNumber` (string, required)
The page number of the page of results to retrieve (e.g., second page is pageNumber=2, etc.). The Search by ID or Search by Location response returns page 1, so values here should be between 2 and 5 inclusive. You are not required to retrieve pages consecutively.

## Header parameters:

- `TraceId` (string)
Used in hospitality workflows to provide a Unique transaction or tracking id for a single request and response.
Example: "TraceID_123456789"
- `XAUTH_TRAVELPORT_ACCESSGROUP` (string)
Identifies the Travelport access group with which the caller is associated
Example: "19Y88702-C27A-4E5D-829A-89D7016688B1"
- `TVP-PCC-Core` (string)
Allows user to pass PCC instead of Access Group ID
Example: "DU7_1G"
- `TVP-Correlation-Id` (string)
Identifier used to correlate hotel API invocations across a multi-call business flow.
Example: "382c74c3-721d-4f34-80e5-57657b6cbc27"
- `Accept-Encoding` (string, required)
Comma-separated list of acceptable encodings like gzip and/or deflate
Example: "gzip, deflate"

## Response 200 fields (application/json):

- `PropertiesResponse` (object)
The response of a Properties endpoint request.
- `PropertiesResponse.Properties` (object)
Returns the properties list and pagination information.
- `PropertiesResponse.Properties.@type` (string, required)
Discriminator classes Properties and PropertiesID
- `PropertiesResponse.Properties.Identifier` (object)
A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).
- `PropertiesResponse.Properties.Identifier.value` (string)
"Unique offer identifier that can be sent in subsequent payload requests to reference this offer.
When used specifically for form of payment, the value will begin with the characters 'FOP'. Similarly, the OfferIdentifier associated will begin with the character 'O'.
For Hotel Create Reservation (Reference Payload), send the value from the Availability response in CatalogOffering/id or the value from SearchComplete returned in propertyItems/lowestPublicAvailableRate/rateKey/value. 
Results from Availability and SearchComplete are stored in the cache for 30 minutes. If the offers expire before booking, you must send a new request."
Example: "A0656EFF-FAF4-456F-B061-0161008D7C4E"
- `PropertiesResponse.Properties.Identifier.authority` (string)
"Name of the supplier system that created this identifier. 
For Hotels, authority indicates which supplier returned the lowest available rate for that property: either TVPT (Travelport) or BKNG (booking.com). Booking.com access requires additional provisioning and a direct agreement with the supplier. Authority is not returned if the property is closed or returns an error.
For Hotel Create Reservation (Full Payload) and Sync Reservation send the value from the Availability response in CatalogOffering/Identifier/authority for the instance you want to book."
Example: "TVPT"
- `PropertiesResponse.Properties.totalProperties` (integer)
The total number of properties returned in the search.
- `PropertiesResponse.Properties.propertiesPerPage` (integer)
The number of properties returned in the current page.
- `PropertiesResponse.Properties.numberOfPages` (integer)
The total number of pages that can returned in the search.
- `PropertiesResponse.Properties.PropertyInfo` (array, required)
- `PropertiesResponse.Properties.PropertyInfo.@type` (string)
- `PropertiesResponse.Properties.PropertyInfo.id` (string)
Property identifier composed of the chain and property codes.
- `PropertiesResponse.Properties.PropertyInfo.Identifier` (object)
A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).
- `PropertiesResponse.Properties.PropertyInfo.availability` (string)
Indicates whether the property has rooms available for the requested dates.
Enum: "Open", "Close", "ClosedOnArrival", "ClosedOnArrivalOnRequest", "OnRequest", "RemoveCloseOnly", "Other"
- `PropertiesResponse.Properties.PropertyInfo.Distance` (object)
For Air: distance covered by the flight. 
For Hotel: a radius around a specified location. The Distance object is returned in all Hotel Search responses but is not relevant to a search by property IDs, only for a search by location.
- `PropertiesResponse.Properties.PropertyInfo.Distance.value` (number)
When using distance as a Hotel property search parameter, the maximum distance is 25 for miles and 40 for kilometres.
Example: 25
- `PropertiesResponse.Properties.PropertyInfo.Distance.unitOfDistance` (string)
For Hotels: Optional object to request either miles or kilometers for the search radius from the specified location. If unitOfDistance is not specified, the search defaults to miles for properties in the United States, Myanmar, and Liberia. The search defaults to kilometers in all other countries.
Enum: "Miles", "Kilometers"
- `PropertiesResponse.Properties.PropertyInfo.Property` (object, required)
- `PropertiesResponse.Properties.PropertyInfo.Property.@type` (string, required)
Discriminator classes Property, PropertyID, and PropertyDetail
Example: "PropertyDetail"
- `PropertiesResponse.Properties.PropertyInfo.Property.id` (string)
Property ID composed of the chain and property codes.
- `PropertiesResponse.Properties.PropertyInfo.Property.Identifier` (object)
A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).
- `PropertiesResponse.Properties.PropertyInfo.Property.PropertyKey` (object, required)
Contains up to 250 PropertyKey objects. Each PropertyKey object identifies one property.
- `PropertiesResponse.Properties.PropertyInfo.Property.PropertyKey.@type` (string)
- `PropertiesResponse.Properties.PropertyInfo.Property.PropertyKey.chainCode` (string, required)
Code for the hotel chain (typically 2 characters)
Example: "UR"
- `PropertiesResponse.Properties.PropertyInfo.Property.PropertyKey.propertyCode` (string, required)
The property code of the requested property (typically 5 characters).
Example: "G3375"
- `PropertiesResponse.Properties.PropertyInfo.Property.name` (string, required)
The name of a specific property.
- `PropertiesResponse.Properties.PropertyInfo.Property.Rating` (array)
- `PropertiesResponse.Properties.PropertyInfo.Property.Rating.value` (number)
Rating used to classify hotels according to the quality
Example: 5
- `PropertiesResponse.Properties.PropertyInfo.Property.Rating.provider` (string)
The source who has granted the quality rating
Example: "NTM"
- `PropertiesResponse.Properties.PropertyInfo.Property.GeoLocation` (object)
For Hotel: the geographic coordinates of the property.
- `PropertiesResponse.Properties.PropertyInfo.Property.GeoLocation.latitude` (number, required)
Numeric value representing latitude of search center point in degrees and decimal minutes.
Example: 38.8951
- `PropertiesResponse.Properties.PropertyInfo.Property.GeoLocation.longitude` (number, required)
Numeric value representing longitude of search center point in degrees and decimal minutes.
Example: -77.0364
- `PropertiesResponse.Properties.PropertyInfo.Property.GeoLocation.altitude` (number)
The height of a location, typically measured above sea level
Example: 5280
- `PropertiesResponse.Properties.PropertyInfo.Property.GeoLocation.altitudeUnitOfDistance` (string)
For Hotels: Optional object to request either miles or kilometers for the search radius from the specified location. If unitOfDistance is not specified, the search defaults to miles for properties in the United States, Myanmar, and Liberia. The search defaults to kilometers in all other countries.
Enum: "Miles", "Kilometers"
- `PropertiesResponse.Properties.PropertyInfo.Property.GeoLocation.positionAccuracy` (string)
Specifies the level of accuracy for the position
Enum: "Zip9Code", "Zip7Code", "Zip5Code", "Street", "State", "Property", "Intersection", "Exact", "County", "City", "Block"
- `PropertiesResponse.Properties.PropertyInfo.Property.GeoLocation.mapURL` (string)
link for embedded map showing location
Example: "[www.destinationmap.com](http://www.destinationmap.com)"
- `PropertiesResponse.Properties.PropertyInfo.Property.GeoLocation.formatURL` (string)
The URL to the format for the latitude and longitude for this location.
Example: "[www.destinationmap.com](http://www.destinationmap.com)"
- `PropertiesResponse.Properties.PropertyInfo.Property.Image` (array)
- `PropertiesResponse.Properties.PropertyInfo.Property.Image.value` (string)
URL of the image
- `PropertiesResponse.Properties.PropertyInfo.Property.Image.dimensionCategory` (string)
Deprecated and replaced by imageSize
- `PropertiesResponse.Properties.PropertyInfo.Property.Image.width` (integer)
Image width
Example: 42
- `PropertiesResponse.Properties.PropertyInfo.Property.Image.height` (integer)
Image height
Example: 43
- `PropertiesResponse.Properties.PropertyInfo.Property.Image.caption` (string)
Image caption
Example: "Ticket"
- `PropertiesResponse.Properties.PropertyInfo.Property.Image.pictureCategory` (integer)
deprecated and replaced by pictureOf
Example: 5
- `PropertiesResponse.Properties.PropertyInfo.Property.Image.imageSize` (string)
A size for the image to return, allowing you to set image quality. Hospitality APIs no longer support thumbnail.
Enum: "Large", "Medium", "Small", "Thumbnail", "ExtraLarge"
- `PropertiesResponse.Properties.PropertyInfo.Property.Image.pictureOf` (string)
The image category
Enum: "Exterior", "Lobby", "Pool", "Restaurant", "HealthClub", "GuestRoom", "Suite", "ConferenceRoom", "Ballroom", "Golf", "Beach", "Spa", "Bar", "Recreational", "RoomAmenity", "PropertyAmenity", "BusinessCentre", "Map", "Promotional", "Undefined", "Studio", "Attraction", "Other", "Amenity", "Logo", "MeetingRoom"
- `PropertiesResponse.Properties.PropertyInfo.Property.Description` (array)
A text description of the property.
- `PropertiesResponse.Properties.PropertyInfo.Property.BusinessService` (array)
Any business services available at the property.
- `PropertiesResponse.Properties.PropertyInfo.Property.BusinessService.code` (string)
OTA code for this type of service.
- `PropertiesResponse.Properties.PropertyInfo.Property.BusinessService.description` (string)
A description of the service.
- `PropertiesResponse.Properties.PropertyInfo.Property.BusinessService.proximityCode` (string)
Proximity code
- `PropertiesResponse.Properties.PropertyInfo.Property.BusinessService.existsInd` (boolean)
If present and true this service exists
- `PropertiesResponse.Properties.PropertyInfo.Property.BusinessService.includedInd` (boolean)
If present and true this service is included with no charge
- `PropertiesResponse.Properties.PropertyInfo.Property.AccessibilityFeature` (array)
Example: ["An array of AccessibilityFeature options"]
- `PropertiesResponse.Properties.PropertyInfo.Property.AccessibilityFeature.value` (string)
OTA code for this offering.
- `PropertiesResponse.Properties.PropertyInfo.Property.AccessibilityFeature.description` (string)
Free text description of a given offering.
- `PropertiesResponse.Properties.PropertyInfo.Property.GuestRoomInfo` (array)
Example: ["Total number of rooms or number of floors."]
- `PropertiesResponse.Properties.PropertyInfo.Property.GuestRoomInfo.@type` (string)
Example: "GuestRoomInfo"
- `PropertiesResponse.Properties.PropertyInfo.Property.GuestRoomInfo.code` (string)
OTA code for this description.
- `PropertiesResponse.Properties.PropertyInfo.Property.GuestRoomInfo.number` (integer)
Number of rooms with this feature or type of information.
- `PropertiesResponse.Properties.PropertyInfo.Property.GuestRoomInfo.description` (string)
Description of the guest room information.
- `PropertiesResponse.Properties.PropertyInfo.Property.classTypeCode` (string)
The OTA code of the property detail
- `PropertiesResponse.Properties.PropertyInfo.Property.segmentCatagoryCode` (string)
Segment category code
- `PropertiesResponse.Properties.PropertyInfo.Property.locationCatagoryCode` (string)
Location category code
- `PropertiesResponse.Properties.PropertyInfo.Property.complimentaryParking` (string)
Yes , No , Unknown
Enum: "Yes", "No", "Unknown"
- `PropertiesResponse.Properties.PropertyInfo.Property.Address` (object)
The property or billing address information.
- `PropertiesResponse.Properties.PropertyInfo.Property.Address.@type` (string, required)
Discriminator classes include Address or AddressDetail
Example: "AddressDetail"
- `PropertiesResponse.Properties.PropertyInfo.Property.Address.id` (string)
unique address id
Example: "Address_1"
- `PropertiesResponse.Properties.PropertyInfo.Property.Address.BldgRoom` (object)
Address with building and room number
- `PropertiesResponse.Properties.PropertyInfo.Property.Address.BldgRoom.value` (string)
Example: "Moore House"
- `PropertiesResponse.Properties.PropertyInfo.Property.Address.BldgRoom.buldingInd` (boolean)
When true, the information is a building name. When false, it is an apartment or room #
Example: true
- `PropertiesResponse.Properties.PropertyInfo.Property.Address.Number` (object)
The street number alone is the numerical number that precedes the street name in the address.
- `PropertiesResponse.Properties.PropertyInfo.Property.Address.Number.value` (string)
Street number value.
Example: "23B"
- `PropertiesResponse.Properties.PropertyInfo.Property.Address.Number.streetNmbrSuffix` (string)
Street Number Suffix
Example: "B"
- `PropertiesResponse.Properties.PropertyInfo.Property.Address.Number.streetDirection` (string)
Direction of the Street
Example: "NW"
- `PropertiesResponse.Properties.PropertyInfo.Property.Address.Number.ruralRouteNmbr` (string)
RuralRoute Number
Example: "76"
- `PropertiesResponse.Properties.PropertyInfo.Property.Address.Number.po_Box` (string)
PO Box Number
Example: "1001"
- `PropertiesResponse.Properties.PropertyInfo.Property.Address.Street` (string)
Street name. May also contain the street number when the Number element is missing.
Example: "ABC Street"
- `PropertiesResponse.Properties.PropertyInfo.Property.Address.AddressLine` (array)
Property street address. Used in place of Street and Number. Each element of the array represents an address line.
Example: ["2035 S Havana street"]
- `PropertiesResponse.Properties.PropertyInfo.Property.Address.City` (string, required)
Full name of the city, town, or postal station (i.e., a postal service territory, often used in a military address).
Example: "Dublin"
- `PropertiesResponse.Properties.PropertyInfo.Property.Address.County` (string)
County or Region Name.
Example: "Berkshire"
- `PropertiesResponse.Properties.PropertyInfo.Property.Address.StateProv` (object)
The standard code or abbreviation for the state, province, or region. May also include full length name.
- `PropertiesResponse.Properties.PropertyInfo.Property.Address.StateProv.value` (string)
State, province, or region code needed to identify location (typically two characters).
Example: "CA"
- `PropertiesResponse.Properties.PropertyInfo.Property.Address.StateProv.name` (string)
State, province, or region name needed to identify location.
Example: "California"
- `PropertiesResponse.Properties.PropertyInfo.Property.Address.Country` (object)
Contains the information needed to identify a country.
- `PropertiesResponse.Properties.PropertyInfo.Property.Address.Country.value` (string)
The ISO 3166 code for the property's address.
Example: "US"
- `PropertiesResponse.Properties.PropertyInfo.Property.Address.Country.id` (string)
Custom user-assigned identifier for the country.
Example: "23"
- `PropertiesResponse.Properties.PropertyInfo.Property.Address.Country.name` (string)
The full name of the country for the property's address.
Example: "United States"
- `PropertiesResponse.Properties.PropertyInfo.Property.Address.Country.codeContext` (string)
The source of a code, such as the organization that provided the id number
Example: "IATA"
- `PropertiesResponse.Properties.PropertyInfo.Property.Address.PostalCode` (string)
Postal code for the address.
Example: "Sl6 1AB"
- `PropertiesResponse.Properties.PropertyInfo.Property.Address.Addressee` (string)
The name of the company or person to be addressed
Example: "ACME INC"
- `PropertiesResponse.Properties.PropertyInfo.Property.Address.role` (string)
Defines the type of location the address is assigned to. For TravelAgency address leave blank or use "Other".
Enum: "Home", "Business", "Mailing", "Delivery", "Destination", "Other", "Billing"
- `PropertiesResponse.Properties.PropertyInfo.Property.Telephone` (array)
Property phone number.
Example: ["001-123-45678"]
- `PropertiesResponse.Properties.PropertyInfo.Property.Email` (object)
Electronic email addresses, in IETF specified format.
Booking.com requires a traveler email address in the Hotel Create Reservation and Add Reservation requests. A system-generated confirmation email is sent to the traveler after the booking completes.
- `PropertiesResponse.Properties.PropertyInfo.Property.Email.value` (string)
Example: "[exampledomain@example.com](mailto:exampledomain@example.com)"
- `PropertiesResponse.Properties.PropertyInfo.Property.Email.id` (string)
Electronic email addresses, in IETF specified format.
Example: "email_1"
- `PropertiesResponse.Properties.PropertyInfo.Property.Email.emailType` (string)
Use email type to specify if the email is to be sent "TO" or sent "FROM"
Example: "FROM"
- `PropertiesResponse.Properties.PropertyInfo.Property.Email.comment` (string)
Comments associated to the email
- `PropertiesResponse.Properties.PropertyInfo.Property.Email.preferredFormat` (string)
Mime media type
Example: "text/html"
- `PropertiesResponse.Properties.PropertyInfo.Property.Email.shareMarketing` (string)
Used to indicate marketing preferences, Yes, No, Inherit
Enum: "Yes", "No", "Inherit"
- `PropertiesResponse.Properties.PropertyInfo.Property.Email.shareSync` (string)
Used to indicate marketing preferences, Yes, No, Inherit
Enum: "Yes", "No", "Inherit"
- `PropertiesResponse.Properties.PropertyInfo.Property.Email.optOutInd` (string)
Used to indicate marketing preferences, Yes, No, Inherit
Enum: "Yes", "No", "Inherit"
- `PropertiesResponse.Properties.PropertyInfo.Property.Email.optInStatus` (string)
Used to indicate marketing preferences, OptIn, OptOut
Enum: "OptedIn", "OptedOut", "Unknown"
- `PropertiesResponse.Properties.PropertyInfo.Property.Email.optInDate` (string)
The datetime of receiving the opt in notice
Example: "2026-03-03 11:11:00+00:00"
- `PropertiesResponse.Properties.PropertyInfo.Property.Email.optOutDate` (string)
The datetime the opt out notice was received
Example: "2026-03-03 11:11:00+00:00"
- `PropertiesResponse.Properties.PropertyInfo.Property.Email.validInd` (boolean)
If true, this is a valid email address that has been system verified via a successful email transmission.
Example: true
- `PropertiesResponse.Properties.PropertyInfo.Property.Email.provisionedInd` (boolean)
If true then the email address came from the provisioning process
Example: true
- `PropertiesResponse.Properties.PropertyInfo.Property.PropertyAmenity` (array)
- `PropertiesResponse.Properties.PropertyInfo.Property.PropertyAmenity.@type` (string)
Example: "PropertyAmenity"
- `PropertiesResponse.Properties.PropertyInfo.Property.PropertyAmenity.description` (string)
The type of amenity.
Example: "Wedding services"
- `PropertiesResponse.Properties.PropertyInfo.Property.PropertyAmenity.location` (string)
Location of the property
- `PropertiesResponse.Properties.PropertyInfo.Property.PropertyAmenity.Name` (string)
Name of the property
- `PropertiesResponse.Properties.PropertyInfo.Property.PropertyAmenity.OperationTimes` (object)
The daily times of operation of the location.
- `PropertiesResponse.Properties.PropertyInfo.Property.PropertyAmenity.OperationTimes.@type` (string)
- `PropertiesResponse.Properties.PropertyInfo.Property.PropertyAmenity.OperationTimes.daysOfWeek` (array)
Enum: "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
- `PropertiesResponse.Properties.PropertyInfo.Property.PropertyAmenity.OperationTimes.openTime` (string)
Example: "45900"
- `PropertiesResponse.Properties.PropertyInfo.Property.PropertyAmenity.OperationTimes.closeTime` (string)
Example: "06:00:00"
- `PropertiesResponse.Properties.PropertyInfo.Property.PropertyAmenity.Inclusion` (array)
- `PropertiesResponse.Properties.PropertyInfo.Property.PropertyAmenity.includedInd` (boolean)
To represent if the Amenity is included in the rate
- `PropertiesResponse.Properties.PropertyInfo.Property.PropertyAmenity.surchargeInd` (boolean)
To represent if the Amenity attracts a surcharge
- `PropertiesResponse.Properties.PropertyInfo.Property.PropertyAmenity.code` (string)
OTA code used to describe the property amenity.
Example: "104"
- `PropertiesResponse.Properties.PropertyInfo.Property.PropertyAmenity.category` (string)
Category of amenity.
Example: "Meeting Facilities"
- `PropertiesResponse.Properties.PropertyInfo.Property.PetPolicy` (object)
- `PropertiesResponse.Properties.PropertyInfo.Property.PetPolicy.@type` (string)
Example: "PetPolicy"
- `PropertiesResponse.Properties.PropertyInfo.Property.PetPolicy.allowed` (string, required)
Yes , No , Unknown
Enum: "Yes", "No", "Unknown"
- `PropertiesResponse.Properties.PropertyInfo.Property.PetPolicy.policyCode` (string)
Pet policy code
- `PropertiesResponse.Properties.PropertyInfo.Property.PetPolicy.Description` (object)
A descriptive text string and the related language.
- `PropertiesResponse.Properties.PropertyInfo.Property.PetPolicy.Description.value` (string)
Descriptive text provided by the supplier.
Example: "Ticket exchanged, room description text, or check in/out policy details."
- `PropertiesResponse.Properties.PropertyInfo.Property.PetPolicy.Description.languages` (array)
The language code of the description text.
Example: ["English"]
- `PropertiesResponse.Properties.PropertyInfo.Property.PetPolicy.Description.title` (string)
Title of the Text
Example: "Group details."
- `PropertiesResponse.Properties.PropertyInfo.Property.Restaurant` (array)
- `PropertiesResponse.Properties.PropertyInfo.Property.Restaurant.@type` (string)
Example: "Restaurant"
- `PropertiesResponse.Properties.PropertyInfo.Property.Restaurant.name` (string, required)
The name of the restaurant
- `PropertiesResponse.Properties.PropertyInfo.Property.Restaurant.cuisineCodes` (array)
An OTA code to define the cuisine type
Example: 12
- `PropertiesResponse.Properties.PropertyInfo.Property.Restaurant.proximityCode` (string)
An OTA proximity code
- `PropertiesResponse.Properties.PropertyInfo.Property.Restaurant.Distance` (object)
For Air: distance covered by the flight. 
For Hotel: a radius around a specified location. The Distance object is returned in all Hotel Search responses but is not relevant to a search by property IDs, only for a search by location.
- `PropertiesResponse.Properties.PropertyInfo.Property.Attraction` (array)
Each instance is one attraction near the property.
- `PropertiesResponse.Properties.PropertyInfo.Property.Attraction.@type` (string)
Example: "Attraction"
- `PropertiesResponse.Properties.PropertyInfo.Property.Attraction.name` (string, required)
The name of the attraction.
- `PropertiesResponse.Properties.PropertyInfo.Property.Attraction.Distance` (object)
For Air: distance covered by the flight. 
For Hotel: a radius around a specified location. The Distance object is returned in all Hotel Search responses but is not relevant to a search by property IDs, only for a search by location.
- `PropertiesResponse.Properties.PropertyInfo.Property.DrivingDirections` (object)
Textual information to provide descriptions andor additional information.
- `PropertiesResponse.Properties.PropertyInfo.Property.DrivingDirections.value` (string)
Example: "Additional information"
- `PropertiesResponse.Properties.PropertyInfo.Property.DrivingDirections.language` (string)
Language of the text.
Example: "English"
- `PropertiesResponse.Properties.PropertyInfo.Property.MeetingRooms` (object)
- `PropertiesResponse.Properties.PropertyInfo.Property.MeetingRooms.@type` (string)
Example: "MeetingRooms"
- `PropertiesResponse.Properties.PropertyInfo.Property.MeetingRooms.number` (integer)
- `PropertiesResponse.Properties.PropertyInfo.Property.MeetingRooms.MeetingRoom` (array)
- `PropertiesResponse.Properties.PropertyInfo.Property.MeetingRooms.MeetingRoom.@type` (string)
Example: "MeetingRoom"
- `PropertiesResponse.Properties.PropertyInfo.Property.MeetingRooms.MeetingRoom.name` (string, required)
The name of the meeting room
- `PropertiesResponse.Properties.PropertyInfo.Property.MeetingRooms.MeetingRoom.codes` (array)
OTA code for this room type.
- `PropertiesResponse.Properties.PropertyInfo.Property.MeetingRooms.MeetingRoom.capacity` (integer)
- `PropertiesResponse.Properties.PropertyInfo.Property.MeetingRooms.MeetingRoom.size` (integer)
- `PropertiesResponse.Properties.PropertyInfo.Property.MeetingRooms.MeetingRoom.unitOfSize` (string)
List of units of size i.e Square Feet, Square Meters
Enum: "Square Feet", "Square Meters"
- `PropertiesResponse.Properties.PropertyInfo.Property.VirtualTour` (object)
- `PropertiesResponse.Properties.PropertyInfo.Property.VirtualTour.@type` (string)
Example: "VirtualTour"
- `PropertiesResponse.Properties.PropertyInfo.Property.VirtualTour.url` (string, required)
- `PropertiesResponse.Properties.PropertyInfo.Property.VirtualTour.Description` (object)
Textual information to provide descriptions andor additional information.
- `PropertiesResponse.Properties.PropertyInfo.Property.CheckInOutPolicy` (object)
Property check in and out policies.
- `PropertiesResponse.Properties.PropertyInfo.Property.CheckInOutPolicy.@type` (string)
Example: "CheckInOutPolicy"
- `PropertiesResponse.Properties.PropertyInfo.Property.CheckInOutPolicy.checkInTime` (string, required)
The check-in time, local to the property, in 24 hour format.
Example: "900"
- `PropertiesResponse.Properties.PropertyInfo.Property.CheckInOutPolicy.checkOutTime` (string, required)
The check-out time, local to the property, in 24 hour format.
Example: "600"
- `PropertiesResponse.Properties.PropertyInfo.Property.CheckInOutPolicy.minimumAge` (integer)
Minimum age to reserve room.
Example: 18
- `PropertiesResponse.Properties.PropertyInfo.Property.CheckInOutPolicy.Description` (array)
- `PropertiesResponse.Properties.PropertyInfo.LowestAvailableRate` (object)
A monetary amount, up to 4 decimal places. Decimal place must be included.
- `PropertiesResponse.Properties.PropertyInfo.LowestAvailableRate.value` (number)
The amount of a given currency.
Example: 124.56
- `PropertiesResponse.Properties.PropertyInfo.LowestAvailableRate.code` (string)
An ISO 4217 alpha character code (3 characters) that specifies a money unit.
Example: "USD"
- `PropertiesResponse.Properties.PropertyInfo.LowestAvailableRate.minorUnit` (integer)
Minor units are a mechanism for expressing the relationship between a major currency unit and its corresponding minor currency unit.
Example: 2
- `PropertiesResponse.Properties.PropertyInfo.LowestAvailableRate.currencySource` (string)
The system requesting or returning the currency code specified in the attribute
Enum: "Supplier", "Charged", "Requested"
- `PropertiesResponse.Properties.PropertyInfo.LowestAvailableRate.approximateInd` (boolean)
"If true, the currency amount has been converted from the original amount.
For Hotel Availability and Rules, true indicates this is a calculated value; false indicates this is the value returned by the property."
Example: true
- `PropertiesResponse.Properties.PropertyInfo.NextSteps` (object)
Container for the steps that describe actions that may be taken on the containing object.
- `PropertiesResponse.Properties.PropertyInfo.NextSteps.baseURI` (string, required)
The base portion of the uri in order to shorten the uris in the individual steps
- `PropertiesResponse.Properties.PropertyInfo.NextSteps.id` (string)
Optional internally referenced id
Example: "5"
- `PropertiesResponse.Properties.PropertyInfo.NextSteps.NextStep` (array, required)
- `PropertiesResponse.Properties.PropertyInfo.NextSteps.NextStep.value` (string)
Example: "[www.resourcelocation.com](http://www.resourcelocation.com)"
- `PropertiesResponse.Properties.PropertyInfo.NextSteps.NextStep.id` (string)
Identifier for the Next Step
Example: "2"
- `PropertiesResponse.Properties.PropertyInfo.NextSteps.NextStep.action` (string, required)
The action this next step is intended to achieve
Example: "cancel"
- `PropertiesResponse.Properties.PropertyInfo.NextSteps.NextStep.method` (string, required)
Describes the set of potential methods that can be taken after an operation.
Enum: "GET", "DELETE", "PUT", "POST"
- `PropertiesResponse.Properties.PropertyInfo.NextSteps.NextStep.description` (string)
Additional clarification for the next step
Example: "remove offer from the order"
- `PropertiesResponse.Properties.PropertyInfo.featuredPropertyInd` (boolean)
Indicates if a property has been promoted to the top of the Properties list through the featured properties program. Featured properties always have this indicator and are sorted at the top of the list when searching by IATA city/airport codes.
- `PropertiesResponse.Properties.PropertyInfo.MaximumAvailableRate` (object)
The hotel's maximum available rate for the property for the requested dates.
- `PropertiesResponse.Properties.PropertyInfo.MaximumAvailableRate.value` (number)
Amount of maximum available rate.
Example: 124.56
- `PropertiesResponse.Properties.PropertyInfo.MaximumAvailableRate.code` (string)
An ISO 4217 alpha character code that specifies a money unit.
Example: "USD"
- `PropertiesResponse.Properties.PropertyInfo.MaximumAvailableRate.minorUnit` (integer)
Minor units are a mechanism for expressing the relationship between a major currency unit and its corresponding minor currency unit.
Example: 2
- `PropertiesResponse.Properties.PropertyInfo.MaximumAvailableRate.authority` (string)
Indicates which supplier returned the maximum available rate for that property. Authority is not returned if it matches the value in PropertyInfo.Identifier.authority
Example: "TVPT"
- `PropertiesResponse.@type` (string)
Example: "response"
- `PropertiesResponse.transactionId` (string)
"A unique system-generated (128 bit GUID format) transaction/tracking id for a single request and response (i.e. for a single transaction) used for internal tracking and troubleshooting. Also known as E2ETrackingId. Not returned in all Hotel API responses."
Example: "49f58f5f-c443-43b4-9f5d-be405fd00a01"
- `PropertiesResponse.traceId` (string)
"Used in hospitality workflows to provide a Unique transaction or tracking id for a single request and response. For Rules, returned if a custom trace ID was sent in the request header"
Example: "TraceID_123456"
- `PropertiesResponse.correlationId` (string)
Identifier used to correlate hotel API invocations across a multi-call business flow.
- `PropertiesResponse.reservationStatus` (string)
Status of reservation or offer completion.
Enum: "Success", "Fail", "Partial", "Pending", "OnHold", "Retry", "Other"
- `PropertiesResponse.Result` (object)
Returns the error and/or warning message information, if applicable.
- `PropertiesResponse.Result.@type` (string)
Discriminator class Result only
Example: "Result"
- `PropertiesResponse.Result.status` (string)
The status of an error or warning
Enum: "Not processed", "Incomplete", "Complete", "Unknown"
- `PropertiesResponse.Result.Error` (array)
A list of error information returned at the provider level for a response.
- `PropertiesResponse.Result.Error.@type` (string, required)
Discriminator classes Error or ErrorDetail
Example: "ErrorDetail"
- `PropertiesResponse.Result.Error.Message` (string)
The Travelport standardized error or warning message
Example: "No flights found."
- `PropertiesResponse.Result.Error.NameValuePair` (array)
- `PropertiesResponse.Result.Error.NameValuePair.value` (string)
Text directly related to name description, providing more detail. May have character restrictions based on remark type (e.g. Free Text limitations: 84 characters, alphanumeric and some special characters).
Example: "Sunday"
- `PropertiesResponse.Result.Error.NameValuePair.id` (string)
Optional internally referenced id
Example: "6"
- `PropertiesResponse.Result.Error.NameValuePair.name` (string, required)
Key, categorizing the of type of remark or error.
Example: "Day1"
- `PropertiesResponse.Result.Error.StatusCode` (integer)
Http standard response code
Example: 200
- `PropertiesResponse.Result.Warning` (array)
A list of warning information returned at the provider level for a response.
- `PropertiesResponse.Result.Warning.@type` (string, required)
Discriminator classes Warning or WarningDetail
Example: "WarningDetail"
- `PropertiesResponse.Result.Warning.Message` (string)
The Travelport standardized error or warning message
Example: "Customer Loyalty could not be applied."
- `PropertiesResponse.Result.Warning.NameValuePair` (array)
- `PropertiesResponse.Result.Warning.StatusCode` (integer)
Http standard response code
Example: 200
- `PropertiesResponse.Identifier` (object)
A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).
- `PropertiesResponse.NextSteps` (object)
Container for the steps that describe actions that may be taken on the containing object.
- `PropertiesResponse.ReferenceList` (array)
- `PropertiesResponse.ReferenceList.@type` (string, required)
Discriminator. Air Search child classes are ReferenceListAmenity, ReferenceListBrand, ReferenceListFlight, ReferenceListProduct, ReferenceListTermsAndConditions, and ReferenceListUniversalProductAttribute. Air Price child classes are ReferenceListAmenity and ReferenceListBrand. FareRules child class is ReferenceListFlight. Search Ancillaries child class is ReferenceListFlight. Seat Map child class is ReferenceListSeatingChart. Hotel Availability child class is ReferenceListPropertyDates. Reservation and Reservation Workbench child classes are ReferenceListAmenity, ReferenceListBrand, and ReferenceListUniversalProductAttribute. Exchange Search child classes are ReferenceListBrand, ReferenceListFlight, and ReferenceListExchangedPrice. Reservation Receipt child classes are ReferenceListOffer and ReferenceListTraveler. Book_Traveler child class is ReferenceListTraveler.
Example: "ReferenceListFlight"
- `PropertiesResponse.ReferenceList.id` (string)
Uniquely identifies for the Reference List
- `PropertiesResponse.CurrencyRateConversion` (array)
- `PropertiesResponse.CurrencyRateConversion.@type` (string)
- `PropertiesResponse.CurrencyRateConversion.SourceCurrency` (object, required)
Currency codes are the three-letter alphabetic codes that represent the various currencies used throughout the world. 
For Hotel: SourceCurrency is based on the location of the hotel and used for all rates in the response. TargetCurrency is the currency code sent in the request in requestedCurrency.
- `PropertiesResponse.CurrencyRateConversion.SourceCurrency.value` (string)
An ISO 4217 currency code.
Example: "USD"
- `PropertiesResponse.CurrencyRateConversion.SourceCurrency.codeAuthority` (string)
Currency code authority
Example: "ISO 4217"
- `PropertiesResponse.CurrencyRateConversion.SourceCurrency.decimalPlace` (integer)
Number of decimal places for the currency.
Example: 4
- `PropertiesResponse.CurrencyRateConversion.SourceCurrency.decimalAuthority` (string)
Currency code decimal authority
Example: "ISO 4217"
- `PropertiesResponse.CurrencyRateConversion.TargetCurrency` (object, required)
Currency codes are the three-letter alphabetic codes that represent the various currencies used throughout the world. 
For Hotel: SourceCurrency is based on the location of the hotel and used for all rates in the response. TargetCurrency is the currency code sent in the request in requestedCurrency.
- `PropertiesResponse.CurrencyRateConversion.ConversionRate` (object, required)
Conversion rate of SourceCurrency value to TargetCurrency value. This value can be used to calculate, independently of the API, conversion for the rates in the response. The response does not convert any amounts.
- `PropertiesResponse.CurrencyRateConversion.ConversionRate.value` (number)
- `PropertiesResponse.CurrencyRateConversion.ConversionRate.rateAuthority` (string)
Contextual rate authority
Example: "ISO 4217"
- `PropertiesResponse.CurrencyRateConversion.ConversionRate.rateAsOf` (string)
Rate as of
Example: "2026-08-07 12:12:00+00:00"
- `PropertiesResponse.Pagination` (object)
Pagination object used when result sets span across a number of pages.
- `PropertiesResponse.Pagination.@type` (string, required)
Example: "Pagination"
- `PropertiesResponse.Pagination.page` (integer, required)
The current page number of the full result set
Example: 1
- `PropertiesResponse.Pagination.pageSize` (integer, required)
The total number of items on this page
Example: 20
- `PropertiesResponse.Pagination.totalPages` (integer, required)
The total number of pages in this result set
Example: 5
- `PropertiesResponse.Pagination.totalItems` (integer, required)
The total number of pages in this result set
Example: 100

## Response 400 fields (application/json):

- `@type` (string)
Example: "response"
- `transactionId` (string)
"A unique system-generated (128 bit GUID format) transaction/tracking id for a single request and response (i.e. for a single transaction) used for internal tracking and troubleshooting. Also known as E2ETrackingId. Not returned in all Hotel API responses."
Example: "49f58f5f-c443-43b4-9f5d-be405fd00a01"
- `traceId` (string)
"Used in hospitality workflows to provide a Unique transaction or tracking id for a single request and response. For Rules, returned if a custom trace ID was sent in the request header"
Example: "TraceID_123456"
- `correlationId` (string)
Identifier used to correlate hotel API invocations across a multi-call business flow.
- `reservationStatus` (string)
Status of reservation or offer completion.
Enum: "Success", "Fail", "Partial", "Pending", "OnHold", "Retry", "Other"
- `Result` (object)
Returns the error and/or warning message information, if applicable.
- `Identifier` (object)
A globally unique identifier key often used to reference a given option (such as Pricing, Booking, Rules, or additional workflows) or to retrieve information (such as Hotel pagination).
- `NextSteps` (object)
Container for the steps that describe actions that may be taken on the containing object.
- `ReferenceList` (array)
- `CurrencyRateConversion` (array)
- `Pagination` (object)
Pagination object used when result sets span across a number of pages.