import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  putItem,
  getItem,
  updateItem,
  scanItems,
  clearStore
} from '../src/repositories/dynamoRepository.js';

describe('DynamoDB Repository & Parameter Handling', () => {
  beforeEach(() => {
    clearStore();
  });

  it('should store and retrieve an item', async () => {
    const item = { PK: 'TEST#1', SK: 'METADATA', name: 'SmartBlood Test' };
    await putItem(item);

    const retrieved = await getItem('TEST#1', 'METADATA');
    assert.ok(retrieved);
    assert.equal(retrieved.name, 'SmartBlood Test');
  });

  it('should safely update item without error when expressionAttributeNames is null or empty', async () => {
    const item = { PK: 'DONOR#100', SK: 'PROFILE', isAvailable: false, GSI1SK: 'STATUS#UNAVAILABLE' };
    await putItem(item);

    // Update with null ExpressionAttributeNames
    const updated1 = await updateItem(
      'DONOR#100',
      'PROFILE',
      'SET isAvailable = :avail, GSI1SK = :gsi1sk',
      null,
      { ':avail': true, ':gsi1sk': 'STATUS#AVAILABLE' }
    );
    assert.equal(updated1.isAvailable, true);

    // Update with empty ExpressionAttributeNames object
    const updated2 = await updateItem(
      'DONOR#100',
      'PROFILE',
      'SET isAvailable = :avail, GSI1SK = :gsi1sk',
      {},
      { ':avail': false, ':gsi1sk': 'STATUS#UNAVAILABLE' }
    );
    assert.equal(updated2.isAvailable, false);
  });

  it('should filter items using scanItems with ExpressionAttributeNames and ExpressionAttributeValues', async () => {
    await putItem({ PK: 'REQ#1', SK: 'DETAILS', entityType: 'BLOOD_REQUEST', status: 'PENDING' });
    await putItem({ PK: 'REQ#2', SK: 'DETAILS', entityType: 'BLOOD_REQUEST', status: 'FULFILLED' });
    await putItem({ PK: 'DONOR#1', SK: 'PROFILE', entityType: 'DONOR', status: 'AVAILABLE' });

    const pendingRequests = await scanItems(
      'entityType = :entityType AND #status = :status',
      {
        ':entityType': 'BLOOD_REQUEST',
        ':status': 'PENDING'
      },
      {
        '#status': 'status'
      }
    );

    assert.equal(pendingRequests.length, 1);
    assert.equal(pendingRequests[0].PK, 'REQ#1');
  });
});

