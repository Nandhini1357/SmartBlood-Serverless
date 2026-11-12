/**
 * SmartBlood - Notification Service (Amazon SNS)
 */
import { PublishCommand } from '@aws-sdk/client-sns';
import { snsClient, EMERGENCY_TOPIC_ARN } from '../utils/snsClient.js';

/**
 * Broadcast an emergency blood alert via Amazon SNS
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
  if (!EMERGENCY_TOPIC_ARN) {
    console.warn('SNS_EMERGENCY_TOPIC_ARN is not configured. Simulating notification broadcast.');
    return {
      simulated: true,
      messageId: `sim-${Date.now()}`,
      alert: { bloodType, hospitalName, unitsNeeded }
    };
  }

  const message = `🚨 [SMARTBLOOD CRITICAL ALERT]
Urgent need for ${unitsNeeded} unit(s) of ${bloodType} blood!
Hospital: ${hospitalName} (${city})
Urgency: ${urgencyLevel}
Contact: ${contactPhone}
Request ID: ${requestId}
Please respond via the SmartBlood app if you can donate.`;

  const subject = `CRITICAL: ${bloodType} Blood Needed at ${hospitalName}`;

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
  return {
    success: true,
    messageId: response.MessageId
  };
};
