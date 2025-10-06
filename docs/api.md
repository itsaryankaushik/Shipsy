# 📡 Shipsy API Documentation

> **Complete REST API Reference for Shipsy Shipment Management System**

## 📋 Overview

This document provides comprehensive documentation for all Shipsy API endpoints. The API follows RESTful conventions and uses JWT-based authentication.

**Base URL:** `http://localhost:3000/api` (development)  
**Production URL:** `https://your-domain.vercel.app/api`  
**Authentication:** JWT tokens (httpOnly cookies)  
**Response Format:** JSON  
**Date Format:** ISO 8601 (UTC)  
**API Version:** 1.0

---

## 🔐 Authentication

### Overview
- **Token Type:** JWT (JSON Web Tokens)
- **Storage:** httpOnly cookies (secure, cannot be accessed via JavaScript)
- **Access Token Expiry:** 4 hours
- **Refresh Token Expiry:** 15 days
- **Security:** Bcrypt password hashing (10 rounds)

### Authentication Flow
```
1. Register/Login → Receive JWT tokens (set as httpOnly cookies)
2. Subsequent requests → Cookies automatically sent
3. Token expires → Call /api/auth/refresh
4. Logout → Clear cookies
```

### Protected Endpoints
All endpoints except `/api/auth/register` and `/api/auth/login` require authentication.

---

## 📦 Standard Response Format

### Success Response
```json
{
  "success": true,
  "data": { /* response data */ },
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "details": { /* optional error details */ }
}
```

### Pagination Response
```json
{
  "success": true,
  "data": {
    "items": [ /* array of items */ ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "totalItems": 50,
      "totalPages": 5,
      "hasMore": true
    }
  }
}
```

---

## 🔑 Authentication Endpoints

### 1. Register User

Create a new user account (shop owner).

**Endpoint:** `POST /api/auth/register`  
**Authentication:** Not required  
**Rate Limit:** 5 requests per minute

#### Request Body
```json
{
  "email": "john.doe@example.com",
  "password": "SecurePass123!",
  "name": "John Doe",
  "phone": "+1234567890"
}
```

#### Validation Rules
- **email:** Valid email format, unique, max 255 chars
- **password:** Min 8 chars, max 100 chars
- **name:** Min 2 chars, max 255 chars
- **phone:** Min 10 chars, max 20 chars

#### Success Response (201)
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "john.doe@example.com",
      "name": "John Doe",
      "phone": "+1234567890",
      "createdAt": "2025-10-06T10:30:00.000Z",
      "updatedAt": "2025-10-06T10:30:00.000Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "User registered successfully"
}
```

#### Error Responses
- **400 Bad Request:** Invalid input data
- **409 Conflict:** Email already registered
- **500 Internal Server Error:** Server error

---

### 2. Login User

Authenticate existing user and receive tokens.

**Endpoint:** `POST /api/auth/login`  
**Authentication:** Not required  
**Rate Limit:** 5 requests per minute

#### Request Body
```json
{
  "email": "john.doe@example.com",
  "password": "SecurePass123!"
}
```

#### Success Response (200)
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "john.doe@example.com",
      "name": "John Doe",
      "phone": "+1234567890",
      "createdAt": "2025-10-06T10:30:00.000Z",
      "updatedAt": "2025-10-06T10:30:00.000Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Login successful"
}
```

#### Cookies Set
```
accessToken=<jwt>; HttpOnly; Secure; SameSite=Strict; Max-Age=14400
refreshToken=<jwt>; HttpOnly; Secure; SameSite=Strict; Max-Age=1296000
```

#### Error Responses
- **400 Bad Request:** Invalid input
- **401 Unauthorized:** Invalid credentials
- **500 Internal Server Error:** Server error

---

### 3. Logout User

Clear authentication cookies and logout user.

**Endpoint:** `POST /api/auth/logout`  
**Authentication:** Required  

#### Success Response (200)
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

#### Cookies Cleared
```
accessToken=; Max-Age=0
refreshToken=; Max-Age=0
```

---

### 4. Get Current User

Get authenticated user's profile information.

**Endpoint:** `GET /api/auth/me`  
**Authentication:** Required  

