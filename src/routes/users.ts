import { IncomingMessage, ServerResponse } from 'http';
import { userController } from '../controllers/userController';

export const usersRouter = async (req: IncomingMessage, res: ServerResponse) => {
    const url = req.url || '';
    const method = req.method || '';
  
    try {
      if (url === '/api/users' && method === 'GET') {
        return userController.getAll(req, res);
      }
  
      if (url === '/api/users' && method === 'POST') {
        return userController.create(req, res);
      }
  
      const userIdMatch = url.match(/^\/api\/users\/([\w-]+)$/);
  
      if (userIdMatch) {
        const userId = userIdMatch[1];
  
        switch (method) {
          case 'GET':
            return userController.getOne(req, res, userId);
          case 'PUT':
            return userController.update(req, res, userId);
          case 'DELETE':
            return userController.remove(req, res, userId);
        }
      }
  
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Route not found' }));
    } catch (_err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Internal Server Error' }));
    }
  };