# Remarks &amp;&#160;Service Requests Guide &amp; API&#160;Reference

## Source

- **Local HTML:** `docs/travelport/travelport api guide/travelport-airapi json/support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/Book/RemarksGuide.html` (UTF-8 mirror)
- **Official base:** `https://support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/` + same relative path

## Plaintext extract (lossy)

Remarks &amp;&#160;Service Requests Guide &amp; API&#160;Reference Skip To Main Content Account Settings Logout placeholder Account Settings Logout Filter: All Files Submit Search Filter: All Files Submit Search Remarks &amp;&#160;Service Requests Guide &amp; API&#160;Reference The JSON APIs support several types of remarks and service requests: Some remarks, such as travel document details, are sent in the Add Traveler payload in the initial booking workflow. After the booking is created, these remarks are added, modified, or deleted using the Traveler Updatable Items and Traveler Update requests detailed in the Traveler Modify Guide . Other remarks are sent in various payload requests, separately from Add Traveler. These can be added or deleted with a single direct request either during the initial booking workflow or for an existing reservation. They cannot be directly modified, only deleted and added. This combined guide and API&#160;reference provides endpoints and examples for adding all remarks, and for deleting remarks sent in payloads other than the Add Traveler payload. To modify or delete Add Traveler remarks, see the Traveler Modify Guide . Until the release of functionality to Add SSRs by Code , the JSON APIs did not send or return the IATA SSR codes. For this reason, many payloads in this topic send specific information describing the remark or the name of the remark to the carrier, which transforms the necessary information into the appropriate SSR. Best practice now for these types of remarks is to use the Add SSR by Code request to send the industry SSR code instead of the name of the service. Use it for any programmatic or manual SSR remark or service request that has an industry SSR code and does not require payment. GDS only; not supported for NDC. Related Content: JSON Air APIs Guide , Booking Guide , Traveler Modify Guide In this topic: This topic groups remarks by the request payload in which they are sent, as follows. Information about adding and deleting remarks is included in the Endpoints and Response section for each group: Basic Concepts Remarks and&#160;Service Requests Support Workflows to Add and Delete Remarks Add Traveler Remarks Endpoints and Response Traveler documents (SSR&#160;DOCO and DOCS) Form of ID&#160;(&#160;SSR FOID) Client Delivery Remark Minimum Secure Flight Information (SSR&#160;DOCS) DOB&#160;(SSR&#160;CHLD) Traveler Name and OSI/General Remarks Primary Contact Remarks Endpoints and Response Primary Contact (email, phone, or contact refused) (SSR&#160;CTCE, CTCM, CTCR) Special Service List Requests Endpoints and Response Add SSRs by Code Delete Multiple SSRs Special Service Request - Disability Special Service Request - Meals Document Overrides Endpoints and Response Document Override Remarks (tour code, commission, endorsement) Document Overrides in GDS Exchanges (change fee collection, EMD&#160;endorsement, commission, MIR) Accounting Remarks Endpoints and Response Accounting, Historical, and DOCI Remarks &#160; Reservation Comments Remarks Endpoints and Response OSI&#160;Remarks Notepad&#160;Remarks Spanish Residency/Large Family Fares Vendor Remarks Itinerary Remarks - Associated &amp;&#160;Unassociated Add Offer SSRs Endpoint India GST SSR Basic Concepts Remarks and optional services cover many kinds of notes and special requests that can be added to a reservation. Because terminology varies, especially for NDC, this guide uses the generic terms remarks and service requests . Some customers may be more familiar with the special service request (SSR) codes and other terms used, however, so SSR details are included below when relevant even though those codes are not sent or returned in the JSON API requests/responses. A service request, also known in the airline industry as an SSR, for special service request , is a message sent directly to carriers to communicate traveler preferences, special services needed by a traveler, or a procedural requirement necessary of the carrier. These service requests include information such as meal preference or special assistance required for the traveler. Because the carrier must take action, there is usually a reply in the form of the status code on the SSR (HK, UN, etc.). Service requests can be programmatic or manual. Programmatic SSRs use a code recognized by the airline and are associated with both an air segment and a booking file. Manual SSRs do not have an associated code and are associated only to a booking file. Each SSR uses a four-character IATA code that specifies the type of service requested. These codes and their recommended use are predefined by IATA; however, not all carriers support the use of all SSR codes. You can also add various remarks to the reservation. Sometimes called OSI&#160;requests, for other service information, these are informational messages sent directly to the carrier to communicate traveler preferences or requirements. Unlike SSRs, OSIs are typically used to notify a carrier of special circumstances and do not require the carrier to take action. Until the release of functionality to Add SSRs by Code , the JSON APIs did not send or return the IATA SSR codes. For this reason, many payloads in this topic send specific information describing the remark or the name of the remark to the carrier, which transforms the necessary information into the appropriate SSR. For many of these types of remarks, best practice is now to use the Add SSR by Code request to send the industry SSR code instead of the name of the service. Use it for any any programmatic or manual SSR remark or service request that has an industry SSR code and does not require payment. GDS only; not supported for NDC. Remarks and&#160;Service Requests Support The JSON APIs provide several payloads for sending remarks and service requests. The following table outlines by payload the supported remarks and service requests and when in the workflow each type of requests can be added or deleted. To modify or delete the remarks added via the Add Traveler Payload, see the Traveler Modify Guide . To delete remarks not sent in the Add Traveler payload, use the DEL requests in this topic. PUT&#160;commands to directly modify these remarks are not supported. Instead, delete the remark and add a new remark; see Workflows to Add and Delete Remarks next. Not all NDC carriers support all types of remarks that can be sent in the Accounting and Reservation Comments payloads. If a specific NDC carrier does not support a remark, that remark is created and stored only in the Travelport booking record and is not sent to the carrier. Remark/service request sent in payload GDS NDC Add in initial booking workflow Delete in initial booking workflow Add to an existing reservation Delete from existing reservation Returned in reservation retrieve Add Traveler payload - only during initial booking; modify, delete, and add these after booking per the Traveler Modify Guide Traveler documents (SSR DOCO and DOCS) Yes Yes Yes Yes Yes Yes Yes for GDS Not returned for NDC Form of ID&#160;(&#160;SSR FOID) Yes No Yes Yes Yes Yes Yes Client delivery remark Yes Yes Yes No Yes No No Minimum secure flight information (SSR&#160;DOCS) Yes No Yes No Yes No Yes DOB&#160;(SSR&#160;CHLD) Yes No Yes No No No Yes Traveler name Yes No Yes No No No Yes &#160; &#160; &#160; Primary Contacts payload; delete these and all remaining remarks in this table using the DEL requests in this topic for each payload Primary contact remarks (SSR&#160;CTCE, CTCM, CTCR) Yes Yes, specific carriers only Yes No Yes Yes Yes Special Service List payload Special service request - Disability Yes Yes Yes No Yes No Yes Special service request - Meals Yes Yes, specific carriers only Yes Yes Yes Yes Yes Add SSR by Code Yes No Yes No Yes No Yes &#160; &#160; &#160; Reservation Comments payload OSI&#160;remarks Yes Yes Yes Yes Yes Yes Yes Notepad&#160;remarks Yes Yes Yes Yes Yes Yes Yes Vendor remarks Yes Yes Yes Yes Yes Yes Yes Itinerary remarks - associated &amp;&#160;unassociated Yes Yes Yes Yes Yes Yes Yes Document Overrides payload Document override remarks Yes No Yes No Yes No Returned if detailViewInd query parameter is set to true Accounting payload Accounting, historical, DOCI remarks Yes Yes Yes Yes Yes Yes Returned if detailViewInd query parameter is set to true Add Offer payload India GST SSR Yes Yes Yes No No No Yes for GDS Not returned for NDC Workflows to Add and Delete Remarks The following tables outline the process for adding remarks in the initial booking workflow, and for adding and deleting remarks from an existing reservation. Remarks sent in the Add Traveler payload can be added, modified, or deleted using the Traveler Updatable Items and Traveler Update requests detailed in the Traveler Modify Guide . During any workbench session, if you retrieve the workbench to view updates, the retrieved workbench does not yet show the added or deleted remarks. The change appears only after the workbench is committed. After you commit the workbench you can retrieve the reservation&#160;to see the changes. Adding/deleting remarks in the initial booking workflow Step # Workflow Step Description and Notes API&#160;Reference 1 Create workbench Create a new workbench. Returns a system-generated identifier for the workbench that must be sent in subsequent requests for that workbench. New Workbench API&#160;Reference 2 or 3 Add offer Add the air offer. Add Offer API&#160;Reference 2 or 3 Add traveler Add each traveler. Include in the Add&#160;Traveler payload any remarks supported in that payload as desired. (After the booking is created, remarks sent in the Add Traveler payload are added, modified, or deleted using the Traveler Updatable Items and Traveler Update requests detailed in the Traveler Modify Guide .) See Add Traveler Remarks and SSRs below and Add Traveler API&#160;Reference &#160; 4 Add other remarks as needed Per the sections below, send the appropriate POST request to add any remarks not sent in the Add&#160;Traveler payload. For special service requests , only one kind of service request is supported in the same payload. For example, you can send multiple special assistance requests (disability SSRs) but not a request for a wheelchair and a special meal request (disability and meal SSRs). See section in this topic for each remark 5 Retrieve workbench (optional - only if deleting a remark) If needed, retrieve the workbench to get the identifier/s for the item/s to modify. Retrieve Workbench API&#160;Reference 6 Delete a remark if needed (optional - only if deleting a remark) Not all remarks are supported for deletion. See the Support section above. Send the DEL&#160;request from the appropriate section below to delete a remark. PUT&#160;commands to directly modify these remarks are not supported. Instead, delete the remark and add the new remark. See section in this topic for each remark 7 Workbench Commit Final step in the workflow. The response returns the reservation&#160;in the same format as a reservation&#160;retrieve response, including updates for most remarks. Workbench Commit API&#160;Reference &#160; Adding/deleting remarks for existing reservation Step # Workflow Step Description and Notes API&#160;Reference 1 Create workbench Create a post-commit workbench for an existing booking. Returns a system-generated identifier for the workbench that must be sent in subsequent requests for that workbench. Post-Commit Workbench API&#160;Reference as needed Add remark as needed (optional) Send the appropriate POST request to add any remark not sent in the Add&#160;Traveler payload, per the sections below. (To modify/delete/add remarks from the Add&#160;Traveler payload, see the Traveler Modify Guide .) See section in this topic for each remark as needed Send DEL&#160;request to delete remark if needed (optional) Not all remarks are supported for deletion. See the Support section above. Send the DEL&#160;request from the appropriate section below to delete a remark. PUT&#160;commands to directly modify these remarks are not supported. Instead, delete the remark and add the new remark. See section in this topic for each remark as needed Additional request for same type of item (optional) On an existing reservation, to send an additional request for the same type of item (such as deleting an SSR and adding a new SSR, or deleting two SSRs): For GDS you can make multiple adds or deletes for the same type of item in the same workbench session, but you must retrieve the workbench between each add or delete to synchronize the reservation with the host session. For NDC you can add or delete only one of the same type of item per commit. Commit the workbench and repeat this workflow to add or delete another of the same type of item. Workbench Retrieve for GDS For NDC, go to next step for Workbench Commit, then repeat workflow. final step Workbench Commit Final step in the workflow. The response returns the reservation&#160;in the same format as a reservation&#160;retrieve response, including updates for most remarks. Workbench Commit API&#160;Reference &#160; Add Traveler Remarks and SSRs Endpoints and Response for All Add Traveler Remarks Remarks in this section are sent in the Add&#160;Traveler payload during the following initial booking workflow. After the reservation is created, these remarks can be added, modified, or deleted using the Traveler Updatable Items and Traveler Update requests detailed in the Traveler Modify Guide . Send the following POST request for the Add&#160;Traveler step. See the Add&#160;Traveler API&#160;Reference for additional details and examples. POST book/traveler/reservationworkbench/ {workbenchID} /travelers For {workbenchID} send the workbench identifier returned in ReservationResponse/Identifer/value in the workbench create response. Base path: Pre-production https://api.pp.travelport.net/11/air/ Production https://api.travelport.net/11/air/ See the following sections for the payload for each traveler remark. The Add Traveler response returns a confirmation identifier per the following example. Show Example Add Traveler Response { "TravelerResponse": { "Traveler": { "@type": "TravelerIdentifier", "Identifier": { "value": "b42c1b9e-5b1b-4e31-b635-aa138b84fcb6" } } } } Travel Documents (SSR DOCO and DOCS) See Endpoints above for endpoint and response details. Travel documents are sent as part of the Add Traveler payload per above. Some carriers require specific traveler information on certain routes, such as valid travel documents for international routes. Send passport, visa, etc. details in the TravelDocument object. If multiple travel documents are needed, include additional instances of TravelDocument. The following types of travel documents are supported, and converted them to the appropriate remark or SSR code as follows. No special formatting is required, and the information is automatically populated for the reservation. Type of travel document Value to send in TravelDocument/docType SSR&#160;Code (informational only - not sent or returned in the booking record) Passport Passport SSR&#160;DOCS&#160;P Redress Redress SSR&#160;DOCO&#160;R Known Traveler KnownTraveler SSR&#160;DOCO&#160;K Visa Visa SSR&#160;DOCO&#160;V When adding visa information, both issueDate and expireDate are required. Date formats are the Travelport JSON &#160;API standard YYYY-MM-DD . All traveler information sent is returned in the reservation&#160;retrieve . Show Example Add Traveler request with passport details { "Traveler": { "id": "trav_1", "passengerTypeCode": "ADT", "PersonNameDetail": { "Prefix": "", "Given": "TestFirst", "Middle": "TestMiddle", "Surname": "TestLast", "Suffix": "" }, "Telephone": [ { "@type": "Telephone", "countryAccessCode": "1", "areaCityCode": "719", "phoneNumber": "6401108", "extension": "123", "id": "1", "cityCode": "DEN", "role": "Mobile" } ], "TravelDocument": [ { "@type": "TravelDocumentDetail", "docNumber": "245968", "docType": "Passport", "issueDate": "2019-12-22", "expireDate": "2025-08-20", "issueCountry": "IND", "birthDate": "1999-02-22", "birthCountry": "IND", "Gender": "Male", "PersonName": { "@type": "PersonName", "Given": "Px One", "Middle": "MdNm One", "Surname": "SrNmOne" }, "IssuedForGeoPoliticalArea": { "value": "USA" } } ], "Address": [ { "role": "Delivery", "Number": "1220", "Street": "Travers Street", "City": "Claremont", "StateProv": { "name": "Texas", "value": "CA" }, "Country": { "value": "US" }, "PostalCode": "917113323" } ], "Email": [ { "value": "test@gmail.com" } ], "CustomerLoyalty": [ { "value": "1234123412", "supplier": "" } ] } } Form of ID (SSR FOID) See Endpoints above for endpoint and response details. For additional examples, download the developer toolkits and see Using Postman and Developer Toolkits . GDS only; not supported for NDC. Form of ID is sent in the Add Traveler request. For carriers who require it, the JSON APIs convert information about the form of ID used to the SSR&#160;Form of ID (FOID). You can send any of these types of ID to be converted to the SSR FOID: passport (send TravelDocument object with docType Passport ) driver's license (send TravelDocument object with docType DriversLicense ) frequent flyer (send CustomerLoyalty object) All traveler information sent is returned in the commit step and in the reservation retrieve . Show Example Add Traveler with frequent flyer/customer loyalty as FOID { "Traveler": { "birthDate": "1990-12-01", "id": "trav_1", "passengerTypeCode": "ADT", "PersonName": { "@type": "PersonNameDetail", "Prefix": "Mr", "Given": "JORDAN", "Middle": "", "Surname": "LOYTEST", "Suffix": "ADT" }, "Telephone": [ { "@type": "Telephone", "countryAccessCode": "1", "areaCityCode": "909", "phoneNumber": "212456121", "extension": "1243", "id": "4", "cityCode": "ORD", "role": "Office" } ], "Address": [ { "@type": "Address", "role": "Delivery", "id": "address_1", "BldgRoom": { "value": "Bldg H", "buldingInd": true }, "Number": { "value": "563" }, "City": "Los Angeles", "Country": { "value": "US" }, "PostalCode": "91711" } ], "Email": [ { "comment": "Primary Email Id", "value": "TravelerOne@gmail.com" } ], "PassengerCriteria": [ { "number": 1, "age": 25, "passengerTypeCode": "ADT" } ], "TravelDocument": [ { "@type": "TravelDocument", "docNumber": "H294F4", "docType": "Passport", "expireDate": "2025-12-12", "issueCountry": "IND", "birthDate": "1990-12-01", "birthCountry": "IND", "Gender": "Male", "PersonName": { "@type": "PersonName", "Given": "JORDAN", "Middle": "", "Surname": "LOYTEST" } } ], "CustomerLoyalty": [ { "value": "2071983684DEF", "supplier": "DL" } ] } } Client Delivery Remark See Endpoints above for endpoint and response details. For additional examples, download the developer toolkits and see Using Postman and Developer Toolkits . A client delivery remark is sent in the Add Traveler request by sending Address/role with a value of delivery . Client delivery remarks are not returned in the reservation retrieve . Show Example Client Delivery remark request with address and customer loyalty The following example sends Traveler/Address/role set to Delivery , causing this address information to be recorded as the client delivery address. All of the information below becomes part of the remark. { "Traveler": { "id": "trav_1", "passengerTypeCode": "ADT", "PersonNameDetail": { "Prefix": "", "Given": "TestFirst", "Middle": "TestMiddle", "Surname": "TestLast", "Suffix": "" }, "Telephone": [ { "@type": "Telephone", "countryAccessCode": "1", "areaCityCode": "719", "phoneNumber": "6401108", "extension": "123", "id": "1", "cityCode": "DEN", "role": "Mobile" } ], "Address": [ { "role": "Delivery", "Number": "1220", "Street": "Travers Street", "City": "Claremont", "StateProv": { "name": "Texas", "value": "CA" }, "Country": { "value": "US" }, "PostalCode": "917113323" } ], "Email": [ { "value": "test@gmail.com" } ], "CustomerLoyalty": [ { "value": "1234123412", "supplier": "" } ] } } Minimum Secure Flight Information (SSR&#160;DOCS) See Endpoint above for endpoint and response details. For additional examples, download the developer toolkits and see Using Postman and Developer Toolkits . GDS only. Not supported for NDC with Add Traveler but can be sent with TravelerUpdatableItems per the next paragraph. In addition to sending minimum secure flight in the Add Traveler request per this section, you can also add and update it using the TravelerUpdate and TravelerUpdatableItems requests. Supported for both GDS and NDC in either the initial booking workflow or for an existing reservation. Minimum secure flight information is sent in the Add Traveler request. Certain carriers on certain routes are required by the US&#160;Transportation Security Administration (TSA)&#160;to send the following required minimum secure flight information for every traveler as part of the Add&#160;Traveler payload ; the APIs convert this data to the format required by carriers:&#160; traveler name birthdate gender (supported values are Male , Female , and Unknown ) All traveler information sent is returned in the reservation retrieve . If a gender is not provided or is invalid, the API creates the reservation and returns a warning that gender is missing. If a birthdate is not provided, the API creates the reservation and returns a warning that date of birth is missing. Neither situation returns an error. Until update/change functionality is fully implemented, you must resolve the issue by canceling the reservation and creating a new reservation with the correct details. Child DOB (SSR&#160;CHLD) See Endpoints above for endpoint and response details. For additional examples, download the developer toolkits and see Using Postman and Developer Toolkits . GDS only. Not supported for NDC. For GDS only, a child SSR (SSR CHLD) is created when a child traveler (any of the Travelport child traveler PTC codes ) is on the reservation with date of birth (DOB)&#160;information. To ensure the carrier receives the required information, you must include the birthdate in Traveler/birthDate when you add the child traveler in the Add&#160;Traveler payload . For both GDS and NDC, the child date of birth can be made mandatory or regulated with your PCC Pseudo city code. A travel provider's identification code for the APIs, provisioned from Travelport. Used to determine access and other settings in the APIs for your company. configuration. If configured as mandatory for that PCC, if the child date of birth is not provided in the Add Traveler request, the API returns the error Date of Birth for child is missing . Contact your Travelport representative for any configuration questions. The workbench commit response returns the traveler date of birth when it is sent for a child, as does the reservation retrieve . Traveler birthdate information cannot be added or modified after that traveler is added. Traveler Name and OSI/General Remarks The optional Comments object in the Add Traveler request payload supports sending custom, freeform remarks. For traveler name remarks, such as a unique identifier for that traveler, send Comments/Comment with the following: value: Free text traveler name remark. Up to 33 characters, only spaces and hyphens allowed for special characters. id: Local identifier to use for this remark. Returned in the reservation retrieve response in Traveler/Comments. Show Example Add Traveler payload with name remarks { "Traveler": { "@type": "Traveler", "birthDate": "1999-02-22", "gender": "Male", "passengerTypeCode": "ADT", "PersonName": { "@type": "PersonNameDetail", "Prefix": "Mr", "Given": "Px ADTOne", "Middle": "MdNm", "Surname": "SrNmOne", "Suffix": "ADT" }, "Comments": { "@type": "Comments", "Comment": [ { "id": "comment_1", "value": "ID-12345671" } ] } } } For NDC marine fares, you must use Comments/Comment/id to send the vessel name and /value for the two-digit IATA location of the vessel. The PTC code here and entered at Search request must be SEA. Marine fares are private fares for travelers going to or from a vessel. NDC&#160;only; not supported for GDS. Show Example Add Traveler payload with NDC&#160;marine fares comments { "Traveler": { "gender": "Male", "birthDate": "1977-12-31", "id": "trav_1", "TravelerRef": "trav_1", "passengerTypeCode": "SEA", "PersonName": { "@type": "PersonNameDetail", "Given": "Sailor", "Surname": "Guy", "Prefix": "MR" }, "Telephone": [ { "@type": "Telephone", "countryAccessCode": "1", "phoneNumber": "555456121", "id": "4", "cityCode": "ORD", "role": "Home" } ], "Email": [ { "emailType": "FROM", "value": "sailor@somedomain.com" } ], "TravelDocument": [ { "@type": "TravelDocumentDetail", "docNumber": "A11111", "docType": "Passport", "expireDate": "12312027", "issueCountry": "US", "birthDate": "", "Gender": "Male", "PersonName": { "@type": "PersonName", "Given": "Sailor", "Surname": "Guy" } } ], "Comments": { "@type": "Comments", "Comment": [ { "@type": "Comment", "id": "Vesselnformation", "name": "NDCBOAT", "value": "FR" } ] } } } Primary Contact Payload Remarks Endpoints and Response for all Primary&#160;Contact Remarks Remarks in this section use the following POST request to create the remark. POST book/primarycontact/reservationworkbench/ {workbenchID} /primarycontacts Base path: Pre-production https://api.pp.travelport.net/11/air/ Production https://api.travelport.net/11/air/ Use the following DEL request to delete any primary contact remark. DEL book/primarycontact/reservationworkbench/ {workbenchID} /primarycontacts/ {PrimaryContactID} / For {PrimaryContactID} above send the system-generated identifier for the contact to delete. For {workbenchID} send the workbench identifier returned in ReservationResponse/Identifer/value in the workbench create response. Base path: Pre-production https://api.pp.travelport.net/11/air/ Production https://api.travelport.net/11/air/ The APIs do not support PUT&#160;commands for directly modifying these remarks. Instead you must delete a remark and then add the new remark.&#160;See Workflows to Add and Delete Remarks above. See the following sections for the payload for each primary contact remark. The Primary Contact request returns the following response. Primary contact details are returned in the reservation retrieve. Show Example Response { "PrimaryContactResponse": { "@type": "PrimaryContactResponse" } } Primary Contact Information (email, phone, or contact refused) (SSR CTCE, CTCM, CTCR) The API supports the following types of optional remarks for primary contact information, also known by the following SSR codes: E-mail address contact information (SSR CTCE) Mobile phone number contact information (SSR CTCM) Primary contact information refused (SSR CTCR) At many airlines this information is used for passenger contact automation systems to automatically send customer flight information as an email, digital message, or voice message. To create a SSR CTCR (primary contact information refused), send PrimaryContact without any contact information. The API creates the SSR CTCR on the GDS reservation to send to the airline. Notes on contact information You can send multiple types of contact information in a single request, but you can send only one traveler ID per request. To send the information to all suppliers, send shareWithSupplier with value YY . Or, specify one or more suppliers with their two-letter airline code. The API automatically converts the email @ sign sent for an email address to the appropriate Galileo native format for the native reservation/BF. Send the mobile number either as a single number sequence (e.g., 9515550963) or with dashes (e.g., 951-555-0963), up to a maximum of 50 characters. Supported for GDS. Supported for NDC as follows: NDC does not require primary contact information on a booking. Instead, contact information can be added for each passenger. You can delete contact information prior to committing the initial booking workbench. CTCM and CTCE are supported during the initial booking workflow only for carriers SQ, AA, AF/KL, LHG , BA, EK. Adding CTCM and CTCE to or deleting from an existing reservation is supported only for AA, AF/KL, LHG, BA, EK. CTCR is supported only for QF, AF/KL, and LHG. Show Example primary contact request for telephone and email The following example PrimaryContact payload sends email and mobile phone contact details. { "PrimaryContact": { "shareWithSupplier": [ "YY" ], "Email": { "value": "testEmail@test.com" }, "Telephone": { "@type": "Telephone", "role": "Mobile", "phoneNumber": "581478" }, "TravelerIdentifier": { "Identifier": { "value": "75985d72-eb3b-4e33-9699-7c29f8b2766c" } } } } Show Example primary contact request for "contact information refused" Omitting contact information indicates the passenger refused to provide it. { "PrimaryContact": { "shareWithSupplier":["YY"], "shareWith":"Supplier", } } Special Service List SSRs Endpoints and Response for all Special Service List Remarks All remarks in this section use the following POST request. POST book/specialservices/reservationworkbench/ {workbenchID} /specialservices/list For {workbenchID} send the workbench identifier returned in ReservationResponse/Identifer/value in the workbench create response. Base path: Pre-production https://api.pp.travelport.net/11/air/ Production https://api.travelport.net/11/air/ Use the following DEL request to delete any single meal SSR. Other SSRs are not supported for deletion at this time. Also see Delete Multiple SSRs below. DEL book/specialservices/reservationworkbench/ {workbenchID} /specialservices/ {SpecialServiceID} For {SpecialServiceID} send the system-generated identifier for the remark to delete. For {workbenchID} send the workbench identifier returned in ReservationResponse/Identifer/value in the workbench create response. Base path: Pre-production https://api.pp.travelport.net/11/air/ Production https://api.travelport.net/11/air/ The APIs do not support PUT&#160;commands for directly modifying these remarks. Instead you must delete a remark and then add the new remark.&#160;See Workflows to Add and Delete Remarks above. See the following sections for the payload for each special service list remark. Unless otherwise noted, responses to requests in this section return an HTTP 200 No Content message for GDS and HTTP 204 No Content message for NDC. Add SSRs by Code See Endpoints above for endpoints and response details. GDS only; not supported for NDC. This request allows you to send the industry SSR code for any programmatic or manual SSR instead of the name of the service, such as Wheelchair . This request can be used instead of any other request in this topic for any remark or service request that has an industry SSR code and does not require payment. Send the SSR code in the mandatory SSRCode object, which allows any four alpha characters. If an invalid SSR code is sent, an error message that no SSR code exists is returned. The optional Freetext object supports up to 127 characters for manual SSRs. Although some carriers may require specific free text, the JSON APIs do not validate this string. SSRs added with this request cannot be deleted. They are returned in the Reservation Retrieve. Show Example request to add SSR by code { "SpecialServiceListRequest": { "SpecialServiceID": [ { "@type": "SpecialService", "id": "specialService_1", "Identifier": { "value": "d1699847-8dc1-4016-a32f-281c6d4da953" }, "AppliesTo": { "@type": "AppliesToOffer", "OfferIdentifier": [ { "id": "offer_1", "offerRef": "offer_1", "Identifier": { "authority": "Travelport", "value": "o1" } } ] }, "TravelerIdentifier": { "Identifier": { "value": "trav_2" } }, "SSRCode": "UMNR" "FreeText": "SR LANG AY-ENGLISH/Test/Kumar/M" } ] } } Show Example SSR by code response { "SpecialServiceListResponse": { "@type": "SpecialServiceListResponse", "Identifier": { "value": "138f269e-f114-4ce5-ae81-3ac540ba2d54" } } } Delete Multiple SSRs GDS only; not supported for NDC. DEL book/specialservices/reservationworkbench/ {workbenchID} /specialservices/deletemultiple For {SpecialServiceID} send the system-generated identifier for the remark to delete. For {workbenchID} send the workbench identifier returned in ReservationResponse/Identifer/value in the workbench create response. Base path: Pre-production https://api.pp.travelport.net/11/air/ Production https://api.travelport.net/11/air/ Remarks and SSRs must typically be deleted one at a time. For meal and disability SSRs added by IATA code (see Add SSRs by IATA Code above), you can send a list of multiple SSRs to delete in a single request. If the SSR was added by IATA code, the Reservation Retrieve returns the SSR&#160;code for that SSR, as in: "SSRCode": "KSML" Use the following payload to delete multiple SSRs by sending as a string the Identifier value of each SSR to delete. This information is returned for each SSR in the Workbench Create response in SpecialService/Identifier/value. Show Example request to delete multiple SSRs { "SpecialServiceQueryDeleteMultiple": { "SpecialServiceID": [ "e09948b4-ef08-41b2-935b-9b7bb63e2bbe", "5bbd3c60-fa00-4187-abb2-a6bc42dbc1c9" ] } } Show Example response to delete multiple SSRs { "SpecialServiceListResponse": { "@type": "SpecialServiceListResponse", "Identifier": { "value": "eb5f3558-51a1-4ff8-a04a-e216809ae4cc" } } } &#160; Special Service Request - Disability SSR See Endpoints above for endpoint and response details. This payload is planned for deprecation. Best practice is to add meal SSRs by IATA code per above. Optional remarks for disability special service requests can be added either during the initial reservation workflow, or to an existing reservation. Disability service details are returned in the reservation retrieve . They cannot be deleted, but they can be added to an existing reservation. Only one kind of special service request is supported in the same payload. For example, you can send multiple special assistance requests in the following payload but not a request for a wheelchair and a special meal request. Specific disability SSRs require varying formats. You can send SSR disability requests for a specific traveler or for all travelers on the reservation, and you can send an SSR for a specific offer or for all segments on the reservation. For detailed examples download the Disability Request Payload Options guide. The following SSR&#160;codes are supported. When using the payload described in this section, do not send the SSR codes; instead, refer to the Disability Request Payload Options guide for the specific payload for each type of disability request by SSR code. Alternately, you can use the payload in Add SSR by IATA Code to send these SSRs by code. SSR&#160;Code Description BLND Traveler is blind. DEAF Traveler is deaf. DPNA Disabled Passenger with intellectual or development disability needing assistance. WCHC Wheelchair is needed – traveler is completely immobile. WCHR Wheelchair is needed – traveler can ascend/descend stairs. WCHS Passenger cannot ascend/descend steps but is able to make own way to/from cabin seat. Requires wheelchair for distance to/from aircraft or mobile lounge and must be carried up/down steps. WCLB Wheelchair Lithium ION battery to be transported by a passenger which will require advance notification/preparation. Weight and dimensions may be specified. Wheelchair and battery must be claimed and rechecked at each interline transfer point. WCMP Wheelchair manual power to be transported by passenger. Weight and dimensions may be specified. WCBW Wet cell battery to be transported by passenger. Will require advance notification and may require preparation/(dis)assembly. Weight and dimensions may be specified. Wheelchair and battery must be claimed and rechecked at each interline transfer point. WCBD Wheelchair non-spillable battery to be transported by a passenger which will require advance notification/preparation. Weight and dimensions may be specified. Wheelchair and battery must be claimed and rechecked at each interline transfer point. The request payload below supports either the object name SpecialServiceID or SpecialService . Show Example SSR Disability request The following example shows the payload to create an SSR for BLND. { "SpecialServiceListRequest": { "SpecialServiceID": [ { "@type": "SpecialServiceBlind", "blindAssistanceRequestedInd": true, "id": "specialService_1", "Identifier": { "authority": "Travelport", "value": "A0656EFF-FAF4-456F-B061-0161008D7C4E" }, "TravelerIdentifier": { "id": "trav_1", "Identifier": { "authority": "Travelport", "value": "5250500b-51ab-4f79-82bc-494753114b74" } } } ] } } Special Service Request - Meals (SSR&#160; meal code ) See Endpoints above for endpoint and response details. This payload is planned for deprecation. Best practice is to add meal SSRs by IATA code per above. You can send special meal requests for passengers with dietary constraints when a meal service is offered by the airline on a flight. At this time special meal requests are supported for GDS, and for NDC only on carriers American Airlines (AA), Qantas Airways (QF), and United Airlines (UA). Additional NDC airlines and pre-paid ancillary meal requests will be available later. Special meal requests&#160;are returned in the reservation retrieve in the SpecialService object. Special meal requests&#160;can be added during booking or to an existing reservation, and can be deleted. The JSON APIs support the 21 most commonly requested free meal types as an enumeration per the mapping below. The carrier must also support the requested meal type for the meal to be provided to the traveler. Free meals are usually only offered in premium cabins, or on flights that are more than six hours. However, each airline may support free meal type requests using different criteria. As currently supported by airlines, all free meal requests are on a request-only basis, and neither the airline nor Travelport guarantee the specific meal offering will be available, supported, and provided to the traveler on their selected flight. Travelers should always advise the airline at check-in, boarding, and/or with cabin staff about special meal requests. IATA Code (informational only; do not send) Enumeration Values Mapping (send in SpecialMealTypeEnum per example below) BBML Baby CHML Child DBML Diabetic FPML FruitPlatter HNML Hindu VJML Jain KSML Kosher LCML LowCalorie LFML LowFat LSML LowSalt MOML Muslim NLML NonLactos NOML None SFML Seafood VGML Vegan AVML VegetarianHindu VLML VegetarianLactoOvo VOML VegetarianOriental RVML VegetarianRaw Only one kind of special service request is supported in the same payload. For example, you can send multiple special meal requests in the following payload, but not a special meal request and a request for a wheelchair. Show Example special meal request The following example requests a fruit platter meal for trav_1 and VegetarianLactoOvo for trav_2. { "SpecialServiceListRequest": { "SpecialServiceID": [ { "@type": "SpecialServiceMeal", "id": "specialService_1", "Identifier": { "authority": "Travelport", "value": "A0656EFF-FAF4-456F-B061-0161008D7C4E" }, "AppliesTo": { "@type": "AppliesToOffer", "OfferIdentifier": [ { "id": "o0", "offerRef": "o0", "Identifier": { "authority": "AA", "value": "UG9QMURGNDY4ODgtNzAyMS00QTI0LTLTEtMXxBQQ==" } } ] }, "TravelerIdentifier": { "id": "trav_1", "Identifier": { "value": "5ef113cc-3b08-45b4-9e97-7393a1b7e6d4" } }, "SpecialMealTypeEnum": "FruitPlatter" }, { "@type": "SpecialServiceMeal", "id": "specialService_2", "Identifier": { "authority": "Travelport", "value": "A0656EFF-FAF4-456F-BBBB-0161008D7C4E" }, "AppliesTo": { "@type": "AppliesToOffer", "OfferIdentifier": [ { "id": "o0", "offerRef": "o0", "Identifier": { "authority": "AA", "value": "UG9QMURGNDY4ODgtNzAyMS00QTI0LTl5REM3LTEtMXxBQQ==" } } ] }, "TravelerIdentifier": { "id": "trav_2", "Identifier": { "value": "6b20f372-4ea4-48b2-9dc1-d22a5f184c2f" } }, "SpecialMealTypeEnum": "VegetarianLactoOvo" } ] } } Document Overrides Payload Remarks GDS&#160;only; not supported for NDC. Endpoint All remarks in this section use the following POST request to create the remark. See Workflows to Add and Delete Remarks above. POST book/documentoverride/Reservation/ {workbenchID} /documentoverrides For {workbenchID} send the workbench identifier returned in ReservationResponse/Identifer/value in the workbench create response. Base path: Pre-production https://api.pp.travelport.net/11/air/ Production https://api.travelport.net/11/air/ DEL or PUT&#160;commands for deleting or modifying document override remarks are not supported. See the following sections for the payload for each document override remark. All document override requests return the response in the following format. Show Example document override response { "DocumentOverridesResponse": { "Identifier": { "authority": "Travelport", "value": "003865ac-9186-4323-b046-811411803dfa" } } } Document Override Remarks (tour code, commission, endorsement) GDS&#160;only; not supported for NDC. For additional examples, download the developer toolkits and see Using Postman and Developer Toolkits . Use document overrides to send remarks such as tour code, commission, or endorsements/restrictions. Document override remarks are returned in the reservation retrieve only when the detailViewInd query parameter is set to true. Document override remarks can be added to a reservation but cannot be deleted. Show Example document override remark request The following example sends several types of document override remarks. { "DocumentOverrides": { "id": "documentOverrides_1", "DocumentOverridesRef": "documentOverrides_1", "Commissions": [ { "Commission": { "@type": "CommissionAmount", "Amount": { "code": "USD", "value": 123 } } } ], "TourCodes": [ { "TourCode": { "tourCodeType": "Bulk Tour", "value": "TCS" } } ], "Restrictions": [ { "Restriction": [ "NON Refundable" ] } ], "DestinationPurpose": [ { "purpose": "Business", "destination": "Europe" } ] } } Traveler-specific commissions For additional examples, download the developer toolkits and see Using Postman and Developer Toolkits . To send a commission to be applied only to the fare of one or more specific travelers, send traveler details in TravelerIdentifierRef along with the commission to be applied. Commission can be sent as either an amount or percentage. Show Example document override request for traveler-specific commission { "DocumentOverrides": { "id": "documentOverrides_1", "DocumentOverridesRef": "documentOverrides_1", "Commissions": [ { "TravelerIdentifierRef": [ { "id": "trav_1" } ], "Commission": { "@type": "CommissionAmount", "Amount": { "code": "USD", "value": 205.66 } } } ] } } Document Overrides in GDS Exchanges (change fee collection, EMD&#160;endorsement, commission, MIR) Several specific document override remarks can be used when exchanging a GDS ticket . Use the same endpoint and payload as for Document Overrides above with the following additions. Change fee collection method For additional examples, download the developer toolkits and see Using Postman and Developer Toolkits . You can use document override remarks to override the change fee collection method from what is returned in the Exchange Search response. Include the ChangeFeeCollectionMethod object per the example below. If you override from TAX to EMD and the change fee includes a VAT tax, include in the payload the taxIncludedInBaseAmountInd indicator to note how the VAT tax should be collected: True : VAT tax should be included in the change fee amount. The VAT tax will be added to the change fee amount in the SVC segment and an EMD issued for one amount. False : VAT tax should be separated from the change fee amount. The VAT tax will not be added to the change fee amount in the SVC segment and an EMD issued with the change fee amount and a separate tax amount. Show Example document override remark with change fee indicator for exchange { "DocumentOverrides": { "id": "documentOverrides_1", "DocumentOverridesRef": "documentOverrides_1", "ChangeFeeCollectionMethod": { "extension": "Other_Value", "code": "D", "subCode": "997", "description": "REBOOKING", "value": "EMD", "taxIncludedInBaseAmountInd": true } } } You can also specify that a tax should be used to collect the change fee. ChangeFeeCollectionMethod indicates that the change fee collection method returned in the Exchange Search response is being overridden. Specify the two-character tax code to be used as the collection method in code (e.g., OA, DU, CP, XP). Show Example document override remark with change fee as a tax for exchange In the following example, the only value that should change is the tax code. { "DocumentOverrides" : { "@type" : "DocumentOverrides", "id" : "documentOverrides_1", "DocumentOverridesRef" : "documentOverrides_1", } } ], "ChangeFeeCollectionMethod" : { "extension" : "Other_Value", "code" : "OA", "description" : "REBOOKING FEE", "value" : "Tax" } } } EMD endorsements The Restrictions/DocumentType object supports endorsements for EMDs as follows. The text of the EMD endorsement itself is sent in Restrictions/Restriction. Supported values for DocumentType are EMD&#160;and Ticket: EMD :&#160;Up to 145 characters and 1 endorsement line allowed. Ticket : Up to 29 characters and 3 endorsement lines allowed. Show Example document override request for EMD endorsement { "DocumentOverrides": { "id": "documentOverrides_1", "DocumentOverridesRef": "documentOverrides_1", "Restrictions": [ { "Restriction": [ "NON Refundable" ], "DocumentType": { "value": "EMD" } } ] } } Commissions The Commissions/ApplyTo object allows you to apply an instance of Commissions/Commission to either the change fee (send with a value of Fee ) or the base fare (send with a value of Base ). To apply a commission to both the change fee and the base fare, send one instance of Commission for each. ApplyTo is supported only in document overrides sent as part of Exchange Ticketing. Show Example of Commission with ApplyTo The following example sends one instance of Commission that applies to the change fee and a second instance that applies to the base fare. { "DocumentOverrides": { "id": "documentOverrides_1", "DocumentOverridesRef": "documentOverrides_1", "Commissions": [ { "ApplyTo": "Fee", "Commission": { "@type": "CommissionAmount", "Amount": { "code": "USD", "value": "5" } } }, { "ApplyTo": "Base", "Commission": { "@type": "CommissionAmount", "Amount": { "code": "USD", "value": "10" } } } ] } } Ticket Designator The TicketDesignator object in the Document Overrides request allows ARC and BSP Canada API customers to add a ticket designator or modify an existing ticket designator during the exchange flow. The ticket designator applies to all travelers on the reservation. Show Example of TicketDesignator { "DocumentOverrides": { "id": "documentOverrides_1", "DocumentOverridesRef": "documentOverrides_1", "TicketDesignator": "AB123" } } Even Exchange Override for MIR To override any exchange into an even exchange for MIR (Machine Interface Record) back-end system processing only, send the indicator residualValueAsEvenExchangeMIRInd=true. This indicator is not returned in and does not change the response or any JSON API&#160;processing. Agents must manually review and confirm when to send this indicator. Show Example of residualValueAsEvenExchangeMIRInd { "DocumentOverrides": { "@type": "DocumentOverrides", "id": "documentOverrides_1", "DocumentOverridesRef": "documentOverrides_1", "residualValueAsEvenExchangeMIRInd": true } } Accounting Remarks Not all NDC carriers support all types of remarks that can be sent in the Accounting and Reservation Comments payloads. If a specific NDC carrier does not support a remark, the API creates and stores the remark in the Travelport booking record only and does not send that remark to the carrier. Accounting remarks can also be added and deleted during the GDS Exchanges workflow using these endpoints in an exchange workbench session. Endpoints and Response for all Accounting Remarks All remarks in this section use the following POST&#160;request to create the remark. POST book/accounting/reservationworkbench/ {workbenchID} /accountings For {workbenchID} send the workbench identifier returned in ReservationResponse/Identifer/value in the workbench create response. Base path: Pre-production https://api.pp.travelport.net/11/air/ Production https://api.travelport.net/11/air/ Use the following DEL request to delete accounting remarks. DEL book/reservationworkbench/ {workbenchID} /accountings/ {id} /namevaluepairs?NameValuePairIds=/ {NameValuePairvalue} / For {workbenchID} send the workbench identifier returned in ReservationResponse/Identifer/value in the workbench create response. Base path: Pre-production https://api.pp.travelport.net/11/air/ Production https://api.travelport.net/11/air/ PUT&#160;commands for directly modifying these remarks are not supported. Instead you must delete a remark and then add the new remark.&#160;See Workflows to Add and Delete Remarks above. See the following sections for the payload for each accounting remark. The response for all remarks added with the Accounting payload returns an identifier. The following sections provide examples of the remark as returned in the reservation retrieve response. Example DEL endpoint requests (see above for base path) Delete one remark: /book/accounting/reservationworkbench/af146c9e-e88e-4c35-8e35-7bf167f96a58/accountings/Accounting_1/namevaluepairs?NameValuePairIds=ActComment_2 Delete multiple remarks: /book/accounting/reservationworkbench/af146c9e-e88e-4c35-8e35-7bf167f96a58/accountings/Accounting_1/namevaluepairs?NameValuePairIds=ActComment_2, ActComment_3, ActComment_8 Show Example response for accounting remarks addition { "AccountingResponse": { "Accounting": { "@type": "AccountingID", "Identifier": { "authority": "Travelport", "value": "9658ae33-c031-42d6-9035-69bf0b38ca8d" } } } } Accounting, Historical, and DOCI Remarks For additional examples, download the developer toolkits and see Using Postman and Developer Toolkits . Optional accounting remarks can be added to the reservation and are typically used in some way by an agency's back-office system. The remarks can include ticket numbers, customer or account numbers, fares offered to the customer but refused, and canned remarks that document fare rules. Accounting remarks are added to the booking as historical notepad remarks. To send an accounting free-text remark, or DOCI&#160;remark, send an accounting remark with Accounting/dataType value of DOCI and NameValuePair/name value of FT , per the examples below. Accounting remarks are returned in the reservation retrieve only when the detailViewInd query parameter is set to true. They can be added to an existing reservation and deleted. The following examples show the payload requests and the remark excerpt from the reservation retrieve response. Accounting DOCI remarks Show Example accounting DOCI remark request { "Accounting": { "id": "accounting_1", "dataType": "DOCI", "AccountingRef": "accounting_1", "NameValuePair": [ { "value": "documentInvoice.INV 41641463345", "name": "FT" }, { "value": "offerNumber.PTR 41641463345", "name": "FT" }, { "value": "Commission.CMM 0/3.6", "name": "FT" } ] No Show Example excerpt for accounting DOCI remark from Reservation Retrieve "Accounting": { "@type": "Accounting", "dataType": "DOCI", "id": "Accounting_1", "Identifier": { "authority": "Travelport", "value": "8d92d4ea-0d97-4319-9f6b-fd7f9604da5a" }, "NameValuePair": [ { "id": "ActComment_1", "name": "AC", "value": "A53.IBM213.JAMES" }, { "id": "ActComment_2", "name": "TK", "value": "2040805184" }, { "id": "ActComment_3", "name": "FT", "value": "offerNumber.PTR 41641463345" } ] } } } } Accounting historical remarks Show Example accounting historical remark request { "Accounting": { "@type": "Accounting", "id": "accounting_1", "AccountingRef": "accounting_1", "NameValuePair": [ { "name": "QF", "value": "ACCOUNTING REMARKS TESTING" }, { "name": "UA", "value": "FREETEXT REMARKS TESTING" }, { "name": "H*", "value": "H remark" }, { "name": "FT", "value": "Added name FT for acntng rematks testing" } ] } } Show Example excerpt for accounting historical remark from Reservation Retrieve "Accounting": { "@type": "Accounting", "id": "Accounting_1", "Identifier": { "authority": "Travelport", "value": "89cc8a38-e107-42bd-a4a7-eed4e7b0259d" }, "NameValuePair": [ { "id": "GenComment_4", "name": "QF", "value": "ACCOUNTING REMARKS TESTING" }, { "id": "GenComment_5", "name": "UA", "value": "FREETEXT REMARKS TESTING" }, { "id": "GenComment_6", "name": "H*", "value": "H remark" }, { "id": "GenComment_7", "name": "FT", "value": "Added name FT for acntng rematks testing" } ] } } Reservation Comments Payload Remarks Not all NDC carriers support all types of remarks that can be sent in the Accounting and Reservation Comments payloads. If a specific NDC carrier does not support a remark, the remark is created and stored only in the Travelport booking record and is not sent to the carrier. Reservation Comments can also be added and deleted during the GDS Exchanges workflow using these endpoints in an exchange workbench session. Endpoints and Response for all Reservation Comments Remarks All remarks in this section use the following POST request to create the remark. POST book/remarks/reservationworkbench/ {workbenchID} /reservationcomments/list For {workbenchID} send the workbench identifier returned in ReservationResponse/Identifer/value in the workbench create response. Base path: Pre-production https://api.pp.travelport.net/11/air/ Production https://api.travelport.net/11/air/ Use the following DEL request to delete any remark sent in the Reservation Comments payload. DEL reservationworkbench/ {workbenchID} /reservationcomments/ {id} /comments For {workbenchID} send the workbench identifier returned in ReservationResponse/Identifer/value in the workbench create response. Base path: Pre-production https://api.pp.travelport.net/11/air/ Production https://api.travelport.net/11/air/ PUT&#160;commands for directly modifying these remarks are not supported. Instead you must delete a remark and then add the new remark.&#160;See Workflow to Add and Delete Remarks above. See the following sections for the payload for each reservation comment remark. The following response is returned for all remarks added with the Reservation Comments payload. The sections below provide examples of the remark as returned in the reservation retrieve response. Show Example Reservation Comments payload response { "ReservationCommentListResponse": { "@type": "ReservationCommentListResponse" } } OSI&#160;Remarks See Endpoints above for endpoints and response details. For additional examples, download the developer toolkits and see Using Postman and Developer Toolkits . Other Service Information (OSI) remarks are messages sent directly to the supplier to communicate traveler preferences or requirements that are informational only, and do not require the carrier to take action. Send OSI&#160;remarks per the example below. Send multiple remarks by including each remark in its own name and/or value key value pair. To ensure the remark is added as an OSI remark, send the following required objects in ReservationCommentID per the examples below: commentSource with the value Agency shareWith with the value Supplier shareWithSupplier is optional; when sent the value is the carrier code of the specific carrier to share with OSI remarks are returned in the reservation retrieve , where they are identified with a value of Agency in ReservationComment/commentSource. OSI&#160;remarks support from 1 to 99 characters inclusive. OSI&#160;remarks support the special characters . (period), / (forward slash), and - (dash). Longer messages and any other characters result in an error message. The following examples show the payload requests and the remark excerpt from the reservation retrieve response. Show Example OSI&#160;remark request { "ReservationCommentListRequest": { "ReservationCommentID": [ { "@type": "ReservationComment", "id": "ReservationComment_1", "commentSource": "Agency", "shareWith": "Supplier", "shareWithSupplier": [ "UA" ], "Comment": [ { "name": "OSI Remarks", "value": "ADDING OSI REMARK FOR AIRLINE" } ] } ] } } Show Example excerpt from Reservation Retrieve for OSI&#160;remark { "@type": "ReservationComment", "commentSource": "Agency", "shareWith": "Supplier", "shareWithSupplier": [ "UA" ], "id": "RSRVComment_2", "Comment": [ { "id": "SinComment_1", "name": "OSI Remarks", "language": "EN", "value": "ADDING OSI REMARK FOR AIRLINE" } ] }, Notepad Remarks See Endpoints above for endpoints and response details. For additional examples, download the developer toolkits and see Using Postman and Developer Toolkits . Optional notepad remarks can be added to the reservation. To ensure the remark is added as a notepad remark, send the following required objects in ReservationCommentID per the examples below: commentSource with the value Agency shareWith with the value Agency shareWithSupplier is optional; when sent the value is the carrier code of the specific carrier to share with Notepad remarks are returned in the reservation retrieve by default, where they are identified with a value of Agency in ReservationComment/commentSource. The following examples show the payload requests and the remark excerpt from the reservation retrieve response. The JSON APIs do not support the D* (asterisk) value that can be entered in Smartpoint. If Comment/name is sent with a value of D* , the request fails and returns the error message G PRIMARY QUALIFIER MUST BE C OR H OR F IF SECONDARY IS * - General Remarks" . Show Example notepad remark request { "ReservationCommentListRequest": { "ReservationCommentID": [ { "@type": "ReservationComment", "commentSource": "Agency", "shareWith": "Agency", "Comment": [ { "name": "QF", "value": "QF 674 E 09JUN ADLMEL HS2 0905 1055" }, { "name": "HG", "value": "Historical Notepad Remark" } ] } ] } } Show Example excerpt from Reservation Retrieve for notepad remark { "@type": "ReservationComment", "commentSource": "Agency", "shareWith": "Agency", "Comment": [ { "name": "QF", "value": "QF 674 E 09JUN ADLMEL HS2 0905 1055" }, { "name": "HG", "value": "Historical Notepad Remark" } ] }, Spanish Residency and Large Family Discount Fares Spanish residency and large family discount fares are available to residents of Spain for NDC on carrier IB only. When booking these fares, use notepad remarks as follows: Send one remark per traveler. Either an HR&#160;Resident or HR&#160;Family remark is required . This is used to validate traveler residency and documentation. For Spanish residency discount : Send Comment/name with the value HR Send Comment/value with the exact string format RESIDENT {Type of ID}/{Number of ID}/{Municipal Code}//{Traveler Ref}]// RESIDENT&#160;is expected by the carrier. Supported values for type of ID: DN: DNI/National Document GR: Senator/Representative TR: NIE/Foreign resident card MR: Minor of 14 years old with no DNI [Number of ID] is the ID&#160;number. When the type of ID&#160;is MR, send date of birth in the format DDMMYYYY [Municipal Code] [Traveler Ref]:&#160;Do not send a JSON API&#160;traveler identifier. Instead send P1 for the first traveler, P2 for the second traveler, etc. // notes the end of string Example: RESIDENT DN/12345678Z/070027/P1// &#160; For large family discount , send Comment/name with the value HF and Comment/value with FAMILY at the beginning of the string. Send Comment/name with the value HF Send Comment/value with the exact string format FAMILY {Family Category}{Type of ID}/{Number of ID}/{Municipal Code}/{Certificate Number}//{Traveler Ref}// FAMILY is expected by the carrier. {Family Category} supported values: F1 = for families with 3 children F2 = for families with 4 or more children {Type of ID} DN: DNI/National Document TR: NIE/Foreign resident card MR: Minor of 14 years old with no DNI [Number of ID] is the ID&#160;number. When the type of ID&#160;is MR, send date of birth in the format DDMMYYYY {Municipal Code} {Certificate Number} [Traveler Ref]:&#160;Do need send a JSON API&#160;traveler identifier. Instead send P1 for the first traveler, P2 for the second traveler, etc. // notes the end of the string Example: FAMILY F1DN/12345678Z/410917/9999999999/P1// &#160; Send HR SARA only if a traveler has a second last name. If a SARA remark exists then this name will be sent to the carrier and used to issue the ticket. The traveler name in the workbench is used to create the name field on the booking. Send Comment/name with the value HR Send Comment/value with the exact string format SARA {1stlastname}/{2ndlastname}/{1stname middlename}/{Traveler Ref}// SARA is expected by the carrier. {1stlastname} {2ndlastname} {1stname middlename} A space is required between the first name and middle name. [Traveler Ref]:&#160;Do need send a JSON API&#160;traveler identifier. Instead send P1 for the first traveler, P2 for the second traveler, etc. // notes the end of the string Example: SARA: Ortega Smith/Molina/Francisco Javier/P1// &#160; Show Example for HR&#160;Resident remark (NDC carrier IB only) { "ReservationCommentListRequest": { "ReservationCommentID": [ { "@type": "ReservationComment", "commentSource": "Agency", "shareWith": "Agency", "Comment": [ { "name": "HR", "value": "RESIDENT DN/12345678Z/410917//P2//" } ] } ] } } Show Example for HR&#160;Resident and HR SARA remarks (NDC carrier IB only) { "ReservationCommentListRequest": { "ReservationCommentID": [ { "@type": "ReservationComment", "commentSource": "Agency", "shareWith": "Agency", "id": "RSRVComment_1", "Comment": [ { "name": "HR", "value": "RESIDENT DN/101/380201//P1//" }, { "name": "HR", "value": "SARA ORTEGA SMITH/MOLINA/FRANCISCO JAVIER//P1//" } ] } ] } } Vendor Remarks See Endpoints above for endpoints and response details. Vendor remarks are usually comments made by the airline to send to an agent. These vendor input remarks are not sent in the JSON APIs but rather are typically generated automatically once the booking or request is completed. These usually include the airline's own record locator, replies to special requests, and advice on ticketing time limits. It is also possible for an agent to send vendor remarks to an airline, called vendor output remarks . When creating a vendor output remark, send the following required values in ReservationCommentID per the examples below: commentSource with the value Supplier shareWith with the value Agency shareWithSupplier is optional; when sent the value is the carrier code of the specific carrier to share with Vendor remarks for GDS are returned in the reservation retrieve , where they are identified with a value of Supplier in ReservationComment/commentSource. Vendor remarks for NDC&#160;are not returned in the reservation retrieve. The following examples show the payload requests and the remark excerpt from the reservation retrieve response. Show Example vendor output remark request "ReservationCommentListRequest": { "ReservationCommentID": [ { "@type": "ReservationComment", "id": "reservationComment_1", "commentSource": "Supplier", "shareWith": "Agency", "shareWithSupplier": [ "QF" ], "Comment": [ { "id": "comment_1", "name": "Vendor Remarks", "language": "EN", "value": "VendorTest" } ] } ] } } Show Example excerpt from Reservation Retrieve for vendor input and output remarks This example excerpt returns several types of remarks. The first two instances of ReservationComment are both vendor remarks. Comment/id identifies the first instance as a vendor output remark with the initial letters Veo while Comment/id identifies the second instance as a vendor input remark with the initial letters Vei . "ReservationComment": [ { "@type": "ReservationComment", "commentSource": "Supplier", "shareWithSupplier": [ "YY" ], "id": "RSRVComment_1", "Comment": [ { "id": "VeoComment_1", "value": "VENDORTEST" } ] }, { "@type": "ReservationComment", "commentSource": "Supplier", "shareWithSupplier": [ "QF" ], "id": "RSRVComment_2", "Comment": [ { "id": "VeiComment_2", "value": "MISSING SSR CTCM MOBILE OR SSR CTCE EMAIL OR SSR CTCR NON-CONSENT FOR QF" } ] }, { "@type": "ReservationComment", "commentSource": "Agency", "shareWith": "Supplier", "shareWithSupplier": [ "YY" ], "id": "RSRVComment_3", "Comment": [ { "id": "SinComment_1", "name": "OSI Remarks", "language": "EN", "value": "THIS IS OSI REMARK" } ] }, { "@type": "ReservationComment", "commentSource": "Agency", "id": "RSRVComment_4", "Comment": [ { "id": "GenComment_1", "name": "QF", "value": "QF 674 E 09JUN ADLMEL HS2 0905 1055" }, { "id": "GenComment_2", "name": "HG", "value": "Historical Notepad Remark" } ] }, { "@type": "ReservationComment", "id": "RSRVComment_5", "Comment": [ { "id": "ItuComment_2", "name": "ITIN COMMENTS", "value": "Itinerary Unassociated Remarks Addition" } ] }, { "@type": "ReservationComment", "id": "RSRVComment_6", "Comment": [ { "id": "ItaComment_1", "name": "ITIN COMMENTS", "value": "THIS IS SINGLE COMMENT WITH SINGLE PRODUCT 1" } ], "AppliesTo": [ { "@type": "AppliesToOfferProductSegment", "OfferIdentifier": {}, "ProductIdentifier": { "productRef": "product_1" }, "SegmentSequenceList": [ 1 ] } ] } ], "ReservationDisplaySequence": { "@type": "ReservationDisplaySequence", "DisplaySequence": [ { "@type": "DisplaySequence", "displaySequence": 1, "OfferRef": "offer_1", "ProductRef": "product_1", "Sequence": 1 } ] }, "Accounting": { "@type": "Accounting", "id": "Accounting_1", "Identifier": { "authority": "Travelport", "value": "001700f5-7830-4cb1-b98c-8810525c64bc" }, "NameValuePair": [ { "id": "GenComment_6", "name": "UA", "value": "FREETEXT REMARKS TESTING" }, { "id": "GenComment_7", "name": "H*", "value": "H remark" }, { "id": "GenComment_8", "name": "FT", "value": "Added name FT for acntng rematks testing" } ] } } } } Itinerary Remarks - Associated and Unassociated See Endpoints above for endpoints and response details. For additional examples, download the developer toolkits and see Using Postman and Developer Toolkits . Associated and unassociated remarks are optional, multi-item freeform strings of text. Associated remarks can be added for an offer, product, or a segment. Unassociated remarks apply to the itinerary and are not associated with a segment. Per the following examples, use AppliesTo with these @type values: AppliesToOffer for remarks associated with the offer (the entire itinerary) AppliesToOfferProduct for remarks associated with the product (one leg of the itinerary) AppliesToOfferProductSegment for remarks associated with the segment (one flight on the itinerary) To ensure the remark is added as an itinerary remark, per the examples below, send the following required objects in ReservationCommentID: commentSource with the value Agency shareWith with the value Traveler shareWithSupplier is optional; when sent the value is the carrier code of the specific carrier to share with The following examples show the complete payload requests and an excerpt showing the remark as returned in the reservation retrieve response. Show Example associated remark request - offer level { "ReservationCommentListRequest": { "ReservationCommentID": [ { "@type": "ReservationComment", "commentSource": "Agency", "shareWith": "Traveler", "Comment": [ { "name": "ITIN COMMENTS", "value": "This remarks has single offer with all segments" } ], "AppliesTo": [ { "@type": "AppliesToOffer", "OfferIdentifier": [ { "Identifier": { "authority": "Travelport", "value": "9658ae33-c031-42d6-9035-69bf0b38ca8d" } } ] } ] } ] } } Show Example associated remark request - product level { "ReservationCommentListRequest": { "ReservationCommentID": [ { "@type": "ReservationComment", "commentSource": "Agency", "shareWith": "Traveler", "Comment": [ { "name": "ITIN COMMENTS", "value": "This is single comment with single product 1" } ], "AppliesTo": [ { "@type": "AppliesToOfferProduct", "OfferIdentifier": { "Identifier": { "authority": "Travelport", "value": "ef30b4cf-951a-400d-87f0-8691bc6056ce" } }, "ProductIdentifier": [ { "Identifier": { "authority": "Travelport", "value": "0a2692dc-1c94-4e12-bef0-06772cf45f65" } } ] } ] } ] } } Show Example associated remark request - segment level { "ReservationCommentListRequest": { "ReservationCommentID": [ { "@type": "ReservationComment", "commentSource": "Agency", "shareWith": "Traveler", "Comment": [ { "name": "ITIN COMMENTS", "value": "Testing single ITIN associated remarks -segment" } ], "AppliesTo": [ { "@type": "AppliesToOfferProductSegment", "OfferIdentifier": { "Identifier": { "authority": "Travelport", "value": "feedba3d-51ec-4175-9f1a-d05efed57aa9" } }, "ProductIdentifier": { "Identifier": { "authority": "Travelport", "value": "0a2692dc-1c94-4e12-bef0-06772cf45f65" } }, "SegmentSequenceList": [ 1 ] } ] } ] } } The following excerpts shows the itinerary remarks as returned in the Reservation Retrieve response for both offer and segment-level remarks. Show Example excerpt from Reservation Retrieve for associated remark at segment level { "@type": "ReservationComment", "commentSource": "Agency", "shareWith": "Traveler", "Comment": [ { "name": "ITIN COMMENTS", "value": "TESTING SINGLE ITIN ASSOCIATED REMARKS -SEGMENT" } ], "AppliesTo": [ { "@type": "AppliesToOfferProductSegment", "OfferIdentifier": { "offerRef": "offer_1" }, "ProductIdentifier": { "productRef": "product_1" }, "SegmentSequenceList": [ 1 ] } ] } The following excerpts show the request and response for unassociated itinerary remarks. Show Example unassociated remark request { "ReservationCommentListRequest": { "ReservationCommentID": [ { "@type": "ReservationComment", "commentSource": "Agency", "shareWith": "Traveler", "Comment": [ { "name": "ITIN COMMENTS", "value": "Testing ITIN UnAsso remarks one" } ] } ] } } Show Example excerpt from Reservation Retrieve for unassociated remark { "@type": "ReservationComment", "Comment": [ { "name": "ITIN COMMENTS", "value": "Testing ITIN UnAsso remarks one" } ] }, Add Offer Payload Endpoint All remarks in this section are sent in the Add Offer request. Use the endpoint for either the Add Offer reference payload or Add Offer full payload. Modifying and deleting remarks sent in the Add Offer payload is not supported. India GST&#160;SSR To accommodate travel within and from India, the Add Offer payload supports sending GST&#160;details, which are converted to GST&#160;SSRs as applicable. Send GST&#160;details as part of the Add Offer request in OrganizationInformation/GSTRegistrationNumber. GST is a Goods and Services Tax (GST) implemented by the government of India. GST merges several individual taxes into a single tax and is a comprehensive indirect tax on the manufacture, sale, and consumption of goods and services throughout India. GST is applicable to all itineraries for travel wholly within India and flights originating in India to international destinations. The GST is not applicable on international flights to India or Indian domestic connections from such flights. Per Indian law, it is mandatory for the validating carrier to collect the GST data for all applicable travel paid for by a business with a registered GST Number. IATA created the following four industry standard SSRs to send GST data to the validating carrier where required: GSTN - Goods and Services Tax Number GSTA - Goods and Services Tax Business Address GSTP - Goods and Services Tax Business Phone Number(s) GSTE - Goods and Services Tax Business Email The APIs do not validate whether the itinerary originates in India. It is assumed that customers know the restrictions/limitations for the SSR format including usage of any special characters. If any required details for any of the four GST SSRs are missing, none of the SSRs are added. GST data is applied to all travelers and all carriers in that reservation. Travelport recommends booking only the applicable traveler and carrier if GST is not relevant to other passengers on a reservation. GST&#160;SSRs cannot be modified on or added to an existing reservation. For GDS, the OrganizationInformation object with the India GST&#160;details is returned in the commit step and in the reservation retrieve in an instance of TermsAndConditionsFullAir. For NDC, the reservation retrieve does not return OrganizationInformation. Note that the example below could not be used for NDC, which supports OrganizationInformation/GSTRegistrationNumber only in the reference payload, not the full payload Add Offer request shown below, which is supported only for GDS. See the Add Offer Reference Payload API&#160;Reference for details on the GSTRegistrationNumber object. Show Example Show Example Add Offer Request with GST SSR { "OfferQueryBuildFromProducts": { "returnBrandedFaresInd": true, "BuildFromProductsRequest": { "@type": "BuildFromProductsRequestAir", "PricingModifiersAir": { "@type": "PricingModifiersAirDetail", "currencyCode": "AUD", "FareSelection": { "@type": "FareSelectionDetail", "fareType": "PublicAndPrivateFares" }, "Brand": { "@type": "BrandSummary" }, "OrganizationInformation": { "GSTRegistrationNumber": [ { "country": "IND", "address": "2240 RMILLS COMP//MUMBAI/MAHARAHTRA", "companyName": "GTTY", "email": "GST.INFO@IBMGST.IN", "telephone": "9103555559023", "value": "22AAAAA0000A1Z5" } ] } }, "PassengerCriteria": [ { "number": 1, "age": 25, "passengerTypeCode": "ADT" } ], "ProductCriteriaAir": [ { "SpecificFlightCriteria": [ { "flightNumber": "52", "carrier": "CI", "departureDate": "2020-07-21", "departureTime": "22:10:00", "arrivalDate": "2020-07-22", "arrivalTime": "05:40:00", "from": "SYD", "to": "TPE", "classOfService": "N", "cabin": "Economy", "segmentSequence": 1 }, { "flightNumber": "903", "carrier": "CI", "departureDate": "2020-07-22", "departureTime": "08:10:00", "arrivalDate": "2020-07-22", "arrivalTime": "10:05:00", "from": "TPE", "to": "HKG", "classOfService": "N", "cabin": "Economy", "segmentSequence": 2 } ] } ] } } } &#160; &#160;