#### Success Response (200)
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "john.doe@example.com",
    "name": "John Doe",
    "phone": "+1234567890",
    "createdAt": "2025-10-06T10:30:00.000Z",
    "updatedAt": "2025-10-06T10:30:00.000Z"
  }
}
```

#### Error Responses
- **401 Unauthorized:** Invalid or expired token
- **404 Not Found:** User not found

---

### 5. Update Profile

Update user profile information (name, phone).

**Endpoint:** `PATCH /api/auth/profile`  
**Authentication:** Required  

#### Request Body
```json
{
  "name": "John Smith",
  "phone": "+1987654321"
}
```

#### Success Response (200)
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "john.doe@example.com",
    "name": "John Smith",
    "phone": "+1987654321",
    "updatedAt": "2025-10-06T11:00:00.000Z"
  },
  "message": "Profile updated successfully"
}
```

---

### 6. Change Password

Change user password with current password verification.

**Endpoint:** `POST /api/auth/change-password`  
**Authentication:** Required  

#### Request Body
```json
{
  "currentPassword": "OldPass123!",
  "newPassword": "NewPass456!",
  "confirmPassword": "NewPass456!"
}
```

#### Validation Rules
- **currentPassword:** Must match current password
- **newPassword:** Min 8 chars, must differ from current
- **confirmPassword:** Must match newPassword

#### Success Response (200)
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

#### Error Responses
- **400 Bad Request:** Validation errors
- **401 Unauthorized:** Current password incorrect
- **500 Internal Server Error:** Server error

---

### 7. Refresh Access Token

Generate new access token using refresh token.

**Endpoint:** `POST /api/auth/refresh`  
**Authentication:** Requires valid refresh token in cookies  

#### Success Response (200)
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### Cookies Updated
```
accessToken=<new_jwt>; HttpOnly; Secure; Max-Age=14400
```

#### Error Responses
- **401 Unauthorized:** Invalid or expired refresh token

---

## 👥 Customer Endpoints

### 1. List Customers

Get paginated list of customers with search functionality.

**Endpoint:** `GET /api/customers`  
**Authentication:** Required  

#### Query Parameters
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Page number |
| `limit` | number | 10 | Items per page (max 100) |
| `search` | string | - | Search by name, email, or phone |

#### Example Request
```
GET /api/customers?page=1&limit=10&search=john
```

#### Success Response (200)
```json
{
  "success": true,
  "data": {
    "customers": [
      {
        "id": "c91e8400-e29b-41d4-a716-446655440001",
        "userId": "550e8400-e29b-41d4-a716-446655440000",
        "name": "John Customer",
        "email": "john.customer@example.com",
        "phone": "+1234567890",
        "address": "123 Main St, New York, NY 10001",
        "createdAt": "2025-10-02T10:15:00.000Z",
        "updatedAt": "2025-10-02T10:15:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "totalItems": 25,
      "totalPages": 3,
      "hasMore": true
    }
  }
}
```

---

### 2. Create Customer

Create a new customer record.

**Endpoint:** `POST /api/customers`  
**Authentication:** Required  

#### Request Body
```json
{
  "name": "Alice Johnson",
  "email": "alice@example.com",
  "phone": "+1987654321",
  "address": "456 Oak Ave, Los Angeles, CA 90001"
}
```

#### Validation Rules
- **name:** Required, min 2 chars, max 255 chars
- **email:** Optional, valid email format, max 255 chars
- **phone:** Required, min 10 chars, max 20 chars
- **address:** Required, min 5 chars

#### Success Response (201)
```json
{
  "success": true,
  "data": {
    "id": "c91e8400-e29b-41d4-a716-446655440002",
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Alice Johnson",
    "email": "alice@example.com",
    "phone": "+1987654321",
    "address": "456 Oak Ave, Los Angeles, CA 90001",
    "createdAt": "2025-10-06T12:00:00.000Z",
    "updatedAt": "2025-10-06T12:00:00.000Z"
  },
  "message": "Customer created successfully"
}
```

---

### 3. Get Customer by ID

Retrieve specific customer details.

**Endpoint:** `GET /api/customers/:id`  
**Authentication:** Required  

#### Example Request
```
GET /api/customers/c91e8400-e29b-41d4-a716-446655440001
```

#### Success Response (200)
```json
{
  "success": true,
  "data": {
    "id": "c91e8400-e29b-41d4-a716-446655440001",
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "name": "John Customer",
    "email": "john.customer@example.com",
    "phone": "+1234567890",
    "address": "123 Main St, New York, NY 10001",
    "createdAt": "2025-10-02T10:15:00.000Z",
    "updatedAt": "2025-10-02T10:15:00.000Z"
  }
}
```

