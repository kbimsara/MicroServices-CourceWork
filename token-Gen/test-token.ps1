# Test Token Generation and Usage
Write-Host "=== OAuth2 Token Test Script ===" -ForegroundColor Green

# Step 1: Generate Token
Write-Host "`n1. Generating client token..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3003/oauth2/client-token" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"client_id": "globalbooks-service-client", "client_secret": "service-client-secret-2024"}'
    $tokenData = $response.Content | ConvertFrom-Json
    $token = $tokenData.access_token
    Write-Host "✅ Token generated successfully!" -ForegroundColor Green
    Write-Host "Token (first 50 chars): $($token.Substring(0,50))..." -ForegroundColor Cyan
} catch {
    Write-Host "❌ Token generation failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Step 2: Validate Token
Write-Host "`n2. Validating token..." -ForegroundColor Yellow
try {
    $body = @{token = $token} | ConvertTo-Json
    $validateResponse = Invoke-WebRequest -Uri "http://localhost:3003/oauth2/validate" -Method POST -Headers @{"Content-Type"="application/json"} -Body $body
    Write-Host "✅ Token validation successful!" -ForegroundColor Green
    Write-Host "Response: $($validateResponse.Content)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Token validation failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Step 3: Test Protected Endpoint
Write-Host "`n3. Testing protected endpoint (/workflows)..." -ForegroundColor Yellow
try {
    $protectedResponse = Invoke-WebRequest -Uri "http://localhost:3003/workflows" -Headers @{"Authorization"="Bearer $token"}
    Write-Host "✅ Protected endpoint access successful!" -ForegroundColor Green
    Write-Host "Response: $($protectedResponse.Content)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Protected endpoint access failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Status Code: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    Write-Host "Response: $($_.Exception.Response.Content)" -ForegroundColor Red
    exit 1
}

# Step 4: Test Purchase Endpoint
Write-Host "`n4. Testing purchase endpoint (/purchase/order/test123)..." -ForegroundColor Yellow
try {
    $purchaseResponse = Invoke-WebRequest -Uri "http://localhost:3003/purchase/order/test123" -Headers @{"Authorization"="Bearer $token"}
    Write-Host "✅ Purchase endpoint access successful!" -ForegroundColor Green
    Write-Host "Response: $($purchaseResponse.Content)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Purchase endpoint access failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Status Code: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    Write-Host "Response: $($_.Exception.Response.Content)" -ForegroundColor Red
}

Write-Host "`n=== Test Complete ===" -ForegroundColor Green
Write-Host "Your token is working correctly!" -ForegroundColor Green
Write-Host "Token: $token" -ForegroundColor Cyan