## Literal `<pre>` excerpts from HTML

### Block 1

```
{
 "TravelerResponse": {
  "Traveler": {
   "@type": "TravelerIdentifier",
   "Identifier": {
    "value": "b42c1b9e-5b1b-4e31-b635-aa138b84fcb6"
   }
  }
 }
}
```

### Block 2

```
{
    "Traveler": {
        "id": "trav_1",
        "passengerTypeCode": "ADT",
        "PersonNameDetail": {
            "Prefix": "",
            "Given": "TestFirst",
            "Middle": "TestMiddle",
            "Surname": "TestLast",
            "Suffix": ""
        },
        "Telephone": [
            {
                "@type": "Telephone",
                "countryAccessCode": "1",
                "areaCityCode": "719",
                "phoneNumber": "6401108",
                "extension": "123",
                "id": "1",
                "cityCode": "DEN",
                "role": "Mobile"
            }
        ],
        "TravelDocument": [
            {
                "@type": "TravelDocumentDetail",
                "docNumber": "245968",
                "docType": "Passport",
                "issueDate": "2019-12-22",
                "expireDate": "2025-08-20",
                "issueCountry": "IND",
                "birthDate": "1999-02-22",
                "birthCountry": "IND",
                "Gender": "Male",
                "PersonName": {
                    "@type": "PersonName",
                    "Given": "Px One",
                    "Middle": "MdNm One",
                    "Surname": "SrNmOne"
                },
                "IssuedForGeoPoliticalArea": {
                    "value": "USA"
                }
            }
        ],
        "Address": [
            {
                "role": "Delivery",
                "Number": "1220",
                "Street": "Travers Street",
                "City": "Claremont",
                "StateProv": {
                    "name": "Texas",
                    "value": "CA"
                },
                "Country": {
                    "value": "US"
                },
                "PostalCode": "917113323"
            }
        ],
        "Email": [
            {
                "value": "test@gmail.com"
            }
        ],
        "CustomerLoyalty": [
            {
                "value": "1234123412",
                "supplier": ""
            }
        ]
    }
}
```