#### Error Responses
- **404 Not Found:** Customer not found or not owned by user

---

### 4. Update Customer

Update customer information.

**Endpoint:** `PATCH /api/customers/:id`  
**Authentication:** Required  

#### Request Body (Partial Update)
```json
{
  "name": "John Updated",
  "phone": "+1555555555"
}
```

#### Success Response (200)
```json
{
  "success": true,
  "data": {
    "id": "c91e8400-e29b-41d4-a716-446655440001",
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "name": "John Updated",
    "email": "john.customer@example.com",
    "phone": "+1555555555",
    "address": "123 Main St, New York, NY 10001",
    "updatedAt": "2025-10-06T13:00:00.000Z"
  },
  "message": "Customer updated successfully"
}
```

---

### 5. Delete Customer

Delete customer record.

**Endpoint:** `DELETE /api/customers/:id`  
**Authentication:** Required  

#### Example Request
```
DELETE /api/customers/c91e8400-e29b-41d4-a716-446655440001
```

#### Success Response (200)
```json
{
  "success": true,
  "message": "Customer deleted successfully"
}
```

#### Error Responses
- **400 Bad Request:** Customer has associated shipments (foreign key constraint)
- **404 Not Found:** Customer not found

---

### 6. Search Customers

Search customers by name, email, or phone (used in dropdowns).

**Endpoint:** `GET /api/customers/search`  
**Authentication:** Required  

#### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `q` | string | Yes | Search query |

#### Example Request
```
GET /api/customers/search?q=john
```

#### Success Response (200)
```json
{
  "success": true,
  "data": [
    {
      "id": "c91e8400-e29b-41d4-a716-446655440001",
      "name": "John Customer",
      "email": "john.customer@example.com",
      "phone": "+1234567890"
    }
  ]
}
```

---

## 📦 Shipment Endpoints

### 1. List Shipments

Get filtered and paginated list of shipments.

**Endpoint:** `GET /api/shipments`  
**Authentication:** Required  

#### Query Parameters
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Page number |
| `limit` | number | 10 | Items per page |
| `type` | string | - | Filter by type (LOCAL/NATIONAL/INTERNATIONAL) |
| `mode` | string | - | Filter by mode (AIR/WATER/LAND) |
| `isDelivered` | boolean | - | Filter by delivery status |
| `customerId` | string | - | Filter by customer ID |

#### Example Request
```
GET /api/shipments?page=1&limit=10&type=NATIONAL&mode=AIR&isDelivered=false
```

#### Success Response (200)
```json
{
  "success": true,
  "data": {
    "shipments": [
      {
        "id": "s11e8400-e29b-41d4-a716-446655440002",
        "userId": "550e8400-e29b-41d4-a716-446655440000",
        "customerId": "c91e8400-e29b-41d4-a716-446655440001",
        "type": "NATIONAL",
        "mode": "AIR",
        "startLocation": "New York, NY",
        "endLocation": "Los Angeles, CA",
        "cost": "2500.00",
        "calculatedTotal": "2875.00",
        "isDelivered": false,
        "deliveryDate": "2025-10-15T00:00:00.000Z",
        "createdAt": "2025-10-03T14:20:00.000Z",
        "updatedAt": "2025-10-03T14:20:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "totalItems": 15,
      "totalPages": 2,
      "hasMore": true
    }
  }
}
```

---

### 2. Create Shipment

Create a new shipment record.

**Endpoint:** `POST /api/shipments`  
**Authentication:** Required  

#### Request Body
```json
{
  "customerId": "c91e8400-e29b-41d4-a716-446655440001",
  "type": "NATIONAL",
  "mode": "AIR",
  "startLocation": "New York, NY",
  "endLocation": "Los Angeles, CA",
  "cost": "2500.00",
  "calculatedTotal": "2875.00",
  "isDelivered": false,
  "deliveryDate": "2025-10-15"
}
```

#### Validation Rules
- **customerId:** Required, must be valid customer owned by user
- **type:** Required, enum (LOCAL, NATIONAL, INTERNATIONAL)
- **mode:** Required, enum (AIR, WATER, LAND)
- **startLocation:** Required, max 500 chars
- **endLocation:** Required, max 500 chars
- **cost:** Required, positive number, max 2 decimal places
- **calculatedTotal:** Required, positive number (cost + tax)
- **isDelivered:** Optional, boolean, default false
- **deliveryDate:** Optional, valid date (YYYY-MM-DD or ISO)

