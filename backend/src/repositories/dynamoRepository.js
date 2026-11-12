/**
 * SmartBlood - DynamoDB Single-Table Repository Layer
 * Supports AWS SDK v3 DynamoDB DocumentClient with seamless in-memory test adapter.
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

// In-memory test store used when testing or explicitly configured
const inMemoryStore = new Map();

const isTestEnv = () =>
  process.env.NODE_ENV === 'test' ||
  process.env.USE_IN_MEMORY_DB === 'true' ||
  process.env.VITEST === 'true' ||
  process.execArgv.includes('--test') ||
  process.argv.includes('--test') ||
  Boolean(process.env.NODE_TEST_CONTEXT);

export const clearStore = () => {
  inMemoryStore.clear();
};

export const seedStore = (items = []) => {
  for (const item of items) {
    const key = `${item.PK}#${item.SK}`;
    inMemoryStore.set(key, { ...item, updatedAt: new Date().toISOString() });
  }
};

export const getStoreItems = () => Array.from(inMemoryStore.values());

export const putItem = async (item) => {
  const itemWithTimestamp = {
    ...item,
    updatedAt: new Date().toISOString()
  };

  if (isTestEnv()) {
    const key = `${item.PK}#${item.SK}`;
    inMemoryStore.set(key, { ...itemWithTimestamp });
    return itemWithTimestamp;
  }

  const command = new PutCommand({
    TableName: TABLE_NAME,
    Item: itemWithTimestamp
  });
  await docClient.send(command);
  return itemWithTimestamp;
};

export const getItem = async (pk, sk) => {
  if (isTestEnv()) {
    const key = `${pk}#${sk}`;
    const found = inMemoryStore.get(key);
    return found ? { ...found } : null;
  }

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
  if (isTestEnv()) {
    const results = [];
    for (const item of inMemoryStore.values()) {
      if (item.PK === pk) {
        if (!skPrefix || (item.SK && item.SK.startsWith(skPrefix))) {
          results.push({ ...item });
        }
      }
    }
    return results;
  }

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
  if (isTestEnv()) {
    const results = [];
    for (const item of inMemoryStore.values()) {
      if (item.GSI1PK === gsi1pk) {
        if (!gsi1skPrefix || (item.GSI1SK && item.GSI1SK.startsWith(gsi1skPrefix))) {
          results.push({ ...item });
        }
      }
    }
    return results;
  }

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
  if (isTestEnv()) {
    const key = `${pk}#${sk}`;
    const existing = inMemoryStore.get(key);
    if (!existing) {
      const err = new Error(`Item not found for update: PK=${pk}, SK=${sk}`);
      err.name = 'NotFoundError';
      throw err;
    }

    const updated = { ...existing };
    for (const [placeholder, val] of Object.entries(expressionAttributeValues || {})) {
      if (placeholder === ':avail') updated.isAvailable = val;
      if (placeholder === ':gsi1sk') updated.GSI1SK = val;
      if (placeholder === ':fulfilled') updated.status = val;
      if (placeholder === ':donorId') updated.fulfilledBy = val;
      if (placeholder === ':fulfilledAt') updated.fulfilledAt = val;
      if (placeholder === ':updatedAt') updated.updatedAt = val;
      if (placeholder === ':inc') updated.responsesCount = (updated.responsesCount || 0) + val;
    }
    updated.updatedAt = new Date().toISOString();
    inMemoryStore.set(key, updated);
    return updated;
  }

  const command = new UpdateCommand({
    TableName: TABLE_NAME,
    Key: { PK: pk, SK: sk },
    UpdateExpression: updateExpression,
    ...(expressionAttributeNames ? { ExpressionAttributeNames: expressionAttributeNames } : {}),
    ...(expressionAttributeValues ? { ExpressionAttributeValues: expressionAttributeValues } : {}),
    ReturnValues: 'ALL_NEW'
  });
  const result = await docClient.send(command);
  return result.Attributes;
};

export const deleteItem = async (pk, sk) => {
  if (isTestEnv()) {
    const key = `${pk}#${sk}`;
    const deleted = inMemoryStore.delete(key);
    return { success: deleted };
  }

  const command = new DeleteCommand({
    TableName: TABLE_NAME,
    Key: { PK: pk, SK: sk }
  });
  return await docClient.send(command);
};

export const scanItems = async (filterExpression = null, exprValues = null) => {
  if (isTestEnv()) {
    const all = Array.from(inMemoryStore.values());
    if (!exprValues) return all;

    return all.filter((item) => {
      let match = true;
      if (exprValues[':entityType'] && item.entityType !== exprValues[':entityType']) {
        match = false;
      }
      if (exprValues[':status'] && item.status !== exprValues[':status']) {
        match = false;
      }
      return match;
    });
  }

  const command = new ScanCommand({
    TableName: TABLE_NAME,
    ...(filterExpression ? { FilterExpression: filterExpression } : {}),
    ...(exprValues ? { ExpressionAttributeValues: exprValues } : {})
  });
  const result = await docClient.send(command);
  return result.Items || [];
};