### Block 3

```
{
    "Traveler": {
        "birthDate": "1990-12-01",
        "id": "trav_1",
        "passengerTypeCode": "ADT",
        "PersonName": {
            "@type": "PersonNameDetail",
            "Prefix": "Mr",
            "Given": "JORDAN",
            "Middle": "",
            "Surname": "LOYTEST",
            "Suffix": "ADT"
        },
        "Telephone": [
            {
                "@type": "Telephone",
                "countryAccessCode": "1",
                "areaCityCode": "909",
                "phoneNumber": "212456121",
                "extension": "1243",
                "id": "4",
                "cityCode": "ORD",
                "role": "Office"
            }
        ],
        "Address": [
            {
                "@type": "Address",
                "role": "Delivery",
                "id": "address_1",
                "BldgRoom": {
                    "value": "Bldg H",
                    "buldingInd": true
                },
                "Number": {
                    "value": "563"
                },
                "City": "Los Angeles",
                "Country": {
                    "value": "US"
                },
                "PostalCode": "91711"
            }
        ],
        "Email": [
            {
                "comment": "Primary Email Id",
                "value": "TravelerOne@gmail.com"
            }
        ],
        "PassengerCriteria": [
            {
                "number": 1,
                "age": 25,
                "passengerTypeCode": "ADT"
            }
        ],
        "TravelDocument": [
            {
                "@type": "TravelDocument",
                "docNumber": "H294F4",
                "docType": "Passport",
                "expireDate": "2025-12-12",
                "issueCountry": "IND",
                "birthDate": "1990-12-01",
                "birthCountry": "IND",
                "Gender": "Male",
                "PersonName": {
                    "@type": "PersonName",
                    "Given": "JORDAN",
                    "Middle": "",
                    "Surname": "LOYTEST"
                }
            }
        ],
        "CustomerLoyalty": [
            {
                "value": "2071983684DEF",
                "supplier": "DL"
            }
        ]
    }
}
```

