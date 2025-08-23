### OrdersService REST API cURL Commands

**Note:** These endpoints require a JWT token in the `Authorization: Bearer <TOKEN>` header. You will need to generate a valid JWT token using a tool like [jwt.io](https://jwt.io/) or a custom authentication service, signed with the secret you configure in your `.env` file (e.g., `JWT_SECRET`).

**1. Create Order (Requires JWT Token)**

```bash
TOKEN="YOUR_JWT_TOKEN_HERE"  # Replace with a valid JWT token
curl -X POST http://localhost:3000/orders \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer $TOKEN" \
     -d '{
           "userId": "user_abc",
           "productId": "product_xyz",
           "amount": 120.50,
           "quantity": 1
         }'
```

*   **Note:** After creating an order, copy the `_id` from the response to use in subsequent `getOrderById`, `updateStatus`, and `deleteOrder` requests.

**2. Get All Orders (Requires JWT Token)**

```bash
TOKEN="YOUR_JWT_TOKEN_HERE"  # Replace with a valid JWT token
curl -X GET http://localhost:3000/orders \
     -H "Authorization: Bearer $TOKEN"
```

**3. Get Order By ID (Requires JWT Token)**

```bash
TOKEN="YOUR_JWT_TOKEN_HERE"  # Replace with a valid JWT token
ORDER_ID="REPLACE_WITH_VALID_ORDER_ID" # Replace with an actual order ID
curl -X GET "http://localhost:3000/orders/$ORDER_ID" \
     -H "Authorization: Bearer $TOKEN"
```

**4. Update Order Status (Requires JWT Token)**

```bash
TOKEN="YOUR_JWT_TOKEN_HERE"  # Replace with a valid JWT token
ORDER_ID="REPLACE_WITH_VALID_ORDER_ID" # Replace with an actual order ID
curl -X PATCH "http://localhost:3000/orders/$ORDER_ID/status" \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer $TOKEN" \
     -d '{"status": "completed"}'
```

**5. Delete Order (Requires JWT Token)**

```bash
TOKEN="YOUR_JWT_TOKEN_HERE"  # Replace with a valid JWT token
ORDER_ID="REPLACE_WITH_VALID_ORDER_ID" # Replace with an actual order ID
curl -X DELETE "http://localhost:3000/orders/$ORDER_ID" \
     -H "Authorization: Bearer $TOKEN"
```
