# SmartBlood – API Specifications
**REST API Contracts for Amazon API Gateway**

All endpoints are hosted at `https://{api-id}.execute-api.{region}.amazonaws.com/{stage}/`.

---

## 1. Donors API

### `POST /donors`
Register a new blood donor into the network.
- **Auth**: Optional / Cognito User Token
- **Request Body**:
```json
{
  "name": "Jane Foster",
  "email": "jane@example.com",
  "phone": "+1 (555) 321-9988",
  "bloodType": "O-",
  "city": "San Francisco, CA",
  "latitude": 37.7749,
  "longitude": -122.4194,
  "isAvailable": true
}
```
- **Response (201 Created)**:
```json
{
  "success": true,
  "message": "Donor registered successfully",
  "data": {
    "donorId": "8f8b5a12-...",
    "name": "Jane Foster",
    "bloodType": "O-",
    "isAvailable": true,
    "createdAt": "2026-11-12T12:00:00.000Z"
  }
}
```

### `GET /donors/{donorId}`
Retrieve donor profile.
- **Auth**: Cognito JWT
- **Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "donorId": "8f8b5a12-...",
    "name": "Jane Foster",
    "bloodType": "O-",
    "city": "San Francisco, CA",
    "isAvailable": true
  }
}
```

### `PUT /donors/{donorId}/availability`
Toggle active availability for urgent donation requests.
- **Request Body**:
```json
{
  "isAvailable": false
}
```

---

## 2. Emergency Blood Requests API

### `POST /requests`
Broadcast a critical blood request.
- **Request Body**:
```json
{
  "requesterName": "Dr. Sarah Adams",
  "hospitalName": "Metro General Hospital",
  "bloodType": "O-",
  "unitsNeeded": 2,
  "urgencyLevel": "CRITICAL",
  "city": "San Francisco, CA",
  "latitude": 37.7833,
  "longitude": -122.4167,
  "contactPhone": "+1 (555) 234-5678"
}
```
- **Response (201 Created)**:
```json
{
  "success": true,
  "message": "Emergency blood request published successfully",
  "data": {
    "requestId": "req-987123",
    "status": "PENDING",
    "urgencyLevel": "CRITICAL",
    "createdAt": "2026-11-12T12:05:00.000Z"
  }
}
```

### `GET /requests`
Query active requests.
- **Query Params**:
  - `status` (optional): `PENDING` | `FULFILLED` | `CANCELLED`

### `GET /requests/{requestId}`
Retrieve request details alongside any recorded donor responses.
- **Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "requestId": "req-987123",
    "hospitalName": "Metro General Hospital",
    "bloodType": "O-",
    "status": "PENDING",
    "responses": []
  }
}
```

### `POST /requests/{requestId}/respond`
Record a donor's response (Accept/Decline/Pledge) to an emergency blood request.
- **Request Body**:
```json
{
  "donorId": "8f8b5a12-...",
  "status": "ACCEPTED",
  "etaMinutes": 25,
  "notes": "En route via US-101 South"
}
```
- **Response (201 Created)**:
```json
{
  "success": true,
  "message": "Donor response recorded successfully",
  "data": {
    "requestId": "req-987123",
    "donorId": "8f8b5a12-...",
    "status": "ACCEPTED",
    "etaMinutes": 25,
    "createdAt": "2026-11-12T12:15:00.000Z"
  }
}
```

### `GET /requests/{requestId}/matches`
Execute intelligent matching engine to find compatible donors nearby.
- **Query Params**:
  - `radius` (optional, default 50): search radius in kilometers.
- **Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "requestId": "req-987123",
    "requestedBloodType": "O-",
    "hospitalName": "Metro General Hospital",
    "totalCompatibleDonorsFound": 2,
    "searchRadiusKm": 50,
    "matches": [
      {
        "donorId": "8f8b5a12-...",
        "name": "Jane Foster",
        "bloodType": "O-",
        "phone": "+1 (555) 321-9988",
        "distanceKm": 3.82,
        "isExactMatch": true,
        "matchScore": 96.18,
        "isAvailable": true
      }
    ]
  }
}
```

---

## 3. Blood Bank Inventory API

### `GET /bloodbanks/{bankId}/inventory`
Fetch all available blood stock units for a specific blood bank.

### `PUT /bloodbanks/{bankId}/inventory`
Update blood unit inventory counts.
- **Request Body**:
```json
{
  "bloodType": "A+",
  "unitsAvailable": 22
}
```

