# جرد تكامل Travelport JSON Air v11

عدد النقاط: **67** (من صفوف جداول `AirEndpointsList11.html`).

| # | Method | Path | base | مراجع كود (بحث نصي) |
|---:|---|---|---|---|
| 1 | POST | `11/air/ancillaryprice/offers/buildancillaryoffersfromcatalogofferings` | 11_AIR | `erxes/backend/plugins/tourism_api/src/providers/travelport/air/airBookingAdapter.ts`, `erxes/backend/plugins/tourism_api/src/providers/travelport/air/travelportPostBookingWorkbench.ts` |
| 2 | POST | `11/air/ancillaryshop/catalogofferingsancillaries` | 11_AIR | `erxes/backend/plugins/tourism_api/src/providers/travelport/air/airAdapter.ts`, `erxes/backend/plugins/tourism_api/src/providers/travelport/air/travelportAncillaryShopBodies.ts`, `erxes/backend/plugins/tourism_api/src/providers/travelport/air/travelportPostBookingWorkbench.ts` |
| 3 | POST | `11/air/book/accounting/reservationworkbench/{workbenchID}/accountings` | 11_AIR | — |
| 4 | POST | `11/air/book/airoffer/reservationworkbench/{workbenchID}/offers/buildancillaryoffersfromcatalogofferings` | 11_AIR | — |
| 5 | POST | `11/air/book/airoffer/reservationworkbench/{workbenchID}/offers/buildfromcatalogofferings` | 11_AIR | — |
| 6 | POST | `11/air/book/airoffer/reservationworkbench/{workbenchID}/offers/buildfromproducts` | 11_AIR | — |
| 7 | POST | `11/air/book/airoffer/reservationworkbench/{workbenchID}/offers/buildfromunpricedsegments` | 11_AIR | — |
| 8 | POST | `11/air/book/airoffer/reservationworkbench/{workbenchID}/offers/unpricedsegments` | 11_AIR | — |
| 9 | POST | `11/air/book/customrule/customrules/{workbenchID}?RuleRecordName={NAME}` | 11_AIR | — |
| 10 | GET | `11/air/book/customrule/customrules?PCC={PCC}` | 11_AIR | — |
| 11 | DELETE | `11/air/book/customrule/customrules?PCC={PCC}?RuleRecordName={NAME}` | 11_AIR | — |
| 12 | GET | `11/air/book/customrule/customrules?PCC={PCC}?RuleRecordSequence={XYZ}` | 11_AIR | — |
| 13 | POST | `11/air/book/documentoverride/Reservation/{workbenchID}/documentoverrides` | 11_AIR | — |
| 14 | POST | `11/air/book/offer/reservationworkbench/{workbenchID}/offers/buildfromcatalogofferings(addtoBasePathabove)` | 11_AIR | — |
| 15 | POST | `11/air/book/primarycontact/reservationworkbench/{workbenchID}/primarycontacts` | 11_AIR | — |
| 16 | DELETE | `11/air/book/primarycontact/reservationworkbench/{workbenchID}/primarycontacts/{PrimaryContactID}` | 11_AIR | — |
| 17 | POST | `11/air/book/profile/reservationworkbench/workbenchID}/clientprofile` | 11_AIR | — |
| 18 | POST | `11/air/book/remarks/reservationworkbench/{workbenchID}/reservationcomments/list` | 11_AIR | — |
| 19 | POST | `11/air/book/reservation/reservations/divide` | 11_AIR | — |
| 20 | GET | `11/air/book/reservation/reservations/{LocatorCode}` | 11_AIR | — |
| 21 | POST | `11/air/book/reservation/reservations/{workbenchID}` | 11_AIR | `erxes/backend/plugins/tourism_api/src/providers/travelport/air/airBookingAdapter.ts`, `erxes/backend/plugins/tourism_api/src/providers/travelport/air/travelportPostBookingWorkbench.ts` |
| 22 | POST | `11/air/book/reservationworkbench/{workbenchID]}/reservations/cancelitemsThebasepathvariesfrommostJSONAPIsanddoesnotuse/air` | 11_AIR | — |
| 23 | POST | `11/air/book/session/reservationworkbench` | 11_AIR | `erxes/backend/plugins/tourism_api/src/providers/travelport/air/airBookingAdapter.ts`, `erxes/backend/plugins/tourism_api/src/providers/travelport/air/travelportPostBookingWorkbench.ts` |
| 24 | POST | `11/air/book/session/reservationworkbench/buildfromlocator?Locator={LocatorCode}` | 11_AIR | `erxes/backend/plugins/tourism_api/src/providers/travelport/air/travelportPostBookingWorkbench.ts` |
| 25 | DELETE | `11/air/book/session/reservationworkbench/{workbenchID}` | 11_AIR | `erxes/backend/plugins/tourism_api/src/providers/travelport/air/travelportPostBookingWorkbench.ts` |
| 26 | GET | `11/air/book/session/reservationworkbench/{workbenchID}` | 11_AIR | `erxes/backend/plugins/tourism_api/src/providers/travelport/air/travelportPostBookingWorkbench.ts` |
| 27 | DELETE | `11/air/book/specialservices/reservationworkbench/{workbenchID}/specialservices/deletemultiple` | 11_AIR | — |
| 28 | POST | `11/air/book/specialservices/reservationworkbench/{workbenchID}/specialservices/list` | 11_AIR | — |
| 29 | DELETE | `11/air/book/specialservices/reservationworkbench/{workbenchID}/specialservices/{SpecialServiceID}` | 11_AIR | — |
| 30 | POST | `11/air/book/traveler/reservationworkbench/{workbenchID}/travelers` | 11_AIR | — |
| 31 | POST | `11/air/book/traveler/reservationworkbench/{workbenchID}/travelers/list` | 11_AIR | — |
| 32 | PUT | `11/air/book/traveler/reservationworkbench/{workbenchID}/travelers/updatefromtravelerupdateditems/{TravelerID}` | 11_AIR | — |
| 33 | POST | `11/air/book/updatableItem/reservationworkbench{workbenchID}/travelerupdatableitems/buildfromtraveler` | 11_AIR | — |
| 34 | POST | `11/air/catalog/search/catalogproductofferings/buildnext` | 11_AIR | `erxes/backend/plugins/tourism_api/src/providers/travelport/air/travelportAirFollowup.ts` |
| 35 | POST | `11/air/catalog/search/catalogproductofferings/buildoptionsWhensendingaPremiumFlexfullpayloadrequest,usetheendpointcatalog/search/catalogproductofferings/buildpremiumflexoptions` | 11_AIR | — |
| 36 | POST | `11/air/catalog/search/catalogproductofferingsWhensendingaflexsearchrequest,append/premiumflextotheendpointabove` | 11_AIR | — |
| 37 | POST | `11/air/eligibility/ticketchangeeligibilitiesThebasepathvariesfromotherJSONAirAPIsanddoesnotuse/airattheend.` | 11_AIR | — |
| 38 | GET | `11/air/emds/{EMDNumber}` | 11_AIR | — |
| 39 | PUT | `11/air/emds/{EMDNumber}` | 11_AIR | — |
| 40 | POST | `11/air/faredisplay/fares` | 11_AIR | `erxes/backend/plugins/tourism_api/src/providers/travelport/air/travelportAirFollowup.ts` |
| 41 | GET | `11/air/farerule/farerules` | 11_AIR | `erxes/backend/plugins/tourism_api/src/providers/travelport/air/travelportAirFollowup.ts`, `erxes/backend/plugins/tourism_api/tests/travelportAirFollowup.test.ts` |
| 42 | POST | `11/air/payment/reservationworkbench/{workbenchID}/formofpayment` | 11_AIR | — |
| 43 | DELETE | `11/air/payment/reservationworkbench/{workbenchID}/formofpayment/{FormOfPayment_Identifier}` | 11_AIR | — |
| 44 | PUT | `11/air/payment/reservationworkbench/{workbenchID}/formofpayment/{FormOfPayment_Identifier}` | 11_AIR | — |
| 45 | POST | `11/air/paymentoffer/reservationworkbench/{workbenchID}/payments` | 11_AIR | — |
| 46 | POST | `11/air/paymentoffer/reservationworkbench/{workbenchID}/payments/{paymentID}` | 11_AIR | — |
| 47 | POST | `11/air/price/offers/buildfromcatalogproductofferings` | 11_AIR | `erxes/backend/plugins/tourism_api/src/providers/travelport/air/travelportAirFollowup.ts` |
| 48 | POST | `11/air/price/offers/buildfromproducts` | 11_AIR | `erxes/backend/plugins/tourism_api/src/providers/travelport/air/travelportAirFollowup.ts` |
| 49 | POST | `11/air/receipt/reservation/{workbenchID}/receipts?OfferIdentifier={OfferID}` | 11_AIR | — |
| 50 | GET | `11/air/receipt/reservations/{LocatorCode}/receipts` | 11_AIR | — |
| 51 | POST | `11/air/receipt/reservations/{LocatorCode}/receipts` | 11_AIR | — |
| 52 | POST | `11/air/search/airAvailability` | 11_AIR | — |
| 53 | POST | `11/air/search/seat/catalogofferingsancillaries/seatavailabilities` | 11_AIR | `erxes/backend/plugins/tourism_api/src/providers/travelport/air/airAdapter.ts`, `erxes/backend/plugins/tourism_api/src/providers/travelport/air/airBookingAdapter.ts` |
| 54 | POST | `11/air/ticket/tickets/getbylocator` | 11_AIR | — |
| 55 | PUT | `11/air/ticket/tickets/updatestatus/{ticketID}` | 11_AIR | — |
| 56 | GET | `11/air/ticket/tickets/{ticketID}` | 11_AIR | — |
| 57 | POST | `11/air/ticket/travelagency/reservationworkbench/{workbenchID}/travelagency` | 11_AIR | — |
| 58 | POST | `11/air/ticket/travelagency/reservationworkbench/{workbenchID}/travelagency/addcorporatecodePUTticket/travelagency/reservationworkbench/{workbenchID}/travelagency/{travelagencyID}/updatecorporatecodeDELticket/travelagency/reservationworkbench/{workbenchID}/travelagency/{travelagencyID}/deletecorporatecode` | 11_AIR | — |
| 59 | POST | `11/air/ticket/travelagency/reservationworkbench/{workbenchID}/travelagency/{travelagencyID}/addemailPUTticket/travelagency/reservationworkbench/{workbenchID}/travelagency/{travelagencyID}/updateemailDELticket/travelagency/reservationworkbench/{workbenchID}/travelagency/{travelagencyID}/deleteemail/{emailID}` | 11_AIR | — |
| 60 | POST | `11/air/ticket/travelagency/reservationworkbench/{workbenchID}/travelagency/{travelagencyID}/addtelephonePUTticket/travelagency/reservationworkbench/{workbenchID}/travelagency/{travelagencyID}/updatetelephoneDELticket/travelagency/reservationworkbench/{workbenchID}/travelagency/{travelagencyID}/deletetelephone/{telephoneID}` | 11_AIR | — |
| 61 | POST | `11/air/ticket/travelagency/reservationworkbench/{workbenchID}/travelagency/{travelagencyID}/updateaddressPUTticket/travelagency/reservationworkbench/{workbenchID}/travelagency/{travelagencyID}/updateaddressDELticket/travelagency/reservationworkbench/{workbenchID}/travelagency/{travelagencyID}/deleteaddress{addressID}` | 11_AIR | — |
| 62 | GET | `11/documents/documentlist/{LocatorCode}ThebasepathvariesfrommostJSONAPIsanddoesnotuse/air` | NON_AIR_BASE | — |
| 63 | POST | `11/documents/historyThebasepathvariesfrommostJSONAPIsanddoesnotuse/air` | NON_AIR_BASE | — |
| 64 | POST | `11/documents/voidThebasepathvariesfromotherJSONAirAPIsanddoesnotuse/air.` | NON_AIR_BASE | — |
| 65 | POST | `11/exchangesearch/catalogofferingsairchangeThebasepathvariesfromotherJSONAirAPIsanddoesnotuse/airattheend.` | NON_AIR_BASE | — |
| 66 | POST | `11/queue/queue/list` | NON_AIR_BASE | `erxes/backend/plugins/tourism_api/src/providers/travelport/air/travelportNonAirEndpoints.ts` |
| 67 | POST | `11/queue/queue/remove` | NON_AIR_BASE | `erxes/backend/plugins/tourism_api/src/providers/travelport/air/travelportNonAirEndpoints.ts` |

