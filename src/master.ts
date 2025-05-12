import cluster from 'cluster';
import os from 'os';
import { createServer, request as httpRequest } from 'http';
import dotenv from 'dotenv';
import { users, MessageFromWorker, MessageToWorker } from './db';

dotenv.config();

const PORT = Number(process.env.PORT || 3000);
const numCPUs = os.availableParallelism ? os.availableParallelism() - 1 : os.cpus().length - 1;
let current = 0;

if (cluster.isPrimary) {
  for (let i = 1; i <= numCPUs; i++) {
    console.log(`→ Forking worker ${i}`);
    cluster.fork({ WORKER_ID: i.toString() });
  }

  const server = createServer((req, res) => {
    const workerPort = PORT + 1 + (current % numCPUs);
    current++;

    const proxy = httpRequest(
      {
        hostname: 'localhost',
        port: workerPort,
        path: req.url,
        method: req.method,
        headers: req.headers,
      },
      proxyRes => {
        res.writeHead(proxyRes.statusCode || 500, proxyRes.headers);
        proxyRes.pipe(res, { end: true });
      }
    );

    req.pipe(proxy, { end: true });

    proxy.on('error', err => {
      console.error('Proxy error:', err.message);
      res.writeHead(500);
      res.end('Load balancer error');
    });
  });

  server.listen(PORT, () => {
    console.log(`Load Balancer running at http://localhost:${PORT}`);
  });

  cluster.on('message', (worker, message: MessageFromWorker) => {
    switch (message.type) {
      case 'CREATE_USER': {
        users.push(message.payload);
        worker.send({ type: 'USER_CREATED', payload: message.payload } satisfies MessageToWorker);
        break;
      }

      case 'GET_ALL_USERS': {
        worker.send({ type: 'ALL_USERS', payload: users } satisfies MessageToWorker);
        break;
      }

      case 'GET_USER_BY_ID': {
        const user = users.find(u => u.id === message.payload);
        if (user) {
          worker.send({ type: 'USER_FOUND', payload: user });
        } else {
          worker.send({ type: 'USER_NOT_FOUND' });
        }
        break;
      }

      case 'UPDATE_USER': {
        const idx = users.findIndex(u => u.id === message.payload.id);
        if (idx !== -1) {
          users[idx] = message.payload;
          worker.send({ type: 'USER_UPDATED', payload: message.payload });
        } else {
          worker.send({ type: 'USER_NOT_FOUND' });
        }
        break;
      }

      case 'DELETE_USER': {
        const idx = users.findIndex(u => u.id === message.payload);
        if (idx !== -1) {
          users.splice(idx, 1);
          worker.send({ type: 'USER_DELETED' });
        } else {
          worker.send({ type: 'USER_NOT_FOUND' });
        }
        break;
      }
    }
  });

} else {
  import('./worker');
}