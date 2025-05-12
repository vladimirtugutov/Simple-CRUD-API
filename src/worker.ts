import { createServer, IncomingMessage, ServerResponse } from 'http';
import { User, MessageFromWorker, MessageToWorker } from './db';
import { v4 as uuidv4 } from 'uuid';

const BASE = Number(process.env.PORT || 3000);
const WORKER_ID = Number(process.env.WORKER_ID || 1);
const PORT = BASE + WORKER_ID;

const parseBody = (req: IncomingMessage): Promise<any> => {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => (body += chunk));
    req.on('end', () => {
      try {
        resolve(JSON.parse(body));
      } catch {
        reject(new Error('Invalid JSON'));
      }
    });
  });
};

const server = createServer(async (req: IncomingMessage, res: ServerResponse) => {
  const url = req.url || '';
  const method = req.method || '';

  if (url === '/api/users' && method === 'GET') {
    console.log(`[WORKER ${WORKER_ID} | PID ${process.pid}] ${method} ${url}`);
    process.send?.({ type: 'GET_ALL_USERS' } satisfies MessageFromWorker);
    process.once('message', (msg: MessageToWorker) => {
      if (msg.type === 'ALL_USERS') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(msg.payload));
      } else {
        res.writeHead(500);
        res.end();
      }
    });

  } else if (url === '/api/users' && method === 'POST') {
    console.log(`[WORKER ${WORKER_ID} | PID ${process.pid}] ${method} ${url}`);
    try {
      const body = await parseBody(req);
      const { username, age, hobbies } = body;

      if (
        typeof username !== 'string' ||
        typeof age !== 'number' ||
        !Array.isArray(hobbies) ||
        !hobbies.every(h => typeof h === 'string')
      ) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ message: 'Invalid user data' }));
      }

      const newUser: User = {
        id: uuidv4(),
        username,
        age,
        hobbies,
      };

      process.send?.({ type: 'CREATE_USER', payload: newUser } satisfies MessageFromWorker);
      process.once('message', (msg: MessageToWorker) => {
        if (msg.type === 'USER_CREATED') {
          res.writeHead(201, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(msg.payload));
        } else {
          res.writeHead(500);
          res.end();
        }
      });

    } catch {
      res.writeHead(500);
      res.end(JSON.stringify({ message: 'Internal Server Error' }));
    }

  } else if (url.match(/^\/api\/users\/[\w-]+$/) && method === 'GET') {
    console.log(`[WORKER ${WORKER_ID} | PID ${process.pid}] ${method} ${url}`);
    const userId = url.split('/').pop()!;
    process.send?.({ type: 'GET_USER_BY_ID', payload: userId } satisfies MessageFromWorker);

    process.once('message', (msg: MessageToWorker) => {
      if (msg.type === 'USER_FOUND') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(msg.payload));
      } else if (msg.type === 'USER_NOT_FOUND') {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'User not found' }));
      } else {
        res.writeHead(500);
        res.end();
      }
    });

  } else if (url.match(/^\/api\/users\/[\w-]+$/) && method === 'PUT') {
    console.log(`[WORKER ${WORKER_ID} | PID ${process.pid}] ${method} ${url}`);
    const userId = url.split('/').pop()!;
    try {
      const body = await parseBody(req);
      const { username, age, hobbies } = body;

      if (
        typeof username !== 'string' ||
        typeof age !== 'number' ||
        !Array.isArray(hobbies) ||
        !hobbies.every(h => typeof h === 'string')
      ) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ message: 'Invalid user data' }));
      }

      const updatedUser: User = {
        id: userId,
        username,
        age,
        hobbies,
      };

      process.send?.({ type: 'UPDATE_USER', payload: updatedUser } satisfies MessageFromWorker);

      process.once('message', (msg: MessageToWorker) => {
        if (msg.type === 'USER_UPDATED') {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(msg.payload));
        } else if (msg.type === 'USER_NOT_FOUND') {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ message: 'User not found' }));
        } else {
          res.writeHead(500);
          res.end();
        }
      });

    } catch {
      res.writeHead(500);
      res.end(JSON.stringify({ message: 'Internal Server Error' }));
    }

  } else if (url.match(/^\/api\/users\/[\w-]+$/) && method === 'DELETE') {
    console.log(`[WORKER ${WORKER_ID} | PID ${process.pid}] ${method} ${url}`);
    const userId = url.split('/').pop()!;
    process.send?.({ type: 'DELETE_USER', payload: userId } satisfies MessageFromWorker);

    process.once('message', (msg: MessageToWorker) => {
      if (msg.type === 'USER_DELETED') {
        res.writeHead(204);
        res.end();
      } else if (msg.type === 'USER_NOT_FOUND') {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'User not found' }));
      } else {
        res.writeHead(500);
        res.end();
      }
    });

  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Route not found' }));
  }
});

server.listen(PORT, () => {
  console.log(`Worker ${process.pid} listening on port ${PORT}`);
});