### Block 4

```
{
 "Traveler": {
  "id": "trav_1",
  "passengerTypeCode": "ADT",
  "PersonNameDetail": {
   "Prefix": "",
   "Given": "TestFirst",
   "Middle": "TestMiddle",
   "Surname": "TestLast",
   "Suffix": ""
  },
  "Telephone": [
   {
    "@type": "Telephone",
    "countryAccessCode": "1",
    "areaCityCode": "719",
    "phoneNumber": "6401108",
    "extension": "123",
    "id": "1",
    "cityCode": "DEN",
    "role": "Mobile"
   }
  ],
  "Address": [
   {
    "role": "Delivery",
    "Number": "1220",
    "Street": "Travers Street",
    "City": "Claremont",
    "StateProv": {
     "name": "Texas",
     "value": "CA"
    },
    "Country": {
     "value": "US"
    },
    "PostalCode": "917113323"
   }
  ],
  "Email": [
   {
    "value": "test@gmail.com"
   }
  ],
  "CustomerLoyalty": [
   {
    "value": "1234123412",
    "supplier": ""
   }
  ]
 }
}
```

### Block 5

```
{
 "Traveler": {
  "@type": "Traveler",
  "birthDate": "1999-02-22",
  "gender": "Male",
  "passengerTypeCode": "ADT",
  "PersonName": {
   "@type": "PersonNameDetail",
   "Prefix": "Mr",
   "Given": "Px ADTOne",
   "Middle": "MdNm",
   "Surname": "SrNmOne",
   "Suffix": "ADT"
  },
  "Comments": {
   "@type": "Comments",
   "Comment": [
    {
     "id": "comment_1",
     "value": "ID-12345671"
    }
   ]
  }
 }
}
```

