import cluster from 'cluster';
import os from 'os';
import { createServer, request as httpRequest } from 'http';
import dotenv from 'dotenv';
import { products, MessageFromWorker, MessageToWorker } from './db';

dotenv.config();

const PORT = Number(process.env.PORT || 4000);
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
      case 'CREATE_PRODUCT': {
        products.push(message.payload);
        worker.send({ type: 'PRODUCT_CREATED', payload: message.payload } satisfies MessageToWorker);
        break;
      }
      case 'GET_ALL_PRODUCTS': {
        worker.send({ type: 'ALL_PRODUCTS', payload: products } satisfies MessageToWorker);
        break;
      }
      case 'GET_PRODUCT_BY_ID': {
        const product = products.find(p => p.id === message.payload);
        if (product) {
          worker.send({ type: 'PRODUCT_FOUND', payload: product });
        } else {
          worker.send({ type: 'PRODUCT_NOT_FOUND' });
        }
        break;
      }
      case 'UPDATE_PRODUCT': {
        const idx = products.findIndex(p => p.id === message.payload.id);
        if (idx !== -1) {
          products[idx] = message.payload;
          worker.send({ type: 'PRODUCT_UPDATED', payload: message.payload });
        } else {
          worker.send({ type: 'PRODUCT_NOT_FOUND' });
        }
        break;
      }
      case 'DELETE_PRODUCT': {
        const idx = products.findIndex(p => p.id === message.payload);
        if (idx !== -1) {
          products.splice(idx, 1);
          worker.send({ type: 'PRODUCT_DELETED' });
        } else {
          worker.send({ type: 'PRODUCT_NOT_FOUND' });
        }
        break;
      }
    }
  });

} else {
  import('./worker');
}
