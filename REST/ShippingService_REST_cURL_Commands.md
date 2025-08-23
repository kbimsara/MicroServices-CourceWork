
### ShippingService REST API cURL Commands

**Note:** These endpoints require a JWT token in the `Authorization: Bearer <TOKEN>` header. You will need to generate a valid JWT token using a tool like [jwt.io](https://jwt.io/) or a custom authentication service, signed with the secret you configure in your `.env` file (e.g., `JWT_SECRET`).

**1. Create Shipment (Requires JWT Token)**

```bash
TOKEN="YOUR_JWT_TOKEN_HERE"  # Replace with a valid JWT token
curl -X POST http://localhost:3002/shipments \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer $TOKEN" \
     -d '{
           "orderId": "REPLACE_WITH_VALID_ORDER_ID",
           "userId": "user_abc",
           "address": "123 Main St, Anytown, USA"
         }'
```

*   **Note:** After creating a shipment, copy the `_id` from the response to use in subsequent `getShippingById`, `updateStatus`, and `deleteShipment` requests.

**2. Get All Shipments (Requires JWT Token)**

```bash
TOKEN="YOUR_JWT_TOKEN_HERE"  # Replace with a valid JWT token
curl -X GET http://localhost:3002/shipments \
     -H "Authorization: Bearer $TOKEN"
```

**3. Get Shipment By ID (Requires JWT Token)**

```bash
TOKEN="YOUR_JWT_TOKEN_HERE"  # Replace with a valid JWT token
SHIPPING_ID="REPLACE_WITH_VALID_SHIPPING_ID" # Replace with an actual shipment ID
curl -X GET "http://localhost:3002/shipments/$SHIPPING_ID" \
     -H "Authorization: Bearer $TOKEN"
```

**4. Update Shipment Status (Requires JWT Token)**

```bash
TOKEN="YOUR_JWT_TOKEN_HERE"  # Replace with a valid JWT token
SHIPPING_ID="REPLACE_WITH_VALID_SHIPPING_ID" # Replace with an actual shipment ID
curl -X PATCH "http://localhost:3002/shipments/$SHIPPING_ID/status" \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer $TOKEN" \
     -d '{"status": "shipped"}'
```

**5. Delete Shipment (Requires JWT Token)**

```bash
TOKEN="YOUR_JWT_TOKEN_HERE"  # Replace with a valid JWT token
SHIPPING_ID="REPLACE_WITH_VALID_SHIPPING_ID" # Replace with an actual shipment ID
curl -X DELETE "http://localhost:3002/shipments/$SHIPPING_ID" \
     -H "Authorization: Bearer $TOKEN"
```
