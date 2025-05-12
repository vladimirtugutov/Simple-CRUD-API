import { IncomingMessage, ServerResponse } from 'http';
import { users, createUser } from '../models/user';
import { parseBody } from '../utils/parseBody';
import { validate as isUuid } from 'uuid';

export const userController = {
  async create(req: IncomingMessage, res: ServerResponse) {
    try {
      const body = await parseBody(req);
      const { username, age, hobbies } = body;

      if (
        typeof username !== 'string' ||
        typeof age !== 'number' ||
        !Array.isArray(hobbies) ||
        !hobbies.every((h: unknown) => typeof h === 'string')
      ) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Invalid user data' }));
        return;
      }

      const user = createUser(username, age, hobbies);
      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(user));
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Server error' }));
    }
  },

  async getAll(_req: IncomingMessage, res: ServerResponse) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(users));
  },

  async getOne(_req: IncomingMessage, res: ServerResponse, userId: string) {
    if (!isUuid(userId)) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Invalid user ID' }));
      return;
    }

    const user = users.find((u) => u.id === userId);

    if (!user) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'User not found' }));
      return;
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(user));
  },
  
  async update(req: IncomingMessage, res: ServerResponse, userId: string) {
    if (!isUuid(userId)) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Invalid user ID' }));
      return;
    }
  
    const index = users.findIndex((u) => u.id === userId);
    if (index === -1) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'User not found' }));
      return;
    }
  
    try {
      const body = await parseBody(req);
      const { username, age, hobbies } = body;
  
      if (
        typeof username !== 'string' ||
        typeof age !== 'number' ||
        !Array.isArray(hobbies) ||
        !hobbies.every((h) => typeof h === 'string')
      ) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Invalid user data' }));
        return;
      }
  
      users[index] = { id: userId, username, age, hobbies };
  
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(users[index]));
    } catch {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Server error' }));
    }
  },
  
  async remove(_req: IncomingMessage, res: ServerResponse, userId: string) {
    if (!isUuid(userId)) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Invalid user ID' }));
      return;
    }
  
    const index = users.findIndex((u) => u.id === userId);
    if (index === -1) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'User not found' }));
      return;
    }
  
    users.splice(index, 1);
  
    res.writeHead(204);
    res.end();
  },
};