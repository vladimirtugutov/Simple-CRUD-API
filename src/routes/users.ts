import { IncomingMessage, ServerResponse } from 'http';
import { userController } from '../controllers/userController';

export const usersRouter = async (req: IncomingMessage, res: ServerResponse) => {
  const url = req.url || '';
  const method = req.method || '';

  if (url === '/api/users' && method === 'GET') {
    return userController.getAll(req, res);
  }

  if (url === '/api/users' && method === 'POST') {
    return userController.create(req, res);
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ message: 'Route not found' }));
};