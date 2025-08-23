### CatalogService REST API cURL Commands

**1. Get JWT Token (Authentication)**

```bash
curl -X POST http://localhost:8080/api/auth/token \
     -H "Content-Type: application/json" \
     -d '{"username": "user", "password": "password"}'
```

*   **Note:** Replace `user` and `password` with the credentials defined in `SecurityConfig.java`.
*   This command will return a JWT token. You will need to copy this token to authorize subsequent requests to secure REST endpoints.

**2. Create Product (Requires JWT Token)**

```bash
TOKEN="YOUR_JWT_TOKEN_HERE"  # Replace with the actual JWT token
curl -X POST http://localhost:8080/api/products \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer $TOKEN" \
     -d '{
           "id": "5",
           "name": "The Hobbit",
           "description": "Fantasy novel by J.R.R. Tolkien",
           "price": 18.00,
           "quantity": 75
         }'
```

**3. Get All Products (Requires JWT Token)**

```bash
TOKEN="YOUR_JWT_TOKEN_HERE"  # Replace with the actual JWT token
curl -X GET http://localhost:8080/api/products \
     -H "Authorization: Bearer $TOKEN"
```

**4. Get Product By ID (Requires JWT Token)**

```bash
TOKEN="YOUR_JWT_TOKEN_HERE"  # Replace with the actual JWT token
PRODUCT_ID="1" # Replace with an existing product ID, e.g., '1'
curl -X GET "http://localhost:8080/api/products/$PRODUCT_ID" \
     -H "Authorization: Bearer $TOKEN"
```
