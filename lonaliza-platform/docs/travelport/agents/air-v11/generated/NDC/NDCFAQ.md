# NDC FAQs

## Source

- **Local HTML:** `docs/travelport/travelport api guide/travelport-airapi json/support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/NDC/NDCFAQ.html` (UTF-8 mirror)
- **Official base:** `https://support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/` + same relative path

## Plaintext extract (lossy)

NDC FAQs Skip To Main Content Account Settings Logout placeholder Account Settings Logout Filter: All Files Submit Search Filter: All Files Submit Search NDC FAQs These FAQs address questions about NDC in general and how the JSON APIs handle NDC content. They apply to all NDC&#160;content regardless of source unless otherwise specified. For a general discussion of NDC and how it's supported in the JSON APIs see the NDC&#160;Guide . For GDS&#160;and NDC differences in the JSON APIs, see the support tables for seats , ancillaries , fare rules , and exchanges/refunds , and the NDC&#160;and GDS Functionality Comparison . For differences within NDC by individual carriers, see NDC capabilities by airline through JSON API in the Travelport Knowledge Base. See Knowledge Base NDC&#160;Resources if you need login assistance. To access NDC&#160;content you must be provisioned for NDC with Travelport and registered with the NDC&#160;airline. Related Content: NDC&#160;Guide In this topic: NDC&#160;Search and Book NDC&#160;Servicing NDC Reporting and Mid/Back Office Systems NDC for Apollo and Worldspan NDC Search and Book Question Answer Will I be able to search for more than one NDC airline at a time? The JSON APIs search for content for all available and participating carriers for the itinerary as provisioned for your PCC. How will I be advised of a schedule change? The schedule change will fall into the agent's Q11 as it does today in Smartpoint for ATPCO bookings. As the plugin and Smartpoint sync in the same session, there is no specific queue for the plugin. For 1V and 1P users, these will be placed on a queue. The plan is to follow the queue numbers used for GDS bookings queues (i.e., Q11 for 1V and Q7 for 1P). How far in advance can I search for NDC offers? The timeline for advanced search is controlled by each individual carrier. Travelport will support whatever timeline the carrier supports for advanced searching. Where can I see penalty conditions in JSON ? Penalty conditions (change/cancel permitted etc) are returned in Search. Penalty amounts, if applicable to the offer selected, will be returned in Price and Book. This example shows the penalty conditions within the Penalties object of the Price response. "Cancel": [ { "@type": "CancelPermitted", "penaltyTypes": [ "BeforeDeparture" ], "higherPenatltyAppliesInd": true, "Penalty": [ { "@type": "PenaltyAmount", "Amount": { "code": "USD", "minorUnit": 2, "value": XXXX How will approvals work for NDC tickets? You can issue an instant ticket or hold a booking for a time period to ticket at a later date – usually only 24 hours. Can I book one NDC carrier on the outbound and a different NDC carrier on the inbound in the same PNR? Not in the same PNR. You can book single NDC airline bookings only. This is on the Travelport+ roadmap (no timeframes yet). Can I book ATPCO or EDIFACT and NDC flights in the same booking file/PNR? No. It is however our long-term plan to ensure that this is supported in Travelport+ and will be communicated in due course. Are the pricing FCI codes different for NDC tickets? There are specific FCMI codes to identify NDC transactions (3, 4, or 5); however, according to ARC, the airlines are not using these. Will we receive pricing and exchange debit memos in the NDC channel? In NDC the airline is responsible for presenting and returning the offer and confirming the order. Therefore, there should be no debit memos. While processing a NDC ticket, do we receive credit card authorization code from airlines? There is no facility to support passing credit card authorization codes to the airlines in NDC. When paying by credit card, the carrier acts as merchant of record and will authorize the credit card when it is passed to them. They will decline, if necessary, without issuing the ticket. Can we create interline bookings in the NDC? Currently, NDC carriers do not have Interline flights supported but they do support codeshare flights. Commission/Bonus agreements - are we eligible to claim commission on NDC tickets if on ARC report? Can commission be updated post ticketing and/or modify TD and Tour code? Yes, if commission is present with the agency and the offer is eligible, it will be returned at Price and Book (Smartpoint will return commission, JSON – in the commission object). Commission can also be claimed and added manually via the ARC portal (pre-ticket only). Can I request seats using loyalty details and corporate ID (CLID)? Yes, this is supported and will show chargeable price as 0.00. For some carriers, a loyalty card status will obtain a free seat. A CLID number is not recognised through Travelport’s NDC products; however, it may allow certain upgrades when the passenger arrives at the airport if included in the PNR. Can I book the NDC order and then add seats on the carrier's website? Seats can be booked through Smartpoint and JSON . If you add or modify seats on the carrier's website, any changes made will not reflect back in the booking file or PNR. Once you make changes on the carrier's website, the ownership of the booking file or PNR passes to the airline. How do Virtual Cards work with NDC and booking air and paid seats? Would a separate card be needed for each transaction? JSON allows separate forms of payment if desired. A virtual card number is treated the same as a normal credit card. The virtual card authorization will be given for 1 transaction only; a separate authorization will be required if paying by 2 or more forms of payment. Are we going to be able to support different types of payment for each passenger? For example, one passenger pays with credit card and another one with cash? This is currently not supported but is on the roadmap. If I cancel the order, will I get a refund on seats and bags? Refunds are processed as per the airline's policy. How will booking data appear in the passive PNR or booking file on the GDS? Will the pricing information be stored? If you view an NDC&#160;booking through Smartpoint Desktop (Travelport+ or Apollo) or Smartpoint Worldspan, the NDC bookings created will show the flight data as a passive segment and status code ZK. The fare and tax breakdown, flight details, payment, etc. are stored in the Remarks lines of the PNR. For Travelport+, refer to DI&#160;Lines for NDC&#160;Bookings for detailed examples. The examples below show fare data in 1P/1V remarks. Also see the MIR and TAIR&#160;Examples section of DI&#160;Lines for NDC&#160;Bookings for additional Apollo and Worldspan examples. Show 1V confirmation of an NDC booking US PCC (book and ticket) Cash – PNR View * PNR CONTAINS NDC AIR SEGMENTS-SERVICE VIA SMARTPOINT NDC APP * J0B - DENNA ACCESS PRODUCTS DEN TTGVQW/WS DENOU J0B/GWS AG 14537482 16FEB F/A-CC8F5574 1.1JOHNSMIT/ADTONE MR 2.1MARPINEZ/JANY*P-C10 DOB07JUL12 1 AA1046K 15JUN ATLMIA ZK2 918A 1120A TH 2 AA1817K 15JUN MIADEN ZK2 140P 350P TH FONE-ORDR/1--212456121-/1.1 2 ORDR/1--123456789-/2.1 TKTG-T/ TRMK-#TAS01#REFAA/PRWUDR/USD/NDC 2 #TAS01#OIDAA/AA001HTS3W4A2/USD/NDC 3 #TAS01#P01ADT/310.70/46.00/356.70 4 #TAS01#P01ADT/US23.30/ZP9.60/AY5.60/XF7.50 5 #TAS01#P02ADT/310.70/46.00/356.70 6 #TAS01#P02ADT/US23.30/ZP9.60/AY5.60/XF7.50 7 #TAS01#P01ADT/FARETYPE/PUBLICFARE 8 #TAS01#P02ADT/FARETYPE/PUBLICFARE 9 #TAS01#S01FLTAA1314/M/15JUN2023/ATLCLT/09031025 10 #TAS01#S02FLTAA1662/M/15JUN2023/CLTDEN/11051238 11 #TAS01#TOT713.40 12 #TAS01#FAREBASIS/M7AHZNN1/S01-02/ADT 13 #TAS01#RESERVATION CONFIRMED 10FEB23 2006Z 14 #TAS01#TKT/P01/S01-02/00157443668826 15 #TAS01#TKT/P02/S01-02/00157443668830 16 #TAS01#FOPCA/713.40/10FEB23 2006Z ACKN-AA VE1234 16FEB 2241 Show 1P confirmation of an NDC booking US PCC (book and ticket) Cash – PNR View * PNR CONTAINS NDC AIR SEGMENTS-SERVICE VIA SMARTPOINT NDC APP * 1P- 33UO9E ¬ 1.1TESTLAST/TESTFIRST*ADT 2.1TESTLASTIIADT/TESTFIRSTIIMR*ADT¬ 1 AA1046K 15JUN TH ATLMIA ZK2 0918 1120 /O E @¬ 2 AA1817K 15JUN TH MIADEN ZK2 1340 1550 /O E @¬ P- 1.T4SH*1--212456121-/1.1¬ 2.T4SH*1--212456121-/1¬ T- 1.T/¬ MT TRAVELER E-MAIL¬ 1.MTT TRAVELERONE@GMAIL.COM -TESTLAST/TESTFIRST¬ 2.MTT TRAVELERTWO@GMAIL.COM -TESTLASTIIADT/TESTFIRSTIIMR¬ TKG FAX-NOT PRICED FARE TYPE EX ¬ FOP- 1.CA ¬ G- 1.SSRDOCSAAHK1/P/USA/@---@7635/USA/@-----@/M/23AUG06/TESTLAS T/TESTFIRST/RICHARD/H- 1.1 ¬ 2.SSRPSPTAAHK1/@---@7635/US/@-----@/M/H- 1.1 ¬ 3.SSRDOCSAAHK1/P/USA/@---@7635/USA/@-----@/M/23AUG06/TESTLAS TII DT/TESTFIRSTII MR- 2.1 ¬ 4.SSRPSPTAAHK1/@---@7635/US/@-----@/M- 2.1 ¬ **** ITEMS SUPPRESSED ****/U¬ MZ- 1./TAS01/REFAA/PAWABK/USD/NDC¬ 2./TAS01/OIDAA/AA001H6X4W4A2/USD/NDC¬ 3./TAS01/P01ADT/529.30/63.90/593.20¬ 4./TAS01/P01ADT/US39.70/ZP9.60/AY5.60/XF9.00¬ 5./TAS01/P02ADT/529.30/63.90/593.20¬ 6./TAS01/P02ADT/US39.70/ZP9.60/AY5.60/XF9.00¬ 7./TAS01/P01ADT/FARETYPE/AIRLINEPRIVATEFARE¬ 8./TAS01/P02ADT/FARETYPE/AIRLINEPRIVATEFARE¬ 9./TAS01/S01FLTAA1046/K/15JUN2023/ATLMIA/09181120¬ 10./TAS01/S02FLTAA1817/K/15JUN2023/MIADEN/13401550¬ 11./TAS01/TOT1186.40¬ 12./TAS01/FAREBASIS/K0AHZRK1/S01-02/ADT¬ 13./TAS01/RESERVATION CONFIRMED 10FEB23 1652Z¬ 14./TAS01/TKT/P01/S01-02/00157443668211¬ 15./TAS01/TKT/P02/S01-02/00157443668222¬ 16./TAS01/FOPCA/1186.40/10FEB23 1652Z¬ NDC&#160;Servicing Question Answer Does the agency have the same time lines to audit, void, modify, etc. in ARC as with current GDS tickets? Yes they are no different, but do always check the fare conditions as there could be some exceptions. How will agents be able to display the NDC ticket number to know if a customer has unused ticket available for exchange? The agency can look at the IAR (ARC portal) or BSPlink (BSP portal). Can we modify the booking on the carrier's website? Yes, however, if you modify the booking on the carrier's website, the ownership of the booking transfers to the carrier. These changes will not be reflected back into the booking file/PNR. If ownership is transferred to the carrier, does it mean I won't receive my schedule change if it happens? Yes. The connection is broken with Travelport, so the agency will not be able to receive updates through Travelport. What options are available for tickets that are no-show for NDC? Each carrier may handle no-shows differently. We recommend contacting the airline directly. How does revalidation work for NDC? The carrier does revalidation during schedule change. Existing host entries regarding revalidation will not work for NDC. When there is a schedule change, the agent needs to ensure that the ticket has been revalidated because in some cases the agent has to do a reissue with a waiver code. Guidance on which scenarios require waiver is provided by the carrier. NDC Reporting and MBOS These frequently asked questions provide information about reporting and mid- and back-office systems (MBOS). Question Answer Customers want to issue an invoice for NDC PNRs, including the Service Fees, with totals, terminal, seat information, etc. Are we going to have an outlined process for this? The DI. lines and remarks fields can be used for MBOS data; the agent will then have to use their own methods to extract this to create a customer invoice. When I do a void, cancel, or refund, will these actions be automatically sent to by MBOS to update it? No, the MIR or TAIR is not automatically updated with these modifications. A DI. line (Travelport+ and 1V) or remark line (1P) will be added to the PNR with these actions. Keep in mind that a PNR with no segments will go into a past date status and a MIR or TAIR cannot be generated. A workaround is to ensure you input retention lines in the PNR before doing these actions to keep the PNR alive so you can re-send the MIR. In NDC when doing an exchange ticket for the booking, how will this flow through to MBOS? In NDC all passengers in the booking are exchanged together and the amount per ticket is reported together for all passengers in the DI lines and not per passenger. We are aware MBOS providers logic is to capture data for one passenger at a time. So MBOS providers will need to have new logic in place to capture this information for all passengers. In NDC if you are only exchanging the ticket for one passenger, then that passenger needs to be split out on his/her own PNR. Will I see my NDC tickets issued in my HMPR (1V) and DDL (1P) reports? HMPR and DDL will not be updated, as these are the GDS record of ticket numbers, which we create. As the airline is doing the ticketing, they are in control of the ticket number and ticket number reports. Some airlines are looking at order history, but this is not implemented yet through IATA standards. Will an NDC booking create a GDS PNR with passive segment for mid- and back-office integration purposes? NDC bookings made through Travelport+ and Apollo will automatically create a passive (ZK) segment with all the NDC flight data, fare, taxes, etc. captured in the DI lines (1V and Travelport+) or Itinerary Remarks (1P), and these will flow through to the MIR (1V) and TAIR (1P) to flow through to mid- and back-office systems. This similar process is used today for booking low cost carriers via the LCC’s API. Will a PNR be created in 1P/1V if the refund request is initiated after the reservation is cancelled and past travel date (not in the original PNR)? No this is not supported. Once the order is canceled, it is then purged from the system. NDC for Apollo and Worldspan Content for both NDC&#160;and GDS in the JSON &#160;APIs is sourced from the Galileo GDS (Global Distribution System) for most customers. NDC content from the Apollo and Worldspan GDSs is available to specifically provisioned customers. See the NDC Guide for Apollo and Worldspan . The FAQs in this section are specific to NDC content for Apollo and Worldspan. Question Answer What NDC airline content will be available to Apollo and Worldspan customers? American Airlines NDC content is available at this time. Will United Airlines NDC content be available through Apollo and Worldspan? The priority and immediate focus is American Airlines. United Airlines is being scoped and is under review. Which countries will AA content be available to book? AA NDC content is available in several countries. See the NDC Guide for Apollo and Worldspan for countries supported by each airline. Apollo and Worldspan customers in Canada, Mexico, and the United States will be provisioned. However, content will also be available for Apollo and Worldspan customers in other points of sale using the current NDC provisioning channels. How will the agents shop and book the NDC content in Apollo and Worldspan? Shopping and booking NDC content on 1V/1P is available through existing JSON &#160;API&#160;requests and responses. The only difference between 1V/1P and Travelport+ is the value the source of the response. Do I have to register with American Airlines NDC channel? You must be specifically provisioned to access American Airlines NDC&#160;content on Apollo or Worldspan: Sign in to https://my.travelport.com . Select the Help and resources menu then Travelport support . Scroll to the bottom of the page. In the Raise a Case box, click Open a Request . On the next page, select Developer Product Services . In the Problem Type list, select API activation/provisioning . In the Product list, select RESTful JSON &#160;API . Once you receive your pre-production credentials, you can begin developing and testing. Refer to Ready to Certify? for certification steps. Will the JSON API 1P/1V services be the same JSON API services available on Travelport+? Yes, developing against JSON API services for 1P/1V prepares the agency to migrate to Travelport+. This is not technical debt and will be a step closer to moving to Travelport+. The same services used for 1P/1V will also be used to shop and book content on Travelport+. The only difference between 1V/1P and Travelport+ is the value of the source of the response. Can a user have the same JSON credentials/usage on 1V/1P/1G? Users will need separate JSON credentials for each GDS. Will NDC recognize all our different contracts and fares with American Airlines? If you currently have any negotiated or private fares with American Airlines, contact your sales representative to access it via NDC. Note: NDC&#160;does not support net fares. I use the Travelport MIR (1V) and TAIR (1P) to capture data in my MBOS, will this continue to work? MIR and TAIR data is transmitted in the same way as any type of booking, and NDC data will be stored in the DI remarks. It is not automatically transmitted. Have early discussions with the agency and/or MBOS providers to review any work required on their side to capture this data from the MIR and TAIR files because it is different from an ordinary air booking. How do agencies transmit a MIR (1V) and TAIR (1P)? Agencies will need to use non-faring options in the transmission. This is because in 1P/1V, we are not storing fares/prices. Refer to the MIR&#160;and TAIR&#160;Examples section of the DI&#160;Lines topic. In 1V it will be DJD modifier J = NON-FARING MIR (DJD command used). The DJD command transmits a MIR only to the MIR device targeted in the command. This MIR does not enter the fraud package and does NOT contain ANY fare information (APO only). The DJD command will also transmit a non-faring MIR for non-participant carriers with or without a MIR device targeted in the command (APO only). In 1P it will be EZI|@B0.00 (@B is the fare override) Show 1V example TPCQCA/WS DENOU J0B/GWS AG 14537482 10FEB 1.1SATHISHH/SARAVANAN 1 AA7562O 15MAY SFOLAS ZK1 700A 832A MO OPERATED BY ALASKA AIRLINES FONE-ORDR/1--212456121-/1.1 FOP:-S TKTG-T/ &#160; &gt;HBDJD &#160; NON - FARED MIR ISSUED - TTL FARE 0.00 TAB AND ENTER TO REDISPLAY PNR &gt;*TPCQCAí Show 1P example 1P- NECVH7 ¬ 1.1BEST/TEST.MR*ADT¬ 1 AA1832Y 25SEP MO DENDFW ZK1 1638 1950 /O A E @¬ 2 AA2749Y 28SEP TH DFWATL ZK1 2030 2342 /O A E @¬ P- 1.T4S----30333333-H/1.1¬ T- 1.T/11FEB1355 1P/T4S/CE*5230421412820 *I¬ TKG FAX-NOT PRICED FARE TYPE EX ¬ FOP- 1.CA ¬ **** ITEMS SUPPRESSED ****/DH/DR¬ &gt; &#160; &gt;EZI|@B0.00 TRANSACTION COMPLETE PNR &gt;*NECVH7(¬ &#160;