### Block 6

```
{
 "Traveler": {
  "gender": "Male",
  "birthDate": "1977-12-31",
  "id": "trav_1",
  "TravelerRef": "trav_1",
  "passengerTypeCode": "SEA",
  "PersonName": {
   "@type": "PersonNameDetail",
   "Given": "Sailor",
   "Surname": "Guy",
   "Prefix": "MR"
  },
  "Telephone": [
   {
    "@type": "Telephone",
    "countryAccessCode": "1",
    "phoneNumber": "555456121",
    "id": "4",
    "cityCode": "ORD",
    "role": "Home"
   }
  ],
  "Email": [
   {
    "emailType": "FROM",
    "value": "sailor@somedomain.com"
   }
  ],
  "TravelDocument": [
   {
    "@type": "TravelDocumentDetail",
    "docNumber": "A11111",
    "docType": "Passport",
    "expireDate": "12312027",
    "issueCountry": "US",
    "birthDate": "",
    "Gender": "Male",
    "PersonName": {
     "@type": "PersonName",
     "Given": "Sailor",
     "Surname": "Guy"
    }
   }
  ],
  "Comments": {
   "@type": "Comments",
   "Comment": [
    {
     "@type": "Comment",
     "id": "Vesselnformation",
     "name": "NDCBOAT",
     "value": "FR"
    }
   ]
  }
 }
}
```