#### Success Response (201)
```json
{
  "success": true,
  "data": {
    "id": "s11e8400-e29b-41d4-a716-446655440003",
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "customerId": "c91e8400-e29b-41d4-a716-446655440001",
    "type": "NATIONAL",
    "mode": "AIR",
    "startLocation": "New York, NY",
    "endLocation": "Los Angeles, CA",
    "cost": "2500.00",
    "calculatedTotal": "2875.00",
    "isDelivered": false,
    "deliveryDate": "2025-10-15T00:00:00.000Z",
    "createdAt": "2025-10-06T14:00:00.000Z",
    "updatedAt": "2025-10-06T14:00:00.000Z"
  },
  "message": "Shipment created successfully"
}
```

---

### 3. Get Shipment by ID

Retrieve specific shipment details.

**Endpoint:** `GET /api/shipments/:id`  
**Authentication:** Required  

#### Example Request
```
GET /api/shipments/s11e8400-e29b-41d4-a716-446655440002
```

#### Success Response (200)
```json
{
  "success": true,
  "data": {
    "id": "s11e8400-e29b-41d4-a716-446655440002",
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "customerId": "c91e8400-e29b-41d4-a716-446655440001",
    "type": "NATIONAL",
    "mode": "AIR",
    "startLocation": "New York, NY",
    "endLocation": "Los Angeles, CA",
    "cost": "2500.00",
    "calculatedTotal": "2875.00",
    "isDelivered": false,
    "deliveryDate": "2025-10-15T00:00:00.000Z",
    "createdAt": "2025-10-03T14:20:00.000Z",
    "updatedAt": "2025-10-03T14:20:00.000Z"
  }
}
```

---

### 4. Update Shipment

Update shipment information.

**Endpoint:** `PATCH /api/shipments/:id`  
**Authentication:** Required  

#### Request Body (Partial Update)
```json
{
  "cost": "2800.00",
  "calculatedTotal": "3220.00",
  "deliveryDate": "2025-10-18"
}
```

#### Success Response (200)
```json
{
  "success": true,
  "data": {
    "id": "s11e8400-e29b-41d4-a716-446655440002",
    "cost": "2800.00",
    "calculatedTotal": "3220.00",
    "deliveryDate": "2025-10-18T00:00:00.000Z",
    "updatedAt": "2025-10-06T15:00:00.000Z"
  },
  "message": "Shipment updated successfully"
}
```

---

### 5. Delete Shipment

Delete shipment record.

**Endpoint:** `DELETE /api/shipments/:id`  
**Authentication:** Required  

#### Example Request
```
DELETE /api/shipments/s11e8400-e29b-41d4-a716-446655440002
```

#### Success Response (200)
```json
{
  "success": true,
  "message": "Shipment deleted successfully"
}
```

---

### 6. Mark Shipment as Delivered

Update shipment delivery status.

**Endpoint:** `POST /api/shipments/:id/deliver`  
**Authentication:** Required  

#### Request Body
```json
{
  "deliveryDate": "2025-10-06T16:30:00.000Z"
}
```

#### Success Response (200)
```json
{
  "success": true,
  "data": {
    "id": "s11e8400-e29b-41d4-a716-446655440002",
    "isDelivered": true,
    "deliveryDate": "2025-10-06T16:30:00.000Z",
    "updatedAt": "2025-10-06T16:30:00.000Z"
  },
  "message": "Shipment marked as delivered"
}
```

---

### 7. Get Shipment Statistics

Get comprehensive shipment statistics for dashboard.

**Endpoint:** `GET /api/shipments/stats`  
**Authentication:** Required  

#### Success Response (200)
```json
{
  "success": true,
  "data": {
    "totalShipments": 42,
    "pendingShipments": 15,
    "deliveredShipments": 27,
    "byType": {
      "LOCAL": 10,
      "NATIONAL": 20,
      "INTERNATIONAL": 12
    },
    "byMode": {
      "AIR": 18,
      "WATER": 12,
      "LAND": 12
    }
  }
}
```

---

## ⚠️ Error Codes

### HTTP Status Codes

