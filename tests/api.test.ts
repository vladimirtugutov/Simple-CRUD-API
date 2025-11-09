/// <reference types="vitest" />
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createServer } from 'http';
import { usersRouter } from '../src/routes/users';

let server: ReturnType<typeof createServer>;

beforeAll(() => {
  server = createServer((req, res) => usersRouter(req, res));
  server.listen(3001);
});

afterAll(() => {
  server.close();
});

let userId: string;

describe('CRUD API tests', () => {
  it('GET /api/users → should return empty array', async () => {
    const res = await request(server).get('/api/users');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('POST /api/users → should create a user', async () => {
    const res = await request(server)
      .post('/api/users')
      .send({
        username: 'John',
        age: 25,
        hobbies: ['reading'],
      })
      .set('Content-Type', 'application/json');

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    userId = res.body.id;
  });

  it('GET /api/users/:id → should return created user', async () => {
    const res = await request(server).get(`/api/users/${userId}`);
    expect(res.status).toBe(200);
    expect(res.body.username).toBe('John');
  });

  it('PUT /api/users/:id → should update user', async () => {
    const res = await request(server)
      .put(`/api/users/${userId}`)
      .send({
        username: 'Jane',
        age: 26,
        hobbies: ['coding'],
      })
      .set('Content-Type', 'application/json');

    expect(res.status).toBe(200);
    expect(res.body.username).toBe('Jane');
  });

  it('DELETE /api/users/:id → should delete user', async () => {
    const res = await request(server).delete(`/api/users/${userId}`);
    expect(res.status).toBe(204);
  });

  it('GET /api/users/:id → should return 404 after deletion', async () => {
    const res = await request(server).get(`/api/users/${userId}`);
    expect(res.status).toBe(404);
  });
});