### Block 7

```
{
 "PrimaryContactResponse": {
  "@type": "PrimaryContactResponse"
 }
}
```

### Block 8

```
{
 "PrimaryContact": {
  "shareWithSupplier": [
   "YY"
  ],
  "Email": {
   "value": "testEmail@test.com"
  },
  "Telephone": {
   "@type": "Telephone",
   "role": "Mobile",
   "phoneNumber": "581478"
  },
  "TravelerIdentifier": {
   "Identifier": {
    "value": "75985d72-eb3b-4e33-9699-7c29f8b2766c"
   }
  }
 }
}
```

### Block 9

```
{
    "PrimaryContact": {
        "shareWithSupplier":["YY"],
        "shareWith":"Supplier",    }
}
```

### Block 10

```
{
 "SpecialServiceListRequest": {
  "SpecialServiceID": [
   {
    "@type": "SpecialService",
    "id": "specialService_1",
    "Identifier": {
     "value": "d1699847-8dc1-4016-a32f-281c6d4da953"
    },
    "AppliesTo": {
     "@type": "AppliesToOffer",
     "OfferIdentifier": [
      {
       "id": "offer_1",
       "offerRef": "offer_1",
       "Identifier": {
        "authority": "Travelport",
        "value": "o1"
       }
      }
     ]
    },
    "TravelerIdentifier": {
     "Identifier": {
      "value": "trav_2"
     }
    },
    "SSRCode": "UMNR"
    "FreeText": "SR LANG AY-ENGLISH/Test/Kumar/M"
   }
  ]
 }
}
```