| Code | Meaning | Description |
|------|---------|-------------|
| **200** | OK | Request successful |
| **201** | Created | Resource created successfully |
| **400** | Bad Request | Invalid input data or validation error |
| **401** | Unauthorized | Missing or invalid authentication token |
| **403** | Forbidden | User doesn't have permission |
| **404** | Not Found | Resource not found |
| **409** | Conflict | Resource already exists (e.g., duplicate email) |
| **422** | Unprocessable Entity | Validation failed |
| **500** | Internal Server Error | Server error |

### Error Response Examples

#### Validation Error (400)
```json
{
  "success": false,
  "error": "Validation failed",
  "details": {
    "email": "Invalid email format",
    "password": "Password must be at least 8 characters"
  }
}
```

#### Authentication Error (401)
```json
{
  "success": false,
  "error": "Unauthorized",
  "message": "Invalid or expired token"
}
```

#### Not Found Error (404)
```json
{
  "success": false,
  "error": "Customer not found"
}
```

#### Conflict Error (409)
```json
{
  "success": false,
  "error": "Email already registered",
  "message": "A user with this email already exists"
}
```

---

## 🔒 Security Considerations

### Authentication Security
- ✅ **JWT Tokens:** Secure, stateless authentication
- ✅ **httpOnly Cookies:** Prevent XSS attacks
- ✅ **Bcrypt Hashing:** Industry-standard password encryption (10 rounds)
- ✅ **Token Expiry:** Short-lived access tokens (4 hours)
- ✅ **Refresh Tokens:** Secure session extension mechanism

### Input Validation
- ✅ **Zod Schemas:** Type-safe validation on both client and server
- ✅ **SQL Injection Prevention:** Parameterized queries via Drizzle ORM
- ✅ **XSS Prevention:** Input sanitization and escaping
- ✅ **Enum Validation:** Strict type checking for enums

### Data Access Control
- ✅ **User Ownership:** Users can only access their own data
- ✅ **Foreign Key Constraints:** Database-level relationship enforcement
- ✅ **Cascade Deletes:** Proper cleanup of related records
- ✅ **Restrict Deletes:** Prevent deletion of referenced entities

---

## 🧪 Testing with Postman

### Import Collection
1. Download: [Shipsy-API.postman_collection.json](../Shipsy-API.postman_collection.json)
2. Import into Postman
3. Set environment variables

### Environment Variables
```
BASE_URL=http://localhost:3000
ACCESS_TOKEN=<your_access_token>
REFRESH_TOKEN=<your_refresh_token>
```

### Test Workflow
1. **Register** → Create test account
2. **Login** → Get authentication tokens
3. **Create Customer** → Add test customer
4. **Create Shipment** → Add test shipment
5. **Get Statistics** → View dashboard data
6. **Update/Delete** → Test CRUD operations

---

## 📊 Rate Limiting

| Endpoint | Limit | Window |
|----------|-------|--------|
| POST /api/auth/register | 5 requests | 1 minute |
| POST /api/auth/login | 5 requests | 1 minute |
| All other endpoints | 100 requests | 1 minute |

*Note: Rate limiting is enforced by Vercel in production*

---

## 🔄 Pagination

### Default Values
- **Default Page Size:** 10 items
- **Maximum Page Size:** 100 items
- **Default Page:** 1

### Pagination Metadata
```json
{
  "pagination": {
    "page": 1,           // Current page
    "limit": 10,         // Items per page
    "totalItems": 42,    // Total items in database
    "totalPages": 5,     // Total pages
    "hasMore": true      // More pages available
  }
}
```

---

## 📝 Changelog

### Version 1.0 (October 6, 2025)
- ✅ Complete authentication system
- ✅ Customer CRUD operations
- ✅ Shipment CRUD operations
- ✅ Statistics dashboard
- ✅ Pagination and filtering
- ✅ Search functionality

---

## 🔗 Related Documentation

- **[Database Schema](./DbSchema.md)** - Database structure and relationships
- **[Architecture Guide](./ARCHITECTURE.md)** - System architecture overview
- **[Postman Collection](../POSTMAN.md)** - API testing guide
- **[Technical Docs](./TechnicalDocumentation.md)** - Detailed technical specifications

---

**Last Updated:** October 6, 2025  
**API Version:** 1.0  
**Maintained By:** Shipsy Development Team
