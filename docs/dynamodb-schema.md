# SmartBlood – Amazon DynamoDB Single-Table Design

## Overview
SmartBlood employs an optimized Single-Table Design to minimize AWS cost, eliminate multi-table provisioning overhead, and ensure single-digit millisecond query response times.

**Table Name**: `SmartBlood-{Stage}`  
**Billing Mode**: `PAY_PER_REQUEST` (On-Demand Capacity)

---

## Keys Definition

| Key | Attribute Name | Type | Description |
| :--- | :--- | :--- | :--- |
| **Partition Key** | `PK` | String | Entity identification partition (`DONOR#<id>`, `REQUEST#<id>`, `BANK#<id>`) |
| **Sort Key** | `SK` | String | Sub-entity or state identifier (`PROFILE`, `DETAILS`, `INVENTORY#<type>`) |
| **GSI1 Partition Key** | `GSI1PK` | String | Index partition for queries by blood group or blood bank |
| **GSI1 Sort Key** | `GSI1SK` | String | Index sort key for status or inventory queries (`STATUS#AVAILABLE`, `STATUS#PENDING`) |

---

## Entity Mappings & Access Patterns

### 1. Donor Entity
- **PK**: `DONOR#<donorId>`
- **SK**: `PROFILE`
- **GSI1PK**: `BLOOD#<bloodType>` (e.g. `BLOOD#O-`)
- **GSI1SK**: `STATUS#<AVAILABLE | UNAVAILABLE>`
- **Attributes**: `donorId`, `name`, `email`, `phone`, `bloodType`, `city`, `location: { latitude, longitude }`, `isAvailable`, `createdAt`, `updatedAt`

### 2. Blood Request Entity
- **PK**: `REQUEST#<requestId>`
- **SK**: `DETAILS`
- **GSI1PK**: `BLOOD#<bloodType>`
- **GSI1SK**: `STATUS#<PENDING | FULFILLED>`
- **Attributes**: `requestId`, `requesterName`, `hospitalName`, `bloodType`, `unitsNeeded`, `urgencyLevel`, `city`, `location`, `contactPhone`, `status`, `createdAt`

### 3. Blood Bank Inventory Entity
- **PK**: `BANK#<bankId>`
- **SK**: `INVENTORY#<bloodType>` (e.g. `INVENTORY#A+`)
- **GSI1PK**: `BANK#<bankId>`
- **GSI1SK**: `INVENTORY`
- **Attributes**: `bankId`, `bankName`, `bloodType`, `unitsAvailable`, `location`, `lastRestockedAt`

---

## Query Patterns

| # | Access Pattern | Target | Key Condition Expression |
| :--- | :--- | :--- | :--- |
| 1 | Get donor profile by ID | Primary Key | `PK = DONOR#<donorId> AND SK = PROFILE` |
| 2 | Get available donors for blood type | `GSI1` | `GSI1PK = BLOOD#<type> AND begins_with(GSI1SK, 'STATUS#AVAILABLE')` |
| 3 | Get blood request by ID | Primary Key | `PK = REQUEST#<requestId> AND SK = DETAILS` |
| 4 | Get all inventory for a blood bank | Primary Key | `PK = BANK#<bankId> AND begins_with(SK, 'INVENTORY#')` |

