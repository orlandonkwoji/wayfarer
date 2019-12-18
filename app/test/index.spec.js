import chai from 'chai';
import request from 'supertest';
import server from '..';

const { assert } = chai;

describe('HOME route', () => {
  it('should return a welcome message', async () => {
    const res = await request(server).get('/api/v1');
    assert.strictEqual(res.status, 200);
    assert.isObject(res.body);
    assert.strictEqual(res.body.message, 'Welcome to Wayfarer');
  });
});
