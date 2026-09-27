# Order Status Explanation - PKFARE Flight Buyer API

## Order status/Item status[For ancillaries]

| Enum | Description | Final state |
| --- | --- | --- |
| ISS\_PRC | Ticket is issuing. | No |
| CHG\_PRC | Change order is proceeding. | No |
| REFD\_PRC | Refund order is proceeding. | No |
| VOID\_PRC | Ticket is voiding. | No |
| TO\_BE\_PAID | To be Paid. | No |
| ISSED | Ticket issued. | **Yes** ⚠️ |
| TO\_BE\_RSV | To be reserved. | No |
| UNDER\_REVIEW | Under review. | No |
| HOLD | Order is holding manually, please contact customer service for further action. | No |
| RSV\_FAIL | Reservation failed | **Yes** ⚠️ |
| CLOSED | Order closed. | No |
| CNCL | Order Cancelled. | **Yes** ⚠️ |
| CNCL\_TO\_BE\_REIM | Order Cancelled, and reimbursement is under processing. | No |
| CNCL\_REIMED | Order Cancelled, and payment has been reimbused. | **Yes** ⚠️ |
| CHG\_RQ | Change Order is requested. | No |
| CHG\_TO\_BE\_PAID | Change Order is to be paid. | No |
| CHG\_REJ | Change Order is rejected. | **Yes** ⚠️ |
| CHGD | Change Order is changed. | **Yes** ⚠️ |
| REFD\_REJ | Refund Order is rejected. | **Yes** ⚠️ |
| REFD\_TO\_BE\_REIM | Refunded to be reimbursed. | No |
| REFD\_REIMED | Refunded and reimbursed. | **Yes** ⚠️ |
| VOID\_REJ | Void request is rejected. | **Yes** ⚠️ |
| VOID\_TO\_BE\_REIM | Void to be reimbursed. | No |
| VOID\_REIMED | Void and reimbursed | **Yes** ⚠️ |
| VOID | Voided | No |

Scenarios :

1.  Issued success: TO\_BE\_PAID > ISS\_PRC > ISSED
2.  PNR cancelling: TO\_BE\_PAID > CNCL
3.  Issued Failed: TO\_BE\_PAID > ISS\_PRC > CNCL\_TO\_BE\_REIM > CNCL\_REIMED
4.  Refund Rejected: UNDER\_REVIEW > REFD\_REJ
5.  Refund Success: UNDER\_REVIEW > REFD\_PRC > REFD\_TO\_BE\_REIM > REFD\_REIMED
6.  Change Rejected: CHG\_RQ > UNDER\_REVIEW > CHG\_REJ
7.  Change Success:CHG\_RQ > UNDER\_REVIEW > CHG\_TO\_BE\_PAID > CHG\_PRC > CHGD

Modified at 3 months ago