### Block 11

```
{
 "SpecialServiceListResponse": {
  "@type": "SpecialServiceListResponse",
  "Identifier": {
   "value": "138f269e-f114-4ce5-ae81-3ac540ba2d54"
  }
 }
}
```

### Block 12

```
{
 "SpecialServiceQueryDeleteMultiple": {
  "SpecialServiceID": [
   "e09948b4-ef08-41b2-935b-9b7bb63e2bbe",
   "5bbd3c60-fa00-4187-abb2-a6bc42dbc1c9"
  ]
 }
}
```

### Block 13

```
{
  "SpecialServiceListResponse": {
    "@type": "SpecialServiceListResponse",
    "Identifier": {
      "value": "eb5f3558-51a1-4ff8-a04a-e216809ae4cc"
    }
  }
}
```

### Block 14

```
{
  "SpecialServiceListRequest": {
    "SpecialServiceID": [
      {
        "@type": "SpecialServiceBlind",
        "blindAssistanceRequestedInd": true,
        "id": "specialService_1",
        "Identifier": {
          "authority": "Travelport",
          "value": "A0656EFF-FAF4-456F-B061-0161008D7C4E"
        },
        "TravelerIdentifier": {
          "id": "trav_1",
          "Identifier": {
            "authority": "Travelport",
            "value": "5250500b-51ab-4f79-82bc-494753114b74"
          }
        }
      }
    ]
  }
}
```

### Block 15

```
{
  "SpecialServiceListRequest": {
    "SpecialServiceID": [
      {
        "@type": "SpecialServiceMeal",
        "id": "specialService_1",
        "Identifier": {
          "authority": "Travelport",
          "value": "A0656EFF-FAF4-456F-B061-0161008D7C4E"
        },
        "AppliesTo": {
          "@type": "AppliesToOffer",
          "OfferIdentifier": [
            {
              "id": "o0",
              "offerRef": "o0",
              "Identifier": {
                "authority": "AA",
                "value": "UG9QMURGNDY4ODgtNzAyMS00QTI0LTLTEtMXxBQQ=="
              }
            }
          ]
        },
        "TravelerIdentifier": {
          "id": "trav_1",
          "Identifier": {
            "value": "5ef113cc-3b08-45b4-9e97-7393a1b7e6d4"
          }
        },
        "SpecialMealTypeEnum": "FruitPlatter"
      },
      {
        "@type": "SpecialServiceMeal",
        "id": "specialService_2",
        "Identifier": {
          "authority": "Travelport",
          "value": "A0656EFF-FAF4-456F-BBBB-0161008D7C4E"
        },
        "AppliesTo": {
          "@type": "AppliesToOffer",
          "OfferIdentifier": [
            {
              "id": "o0",
              "offerRef": "o0",
              "Identifier": {
                "authority": "AA",
                "value": "UG9QMURGNDY4ODgtNzAyMS00QTI0LTl5REM3LTEtMXxBQQ=="
              }
            }
          ]
        },
        "TravelerIdentifier": {
          "id": "trav_2",
          "Identifier": {
            "value": "6b20f372-4ea4-48b2-9dc1-d22a5f184c2f"
          }
        },
        "SpecialMealTypeEnum": "VegetarianLactoOvo"
      }
    ]
  }
}
```

### Block 16

```
{
 "DocumentOverridesResponse": {
  "Identifier": {
   "authority": "Travelport",
   "value": "003865ac-9186-4323-b046-811411803dfa"
  }
 }
}
```

### Block 17

```
{
  "DocumentOverrides": {
    "id": "documentOverrides_1",
    "DocumentOverridesRef": "documentOverrides_1",
    "Commissions": [
      {
        "Commission": {
          "@type": "CommissionAmount",
          "Amount": {
            "code": "USD",
            "value": 123
          }
        }
      }
    ],
    "TourCodes": [
      {
        "TourCode": {
          "tourCodeType": "Bulk Tour",
          "value": "TCS"
        }
      }
    ],
    "Restrictions": [
      {
        "Restriction": [
          "NON Refundable"
        ]
      }
    ],
    "DestinationPurpose": [
      {
        "purpose": "Business",
        "destination": "Europe"
      }
    ]
  }
}
```

### Block 18

```
{
    "DocumentOverrides": {
        "id": "documentOverrides_1",
        "DocumentOverridesRef": "documentOverrides_1",
        "Commissions": [
            {
                "TravelerIdentifierRef": [
                    {
                        "id": "trav_1"
                       
                    }
                ],
                "Commission": {
                    "@type": "CommissionAmount",
                    "Amount": {
                        "code": "USD",
                        "value": 205.66
                    }
                }
            }
        ]
    }
}
```

### Block 19

```
{
 "DocumentOverrides": {
  "id": "documentOverrides_1",
  "DocumentOverridesRef": "documentOverrides_1",
  "ChangeFeeCollectionMethod": {
   "extension": "Other_Value",
   "code": "D",
   "subCode": "997",
   "description": "REBOOKING",
   "value": "EMD",
   "taxIncludedInBaseAmountInd": true
  }
 }
}
```

### Block 20

```
{
  "DocumentOverrides" : {
    "@type" : "DocumentOverrides",
    "id" : "documentOverrides_1",
    "DocumentOverridesRef" : "documentOverrides_1",
      }
    } ],
    "ChangeFeeCollectionMethod" : {
      "extension" : "Other_Value",
      "code" : "OA", 
      "description" : "REBOOKING FEE",
      "value" : "Tax"
    }
  }
}
```

### Block 21

```
{
 "DocumentOverrides": {
  "id": "documentOverrides_1",
  "DocumentOverridesRef": "documentOverrides_1",
  "Restrictions": [
   {
    "Restriction": [
     "NON Refundable"
    ],
    "DocumentType": {
     "value": "EMD"
    }
   }
  ]
 }
}
```

### Block 22

```
{
  "DocumentOverrides": {
    "id": "documentOverrides_1",
    "DocumentOverridesRef": "documentOverrides_1",
    "Commissions": [
      {
        "ApplyTo": "Fee",
        "Commission": {
          "@type": "CommissionAmount",
          "Amount": {
            "code": "USD",
            "value": "5"
          }
        }
      },
      {
        "ApplyTo": "Base",
        "Commission": {
          "@type": "CommissionAmount",
          "Amount": {
            "code": "USD",
            "value": "10"
          }
        }
      }
    ]
  }
}
```

### Block 23

```
{
    "DocumentOverrides": {
        "id": "documentOverrides_1",
        "DocumentOverridesRef": "documentOverrides_1",
        "TicketDesignator": "AB123"
    }
}
```

### Block 24

```
{
 "DocumentOverrides": {
  "@type": "DocumentOverrides",
  "id": "documentOverrides_1",
  "DocumentOverridesRef": "documentOverrides_1",
  "residualValueAsEvenExchangeMIRInd": true
 }
}
```

### Block 25

```
{
    "AccountingResponse": {
        "Accounting": {
            "@type": "AccountingID",
            "Identifier": {
                "authority": "Travelport",
                "value": "9658ae33-c031-42d6-9035-69bf0b38ca8d"
            }
        }
    }
}
```

### Block 26

```
{
 "Accounting": {
  "id": "accounting_1",
  "dataType": "DOCI",
  "AccountingRef": "accounting_1",
  "NameValuePair": [
   {
    "value": "documentInvoice.INV 41641463345",
    "name": "FT"
   },
   {
    "value": "offerNumber.PTR 41641463345",
    "name": "FT"
   },
   {
    "value": "Commission.CMM 0/3.6",
    "name": "FT"
   }
  ]

No
```

### Block 27

```
"Accounting": {
                "@type": "Accounting",
                "dataType": "DOCI",
                "id": "Accounting_1",
                "Identifier": {
                    "authority": "Travelport",
                    "value": "8d92d4ea-0d97-4319-9f6b-fd7f9604da5a"
                },
                "NameValuePair": [
                    {
                        "id": "ActComment_1",
                        "name": "AC",
                        "value": "A53.IBM213.JAMES"
                    },
                    {
                        "id": "ActComment_2",
                        "name": "TK",
                        "value": "2040805184"
                    },
                    {
                        "id": "ActComment_3",
                        "name": "FT",
                        "value": "offerNumber.PTR 41641463345"
                    }
                ]
            }
        }
    }
}
```

### Block 28

```
{
  "Accounting": {
    "@type": "Accounting",
    "id": "accounting_1",
    "AccountingRef": "accounting_1",
    "NameValuePair": [
      {
        "name": "QF",
        "value": "ACCOUNTING REMARKS TESTING"
      },
      {
        "name": "UA",
        "value": "FREETEXT REMARKS TESTING"
      },
      {
        "name": "H*",
        "value": "H remark"
      },
      {
        "name": "FT",
        "value": "Added name FT for acntng rematks testing"
      }
    ]
  }
}
```

### Block 29

```
"Accounting": {
                "@type": "Accounting",
                "id": "Accounting_1",
                "Identifier": {
                    "authority": "Travelport",
                    "value": "89cc8a38-e107-42bd-a4a7-eed4e7b0259d"
                },
                "NameValuePair": [
                    {
                        "id": "GenComment_4",
                        "name": "QF",
                        "value": "ACCOUNTING REMARKS TESTING"
                    },
                    {
                        "id": "GenComment_5",
                        "name": "UA",
                        "value": "FREETEXT REMARKS TESTING"
                    },
                    {
                        "id": "GenComment_6",
                        "name": "H*",
                        "value": "H remark"
                    },
                    {
                        "id": "GenComment_7",
                        "name": "FT",
                        "value": "Added name FT for acntng rematks testing"
                    }
                ]
            }
        }
```

### Block 30

```
{
    "ReservationCommentListResponse": {
        "@type": "ReservationCommentListResponse"
    }
}
```

### Block 31

```
{
    "ReservationCommentListRequest": {
        "ReservationCommentID": [
            {
                "@type": "ReservationComment",
                "id": "ReservationComment_1",
                "commentSource": "Agency",
                "shareWith": "Supplier",
                "shareWithSupplier": [
                    "UA"
                ],
                "Comment": [
                    {
                        "name": "OSI Remarks",
                        "value": "ADDING OSI REMARK FOR AIRLINE"
                    }
                ]
            }
        ]
    }
}
```

