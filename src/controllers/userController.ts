import { IncomingMessage, ServerResponse } from 'http';
import { createUser } from '../models/user';
import { parseBody } from '../utils/parseBody';

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

  getAll() {}, getOne() {}, update() {}, remove() {},
};