## Literal `<pre>` excerpts from HTML

### Block 1

```
"Cancel": [
                                    {
                                        "@type": "CancelPermitted",
                                        "penaltyTypes": [
                                            "BeforeDeparture"
                                        ],
                                        "higherPenatltyAppliesInd": true,
                                        "Penalty": [
                                            {
                                                "@type": "PenaltyAmount",
                                                "Amount": {
                                                    "code": "USD",
                                                    "minorUnit": 2,
                                                    "value": XXXX
```

### Block 2

```
* PNR CONTAINS NDC AIR SEGMENTS-SERVICE VIA SMARTPOINT NDC APP *
J0B - DENNA ACCESS PRODUCTS    DEN                          
TTGVQW/WS DENOU J0B/GWS AG 14537482 16FEB F/A-CC8F5574      
 1.1JOHNSMIT/ADTONE MR  2.1MARPINEZ/JANY*P-C10 DOB07JUL12   
 1 AA1046K 15JUN ATLMIA ZK2   918A 1120A           TH       
 2 AA1817K 15JUN MIADEN ZK2   140P  350P           TH       
FONE-ORDR/1--212456121-/1.1                                 
   2 ORDR/1--123456789-/2.1                                 
TKTG-T/                                                     
TRMK-#TAS01#REFAA/PRWUDR/USD/NDC                            
   2 #TAS01#OIDAA/AA001HTS3W4A2/USD/NDC                     
   3 #TAS01#P01ADT/310.70/46.00/356.70                      
   4 #TAS01#P01ADT/US23.30/ZP9.60/AY5.60/XF7.50             
   5 #TAS01#P02ADT/310.70/46.00/356.70               
   6 #TAS01#P02ADT/US23.30/ZP9.60/AY5.60/XF7.50      
   7 #TAS01#P01ADT/FARETYPE/PUBLICFARE               
   8 #TAS01#P02ADT/FARETYPE/PUBLICFARE               
   9 #TAS01#S01FLTAA1314/M/15JUN2023/ATLCLT/09031025 
  10 #TAS01#S02FLTAA1662/M/15JUN2023/CLTDEN/11051238 
  11 #TAS01#TOT713.40                                
  12 #TAS01#FAREBASIS/M7AHZNN1/S01-02/ADT            
  13 #TAS01#RESERVATION CONFIRMED 10FEB23 2006Z      
  14 #TAS01#TKT/P01/S01-02/00157443668826            
  15 #TAS01#TKT/P02/S01-02/00157443668830            
  16 #TAS01#FOPCA/713.40/10FEB23 2006Z               
ACKN-AA VE1234   16FEB 2241
```