### Block 32

```
{
                    "@type": "ReservationComment",
                    "commentSource": "Agency",
                    "shareWith": "Supplier",
                    "shareWithSupplier": [
                        "UA"
                    ],
                    "id": "RSRVComment_2",
                    "Comment": [
                        {
                            "id": "SinComment_1",
                            "name": "OSI Remarks",
                            "language": "EN",
                            "value": "ADDING OSI REMARK FOR AIRLINE"
                        }
                    ]
                },
```

### Block 33

```
{
    "ReservationCommentListRequest": {
        "ReservationCommentID": [
            {
                "@type": "ReservationComment",
                "commentSource": "Agency",
                "shareWith": "Agency",
                "Comment": [
                    {
                        "name": "QF",
                        "value": "QF 674 E 09JUN ADLMEL HS2 0905 1055"
                    },
                    {
                        "name": "HG",
                        "value": "Historical Notepad Remark"
                    }
                ]
            }
        ]
    }
}
```

### Block 34

```
{
                    "@type": "ReservationComment",
                    "commentSource": "Agency",
                    "shareWith": "Agency",
                    "Comment": [
                        {
                            "name": "QF",
                            "value": "QF 674 E 09JUN ADLMEL HS2 0905 1055"
                        },
                        {
                            "name": "HG",
                            "value": "Historical Notepad Remark"
                        }
                    ]
                },
```

### Block 35

```
{ 
    "ReservationCommentListRequest": {
        "ReservationCommentID": [ 
            { 
                "@type": "ReservationComment", 
                "commentSource": "Agency", 
                "shareWith": "Agency",
                "Comment": [ 
                    {
                        "name": "HR", 
                        "value": "RESIDENT DN/12345678Z/410917//P2//"
                    }
                ]
            }
        ]
    }
}
```

### Block 36

```
{
 "ReservationCommentListRequest": {
  "ReservationCommentID": [
   {
    "@type": "ReservationComment",
    "commentSource": "Agency",
    "shareWith": "Agency",
    "id": "RSRVComment_1",
    "Comment": [
     {
      "name": "HR",
      "value": "RESIDENT DN/101/380201//P1//"
     },
     {
      "name": "HR",
      "value": "SARA ORTEGA SMITH/MOLINA/FRANCISCO JAVIER//P1//"
     }
    ]
   }
  ]
 }
}
```

### Block 37

```
"ReservationCommentListRequest": {
        "ReservationCommentID": [
            {
                "@type": "ReservationComment",
                "id": "reservationComment_1",
                "commentSource": "Supplier",
                "shareWith": "Agency",
                "shareWithSupplier": [
                    "QF"
                ],
                "Comment": [
                    {
                        "id": "comment_1",
                        "name": "Vendor Remarks",
                        "language": "EN",
                        "value": "VendorTest"
                    }
                ]
            }
        ]
    }
}
```

### Block 38

```
"ReservationComment": [

                {
                    "@type": "ReservationComment",
                    "commentSource": "Supplier",
                    "shareWithSupplier": [
                        "YY"
                    ],
                    "id": "RSRVComment_1",
                    "Comment": [
                        {
                            "id": "VeoComment_1",
                            "value": "VENDORTEST"
                        }
                    ]
                },
                {
                    "@type": "ReservationComment",
                    "commentSource": "Supplier",
                    "shareWithSupplier": [
                        "QF"
                    ],
                    "id": "RSRVComment_2",
                    "Comment": [
                        {
                            "id": "VeiComment_2",
                            "value": "MISSING SSR CTCM MOBILE OR SSR CTCE EMAIL OR SSR CTCR NON-CONSENT FOR QF"
                        }
                    ]
                },
                {
                    "@type": "ReservationComment",
                    "commentSource": "Agency",
                    "shareWith": "Supplier",
                    "shareWithSupplier": [
                        "YY"
                    ],
                    "id": "RSRVComment_3",
                    "Comment": [
                        {
                            "id": "SinComment_1",
                            "name": "OSI Remarks",
                            "language": "EN",
                            "value": "THIS IS OSI REMARK"
                        }
                    ]
                },
                {
                    "@type": "ReservationComment",
                    "commentSource": "Agency",
                    "id": "RSRVComment_4",
                    "Comment": [
                        {
                            "id": "GenComment_1",
                            "name": "QF",
                            "value": "QF 674 E 09JUN ADLMEL HS2 0905 1055"
                        },
                        {
                            "id": "GenComment_2",
                            "name": "HG",
                            "value": "Historical Notepad Remark"
                        }
                    ]
                },
                {
                    "@type": "ReservationComment",
                    "id": "RSRVComment_5",
                    "Comment": [
                        {
                            "id": "ItuComment_2",
                            "name": "ITIN COMMENTS",
                            "value": "Itinerary Unassociated Remarks Addition"
                        }
                    ]
                },
                {
                    "@type": "ReservationComment",
                    "id": "RSRVComment_6",
                    "Comment": [
                        {
                            "id": "ItaComment_1",
                            "name": "ITIN COMMENTS",
                            "value": "THIS IS SINGLE COMMENT WITH SINGLE PRODUCT 1"
                        }
                    ],
                    "AppliesTo": [
                        {
                            "@type": "AppliesToOfferProductSegment",
                            "OfferIdentifier": {},
                            "ProductIdentifier": {
                                "productRef": "product_1"
                            },
                            "SegmentSequenceList": [
                                1
                            ]
                        }
                    ]
                }
            ],
            "ReservationDisplaySequence": {
                "@type": "ReservationDisplaySequence",
                "DisplaySequence": [
                    {
                        "@type": "DisplaySequence",
                        "displaySequence": 1,
                        "OfferRef": "offer_1",
                        "ProductRef": "product_1",
                        "Sequence": 1
                    }
                ]
            },
            "Accounting": {
                "@type": "Accounting",
                "id": "Accounting_1",
                "Identifier": {
                    "authority": "Travelport",
                    "value": "001700f5-7830-4cb1-b98c-8810525c64bc"
                },
                "NameValuePair": [
                    {
                        "id": "GenComment_6",
                        "name": "UA",
                        "value": "FREETEXT REMARKS TESTING"
                    },
                    {
                        "id": "GenComment_7",
                        "name": "H*",
                        "value": "H remark"
                    },
                    {
                        "id": "GenComment_8",
                        "name": "FT",
                        "value": "Added name FT for acntng rematks testing"
                    }
                ]
            }
        }
    }
}
```

### Block 39

```
{
    "ReservationCommentListRequest": {
        "ReservationCommentID": [
            {
                "@type": "ReservationComment",
                "commentSource": "Agency",
                "shareWith": "Traveler",
                "Comment": [
                    {
                        "name": "ITIN COMMENTS",
                        "value": "This remarks has single offer with all segments"
                    }
                ],
                "AppliesTo": [
                    {
                        "@type": "AppliesToOffer",
                        "OfferIdentifier": [
                            {
                                "Identifier": {
                                    "authority": "Travelport",
                                    "value": "9658ae33-c031-42d6-9035-69bf0b38ca8d"
                                }
                            }
                        ]
                    }
                ]
            }
        ]
    }
}
```

### Block 40

```
{
    "ReservationCommentListRequest": {
        "ReservationCommentID": [
            {
                "@type": "ReservationComment",
                "commentSource": "Agency",
                "shareWith": "Traveler",
                "Comment": [
                    {
                        "name": "ITIN COMMENTS",
                        "value": "This is single comment with single product 1"
                    }
                ],
                "AppliesTo": [
                    {
                        "@type": "AppliesToOfferProduct",
                        "OfferIdentifier": {
                            "Identifier": {
                                "authority": "Travelport",
                                "value": "ef30b4cf-951a-400d-87f0-8691bc6056ce"
                            }
                        },
                        "ProductIdentifier": [
                            {
                                "Identifier": {
                                    "authority": "Travelport",
                                    "value": "0a2692dc-1c94-4e12-bef0-06772cf45f65"
                                }
                            }
                        ]
                    }
                ]
            }
        ]
    }
}
```

### Block 41

```
{
    "ReservationCommentListRequest": {
        "ReservationCommentID": [
            {
                "@type": "ReservationComment",
                "commentSource": "Agency",
                "shareWith": "Traveler",
                "Comment": [
                    {
                        "name": "ITIN COMMENTS",
                        "value": "Testing single ITIN associated remarks -segment"
                    }
                ],
                "AppliesTo": [
                    {
                        "@type": "AppliesToOfferProductSegment",
                        "OfferIdentifier": {
                            "Identifier": {
                                "authority": "Travelport",
                                "value": "feedba3d-51ec-4175-9f1a-d05efed57aa9"
                            }
                        },
                        "ProductIdentifier": {
                            "Identifier": {
                                "authority": "Travelport",
                                "value": "0a2692dc-1c94-4e12-bef0-06772cf45f65"
                            }
                        },
                        "SegmentSequenceList": [
                            1
                        ]
                    }
                ]
            }
        ]
    }
}
```

### Block 42

```
{
                    "@type": "ReservationComment",
                    "commentSource": "Agency",
                    "shareWith": "Traveler",
                    "Comment": [
                        {
                            "name": "ITIN COMMENTS",
                            "value": "TESTING SINGLE ITIN ASSOCIATED REMARKS -SEGMENT"
                        }
                    ],
                    "AppliesTo": [
                        {
                            "@type": "AppliesToOfferProductSegment",
                            "OfferIdentifier": {
                                "offerRef": "offer_1"
                            },
                            "ProductIdentifier": {
                                "productRef": "product_1"
                            },
                            "SegmentSequenceList": [
                                1
                            ]
                        }
                    ]
                }
```

### Block 43

```
{
    "ReservationCommentListRequest": {
        "ReservationCommentID": [
            {
                "@type": "ReservationComment",
                "commentSource": "Agency",
                "shareWith": "Traveler",
                "Comment": [
                    {
                        "name": "ITIN COMMENTS",
                        "value": "Testing ITIN UnAsso remarks one"
                    }
                ]
            }
        ]
    }
}
```

### Block 44

```
{
                    "@type": "ReservationComment",
                    "Comment": [
                        {
                            "name": "ITIN COMMENTS",
                            "value": "Testing ITIN UnAsso remarks one"
                        }
                    ]
                },
```

### Block 45

```
{
    "OfferQueryBuildFromProducts": {
        "returnBrandedFaresInd": true,
        "BuildFromProductsRequest": {
            "@type": "BuildFromProductsRequestAir",
            "PricingModifiersAir": {
                "@type": "PricingModifiersAirDetail",
                "currencyCode": "AUD",
                "FareSelection": {
                    "@type": "FareSelectionDetail",
                    "fareType": "PublicAndPrivateFares"
                },
                "Brand": {
                    "@type": "BrandSummary"
                },
                "OrganizationInformation": {
                    "GSTRegistrationNumber": [
                        {
                            "country": "IND",
                            "address": "2240 RMILLS COMP//MUMBAI/MAHARAHTRA",
                            "companyName": "GTTY",
                            "email": "GST.INFO@IBMGST.IN",
                            "telephone": "9103555559023",
                            "value": "22AAAAA0000A1Z5"
                        }
                    ]
                }
            },
            "PassengerCriteria": [
                {
                    "number": 1,
                    "age": 25,
                    "passengerTypeCode": "ADT"
                }
            ],
            "ProductCriteriaAir": [
                {
                    "SpecificFlightCriteria": [
                        {
                            "flightNumber": "52",
                            "carrier": "CI",
                            "departureDate": "2020-07-21",
                            "departureTime": "22:10:00",
                            "arrivalDate": "2020-07-22",
                            "arrivalTime": "05:40:00",
                            "from": "SYD",
                            "to": "TPE",
                            "classOfService": "N",
                            "cabin": "Economy",
                            "segmentSequence": 1
                        },
                        {
                            "flightNumber": "903",
                            "carrier": "CI",
                            "departureDate": "2020-07-22",
                            "departureTime": "08:10:00",
                            "arrivalDate": "2020-07-22",
                            "arrivalTime": "10:05:00",
                            "from": "TPE",
                            "to": "HKG",
                            "classOfService": "N",
                            "cabin": "Economy",
                            "segmentSequence": 2
                        }
                    ]
                }
            ]
        }
    }
}
```

