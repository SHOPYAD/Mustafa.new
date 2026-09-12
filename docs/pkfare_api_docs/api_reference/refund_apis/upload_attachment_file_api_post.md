# UploadAttachmentFile API - PKFARE Flight Buyer API

POST/json/uploadAttachmentFile

## Function

Some Api requests require you to provide attachment files, such as RefundPricing. You can upload files using the UploadAttachmentFile Api. After successful file upload, the Api returns the corresponding file ID, which corresponds to a unique file. When any other interfaces need to use this file, you only need to provide the corresponding file ID.

💡

To prevent abuse of the Api, the size of a single file should be less than 5MB, and you can upload up to 5000 files per day.

## Error Code List

| error code | error message | description |
| --- | --- | --- |
| 0 | ok | success |
| S001 | System error | System error |
| P001 | Invalid authentication | Invalid authentication |
| P006 | Wrong parameter | Wrong parameter |
| B002 | Partner is not exists | Partner does not exist |
| B003 | Illegal sign | Illegal signature |
| B139 | File is oversize. It should be less than 5MB. | The file exceeds the size limit. |
| B151 | Upload files allowance is less than 5000 files per day. | Exceeded the daily limit of upload times |

## Special Notes on Interface Requests

Unlike other interfaces, the HTTP request body for the file upload interface must be in `multipart/form-data` format. The request body contains two fields: `param` and `file`.The `param` field is used to pass additional parameters and is of type string in the form.The `file` field is used to pass the file itself and is of type file in the form.

The Content-Type for the param field alone is `application/json`, meaning the param field itself is a JSON structure string. The structure of the param field itself is as follows:

`{     "authentication": {         "partnerId": "",         "sign": ""     } }`

As can be seen, the parameters in this field are similar to those in other interfaces, mainly used to transmit information related to interface authorization. For a detailed explanation of the `authentication` part, please refer to other interfaces.

This is a postman reqeust example:

### 请求参数

Body Params multipart/form-data

Example:

{"authentication":{"partnerId":"","sign":""}}

### 示例代码

### Responses

Error code, see the error cod list in the documentation for details.

The returned data, this parameter is not empty only when the error code returns "0"

File ID. A file ID corresponds to a unique file. When any other interface needs to use this file, you only need to provide the corresponding file ID. The length of the file ID is within 128.

    {
      "errorCode": "0",
      "errorMsg": "ok",
      "data": {
        "fileId": "1ee71d50b4d59ef3e1555729c11745eb",
        "fileName": "Pkfarer.jpg"
      }
    }

Modified at 1 年前

