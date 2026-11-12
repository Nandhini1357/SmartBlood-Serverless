/**
 * SmartBlood - Notification Service (Amazon SNS)
 * Handles emergency blood broadcast alerts via Amazon SNS with strict test-environment safeguards.
 */
import { PublishCommand } from '@aws-sdk/client-sns';
import { snsClient, EMERGENCY_TOPIC_ARN } from '../utils/snsClient.js';

// In-memory log of dispatched alerts for testing and auditing
const dispatchedAlerts = [];

export const getDispatchedAlerts = () => [...dispatchedAlerts];
export const clearDispatchedAlerts = () => {
  dispatchedAlerts.length = 0;
};

/**
 * Broadcast an emergency blood alert via Amazon SNS.
 * Guarantees that in test environments or without SNS credentials, no real alerts are sent.
 */
export const broadcastEmergencyAlert = async ({
  requestId,
  bloodType,
  unitsNeeded,
  hospitalName,
  city,
  urgencyLevel,
  contactPhone
}) => {
  const isTest =
    process.env.NODE_ENV === 'test' ||
    process.env.MOCK_SNS === 'true' ||
    !EMERGENCY_TOPIC_ARN ||
    process.env.VITEST === 'true' ||
    process.execArgv.includes('--test') ||
    process.argv.includes('--test') ||
    Boolean(process.env.NODE_TEST_CONTEXT);

  const alertPayload = {
    requestId,
    bloodType,
    unitsNeeded,
    hospitalName,
    city,
    urgencyLevel,
    contactPhone,
    dispatchedAt: new Date().toISOString()
  };

  // Safe mock path for testing - NEVER send real SMS during automated tests
  if (isTest) {
    const simulatedResponse = {
      simulated: true,
      messageId: `sim-sns-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      alert: alertPayload
    };
    dispatchedAlerts.push(simulatedResponse);
    return simulatedResponse;
  }

  const message = `🚨 [SMARTBLOOD CRITICAL ALERT]
Urgent need for ${unitsNeeded} unit(s) of ${bloodType} blood!
Hospital: ${hospitalName} (${city})
Urgency: ${urgencyLevel}
Contact: ${contactPhone}
Request ID: ${requestId}
Please respond via the SmartBlood app if you can donate.`;

  const subject = `CRITICAL: ${bloodType} Blood Needed at ${hospitalName}`;

  try {
    const command = new PublishCommand({
      TopicArn: EMERGENCY_TOPIC_ARN,
      Subject: subject,
      Message: message,
      MessageAttributes: {
        bloodType: {
          DataType: 'String',
          StringValue: bloodType
        },
        urgencyLevel: {
          DataType: 'String',
          StringValue: urgencyLevel
        }
      }
    });

    const response = await snsClient.send(command);
    const result = {
      success: true,
      messageId: response.MessageId,
      alert: alertPayload
    };
    dispatchedAlerts.push(result);
    return result;
  } catch (error) {
    console.error('Failed to publish SNS emergency alert:', {
      error: error.message,
      requestId,
      bloodType
    });
    throw error;
  }
};
