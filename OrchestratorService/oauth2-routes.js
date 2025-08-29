const express = require('express');
const bcrypt = require('bcryptjs');
const { jwtUtils, oauth2Config } = require('./oauth2-config');

const router = express.Router();

// User Login Endpoint (for password grant)
router.post('/login', async (req, res) => {
    try {
        const { username, password, client_id, client_secret } = req.body;
        
        if (!username || !password || !client_id || !client_secret) {
            return res.status(400).json({
                error: 'invalid_request',
                message: 'username, password, client_id, and client_secret are required'
            });
        }
        
        // Verify client credentials
        const client = oauth2Config.clients.find(c => 
            c.id === client_id && c.secret === client_secret
        );
        
        if (!client) {
            return res.status(401).json({
                error: 'invalid_client',
                message: 'Invalid client credentials'
            });
        }
        
        // Verify user credentials
        const user = oauth2Config.users.find(u => u.username === username);
        if (!user) {
            return res.status(401).json({
                error: 'invalid_grant',
                message: 'Invalid username or password'
            });
        }
        
        // Check if password matches
        const isValidPassword = bcrypt.compareSync(password, user.password);
        
        if (!isValidPassword) {
            return res.status(401).json({
                error: 'invalid_grant',
                message: 'Invalid username or password'
            });
        }
        
        // Generate JWT token
        const tokenPayload = {
            userId: user.id,
            username: user.username,
            scope: user.scope,
            clientId: client.id,
            type: 'access_token'
        };
        
        const accessToken = jwtUtils.generateToken(tokenPayload, '1h');
        const refreshToken = jwtUtils.generateToken({
            ...tokenPayload,
            type: 'refresh_token'
        }, '14d');
        
        res.json({
            access_token: accessToken,
            token_type: 'Bearer',
            expires_in: 3600,
            refresh_token: refreshToken,
            scope: user.scope,
            user: {
                id: user.id,
                username: user.username,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                scope: user.scope
            }
        });
        
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({
            error: 'server_error',
            message: 'Internal server error during login'
        });
    }
});

// Client Credentials Token Endpoint
router.post('/client-token', async (req, res) => {
    try {
        const { client_id, client_secret } = req.body;
        
        if (!client_id || !client_secret) {
            return res.status(400).json({
                error: 'invalid_request',
                message: 'client_id and client_secret are required'
            });
        }
        
        // Verify client credentials
        const client = oauth2Config.clients.find(c => 
            c.id === client_id && c.secret === client_secret
        );
        
        if (!client) {
            return res.status(401).json({
                error: 'invalid_client',
                message: 'Invalid client credentials'
            });
        }
        
        // Generate JWT token for client
        const tokenPayload = {
            clientId: client.id,
            scope: client.scope,
            type: 'client_credentials'
        };
        
        console.log('Generating client token with payload:', tokenPayload);
        const accessToken = jwtUtils.generateToken(tokenPayload, '1h');
        console.log('Generated token (first 20 chars):', accessToken.substring(0, 20) + '...');
        
        res.json({
            access_token: accessToken,
            token_type: 'Bearer',
            expires_in: 3600,
            scope: client.scope,
            client: {
                id: client.id,
                scope: client.scope
            }
        });
        
    } catch (error) {
        console.error('Client Token Error:', error);
        res.status(500).json({
            error: 'server_error',
            message: 'Internal server error during client token generation'
        });
    }
});

// Token Validation Endpoint
router.post('/validate', async (req, res) => {
    try {
        const { token } = req.body;
        
        if (!token) {
            return res.status(400).json({
                error: 'invalid_request',
                message: 'token is required'
            });
        }
        
        // Verify and decode token
        console.log('Validating token:', token.substring(0, 20) + '...');
        const decoded = jwtUtils.verifyToken(token);
        console.log('Token verification result:', decoded ? 'SUCCESS' : 'FAILED');
        
        if (!decoded) {
            console.log('Token validation failed - token is invalid or expired');
            return res.status(401).json({
                error: 'invalid_token',
                message: 'Token is invalid or expired'
            });
        }
        
        // Return token information
        res.json({
            valid: true,
            token_info: {
                userId: decoded.userId,
                username: decoded.username,
                scope: decoded.scope,
                clientId: decoded.clientId,
                type: decoded.type,
                exp: decoded.exp,
                iat: decoded.iat
            }
        });
        
    } catch (error) {
        console.error('Token Validation Error:', error);
        res.status(500).json({
            error: 'server_error',
            message: 'Internal server error during token validation'
        });
    }
});

// Token Revocation Endpoint
router.post('/revoke', async (req, res) => {
    try {
        const { token } = req.body;
        
        if (!token) {
            return res.status(400).json({
                error: 'invalid_request',
                message: 'token is required'
            });
        }
        
        // In production, add token to blacklist/revoked tokens table
        // For now, just return success
        res.json({
            message: 'Token revoked successfully'
        });
        
    } catch (error) {
        console.error('Token Revocation Error:', error);
        res.status(500).json({
            error: 'server_error',
            message: 'Internal server error during token revocation'
        });
    }
});

// Get OAuth2 Configuration (public endpoint)
router.get('/config', (req, res) => {
    res.json({
        authorization_endpoint: '/oauth2/authorize',
        token_endpoint: '/oauth2/token',
        login_endpoint: '/oauth2/login',
        client_token_endpoint: '/oauth2/client-token',
        validate_endpoint: '/oauth2/validate',
        revoke_endpoint: '/oauth2/revoke',
        supported_grant_types: oauth2Config.supportedGrantTypes,
        scopes: oauth2Config.scopes,
        token_lifetime: {
            access_token: oauth2Config.accessTokenLifetime,
            refresh_token: oauth2Config.refreshTokenLifetime
        }
    });
});

// Get Available Clients (for development/testing)
router.get('/clients', (req, res) => {
    const publicClients = oauth2Config.clients.map(client => ({
        id: client.id,
        grants: client.grants,
        scope: client.scope,
        redirectUris: client.redirectUris
    }));
    
    res.json({
        clients: publicClients,
        message: 'These are the available OAuth2 clients for testing'
    });
});

module.exports = router;
