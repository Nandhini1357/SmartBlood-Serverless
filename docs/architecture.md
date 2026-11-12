# SmartBlood – Cloud Architecture Documentation
**AWS Weekend Challenge – No Pipeline, No Problem**

## 1. Executive Summary
SmartBlood is an intelligent, high-availability, fully serverless healthcare application that matches emergency hospital blood shortages with compatible, geographically proximate donors in real time.

By utilizing AWS Serverless primitives, the platform operates with **zero idle server cost**, scales automatically to handle traffic spikes during regional disasters, and guarantees sub-second emergency response times.

---

## 2. AWS Serverless Architecture Diagram

```mermaid
flowchart TD
    subgraph ClientLayer["Frontend & Client Layer"]
        UserBrowser["User / Hospital / Donor Browser"]
        S3Bucket["Amazon S3 (Static Web Hosting)"]
        CFDistribution["Amazon CloudFront (Global CDN + SSL)"]
        UserBrowser -->|"HTTPS"| CFDistribution
        CFDistribution -->|"Origin Fetch"| S3Bucket
    end

    subgraph SecurityLayer["Identity & Security"]
        CognitoUP["Amazon Cognito User Pool (Auth & Roles)"]
        CognitoAuthorizer["API Gateway Cognito JWT Authorizer"]
        UserBrowser -.->|"User Sign-in / Token"| CognitoUP
        CognitoUP -.->|"JWT Verification"| CognitoAuthorizer
    end

    subgraph APILayer["API Ingestion Layer"]
        APIGateway["Amazon API Gateway (REST API / CORS / Throttling)"]
        CognitoAuthorizer --> APIGateway
        UserBrowser -->|"REST API Calls with JWT"| APIGateway
    end

    subgraph ComputeLayer["Compute Layer (AWS Lambda)"]
        DonorFn["Register / Update Donor Lambda"]
        RequestFn["Create / List Blood Request Lambda"]
        MatchFn["Intelligent Matching Engine Lambda"]
        NotificationFn["Notification Dispatcher Lambda"]
        InventoryFn["Blood Bank Inventory Lambda"]

        APIGateway -->|"/donors"| DonorFn
        APIGateway -->|"/requests"| RequestFn
        APIGateway -->|"/requests/{id}/matches"| MatchFn
        APIGateway -->|"/notifications"| NotificationFn
        APIGateway -->|"/bloodbanks"| InventoryFn
    end

    subgraph DataLayer["Storage & Messaging Layer"]
        DynamoDB[("Amazon DynamoDB (Single Table Design)")]
        SNSTopic["Amazon SNS (Emergency Broadcast Topic)"]

        DonorFn -->|"Read / Write"| DynamoDB
        RequestFn -->|"Write Request"| DynamoDB
        RequestFn -->|"Publish Alert"| SNSTopic
        MatchFn -->|"Read Donors & Geo Query"| DynamoDB
        NotificationFn -->|"Publish"| SNSTopic
        InventoryFn -->|"Read / Write Inventory"| DynamoDB
    end

    subgraph NotificationSubscribers["Alert Distribution"]
        SMSAlerts["Direct SMS to Registered Donors"]
        EmailAlerts["Email to Blood Banks & Volunteers"]
        SNSTopic --> SMSAlerts
        SNSTopic --> EmailAlerts
    end
```

---

## 3. Component Deep Dive

| Component | AWS Service | Purpose & Justification |
| :--- | :--- | :--- |
| **Static Hosting & CDN** | Amazon S3 + Amazon CloudFront | Delivers Vite + React Single Page Application (SPA) globally with low latency, edge caching, and automated HTTPS certificate provisioning via ACM. |
| **Identity & Authentication** | Amazon Cognito | Secure user management, role-based access control (`DONOR`, `HOSPITAL_ADMIN`, `BLOOD_BANK_MANAGER`), token refresh, and phone verification. |
| **API Management** | Amazon API Gateway (REST) | Handles routing, CORS negotiation, request throttling, automated request validation, and Cognito JWT authorizer verification. |
| **Serverless Compute** | AWS Lambda (Node.js 20) | Modular, event-driven functions running on Graviton2 (ARM64) for optimal cost-performance and sub-100ms execution times. |
| **Primary Database** | Amazon DynamoDB | Fully managed NoSQL database using Single Table Design, sub-10ms latency, automatic pay-per-request scaling, and point-in-time recovery. |
| **Notification Engine** | Amazon SNS | Fan-out pub/sub emergency broadcasting service alerting donors and medical staff instantly via SMS and email. |

---

## 4. Intelligent Matching Engine Workflow

```mermaid
sequenceDiagram
    autonumber
    actor Hospital as Hospital ER Doctor
    participant Client as Frontend (React + Vite)
    participant APIGW as Amazon API Gateway
    participant Lambda as Match Donors Lambda
    participant DDB as Amazon DynamoDB
    participant SNS as Amazon SNS
    actor Donor as Compatible Nearby Donor

    Hospital->>Client: Submits Critical Request (e.g., Blood: O-, Units: 2)
    Client->>APIGW: POST /requests (payload + Cognito JWT)
    APIGW->>Lambda: Invoke CreateBloodRequestFunction
    Lambda->>DDB: PutItem (PK: REQUEST#<id>, SK: DETAILS)
    Lambda->>SNS: Publish urgent broadcast to EmergencyAlertsTopic
    SNS-->>Donor: SMS Alert ("Urgent: O- needed at Metro Hospital")
    Lambda-->>Client: 201 Created (requestId)

    Hospital->>Client: Clicks "Find Donors"
    Client->>APIGW: GET /requests/{requestId}/matches?radius=50
    APIGW->>Lambda: Invoke MatchDonorsFunction
    Lambda->>DDB: Query compatible blood types (O-) with GSI1
    Lambda->>Lambda: Calculate Haversine distance & Rank compatibility
    Lambda-->>Client: 200 OK (Ranked matching donors sorted by proximity)
```

---

## 5. Security & Compliance
- **Zero Exposed Secrets**: All AWS credentials remain in IAM roles attached to Lambdas; frontend communicates solely through Cognito tokens and API Gateway endpoints.
- **Least Privilege IAM**: Every Lambda function has isolated IAM permissions generated by SAM policies (`DynamoDBCrudPolicy`, `SNSPublishMessagePolicy`).
- **Data Protection at Rest & Transit**:
  - DynamoDB uses AWS KMS Server-Side Encryption (SSE).
  - All communication happens over TLS 1.3.
- **Rate Limiting & DDoS Prevention**: API Gateway built-in throttling prevents denial-of-service abuse.

