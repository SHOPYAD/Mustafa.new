# Custom Rule List API&#160;Reference

## Source

- **Local HTML:** `docs/travelport/travelport api guide/travelport-airapi json/support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/Rules/API_Ref_CustomRuleList.html` (UTF-8 mirror)
- **Official base:** `https://support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/` + same relative path

## Plaintext extract (lossy)

Custom Rule List API&#160;Reference Skip To Main Content Account Settings Logout placeholder Account Settings Logout Filter: All Files Submit Search Filter: All Files Submit Search Custom Rule List API&#160;Reference Request Response Example request Example response GET book/customrule/customrules/?PCC= {PCC} Base path: Pre-production https://api.pp.travelport.net/11/air/ Production https://api.travelport.net/11/air/ Related Content: Booking Guide , Custom Rule , Custom Rule Details The Custom Rule List API&#160;returns a list of all custom rules associated with a PCC. This standalone request can be sent as part of a workbench session or without a workbench. Custom rules are created in a rules booking engine used by your agency. See Custom Rules in the Booking Guide for details. Request As part of the request requirements, also see Authentication and Common Air API Headers . Query Parameters Parameter Description Required/Optional PCC Send the PCC for the custom rules list to retrieve. Required Request Body There is no message payload. Response The response returns a list of the custom rules for the PCC send in the request. Show Response Body Table Object Description CustomRuleResponse Top level object. Includes CustomRule object. CustomRule Top level object. Includes the following key value pair: id :&#160;Short ID for CustomRule. Includes Identifier, PseudoCItyCode, and RuleRecord objects. Identifier System-generated identifier for the response: authority : Source of information. value : Unique system-generated identifier. PseudoCItyCode PCC&#160;sent in the request; all rules returned are specific to this PCC. RuleRecord Array of custom rules for this PCC. Includes RuleRecordName object. Key value pair: sequence :&#160;Sequence of this rule. Send this value when deleting a rule from a booking. RuleRecordName String. Name of this custom rule. Send this value when adding a rule to a booking or retrieving rule details . Example Request This request has no message payload. Example Response The response returns a list of all rules for that PCC. Show Example custom rule list response { "CustomRuleResponse": { "CustomRule": { "@type": "CustomRule", "id": "customRule_1", "Identifier": { "value": "7cf4d3a3-b962-42ac-b0a1-141c482535a4", "authority": "Travelport" }, "PseudoCityCode": "DU7", "RuleRecord": [ { "@type": "RuleRecord", "sequence": 1, "RuleRecordName": "BERNAT" }, { "@type": "RuleRecord", "sequence": 2, "RuleRecordName": "CASHDI" }, { "@type": "RuleRecord", "sequence": 3, "RuleRecordName": "CASHNP" }, { "@type": "RuleRecord", "sequence": 4, "RuleRecordName": "CORP" }, { "@type": "RuleRecord", "sequence": 5, "RuleRecordName": "CTC" }, { "@type": "RuleRecord", "sequence": 6, "RuleRecordName": "DI" }, { "@type": "RuleRecord", "sequence": 7, "RuleRecordName": "DIPT" }, { "@type": "RuleRecord", "sequence": 8, "RuleRecordName": "DI2" }, { "@type": "RuleRecord", "sequence": 9, "RuleRecordName": "DI3" }, { "@type": "RuleRecord", "sequence": 10, "RuleRecordName": "DI4" }, { "@type": "RuleRecord", "sequence": 11, "RuleRecordName": "DI5" }, { "@type": "RuleRecord", "sequence": 12, "RuleRecordName": "EMAIL" }, { "@type": "RuleRecord", "sequence": 13, "RuleRecordName": "FOP" }, { "@type": "RuleRecord", "sequence": 14, "RuleRecordName": "GENERAL" }, { "@type": "RuleRecord", "sequence": 15, "RuleRecordName": "JUANICASH" }, { "@type": "RuleRecord", "sequence": 16, "RuleRecordName": "JUANICASH2" }, { "@type": "RuleRecord", "sequence": 17, "RuleRecordName": "NOCASH" }, { "@type": "RuleRecord", "sequence": 18, "RuleRecordName": "NOTKP" }, { "@type": "RuleRecord", "sequence": 19, "RuleRecordName": "OTERO" }, { "@type": "RuleRecord", "sequence": 20, "RuleRecordName": "PT" }, { "@type": "RuleRecord", "sequence": 21, "RuleRecordName": "SSRIB" }, { "@type": "RuleRecord", "sequence": 22, "RuleRecordName": "SSRTK" }, { "@type": "RuleRecord", "sequence": 23, "RuleRecordName": "SSRUX" }, { "@type": "RuleRecord", "sequence": 24, "RuleRecordName": "TCJUANI" }, { "@type": "RuleRecord", "sequence": 25, "RuleRecordName": "TCOBL" }, { "@type": "RuleRecord", "sequence": 26, "RuleRecordName": "TCROB" }, { "@type": "RuleRecord", "sequence": 27, "RuleRecordName": "TKP" }, { "@type": "RuleRecord", "sequence": 28, "RuleRecordName": "ZZZ" } ] } } } &#160;

