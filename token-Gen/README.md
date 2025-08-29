# 🔐 OAuth2 Token Generation Tools

This directory contains all the tools needed to generate, test, and manage OAuth2 access tokens for the MicroServices Orchestrator.

## 📁 **Directory Contents**

- **`generate-token.bat`** - Windows batch script for interactive token generation
- **`generate-token.ps1`** - PowerShell script for token generation (interactive + command-line)
- **`test-token.ps1`** - PowerShell script to test token functionality
- **`TOKEN-GENERATOR-README.md`** - Detailed documentation for token generation

## 🚀 **Quick Start**

### **Option 1: Windows Batch File (Recommended for Windows Users)**
```bash
# Double-click the file or run from command line
generate-token.bat
```

### **Option 2: PowerShell Script**
```powershell
# Interactive mode
.\generate-token.ps1

# Quick client token generation
.\generate-token.ps1 -Method client

# Quick admin token generation  
.\generate-token.ps1 -Method admin
```

### **Option 3: Test Token Functionality**
```powershell
# Test complete OAuth2 flow
.\test-token.ps1
```

## 🔑 **Available Authentication Methods**

### **Client Credentials Flow**
- **Client ID**: `globalbooks-service-client`
- **Client Secret**: `service-client-secret-2024`
- **Scope**: `read write admin`

### **User Login Flow**
- **Admin User**: `admin@globalbooks.com` / `admin123`
- **Regular User**: `user@globalbooks.com` / `user123`

## 📋 **Token Usage Examples**

### **Using Generated Token in HTTPie GUI**
1. Generate token using any tool above
2. In HTTPie GUI, add header:
   ```
   Authorization: Bearer YOUR_TOKEN_HERE
   ```
3. Test endpoints:
   - `GET http://localhost:3003/workflows`
   - `GET http://localhost:3003/purchase/order/{orderId}`
   - `POST http://localhost:3003/purchase`

### **Using Token in PowerShell**
```powershell
$token = "YOUR_GENERATED_TOKEN"
$headers = @{"Authorization" = "Bearer $token"}

# Test protected endpoint
Invoke-WebRequest -Uri "http://localhost:3003/workflows" -Headers $headers
```

### **Using Token in cURL**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:3003/workflows
```

## 🔧 **Configuration Details**

### **JWT Settings**
- **Secret**: `globalbooks-super-secret-jwt-key-2024-production-ready`
- **Access Token Lifetime**: 1 hour (3600 seconds)
- **Refresh Token Lifetime**: 14 days (1209600 seconds)

### **Supported Grant Types**
- `client_credentials` - For service-to-service communication
- `password` - For user authentication
- `refresh_token` - For token renewal

## 🧪 **Testing & Validation**

### **Test Token Validation**
```powershell
# Validate a token
$body = @{token = "YOUR_TOKEN"} | ConvertTo-Json
Invoke-WebRequest -Uri "http://localhost:3003/oauth2/validate" \
                 -Method POST \
                 -Headers @{"Content-Type"="application/json"} \
                 -Body $body
```

### **Test Protected Endpoints**
```powershell
# Test workflows endpoint
Invoke-WebRequest -Uri "http://localhost:3003/workflows" \
                 -Headers @{"Authorization"="Bearer YOUR_TOKEN"}

# Test ESB config endpoint
Invoke-WebRequest -Uri "http://localhost:3003/esb-config" \
                 -Headers @{"Authorization"="Bearer YOUR_TOKEN"}
```

## 🚨 **Troubleshooting**

### **Common Issues**

1. **"Invalid or expired token"**
   - Check if token has expired (1 hour lifetime)
   - Verify token format: `Bearer TOKEN`
   - Ensure you're using the Orchestrator service (port 3003)

2. **"Authorization header required"**
   - Make sure to include `Authorization: Bearer TOKEN` header
   - Check header spelling and format

3. **"Insufficient permissions"**
   - Verify token has required scope (`read`, `write`, `admin`)
   - Use appropriate client or user credentials

### **Debug Steps**
1. Run `test-token.ps1` to verify OAuth2 system
2. Check service logs: `docker-compose logs orchestratorservice`
3. Validate token using `/oauth2/validate` endpoint
4. Ensure service is running: `docker-compose ps`

## 📚 **Additional Resources**

- **Swagger UI**: `http://localhost:3003/api-docs`
- **OAuth2 Config**: `http://localhost:3003/oauth2/config`
- **Service Status**: Check Docker Compose logs

## 🔒 **Security Notes**

- **Never share** your JWT secret in production
- **Rotate tokens** regularly in production environments
- **Use HTTPS** for production deployments
- **Store secrets** securely (not in code)

---

**🎯 Your OAuth2 system is fully functional! Use these tools to generate tokens and test your protected endpoints.**
