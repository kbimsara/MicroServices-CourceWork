# OAuth2 Token Generator - GlobalBooks ESB Orchestrator
# PowerShell Script Version

param(
    [string]$Method = "",
    [string]$ClientId = "",
    [string]$Username = "",
    [string]$Password = "",
    [string]$Token = ""
)

function Show-Menu {
    Clear-Host
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "    OAuth2 TOKEN GENERATOR" -ForegroundColor Yellow
    Write-Host "    GlobalBooks ESB Orchestrator" -ForegroundColor Yellow
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Choose authentication method:" -ForegroundColor White
    Write-Host ""
    Write-Host "1. Client Credentials (Service-to-Service)" -ForegroundColor Green
    Write-Host "2. User Login (Username/Password)" -ForegroundColor Green
    Write-Host "3. Test with existing token" -ForegroundColor Green
    Write-Host "4. Quick Client Token (globalbooks-service-client)" -ForegroundColor Magenta
    Write-Host "5. Quick Admin Token (admin@globalbooks.com)" -ForegroundColor Magenta
    Write-Host "6. Exit" -ForegroundColor Red
    Write-Host ""
}

function Get-ClientCredentialsToken {
    param([string]$ClientId, [string]$ClientSecret)
    
    try {
        $body = @{
            client_id = $ClientId
            client_secret = $ClientSecret
        } | ConvertTo-Json
        
        $response = Invoke-RestMethod -Uri "http://localhost:3003/oauth2/client-token" -Method POST -Headers @{"Content-Type"="application/json"} -Body $body -ErrorAction Stop
        
        Write-Host "✅ TOKEN GENERATED SUCCESSFULLY!" -ForegroundColor Green
        Write-Host ""
        Write-Host "🔑 ACCESS TOKEN:" -ForegroundColor Yellow
        Write-Host $response.access_token -ForegroundColor White
        Write-Host ""
        Write-Host "📋 TOKEN TYPE:" -ForegroundColor Yellow
        Write-Host $response.token_type -ForegroundColor White
        Write-Host ""
        Write-Host "⏰ EXPIRES IN:" -ForegroundColor Yellow
        Write-Host $response.expires_in -ForegroundColor White
        Write-Host ""
        Write-Host "🎯 SCOPE:" -ForegroundColor Yellow
        Write-Host $response.scope -ForegroundColor White
        Write-Host ""
        Write-Host "📝 CLIENT ID:" -ForegroundColor Yellow
        Write-Host $response.client.id -ForegroundColor White
        Write-Host ""
        Write-Host "💡 COPY THE ACCESS TOKEN ABOVE TO USE IN YOUR REQUESTS!" -ForegroundColor Magenta
        
        return $response.access_token
    }
    catch {
        Write-Host "❌ ERROR GENERATING TOKEN:" -ForegroundColor Red
        Write-Host $_.Exception.Message -ForegroundColor Red
        return $null
    }
}

function Get-UserLoginToken {
    param([string]$Username, [string]$Password, [string]$ClientId, [string]$ClientSecret)
    
    try {
        $body = @{
            username = $Username
            password = $Password
            client_id = $ClientId
            client_secret = $ClientSecret
        } | ConvertTo-Json
        
        $response = Invoke-RestMethod -Uri "http://localhost:3003/oauth2/login" -Method POST -Headers @{"Content-Type"="application/json"} -Body $body -ErrorAction Stop
        
        Write-Host "✅ LOGIN SUCCESSFUL!" -ForegroundColor Green
        Write-Host ""
        Write-Host "🔑 ACCESS TOKEN:" -ForegroundColor Yellow
        Write-Host $response.access_token -ForegroundColor White
        Write-Host ""
        Write-Host "🔄 REFRESH TOKEN:" -ForegroundColor Yellow
        Write-Host $response.refresh_token -ForegroundColor White
        Write-Host ""
        Write-Host "📋 TOKEN TYPE:" -ForegroundColor Yellow
        Write-Host $response.token_type -ForegroundColor White
        Write-Host ""
        Write-Host "⏰ EXPIRES IN:" -ForegroundColor Yellow
        Write-Host $response.expires_in -ForegroundColor White
        Write-Host ""
        Write-Host "🎯 SCOPE:" -ForegroundColor Yellow
        Write-Host $response.scope -ForegroundColor White
        Write-Host ""
        Write-Host "👤 USER INFO:" -ForegroundColor Yellow
        Write-Host "ID: $($response.user.id)" -ForegroundColor White
        Write-Host "Username: $($response.user.username)" -ForegroundColor White
        Write-Host "Name: $($response.user.firstName) $($response.user.lastName)" -ForegroundColor White
        Write-Host "Email: $($response.user.email)" -ForegroundColor White
        Write-Host ""
        Write-Host "💡 COPY THE ACCESS TOKEN ABOVE TO USE IN YOUR REQUESTS!" -ForegroundColor Magenta
        
        return $response.access_token
    }
    catch {
        Write-Host "❌ LOGIN FAILED:" -ForegroundColor Red
        Write-Host $_.Exception.Message -ForegroundColor Red
        return $null
    }
}

