@echo off
title OAuth2 Token Generator - GlobalBooks ESB Orchestrator
color 0A

echo.
echo ========================================
echo    OAuth2 TOKEN GENERATOR
echo    GlobalBooks ESB Orchestrator
echo ========================================
echo.

echo Choose authentication method:
echo.
echo 1. Client Credentials (Service-to-Service)
echo 2. User Login (Username/Password)
echo 3. Test with existing token
echo 4. Exit
echo.

set /p choice="Enter your choice (1-4): "

if "%choice%"=="1" goto client_credentials
if "%choice%"=="2" goto user_login
if "%choice%"=="3" goto test_token
if "%choice%"=="4" goto exit
goto invalid_choice

:client_credentials
echo.
echo ========================================
echo    CLIENT CREDENTIALS TOKEN
echo ========================================
echo.
echo Available clients:
echo 1. globalbooks-service-client (read write admin)
echo 2. globalbooks-web-client (read write admin)
echo 3. globalbooks-mobile-client (read write)
echo.

set /p client_choice="Select client (1-3): "

if "%client_choice%"=="1" (
    set client_id=globalbooks-service-client
    set client_secret=service-client-secret-2024
) else if "%client_choice%"=="2" (
    set client_id=globalbooks-web-client
    set client_secret=web-client-secret-2024
) else if "%client_choice%"=="3" (
    set client_id=globalbooks-mobile-client
    set client_secret=mobile-client-secret-2024
) else (
    echo Invalid choice!
    pause
    goto client_credentials
)

echo.
echo Generating token for: %client_id%
echo.

powershell -Command "try { $response = Invoke-RestMethod -Uri 'http://localhost:3003/oauth2/client-token' -Method POST -Headers @{'Content-Type'='application/json'} -Body '{\"client_id\":\"%client_id%\",\"client_secret\":\"%client_secret%\"}' -ErrorAction Stop; Write-Host '✅ TOKEN GENERATED SUCCESSFULLY!' -ForegroundColor Green; Write-Host ''; Write-Host '🔑 ACCESS TOKEN:' -ForegroundColor Yellow; Write-Host $response.access_token -ForegroundColor White; Write-Host ''; Write-Host '📋 TOKEN TYPE:' -ForegroundColor Yellow; Write-Host $response.token_type -ForegroundColor White; Write-Host ''; Write-Host '⏰ EXPIRES IN:' -ForegroundColor Yellow; Write-Host $response.expires_in -ForegroundColor White; Write-Host ''; Write-Host '🎯 SCOPE:' -ForegroundColor Yellow; Write-Host $response.scope -ForegroundColor White; Write-Host ''; Write-Host '📝 CLIENT ID:' -ForegroundColor Yellow; Write-Host $response.client.id -ForegroundColor White; Write-Host ''; Write-Host '📋 FULL RESPONSE:' -ForegroundColor Cyan; $response | ConvertTo-Json -Depth 3 | Write-Host -ForegroundColor White; Write-Host ''; Write-Host '💡 COPY THE ACCESS TOKEN ABOVE TO USE IN YOUR REQUESTS!' -ForegroundColor Magenta; } catch { Write-Host '❌ ERROR GENERATING TOKEN:' -ForegroundColor Red; Write-Host $_.Exception.Message -ForegroundColor Red; }"

echo.
echo ========================================
echo.
pause
goto menu

:user_login
echo.
echo ========================================
echo    USER LOGIN TOKEN
echo ========================================
echo.
echo Available users:
echo 1. admin@globalbooks.com (admin - read write admin)
echo 2. user@globalbooks.com (user - read write)
echo.

set /p user_choice="Select user (1-2): "

if "%user_choice%"=="1" (
    set username=admin@globalbooks.com
    set password=admin123
    set client_id=globalbooks-web-client
    set client_secret=web-client-secret-2024
) else if "%user_choice%"=="2" (
    set username=user@globalbooks.com
    set password=user123
    set client_id=globalbooks-web-client
    set client_secret=web-client-secret-2024
) else (
    echo Invalid choice!
    pause
    goto user_login
)

echo.
echo Logging in as: %username%
echo.

