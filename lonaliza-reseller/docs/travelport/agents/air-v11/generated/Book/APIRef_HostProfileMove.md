# Host Profile Move API&#160;Reference

## Source

- **Local HTML:** `docs/travelport/travelport api guide/travelport-airapi json/support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/Book/APIRef_HostProfileMove.html` (UTF-8 mirror)
- **Official base:** `https://support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/` + same relative path

## Plaintext extract (lossy)

Host Profile Move API&#160;Reference Skip To Main Content Account Settings Logout placeholder Account Settings Logout Filter: All Files Submit Search Filter: All Files Submit Search Host Profile Move API&#160;Reference Request Response Example request Example response PUT book/profile/reservationworkbench/ {workbenchID} /clientprofile For {workbenchID} send the workbench identifier returned in ReservationResponse/Identifer/value in the workbench create response. Base path: Pre-production https://api.pp.travelport.net/11/air/ Production https://api.travelport.net/11/air/ Related Content: Air Booking Guide The Host Profile Move request copies traveler profile information already stored in the Travelport system into the JSON &#160;API&#160;booking workflow so that this data does not need to be re-sent. It can be sent for an existing reservation or in the initial booking workflow, per the following workflow: Create new workbench . Add offer ( reference or full payload). Send the Host Profile Move API&#160;request detailed here. Add Traveler (optional, use if necessary to add another traveler whose profile is not copied from the host). Add any other optional data such as seats or ancillaries. Workbench Commit . The Travelport host system includes the following types of records. Use the Host Profile Move request to copy information from either the business or personal file record for a traveler: Business File Record (BAR): Specific business account details such as telephone numbers, ticket delivery address, payment policy, and required invoice layout. Personal File Record (PAR): Personal traveler information such as telephone number, address, and credit card number. A separate PAR is usually created for each person traveling for a company for which a BAR exists. Agency File Record (MAR): Details about the travel provider, such as telephone numbers, out-of-office hours, and emergency numbers. Request As part of the request requirements, also see Authentication and Common Air API Headers . Query Parameters None. Request Body Show Request Body Table Object Description Required/Optional ReservationQueryClientProfileMove Top level object. Includes ClientProfileMoveHeaderModifiers, ClientProfileMoveLineModifiers, ClientProfileMoveTravelerFlightModifiers as needed. Required ClientProfileMoveHeaderModifiers Wrapper object. Includes BusinessTitle, PersonalTitle, and the Boolean indicators MultipleIndicator, SelectIndicator, MergeIndicator, RelatedMoveIndicator. Required BusinessTitle String. 21-character maximum. The name of the corporation/business account the profile is associated to. Required PersonalTitle String. 21-character maximum. The name of the traveler the profile is associated to. Required for personal file moves MultipleIndicator Boolean. Supported values: true: Indicates the move should copy from multiple client files, such as both personal and business files. false: Indicates the move should copy only one client files, such as business file only. Optional SelectIndicator Boolean. Supported values: true: Copy only the line/s specified in ClientProfileMoveLineModifiers, along with any appended text (see ClientProfileMoveLineModifiers below). false: Copy all lines in the profile. Default. Optional MergeIndicator Boolean. Indicates how any associated TravelScreen Preferences (not applicable to JSON &#160;APIs) should be activated at the time of the file move. Supported values: true: Merged preferences will be moved. false: Normal preferences will be moved. Default. Optional RelatedMoveIndicator String. One-character maximum. Indicates the passenger and segment relation for the related move. Supported values: Y: Copies only the lines specified with R transfer code in the profile, which are programmatic SSRs (host code SI. ), mileage membership numbers ( M. ), and associated remarks ( RI.S ). When RelatedMoveIndicator is set to Y, ClientProfileMoveTravelerFlightModifiers must also be sent to specify the traveler and flight. N: Copy all lines in the profile. Default. Before sending a request with RelatedMoveIndicator=Y, send a request to move the traveler name and other required information. The a request with RelatedMoveIndicator should be the final move request. Optional ClientProfileMoveLineModifiers Send if SelectIndicator is sent with true. Required if SelectIndicator is sent with true LineNumber Integer up to three places. Line number of the client file to move. Required AppendedData String. 58-character maximum. Any text to be appended to the line moved to the workbench as specified in LineNumber. This string is added to the booking in the workbench, not in the host client profile. Optional ClientProfileMoveTravelerFlightModifiers Send if RelatedMoveIndicator is sent with value of Y. Includes TravelerRef and FlightRef. Required if RelatedMoveIndicator is sent with true TravelerRef The Traveler ref to associate related lines of the client profile Required FlightRef The Flight ref to associate the related lines of the client profile Required ProfilePCC Sends the PCC associated with the profile to move when the profile's PCC&#160;differs from the PCC in the JSON API&#160;booking workbench. Optional Response A successful transaction returns an HTTP Status - 204 with no content. Example Request For additional examples, download the developer toolkits and see Using Postman and Developer Toolkits . Use the following requests to copy only the business or only the personal profile. Show Example Request to move business profile &#160;{ "ReservationQueryClientProfileMove": { "ClientProfileMoveHeaderModifiers": { "BusinessTitle": "TESTBUSINESS1", "PersonalTitle": "TESTPERSONAL4", "MultipleIndicator": "false", "SelectIndicator": "false", "MergeIndicator": "false", "RelatedMoveIndicator": "N" "ProfilePCC": "XY5" } } } Show Example Request to move personal profile { "ReservationQueryClientProfileMove": { "ClientProfileMoveHeaderModifiers": { "BusinessTitle": "TESTBUSINESS1", "PersonalTitle": "TESTPERSONAL4", "MultipleIndicator": "false", "SelectIndicator": "false", "MergeIndicator": "false", "RelatedMoveIndicator": "N" } } } The following payload sends SelectIndicator=true to copy only data from the the line number specified in ClientProfileMoveLineModifiers/LineNumber. AppendedData is optional to append a string to that line. Show Example request with ClientProfileMoveLineModifiers { "ReservationQueryClientProfileMove": { "ClientProfileMoveHeaderModifiers": { "BusinessTitle": "HEMPSTOCK", "PersonalTitle": "TRACEY", "MultipleIndicator": "false", "SelectIndicator": "true", "MergeIndicator": "false", "RelatedMoveIndicator": "N" }, "ClientProfileMoveLineModifiers": { "LineNumber": 1, "AppendedData": "TEST" } } } The following payload sends RelatedMoveIndicator=Y and ClientProfileMoveTravelerFlightModifiers. For the specified traveler and flight, this copies only the lines specified with R transfer code in the profile, which are programmatic SSRs (host code SI. ), mileage membership numbers ( M. ), and associated remarks ( RI.S ). Show Example { "ReservationQueryClientProfileMove": { "ClientProfileMoveHeaderModifiers": { "BusinessTitle": "HEMPSTOCK", "PersonalTitle": "RMOVETEST", "MultipleIndicator": "false", "SelectIndicator": "false", "MergeIndicator": "false", "RelatedMoveIndicator": "Y" }, "ClientProfileMoveTravelerFlightModifiers": { "TravelerRef": "01", "FlightRef": "01" } } } Example Response A successful transaction returns an HTTP Status - 204 with no content.