### Block 3

```
* PNR CONTAINS NDC AIR SEGMENTS-SERVICE VIA SMARTPOINT NDC APP *
1P- 33UO9E ¬                                                    
 1.1TESTLAST/TESTFIRST*ADT  2.1TESTLASTIIADT/TESTFIRSTIIMR*ADT¬ 
 1 AA1046K 15JUN TH ATLMIA ZK2  0918  1120 /O E @¬              
 2 AA1817K 15JUN TH MIADEN ZK2  1340  1550 /O E @¬              
P- 1.T4SH*1--212456121-/1.1¬                                    
 2.T4SH*1--212456121-/1¬                                        
T- 1.T/¬                                                        
MT TRAVELER E-MAIL¬                                             
   1.MTT TRAVELERONE@GMAIL.COM -TESTLAST/TESTFIRST¬             
   2.MTT TRAVELERTWO@GMAIL.COM -TESTLASTIIADT/TESTFIRSTIIMR¬    
TKG FAX-NOT PRICED  FARE TYPE EX ¬                              
FOP- 1.CA ¬                                                     
G-  1.SSRDOCSAAHK1/P/USA/@---@7635/USA/@-----@/M/23AUG06/TESTLAS
T/TESTFIRST/RICHARD/H-  1.1 ¬                                    
    2.SSRPSPTAAHK1/@---@7635/US/@-----@/M/H-  1.1 ¬              
    3.SSRDOCSAAHK1/P/USA/@---@7635/USA/@-----@/M/23AUG06/TESTLAS 
TII DT/TESTFIRSTII MR-  2.1 ¬                                    
    4.SSRPSPTAAHK1/@---@7635/US/@-----@/M-  2.1 ¬                
**** ITEMS SUPPRESSED ****/U¬                                    
MZ-  1./TAS01/REFAA/PAWABK/USD/NDC¬                     
     2./TAS01/OIDAA/AA001H6X4W4A2/USD/NDC¬              
     3./TAS01/P01ADT/529.30/63.90/593.20¬               
     4./TAS01/P01ADT/US39.70/ZP9.60/AY5.60/XF9.00¬      
     5./TAS01/P02ADT/529.30/63.90/593.20¬               
     6./TAS01/P02ADT/US39.70/ZP9.60/AY5.60/XF9.00¬      
     7./TAS01/P01ADT/FARETYPE/AIRLINEPRIVATEFARE¬       
     8./TAS01/P02ADT/FARETYPE/AIRLINEPRIVATEFARE¬       
     9./TAS01/S01FLTAA1046/K/15JUN2023/ATLMIA/09181120¬ 
    10./TAS01/S02FLTAA1817/K/15JUN2023/MIADEN/13401550¬ 
    11./TAS01/TOT1186.40¬                               
    12./TAS01/FAREBASIS/K0AHZRK1/S01-02/ADT¬            
    13./TAS01/RESERVATION CONFIRMED 10FEB23 1652Z¬      
    14./TAS01/TKT/P01/S01-02/00157443668211¬   
    15./TAS01/TKT/P02/S01-02/00157443668222¬   
    16./TAS01/FOPCA/1186.40/10FEB23 1652Z¬
```