## APIRef
- `docs/travelport/travelport api guide/travelport-airapi json/support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/Ancillaries/APIRef_AncillaryBook.html`
- `docs/travelport/travelport api guide/travelport-airapi json/support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/Ancillaries/APIRef_AncillaryPrice.html`
- `docs/travelport/travelport api guide/travelport-airapi json/support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/Ancillaries/APIRef_AncillaryShop.html`
- `docs/travelport/travelport api guide/travelport-airapi json/support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/Ancillaries/APIRef_EMDDisplay.html`
- `docs/travelport/travelport api guide/travelport-airapi json/support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/Ancillaries/APIRef_EMDVoid.html`
- `docs/travelport/travelport api guide/travelport-airapi json/support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/Book/APIRef_AddOfferFullPayload.html`
- `docs/travelport/travelport api guide/travelport-airapi json/support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/Book/APIRef_AddOfferRefPayload.html`
- `docs/travelport/travelport api guide/travelport-airapi json/support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/Book/APIRef_AutoPrice-ManualFare.html`
- `docs/travelport/travelport api guide/travelport-airapi json/support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/Book/APIRef_DocumentHistory.html`
- `docs/travelport/travelport api guide/travelport-airapi json/support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/Book/APIRef_DocumentList.html`
- `docs/travelport/travelport api guide/travelport-airapi json/support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/Book/APIRef_HostProfileMove.html`
- `docs/travelport/travelport api guide/travelport-airapi json/support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/Book/APIRef_ReservationCancelGDS.html`
- `docs/travelport/travelport api guide/travelport-airapi json/support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/Book/APIRef_ReservationDivide.html`
- `docs/travelport/travelport api guide/travelport-airapi json/support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/Book/APIRef_ReservationRetrieve.html`
- `docs/travelport/travelport api guide/travelport-airapi json/support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/Book/APIRef_TravelerAdd.html`
- `docs/travelport/travelport api guide/travelport-airapi json/support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/Book/APIRef_TravelerUpdatableItems.html`
- `docs/travelport/travelport api guide/travelport-airapi json/support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/Book/APIRef_TravelerUpdate.html`
- `docs/travelport/travelport api guide/travelport-airapi json/support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/Book/APIRef_UnpricedSegment.html`
- `docs/travelport/travelport api guide/travelport-airapi json/support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/Book/TravelAgency/APIRef_TravelAgencyAddress.html`
- `docs/travelport/travelport api guide/travelport-airapi json/support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/Book/TravelAgency/APIRef_TravelAgencyCorpID.html`
- `docs/travelport/travelport api guide/travelport-airapi json/support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/Book/TravelAgency/APIRef_TravelAgencyDetails.html`
- `docs/travelport/travelport api guide/travelport-airapi json/support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/Book/TravelAgency/APIRef_TravelAgencyEmail.html`
- `docs/travelport/travelport api guide/travelport-airapi json/support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/Book/TravelAgency/APIRef_TravelAgencyTelephone.html`
- `docs/travelport/travelport api guide/travelport-airapi json/support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/GDSExchangesRefunds/APIRef_AddModifyOfferReferencePayload.html`
- `docs/travelport/travelport api guide/travelport-airapi json/support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/GDSExchangesRefunds/APIRef_ExchangeEligibility.html`
- `docs/travelport/travelport api guide/travelport-airapi json/support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/GDSExchangesRefunds/APIRef_ExchangeSearch.html`
- `docs/travelport/travelport api guide/travelport-airapi json/support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/NDC/APIRef_Cancel.html`
- `docs/travelport/travelport api guide/travelport-airapi json/support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/NDC/APIRef_CancelPayment.html`
- `docs/travelport/travelport api guide/travelport-airapi json/support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/NDC/APIRef_Modify.html`
- `docs/travelport/travelport api guide/travelport-airapi json/support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/NDC/APIRef_RefundQuote.html`
- `docs/travelport/travelport api guide/travelport-airapi json/support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/NDC/APIRef_Reprice.html`
- `docs/travelport/travelport api guide/travelport-airapi json/support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/NDC/APIRef_Reshop.html`
- `docs/travelport/travelport api guide/travelport-airapi json/support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/NDC/APIRef_StandaloneReprice.html`
- `docs/travelport/travelport api guide/travelport-airapi json/support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/NDC/APIRef_TicketAsFOP.html`
- `docs/travelport/travelport api guide/travelport-airapi json/support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/Price/APIRef_AirPriceFullPayload.html`
- `docs/travelport/travelport api guide/travelport-airapi json/support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/Price/APIRef_AirPriceReferencePayload.html`
- `docs/travelport/travelport api guide/travelport-airapi json/support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/Price/APIRef_FareDisplay.html`
- `docs/travelport/travelport api guide/travelport-airapi json/support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/Price/APIRef_FareRules.html`
- `docs/travelport/travelport api guide/travelport-airapi json/support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/Rules/APIRef_CustomRule.html`
- `docs/travelport/travelport api guide/travelport-airapi json/support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/Search/APIRef_AirAvailability.html`
- `docs/travelport/travelport api guide/travelport-airapi json/support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/Search/APIRef_FlightSpecificFullPayload.html`
- `docs/travelport/travelport api guide/travelport-airapi json/support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/Search/APIRef_FlightSpecificRefPayload.html`
- `docs/travelport/travelport api guide/travelport-airapi json/support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/Search/APIRef_NextLegSearch.html`
- `docs/travelport/travelport api guide/travelport-airapi json/support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/Search/APIRef_Search.html`
- `docs/travelport/travelport api guide/travelport-airapi json/support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/Seats/APIRef_AncillaryCancel.html`
- `docs/travelport/travelport api guide/travelport-airapi json/support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/Seats/APIRef_SeatBook.html`
- `docs/travelport/travelport api guide/travelport-airapi json/support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/Seats/APIRef_SeatMap.html`
- `docs/travelport/travelport api guide/travelport-airapi json/support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/Seats/APIRef_StandaloneSeatMap.html`
- `docs/travelport/travelport api guide/travelport-airapi json/support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/Ticketing/APIRef_AddFOP.html`
- `docs/travelport/travelport api guide/travelport-airapi json/support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/Ticketing/APIRef_AddPayment.html`
- `docs/travelport/travelport api guide/travelport-airapi json/support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/Ticketing/APIRef_BatchVoid.html`
- `docs/travelport/travelport api guide/travelport-airapi json/support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/Ticketing/APIRef_Queue.html`
- `docs/travelport/travelport api guide/travelport-airapi json/support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/Ticketing/APIRef_QueueList.html`
- `docs/travelport/travelport api guide/travelport-airapi json/support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/Ticketing/APIRef_QueueRemove.html`
- `docs/travelport/travelport api guide/travelport-airapi json/support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/Ticketing/APIRef_TicketDisplay_GDS.html`
- `docs/travelport/travelport api guide/travelport-airapi json/support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/Ticketing/APIRef_TicketList.html`
- `docs/travelport/travelport api guide/travelport-airapi json/support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/Ticketing/APIRef_TicketRetrieve.html`
- `docs/travelport/travelport api guide/travelport-airapi json/support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/Ticketing/APIRef_TicketVoidGDS.html`
- `docs/travelport/travelport api guide/travelport-airapi json/support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/Workbench/APIRef_CancelWorkbenchItems.html`
- `docs/travelport/travelport api guide/travelport-airapi json/support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/Workbench/APIRef_WorkbenchCommit.html`
- `docs/travelport/travelport api guide/travelport-airapi json/support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/Workbench/APIRef_WorkbenchDiscard.html`
- `docs/travelport/travelport api guide/travelport-airapi json/support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/Workbench/APIRef_WorkbenchNewCreate.html`
- `docs/travelport/travelport api guide/travelport-airapi json/support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/Workbench/APIRef_WorkbenchPostCreate.html`
- `docs/travelport/travelport api guide/travelport-airapi json/support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/Workbench/APIRef_WorkbenchRetrieve.html`
