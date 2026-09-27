# EMD Display API&#160;Reference

## Source

- **Local HTML:** `docs/travelport/travelport api guide/travelport-airapi json/support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/Ancillaries/APIRef_EMDDisplay.html` (UTF-8 mirror)
- **Official base:** `https://support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/` + same relative path

## Plaintext extract (lossy)

EMD Display API&#160;Reference Skip To Main Content Account Settings Logout placeholder Account Settings Logout Filter: All Files Submit Search Filter: All Files Submit Search EMD Display API&#160;Reference Request Response Example request Example response Get emds/ {EMDNumber} Base path: Pre-production https://api.pp.travelport.net/11/air/ Production https://api.travelport.net/11/air/ Related Content: Ancillary and EMD&#160;Guide , Ancillary Workflow Diagram Display an EMD&#160;to retrieve EMD details such as the amount paid and agency ticketing information. EMD&#160;Display not supported for NDC. Reservation Retrieve returns EMD&#160;details for both NDC and GDS. Request As part of the request requirements, also see Authentication and Common Air API Headers . Query Parameters None. Request Body None. Response See example response below. Example Request This request has no message payload. Example Response Show Example EMD&#160;Display Response { "EMDListResponse": { "EMDID": [ { "@type": "EMDSummary", "Identifier": { "value": "1764571003817" }, "PersonName": { "@type": "PersonName", "Given": "ONEDDKRISHNA", "Surname": "MOUSE" }, "ReservationLocator": [ { "supplierCode": "1G", "value": "A7H2RQ" }, { "supplierCode": "EK", "value": "LEZ352" } ], "AgencyInfo": { "ticketedDate": "2021-07-04", "name": "ASPIRE", "ticketingPCC": "5F5B", "code": "03570545", "ticketingCountry": "US", "ticketingCity": "PHX" }, "EMDSegment": [ { "EMDDescription": { "code": "A", "subCode": "0B5", "codeContext": "IATA", "value": "Air transportation" }, "Amount": { "CurrencyCode": { "value": "USD" }, "Total": 121.9 }, "Status": "Open", "PresentTo": "EK/EMIRATES AIRLINES", "PresentAt": "DXB/DUBAI" } ], "TotalAmount": { "CurrencyCode": { "value": "USD" }, "Base": 121.9, "Taxes": { "@type": "TaxesDetail", "Tax": [ { "currencyCode": "USD", "taxCode": "K3", "value": 6.1 } ] }, "Total": 128 }, "FormOfPayment": { "value": "Cash" }, "AssociatedTicketNumber": { "value": "1767630424848" } } ] } }

## Literal `<pre>` excerpts from HTML

### Block 1

```
{
  "EMDListResponse": {
    "EMDID": [
      {
        "@type": "EMDSummary",
        "Identifier": {
          "value": "1764571003817"
        },
        "PersonName": {
          "@type": "PersonName",
          "Given": "ONEDDKRISHNA",
          "Surname": "MOUSE"
        },
        "ReservationLocator": [
          {
            "supplierCode": "1G",
            "value": "A7H2RQ"
          },
          {
            "supplierCode": "EK",
            "value": "LEZ352"
          }
        ],
        "AgencyInfo": {
          "ticketedDate": "2021-07-04",
          "name": "ASPIRE",
          "ticketingPCC": "5F5B",
          "code": "03570545",
          "ticketingCountry": "US",
          "ticketingCity": "PHX"
        },
        "EMDSegment": [
          {
            "EMDDescription": {
              "code": "A",
              "subCode": "0B5",
              "codeContext": "IATA",
              "value": "Air transportation"
            },
            "Amount": {
              "CurrencyCode": {
                "value": "USD"
              },
              "Total": 121.9
            },
            "Status": "Open",
            "PresentTo": "EK/EMIRATES AIRLINES",
            "PresentAt": "DXB/DUBAI"
          }
        ],
        "TotalAmount": {
          "CurrencyCode": {
            "value": "USD"
          },
          "Base": 121.9,
          "Taxes": {
            "@type": "TaxesDetail",
            "Tax": [
              {
                "currencyCode": "USD",
                "taxCode": "K3",
                "value": 6.1
              }
            ]
          },
          "Total": 128
        },
        "FormOfPayment": {
          "value": "Cash"
        },
        "AssociatedTicketNumber": {
          "value": "1767630424848"
        }
      }
    ]
  }
}
```

