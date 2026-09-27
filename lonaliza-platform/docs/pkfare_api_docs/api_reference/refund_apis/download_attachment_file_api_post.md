# DownloadAttachmentFile API - PKFARE Flight Buyer API

POST/json/downloadAttachmentFile

## Function

DownloadAttachmentFile Api allows you to download files that were uploaded using the UploadAttachmentFile Api and also download the Voucher or EMD from airlines. You only need to provide the corresponding file ID.

## Error Code List

| error code | error message | description |
| --- | --- | --- |
| 0 | ok | success |
| S001 | System error | System error |
| P001 | Invalid authentication | Invalid authentication |
| P006 | Wrong parameter | Wrong parameter |
| B002 | Partner is not exists | Partner does not exist |
| B003 | Illegal sign | Illegal signature |

### 请求参数

authentication

object {2} 

required

Partner ID, You can obtain it from your account manager.

Signature, You can refer to the instructions about signatures in the API documentation.

File ID. Returned by UploadAttachmentFile API.

    {
      "authentication": {
        "partnerId": "",
        "sign": ""
      },
      "data": {
        "fileId": ""
      }
    }

### 示例代码

### Responses

HTTP 状态码: 201

内容格式: Binary

Modified at 5 个月前