### Block 4

```
TPCQCA/WS DENOU J0B/GWS AG 14537482 10FEB
```

### Block 5

```
1.1SATHISHH/SARAVANAN
```

### Block 6

```
1 AA7562O 15MAY SFOLAS ZK1   700A  832A           MO
```

### Block 7

```
OPERATED BY ALASKA AIRLINES
```

### Block 8

```
FONE-ORDR/1--212456121-/1.1
```

### Block 9

```
FOP:-S
```

### Block 10

```
TKTG-T/
```

### Block 11

```
&#160;
```

### Block 12

```
&gt;HBDJD
```

### Block 13

```
&#160;
```

### Block 14

```
NON - FARED   MIR ISSUED - TTL FARE      0.00
```

### Block 15

```
TAB AND ENTER TO REDISPLAY PNR &gt;*TPCQCAí
```

### Block 16

```
1P- NECVH7 ¬
```

### Block 17

```
1.1BEST/TEST.MR*ADT¬
```

### Block 18

```
1 AA1832Y 25SEP MO DENDFW ZK1  1638  1950 /O A E @¬
```

### Block 19

```
2 AA2749Y 28SEP TH DFWATL ZK1  2030  2342 /O A E @¬
```

### Block 20

```
P- 1.T4S----30333333-H/1.1¬
```

### Block 21

```
T- 1.T/11FEB1355  1P/T4S/CE*5230421412820 *I¬
```

### Block 22

```
TKG FAX-NOT PRICED  FARE TYPE EX ¬
```

### Block 23

```
FOP- 1.CA ¬
```

### Block 24

```
**** ITEMS SUPPRESSED ****/DH/DR¬
```

### Block 25

```
&gt;
```

### Block 26

```
&#160;
```

### Block 27

```
&gt;EZI|@B0.00
```

### Block 28

```
TRANSACTION COMPLETE PNR &gt;*NECVH7(¬
```

