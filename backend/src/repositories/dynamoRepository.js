/**
 * SmartBlood - DynamoDB Single-Table Repository Layer
 */
import {
  PutCommand,
  GetCommand,
  QueryCommand,
  UpdateCommand,
  DeleteCommand,
  ScanCommand
} from '@aws-sdk/lib-dynamodb';
import { docClient, TABLE_NAME } from '../utils/dynamoClient.js';

export const putItem = async (item) => {
  const command = new PutCommand({
    TableName: TABLE_NAME,
    Item: {
      ...item,
      updatedAt: new Date().toISOString()
    }
  });
  await docClient.send(command);
  return item;
};

export const getItem = async (pk, sk) => {
  const command = new GetCommand({
    TableName: TABLE_NAME,
    Key: {
      PK: pk,
      SK: sk
    }
  });
  const result = await docClient.send(command);
  return result.Item || null;
};

export const queryByPk = async (pk, skPrefix = null) => {
  let keyCondition = 'PK = :pk';
  const exprValues = { ':pk': pk };

  if (skPrefix) {
    keyCondition += ' AND begins_with(SK, :skPrefix)';
    exprValues[':skPrefix'] = skPrefix;
  }

  const command = new QueryCommand({
    TableName: TABLE_NAME,
    KeyConditionExpression: keyCondition,
    ExpressionAttributeValues: exprValues
  });

  const result = await docClient.send(command);
  return result.Items || [];
};

export const queryGsi1 = async (gsi1pk, gsi1skPrefix = null) => {
  let keyCondition = 'GSI1PK = :gsi1pk';
  const exprValues = { ':gsi1pk': gsi1pk };

  if (gsi1skPrefix) {
    keyCondition += ' AND begins_with(GSI1SK, :gsi1skPrefix)';
    exprValues[':gsi1skPrefix'] = gsi1skPrefix;
  }

  const command = new QueryCommand({
    TableName: TABLE_NAME,
    IndexName: 'GSI1',
    KeyConditionExpression: keyCondition,
    ExpressionAttributeValues: exprValues
  });

  const result = await docClient.send(command);
  return result.Items || [];
};

export const updateItem = async (pk, sk, updateExpression, expressionAttributeNames, expressionAttributeValues) => {
  const command = new UpdateCommand({
    TableName: TABLE_NAME,
    Key: { PK: pk, SK: sk },
    UpdateExpression: updateExpression,
    ExpressionAttributeNames: expressionAttributeNames,
    ExpressionAttributeValues: expressionAttributeValues,
    ReturnValues: 'ALL_NEW'
  });
  const result = await docClient.send(command);
  return result.Attributes;
};

export const deleteItem = async (pk, sk) => {
  const command = new DeleteCommand({
    TableName: TABLE_NAME,
    Key: { PK: pk, SK: sk }
  });
  return await docClient.send(command);
};

export const scanItems = async (filterExpression = null, exprValues = null) => {
  const command = new ScanCommand({
    TableName: TABLE_NAME,
    ...(filterExpression ? { FilterExpression: filterExpression } : {}),
    ...(exprValues ? { ExpressionAttributeValues: exprValues } : {})
  });
  const result = await docClient.send(command);
  return result.Items || [];
};
