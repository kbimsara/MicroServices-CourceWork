# 🔑 OAuth2 Token Generator for GlobalBooks ESB Orchestrator

This directory contains tools to generate OAuth2 access tokens for testing your protected API endpoints.

## 📁 Files

- **`generate-token.bat`** - Windows Batch file (interactive menu)
- **`generate-token.ps1`** - PowerShell script (interactive + command-line)
- **`TOKEN-GENERATOR-README.md`** - This documentation

## 🚀 Quick Start

### **Option 1: Windows Batch File (Easiest)**
1. **Double-click** `generate-token.bat`
2. **Choose your authentication method** from the menu
3. **Copy the generated token** for use in your requests

### **Option 2: PowerShell Script (Recommended)**
1. **Right-click** `generate-token.ps1` → "Run with PowerShell"
2. **Or run from command line** with parameters

## 🔐 Available Authentication Methods

### **1. Client Credentials (Service-to-Service)**
- **globalbooks-service-client** - Full access (read, write, admin)
- **globalbooks-web-client** - Full access (read, write, admin)  
- **globalbooks-mobile-client** - Limited access (read, write)

### **2. User Login (Username/Password)**
- **admin@globalbooks.com** / **admin123** - Admin access (read, write, admin)
- **user@globalbooks.com** / **user123** - User access (read, write)

## 💻 Command-Line Usage

### **Quick Client Token**
```powershell
.\generate-token.ps1 -Method client
```

### **Quick Admin Token**
```powershell
.\generate-token.ps1 -Method admin
```

### **Test Existing Token**
```powershell
.\generate-token.ps1 -Method test -Token "your_token_here"
```

## 📋 Using Generated Tokens

### **HTTPie GUI**
```
Authorization: Bearer YOUR_ACCESS_TOKEN_HERE
```

### **cURL**
```bash
curl -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE" \
     http://localhost:3003/workflows
```

### **PowerShell**
```powershell
$headers = @{
    "Authorization" = "Bearer YOUR_ACCESS_TOKEN_HERE"
    "Content-Type" = "application/json"
}

Invoke-RestMethod -Uri "http://localhost:3003/workflows" -Headers $headers
```

## 🧪 Testing Protected Endpoints

### **Read Endpoints (require 'read' scope)**
- `GET /workflows` - List all workflows
- `GET /purchase/order/{orderId}` - Get purchase details
- `GET /workflow/{workflowId}` - Get workflow status
- `GET /workflow-definition` - Get workflow definition
- `GET /esb-config` - Get ESB configuration

### **Write Endpoints (require 'write' scope)**
- `POST /purchase` - Create new purchase order

### **Admin Endpoints (require 'admin' scope)**
- All endpoints above plus potential admin-only features

## 🔍 Token Information

Each generated token includes:
- **Access Token** - JWT token for API requests
- **Token Type** - Always "Bearer"
- **Expires In** - Token lifetime in seconds (default: 1 hour)
- **Scope** - Granted permissions
- **Client/User Info** - Authentication context

## 🚨 Troubleshooting

### **Service Not Running**
```bash
docker-compose ps
docker-compose logs orchestratorservice
```

### **Authentication Failed**
- Verify client credentials are correct
- Check if the service is accessible at `http://localhost:3003`
- Ensure OAuth2 endpoints are working

### **Token Expired**
- Generate a new token (tokens expire after 1 hour)
- Use refresh token if available (user login only)

### **Insufficient Permissions**
- Check the token scope matches endpoint requirements
- Use admin account for full access

## 📱 Example Workflow

1. **Generate Token**: Run the token generator
2. **Copy Token**: Copy the access token from output
3. **Test Endpoint**: Use token in Authorization header
4. **Verify Access**: Check if endpoint responds correctly

## 🔒 Security Notes

- **Never share tokens** - they provide access to your account
- **Tokens expire** - regenerate when needed
- **Use appropriate scopes** - don't use admin tokens for basic operations
- **Test in development** - these are development credentials

## 🎯 Quick Commands

### **Generate Service Client Token**
```powershell
.\generate-token.ps1 -Method client
```

### **Generate Admin User Token**
```powershell
.\generate-token.ps1 -Method admin
```

### **Test Token Validity**
```powershell
.\generate-token.ps1 -Method test -Token "your_token"
```

### **Interactive Menu**
```powershell
.\generate-token.ps1
```

---

**🎉 Happy Testing with OAuth2! 🚀**
