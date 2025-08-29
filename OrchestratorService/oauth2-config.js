const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// OAuth2 Configuration
const oauth2Config = {
    // JWT Secret for token signing - MUST be consistent across service restarts
    jwtSecret: 'globalbooks-super-secret-jwt-key-2024-production-ready',
    
    // Token expiration times
    accessTokenLifetime: 3600, // 1 hour
    refreshTokenLifetime: 1209600, // 14 days
    
    // Supported grant types
    supportedGrantTypes: ['client_credentials', 'password', 'refresh_token'],
    
    // Client credentials (in production, store in database)
    clients: [
        {
            id: 'globalbooks-web-client',
            secret: 'web-client-secret-2024',
            grants: ['client_credentials', 'password', 'refresh_token'],
            redirectUris: ['http://localhost:3000/callback'],
            scope: 'read write admin'
        },
        {
            id: 'globalbooks-mobile-client',
            secret: 'mobile-client-secret-2024',
            grants: ['password', 'refresh_token'],
            redirectUris: ['com.globalbooks.app://callback'],
            scope: 'read write'
        },
        {
            id: 'globalbooks-service-client',
            secret: 'service-client-secret-2024',
            grants: ['client_credentials'],
            scope: 'read write admin'
        }
    ],
    
    // User accounts (in production, store in database)
    // Using pre-hashed passwords for consistency
    users: [
        {
            id: 'user-001',
            username: 'admin@globalbooks.com',
            password: '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', // admin123
            scope: 'read write admin',
            firstName: 'Admin',
            lastName: 'User',
            email: 'admin@globalbooks.com'
        },
        {
            id: 'user-002',
            username: 'user@globalbooks.com',
            password: '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', // user123
            scope: 'read write',
            firstName: 'Regular',
            lastName: 'User',
            email: 'user@globalbooks.com'
        }
    ],
    
    // Scopes and permissions
    scopes: {
        'read': 'Read access to resources',
        'write': 'Write access to resources',
        'admin': 'Administrative access'
    }
};

// JWT Token utilities
const jwtUtils = {
    // Generate JWT token
    generateToken: (payload, expiresIn = '1h') => {
        return jwt.sign(payload, oauth2Config.jwtSecret, { expiresIn });
    },
    
    // Verify JWT token
    verifyToken: (token) => {
        try {
            return jwt.verify(token, oauth2Config.jwtSecret);
        } catch (error) {
            return null;
        }
    },
    
    // Decode JWT token without verification
    decodeToken: (token) => {
        try {
            return jwt.decode(token);
        } catch (error) {
            return null;
        }
    }
};

// Middleware for OAuth2 authentication
const oauth2Middleware = {
    // Authenticate access token
    authenticateToken: (req, res, next) => {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ 
                error: 'Access token required',
                message: 'Authorization header with Bearer token is required'
            });
        }
        
        const decoded = jwtUtils.verifyToken(token);
        if (!decoded) {
            return res.status(403).json({ 
                error: 'Invalid or expired token',
                message: 'The provided access token is invalid or has expired'
            });
        }
        
        // Add user info to request
        req.user = decoded;
        req.token = token;
        next();
    },
    
    // Check if user has required scope
    requireScope: (requiredScope) => {
        return (req, res, next) => {
            if (!req.user || !req.user.scope) {
                return res.status(403).json({ 
                    error: 'Insufficient permissions',
                    message: 'User scope information is missing'
                });
            }
            
            const userScopes = req.user.scope.split(' ');
            if (!userScopes.includes(requiredScope)) {
                return res.status(403).json({ 
                    error: 'Insufficient permissions',
                    message: `Required scope '${requiredScope}' not granted`
                });
            }
            
            next();
        };
    },
    
    // Check if user has admin access
    requireAdmin: (req, res, next) => {
        if (!req.user || !req.user.scope) {
            return res.status(403).json({ 
                error: 'Insufficient permissions',
                message: 'Admin access required'
            });
        }
        
        const userScopes = req.user.scope.split(' ');
        if (!userScopes.includes('admin')) {
            return res.status(403).json({ 
                error: 'Insufficient permissions',
                message: 'Admin scope required for this operation'
            });
        }
        
        next();
    }
};

module.exports = {
    oauth2Config,
    jwtUtils,
    oauth2Middleware
};