powershell -Command "try { $response = Invoke-RestMethod -Uri 'http://localhost:3003/oauth2/login' -Method POST -Headers @{'Content-Type'='application/json'} -Body '{\"username\":\"%username%\",\"password\":\"%password%\",\"client_id\":\"%client_id%\",\"client_secret\":\"%client_secret%\"}' -ErrorAction Stop; Write-Host '✅ LOGIN SUCCESSFUL!' -ForegroundColor Green; Write-Host ''; Write-Host '🔑 ACCESS TOKEN:' -ForegroundColor Yellow; Write-Host $response.access_token -ForegroundColor White; Write-Host ''; Write-Host '🔄 REFRESH TOKEN:' -ForegroundColor Yellow; Write-Host $response.refresh_token -ForegroundColor White; Write-Host ''; Write-Host '📋 TOKEN TYPE:' -ForegroundColor Yellow; Write-Host $response.token_type -ForegroundColor White; Write-Host ''; Write-Host '⏰ EXPIRES IN:' -ForegroundColor Yellow; Write-Host $response.expires_in -ForegroundColor White; Write-Host ''; Write-Host '🎯 SCOPE:' -ForegroundColor Yellow; Write-Host $response.scope -ForegroundColor White; Write-Host ''; Write-Host '👤 USER INFO:' -ForegroundColor Yellow; Write-Host 'ID: ' $response.user.id -ForegroundColor White; Write-Host 'Username: ' $response.user.username -ForegroundColor White; Write-Host 'Name: ' $response.user.firstName ' ' $response.user.lastName -ForegroundColor White; Write-Host 'Email: ' $response.user.email -ForegroundColor White; Write-Host ''; Write-Host '📋 FULL RESPONSE:' -ForegroundColor Cyan; $response | ConvertTo-Json -Depth 3 | Write-Host -ForegroundColor White; Write-Host ''; Write-Host '💡 COPY THE ACCESS TOKEN ABOVE TO USE IN YOUR REQUESTS!' -ForegroundColor Magenta; } catch { Write-Host '❌ LOGIN FAILED:' -ForegroundColor Red; Write-Host $_.Exception.Message -ForegroundColor Red; }"

echo.
echo ========================================
echo.
pause
goto menu

:test_token
echo.
echo ========================================
echo    TEST EXISTING TOKEN
echo ========================================
echo.
set /p token="Enter your access token: "

if "%token%"=="" (
    echo No token entered!
    pause
    goto test_token
)

echo.
echo Testing token validity...
echo.

powershell -Command "try { $response = Invoke-RestMethod -Uri 'http://localhost:3003/oauth2/validate' -Method POST -Headers @{'Content-Type'='application/json'} -Body '{\"token\":\"%token%\"}' -ErrorAction Stop; if ($response.valid) { Write-Host '✅ TOKEN IS VALID!' -ForegroundColor Green; Write-Host ''; Write-Host '📋 TOKEN INFO:' -ForegroundColor Yellow; Write-Host 'User ID: ' $response.token_info.userId -ForegroundColor White; Write-Host 'Username: ' $response.token_info.username -ForegroundColor White; Write-Host 'Scope: ' $response.token_info.scope -ForegroundColor White; Write-Host 'Client ID: ' $response.token_info.clientId -ForegroundColor White; Write-Host 'Type: ' $response.token_info.type -ForegroundColor White; Write-Host 'Expires: ' $response.token_info.exp -ForegroundColor White; Write-Host 'Issued: ' $response.token_info.iat -ForegroundColor White; } else { Write-Host '❌ TOKEN IS INVALID!' -ForegroundColor Red; } } catch { Write-Host '❌ TOKEN VALIDATION FAILED:' -ForegroundColor Red; Write-Host $_.Exception.Message -ForegroundColor Red; }"

echo.
echo ========================================
echo.
pause
goto menu

:invalid_choice
echo.
echo  Invalid choice! Please enter 1-4.
echo.
pause
goto menu

:menu
cls
echo.
echo ========================================
echo    OAuth2 TOKEN GENERATOR
echo    GlobalBooks ESB Orchestrator
echo ========================================
echo.

echo Choose authentication method:
echo.
echo 1. Client Credentials (Service-to-Service)
echo 2. User Login (Username/Password)
echo 3. Test with existing token
echo 4. Exit
echo.

set /p choice="Enter your choice (1-4): "

if "%choice%"=="1" goto client_credentials
if "%choice%"=="2" goto user_login
if "%choice%"=="3" goto test_token
if "%choice%"=="4" goto exit
goto invalid_choice

:exit
echo.
echo  Thank you for using OAuth2 Token Generator!
echo  ===========================================
echo.
pause
exit
