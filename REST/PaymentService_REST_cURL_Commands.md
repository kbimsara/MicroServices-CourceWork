
### PaymentService REST API cURL Commands

**Note:** These endpoints require a JWT token in the `Authorization: Bearer <TOKEN>` header. You will need to generate a valid JWT token using a tool like [jwt.io](https://jwt.io/) or a custom authentication service, signed with the secret you configure in your `.env` file (e.g., `JWT_SECRET`).

**1. Create Payment (Requires JWT Token)**

```bash
TOKEN="YOUR_JWT_TOKEN_HERE"  # Replace with a valid JWT token
curl -X POST http://localhost:3001/payments \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer $TOKEN" \
     -d '{
           "orderId": "REPLACE_WITH_VALID_ORDER_ID",
           "userId": "user_abc",
           "amount": 50.00,
           "method": "credit_card"
         }'
```

*   **Note:** After creating a payment, copy the `_id` from the response to use in subsequent `getPaymentById` and `updateStatus` requests.

**2. Get All Payments (Requires JWT Token)**

```bash
TOKEN="YOUR_JWT_TOKEN_HERE"  # Replace with a valid JWT token
curl -X GET http://localhost:3001/payments \
     -H "Authorization: Bearer $TOKEN"
```

**3. Get Payment By ID (Requires JWT Token)**

```bash
TOKEN="YOUR_JWT_TOKEN_HERE"  # Replace with a valid JWT token
PAYMENT_ID="REPLACE_WITH_VALID_PAYMENT_ID" # Replace with an actual payment ID
curl -X GET "http://localhost:3001/payments/$PAYMENT_ID" \
     -H "Authorization: Bearer $TOKEN"
```

**4. Update Payment Status (Requires JWT Token)**

```bash
TOKEN="YOUR_JWT_TOKEN_HERE"  # Replace with a valid JWT token
PAYMENT_ID="REPLACE_WITH_VALID_PAYMENT_ID" # Replace with an actual payment ID
curl -X PATCH "http://localhost:3001/payments/$PAYMENT_ID/status" \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer $TOKEN" \
     -d '{"status": "completed"}'
```
