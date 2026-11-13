# SmartBlood – Hackathon Video Demo Script & Presentation Guide
**AWS Weekend Challenge – No Pipeline, No Problem**  
**Target Duration:** 3 to 4 Minutes  
**Format:** Screen Recording + Voiceover Walkthrough

---

## 1. Presentation Outline & Slide Deck Structure

- **Slide 1 (0:00 - 0:30): The Problem**
  - Acute trauma cases, maternal hemorrhages, and rare blood shortages require compatible blood in minutes.
  - Existing systems rely on fragmented phone trees, manual outreach, and stale inventory lists.
- **Slide 2 (0:30 - 1:00): The Solution & AWS Serverless Architecture**
  - SmartBlood: Serverless automated emergency matching network.
  - Zero idle cost, sub-second latency, infinite horizontal scale.
  - Tech stack: React + Vite, API Gateway, Lambda (Node 20 on ARM64), DynamoDB Single-Table, SNS, Cognito, CloudFront.
- **Live Demo (1:00 - 3:00): The End-to-End Walkthrough**
  - Step 1: Hospital ER broadcasts an emergency request for O- blood.
  - Step 2: Serverless engine computes compatible donors by Haversine proximity.
  - Step 3: SNS broadcast notification dispatch.
  - Step 4: Donor receives alert, accepts, and submits live arrival ETA.
  - Step 5: Hospital Dashboard tracks inbound donors and updates stock inventory.
- **Slide 3 (3:00 - 3:30): Security, Privacy & Medical Safety**
  - HIPAA-conscious PII masking (names redacted, private GPS hidden).
  - Explicit donor notification consent.
  - Clinical cross-matching verification requirement.
- **Slide 4 (3:30 - 4:00): Cost & AWS Free Tier Impact**
  - $0/month idle cost; operates within Free Tier for hackathon and pilot scale.

---

## 2. Step-by-Step Screen Recording Sequence

### Scene 1: Landing Page & Problem Framing (0:00 - 0:45)
- **Visual**: Open `http://localhost:3000` on the **Landing Page**.
- **Actions**:
  1. Scroll through the clean healthcare SaaS interface.
  2. Point out the live status indicator: *"AWS Serverless Architecture &bull; Sub-Second Emergency Match"*.
  3. Click on the **Interactive Blood Compatibility Matrix**: Click `O-` to show it can only receive `O-`, then click `AB+` to show it can receive all 8 types.
  4. Highlight the 4-step serverless lifecycle cards.
- **Voiceover**:
  > *"Welcome to SmartBlood. In emergency medicine, finding compatible blood is a race against the clock. Today, we're demonstrating a 100% serverless, zero-maintenance network built for the AWS Weekend Challenge that connects trauma clinics to nearby compatible donors in seconds."*

### Scene 2: Hospital ER Broadcasts a Critical Shortage (0:45 - 1:30)
- **Visual**: Click the red **"Emergency Broadcast"** button in the top navigation.
- **Actions**:
  1. The modal pops open with smooth backdrop blur.
  2. Select the quick preset: **"San Francisco General Trauma Center"**.
  3. Select **Blood Type: O-**, **Units Needed: 3**, **Urgency: Critical (< 2 Hours)**.
  4. Highlight the serverless note: *"Submitting triggers API Gateway & initiates SNS alert broadcast"*.
  5. Click **"Broadcast Emergency"**.
- **Voiceover**:
  > *"Imagine an ER trauma surgeon at San Francisco General facing a critical O-negative shortage. In one click, they broadcast the emergency. Behind the scenes, API Gateway triggers an AWS Lambda function that stores the request in DynamoDB and triggers our Amazon SNS emergency topic."*

### Scene 3: Intelligent Serverless Matching Engine (1:30 - 2:15)
- **Visual**: App automatically switches to the **Emergency Feed**.
- **Actions**:
  1. Point out the newly created emergency card with its pulsating red `CRITICAL` badge.
  2. Click **"Matched Donors"** to open the serverless matching drawer.
  3. Show the ranked list of matched donors: `Marcus V. (O-)` scoring 96% match, located ~3.8 km away.
  4. Note that donor privacy is strictly protected: personal emails and phone numbers are redacted.
- **Voiceover**:
  > *"Instantly, our AWS Lambda matching engine kicks in. It calculates spherical distances using the Haversine formula and evaluates the medical biological compatibility matrix. It discovers verified O-negative donors within driving radius, ranking them by proximity while shielding their private contact info."*

### Scene 4: Donor Response & ETA Submission (2:15 - 2:50)
- **Visual**: Click **"Respond as Donor"** on the emergency request.
- **Actions**:
  1. The **Donor Response Modal** appears.
  2. Set status to **"ACCEPTED - In transit now"**.
  3. Adjust the interactive ETA slider or click the **"20m"** quick preset button.
  4. Type transit notes: *"En route via 101-North"*.
  5. Click **"Submit ETA to ER"**.
- **Voiceover**:
  > *"When a nearby donor receives the SNS alert, they can respond directly from their mobile browser. They pledge their donation and submit an estimated arrival time of 20 minutes."*

### Scene 5: Hospital Telemetry & Blood Bank Reserves (2:50 - 3:30)
- **Visual**: Click the **"Hospital Portal"** navigation tab.
- **Actions**:
  1. Show the **Inbound Donors & Telemetry** section. The ER team sees `Marcus Vance: ACCEPTED &bull; ETA 20 mins`.
  2. Scroll up to the **Blood Unit Inventory Reserves** telemetry dashboard.
  3. Show the 8 blood types with stock indicators (`Critical Stock`, `Low Reserve`, `Optimal`).
  4. Click the `+` button on `O-` stock to simulate restocking a unit. Notice the instant status update.
- **Voiceover**:
  > *"Over at the Hospital Dashboard, trauma staff see live inbound telemetry showing exactly when donors will arrive. They also monitor their real-time blood bank inventory across all 8 blood types, tracked in a single DynamoDB table."*

### Scene 6: Architectural Recap & Conclusion (3:30 - 4:00)
- **Visual**: Switch to the **Donor Portal** to show the live availability toggle, then show the footer credits.
- **Actions**:
  1. Toggle availability from Active to Paused and back.
  2. Show the AWS architecture diagram in the documentation.
- **Voiceover**:
  > *"SmartBlood operates with zero idle servers, costs nothing when standby, and scales instantly when disasters strike. Built with Node.js on AWS Lambda Graviton2, DynamoDB, API Gateway, SNS, and React. Thank you."*
