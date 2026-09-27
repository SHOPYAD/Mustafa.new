# Custom Rule Details API&#160;Reference

## Source

- **Local HTML:** `docs/travelport/travelport api guide/travelport-airapi json/support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/Rules/API_Ref_CustomRuleDetails.html` (UTF-8 mirror)
- **Official base:** `https://support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/` + same relative path

## Plaintext extract (lossy)

Custom Rule Details API&#160;Reference Skip To Main Content Account Settings Logout placeholder Account Settings Logout Filter: All Files Submit Search Filter: All Files Submit Search Custom Rule Details API&#160;Reference Request Response Example request Example response Get book/customrule/customrules/?PCC= {PCC} ?RuleRecordName= {NAME} Base path: Pre-production https://api.pp.travelport.net/11/air/ Production https://api.travelport.net/11/air/ Related Content: Booking Guide , Custom Rule , Custom Rule List Send Custom Rule Details to retrieve details about a specific custom rule. This standalone request can be sent as part of a workbench session or without a workbench. Custom rules are created in a rules booking engine used by your agency. See Custom Booking Rules in the Booking Guide for details. Request As part of the request requirements, also see Authentication and Common Air API Headers . Query Parameters Parameter Description Required/Optional PCC The PCC&#160;associated with the rule to retrieve. Required RuleRecordName The name of the rule to retrieve. You can send Custom Rule List to return a list of all rules associated with a specific PCC. Required Request Body There is no message payload. Response The response returns details of the requested rule. Show Response Body Table Object Description CustomRuleResponse Top level object. Includes CustomRule object. CustomRule Top level object. Includes the following key value pair: id :&#160;Short ID for CustomRule. Includes Identifier, PseudoCItyCode, and RuleRecord objects. Identifier System-generated identifier for the response: authority : Source of information. value : Unique system-generated identifier. PseudoCItyCode PCC&#160;sent in the request; the rule returned is specific to this PCC. RuleRecord Rule details. Includes RuleRecordName and RuleText objects. Key value pair: sequence :&#160;Sequence of this rule. Send this value when deleting a rule from a booking. RuleRecordName String. Name of this custom rule. Send this value when adding a rule to a booking. RuleText Array of rule strings. Includes StringText object. Key value pair: sequence :&#160;Sequence of this string. StringText String. The text of the rule as configured in the booking file management tool (see the Custom Rules for details). Example Request This request has no message payload. Example Response The response returns details of the requested rule. Show Example { "CustomRuleResponse": { "CustomRule": { "@type": "CustomRule", "id": "customRule_1", "Identifier": { "value": "14947439-09b3-436a-bb7c-c86703f59167", "authority": "Travelport" }, "PseudoCityCode": "DU7", "RuleRecord": [ { "@type": "RuleRecord", "sequence": 1, "RuleRecordName": "TKP", "RuleText": [ { "@type": "RuleText", "sequence": 1, "StringText": " IF EM ANDFOR FARE ANDNOT FINDCOR LIT/C/ AND OCCURS TIMES1-99 THEN SAY VERIFICAR ACUERDO DE INTERLINEA Y ANADIR ANTES EN LA TARIFA TMU" }, { "@type": "RuleText", "sequence": 2, "StringText": " IF EW ANDFOR F. AND LIT/S/ OR LIT/CK/ THEN SAY CASH OR CHEQUE FOP NOT ALLOWED IN F. ENTRY" }, { "@type": "RuleText", "sequence": 3, "StringText": " IF EW ANDFOR F. AND LIT/CC/ THEN SAY NO SE PERMITE PAGO CON TARJETAS DE CREDITO" } ] } ] } } } &#160;

## Literal `<pre>` excerpts from HTML

### Block 1

```
{
    "CustomRuleResponse": {
        "CustomRule": {
            "@type": "CustomRule",
            "id": "customRule_1",
            "Identifier": {
                "value": "14947439-09b3-436a-bb7c-c86703f59167",
                "authority": "Travelport"
            },
            "PseudoCityCode": "DU7",
            "RuleRecord": [
                {
                    "@type": "RuleRecord",
                    "sequence": 1,
                    "RuleRecordName": "TKP",
                    "RuleText": [
                        {
                            "@type": "RuleText",
                            "sequence": 1,
                            "StringText": " IF EM ANDFOR FARE ANDNOT FINDCOR LIT/C/ AND OCCURS TIMES1-99 THEN SAY VERIFICAR ACUERDO DE INTERLINEA Y ANADIR ANTES EN LA TARIFA TMU"
                        },
                        {
                            "@type": "RuleText",
                            "sequence": 2,
                            "StringText": " IF EW ANDFOR F. AND LIT/S/ OR LIT/CK/ THEN SAY CASH OR CHEQUE FOP NOT ALLOWED IN F. ENTRY"
                        },
                        {
                            "@type": "RuleText",
                            "sequence": 3,
                            "StringText": " IF EW ANDFOR F. AND LIT/CC/ THEN SAY NO SE PERMITE PAGO CON TARJETAS DE CREDITO"
                        }
                    ]
                }
            ]
        }
    }
}
```