## Literal `<pre>` excerpts from HTML

### Block 1

```
&#160;{
    "ReservationQueryClientProfileMove": {
        "ClientProfileMoveHeaderModifiers": {
            "BusinessTitle": "TESTBUSINESS1",
            "PersonalTitle": "TESTPERSONAL4",
            "MultipleIndicator": "false",
            "SelectIndicator": "false",
            "MergeIndicator": "false",
            "RelatedMoveIndicator": "N"
            "ProfilePCC": "XY5"
        }
    }
}
```

### Block 2

```
{
    "ReservationQueryClientProfileMove": {
        "ClientProfileMoveHeaderModifiers": {
            "BusinessTitle": "TESTBUSINESS1",
            "PersonalTitle": "TESTPERSONAL4",
            "MultipleIndicator": "false",
            "SelectIndicator": "false",
            "MergeIndicator": "false",
            "RelatedMoveIndicator": "N"
        }
    }
}
```

### Block 3

```
{
 "ReservationQueryClientProfileMove": {
  "ClientProfileMoveHeaderModifiers": {
   "BusinessTitle": "HEMPSTOCK",
   "PersonalTitle": "TRACEY",
   "MultipleIndicator": "false",
   "SelectIndicator": "true",
   "MergeIndicator": "false",
   "RelatedMoveIndicator": "N"
  },
  "ClientProfileMoveLineModifiers": {
   "LineNumber": 1,
   "AppendedData": "TEST"
  }
 }
}
```

### Block 4

```
{
 "ReservationQueryClientProfileMove": {
  "ClientProfileMoveHeaderModifiers": {
   "BusinessTitle": "HEMPSTOCK",
   "PersonalTitle": "RMOVETEST",
   "MultipleIndicator": "false",
   "SelectIndicator": "false",
   "MergeIndicator": "false",
   "RelatedMoveIndicator": "Y"
  },
  "ClientProfileMoveTravelerFlightModifiers": {
   "TravelerRef": "01",
   "FlightRef": "01"
  }
 }
}
```