## Literal `<pre>` excerpts from HTML

### Block 1

```
{
 "CustomRuleResponse": {
  "CustomRule": {
   "@type": "CustomRule",
   "id": "customRule_1",
   "Identifier": {
    "value": "7cf4d3a3-b962-42ac-b0a1-141c482535a4",
    "authority": "Travelport"
   },
   "PseudoCityCode": "DU7",
   "RuleRecord": [
    {
     "@type": "RuleRecord",
     "sequence": 1,
     "RuleRecordName": "BERNAT"
    },
    {
     "@type": "RuleRecord",
     "sequence": 2,
     "RuleRecordName": "CASHDI"
    },
    {
     "@type": "RuleRecord",
     "sequence": 3,
     "RuleRecordName": "CASHNP"
    },
    {
     "@type": "RuleRecord",
     "sequence": 4,
     "RuleRecordName": "CORP"
    },
    {
     "@type": "RuleRecord",
     "sequence": 5,
     "RuleRecordName": "CTC"
    },
    {
     "@type": "RuleRecord",
     "sequence": 6,
     "RuleRecordName": "DI"
    },
    {
     "@type": "RuleRecord",
     "sequence": 7,
     "RuleRecordName": "DIPT"
    },
    {
     "@type": "RuleRecord",
     "sequence": 8,
     "RuleRecordName": "DI2"
    },
    {
     "@type": "RuleRecord",
     "sequence": 9,
     "RuleRecordName": "DI3"
    },
    {
     "@type": "RuleRecord",
     "sequence": 10,
     "RuleRecordName": "DI4"
    },
    {
     "@type": "RuleRecord",
     "sequence": 11,
     "RuleRecordName": "DI5"
    },
    {
     "@type": "RuleRecord",
     "sequence": 12,
     "RuleRecordName": "EMAIL"
    },
    {
     "@type": "RuleRecord",
     "sequence": 13,
     "RuleRecordName": "FOP"
    },
    {
     "@type": "RuleRecord",
     "sequence": 14,
     "RuleRecordName": "GENERAL"
    },
    {
     "@type": "RuleRecord",
     "sequence": 15,
     "RuleRecordName": "JUANICASH"
    },
    {
     "@type": "RuleRecord",
     "sequence": 16,
     "RuleRecordName": "JUANICASH2"
    },
    {
     "@type": "RuleRecord",
     "sequence": 17,
     "RuleRecordName": "NOCASH"
    },
    {
     "@type": "RuleRecord",
     "sequence": 18,
     "RuleRecordName": "NOTKP"
    },
    {
     "@type": "RuleRecord",
     "sequence": 19,
     "RuleRecordName": "OTERO"
    },
    {
     "@type": "RuleRecord",
     "sequence": 20,
     "RuleRecordName": "PT"
    },
    {
     "@type": "RuleRecord",
     "sequence": 21,
     "RuleRecordName": "SSRIB"
    },
    {
     "@type": "RuleRecord",
     "sequence": 22,
     "RuleRecordName": "SSRTK"
    },
    {
     "@type": "RuleRecord",
     "sequence": 23,
     "RuleRecordName": "SSRUX"
    },
    {
     "@type": "RuleRecord",
     "sequence": 24,
     "RuleRecordName": "TCJUANI"
    },
    {
     "@type": "RuleRecord",
     "sequence": 25,
     "RuleRecordName": "TCOBL"
    },
    {
     "@type": "RuleRecord",
     "sequence": 26,
     "RuleRecordName": "TCROB"
    },
    {
     "@type": "RuleRecord",
     "sequence": 27,
     "RuleRecordName": "TKP"
    },
    {
     "@type": "RuleRecord",
     "sequence": 28,
     "RuleRecordName": "ZZZ"
    }
   ]
  }
 }
}
```