function Test-Token {
    param([string]$Token)
    
    try {
        $body = @{
            token = $Token
        } | ConvertTo-Json
        
        $response = Invoke-RestMethod -Uri "http://localhost:3003/oauth2/validate" -Method POST -Headers @{"Content-Type"="application/json"} -Body $body -ErrorAction Stop
        
        if ($response.valid) {
            Write-Host "✅ TOKEN IS VALID!" -ForegroundColor Green
            Write-Host ""
            Write-Host "📋 TOKEN INFO:" -ForegroundColor Yellow
            Write-Host "User ID: $($response.token_info.userId)" -ForegroundColor White
            Write-Host "Username: $($response.token_info.username)" -ForegroundColor White
            Write-Host "Scope: $($response.token_info.scope)" -ForegroundColor White
            Write-Host "Client ID: $($response.token_info.clientId)" -ForegroundColor White
            Write-Host "Type: $($response.token_info.type)" -ForegroundColor White
            Write-Host "Expires: $($response.token_info.exp)" -ForegroundColor White
            Write-Host "Issued: $($response.token_info.iat)" -ForegroundColor White
        } else {
            Write-Host "❌ TOKEN IS INVALID!" -ForegroundColor Red
        }
    }
    catch {
        Write-Host "❌ TOKEN VALIDATION FAILED:" -ForegroundColor Red
        Write-Host $_.Exception.Message -ForegroundColor Red
    }
}

function Quick-ClientToken {
    Write-Host "🚀 Generating quick client token..." -ForegroundColor Cyan
    $token = Get-ClientCredentialsToken -ClientId "globalbooks-service-client" -ClientSecret "service-client-secret-2024"
    if ($token) {
        Write-Host ""
        Write-Host "📋 QUICK COPY COMMAND:" -ForegroundColor Yellow
        Write-Host "curl -H 'Authorization: Bearer $token' http://localhost:3003/workflows" -ForegroundColor White
    }
}

function Quick-AdminToken {
    Write-Host "🚀 Generating quick admin token..." -ForegroundColor Cyan
    $token = Get-UserLoginToken -Username "admin@globalbooks.com" -Password "admin123" -ClientId "globalbooks-web-client" -ClientSecret "web-client-secret-2024"
    if ($token) {
        Write-Host ""
        Write-Host "📋 QUICK COPY COMMAND:" -ForegroundColor Yellow
        Write-Host "curl -H 'Authorization: Bearer $token' http://localhost:3003/workflows" -ForegroundColor White
    }
}

# Main execution
if ($Method -eq "client") {
    Get-ClientCredentialsToken -ClientId "globalbooks-service-client" -ClientSecret "service-client-secret-2024"
    exit
}

if ($Method -eq "admin") {
    Get-UserLoginToken -Username "admin@globalbooks.com" -Password "admin123" -ClientId "globalbooks-web-client" -ClientSecret "web-client-secret-2024"
    exit
}

if ($Method -eq "test" -and $Token) {
    Test-Token -Token $Token
    exit
}

# Interactive menu
do {
    Show-Menu
    $choice = Read-Host "Enter your choice (1-6)"
    
    switch ($choice) {
        "1" {
            Write-Host ""
            Write-Host "Available clients:" -ForegroundColor Cyan
            Write-Host "1. globalbooks-service-client (read write admin)" -ForegroundColor White
            Write-Host "2. globalbooks-web-client (read write admin)" -ForegroundColor White
            Write-Host "3. globalbooks-mobile-client (read write)" -ForegroundColor White
            Write-Host ""
            $clientChoice = Read-Host "Select client (1-3)"
            
            switch ($clientChoice) {
                "1" { Get-ClientCredentialsToken -ClientId "globalbooks-service-client" -ClientSecret "service-client-secret-2024" }
                "2" { Get-ClientCredentialsToken -ClientId "globalbooks-web-client" -ClientSecret "web-client-secret-2024" }
                "3" { Get-ClientCredentialsToken -ClientId "globalbooks-mobile-client" -ClientSecret "mobile-client-secret-2024" }
                default { Write-Host "Invalid choice!" -ForegroundColor Red }
            }
        }
        "2" {
            Write-Host ""
            Write-Host "Available users:" -ForegroundColor Cyan
            Write-Host "1. admin@globalbooks.com (admin - read write admin)" -ForegroundColor White
            Write-Host "2. user@globalbooks.com (user - read write)" -ForegroundColor White
            Write-Host ""
            $userChoice = Read-Host "Select user (1-2)"
            
            switch ($userChoice) {
                "1" { Get-UserLoginToken -Username "admin@globalbooks.com" -Password "admin123" -ClientId "globalbooks-web-client" -ClientSecret "web-client-secret-2024" }
                "2" { Get-UserLoginToken -Username "user@globalbooks.com" -Password "user123" -ClientId "globalbooks-web-client" -ClientSecret "web-client-secret-2024" }
                default { Write-Host "Invalid choice!" -ForegroundColor Red }
            }
        }
        "3" {
            Write-Host ""
            $token = Read-Host "Enter your access token"
            if ($token) {
                Test-Token -Token $token
            }
        }
        "4" {
            Quick-ClientToken
        }
        "5" {
            Quick-AdminToken
        }
        "6" {
            Write-Host "👋 Thank you for using OAuth2 Token Generator!" -ForegroundColor Green
            exit
        }
        default {
            Write-Host "❌ Invalid choice! Please enter 1-6." -ForegroundColor Red
        }
    }
    
    if ($choice -ne "6") {
        Write-Host ""
        Write-Host "Press any key to continue..." -ForegroundColor Yellow
        $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    }
} while ($choice -ne "6")
