# SmartBlood – AWS Architecture Cost Analysis & Free Tier Audit
**AWS Weekend Challenge – No Pipeline, No Problem**

---

## 1. Executive Summary & Cost Philosophy

SmartBlood is engineered with a **zero idle cost** architecture. When no emergencies are active, the compute, database, and notification layers consume **$0.00 in persistent infrastructure cost**.

However, in full compliance with cloud financial transparency, **we do not claim that SmartBlood is 100% free indefinitely**. While the application comfortably operates inside the **AWS Free Tier** for prototype, hackathon evaluation, and moderate municipal volumes, specific services (notably direct SMS delivery via Amazon SNS and high-volume REST calls via API Gateway) incur usage-based meter charges as emergency dispatch volume expands.

---

## 2. Service-by-Service Free Tier & Pricing Breakdown

| AWS Service | AWS Free Tier Allotment | Cost Outside Free Tier | SmartBlood Usage Strategy |
| :--- | :--- | :--- | :--- |
| **AWS Lambda** | **1,000,000 free requests/month**<br>3.2M seconds of compute (ARM64) | \$0.20 per 1M requests<br>\$0.0000133334 per GB-second | Deployed on Graviton2 (ARM64) at 256MB memory. Average execution time is ~45ms, easily fitting within free tier limits. |
| **Amazon DynamoDB** | **25 GB of storage free**<br>25 Provisioned WCU / RCU or 200M On-Demand requests/mo (during initial tier) | \$1.25 per million write units<br>\$0.25 per million read units | Single-Table Design with sparse GSI1 minimizes read and write capacity units per transaction. |
| **Amazon API Gateway** | **1,000,000 free REST API calls/month** (for the first 12 months) | \$3.50 per million API calls | Regional endpoint with built-in request caching and payload compression. |
| **Amazon Cognito** | **50,000 Monthly Active Users (MAUs)** free indefinitely | \$0.0055 per MAU for 50,001 to 100,000 users | User pool authentication strictly reserved for registered donors and hospital personnel. |
| **Amazon SNS** | **1,000,000 mobile push notifications free/month**<br>100 SMS messages/month free (US/selected regions) | **SMS costs vary by carrier/country**:<br>~\$0.0075 to \$0.0350 per SMS | **PRIMARY COST DRIVER**: SMS alerting costs grow with recipient volume. High-volume deployments utilize mobile push notifications and topic subscriptions to minimize direct SMS spend. |
| **Amazon S3** | **5 GB standard storage free**<br>20,000 GET / 2,000 PUT requests/month | \$0.023 per GB/month | Production build is ~235 KB, consuming < 1 MB of S3 storage. |
| **Amazon CloudFront** | **1 TB of data transfer out free/month**<br>10,000,000 HTTP/HTTPS requests free | \$0.085 per GB data transfer out | Edge caching handles 95%+ of static web asset requests, shielding S3 from origin retrieval fees. |

---

## 3. Projected Monthly Cost Scenarios

### Scenario A: Hackathon Demo & Prototyping (Current Scope)
- **Active Donors**: 500 test accounts
- **Emergency Requests**: 100 broadcasts / month
- **API Requests**: ~50,000 calls / month
- **SMS Dispatches**: 200 messages (or simulated in mock mode)
- **Projected Monthly AWS Bill**: **\$0.00 - \$2.50** (depending on SMS carrier destination)

### Scenario B: Regional Metro Deployment (e.g. San Francisco Bay Area)
- **Active Donors**: 25,000 registered donors
- **Emergency Requests**: 1,200 emergency broadcasts / month
- **API Requests**: 1,500,000 calls / month
- **SMS Dispatches**: 15,000 target SMS notifications / month
- **Projected Monthly AWS Bill**:
  - API Gateway: ~\$1.75 (0.5M calls above free tier)
  - Lambda Compute: \$0.00 (within free tier)
  - DynamoDB: \$0.85
  - Cognito: \$0.00 (under 50,000 MAUs)
  - CloudFront / S3: \$0.00 (under 1 TB)
  - Amazon SNS (SMS): ~\$112.50 (15,000 SMS @ \$0.0075)
  - **Estimated Total**: **~\$115.10 / month**

---

## 4. Architectural Cost-Control & Safeguard Measures

1. **Graviton2 (ARM64) Architecture**: Selected for Lambda functions in `template.yaml`, yielding 20% lower cost and up to 19% better performance compared to x86_64.
2. **DynamoDB Single Table Design**: Eliminates multi-table provisioning and partition fragmentation, keeping write operations localized to individual partitions.
3. **Smart Radius Thresholding**: The intelligent matching engine pre-filters donors using Haversine spherical math before dispatching SNS broadcasts, preventing unnecessary SMS expenditure to donors outside feasible driving range.
4. **CloudWatch Budget & Billing Alarms**: Recommended AWS Budget alarm set at \$10.00 threshold with automatic email notification to administrators.
5. **Local Mock Mode for Development**: Developers and QA run test suites locally using the built-in mock adapter with zero AWS cloud charges.
