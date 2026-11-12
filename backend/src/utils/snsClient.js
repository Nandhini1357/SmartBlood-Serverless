/**
 * SmartBlood - Amazon SNS Client (AWS SDK v3)
 */
import { SNSClient } from '@aws-sdk/client-sns';

export const snsClient = new SNSClient({
  region: process.env.AWS_REGION || 'us-east-1'
});

export const EMERGENCY_TOPIC_ARN = process.env.SNS_EMERGENCY_TOPIC_ARN;

